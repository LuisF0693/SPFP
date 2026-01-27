"use strict";
export var ErrorType = /* @__PURE__ */ ((ErrorType2) => {
  ErrorType2["NETWORK"] = "NETWORK";
  ErrorType2["TIMEOUT"] = "TIMEOUT";
  ErrorType2["RATE_LIMIT"] = "RATE_LIMIT";
  ErrorType2["NOT_FOUND"] = "NOT_FOUND";
  ErrorType2["UNAUTHORIZED"] = "UNAUTHORIZED";
  ErrorType2["VALIDATION"] = "VALIDATION";
  ErrorType2["UNKNOWN"] = "UNKNOWN";
  return ErrorType2;
})(ErrorType || {});
export function detectErrorType(error) {
  if (!error) return "UNKNOWN" /* UNKNOWN */;
  const message = error.message?.toLowerCase() || "";
  const code = error.code || "";
  const status = error.status || error.statusCode || 0;
  if (message.includes("network") || message.includes("failed to fetch") || code === "ECONNREFUSED") {
    return "NETWORK" /* NETWORK */;
  }
  if (message.includes("timeout") || message.includes("timed out") || code === "ETIMEDOUT") {
    return "TIMEOUT" /* TIMEOUT */;
  }
  if (status === 429 || message.includes("rate limit")) {
    return "RATE_LIMIT" /* RATE_LIMIT */;
  }
  if (status === 404 || message.includes("404") || code === "ERR_MODULE_NOT_FOUND") {
    return "NOT_FOUND" /* NOT_FOUND */;
  }
  if (status === 401 || status === 403 || message.includes("unauthorized") || message.includes("forbidden")) {
    return "UNAUTHORIZED" /* UNAUTHORIZED */;
  }
  if (status === 400 || message.includes("validation")) {
    return "VALIDATION" /* VALIDATION */;
  }
  return "UNKNOWN" /* UNKNOWN */;
}
export function isRetryable(error) {
  const errorType = detectErrorType(error);
  return [
    "NETWORK" /* NETWORK */,
    "TIMEOUT" /* TIMEOUT */,
    "RATE_LIMIT" /* RATE_LIMIT */
  ].includes(errorType);
}
export function calculateBackoffDelay(attempt, config) {
  const initialDelay = config.initialDelayMs || 1e3;
  const maxDelay = config.maxDelayMs || 1e4;
  const multiplier = config.backoffMultiplier || 2;
  const jitterFactor = config.jitterFactor || 0.1;
  let delay = initialDelay * Math.pow(multiplier, attempt - 1);
  delay = Math.min(delay, maxDelay);
  const jitter = delay * jitterFactor * (Math.random() * 2 - 1);
  delay = Math.max(100, delay + jitter);
  return Math.round(delay);
}
export function createTimeoutPromise(ms) {
  return new Promise((_, reject) => {
    setTimeout(
      () => reject(new Error(`Operation timed out after ${ms}ms`)),
      ms
    );
  });
}
export async function retryWithBackoff(operation, config = {}) {
  const maxRetries = config.maxRetries ?? 3;
  const timeoutMs = config.timeoutMs ?? 5e3;
  const operationName = config.operationName || "API Operation";
  let lastError;
  const startTime = Date.now();
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await Promise.race([
        operation(),
        createTimeoutPromise(timeoutMs)
      ]);
      if (attempt > 1) {
        console.log(
          `[RETRY SUCCESS] ${operationName} succeeded on attempt ${attempt}/${maxRetries}`,
          { totalTimeMs: Date.now() - startTime }
        );
      }
      return result;
    } catch (error) {
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
      if (!retryable) {
        const retryError = new Error(
          `[${errorType}] ${error.message || "Unknown error"}`
        );
        retryError.code = errorType;
        retryError.isRetryable = false;
        retryError.originalError = error;
        retryError.attempts = attempt;
        retryError.lastAttemptTime = Date.now();
        throw retryError;
      }
      if (attempt === maxRetries) {
        const retryError = new Error(
          `${operationName} failed after ${maxRetries} attempts: ${error.message}`
        );
        retryError.code = errorType;
        retryError.isRetryable = true;
        retryError.originalError = error;
        retryError.attempts = attempt;
        retryError.lastAttemptTime = Date.now();
        throw retryError;
      }
      const nextDelayMs = calculateBackoffDelay(attempt, config);
      console.warn(
        `[BACKOFF] Retrying ${operationName} in ${nextDelayMs}ms...`,
        { attempt, nextDelay: nextDelayMs }
      );
      if (config.onRetry) {
        config.onRetry(attempt, error, nextDelayMs);
      }
      await new Promise((resolve) => setTimeout(resolve, nextDelayMs));
    }
  }
  throw lastError;
}
export function getErrorMessage(error) {
  if (error instanceof Error && "code" in error) {
    const retryError = error;
    switch (retryError.code) {
      case "NETWORK" /* NETWORK */:
        return "Erro de conex\xE3o. Por favor, verifique sua internet e tente novamente.";
      case "TIMEOUT" /* TIMEOUT */:
        return "Opera\xE7\xE3o demorou muito tempo. Por favor, tente novamente.";
      case "RATE_LIMIT" /* RATE_LIMIT */:
        return "Muitas requisi\xE7\xF5es. Por favor, aguarde alguns momentos e tente novamente.";
      case "NOT_FOUND" /* NOT_FOUND */:
        return "Recurso n\xE3o encontrado. Verifique se os dados est\xE3o corretos.";
      case "UNAUTHORIZED" /* UNAUTHORIZED */:
        return "Acesso negado. Por favor, verifique suas credenciais.";
      case "VALIDATION" /* VALIDATION */:
        return `Dados inv\xE1lidos: ${error.message}`;
      default:
        return error.message || "Erro desconhecido. Tente novamente.";
    }
  }
  return error?.message || "Erro desconhecido. Tente novamente.";
}
export async function fetchWithRetry(url, options = {}) {
  const { retryConfig, ...fetchOptions } = options;
  return retryWithBackoff(
    () => fetch(url, fetchOptions),
    {
      ...retryConfig,
      operationName: `Fetch ${url}`
    }
  );
}
export function logDetailedError(context, error, metadata) {
  const errorType = detectErrorType(error);
  const timestamp = (/* @__PURE__ */ new Date()).toISOString();
  console.error(`[${timestamp}] ERROR: ${context}`, {
    errorType,
    message: error.message,
    code: error.code,
    status: error.status,
    stack: error.stack,
    ...metadata
  });
}
