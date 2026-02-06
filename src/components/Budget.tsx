/**
 * Budget Component - Redesign STY-062
 * Inspired by financial planning dashboard reference
 *
 * Features:
 * - Budget metrics overview (income, expenses, balance)
 * - Stacked bar chart (income vs expenses by category)
 * - Category list with progress bars
 * - Insight cards (deficit/surplus alerts)
 * - Emergency fund calculator
 */

import React, { useMemo, useState } from 'react';
import { useSafeFinance } from '../hooks/useSafeFinance';
import { formatCurrency } from '../utils';
import {
  BudgetMetrics,
  BudgetChart,
  BudgetCategoryList,
  CategoryBudgetItem,
  InsightCard,
  EmergencyFundCard
} from './budget';

type ViewMode = 'MONTHLY' | 'YEARLY';

export const Budget: React.FC = () => {
  const {
    transactions,
    categories,
    categoryBudgets,
    updateCategoryBudget,
    investments
  } = useSafeFinance();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('MONTHLY');
  const [emergencyMonths, setEmergencyMonths] = useState(6);

  // Date Navigation
  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'MONTHLY') newDate.setMonth(newDate.getMonth() - 1);
    else newDate.setFullYear(newDate.getFullYear() - 1);
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'MONTHLY') newDate.setMonth(newDate.getMonth() + 1);
    else newDate.setFullYear(newDate.getFullYear() + 1);
    setCurrentDate(newDate);
  };

  // Calculate current period data
  const { income, expense, expensesByCategory } = useMemo(() => {
    const targetMonth = currentDate.getMonth();
    const targetYear = currentDate.getFullYear();
    const catMap = new Map<string, number>();
    let inc = 0;
    let exp = 0;

    const safeTx = Array.isArray(transactions) ? transactions : [];
    safeTx.forEach(tx => {
      const date = new Date(tx.date);
      const txYear = date.getFullYear();
      const txMonth = date.getMonth();

      const isMatch = viewMode === 'MONTHLY'
        ? txYear === targetYear && txMonth === targetMonth
        : txYear === targetYear;

      if (isMatch) {
        if (tx.type === 'INCOME') inc += tx.value;
        else if (tx.type === 'EXPENSE') {
          exp += tx.value;
          const cur = catMap.get(tx.categoryId) || 0;
          catMap.set(tx.categoryId, cur + tx.value);
        }
      }
    });

    return { income: inc, expense: exp, expensesByCategory: catMap };
  }, [transactions, currentDate, viewMode]);

  // Calculate average income/expense (last 3 months)
  const averages = useMemo(() => {
    const now = new Date();
    const monthlyData: { income: number; expense: number }[] = [];

    for (let i = 1; i <= 3; i++) {
      const targetMonth = now.getMonth() - i;
      const targetYear = now.getFullYear() + Math.floor((now.getMonth() - i) / 12);
      const adjustedMonth = ((targetMonth % 12) + 12) % 12;

      let monthIncome = 0;
      let monthExpense = 0;

      const safeTx = Array.isArray(transactions) ? transactions : [];
      safeTx.forEach(tx => {
        const date = new Date(tx.date);
        if (date.getMonth() === adjustedMonth && date.getFullYear() === targetYear) {
          if (tx.type === 'INCOME') monthIncome += tx.value;
          else if (tx.type === 'EXPENSE') monthExpense += tx.value;
        }
      });

      if (monthIncome > 0 || monthExpense > 0) {
        monthlyData.push({ income: monthIncome, expense: monthExpense });
      }
    }

    if (monthlyData.length === 0) {
      return { avgIncome: income, avgExpense: expense };
    }

    const avgIncome = monthlyData.reduce((sum, m) => sum + m.income, 0) / monthlyData.length;
    const avgExpense = monthlyData.reduce((sum, m) => sum + m.expense, 0) / monthlyData.length;

    return { avgIncome, avgExpense };
  }, [transactions, income, expense]);

  // Build category budget data
  const budgetData = useMemo((): CategoryBudgetItem[] => {
    return categories
      .filter(cat => cat.group !== 'INCOME')
      .map(cat => {
        const spent = expensesByCategory.get(cat.id) || 0;
        const baseLimit = categoryBudgets.find(b => b.categoryId === cat.id)?.limit || 0;
        const limit = viewMode === 'YEARLY' ? baseLimit * 12 : baseLimit;

        return {
          id: cat.id,
          name: cat.name,
          icon: cat.icon || '📦',
          color: cat.color || '#3B82F6',
          spent,
          limit,
          group: cat.group || 'VARIABLE'
        };
      })
      .filter(item => item.spent > 0 || item.limit > 0)
      .sort((a, b) => b.spent - a.spent);
  }, [categories, expensesByCategory, categoryBudgets, viewMode]);

  // Chart data for expenses
  const chartExpenses = budgetData.map(item => ({
    name: item.name,
    value: item.spent,
    color: item.color,
    group: item.group
  }));

  // Calculate insight type
  const balance = averages.avgIncome - averages.avgExpense;
  const insightType = balance < 0 ? 'DEFICIT' : balance > averages.avgIncome * 0.1 ? 'SURPLUS' : 'ON_TRACK';
  const insightPercentage = averages.avgIncome > 0 ? (Math.abs(balance) / averages.avgIncome) * 100 : 0;

  // Emergency fund calculation
  const emergencyFundIdeal = averages.avgExpense * emergencyMonths;
  const currentEmergencyFund = useMemo(() => {
    if (!investments || !Array.isArray(investments)) return 0;
    // Assume emergency fund is in low-risk investments
    return investments
      .filter(inv => inv.type === 'EMERGENCY_FUND' || inv.name?.toLowerCase().includes('emergência'))
      .reduce((sum, inv) => sum + (inv.currentValue || 0), 0);
  }, [investments]);

  // Handle budget limit edit
  const handleEditLimit = (categoryId: string, newLimit: number) => {
    updateCategoryBudget(categoryId, newLimit);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Orçamento</h1>
        <p className="text-sm text-slate-400">Acompanhe seus gastos e metas por categoria</p>
      </div>

      {/* Metrics Overview */}
      <BudgetMetrics
        averageIncome={averages.avgIncome}
        averageExpenses={averages.avgExpense}
        balance={balance}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Chart + Insights */}
        <div className="lg:col-span-3 space-y-4">
          {/* Bar Chart */}
          <BudgetChart
            income={income}
            expenses={chartExpenses}
          />

          {/* Insight Card */}
          <InsightCard
            type={insightType}
            value={Math.abs(balance)}
            percentage={insightPercentage}
            income={averages.avgIncome}
          />

          {/* Emergency Fund Card */}
          <EmergencyFundCard
            idealAmount={emergencyFundIdeal}
            currentAmount={currentEmergencyFund}
            monthsOfExpenses={emergencyMonths}
            onEditMonths={setEmergencyMonths}
          />
        </div>

        {/* Right: Category List */}
        <div className="lg:col-span-2">
          <BudgetCategoryList
            categories={budgetData}
            currentDate={currentDate}
            onPrevMonth={handlePrev}
            onNextMonth={handleNext}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onEditLimit={handleEditLimit}
          />
        </div>
      </div>
    </div>
  );
};
