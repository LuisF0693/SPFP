import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import errorRecovery, {
  ErrorContext,
  ErrorRecoveryOptions,
  ErrorLog,
  withErrorRecovery
} from '../services/errorRecovery';
import { ErrorType } from '../services/retryService';

describe('ErrorRecoveryService', () => {
  beforeEach(() => {
    errorRecovery.clearErrorLogs();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('captureContext', () => {
    it('should capture error context with all details', () => {
      const error = new Error('Test error');
      error.code = 'ECONNREFUSED';

      const context = errorRecovery.captureContext(error, 'Test Action', {
        userId: 'user123',
        metadata: { action: 'test' }
      });

      expect(context.action).toBe('Test Action');
      expect(context.userId).toBe('user123');
      expect(context.originalError).toBe(error);
      expect(context.metadata?.action).toBe('test');
      expect(context.timestamp).toBeGreaterThan(0);
    });

    it('should detect error type correctly', () => {
      const networkError = new Error('Network error: Failed to fetch');
      const context = errorRecovery.captureContext(networkError, 'Network test');

      expect(context.errorType).toBe(ErrorType.NETWORK);
    });

    it('should handle errors without metadata', () => {
      const error = new Error('Simple error');
      const context = errorRecovery.captureContext(error, 'Simple action');

      expect(context.action).toBe('Simple action');
      expect(context.userId).toBeUndefined();
      expect(context.metadata).toBeUndefined();
    });
  });

  describe('logError', () => {
    it('should create error log with provided details', () => {
      const error = new Error('Test error');
      const context: ErrorContext = {
        action: 'Test Action',
        timestamp: Date.now(),
        userId: 'user123'
      };

      const log = errorRecovery.logError(context, 'User friendly message', 'high', false);

      expect(log.context.action).toBe('Test Action');
      expect(log.message).toBe('User friendly message');
      expect(log.severity).toBe('high');
      expect(log.recovered).toBe(false);
      expect(log.id).toMatch(/^error_\d+_/);
    });

    it('should add log to logs array', () => {
      const context: ErrorContext = {
        action: 'Test',
        timestamp: Date.now()
      };

      const initialLength = errorRecovery.logs.length;
      errorRecovery.logError(context, 'Message', 'medium', false);

      expect(errorRecovery.logs.length).toBe(initialLength + 1);
    });

    it('should maintain max 100 logs', () => {
      const context: ErrorContext = {
        action: 'Test',
        timestamp: Date.now()
      };

      // Add 150 logs
      for (let i = 0; i < 150; i++) {
        errorRecovery.logError(context, `Message ${i}`, 'low', false);
      }

      expect(errorRecovery.logs.length).toBe(100);
    });

    it('should mark as recovered when specified', () => {
      const context: ErrorContext = {
        action: 'Test',
        timestamp: Date.now()
      };

      const log = errorRecovery.logError(context, 'Message', 'medium', true);

      expect(log.recovered).toBe(true);
    });
  });

  describe('getUserMessage', () => {
    it('should return network error message in Portuguese', () => {
      const error = new Error('Network error');
      const message = errorRecovery.getUserMessage(error);

      expect(message).toContain('Erro de conexão');
      expect(message).toContain('internet');
    });

    it('should return timeout message in Portuguese', () => {
      const error = new Error('Timeout error');
      const message = errorRecovery.getUserMessage(error);

      expect(message).toContain('tempo');
    });

    it('should return rate limit message in Portuguese', () => {
      const error: any = new Error('Rate limit');
      error.status = 429;
      const message = errorRecovery.getUserMessage(error);

      expect(message).toContain('requisições');
    });

    it('should return not found message in Portuguese', () => {
      const error: any = new Error('Not found');
      error.status = 404;
      const message = errorRecovery.getUserMessage(error);

      expect(message).toContain('não encontrado');
    });

    it('should return unauthorized message in Portuguese', () => {
      const error: any = new Error('Unauthorized');
      error.status = 401;
      const message = errorRecovery.getUserMessage(error);

      expect(message).toContain('Acesso negado');
    });

    it('should return validation message in Portuguese', () => {
      const error: any = new Error('Validation failed');
      error.status = 400;
      const message = errorRecovery.getUserMessage(error);

      expect(message).toContain('Dados inválidos');
    });

    it('should prepend action to message when provided', () => {
      const error = new Error('Network error');
      const message = errorRecovery.getUserMessage(error, 'carregar dados');

      expect(message).toContain('Erro ao carregar dados');
    });

    it('should handle unknown error gracefully', () => {
      const error: any = null;
      const message = errorRecovery.getUserMessage(error);

      expect(message).toBe('Erro desconhecido. Por favor, tente novamente.');
    });
  });

  describe('rollbackState', () => {
    it('should call onRollback with previous state', async () => {
      const previousState = { data: 'original' };
      const onRollback = vi.fn().mockResolvedValue(undefined);

      await errorRecovery.rollbackState(previousState, onRollback);

      expect(onRollback).toHaveBeenCalledWith(previousState);
    });

    it('should handle rollback without callback', async () => {
      const previousState = { data: 'original' };

      // Should not throw
      await expect(
        errorRecovery.rollbackState(previousState)
      ).resolves.toBeUndefined();
    });

    it('should throw error if rollback fails', async () => {
      const previousState = { data: 'original' };
      const onRollback = vi.fn().mockRejectedValue(new Error('Rollback failed'));

      await expect(
        errorRecovery.rollbackState(previousState, onRollback)
      ).rejects.toThrow('State rollback failed');
    });
  });

  describe('handleOperation', () => {
    it('should execute successful operation without retry', async () => {
      const operation = vi.fn().mockResolvedValue('success');

      const result = await errorRecovery.handleOperation(
        operation,
        'Test operation'
      );

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalled();
    });

    it('should retry operation with exponential backoff', async () => {
      const operation = vi.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce('success');

      const result = await errorRecovery.handleOperation(
        operation,
        'Test operation',
        { maxRetries: 3 }
      );

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('should throw after max retries exceeded', async () => {
      const operation = vi.fn()
        .mockRejectedValue(new Error('Network error'));

      await expect(
        errorRecovery.handleOperation(
          operation,
          'Test operation',
          { maxRetries: 2 }
        )
      ).rejects.toThrow();

      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('should call onRetry callback during retries', async () => {
      const operation = vi.fn()
        .mockRejectedValueOnce(new Error('Error'))
        .mockResolvedValueOnce('success');
      const onRetry = vi.fn();

      await errorRecovery.handleOperation(
        operation,
        'Test',
        { maxRetries: 2, onRetry }
      );

      expect(onRetry).toHaveBeenCalled();
    });

    it('should capture error context on failure', async () => {
      const operation = vi.fn()
        .mockRejectedValue(new Error('Test error'));

      try {
        await errorRecovery.handleOperation(
          operation,
          'Test operation',
          { maxRetries: 1 }
        );
      } catch (error: any) {
        expect(error.userMessage).toBeDefined();
        expect(error.errorId).toBeDefined();
      }
    });

    it('should perform state rollback on failure if configured', async () => {
      const operation = vi.fn()
        .mockRejectedValue(new Error('Error'));
      const onRollback = vi.fn().mockResolvedValue(undefined);
      const previousState = { data: 'original' };

      try {
        await errorRecovery.handleOperation(
          operation,
          'Test',
          { maxRetries: 1, previousState, onRollback }
        );
      } catch (error: any) {
        expect(error.recovered).toBe(true);
      }

      expect(onRollback).toHaveBeenCalled();
    });

    it('should include attempt count in error', async () => {
      const operation = vi.fn()
        .mockRejectedValue(new Error('Error'));

      try {
        await errorRecovery.handleOperation(
          operation,
          'Test',
          { maxRetries: 3 }
        );
      } catch (error: any) {
        expect(error.context.attempts).toBeGreaterThan(0);
      }
    });
  });

  describe('safeExecute', () => {
    it('should execute function and return result on success', async () => {
      const fn = vi.fn().mockResolvedValue('success');
      const fallback = 'fallback';

      const result = await errorRecovery.safeExecute(fn, fallback);

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalled();
    });

    it('should return fallback value on error', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('Error'));
      const fallback = 'fallback';

      const result = await errorRecovery.safeExecute(fn, fallback);

      expect(result).toBe('fallback');
    });

    it('should call fallback function when it is a function', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('Error'));
      const fallback = vi.fn().mockReturnValue('computed fallback');

      const result = await errorRecovery.safeExecute(fn, fallback);

      expect(result).toBe('computed fallback');
      expect(fallback).toHaveBeenCalled();
    });

    it('should call onError callback on failure', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('Test error'));
      const onError = vi.fn();

      await errorRecovery.safeExecute(fn, 'fallback', { onError });

      expect(onError).toHaveBeenCalled();
    });

    it('should include action in context when provided', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('Error'));

      await errorRecovery.safeExecute(fn, 'fallback', {
        action: 'Test action'
      });

      const logs = errorRecovery.getErrorLogs();
      expect(logs.length).toBeGreaterThan(0);
    });
  });

  describe('getErrorLogs', () => {
    it('should return all logged errors', () => {
      const context: ErrorContext = { action: 'Test', timestamp: Date.now() };

      errorRecovery.logError(context, 'Error 1', 'low', false);
      errorRecovery.logError(context, 'Error 2', 'high', false);

      const logs = errorRecovery.getErrorLogs();

      expect(logs.length).toBe(2);
    });

    it('should return copy of logs array', () => {
      const context: ErrorContext = { action: 'Test', timestamp: Date.now() };
      errorRecovery.logError(context, 'Error', 'low', false);

      const logs1 = errorRecovery.getErrorLogs();
      const logs2 = errorRecovery.getErrorLogs();

      expect(logs1).not.toBe(logs2);
      expect(logs1).toEqual(logs2);
    });
  });

  describe('getErrorsForUser', () => {
    it('should return only errors for specific user', () => {
      const context1: ErrorContext = { action: 'Test', timestamp: Date.now(), userId: 'user1' };
      const context2: ErrorContext = { action: 'Test', timestamp: Date.now(), userId: 'user2' };

      errorRecovery.logError(context1, 'Error 1', 'low', false);
      errorRecovery.logError(context2, 'Error 2', 'low', false);
      errorRecovery.logError(context1, 'Error 3', 'low', false);

      const userLogs = errorRecovery.getErrorsForUser('user1');

      expect(userLogs.length).toBe(2);
      expect(userLogs.every(log => log.context.userId === 'user1')).toBe(true);
    });
  });

  describe('getCriticalErrors', () => {
    it('should return only critical and high severity errors', () => {
      const context: ErrorContext = { action: 'Test', timestamp: Date.now() };

      errorRecovery.logError(context, 'Low error', 'low', false);
      errorRecovery.logError(context, 'Medium error', 'medium', false);
      errorRecovery.logError(context, 'High error', 'high', false);
      errorRecovery.logError(context, 'Critical error', 'critical', false);

      const criticalErrors = errorRecovery.getCriticalErrors();

      expect(criticalErrors.length).toBe(2);
      expect(criticalErrors.every(log => log.severity === 'high' || log.severity === 'critical')).toBe(true);
    });
  });

  describe('clearErrorLogs', () => {
    it('should clear all error logs', () => {
      const context: ErrorContext = { action: 'Test', timestamp: Date.now() };

      errorRecovery.logError(context, 'Error 1', 'low', false);
      errorRecovery.logError(context, 'Error 2', 'low', false);

      expect(errorRecovery.getErrorLogs().length).toBe(2);

      errorRecovery.clearErrorLogs();

      expect(errorRecovery.getErrorLogs().length).toBe(0);
    });
  });

  describe('exportErrorLogs', () => {
    it('should export error logs for monitoring', () => {
      const context: ErrorContext = {
        action: 'Test',
        timestamp: Date.now(),
        stateSnapshot: { data: 'sensitive' }
      };

      errorRecovery.logError(context, 'Error', 'high', false);

      const exported = errorRecovery.exportErrorLogs();

      expect(exported.length).toBe(1);
      expect(exported[0].context.stateSnapshot).toBe('[REDACTED]');
    });
  });

  describe('withErrorRecovery', () => {
    it('should handle successful async operation', async () => {
      const operation = vi.fn().mockResolvedValue('success');

      const result = await withErrorRecovery(operation, 'Test operation');

      expect(result).toBe('success');
    });

    it('should handle failed operation with recovery', async () => {
      const operation = vi.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce('success');

      const result = await withErrorRecovery(operation, 'Test operation', {
        maxRetries: 2
      });

      expect(result).toBe('success');
    });

    it('should throw after retries exhausted', async () => {
      const operation = vi.fn()
        .mockRejectedValue(new Error('Persistent error'));

      await expect(
        withErrorRecovery(operation, 'Test operation', { maxRetries: 1 })
      ).rejects.toThrow();
    });

    it('should support userId option', async () => {
      const operation = vi.fn().mockResolvedValue('success');

      await withErrorRecovery(operation, 'Test operation', {
        userId: 'user123'
      });

      // Verify operation was called
      expect(operation).toHaveBeenCalled();
    });
  });

  describe('Error recovery integration scenarios', () => {
    it('should handle transaction save failure with rollback', async () => {
      const previousState = { transactions: [{ id: '1', value: 100 }] };
      const onRollback = vi.fn().mockResolvedValue(undefined);
      const saveFailed = vi.fn().mockRejectedValue(new Error('Network error'));

      try {
        await errorRecovery.handleOperation(
          saveFailed,
          'Save transactions',
          { maxRetries: 2, previousState, onRollback }
        );
      } catch (error: any) {
        expect(error.recovered).toBe(true);
        expect(onRollback).toHaveBeenCalledWith(previousState);
      }
    });

    it('should handle API rate limiting with appropriate message', async () => {
      const operation = vi.fn()
        .mockRejectedValue({ message: 'Rate limit', status: 429 });

      try {
        await errorRecovery.handleOperation(operation, 'API call', { maxRetries: 1 });
      } catch (error: any) {
        expect(error.userMessage).toContain('requisições');
        expect(error.context.errorType).toBe(ErrorType.RATE_LIMIT);
      }
    });

    it('should handle authentication failure without retry', async () => {
      const operation = vi.fn()
        .mockRejectedValue({ message: 'Unauthorized', status: 401 });

      try {
        await errorRecovery.handleOperation(operation, 'Auth request', { maxRetries: 3 });
      } catch (error: any) {
        // Should not retry auth errors - only called once
        expect(operation).toHaveBeenCalledTimes(1);
        expect(error.userMessage).toContain('Acesso negado');
      }
    });

    it('should provide error tracking for monitoring dashboard', () => {
      const context1: ErrorContext = { action: 'API Call', timestamp: Date.now(), userId: 'user1' };
      const context2: ErrorContext = { action: 'Save', timestamp: Date.now(), userId: 'user2' };

      errorRecovery.logError(context1, 'Network timeout', 'high', false);
      errorRecovery.logError(context2, 'Validation error', 'medium', false);

      const allLogs = errorRecovery.getErrorLogs();
      const criticalLogs = errorRecovery.getCriticalErrors();
      const user1Logs = errorRecovery.getErrorsForUser('user1');

      expect(allLogs.length).toBe(2);
      expect(criticalLogs.length).toBe(1);
      expect(user1Logs.length).toBe(1);
    });
  });
});
