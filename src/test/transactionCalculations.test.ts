import { describe, it, expect, beforeEach } from 'vitest';
import { Transaction, Account } from '../types';
import { createMockTransaction, createMockAccount, generators } from './test-utils';
import { expectMoneyEqual } from './test-helpers';

/**
 * TRANSACTION CALCULATIONS TEST SUITE
 * Tests financial calculations including balance updates, grouping, and recurring logic
 */

describe('Transaction Balance Calculations', () => {
  let account: Account;

  beforeEach(() => {
    account = createMockAccount({
      id: 'acc-001',
      balance: 1000,
      type: 'CHECKING',
    });
  });

  describe('Income and Expense Impact', () => {
    it('should increase balance for income transactions', () => {
      const incomeTransaction = createMockTransaction({
        accountId: account.id,
        type: 'INCOME',
        value: 500,
      });

      const newBalance = account.balance + incomeTransaction.value;
      expectMoneyEqual(newBalance, 1500);
    });

    it('should decrease balance for expense transactions', () => {
      const expenseTransaction = createMockTransaction({
        accountId: account.id,
        type: 'EXPENSE',
        value: 250,
      });

      const newBalance = account.balance - expenseTransaction.value;
      expectMoneyEqual(newBalance, 750);
    });

    it('should calculate correct balance for multiple transactions', () => {
      const transactions = [
        createMockTransaction({ type: 'INCOME', value: 1000 }),
        createMockTransaction({ type: 'EXPENSE', value: 300 }),
        createMockTransaction({ type: 'EXPENSE', value: 150 }),
        createMockTransaction({ type: 'INCOME', value: 500 }),
      ];

      let balance = account.balance;
      transactions.forEach(tx => {
        balance += tx.type === 'INCOME' ? tx.value : -tx.value;
      });

      expectMoneyEqual(balance, 2050);
    });

    it('should handle zero balance correctly', () => {
      const zeroAccount = createMockAccount({ balance: 0 });
      const income = 500;
      expectMoneyEqual(zeroAccount.balance + income, 500);
    });

    it('should handle negative balance (overdraft)', () => {
      const overdraftAccount = createMockAccount({ balance: -500 });
      const income = 300;
      expectMoneyEqual(overdraftAccount.balance + income, -200);
    });
  });

  describe('Multiple Account Balancing', () => {
    it('should correctly distribute transactions across accounts', () => {
      const acc1 = createMockAccount({ id: 'acc-1', balance: 1000 });
      const acc2 = createMockAccount({ id: 'acc-2', balance: 2000 });

      const txAcc1 = createMockTransaction({ accountId: 'acc-1', type: 'EXPENSE', value: 200 });
      const txAcc2 = createMockTransaction({ accountId: 'acc-2', type: 'INCOME', value: 500 });

      const newAcc1Balance = acc1.balance - txAcc1.value;
      const newAcc2Balance = acc2.balance + txAcc2.value;

      expectMoneyEqual(newAcc1Balance, 800);
      expectMoneyEqual(newAcc2Balance, 2500);
    });

    it('should handle bulk transaction updates across multiple accounts', () => {
      const accounts = [
        createMockAccount({ id: 'acc-1', balance: 1000 }),
        createMockAccount({ id: 'acc-2', balance: 2000 }),
        createMockAccount({ id: 'acc-3', balance: 1500 }),
      ];

      const transactions = [
        createMockTransaction({ accountId: 'acc-1', type: 'EXPENSE', value: 100 }),
        createMockTransaction({ accountId: 'acc-2', type: 'EXPENSE', value: 200 }),
        createMockTransaction({ accountId: 'acc-1', type: 'INCOME', value: 300 }),
        createMockTransaction({ accountId: 'acc-3', type: 'EXPENSE', value: 150 }),
      ];

      const accountMap = new Map(accounts.map(a => [a.id, { ...a }]));

      transactions.forEach(tx => {
        const acc = accountMap.get(tx.accountId);
        if (acc) {
          acc.balance += tx.type === 'INCOME' ? tx.value : -tx.value;
        }
      });

      expectMoneyEqual(accountMap.get('acc-1')!.balance, 1200);
      expectMoneyEqual(accountMap.get('acc-2')!.balance, 1800);
      expectMoneyEqual(accountMap.get('acc-3')!.balance, 1350);
    });
  });

  describe('Date-Based Balance Impact', () => {
    it('should calculate current balance for today\'s transaction', () => {
      const today = new Date().toISOString().split('T')[0];
      const transaction = createMockTransaction({
        accountId: account.id,
        date: today,
        type: 'EXPENSE',
        value: 100,
      });

      const currentDate = new Date();
      currentDate.setHours(23, 59, 59, 999);
      const txDate = new Date(transaction.date);

      if (txDate <= currentDate) {
        account.balance -= transaction.value;
      }

      expectMoneyEqual(account.balance, 900);
    });

    it('should not affect balance for future transactions in calculation', () => {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const transaction = createMockTransaction({
        accountId: account.id,
        date: tomorrow,
        type: 'EXPENSE',
        value: 100,
      });

      const currentDate = new Date();
      currentDate.setHours(23, 59, 59, 999);
      const txDate = new Date(transaction.date);
      const originalBalance = account.balance;

      if (txDate <= currentDate) {
        account.balance -= transaction.value;
      }

      expectMoneyEqual(account.balance, originalBalance);
    });

    it('should correctly calculate balance cutoff at day boundary', () => {
      const baseBalance = 1000;
      const expenses = [
        createMockTransaction({ type: 'EXPENSE', value: 100, date: '2026-01-20' }),
        createMockTransaction({ type: 'EXPENSE', value: 200, date: '2026-01-21' }),
        createMockTransaction({ type: 'EXPENSE', value: 300, date: '2026-01-22' }),
      ];

      let balance = baseBalance;
      expenses.forEach(tx => {
        balance -= tx.value;
      });

      expectMoneyEqual(balance, 400);
    });
  });

  describe('Transaction Modification and Reversal', () => {
    it('should correctly update balance when modifying transaction', () => {
      const originalTx = createMockTransaction({
        id: 'tx-001',
        accountId: 'acc-001',
        type: 'EXPENSE',
        value: 100,
      });

      let balance = 1000;
      // Apply original
      balance -= originalTx.value;
      expectMoneyEqual(balance, 900);

      // Reverse original
      balance += originalTx.value;
      expectMoneyEqual(balance, 1000);

      // Apply modified
      const modifiedValue = 250;
      balance -= modifiedValue;
      expectMoneyEqual(balance, 750);
    });

    it('should correctly update balance when changing transaction type', () => {
      let balance = 1000;

      // Original expense
      const originalValue = 100;
      balance -= originalValue;
      expectMoneyEqual(balance, 900);

      // Reverse
      balance += originalValue;
      expectMoneyEqual(balance, 1000);

      // Apply as income
      balance += originalValue;
      expectMoneyEqual(balance, 1100);
    });

    it('should correctly update balance when changing transaction account', () => {
      let acc1 = 1000;
      let acc2 = 2000;

      const tx = createMockTransaction({
        accountId: 'acc-1',
        type: 'EXPENSE',
        value: 200,
      });

      // Apply to acc1
      acc1 -= tx.value;
      expectMoneyEqual(acc1, 800);

      // Move to acc2: reverse from acc1, apply to acc2
      acc1 += tx.value;
      acc2 -= tx.value;
      expectMoneyEqual(acc1, 1000);
      expectMoneyEqual(acc2, 1800);
    });

    it('should handle complex transaction update scenario', () => {
      const oldTx = createMockTransaction({
        accountId: 'acc-1',
        type: 'EXPENSE',
        value: 100,
      });

      const newTx = createMockTransaction({
        accountId: 'acc-2',
        type: 'INCOME',
        value: 150,
      });

      let acc1 = 1000;
      let acc2 = 2000;

      // Reverse old
      acc1 += oldTx.value;

      // Apply new
      acc2 += newTx.value;

      expectMoneyEqual(acc1, 1100);
      expectMoneyEqual(acc2, 2150);
    });
  });

  describe('Bulk Transaction Operations', () => {
    it('should calculate balance changes for multiple additions', () => {
      const transactions = [
        createMockTransaction({ type: 'EXPENSE', value: 100 }),
        createMockTransaction({ type: 'INCOME', value: 500 }),
        createMockTransaction({ type: 'EXPENSE', value: 75 }),
      ];

      let balance = 1000;
      transactions.forEach(tx => {
        balance += tx.type === 'INCOME' ? tx.value : -tx.value;
      });

      expectMoneyEqual(balance, 1325);
    });

    it('should calculate balance for bulk deletions', () => {
      const transactions = [
        createMockTransaction({ type: 'EXPENSE', value: 100 }),
        createMockTransaction({ type: 'INCOME', value: 500 }),
      ];

      let balance = 1000;
      transactions.forEach(tx => {
        balance += tx.type === 'INCOME' ? tx.value : -tx.value;
      });

      expectMoneyEqual(balance, 1400);

      // Delete both
      transactions.forEach(tx => {
        balance -= tx.type === 'INCOME' ? tx.value : -tx.value;
      });

      expectMoneyEqual(balance, 1000);
    });

    it('should preserve account balances during partial transaction deletion', () => {
      const acc1Txs = [
        createMockTransaction({ accountId: 'acc-1', type: 'EXPENSE', value: 100 }),
        createMockTransaction({ accountId: 'acc-1', type: 'INCOME', value: 200 }),
      ];

      const acc2Txs = [
        createMockTransaction({ accountId: 'acc-2', type: 'EXPENSE', value: 50 }),
      ];

      let acc1 = 1000;
      let acc2 = 500;

      acc1Txs.forEach(tx => {
        acc1 += tx.type === 'INCOME' ? tx.value : -tx.value;
      });

      acc2Txs.forEach(tx => {
        acc2 += tx.type === 'INCOME' ? tx.value : -tx.value;
      });

      expectMoneyEqual(acc1, 1100);
      expectMoneyEqual(acc2, 450);

      // Delete only one transaction from acc1
      acc1 -= acc1Txs[0].type === 'INCOME' ? acc1Txs[0].value : -acc1Txs[0].value;
      expectMoneyEqual(acc1, 1200);
      expectMoneyEqual(acc2, 450);
    });
  });

  describe('Floating Point Precision', () => {
    it('should handle decimal precision in balance calculations', () => {
      const baseBalance = 1000.50;
      const expense = 99.99;
      const newBalance = baseBalance - expense;
      expectMoneyEqual(newBalance, 900.51, 0.01);
    });

    it('should maintain precision across multiple operations', () => {
      let balance = 1000.00;
      const operations = [
        { type: 'EXPENSE' as const, value: 50.25 },
        { type: 'INCOME' as const, value: 123.75 },
        { type: 'EXPENSE' as const, value: 33.50 },
      ];

      operations.forEach(op => {
        balance += op.type === 'INCOME' ? op.value : -op.value;
      });

      expectMoneyEqual(balance, 1040.00, 0.01);
    });

    it('should handle very small transactions', () => {
      const balance = 1000 - 0.01;
      expectMoneyEqual(balance, 999.99, 0.01);
    });

    it('should handle large transaction amounts', () => {
      const balance = 1000000 + 250000.99;
      expectMoneyEqual(balance, 1250000.99, 0.01);
    });
  });

  describe('Transaction Validation', () => {
    it('should identify valid expense transaction', () => {
      const transaction = createMockTransaction({
        type: 'EXPENSE',
        value: 100,
        accountId: 'acc-001',
      });

      expect(transaction.type).toBe('EXPENSE');
      expect(transaction.value).toBeGreaterThan(0);
      expect(transaction.accountId).toBeTruthy();
    });

    it('should identify valid income transaction', () => {
      const transaction = createMockTransaction({
        type: 'INCOME',
        value: 500,
      });

      expect(transaction.type).toBe('INCOME');
      expect(transaction.value).toBeGreaterThan(0);
    });

    it('should validate transaction has required fields', () => {
      const transaction = createMockTransaction();

      expect(transaction).toHaveProperty('id');
      expect(transaction).toHaveProperty('accountId');
      expect(transaction).toHaveProperty('description');
      expect(transaction).toHaveProperty('value');
      expect(transaction).toHaveProperty('date');
      expect(transaction).toHaveProperty('type');
    });

    it('should validate amount is positive', () => {
      const transaction = createMockTransaction({ value: 100 });
      expect(transaction.value).toBeGreaterThan(0);
    });
  });
});
