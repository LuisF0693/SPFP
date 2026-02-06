import React, { useState, useMemo } from 'react';
import { useSafeFinance } from '../hooks/useSafeFinance';
import { PatrimonyItem } from '../types';
import { Plus, Wallet, TrendingUp, TrendingDown, Edit2, Trash2, Building2, Car, Plane, DollarSign, PieChart as PieIcon, ArrowUpRight, ArrowDownRight, MoreHorizontal } from 'lucide-react';
import { formatCurrency } from '../utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import PatrimonyForm from './PatrimonyForm';
import { Link } from 'react-router-dom';
import { Modal } from './ui/Modal';

/**
 * Patrimony component.
 * Manages physical and financial assets (real estate, vehicles, debts) for a complete net worth view.
 */
export const Patrimony: React.FC = () => {
    const { patrimonyItems, deletePatrimonyItem, investments } = useSafeFinance();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<PatrimonyItem | null>(null);

    // --- Calculations ---

    // 1. Investments Total (from Investments Tab)
    const investmentsTotal = useMemo(() => {
        const safeInv = Array.isArray(investments) ? investments : [];
        return safeInv.reduce((acc, i) => acc + (i.quantity * i.currentPrice), 0);
    }, [investments]);

    // 2. Patrimony Items Split
    const assets = useMemo(() => {
        const safeItems = Array.isArray(patrimonyItems) ? patrimonyItems : [];
        return safeItems.filter(i => i.type !== 'DEBT');
    }, [patrimonyItems]);
    const liabilities = useMemo(() => {
        const safeItems = Array.isArray(patrimonyItems) ? patrimonyItems : [];
        return safeItems.filter(i => i.type === 'DEBT');
    }, [patrimonyItems]);

    const assetsTotal = useMemo(() => assets.reduce((acc, i) => acc + i.value, 0), [assets]);
    const liabilitiesTotal = useMemo(() => liabilities.reduce((acc, i) => acc + i.value, 0), [liabilities]);

    // 3. Grand Totals
    const totalAssets = assetsTotal + investmentsTotal;
    const totalLiabilities = liabilitiesTotal;
    const netWorth = totalAssets - totalLiabilities;

    // Distribution Data for Progress Bars
    const distribution = useMemo(() => {
        const types = [
            { id: 'REAL_ESTATE', label: 'Imóveis', color: 'bg-blue-600', value: 0 },
            { id: 'INVESTMENTS', label: 'Investimentos', color: 'bg-purple-600', value: investmentsTotal },
            { id: 'VEHICLE', label: 'Veículos', color: 'bg-emerald-500', value: 0 },
            { id: 'MILES', label: 'Milhas', color: 'bg-orange-500', value: 0 },
            { id: 'FINANCIAL', label: 'Financeiro', color: 'bg-yellow-500', value: 0 },
            { id: 'OTHER', label: 'Outros', color: 'bg-gray-400', value: 0 },
        ];

        const safeItems = Array.isArray(patrimonyItems) ? patrimonyItems : [];
        safeItems.forEach(item => {
            if (item.type === 'DEBT') return;
            const typeObj = types.find(t => t.id === item.type) || types.find(t => t.id === 'OTHER');
            if (typeObj) typeObj.value += item.value;
        });

        const total = totalAssets || 1; // avoid division by zero
        return types
            .filter(t => t.value > 0)
            .map(t => ({ ...t, percent: (t.value / total) * 100 }))
            .sort((a, b) => b.value - a.value);
    }, [patrimonyItems, investmentsTotal, totalAssets]);


    // Simulated Evolution Data
    const evolutionData = useMemo(() => {
        if (netWorth === 0) return [];
        const data = [];
        const months = ['Jan', 'Mar', 'Mai', 'Jul', 'Set', 'Nov'];
        let current = netWorth * 0.8;
        for (let i = 0; i < months.length; i++) {
            current += (Math.random() * (netWorth * 0.1));
            if (i === months.length - 1) current = netWorth;
            data.push({ name: months[i], value: current });
        }
        return data;
    }, [netWorth]);

    // Icon Helper
    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'REAL_ESTATE': return <Building2 className="text-blue-500" />;
            case 'VEHICLE': return <Car className="text-emerald-500" />;
            case 'MILES': return <Plane className="text-orange-500" />;
            case 'DEBT': return <TrendingDown className="text-red-500" />;
            case 'INVESTMENTS': return <TrendingUp className="text-purple-500" />;
            default: return <DollarSign className="text-gray-400" />;
        }
    };

    const handleEdit = (item: PatrimonyItem) => {
        setEditingItem(item);
        setIsFormOpen(true);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir este registro?')) {
            deletePatrimonyItem(id);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-serif text-gray-900 dark:text-white">Gestão de Patrimônio</h1>
                    <p className="text-gray-400 dark:text-gray-300">Acompanhe a evolução dos seus bens e dívidas.</p>
                </div>
                <button
                    onClick={() => { setEditingItem(null); setIsFormOpen(true); }}
                    aria-label="Criar novo registro de patrimônio"
                    className="flex items-center px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 active:scale-95"
                >
                    <Plus size={20} className="mr-2" aria-hidden="true" />
                    Novo Registro
                </button>
            </div>

            {/* KPI Cards */}
            <section aria-label="Patrimony Overview" className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Net Worth */}
                <div className="bg-[#0F172A] p-6 rounded-2xl shadow-lg border border-slate-800 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <Wallet size={80} />
                    </div>
                    <div className="mb-2 text-gray-300 text-xs font-bold uppercase tracking-wider">Patrimônio Líquido</div>
                    <div className="text-3xl font-bold mb-2">{formatCurrency(netWorth)}</div>
                    <div className="inline-flex items-center px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-md text-xs font-bold">
                        <TrendingUp size={12} className="mr-1" />
                        +2.5% vs mês anterior
                    </div>
                </div>

                {/* Total Assets */}
                <div className="bg-[#0F172A] p-6 rounded-2xl shadow-lg border border-slate-800 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <PieIcon size={80} />
                    </div>
                    <div className="mb-2 text-gray-300 text-xs font-bold uppercase tracking-wider">Total de Ativos</div>
                    <div className="text-3xl font-bold mb-2">{formatCurrency(totalAssets)}</div>
                    <div className="inline-flex items-center px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-md text-xs font-bold">
                        +3.1% em ativos consolidados
                    </div>
                </div>

                {/* Total Liabilities */}
                <div className="bg-[#0F172A] p-6 rounded-2xl shadow-lg border border-slate-800 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <TrendingDown size={80} />
                    </div>
                    <div className="mb-2 text-gray-300 text-xs font-bold uppercase tracking-wider">Total de Passivos</div>
                    <div className="text-3xl font-bold mb-2 text-red-400">{formatCurrency(totalLiabilities)}</div>
                    <div className="inline-flex items-center px-2 py-1 bg-orange-500/20 text-orange-400 rounded-md text-xs font-bold">
                        -0.5% redução da dívida
                    </div>
                </div>
            </section>

            {/* Charts Section */}
            <section aria-label="Patrimony Charts" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Evolution Chart */}
                <div className="bg-[#0F172A] p-6 rounded-2xl shadow-lg border border-slate-800 text-white">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg">Evolução Patrimonial</h3>
                        <span className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-xs font-bold">+15% este ano</span>
                    </div>
                    <div className="h-[180px] md:h-[200px] lg:h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={evolutionData}>
                                <defs>
                                    <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <YAxis hide domain={['dataMin', 'auto']} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                    formatter={(value: number) => formatCurrency(value)}
                                />
                                <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillUrl="#colorNetWorth" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Distribution Bars */}
                <div className="bg-[#0F172A] p-6 rounded-2xl shadow-lg border border-slate-800 text-white">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="font-bold text-lg">Distribuição de Ativos</h3>
                            <p className="text-xs text-gray-300">Composição da carteira</p>
                        </div>
                        <MoreHorizontal className="text-gray-300" size={20} />
                    </div>

                    <div className="space-y-5">
                        {distribution.map(item => (
                            <div key={item.id}>
                                <div className="flex justify-between text-sm mb-1">
                                    <div className="flex items-center">
                                        <div className={`w-2 h-2 rounded-full mr-2 ${item.color}`}></div>
                                        <span className="font-medium text-slate-200">{item.label}</span>
                                    </div>
                                    <span className="font-bold">{Math.round(item.percent)}%</span>
                                </div>
                                <div className="w-full bg-slate-700/50 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full ${item.color}`}
                                        style={{ width: `${item.percent}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                        {distribution.length === 0 && (
                            <p className="text-center text-slate-500 text-sm py-8">Nenhum ativo cadastrado.</p>
                        )}
                    </div>
                </div>
            </section>

            {/* Assets List */}
            <section aria-label="Assets">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold font-serif text-gray-900 dark:text-gray-100">Ativos (Bens e Direitos)</h2>
                    <button className="text-sm text-blue-600 font-bold hover:underline">Ver Todos</button>
                </div>
                <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl shadow-sm overflow-hidden">
                    <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                        <div className="col-span-6 md:col-span-5">Item</div>
                        <div className="col-span-4 md:col-span-5 text-right md:text-left">Valor Atual</div>
                        <div className="col-span-2 text-center md:text-right">Ação</div>
                    </div>

                    {/* Investments Row (Hardcoded/Dynamic) */}
                    {investmentsTotal > 0 && (
                        <div className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border-b border-gray-50 dark:border-white/5">
                            <div className="col-span-6 md:col-span-5 flex items-center">
                                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mr-3 text-purple-600 dark:text-purple-400">
                                    {getTypeIcon('INVESTMENTS')}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white">Carteira de Investimentos</h4>
                                    <p className="text-xs text-gray-400">Renda Variável & Fixa • B3</p>
                                </div>
                            </div>
                            <div className="col-span-4 md:col-span-5 text-right md:text-left font-bold text-gray-900 dark:text-white">
                                {formatCurrency(investmentsTotal)}
                            </div>
                            <div className="col-span-2 flex justify-end">
                                <Link to="/investments" className="p-2 text-gray-300 hover:text-blue-500 transition-colors">
                                    <ArrowUpRight size={18} />
                                </Link>
                            </div>
                        </div>
                    )}

                    {assets.map(item => (
                        <div key={item.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border-b border-gray-50 dark:border-white/5 last:border-0">
                            <div className="col-span-6 md:col-span-5 flex items-center">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${item.type === 'VEHICLE' ? 'bg-emerald-100 text-emerald-600' :
                                    item.type === 'MILES' ? 'bg-orange-100 text-orange-600' :
                                        'bg-blue-100 text-blue-600'
                                    }`}>
                                    {getTypeIcon(item.type)}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white">{item.name}</h4>
                                    <p className="text-xs text-gray-400">
                                        {item.quantity ? `${item.quantity.toLocaleString()} milhas` : item.description || (item.type === 'REAL_ESTATE' ? 'Imóvel' : 'Bem Durável')}
                                    </p>
                                </div>
                            </div>
                            <div className="col-span-4 md:col-span-5 text-right md:text-left font-bold text-gray-900 dark:text-white">
                                {formatCurrency(item.value)}
                            </div>
                            <div className="col-span-2 flex justify-end space-x-1">
                                <button
                                  onClick={() => handleEdit(item)}
                                  aria-label={`Editar ativo: ${item.name}`}
                                  className="p-2 text-gray-300 hover:text-blue-500 transition-colors"
                                >
                                    <Edit2 size={16} aria-hidden="true" />
                                </button>
                                <button
                                  onClick={() => handleDelete(item.id)}
                                  aria-label={`Excluir ativo: ${item.name}`}
                                  className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={16} aria-hidden="true" />
                                </button>
                            </div>
                        </div>
                    ))}

                    {assets.length === 0 && investmentsTotal === 0 && (
                        <div className="p-8 text-center text-gray-300 text-sm">Nenhum ativo cadastrado.</div>
                    )}
                </div>
            </section>

            {/* Liabilities List */}
            <section aria-label="Liabilities">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold font-serif text-gray-900 dark:text-gray-100">Passivos (Deveres e Obrigações)</h2>
                </div>
                <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-2xl shadow-sm overflow-hidden">
                    {liabilities.map(item => (
                        <div key={item.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border-b border-gray-50 dark:border-white/5 last:border-0 relative overflow-hidden">
                            {/* Red strip indicator */}
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>

                            <div className="col-span-6 md:col-span-5 flex items-center pl-3">
                                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center mr-3 text-red-600">
                                    {getTypeIcon(item.type)}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white">{item.name}</h4>
                                    <p className="text-xs text-gray-400">{item.description || 'Dívida de Longo Prazo'}</p>
                                </div>
                            </div>
                            <div className="col-span-4 md:col-span-5 text-right md:text-left font-bold text-red-500">
                                - {formatCurrency(item.value)}
                            </div>
                            <div className="col-span-2 flex justify-end space-x-1">
                                <button
                                  onClick={() => handleEdit(item)}
                                  aria-label={`Editar dívida: ${item.name}`}
                                  className="p-2 text-gray-300 hover:text-blue-500 transition-colors"
                                >
                                    <Edit2 size={16} aria-hidden="true" />
                                </button>
                                <button
                                  onClick={() => handleDelete(item.id)}
                                  aria-label={`Excluir dívida: ${item.name}`}
                                  className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={16} aria-hidden="true" />
                                </button>
                            </div>
                        </div>
                    ))}
                    {liabilities.length === 0 && (
                        <div className="p-8 text-center text-gray-300 text-sm">Nenhuma dívida cadastrada. Parabéns!</div>
                    )}
                </div>
            </section>

            <Modal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                title={editingItem ? 'Editar Patrimônio' : 'Novo Patrimônio'}
                size="lg"
                variant="dark"
            >
                <PatrimonyForm onClose={() => setIsFormOpen(false)} initialData={editingItem} />
            </Modal>

        </div>
    );
};

