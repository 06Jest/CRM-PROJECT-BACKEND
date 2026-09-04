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

export interface AIToolParameter {
  type: string;
  description?: string;
  enum?: string[];
}

export interface AITool {
  name: string;
  description: string;
  parameters: Record<string, AIToolParameter>;
}

export interface AIRequestContext {
  profileId: string;
  orgId?: string;
  memberId?: string;
  role: string;
  accessToken?: string;
}

export interface AIResponse {
  message: string;
  conversationId?: string;
  confirmation?: {
    required: true;
    confirmationId: string;
    toolCall: AIToolCall;
  };
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
  tools?: AITool[];
  temperature?: number;
  maxTokens?: number;
}

export interface AIToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
  thoughtSignature?: string;
}

export interface AIModelResponse {
  content: string;
  model: string;
  toolCalls?: AIToolCall[];
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
  };
}

export interface AIMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  toolCalls?: AIToolCall[];
  toolCallId?: string;
  toolName?: string;
  thoughtSignature?: string;
}

export interface AIPendingConfirmation {
  confirmationId: string;
  profileId: string;
  orgId?: string;
  conversationId?: string;
  agentId: string;
  toolCall: AIToolCall;
  expiresAt: string;
}