import jwt, {
  JwtPayload,
} from "jsonwebtoken";

import crypto from "crypto";

import { config } from "../../config/environment";

import type {
  RequestMeta,
} from "./auth.types";

import type { Profile } from "../../types/profile";

import type { AccessTokenPayload } from "../../types";

import { Roles } from "../../types/global";

import { AppError } from "../../middleware/error.middleware";

import {
  addRefreshTokenToDB,
  getRefreshDataByHashFromDB,
  replaceRefreshTokenInDB,
  revokeAllForProfileInDB,
  revokeRefreshTokenInDB,
  issueRefreshTokenToDB,
} from "./auth.repository";


export const createAccessToken = (
  profile: Profile,
  membership?: {
    id: string;
    org_id: string;
    role: Roles;
  } | null
): string => {
  return jwt.sign(
    {
      aud: "authenticated",
      iss: "supabase",
      sub: profile.id,
      role: "authenticated",
      email: profile.email,
      profile_id: profile.id,
      org_id: membership?.org_id ?? null,
      member_id: membership?.id ?? null,

      user_metadata: {
        role: membership?.role ?? null,
      },
    },
    config.SUPABASE.jwtSecret,
    {
      algorithm: "HS256",
      expiresIn: config.JWT.access.expire,
    }
  );
};

export function verifyAccessToken(
  token: string
): AccessTokenPayload {
  if (!token) {
    throw new AppError(
      401,
      "Missing access token"
    );
  }

  try {
    const decoded =
      jwt.verify(
        token,
        config.SUPABASE.jwtSecret,
        {
          algorithms: ["HS256"],
        }
      ) as AccessTokenPayload;

    const validAud =
      decoded.aud === "authenticated" ||
      (
        Array.isArray(decoded.aud) &&
        decoded.aud.includes("authenticated")
      );

    if (
      !validAud ||
      decoded.iss !== "supabase" ||
      typeof decoded.sub !== "string" ||
      decoded.role !== "authenticated" ||
      typeof decoded.email !== "string" ||
      (
        decoded.org_id !== null &&
        typeof decoded.org_id !== "string"
      ) ||
      (
        decoded.member_id !== null &&
        typeof decoded.member_id !== "string"
      ) ||
      !decoded.user_metadata
    ) {
      throw new AppError(
        401,
        "Malformed access token"
      );
    }

    return decoded;

  } catch (err) {
    if (
      err instanceof jwt.TokenExpiredError
    ) {
      throw new AppError(
        401,
        "Access token expired"
      );
    }

    if (
      err instanceof jwt.JsonWebTokenError
    ) {
      throw new AppError(
        401,
        "Invalid access token"
      );
    }

    throw err;
  }
}

export function decodeAccessToken(
  token: string
): JwtPayload | null {
  return jwt.decode(
    token
  ) as JwtPayload | null;
}

export const isExpired = (
  expires: string
): boolean => {
  return (
    new Date(expires).getTime() <
    Date.now()
  );
};

function generateRawToken(): string {
  return crypto
    .randomBytes(32)
    .toString("base64url");
}

export function hashToken(
  rawToken: string
): string {
  return crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");
}

export class RefreshTokenError
  extends Error
{
  constructor(message: string) {
    super(message);
    this.name = "Refresh Token Error";
  }
}

export class RefreshTokenReuseError
  extends RefreshTokenError
{
  constructor() {
    super(
      "Refresh token reuse detected — all sessions revoked"
    );

    this.name =
      "Refresh Token Reuse Error";
  }
}

export async function issueRefreshToken(
  profileId: string,
  orgId: string | null,
  meta: RequestMeta = {}
): Promise<string> {
  const rawToken =
    generateRawToken();

  const tokenHash =
    hashToken(rawToken);

  const expiresAt =
    new Date(
      Date.now() +
      Number(config.JWT.refresh.expire) *
      24 *
      60 *
      60 *
      1000
    ).toISOString();

  try {
    await issueRefreshTokenToDB(
      {
        profileId,
        orgId,
        tokenHash,
        expiresAt,
      },
      meta
    );
  } catch (error) {
    throw new RefreshTokenError(
      error instanceof Error
        ? error.message
        : "Failed to store refresh token"
    );
  }

  return rawToken;
}

export async function rotateRefreshToken(
  incomingRawToken: string,
  meta: RequestMeta = {}
): Promise<{
  profileId: string;
  newRawToken: string;
  orgId: string | null;
}> {
  const incomingHash =
    hashToken(incomingRawToken);

  let data;

  try {
    data =
      await getRefreshDataByHashFromDB(
        incomingHash
      );
  } catch (error) {
    throw new RefreshTokenError(
      error instanceof Error
        ? error.message
        : "Refresh token lookup failed"
    );
  }

  if (isExpired(data.expires_at)) {
    throw new RefreshTokenError(
      "Token is Expired"
    );
  }

  if (data.revoked_at) {
    const revokedAgoMs =
      Date.now() -
      new Date(
        data.revoked_at
      ).getTime();

    const graceMs =
      Number(
        config.JWT.refresh.reuse
      ) * 1000;

    if (
      revokedAgoMs <= graceMs &&
      data.replaced_by_id
    ) {
      throw new RefreshTokenError(
        "Refresh already in progress on another request — retry shortly"
      );
    }

    try {
      await revokeAllForProfileInDB(
        data.profile_id
      );
    } catch (error) {
      throw new RefreshTokenError(
        error instanceof Error
          ? error.message
          : "Failed to revoke sessions"
      );
    }

    throw new RefreshTokenReuseError();
  }

  const newRawToken =
    generateRawToken();

  const newHash =
    hashToken(newRawToken);

  const newExpiresAt =
    new Date(
      Date.now() +
      Number(config.JWT.refresh.expire) *
      24 *
      60 *
      60 *
      1000
    ).toISOString();

  let newRow;

  try {
    newRow =
      await addRefreshTokenToDB(
        {
          profile_id:
            data.profile_id,
          org_id:
            data.org_id,
          token_hash:
            newHash,
          expires_at:
            newExpiresAt,
        },
        meta
      );

    await replaceRefreshTokenInDB(
      data.id,
      newRow.id
    );
  } catch (error) {
    throw new RefreshTokenError(
      error instanceof Error
        ? error.message
        : "Failed to rotate refresh token"
    );
  }

  return {
    profileId:
      data.profile_id,

    orgId:
      data.org_id,

    newRawToken,
  };
}


/* =========================================================
   REFRESH TOKEN REVOCATION
   ========================================================= */

export async function revokeRefreshToken(
  rawToken: string
): Promise<void> {
  const tokenHash =
    hashToken(rawToken);

  try {
    await revokeRefreshTokenInDB(
      tokenHash
    );
  } catch (error) {
    throw new RefreshTokenError(
      error instanceof Error
        ? error.message
        : "Failed to revoke token"
    );
  }
}

export async function revokeAllForProfile(
  profileId: string
): Promise<void> {
  try {
    await revokeAllForProfileInDB(
      profileId
    );
  } catch (error) {
    throw new RefreshTokenError(
      error instanceof Error
        ? error.message
        : "Failed to revoke sessions"
    );
  }
}