import { AppError } from "../../middleware/error.middleware";
import { supabaseAdmin } from "../../config/supabase";

export interface AIQuotaResult {
  allowed: boolean;
  promptsUsed: number;
  promptsRemaining: number;
  limit: number;
  windowExpiresAt: string;
}

export class AIQuotaService {
  private mapResult(data: any): AIQuotaResult {
    if (!data) {
      throw new AppError(
        500,
        "AI quota service returned no result"
      );
    }

    return {
      allowed: Boolean(data.allowed),
      promptsUsed: Number(data.prompts_used),
      promptsRemaining: Number(data.prompts_remaining),
      limit: Number(data.limit),
      windowExpiresAt: String(data.window_expires_at),
    };
  }

  async mergeGuestUsage(
  visitorId: string,
  profileId: string
): Promise<{
  merged: boolean;
  promptsUsed?: number;
  promptsRemaining?: number;
  windowExpiresAt?: string;
  reason?: string;
}> {
  const { data, error } = await supabaseAdmin.rpc(
    "merge_guest_ai_usage",
    {
      p_visitor_id: visitorId,
      p_profile_id: profileId,
    }
  );

  if (error) {
    throw new AppError(
      500,
      `Failed to merge guest AI usage: ${error.message}`
    );
  }

  if (!data) {
    throw new AppError(
      500,
      "Guest AI usage merge returned no result"
    );
  }

  return {
    merged: Boolean(data.merged),
    promptsUsed:
      data.prompts_used !== undefined
        ? Number(data.prompts_used)
        : undefined,
    promptsRemaining:
      data.prompts_remaining !== undefined
        ? Number(data.prompts_remaining)
        : undefined,
    windowExpiresAt:
      data.window_expires_at !== undefined
        ? String(data.window_expires_at)
        : undefined,
    reason:
      data.reason !== undefined
        ? String(data.reason)
        : undefined,
  };
}

  async consumeAuthenticatedPrompt(
    profileId: string
  ): Promise<AIQuotaResult> {
    const { data, error } = await supabaseAdmin.rpc(
      "consume_ai_quota",
      {
        p_profile_id: profileId,
        p_visitor_id: null,
      }
    );

    if (error) {
      throw new AppError(
        500,
        `Failed to consume authenticated AI quota: ${error.message}`
      );
    }

    return this.mapResult(data);
  }

  async consumeGuestPrompt(
    visitorId: string
  ): Promise<AIQuotaResult> {
    const { data, error } = await supabaseAdmin.rpc(
      "consume_ai_quota",
      {
        p_profile_id: null,
        p_visitor_id: visitorId,
      }
    );

    if (error) {
      throw new AppError(
        500,
        `Failed to consume guest AI quota: ${error.message}`
      );
    }

    return this.mapResult(data);
  }
}