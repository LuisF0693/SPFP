import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { MonthlyRecap } from './MonthlyRecap';

/**
 * Dashboard Container Component
 * NOTE: This is a temporary stub. STY-011 will implement full dashboard decomposition
 * with proper component extraction (DashboardHeader, DashboardMetrics, etc.)
 */
export const Dashboard: React.FC = () => {
  const { totalBalance, userProfile } = useFinance();
  const { isAdmin } = useAuth();

  const [showRecap, setShowRecap] = React.useState(false);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Bem-vindo de volta, {userProfile.name?.split(' ')[0] || 'Usuário'}!
          </p>
        </div>
        <button
          onClick={() => setShowRecap(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
        >
          Resumo Mensal
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400 text-sm">Saldo Total</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            R$ {totalBalance.toFixed(2)}
          </p>
        </div>
      </div>

      {isAdmin && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
          <p className="text-blue-900 dark:text-blue-100 text-sm">
            Acesso de Administrador Ativo
          </p>
        </div>
      )}

      {showRecap && (
        <MonthlyRecap
          onClose={() => setShowRecap(false)}
          data={{
            userName: userProfile.name?.split(' ')[0] || 'Usuário',
            month: new Date().toLocaleString('pt-BR', { month: 'long' }),
            income: 0,
            expense: 0,
            savingsRate: 0,
            topCategory: { name: 'Geral', spent: 0 },
            goalsReached: 0,
            investmentGrowth: 0,
            bestSavingCategory: undefined,
          }}
        />
      )}

      <div className="text-sm text-gray-600 dark:text-gray-400 mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <p className="font-semibold mb-2">ℹ️ Nota de Desenvolvimento</p>
        <p>
          O dashboard completo está sendo refatorado em STY-011.
          Esta é uma versão simplificada para suportar TypeScript strict mode (STY-002).
        </p>
      </div>
    </div>
  );
};
