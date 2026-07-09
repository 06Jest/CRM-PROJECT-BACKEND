
import jwt, { JwtPayload } from "jsonwebtoken";
import { config } from "../config/environment";
import type { AccessTokenPayload } from "../types/auth";
import { uuidSchema } from "../schema/global.schema";
import { uuid } from "zod";


export function createAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, config.JWT.access.secret!, {
    expiresIn: Number(config.JWT.access.expire),
  });
}

export class InvalidAccessTokenError extends Error {
  constructor(message = "Invalid or expired access token") {
    super(message);
    this.name = "Invalid: Access Token Error";
  }
}


export function verifyAccessToken(token: string): AccessTokenPayload {
  try {
    const decoded = jwt.verify(token, config.JWT.access.secret!) as AccessTokenPayload;

    if (
      typeof decoded.sub !== "string" ||
      typeof decoded.role !== "string" ||
      (decoded.orgId !== undefined && typeof decoded.orgId !== "string")
    ) {
      throw new InvalidAccessTokenError("Malformed token payload");
    }

    return {
      sub: decoded.sub,
      role: decoded.role,
      orgId: decoded.orgId,
    };
  } catch {
    throw new InvalidAccessTokenError();
  }
}

export function decodeAccessToken(token: string): JwtPayload | null {
  return jwt.decode(token) as JwtPayload | null;
}