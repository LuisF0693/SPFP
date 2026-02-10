import React, { useState, useMemo } from 'react';
import { X, Target, Link2, Unlink, TrendingUp, Check } from 'lucide-react';
import { Investment, GoalInvestmentSummary } from '../../types/investments';
import { Goal } from '../../types';
import { formatCurrency } from '../../utils';
import { ActionButton } from '../ui/ActionButton';

interface GoalLinkingModalProps {
  investment: Investment;
  goals: Goal[];
  investments: Investment[];
  onLink: (investmentId: string, goalId: string | null) => void;
  onClose: () => void;
}

export const GoalLinkingModal: React.FC<GoalLinkingModalProps> = ({
  investment,
  goals,
  investments,
  onLink,
  onClose,
}) => {
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(investment.goal_id || null);

  // Calculate goal summaries with linked investments
  const goalSummaries = useMemo((): GoalInvestmentSummary[] => {
    return goals.map(goal => {
      const linkedInvestments = investments.filter(inv => inv.goal_id === goal.id);
      const investedAmount = linkedInvestments.reduce((sum, inv) => {
        const value = inv.quantity * inv.average_price;
        // Convert USD to BRL if needed (simplified - should use real exchange rate)
        return sum + (inv.currency === 'USD' ? value * 5.0 : value);
      }, 0);

      return {
        goal_id: goal.id,
        goal_name: goal.name,
        target_value: goal.targetAmount,
        invested_amount: investedAmount,
        progress_percentage: goal.targetAmount > 0
          ? Math.min(100, (investedAmount / goal.targetAmount) * 100)
          : 0,
        investments: linkedInvestments,
      };
    });
  }, [goals, investments]);

  const handleSave = () => {
    onLink(investment.id, selectedGoalId);
    onClose();
  };

  const investmentValue = investment.quantity * investment.average_price;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-[#1A2233] border border-[#2e374a] shadow-2xl max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#2e374a]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#135bec]/20 to-[#135bec]/10">
              <Link2 className="w-5 h-5 text-[#135bec]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Vincular a Objetivo</h2>
              <p className="text-sm text-[#92a4c9]">{investment.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[#92a4c9] hover:text-white hover:bg-[#2e374a] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Investment Info */}
        <div className="p-4 mx-6 mt-4 rounded-xl bg-[#101622]/50 border border-[#2e374a]">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-[#92a4c9] uppercase tracking-wider mb-1">Investimento</p>
              <p className="text-white font-bold">{investment.name}</p>
              <p className="text-sm text-[#92a4c9]">
                {investment.ticker || investment.type.toUpperCase()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#92a4c9] uppercase tracking-wider mb-1">Valor</p>
              <p className="text-xl font-bold text-emerald-400">
                {formatCurrency(investmentValue, investment.currency)}
              </p>
            </div>
          </div>
        </div>

        {/* Goals List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {/* Unlink Option */}
          <button
            onClick={() => setSelectedGoalId(null)}
            className={`
              w-full p-4 rounded-xl border text-left transition-all
              ${selectedGoalId === null
                ? 'bg-[#135bec]/10 border-[#135bec]/50'
                : 'bg-[#101622]/50 border-[#2e374a] hover:border-[#135bec]/30'}
            `}
          >
            <div className="flex items-center gap-3">
              <div className={`
                w-10 h-10 rounded-lg flex items-center justify-center
                ${selectedGoalId === null ? 'bg-[#135bec]/20' : 'bg-[#2e374a]'}
              `}>
                <Unlink className={`w-5 h-5 ${selectedGoalId === null ? 'text-[#135bec]' : 'text-[#92a4c9]'}`} />
              </div>
              <div>
                <p className={`font-medium ${selectedGoalId === null ? 'text-white' : 'text-[#92a4c9]'}`}>
                  Sem vínculo
                </p>
                <p className="text-xs text-[#6e85a3]">
                  Investimento não atrelado a nenhum objetivo
                </p>
              </div>
              {selectedGoalId === null && (
                <Check className="ml-auto w-5 h-5 text-[#135bec]" />
              )}
            </div>
          </button>

          {/* Goals */}
          {goalSummaries.map(summary => {
            const goal = goals.find(g => g.id === summary.goal_id)!;
            const isSelected = selectedGoalId === summary.goal_id;
            const wouldBeProgress = summary.target_value > 0
              ? Math.min(100, ((summary.invested_amount + (isSelected ? 0 : investmentValue)) / summary.target_value) * 100)
              : 0;

            return (
              <button
                key={summary.goal_id}
                onClick={() => setSelectedGoalId(summary.goal_id)}
                className={`
                  w-full p-4 rounded-xl border text-left transition-all
                  ${isSelected
                    ? 'bg-[#135bec]/10 border-[#135bec]/50'
                    : 'bg-[#101622]/50 border-[#2e374a] hover:border-[#135bec]/30'}
                `}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${goal.color}30, ${goal.color}10)`,
                    }}
                  >
                    <Target className="w-5 h-5" style={{ color: goal.color }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className={`font-medium truncate ${isSelected ? 'text-white' : 'text-[#92a4c9]'}`}>
                        {goal.name}
                      </p>
                      {summary.investments.length > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-[#2e374a] text-[10px] text-[#92a4c9]">
                          {summary.investments.length} investimentos
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm mb-2">
                      <span className="text-[#92a4c9]">
                        Meta: {formatCurrency(summary.target_value)}
                      </span>
                      <span className="text-emerald-400">
                        Investido: {formatCurrency(summary.invested_amount)}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="relative">
                      <div className="h-2 bg-[#2e374a] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${summary.progress_percentage}%`,
                            backgroundColor: goal.color,
                          }}
                        />
                        {/* Preview of added investment */}
                        {!isSelected && selectedGoalId !== summary.goal_id && (
                          <div
                            className="absolute top-0 h-full rounded-full opacity-50"
                            style={{
                              left: `${summary.progress_percentage}%`,
                              width: `${Math.min(100 - summary.progress_percentage, (investmentValue / summary.target_value) * 100)}%`,
                              backgroundColor: '#135bec',
                            }}
                          />
                        )}
                      </div>
                      <div className="flex justify-between mt-1 text-xs">
                        <span className="text-[#6e85a3]">{summary.progress_percentage.toFixed(0)}%</span>
                        {!isSelected && (
                          <span className="text-[#135bec] flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            +{((investmentValue / summary.target_value) * 100).toFixed(0)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <Check className="shrink-0 w-5 h-5 text-[#135bec]" />
                  )}
                </div>
              </button>
            );
          })}

          {goals.length === 0 && (
            <div className="text-center py-8 text-[#92a4c9]">
              <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum objetivo cadastrado</p>
              <p className="text-sm text-[#6e85a3]">Crie objetivos para vincular investimentos</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#2e374a] flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl border border-[#2e374a] text-[#92a4c9] hover:text-white hover:border-[#135bec] transition-colors font-medium"
          >
            Cancelar
          </button>
          <ActionButton
            label="Salvar Vínculo"
            icon={<Link2 className="w-4 h-4" />}
            onClick={handleSave}
            className="flex-1"
          />
        </div>
      </div>
    </div>
  );
};

export default GoalLinkingModal;
