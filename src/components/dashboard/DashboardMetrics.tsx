import React, { memo, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../utils';
import {
  Wallet,
  CreditCard,
  Target,
  ArrowUpRight,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { CategoryBudget } from '../../types';

interface DashboardMetricsProps {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  categoryBudgets: CategoryBudget[];
  budgetAlertsCritical: number;
  budgetAlertsWarning: number;
}

/**
 * Three top metric cards: Net Worth, Monthly Spending, Budget Status
 * ~115 LOC
 */
export const DashboardMetrics = memo<DashboardMetricsProps>(
  ({
    totalBalance,
    totalIncome,
    totalExpense,
    categoryBudgets,
    budgetAlertsCritical,
    budgetAlertsWarning
  }) => {
    const navigate = useNavigate();

    // Calculate budget progress
    const totalBudgeted = useMemo(
      () => categoryBudgets.reduce((sum, b) => sum + b.limit, 0),
      [categoryBudgets]
    );

    const isBudgetSet = totalBudgeted > 0;
    const budgetProgress = isBudgetSet
      ? Math.min((totalExpense / totalBudgeted) * 100, 100)
      : 0;

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Total Net Worth */}
        <div className="bg-white dark:bg-[#111827] p-6 rounded-[24px] border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden group glass-shimmer card-hover">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">
                Patrimônio Líquido
              </p>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white mt-1">
                {formatCurrency(totalBalance)}
              </h2>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-500">
              <Wallet size={24} />
            </div>
          </div>
          <div className="flex items-center text-sm">
            <span className="bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-md font-bold text-xs flex items-center mr-2">
              <ArrowUpRight size={12} className="mr-1" /> +2.4%
            </span>
            <span className="text-gray-400 text-xs">vs mês passado</span>
          </div>
        </div>

        {/* Card 2: Monthly Spending */}
        <div className="bg-white dark:bg-[#111827] p-6 rounded-[24px] border border-gray-100 dark:border-gray-800 shadow-sm glass-shimmer card-hover">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">
                Gastos do Mês
              </p>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white mt-1">
                {formatCurrency(totalExpense)}
              </h2>
            </div>
            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl text-orange-500">
              <CreditCard size={24} />
            </div>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden mb-2">
            <div
              className="bg-orange-500 h-full rounded-full"
              style={{
                width: `${Math.min(
                  (totalExpense / (totalIncome || 1)) * 100,
                  100
                )}%`
              }}
            />
          </div>
          <p className="text-xs text-gray-400">
            {totalIncome > 0
              ? `${Math.round((totalExpense / totalIncome) * 100)}% da renda mensal`
              : 'Sem renda registrada este mês'}
          </p>
        </div>

        {/* Card 3: Budget Status */}
        <div
          className="bg-white dark:bg-[#111827] p-6 rounded-[24px] border border-gray-100 dark:border-gray-800 shadow-sm cursor-pointer hover:border-blue-500/30 transition-colors glass-shimmer card-hover"
          onClick={() => navigate('/budget')}
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">
                Metas Financeiras
              </p>
              {isBudgetSet ? (
                <div className="mt-1">
                  {budgetAlertsCritical > 0 || budgetAlertsWarning > 0 ? (
                    <h2 className="text-2xl font-black text-red-500 flex items-center gap-2">
                      {budgetAlertsCritical + budgetAlertsWarning} Alertas
                      <AlertTriangle
                        size={24}
                        className="text-red-500 animate-pulse"
                      />
                    </h2>
                  ) : (
                    <h2 className="text-2xl font-black text-emerald-500 flex items-center gap-2">
                      Em Dia
                      <CheckCircle size={24} className="text-emerald-500" />
                    </h2>
                  )}
                </div>
              ) : (
                <h2 className="text-xl font-bold text-gray-400 mt-1">
                  Não definidas
                </h2>
              )}
            </div>
            <div
              className={`p-3 rounded-xl ${
                budgetAlertsCritical > 0
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-500'
                  : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500'
              }`}
            >
              <Target size={24} />
            </div>
          </div>

          {isBudgetSet ? (
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">Progresso Geral</span>
                <span className="text-white font-bold">
                  {budgetProgress.toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${
                    budgetAlertsCritical > 0 ? 'bg-red-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${budgetProgress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {budgetAlertsCritical > 0
                  ? `${budgetAlertsCritical} categorias excederam o limite.`
                  : 'Você está dentro do planejado.'}
              </p>
            </div>
          ) : (
            <p className="text-xs text-gray-400 mt-2">
              Toque para configurar suas metas mensais.
            </p>
          )}
        </div>
      </div>
    );
  }
);

DashboardMetrics.displayName = 'DashboardMetrics';
