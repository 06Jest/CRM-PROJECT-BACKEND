import { AIToolDefinition } from "./tool.registry";

export const searchContactsTool: AIToolDefinition = {
  name: "search_contacts",

  description: "Search CRM contacts by name.",

  parameters: {
    name: {
      type: "string",
      description: "The contact's name to search for.",
    },
  },

  async execute(arguments_, context) {
    console.log("EXECUTING search_contacts:", arguments_);

    return {
      contacts: [
        {
          id: "contact_123",
          name: "John Smith",
          email: "john@example.com",
        },
      ],
    };
  },
};