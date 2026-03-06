import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { TransactionsProvider, useTransactions } from '../context/TransactionsContext';
import { createMockTransaction } from './test-utils';
import type { Transaction } from '../types';

// ===========================
// Test Helpers
// ===========================

const TODAY = new Date().toISOString().split('T')[0];

function makeWrapper(userId?: string) {
  return ({ children }: { children: React.ReactNode }) => (
    <TransactionsProvider userId={userId}>{children}</TransactionsProvider>
  );
}

function makeTx(overrides?: Partial<Transaction>): Omit<Transaction, 'id'> {
  const { id: _id, ...rest } = createMockTransaction({ date: TODAY, ...overrides });
  return rest;
}

// ===========================
// useTransactions — Provider guard
// ===========================

describe('useTransactions', () => {
  it('throws when used outside provider', () => {
    const { result } = renderHook(() => {
      try {
        return useTransactions();
      } catch (e: any) {
        return { error: e.message };
      }
    });
    expect((result.current as any).error).toContain('useTransactions must be used within');
  });
});

// ===========================
// Initial State
// ===========================

describe('TransactionsContext — initial state', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('provides initial transactions list (INITIAL_TRANSACTIONS)', () => {
    const { result } = renderHook(() => useTransactions(), { wrapper: makeWrapper() });
    expect(Array.isArray(result.current.transactions)).toBe(true);
  });

  it('provides empty categoryBudgets by default', () => {
    const { result } = renderHook(() => useTransactions(), { wrapper: makeWrapper() });
    expect(Array.isArray(result.current.categoryBudgets)).toBe(true);
  });

  it('loads persisted state from localStorage on mount', () => {
    const key = 'visao360_v2_transactions_user-persist';
    const stored = {
      transactions: [createMockTransaction({ id: 'persisted-1', date: TODAY })],
      categoryBudgets: [],
      lastUpdated: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(stored));

    const { result } = renderHook(() => useTransactions(), { wrapper: makeWrapper('user-persist') });
    const found = result.current.transactions.find(t => t.id === 'persisted-1');
    expect(found).toBeDefined();
  });

  it('falls back to defaults when localStorage is corrupted', () => {
    const key = 'visao360_v2_transactions_user-corrupt';
    localStorage.setItem(key, '{invalid json}');

    const { result } = renderHook(() => useTransactions(), { wrapper: makeWrapper('user-corrupt') });
    expect(Array.isArray(result.current.transactions)).toBe(true);
  });

  it('uses different storage key per userId', () => {
    const key1 = 'visao360_v2_transactions_user-A';
    const key2 = 'visao360_v2_transactions_user-B';

    localStorage.setItem(key1, JSON.stringify({ transactions: [createMockTransaction({ id: 'tx-A', date: TODAY })], categoryBudgets: [], lastUpdated: 1 }));
    localStorage.setItem(key2, JSON.stringify({ transactions: [createMockTransaction({ id: 'tx-B', date: TODAY })], categoryBudgets: [], lastUpdated: 1 }));

    const { result: r1 } = renderHook(() => useTransactions(), { wrapper: makeWrapper('user-A') });
    const { result: r2 } = renderHook(() => useTransactions(), { wrapper: makeWrapper('user-B') });

    expect(r1.current.transactions.some(t => t.id === 'tx-A')).toBe(true);
    expect(r2.current.transactions.some(t => t.id === 'tx-B')).toBe(true);
    expect(r1.current.transactions.some(t => t.id === 'tx-B')).toBe(false);
  });
});

// ===========================
// addTransaction
// ===========================

describe('TransactionsContext — addTransaction', () => {
  it('adds a transaction to the list', () => {
    const { result } = renderHook(() => useTransactions(), { wrapper: makeWrapper() });
    const initialCount = result.current.transactions.length;

    act(() => {
      result.current.addTransaction(makeTx({ description: 'New TX' }));
    });

    expect(result.current.transactions.length).toBe(initialCount + 1);
    expect(result.current.transactions[0].description).toBe('New TX');
  });

  it('adds transaction with generated unique ID', () => {
    const { result } = renderHook(() => useTransactions(), { wrapper: makeWrapper() });

    act(() => {
      result.current.addTransaction(makeTx());
      result.current.addTransaction(makeTx());
    });

    const ids = result.current.transactions.map(t => t.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('prepends new transaction (most recent first)', () => {
    const { result } = renderHook(() => useTransactions(), { wrapper: makeWrapper() });

    act(() => {
      result.current.addTransaction(makeTx({ description: 'First' }));
      result.current.addTransaction(makeTx({ description: 'Second' }));
    });

    expect(result.current.transactions[0].description).toBe('Second');
  });

  it('added transaction appears in active list (not deleted)', () => {
    const { result } = renderHook(() => useTransactions(), { wrapper: makeWrapper() });

    act(() => {
      result.current.addTransaction(makeTx({ description: 'Active TX' }));
    });

    const found = result.current.transactions.find(t => t.description === 'Active TX');
    expect(found?.deletedAt).toBeUndefined();
  });
});

// ===========================
// addManyTransactions
// ===========================

describe('TransactionsContext — addManyTransactions', () => {
  it('adds multiple transactions in bulk', () => {
    const { result } = renderHook(() => useTransactions(), { wrapper: makeWrapper() });
    const initialCount = result.current.transactions.length;
    const bulk = [makeTx({ description: 'Bulk 1' }), makeTx({ description: 'Bulk 2' }), makeTx({ description: 'Bulk 3' })];

    act(() => {
      result.current.addManyTransactions(bulk);
    });

    expect(result.current.transactions.length).toBe(initialCount + 3);
  });

  it('assigns unique IDs to all bulk transactions', () => {
    const { result } = renderHook(() => useTransactions(), { wrapper: makeWrapper() });
    const bulk = Array.from({ length: 5 }, () => makeTx());

    act(() => {
      result.current.addManyTransactions(bulk);
    });

    const allIds = result.current.transactions.map(t => t.id);
    expect(new Set(allIds).size).toBe(allIds.length);
  });

  it('handles empty array without error', () => {
    const { result } = renderHook(() => useTransactions(), { wrapper: makeWrapper() });
    const initialCount = result.current.transactions.length;

    act(() => {
      result.current.addManyTransactions([]);
    });

    expect(result.current.transactions.length).toBe(initialCount);
  });
});

// ===========================
// updateTransaction
// ===========================

describe('TransactionsContext — updateTransaction', () => {
  it('updates an existing transaction', () => {
    const { result } = renderHook(() => useTransactions(), { wrapper: makeWrapper() });

    act(() => {
      result.current.addTransaction(makeTx({ description: 'Original' }));
    });

    const added = result.current.transactions[0];

    act(() => {
      result.current.updateTransaction({ ...added, description: 'Updated' });
    });

    const updated = result.current.transactions.find(t => t.id === added.id);
    expect(updated?.description).toBe('Updated');
  });

  it('does not change other transactions', () => {
    const { result } = renderHook(() => useTransactions(), { wrapper: makeWrapper() });

    act(() => {
      result.current.addTransaction(makeTx({ description: 'TX 1' }));
      result.current.addTransaction(makeTx({ description: 'TX 2' }));
    });

    const [tx2, tx1] = result.current.transactions;

    act(() => {
      result.current.updateTransaction({ ...tx1, value: 9999 });
    });

    const unchanged = result.current.transactions.find(t => t.id === tx2.id);
    expect(unchanged?.description).toBe('TX 2');
  });

  it('preserves count after update', () => {
    const { result } = renderHook(() => useTransactions(), { wrapper: makeWrapper() });

    act(() => {
      result.current.addTransaction(makeTx());
    });

    const count = result.current.transactions.length;
    const tx = result.current.transactions[0];

    act(() => {
      result.current.updateTransaction({ ...tx, value: 500 });
    });

    expect(result.current.transactions.length).toBe(count);
  });
});

// ===========================
// updateTransactions (bulk)
// ===========================

describe('TransactionsContext — updateTransactions', () => {
  it('bulk-updates multiple transactions', () => {
    const { result } = renderHook(() => useTransactions(), { wrapper: makeWrapper() });

    act(() => {
      result.current.addTransaction(makeTx({ description: 'A' }));
      result.current.addTransaction(makeTx({ description: 'B' }));
    });

    const [txB, txA] = result.current.transactions;

    act(() => {
      result.current.updateTransactions([
        { ...txA, description: 'A Updated' },
        { ...txB, description: 'B Updated' },
      ]);
    });

    expect(result.current.transactions.find(t => t.id === txA.id)?.description).toBe('A Updated');
    expect(result.current.transactions.find(t => t.id === txB.id)?.description).toBe('B Updated');
  });

  it('leaves untouched transactions unchanged', () => {
    const { result } = renderHook(() => useTransactions(), { wrapper: makeWrapper() });

    act(() => {
      result.current.addTransaction(makeTx({ description: 'Untouched' }));
      result.current.addTransaction(makeTx({ description: 'ToUpdate' }));
    });

    const [toUpdate, untouched] = result.current.transactions;

    act(() => {
      result.current.updateTransactions([{ ...toUpdate, description: 'Updated' }]);
    });

    expect(result.current.transactions.find(t => t.id === untouched.id)?.description).toBe('Untouched');
  });
});

// ===========================
// deleteTransaction
// ===========================

describe('TransactionsContext — deleteTransaction', () => {
  it('soft-deletes a transaction (hides from active list)', () => {
    const { result } = renderHook(() => useTransactions(), { wrapper: makeWrapper() });

    act(() => {
      result.current.addTransaction(makeTx({ description: 'To Delete' }));
    });

    const tx = result.current.transactions[0];

    act(() => {
      result.current.deleteTransaction(tx.id);
    });

    const found = result.current.transactions.find(t => t.id === tx.id);
    expect(found).toBeUndefined(); // not in active list
  });

  it('deleted transaction appears in getDeletedTransactions()', () => {
    const { result } = renderHook(() => useTransactions(), { wrapper: makeWrapper() });

    act(() => {
      result.current.addTransaction(makeTx({ description: 'To Delete' }));
    });

    const tx = result.current.transactions[0];

    act(() => {
      result.current.deleteTransaction(tx.id);
    });

    const deleted = result.current.getDeletedTransactions();
    expect(deleted.some(t => t.id === tx.id)).toBe(true);
    expect(deleted.find(t => t.id === tx.id)?.deletedAt).toBeDefined();
  });

  it('is idempotent — deleting already-deleted tx does nothing extra', () => {
    const { result } = renderHook(() => useTransactions(), { wrapper: makeWrapper() });

    act(() => {
      result.current.addTransaction(makeTx());
    });

    const tx = result.current.transactions[0];

    act(() => {
      result.current.deleteTransaction(tx.id);
    });

    const firstDeletion = result.current.getDeletedTransactions().find(t => t.id === tx.id);
    const ts1 = firstDeletion?.deletedAt;

    act(() => {
      result.current.deleteTransaction(tx.id); // second call
    });

    const secondDeletion = result.current.getDeletedTransactions().find(t => t.id === tx.id);
    expect(secondDeletion?.deletedAt).toBe(ts1); // timestamp unchanged
  });

  it('does not affect other transactions', () => {
    const { result } = renderHook(() => useTransactions(), { wrapper: makeWrapper() });

    act(() => {
      result.current.addTransaction(makeTx({ description: 'Keep' }));
      result.current.addTransaction(makeTx({ description: 'Delete' }));
    });

    const [toDelete, toKeep] = result.current.transactions;

    act(() => {
      result.current.deleteTransaction(toDelete.id);
    });

    expect(result.current.transactions.some(t => t.id === toKeep.id)).toBe(true);
  });
});

// ===========================
// deleteTransactions (bulk)
// ===========================

describe('TransactionsContext — deleteTransactions', () => {
  it('bulk soft-deletes multiple transactions', () => {
    const { result } = renderHook(() => useTransactions(), { wrapper: makeWrapper() });

    act(() => {
      result.current.addTransaction(makeTx({ description: 'A' }));
      result.current.addTransaction(makeTx({ description: 'B' }));
      result.current.addTransaction(makeTx({ description: 'C' }));
    });

    const [txC, txB, txA] = result.current.transactions;

    act(() => {
      result.current.deleteTransactions([txA.id, txB.id]);
    });

    expect(result.current.transactions.some(t => t.id === txA.id)).toBe(false);
    expect(result.current.transactions.some(t => t.id === txB.id)).toBe(false);
    expect(result.current.transactions.some(t => t.id === txC.id)).toBe(true);
  });

  it('skips already-deleted transactions', () => {
    const { result } = renderHook(() => useTransactions(), { wrapper: makeWrapper() });

    act(() => {
      result.current.addTransaction(makeTx());
    });

    const tx = result.current.transactions[0];

    act(() => {
      result.current.deleteTransactions([tx.id]);
    });

    const ts1 = result.current.getDeletedTransactions().find(t => t.id === tx.id)?.deletedAt;

    act(() => {
      result.current.deleteTransactions([tx.id]); // second attempt
    });

    const ts2 = result.current.getDeletedTransactions().find(t => t.id === tx.id)?.deletedAt;
    expect(ts1).toBe(ts2);
  });

  it('handles empty array without error', () => {
    const { result } = renderHook(() => useTransactions(), { wrapper: makeWrapper() });

    act(() => {
      result.current.addTransaction(makeTx());
    });

    const count = result.current.transactions.length;

    act(() => {
      result.current.deleteTransactions([]);
    });

    expect(result.current.transactions.length).toBe(count);
  });
});

// ===========================
// Transaction Groups
// ===========================

describe('TransactionsContext — transaction groups', () => {
  const GROUP_ID = 'group-test-001';

  function addGroupTxs(result: any) {
    act(() => {
      result.current.addManyTransactions([
        makeTx({ groupId: GROUP_ID, groupIndex: 1, description: 'Installment 1' }),
        makeTx({ groupId: GROUP_ID, groupIndex: 2, description: 'Installment 2' }),
        makeTx({ groupId: GROUP_ID, groupIndex: 3, description: 'Installment 3' }),
        makeTx({ description: 'Standalone TX' }),
      ]);
    });
  }

  it('getTransactionsByGroupId returns sorted group transactions', () => {
    const { result } = renderHook(() => useTransactions(), { wrapper: makeWrapper() });
    addGroupTxs(result);

    const group = result.current.getTransactionsByGroupId(GROUP_ID);
    expect(group).toHaveLength(3);
    expect(group[0].groupIndex).toBe(1);
    expect(group[1].groupIndex).toBe(2);
    expect(group[2].groupIndex).toBe(3);
  });

  it('getTransactionsByGroupId excludes deleted transactions', () => {
    const { result } = renderHook(() => useTransactions(), { wrapper: makeWrapper() });
    addGroupTxs(result);

    const group = result.current.getTransactionsByGroupId(GROUP_ID);
    const toDelete = group[0];

    act(() => {
      result.current.deleteTransaction(toDelete.id);
    });

    const updated = result.current.getTransactionsByGroupId(GROUP_ID);
    expect(updated).toHaveLength(2);
    expect(updated.some(t => t.id === toDelete.id)).toBe(false);
  });

  it('getTransactionsByGroupId returns empty array for unknown group', () => {
    const { result } = renderHook(() => useTransactions(), { wrapper: makeWrapper() });
    expect(result.current.getTransactionsByGroupId('nonexistent')).toHaveLength(0);
  });

  it('deleteTransactionGroup soft-deletes all transactions in group', () => {
    const { result } = renderHook(() => useTransactions(), { wrapper: makeWrapper() });
    addGroupTxs(result);

    act(() => {
      result.current.deleteTransactionGroup(GROUP_ID);
    });

    const group = result.current.getTransactionsByGroupId(GROUP_ID);
    expect(group).toHaveLength(0);

    const deleted = result.current.getDeletedTransactions().filter(t => t.groupId === GROUP_ID);
    expect(deleted).toHaveLength(3);
  });

  it('deleteTransactionGroup does not affect standalone transactions', () => {
    const { result } = renderHook(() => useTransactions(), { wrapper: makeWrapper() });
    addGroupTxs(result);

    act(() => {
      result.current.deleteTransactionGroup(GROUP_ID);
    });

    const standalone = result.current.transactions.find(t => t.description === 'Standalone TX');
    expect(standalone).toBeDefined();
  });

  it('deleteTransactionGroup does nothing for empty/nonexistent group', () => {
    const { result } = renderHook(() => useTransactions(), { wrapper: makeWrapper() });
    addGroupTxs(result);
    const count = result.current.transactions.length;

    act(() => {
      result.current.deleteTransactionGroup('nonexistent-group');
    });

    expect(result.current.transactions.length).toBe(count);
  });

  it('deleteTransactionGroupFromIndex deletes from index onwards only', () => {
    const { result } = renderHook(() => useTransactions(), { wrapper: makeWrapper() });
    addGroupTxs(result);

    act(() => {
      result.current.deleteTransactionGroupFromIndex(GROUP_ID, 2); // delete index 2 and 3
    });

    const group = result.current.getTransactionsByGroupId(GROUP_ID);
    expect(group).toHaveLength(1);
    expect(group[0].groupIndex).toBe(1);
  });

  it('deleteTransactionGroupFromIndex index 1 deletes entire group', () => {
    const { result } = renderHook(() => useTransactions(), { wrapper: makeWrapper() });
    addGroupTxs(result);

    act(() => {
      result.current.deleteTransactionGroupFromIndex(GROUP_ID, 1);
    });

    expect(result.current.getTransactionsByGroupId(GROUP_ID)).toHaveLength(0);
  });
});

// ===========================
// recoverTransaction
// ===========================

describe('TransactionsContext — recoverTransaction', () => {
  it('recovers a soft-deleted transaction', () => {
    const { result } = renderHook(() => useTransactions(), { wrapper: makeWrapper() });

    act(() => {
      result.current.addTransaction(makeTx({ description: 'Recover Me' }));
    });

    const tx = result.current.transactions[0];

    act(() => {
      result.current.deleteTransaction(tx.id);
    });

    expect(result.current.getDeletedTransactions().some(t => t.id === tx.id)).toBe(true);

    act(() => {
      result.current.recoverTransaction(tx.id);
    });

    expect(result.current.transactions.some(t => t.id === tx.id)).toBe(true);
    expect(result.current.getDeletedTransactions().some(t => t.id === tx.id)).toBe(false);
  });

  it('does nothing when recovering an active (non-deleted) transaction', () => {
    const { result } = renderHook(() => useTransactions(), { wrapper: makeWrapper() });

    act(() => {
      result.current.addTransaction(makeTx());
    });

    const tx = result.current.transactions[0];
    const count = result.current.transactions.length;

    act(() => {
      result.current.recoverTransaction(tx.id); // not deleted — no-op
    });

    expect(result.current.transactions.length).toBe(count);
  });

  it('does nothing for unknown transaction ID', () => {
    const { result } = renderHook(() => useTransactions(), { wrapper: makeWrapper() });
    const count = result.current.transactions.length;

    act(() => {
      result.current.recoverTransaction('nonexistent-id');
    });

    expect(result.current.transactions.length).toBe(count);
  });
});

// ===========================
// getDeletedTransactions
// ===========================

describe('TransactionsContext — getDeletedTransactions', () => {
  it('returns empty array when nothing is deleted', () => {
    const { result } = renderHook(() => useTransactions(), { wrapper: makeWrapper() });
    expect(result.current.getDeletedTransactions()).toHaveLength(0);
  });

  it('returns only deleted transactions', () => {
    const { result } = renderHook(() => useTransactions(), { wrapper: makeWrapper() });

    act(() => {
      result.current.addTransaction(makeTx({ description: 'Del 1' }));
      result.current.addTransaction(makeTx({ description: 'Del 2' }));
      result.current.addTransaction(makeTx({ description: 'Keep' }));
    });

    const [keep, del2, del1] = result.current.transactions;

    act(() => {
      result.current.deleteTransaction(del1.id);
      result.current.deleteTransaction(del2.id);
    });

    const deleted = result.current.getDeletedTransactions();
    expect(deleted.every(t => t.deletedAt !== undefined)).toBe(true);
    expect(deleted.some(t => t.id === del1.id)).toBe(true);
    expect(deleted.some(t => t.id === del2.id)).toBe(true);
    expect(deleted.some(t => t.id === keep.id)).toBe(false);
  });
});

// ===========================
// updateCategoryBudget
// ===========================

describe('TransactionsContext — updateCategoryBudget', () => {
  it('adds new budget for a category', () => {
    const { result } = renderHook(() => useTransactions(), { wrapper: makeWrapper() });

    act(() => {
      result.current.updateCategoryBudget('cat-food', 500);
    });

    const budget = result.current.categoryBudgets.find(b => b.categoryId === 'cat-food');
    expect(budget).toBeDefined();
    expect(budget?.limit).toBe(500);
  });

  it('updates existing budget for a category', () => {
    const { result } = renderHook(() => useTransactions(), { wrapper: makeWrapper() });

    act(() => {
      result.current.updateCategoryBudget('cat-food', 500);
    });

    act(() => {
      result.current.updateCategoryBudget('cat-food', 800);
    });

    const budgets = result.current.categoryBudgets.filter(b => b.categoryId === 'cat-food');
    expect(budgets).toHaveLength(1);
    expect(budgets[0].limit).toBe(800);
  });

  it('maintains separate budgets for different categories', () => {
    const { result } = renderHook(() => useTransactions(), { wrapper: makeWrapper() });

    act(() => {
      result.current.updateCategoryBudget('cat-food', 500);
      result.current.updateCategoryBudget('cat-transport', 300);
    });

    expect(result.current.categoryBudgets).toHaveLength(2);
    expect(result.current.categoryBudgets.find(b => b.categoryId === 'cat-food')?.limit).toBe(500);
    expect(result.current.categoryBudgets.find(b => b.categoryId === 'cat-transport')?.limit).toBe(300);
  });
});

// ===========================
// localStorage persistence
// ===========================

describe('TransactionsContext — localStorage persistence', () => {
  it('persists state to localStorage after mutation', () => {
    const userId = 'persist-test';
    const { result } = renderHook(() => useTransactions(), { wrapper: makeWrapper(userId) });

    act(() => {
      result.current.addTransaction(makeTx({ description: 'Persisted TX' }));
    });

    const stored = localStorage.getItem(`visao360_v2_transactions_${userId}`);
    expect(stored).not.toBeNull();

    const parsed = JSON.parse(stored!);
    expect(parsed.transactions.some((t: any) => t.description === 'Persisted TX')).toBe(true);
  });

  it('persists categoryBudgets to localStorage', () => {
    const userId = 'persist-budget';
    const { result } = renderHook(() => useTransactions(), { wrapper: makeWrapper(userId) });

    act(() => {
      result.current.updateCategoryBudget('cat-x', 999);
    });

    const stored = JSON.parse(localStorage.getItem(`visao360_v2_transactions_${userId}`)!);
    expect(stored.categoryBudgets.some((b: any) => b.categoryId === 'cat-x')).toBe(true);
  });
});

// ===========================
// onStateChange callback
// ===========================

describe('TransactionsContext — onStateChange callback', () => {
  it('calls onStateChange after addTransaction', () => {
    const onStateChange = vi.fn();
    const wrapper = ({ children }: any) => (
      <TransactionsProvider onStateChange={onStateChange}>{children}</TransactionsProvider>
    );

    const { result } = renderHook(() => useTransactions(), { wrapper });

    act(() => {
      result.current.addTransaction(makeTx());
    });

    expect(onStateChange).toHaveBeenCalled();
  });
});
