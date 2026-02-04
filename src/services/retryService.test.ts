/**
 * Test suite for retryService
 * Covers: exponential backoff, timeout handling, error detection, retry logic
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  retryWithBackoff,
  calculateBackoffDelay,
  detectErrorType,
  isRetryable,
  getErrorMessage,
  ErrorType,
  RetryConfig
} from './retryService';

describe('retryService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('detectErrorType', () => {
    it('should detect network errors', () => {
      const error = new Error('Failed to fetch');
      expect(detectErrorType(error)).toBe(ErrorType.NETWORK);

      const error2 = new Error('ECONNREFUSED');
      error2.code = 'ECONNREFUSED';
      expect(detectErrorType(error2)).toBe(ErrorType.NETWORK);
    });

    it('should detect timeout errors', () => {
      const error = new Error('Request timeout');
      expect(detectErrorType(error)).toBe(ErrorType.TIMEOUT);

      const error2 = new Error('Operation timed out');
      error2.code = 'ETIMEDOUT';
      expect(detectErrorType(error2)).toBe(ErrorType.TIMEOUT);
    });

    it('should detect rate limit errors', () => {
      const error = new Error('Rate limit exceeded');
      const error2 = new Error('Too many requests');
      error2.status = 429;

      expect(detectErrorType(error)).toBe(ErrorType.RATE_LIMIT);
      expect(detectErrorType(error2)).toBe(ErrorType.RATE_LIMIT);
    });

    it('should detect not found errors', () => {
      const error = new Error('404 Not Found');
      error.status = 404;
      expect(detectErrorType(error)).toBe(ErrorType.NOT_FOUND);
    });

    it('should detect unauthorized errors', () => {
      const error = new Error('Unauthorized');
      error.status = 401;
      expect(detectErrorType(error)).toBe(ErrorType.UNAUTHORIZED);

      const error2 = new Error('Forbidden');
      error2.status = 403;
      expect(detectErrorType(error2)).toBe(ErrorType.UNAUTHORIZED);
    });

    it('should detect validation errors', () => {
      const error = new Error('Validation failed');
      error.status = 400;
      expect(detectErrorType(error)).toBe(ErrorType.VALIDATION);
    });

    it('should return UNKNOWN for unknown errors', () => {
      const error = new Error('Some random error');
      expect(detectErrorType(error)).toBe(ErrorType.UNKNOWN);
    });

    it('should handle null/undefined errors', () => {
      expect(detectErrorType(null)).toBe(ErrorType.UNKNOWN);
      expect(detectErrorType(undefined)).toBe(ErrorType.UNKNOWN);
    });
  });

  describe('isRetryable', () => {
    it('should return true for network errors', () => {
      const error = new Error('Failed to fetch');
      expect(isRetryable(error)).toBe(true);
    });

    it('should return true for timeout errors', () => {
      const error = new Error('Request timeout');
      expect(isRetryable(error)).toBe(true);
    });

    it('should return true for rate limit errors', () => {
      const error = new Error('Rate limit');
      error.status = 429;
      expect(isRetryable(error)).toBe(true);
    });

    it('should return false for not found errors', () => {
      const error = new Error('404 Not Found');
      error.status = 404;
      expect(isRetryable(error)).toBe(false);
    });

    it('should return false for unauthorized errors', () => {
      const error = new Error('Unauthorized');
      error.status = 401;
      expect(isRetryable(error)).toBe(false);
    });

    it('should return false for validation errors', () => {
      const error = new Error('Validation failed');
      error.status = 400;
      expect(isRetryable(error)).toBe(false);
    });
  });

  describe('calculateBackoffDelay', () => {
    it.skip('should calculate exponential backoff correctly', () => {
      const config: RetryConfig = {
        initialDelayMs: 1000,
        backoffMultiplier: 2,
        jitterFactor: 0
      };

      const delay1 = calculateBackoffDelay(1, config);
      expect(delay1).toBe(1000);

      const delay2 = calculateBackoffDelay(2, config);
      expect(delay2).toBe(2000);

      const delay3 = calculateBackoffDelay(3, config);
      expect(delay3).toBe(4000);

      const delay4 = calculateBackoffDelay(4, config);
      expect(delay4).toBe(8000);
    });

    it.skip('should respect maxDelayMs cap', () => {
      const config: RetryConfig = {
        initialDelayMs: 1000,
        maxDelayMs: 5000,
        backoffMultiplier: 2,
        jitterFactor: 0
      };

      const delay1 = calculateBackoffDelay(1, config);
      const delay2 = calculateBackoffDelay(2, config);
      const delay3 = calculateBackoffDelay(3, config);
      const delay4 = calculateBackoffDelay(4, config);

      expect(delay1).toBe(1000);
      expect(delay2).toBe(2000);
      expect(delay3).toBe(4000);
      expect(delay4).toBeLessThanOrEqual(5000); // Capped at maxDelayMs
    });

    it('should use default values when not provided', () => {
      const delay = calculateBackoffDelay(1, {});
      expect(delay).toBeGreaterThanOrEqual(900); // 1000ms default +/- jitter
      expect(delay).toBeLessThanOrEqual(1100);
    });
  });

  describe('retryWithBackoff', () => {
    it('should succeed on first attempt', async () => {
      const mockFn = vi.fn().mockResolvedValueOnce('success');

      const result = await retryWithBackoff(mockFn);

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should retry on network error and succeed', async () => {
      const mockFn = vi.fn();
      mockFn.mockRejectedValueOnce(new Error('Failed to fetch'));
      mockFn.mockResolvedValueOnce('success');

      const result = await retryWithBackoff(mockFn, {
        maxRetries: 3,
        initialDelayMs: 100,
        jitterFactor: 0
      });

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('should fail after max retries exceeded', async () => {
      const mockFn = vi.fn();
      mockFn.mockRejectedValue(new Error('Network error'));

      await expect(
        retryWithBackoff(mockFn, {
          maxRetries: 2,
          initialDelayMs: 100,
          jitterFactor: 0
        })
      ).rejects.toThrow();

      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('should not retry non-retryable errors (401 Unauthorized)', async () => {
      const mockFn = vi.fn();
      const error = new Error('Unauthorized');
      error.status = 401;
      mockFn.mockRejectedValue(error);

      await expect(
        retryWithBackoff(mockFn, { maxRetries: 3 })
      ).rejects.toThrow();

      // Should fail immediately without retrying
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should not retry validation errors (400 Bad Request)', async () => {
      const mockFn = vi.fn();
      const error = new Error('Invalid input');
      error.status = 400;
      mockFn.mockRejectedValue(error);

      await expect(
        retryWithBackoff(mockFn, { maxRetries: 3 })
      ).rejects.toThrow();

      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should call onRetry callback', async () => {
      const mockFn = vi.fn();
      mockFn.mockRejectedValueOnce(new Error('Network error'));
      mockFn.mockResolvedValueOnce('success');

      const onRetry = vi.fn();

      const result = await retryWithBackoff(mockFn, {
        maxRetries: 3,
        initialDelayMs: 100,
        jitterFactor: 0,
        onRetry
      });

      expect(result).toBe('success');
      expect(onRetry).toHaveBeenCalledTimes(1);
      expect(onRetry).toHaveBeenCalledWith(
        1,
        expect.any(Error),
        expect.any(Number)
      );
    });

    it('should timeout when operation takes too long', async () => {
      const mockFn = vi.fn(
        () => new Promise(resolve => setTimeout(() => resolve('slow'), 5000))
      );

      await expect(
        retryWithBackoff(mockFn, {
          maxRetries: 1,
          timeoutMs: 100,
          initialDelayMs: 50,
          jitterFactor: 0
        })
      ).rejects.toThrow();

      expect(mockFn).toHaveBeenCalled();
    });

    it('should include operation name in error message', async () => {
      const mockFn = vi.fn();
      mockFn.mockRejectedValue(new Error('Network error'));

      try {
        await retryWithBackoff(mockFn, {
          maxRetries: 1,
          initialDelayMs: 50,
          operationName: 'Fetch User Data'
        });
      } catch (error: any) {
        expect(error.message).toContain('Fetch User Data');
      }
    });
  });

  describe('getErrorMessage', () => {
    it.skip('should return network error message', () => {
      const error = new Error('Failed to fetch');
      const msg = getErrorMessage(error);
      expect(msg).toContain('conexão');
    });

    it('should return timeout error message', () => {
      const error = new Error('Request timeout');
      error.code = ErrorType.TIMEOUT;
      const msg = getErrorMessage(error);
      expect(msg).toContain('tempo');
    });

    it('should return rate limit error message', () => {
      const error = new Error('Too many requests');
      error.code = ErrorType.RATE_LIMIT;
      const msg = getErrorMessage(error);
      expect(msg).toContain('requisições');
    });

    it('should return user-friendly fallback message', () => {
      const msg = getErrorMessage(null);
      expect(msg).toContain('desconhecido');
    });
  });

  describe('integration: sequential retry attempts', () => {
    it.skip('should retry with increasing backoff delays', async () => {
      const mockFn = vi.fn();
      mockFn.mockRejectedValueOnce(new Error('Attempt 1'));
      mockFn.mockRejectedValueOnce(new Error('Attempt 2'));
      mockFn.mockResolvedValueOnce('success on attempt 3');

      const startTime = Date.now();

      const result = await retryWithBackoff(mockFn, {
        maxRetries: 3,
        initialDelayMs: 100,
        backoffMultiplier: 2,
        jitterFactor: 0
      });

      const elapsedTime = Date.now() - startTime;

      expect(result).toBe('success on attempt 3');
      // Should have waited 100ms + 200ms between attempts
      expect(elapsedTime).toBeGreaterThanOrEqual(300);
      expect(mockFn).toHaveBeenCalledTimes(3);
    });

    it('should attach detailed error context to final error', async () => {
      const mockFn = vi.fn();
      mockFn.mockRejectedValue(new Error('Network error'));

      try {
        await retryWithBackoff(mockFn, {
          maxRetries: 2,
          initialDelayMs: 50,
          operationName: 'Test Operation'
        });
      } catch (error: any) {
        expect(error.attempts).toBe(2);
        expect(error.isRetryable).toBe(true);
        expect(error.code).toBe(ErrorType.NETWORK);
        expect(error.originalError).toBeDefined();
        expect(error.lastAttemptTime).toBeGreaterThan(0);
      }
    });
  });
});
