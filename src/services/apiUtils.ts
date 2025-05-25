/**
 * Common API utilities and configuration for services
 */
import type { PaginationParams } from '../types/servicesTypes';

// Base API URL - consider moving this to an environment config
export const API_BASE_URL = 'http://localhost:8000/api';

/**
 * Helper function to handle API errors
 * @param response Fetch response object
 * @param errorMessage Custom error message
 */
export async function handleApiError(response: Response, errorMessage: string): Promise<never> {
  let errorDetails = '';
  
  try {
    const errorData = await response.json();
    errorDetails = JSON.stringify(errorData);
  } catch {    // Ignore parsing errors
    // If we can't parse the error as JSON, use the status text
    errorDetails = response.statusText;
  }
  
  throw new Error(`${errorMessage}: ${response.status} - ${errorDetails}`);
}

/**
 * Helper to build URL with query parameters
 * @param endpoint API endpoint path
 * @param params Query parameters object
 * @returns Formatted URL with query parameters
 */
export function buildUrl(endpoint: string, params?: Record<string, unknown> | PaginationParams): string {
  if (!params) {
    return `${API_BASE_URL}${endpoint}`;
  }
  
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      // Handle different types of values appropriately
      if (typeof value === 'string') {
        queryParams.append(key, value);
      } else if (typeof value === 'number' || typeof value === 'boolean') {
        queryParams.append(key, value.toString());
      } else {
        // For objects and any other types, use JSON.stringify
        queryParams.append(key, JSON.stringify(value));
      }
    }
  });
  
  const queryString = queryParams.toString();
  return `${API_BASE_URL}${endpoint}${queryString ? `?${queryString}` : ''}`;
}
