import { 
  AvailableModels, 
  ProviderModels, 
  DefaultModels 
} from '../types/servicesTypes';
import { API_BASE_URL, handleApiError } from './apiUtils';



/**
 * Gets all available models from all providers
 * @returns Promise with a dictionary of providers and their available models
 */
export async function getAvailableModels(): Promise<AvailableModels> {
  try {
    const url = `${API_BASE_URL}/models`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching available models:', error);
    throw error;
  }
}

/**
 * Gets available models for a specific provider
 * @param provider The provider name (e.g., "openai", "anthropic")
 * @returns Promise with an array of model names
 */
export async function getProviderModels(provider: string): Promise<ProviderModels> {
  try {
    const url = `${API_BASE_URL}/models/${provider}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch models for provider ${provider}: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching models for provider ${provider}:`, error);
    throw error;
  }
}

/**
 * Gets the default model for each available provider
 * @returns Promise with a dictionary of providers and their default model names
 */
export async function getDefaultModels(): Promise<DefaultModels> {
  try {
    const url = `${API_BASE_URL}/models-default`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch default models: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching default models:', error);
    throw error;
  }
}
