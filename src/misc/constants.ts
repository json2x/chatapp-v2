/**
 * Application-wide constants
 */

/**
 * Base API URL for all service endpoints
 * Fetched from environment variables with a fallback to localhost
 */
export const API_BASE_URL = process.env.VUE_APP_API_BASE_URL || 'http://localhost:8000/api';

/**
 * API endpoints for the ChatApp v2 API
 */
export const API_ENDPOINTS = {
  CHAT: '/chat',                    // Streams responses from LLMs
  MODELS: '/models',                // Gets available models across providers
  MODELS_PROVIDER: '/models/',      // Gets models for a specific provider (append provider name)
  MODELS_DEFAULT: '/models-default', // Gets default model for each provider
  CONVERSATIONS: '/conversations'   // List, get, and delete conversations
};
