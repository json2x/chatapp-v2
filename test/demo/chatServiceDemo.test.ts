import { ChatRequest, ChatStreamResponse } from '../../src/types/servicesTypes';
import { describe, it, expect } from 'vitest';
import { API_BASE_URL } from '../../src/services/apiUtils';

/**
 * Demo test for chat service to see raw responses from the chat endpoint
 * This test is designed to show the actual structure of the responses
 * rather than just testing functionality.
 */
describe('Chat Service Demo', () => {
  it('should show raw responses from the chat endpoint', async () => {
    // Create a basic chat request
    const chatRequest: ChatRequest = {
      model: 'gpt-4', // Adjust this to a model available in your backend
      message: 'Hello, tell me a short joke',
      system_prompt: 'You are a helpful assistant that responds with short, concise answers.'
    };

    console.log('Sending chat request:', JSON.stringify(chatRequest, null, 2));
    
    try {
      // Send the chat message directly without using the service
      const url = `${API_BASE_URL}/chat`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chatRequest),
      });
      
      // Log the raw response details
      console.log('Raw response status:', response.status, response.statusText);
      console.log('Raw response headers:', JSON.stringify(Object.fromEntries([...response.headers]), null, 2));
      
      // Get the stream
      const stream = response.body as ReadableStream<Uint8Array>;
      expect(stream).toBeDefined();
      
      // Process the stream manually to see raw chunks
      const reader = stream.getReader();
      const decoder = new TextDecoder();
      const chunks: ChatStreamResponse[] = [];
      
      try {
        console.log('--- RAW STREAM CHUNKS ---');
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            console.log('--- END OF RAW STREAM ---');
            break;
          }
          
          // Log the raw chunk as bytes and as text
          const rawChunk = value;
          const rawText = decoder.decode(rawChunk, { stream: true });
          
          console.log('Raw chunk bytes:', [...rawChunk]);
          console.log('Raw chunk text:', rawText);
          
          try {
            // Try to parse as JSON
            const parsedChunk: ChatStreamResponse = JSON.parse(rawText);
            console.log('Parsed chunk:', JSON.stringify(parsedChunk, null, 2));
            chunks.push(parsedChunk);
          } catch (parseError) {
            console.warn('Failed to parse as JSON:', parseError);
            // Store raw text as a fallback
            chunks.push({
              content: rawText,
              done: false,
              error: 'Failed to parse server response'
            });
          }
        }
        
        console.log('Stream completed');
        console.log('Total chunks received:', chunks.length);
        
        if (chunks.length > 0) {
          // Log the complete response by joining all content
          const fullContent = chunks.map(chunk => chunk.content).join('');
          console.log('Full response content:', fullContent);
          
          // Log conversation ID if available
          const conversationId = chunks.find(chunk => chunk.conversation_id)?.conversation_id;
          if (conversationId) {
            console.log('Conversation ID:', conversationId);
          }
        }
      } catch (error) {
        console.error('Stream processing error:', error);
      } finally {
        reader.releaseLock();
      }
      
      // The test will pass as long as we got a response
      expect(response.ok).toBe(true);
      
    } catch (error) {
      console.error('Test error:', error);
      throw error;
    }
  }, 30000); // Increase timeout to 30 seconds for API response
});
