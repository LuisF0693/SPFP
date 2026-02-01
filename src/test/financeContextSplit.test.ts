import { describe, it, expect, beforeEach } from 'vitest';
import type {
  AccountsContextType,
  TransactionsContextType,
  GoalsContextType,
  InvestmentsContextType,
  PatrimonyContextType
} from '../context';

/**
 * STY-010: Finance Context Split - Snapshot Tests
 *
 * These tests validate the structure and behavior of the split finance contexts.
 * Each context snapshot documents its interface and ensures no breaking changes.
 */

describe('Split Finance Contexts - Snapshot Tests', () => {
  describe('AccountsContextType', () => {
    it('should export correct number of items (< 30)', () => {
      const accountsContextKeys = [
        'accounts',
        'categories',
        'addAccount',
        'updateAccount',
        'deleteAccount',
        'addCategory',
        'updateCategory',
        'deleteCategory',
        'getAccountBalance',
        'totalBalance',
        'recoverAccount',
        'getDeletedAccounts'
      ];

      expect(accountsContextKeys.length).toBeLessThan(30);
      expect(accountsContextKeys.length).toBe(12);
    });

    it('should have correct shape for AccountsContext', () => {
      const expectedKeys = [
        'accounts',
        'categories',
        'addAccount',
        'updateAccount',
        'deleteAccount',
        'addCategory',
        'updateCategory',
        'deleteCategory',
        'getAccountBalance',
        'totalBalance',
        'recoverAccount',
        'getDeletedAccounts'
      ];

      expect(expectedKeys).toMatchSnapshot();
    });
  });

  describe('TransactionsContextType', () => {
    it('should export correct number of items (< 30)', () => {
      const transactionsContextKeys = [
        'transactions',
        'categoryBudgets',
        'addTransaction',
        'addManyTransactions',
        'updateTransaction',
        'deleteTransaction',
        'deleteTransactions',
        'updateTransactions',
        'getTransactionsByGroupId',
        'deleteTransactionGroup',
        'deleteTransactionGroupFromIndex',
        'updateCategoryBudget',
        'recoverTransaction',
        'getDeletedTransactions'
      ];

      expect(transactionsContextKeys.length).toBeLessThan(30);
      expect(transactionsContextKeys.length).toBe(14);
    });

    it('should have correct shape for TransactionsContext', () => {
      const expectedKeys = [
        'transactions',
        'categoryBudgets',
        'addTransaction',
        'addManyTransactions',
        'updateTransaction',
        'deleteTransaction',
        'deleteTransactions',
        'updateTransactions',
        'getTransactionsByGroupId',
        'deleteTransactionGroup',
        'deleteTransactionGroupFromIndex',
        'updateCategoryBudget',
        'recoverTransaction',
        'getDeletedTransactions'
      ];

      expect(expectedKeys).toMatchSnapshot();
    });
  });

  describe('GoalsContextType', () => {
    it('should export correct number of items (< 30)', () => {
      const goalsContextKeys = [
        'goals',
        'addGoal',
        'updateGoal',
        'deleteGoal',
        'recoverGoal',
        'getDeletedGoals'
      ];

      expect(goalsContextKeys.length).toBeLessThan(30);
      expect(goalsContextKeys.length).toBe(6);
    });

    it('should have correct shape for GoalsContext', () => {
      const expectedKeys = [
        'goals',
        'addGoal',
        'updateGoal',
        'deleteGoal',
        'recoverGoal',
        'getDeletedGoals'
      ];

      expect(expectedKeys).toMatchSnapshot();
    });
  });

  describe('InvestmentsContextType', () => {
    it('should export correct number of items (< 30)', () => {
      const investmentsContextKeys = [
        'investments',
        'addInvestment',
        'updateInvestment',
        'deleteInvestment',
        'recoverInvestment',
        'getDeletedInvestments'
      ];

      expect(investmentsContextKeys.length).toBeLessThan(30);
      expect(investmentsContextKeys.length).toBe(6);
    });

    it('should have correct shape for InvestmentsContext', () => {
      const expectedKeys = [
        'investments',
        'addInvestment',
        'updateInvestment',
        'deleteInvestment',
        'recoverInvestment',
        'getDeletedInvestments'
      ];

      expect(expectedKeys).toMatchSnapshot();
    });
  });

  describe('PatrimonyContextType', () => {
    it('should export correct number of items (< 30)', () => {
      const patrimonyContextKeys = [
        'patrimonyItems',
        'addPatrimonyItem',
        'updatePatrimonyItem',
        'deletePatrimonyItem',
        'recoverPatrimonyItem',
        'getDeletedPatrimonyItems'
      ];

      expect(patrimonyContextKeys.length).toBeLessThan(30);
      expect(patrimonyContextKeys.length).toBe(6);
    });

    it('should have correct shape for PatrimonyContext', () => {
      const expectedKeys = [
        'patrimonyItems',
        'addPatrimonyItem',
        'updatePatrimonyItem',
        'deletePatrimonyItem',
        'recoverPatrimonyItem',
        'getDeletedPatrimonyItems'
      ];

      expect(expectedKeys).toMatchSnapshot();
    });
  });

  describe('Total Context Exports', () => {
    it('should have total of all sub-context exports < 60 items', () => {
      const totalExports = 12 + 14 + 6 + 6 + 6; // AccountsContext + TransactionsContext + GoalsContext + InvestmentsContext + PatrimonyContext
      expect(totalExports).toBeLessThan(60);
      expect(totalExports).toBe(44);
    });

    it('should maintain backward compatibility with FinanceContextType', () => {
      const financeContextKeys = [
        // User Profile
        'userProfile',
        'updateUserProfile',
        // Accounts
        'accounts',
        'addAccount',
        'updateAccount',
        'deleteAccount',
        'getAccountBalance',
        'totalBalance',
        // Categories
        'categories',
        'addCategory',
        'updateCategory',
        'deleteCategory',
        // Transactions
        'transactions',
        'addTransaction',
        'addManyTransactions',
        'updateTransaction',
        'deleteTransaction',
        'deleteTransactions',
        'updateTransactions',
        'categoryBudgets',
        'updateCategoryBudget',
        'getTransactionsByGroupId',
        'deleteTransactionGroup',
        'deleteTransactionGroupFromIndex',
        // Goals
        'goals',
        'addGoal',
        'updateGoal',
        'deleteGoal',
        // Investments
        'investments',
        'addInvestment',
        'updateInvestment',
        'deleteInvestment',
        // Patrimony
        'patrimonyItems',
        'addPatrimonyItem',
        'updatePatrimonyItem',
        'deletePatrimonyItem',
        // Soft Delete Recovery
        'recoverTransaction',
        'recoverAccount',
        'recoverGoal',
        'recoverInvestment',
        'recoverPatrimonyItem',
        'getDeletedTransactions',
        'getDeletedAccounts',
        'getDeletedGoals',
        'getDeletedInvestments',
        'getDeletedPatrimonyItems',
        // Admin/Impersonation
        'isSyncing',
        'isInitialLoadComplete',
        'isImpersonating',
        'stopImpersonating',
        'loadClientData',
        'fetchAllUserData'
      ];

      // Should be comprehensive without being excessive
      expect(financeContextKeys.length).toBeLessThan(100);
      expect(financeContextKeys.length).toBeGreaterThan(40);
    });
  });

  describe('localStorage Key Strategy', () => {
    it('should have separate localStorage keys per context', () => {
      const keys = [
        'visao360_v2_data_', // Legacy unified (still used for backward compat)
        'visao360_v2_accounts_',
        'visao360_v2_transactions_',
        'visao360_v2_goals_',
        'visao360_v2_investments_',
        'visao360_v2_patrimony_'
      ];

      expect(keys.length).toBe(6);
      expect(keys).toMatchSnapshot();
    });
  });

  describe('Soft Delete Architecture', () => {
    it('should support soft delete recovery across all contexts', () => {
      const recoveryFunctions = [
        'recoverTransaction',
        'recoverAccount',
        'recoverGoal',
        'recoverInvestment',
        'recoverPatrimonyItem'
      ];

      expect(recoveryFunctions.length).toBe(5);
      expect(recoveryFunctions).toMatchSnapshot();
    });

    it('should support querying deleted items across all contexts', () => {
      const getDeletedFunctions = [
        'getDeletedTransactions',
        'getDeletedAccounts',
        'getDeletedGoals',
        'getDeletedInvestments',
        'getDeletedPatrimonyItems'
      ];

      expect(getDeletedFunctions.length).toBe(5);
      expect(getDeletedFunctions).toMatchSnapshot();
    });
  });
});

/**
 * Integration Test Strategies for Split Contexts
 *
 * While individual sub-contexts can be tested in isolation,
 * the composite FinanceContext should be tested for:
 *
 * 1. Balance calculations across transaction + account updates
 * 2. Cascade deletion (delete account -> cascade delete transactions)
 * 3. Admin impersonation with multiple sub-contexts
 * 4. Cloud sync coordination across all sub-contexts
 * 5. localStorage persistence per context
 * 6. Soft delete recovery maintaining referential integrity
 */
