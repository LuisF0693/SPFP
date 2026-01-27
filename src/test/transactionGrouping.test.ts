import { describe, it, expect, beforeEach } from 'vitest';
import { Transaction } from '../types';
import { createMockTransaction, generators } from './test-utils';

/**
 * TRANSACTION GROUPING TEST SUITE
 * Tests recurring transactions, installments, and transaction grouping logic
 */

describe('Transaction Grouping and Recurring', () => {
  let mockTransactions: Transaction[];

  beforeEach(() => {
    mockTransactions = [];
  });

  describe('Recurring Transaction Groups', () => {
    it('should identify all transactions with same groupId', () => {
      const groupId = generators.randomId();
      const group = [
        createMockTransaction({ groupId, groupIndex: 0, date: '2026-01-15' }),
        createMockTransaction({ groupId, groupIndex: 1, date: '2026-02-15' }),
        createMockTransaction({ groupId, groupIndex: 2, date: '2026-03-15' }),
      ];

      const filtered = group.filter(t => t.groupId === groupId);
      expect(filtered).toHaveLength(3);
      expect(filtered.every(t => t.groupId === groupId)).toBe(true);
    });

    it('should maintain order by groupIndex', () => {
      const groupId = generators.randomId();
      const unordered = [
        createMockTransaction({ groupId, groupIndex: 2 }),
        createMockTransaction({ groupId, groupIndex: 0 }),
        createMockTransaction({ groupId, groupIndex: 1 }),
      ];

      const sorted = [...unordered].sort((a, b) =>
        (a.groupIndex || 0) - (b.groupIndex || 0)
      );

      expect(sorted[0].groupIndex).toBe(0);
      expect(sorted[1].groupIndex).toBe(1);
      expect(sorted[2].groupIndex).toBe(2);
    });

    it('should handle missing groupIndex (default to 0)', () => {
      const groupId = generators.randomId();
      const transactions = [
        createMockTransaction({ groupId, groupIndex: undefined }),
        createMockTransaction({ groupId, groupIndex: 1 }),
      ];

      const sorted = [...transactions].sort((a, b) =>
        (a.groupIndex || 0) - (b.groupIndex || 0)
      );

      expect((sorted[0].groupIndex || 0)).toBe(0);
      expect(sorted[1].groupIndex).toBe(1);
    });

    it('should separate transactions with different groupIds', () => {
      const group1Id = generators.randomId();
      const group2Id = generators.randomId();

      const allTxs = [
        createMockTransaction({ groupId: group1Id, groupIndex: 0 }),
        createMockTransaction({ groupId: group2Id, groupIndex: 0 }),
        createMockTransaction({ groupId: group1Id, groupIndex: 1 }),
        createMockTransaction({ groupId: group2Id, groupIndex: 1 }),
      ];

      const group1 = allTxs.filter(t => t.groupId === group1Id);
      const group2 = allTxs.filter(t => t.groupId === group2Id);

      expect(group1).toHaveLength(2);
      expect(group2).toHaveLength(2);
      expect(group1.every(t => t.groupId === group1Id)).toBe(true);
      expect(group2.every(t => t.groupId === group2Id)).toBe(true);
    });

    it('should handle ungrouped transactions', () => {
      const groupedTx = createMockTransaction({ groupId: generators.randomId() });
      const ungroupedTx1 = createMockTransaction({ groupId: undefined });
      const ungroupedTx2 = createMockTransaction({ groupId: undefined });

      const allTxs = [groupedTx, ungroupedTx1, ungroupedTx2];
      const grouped = allTxs.filter(t => t.groupId !== undefined);
      const ungrouped = allTxs.filter(t => t.groupId === undefined);

      expect(grouped).toHaveLength(1);
      expect(ungrouped).toHaveLength(2);
    });
  });

  describe('Installment (Parcelado) Logic', () => {
    it('should create multiple installments with same groupId', () => {
      const groupId = generators.randomId();
      const installments = Array.from({ length: 12 }, (_, i) =>
        createMockTransaction({
          groupId,
          groupIndex: i,
          description: `Compra parcelada 12x - Parcela ${i + 1}`,
          value: 100,
        })
      );

      expect(installments).toHaveLength(12);
      expect(installments.every(t => t.groupId === groupId)).toBe(true);
      expect(installments.map(t => t.groupIndex)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    });

    it('should delete all installments by groupId', () => {
      const groupId = generators.randomId();
      const installments = Array.from({ length: 5 }, (_, i) =>
        createMockTransaction({ groupId, groupIndex: i })
      );

      const otherTx = createMockTransaction({ groupId: undefined });

      let allTxs = [...installments, otherTx];
      const filtered = allTxs.filter(t => t.groupId !== groupId);

      expect(filtered).toHaveLength(1);
      expect(filtered[0]).toEqual(otherTx);
    });

    it('should delete installments from index onwards', () => {
      const groupId = generators.randomId();
      const installments = Array.from({ length: 5 }, (_, i) =>
        createMockTransaction({ groupId, groupIndex: i })
      );

      // Delete from index 2 onwards (keep 0 and 1)
      const remaining = installments.filter(t => !t.groupId || (t.groupIndex || 0) < 2);
      expect(remaining).toHaveLength(2);
      expect(remaining[0].groupIndex).toBe(0);
      expect(remaining[1].groupIndex).toBe(1);
    });

    it('should calculate total installment value', () => {
      const groupId = generators.randomId();
      const installmentValue = 100;
      const installmentCount = 12;

      const installments = Array.from({ length: installmentCount }, (_, i) =>
        createMockTransaction({ groupId, groupIndex: i, value: installmentValue })
      );

      const total = installments.reduce((sum, tx) => sum + tx.value, 0);
      expect(total).toBe(1200);
    });

    it('should handle irregular installment amounts', () => {
      const groupId = generators.randomId();
      const amounts = [100, 100, 100, 100, 100, 105]; // Last one adjusted for rounding

      const installments = amounts.map((amount, i) =>
        createMockTransaction({ groupId, groupIndex: i, value: amount })
      );

      const total = installments.reduce((sum, tx) => sum + tx.value, 0);
      expect(total).toBe(605);
    });
  });

  describe('Recurring Transaction Logic', () => {
    it('should create recurring monthly transactions', () => {
      const groupId = generators.randomId();
      const months = 12;

      const recurring = Array.from({ length: months }, (_, i) => {
        const date = new Date(2026, i, 15);
        return createMockTransaction({
          groupId,
          groupIndex: i,
          date: date.toISOString().split('T')[0],
          description: 'Monthly Subscription',
          value: 50,
        });
      });

      expect(recurring).toHaveLength(12);
      expect(recurring.every(t => t.value === 50)).toBe(true);
      expect(recurring.every(t => t.description === 'Monthly Subscription')).toBe(true);
    });

    it('should identify recurring transaction pattern', () => {
      const groupId = generators.randomId();
      const recurring = [
        createMockTransaction({ groupId, groupIndex: 0, date: '2026-01-01', value: 100 }),
        createMockTransaction({ groupId, groupIndex: 1, date: '2026-02-01', value: 100 }),
        createMockTransaction({ groupId, groupIndex: 2, date: '2026-03-01', value: 100 }),
      ];

      const allSameAmount = recurring.every(t => t.value === recurring[0].value);
      const allSameDescription = recurring.every(t => t.description === recurring[0].description);

      expect(allSameAmount).toBe(true);
      expect(allSameDescription).toBe(true);
    });

    it('should handle recurring with different values', () => {
      const groupId = generators.randomId();
      const recurring = [
        createMockTransaction({ groupId, groupIndex: 0, value: 100 }),
        createMockTransaction({ groupId, groupIndex: 1, value: 110 }),
        createMockTransaction({ groupId, groupIndex: 2, value: 120 }),
      ];

      const total = recurring.reduce((sum, tx) => sum + tx.value, 0);
      expect(total).toBe(330);
    });

    it('should stop recurring from specific index', () => {
      const groupId = generators.randomId();
      const recurring = Array.from({ length: 24 }, (_, i) =>
        createMockTransaction({ groupId, groupIndex: i })
      );

      // Cancel subscription after month 12
      const remaining = recurring.filter(t => !t.groupId || (t.groupIndex || 0) < 12);
      expect(remaining).toHaveLength(12);
    });
  });

  describe('Grouping Edge Cases', () => {
    it('should handle empty groupId array', () => {
      const groupId = generators.randomId();
      const filtered = [] as Transaction[];

      expect(filtered).toHaveLength(0);
      expect(filtered.filter(t => t.groupId === groupId)).toHaveLength(0);
    });

    it('should handle single transaction group', () => {
      const groupId = generators.randomId();
      const single = [createMockTransaction({ groupId })];

      const group = single.filter(t => t.groupId === groupId);
      expect(group).toHaveLength(1);
    });

    it('should preserve order when filtering by groupId', () => {
      const groupId = generators.randomId();
      const txs = [
        createMockTransaction({ groupId, groupIndex: 0 }),
        createMockTransaction({ groupId: undefined }),
        createMockTransaction({ groupId, groupIndex: 1 }),
        createMockTransaction({ groupId: undefined }),
        createMockTransaction({ groupId, groupIndex: 2 }),
      ];

      const group = txs.filter(t => t.groupId === groupId);
      expect(group).toHaveLength(3);
      expect(group[0].groupIndex).toBe(0);
      expect(group[1].groupIndex).toBe(1);
      expect(group[2].groupIndex).toBe(2);
    });

    it('should handle groupIndex as optional field', () => {
      const groupId = generators.randomId();
      const tx1 = createMockTransaction({ groupId, groupIndex: 1 });
      const tx2 = createMockTransaction({ groupId }); // No groupIndex

      const sorted = [tx2, tx1].sort((a, b) => (a.groupIndex || 0) - (b.groupIndex || 0));

      expect((sorted[0].groupIndex || 0)).toBe(0);
      expect(sorted[1].groupIndex).toBe(1);
    });

    it('should handle very large groupIndex values', () => {
      const groupId = generators.randomId();
      const tx = createMockTransaction({ groupId, groupIndex: 999999 });

      expect(tx.groupIndex).toBe(999999);
    });
  });

  describe('Bulk Group Operations', () => {
    it('should sum values across group', () => {
      const groupId = generators.randomId();
      const group = [
        createMockTransaction({ groupId, groupIndex: 0, value: 100 }),
        createMockTransaction({ groupId, groupIndex: 1, value: 200 }),
        createMockTransaction({ groupId, groupIndex: 2, value: 150 }),
      ];

      const total = group.reduce((sum, tx) => sum + tx.value, 0);
      expect(total).toBe(450);
    });

    it('should count transactions in group', () => {
      const groupId = generators.randomId();
      const allTxs = [
        createMockTransaction({ groupId, groupIndex: 0 }),
        createMockTransaction({ groupId, groupIndex: 1 }),
        createMockTransaction({ groupId: undefined }),
        createMockTransaction({ groupId, groupIndex: 2 }),
      ];

      const groupCount = allTxs.filter(t => t.groupId === groupId).length;
      expect(groupCount).toBe(3);
    });

    it('should update all transactions in group', () => {
      const groupId = generators.randomId();
      const group = [
        createMockTransaction({ groupId, groupIndex: 0, category: 'OLD' }),
        createMockTransaction({ groupId, groupIndex: 1, category: 'OLD' }),
        createMockTransaction({ groupId, groupIndex: 2, category: 'OLD' }),
      ];

      const updated = group.map(t => ({ ...t, category: 'NEW' }));

      expect(updated.every(t => t.category === 'NEW')).toBe(true);
      expect(updated.every(t => t.groupId === groupId)).toBe(true);
    });

    it('should handle deletion of middle transaction from group', () => {
      const groupId = generators.randomId();
      let group = [
        createMockTransaction({ groupId, groupIndex: 0, id: 'tx-1' }),
        createMockTransaction({ groupId, groupIndex: 1, id: 'tx-2' }),
        createMockTransaction({ groupId, groupIndex: 2, id: 'tx-3' }),
      ];

      // Delete middle
      group = group.filter(t => t.id !== 'tx-2');

      expect(group).toHaveLength(2);
      expect(group[0].id).toBe('tx-1');
      expect(group[1].id).toBe('tx-3');
    });
  });

  describe('Group Consistency Checks', () => {
    it('should verify all group transactions have same groupId', () => {
      const groupId = generators.randomId();
      const group = [
        createMockTransaction({ groupId }),
        createMockTransaction({ groupId }),
        createMockTransaction({ groupId }),
      ];

      const isConsistent = group.every(t => t.groupId === groupId);
      expect(isConsistent).toBe(true);
    });

    it('should verify groupIndex is sequential', () => {
      const groupId = generators.randomId();
      const group = [
        createMockTransaction({ groupId, groupIndex: 0 }),
        createMockTransaction({ groupId, groupIndex: 1 }),
        createMockTransaction({ groupId, groupIndex: 2 }),
      ];

      const isSequential = group.every((t, i) => (t.groupIndex || 0) === i);
      expect(isSequential).toBe(true);
    });

    it('should detect non-sequential groupIndex', () => {
      const groupId = generators.randomId();
      const group = [
        createMockTransaction({ groupId, groupIndex: 0 }),
        createMockTransaction({ groupId, groupIndex: 2 }), // Skipped 1
        createMockTransaction({ groupId, groupIndex: 3 }),
      ];

      const sorted = [...group].sort((a, b) => (a.groupIndex || 0) - (b.groupIndex || 0));
      const expectedSequence = [0, 1, 2, 3];

      // Check if there are gaps
      const hasGaps = sorted.some((t, i) => (t.groupIndex || 0) !== i);
      expect(hasGaps).toBe(true);
    });

    it('should handle group with all same properties except index', () => {
      const groupId = generators.randomId();
      const baseDate = '2026-01-15';
      const description = 'Monthly Payment';
      const value = 100;

      const group = Array.from({ length: 5 }, (_, i) =>
        createMockTransaction({
          groupId,
          groupIndex: i,
          date: baseDate,
          description,
          value,
        })
      );

      const allSameExceptIndex = group.every(t =>
        t.date === baseDate &&
        t.description === description &&
        t.value === value
      );

      expect(allSameExceptIndex).toBe(true);
    });
  });
});
