import z from "zod";
import { getLeads } from "../../../features/leads/leads.service";
import {
  AIToolDefinition,
  AIToolError,
} from "./../tool.registry";

const searchLeadsSchema = z.object({
  search_term: z.string().trim().min(1).max(100).optional(),
  status: z.enum([
    "New",
    "Contacted",
    "Qualified",
    "Closed",
  ]).optional(),
  source: z.string().trim().min(1).max(50).optional(),
  priority: z.string().trim().min(1).max(50).optional(),
  limit: z.number().int().min(1).max(20).default(10),
});

export const searchLeadsTool: AIToolDefinition = {
  name: "search_leads",
  description:
    "Search active, non-deleted leads in the current organization. Search by name, email, company, or position. Optionally filter by status, source, and priority. Use actual results from this tool and never invent lead information.",
  parameters: {
    search_term: {
      type: "string",
      description:
        "Optional text to match against a lead's name, email, company, or position.",
    },
    status: {
      type: "string",
      description: "Optional lead status: New, Contacted, Qualified, or Closed.",
      enum: ["New", "Contacted", "Qualified", "Closed"],
    },
    source: {
      type: "string",
      description: "Optional exact lead source filter.",
    },
    priority: {
      type: "string",
      description: "Optional exact lead priority filter.",
    },
    limit: {
      type: "number",
      description: "Maximum number of results to return, from 1 to 20. Defaults to 10.",
    },
  },

  async execute(arguments_, context) {
    const parsed = searchLeadsSchema.safeParse(arguments_);

    if (!parsed.success) {
      throw new AIToolError("Invalid arguments for search_leads.");
    }

    if (
      !context.orgId ||
      !context.memberId ||
      !context.accessToken
    ) {
      throw new AIToolError(
        "Authenticated organization context is required to search leads."
      );
    }

    const { search_term, status, source, priority, limit } =
      parsed.data;

    const leads = await getLeads(
      context.orgId,
      context.memberId,
      context.accessToken
    );

    const term = search_term?.toLowerCase();

    const matches = leads.filter((lead) => {
      if (
        status &&
        lead.status.toLowerCase() !== status.toLowerCase()
      ) {
        return false;
      }

      if (
        source &&
        String(lead.source).toLowerCase() !== source.toLowerCase()
      ) {
        return false;
      }

      if (
        priority &&
        String(lead.priority).toLowerCase() !== priority.toLowerCase()
      ) {
        return false;
      }

      if (term) {
        const searchableText = [
          lead.first_name,
          lead.last_name,
          lead.suffix,
          lead.email,
          lead.company_name,
          lead.position,
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
      leads: results.map((lead) => ({
        id: lead.id,
        display_id: lead.display_id,
        first_name: lead.first_name,
        last_name: lead.last_name,
        suffix: lead.suffix ?? null,
        email: lead.email,
        phone: lead.phone,
        company_name: lead.company_name ?? null,
        position: lead.position ?? null,
        status: lead.status,
        source: lead.source,
        priority: lead.priority,
        assigned_to: lead.assigned_to ?? null,
        created_at: lead.created_at,
      })),
    };
  },
};
