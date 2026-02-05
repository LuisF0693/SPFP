import { useMemo } from 'react';
import { Transaction, Category, CategoryBudget } from '../../types';

/**
 * Utility functions and custom hooks for Dashboard components
 * Extracts heavy computation logic from Dashboard.tsx
 */

export interface MonthlyMetrics {
  totalIncome: number;
  totalExpense: number;
  lastMonthIncome: number;
  lastMonthExpense: number;
}

export interface BudgetAlert {
  critical: number;
  warning: number;
}

export interface ChartDataPoint {
  name: string;
  Income: number;
  Expense: number;
}

export interface CategoryChartData {
  name: string;
  value: number;
  color: string;
}

export interface AtypicalTransaction extends Transaction {
  isAtypical: boolean;
}

/**
 * Hook: Calculate current and last month financial metrics
 */
export const useMonthlyMetrics = (
  transactions: Transaction[],
  today: Date = new Date()
): MonthlyMetrics => {
  return useMemo(() => {
    // Ensure transactions is an array
    const safeTx = Array.isArray(transactions) ? transactions : [];

    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Filter current month transactions
    const currentMonthTx = safeTx.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    // Filter last month transactions
    const lastMonthTx = safeTx.filter(t => {
      const d = new Date(t.date);
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
    });

    // Calculate totals
    const totalIncome = currentMonthTx
      .filter(t => t.type === 'INCOME')
      .reduce((acc, t) => acc + t.value, 0);

    const totalExpense = currentMonthTx
      .filter(t => t.type === 'EXPENSE')
      .reduce((acc, t) => acc + t.value, 0);

    const lastMonthIncome = lastMonthTx
      .filter(t => t.type === 'INCOME')
      .reduce((acc, t) => acc + t.value, 0);

    const lastMonthExpense = lastMonthTx
      .filter(t => t.type === 'EXPENSE')
      .reduce((acc, t) => acc + t.value, 0);

    return {
      totalIncome,
      totalExpense,
      lastMonthIncome,
      lastMonthExpense
    };
  }, [transactions, today]);
};

/**
 * Hook: Calculate budget alerts for the current month
 */
export const useBudgetAlerts = (
  transactions: Transaction[],
  categories: Category[],
  categoryBudgets: CategoryBudget[],
  today: Date = new Date()
): BudgetAlert => {
  return useMemo(() => {
    // Ensure arrays are defined
    const safeTx = Array.isArray(transactions) ? transactions : [];
    const safeCats = Array.isArray(categories) ? categories : [];
    const safeBudgets = Array.isArray(categoryBudgets) ? categoryBudgets : [];

    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const currentMonthTx = safeTx.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    return safeCats.reduce(
      (acc, cat) => {
        const budget = safeBudgets.find(b => b.categoryId === cat.id);
        if (!budget || budget.limit <= 0) return acc;

        const spent = currentMonthTx
          .filter(t => t.type === 'EXPENSE' && t.categoryId === cat.id)
          .reduce((sum, t) => sum + t.value, 0);

        const percentage = (spent / budget.limit) * 100;

        if (percentage >= 100) return { ...acc, critical: acc.critical + 1 };
        if (percentage >= 90) return { ...acc, warning: acc.warning + 1 };
        return acc;
      },
      { critical: 0, warning: 0 }
    );
  }, [transactions, categories, categoryBudgets, today]);
};

/**
 * Hook: Detect atypical spending patterns
 */
export const useAtypicalSpending = (
  transactions: Transaction[],
  today: Date = new Date()
): Transaction[] => {
  return useMemo(() => {
    // Ensure transactions is an array
    const safeTx = Array.isArray(transactions) ? transactions : [];

    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const currentMonthTx = safeTx.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const last3MonthsTx = safeTx.filter(t => {
      const d = new Date(t.date);
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(today.getMonth() - 3);
      return d >= threeMonthsAgo && (d.getMonth() !== currentMonth || d.getFullYear() !== currentYear);
    });

    // Calculate category averages
    const categoryAverages: Record<string, number> = {};
    last3MonthsTx
      .filter(t => t.type === 'EXPENSE')
      .forEach(t => {
        categoryAverages[t.categoryId] = (categoryAverages[t.categoryId] || 0) + t.value / 3;
      });

    // Detect atypical transactions in current month
    return currentMonthTx.filter(t => t.type === 'EXPENSE').filter(t => {
      const avg = categoryAverages[t.categoryId];
      const txDate = new Date(t.date);
      const dayOfWeek = txDate.getDay();

      // Get same day of week transactions from other months
      const sameDayOfWeekTxs = safeTx.filter(prevT => {
        const prevD = new Date(prevT.date);
        return (
          prevT.type === 'EXPENSE' &&
          prevD.getDay() === dayOfWeek &&
          prevT.id !== t.id &&
          (prevD.getMonth() !== currentMonth || prevD.getFullYear() !== currentYear)
        );
      });

      const dayAvg =
        sameDayOfWeekTxs.length > 0
          ? sameDayOfWeekTxs.reduce((acc, curr) => acc + curr.value, 0) /
            sameDayOfWeekTxs.length
          : avg;

      return (avg > 0 && t.value > avg * 0.8 && t.value > 200) || (dayAvg > 0 && t.value > dayAvg * 2);
    });
  }, [transactions, today]);
};

/**
 * Hook: Generate trend data for 6-month cash flow chart
 */
export const useTrendData = (
  transactions: Transaction[],
  today: Date = new Date()
): ChartDataPoint[] => {
  return useMemo(() => {
    // Ensure transactions is an array
    const safeTx = Array.isArray(transactions) ? transactions : [];
    const data: ChartDataPoint[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthName = d.toLocaleString('pt-BR', { month: 'short' });

      const monthTx = safeTx.filter(t => {
        const tDate = new Date(t.date);
        return tDate.getMonth() === d.getMonth() && tDate.getFullYear() === d.getFullYear();
      });

      const income = monthTx
        .filter(t => t.type === 'INCOME')
        .reduce((acc, t) => acc + t.value, 0);

      const expense = monthTx
        .filter(t => t.type === 'EXPENSE')
        .reduce((acc, t) => acc + t.value, 0);

      data.push({ name: monthName, Income: income, Expense: expense });
    }

    return data;
  }, [transactions, today]);
};

/**
 * Hook: Generate category breakdown data for pie chart
 */
export const useCategoryChartData = (
  transactions: Transaction[],
  categories: Category[],
  today: Date = new Date()
): CategoryChartData[] => {
  return useMemo(() => {
    // Ensure arrays are defined
    const safeTx = Array.isArray(transactions) ? transactions : [];
    const safeCats = Array.isArray(categories) ? categories : [];

    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const currentMonthTx = safeTx.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const categoryMap = Object.entries(
      currentMonthTx
        .filter(t => t.type === 'EXPENSE')
        .reduce((acc, t) => {
          acc[t.categoryId] = (acc[t.categoryId] || 0) + t.value;
          return acc;
        }, {} as Record<string, number>)
    ).map(([catId, value]) => {
      const cat = safeCats.find(c => c.id === catId);
      return { name: cat?.name || 'Outros', value, color: cat?.color || '#94a3b8' };
    });

    return categoryMap.sort((a, b) => (Number(b.value) || 0) - (Number(a.value) || 0)).slice(0, 5);
  }, [transactions, categories, today]);
};

/**
 * Helper: Get current and last month filtered transactions
 */
export const getMonthFilteredTransactions = (
  transactions: Transaction[],
  today: Date = new Date()
): { current: Transaction[]; last: Transaction[] } => {
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const current = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const last = transactions.filter(t => {
    const d = new Date(t.date);
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
  });

  return { current, last };
};
