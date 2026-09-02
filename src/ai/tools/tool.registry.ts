import { AITool } from "./ai-tool.interface";

class ToolRegistry {
  private tools: Map<string, AITool> = new Map();

  register(tool: AITool): void {
    this.tools.set(tool.id, tool);
  }

  get(toolId: string): AITool {
    const tool = this.tools.get(toolId);

    if (!tool) {
      throw new Error(`AI tool is not registered: ${toolId}`);
    }

    return tool;
  }

  has(toolId: string): boolean {
    return this.tools.has(toolId);
  }

  getAll(): AITool[] {
    return Array.from(this.tools.values());
  }
}

export const toolRegistry = new ToolRegistry();