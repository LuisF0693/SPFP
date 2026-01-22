import React, { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { InvestmentAsset, InvestmentType } from '../types';
import { Plus, Upload, Filter, Download, MoreVertical, TrendingUp, DollarSign, Wallet, PieChart as PieIcon, Trash2, Edit2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatCurrency } from '../utils';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import InvestmentForm from './InvestmentForm';
import InvestmentImportExport from './InvestmentImportExport';

import { MarketDataService } from '../services/MarketDataService';
import { RefreshCw } from 'lucide-react';

/**
 * Investments component.
 * Tracks investment portfolios, assets, and performance across different markets.
 */
export const Investments: React.FC = () => {
    const { investments, deleteInvestment, updateInvestment, userProfile } = useFinance();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isImportExportOpen, setIsImportExportOpen] = useState(false);
    const [editingAsset, setEditingAsset] = useState<InvestmentAsset | null>(null);
    const [filterType, setFilterType] = useState<string>('ALL');
    const [isUpdating, setIsUpdating] = useState(false);

    const handleUpdatePrices = async () => {
        if (investments.length === 0) return;
        setIsUpdating(true);
        try {
            const tickers = investments.map(i => i.ticker);
            const quotes = await MarketDataService.getQuotes(tickers);

            let updatedCount = 0;
            quotes.forEach(quote => {
                const assetsToUpdate = investments.filter(i => i.ticker === quote.symbol);
                assetsToUpdate.forEach(asset => {
                    updateInvestment({
                        ...asset,
                        currentPrice: quote.regularMarketPrice,
                        lastUpdate: new Date().toISOString()
                    });
                    updatedCount++;
                });
            });
            alert(`${updatedCount} ativos atualizados via Yahoo Finance!`);
        } catch (error) {
            alert('Erro ao atualizar cotações via Yahoo Finance. Tente novamente em instantes.');
            console.error(error);
        } finally {
            setIsUpdating(false);
        }
    };


    // Calculations
    const totalPatrimony = useMemo(() => investments.reduce((acc, i) => acc + (i.quantity * i.currentPrice), 0), [investments]);
    const totalInvested = useMemo(() => investments.reduce((acc, i) => acc + (i.quantity * i.averagePrice), 0), [investments]);
    const totalProfit = totalPatrimony - totalInvested;
    const totalReturnPercent = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

    // Chart Data - Allocation
    const allocationData = useMemo(() => {
        const grouped = investments.reduce((acc, curr) => {
            const val = curr.quantity * curr.currentPrice;
            const currentTotal = acc[curr.type] || 0;
            acc[curr.type] = currentTotal + val;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(grouped)
            .map(([name, value]) => ({ name, value: value as number }))
            .sort((a, b) => a.value - b.value);
    }, [investments]);

    const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];
    const TYPE_LABELS: Record<string, string> = {
        'STOCK': 'Ações',
        'FII': 'FIIs',
        'ETF': 'ETFs',
        'FIXED_INCOME': 'Renda Fixa',
        'CRYPTO': 'Cripto',
        'OTHER': 'Outros'
    };

    // Chart Data - Mock Evolution (Simulated for UI visual)
    const evolutionData = useMemo(() => {
        if (totalPatrimony === 0) return [];
        const data = [];
        const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul'];
        let current = totalPatrimony * 0.85; // Start lower
        for (let i = 0; i < months.length; i++) {
            // Random growth/drop
            const change = (Math.random() - 0.3) * (totalPatrimony * 0.1);
            current += change;
            // Force last point to be current patrimony for continuity visual
            if (i === months.length - 1) current = totalPatrimony;

            data.push({ name: months[i], value: Math.max(0, current) });
        }
        return data;
    }, [totalPatrimony]);


    const filteredInvestments = useMemo(() => {
        if (filterType === 'ALL') return investments;
        return investments.filter(i => i.type === filterType);
    }, [investments, filterType]);

    const handleEdit = (asset: InvestmentAsset) => {
        setEditingAsset(asset);
        setIsFormOpen(true);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Tem certeza que deseja remover este ativo?')) {
            deleteInvestment(id);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-serif text-gray-900 dark:text-white">Investimentos</h1>
                    <p className="text-gray-500 dark:text-gray-400">Gerencie sua carteira, acompanhe rentabilidade e evolução.</p>
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={handleUpdatePrices}
                        disabled={isUpdating}
                        className={`p-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-white/10 transition-colors ${isUpdating ? 'animate-spin text-blue-500' : ''}`}
                        title="Atualizar Cotações (Brapi)"
                    >
                        <RefreshCw size={20} />
                    </button>
                    <button
                        onClick={() => setIsImportExportOpen(true)}
                        className="p-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
                        title="Importar/Exportar"
                    >
                        <Upload size={20} />
                    </button>
                    <button
                        onClick={() => { setEditingAsset(null); setIsFormOpen(true); }}
                        className="flex items-center px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 active:scale-95"
                    >
                        <Plus size={20} className="mr-2" />
                        Novo Aporte
                    </button>
                </div>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Patrimonio Total */}
                <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 p-6 rounded-2xl shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Wallet size={80} />
                    </div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Patrimônio Total</h3>
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                            <DollarSign size={18} />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        {formatCurrency(totalPatrimony)}
                    </div>
                    <div className="flex items-center text-xs font-medium text-emerald-500">
                        <TrendingUp size={14} className="mr-1" />
                        <span>Carteira consolidada</span>
                    </div>
                </div>

                {/* Lucro Total */}
                <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 p-6 rounded-2xl shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <TrendingUp size={80} />
                    </div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Lucro / Prejuízo Total</h3>
                        <div className={`p-2 rounded-lg ${totalProfit >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                            {totalProfit >= 0 ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                        </div>
                    </div>
                    <div className={`text-3xl font-bold mb-2 ${totalProfit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {totalProfit >= 0 ? '+' : ''} {formatCurrency(totalProfit)}
                    </div>
                    <div className="flex items-center text-xs font-medium text-gray-400">
                        <span>Rentabilidade nominal</span>
                    </div>
                </div>

                {/* Retorno % */}
                <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 p-6 rounded-2xl shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <PieIcon size={80} />
                    </div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Retorno da Carteira</h3>
                        <div className="p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg">
                            <span className="font-bold text-lg">%</span>
                        </div>
                    </div>
                    <div className={`text-3xl font-bold mb-2 ${totalReturnPercent >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {totalReturnPercent >= 0 ? '+' : ''}{totalReturnPercent.toFixed(2)}%
                    </div>
                    <div className="flex items-center text-xs font-medium text-gray-400">
                        <span>Rentabilidade acumulada</span>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Evolution Chart */}
                <div className="lg:col-span-2 bg-[#0F172A] p-6 rounded-2xl shadow-lg border border-slate-800 text-white">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="font-bold text-lg">Evolução Patrimonial</h3>
                            <p className="text-xs text-slate-400">Histórico simulado de valorização</p>
                        </div>
                        <div className="flex space-x-1 bg-slate-800/50 p-1 rounded-lg">
                            {['1S', '1M', '6M', '1A', 'Todos'].map(p => (
                                <button key={p} className={`px-3 py-1 text-xs rounded-md transition-colors ${p === '6M' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={evolutionData}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                <YAxis hide domain={['dataMin', 'auto']} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                    formatter={(value: number) => formatCurrency(value)}
                                />
                                <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Allocation Chart */}
                <div className="bg-[#0F172A] p-6 rounded-2xl shadow-lg border border-slate-800 text-white">
                    <h3 className="font-bold text-lg mb-6">Alocação de Ativos</h3>
                    <div className="h-[220px] w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={allocationData}
                                    innerRadius={70}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {allocationData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ borderRadius: '8px', border: 'none' }} />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center Text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-gray-400 text-xs text-center">Total Investido</span>
                            <span className="text-xl font-bold text-white">{formatCurrency(totalPatrimony)}</span>
                        </div>
                    </div>
                    <div className="mt-6 space-y-3">
                        {allocationData.map((entry, index) => (
                            <div key={entry.name} className="flex items-center justify-between text-sm">
                                <div className="flex items-center">
                                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                    <span className="text-slate-300">{TYPE_LABELS[entry.name] || entry.name}</span>
                                </div>
                                <div className="font-bold text-slate-100">{Math.round((entry.value / totalPatrimony) * 100)}%</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Assets Table */}
            <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Meus Ativos</h2>
                    <div className="flex space-x-2">
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm px-3 py-2 outline-none"
                        >
                            <option value="ALL">Todos os Tipos</option>
                            {Object.entries(TYPE_LABELS).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                        <button className="flex items-center px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors">
                            <Download size={16} className="mr-2" />
                            Exportar Lista
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-white/5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 text-left">Ativo</th>
                                <th className="px-6 py-4 text-left">Tipo</th>
                                <th className="px-6 py-4 text-left">Quantidade</th>
                                <th className="px-6 py-4 text-left">Preço Médio</th>
                                <th className="px-6 py-4 text-left">Preço Atual</th>
                                <th className="px-6 py-4 text-left">Valor Total</th>
                                <th className="px-6 py-4 text-right">Rentabilidade</th>
                                <th className="px-6 py-4 text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-sm">
                            {filteredInvestments.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                                        Nenhum ativo encontrado. Comece adicionando um novo aporte!
                                    </td>
                                </tr>
                            ) : filteredInvestments.map((asset) => {
                                const total = asset.quantity * asset.currentPrice;
                                const cost = asset.quantity * asset.averagePrice;
                                const prof = total - cost;
                                const profPercent = (prof / cost) * 100;

                                return (
                                    <tr key={asset.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs mr-3">
                                                    {asset.ticker.substring(0, 2)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 dark:text-white">{asset.ticker}</p>
                                                    <p className="text-xs text-gray-500">{asset.name}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                            <span className="px-2 py-1 bg-gray-100 dark:bg-white/10 rounded-md text-xs font-medium">
                                                {TYPE_LABELS[asset.type] || asset.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-200">
                                            {asset.quantity}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                            {formatCurrency(asset.averagePrice)}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                                            {formatCurrency(asset.currentPrice)}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                                            {formatCurrency(total)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className={`inline-flex items-center font-bold ${prof >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                                {profPercent.toFixed(2)}%
                                            </div>
                                            <div className={`text-xs ${prof >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                {prof >= 0 ? '+' : ''} {formatCurrency(prof)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleEdit(asset)}
                                                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(asset.id)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Excluir"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modals */}
            {(isFormOpen) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="w-full max-w-2xl bg-transparent animate-slide-up">
                        <InvestmentForm onClose={() => setIsFormOpen(false)} initialData={editingAsset} />
                    </div>
                </div>
            )}
            {(isImportExportOpen) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="w-full max-w-lg bg-transparent animate-slide-up">
                        <InvestmentImportExport onClose={() => setIsImportExportOpen(false)} />
                    </div>
                </div>
            )}
        </div>
    );
};
