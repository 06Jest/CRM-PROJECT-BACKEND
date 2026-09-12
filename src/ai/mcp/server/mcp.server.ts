import {
  createMcpHandler,
  McpServer,
} from "@modelcontextprotocol/server";
import { z } from "zod";
import { AIRequestContext } from "../../types/ai.types";
import { executeMcpTool } from "../adapters/mcp-tool.adapter";

export const createMcpServer = (context: AIRequestContext) => {
  const server = new McpServer({
    name: "unithread-crm",
    version: "0.1.0",
  });

  server.registerTool(
    "create_note",
    {
      title: "Create Note",
      description:
        "Create a note in the user's CRM. Requires confirmation before execution.",
      inputSchema: {
        target_type: z.enum([
          "lead",
          "contact",
          "deal",
          "customer",
          "personal",
        ]),
        target_id: z.string().nullable().optional(),
        title: z.string().trim().min(1).max(200),
        content: z.string().trim().min(1).max(10_000),
        visibility: z.enum(["private", "public"]),
      },
    },
    async (args) => {
      const result = await executeMcpTool(
        "create_note",
        args as Record<string, unknown>,
        context
      );

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result),
          },
        ],
      };
    }
  );

  return server;
};

export const createMcpHandlerForContext = (context: AIRequestContext) =>
  createMcpHandler(() => createMcpServer(context));