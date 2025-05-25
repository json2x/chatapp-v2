import { describe, it, expect, beforeEach } from 'vitest';
import { server } from '../setup';
import { http, HttpResponse } from 'msw';
import { getAvailableModels, getProviderModels, getDefaultModels } from '../../src/services/modelService';
import { mockAvailableModels, mockDefaultModels } from '../mocks/handlers';

describe('Model Service', () => {
  // Reset handlers before each test
  beforeEach(() => server.resetHandlers());

  describe('getAvailableModels', () => {
    it('should fetch all available models from all providers', async () => {
      const models = await getAvailableModels();
      
      expect(models).toEqual(mockAvailableModels);
      expect(models.openai).toHaveLength(3);
      expect(models.anthropic).toHaveLength(3);
    });

    it('should handle API errors', async () => {
      // Override the handler to simulate an error
      server.use(
        http.get('http://localhost:8000/api/models', () => {
          return new HttpResponse(JSON.stringify({ detail: 'Internal server error' }), { status: 500 });
        })
      );

      await expect(getAvailableModels()).rejects.toThrow('Failed to fetch models');
    });
  });

  describe('getProviderModels', () => {
    it('should fetch models for OpenAI provider', async () => {
      const models = await getProviderModels('openai');
      
      expect(models).toEqual(mockAvailableModels.openai);
      expect(models).toContain('gpt-4');
    });

    it('should fetch models for Anthropic provider', async () => {
      const models = await getProviderModels('anthropic');
      
      expect(models).toEqual(mockAvailableModels.anthropic);
      expect(models).toContain('claude-3-sonnet');
    });

    it('should handle non-existent provider', async () => {
      await expect(getProviderModels('nonexistent')).rejects.toThrow('Failed to fetch models for provider');
    });
  });

  describe('getDefaultModels', () => {
    it('should fetch default models for all providers', async () => {
      const models = await getDefaultModels();
      
      expect(models).toEqual(mockDefaultModels);
      expect(models.openai).toBe('gpt-4');
      expect(models.anthropic).toBe('claude-3-sonnet');
    });

    it('should handle API errors', async () => {
      // Override the handler to simulate an error
      server.use(
        http.get('http://localhost:8000/api/models-default', () => {
          return new HttpResponse(JSON.stringify({ detail: 'Internal server error' }), { status: 500 });
        })
      );

      await expect(getDefaultModels()).rejects.toThrow('Failed to fetch default models');
    });
  });
});
