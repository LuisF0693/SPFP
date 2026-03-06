import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AccountsProvider, useAccounts } from '../context/AccountsContext';
import { createMockAccount, createMockCategory } from './test-utils';
import type { Account, Category } from '../types';

// ===========================
// Test Helpers
// ===========================

function makeWrapper(userId?: string) {
  return ({ children }: { children: React.ReactNode }) => (
    <AccountsProvider userId={userId}>{children}</AccountsProvider>
  );
}

function makeAccount(overrides?: Partial<Account>): Omit<Account, 'id'> {
  const { id: _id, ...rest } = createMockAccount(overrides);
  return rest;
}

function makeCategory(overrides?: Partial<Category>): Omit<Category, 'id'> {
  const { id: _id, ...rest } = createMockCategory(overrides);
  return rest;
}

// ===========================
// useAccounts — Provider guard
// ===========================

describe('useAccounts', () => {
  it('throws when used outside provider', () => {
    const { result } = renderHook(() => {
      try {
        return useAccounts();
      } catch (e: any) {
        return { error: e.message };
      }
    });
    expect((result.current as any).error).toContain('useAccounts must be used within');
  });
});

// ===========================
// Initial State
// ===========================

describe('AccountsContext — initial state', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('provides initial accounts (INITIAL_ACCOUNTS)', () => {
    const { result } = renderHook(() => useAccounts(), { wrapper: makeWrapper() });
    expect(Array.isArray(result.current.accounts)).toBe(true);
  });

  it('provides initial categories (INITIAL_CATEGORIES)', () => {
    const { result } = renderHook(() => useAccounts(), { wrapper: makeWrapper() });
    expect(Array.isArray(result.current.categories)).toBe(true);
  });

  it('computes totalBalance from initial accounts', () => {
    const { result } = renderHook(() => useAccounts(), { wrapper: makeWrapper() });
    expect(typeof result.current.totalBalance).toBe('number');
  });

  it('loads persisted state from localStorage on mount', () => {
    const key = 'visao360_v2_accounts_user-persist';
    const stored = {
      accounts: [createMockAccount({ id: 'acc-persisted', balance: 9999 })],
      categories: [],
      lastUpdated: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(stored));

    const { result } = renderHook(() => useAccounts(), { wrapper: makeWrapper('user-persist') });
    const found = result.current.accounts.find(a => a.id === 'acc-persisted');
    expect(found).toBeDefined();
    expect(found?.balance).toBe(9999);
  });

  it('falls back to defaults when localStorage is corrupted', () => {
    localStorage.setItem('visao360_v2_accounts_user-corrupt', '{invalid}');
    const { result } = renderHook(() => useAccounts(), { wrapper: makeWrapper('user-corrupt') });
    expect(Array.isArray(result.current.accounts)).toBe(true);
  });

  it('uses different storage key per userId', () => {
    localStorage.setItem('visao360_v2_accounts_user-X', JSON.stringify({
      accounts: [createMockAccount({ id: 'acc-X', balance: 1111 })],
      categories: [],
      lastUpdated: 1,
    }));
    localStorage.setItem('visao360_v2_accounts_user-Y', JSON.stringify({
      accounts: [createMockAccount({ id: 'acc-Y', balance: 2222 })],
      categories: [],
      lastUpdated: 1,
    }));

    const { result: rX } = renderHook(() => useAccounts(), { wrapper: makeWrapper('user-X') });
    const { result: rY } = renderHook(() => useAccounts(), { wrapper: makeWrapper('user-Y') });

    expect(rX.current.accounts.some(a => a.id === 'acc-X')).toBe(true);
    expect(rY.current.accounts.some(a => a.id === 'acc-Y')).toBe(true);
    expect(rX.current.accounts.some(a => a.id === 'acc-Y')).toBe(false);
  });
});

// ===========================
// addAccount
// ===========================

describe('AccountsContext — addAccount', () => {
  it('adds an account to the list', () => {
    const { result } = renderHook(() => useAccounts(), { wrapper: makeWrapper() });
    const initial = result.current.accounts.length;

    act(() => {
      result.current.addAccount(makeAccount({ name: 'New Account', balance: 1000 }));
    });

    expect(result.current.accounts.length).toBe(initial + 1);
    expect(result.current.accounts.some(a => a.name === 'New Account')).toBe(true);
  });

  it('generates unique ID for added account', () => {
    const { result } = renderHook(() => useAccounts(), { wrapper: makeWrapper() });

    act(() => {
      result.current.addAccount(makeAccount({ name: 'Acc 1' }));
      result.current.addAccount(makeAccount({ name: 'Acc 2' }));
    });

    const ids = result.current.accounts.map(a => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('new account appears in active list', () => {
    const { result } = renderHook(() => useAccounts(), { wrapper: makeWrapper() });

    act(() => {
      result.current.addAccount(makeAccount({ name: 'Active Account' }));
    });

    const found = result.current.accounts.find(a => a.name === 'Active Account');
    expect(found?.deletedAt).toBeUndefined();
  });

  it('new account balance is reflected in totalBalance', () => {
    const { result } = renderHook(() => useAccounts(), { wrapper: makeWrapper('total-test') });

    // Start clean
    localStorage.setItem('visao360_v2_accounts_total-test', JSON.stringify({
      accounts: [],
      categories: [],
      lastUpdated: 0,
    }));

    const { result: cleanResult } = renderHook(() => useAccounts(), { wrapper: makeWrapper('total-test') });
    const initialTotal = cleanResult.current.totalBalance;

    act(() => {
      cleanResult.current.addAccount(makeAccount({ balance: 5000 }));
    });

    expect(cleanResult.current.totalBalance).toBe(initialTotal + 5000);
  });
});

// ===========================
// updateAccount
// ===========================

describe('AccountsContext — updateAccount', () => {
  it('updates an existing account', () => {
    const { result } = renderHook(() => useAccounts(), { wrapper: makeWrapper() });

    act(() => {
      result.current.addAccount(makeAccount({ name: 'Original Name', balance: 1000 }));
    });

    const added = result.current.accounts.find(a => a.name === 'Original Name')!;

    act(() => {
      result.current.updateAccount({ ...added, name: 'Updated Name', balance: 2000 });
    });

    const updated = result.current.accounts.find(a => a.id === added.id);
    expect(updated?.name).toBe('Updated Name');
    expect(updated?.balance).toBe(2000);
  });

  it('preserves account count after update', () => {
    const { result } = renderHook(() => useAccounts(), { wrapper: makeWrapper() });

    act(() => {
      result.current.addAccount(makeAccount());
    });

    const count = result.current.accounts.length;
    const acc = result.current.accounts[0];

    act(() => {
      result.current.updateAccount({ ...acc, balance: 9999 });
    });

    expect(result.current.accounts.length).toBe(count);
  });

  it('does not change other accounts', () => {
    const { result } = renderHook(() => useAccounts(), { wrapper: makeWrapper() });

    act(() => {
      result.current.addAccount(makeAccount({ name: 'Account A', balance: 100 }));
      result.current.addAccount(makeAccount({ name: 'Account B', balance: 200 }));
    });

    const accA = result.current.accounts.find(a => a.name === 'Account A')!;
    const accB = result.current.accounts.find(a => a.name === 'Account B')!;

    act(() => {
      result.current.updateAccount({ ...accA, balance: 999 });
    });

    const unchangedB = result.current.accounts.find(a => a.id === accB.id);
    expect(unchangedB?.balance).toBe(200);
  });
});

// ===========================
// deleteAccount (soft delete)
// ===========================

describe('AccountsContext — deleteAccount', () => {
  it('soft-deletes an account (removes from active list)', () => {
    const { result } = renderHook(() => useAccounts(), { wrapper: makeWrapper() });

    act(() => {
      result.current.addAccount(makeAccount({ name: 'To Delete' }));
    });

    const acc = result.current.accounts.find(a => a.name === 'To Delete')!;

    act(() => {
      result.current.deleteAccount(acc.id);
    });

    expect(result.current.accounts.some(a => a.id === acc.id)).toBe(false);
  });

  it('deleted account appears in getDeletedAccounts()', () => {
    const { result } = renderHook(() => useAccounts(), { wrapper: makeWrapper() });

    act(() => {
      result.current.addAccount(makeAccount({ name: 'Deleted Account' }));
    });

    const acc = result.current.accounts.find(a => a.name === 'Deleted Account')!;

    act(() => {
      result.current.deleteAccount(acc.id);
    });

    const deleted = result.current.getDeletedAccounts();
    expect(deleted.some(a => a.id === acc.id)).toBe(true);
    expect(deleted.find(a => a.id === acc.id)?.deletedAt).toBeDefined();
  });

  it('is idempotent — deleting already-deleted account does not change deletedAt', () => {
    const { result } = renderHook(() => useAccounts(), { wrapper: makeWrapper() });

    act(() => {
      result.current.addAccount(makeAccount({ name: 'Idempotent' }));
    });

    const acc = result.current.accounts.find(a => a.name === 'Idempotent')!;

    act(() => {
      result.current.deleteAccount(acc.id);
    });

    const ts1 = result.current.getDeletedAccounts().find(a => a.id === acc.id)?.deletedAt;

    act(() => {
      result.current.deleteAccount(acc.id); // second call
    });

    const ts2 = result.current.getDeletedAccounts().find(a => a.id === acc.id)?.deletedAt;
    expect(ts1).toBe(ts2);
  });

  it('reduces totalBalance when account is deleted', () => {
    const userId = 'delete-balance-test';
    localStorage.setItem(`visao360_v2_accounts_${userId}`, JSON.stringify({
      accounts: [createMockAccount({ id: 'acc-del-1', balance: 3000 })],
      categories: [],
      lastUpdated: 0,
    }));

    const { result } = renderHook(() => useAccounts(), { wrapper: makeWrapper(userId) });
    const before = result.current.totalBalance;

    act(() => {
      result.current.deleteAccount('acc-del-1');
    });

    expect(result.current.totalBalance).toBe(before - 3000);
  });
});

// ===========================
// recoverAccount
// ===========================

describe('AccountsContext — recoverAccount', () => {
  it('recovers a soft-deleted account', () => {
    const { result } = renderHook(() => useAccounts(), { wrapper: makeWrapper() });

    act(() => {
      result.current.addAccount(makeAccount({ name: 'Recover Me' }));
    });

    const acc = result.current.accounts.find(a => a.name === 'Recover Me')!;

    act(() => {
      result.current.deleteAccount(acc.id);
    });

    expect(result.current.accounts.some(a => a.id === acc.id)).toBe(false);

    act(() => {
      result.current.recoverAccount(acc.id);
    });

    expect(result.current.accounts.some(a => a.id === acc.id)).toBe(true);
    expect(result.current.getDeletedAccounts().some(a => a.id === acc.id)).toBe(false);
  });

  it('does nothing when recovering active account', () => {
    const { result } = renderHook(() => useAccounts(), { wrapper: makeWrapper() });

    act(() => {
      result.current.addAccount(makeAccount({ name: 'Active' }));
    });

    const acc = result.current.accounts.find(a => a.name === 'Active')!;
    const count = result.current.accounts.length;

    act(() => {
      result.current.recoverAccount(acc.id); // not deleted, no-op
    });

    expect(result.current.accounts.length).toBe(count);
  });

  it('does nothing for unknown account ID', () => {
    const { result } = renderHook(() => useAccounts(), { wrapper: makeWrapper() });
    const count = result.current.accounts.length;

    act(() => {
      result.current.recoverAccount('nonexistent');
    });

    expect(result.current.accounts.length).toBe(count);
  });
});

// ===========================
// getDeletedAccounts
// ===========================

describe('AccountsContext — getDeletedAccounts', () => {
  it('returns empty array when nothing is deleted', () => {
    localStorage.setItem('visao360_v2_accounts_empty-del', JSON.stringify({
      accounts: [],
      categories: [],
      lastUpdated: 0,
    }));
    const { result } = renderHook(() => useAccounts(), { wrapper: makeWrapper('empty-del') });
    expect(result.current.getDeletedAccounts()).toHaveLength(0);
  });

  it('returns only deleted accounts', () => {
    const { result } = renderHook(() => useAccounts(), { wrapper: makeWrapper() });

    act(() => {
      result.current.addAccount(makeAccount({ name: 'Keep' }));
      result.current.addAccount(makeAccount({ name: 'Delete' }));
    });

    const toKeep = result.current.accounts.find(a => a.name === 'Keep')!;
    const toDelete = result.current.accounts.find(a => a.name === 'Delete')!;

    act(() => {
      result.current.deleteAccount(toDelete.id);
    });

    const deleted = result.current.getDeletedAccounts();
    expect(deleted.some(a => a.id === toDelete.id)).toBe(true);
    expect(deleted.some(a => a.id === toKeep.id)).toBe(false);
    expect(deleted.every(a => a.deletedAt !== undefined)).toBe(true);
  });
});

// ===========================
// getAccountBalance
// ===========================

describe('AccountsContext — getAccountBalance', () => {
  it('returns balance for a specific account ID', () => {
    const userId = 'balance-query';
    localStorage.setItem(`visao360_v2_accounts_${userId}`, JSON.stringify({
      accounts: [createMockAccount({ id: 'acc-balance', balance: 7777 })],
      categories: [],
      lastUpdated: 0,
    }));

    const { result } = renderHook(() => useAccounts(), { wrapper: makeWrapper(userId) });
    expect(result.current.getAccountBalance('acc-balance')).toBe(7777);
  });

  it('returns 0 for nonexistent account ID', () => {
    const { result } = renderHook(() => useAccounts(), { wrapper: makeWrapper() });
    expect(result.current.getAccountBalance('nonexistent')).toBe(0);
  });

  it('returns 0 for deleted account', () => {
    const { result } = renderHook(() => useAccounts(), { wrapper: makeWrapper() });

    act(() => {
      result.current.addAccount(makeAccount({ name: 'Will Delete', balance: 500 }));
    });

    const acc = result.current.accounts.find(a => a.name === 'Will Delete')!;

    act(() => {
      result.current.deleteAccount(acc.id);
    });

    expect(result.current.getAccountBalance(acc.id)).toBe(0);
  });
});

// ===========================
// totalBalance
// ===========================

describe('AccountsContext — totalBalance', () => {
  it('is sum of all active account balances', () => {
    const userId = 'total-balance';
    localStorage.setItem(`visao360_v2_accounts_${userId}`, JSON.stringify({
      accounts: [
        createMockAccount({ id: 'a1', balance: 1000 }),
        createMockAccount({ id: 'a2', balance: 2000 }),
        createMockAccount({ id: 'a3', balance: 3000 }),
      ],
      categories: [],
      lastUpdated: 0,
    }));

    const { result } = renderHook(() => useAccounts(), { wrapper: makeWrapper(userId) });
    expect(result.current.totalBalance).toBe(6000);
  });

  it('excludes deleted accounts from totalBalance', () => {
    const userId = 'total-excl-deleted';
    localStorage.setItem(`visao360_v2_accounts_${userId}`, JSON.stringify({
      accounts: [
        createMockAccount({ id: 'a1', balance: 1000 }),
        createMockAccount({ id: 'a2', balance: 2000 }),
      ],
      categories: [],
      lastUpdated: 0,
    }));

    const { result } = renderHook(() => useAccounts(), { wrapper: makeWrapper(userId) });

    act(() => {
      result.current.deleteAccount('a2');
    });

    expect(result.current.totalBalance).toBe(1000);
  });

  it('is 0 when no active accounts', () => {
    localStorage.setItem('visao360_v2_accounts_no-accounts', JSON.stringify({
      accounts: [],
      categories: [],
      lastUpdated: 0,
    }));
    const { result } = renderHook(() => useAccounts(), { wrapper: makeWrapper('no-accounts') });
    expect(result.current.totalBalance).toBe(0);
  });
});

// ===========================
// addCategory
// ===========================

describe('AccountsContext — addCategory', () => {
  it('adds a category and returns its ID', () => {
    const { result } = renderHook(() => useAccounts(), { wrapper: makeWrapper() });
    let newId: string = '';

    act(() => {
      newId = result.current.addCategory(makeCategory({ name: 'New Category' }));
    });

    expect(typeof newId).toBe('string');
    expect(newId.length).toBeGreaterThan(0);
    expect(result.current.categories.some(c => c.id === newId)).toBe(true);
  });

  it('category appears in active categories', () => {
    const { result } = renderHook(() => useAccounts(), { wrapper: makeWrapper() });

    act(() => {
      result.current.addCategory(makeCategory({ name: 'Alimentacao' }));
    });

    expect(result.current.categories.some(c => c.name === 'Alimentacao')).toBe(true);
  });

  it('generates unique IDs for multiple categories', () => {
    const { result } = renderHook(() => useAccounts(), { wrapper: makeWrapper() });
    const ids: string[] = [];

    act(() => {
      ids.push(result.current.addCategory(makeCategory({ name: 'Cat 1' })));
      ids.push(result.current.addCategory(makeCategory({ name: 'Cat 2' })));
      ids.push(result.current.addCategory(makeCategory({ name: 'Cat 3' })));
    });

    expect(new Set(ids).size).toBe(3);
  });
});

// ===========================
// updateCategory
// ===========================

describe('AccountsContext — updateCategory', () => {
  it('updates an existing category', () => {
    const { result } = renderHook(() => useAccounts(), { wrapper: makeWrapper() });
    let catId: string = '';

    act(() => {
      catId = result.current.addCategory(makeCategory({ name: 'Original Cat', color: '#FF0000' }));
    });

    const cat = result.current.categories.find(c => c.id === catId)!;

    act(() => {
      result.current.updateCategory({ ...cat, name: 'Updated Cat', color: '#00FF00' });
    });

    const updated = result.current.categories.find(c => c.id === catId);
    expect(updated?.name).toBe('Updated Cat');
    expect(updated?.color).toBe('#00FF00');
  });
});

// ===========================
// deleteCategory (soft delete)
// ===========================

describe('AccountsContext — deleteCategory', () => {
  it('soft-deletes a category (removes from active list)', () => {
    const { result } = renderHook(() => useAccounts(), { wrapper: makeWrapper() });
    let catId: string = '';

    act(() => {
      catId = result.current.addCategory(makeCategory({ name: 'To Delete Cat' }));
    });

    act(() => {
      result.current.deleteCategory(catId);
    });

    expect(result.current.categories.some(c => c.id === catId)).toBe(false);
  });

  it('is idempotent when deleting already-deleted category', () => {
    const { result } = renderHook(() => useAccounts(), { wrapper: makeWrapper() });
    let catId: string = '';

    act(() => {
      catId = result.current.addCategory(makeCategory({ name: 'Idempotent Cat' }));
    });

    act(() => {
      result.current.deleteCategory(catId);
      result.current.deleteCategory(catId); // second call
    });

    expect(result.current.categories.some(c => c.id === catId)).toBe(false);
  });

  it('does not delete other categories', () => {
    const { result } = renderHook(() => useAccounts(), { wrapper: makeWrapper() });
    let catA: string = '';
    let catB: string = '';

    act(() => {
      catA = result.current.addCategory(makeCategory({ name: 'Cat A' }));
      catB = result.current.addCategory(makeCategory({ name: 'Cat B' }));
    });

    act(() => {
      result.current.deleteCategory(catA);
    });

    expect(result.current.categories.some(c => c.id === catB)).toBe(true);
  });
});

// ===========================
// localStorage persistence
// ===========================

describe('AccountsContext — localStorage persistence', () => {
  it('persists accounts to localStorage after addAccount', () => {
    const userId = 'acc-persist';
    const { result } = renderHook(() => useAccounts(), { wrapper: makeWrapper(userId) });

    act(() => {
      result.current.addAccount(makeAccount({ name: 'Persisted Account', balance: 1234 }));
    });

    const stored = JSON.parse(localStorage.getItem(`visao360_v2_accounts_${userId}`)!);
    expect(stored.accounts.some((a: any) => a.name === 'Persisted Account')).toBe(true);
  });

  it('persists categories to localStorage after addCategory', () => {
    const userId = 'cat-persist';
    const { result } = renderHook(() => useAccounts(), { wrapper: makeWrapper(userId) });

    act(() => {
      result.current.addCategory(makeCategory({ name: 'Persisted Cat' }));
    });

    const stored = JSON.parse(localStorage.getItem(`visao360_v2_accounts_${userId}`)!);
    expect(stored.categories.some((c: any) => c.name === 'Persisted Cat')).toBe(true);
  });
});
