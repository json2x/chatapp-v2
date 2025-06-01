import type { 
  Conversation, 
  ConversationSummary, 
  DeleteResponse, 
  PaginationParams 
} from '../types/servicesTypes';
import { API_BASE_URL, buildUrl, getAuthHeaders } from './apiUtils';



/**
 * Fetches a list of conversations for a specific user with optional pagination
 * @param userId Required user ID to fetch conversations for
 * @param params Optional pagination parameters
 * @returns Promise with array of conversation summaries
 */
export async function getConversations(userId: string, params?: Omit<PaginationParams, 'user_id'>): Promise<ConversationSummary[]> {
  try {
    // Combine the userId with any other params
    const queryParams = { ...params, user_id: userId };
    const url = buildUrl('/conversations', queryParams);
    
    const response = await fetch(url, {
      headers: getAuthHeaders()
    });
    
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
    const response = await fetch(url, {
      headers: getAuthHeaders()
    });
    
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
      headers: getAuthHeaders()
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

