import jwt, { JwtPayload } from "jsonwebtoken";
import { config } from "../config/environment";
import type { AccessTokenPayload } from "../types/auth";
import crypto from "crypto";
import { supabaseAdmin } from "../config/supabase";
import { RequestMeta } from "../types/auth";
import { table } from '../config/tables';
import { Profile } from "../types/profile";
import { AppError } from "../middleware/error.middleware";



const tab = table.refresh;

interface StoredTokenRow {
  id: string;
  profile_id: string;
  org_id: string,
  replaced_by_id: string | null;
  token_hash: string;
  expires_at: string;
  revoked_at: string | null;
}

export const isExpired = (expires: string): boolean => {
  return new Date(expires).getTime() < Date.now();
} 

const addRefreshRow = async (
  data: StoredTokenRow,
  meta: RequestMeta
) => {

  const newRawToken = generateRawToken();
  const newHash = hashToken(newRawToken);
  const newExpiresAt = new Date(
    Date.now() + Number(config.JWT.refresh.expire) * 24 * 60 * 60 * 1000
  ).toISOString();

  const { data: newRow, error: insertError } = await supabaseAdmin
    .from(tab)
    .insert({
      profile_id: data.profile_id,
      org_id: data.org_id,
      token_hash: newHash,
      expires_at: newExpiresAt,
      ip_address: meta.ipAddress ?? null,
      user_agent: meta.userAgent ?? null,
      revoked_at: null
    })
    .select()
    .single();

  if (insertError || !newRow) {
    throw new RefreshTokenError(
      `Failed to issue rotated token: ${insertError?.message ?? "unknown error"}`
    );
  }
  return { newRow, newRawToken };
} 

const replacedRow = async (
  oldRowId: string,
  newRowId: string
) => {
   const {error} = await supabaseAdmin
    .from(tab)
    .update({ 
      revoked_at: new Date().toISOString(), 
      replaced_by_id: newRowId })
    .eq("id", oldRowId);

  if (error) {
    throw new RefreshTokenError(`Failed to update old refresh token: ${error.message}`);
  }
}


export const createAccessToken = (profile: Profile): string => {
  return jwt.sign(
    {
      aud: "authenticated",
      iss: "supabase",
      sub: profile.id,
      role: "authenticated",
      email: profile.email,
      org_id: profile.org_id,
      user_metadata: {
        role: profile.role,
      },
    },
    config.SUPABASE.jwtSecret,
    {
      algorithm: "HS256",
      expiresIn: config.JWT.access.expire,
    }
  );
};





export function verifyAccessToken(token: string): AccessTokenPayload {
  if (!token) {
    throw new AppError(401, "Missing access token");
  }

  try {
    const decoded = jwt.verify(
      token,
      config.SUPABASE.jwtSecret,
      {
        algorithms: ["HS256"],
      }
    ) as AccessTokenPayload;

  const validAud =
  decoded.aud === "authenticated" ||
  (Array.isArray(decoded.aud) &&
    decoded.aud.includes("authenticated"));

  if (
    !validAud ||
    decoded.iss !== "supabase" ||
    typeof decoded.sub !== "string" ||
    decoded.role !== "authenticated" ||
    typeof decoded.email !== "string" ||
    typeof decoded.org_id !== "string" ||
    !decoded.user_metadata ||
    (decoded.user_metadata.role !== "admin" &&
      decoded.user_metadata.role !== "agent")
  ) {
    throw new AppError(401, "Malformed access token");
  }

    return decoded;

  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new AppError(401, "Access token expired");
    }

    if (err instanceof jwt.JsonWebTokenError) {
      throw new AppError(401, "Invalid access token");
    }

    throw err;
  }
}

export function decodeAccessToken(token: string): JwtPayload | null {
  return jwt.decode(token) as JwtPayload | null;
}

export class RefreshTokenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "Refresh Token Error";
  }
}

export class RefreshTokenReuseError extends RefreshTokenError {
  constructor() {
    super("Refresh token reuse detected — all sessions revoked");
    this.name = "Refresh Token Reuse Error";
  }
}

function generateRawToken(): string {
  return crypto.randomBytes(32).toString("base64url");
}

export function hashToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}



export async function issueRefreshToken(
  profileId: string,
  orgId: string,
  meta: RequestMeta = {}
): Promise<string> {

  const rawToken = generateRawToken();

  const tokenHash = hashToken(rawToken);

  const expiresAt = new Date(
    Date.now() + Number(config.JWT.refresh.expire) * 24 * 60 * 60 * 1000
  ).toISOString();

  const { error } = await supabaseAdmin
    .from(tab)
    .insert({
      profile_id: profileId,
      org_id: orgId,
      token_hash: tokenHash,
      expires_at: expiresAt,
      ip_address: meta.ipAddress ?? null,
      user_agent: meta.userAgent ?? null,
  });

  if (error) {
    throw new RefreshTokenError(`Failed to store refresh token: ${error.message}`);
  }

  return rawToken;
}

export const updateAccessSession = async (
  refreshHash: string,
  userId: string,
  meta: RequestMeta
) => {
   await supabaseAdmin
    .from(tab)
    .update({
      ip_address: meta.ipAddress, 
      user_agent: meta.userAgent,
      last_seen_at: new Date().toISOString(),
      })
    .eq("token_hash", refreshHash)
    .eq("profile_id", userId)
} 

export const getRefreshDataByHash = async(
  refreshHash: string
) => {
  const { data, error } = await supabaseAdmin
    .from(tab)
    .select('*')
    .eq("token_hash", refreshHash)
    .single()


  if (!data) {
    throw new RefreshTokenError("Refresh token not recognized");
  }

  if (error) {
    throw new RefreshTokenError(`Lookup failed: ${error.message}`);
  }

  return data;
}

export async function rotateRefreshToken(
  incomingRawToken: string,
  meta: RequestMeta = {}
): Promise<{ profileId: string; newRawToken: string; orgId: string}> {

  const incomingHash = hashToken(incomingRawToken);

  const data = await getRefreshDataByHash(incomingHash)


  if (isExpired(data.expires_at) == true) {
    throw new RefreshTokenError("Token is Expired");
  }

  if (data.revoked_at) {
    const revokedAgoMs = Date.now() - new Date(data.revoked_at).getTime();

    const graceMs = Number(config.JWT.refresh.reuse) * 1000;

    if (revokedAgoMs <= graceMs && data.replaced_by_id) {

      throw new RefreshTokenError(
        "Refresh already in progress on another request — retry shortly"
      );
    }
    await revokeAllForProfile(data.profile_id);
    throw new RefreshTokenReuseError();
  }

  const { newRow, newRawToken} = await addRefreshRow(data, meta)

  await replacedRow(data.id, newRow.id);

  return { profileId: data.profile_id, orgId: data.org_id, newRawToken };
}


export async function revokeRefreshToken(rawToken: string): Promise<void> {
  const tokenHash = hashToken(rawToken);

  const { error } = await supabaseAdmin
    .from(tab)
    .update({ revoked_at: new Date().toISOString() })
    .eq("token_hash", tokenHash)
    .is("revoked_at", null)
    .select();


  if (error) {
    console.error(error);
    throw new RefreshTokenError(`Failed to revoke token: ${error.message}`);
  }
}

export async function revokeAllForProfile(profileId: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from(tab)
    .update({ revoked_at: new Date().toISOString() })
    .eq("profile_id", profileId)
    .is("revoked_at", null);

  if (error) {
    throw new RefreshTokenError(`Failed to revoke sessions: ${error.message}`);
  }
}
