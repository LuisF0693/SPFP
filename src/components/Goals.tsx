import React, { useState } from 'react';
import { useSafeFinance } from '../hooks/useSafeFinance';
import { Target, Trophy, TrendingUp, Calendar, Plus, Edit2, Trash2 } from 'lucide-react';
import { formatCurrency } from '../utils';
import { GoalForm } from './GoalForm';
import { Goal, CategoryIconName } from '../types';
import { CategoryIcon } from './CategoryIcon';
import { Modal } from './ui/Modal';
import { Skeleton } from './ui/Skeleton';

/**
 * Goals component.
 * Manages financial goals, tracking progress and allowing the creation of new objectives.
 */
export const Goals: React.FC = () => {
    const { goals, addGoal, updateGoal, deleteGoal, transactions, userProfile, updateUserProfile, isSyncing, isInitialLoadComplete } = useSafeFinance();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
    const [filter, setFilter] = useState<'ALL' | 'SHORT' | 'MEDIUM' | 'LONG'>('ALL');
    const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
    const [newSavingsTarget, setNewSavingsTarget] = useState(userProfile.monthlySavingsTarget || 0);
    const isLoading = !isInitialLoadComplete || isSyncing;

    // Safety check in case goals isn't loaded yet or is undefined
    const safeGoals = Array.isArray(goals) ? goals : [];

    // Calculations
    const totalAccumulated = safeGoals.reduce((acc, g) => acc + g.currentAmount, 0);
    const totalTarget = safeGoals.reduce((acc, g) => acc + g.targetAmount, 0);
    const totalProgress = totalTarget > 0 ? (totalAccumulated / totalTarget) * 100 : 0;
    const completedGoals = safeGoals.filter(g => g.status === 'COMPLETED' || g.currentAmount >= g.targetAmount).length;

    // Monthly Savings Logic
    const calculateAverageSavings = () => {
        const now = new Date();
        const currentMonthKey = `${now.getFullYear()}-${now.getMonth()}`; // format YYYY-MM based on JS month index

        // Group by month
        const monthlyStats: Record<string, number> = {};

        const safeTx = Array.isArray(transactions) ? transactions : [];
        safeTx.forEach(tx => {
            const date = new Date(tx.date);
            const key = `${date.getFullYear()}-${date.getMonth()}`;

            // Skip current incomplete month for average
            if (key === currentMonthKey) return;

            if (!monthlyStats[key]) monthlyStats[key] = 0;

            if (tx.type === 'INCOME') monthlyStats[key] += tx.value;
            else if (tx.type === 'EXPENSE') monthlyStats[key] -= tx.value;
        });

        // Get last 3 months with data
        const sortedMonths = Object.keys(monthlyStats).sort().reverse().slice(0, 3);
        if (sortedMonths.length === 0) return 0;

        const sum = sortedMonths.reduce((acc, key) => acc + monthlyStats[key], 0);
        return sum / sortedMonths.length;
    };

    const averageSavings = calculateAverageSavings();

    const handleSaveTarget = () => {
        updateUserProfile({ ...userProfile, monthlySavingsTarget: newSavingsTarget });
        setIsTargetModalOpen(false);
    };

    // Sort by closest deadline
    const sortedGoals = [...safeGoals].sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
    const nextGoal = sortedGoals.find(g => g.currentAmount < g.targetAmount);

    const filteredGoals = safeGoals.filter(g => {
        if (filter === 'ALL') return true;
        const now = new Date();
        const deadline = new Date(g.deadline);
        const diffYears = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 365);

        if (filter === 'SHORT') return diffYears <= 1;
        if (filter === 'MEDIUM') return diffYears > 1 && diffYears <= 5;
        if (filter === 'LONG') return diffYears > 5;
        return true;
    });

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Tem certeza que deseja excluir este objetivo?')) {
            deleteGoal(id);
        }
    }

    return (
        <div className="p-6 space-y-8 pb-24 animate-fade-in min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Meus Objetivos</h2>
                    <p className="text-gray-400 text-sm">Acompanhe o progresso dos seus sonhos e objetivos.</p>
                </div>
                <button
                    onClick={() => {
                        setEditingGoal(null);
                        setIsFormOpen(true);
                    }}
                    aria-label="Criar novo objetivo"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all flex items-center"
                >
                    <Plus size={18} className="mr-2" aria-hidden="true" />
                    Novo Objetivo
                </button>
            </div>

            {/* Summary Cards */}
            <section aria-label="Goals Summary" className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {isLoading ? (
                    <Skeleton variant="card" count={4} />
                ) : (
                    <>
                        {/* Total Acumulado - Premium Card */}
                        <div className="relative overflow-hidden bg-slate-900/60 p-6 rounded-2xl border border-white/10 backdrop-blur-sm group hover:border-blue-500/30 transition-all">
                            {/* Glow effect */}
                            <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="flex justify-between items-start mb-3 relative z-10">
                                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Acumulado</span>
                                <div className="p-2.5 bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-xl text-blue-400 shadow-lg shadow-blue-500/10">
                                    <Target size={18} />
                                </div>
                            </div>
                            <h3 className="text-3xl font-bold text-white mb-2 relative z-10">{formatCurrency(totalAccumulated)}</h3>
                            <div className="flex items-center gap-2 relative z-10">
                                <div className="h-1.5 flex-1 bg-slate-700/50 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-1000"
                                        style={{ width: `${Math.min(100, totalProgress)}%` }}
                                    />
                                </div>
                                <span className="text-emerald-400 text-xs font-bold">{totalProgress.toFixed(1)}%</span>
                            </div>
                        </div>

                        {/* Metas Concluídas - Premium Card */}
                        <div className="relative overflow-hidden bg-slate-900/60 p-6 rounded-2xl border border-white/10 backdrop-blur-sm group hover:border-amber-500/30 transition-all">
                            {/* Glow effect */}
                            <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="flex justify-between items-start mb-3 relative z-10">
                                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Objetivos Concluídos</span>
                                <div className="p-2.5 bg-gradient-to-br from-amber-500/20 to-amber-600/10 rounded-xl text-amber-400 shadow-lg shadow-amber-500/10">
                                    <Trophy size={18} />
                                </div>
                            </div>
                            <div className="flex items-baseline gap-2 relative z-10">
                                <h3 className="text-4xl font-bold text-white">{completedGoals}</h3>
                                <span className="text-slate-500 text-sm font-medium">/ {safeGoals.length}</span>
                            </div>
                            {completedGoals > 0 && (
                                <p className="text-amber-400 text-xs font-bold mt-2 relative z-10 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                                    Parabéns!
                                </p>
                            )}
                        </div>

                        {/* Economia Mensal / Meta de Economia - Premium Card */}
                        <div
                            onClick={() => {
                                setNewSavingsTarget(userProfile.monthlySavingsTarget || 0);
                                setIsTargetModalOpen(true);
                            }}
                            className="relative overflow-hidden bg-slate-900/60 p-6 rounded-2xl border border-white/10 backdrop-blur-sm group cursor-pointer hover:border-emerald-500/30 transition-all"
                        >
                            {/* Glow effect */}
                            <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="flex justify-between items-start mb-3 relative z-10">
                                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Economia Ideal/Mês</span>
                                <div className="p-2.5 bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 rounded-xl text-emerald-400 shadow-lg shadow-emerald-500/10">
                                    <TrendingUp size={18} />
                                </div>
                            </div>
                            <h3 className="text-3xl font-bold text-white mb-2 relative z-10">
                                {userProfile.monthlySavingsTarget ? formatCurrency(userProfile.monthlySavingsTarget) : 'Definir'}
                            </h3>
                            <div className="flex items-center gap-2 relative z-10">
                                <span className="text-slate-400 text-xs">Média real:</span>
                                <span className={`text-sm font-bold ${averageSavings >= (userProfile.monthlySavingsTarget || 0) ? "text-emerald-400" : "text-amber-400"}`}>
                                    {formatCurrency(averageSavings)}
                                </span>
                            </div>
                            <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-white/10 text-[10px] text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                                Editar
                            </div>
                        </div>

                        {/* Próxima Conclusão - Premium Card */}
                        <div className="relative overflow-hidden bg-slate-900/60 p-6 rounded-2xl border border-white/10 backdrop-blur-sm group hover:border-indigo-500/30 transition-all">
                            {/* Glow effect */}
                            <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="flex justify-between items-start mb-3 relative z-10">
                                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Próxima Conclusão</span>
                                <div className="p-2.5 bg-gradient-to-br from-indigo-500/20 to-indigo-600/10 rounded-xl text-indigo-400 shadow-lg shadow-indigo-500/10">
                                    <Calendar size={18} />
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-1 truncate relative z-10">{nextGoal ? nextGoal.name : 'Nenhuma'}</h3>
                            {nextGoal && (
                                <div className="flex items-center gap-2 relative z-10 mt-2">
                                    <div className="px-2 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 text-xs font-medium">
                                        {new Date(nextGoal.deadline).toLocaleDateString()}
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </section>

            {/* Filters */}
            <div className="flex gap-8 border-b border-gray-800 pb-1">
                {(['ALL', 'SHORT', 'MEDIUM', 'LONG'] as const).map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        aria-label={`Filtrar objetivos ${f === 'ALL' ? 'por todas as durações' : f === 'SHORT' ? 'de curto prazo' : f === 'MEDIUM' ? 'de médio prazo' : 'de longo prazo'}`}
                        aria-pressed={filter === f}
                        className={`pb-3 text-sm font-bold transition-all relative ${filter === f ? 'text-white' : 'text-gray-400 hover:text-gray-300'}`}
                    >
                        {f === 'ALL' && 'Todas'}
                        {f === 'SHORT' && 'Curto Prazo'}
                        {f === 'MEDIUM' && 'Médio Prazo'}
                        {f === 'LONG' && 'Longo Prazo'}
                        {filter === f && (
                            <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-t-full" />
                        )}
                    </button>
                ))}
            </div>

            {/* Goals Grid */}
            <section aria-label="Active Goals" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    <Skeleton variant="card" count={3} />
                ) : (
                    <>
                        {filteredGoals.map(goal => {
                    const percent = Math.min(100, Math.max(0, (goal.currentAmount / goal.targetAmount) * 100));
                    const isCompleted = percent >= 100;

                    return (
                        <div
                            key={goal.id}
                            onClick={() => { setEditingGoal(goal); setIsFormOpen(true); }}
                            className="relative overflow-hidden bg-slate-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-sm hover:border-white/20 transition-all cursor-pointer group"
                        >
                            {/* Dynamic glow based on goal color */}
                            <div
                                className="absolute -top-16 -right-16 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-40 transition-opacity duration-500"
                                style={{ backgroundColor: goal.color }}
                            />

                            {/* Completion badge */}
                            {isCompleted && (
                                <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    Concluído
                                </div>
                            )}

                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                    <div
                                        className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
                                        style={{
                                            background: `linear-gradient(135deg, ${goal.color}30, ${goal.color}10)`,
                                            color: goal.color,
                                            boxShadow: `0 8px 32px ${goal.color}20`
                                        }}
                                    >
                                        <CategoryIcon iconName={(goal.icon as CategoryIconName) || 'cart'} size={26} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-lg">{goal.name}</h3>
                                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
                                            {filter === 'LONG' ? 'Longo Prazo' : filter === 'SHORT' ? 'Curto Prazo' : filter === 'MEDIUM' ? 'Médio Prazo' : 'Objetivo'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setEditingGoal(goal); setIsFormOpen(true); }}
                                        aria-label={`Editar objetivo: ${goal.name}`}
                                        className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors backdrop-blur-sm"
                                    >
                                        <Edit2 size={16} aria-hidden="true" />
                                    </button>
                                    <button
                                        onClick={(e) => handleDelete(goal.id, e)}
                                        aria-label={`Excluir objetivo: ${goal.name}`}
                                        className="text-slate-400 hover:text-rose-400 p-2 rounded-xl hover:bg-rose-500/10 transition-colors"
                                    >
                                        <Trash2 size={16} aria-hidden="true" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-end gap-2 mb-3">
                                <span className="text-2xl font-bold text-white">{formatCurrency(goal.currentAmount)}</span>
                                <span className="text-sm text-gray-400 mb-1 font-medium">de {formatCurrency(goal.targetAmount)}</span>
                            </div>

                            {/* Enhanced Progress Bar with Glow Effect */}
                            <div className="relative mb-4">
                                {/* Background track */}
                                <div className="h-3 bg-gray-800/80 rounded-full overflow-hidden backdrop-blur-sm border border-white/5">
                                    {/* Animated gradient fill with glow */}
                                    <div
                                        className="h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                                        style={{
                                            width: `${percent}%`,
                                            background: `linear-gradient(90deg, ${goal.color}CC, ${goal.color})`,
                                            boxShadow: `0 0 20px ${goal.color}60, inset 0 1px 0 rgba(255,255,255,0.2)`
                                        }}
                                    >
                                        {/* Shimmer effect */}
                                        <div
                                            className="absolute inset-0 opacity-30"
                                            style={{
                                                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                                                animation: 'shimmer 2s infinite'
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Progress indicator dot */}
                                {percent > 5 && percent < 100 && (
                                    <div
                                        className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-lg transition-all duration-1000"
                                        style={{
                                            left: `calc(${percent}% - 4px)`,
                                            boxShadow: `0 0 10px ${goal.color}, 0 0 20px ${goal.color}80`
                                        }}
                                    />
                                )}

                                {/* Completion burst effect */}
                                {percent >= 100 && (
                                    <div
                                        className="absolute -right-1 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center"
                                        style={{
                                            background: `radial-gradient(circle, ${goal.color}, transparent)`,
                                            boxShadow: `0 0 15px ${goal.color}`
                                        }}
                                    >
                                        <span className="text-[10px]">✓</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between items-center text-xs font-bold">
                                <span className={`flex items-center gap-1.5 ${percent >= 100 ? 'text-emerald-400' : 'text-gray-400'}`}>
                                    {percent >= 100 && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                                    {percent.toFixed(0)}% concluído
                                </span>
                                <span className="text-gray-500">{new Date(goal.deadline).toLocaleDateString()}</span>
                            </div>
                        </div>
                    );
                        })}

                        {/* Card "Criar Nova Meta" - Premium Placeholder */}
                        <button
                            onClick={() => { setEditingGoal(null); setIsFormOpen(true); }}
                            aria-label="Criar novo objetivo"
                            className="relative overflow-hidden bg-slate-900/30 border-2 border-dashed border-slate-700/50 rounded-2xl p-6 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all flex flex-col items-center justify-center gap-4 min-h-[280px] group backdrop-blur-sm"
                        >
                            {/* Glow effect on hover */}
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-indigo-500/0 group-hover:from-blue-500/10 group-hover:to-indigo-500/5 transition-all duration-500" />

                            <div className="relative z-10 w-20 h-20 rounded-2xl bg-slate-800/80 flex items-center justify-center text-slate-400 group-hover:bg-gradient-to-br group-hover:from-blue-500 group-hover:to-indigo-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-blue-500/30 transition-all duration-300" aria-hidden="true">
                                <Plus size={36} />
                            </div>
                            <div className="relative z-10 text-center">
                                <span className="font-bold text-slate-400 group-hover:text-white block transition-colors">Criar Novo Objetivo</span>
                                <span className="text-xs text-slate-600 group-hover:text-slate-400 transition-colors">Defina suas metas financeiras</span>
                            </div>
                        </button>
                    </>
                )}
            </section>

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

            <Modal
                isOpen={isTargetModalOpen}
                onClose={() => setIsTargetModalOpen(false)}
                title="Definir Economia Mensal Ideal"
                size="md"
                variant="dark"
            >
                <p className="text-sm text-gray-300 mb-4">Quanto você deseja economizar por mês?</p>
                <div className="relative mb-6">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">R$</span>
                    <input
                        type="number"
                        value={newSavingsTarget}
                        onChange={(e) => setNewSavingsTarget(Number(e.target.value))}
                        className="w-full bg-[#1e293b] border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white outline-none focus:border-blue-500"
                        placeholder="0.00"
                        autoFocus
                    />
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsTargetModalOpen(false)}
                        className="flex-1 px-4 py-2 rounded-xl font-bold text-gray-300 hover:bg-gray-800 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSaveTarget}
                        className="flex-1 px-4 py-2 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all"
                    >
                        Salvar
                    </button>
                </div>
            </Modal>
        </div>
    );
};

