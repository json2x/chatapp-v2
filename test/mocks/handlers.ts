import { http, HttpResponse } from 'msw';

// Import the same API_BASE_URL used in the services
import { API_BASE_URL } from '../../src/services/apiUtils';

// Mock data for tests
export const mockConversationSummaries = [
  {
    id: 'conv-1',
    title: 'Test Conversation 1',
    subtitle: 'A conversation about general assistance',
    created_at: '2025-05-20T12:00:00Z',
    updated_at: '2025-05-20T12:30:00Z',
    user_id: 'user-1',
    model: 'gpt-4',
    system_prompt: 'You are a helpful assistant',
    message_count: 2,
    metadata: null
  },
  {
    id: 'conv-2',
    title: 'Test Conversation 2',
    subtitle: 'A conversation with Claude',
    created_at: '2025-05-21T14:00:00Z',
    updated_at: '2025-05-21T14:45:00Z',
    user_id: 'user-1',
    model: 'claude-3',
    system_prompt: 'You are a helpful assistant',
    message_count: 3,
    metadata: { tags: ['important'] }
  }
];

export const mockConversation = {
  id: 'conv-1',
  title: 'Test Conversation 1',
  subtitle: 'A conversation about general assistance',
  created_at: '2025-05-20T12:00:00Z',
  updated_at: '2025-05-20T12:30:00Z',
  user_id: 'user-1',
  model: 'gpt-4',
  system_prompt: 'You are a helpful assistant',
  messages: [
    {
      id: 'msg-1',
      conversation_id: 'conv-1',
      role: 'user',
      content: 'Hello',
      created_at: '2025-05-20T12:00:00Z',
      tokens: 1,
      model: 'gpt-4',
      metadata: null
    },
    {
      id: 'msg-2',
      conversation_id: 'conv-1',
      role: 'assistant',
      content: 'Hi there! How can I help you today?',
      created_at: '2025-05-20T12:00:10Z',
      tokens: 9,
      model: 'gpt-4',
      metadata: null
    }
  ],
  message_count: 2,
  metadata: null
};

export const mockAvailableModels = {
  openai: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo'],
  anthropic: ['claude-3-haiku', 'claude-3-sonnet', 'claude-3-opus']
};

export const mockDefaultModels = {
  openai: 'gpt-4',
  anthropic: 'claude-3-sonnet'
};

// Define handlers
export const handlers = [
  // Conversation handlers
  http.get(`${API_BASE_URL}/conversations`, () => {
    return HttpResponse.json(mockConversationSummaries)
  }),
  
  http.get(`${API_BASE_URL}/conversations/:conversationId`, ({ params }) => {
    const conversationId = params.conversationId;
    if (conversationId === 'conv-1') {
      return HttpResponse.json(mockConversation)
    }
    return new HttpResponse(JSON.stringify({ detail: 'Conversation not found' }), { status: 404 })
  }),
  
  http.delete(`${API_BASE_URL}/conversations/:conversationId`, ({ params }) => {
    const conversationId = params.conversationId;
    if (conversationId === 'conv-1') {
      return HttpResponse.json({ message: 'Conversation deleted successfully' })
    }
    return new HttpResponse(JSON.stringify({ detail: 'Conversation not found' }), { status: 404 })
  }),
  
  // Models handlers
  http.get(`${API_BASE_URL}/models`, () => {
    return HttpResponse.json(mockAvailableModels)
  }),
  
  http.get(`${API_BASE_URL}/models/:provider`, ({ params }) => {
    const provider = params.provider;
    if (provider === 'openai') {
      return HttpResponse.json(mockAvailableModels.openai)
    }
    if (provider === 'anthropic') {
      return HttpResponse.json(mockAvailableModels.anthropic)
    }
    return new HttpResponse(JSON.stringify({ detail: 'Provider not found' }), { status: 404 })
  }),
  
  http.get(`${API_BASE_URL}/models-default`, () => {
    return HttpResponse.json(mockDefaultModels)
  }),
  
  // Chat handler
  http.post(`${API_BASE_URL}/chat`, () => {
    // For streaming responses, we'll simulate with a simple response
    return HttpResponse.json({
      content: 'This is a response from the mock API',
      done: true,
      conversation_id: 'new-conv-id'
    });
  })
];
