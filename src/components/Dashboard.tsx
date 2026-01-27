import React, { useState, useEffect, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { calculateHealthScore, ClientEntry } from '../utils/crmUtils';
import { AlertTriangle, AlertCircle, TrendingUp, Users } from 'lucide-react';
import { MonthlyRecap } from './MonthlyRecap';
import {
  DashboardHeader,
  DashboardMetrics,
  DashboardAlerts,
  DashboardChart,
  DashboardTransactions,
  useMonthlyMetrics,
  useBudgetAlerts,
  useAtypicalSpending,
  useTrendData,
  useCategoryChartData,
  getMonthFilteredTransactions
} from './dashboard';

/**
 * Dashboard Container Component
 * Orchestrates dashboard widgets with data calculations.
 * Reduced from 658 LOC to ~140 LOC
 */
export const Dashboard: React.FC = () => {
  const today = new Date();
  const currentMonth = today.toLocaleString('pt-BR', {
    month: 'long',
    year: 'numeric'
  });

  // State
  const { totalBalance, transactions, categories, accounts, userProfile, categoryBudgets, goals, fetchAllUserData } = useFinance();
  const { isAdmin } = useAuth();
  const [crmAlerts, setCrmAlerts] = useState<any[]>([]);
  const [showRecap, setShowRecap] = useState(false);

  // Fetch CRM alerts if admin
  useEffect(() => {
    if (!isAdmin) return;

    const getCrmAlerts = async () => {
      try {
        const allUsers = await fetchAllUserData();
        const atRiskUsers = (allUsers as ClientEntry[]).filter(
          user => calculateHealthScore(user) < 50
        );

        const formattedAlerts = atRiskUsers.map(u => ({
          type: 'CRITICAL' as const,
          title: `CRM: Cliente em Risco`,
          message: `${u.content?.userProfile?.name || 'Cliente'} está com score baixo (${calculateHealthScore(u)}). Necessário Check-up.`,
          icon: <Users className="text-red-500" size={18} />,
          link: '/admin'
        }));

        setCrmAlerts(formattedAlerts);
      } catch (err) {
        console.error('Erro ao buscar alertas do CRM:', err);
      }
    };

    getCrmAlerts();
  }, [isAdmin, fetchAllUserData]);

  // Custom hooks for data calculations
  const { totalIncome, totalExpense } = useMonthlyMetrics(
    transactions,
    today
  );
  const budgetAlerts = useBudgetAlerts(
    transactions,
    categories,
    categoryBudgets,
    today
  );
  const atypicalAlerts = useAtypicalSpending(transactions, today);
  const trendData = useTrendData(transactions, today);
  const categoryData = useCategoryChartData(transactions, categories, today);

  // Build combined alerts list
  const alerts = useMemo(() => {
    const list: any[] = [];
    const { current: currentMonthTx } = getMonthFilteredTransactions(transactions, today);

    // Budget Alerts
    categories.forEach(cat => {
      const budget = categoryBudgets.find(b => b.categoryId === cat.id);
      if (!budget || budget.limit <= 0) return;

      const spent = currentMonthTx
        .filter(t => t.type === 'EXPENSE' && t.categoryId === cat.id)
        .reduce((sum, t) => sum + t.value, 0);

      const percentage = (spent / budget.limit) * 100;

      if (percentage >= 100) {
        list.push({
          type: 'CRITICAL',
          title: `Orçamento Estourado: ${cat.name}`,
          message: `Você excedeu o limite de R$ ${budget.limit.toFixed(2)} em R$ ${(spent - budget.limit).toFixed(2)}.`,
          icon: <AlertTriangle className="text-red-500" size={18} />,
          link: '/budget'
        });
      } else if (percentage >= 90) {
        list.push({
          type: 'WARNING',
          title: `Limite Próximo: ${cat.name}`,
          message: `Você já utilizou ${percentage.toFixed(0)}% do orçamento de ${cat.name}.`,
          icon: <AlertCircle className="text-orange-500" size={18} />,
          link: '/budget'
        });
      }
    });

    // Atypical Alerts
    atypicalAlerts.forEach(tx => {
      list.push({
        type: 'INFO',
        title: 'Gasto Atípico Detectado',
        message: `${tx.description} (R$ ${tx.value.toFixed(2)}) está acima do seu padrão habitual.`,
        icon: <TrendingUp className="text-blue-500" size={18} />,
        link: '/transactions'
      });
    });

    // CRM Alerts
    list.push(...crmAlerts);

    return list;
  }, [categories, categoryBudgets, transactions, atypicalAlerts, crmAlerts, today]);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto animate-fade-in">
      <DashboardHeader
        userName={userProfile.name?.split(' ')[0] || 'Usuário'}
        currentMonth={currentMonth}
        onRecapClick={() => setShowRecap(true)}
      />

      <DashboardAlerts alerts={alerts} />

      <DashboardMetrics
        totalBalance={totalBalance}
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        categoryBudgets={categoryBudgets}
        budgetAlertsCritical={budgetAlerts.critical}
        budgetAlertsWarning={budgetAlerts.warning}
      />

      <DashboardChart
        trendData={trendData}
        categoryData={categoryData}
        totalExpense={totalExpense}
        currentMonth={today.toLocaleString('pt-BR', { month: 'short', year: 'numeric' })}
      />

      <DashboardTransactions
        accounts={accounts}
        transactions={transactions}
        categories={categories}
      />

      {showRecap && (
        <MonthlyRecap
          onClose={() => setShowRecap(false)}
          data={{
            userName: userProfile.name?.split(' ')[0] || 'Usuário',
            month: today.toLocaleString('pt-BR', { month: 'long' }),
            income: totalIncome,
            expense: totalExpense,
            savingsRate: totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0,
            topCategory: categoryData[0]
              ? { name: categoryData[0].name, spent: Number(categoryData[0].value) }
              : { name: 'Geral', spent: totalExpense },
            goalsReached: goals.filter(g => g.status === 'COMPLETED').length,
            investmentGrowth: 2.4,
            bestSavingCategory: categories
              .map(cat => {
                const b = categoryBudgets.find(b => b.categoryId === cat.id);
                if (!b || b.limit <= 0) return null;
                const { current: currentMonthTx } = getMonthFilteredTransactions(
                  transactions,
                  today
                );
                const spent = currentMonthTx
                  .filter(t => t.type === 'EXPENSE' && t.categoryId === cat.id)
                  .reduce((sum, t) => sum + t.value, 0);
                return { name: cat.name, saving: b.limit - spent };
              })
              .filter(Boolean)
              .sort((a, b) => b!.saving - a!.saving)[0] as { name: string; saving: number } | undefined
          }}
        />
      )}
    </div>
  );
};

