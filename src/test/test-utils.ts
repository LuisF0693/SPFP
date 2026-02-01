/**
 * Test Utilities - Mock Factory Functions
 * Creates realistic mock objects for testing with optional overrides
 */

import { Account, Transaction, Goal, Category, InvestmentAsset, PatrimonyItem } from '../types';
import { generateId } from '../utils';

/**
 * Random data generators for test scenarios
 */
export const generators = {
  randomId: (prefix = 'id') => `${prefix}-${generateId()}`,
  randomEmail: () => `test-${Math.random().toString(36).substring(7)}@example.com`,
  randomAmount: (min = 0, max = 10000) => Math.random() * (max - min) + min,
  randomDate: () => {
    const days = Math.floor(Math.random() * 365);
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
  },
  futureDate: (daysFromNow = 30) => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date.toISOString().split('T')[0];
  },
  pastDate: (daysAgo = 30) => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString().split('T')[0];
  },
};

/**
 * Create a mock Transaction with optional overrides
 */
export function createMockTransaction(overrides?: Partial<Transaction>): Transaction {
  const now = new Date();
  const dateString = now.toISOString().split('T')[0];

  return {
    id: generators.randomId('tx'),
    accountId: generators.randomId('acc'),
    description: 'Test Transaction',
    value: 100,
    date: dateString,
    type: 'EXPENSE',
    categoryId: generators.randomId('cat'),
    paid: true,
    ...overrides,
  };
}

/**
 * Create a mock Account with optional overrides
 */
export function createMockAccount(overrides?: Partial<Account>): Account {
  return {
    id: generators.randomId('acc'),
    name: 'Test Account',
    type: 'CHECKING',
    owner: 'ME',
    balance: 1000,
    ...overrides,
  };
}

/**
 * Create a mock Category with optional overrides
 */
export function createMockCategory(overrides?: Partial<Category>): Category {
  return {
    id: generators.randomId('cat'),
    name: 'Test Category',
    color: '#FF0000',
    group: 'VARIABLE',
    icon: 'cart',
    ...overrides,
  };
}

/**
 * Create a mock Goal with optional overrides
 */
export function createMockGoal(overrides?: Partial<Goal> & { category?: string }): Goal & { category?: string } {
  const futureDate = new Date();
  futureDate.setMonth(futureDate.getMonth() + 12);
  const deadline = futureDate.toISOString().split('T')[0];

  const goal: Goal & { category?: string } = {
    id: generators.randomId('goal'),
    name: 'Test Goal',
    targetAmount: 10000,
    currentAmount: 0,
    deadline,
    color: '#0000FF',
    icon: 'target',
    status: 'IN_PROGRESS',
    ...overrides,
  };

  return goal;
}

/**
 * Create a mock InvestmentAsset with optional overrides
 */
export function createMockInvestment(overrides?: Partial<InvestmentAsset>): InvestmentAsset {
  return {
    id: generators.randomId('inv'),
    ticker: 'TEST11',
    name: 'Test Investment',
    quantity: 10,
    averagePrice: 100,
    currentPrice: 110,
    type: 'STOCK',
    lastUpdate: new Date().toISOString().split('T')[0],
    ...overrides,
  };
}

/**
 * Create a mock PatrimonyItem with optional overrides
 */
export function createMockPatrimonyItem(overrides?: Partial<PatrimonyItem>): PatrimonyItem {
  return {
    id: generators.randomId('pat'),
    type: 'REAL_ESTATE',
    name: 'Test Property',
    description: 'Test property for testing',
    value: 500000,
    ...overrides,
  };
}

/**
 * Create multiple mock transactions
 */
export function createMockTransactions(count: number, overrides?: Partial<Transaction>): Transaction[] {
  return Array.from({ length: count }, () => createMockTransaction(overrides));
}

/**
 * Create multiple mock accounts
 */
export function createMockAccounts(count: number, overrides?: Partial<Account>): Account[] {
  return Array.from({ length: count }, (_, i) =>
    createMockAccount({
      id: generators.randomId(`acc-${i}`),
      ...overrides,
    })
  );
}

/**
 * Create multiple mock goals
 */
export function createMockGoals(count: number, overrides?: Partial<Goal>): Goal[] {
  return Array.from({ length: count }, () => createMockGoal(overrides));
}

/**
 * Create a realistic transaction history for an account
 */
export function createRealisticTransactionHistory(
  accountId: string,
  count: number = 20
): Transaction[] {
  const transactions: Transaction[] = [];
  const descriptions = [
    'Grocery Store',
    'Gas Station',
    'Restaurant',
    'Salary Deposit',
    'Rent Payment',
    'Electricity Bill',
    'Water Bill',
    'Internet Bill',
    'Phone Bill',
    'Movie Tickets',
  ];
  const categories = [
    'food',
    'transport',
    'entertainment',
    'salary',
    'home',
    'utilities',
    'utilities',
    'utilities',
    'utilities',
    'entertainment',
  ];

  for (let i = 0; i < count; i++) {
    const daysAgo = i * 2;
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);

    const isIncome = Math.random() < 0.1;
    const description = descriptions[Math.floor(Math.random() * descriptions.length)];

    transactions.push(
      createMockTransaction({
        accountId,
        description,
        value: isIncome ? generators.randomAmount(2000, 5000) : generators.randomAmount(10, 500),
        type: isIncome ? 'INCOME' : 'EXPENSE',
        date: date.toISOString().split('T')[0],
        categoryId: categories[Math.floor(Math.random() * categories.length)],
      })
    );
  }

  return transactions;
}

/**
 * Create a complete financial scenario for integration testing
 */
export function createCompleteFinancialScenario() {
  const accounts = [
    createMockAccount({ id: 'acc-001', name: 'Checking', balance: 5000 }),
    createMockAccount({ id: 'acc-002', name: 'Savings', balance: 15000 }),
    createMockAccount({ id: 'acc-003', name: 'Credit Card', type: 'CREDIT_CARD', balance: 0 }),
  ];

  const transactions = [
    ...createRealisticTransactionHistory('acc-001', 15),
    ...createRealisticTransactionHistory('acc-002', 10),
  ];

  const goals = [
    createMockGoal({
      id: 'goal-001',
      name: 'Vacation',
      targetAmount: 5000,
      currentAmount: 2000,
    }),
    createMockGoal({
      id: 'goal-002',
      name: 'Emergency Fund',
      targetAmount: 10000,
      currentAmount: 8000,
    }),
  ];

  return {
    accounts,
    transactions,
    goals,
    totalBalance: accounts.reduce((sum, acc) => sum + acc.balance, 0),
  };
}

/**
 * Create test data with specific patterns for edge case testing
 */
export const EdgeCaseScenarios = {
  /**
   * Account with zero balance
   */
  zeroBalanceAccount: () =>
    createMockAccount({
      id: 'edge-zero',
      name: 'Zero Balance',
      balance: 0,
    }),

  /**
   * Account with negative balance (overdraft)
   */
  overdraftAccount: () =>
    createMockAccount({
      id: 'edge-overdraft',
      name: 'Overdraft',
      balance: -500,
    }),

  /**
   * Very large balance
   */
  largeBalanceAccount: () =>
    createMockAccount({
      id: 'edge-large',
      name: 'Large Balance',
      balance: 1000000,
    }),

  /**
   * Goal with zero target
   */
  zeroTargetGoal: () =>
    createMockGoal({
      id: 'edge-zero-goal',
      targetAmount: 0,
      currentAmount: 0,
    }),

  /**
   * Goal that has exceeded target
   */
  exceededGoal: () =>
    createMockGoal({
      id: 'edge-exceeded',
      targetAmount: 5000,
      currentAmount: 7500,
    }),

  /**
   * Completed goal
   */
  completedGoal: () =>
    createMockGoal({
      id: 'edge-completed',
      targetAmount: 5000,
      currentAmount: 5000,
      status: 'COMPLETED',
    }),

  /**
   * Transaction with maximum value
   */
  largeTransaction: () =>
    createMockTransaction({
      id: 'edge-large-tx',
      value: 999999.99,
    }),

  /**
   * Transaction with minimum value
   */
  tinyTransaction: () =>
    createMockTransaction({
      id: 'edge-tiny-tx',
      value: 0.01,
    }),
};

/**
 * Batch operations helpers for testing
 */
export const BatchOperations = {
  /**
   * Create transactions spread across multiple accounts
   */
  createMultiAccountTransactions: (
    accountIds: string[],
    transactionsPerAccount: number
  ): Transaction[] => {
    const transactions: Transaction[] = [];

    accountIds.forEach(accountId => {
      for (let i = 0; i < transactionsPerAccount; i++) {
        transactions.push(
          createMockTransaction({
            accountId,
            value: generators.randomAmount(50, 500),
          })
        );
      }
    });

    return transactions;
  },

  /**
   * Create recurring transactions (same pattern over time)
   */
  createRecurringTransactions: (
    accountId: string,
    description: string,
    value: number,
    occurrences: number,
    intervalDays: number = 30
  ): Transaction[] => {
    const transactions: Transaction[] = [];

    for (let i = 0; i < occurrences; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i * intervalDays);

      transactions.push(
        createMockTransaction({
          accountId,
          description,
          value,
          date: date.toISOString().split('T')[0],
        })
      );
    }

    return transactions;
  },

  /**
   * Create grouped transactions (installments)
   */
  createInstallmentTransactions: (
    accountId: string,
    description: string,
    totalValue: number,
    installmentCount: number,
    startDate?: string
  ): Transaction[] => {
    const transactions: Transaction[] = [];
    const groupId = generators.randomId('group');
    const installmentValue = totalValue / installmentCount;
    const start = startDate ? new Date(startDate) : new Date();

    for (let i = 0; i < installmentCount; i++) {
      const date = new Date(start);
      date.setMonth(date.getMonth() + i);

      transactions.push(
        createMockTransaction({
          accountId,
          description: `${description} (${i + 1}/${installmentCount})`,
          value: installmentValue,
          date: date.toISOString().split('T')[0],
          groupId,
          groupType: 'INSTALLMENT',
          groupIndex: i + 1,
          groupTotal: installmentCount,
        })
      );
    }

    return transactions;
  },
};
