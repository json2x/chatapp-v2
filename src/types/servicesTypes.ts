// Message interface for use in Conversation
export interface Message {
  id: string;
  conversation_id: string;
  role: string;
  content: string;
  created_at: string; // ISO date string
  tokens?: number | null;
  model?: string | null;
  metadata?: Record<string, any> | null;
}

// ConversationSummary - used for listing conversations
export interface ConversationSummary {
  id: string;
  title: string;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  user_id: string | null;
  model: string;
  system_prompt: string | null;
  first_user_message: string | null;
  first_assistant_message: string | null;
  message_count: number;
  metadata: Record<string, any> | null;
}

// Conversation - full conversation with messages
export interface Conversation {
  id: string;
  title: string;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  user_id: string | null;
  model: string;
  system_prompt: string | null;
  first_user_message: string | null;
  first_assistant_message: string | null;
  messages: Message[];
  message_count?: number | null;
  metadata: Record<string, any> | null;
}

// DeleteResponse - response for delete operations
export interface DeleteResponse {
  message: string;
}

// Chat request interface based on the OpenAPI spec
export interface ChatRequest {
  model: string;
  message: string;
  conversation_session_id?: string | null;
  system_prompt?: string | null;
  summarize_history?: boolean | null;
  title?: string | null;
}

// API response types
export interface ApiResponse<T> {
  data: T;
  status: number;
}

// Pagination parameters
export interface PaginationParams {
  limit?: number;
  offset?: number;
  user_id?: string | null;
}

// Response from GET /api/models
export interface AvailableModels {
  openai?: string[];
  anthropic?: string[];
  [key: string]: string[] | undefined; // For any future providers
}

// Response from GET /api/models/{provider}
export type ProviderModels = string[];

// Response from GET /api/models-default
export interface DefaultModels {
  openai?: string;
  anthropic?: string;
  [key: string]: string | undefined; // For any future providers
}

// Response chunks from POST /api/chat (streaming)
export interface ChatStreamResponse {
  content: string;
  done: boolean;
  conversation_id?: string | null;
  error?: string | null;
}
