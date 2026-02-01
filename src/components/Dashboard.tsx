import React, { memo, useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { MonthlyRecap } from './MonthlyRecap';
import {
  DashboardHeader,
  DashboardMetrics,
  DashboardChart,
  DashboardAlerts,
  DashboardTransactions,
  useMonthlyMetrics,
  useBudgetAlerts,
  useAtypicalSpending,
  useTrendData,
  useCategoryChartData
} from './dashboard';
import { AlertTriangle, Zap } from 'lucide-react';

/**
 * Dashboard Container Component (STY-011)
 * Orchestrates dashboard sub-components with <200 LOC
 *
 * Composition:
 * - DashboardHeader: User greeting + action buttons
 * - DashboardMetrics: 3 top metric cards
 * - DashboardAlerts: Budget & atypical spending alerts
 * - DashboardChart: Trend + category breakdown charts
 * - DashboardTransactions: Recent transactions + accounts
 * - MonthlyRecap: Modal for monthly summary
 */
export const Dashboard: React.FC = memo(() => {
  const {
    totalBalance,
    userProfile,
    transactions,
    categories,
    categoryBudgets,
    accounts
  } = useFinance();
  const { isAdmin } = useAuth();

  const [showRecap, setShowRecap] = useState(false);

  // Custom hooks for data calculations
  const { totalIncome, totalExpense } = useMonthlyMetrics(transactions);
  const { critical, warning } = useBudgetAlerts(transactions, categories, categoryBudgets);
  const atypicalTransactions = useAtypicalSpending(transactions);
  const trendData = useTrendData(transactions);
  const categoryData = useCategoryChartData(transactions, categories);

  // Current month display
  const currentMonth = new Date().toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
  const userName = userProfile.name?.split(' ')[0] || 'Usuário';

  // Build alerts array
  const alerts = [];

  if (critical > 0 || warning > 0) {
    alerts.push({
      type: 'CRITICAL' as const,
      title: `${critical + warning} Alertas de Orçamento`,
      message: `${critical} críticos, ${warning} avisos. Verifique seus limites de gastos.`,
      icon: <AlertTriangle size={20} className="text-red-500" />,
      link: '/budget'
    });
  }

  if (atypicalTransactions.length > 0) {
    alerts.push({
      type: 'WARNING' as const,
      title: `${atypicalTransactions.length} Gastos Atípicos`,
      message: 'Detectamos transações fora do padrão. Revise com atenção.',
      icon: <Zap size={20} className="text-orange-500" />,
      link: '/transactions'
    });
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto animate-fade-in">
      {/* Header Section */}
      <DashboardHeader
        userName={userName}
        currentMonth={currentMonth}
        onRecapClick={() => setShowRecap(true)}
      />

      {/* Admin Alert (if applicable) */}
      {isAdmin && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg animate-pulse">
          <p className="text-blue-900 dark:text-blue-100 text-sm font-medium">
            🔐 Acesso de Administrador Ativo
          </p>
        </div>
      )}

      {/* Top Metrics */}
      <DashboardMetrics
        totalBalance={totalBalance}
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        categoryBudgets={categoryBudgets}
        budgetAlertsCritical={critical}
        budgetAlertsWarning={warning}
      />

      {/* Alerts Section */}
      <DashboardAlerts alerts={alerts} />

      {/* Charts Section */}
      <DashboardChart
        trendData={trendData}
        categoryData={categoryData}
        totalExpense={totalExpense}
        currentMonth={currentMonth}
      />

      {/* Recent Transactions + Accounts */}
      <DashboardTransactions
        accounts={accounts}
        transactions={transactions}
        categories={categories}
      />

      {/* Monthly Recap Modal */}
      {showRecap && (
        <MonthlyRecap
          onClose={() => setShowRecap(false)}
          data={{
            userName,
            month: currentMonth,
            income: totalIncome,
            expense: totalExpense,
            savingsRate: totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0,
            topCategory: categoryData[0]
              ? { name: categoryData[0].name, spent: categoryData[0].value }
              : { name: 'Geral', spent: 0 },
            goalsReached: 0,
            investmentGrowth: 0,
            bestSavingCategory: undefined,
          }}
        />
      )}
    </div>
  );
});

Dashboard.displayName = 'Dashboard';
