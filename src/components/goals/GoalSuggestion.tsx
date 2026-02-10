import React, { useMemo } from 'react';
import { Sparkles, TrendingUp, TrendingDown, Lightbulb } from 'lucide-react';
import { formatCurrency } from '../../utils';
import { Transaction } from '../../types';
import { ActionButton } from '../ui/ActionButton';

export interface SuggestedGoal {
  type: 'emergency' | 'savings' | 'debt' | 'investment';
  name: string;
  targetAmount: number;
  deadline: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  icon: string;
  color: string;
}

interface GoalSuggestionProps {
  transactions: Transaction[];
  existingGoalsCount: number;
  onAcceptSuggestion: (suggestion: SuggestedGoal) => void;
  onDismiss?: () => void;
  className?: string;
}

export const GoalSuggestion: React.FC<GoalSuggestionProps> = ({
  transactions,
  existingGoalsCount,
  onAcceptSuggestion,
  onDismiss,
  className = '',
}) => {
  // Calculate previous month's income and expenses
  const previousMonthStats = useMemo(() => {
    const now = new Date();
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const previousMonthTransactions = transactions.filter(tx => {
      const txDate = new Date(tx.date);
      return txDate >= previousMonth && txDate <= previousMonthEnd;
    });

    const income = previousMonthTransactions
      .filter(tx => tx.type === 'INCOME')
      .reduce((sum, tx) => sum + tx.value, 0);

    const expenses = previousMonthTransactions
      .filter(tx => tx.type === 'EXPENSE')
      .reduce((sum, tx) => sum + tx.value, 0);

    const savings = income - expenses;
    const savingsRate = income > 0 ? (savings / income) * 100 : 0;

    return { income, expenses, savings, savingsRate };
  }, [transactions]);

  // Generate smart suggestions based on data
  const suggestions = useMemo((): SuggestedGoal[] => {
    const { income, expenses, savings, savingsRate } = previousMonthStats;
    const suggestionsArray: SuggestedGoal[] = [];

    // Calculate deadlines
    const addMonths = (months: number) => {
      const date = new Date();
      date.setMonth(date.getMonth() + months);
      return date.toISOString().split('T')[0];
    };

    // 1. Emergency Fund (if no goals yet or low savings rate)
    if (existingGoalsCount === 0 || savingsRate < 10) {
      const emergencyTarget = expenses * 6; // 6 months of expenses
      suggestionsArray.push({
        type: 'emergency',
        name: 'Reserva de Emergência',
        targetAmount: Math.round(emergencyTarget / 100) * 100,
        deadline: addMonths(12),
        description: `Baseado nos seus gastos de ${formatCurrency(expenses)}/mês, sugerimos uma reserva de 6 meses.`,
        priority: 'high',
        icon: 'shield',
        color: '#22c55e',
      });
    }

    // 2. Savings Goal (based on savings rate)
    if (savings > 0) {
      const yearlyTarget = savings * 12;
      suggestionsArray.push({
        type: 'savings',
        name: 'Meta de Economia Anual',
        targetAmount: Math.round(yearlyTarget / 100) * 100,
        deadline: addMonths(12),
        description: `Com sua economia de ${formatCurrency(savings)}/mês, você pode juntar ${formatCurrency(yearlyTarget)} em 1 ano!`,
        priority: 'medium',
        icon: 'piggy-bank',
        color: '#3b82f6',
      });
    }

    // 3. Investment Goal (if good savings rate)
    if (savingsRate >= 20) {
      const investmentTarget = income * 0.1 * 12; // 10% of income for 12 months
      suggestionsArray.push({
        type: 'investment',
        name: 'Iniciar Investimentos',
        targetAmount: Math.round(investmentTarget / 100) * 100,
        deadline: addMonths(6),
        description: `Você tem uma boa taxa de economia! Que tal destinar 10% da renda para investimentos?`,
        priority: 'medium',
        icon: 'trending-up',
        color: '#8b5cf6',
      });
    }

    // 4. Debt Reduction (if negative savings)
    if (savings < 0) {
      const debtTarget = Math.abs(savings) * 3;
      suggestionsArray.push({
        type: 'debt',
        name: 'Reduzir Dívidas',
        targetAmount: Math.round(debtTarget / 100) * 100,
        deadline: addMonths(6),
        description: `Seus gastos superaram a renda em ${formatCurrency(Math.abs(savings))}. Vamos trabalhar nisso!`,
        priority: 'high',
        icon: 'alert-triangle',
        color: '#ef4444',
      });
    }

    return suggestionsArray;
  }, [previousMonthStats, existingGoalsCount]);

  if (suggestions.length === 0) {
    return null;
  }

  const topSuggestion = suggestions[0];

  return (
    <div className={`
      relative overflow-hidden
      rounded-2xl bg-gradient-to-br from-[#1A2233] to-[#101622]
      border border-[#2e374a]
      p-6
      ${className}
    `}>
      {/* Background glow */}
      <div
        className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-20"
        style={{ backgroundColor: topSuggestion.color }}
      />

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10">
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">Sugestão Inteligente</h3>
            <p className="text-[#92a4c9] text-sm">
              Baseado no seu mês anterior
            </p>
          </div>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-[#92a4c9] hover:text-white text-sm transition-colors"
          >
            Dispensar
          </button>
        )}
      </div>

      {/* Previous Month Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6 p-4 rounded-xl bg-[#101622]/50">
        <div>
          <p className="text-xs text-[#92a4c9] uppercase tracking-wider mb-1">Renda</p>
          <p className="text-white font-bold flex items-center gap-1">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            {formatCurrency(previousMonthStats.income)}
          </p>
        </div>
        <div>
          <p className="text-xs text-[#92a4c9] uppercase tracking-wider mb-1">Despesas</p>
          <p className="text-white font-bold flex items-center gap-1">
            <TrendingDown className="w-4 h-4 text-rose-400" />
            {formatCurrency(previousMonthStats.expenses)}
          </p>
        </div>
        <div>
          <p className="text-xs text-[#92a4c9] uppercase tracking-wider mb-1">Sobra</p>
          <p className={`font-bold ${previousMonthStats.savings >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {formatCurrency(previousMonthStats.savings)}
          </p>
        </div>
      </div>

      {/* Top Suggestion Card */}
      <div
        className="p-5 rounded-xl border border-[#2e374a] bg-[#1A2233]/50 mb-4"
        style={{ borderColor: `${topSuggestion.color}30` }}
      >
        <div className="flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: `linear-gradient(135deg, ${topSuggestion.color}30, ${topSuggestion.color}10)`
            }}
          >
            <Lightbulb className="w-6 h-6" style={{ color: topSuggestion.color }} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-white font-bold">{topSuggestion.name}</h4>
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase"
                style={{
                  backgroundColor: `${topSuggestion.color}20`,
                  color: topSuggestion.color
                }}
              >
                {topSuggestion.priority === 'high' ? 'Prioridade' : 'Sugerido'}
              </span>
            </div>
            <p className="text-[#92a4c9] text-sm mb-3">{topSuggestion.description}</p>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-white font-bold">
                Meta: {formatCurrency(topSuggestion.targetAmount)}
              </span>
              <span className="text-[#92a4c9]">
                até {new Date(topSuggestion.deadline).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <ActionButton
          label="Criar Esta Meta"
          onClick={() => onAcceptSuggestion(topSuggestion)}
          className="flex-1"
        />
        {suggestions.length > 1 && (
          <button className="px-4 py-2 rounded-xl border border-[#2e374a] text-[#92a4c9] hover:text-white hover:border-[#135bec] transition-colors text-sm font-medium">
            Ver +{suggestions.length - 1} sugestões
          </button>
        )}
      </div>
    </div>
  );
};

export default GoalSuggestion;
