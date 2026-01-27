/**
 * Test Helpers
 * Utilities for common test scenarios and assertions
 */

/**
 * Assert that a value is defined
 */
export const assertDefined = <T,>(value: T | undefined | null): T => {
  if (value === undefined || value === null) {
    throw new Error('Expected value to be defined');
  }
  return value;
};

/**
 * Compare two amounts with tolerance for floating point errors
 */
export const expectMoneyEqual = (actual: number, expected: number, tolerance = 0.01) => {
  if (Math.abs(actual - expected) > tolerance) {
    throw new Error(`Expected ${actual} to be approximately ${expected} (tolerance: ${tolerance})`);
  }
};

/**
 * Format test message with context
 */
export const createTestMessage = (message: string, context?: Record<string, unknown>) => {
  if (!context || Object.keys(context).length === 0) {
    return message;
  }
  return `${message}\nContext: ${JSON.stringify(context, null, 2)}`;
};

/**
 * Mock localStorage for tests
 */
export class MockLocalStorage {
  private store: Record<string, string> = {};

  getItem(key: string): string | null {
    return this.store[key] || null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  clear(): void {
    this.store = {};
  }

  key(index: number): string | null {
    return Object.keys(this.store)[index] || null;
  }

  get length(): number {
    return Object.keys(this.store).length;
  }
}

/**
 * Create and install mock localStorage
 */
export function installMockLocalStorage() {
  const mockStorage = new MockLocalStorage();
  Object.defineProperty(window, 'localStorage', {
    value: mockStorage,
    writable: true,
  });
  return mockStorage;
}

/**
 * Retry a test assertion with exponential backoff
 */
export async function retryAssertion(
  fn: () => void | Promise<void>,
  maxAttempts = 3,
  delayMs = 100
): Promise<void> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      await fn();
      return;
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxAttempts - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs * Math.pow(2, attempt)));
      }
    }
  }

  throw lastError || new Error('Assertion failed');
}

/**
 * Measure execution time of an async function
 */
export async function measureTime<T>(fn: () => Promise<T>): Promise<{ result: T; duration: number }> {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;
  return { result, duration };
}

/**
 * Assert performance (execution time below threshold)
 */
export async function expectPerformance<T>(
  fn: () => Promise<T>,
  maxDurationMs: number
): Promise<T> {
  const { result, duration } = await measureTime(fn);

  if (duration > maxDurationMs) {
    throw new Error(
      `Expected function to complete in ${maxDurationMs}ms but took ${duration.toFixed(2)}ms`
    );
  }

  return result;
}

/**
 * Create a deferred Promise for test coordination
 */
export function createDeferred<T>(): {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason: unknown) => void;
} {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

/**
 * Assert array equality regardless of order
 */
export const expectArrayContentEqual = <T,>(actual: T[], expected: T[]) => {
  if (actual.length !== expected.length) {
    throw new Error(`Array lengths differ: ${actual.length} vs ${expected.length}`);
  }

  const sortedActual = [...actual].sort();
  const sortedExpected = [...expected].sort();

  if (JSON.stringify(sortedActual) !== JSON.stringify(sortedExpected)) {
    throw new Error(
      `Array content mismatch.\nActual: ${JSON.stringify(sortedActual)}\nExpected: ${JSON.stringify(sortedExpected)}`
    );
  }
};

/**
 * Create a snapshot matcher for visual regression testing
 */
export function createSnapshotMatcher() {
  const snapshots = new Map<string, string>();

  return {
    save: (name: string, value: string) => {
      snapshots.set(name, value);
    },
    match: (name: string, value: string) => {
      const snapshot = snapshots.get(name);
      if (!snapshot) {
        throw new Error(`No snapshot found for "${name}"`);
      }
      if (snapshot !== value) {
        throw new Error(`Snapshot mismatch for "${name}"\nExpected:\n${snapshot}\n\nActual:\n${value}`);
      }
    },
    getAll: () => snapshots,
  };
}
