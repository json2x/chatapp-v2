import { describe, it, expect, beforeEach, vi } from 'vitest';
import { server } from '../setup';
import { http, HttpResponse } from 'msw';
import { sendChatMessage, processStreamResponse } from '../../src/services/chatService';
import { ChatRequest, ChatStreamResponse } from '../../src/types/servicesTypes';

describe('Chat Service', () => {
  // Reset handlers before each test
  beforeEach(() => server.resetHandlers());

  describe('sendChatMessage', () => {
    it('should send a chat message and return a stream', async () => {
      const chatRequest: ChatRequest = {
        model: 'gpt-4',
        message: 'Hello, how are you?',
        system_prompt: 'You are a helpful assistant'
      };

      const stream = await sendChatMessage(chatRequest);
      
      expect(stream).toBeDefined();
      expect(stream instanceof ReadableStream).toBe(true);
    });

    it('should handle API errors', async () => {
      // Override the handler to simulate an error
      server.use(
        http.post('http://localhost:8000/api/chat', () => {
          return new HttpResponse(JSON.stringify({ detail: 'Internal server error' }), { status: 500 });
        })
      );

      const chatRequest: ChatRequest = {
        model: 'gpt-4',
        message: 'Hello, how are you?'
      };

      await expect(sendChatMessage(chatRequest)).rejects.toThrow('Chat request failed');
    });
  });

  describe('processStreamResponse', () => {
    it('should process a stream and call the callback for each chunk', async () => {
      // Create a mock stream
      const encoder = new TextEncoder();
      const chunks = [
        { content: 'Hello', done: false, conversation_id: 'conv-id' },
        { content: ' world', done: false, conversation_id: 'conv-id' },
        { content: '!', done: true, conversation_id: 'conv-id' }
      ];
      
      const encodedChunks = chunks.map(chunk => encoder.encode(JSON.stringify(chunk)));
      
      const mockStream = new ReadableStream({
        start(controller) {
          encodedChunks.forEach(chunk => controller.enqueue(chunk));
          controller.close();
        }
      });

      const onChunk = vi.fn();
      const onComplete = vi.fn();
      const onError = vi.fn();

      await processStreamResponse(mockStream, onChunk, onComplete, onError);

      expect(onChunk).toHaveBeenCalledTimes(3);
      expect(onChunk).toHaveBeenCalledWith(chunks[0]);
      expect(onChunk).toHaveBeenCalledWith(chunks[1]);
      expect(onChunk).toHaveBeenCalledWith(chunks[2]);
      expect(onComplete).toHaveBeenCalledTimes(1);
      expect(onError).not.toHaveBeenCalled();
    });

    it('should handle parsing errors in stream chunks', async () => {
      // Create a mock stream with invalid JSON
      const encoder = new TextEncoder();
      const invalidChunk = encoder.encode('This is not valid JSON');
      
      const mockStream = new ReadableStream({
        start(controller) {
          controller.enqueue(invalidChunk);
          controller.close();
        }
      });

      const onChunk = vi.fn();
      const onComplete = vi.fn();
      const onError = vi.fn();

      await processStreamResponse(mockStream, onChunk, onComplete, onError);

      expect(onChunk).toHaveBeenCalledTimes(1);
      expect(onChunk).toHaveBeenCalledWith({
        content: 'This is not valid JSON',
        done: false,
        error: 'Failed to parse server response'
      });
      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it('should handle stream errors', async () => {
      // Create a mock stream that errors
      const mockStream = new ReadableStream({
        start(controller) {
          controller.error(new Error('Stream error'));
        }
      });

      const onChunk = vi.fn();
      const onComplete = vi.fn();
      const onError = vi.fn();

      await expect(processStreamResponse(mockStream, onChunk, onComplete, onError)).rejects.toThrow('Stream error');
      
      expect(onChunk).not.toHaveBeenCalled();
      expect(onComplete).not.toHaveBeenCalled();
      expect(onError).toHaveBeenCalledTimes(1);
    });
  });
});
