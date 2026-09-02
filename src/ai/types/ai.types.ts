export type AIAgentScope =
  | "platform"
  | "profile"
  | "organization";

export type AIAgentType =
  | "built_in"
  | "profile"
  | "organization";

export interface AIRequest {
  agentId: string;
  message: string;
  conversationId?: string;
  history?: AIMessage[];
  context: AIRequestContext;
}

export interface AIRequestContext {
  profileId: string;
  orgId?: string;
  role: string;
}

export interface AIResponse {
  message: string;
  conversationId?: string;
}

export interface AIAgent {
  id: string;
  name: string;
  description: string;
  type: AIAgentType;
  scope: AIAgentScope;
  model: string;
  systemPrompt: string;
  tools: string[];
  capabilities: string[];
}

export interface AIModelRequest {
  models?: string[];
  systemPrompt: string;
  messages: AIMessage[];
  temperature?: number;
  maxTokens?: number;
}

export interface AIModelResponse {
  content: string;
  model: string;

  usage?: {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
  };
}

export interface AIMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
}