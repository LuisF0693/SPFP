/**
 * Unified Error Recovery Service
 * Implements centralized error handling, logging, state rollback, and user messaging
 *
 * Features:
 * - Error context capture (user, action, timestamp, state snapshot)
 * - User-friendly error messages in Portuguese
 * - State rollback for failed operations
 * - Integration with retry service
 * - Sentry-ready error logging
 * - Error classification (transient, critical, user error)
 */

import { retryWithBackoff, RetryConfig, getErrorMessage, detectErrorType, ErrorType } from './retryService';

export interface ErrorContext {
  userId?: string;
  action: string;
  timestamp: number;
  errorType?: ErrorType;
  originalError?: any;
  attempts?: number;
  stateSnapshot?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface ErrorRecoveryOptions {
  shouldRetry?: boolean;
  maxRetries?: number;
  onRetry?: (attempt: number, error: any) => void;
  rollbackState?: any;
  onRollback?: (previousState: any) => void;
}

export interface ErrorLog {
  id: string;
  context: ErrorContext;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recovered: boolean;
  timestamp: number;
}

/**
 * Error recovery service with centralized error handling
 */
export const errorRecovery = {
  /**
   * Error logs storage (in-memory, can be synced to backend)
   */
  logs: [] as ErrorLog[],

  /**
   * Captures detailed error context for logging and debugging
   */
  captureContext: (error: any, action: string, options?: {
    userId?: string;
    stateSnapshot?: Record<string, any>;
    metadata?: Record<string, any>;
  }): ErrorContext => {
    const errorType = detectErrorType(error);
    const context: ErrorContext = {
      userId: options?.userId,
      action,
      timestamp: Date.now(),
      errorType,
      originalError: error,
      stateSnapshot: options?.stateSnapshot,
      metadata: options?.metadata
    };

    // Log to console with context
    console.error(`[ERROR RECOVERY] ${action}`, {
      context,
      message: error.message,
      stack: error.stack
    });

    return context;
  },

  /**
   * Logs error with severity level
   */
  logError: (context: ErrorContext, message: string, severity: 'low' | 'medium' | 'high' | 'critical' = 'medium', recovered = false): ErrorLog => {
    const log: ErrorLog = {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      context,
      message,
      severity,
      recovered,
      timestamp: Date.now()
    };

    errorRecovery.logs.push(log);

    // Keep only last 100 errors
    if (errorRecovery.logs.length > 100) {
      errorRecovery.logs = errorRecovery.logs.slice(-100);
    }

    // Log to backend monitoring (Sentry-ready)
    if (severity === 'critical' || severity === 'high') {
      console.error(`[${severity.toUpperCase()}] ${message}`, {
        errorId: log.id,
        context,
        recovered
      });
    }

    return log;
  },

  /**
   * Converts technical error to user-friendly message in Portuguese
   */
  getUserMessage: (error: any, action?: string): string => {
    const errorType = detectErrorType(error);
    let userMessage = '';

    switch (errorType) {
      case ErrorType.NETWORK:
        userMessage = 'Erro de conexão. Por favor, verifique sua internet e tente novamente.';
        break;
      case ErrorType.TIMEOUT:
        userMessage = 'A operação demorou muito tempo. Por favor, tente novamente.';
        break;
      case ErrorType.RATE_LIMIT:
        userMessage = 'Muitas requisições. Por favor, aguarde alguns momentos e tente novamente.';
        break;
      case ErrorType.NOT_FOUND:
        userMessage = 'Recurso não encontrado. Verifique se os dados estão corretos.';
        break;
      case ErrorType.UNAUTHORIZED:
        userMessage = 'Acesso negado. Por favor, faça login novamente.';
        break;
      case ErrorType.VALIDATION:
        userMessage = `Dados inválidos. ${error.message}`;
        break;
      default:
        userMessage = error.message || 'Erro desconhecido. Por favor, tente novamente.';
    }

    if (action) {
      userMessage = `Erro ao ${action}: ${userMessage}`;
    }

    return userMessage;
  },

  /**
   * Rolls back state to previous version after failed operation
   */
  rollbackState: async <T>(previousState: T, onRollback?: (state: T) => Promise<void>): Promise<void> => {
    try {
      if (onRollback) {
        await onRollback(previousState);
      }
      console.log('[STATE ROLLBACK] State restored successfully', previousState);
    } catch (error: any) {
      console.error('[STATE ROLLBACK] Failed to restore state', error);
      throw new Error(`State rollback failed: ${error.message}`);
    }
  },

  /**
   * Handles async operation with error recovery (retry, rollback, logging)
   */
  handleOperation: async <T>(
    operation: () => Promise<T>,
    action: string,
    options?: {
      userId?: string;
      maxRetries?: number;
      onRetry?: (attempt: number) => void;
      shouldRetry?: (error: any) => boolean;
      previousState?: any;
      onRollback?: (state: any) => Promise<void>;
      metadata?: Record<string, any>;
      stateSnapshot?: Record<string, any>;
    }
  ): Promise<T> => {
    let lastError: any;
    let attempts = 0;

    try {
      // Retry logic with exponential backoff
      if (options?.maxRetries ?? true) {
        const maxRetries = options?.maxRetries ?? 3;

        const result = await retryWithBackoff(
          async () => {
            attempts++;
            try {
              return await operation();
            } catch (error: any) {
              lastError = error;
              if (options?.onRetry) {
                options.onRetry(attempts);
              }
              throw error;
            }
          },
          {
            maxRetries,
            operationName: action,
            onRetry: (attempt, error) => {
              if (options?.onRetry) {
                options.onRetry(attempt);
              }
            }
          }
        );

        return result;
      } else {
        // No retry, just execute
        return await operation();
      }
    } catch (error: any) {
      // Capture context
      const context = errorRecovery.captureContext(error, action, {
        userId: options?.userId,
        stateSnapshot: options?.stateSnapshot,
        metadata: options?.metadata
      });

      // Determine severity
      const errorType = detectErrorType(error);
      const isTransient = [ErrorType.NETWORK, ErrorType.TIMEOUT, ErrorType.RATE_LIMIT].includes(errorType);
      const severity: 'low' | 'medium' | 'high' | 'critical' =
        errorType === ErrorType.UNAUTHORIZED ? 'high' :
        errorType === ErrorType.VALIDATION ? 'low' :
        'medium';

      // Log error
      const errorLog = errorRecovery.logError(
        { ...context, attempts },
        errorRecovery.getUserMessage(error, action),
        severity,
        false
      );

      // Attempt rollback if state provided
      if (options?.previousState !== undefined && options?.onRollback) {
        try {
          await errorRecovery.rollbackState(options.previousState, options.onRollback);
          errorLog.recovered = true;
        } catch (rollbackError: any) {
          console.error('[ERROR RECOVERY] Rollback failed', rollbackError);
          errorLog.severity = 'critical';
        }
      }

      throw {
        ...error,
        userMessage: errorRecovery.getUserMessage(error, action),
        errorId: errorLog.id,
        context,
        isTransient,
        recovered: errorLog.recovered
      };
    }
  },

  /**
   * Safely executes a function with automatic error recovery
   */
  safeExecute: async <T>(
    fn: () => Promise<T>,
    fallback: T | (() => T),
    options?: {
      userId?: string;
      action?: string;
      onError?: (error: any) => void;
    }
  ): Promise<T> => {
    try {
      return await fn();
    } catch (error: any) {
      if (options?.action) {
        errorRecovery.captureContext(error, options.action, {
          userId: options?.userId
        });
      }

      if (options?.onError) {
        options.onError(error);
      }

      // Return fallback value
      return typeof fallback === 'function' ? (fallback as () => T)() : fallback;
    }
  },

  /**
   * Gets all logged errors
   */
  getErrorLogs: (): ErrorLog[] => {
    return [...errorRecovery.logs];
  },

  /**
   * Gets errors for a specific user
   */
  getErrorsForUser: (userId: string): ErrorLog[] => {
    return errorRecovery.logs.filter(log => log.context.userId === userId);
  },

  /**
   * Gets critical errors
   */
  getCriticalErrors: (): ErrorLog[] => {
    return errorRecovery.logs.filter(log => log.severity === 'critical' || log.severity === 'high');
  },

  /**
   * Clears error logs
   */
  clearErrorLogs: (): void => {
    errorRecovery.logs = [];
  },

  /**
   * Exports error logs for analysis (Sentry integration point)
   */
  exportErrorLogs: (): ErrorLog[] => {
    return errorRecovery.logs.map(log => ({
      ...log,
      context: {
        ...log.context,
        // Don't export full state snapshot to minimize data
        stateSnapshot: log.context.stateSnapshot ? '[REDACTED]' : undefined
      }
    }));
  }
};

/**
 * Hook-like function for using error recovery in async operations
 * Usage: await withErrorRecovery(() => myAsyncFn(), 'Loading data')
 */
export async function withErrorRecovery<T>(
  operation: () => Promise<T>,
  action: string,
  options?: ErrorRecoveryOptions & { userId?: string }
): Promise<T> {
  return errorRecovery.handleOperation(operation, action, {
    maxRetries: options?.maxRetries ?? 3,
    userId: options?.userId,
    onRetry: options?.onRetry,
    previousState: options?.rollbackState,
    onRollback: options?.onRollback
  });
}

export default errorRecovery;
