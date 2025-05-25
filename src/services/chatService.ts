import type { 
  ChatRequest, 
  ChatStreamResponse 
} from '../types/servicesTypes';
import { API_BASE_URL } from './apiUtils';



/**
 * Sends a chat message to the API and returns a streaming response
 * @param chatRequest The chat request containing model, message, and optional parameters
 * @returns ReadableStream for processing the streaming response
 */
export async function sendChatMessage(chatRequest: ChatRequest): Promise<ReadableStream<Uint8Array>> {
  try {
    const url = `${API_BASE_URL}/chat`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(chatRequest),
    });
    
    if (!response.ok) {
      throw new Error(`Chat request failed: ${response.status} ${response.statusText}`);
    }
    
    // Return the stream directly for processing by the caller
    return response.body as ReadableStream<Uint8Array>;
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
}

/**
 * Helper function to process the streaming response from the chat API
 * @param stream ReadableStream from the chat API
 * @param onChunk Callback function to process each chunk of data
 * @param onComplete Optional callback function when stream is complete
 * @param onError Optional callback function when an error occurs
 */
export async function processStreamResponse(
  stream: ReadableStream<Uint8Array>,
  onChunk: (chunk: ChatStreamResponse) => void,
  onComplete?: () => void,
  onError?: (error: Error) => void
): Promise<void> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  
  try {
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        onComplete?.();
        break;
      }
      
      const chunkText = decoder.decode(value, { stream: true });
      
      try {
        // Parse the chunk as JSON
        const parsedChunk: ChatStreamResponse = JSON.parse(chunkText);
        onChunk(parsedChunk);
      } catch (parseError) {
        // If parsing fails, pass the raw text with a minimal wrapper
        console.warn('Failed to parse stream chunk as JSON:', parseError);
        onChunk({
          content: chunkText,
          done: false,
          error: 'Failed to parse server response'
        });
      }
    }
  } catch (error) {
    console.error('Error processing stream:', error);
    onError?.(error as Error);
    throw error;
  } finally {
    reader.releaseLock();
  }
}






