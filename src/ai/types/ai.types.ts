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

export interface AIModelMetadata {
  contextWindow: number;
  maxOutputTokens: number;
  supportsStreaming: boolean;
  supportsToolCalling: boolean;
  supportsStructuredOutput: boolean;
  isLocal: boolean;
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

export interface AIModelReference {
  id: string;
  provider: AIProvider;
}

export interface AIAgent {
  id: string;
  name: string;
  description: string;
  type: AIAgentType;
  scope: AIAgentScope;
  model: AIModelReference;
  systemPrompt: string;
  tools: string[];
  capabilities: string[];
}

export type AIProvider =
  | "gemini"
  | "groq"
  | "mistral"
  | "cloudflare"
  | "openrouter"
  | "local";


export interface AIModelRequest {
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