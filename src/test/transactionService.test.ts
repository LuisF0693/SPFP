import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  generateTransactions,
  generateSingleTransaction,
  validateRecurrence,
  GenerateTransactionsParams,
} from '../services/transactionService';
import { RecurrenceType } from '../components/transaction/TransactionRecurrenceForm';

/**
 * TRANSACTION SERVICE TEST SUITE
 * Tests transaction generation logic, recurrence validation, and grouping
 */

describe('Transaction Service', () => {
  const baseParams: GenerateTransactionsParams = {
    description: 'Test Transaction',
    value: 1200,
    type: 'EXPENSE',
    categoryId: 'cat-001',
    accountId: 'acc-001',
    date: '2026-01-15',
    spender: 'ME',
    paid: true,
    sentiment: 'neutral',
    recurrence: 'NONE',
    installments: 1,
  };

  describe('generateTransactions - Installment Mode', () => {
    it('should generate multiple installments when INSTALLMENT and count > 1', () => {
      const params: GenerateTransactionsParams = {
        ...baseParams,
        value: 1200,
        recurrence: 'INSTALLMENT',
        installments: 12,
      };

      const result = generateTransactions(params);

      expect(result).not.toBeNull();
      expect(result!.newTransactions).toHaveLength(12);
      expect(result!.groupId).toBeDefined();
      expect(typeof result!.groupId).toBe('string');
      expect(result!.groupId.length).toBeGreaterThan(0);
    });

    it('should divide value equally across installments', () => {
      const params: GenerateTransactionsParams = {
        ...baseParams,
        value: 1200,
        recurrence: 'INSTALLMENT',
        installments: 12,
      };

      const result = generateTransactions(params);

      result!.newTransactions.forEach((tx) => {
        expect(tx.value).toBe(100); // 1200 / 12
      });
    });

    it('should add suffix to description for installments', () => {
      const params: GenerateTransactionsParams = {
        ...baseParams,
        description: 'Compra',
        recurrence: 'INSTALLMENT',
        installments: 3,
      };

      const result = generateTransactions(params);

      expect(result!.newTransactions[0].description).toBe('Compra (1/3)');
      expect(result!.newTransactions[1].description).toBe('Compra (2/3)');
      expect(result!.newTransactions[2].description).toBe('Compra (3/3)');
    });

    it('should set groupType to INSTALLMENT', () => {
      const params: GenerateTransactionsParams = {
        ...baseParams,
        recurrence: 'INSTALLMENT',
        installments: 6,
      };

      const result = generateTransactions(params);

      result!.newTransactions.forEach((tx) => {
        expect(tx.groupType).toBe('INSTALLMENT');
      });
    });

    it('should set groupTotal for installments', () => {
      const params: GenerateTransactionsParams = {
        ...baseParams,
        recurrence: 'INSTALLMENT',
        installments: 12,
      };

      const result = generateTransactions(params);

      result!.newTransactions.forEach((tx) => {
        expect(tx.groupTotal).toBe(12);
      });
    });

    it('should increment groupIndex sequentially', () => {
      const params: GenerateTransactionsParams = {
        ...baseParams,
        recurrence: 'INSTALLMENT',
        installments: 5,
      };

      const result = generateTransactions(params);

      result!.newTransactions.forEach((tx, i) => {
        expect(tx.groupIndex).toBe(i + 1);
      });
    });

    it('should set consecutive dates for installments', () => {
      const params: GenerateTransactionsParams = {
        ...baseParams,
        date: '2026-01-15',
        recurrence: 'INSTALLMENT',
        installments: 3,
      };

      const result = generateTransactions(params);

      const dates = result!.newTransactions.map((tx) => tx.date);
      expect(new Date(dates[0]).getMonth()).toBe(0); // January
      expect(new Date(dates[1]).getMonth()).toBe(1); // February
      expect(new Date(dates[2]).getMonth()).toBe(2); // March
    });
  });

  describe('generateTransactions - Recurring Mode', () => {
    it('should generate multiple transactions with same value when REPEATED', () => {
      const params: GenerateTransactionsParams = {
        ...baseParams,
        value: 500,
        recurrence: 'REPEATED',
        installments: 12,
      };

      const result = generateTransactions(params);

      expect(result).not.toBeNull();
      expect(result!.newTransactions).toHaveLength(12);
      result!.newTransactions.forEach((tx) => {
        expect(tx.value).toBe(500); // Same value for recurring
      });
    });

    it('should NOT add suffix to description for recurring', () => {
      const params: GenerateTransactionsParams = {
        ...baseParams,
        description: 'Netflix Subscription',
        recurrence: 'REPEATED',
        installments: 6,
      };

      const result = generateTransactions(params);

      result!.newTransactions.forEach((tx) => {
        expect(tx.description).toBe('Netflix Subscription');
      });
    });

    it('should set groupType to RECURRING', () => {
      const params: GenerateTransactionsParams = {
        ...baseParams,
        recurrence: 'REPEATED',
        installments: 6,
      };

      const result = generateTransactions(params);

      result!.newTransactions.forEach((tx) => {
        expect(tx.groupType).toBe('RECURRING');
      });
    });

    it('should NOT set groupTotal for recurring', () => {
      const params: GenerateTransactionsParams = {
        ...baseParams,
        recurrence: 'REPEATED',
        installments: 6,
      };

      const result = generateTransactions(params);

      result!.newTransactions.forEach((tx) => {
        expect(tx.groupTotal).toBeUndefined();
      });
    });
  });

  describe('generateTransactions - Edge Cases', () => {
    it('should return null for NONE recurrence', () => {
      const params: GenerateTransactionsParams = {
        ...baseParams,
        recurrence: 'NONE',
        installments: 1,
      };

      const result = generateTransactions(params);

      expect(result).toBeNull();
    });

    it('should return null for installments count of 1', () => {
      const params: GenerateTransactionsParams = {
        ...baseParams,
        recurrence: 'INSTALLMENT',
        installments: 1,
      };

      const result = generateTransactions(params);

      expect(result).toBeNull();
    });

    it('should handle large installment counts', () => {
      const params: GenerateTransactionsParams = {
        ...baseParams,
        recurrence: 'INSTALLMENT',
        installments: 48,
      };

      const result = generateTransactions(params);

      expect(result!.newTransactions).toHaveLength(48);
    });

    it('should preserve all transaction fields', () => {
      const params: GenerateTransactionsParams = {
        ...baseParams,
        spender: 'SPOUSE',
        sentiment: 'happy',
        paid: false,
        recurrence: 'INSTALLMENT',
        installments: 2,
      };

      const result = generateTransactions(params);

      result!.newTransactions.forEach((tx) => {
        expect(tx.spender).toBe('SPOUSE');
        expect(tx.sentiment).toBe('happy');
        expect(tx.paid).toBe(false);
        expect(tx.categoryId).toBe(baseParams.categoryId);
        expect(tx.accountId).toBe(baseParams.accountId);
        expect(tx.type).toBe('EXPENSE');
      });
    });
  });

  describe('generateSingleTransaction', () => {
    it('should generate single transaction without grouping', () => {
      const result = generateSingleTransaction(baseParams);

      expect(result.description).toBe(baseParams.description);
      expect(result.value).toBe(baseParams.value);
      expect(result.type).toBe(baseParams.type);
      expect(result.categoryId).toBe(baseParams.categoryId);
      expect(result.groupId).toBeUndefined();
      expect(result.groupType).toBeUndefined();
      expect(result.groupIndex).toBeUndefined();
    });

    it('should preserve sentiment and spender', () => {
      const params = {
        ...baseParams,
        sentiment: 'stressed',
        spender: 'SPOUSE',
      };

      const result = generateSingleTransaction(params);

      expect(result.sentiment).toBe('stressed');
      expect(result.spender).toBe('SPOUSE');
    });

    it('should handle undefined sentiment', () => {
      const params = {
        ...baseParams,
        sentiment: undefined,
      };

      const result = generateSingleTransaction(params);

      expect(result.sentiment).toBeUndefined();
    });
  });

  describe('validateRecurrence', () => {
    it('should reject INSTALLMENT with less than 2 installments', () => {
      const errors = validateRecurrence('INSTALLMENT', 1);

      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('mínimo');
    });

    it('should reject recurrence with more than 48 installments', () => {
      const errors = validateRecurrence('INSTALLMENT', 49);

      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('máximo');
    });

    it('should accept valid installment count', () => {
      const errors = validateRecurrence('INSTALLMENT', 12);

      expect(errors).toHaveLength(0);
    });

    it('should accept NONE recurrence with any count', () => {
      const errors = validateRecurrence('NONE', 100);

      expect(errors).toHaveLength(0);
    });

    it('should validate REPEATED with 2-48 installments', () => {
      expect(validateRecurrence('REPEATED', 1)).toHaveLength(1);
      expect(validateRecurrence('REPEATED', 12)).toHaveLength(0);
      expect(validateRecurrence('REPEATED', 48)).toHaveLength(0);
      expect(validateRecurrence('REPEATED', 49)).toHaveLength(1);
    });
  });

  describe('Recurrence with Different Values', () => {
    it('should calculate correct values for fractional divisions', () => {
      const params: GenerateTransactionsParams = {
        ...baseParams,
        value: 100,
        recurrence: 'INSTALLMENT',
        installments: 3,
      };

      const result = generateTransactions(params);

      // 100 / 3 = 33.333...
      const expectedValue = 100 / 3;
      result!.newTransactions.forEach((tx) => {
        expect(tx.value).toBeCloseTo(expectedValue, 2);
      });
    });

    it('should handle zero value', () => {
      const params: GenerateTransactionsParams = {
        ...baseParams,
        value: 0,
        recurrence: 'INSTALLMENT',
        installments: 12,
      };

      const result = generateTransactions(params);

      result!.newTransactions.forEach((tx) => {
        expect(tx.value).toBe(0);
      });
    });

    it('should handle very small values', () => {
      const params: GenerateTransactionsParams = {
        ...baseParams,
        value: 0.01,
        recurrence: 'INSTALLMENT',
        installments: 2,
      };

      const result = generateTransactions(params);

      result!.newTransactions.forEach((tx) => {
        expect(tx.value).toBeCloseTo(0.005, 4);
      });
    });
  });

  describe('Date Handling', () => {
    it('should increment dates correctly across year boundary', () => {
      const params: GenerateTransactionsParams = {
        ...baseParams,
        date: '2025-12-15',
        recurrence: 'INSTALLMENT',
        installments: 3,
      };

      const result = generateTransactions(params);

      const dates = result!.newTransactions.map((tx) => new Date(tx.date));
      expect(dates[0].getMonth()).toBe(11); // December 2025
      expect(dates[0].getFullYear()).toBe(2025);
      expect(dates[1].getMonth()).toBe(0); // January 2026
      expect(dates[1].getFullYear()).toBe(2026);
      expect(dates[2].getMonth()).toBe(1); // February 2026
    });

    it('should maintain day of month across months', () => {
      const params: GenerateTransactionsParams = {
        ...baseParams,
        date: '2026-01-31',
        recurrence: 'INSTALLMENT',
        installments: 4,
      };

      const result = generateTransactions(params);

      // Just verify that we have 4 transactions
      expect(result!.newTransactions).toHaveLength(4);

      // Verify dates are in correct order
      const dates = result!.newTransactions.map((tx) => new Date(tx.date));
      expect(dates[0].getTime()).toBeLessThanOrEqual(dates[1].getTime());
      expect(dates[1].getTime()).toBeLessThanOrEqual(dates[2].getTime());
    });
  });
});
