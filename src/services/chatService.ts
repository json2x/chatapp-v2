import type { 
  ChatRequest, 
  ChatStreamResponse 
} from '../types/servicesTypes';
import { API_BASE_URL, getAuthHeaders } from './apiUtils';



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
      headers: getAuthHeaders(),
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
  let buffer = '';
  
  try {
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        onComplete?.();
        break;
      }
      
      // Decode the chunk and add it to our buffer
      const chunkText = decoder.decode(value, { stream: true });
      buffer += chunkText;
      
      // Process each line in the buffer (SSE format sends one event per line)
      const lines = buffer.split('\n');
      // Keep the last line in the buffer if it's not complete
      buffer = lines.pop() || '';
      
      for (const line of lines) {
        // Skip empty lines or event type lines
        if (!line.trim() || line.startsWith('event:')) continue;
        
        // Handle SSE data format (data: {...})
        if (line.startsWith('data:')) {
          try {
            // Extract the JSON part after 'data:'
            const jsonStr = line.substring(5).trim();
            const parsedChunk: ChatStreamResponse = JSON.parse(jsonStr);
            onChunk(parsedChunk);
          } catch (parseError) {
            console.warn('Failed to parse SSE data as JSON:', parseError, line);
            // If we can't parse it as JSON, just return the content without the 'data:' prefix
            onChunk({
              content: line.substring(5).trim(),
              done: false,
              error: 'Failed to parse server response'
            });
          }
        } else {
          // Try to parse as plain JSON (non-SSE format)
          try {
            const parsedChunk: ChatStreamResponse = JSON.parse(line);
            onChunk(parsedChunk);
          } catch (parseError) {
            // If all parsing attempts fail, just return the raw line
            console.warn('Failed to parse stream chunk:', parseError, line);
            onChunk({
              content: line,
              done: false,
              error: 'Failed to parse server response'
            });
          }
        }
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






