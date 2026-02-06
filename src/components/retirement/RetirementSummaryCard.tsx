import React from 'react';
import { TrendingUp, Target } from 'lucide-react';
import { formatCurrency } from '../../utils';

interface RetirementSummaryCardProps {
  requiredMonthlyInvestment: number;
  targetPatrimony: number;
  yearsToRetirement: number;
  targetMonthlyIncome: number;
}

export const RetirementSummaryCard: React.FC<RetirementSummaryCardProps> = ({
  requiredMonthlyInvestment,
  targetPatrimony,
  yearsToRetirement,
  targetMonthlyIncome
}) => {
  return (
    <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 rounded-2xl p-5 space-y-4">
      {/* Main Message */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
          <TrendingUp size={20} className="text-emerald-400" />
        </div>
        <div>
          <p className="text-slate-300 text-sm leading-relaxed">
            Você precisa investir{' '}
            <span className="text-emerald-400 font-bold">
              {formatCurrency(requiredMonthlyInvestment)}/mês
            </span>{' '}
            para chegar na sua aposentadoria ideal com{' '}
            <span className="text-emerald-400 font-bold">
              {formatCurrency(targetPatrimony)}
            </span>{' '}
            acumulados.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <div className="bg-slate-800/50 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <Target size={14} className="text-blue-400" />
            <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">
              Anos restantes
            </span>
          </div>
          <span className="text-xl font-bold text-white">{yearsToRetirement}</span>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={14} className="text-amber-400" />
            <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">
              Renda mensal
            </span>
          </div>
          <span className="text-xl font-bold text-white">
            {formatCurrency(targetMonthlyIncome)}
          </span>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-[10px] text-slate-500 leading-relaxed">
        * Cálculo baseado em retorno médio de 8% a.a. e regra dos 4% para retirada sustentável.
      </p>
    </div>
  );
};
