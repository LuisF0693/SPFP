import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  createMockTransaction,
  createMockAccount,
  waitForAsync,
  generators,
} from './test-utils';
import {
  assertDefined,
  expectMoneyEqual,
  retryAssertion,
  measureTime,
  createDeferred,
  expectArrayContentEqual,
} from './test-helpers';

/**
 * Example Test Suite
 * Demonstrates testing patterns and best practices
 */

describe('Test Infrastructure Examples', () => {
  describe('Mock Data Generators', () => {
    it('should create mock transactions', () => {
      const tx = createMockTransaction();
      expect(tx.id).toBeDefined();
      expect(tx.value).toBeGreaterThan(0);
      expect(tx.type).toBe('EXPENSE');
    });

    it('should create mock accounts', () => {
      const acc = createMockAccount({ name: 'Savings' });
      expect(acc.name).toBe('Savings');
      expect(acc.balance).toBeGreaterThanOrEqual(0);
    });

    it('should override default values', () => {
      const tx = createMockTransaction({ value: 500, description: 'Custom' });
      expect(tx.value).toBe(500);
      expect(tx.description).toBe('Custom');
    });
  });

  describe('Random Data Generators', () => {
    it('should generate random IDs', () => {
      const id1 = generators.randomId();
      const id2 = generators.randomId();
      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
    });

    it('should generate valid emails', () => {
      const email = generators.randomEmail();
      expect(email).toMatch(/@example\.com$/);
    });

    it('should generate random amounts within range', () => {
      const amount = generators.randomAmount(100, 1000);
      expect(amount).toBeGreaterThanOrEqual(100);
      expect(amount).toBeLessThanOrEqual(1000);
    });

    it('should generate future dates', () => {
      const futureStr = generators.futureDate(30);
      const future = new Date(futureStr);
      const now = new Date();
      expect(future.getTime()).toBeGreaterThan(now.getTime());
    });
  });

  describe('Assertion Helpers', () => {
    it('should assert defined values', () => {
      const value = 'test';
      const result = assertDefined(value);
      expect(result).toBe('test');
    });

    it('should throw on undefined values', () => {
      expect(() => assertDefined(undefined)).toThrow();
    });

    it('should compare money with tolerance', () => {
      expect(() => expectMoneyEqual(100.01, 100, 0.1)).not.toThrow();
      expect(() => expectMoneyEqual(100.5, 100, 0.1)).toThrow();
    });

    it('should compare arrays regardless of order', () => {
      expect(() => expectArrayContentEqual([1, 2, 3], [3, 1, 2])).not.toThrow();
      expect(() => expectArrayContentEqual([1, 2], [1, 2, 3])).toThrow();
    });
  });

  describe('Async Helpers', () => {
    it('should wait for async operations', async () => {
      const before = Date.now();
      await waitForAsync(100);
      const after = Date.now();
      expect(after - before).toBeGreaterThanOrEqual(100);
    });

    it('should measure execution time', async () => {
      const { result, duration } = await measureTime(async () => {
        await waitForAsync(50);
        return 'done';
      });

      expect(result).toBe('done');
      expect(duration).toBeGreaterThanOrEqual(50);
    });

    it('should retry assertions', async () => {
      let attempts = 0;
      await retryAssertion(() => {
        attempts++;
        expect(attempts).toBeGreaterThan(0);
      });
      expect(attempts).toBe(1);
    });

    it('should create deferred promises', async () => {
      const deferred = createDeferred<string>();
      setTimeout(() => deferred.resolve('resolved'), 50);
      const result = await deferred.promise;
      expect(result).toBe('resolved');
    });
  });

  describe('Error Handling', () => {
    it('should handle assertion errors gracefully', () => {
      expect(() => {
        expect(1).toBe(2);
      }).toThrow();
    });

    it('should provide helpful error messages', () => {
      const error = expect(() => {
        throw new Error('Test error');
      }).toThrow();
    });
  });

  describe('Timing and Performance', () => {
    it('should complete synchronous operations quickly', () => {
      const start = performance.now();
      for (let i = 0; i < 1000; i++) {
        createMockTransaction();
      }
      const duration = performance.now() - start;
      expect(duration).toBeLessThan(1000); // Should take less than 1 second
    });
  });

  describe('State Management', () => {
    let testState: Record<string, unknown> = {};

    beforeEach(() => {
      testState = { counter: 0, items: [] };
    });

    afterEach(() => {
      testState = {};
    });

    it('should maintain state between operations', () => {
      testState.counter = (testState.counter as number) + 1;
      testState.items = [1, 2, 3];

      expect(testState.counter).toBe(1);
      expect(testState.items).toEqual([1, 2, 3]);
    });

    it('should reset state in each test', () => {
      expect(testState.counter).toBe(0);
      expect(testState.items).toEqual([]);
    });
  });
});
