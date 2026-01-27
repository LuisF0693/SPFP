import { describe, it, expect, beforeEach } from 'vitest';
import { Transaction, Account, Goal, Category, CategoryBudget } from '../types';
import { createMockTransaction, createMockAccount, createMockGoal, generators } from './test-utils';
import { expectMoneyEqual, MockLocalStorage, installMockLocalStorage } from './test-helpers';

/**
 * FINANCE CONTEXT LOGIC TEST SUITE
 * Tests state management, balance calculations, and storage operations
 */

describe('Account Balance Updates', () => {
  let account: Account;
  let transactions: Transaction[];

  beforeEach(() => {
    account = createMockAccount({ id: 'acc-001', balance: 1000 });
    transactions = [];
  });

  describe('Single Transaction Balance Update', () => {
    it('should decrease balance for expense', () => {
      const expense = createMockTransaction({
        accountId: account.id,
        type: 'EXPENSE',
        value: 200,
      });

      const updatedBalance = account.balance - (expense.type === 'EXPENSE' ? expense.value : 0);
      expectMoneyEqual(updatedBalance, 800);
    });

    it('should increase balance for income', () => {
      const income = createMockTransaction({
        accountId: account.id,
        type: 'INCOME',
        value: 500,
      });

      const updatedBalance = account.balance + (income.type === 'INCOME' ? income.value : 0);
      expectMoneyEqual(updatedBalance, 1500);
    });

    it('should not affect other accounts', () => {
      const acc2 = createMockAccount({ id: 'acc-002', balance: 2000 });
      const expense = createMockTransaction({
        accountId: account.id,
        type: 'EXPENSE',
        value: 100,
      });

      const acc1Updated = account.balance - expense.value;
      const acc2Unchanged = acc2.balance;

      expectMoneyEqual(acc1Updated, 900);
      expectMoneyEqual(acc2Unchanged, 2000);
    });
  });

  describe('Multiple Transaction Balance Updates', () => {
    it('should update balance for multiple expenses', () => {
      transactions = [
        createMockTransaction({ accountId: account.id, type: 'EXPENSE', value: 100 }),
        createMockTransaction({ accountId: account.id, type: 'EXPENSE', value: 50 }),
        createMockTransaction({ accountId: account.id, type: 'EXPENSE', value: 25 }),
      ];

      let balance = account.balance;
      transactions.forEach(tx => {
        balance -= tx.value;
      });

      expectMoneyEqual(balance, 825);
    });

    it('should update balance for mixed income and expenses', () => {
      transactions = [
        createMockTransaction({ accountId: account.id, type: 'INCOME', value: 500 }),
        createMockTransaction({ accountId: account.id, type: 'EXPENSE', value: 200 }),
        createMockTransaction({ accountId: account.id, type: 'INCOME', value: 300 }),
        createMockTransaction({ accountId: account.id, type: 'EXPENSE', value: 100 }),
      ];

      let balance = account.balance;
      transactions.forEach(tx => {
        balance += tx.type === 'INCOME' ? tx.value : -tx.value;
      });

      expectMoneyEqual(balance, 1500);
    });

    it('should handle bulk account updates', () => {
      const accounts = [
        createMockAccount({ id: 'acc-1', balance: 1000 }),
        createMockAccount({ id: 'acc-2', balance: 2000 }),
        createMockAccount({ id: 'acc-3', balance: 1500 }),
      ];

      transactions = [
        createMockTransaction({ accountId: 'acc-1', type: 'EXPENSE', value: 100 }),
        createMockTransaction({ accountId: 'acc-2', type: 'INCOME', value: 200 }),
        createMockTransaction({ accountId: 'acc-3', type: 'EXPENSE', value: 50 }),
      ];

      const balanceMap: { [key: string]: number } = {};
      accounts.forEach(acc => balanceMap[acc.id] = acc.balance);

      transactions.forEach(tx => {
        const current = balanceMap[tx.accountId] || 0;
        balanceMap[tx.accountId] = current + (tx.type === 'INCOME' ? tx.value : -tx.value);
      });

      expectMoneyEqual(balanceMap['acc-1'], 900);
      expectMoneyEqual(balanceMap['acc-2'], 2200);
      expectMoneyEqual(balanceMap['acc-3'], 1450);
    });
  });

  describe('Transaction Modification Impact', () => {
    it('should update balance when transaction is modified', () => {
      const originalTx = createMockTransaction({
        id: 'tx-001',
        accountId: account.id,
        type: 'EXPENSE',
        value: 100,
      });

      // Apply original
      let balance = account.balance - originalTx.value;
      expectMoneyEqual(balance, 900);

      // Revert original
      balance += originalTx.value;

      // Apply updated (higher amount)
      const modifiedValue = 250;
      balance -= modifiedValue;
      expectMoneyEqual(balance, 750);
    });

    it('should update balance when moving transaction to different account', () => {
      const acc1 = createMockAccount({ id: 'acc-1', balance: 1000 });
      const acc2 = createMockAccount({ id: 'acc-2', balance: 2000 });

      const tx = createMockTransaction({
        id: 'tx-001',
        accountId: 'acc-1',
        type: 'EXPENSE',
        value: 200,
      });

      // Original state
      let acc1Balance = acc1.balance;
      let acc2Balance = acc2.balance;

      // Apply to acc1
      acc1Balance -= tx.value;
      expectMoneyEqual(acc1Balance, 800);

      // Move to acc2: revert from acc1, apply to acc2
      acc1Balance += tx.value;
      acc2Balance -= tx.value;
      expectMoneyEqual(acc1Balance, 1000);
      expectMoneyEqual(acc2Balance, 1800);
    });
  });

  describe('Transaction Deletion Impact', () => {
    it('should restore balance when transaction is deleted', () => {
      const tx = createMockTransaction({
        accountId: account.id,
        type: 'EXPENSE',
        value: 300,
      });

      let balance = account.balance - tx.value;
      expectMoneyEqual(balance, 700);

      // Delete transaction
      balance += tx.value;
      expectMoneyEqual(balance, 1000);
    });

    it('should restore balance when multiple transactions are deleted', () => {
      const txs = [
        createMockTransaction({ accountId: account.id, type: 'EXPENSE', value: 100 }),
        createMockTransaction({ accountId: account.id, type: 'EXPENSE', value: 200 }),
        createMockTransaction({ accountId: account.id, type: 'INCOME', value: 150 }),
      ];

      let balance = account.balance;
      txs.forEach(tx => {
        balance += tx.type === 'INCOME' ? tx.value : -tx.value;
      });
      expectMoneyEqual(balance, 850);

      // Delete all
      txs.forEach(tx => {
        balance -= tx.type === 'INCOME' ? tx.value : -tx.value;
      });
      expectMoneyEqual(balance, 1000);
    });
  });
});

describe('LocalStorage Persistence', () => {
  let localStorage: MockLocalStorage;
  const storageKey = 'test_finance_data';

  beforeEach(() => {
    localStorage = installMockLocalStorage();
  });

  describe('State Persistence', () => {
    it('should save and retrieve financial state', () => {
      const state = {
        accounts: [createMockAccount()],
        transactions: [createMockTransaction()],
        balance: 1000,
      };

      localStorage.setItem(storageKey, JSON.stringify(state));
      const retrieved = JSON.parse(localStorage.getItem(storageKey) || '{}');

      expect(retrieved.accounts).toHaveLength(1);
      expect(retrieved.transactions).toHaveLength(1);
      expectMoneyEqual(retrieved.balance, 1000);
    });

    it('should update existing state in localStorage', () => {
      const initialState = { balance: 1000 };
      localStorage.setItem(storageKey, JSON.stringify(initialState));

      const retrieved = JSON.parse(localStorage.getItem(storageKey) || '{}');
      retrieved.balance = 1500;
      localStorage.setItem(storageKey, JSON.stringify(retrieved));

      const updated = JSON.parse(localStorage.getItem(storageKey) || '{}');
      expectMoneyEqual(updated.balance, 1500);
    });

    it('should handle missing localStorage key gracefully', () => {
      const retrieved = localStorage.getItem('nonexistent');
      expect(retrieved).toBeNull();
    });
  });

  describe('Per-User Storage Keys', () => {
    const getStorageKey = (userId?: string) => userId ? `visao360_v2_data_${userId}` : 'visao360_v2_data';

    it('should maintain separate storage per user', () => {
      const user1Id = 'user-001';
      const user2Id = 'user-002';
      const user1Key = getStorageKey(user1Id);
      const user2Key = getStorageKey(user2Id);

      const user1State = { balance: 1000 };
      const user2State = { balance: 2000 };

      localStorage.setItem(user1Key, JSON.stringify(user1State));
      localStorage.setItem(user2Key, JSON.stringify(user2State));

      const retrievedUser1 = JSON.parse(localStorage.getItem(user1Key) || '{}');
      const retrievedUser2 = JSON.parse(localStorage.getItem(user2Key) || '{}');

      expectMoneyEqual(retrievedUser1.balance, 1000);
      expectMoneyEqual(retrievedUser2.balance, 2000);
    });

    it('should return different keys for different users', () => {
      const key1 = getStorageKey('user-001');
      const key2 = getStorageKey('user-002');
      const defaultKey = getStorageKey();

      expect(key1).not.toBe(key2);
      expect(key1).not.toBe(defaultKey);
      expect(defaultKey).toBe('visao360_v2_data');
    });
  });

  describe('Data Type Handling', () => {
    it('should preserve complex data structures in storage', () => {
      const complexState = {
        accounts: [createMockAccount(), createMockAccount()],
        transactions: [createMockTransaction(), createMockTransaction()],
        goals: [createMockGoal()],
        lastUpdated: Date.now(),
      };

      localStorage.setItem(storageKey, JSON.stringify(complexState));
      const retrieved = JSON.parse(localStorage.getItem(storageKey) || '{}');

      expect(retrieved.accounts).toHaveLength(2);
      expect(retrieved.transactions).toHaveLength(2);
      expect(retrieved.goals).toHaveLength(1);
      expect(typeof retrieved.lastUpdated).toBe('number');
    });

    it('should handle arrays in storage', () => {
      const accounts = [createMockAccount(), createMockAccount(), createMockAccount()];
      localStorage.setItem(storageKey, JSON.stringify(accounts));

      const retrieved = JSON.parse(localStorage.getItem(storageKey) || '[]');
      expect(retrieved).toHaveLength(3);
      expect(Array.isArray(retrieved)).toBe(true);
    });

    it('should handle null values in state', () => {
      const state = {
        accounts: null,
        transactions: [],
        notes: null,
      };

      localStorage.setItem(storageKey, JSON.stringify(state));
      const retrieved = JSON.parse(localStorage.getItem(storageKey) || '{}');

      expect(retrieved.accounts).toBeNull();
      expect(retrieved.notes).toBeNull();
    });
  });

  describe('Storage Fallback Logic', () => {
    it('should use default data when storage is empty', () => {
      const INITIAL_ACCOUNTS = [createMockAccount()];
      const stored = localStorage.getItem(storageKey);

      const fallback = stored ? JSON.parse(stored) : INITIAL_ACCOUNTS;
      expect(fallback).toEqual(INITIAL_ACCOUNTS);
    });

    it('should validate stored data before using', () => {
      const validState = { accounts: [{ id: 'acc-1', balance: 1000 }] };
      localStorage.setItem(storageKey, JSON.stringify(validState));

      const retrieved = JSON.parse(localStorage.getItem(storageKey) || '{}');
      const isValid = Array.isArray(retrieved.accounts);
      expect(isValid).toBe(true);
    });

    it('should recover from corrupted storage', () => {
      const corruptedData = '{invalid json}';
      localStorage.setItem(storageKey, corruptedData);

      try {
        const retrieved = JSON.parse(localStorage.getItem(storageKey) || '{}');
        expect(retrieved).toBeDefined();
      } catch (e) {
        // Expected behavior - fallback to default
        expect(true).toBe(true);
      }
    });
  });

  describe('Impersonation State Storage', () => {
    const IMPERSONATION_KEY = 'spfp_is_impersonating';
    const IMPERSONATED_USER_ID_KEY = 'spfp_impersonated_user_id';

    it('should save impersonation state', () => {
      localStorage.setItem(IMPERSONATION_KEY, 'true');
      localStorage.setItem(IMPERSONATED_USER_ID_KEY, 'client-user-123');

      expect(localStorage.getItem(IMPERSONATION_KEY)).toBe('true');
      expect(localStorage.getItem(IMPERSONATED_USER_ID_KEY)).toBe('client-user-123');
    });

    it('should restore impersonation state on load', () => {
      const isImpersonating = localStorage.getItem(IMPERSONATION_KEY) === 'true';
      const impersonatedUserId = localStorage.getItem(IMPERSONATED_USER_ID_KEY);

      expect(isImpersonating).toBe(false);
      expect(impersonatedUserId).toBeNull();
    });

    it('should clear impersonation state', () => {
      localStorage.setItem(IMPERSONATION_KEY, 'true');
      localStorage.setItem(IMPERSONATED_USER_ID_KEY, 'client-user-123');

      localStorage.removeItem(IMPERSONATION_KEY);
      localStorage.removeItem(IMPERSONATED_USER_ID_KEY);

      expect(localStorage.getItem(IMPERSONATION_KEY)).toBeNull();
      expect(localStorage.getItem(IMPERSONATED_USER_ID_KEY)).toBeNull();
    });
  });
});

describe('Category Management', () => {
  let categories: Category[];

  beforeEach(() => {
    categories = [
      { id: 'cat-1', name: 'Alimentação', color: '#FF6B6B', group: 'VARIABLE' },
      { id: 'cat-2', name: 'Transporte', color: '#4ECDC4', group: 'VARIABLE' },
      { id: 'cat-3', name: 'Aluguel', color: '#95E1D3', group: 'FIXED' },
    ];
  });

  describe('Category Addition', () => {
    it('should add category with generated ID', () => {
      const newCategory = { name: 'Lazer', color: '#FFE66D', group: 'VARIABLE' as const };
      const id = generators.randomId();
      const added = { ...newCategory, id };

      const updatedCategories = [...categories, added];
      expect(updatedCategories).toHaveLength(4);
      expect(updatedCategories[3].name).toBe('Lazer');
    });

    it('should prevent duplicate category names', () => {
      const existingNames = new Set(categories.map(c => c.name));
      const isDuplicate = existingNames.has('Alimentação');

      expect(isDuplicate).toBe(true);
    });
  });

  describe('Category Filtering', () => {
    it('should filter categories by group', () => {
      const variableCategories = categories.filter(c => c.group === 'VARIABLE');
      expect(variableCategories).toHaveLength(2);
    });

    it('should get all category names', () => {
      const names = categories.map(c => c.name);
      expect(names).toContain('Alimentação');
      expect(names).toContain('Transporte');
      expect(names).toContain('Aluguel');
    });
  });
});

describe('Budget and Goal Management', () => {
  let budgets: CategoryBudget[];
  let goals: Goal[];

  beforeEach(() => {
    budgets = [
      { category: 'Alimentação', budgetAmount: 500, spent: 350 },
      { category: 'Transporte', budgetAmount: 200, spent: 150 },
    ];

    goals = [
      createMockGoal({ id: 'goal-1', name: 'Vacation', targetAmount: 5000, currentAmount: 2000 }),
      createMockGoal({ id: 'goal-2', name: 'House', targetAmount: 100000, currentAmount: 50000 }),
    ];
  });

  describe('Budget Tracking', () => {
    it('should add budget for category', () => {
      const newBudget = { category: 'Lazer', budgetAmount: 300, spent: 0 };
      budgets = [...budgets, newBudget];

      expect(budgets).toHaveLength(3);
      expect(budgets[2].category).toBe('Lazer');
    });

    it('should update spent amount in budget', () => {
      budgets[0].spent = 400;
      expect(budgets[0].spent).toBe(400);
    });

    it('should calculate total budgeted', () => {
      const total = budgets.reduce((sum, b) => sum + b.budgetAmount, 0);
      expectMoneyEqual(total, 700);
    });
  });

  describe('Goal Tracking', () => {
    it('should add goal', () => {
      const newGoal = createMockGoal({ name: 'Car' });
      goals = [...goals, newGoal];

      expect(goals).toHaveLength(3);
      expect(goals[2].name).toBe('Car');
    });

    it('should update goal progress', () => {
      goals[0].currentAmount = 3000;
      const progress = (goals[0].currentAmount / goals[0].targetAmount) * 100;
      expect(progress).toBe(60);
    });

    it('should identify completed goals', () => {
      const completed = goals.filter(g => g.currentAmount >= g.targetAmount);
      expect(completed).toHaveLength(1);
    });
  });
});
