import crypto from "crypto";
import { supabaseAdmin } from "../config/supabase";
import { config } from "../config/environment";
import { RequestMeta } from "../types/auth";

const TABLE = "refresh_tokens";

export class RefreshTokenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RefreshTokenError";
  }
}

export class RefreshTokenReuseError extends RefreshTokenError {
  constructor() {
    super("Refresh token reuse detected — all sessions revoked");
    this.name = "RefreshTokenReuseError";
  }
}

function generateRawToken(): string {
  return crypto.randomBytes(32).toString("base64url");
}

function hashToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

interface StoredTokenRow {
  id: string;
  profile_id: string;
  token_hash: string;
  expires_at: string;
  revoked_at: string | null;
  replaced_by_id: string | null;
}

export async function issueRefreshToken(
  profileId: string,
  meta: RequestMeta = {}
): Promise<string> {
  const rawToken = generateRawToken();
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(
    Date.now() + Number(config.JWT.refresh.expire) * 24 * 60 * 60 * 1000
  ).toISOString();

  const { error } = await supabaseAdmin.from(TABLE).insert({
    profile_id: profileId,
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

export async function rotateRefreshToken(
  incomingRawToken: string,
  meta: RequestMeta = {}
): Promise<{ profileId: string; rawRefreshToken: string }> {
  const incomingHash = hashToken(incomingRawToken);

  const { data: row, error } = await supabaseAdmin
    .from(TABLE)
    .select("id, profile_id, token_hash, expires_at, revoked_at, replaced_by_id")
    .eq("token_hash", incomingHash)
    .maybeSingle<StoredTokenRow>();

  if (error) {
    throw new RefreshTokenError(`Lookup failed: ${error.message}`);
  }
  if (!row) {
    throw new RefreshTokenError("Refresh token not recognized");
  }
  if (new Date(row.expires_at).getTime() < Date.now()) {
    throw new RefreshTokenError("Refresh token expired");
  }

  if (row.revoked_at) {
    const revokedAgoMs = Date.now() - new Date(row.revoked_at).getTime();
    const graceMs = Number(config.JWT.refresh.reuse) * 1000;

    if (revokedAgoMs <= graceMs && row.replaced_by_id) {

      throw new RefreshTokenError(
        "Refresh already in progress on another request — retry shortly"
      );
    }

    await revokeAllForProfile(row.profile_id);
    throw new RefreshTokenReuseError();
  }

  // Normal path: valid, unused token. Rotate it.
  const newRawToken = generateRawToken();
  const newHash = hashToken(newRawToken);
  const newExpiresAt = new Date(
    Date.now() + Number(config.JWT.refresh.expire) * 24 * 60 * 60 * 1000
  ).toISOString();

  const { data: newRow, error: insertError } = await supabaseAdmin
    .from('refresh_tokens')
    .insert({
      profile_id: row.profile_id,
      token_hash: newHash,
      expires_at: newExpiresAt,
      ip_address: meta.ipAddress ?? null,
      user_agent: meta.userAgent ?? null,
    })
    .select("id")
    .single();

  if (insertError || !newRow) {
    throw new RefreshTokenError(
      `Failed to issue rotated token: ${insertError?.message ?? "unknown error"}`
    );
  }

  const { error: revokeError } = await supabaseAdmin
    .from('refresh_tokens')
    .update({ revoked_at: new Date().toISOString(), replaced_by_id: newRow.id })
    .eq("id", row.id);

  if (revokeError) {
    throw new RefreshTokenError(`Failed to revoke old token: ${revokeError.message}`);
  }

  return { profileId: row.profile_id, rawRefreshToken: newRawToken };
}


export async function revokeRefreshToken(rawToken: string): Promise<void> {
  const tokenHash = hashToken(rawToken);
  const { error } = await supabaseAdmin
    .from('refresh_tokens')
    .update({ revoked_at: new Date().toISOString() })
    .eq("token_hash", tokenHash)
    .is("revoked_at", null);

  if (error) {
    throw new RefreshTokenError(`Failed to revoke token: ${error.message}`);
  }
}

export async function revokeAllForProfile(profileId: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from(TABLE)
    .update({ revoked_at: new Date().toISOString() })
    .eq("profile_id", profileId)
    .is("revoked_at", null);

  if (error) {
    throw new RefreshTokenError(`Failed to revoke sessions: ${error.message}`);
  }
}
