import z from "zod";
import { getDealsService } from "../../../features/deals/deals.service";
import { AIToolDefinition, AIToolError } from "./../tool.registry";
import { DEAL_STAGES } from "../../../features/deals/deals.types";

const searchDealsSchema = z.object({
  search_term: z.string().trim().min(1).max(100).optional(),
  stage: z.enum(DEAL_STAGES).optional(),
  min_value: z.number().min(0).optional(),
  max_value: z.number().min(0).optional(),
  limit: z.number().int().min(1).max(20).default(10),
});

export const searchDealsTool: AIToolDefinition = {
  name: "search_deals",
  description:
    "Search deals in the current organization by title, notes, or associated contact name, email, and phone. Optionally filter by deal stage and minimum or maximum value. Includes archived deals but excludes soft-deleted deals. Use actual results from this tool and never invent deal information.",

  parameters: {
  search_term: {
    type: "string",
    description:
      "Optional text to match against a deal's title or notes.",
  },
  stage: {
    type: "string",
    description:
      "Optional exact deal stage filter.",
    enum: [...DEAL_STAGES],
  },
  min_value: {
    type: "number",
    description: "Optional minimum deal value.",
  },
  max_value: {
    type: "number",
    description: "Optional maximum deal value.",
  },
  limit: {
    type: "number",
    description:
      "Maximum number of results to return, from 1 to 20. Defaults to 10.",
  },
},

  async execute(arguments_, context) {
    const parsed = searchDealsSchema.safeParse(arguments_);

    if (!parsed.success) {
      throw new AIToolError("Invalid arguments for search_deals.");
    }

    if (!context.orgId || !context.memberId || !context.accessToken) {
      throw new AIToolError(
        "Authenticated organization context is required to search deals."
      );
    }

    const { search_term, stage, min_value, max_value, limit } =
      parsed.data;

    if (
      min_value !== undefined &&
      max_value !== undefined &&
      min_value > max_value
    ) {
      throw new AIToolError(
        "Minimum deal value cannot exceed maximum deal value."
      );
    }

    const deals = await getDealsService(
      context.orgId,
      context.accessToken
    );

    const term = search_term?.toLowerCase();

    const matches = deals.filter((deal) => {
      if (stage && deal.stage !== stage) {
        return false;
      }

      if (min_value !== undefined && deal.value < min_value) {
        return false;
      }

      if (max_value !== undefined && deal.value > max_value) {
        return false;
      }

      if (term) {
        const searchableText = [
          deal.title,
          deal.notes,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!searchableText.includes(term)) {
          return false;
        }
      }

      return true;
    });

    const results = matches.slice(0, limit);

    return {
      total_matches: matches.length,
      returned_count: results.length,
      has_more: matches.length > limit,
      deals: results.map((deal) => ({
        id: deal.id,
        display_id: deal.display_id,
        title: deal.title,
        notes: deal.notes ?? null,
        stage: deal.stage,
        value: deal.value,
        contact_id: deal.contact_id,
        assigned_to: deal.assigned_to ?? null,
        owner_id: deal.owner_id,
        created_at: deal.created_at,
        won_at: deal.won_at,
        lost_at: deal.lost_at,
      })),
    };
  },
};