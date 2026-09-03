import { AppError } from "../../middleware/error.middleware";
import { createSupabaseUserClient } from "../../config/supabase";
import { AIAgent } from "../types/ai.types";
import { agentRegistry } from "../agents/agent.registry";

export class AIAgentService {
  constructor(
    private readonly accessToken: string
  ) {}

  private get db() {
    return createSupabaseUserClient(
      this.accessToken
    );
  }

  async getAuthorizedAgent({
    agentId,
    profileId,
    orgId,
  }: {
    agentId: string;
    profileId: string;
    orgId?: string;
  }): Promise<AIAgent> {
    const agent = agentRegistry.get(agentId);

    if (agent.scope === "profile") {
      if (agent.id !== "personal-assistant") {
        throw new AppError(
          403,
          "You do not have access to this AI agent"
        );
      }

      if (orgId) {
        throw new AppError(
          400,
          "Organization context is not allowed for this AI agent"
        );
      }

      return agent;
    }

    if (agent.scope === "organization") {
      if (!orgId) {
        throw new AppError(
          400,
          "Organization context is required for this AI agent"
        );
      }

      const { data: membership, error } =
        await this.db
          .from("organization_members")
          .select("id")
          .eq("org_id", orgId)
          .eq("profile_id", profileId)
          .eq("status", "active")
          .is("deleted_at", null)
          .maybeSingle();

      if (error) {
        throw new AppError(
          500,
          `Failed to verify organization membership: ${error.message}`
        );
      }

      if (!membership) {
        throw new AppError(
          403,
          "You do not have access to this organization AI agent"
        );
      }

      return agent;
    }

    throw new AppError(
      400,
      `Unsupported AI agent scope: ${agent.scope}`
    );
  }
}