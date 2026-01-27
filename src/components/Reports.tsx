import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useMonthNavigation } from '../hooks';
import { formatCurrency, getMonthName } from '../utils';
import {
    TrendingUp, TrendingDown, DollarSign, LineChart as LineChartIcon,
    ChevronLeft, ChevronRight, Download, Target, PieChart as PieChartIcon,
    ShoppingBag, ArrowRight, Wallet
} from 'lucide-react';
import {
    LineChart, Line, XAxis, Tooltip, ResponsiveContainer, CartesianGrid,
    AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { CategoryIcon } from './CategoryIcon';
import { generatePDFReport } from '../services/pdfService';

/**
 * Reports component.
 * Generates financial reports with charts (flux trends, distributions) and progress for goals and budgets.
 * Supports PDF generation.
 */
export const Reports: React.FC = () => {
    const { transactions, categories, totalBalance, categoryBudgets, goals } = useFinance();

    // Month Navigation
    const { selectedMonth, selectedYear, changeMonth } = useMonthNavigation();
    const [isExporting, setIsExporting] = useState(false);

    // Filter data for the SELECTED month
    const currentMonthTx = transactions.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });

    const totalIncome = Number(currentMonthTx
        .filter(t => t.type === 'INCOME')
        .reduce((acc, t) => acc + Number(t.value), 0));

    const totalExpense = Number(currentMonthTx
        .filter(t => t.type === 'EXPENSE')
        .reduce((acc, t) => acc + Number(t.value), 0));

    const balance = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

    // Annual Evolution Logic
    const getAnnualHistory = () => {
        const data = [];
        for (let m = 0; m <= 11; m++) {
            const monthTx = transactions.filter(t => {
                const tDate = new Date(t.date);
                return tDate.getMonth() === m && tDate.getFullYear() === selectedYear;
            });
            const income = monthTx.filter(t => t.type === 'INCOME').reduce((a, b) => a + b.value, 0);
            const expense = monthTx.filter(t => t.type === 'EXPENSE').reduce((a, b) => a + b.value, 0);
            data.push({
                name: getMonthName(m).substring(0, 3),
                income,
                expense,
                balance: income - expense
            });
        }
        return data;
    };

    const historyData = getAnnualHistory();

    const expensesByCategory = currentMonthTx
        .filter(t => t.type === 'EXPENSE')
        .reduce((acc, t) => {
            const val = Number(t.value) || 0;
            acc[t.categoryId] = (Number(acc[t.categoryId]) || 0) + val;
            return acc;
        }, {} as Record<string, number>);

    const categoryData = Object.entries(expensesByCategory).map(([id, value]) => {
        const cat = categories.find(c => c.id === id);
        return {
            name: cat?.name || 'Outros',
            value,
            color: cat?.color || '#3b82f6'
        };
    }).sort((a, b) => Number(b.value) - Number(a.value));

    // Goal and Budget progress
    const activeGoals = goals.filter(g => g.status !== 'COMPLETED').slice(0, 2);
    const monthBudgets = (categoryBudgets || []).slice(0, 4);

    const handleExportPDF = async () => {
        setIsExporting(true);
        try {
            const period = `${getMonthName(selectedMonth)} ${selectedYear}`;
            await generatePDFReport(currentMonthTx, categories, period, {
                totalIncome: Number(totalIncome),
                totalExpense: Number(totalExpense),
                balance: Number(balance),
                savingsRate: Number(savingsRate),
                categoryData,
                goals: activeGoals.map(g => ({
                    name: g.name,
                    currentValue: g.currentAmount,
                    targetValue: g.targetAmount
                })),
                budgets: monthBudgets
            });
        } catch (error) {
            console.error("Erro ao exportar PDF:", error);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="p-4 md:p-8 animate-fade-in pb-32 space-y-8 bg-black/50 min-h-screen">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-white mb-2">Painel de Relatórios</h1>
                    <p className="text-gray-300 font-light">Análise executiva completa do seu patrimônio</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl p-1 backdrop-blur-md">
                        <button onClick={() => changeMonth(-1)} className="p-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                            <ChevronLeft size={20} />
                        </button>
                        <span className="px-6 font-bold text-white text-sm tracking-widest uppercase w-48 text-center border-x border-white/5">
                            {getMonthName(selectedMonth)} {selectedYear}
                        </span>
                        <button onClick={() => changeMonth(1)} className="p-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    <button
                        onClick={handleExportPDF}
                        disabled={isExporting}
                        className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20"
                    >
                        <Download size={18} />
                        {isExporting ? 'Exportando...' : 'Exportar PDF'}
                    </button>
                </div>
            </div>

            {/* Top Summaries Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <SummaryCard
                    label="Receitas"
                    value={totalIncome}
                    icon={<TrendingUp size={24} />}
                    color="bg-emerald-500/10 text-emerald-400"
                    trend={`${currentMonthTx.filter(t => t.type === 'INCOME').length} lançamentos`}
                />
                <SummaryCard
                    label="Despesas"
                    value={totalExpense}
                    icon={<TrendingDown size={24} />}
                    color="bg-rose-500/10 text-rose-400"
                    trend={`${currentMonthTx.filter(t => t.type === 'EXPENSE').length} lançamentos`}
                />
                <SummaryCard
                    label="Balanço Mensal"
                    value={balance}
                    icon={<DollarSign size={24} />}
                    color="bg-blue-500/10 text-blue-400"
                    trend={balance >= 0 ? 'Superávit' : 'Déficit'}
                />
                <SummaryCard
                    label="Savings Rate"
                    value={savingsRate}
                    isPercentage={true}
                    icon={<PieChartIcon size={24} />}
                    color="bg-indigo-500/10 text-indigo-400"
                    trend="Meta ideal: 20%+"
                />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Evolution Chart */}
                <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 backdrop-blur-md">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-serif font-bold text-white flex items-center gap-3">
                            <LineChartIcon size={24} className="text-blue-400" />
                            Fluxo de Caixa Anual
                        </h3>
                        <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest">
                            <span className="flex items-center gap-2 text-emerald-400">
                                <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Receitas
                            </span>
                            <span className="flex items-center gap-2 text-rose-400">
                                <span className="w-2 h-2 rounded-full bg-rose-400"></span> Despesas
                            </span>
                        </div>
                    </div>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={historyData}>
                                <defs>
                                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} dy={10} />
                                <Tooltip
                                    contentStyle={{ background: '#111', border: '1px solid #ffffff10', borderRadius: '16px' }}
                                    formatter={(v: number) => formatCurrency(v)}
                                />
                                <Area type="monotone" dataKey="income" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={2} />
                                <Area type="monotone" dataKey="expense" stroke="#f43f5e" fillOpacity={1} fill="url(#colorExpense)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Categories Distribution */}
                <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 backdrop-blur-md">
                    <h3 className="text-xl font-serif font-bold text-white flex items-center gap-3 mb-8">
                        <ShoppingBag size={24} className="text-indigo-400" />
                        Distribuição por Categoria
                    </h3>
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="h-[250px] w-full md:w-1/2">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ background: '#111', border: '1px solid #ffffff10', borderRadius: '16px' }}
                                        formatter={(v: number) => formatCurrency(v)}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="w-full md:w-1/2 space-y-4">
                            {categoryData.slice(0, 5).map((cat, i) => (
                                <div key={i} className="flex flex-col gap-1">
                                    <div className="flex justify-between text-xs font-medium">
                                        <span className="text-gray-300">{cat.name}</span>
                                        <span className="text-white">{formatCurrency(cat.value)}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${(Number(cat.value) / (Number(totalExpense) || 1)) * 100}%`, backgroundColor: cat.color }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Grid: Goals and Budgets */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Goals Progress */}
                <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 backdrop-blur-md overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Target size={120} />
                    </div>
                    <h3 className="text-xl font-serif font-bold text-white flex items-center gap-3 mb-8">
                        <Target size={24} className="text-emerald-400" />
                        Objetivos Patrimoniais
                    </h3>
                    <div className="space-y-8 relative z-10">
                        {activeGoals.length > 0 ? activeGoals.map(goal => (
                            <div key={goal.id} className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-white font-bold">{goal.name}</p>
                                        <p className="text-xs text-gray-400 font-light">Meta: {formatCurrency(goal.targetAmount)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-emerald-400 font-bold">{Math.round((goal.currentAmount / goal.targetAmount) * 100)}%</p>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-widest">{formatCurrency(goal.currentAmount)} realizados</p>
                                    </div>
                                </div>
                                <div className="h-3 w-full bg-white/5 rounded-full p-0.5">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 relative shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all duration-1000"
                                        style={{ width: `${Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)}%` }}
                                    >
                                        <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full"></div>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="py-12 text-center">
                                <p className="text-gray-400 font-light italic">Nenhum objetivo ativo definido.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Budget Analysis */}
                <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 backdrop-blur-md">
                    <h3 className="text-xl font-serif font-bold text-white flex items-center gap-3 mb-8">
                        <Wallet size={24} className="text-orange-400" />
                        Metas de Gastos
                    </h3>
                    <div className="space-y-6">
                        {monthBudgets.length > 0 ? monthBudgets.slice(0, 4).map(budget => {
                            const cat = categories.find(c => c.id === budget.categoryId);
                            const spent = currentMonthTx
                                .filter(t => t.type === 'EXPENSE' && t.categoryId === budget.categoryId)
                                .reduce((acc, t) => acc + t.value, 0);
                            const percent = (spent / budget.limit) * 100;
                            const isOver = percent > 100;

                            return (
                                <div key={budget.id} className="flex items-center gap-4 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                                        <CategoryIcon iconName={cat?.icon || 'HelpCircle'} size={24} color={cat?.color || '#9ca3af'} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center mb-1">
                                            <p className="text-sm font-bold text-white truncate">{cat?.name || 'Categoria'}</p>
                                            <p className={`text-xs font-bold ${isOver ? 'text-rose-400' : 'text-gray-300'}`}>
                                                {Math.round(percent)}%
                                            </p>
                                        </div>
                                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-1000 ${isOver ? 'bg-rose-500' : 'bg-blue-500'}`}
                                                style={{ width: `${Math.min(percent, 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0 pl-4 border-l border-white/5">
                                        <p className="text-xs text-gray-300">Restante</p>
                                        <p className={`font-bold ${isOver ? 'text-rose-400' : 'text-white'}`}>
                                            {formatCurrency(Math.max(budget.limit - spent, 0))}
                                        </p>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="py-12 text-center border-2 border-dashed border-white/5 rounded-3xl">
                                <p className="text-gray-400 text-sm mb-4">Metas de gastos não configuradas para este período.</p>
                                <button className="text-xs font-bold text-blue-400 uppercase tracking-widest flex items-center justify-center gap-2 mx-auto hover:text-blue-300 transition-colors">
                                    Configurar Metas <ArrowRight size={14} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

interface SummaryCardProps {
    label: string;
    value: number;
    icon: React.ReactNode;
    color: string;
    trend: string;
    isPercentage?: boolean;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ label, value, icon, color, trend, isPercentage = false }) => (
    <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] backdrop-blur-md relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
            {icon}
        </div>
        <div className="flex flex-col h-full justify-between gap-4">
            <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center shrink-0`}>
                {icon}
            </div>
            <div>
                <p className="text-xs text-gray-400 font-light mb-1">{label}</p>
                <p className="text-2xl font-bold text-white tracking-tight">
                    {isPercentage ? `${value.toFixed(1)}%` : formatCurrency(value)}
                </p>
                <div className="mt-2 text-[10px] font-bold text-gray-300 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500/40"></span>
                    {trend}
                </div>
            </div>
        </div>
    </div>
);

