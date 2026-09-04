import {
  AITool,
  AIRequestContext,
} from "../types/ai.types";

export interface AIToolDefinition extends AITool {
  execute(
    arguments_: Record<string, unknown>,
    context: AIRequestContext
  ): Promise<unknown>;
}

export class AIToolRegistry {
  private tools = new Map<string, AIToolDefinition>();

  register(tool: AIToolDefinition): void {
    this.tools.set(tool.name, tool);
  }

  get(name: string): AIToolDefinition {
    const tool = this.tools.get(name);

    if (!tool) {
      throw new Error(`AI tool not found: ${name}`);
    }

    return tool;
  }

  getAll(): AIToolDefinition[] {
    return Array.from(this.tools.values());
  }

  has(name: string): boolean {
    return this.tools.has(name);
  }
}

export const toolRegistry = new AIToolRegistry();