import { AIAgent } from "../types/ai.types";
import { personalAssistantAgent } from "./personal-assistant.agent";
import { organizationAssistantAgent } from "./organization-assistant.agent";
import { crmAssistantAgent } from "./crm-assistant.agent";

class AgentRegistry {
  private agents: Map<string, AIAgent> = new Map();

  constructor() {
    this.register(personalAssistantAgent);
    this.register(organizationAssistantAgent);
    this.register(crmAssistantAgent);
  }

  register(agent: AIAgent): void {
    this.agents.set(agent.id, agent);
  }

  get(agentId: string): AIAgent {
    const agent = this.agents.get(agentId);

    if (!agent) {
      throw new Error(`AI agent is not registered: ${agentId}`);
    }

    return agent;
  }

  has(agentId: string): boolean {
    return this.agents.has(agentId);
  }

  getAll(): AIAgent[] {
    return Array.from(this.agents.values());
  }
}

export const agentRegistry = new AgentRegistry();