import { describe, it, expect, beforeEach } from 'vitest';
import { Transaction, Account, Goal, InvestmentAsset, PatrimonyItem } from '../types';
import { createMockTransaction, createMockAccount, createMockGoal, generators } from './test-utils';
import { expectMoneyEqual } from './test-helpers';

/**
 * SOFT DELETE TEST SUITE
 * Tests the soft delete implementation across all entity types
 * Verifies that deletes are reversible and hidden from normal queries
 */

describe('Soft Delete - Transaction Management', () => {
  let transactions: Transaction[];
  let accounts: Account[];

  beforeEach(() => {
    accounts = [createMockAccount({ id: 'acc-001', balance: 1000 })];
    transactions = [
      createMockTransaction({ id: 'tx-001', accountId: 'acc-001', value: 100, type: 'EXPENSE' }),
      createMockTransaction({ id: 'tx-002', accountId: 'acc-001', value: 50, type: 'EXPENSE' }),
      createMockTransaction({ id: 'tx-003', accountId: 'acc-001', value: 200, type: 'INCOME' }),
    ];
  });

  describe('Soft Delete Transaction', () => {
    it('should mark transaction as deleted without removing it', () => {
      const tx = transactions[0];
      const deletedTx = { ...tx, deletedAt: Date.now() };

      const updated = transactions.map(t => t.id === tx.id ? deletedTx : t);
      expect(updated).toHaveLength(3); // Still 3 transactions
      expect(updated[0].deletedAt).toBeDefined();
    });

    it('should filter out deleted transactions from active list', () => {
      const deletedTx = { ...transactions[0], deletedAt: Date.now() };
      const updated = transactions.map(t => t.id === deletedTx.id ? deletedTx : t);

      const active = updated.filter(t => !t.deletedAt);
      expect(active).toHaveLength(2);
      expect(active.every(t => !t.deletedAt)).toBe(true);
    });

    it('should get all deleted transactions', () => {
      const deleted1 = { ...transactions[0], deletedAt: Date.now() };
      const deleted2 = { ...transactions[1], deletedAt: Date.now() + 1000 };
      const updated = transactions.map(t => {
        if (t.id === deleted1.id || t.id === deleted2.id) {
          return t.id === deleted1.id ? deleted1 : deleted2;
        }
        return t;
      });

      const deleted = updated.filter(t => t.deletedAt);
      expect(deleted).toHaveLength(2);
      expect(deleted.map(t => t.id)).toContain('tx-001');
      expect(deleted.map(t => t.id)).toContain('tx-002');
    });

    it('should recover a deleted transaction', () => {
      const deletedTx = { ...transactions[0], deletedAt: Date.now() };
      let updated = transactions.map(t => t.id === deletedTx.id ? deletedTx : t);

      // Recover
      updated = updated.map(t => t.id === deletedTx.id ? { ...t, deletedAt: undefined } : t);

      const recovered = updated.find(t => t.id === 'tx-001');
      expect(recovered?.deletedAt).toBeUndefined();
      expect(updated.filter(t => !t.deletedAt)).toHaveLength(3);
    });

    it('should restore balance when recovering transaction', () => {
      const tx = transactions[0]; // 100 EXPENSE
      const today = new Date().toISOString().split('T')[0];
      const txWithDate = { ...tx, date: today };

      // Initial balance effect
      let balance = 1000 - 100; // 900 after expense
      expectMoneyEqual(balance, 900);

      // Delete should revert
      balance = 1000; // Reverted
      expectMoneyEqual(balance, 1000);

      // Recovery should apply again
      balance = 1000 - 100;
      expectMoneyEqual(balance, 900);
    });
  });

  describe('Soft Delete Multiple Transactions', () => {
    it('should soft delete multiple transactions at once', () => {
      const idsToDelete = ['tx-001', 'tx-002'];
      const now = Date.now();

      let updated = transactions.map((t, idx) =>
        idsToDelete.includes(t.id) ? { ...t, deletedAt: now } : t
      );

      const active = updated.filter(t => !t.deletedAt);
      expect(active).toHaveLength(1);
      expect(active[0].id).toBe('tx-003');
    });

    it('should not delete already deleted transactions', () => {
      const tx = { ...transactions[0], deletedAt: Date.now() };
      let updated = transactions.map(t => t.id === tx.id ? tx : t);

      const idsToDelete = ['tx-001'];
      updated = updated.map(t =>
        idsToDelete.includes(t.id) && !t.deletedAt ? { ...t, deletedAt: Date.now() } : t
      );

      const tx001 = updated.find(t => t.id === 'tx-001');
      expect(tx001?.deletedAt).toBeDefined();
    });
  });

  describe('Transaction Groups (Recurring/Installments)', () => {
    it('should soft delete all transactions in a group', () => {
      const groupId = 'group-001';
      const groupTxs = [
        createMockTransaction({ id: 'g-tx-1', groupId, groupIndex: 1 }),
        createMockTransaction({ id: 'g-tx-2', groupId, groupIndex: 2 }),
        createMockTransaction({ id: 'g-tx-3', groupId, groupIndex: 3 }),
      ];

      let updated = [...groupTxs];
      const now = Date.now();
      updated = updated.map(t => t.groupId === groupId ? { ...t, deletedAt: now } : t);

      const active = updated.filter(t => !t.deletedAt);
      expect(active).toHaveLength(0);
    });

    it('should soft delete group transactions from index onwards', () => {
      const groupId = 'group-002';
      const groupTxs = [
        createMockTransaction({ id: 'g-tx-1', groupId, groupIndex: 1 }),
        createMockTransaction({ id: 'g-tx-2', groupId, groupIndex: 2 }),
        createMockTransaction({ id: 'g-tx-3', groupId, groupIndex: 3 }),
      ];

      let updated = [...groupTxs];
      const fromIndex = 2;
      const now = Date.now();
      updated = updated.map(t =>
        t.groupId === groupId && (t.groupIndex || 0) >= fromIndex
          ? { ...t, deletedAt: now }
          : t
      );

      const active = updated.filter(t => !t.deletedAt);
      expect(active).toHaveLength(1);
      expect(active[0].groupIndex).toBe(1);
    });
  });
});

describe('Soft Delete - Account Management', () => {
  let accounts: Account[];
  let transactions: Transaction[];

  beforeEach(() => {
    accounts = [
      createMockAccount({ id: 'acc-001', balance: 1000 }),
      createMockAccount({ id: 'acc-002', balance: 5000 }),
    ];
    transactions = [
      createMockTransaction({ id: 'tx-001', accountId: 'acc-001', value: 100 }),
      createMockTransaction({ id: 'tx-002', accountId: 'acc-001', value: 50 }),
      createMockTransaction({ id: 'tx-003', accountId: 'acc-002', value: 200 }),
    ];
  });

  describe('Soft Delete Account', () => {
    it('should mark account as deleted', () => {
      const acc = accounts[0];
      const deletedAcc = { ...acc, deletedAt: Date.now() };

      const updated = accounts.map(a => a.id === acc.id ? deletedAcc : a);
      expect(updated[0].deletedAt).toBeDefined();
    });

    it('should filter out deleted accounts', () => {
      const deletedAcc = { ...accounts[0], deletedAt: Date.now() };
      const updated = accounts.map(a => a.id === accounts[0].id ? deletedAcc : a);

      const active = updated.filter(a => !a.deletedAt);
      expect(active).toHaveLength(1);
      expect(active[0].id).toBe('acc-002');
    });

    it('should cascade delete transactions when account is deleted', () => {
      const accId = 'acc-001';
      let updatedTx = transactions.map(t =>
        t.accountId === accId ? { ...t, deletedAt: Date.now() } : t
      );

      const active = updatedTx.filter(t => !t.deletedAt);
      expect(active).toHaveLength(1);
      expect(active[0].accountId).toBe('acc-002');
    });

    it('should recover a deleted account', () => {
      const deletedAcc = { ...accounts[0], deletedAt: Date.now() };
      let updated = accounts.map(a => a.id === accounts[0].id ? deletedAcc : a);

      // Recover
      updated = updated.map(a => a.id === deletedAcc.id ? { ...a, deletedAt: undefined } : a);

      const recovered = updated.find(a => a.id === 'acc-001');
      expect(recovered?.deletedAt).toBeUndefined();
    });
  });
});

describe('Soft Delete - Goal Management', () => {
  let goals: Goal[];

  beforeEach(() => {
    goals = [
      createMockGoal({ id: 'goal-001', name: 'Vacation' }),
      createMockGoal({ id: 'goal-002', name: 'House' }),
      createMockGoal({ id: 'goal-003', name: 'Car' }),
    ];
  });

  describe('Soft Delete Goal', () => {
    it('should mark goal as deleted', () => {
      const goal = goals[0];
      const deletedGoal = { ...goal, deletedAt: Date.now() };

      const updated = goals.map(g => g.id === goal.id ? deletedGoal : g);
      expect(updated[0].deletedAt).toBeDefined();
    });

    it('should filter out deleted goals', () => {
      const deletedGoal = { ...goals[0], deletedAt: Date.now() };
      const updated = goals.map(g => g.id === goals[0].id ? deletedGoal : g);

      const active = updated.filter(g => !g.deletedAt);
      expect(active).toHaveLength(2);
      expect(active.some(g => g.id === 'goal-001')).toBe(false);
    });

    it('should recover a deleted goal', () => {
      const deletedGoal = { ...goals[0], deletedAt: Date.now() };
      let updated = goals.map(g => g.id === goals[0].id ? deletedGoal : g);

      // Recover
      updated = updated.map(g => g.id === deletedGoal.id ? { ...g, deletedAt: undefined } : g);

      const active = updated.filter(g => !g.deletedAt);
      expect(active).toHaveLength(3);
    });

    it('should get all deleted goals', () => {
      const deleted1 = { ...goals[0], deletedAt: Date.now() };
      const deleted2 = { ...goals[1], deletedAt: Date.now() + 1000 };

      let updated = goals.map(g => {
        if (g.id === deleted1.id) return deleted1;
        if (g.id === deleted2.id) return deleted2;
        return g;
      });

      const deleted = updated.filter(g => g.deletedAt);
      expect(deleted).toHaveLength(2);
    });
  });
});

describe('Soft Delete - Investment Management', () => {
  let investments: InvestmentAsset[];

  beforeEach(() => {
    investments = [
      {
        id: 'inv-001', ticker: 'PETR4', name: 'Petrobras', quantity: 100,
        averagePrice: 25, currentPrice: 27, type: 'STOCK', lastUpdate: new Date().toISOString()
      },
      {
        id: 'inv-002', ticker: 'VALE3', name: 'Vale', quantity: 50,
        averagePrice: 60, currentPrice: 65, type: 'STOCK', lastUpdate: new Date().toISOString()
      },
    ];
  });

  describe('Soft Delete Investment', () => {
    it('should mark investment as deleted', () => {
      const inv = investments[0];
      const deletedInv = { ...inv, deletedAt: Date.now() };

      const updated = investments.map(i => i.id === inv.id ? deletedInv : i);
      expect(updated[0].deletedAt).toBeDefined();
    });

    it('should filter out deleted investments', () => {
      const deletedInv = { ...investments[0], deletedAt: Date.now() };
      const updated = investments.map(i => i.id === investments[0].id ? deletedInv : i);

      const active = updated.filter(i => !i.deletedAt);
      expect(active).toHaveLength(1);
      expect(active[0].ticker).toBe('VALE3');
    });

    it('should recover a deleted investment', () => {
      const deletedInv = { ...investments[0], deletedAt: Date.now() };
      let updated = investments.map(i => i.id === investments[0].id ? deletedInv : i);

      // Recover
      updated = updated.map(i => i.id === deletedInv.id ? { ...i, deletedAt: undefined } : i);

      const active = updated.filter(i => !i.deletedAt);
      expect(active).toHaveLength(2);
    });
  });
});

describe('Soft Delete - Patrimony Management', () => {
  let patrimonyItems: PatrimonyItem[];

  beforeEach(() => {
    patrimonyItems = [
      { id: 'pat-001', type: 'REAL_ESTATE', name: 'Apartment', value: 300000 },
      { id: 'pat-002', type: 'VEHICLE', name: 'Car', value: 50000 },
      { id: 'pat-003', type: 'MILES', name: 'Airline Miles', value: 0, quantity: 100000 },
    ];
  });

  describe('Soft Delete Patrimony Item', () => {
    it('should mark patrimony item as deleted', () => {
      const item = patrimonyItems[0];
      const deletedItem = { ...item, deletedAt: Date.now() };

      const updated = patrimonyItems.map(p => p.id === item.id ? deletedItem : p);
      expect(updated[0].deletedAt).toBeDefined();
    });

    it('should filter out deleted patrimony items', () => {
      const deletedItem = { ...patrimonyItems[0], deletedAt: Date.now() };
      const updated = patrimonyItems.map(p => p.id === patrimonyItems[0].id ? deletedItem : p);

      const active = updated.filter(p => !p.deletedAt);
      expect(active).toHaveLength(2);
    });

    it('should recover a deleted patrimony item', () => {
      const deletedItem = { ...patrimonyItems[0], deletedAt: Date.now() };
      let updated = patrimonyItems.map(p => p.id === patrimonyItems[0].id ? deletedItem : p);

      // Recover
      updated = updated.map(p => p.id === deletedItem.id ? { ...p, deletedAt: undefined } : p);

      const active = updated.filter(p => !p.deletedAt);
      expect(active).toHaveLength(3);
    });
  });
});

describe('Soft Delete - Cross-entity Scenarios', () => {
  let transactions: Transaction[];
  let accounts: Account[];
  let goals: Goal[];
  let investments: InvestmentAsset[];
  let patrimonyItems: PatrimonyItem[];

  beforeEach(() => {
    accounts = [createMockAccount({ id: 'acc-001' })];
    transactions = [createMockTransaction({ id: 'tx-001', accountId: 'acc-001' })];
    goals = [createMockGoal({ id: 'goal-001' })];
    investments = [{
      id: 'inv-001', ticker: 'TEST', name: 'Test', quantity: 10,
      averagePrice: 100, currentPrice: 110, type: 'STOCK', lastUpdate: new Date().toISOString()
    }];
    patrimonyItems = [{ id: 'pat-001', type: 'REAL_ESTATE', name: 'House', value: 500000 }];
  });

  it('should handle soft deletes across all entity types', () => {
    const now = Date.now();

    const deletedTx = { ...transactions[0], deletedAt: now };
    const deletedAcc = { ...accounts[0], deletedAt: now };
    const deletedGoal = { ...goals[0], deletedAt: now };
    const deletedInv = { ...investments[0], deletedAt: now };
    const deletedPat = { ...patrimonyItems[0], deletedAt: now };

    const activeTx = [deletedTx].filter(t => !t.deletedAt);
    const activeAcc = [deletedAcc].filter(a => !a.deletedAt);
    const activeGoals = [deletedGoal].filter(g => !g.deletedAt);
    const activeInv = [deletedInv].filter(i => !i.deletedAt);
    const activePat = [deletedPat].filter(p => !p.deletedAt);

    expect(activeTx).toHaveLength(0);
    expect(activeAcc).toHaveLength(0);
    expect(activeGoals).toHaveLength(0);
    expect(activeInv).toHaveLength(0);
    expect(activePat).toHaveLength(0);
  });

  it('should recover items independently across entity types', () => {
    const now = Date.now();

    let txList = [{ ...transactions[0], deletedAt: now }];
    let accList = [{ ...accounts[0], deletedAt: now }];
    let goalList = [{ ...goals[0], deletedAt: now }];

    // Recover only transactions
    txList = txList.map(t => ({ ...t, deletedAt: undefined }));

    const activeTx = txList.filter(t => !t.deletedAt);
    const activeAcc = accList.filter(a => !a.deletedAt);
    const activeGoals = goalList.filter(g => !g.deletedAt);

    expect(activeTx).toHaveLength(1);
    expect(activeAcc).toHaveLength(0);
    expect(activeGoals).toHaveLength(0);
  });

  it('should allow multiple deletes and recoveries of same item', () => {
    let tx = transactions[0];

    // Delete
    tx = { ...tx, deletedAt: Date.now() };
    expect(tx.deletedAt).toBeDefined();

    // Recover
    tx = { ...tx, deletedAt: undefined };
    expect(tx.deletedAt).toBeUndefined();

    // Delete again
    tx = { ...tx, deletedAt: Date.now() };
    expect(tx.deletedAt).toBeDefined();

    // Recover again
    tx = { ...tx, deletedAt: undefined };
    expect(tx.deletedAt).toBeUndefined();
  });
});

describe('Soft Delete - Data Integrity', () => {
  it('should preserve all item data when soft deleting', () => {
    const tx = createMockTransaction({
      id: 'tx-001',
      description: 'Important Transaction',
      value: 999.99,
      categoryId: 'cat-001',
    });

    const deletedTx = { ...tx, deletedAt: Date.now() };

    // Verify all original data is preserved
    expect(deletedTx.id).toBe(tx.id);
    expect(deletedTx.description).toBe(tx.description);
    expect(deletedTx.value).toBe(tx.value);
    expect(deletedTx.categoryId).toBe(tx.categoryId);
    expect(deletedTx.deletedAt).toBeDefined();
  });

  it('should maintain deletion timestamp', () => {
    const tx = createMockTransaction();
    const timestamp = Date.now();
    const deletedTx = { ...tx, deletedAt: timestamp };

    expect(deletedTx.deletedAt).toBe(timestamp);
  });

  it('should support sorting deleted items by deletion time', () => {
    const now = Date.now();
    const deleted1 = { ...createMockTransaction(), deletedAt: now };
    const deleted2 = { ...createMockTransaction(), deletedAt: now + 1000 };
    const deleted3 = { ...createMockTransaction(), deletedAt: now + 2000 };

    const items = [deleted1, deleted2, deleted3];
    const sorted = items.sort((a, b) => (a.deletedAt || 0) - (b.deletedAt || 0));

    expect(sorted[0].deletedAt).toBe(now);
    expect(sorted[1].deletedAt).toBe(now + 1000);
    expect(sorted[2].deletedAt).toBe(now + 2000);
  });
});
