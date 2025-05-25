import { describe, it, expect } from 'vitest';
import { buildUrl, handleApiError, API_BASE_URL } from '../../src/services/apiUtils';

describe('API Utilities', () => {
  describe('buildUrl', () => {
    it('should build a URL without query parameters', () => {
      const url = buildUrl('/endpoint');
      expect(url).toBe(`${API_BASE_URL}/endpoint`);
    });

    it('should build a URL with query parameters', () => {
      const url = buildUrl('/endpoint', { param1: 'value1', param2: 42 });
      expect(url).toBe(`${API_BASE_URL}/endpoint?param1=value1&param2=42`);
    });

    it('should ignore null and undefined parameters', () => {
      const url = buildUrl('/endpoint', { 
        param1: 'value1', 
        param2: null, 
        param3: undefined, 
        param4: false 
      });
      expect(url).toBe(`${API_BASE_URL}/endpoint?param1=value1&param4=false`);
    });

    it('should handle empty parameters object', () => {
      const url = buildUrl('/endpoint', {});
      expect(url).toBe(`${API_BASE_URL}/endpoint`);
    });
  });

  describe('handleApiError', () => {
    it('should throw an error with JSON error details', async () => {
      const response = new Response(
        JSON.stringify({ detail: 'Error details' }), 
        { status: 400, statusText: 'Bad Request' }
      );

      await expect(handleApiError(response, 'Test error')).rejects.toThrow(
        'Test error: 400 - {"detail":"Error details"}'
      );
    });

    it('should throw an error with status text when JSON parsing fails', async () => {
      const response = new Response(
        'Not JSON', 
        { status: 500, statusText: 'Internal Server Error' }
      );

      await expect(handleApiError(response, 'Test error')).rejects.toThrow(
        'Test error: 500 - Internal Server Error'
      );
    });
  });
});
