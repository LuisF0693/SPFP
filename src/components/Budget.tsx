import React, { useMemo, useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, getMonthName } from '../utils';
import { AlertTriangle, ChevronLeft, ChevronRight, Calendar, TrendingUp, Wallet, PiggyBank } from 'lucide-react';
import { CategoryIcon } from './CategoryIcon';
import { BudgetSlider } from './BudgetSlider';

type ViewMode = 'MONTHLY' | 'YEARLY';

const Budget: React.FC = () => {
    const {
        transactions,
        categories,
        categoryBudgets,
        updateCategoryBudget,
    } = useFinance();

    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<ViewMode>('MONTHLY');

    // Date Navigation Handlers
    const handlePrev = () => {
        const newDate = new Date(currentDate);
        if (viewMode === 'MONTHLY') newDate.setMonth(newDate.getMonth() - 1);
        else newDate.setFullYear(newDate.getFullYear() - 1);
        setCurrentDate(newDate);
    };

    const handleNext = () => {
        const newDate = new Date(currentDate);
        if (viewMode === 'MONTHLY') newDate.setMonth(newDate.getMonth() + 1);
        else newDate.setFullYear(newDate.getFullYear() + 1);
        setCurrentDate(newDate);
    };

    // Calculate Data based on View Mode
    const { income, expense, expensesByCategory } = useMemo(() => {
        const targetMonth = currentDate.getMonth();
        const targetYear = currentDate.getFullYear();
        const catMap = new Map<string, number>();
        let inc = 0;
        let exp = 0;

        transactions.forEach(tx => {
            const date = new Date(tx.date);
            const txYear = date.getFullYear();
            const txMonth = date.getMonth();

            const isMatch = viewMode === 'MONTHLY'
                ? txYear === targetYear && txMonth === targetMonth
                : txYear === targetYear;

            if (isMatch) {
                if (tx.type === 'INCOME') inc += tx.value;
                else if (tx.type === 'EXPENSE') {
                    exp += tx.value;
                    const cur = catMap.get(tx.categoryId) || 0;
                    catMap.set(tx.categoryId, cur + tx.value);
                }
            }
        });

        return { income: inc, expense: exp, expensesByCategory: catMap };
    }, [transactions, currentDate, viewMode]);

    // Merge Budgets
    const budgetData = useMemo(() => {
        return categories.map(cat => {
            const spent = expensesByCategory.get(cat.id) || 0;
            // For yearly view, the limit should probably be multiplied by 12?
            // Or we leave it as "Average Monthly Limit"?
            // The screenshot shows "Saldo do plano", suggesting a total calculation.
            // If the user sets a monthly limit of 1000, the yearly limit is 12000.
            const baseLimit = categoryBudgets.find(b => b.categoryId === cat.id)?.limit || 0;
            const limit = viewMode === 'YEARLY' ? baseLimit * 12 : baseLimit;

            const diff = limit - spent;
            const remaining = Math.max(0, diff);
            const overrun = diff < 0 ? Math.abs(diff) : 0;
            const percentage = limit > 0 ? (spent / limit) * 100 : (spent > 0 ? 100 : 0);

            return { ...cat, spent, limit, remaining, overrun, percentage };
        }).sort((a, b) => b.spent - a.spent);
    }, [categories, expensesByCategory, categoryBudgets, viewMode]);

    // Totals
    const totalBudgeted = budgetData.reduce((acc, curr) => acc + curr.limit, 0);
    const projectedBalance = income - totalBudgeted; // Income - Plans

    // Header Title
    const headerTitle = viewMode === 'MONTHLY'
        ? `${getMonthName(currentDate.getMonth())} de ${currentDate.getFullYear()}`
        : `${currentDate.getFullYear()}`;

    return (
        <div className="p-6 space-y-8 pb-24 animate-fade-in min-h-screen">
            {/* Header: Title & Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Metas Financeiras</h2>
                    <p className="text-gray-500 text-sm">Planeje e controle seu orçamento futuro.</p>
                </div>

                <div className="flex items-center gap-4 bg-gray-900/50 p-2 rounded-xl border border-gray-800">
                    <button onClick={handlePrev} className="p-2 hover:bg-gray-700/50 rounded-lg text-gray-400 hover:text-white transition-colors">
                        <ChevronLeft size={20} />
                    </button>

                    <div className="flex items-center gap-2 px-2 min-w-[180px] justify-center text-white font-bold">
                        <Calendar size={18} className="text-blue-400" />
                        <span>{headerTitle}</span>
                    </div>

                    <button onClick={handleNext} className="p-2 hover:bg-gray-700/50 rounded-lg text-gray-400 hover:text-white transition-colors">
                        <ChevronRight size={20} />
                    </button>

                    <div className="w-px h-6 bg-gray-700 mx-2"></div>

                    <select
                        value={viewMode}
                        onChange={(e) => setViewMode(e.target.value as ViewMode)}
                        className="bg-transparent text-sm font-medium text-gray-300 outline-none cursor-pointer hover:text-white"
                    >
                        <option value="MONTHLY" className="bg-gray-900">Mensal</option>
                        <option value="YEARLY" className="bg-gray-900">Anual</option>
                    </select>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Income */}
                <div className="bg-[#0f172a] p-6 rounded-2xl border border-gray-800 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <TrendingUp size={48} className="text-emerald-500" />
                    </div>
                    <p className="text-gray-400 text-sm font-medium mb-1">Renda {viewMode === 'MONTHLY' ? 'Mensal' : 'Anual'}</p>
                    <h3 className="text-2xl font-bold text-emerald-400">{formatCurrency(income)}</h3>
                </div>

                {/* Expenses */}
                <div className="bg-[#0f172a] p-6 rounded-2xl border border-gray-800 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Wallet size={48} className="text-red-500" />
                    </div>
                    <p className="text-gray-400 text-sm font-medium mb-1">Gastos {viewMode === 'MONTHLY' ? 'do Mês' : 'do Ano'}</p>
                    <h3 className="text-2xl font-bold text-red-400">{formatCurrency(expense)}</h3>
                </div>

                {/* Total Budgeted */}
                <div className="bg-[#0f172a] p-6 rounded-2xl border border-gray-800 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <PiggyBank size={48} className="text-blue-500" />
                    </div>
                    <p className="text-gray-400 text-sm font-medium mb-1">Total Planejado</p>
                    <h3 className="text-2xl font-bold text-blue-400">{formatCurrency(totalBudgeted)}</h3>
                </div>

                {/* Projected Balance */}
                <div className="bg-[#0f172a] p-6 rounded-2xl border border-gray-800 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <AlertTriangle size={48} className={projectedBalance >= 0 ? "text-emerald-500" : "text-amber-500"} />
                    </div>
                    <p className="text-gray-400 text-sm font-medium mb-1">Saldo do Plano</p>
                    <h3 className={`text-2xl font-bold ${projectedBalance >= 0 ? 'text-emerald-400' : 'text-red-500'}`}>{formatCurrency(projectedBalance)}</h3>
                    <p className="text-[10px] text-gray-500 mt-1">Renda - Metas</p>
                </div>
            </div>

            {/* List Header */}
            <div className="pt-4">
                <h3 className="text-xl font-bold text-white mb-6">Categorias & Metas</h3>

                <div className="space-y-6">
                    {budgetData.map(cat => (
                        <div key={cat.id} className="flex flex-col gap-2">
                            {/* Row Top: Info & Values */}
                            <div className="flex justify-between items-end mb-1">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${cat.color}20`, color: cat.color }}>
                                        <CategoryIcon iconName={cat.icon} size={16} />
                                    </div>
                                    <span className="text-gray-300 font-medium">{cat.name}</span>
                                </div>
                                <div className="text-right text-xs">
                                    <span className="text-gray-500">Gasto: </span>
                                    <span className="text-white font-bold mr-3">{formatCurrency(cat.spent)}</span>

                                    <span className="text-gray-500">Meta: </span>
                                    <div className="inline-flex items-center">
                                        <span className="text-blue-400 font-bold ml-1 text-xs">R$</span>
                                        <input
                                            type="number"
                                            className="bg-transparent text-blue-400 font-bold w-16 outline-none text-right text-xs p-0 m-0 border-b border-transparent focus:border-blue-400 transition-colors"
                                            value={cat.limit || ''}
                                            placeholder="0"
                                            onChange={(e) => {
                                                const val = parseFloat(e.target.value);
                                                if (!isNaN(val) && val >= 0) {
                                                    const monthlyLimit = viewMode === 'YEARLY' ? Math.round(val / 12) : val;
                                                    updateCategoryBudget(cat.id, monthlyLimit);
                                                } else if (e.target.value === '') {
                                                    updateCategoryBudget(cat.id, 0);
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Slider Component */}
                            <BudgetSlider
                                spent={cat.spent}
                                limit={cat.limit}
                                color={cat.color}
                                onChangeLimit={(val) => {
                                    // If Yearly, we need to convert back to monthly?
                                    // Or we only allow editing in Monthly view?
                                    // Let's assume editing in Yearly updates the monthly average (val / 12)
                                    const monthlyLimit = viewMode === 'YEARLY' ? Math.round(val / 12) : val;
                                    updateCategoryBudget(cat.id, monthlyLimit);
                                }}
                            />

                            {/* Row Bottom: Status Text */}
                            <div className="flex justify-between text-[11px] text-gray-500 px-1">
                                <span>{cat.limit > 0 ? `${cat.percentage.toFixed(0)}% da meta` : 'Sem meta definida'}</span>
                                <span className={cat.overrun > 0 ? "text-red-400" : "text-emerald-500/80"}>
                                    {cat.limit === 0 ? '' : cat.remaining > 0 ? `Resta ${formatCurrency(cat.remaining)}` : `Ultrapassou ${formatCurrency(cat.overrun)}`}
                                </span>
                            </div>

                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
};

export default Budget;
