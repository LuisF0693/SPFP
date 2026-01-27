import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Target, Trophy, TrendingUp, Calendar, Plus, MoreVertical, CreditCard, Edit2, Trash2 } from 'lucide-react';
import { formatCurrency } from '../utils';
import { GoalForm } from './GoalForm';
import { Goal, CategoryIconName } from '../types';
import { CategoryIcon } from './CategoryIcon';

/**
 * Goals component.
 * Manages financial goals, tracking progress and allowing the creation of new objectives.
 */
export const Goals: React.FC = () => {
    const { goals, addGoal, updateGoal, deleteGoal, transactions, userProfile, updateUserProfile } = useFinance();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
    const [filter, setFilter] = useState<'ALL' | 'SHORT' | 'MEDIUM' | 'LONG'>('ALL');
    const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
    const [newSavingsTarget, setNewSavingsTarget] = useState(userProfile.monthlySavingsTarget || 0);

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

        transactions.forEach(tx => {
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
                {/* Total Acumulado */}
                <div className="bg-[#0f172a] p-6 rounded-2xl border border-gray-800 relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-2 relative z-10">
                        <span className="text-gray-300 text-sm font-medium">Total Acumulado</span>
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><Target size={20} /></div>
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-1 relative z-10">{formatCurrency(totalAccumulated)}</h3>
                    <p className="text-emerald-500 text-xs font-bold relative z-10">
                        {totalProgress.toFixed(1)}% do total
                    </p>
                </div>

                {/* Metas Concluídas */}
                <div className="bg-[#0f172a] p-6 rounded-2xl border border-gray-800 relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-2 relative z-10">
                        <span className="text-gray-300 text-sm font-medium">Objetivos Concluídos</span>
                        <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500"><Trophy size={20} /></div>
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-1 relative z-10">{completedGoals}</h3>
                    <p className="text-gray-400 text-xs font-bold relative z-10">
                        Parabéns!
                    </p>
                </div>

                {/* Economia Mensal / Meta de Economia */}
                <div
                    onClick={() => {
                        setNewSavingsTarget(userProfile.monthlySavingsTarget || 0);
                        setIsTargetModalOpen(true);
                    }}
                    className="bg-[#0f172a] p-6 rounded-2xl border border-gray-800 relative overflow-hidden group cursor-pointer hover:border-emerald-500/50 transition-all"
                >
                    <div className="flex justify-between items-start mb-2 relative z-10">
                        <span className="text-gray-300 text-sm font-medium">Economia Ideal/Mês</span>
                        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500"><TrendingUp size={20} /></div>
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-1 relative z-10">
                        {userProfile.monthlySavingsTarget ? formatCurrency(userProfile.monthlySavingsTarget) : 'Definir'}
                    </h3>
                    <p className="text-gray-300 text-xs font-bold relative z-10">
                        Média real: <span className={averageSavings >= (userProfile.monthlySavingsTarget || 0) ? "text-emerald-500" : "text-yellow-500"}>{formatCurrency(averageSavings)}</span>
                    </p>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-gray-700 p-1 rounded-full text-xs text-white">Editar</div>
                    </div>
                </div>

                {/* Próxima Conclusão */}
                <div className="bg-[#0f172a] p-6 rounded-2xl border border-gray-800 relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-2 relative z-10">
                        <span className="text-gray-300 text-sm font-medium">Próxima Conclusão</span>
                        <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500"><Calendar size={20} /></div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1 truncate relative z-10">{nextGoal ? nextGoal.name : 'Nenhuma'}</h3>
                    <p className="text-gray-300 text-xs font-bold relative z-10">
                        {nextGoal ? new Date(nextGoal.deadline).toLocaleDateString() : '-'}
                    </p>
                </div>
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
                {filteredGoals.map(goal => {
                    const percent = Math.min(100, Math.max(0, (goal.currentAmount / goal.targetAmount) * 100));

                    return (
                        <div
                            key={goal.id}
                            onClick={() => { setEditingGoal(goal); setIsFormOpen(true); }}
                            className="bg-[#0f172a] border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-all cursor-pointer group relative"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300" style={{ backgroundColor: `${goal.color}20`, color: goal.color }}>
                                        <CategoryIcon iconName={(goal.icon as CategoryIconName) || 'cart'} size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-lg">{goal.name}</h3>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{filter === 'LONG' ? 'Longo Prazo' : filter === 'SHORT' ? 'Curto Prazo' : 'Objetivo'}</p>
                                    </div>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setEditingGoal(goal); setIsFormOpen(true); }}
                                        aria-label={`Editar objetivo: ${goal.name}`}
                                        className="text-gray-300 hover:text-white p-1.5 rounded-lg hover:bg-gray-800 transition-colors"
                                    >
                                        <Edit2 size={18} aria-hidden="true" />
                                    </button>
                                    <button
                                        onClick={(e) => handleDelete(goal.id, e)}
                                        aria-label={`Excluir objetivo: ${goal.name}`}
                                        className="text-gray-300 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
                                    >
                                        <Trash2 size={18} aria-hidden="true" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-end gap-2 mb-2">
                                <span className="text-2xl font-bold text-white">{formatCurrency(goal.currentAmount)}</span>
                                <span className="text-sm text-gray-400 mb-1 font-medium">de {formatCurrency(goal.targetAmount)}</span>
                            </div>

                            <div className="h-2 bg-gray-800 rounded-full overflow-hidden mb-4">
                                <div
                                    className="h-full rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: `${percent}%`, backgroundColor: goal.color }}
                                />
                            </div>

                            <div className="flex justify-between items-center text-xs font-bold text-gray-400">
                                <span className={percent >= 100 ? 'text-emerald-500' : ''}>{percent.toFixed(0)}% concluído</span>
                                <span>{new Date(goal.deadline).toLocaleDateString()}</span>
                            </div>
                        </div>
                    );
                })}

                {/* Card "Criar Nova Meta" Placeholder style */}
                <button
                    onClick={() => { setEditingGoal(null); setIsFormOpen(true); }}
                    aria-label="Criar novo objetivo"
                    className="bg-[#0f172a]/50 border-2 border-dashed border-gray-800 rounded-2xl p-6 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all flex flex-col items-center justify-center gap-4 min-h-[200px] group"
                >
                    <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center text-gray-300 group-hover:bg-blue-500 group-hover:text-white transition-all" aria-hidden="true">
                        <Plus size={32} />
                    </div>
                    <span className="font-bold text-gray-400 group-hover:text-white">Criar Novo Objetivo</span>
                </button>
            </section>

            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <GoalForm
                        onClose={() => setIsFormOpen(false)}
                        onSubmit={addGoal}
                        onUpdate={updateGoal}
                        initialData={editingGoal}
                    />
                </div>
            )}

            {/* Modal para editar meta de economia mensal */}
            {isTargetModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-[#0f172a] w-full max-w-sm rounded-2xl p-6 border border-gray-800 text-white relative">
                        <h3 className="text-lg font-bold mb-4">Definir Economia Mensal Ideal</h3>
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
                    </div>
                </div>
            )}
        </div>
    );
};

