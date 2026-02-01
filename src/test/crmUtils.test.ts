import { describe, it, expect, beforeEach } from 'vitest';
import { calculateHealthScore, ClientEntry } from '../utils/crmUtils';

/**
 * CRM UTILITIES TEST SUITE
 * Tests health scoring and client engagement analysis
 */
describe('calculateHealthScore', () => {
  let mockClient: ClientEntry;

  beforeEach(() => {
    mockClient = {
      user_id: 'test-user-123',
      content: {},
      last_updated: Date.now(),
    };
  });

  describe('Base Score Calculation', () => {
    it('should return 100 for recently updated client with no data', () => {
      const score = calculateHealthScore(mockClient);
      expect(score).toBe(100);
    });

    it('should apply -15 penalty for 8 days of inactivity', () => {
      const eightDaysAgo = Date.now() - 8 * 24 * 60 * 60 * 1000;
      const score = calculateHealthScore({ ...mockClient, last_updated: eightDaysAgo });
      expect(score).toBe(85);
    });

    it('should apply -30 penalty for 16 days of inactivity', () => {
      const sixteenDaysAgo = Date.now() - 16 * 24 * 60 * 60 * 1000;
      const score = calculateHealthScore({ ...mockClient, last_updated: sixteenDaysAgo });
      expect(score).toBe(70);
    });

    it('should apply -60 penalty for 31 days of inactivity', () => {
      const thirtyOneDaysAgo = Date.now() - 31 * 24 * 60 * 60 * 1000;
      const score = calculateHealthScore({ ...mockClient, last_updated: thirtyOneDaysAgo });
      expect(score).toBe(40);
    });

    it('should not exceed 100', () => {
      const score = calculateHealthScore(mockClient);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should not go below 0', () => {
      const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;
      const score = calculateHealthScore({ ...mockClient, last_updated: ninetyDaysAgo });
      expect(score).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Data Completeness Bonuses', () => {
    it('should add +5 bonus for having accounts', () => {
      const scoreWithoutAccounts = calculateHealthScore(mockClient);
      const scoreWithAccounts = calculateHealthScore({
        ...mockClient,
        content: { accounts: [{ id: 'acc-1', name: 'Test Account' }] },
      });
      expect(scoreWithAccounts).toBe(scoreWithoutAccounts + 5);
    });

    it('should add +5 bonus for having 50+ transactions', () => {
      const scoreWithoutTransactions = calculateHealthScore(mockClient);
      const transactions = Array.from({ length: 50 }, (_, i) => ({
        id: `tx-${i}`,
        amount: 100,
      }));
      const scoreWithTransactions = calculateHealthScore({
        ...mockClient,
        content: { transactions },
      });
      expect(scoreWithTransactions).toBe(scoreWithoutTransactions + 5);
    });

    it('should not add bonus for less than 50 transactions', () => {
      const scoreWithFewTransactions = calculateHealthScore({
        ...mockClient,
        content: { transactions: Array.from({ length: 49 }) },
      });
      const scoreWithoutTransactions = calculateHealthScore(mockClient);
      expect(scoreWithFewTransactions).toBe(scoreWithoutTransactions);
    });

    it('should add +5 bonus for having goals', () => {
      const scoreWithoutGoals = calculateHealthScore(mockClient);
      const scoreWithGoals = calculateHealthScore({
        ...mockClient,
        content: { goals: [{ id: 'goal-1', name: 'Test Goal' }] },
      });
      expect(scoreWithGoals).toBe(scoreWithoutGoals + 5);
    });

    it('should combine all bonuses', () => {
      const scoreBase = calculateHealthScore(mockClient);
      const scoreWithAllData = calculateHealthScore({
        ...mockClient,
        content: {
          accounts: [{ id: 'acc-1' }],
          transactions: Array.from({ length: 50 }),
          goals: [{ id: 'goal-1' }],
        },
      });
      expect(scoreWithAllData).toBe(scoreBase + 15);
    });

    it('should cap combined score at 100', () => {
      const score = calculateHealthScore({
        ...mockClient,
        content: {
          accounts: [{ id: 'acc-1' }],
          transactions: Array.from({ length: 50 }),
          goals: [{ id: 'goal-1' }],
        },
      });
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  describe('Penalty and Bonus Combination', () => {
    it('should apply inactivity penalty before bonuses', () => {
      const fifteenDaysAgo = Date.now() - 15 * 24 * 60 * 60 * 1000;
      const score = calculateHealthScore({
        ...mockClient,
        last_updated: fifteenDaysAgo,
        content: {
          accounts: [{ id: 'acc-1' }],
        },
      });
      // 100 - 30 (15 days penalty) + 5 (account bonus) = 75
      expect(score).toBe(75);
    });

    it('should apply all penalties and bonuses together', () => {
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      const score = calculateHealthScore({
        ...mockClient,
        last_updated: thirtyDaysAgo,
        content: {
          accounts: [{ id: 'acc-1' }],
          transactions: Array.from({ length: 100 }),
          goals: [{ id: 'goal-1' }],
        },
      });
      // 100 - 60 (inactivity) + 5 + 5 + 5 (bonuses) = 55
      expect(score).toBe(55);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty content object', () => {
      const score = calculateHealthScore({
        ...mockClient,
        content: {},
      });
      expect(score).toBe(100);
    });

    it('should handle null content gracefully', () => {
      const clientWithNullContent = {
        ...mockClient,
        content: null as Record<string, unknown>,
      };
      const score = calculateHealthScore(clientWithNullContent);
      expect(score).toBe(100);
    });

    it('should handle non-array accounts field', () => {
      const score = calculateHealthScore({
        ...mockClient,
        content: { accounts: 'not-an-array' as unknown as never },
      });
      expect(score).toBe(100);
    });

    it('should handle non-array transactions field', () => {
      const score = calculateHealthScore({
        ...mockClient,
        content: { transactions: 'not-an-array' as unknown as never },
      });
      expect(score).toBe(100);
    });

    it('should handle non-array goals field', () => {
      const score = calculateHealthScore({
        ...mockClient,
        content: { goals: 'not-an-array' as unknown as never },
      });
      expect(score).toBe(100);
    });

    it('should handle exactly 7 days of inactivity boundary', () => {
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const score = calculateHealthScore({ ...mockClient, last_updated: sevenDaysAgo });
      // Should still be 100 (just at boundary, no penalty yet)
      expect(score).toBe(100);
    });

    it('should handle exactly 15 days of inactivity boundary', () => {
      const fifteenDaysAgo = Date.now() - 15 * 24 * 60 * 60 * 1000;
      const score = calculateHealthScore({ ...mockClient, last_updated: fifteenDaysAgo });
      // Should be 70 (30 penalty applied)
      expect(score).toBe(70);
    });

    it('should handle exactly 30 days of inactivity boundary', () => {
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      const score = calculateHealthScore({ ...mockClient, last_updated: thirtyDaysAgo });
      // Should be 70 (30 penalty) - not yet 60 penalty threshold
      expect(score).toBe(70);
    });

    it('should return integer score', () => {
      const score = calculateHealthScore(mockClient);
      expect(Number.isInteger(score)).toBe(true);
    });

    it('should handle very old last_updated timestamp', () => {
      const veryOldTimestamp = Date.now() - 365 * 24 * 60 * 60 * 1000; // 1 year ago
      const score = calculateHealthScore({ ...mockClient, last_updated: veryOldTimestamp });
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  describe('Multiple Accounts and Transactions', () => {
    it('should handle multiple accounts (only 1 bonus)', () => {
      const score = calculateHealthScore({
        ...mockClient,
        content: {
          accounts: [
            { id: 'acc-1' },
            { id: 'acc-2' },
            { id: 'acc-3' },
          ],
        },
      });
      // Should still be 100 + 5 = 105, capped at 105 (before bonuses cap)
      expect(score).toBe(105);
    });

    it('should handle exactly 50 transactions for bonus threshold', () => {
      const scoreBefore49 = calculateHealthScore({
        ...mockClient,
        content: { transactions: Array.from({ length: 49 }) },
      });
      const score50 = calculateHealthScore({
        ...mockClient,
        content: { transactions: Array.from({ length: 50 }) },
      });
      expect(score50).toBe(scoreBefore49 + 5);
    });

    it('should handle thousands of transactions', () => {
      const score = calculateHealthScore({
        ...mockClient,
        content: { transactions: Array.from({ length: 10000 }) },
      });
      // Still only +5 bonus for having 50+
      expect(score).toBe(105);
    });
  });

  describe('Score Distribution', () => {
    it('should produce reasonable scores for inactive clients', () => {
      const sixtyDaysAgo = Date.now() - 60 * 24 * 60 * 60 * 1000;
      const score = calculateHealthScore({
        ...mockClient,
        last_updated: sixtyDaysAgo,
      });
      expect(score).toBeLessThan(50);
    });

    it('should produce high scores for active clients with data', () => {
      const score = calculateHealthScore({
        ...mockClient,
        content: {
          accounts: [{ id: 'acc-1' }],
          transactions: Array.from({ length: 100 }),
          goals: [{ id: 'goal-1' }],
        },
      });
      expect(score).toBeGreaterThan(80);
    });
  });
});
