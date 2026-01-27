/**
 * Unified Retry and Error Recovery Service
 * Implements exponential backoff strategy with configurable retry logic for API calls
 *
 * Features:
 * - Exponential backoff with jitter
 * - Max 3 retries per operation
 * - Timeout handling (5s default)
 * - Detailed error logging with context
 * - User-friendly error messages
 * - Specific error type detection (network, timeout, rate limit, etc.)
 */

export interface RetryConfig {
  maxRetries?: number; // Default: 3
  initialDelayMs?: number; // Default: 1000ms
  maxDelayMs?: number; // Default: 10000ms
  timeoutMs?: number; // Default: 5000ms
  backoffMultiplier?: number; // Default: 2 (exponential)
  jitterFactor?: number; // Default: 0.1 (10% jitter)
  onRetry?: (attempt: number, error: any, nextDelayMs: number) => void;
  operationName?: string; // For logging context
}

export interface RetryError extends Error {
  code: string;
  isRetryable: boolean;
  originalError: any;
  attempts: number;
  lastAttemptTime: number;
}

export enum ErrorType {
  NETWORK = 'NETWORK',
  TIMEOUT = 'TIMEOUT',
  RATE_LIMIT = 'RATE_LIMIT',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  VALIDATION = 'VALIDATION',
  UNKNOWN = 'UNKNOWN'
}

/**
 * Detects the type of error to determine if it's retryable
 */
export function detectErrorType(error: any): ErrorType {
  if (!error) return ErrorType.UNKNOWN;

  const message = error.message?.toLowerCase() || '';
  const code = error.code || '';
  const status = error.status || error.statusCode || 0;

  // Network errors
  if (message.includes('network') || message.includes('failed to fetch') || code === 'ECONNREFUSED') {
    return ErrorType.NETWORK;
  }

  // Timeout errors
  if (message.includes('timeout') || message.includes('timed out') || code === 'ETIMEDOUT') {
    return ErrorType.TIMEOUT;
  }

  // Rate limit errors
  if (status === 429 || message.includes('rate limit')) {
    return ErrorType.RATE_LIMIT;
  }

  // Not found errors
  if (status === 404 || message.includes('404') || code === 'ERR_MODULE_NOT_FOUND') {
    return ErrorType.NOT_FOUND;
  }

  // Unauthorized errors
  if (status === 401 || status === 403 || message.includes('unauthorized') || message.includes('forbidden')) {
    return ErrorType.UNAUTHORIZED;
  }

  // Validation errors
  if (status === 400 || message.includes('validation')) {
    return ErrorType.VALIDATION;
  }

  return ErrorType.UNKNOWN;
}

/**
 * Determines if an error is retryable based on its type
 */
export function isRetryable(error: any): boolean {
  const errorType = detectErrorType(error);

  // Only retry on transient errors
  return [
    ErrorType.NETWORK,
    ErrorType.TIMEOUT,
    ErrorType.RATE_LIMIT
  ].includes(errorType);
}

/**
 * Calculates exponential backoff delay with jitter
 */
export function calculateBackoffDelay(
  attempt: number,
  config: RetryConfig
): number {
  const initialDelay = config.initialDelayMs || 1000;
  const maxDelay = config.maxDelayMs || 10000;
  const multiplier = config.backoffMultiplier || 2;
  const jitterFactor = config.jitterFactor || 0.1;

  // Exponential backoff: 1s, 2s, 4s, 8s...
  let delay = initialDelay * Math.pow(multiplier, attempt - 1);

  // Cap at maxDelay
  delay = Math.min(delay, maxDelay);

  // Add jitter (10% variation)
  const jitter = delay * jitterFactor * (Math.random() * 2 - 1);
  delay = Math.max(100, delay + jitter); // Ensure delay is at least 100ms

  return Math.round(delay);
}

/**
 * Creates a timeout promise that rejects after specified milliseconds
 */
export function createTimeoutPromise<T>(ms: number): Promise<T> {
  return new Promise((_, reject) => {
    setTimeout(
      () => reject(new Error(`Operation timed out after ${ms}ms`)),
      ms
    );
  });
}

/**
 * Retries an async operation with exponential backoff
 *
 * @param operation - Async function to retry
 * @param config - Retry configuration
 * @returns Promise that resolves to the operation result or rejects with RetryError
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  const maxRetries = config.maxRetries ?? 3;
  const timeoutMs = config.timeoutMs ?? 5000;
  const operationName = config.operationName || 'API Operation';

  let lastError: any;
  const startTime = Date.now();

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Create a race between the operation and a timeout
      const result = await Promise.race([
        operation(),
        createTimeoutPromise<T>(timeoutMs)
      ]);

      // Log successful retry after initial failure
      if (attempt > 1) {
        console.log(
          `[RETRY SUCCESS] ${operationName} succeeded on attempt ${attempt}/${maxRetries}`,
          { totalTimeMs: Date.now() - startTime }
        );
      }

      return result;
    } catch (error: any) {
      lastError = error;
      const errorType = detectErrorType(error);
      const retryable = isRetryable(error);

      console.error(
        `[ATTEMPT ${attempt}/${maxRetries}] ${operationName} failed`,
        {
          errorType,
          isRetryable: retryable,
          message: error.message,
          status: error.status || error.statusCode,
          code: error.code
        }
      );

      // Don't retry if error is not retryable (validation, auth, not found, etc.)
      if (!retryable) {
        const retryError: RetryError = new Error(
          `[${errorType}] ${error.message || 'Unknown error'}`
        ) as RetryError;

        retryError.code = errorType;
        retryError.isRetryable = false;
        retryError.originalError = error;
        retryError.attempts = attempt;
        retryError.lastAttemptTime = Date.now();

        throw retryError;
      }

      // If this was the last attempt, throw with context
      if (attempt === maxRetries) {
        const retryError: RetryError = new Error(
          `${operationName} failed after ${maxRetries} attempts: ${error.message}`
        ) as RetryError;

        retryError.code = errorType;
        retryError.isRetryable = true;
        retryError.originalError = error;
        retryError.attempts = attempt;
        retryError.lastAttemptTime = Date.now();

        throw retryError;
      }

      // Calculate backoff delay for next attempt
      const nextDelayMs = calculateBackoffDelay(attempt, config);

      console.warn(
        `[BACKOFF] Retrying ${operationName} in ${nextDelayMs}ms...`,
        { attempt, nextDelay: nextDelayMs }
      );

      // Call onRetry callback if provided
      if (config.onRetry) {
        config.onRetry(attempt, error, nextDelayMs);
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, nextDelayMs));
    }
  }

  // Fallback (should not reach here)
  throw lastError;
}

/**
 * Converts a RetryError to a user-friendly message
 */
export function getErrorMessage(error: any): string {
  if (error instanceof Error && 'code' in error) {
    const retryError = error as RetryError;

    switch (retryError.code) {
      case ErrorType.NETWORK:
        return 'Erro de conexão. Por favor, verifique sua internet e tente novamente.';
      case ErrorType.TIMEOUT:
        return 'Operação demorou muito tempo. Por favor, tente novamente.';
      case ErrorType.RATE_LIMIT:
        return 'Muitas requisições. Por favor, aguarde alguns momentos e tente novamente.';
      case ErrorType.NOT_FOUND:
        return 'Recurso não encontrado. Verifique se os dados estão corretos.';
      case ErrorType.UNAUTHORIZED:
        return 'Acesso negado. Por favor, verifique suas credenciais.';
      case ErrorType.VALIDATION:
        return `Dados inválidos: ${error.message}`;
      default:
        return error.message || 'Erro desconhecido. Tente novamente.';
    }
  }

  return error?.message || 'Erro desconhecido. Tente novamente.';
}

/**
 * Wraps a fetch call with retry logic
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit & { retryConfig?: RetryConfig } = {}
): Promise<Response> {
  const { retryConfig, ...fetchOptions } = options;

  return retryWithBackoff(
    () => fetch(url, fetchOptions),
    {
      ...retryConfig,
      operationName: `Fetch ${url}`
    }
  );
}

/**
 * Logs detailed error information for debugging
 */
export function logDetailedError(
  context: string,
  error: any,
  metadata?: Record<string, any>
): void {
  const errorType = detectErrorType(error);
  const timestamp = new Date().toISOString();

  console.error(`[${timestamp}] ERROR: ${context}`, {
    errorType,
    message: error.message,
    code: error.code,
    status: error.status,
    stack: error.stack,
    ...metadata
  });
}
