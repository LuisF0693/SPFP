import React, { useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils';
import { Target, TrendingUp, AlertTriangle, CheckCircle, Calculator, ChevronRight } from 'lucide-react';
import { CategoryIcon } from './CategoryIcon';

const Budget: React.FC = () => {
    const {
        transactions,
        categories,
        categoryBudgets,
        updateCategoryBudget,
        userProfile,
        goals
    } = useFinance();

    // Calculate current month's income and expenses
    const { income, expense, savings } = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        return transactions.reduce((acc, tx) => {
            const date = new Date(tx.date);
            if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
                if (tx.type === 'INCOME') acc.income += tx.value;
                else if (tx.type === 'EXPENSE') acc.expense += tx.value;
            }
            return acc;
        }, { income: 0, expense: 0, savings: 0 });
    }, [transactions]);

    const balance = income - expense;

    // Group expenses by category for current month
    const expensesByCategory = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const map = new Map<string, number>();

        transactions.forEach(tx => {
            const date = new Date(tx.date);
            if (tx.type === 'EXPENSE' && date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
                const current = map.get(tx.categoryId) || 0;
                map.set(tx.categoryId, current + tx.value);
            }
        });
        return map;
    }, [transactions]);

    // Merge categories with budget data
    const budgetData = useMemo(() => {
        return categories.map(cat => {
            const spent = expensesByCategory.get(cat.id) || 0;
            const budgetItem = categoryBudgets.find(b => b.categoryId === cat.id);
            const limit = budgetItem ? budgetItem.limit : 0;
            const remaining = Math.max(0, limit - spent);
            const percentage = limit > 0 ? (spent / limit) * 100 : (spent > 0 ? 100 : 0);

            let status: 'ok' | 'warning' | 'danger' | 'critical' = 'ok';
            if (limit > 0) {
                if (percentage >= 100) status = 'critical';
                else if (percentage >= 90) status = 'danger';
                else if (percentage >= 75) status = 'warning';
            }

            return {
                ...cat,
                spent,
                limit,
                remaining,
                percentage,
                status
            };
        }).sort((a, b) => b.percentage - a.percentage); // Sort by highest % usage
    }, [categories, expensesByCategory, categoryBudgets]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/30';
            case 'danger': return 'text-orange-500 bg-orange-500/10 border-orange-500/30';
            case 'warning': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30';
            default: return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30';
        }
    };

    const getProgressBarColor = (status: string) => {
        switch (status) {
            case 'critical': return 'bg-red-500';
            case 'danger': return 'bg-orange-500';
            case 'warning': return 'bg-yellow-500';
            default: return 'bg-emerald-500';
        }
    };

    return (
        <div className="p-6 space-y-8 pb-24 animate-fade-in min-h-screen">
            <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Metas Financeiras</h2>
                <p className="text-gray-500 text-sm">Defina limites e acompanhe seus gastos mensais.</p>
            </div>

            {/* Income/Expense Summary Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#0f172a] p-6 rounded-2xl border border-gray-800">
                    <p className="text-gray-400 text-sm font-medium mb-1">Renda Mensal</p>
                    <h3 className="text-2xl font-bold text-white">{formatCurrency(income)}</h3>
                </div>
                <div className="bg-[#0f172a] p-6 rounded-2xl border border-gray-800">
                    <p className="text-gray-400 text-sm font-medium mb-1">Gastos Mensais</p>
                    <h3 className="text-2xl font-bold text-red-400">{formatCurrency(expense)}</h3>
                </div>
                <div className="bg-[#0f172a] p-6 rounded-2xl border border-gray-800">
                    <p className="text-gray-400 text-sm font-medium mb-1">Saldo do Mês</p>
                    <h3 className={`text-2xl font-bold ${balance >= 0 ? 'text-emerald-400' : 'text-red-500'}`}>{formatCurrency(balance)}</h3>
                </div>
            </div>

            {/* Advice/Alert Box */}
            {budgetData.some(b => b.status === 'critical' || b.status === 'danger') && (
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-start gap-4">
                    <div className="p-2 bg-red-500/20 rounded-full text-red-500 shrink-0">
                        <AlertTriangle size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-red-400 mb-1">Atenção aos Gastos!</h4>
                        <p className="text-sm text-gray-300">Você atingiu ou ultrapassou o limite de gastos em algumas categorias. Revise suas despesas para manter o orçamento em dia.</p>
                    </div>
                </div>
            )}


            {/* Budget List */}
            <div className="space-y-4">
                {budgetData.map(cat => (
                    <div key={cat.id} className="bg-[#0f172a] p-6 rounded-2xl border border-gray-800 hover:border-gray-700 transition-all group">
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-4 md:mb-0">
                            {/* Icon & Name */}
                            <div className="flex items-center gap-4 flex-1">
                                <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center text-gray-400" style={{ backgroundColor: `${cat.color}20`, color: cat.color }}>
                                    <CategoryIcon iconName={cat.icon} size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-lg">{cat.name}</h4>
                                    <p className="text-xs text-gray-500">
                                        Mês: <span className="text-white font-medium">{formatCurrency(cat.spent)}</span>
                                        {cat.limit > 0 && ` (Restam ${formatCurrency(cat.remaining)})`}
                                    </p>
                                </div>
                            </div>

                            {/* Alert Logic - Only show if limit set */}
                            {cat.limit > 0 && (
                                <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-2 ${getStatusColor(cat.status)}`}>
                                    {cat.status === 'ok' && 'Dentro da Meta'}
                                    {cat.status === 'warning' && 'Atenção (75%)'}
                                    {cat.status === 'danger' && 'Cuidado (90%)'}
                                    {cat.status === 'critical' && 'Limite Atingido'}
                                </div>
                            )}

                            {/* Edit Limit Input */}
                            <div className="flex items-center gap-2 bg-gray-900/50 p-2 rounded-lg border border-gray-800">
                                <span className="text-xs text-gray-500 font-bold px-2">Meta:</span>
                                <input
                                    type="number"
                                    className="bg-transparent text-white font-bold w-24 text-right outline-none text-sm placeholder-gray-600"
                                    placeholder="0.00"
                                    value={cat.limit || ''}
                                    onChange={(e) => updateCategoryBudget(cat.id, Number(e.target.value))}
                                />
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-4 relative pt-1">
                            <div className="flex mb-2 items-center justify-between">
                                <div>
                                    {/* Tooltip style info could go here */}
                                </div>
                                <div className="text-right">
                                    <span className={`text-xs font-semibold inline-block ${cat.percentage > 100 ? 'text-red-500' : 'text-gray-400'}`}>
                                        {cat.percentage.toFixed(0)}%
                                    </span>
                                </div>
                            </div>
                            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-800">
                                <div
                                    style={{ width: `${Math.min(cat.percentage, 100)}%` }}
                                    className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500 ${getProgressBarColor(cat.status)}`}
                                ></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Budget;
