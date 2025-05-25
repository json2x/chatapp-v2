import { describe, it, expect, beforeEach } from 'vitest';
import { server } from '../setup';
import { http, HttpResponse } from 'msw';
import { 
  getConversations, 
  getConversationById, 
  deleteConversation 
} from '../../src/services/conversationService';
import { 
  mockConversationSummaries, 
  mockConversation 
} from '../mocks/handlers';

describe('Conversation Service', () => {
  // Reset handlers before each test
  beforeEach(() => server.resetHandlers());

  describe('getConversations', () => {
    it('should fetch all conversations', async () => {
      const conversations = await getConversations();
      
      expect(conversations).toEqual(mockConversationSummaries);
      expect(conversations).toHaveLength(2);
      expect(conversations[0].id).toBe('conv-1');
    });

    it('should handle pagination parameters', async () => {
      // Override the handler to test pagination parameters
      server.use(
        http.get('http://localhost:8000/api/conversations', ({ request }) => {
          const url = new URL(request.url);
          const limit = url.searchParams.get('limit');
          const offset = url.searchParams.get('offset');
          
          expect(limit).toBe('10');
          expect(offset).toBe('20');
          
          return HttpResponse.json([mockConversationSummaries[0]]);
        })
      );

      const conversations = await getConversations({ limit: 10, offset: 20 });
      
      expect(conversations).toHaveLength(1);
    });

    it('should handle user_id filter', async () => {
      // Override the handler to test user_id filter
      server.use(
        http.get('http://localhost:8000/api/conversations', ({ request }) => {
          const url = new URL(request.url);
          const userId = url.searchParams.get('user_id');
          
          expect(userId).toBe('test-user');
          
          return HttpResponse.json([mockConversationSummaries[0]]);
        })
      );

      const conversations = await getConversations({ user_id: 'test-user' });
      
      expect(conversations).toHaveLength(1);
    });

    it('should handle API errors', async () => {
      // Override the handler to simulate an error
      server.use(
        http.get('http://localhost:8000/api/conversations', () => {
          return new HttpResponse(JSON.stringify({ detail: 'Internal server error' }), { status: 500 });
        })
      );

      await expect(getConversations()).rejects.toThrow('Failed to fetch conversations');
    });
  });

  describe('getConversationById', () => {
    it('should fetch a conversation by ID', async () => {
      const conversation = await getConversationById('conv-1');
      
      expect(conversation).toEqual(mockConversation);
      expect(conversation.id).toBe('conv-1');
      expect(conversation.messages).toHaveLength(2);
    });

    it('should handle non-existent conversation', async () => {
      await expect(getConversationById('non-existent')).rejects.toThrow('Failed to fetch conversation');
    });
  });

  describe('deleteConversation', () => {
    it('should delete a conversation by ID', async () => {
      const response = await deleteConversation('conv-1');
      
      expect(response.message).toBe('Conversation deleted successfully');
    });

    it('should handle non-existent conversation', async () => {
      await expect(deleteConversation('non-existent')).rejects.toThrow('Failed to delete conversation');
    });
  });
});
