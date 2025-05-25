/**
 * Common API utilities and configuration for services
 */

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
  } catch (e) {
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
export function buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined | null>): string {
  if (!params) {
    return `${API_BASE_URL}${endpoint}`;
  }
  
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });
  
  const queryString = queryParams.toString();
  return `${API_BASE_URL}${endpoint}${queryString ? `?${queryString}` : ''}`;
}
