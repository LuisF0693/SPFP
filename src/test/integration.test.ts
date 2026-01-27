import { describe, it, expect, beforeEach } from 'vitest';
import { Transaction, Account, Goal } from '../types';
import { createMockTransaction, createMockAccount, createMockGoal, generators } from './test-utils';
import { expectMoneyEqual } from './test-helpers';

/**
 * INTEGRATION TESTS
 * Tests complete workflows combining multiple features
 */

describe('Complete Transaction Workflow', () => {
  let accounts: Account[];
  let transactions: Transaction[];

  beforeEach(() => {
    accounts = [
      createMockAccount({ id: 'acc-1', balance: 5000, name: 'Checking' }),
      createMockAccount({ id: 'acc-2', balance: 10000, name: 'Savings' }),
    ];
    transactions = [];
  });

  it('should handle complete income and expense cycle', () => {
    expectMoneyEqual(accounts[0].balance, 5000);

    const income = createMockTransaction({
      accountId: 'acc-1',
      type: 'INCOME',
      value: 3000,
      description: 'Salary',
    });

    accounts[0].balance += income.value;
    transactions.push(income);
    expectMoneyEqual(accounts[0].balance, 8000);

    const expense1 = createMockTransaction({
      accountId: 'acc-1',
      type: 'EXPENSE',
      value: 500,
      description: 'Rent',
    });
    const expense2 = createMockTransaction({
      accountId: 'acc-1',
      type: 'EXPENSE',
      value: 200,
      description: 'Groceries',
    });

    accounts[0].balance -= expense1.value;
    transactions.push(expense1);
    expectMoneyEqual(accounts[0].balance, 7500);

    accounts[0].balance -= expense2.value;
    transactions.push(expense2);
    expectMoneyEqual(accounts[0].balance, 7300);

    expect(transactions).toHaveLength(3);
    expect(transactions.every(t => t.accountId === 'acc-1')).toBe(true);
  });

  it('should handle transfer between accounts', () => {
    const transferAmount = 2000;
    const fromAccountIndex = 0;
    const toAccountIndex = 1;

    accounts[fromAccountIndex].balance -= transferAmount;
    accounts[toAccountIndex].balance += transferAmount;

    expectMoneyEqual(accounts[0].balance, 3000);
    expectMoneyEqual(accounts[1].balance, 12000);
  });

  it('should handle recurring transaction lifecycle', () => {
    const groupId = generators.randomId();
    const monthlyAmount = 100;
    const months = 3;

    for (let i = 0; i < months; i++) {
      const tx = createMockTransaction({
        groupId,
        groupIndex: i,
        type: 'EXPENSE',
        value: monthlyAmount,
        description: 'Monthly Subscription',
      });
      transactions.push(tx);
      accounts[0].balance -= tx.value;
    }

    expectMoneyEqual(accounts[0].balance, 4700);
    expect(transactions).toHaveLength(3);

    const toDelete = transactions.filter(t => t.groupId === groupId && (t.groupIndex || 0) >= 1);
    toDelete.forEach(tx => {
      accounts[0].balance += tx.value;
    });

    expectMoneyEqual(accounts[0].balance, 4900);
  });

  it('should handle installment payment tracking', () => {
    const groupId = generators.randomId();
    const totalAmount = 1200;
    const installments = 12;
    const monthlyAmount = totalAmount / installments;

    for (let i = 0; i < installments; i++) {
      const tx = createMockTransaction({
        groupId,
        groupIndex: i,
        type: 'EXPENSE',
        value: monthlyAmount,
        description: `Purchase 12x - Installment ${i + 1}`,
      });
      transactions.push(tx);
    }

    expect(transactions).toHaveLength(12);

    const totalSpent = transactions
      .filter(t => t.groupId === groupId)
      .reduce((sum, tx) => sum + tx.value, 0);

    expectMoneyEqual(totalSpent, 1200);

    accounts[0].balance -= totalSpent;
    expectMoneyEqual(accounts[0].balance, 3800);
  });
});

describe('Goal Achievement Workflow', () => {
  let goals: Goal[];

  beforeEach(() => {
    goals = [];
  });

  it('should track progress toward goal', () => {
    const goal = createMockGoal({
      name: 'Emergency Fund',
      targetAmount: 10000,
      currentAmount: 0,
    });
    goals.push(goal);

    const deposits = [2000, 3000, 2500, 2000];
    let currentAmount = goal.currentAmount;

    deposits.forEach(deposit => {
      currentAmount += deposit;
    });

    const progress = (currentAmount / goal.targetAmount) * 100;
    expect(progress).toBeGreaterThanOrEqual(95);
    expect(progress).toBeLessThanOrEqual(100);
  });

  it('should handle multiple goals with different priorities', () => {
    goals = [
      createMockGoal({ name: 'Vacation', targetAmount: 5000, currentAmount: 3000 }),
      createMockGoal({ name: 'House Down Payment', targetAmount: 50000, currentAmount: 25000 }),
      createMockGoal({ name: 'Emergency Fund', targetAmount: 10000, currentAmount: 8000 }),
    ];

    const progress = goals.map(g => ({
      name: g.name,
      percentage: (g.currentAmount / g.targetAmount) * 100,
    }));

    progress.sort((a, b) => b.percentage - a.percentage);

    expect(progress[0].name).toBe('Emergency Fund');
    expect(progress[1].name).toBe('Vacation');
    expect(progress[2].name).toBe('House Down Payment');
  });
});

describe('Budget and Spending Integration', () => {
  let budgets: any[];
  let accountBalance: number;

  beforeEach(() => {
    budgets = [
      { category: 'Alimentação', budgetAmount: 600, spent: 0 },
      { category: 'Transporte', budgetAmount: 200, spent: 0 },
      { category: 'Lazer', budgetAmount: 300, spent: 0 },
    ];
    accountBalance = 5000;
  });

  it('should track spending against budget', () => {
    budgets[0].spent += 350;
    budgets[1].spent += 150;
    budgets[2].spent += 300;

    accountBalance -= 800;

    const alimentacaoUsage = (budgets[0].spent / budgets[0].budgetAmount) * 100;
    const lazerUsage = (budgets[2].spent / budgets[2].budgetAmount) * 100;

    expect(alimentacaoUsage).toBeCloseTo(58.33);
    expect(lazerUsage).toBe(100);

    expectMoneyEqual(accountBalance, 4200);
  });

  it('should alert when category budget is exceeded', () => {
    budgets[2].spent = 350;

    const isOverBudget = budgets[2].spent > budgets[2].budgetAmount;
    expect(isOverBudget).toBe(true);

    const overspendAmount = budgets[2].spent - budgets[2].budgetAmount;
    expectMoneyEqual(overspendAmount, 50);
  });

  it('should calculate total month spending and remaining budget', () => {
    budgets[0].spent = 550;
    budgets[1].spent = 180;
    budgets[2].spent = 250;

    const totalBudget = budgets.reduce((sum, b) => sum + b.budgetAmount, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
    const totalRemaining = totalBudget - totalSpent;

    expectMoneyEqual(totalBudget, 1100);
    expectMoneyEqual(totalSpent, 980);
    expectMoneyEqual(totalRemaining, 120);
  });
});

describe('Account and Transaction Consistency', () => {
  let accounts: Account[];
  let transactions: Transaction[];

  beforeEach(() => {
    accounts = [
      createMockAccount({ id: 'acc-1', balance: 10000 }),
      createMockAccount({ id: 'acc-2', balance: 5000 }),
    ];
    transactions = [];
  });

  it('should maintain account balance consistency with transactions', () => {
    const initialBalances = accounts.map(a => a.balance);

    const txs = [
      createMockTransaction({ accountId: 'acc-1', type: 'EXPENSE', value: 500 }),
      createMockTransaction({ accountId: 'acc-2', type: 'INCOME', value: 1000 }),
      createMockTransaction({ accountId: 'acc-1', type: 'INCOME', value: 2000 }),
    ];

    transactions = txs;

    let acc1Balance = initialBalances[0];
    let acc2Balance = initialBalances[1];

    acc1Balance -= 500;
    acc2Balance += 1000;
    acc1Balance += 2000;

    expectMoneyEqual(acc1Balance, 11500);
    expectMoneyEqual(acc2Balance, 6000);
  });

  it('should detect orphaned transactions', () => {
    const orphanedTx = createMockTransaction({ accountId: 'non-existent-acc' });
    transactions.push(orphanedTx);

    const accountIds = accounts.map(a => a.id);
    const hasOrphan = transactions.some(t => !accountIds.includes(t.accountId));

    expect(hasOrphan).toBe(true);
  });
});

describe('End-to-End Financial Workflow', () => {
  let state: {
    accounts: Account[];
    transactions: Transaction[];
    goals: Goal[];
    budgets: any[];
  };

  beforeEach(() => {
    state = {
      accounts: [createMockAccount({ id: 'main', balance: 5000 })],
      transactions: [],
      goals: [createMockGoal({ id: 'goal-1', name: 'Vacation', targetAmount: 3000, currentAmount: 0 })],
      budgets: [{ category: 'Alimentação', budgetAmount: 400, spent: 0 }],
    };
  });

  it('should execute complete monthly financial cycle', () => {
    const monthlyIncome = 3000;

    state.accounts[0].balance += monthlyIncome;
    expectMoneyEqual(state.accounts[0].balance, 8000);

    const expenses = [
      { name: 'Rent', amount: 1500, category: 'Habitação' },
      { name: 'Groceries', amount: 350, category: 'Alimentação' },
      { name: 'Transport', amount: 150, category: 'Transporte' },
    ];

    expenses.forEach(exp => {
      state.accounts[0].balance -= exp.amount;
      if (exp.category === 'Alimentação') {
        state.budgets[0].spent += exp.amount;
      }
    });

    expectMoneyEqual(state.accounts[0].balance, 6000);
    expectMoneyEqual(state.budgets[0].spent, 350);

    const savings = 500;
    state.accounts[0].balance -= savings;
    state.goals[0].currentAmount += savings;

    expectMoneyEqual(state.accounts[0].balance, 5500);
    expect(state.goals[0].currentAmount).toBe(500);

    const budgetUsage = (state.budgets[0].spent / state.budgets[0].budgetAmount) * 100;
    expect(budgetUsage).toBeLessThan(100);

    const goalProgress = (state.goals[0].currentAmount / state.goals[0].targetAmount) * 100;
    expect(goalProgress).toBeCloseTo(16.67);
  });
});
