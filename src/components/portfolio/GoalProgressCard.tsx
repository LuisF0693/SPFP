import React from 'react';
import { Target, TrendingUp, Wallet } from 'lucide-react';
import { Goal } from '../../types';
import { Investment, GoalInvestmentSummary } from '../../types/investments';
import { formatCurrency } from '../../utils';

interface GoalProgressCardProps {
  goal: Goal;
  linkedInvestments: Investment[];
  onClick?: () => void;
}

export const GoalProgressCard: React.FC<GoalProgressCardProps> = ({
  goal,
  linkedInvestments,
  onClick,
}) => {
  // Calculate total invested amount
  const investedAmount = linkedInvestments.reduce((sum, inv) => {
    const value = inv.quantity * inv.average_price;
    // Convert USD to BRL if needed (simplified)
    return sum + (inv.currency === 'USD' ? value * 5.0 : value);
  }, 0);

  // Calculate progress
  const totalProgress = goal.targetAmount > 0
    ? Math.min(100, ((goal.currentAmount + investedAmount) / goal.targetAmount) * 100)
    : 0;

  const investmentProgress = goal.targetAmount > 0
    ? Math.min(100, (investedAmount / goal.targetAmount) * 100)
    : 0;

  const manualProgress = goal.targetAmount > 0
    ? Math.min(100, (goal.currentAmount / goal.targetAmount) * 100)
    : 0;

  return (
    <div
      onClick={onClick}
      className={`
        relative rounded-2xl bg-white dark:bg-[#1A2233]
        border border-[#e6e8eb] dark:border-[#2e374a]
        p-5 hover:border-[#135bec]/50 transition-all
        ${onClick ? 'cursor-pointer' : ''}
        group
      `}
    >
      {/* Glow effect */}
      <div
        className="absolute -top-16 -right-16 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity"
        style={{ backgroundColor: goal.color }}
      />

      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: `linear-gradient(135deg, ${goal.color}30, ${goal.color}10)`,
            color: goal.color,
          }}
        >
          <Target className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-bold truncate">{goal.name}</h3>
          <p className="text-sm text-[#92a4c9]">
            Prazo: {new Date(goal.deadline).toLocaleDateString('pt-BR')}
          </p>
        </div>
        {totalProgress >= 100 && (
          <div className="px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase">
            Concluído
          </div>
        )}
      </div>

      {/* Values */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-2 rounded-lg bg-[#101622]/50">
          <p className="text-[10px] text-[#92a4c9] uppercase tracking-wider mb-1">Meta</p>
          <p className="text-white font-bold text-sm">{formatCurrency(goal.targetAmount)}</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-[#101622]/50">
          <p className="text-[10px] text-[#92a4c9] uppercase tracking-wider mb-1">Aportes</p>
          <p className="text-amber-400 font-bold text-sm">{formatCurrency(goal.currentAmount)}</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-[#101622]/50">
          <p className="text-[10px] text-[#92a4c9] uppercase tracking-wider mb-1">Investimentos</p>
          <p className="text-emerald-400 font-bold text-sm">{formatCurrency(investedAmount)}</p>
        </div>
      </div>

      {/* Stacked Progress Bar */}
      <div className="relative mb-3">
        <div className="h-3 bg-[#101622] rounded-full overflow-hidden">
          {/* Manual Progress */}
          <div
            className="h-full transition-all duration-500 absolute left-0 top-0"
            style={{
              width: `${manualProgress}%`,
              backgroundColor: goal.color,
              opacity: 0.6,
            }}
          />
          {/* Investment Progress (stacked on top) */}
          <div
            className="h-full transition-all duration-500 absolute top-0"
            style={{
              left: `${manualProgress}%`,
              width: `${Math.min(investmentProgress, 100 - manualProgress)}%`,
              backgroundColor: '#22c55e',
            }}
          />
        </div>
        <div className="flex justify-between mt-1 text-xs">
          <span className="text-[#92a4c9]">{totalProgress.toFixed(0)}% completo</span>
          <span className="text-[#6e85a3]">
            Faltam {formatCurrency(Math.max(0, goal.targetAmount - goal.currentAmount - investedAmount))}
          </span>
        </div>
      </div>

      {/* Linked Investments */}
      {linkedInvestments.length > 0 && (
        <div className="pt-3 border-t border-[#2e374a]">
          <p className="text-xs text-[#92a4c9] uppercase tracking-wider mb-2 flex items-center gap-1">
            <Wallet className="w-3 h-3" />
            {linkedInvestments.length} investimentos vinculados
          </p>
          <div className="flex flex-wrap gap-1">
            {linkedInvestments.slice(0, 4).map(inv => (
              <span
                key={inv.id}
                className="px-2 py-1 rounded-lg bg-[#101622] text-[10px] text-[#92a4c9]"
              >
                {inv.ticker || inv.name}
              </span>
            ))}
            {linkedInvestments.length > 4 && (
              <span className="px-2 py-1 rounded-lg bg-[#135bec]/20 text-[10px] text-[#135bec]">
                +{linkedInvestments.length - 4}
              </span>
            )}
          </div>
        </div>
      )}

      {linkedInvestments.length === 0 && (
        <div className="pt-3 border-t border-[#2e374a] text-center">
          <p className="text-xs text-[#6e85a3]">
            Nenhum investimento vinculado
          </p>
        </div>
      )}
    </div>
  );
};

export default GoalProgressCard;
