
import z from "zod";
import { getContactsService } from "../../../features/contacts/contacts.service";
import {
  AIToolDefinition,
  AIToolError,
} from "./../tool.registry";

const searchContactsSchema = z.object({
  search_term: z.string().trim().min(1).max(100).optional(),
  status: z
    .enum(["Contacted", "Opportunity", "Customer", "Lost", "Churned"])
    .optional(),
  source: z.string().trim().min(1).max(50).optional(),
  priority: z.string().trim().min(1).max(50).optional(),
  limit: z.number().int().min(1).max(20).default(10),
});

export const searchContactsTool: AIToolDefinition = {
  name: "search_contacts",
  description:
    "Search active, non-deleted contacts in the current organization. Search by name, email, phone, company, position, or department. Optionally filter by status, source, and priority. Use actual results from this tool and never invent contact information.",

  parameters: {
    search_term: {
      type: "string",
      description:
        "Optional text to match against a contact's name, email, phone, company, position, or department.",
    },
    status: {
      type: "string",
      description:
        "Optional contact status: Contacted, Opportunity, Customer, Lost, or Churned.",
      enum: ["Contacted", "Opportunity", "Customer", "Lost", "Churned"],
    },
    source: {
      type: "string",
      description: "Optional exact contact source filter.",
    },
    priority: {
      type: "string",
      description: "Optional exact contact priority filter.",
    },
    limit: {
      type: "number",
      description:
        "Maximum number of results to return, from 1 to 20. Defaults to 10.",
    },
  },

  async execute(arguments_, context) {
    const parsed = searchContactsSchema.safeParse(arguments_);

    if (!parsed.success) {
      throw new AIToolError("Invalid arguments for search_contacts.");
    }

    if (!context.orgId || !context.memberId || !context.accessToken) {
      throw new AIToolError(
        "Authenticated organization context is required to search contacts."
      );
    }

    const { search_term, status, source, priority, limit } = parsed.data;

    const contacts = await getContactsService(
      context.orgId,
      context.accessToken
    );

    const term = search_term?.toLowerCase();

    const matches = contacts.filter((contact) => {
      // Exclude archived contacts from AI search.
      if (contact.deleted_at) return false;

      if (status && contact.status.toLowerCase() !== status.toLowerCase()) {
        return false;
      }

      if (source && String(contact.source).toLowerCase() !== source.toLowerCase()) {
        return false;
      }

      if (
        priority &&
        String(contact.priority).toLowerCase() !== priority.toLowerCase()
      ) {
        return false;
      }

      if (term) {
        const searchableText = [
          contact.first_name,
          contact.last_name,
          contact.suffix,
          contact.email,
          contact.phone,
          contact.company_name,
          contact.position,
          contact.department,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!searchableText.includes(term)) return false;
      }

      return true;
    });

    const results = matches.slice(0, limit);

    return {
      total_matches: matches.length,
      returned_count: results.length,
      has_more: matches.length > limit,
      contacts: results.map((contact) => ({
        id: contact.id,
        display_id: contact.display_id,
        first_name: contact.first_name,
        last_name: contact.last_name,
        suffix: contact.suffix ?? null,
        email: contact.email,
        phone: contact.phone,
        company_name: contact.company_name ?? null,
        position: contact.position ?? null,
        department: contact.department ?? null,
        status: contact.status,
        source: contact.source,
        priority: contact.priority,
        assigned_to: contact.assigned_to ?? null,
        created_at: contact.created_at,
      })),
    };
  },
};
