import React, { useState, useMemo } from 'react';
import { Plus, Target, Sparkles, LayoutGrid, List } from 'lucide-react';
import { useSafeFinance } from '../../hooks/useSafeFinance';
import { GoalSuggestion, SuggestedGoal } from './GoalSuggestion';
import { GoalCarousel } from './GoalCarousel';
import { StatCard } from '../ui/StatCard';
import { ActionButton } from '../ui/ActionButton';
import { Modal } from '../ui/Modal';
import { GoalForm } from '../GoalForm';
import { Goal } from '../../types';
import { formatCurrency } from '../../utils';

type ViewMode = 'carousel' | 'grid';

export const GoalsAdvanced: React.FC = () => {
  const {
    goals,
    transactions,
    addGoal,
    updateGoal,
    deleteGoal,
    isSyncing,
    isInitialLoadComplete,
  } = useSafeFinance();

  const [viewMode, setViewMode] = useState<ViewMode>('carousel');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);

  const isLoading = !isInitialLoadComplete || isSyncing;
  const safeGoals = Array.isArray(goals) ? goals : [];
  const safeTransactions = Array.isArray(transactions) ? transactions : [];

  // Calculate stats
  const stats = useMemo(() => {
    const totalAccumulated = safeGoals.reduce((acc, g) => acc + g.currentAmount, 0);
    const totalTarget = safeGoals.reduce((acc, g) => acc + g.targetAmount, 0);
    const totalProgress = totalTarget > 0 ? (totalAccumulated / totalTarget) * 100 : 0;
    const completedGoals = safeGoals.filter(
      g => g.status === 'COMPLETED' || g.currentAmount >= g.targetAmount
    ).length;

    // Monthly contribution needed
    const now = new Date();
    const goalsWithDeadline = safeGoals.filter(g => {
      const deadline = new Date(g.deadline);
      return deadline > now && g.currentAmount < g.targetAmount;
    });

    const monthlyNeeded = goalsWithDeadline.reduce((acc, g) => {
      const deadline = new Date(g.deadline);
      const monthsLeft = Math.max(1, Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30)));
      const remaining = g.targetAmount - g.currentAmount;
      return acc + (remaining / monthsLeft);
    }, 0);

    return {
      totalAccumulated,
      totalTarget,
      totalProgress,
      completedGoals,
      activeGoals: safeGoals.length - completedGoals,
      monthlyNeeded,
    };
  }, [safeGoals]);

  // Handle accepting a suggestion
  const handleAcceptSuggestion = (suggestion: SuggestedGoal) => {
    const newGoal = {
      name: suggestion.name,
      targetAmount: suggestion.targetAmount,
      currentAmount: 0,
      deadline: suggestion.deadline,
      color: suggestion.color,
      icon: suggestion.icon,
      status: 'ACTIVE' as const,
    };
    addGoal(newGoal);
    setShowSuggestions(false);
  };

  // Handle goal update from carousel
  const handleUpdateGoal = (id: string, updates: Partial<Goal>) => {
    updateGoal(id, updates);
  };

  return (
    <div className="min-h-screen bg-[#f6f6f8] dark:bg-[#101622]">
      <div className="max-w-[1400px] mx-auto p-4 md:p-8 flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h2 className="text-[#111418] dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-tight">
              Metas Financeiras
            </h2>
            <p className="text-[#637588] dark:text-[#92a4c9] text-base font-normal">
              {stats.activeGoals > 0
                ? `${stats.activeGoals} metas ativas, ${stats.completedGoals} concluídas`
                : 'Comece definindo suas metas financeiras'}
            </p>
          </div>
          <div className="flex gap-3">
            {/* View Toggle */}
            <div className="flex rounded-xl border border-[#2e374a] overflow-hidden">
              <button
                onClick={() => setViewMode('carousel')}
                className={`p-2.5 transition-colors ${
                  viewMode === 'carousel'
                    ? 'bg-[#135bec] text-white'
                    : 'bg-transparent text-[#92a4c9] hover:text-white'
                }`}
                aria-label="Visualizar em carrossel"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2.5 transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-[#135bec] text-white'
                    : 'bg-transparent text-[#92a4c9] hover:text-white'
                }`}
                aria-label="Visualizar em grid"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
            <ActionButton
              label="Nova Meta"
              icon={<Plus className="w-5 h-5" />}
              onClick={() => {
                setEditingGoal(null);
                setIsFormOpen(true);
              }}
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Acumulado"
            value={formatCurrency(stats.totalAccumulated)}
            icon={<Target className="w-5 h-5" />}
            trend={{
              value: `${stats.totalProgress.toFixed(1)}% do total`,
              direction: stats.totalProgress >= 50 ? 'up' : 'neutral',
            }}
            loading={isLoading}
          />
          <StatCard
            title="Meta Total"
            value={formatCurrency(stats.totalTarget)}
            subtitle={`${safeGoals.length} metas`}
            loading={isLoading}
          />
          <StatCard
            title="Metas Concluídas"
            value={`${stats.completedGoals}/${safeGoals.length}`}
            trend={stats.completedGoals > 0 ? {
              value: 'Parabéns!',
              direction: 'up',
            } : undefined}
            loading={isLoading}
          />
          <StatCard
            title="Aporte Mensal Ideal"
            value={formatCurrency(stats.monthlyNeeded)}
            subtitle="Para atingir todas as metas"
            loading={isLoading}
          />
        </div>

        {/* Smart Suggestions */}
        {showSuggestions && safeGoals.length < 3 && (
          <GoalSuggestion
            transactions={safeTransactions}
            existingGoalsCount={safeGoals.length}
            onAcceptSuggestion={handleAcceptSuggestion}
            onDismiss={() => setShowSuggestions(false)}
          />
        )}

        {/* Goals Display */}
        <div className="rounded-2xl bg-white dark:bg-[#1A2233] border border-[#e6e8eb] dark:border-[#2e374a] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#135bec]/20 to-[#135bec]/10">
                <Target className="w-5 h-5 text-[#135bec]" />
              </div>
              <div>
                <h3 className="text-[#111418] dark:text-white text-lg font-bold">
                  Suas Metas
                </h3>
                <p className="text-sm text-[#92a4c9]">
                  Clique nos valores para editar diretamente
                </p>
              </div>
            </div>
            {!showSuggestions && safeGoals.length < 5 && (
              <button
                onClick={() => setShowSuggestions(true)}
                className="flex items-center gap-2 text-sm text-[#135bec] hover:text-[#1048c7] transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                Ver sugestões
              </button>
            )}
          </div>

          {viewMode === 'carousel' ? (
            <GoalCarousel
              goals={safeGoals}
              onUpdateGoal={handleUpdateGoal}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {safeGoals.map(goal => {
                const progress = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
                return (
                  <div
                    key={goal.id}
                    onClick={() => {
                      setEditingGoal(goal);
                      setIsFormOpen(true);
                    }}
                    className="
                      p-4 rounded-xl border border-[#2e374a] bg-[#101622]/50
                      hover:border-[#135bec]/50 cursor-pointer transition-all
                    "
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{
                          background: `linear-gradient(135deg, ${goal.color}30, ${goal.color}10)`,
                          color: goal.color,
                        }}
                      >
                        <Target className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-white font-medium">{goal.name}</h4>
                        <p className="text-xs text-[#92a4c9]">
                          {new Date(goal.deadline).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-[#92a4c9]">{formatCurrency(goal.currentAmount)}</span>
                      <span className="text-white font-medium">{formatCurrency(goal.targetAmount)}</span>
                    </div>
                    <div className="h-2 bg-[#101622] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${progress}%`,
                          backgroundColor: goal.color,
                        }}
                      />
                    </div>
                    <p className="text-right text-xs text-[#92a4c9] mt-1">{progress.toFixed(0)}%</p>
                  </div>
                );
              })}

              {/* Add New Goal Card */}
              <button
                onClick={() => {
                  setEditingGoal(null);
                  setIsFormOpen(true);
                }}
                className="
                  p-4 rounded-xl border-2 border-dashed border-[#2e374a]
                  hover:border-[#135bec]/50 hover:bg-[#135bec]/5
                  flex flex-col items-center justify-center gap-2 min-h-[150px]
                  transition-all group
                "
              >
                <div className="w-12 h-12 rounded-xl bg-[#2e374a] group-hover:bg-[#135bec] flex items-center justify-center transition-colors">
                  <Plus className="w-6 h-6 text-[#92a4c9] group-hover:text-white transition-colors" />
                </div>
                <span className="text-sm text-[#92a4c9] group-hover:text-white transition-colors">
                  Nova Meta
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Goal Form Modal */}
        <Modal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          title={editingGoal ? 'Editar Meta' : 'Nova Meta'}
          size="lg"
          variant="dark"
        >
          <GoalForm
            onClose={() => setIsFormOpen(false)}
            onSubmit={addGoal}
            onUpdate={updateGoal}
            initialData={editingGoal}
          />
        </Modal>
      </div>
    </div>
  );
};

export default GoalsAdvanced;
