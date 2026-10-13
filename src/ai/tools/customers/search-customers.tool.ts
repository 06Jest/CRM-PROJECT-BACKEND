
import z from "zod";
import {
  getCustomersContactsListsService,
} from "../../../features/customers/customers.service";
import {
  AIToolDefinition,
  AIToolError,
} from "./../tool.registry";

const searchCustomersSchema = z.object({
  search_term: z.string().trim().min(1).max(100).optional(),
  limit: z.number().int().min(1).max(20).default(10),
});

export const searchCustomersTool: AIToolDefinition = {
  name: "search_customers",
  description:
    "Search non-deleted contacts with Customer status in the current organization by name, email, phone, company, position, or department. Includes archived contacts. Use actual results from this tool and never invent customer information.",

  parameters: {
    search_term: {
      type: "string",
      description:
        "Optional text to match against a customer's name, email, phone, company, position, or department.",
    },
    limit: {
      type: "number",
      description:
        "Maximum number of results to return, from 1 to 20. Defaults to 10.",
    },
  },

  async execute(arguments_, context) {
    const parsed = searchCustomersSchema.safeParse(arguments_);

    if (!parsed.success) {
      throw new AIToolError("Invalid arguments for search_customers.");
    }

    if (!context.orgId || !context.memberId || !context.accessToken) {
      throw new AIToolError(
        "Authenticated organization context is required to search customers."
      );
    }

    const { search_term, limit } = parsed.data;

    const contacts = await getCustomersContactsListsService(
      context.orgId,
      context.accessToken
    );

    const term = search_term?.toLowerCase();

    const matches = contacts.filter((contact) => {
      if (contact.deleted_at) return false;

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
      customers: results.map((contact) => ({
        contact_id: contact.id,
        display_id: contact.display_id,
        first_name: contact.first_name,
        last_name: contact.last_name,
        email: contact.email,
        phone: contact.phone,
        company_name: contact.company_name ?? null,
        position: contact.position ?? null,
        department: contact.department ?? null,
        contact_status: contact.status,
        assigned_to: contact.assigned_to ?? null,
        created_at: contact.created_at,
      })),
    };
  },
};
