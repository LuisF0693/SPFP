import React, { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useMonthNavigation } from '../hooks';
import { formatCurrency, formatDate, getMonthName } from '../utils';
import {
    Trash2, Edit2, Upload, Download, Search, Filter, ChevronLeft, ChevronRight,
    ArrowUpCircle, ArrowDownCircle, Wallet, Calendar, CheckCircle, Clock, X
} from 'lucide-react';
import { TransactionForm } from './TransactionForm';
import { Transaction, Category, CategoryGroup } from '../types';
import { CategoryIcon } from './CategoryIcon';
import { ImportExportModal } from './ImportExportModal';
import { EmojiPicker } from './EmojiPicker';
import { DeleteTransactionModal } from './DeleteTransactionModal';
import { Modal } from './ui/Modal';
import { Skeleton } from './ui/Skeleton';

interface TransactionListProps {
    onEdit: (transaction: Transaction) => void;
}

/**
 * Transaction List component.
 * Displays a list of transactions with filtering, search, and bulk action capabilities.
 * Includes monthly navigation and statistical summaries.
 */
export const TransactionList: React.FC<TransactionListProps> = ({ onEdit }) => {
    const {
        transactions, categories, deleteTransaction, deleteTransactions, updateTransactions,
        addCategory, updateCategory, deleteCategory, accounts, userProfile,
        getTransactionsByGroupId, deleteTransactionGroup, deleteTransactionGroupFromIndex,
        isSyncing, isInitialLoadComplete
    } = useFinance();

    const isLoading = !isInitialLoadComplete || isSyncing;

    // Month Navigation
    const { selectedMonth, selectedYear, changeMonth } = useMonthNavigation();

    // Delete Modal State
    const [deleteModalTransaction, setDeleteModalTransaction] = useState<Transaction | null>(null);

    // Filter State
    const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE' | 'PAID' | 'SCHEDULED' | 'LATE'>('ALL');
    const [searchTerm, setSearchTerm] = useState('');

    // Modal States
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [showCategoryManager, setShowCategoryManager] = useState(false);
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [activeTabModal, setActiveTabModal] = useState<'import' | 'export'>('import');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isBulkCategoryModalOpen, setIsBulkCategoryModalOpen] = useState(false);

    // Filter Logic
    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            const d = new Date(t.date);
            const matchesDate = d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
            const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase());

            let matchesType = true;
            const today = new Date(); // Current date for comparison with time
            today.setHours(0, 0, 0, 0);
            const txDate = new Date(t.date);

            if (filterType === 'INCOME') matchesType = t.type === 'INCOME';
            if (filterType === 'EXPENSE') matchesType = t.type === 'EXPENSE';
            if (filterType === 'PAID') matchesType = t.paid;
            if (filterType === 'SCHEDULED') matchesType = !t.paid && txDate >= today;
            if (filterType === 'LATE') matchesType = !t.paid && txDate < today;

            return matchesDate && matchesSearch && matchesType;
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [transactions, selectedMonth, selectedYear, searchTerm, filterType]);

    // Stats Calculations
    const stats = useMemo(() => {
        const income = filteredTransactions.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.value, 0);
        const expense = filteredTransactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.value, 0);
        const balance = income - expense;
        return { income, expense, balance };
    }, [filteredTransactions]);

    const getStatus = React.useCallback((date: string, paid: boolean) => {
        const d = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (paid) return { label: 'Pago', color: 'text-emerald-500', icon: CheckCircle };
        // Se a data for menor que hoje e não foi pago
        if (d < today) return { label: 'Atrasado', color: 'text-red-500', icon: Clock };

        return { label: 'Agendado', color: 'text-yellow-500', icon: Clock };
    }, []);

    // Handle delete - show modal if grouped, otherwise delete directly
    const handleDeleteClick = (tx: Transaction) => {
        if (tx.groupId) {
            // Has group - show modal
            setDeleteModalTransaction(tx);
        } else {
            // No group - delete directly with confirm
            if (confirm('Tem certeza que deseja excluir esta transação?')) {
                deleteTransaction(tx.id);
            }
        }
    };

    const getSpenderInfo = (spenderId?: string) => {
        if (!spenderId || spenderId === 'ME') {
            return {
                name: userProfile.name || 'Eu',
                avatar: userProfile.avatar,
                initial: (userProfile.name || 'E')[0],
                color: 'bg-indigo-500'
            };
        }
        if (spenderId === 'SPOUSE') {
            return {
                name: userProfile.spouseName || 'Cônjuge',
                avatar: userProfile.spouseAvatar,
                initial: (userProfile.spouseName || 'C')[0],
                color: 'bg-pink-500'
            };
        }

        // Find in children
        const child = (userProfile.children || []).find(c => c.id === spenderId);
        if (child) {
            return {
                name: child.name,
                avatar: child.avatar,
                initial: child.name[0] || 'F',
                color: 'bg-blue-500'
            };
        }

        // Fallback
        return {
            name: 'Desconhecido',
            avatar: null,
            initial: '?',
            color: 'bg-gray-500'
        };
    };

    return (
        <div className="p-6 space-y-8 pb-24 animate-fade-in relative min-h-screen">

            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Lançamentos</h2>
                    <p className="text-gray-300 text-sm">Gerencie suas receitas e despesas detalhadas.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            setActiveTabModal('import');
                            setIsImportModalOpen(true);
                        }}
                        className="p-2.5 bg-[#0f172a] hover:bg-gray-800 text-gray-300 hover:text-white rounded-xl border border-gray-800 transition-all flex items-center gap-2"
                        title="Importar CSV/PDF"
                    >
                        <Upload size={20} />
                        <span className="hidden sm:inline">Importar</span>
                    </button>
                    <button
                        onClick={() => {
                            setActiveTabModal('export');
                            setIsImportModalOpen(true);
                        }}
                        className="p-2.5 bg-[#0f172a] hover:bg-gray-800 text-gray-300 hover:text-white rounded-xl border border-gray-800 transition-all flex items-center gap-2"
                        title="Exportar CSV/PDF"
                    >
                        <Download size={20} />
                        <span className="hidden sm:inline">Exportar</span>
                    </button>
                    <button
                        onClick={() => {
                            setEditingTransaction(null);
                            setIsTransactionModalOpen(true);
                        }}
                        className="bg-accent hover:bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center"
                    >
                        + Novo Lançamento
                    </button>
                </div>
            </header>

            {/* Stats Cards */}
            <section aria-label="Financial Summary" className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {isLoading ? (
                    <Skeleton variant="card" count={3} />
                ) : (
                    <>
                        <div className="bg-[#0f172a] p-6 rounded-2xl border border-gray-800 relative group overflow-hidden">
                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <span className="text-gray-300 text-sm font-medium">Total Receitas</span>
                                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500"><ArrowUpCircle size={20} /></div>
                            </div>
                            <h3 className="text-3xl font-bold text-white mb-1 relative z-10">{formatCurrency(stats.income)}</h3>
                            <p className="text-emerald-500 text-xs font-bold relative z-10">+12% vs mês anterior</p>
                            <div className="absolute top-0 right-0 p-8 opacity-5"><ArrowUpCircle size={100} /></div>
                        </div>

                        <div className="bg-[#0f172a] p-6 rounded-2xl border border-gray-800 relative group overflow-hidden">
                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <span className="text-gray-300 text-sm font-medium">Total Despesas</span>
                                <div className="p-2 bg-rose-500/10 rounded-lg text-rose-500"><ArrowDownCircle size={20} /></div>
                            </div>
                            <h3 className="text-3xl font-bold text-white mb-1 relative z-10">{formatCurrency(stats.expense)}</h3>
                            <p className="text-rose-500 text-xs font-bold relative z-10">+5% vs mês anterior</p>
                            <div className="absolute top-0 right-0 p-8 opacity-5"><ArrowDownCircle size={100} /></div>
                        </div>

                        <div className="bg-[#0f172a] p-6 rounded-2xl border border-gray-800 relative group overflow-hidden">
                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <span className="text-gray-300 text-sm font-medium">Saldo Atual</span>
                                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><Wallet size={20} /></div>
                            </div>
                            <h3 className="text-3xl font-bold text-white mb-1 relative z-10">{formatCurrency(stats.balance)}</h3>
                            <p className="text-blue-500 text-xs font-bold relative z-10">{stats.balance >= 0 ? 'Saldo positivo' : 'Saldo negativo'}</p>
                            <div className="absolute top-0 right-0 p-8 opacity-5"><Wallet size={100} /></div>
                        </div>
                    </>
                )}
            </section>

            {/* Filters & Search - Dark/Light Compatible but styling towards Dark Ref */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por nome, categoria ou valor..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#0f172a] border border-gray-800 text-white pl-10 pr-4 py-3 rounded-xl outline-none focus:border-accent text-sm placeholder-gray-500"
                    />
                </div>

                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                    {(['ALL', 'INCOME', 'EXPENSE', 'PENDING'] as const).map(type => (
                        <button
                            key={type}
                            onClick={() => setFilterType(type)}
                            aria-label={`Filtrar por ${type === 'ALL' ? 'todos os tipos' : type === 'INCOME' ? 'receitas' : type === 'EXPENSE' ? 'despesas' : 'pendentes'}`}
                            aria-pressed={filterType === type}
                            className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${filterType === type
                                ? 'bg-accent text-white'
                                : 'bg-[#1e293b] text-gray-300 hover:bg-gray-800'
                                }`}
                        >
                            {type === 'ALL' && 'Todos'}
                            {type === 'INCOME' && 'Receitas'}
                            {type === 'EXPENSE' && 'Despesas'}
                            {type === 'PENDING' && 'Pendentes'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Transactions Table */}
            <section aria-label="Transactions Table" className="bg-[#0f172a] border border-gray-800 rounded-2xl overflow-hidden shadow-xl">

                {/* Month Navigation within Table Header? Or keep separate? Keeping separate for now or inside header */}
                {!isLoading && (
                    <div className="flex items-center justify-between p-4 border-b border-gray-800">
                        <button
                          onClick={() => changeMonth(-1)}
                          aria-label="Mês anterior"
                          className="p-1 hover:bg-gray-800 rounded text-gray-300"
                        >
                          <ChevronLeft size={20} aria-hidden="true" />
                        </button>
                        <span className="font-bold text-white uppercase tracking-wider text-sm">{getMonthName(selectedMonth)} {selectedYear}</span>
                        <button
                          onClick={() => changeMonth(1)}
                          aria-label="Próximo mês"
                          className="p-1 hover:bg-gray-800 rounded text-gray-300"
                        >
                          <ChevronRight size={20} aria-hidden="true" />
                        </button>
                    </div>
                )}

                {/* Desktop: Table View */}
                <div className="hidden md:overflow-x-auto md:block">
                    {isLoading ? (
                        <div className="p-4">
                            <Skeleton variant="table-row" count={8} />
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-800 text-xs uppercase tracking-wider text-gray-400">
                                    <th className="p-4 font-medium w-10">
                                        <input
                                            type="checkbox"
                                            aria-label="Selecionar todas as transações"
                                            className="w-4 h-4 rounded border-gray-600 bg-[#0f172a] text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-900"
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    const ids = filteredTransactions.map(t => t.id);
                                                    setSelectedIds(new Set(ids));
                                                } else {
                                                    setSelectedIds(new Set());
                                                }
                                            }}
                                            checked={filteredTransactions.length > 0 && selectedIds.size === filteredTransactions.length}
                                        />
                                    </th>
                                    <th className="p-4 font-medium">Data</th>
                                    <th className="p-4 font-medium">Resp.</th>
                                    <th className="p-4 font-medium">Descrição</th>
                                    <th className="p-4 font-medium">Categoria</th>
                                    <th className="p-4 font-medium">Conta</th>
                                    <th className="p-4 font-medium">Status</th>
                                    <th className="p-4 font-medium text-right">Valor</th>
                                    <th className="p-4 font-medium text-center">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {filteredTransactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="p-8 text-center text-gray-400 font-medium">
                                            Nenhuma transação encontrada.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredTransactions.map(tx => {
                                    const cat = categories.find(c => c.id === tx.categoryId);
                                    const acc = accounts.find(a => a.id === tx.accountId);
                                    const status = getStatus(tx.date, tx.paid);
                                    const StatusIcon = status.icon;
                                    const spender = getSpenderInfo(tx.spender);

                                    return (
                                        <tr key={tx.id} className={`group hover:bg-[#1e293b]/50 transition-colors ${selectedIds.has(tx.id) ? 'bg-blue-900/10' : ''}`}>
                                            <td className="p-4">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 rounded border-gray-600 bg-[#0f172a] text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-900"
                                                    checked={selectedIds.has(tx.id)}
                                                    onChange={(e) => {
                                                        const newSet = new Set(selectedIds);
                                                        if (e.target.checked) newSet.add(tx.id);
                                                        else newSet.delete(tx.id);
                                                        setSelectedIds(newSet);
                                                    }}
                                                />
                                            </td>
                                            <td className="p-4 text-gray-300 text-sm font-mono whitespace-nowrap">
                                                {formatDate(tx.date)}
                                            </td>
                                            <td className="p-4">
                                                <div className="relative group/tooltip">
                                                    <div className={`w-8 h-8 rounded-full ${spender.color} flex items-center justify-center text-xs font-bold text-white overflow-hidden border-2 border-[#0f172a]`}>
                                                        {spender.avatar ? <img src={spender.avatar} alt={spender.name} className="w-full h-full object-cover" /> : spender.initial}
                                                    </div>
                                                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-[10px] font-bold text-white bg-black rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap z-20">
                                                        {spender.name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="p-2 bg-[#1e293b] rounded-lg text-white">
                                                        <CategoryIcon iconName={cat?.icon} size={18} />
                                                    </div>
                                                    <span className="text-gray-200 font-bold text-sm truncate max-w-[150px]">{tx.description}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium" style={{ backgroundColor: `${cat?.color}15`, color: cat?.color }}>
                                                    {cat?.name}
                                                </div>
                                            </td>
                                            <td className="p-4 text-gray-300 text-sm">
                                                {acc?.name}
                                            </td>
                                            <td className="p-4">
                                                <div className={`flex items-center space-x-1.5 text-xs font-bold ${status.color}`}>
                                                    <StatusIcon size={14} />
                                                    <span>{status.label}</span>
                                                </div>
                                            </td>
                                            <td className={`p-4 text-right font-bold text-sm ${tx.type === 'INCOME' ? 'text-emerald-500' : 'text-white'}`}>
                                                {tx.type === 'INCOME' ? '+' : '-'} {formatCurrency(tx.value)}
                                            </td>
                                            <td className="p-4 text-center">
                                                <div className="flex justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                      onClick={() => {
                                                          setEditingTransaction(tx);
                                                          setIsTransactionModalOpen(true);
                                                      }}
                                                      aria-label={`Editar transação: ${tx.description}`}
                                                      className="p-1.5 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                                                    >
                                                      <Edit2 size={14} aria-hidden="true" />
                                                    </button>
                                                    <button
                                                      onClick={() => handleDeleteClick(tx)}
                                                      aria-label={`Excluir transação: ${tx.description}`}
                                                      className="p-1.5 text-gray-300 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                                                    >
                                                      <Trash2 size={14} aria-hidden="true" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                    })
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Mobile: Card View */}
                <div className="md:hidden space-y-3 px-2">
                    {isLoading ? (
                        <Skeleton variant="table-row" count={8} />
                    ) : filteredTransactions.length === 0 ? (
                        <div className="p-8 text-center text-gray-400 font-medium">
                            Nenhuma transação encontrada.
                        </div>
                    ) : (
                        filteredTransactions.map(tx => {
                            const cat = categories.find(c => c.id === tx.categoryId);
                            const acc = accounts.find(a => a.id === tx.accountId);
                            const status = getStatus(tx.date, tx.paid);
                            const StatusIcon = status.icon;
                            const spender = getSpenderInfo(tx.spender);

                            return (
                                <div key={tx.id} className={`p-4 rounded-xl border bg-[#0f172a]/50 ${selectedIds.has(tx.id) ? 'border-blue-500/50 bg-blue-900/10' : 'border-gray-800'}`}>
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <div className="flex items-start gap-3 flex-1">
                                            <input
                                                type="checkbox"
                                                className="w-5 h-5 rounded border-gray-600 bg-[#0f172a] text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-900 mt-0.5"
                                                checked={selectedIds.has(tx.id)}
                                                onChange={(e) => {
                                                    const newSet = new Set(selectedIds);
                                                    if (e.target.checked) newSet.add(tx.id);
                                                    else newSet.delete(tx.id);
                                                    setSelectedIds(newSet);
                                                }}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className="p-2 bg-[#1e293b] rounded-lg text-white flex-shrink-0">
                                                        <CategoryIcon iconName={cat?.icon} size={16} />
                                                    </div>
                                                    <span className="text-gray-200 font-bold text-sm truncate">{tx.description}</span>
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    {formatDate(tx.date)} • {acc?.name}
                                                </div>
                                            </div>
                                        </div>
                                        <span className={`font-bold text-sm whitespace-nowrap flex-shrink-0 ${tx.type === 'INCOME' ? 'text-emerald-500' : 'text-white'}`}>
                                            {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.value)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <div className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium flex-shrink-0" style={{ backgroundColor: `${cat?.color}15`, color: cat?.color }}>
                                                {cat?.name}
                                            </div>
                                            <div className={`flex items-center space-x-1 text-xs font-bold ${status.color}`}>
                                                <StatusIcon size={12} />
                                                <span>{status.label}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                              onClick={() => {
                                                  setEditingTransaction(tx);
                                                  setIsTransactionModalOpen(true);
                                              }}
                                              aria-label={`Editar transação: ${tx.description}`}
                                              className="p-2 min-h-[40px] min-w-[40px] flex items-center justify-center text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                                            >
                                              <Edit2 size={16} aria-hidden="true" />
                                            </button>
                                            <button
                                              onClick={() => handleDeleteClick(tx)}
                                              aria-label={`Excluir transação: ${tx.description}`}
                                              className="p-2 min-h-[40px] min-w-[40px] flex items-center justify-center text-gray-300 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                                            >
                                              <Trash2 size={16} aria-hidden="true" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer / Pagination Placeholder */}
                <div className="p-4 border-t border-gray-800 flex justify-between items-center text-xs text-gray-400">
                    <span>Mostrando <strong>{filteredTransactions.length}</strong> resultados</span>
                    <div className="flex gap-2">
                        <button disabled className="px-3 py-1.5 rounded bg-[#1e293b] text-gray-400 cursor-not-allowed">Anterior</button>
                        <button disabled className="px-3 py-1.5 rounded bg-[#1e293b] text-gray-400 cursor-not-allowed">Próximo</button>
                    </div>
                </div>
            </section>

            {/* Bulk Actions Floating Bar */}
            {selectedIds.size > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#1e293b] border border-gray-700 shadow-2xl rounded-full px-6 py-3 flex items-center gap-6 animate-slide-up">
                    <span className="text-white font-bold text-sm hidden sm:inline">{selectedIds.size} selecionados</span>
                    <div className="h-6 w-px bg-gray-700 hidden sm:block"></div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsBulkCategoryModalOpen(true)}
                            aria-label={`Editar categoria de ${selectedIds.size} transações selecionadas`}
                            className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-700 rounded-lg text-gray-300 transition-colors text-sm font-bold"
                        >
                            <Edit2 size={16} aria-hidden="true" /> Editar Categoria
                        </button>
                        <button
                            onClick={() => {
                                if (confirm(`Tem certeza que deseja excluir ${selectedIds.size} itens?`)) {
                                    deleteTransactions(Array.from(selectedIds));
                                    setSelectedIds(new Set());
                                }
                            }}
                            aria-label={`Excluir ${selectedIds.size} transações selecionadas`}
                            className="flex items-center gap-2 px-3 py-1.5 hover:bg-rose-500/20 text-rose-500 rounded-lg transition-colors text-sm font-bold"
                        >
                            <Trash2 size={16} aria-hidden="true" /> Excluir
                        </button>
                        <button
                            onClick={() => setSelectedIds(new Set())}
                            className="ml-2 p-1.5 hover:bg-gray-700 rounded-full text-gray-400"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>
            )}

            {isBulkCategoryModalOpen && (
                <BulkCategoryModal
                    selectedCount={selectedIds.size}
                    categories={categories}
                    onClose={() => setIsBulkCategoryModalOpen(false)}
                    onApply={(catId) => {
                        const txsToUpdate = transactions.filter(t => selectedIds.has(t.id)).map(t => ({ ...t, categoryId: catId }));
                        updateTransactions(txsToUpdate);
                        setIsBulkCategoryModalOpen(false);
                        setSelectedIds(new Set());
                    }}
                />
            )}

            {/* Category Manager Reuse Logic (Placeholder for now, assuming external modal or page) */}
            <div className="flex justify-end pt-4">
                <button onClick={() => setShowCategoryManager(!showCategoryManager)} className="text-sm font-bold text-gray-400 hover:text-white flex items-center gap-2">
                    <Filter size={16} /> Gerenciar Categorias & Emojis
                </button>
            </div>

            <Modal
                isOpen={showCategoryManager}
                onClose={() => setShowCategoryManager(false)}
                title="Gerenciar Categorias"
                size="lg"
                variant="dark"
            >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto mb-6">
                    {categories.map(cat => (
                        <div key={cat.id} className="bg-[#1e293b] p-3 rounded-xl flex flex-col items-center justify-center gap-2 border border-transparent hover:border-gray-600 group relative">
                            <div className="text-2xl">{cat.icon || '📦'}</div>
                            <span className="text-xs font-bold text-gray-300 text-center">{cat.name}</span>
                            <button
                              onClick={() => deleteCategory(cat.id)}
                              aria-label={`Excluir categoria: ${cat.name}`}
                              className="absolute top-1 right-1 text-gray-600 hover:text-rose-500 opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 size={12} aria-hidden="true" />
                            </button>
                        </div>
                    ))}
                </div>
                <div className="pt-6 border-t border-gray-700">
                    <p className="text-sm text-gray-400 mb-4">Adicionar Nova Categoria</p>
                    <CategoryCreator />
                </div>
            </Modal>

            <ImportExportModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                initialTab={activeTabModal}
            />

            <Modal
                isOpen={isTransactionModalOpen}
                onClose={() => setIsTransactionModalOpen(false)}
                title={editingTransaction ? 'Editar Transação' : 'Nova Transação'}
                size="lg"
                variant="dark"
            >
                <TransactionForm
                    onClose={() => setIsTransactionModalOpen(false)}
                    initialData={editingTransaction}
                />
            </Modal>

            {/* Delete Transaction Modal for Grouped Transactions */}
            {deleteModalTransaction && deleteModalTransaction.groupId && (
                <DeleteTransactionModal
                    transaction={deleteModalTransaction}
                    relatedTransactions={getTransactionsByGroupId(deleteModalTransaction.groupId)}
                    accounts={accounts}
                    onDeleteSingle={() => {
                        deleteTransaction(deleteModalTransaction.id);
                        setDeleteModalTransaction(null);
                    }}
                    onDeleteFuture={() => {
                        deleteTransactionGroupFromIndex(
                            deleteModalTransaction.groupId!,
                            deleteModalTransaction.groupIndex || 1
                        );
                        setDeleteModalTransaction(null);
                    }}
                    onDeleteAll={() => {
                        deleteTransactionGroup(deleteModalTransaction.groupId!);
                        setDeleteModalTransaction(null);
                    }}
                    onClose={() => setDeleteModalTransaction(null)}
                />
            )}
        </div>
    );
};

// Internal Subcomponent for Creation
const CategoryCreator = () => {
    const { addCategory } = useFinance();
    const [name, setName] = useState('');
    const [emoji, setEmoji] = useState('🍕');
    const [color, setColor] = useState('#3b82f6');
    const [showPicker, setShowPicker] = useState(false);

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        addCategory({ name, color, icon: emoji, group: 'VARIABLE' }); // Defaulting group for simplicity
        setName('');
        alert('Categoria criada!');
    };

    return (
        <form onSubmit={handleCreate} className="flex gap-4 items-end">
            <div className="relative">
                <label className="block text-xs font-bold text-gray-400 mb-1">Ícone</label>
                <button type="button" onClick={() => setShowPicker(!showPicker)} className="w-12 h-12 bg-[#1e293b] rounded-xl flex items-center justify-center text-2xl border border-gray-700 hover:border-accent">
                    {emoji}
                </button>
                {showPicker && (
                    <div className="absolute bottom-full left-0 mb-2 z-50 w-64 shadow-xl">
                        <div className="bg-[#1e293b] border border-gray-700 rounded-xl p-2">
                            <EmojiPicker selectedEmoji={emoji} onSelect={(e) => { setEmoji(e); setShowPicker(false); }} />
                        </div>
                    </div>
                )}
            </div>
            <div className="flex-1">
                <label className="block text-xs font-bold text-gray-400 mb-1">Nome</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full h-12 px-4 bg-[#1e293b] border border-gray-700 rounded-xl text-white outline-none focus:border-accent" placeholder="Ex: Mercado" required />
            </div>
            <button type="submit" className="h-12 px-6 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors">
                Criar
            </button>
        </form>
    )
}

const BulkCategoryModal: React.FC<{
    selectedCount: number;
    categories: Category[];
    onClose: () => void;
    onApply: (categoryId: string) => void;
}> = ({ selectedCount, categories, onClose, onApply }) => {
    const [selectedCat, setSelectedCat] = useState(categories[0]?.id || '');

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title={`Editar ${selectedCount} itens`}
            size="md"
            variant="dark"
        >
            <p className="text-sm text-gray-300 mb-6">Selecione a nova categoria para os itens selecionados.</p>
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1">Nova Categoria</label>
                    <select
                        value={selectedCat}
                        onChange={(e) => setSelectedCat(e.target.value)}
                        className="w-full p-3 bg-[#1e293b] border border-gray-700 rounded-xl text-white outline-none focus:border-blue-500"
                    >
                        {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                        ))}
                    </select>
                </div>
                <div className="flex gap-3 pt-4">
                    <button onClick={onClose} className="flex-1 py-3 text-gray-400 font-bold hover:bg-[#1e293b] rounded-xl transition-colors">Cancelar</button>
                    <button onClick={() => onApply(selectedCat)} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-colors">Aplicar</button>
                </div>
            </div>
        </Modal>
    );
};
