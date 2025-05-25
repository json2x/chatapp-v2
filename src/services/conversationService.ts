import type { 
  Conversation, 
  ConversationSummary, 
  DeleteResponse, 
  PaginationParams 
} from '../types/servicesTypes';
import { API_BASE_URL, buildUrl } from './apiUtils';



/**
 * Fetches a list of conversations with optional pagination and filtering
 * @param params Optional pagination and filtering parameters
 * @returns Promise with array of conversation summaries
 */
export async function getConversations(params?: PaginationParams): Promise<ConversationSummary[]> {
  try {
    const url = buildUrl('/conversations', params);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch conversations: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }
}

/**
 * Fetches a single conversation by ID, including all messages
 * @param conversationId The ID of the conversation to fetch
 * @returns Promise with the full conversation including messages
 */
export async function getConversationById(conversationId: string): Promise<Conversation> {
  try {
    const url = `${API_BASE_URL}/conversations/${conversationId}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch conversation: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching conversation ${conversationId}:`, error);
    throw error;
  }
}

/**
 * Deletes a conversation by ID
 * @param conversationId The ID of the conversation to delete
 * @returns Promise with the delete response
 */
export async function deleteConversation(conversationId: string): Promise<DeleteResponse> {
  try {
    const url = `${API_BASE_URL}/conversations/${conversationId}`;
    const response = await fetch(url, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete conversation: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error deleting conversation ${conversationId}:`, error);
    throw error;
  }
}

/**
 * Helper function to handle API errors
 * @param response Fetch response object
 * @param errorMessage Custom error message
 */

