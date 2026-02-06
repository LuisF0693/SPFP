import React from 'react';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { formatCurrency } from '../../utils';

interface BudgetMetricsProps {
  averageIncome: number;
  averageExpenses: number;
  balance: number;
}

export const BudgetMetrics: React.FC<BudgetMetricsProps> = ({
  averageIncome,
  averageExpenses,
  balance
}) => {
  const isPositive = balance >= 0;

  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Renda Média */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp size={16} className="text-emerald-400" />
          <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">
            Renda média
          </span>
        </div>
        <div className="text-xl font-bold text-emerald-400">
          {formatCurrency(averageIncome)}
        </div>
      </div>

      {/* Gastos Médios */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <TrendingDown size={16} className="text-rose-400" />
          <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">
            Gastos médios
          </span>
        </div>
        <div className="text-xl font-bold text-rose-400">
          {formatCurrency(averageExpenses)}
        </div>
      </div>

      {/* Saldo do Plano */}
      <div className={`border rounded-2xl p-4 ${
        isPositive
          ? 'bg-emerald-500/10 border-emerald-500/30'
          : 'bg-rose-500/10 border-rose-500/30'
      }`}>
        <div className="flex items-center gap-2 mb-2">
          <Wallet size={16} className={isPositive ? 'text-emerald-400' : 'text-rose-400'} />
          <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">
            Saldo do plano
          </span>
        </div>
        <div className={`text-xl font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
          {isPositive ? '' : '-'}{formatCurrency(Math.abs(balance))}
        </div>
      </div>
    </div>
  );
};
