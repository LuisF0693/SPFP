
import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, formatDate } from '../utils';
import { AccountType, AccountOwner, Account, CardNetwork } from '../types';
import { Building, CreditCard, Banknote, Briefcase, Plus, X, Users, Heart, Edit2, Trash2, ShoppingBag, Calendar, CreditCard as CardIcon } from 'lucide-react';
import { BankLogo } from './BankLogo';
import { CategoryIcon } from './CategoryIcon';

const CARD_COLORS = [
    '#ef4444', // Red
    '#8b5cf6', // Violet (Nubank style)
    '#f97316', // Orange (Inter style)
    '#3b82f6', // Blue
    '#10b981', // Emerald
    '#ec4899', // Pink
    '#111827', // Black
    '#f59e0b', // Amber
];

const Accounts: React.FC = () => {
    const { accounts, addAccount, updateAccount, deleteAccount, userProfile, transactions, categories } = useFinance();
    const [showForm, setShowForm] = useState(false);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [viewingAccount, setViewingAccount] = useState<Account | null>(null);

    // Form States
    const [newAccName, setNewAccName] = useState('');
    const [newAccType, setNewAccType] = useState<AccountType>('CHECKING');
    const [newAccOwner, setNewAccOwner] = useState<AccountOwner>('ME');
    const [newAccBalance, setNewAccBalance] = useState('');
    const [newAccLimit, setNewAccLimit] = useState('');

    // Credit Card Specific States
    const [newAccLastFour, setNewAccLastFour] = useState('');
    const [newAccNetwork, setNewAccNetwork] = useState<CardNetwork>('MASTERCARD');
    const [newAccClosingDay, setNewAccClosingDay] = useState('');
    const [newAccDueDay, setNewAccDueDay] = useState('');
    const [newAccColor, setNewAccColor] = useState(CARD_COLORS[3]);

    // Payment Logic State
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState(0);
    const [paymentSourceId, setPaymentSourceId] = useState('');
    const { addManyTransactions } = useFinance();

    const getOwnerBadge = (owner: AccountOwner) => {
        switch (owner) {
            case 'ME': return null;
            case 'SPOUSE':
                return (
                    <span className="flex items-center text-[10px] bg-pink-500/10 text-pink-400 px-2 py-0.5 rounded-full font-bold ml-2 border border-pink-500/20">
                        <Heart size={10} className="mr-1" /> {userProfile.spouseName || 'Cônjuge'}
                    </span>
                );
            case 'JOINT':
                return (
                    <span className="flex items-center text-[10px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full font-bold ml-2 border border-purple-500/20">
                        <Users size={10} className="mr-1" /> Conjunta
                    </span>
                );
        }
    };

    const getLabel = (type: AccountType) => {
        switch (type) {
            case 'CHECKING': return 'Conta Corrente';
            case 'CREDIT_CARD': return 'Cartão de Crédito';
            case 'CASH': return 'Dinheiro';
            case 'INVESTMENT': return 'Investimento';
        }
    };

    const handleEditClick = (account: Account) => {
        setEditingId(account.id);
        setNewAccName(account.name);
        setNewAccType(account.type);
        setNewAccOwner(account.owner);

        if (account.type === 'CREDIT_CARD') {
            setNewAccBalance(Math.abs(account.balance).toString());
            setNewAccLimit(account.creditLimit ? account.creditLimit.toString() : '');
            setNewAccLastFour(account.lastFourDigits || '');
            setNewAccNetwork(account.network || 'MASTERCARD');
            setNewAccClosingDay(account.closingDay ? account.closingDay.toString() : '');
            setNewAccDueDay(account.dueDay ? account.dueDay.toString() : '');
            setNewAccColor(account.color || CARD_COLORS[3]);
        } else {
            setNewAccBalance(account.balance.toString());
        }

        setShowForm(true);
        window.scrollTo(0, 0);
    };

    const resetForm = () => {
        setNewAccName('');
        setNewAccBalance('');
        setNewAccLimit('');
        setNewAccType('CHECKING');
        setNewAccOwner('ME');
        setNewAccLastFour('');
        setNewAccNetwork('MASTERCARD');
        setNewAccClosingDay('');
        setNewAccDueDay('');
        setNewAccColor(CARD_COLORS[3]);
        setEditingId(null);
        setShowForm(false);
    };

    const handleDelete = (id: string, name: string) => {
        if (window.confirm(`Tem certeza que deseja excluir "${name}"?`)) {
            deleteAccount(id);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAccName) return;

        let finalBalance = newAccBalance ? parseFloat(newAccBalance) : 0;

        if (newAccType === 'CREDIT_CARD') {
            finalBalance = -Math.abs(finalBalance);
        }

        const accountData: any = {
            name: newAccName,
            type: newAccType,
            owner: newAccOwner,
            balance: finalBalance,
        };

        if (newAccType === 'CREDIT_CARD') {
            accountData.creditLimit = newAccLimit ? parseFloat(newAccLimit) : 0;
            accountData.lastFourDigits = newAccLastFour;
            accountData.network = newAccNetwork;
            accountData.closingDay = newAccClosingDay ? parseInt(newAccClosingDay) : undefined;
            accountData.dueDay = newAccDueDay ? parseInt(newAccDueDay) : undefined;
            accountData.color = newAccColor;
        }

        if (editingId) {
            updateAccount({ ...accountData, id: editingId });
        } else {
            addAccount(accountData);
        }

        resetForm();
    };

    const handlePayInvoice = () => {
        if (!viewingAccount || !paymentSourceId || paymentAmount <= 0) return;

        const sourceAccount = accounts.find(a => a.id === paymentSourceId);
        if (!sourceAccount) return;

        const now = new Date().toISOString();
        const description = `Pagamento Fatura ${viewingAccount.name}`;

        const transactionsToAdd = [
            // 1. Saída da Conta Corrente
            {
                accountId: paymentSourceId,
                description: description,
                value: -paymentAmount,
                date: now,
                type: 'EXPENSE' as const,
                categoryId: categories.find(c => c.name === 'Transferências')?.id || categories[0].id
            },
            // 2. Entrada no Cartão (Abatimento da Fatura)
            {
                accountId: viewingAccount.id,
                description: 'Pagamento Recebido',
                value: paymentAmount, // Positivo para abater o saldo negativo
                date: now,
                type: 'INCOME' as const, // Tecnicamente uma entrada no contexto do cartão
                categoryId: categories.find(c => c.name === 'Transferências')?.id || categories[0].id
            }
        ];

        // @ts-ignore
        addManyTransactions(transactionsToAdd);

        setIsPaymentModalOpen(false);
        setViewingAccount(null); // Fecha o modal do cartão
        alert('Fatura paga com sucesso!');
    };

    const openPaymentModal = () => {
        if (!viewingAccount) return;
        // Calcula o total da fatura atual (soma das despesas do mês)
        const transactions = getAccountTransactions();
        const totalInvoice = transactions.reduce((acc, t) => acc + t.value, 0);

        setPaymentAmount(Math.abs(totalInvoice));
        // Seleciona a primeira conta corrente encontrada como padrão
        const defaultSource = accounts.find(a => a.type === 'CHECKING')?.id || '';
        setPaymentSourceId(defaultSource);
        setIsPaymentModalOpen(true);
    };

    const handleCardClick = (account: Account) => {
        if (account.type === 'CREDIT_CARD') {
            setViewingAccount(account);
        }
    };

    const getAccountTransactions = () => {
        if (!viewingAccount) return [];

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        return transactions
            .filter(t =>
                t.accountId === viewingAccount.id &&
                t.type === 'EXPENSE' &&
                new Date(t.date).getMonth() === currentMonth &&
                new Date(t.date).getFullYear() === currentYear
            )
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    };

    const accountTransactions = getAccountTransactions();
    const modalTotal = accountTransactions.reduce((acc, t) => acc + t.value, 0);

    const creditCards = accounts.filter(a => a.type === 'CREDIT_CARD');
    const otherAccounts = accounts.filter(a => a.type !== 'CREDIT_CARD');

    return (
        <div className="p-4 md:p-6 min-h-full relative animate-fade-in pb-24">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Minhas Contas</h2>
                    <p className="text-sm text-gray-500">Gerencie seus cartões e saldos bancários.</p>
                </div>
                <button
                    onClick={() => {
                        if (showForm) resetForm();
                        else setShowForm(true);
                    }}
                    className="bg-accent text-white p-2.5 rounded-xl hover:bg-blue-600 transition-all shadow-[0_0_15px_rgba(59,130,246,0.5)] border border-blue-400/20 active:scale-95 flex items-center"
                    title={showForm ? "Fechar" : "Adicionar Nova Conta"}
                >
                    {showForm ? <X size={24} /> : <Plus size={24} />}
                </button>
            </div>

            {showForm && (
                <div className="bg-white p-5 rounded-2xl shadow-lg border border-gray-800 mb-8 animate-slide-up">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-800 text-lg">{editingId ? 'Editar' : 'Adicionar'}</h3>
                        {editingId && <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded border border-accent/20">Editando</span>}
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome da Instituição</label>
                            <input
                                type="text"
                                placeholder="Ex: Nubank, Itaú, Carteira..."
                                value={newAccName}
                                onChange={e => setNewAccName(e.target.value)}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent/50"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tipo</label>
                                <select
                                    value={newAccType}
                                    onChange={e => setNewAccType(e.target.value as AccountType)}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-accent"
                                >
                                    <option value="CHECKING">Conta Corrente</option>
                                    <option value="CREDIT_CARD">Cartão de Crédito</option>
                                    <option value="INVESTMENT">Investimento</option>
                                    <option value="CASH">Dinheiro</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Proprietário</label>
                                <select
                                    value={newAccOwner}
                                    onChange={e => setNewAccOwner(e.target.value as AccountOwner)}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-accent"
                                >
                                    <option value="ME">Minha Conta</option>
                                    <option value="SPOUSE">Conta do Cônjuge</option>
                                    <option value="JOINT">Conta Conjunta</option>
                                </select>
                            </div>
                        </div>

                        {/* Campos Específicos para Cartão de Crédito */}
                        {newAccType === 'CREDIT_CARD' && (
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4 animate-fade-in">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Final do Cartão (4 dígitos)</label>
                                        <input
                                            type="text"
                                            maxLength={4}
                                            placeholder="Ex: 1234"
                                            value={newAccLastFour}
                                            onChange={e => setNewAccLastFour(e.target.value.replace(/\D/g, ''))}
                                            className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Bandeira</label>
                                        <select
                                            value={newAccNetwork}
                                            onChange={e => setNewAccNetwork(e.target.value as CardNetwork)}
                                            className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm outline-none"
                                        >
                                            <option value="VISA">Visa</option>
                                            <option value="MASTERCARD">Mastercard</option>
                                            <option value="ELO">Elo</option>
                                            <option value="AMEX">Amex</option>
                                            <option value="OTHER">Outros</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Dia Fechamento</label>
                                        <input
                                            type="number"
                                            min={1}
                                            max={31}
                                            placeholder="Dia"
                                            value={newAccClosingDay}
                                            onChange={e => setNewAccClosingDay(e.target.value)}
                                            className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Dia Vencimento</label>
                                        <input
                                            type="number"
                                            min={1}
                                            max={31}
                                            placeholder="Dia"
                                            value={newAccDueDay}
                                            onChange={e => setNewAccDueDay(e.target.value)}
                                            className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm outline-none"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Cor do Cartão</label>
                                    <div className="flex flex-wrap gap-2">
                                        {CARD_COLORS.map(color => (
                                            <button
                                                key={color}
                                                type="button"
                                                onClick={() => setNewAccColor(color)}
                                                className={`w-8 h-8 rounded-full border-2 transition-transform ${newAccColor === color ? 'border-white scale-110 ring-2 ring-gray-400' : 'border-transparent'}`}
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex space-x-2">
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                                    {newAccType === 'CREDIT_CARD' ? "Fatura Atual" : "Saldo Atual"}
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">R$</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder="0,00"
                                        value={newAccBalance}
                                        onChange={e => setNewAccBalance(e.target.value)}
                                        className="w-full pl-8 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 font-bold"
                                    />
                                </div>
                            </div>

                            {newAccType === 'CREDIT_CARD' && (
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Limite Total</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">R$</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            placeholder="0,00"
                                            value={newAccLimit}
                                            onChange={e => setNewAccLimit(e.target.value)}
                                            className="w-full pl-8 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 font-bold"
                                            required
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex space-x-3 pt-2">
                            {editingId && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="flex-1 bg-gray-800 text-gray-300 py-3 rounded-xl font-bold text-sm hover:bg-gray-700 border border-gray-700"
                                >
                                    Cancelar
                                </button>
                            )}
                            <button type="submit" className="flex-1 bg-accent text-white py-3 rounded-xl font-bold text-sm hover:bg-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                                {editingId ? 'Atualizar Conta' : 'Salvar Conta'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* SEÇÃO DE CARTÕES DE CRÉDITO */}
            {creditCards.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-lg font-bold text-gray-200 mb-4 flex items-center">
                        <CreditCard className="mr-2 text-accent" size={20} />
                        Gastos por Cartão de Crédito
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {creditCards.map(card => (
                            <div
                                key={card.id}
                                onClick={() => handleCardClick(card)}
                                className="rounded-3xl overflow-hidden shadow-lg cursor-pointer transform hover:scale-[1.02] transition-all duration-300 group"
                            >
                                {/* Topo Colorido */}
                                <div
                                    className="p-5 flex justify-between items-start h-32 relative"
                                    style={{ backgroundColor: card.color || CARD_COLORS[3] }}
                                >
                                    <div className="bg-white p-1.5 rounded-xl shadow-sm">
                                        <BankLogo name={card.name} type="CREDIT_CARD" size={32} />
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(card.id, card.name); }}
                                        className="text-white/70 hover:text-white bg-black/20 p-1.5 rounded-lg hover:bg-red-500/80 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleEditClick(card); }}
                                        className="absolute bottom-3 right-3 text-white/70 hover:text-white bg-black/20 p-1.5 rounded-lg hover:bg-black/40 transition-colors"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                </div>

                                {/* Base de Dados */}
                                <div className="bg-[#111] p-5 border-t border-white/5 space-y-4">
                                    <div>
                                        <h4 className="font-bold text-white text-lg">{card.name}</h4>
                                        <div className="flex items-center text-xs text-gray-500 mt-1">
                                            <span>{card.network === 'OTHER' ? 'Cartão' : card.network}</span>
                                            {card.lastFourDigits && (
                                                <>
                                                    <span className="mx-1">•</span>
                                                    <span>Final {card.lastFourDigits}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Limite do Cartão</p>
                                        <p className="text-sm font-bold text-gray-300">{formatCurrency(card.creditLimit || 0)}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-800/50">
                                        <div className="flex items-center space-x-2">
                                            <div className="p-1.5 bg-gray-800 rounded-lg text-gray-400">
                                                <Calendar size={14} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-500 font-bold">Fechamento</p>
                                                <p className="text-xs font-bold text-gray-300">Dia {card.closingDay || '--'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className="p-1.5 bg-gray-800 rounded-lg text-gray-400">
                                                <CardIcon size={14} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-500 font-bold">Vencimento</p>
                                                <p className="text-xs font-bold text-gray-300">Dia {card.dueDay || '--'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* SEÇÃO DE OUTRAS CONTAS */}
            <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-200 mb-4 flex items-center">
                    <Building className="mr-2 text-gray-400" size={20} />
                    Outras Contas
                </h3>
                {otherAccounts.length === 0 ? (
                    <div className="text-center py-8 bg-white/5 rounded-2xl border border-dashed border-gray-700">
                        <p className="text-gray-500 text-sm">Nenhuma outra conta cadastrada.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {otherAccounts.map(account => (
                            <div
                                key={account.id}
                                className="bg-[#111] p-5 rounded-2xl shadow-sm border border-gray-800 flex justify-between items-center group hover:border-gray-700 transition-colors"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-gray-700 bg-white overflow-hidden p-1">
                                        <BankLogo name={account.name} type={account.type} size={36} />
                                    </div>
                                    <div>
                                        <div className="flex items-center">
                                            <h3 className="font-bold text-gray-200">{account.name}</h3>
                                            {getOwnerBadge(account.owner)}
                                        </div>
                                        <p className="text-xs text-gray-500">{getLabel(account.type)}</p>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end">
                                    <div className="flex space-x-2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleEditClick(account)}
                                            className="p-1.5 text-gray-400 hover:text-accent bg-gray-800 rounded-lg transition-colors"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(account.id, account.name)}
                                            className="p-1.5 text-gray-400 hover:text-danger bg-gray-800 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 mb-0.5">Saldo Atual</p>
                                    <p className="font-bold text-lg text-white">{formatCurrency(account.balance)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {viewingAccount && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl overflow-hidden animate-slide-up border border-gray-800">
                        <div
                            className="p-5 border-b border-gray-800 flex justify-between items-center"
                            style={{ backgroundColor: viewingAccount.color || '#1e293b' }}
                        >
                            <div className="text-white">
                                <h3 className="font-bold text-lg flex items-center">
                                    <div className="mr-2 p-1 bg-white rounded-lg">
                                        <BankLogo name={viewingAccount.name} type={viewingAccount.type} size={20} />
                                    </div>
                                    {viewingAccount.name}
                                </h3>
                                <p className="text-xs opacity-80 mt-1">
                                    Fatura • Vence dia {viewingAccount.dueDay || '--'}
                                </p>
                            </div>
                            <button
                                onClick={() => setViewingAccount(null)}
                                className="p-2 bg-white/20 rounded-full text-white hover:bg-white/30 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="px-5 py-4 bg-gray-50 border-b border-gray-200">
                            <div className="flex justify-between items-end mb-2">
                                <div>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Limite Disponível</p>
                                    <p className="text-xl font-bold text-gray-800">{formatCurrency(viewingAccount.creditLimit ? (viewingAccount.creditLimit + viewingAccount.balance) : 0)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-gray-500 font-bold uppercase">Total Utilizado</p>
                                    <p className="text-sm font-bold text-danger">{formatCurrency(Math.abs(viewingAccount.balance))}</p>
                                </div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                <div
                                    className="h-1.5 rounded-full bg-accent transition-all duration-500"
                                    style={{ width: `${Math.min(((Math.abs(viewingAccount.balance) / (viewingAccount.creditLimit || 1)) * 100), 100)}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar bg-white">
                            {accountTransactions.length === 0 ? (
                                <div className="text-center py-10 text-gray-400">
                                    <ShoppingBag size={40} className="mx-auto mb-2 opacity-30" />
                                    <p className="text-sm">Nenhuma compra registrada neste mês.</p>
                                </div>
                            ) : (
                                accountTransactions.map(tx => {
                                    const cat = categories.find(c => c.id === tx.categoryId);
                                    return (
                                        <div key={tx.id} className="flex justify-between items-center p-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 rounded-lg transition-colors">
                                            <div className="flex items-center space-x-3">
                                                <div className="text-center bg-gray-100 px-2 py-1 rounded text-gray-500 min-w-[40px]">
                                                    <div className="text-[10px] uppercase font-bold">{formatDate(tx.date).substring(0, 2)}</div>
                                                    <div className="text-[10px]">{formatDate(tx.date).substring(3, 5)}</div>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-800">{tx.description}</p>
                                                    <div className="flex items-center">
                                                        <div className="mr-1.5 opacity-70">
                                                            <CategoryIcon iconName={cat?.icon} color={cat?.color} size={12} />
                                                        </div>
                                                        <p className="text-xs text-gray-500">{cat?.name}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="font-bold text-sm text-gray-800">{formatCurrency(tx.value)}</span>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        <div className="p-5 bg-gray-900 border-t border-gray-800 flex justify-between items-center text-white">
                            <span className="text-sm font-medium opacity-80">Total da Fatura</span>
                            <span className="text-xl font-bold">{formatCurrency(modalTotal)}</span>
                            <button
                                onClick={openPaymentModal}
                                className="ml-4 bg-accent hover:bg-white hover:text-accent text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
                            >
                                Pagar Fatura
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Confirmation Modal */}
            {isPaymentModalOpen && viewingAccount && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 animate-slide-up">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Pagar Fatura</h3>
                        <p className="text-sm text-gray-500 mb-6">{viewingAccount.name}</p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Valor do Pagamento</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">R$</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={paymentAmount}
                                        onChange={(e) => setPaymentAmount(parseFloat(e.target.value))}
                                        className="w-full pl-8 p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 outline-none focus:border-accent"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Pagar com</label>
                                <select
                                    value={paymentSourceId}
                                    onChange={(e) => setPaymentSourceId(e.target.value)}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-accent"
                                >
                                    <option value="" disabled>Selecione uma conta</option>
                                    {accounts.filter(a => a.type === 'CHECKING' || a.type === 'CASH').map(acc => (
                                        <option key={acc.id} value={acc.id}>{acc.name} ({formatCurrency(acc.balance)})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    onClick={() => setIsPaymentModalOpen(false)}
                                    className="flex-1 py-3 text-gray-500 font-bold text-sm hover:bg-gray-50 rounded-xl"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handlePayInvoice}
                                    disabled={!paymentSourceId || paymentAmount <= 0}
                                    className="flex-1 py-3 bg-emerald-500 text-white font-bold text-sm rounded-xl hover:bg-emerald-600 shadow-lg shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Confirmar Pagamento
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Accounts;
