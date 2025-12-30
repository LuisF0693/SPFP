import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, formatDate } from '../utils';
import { AccountType, AccountOwner, Account, CardNetwork } from '../types';
import {
    Building, CreditCard, Plus, X, Users, Heart, Edit2, Trash2,
    ShoppingBag, Calendar, CreditCard as CardIcon, Download, Receipt, Wifi
} from 'lucide-react';
import { BankLogo } from './BankLogo';
import { CategoryIcon } from './CategoryIcon';

const CARD_COLORS = [
    '#ef4444', // Red
    '#8b5cf6', // Violet (Nubank style)
    '#f97316', // Orange (Inter style)
    '#3b82f6', // Blue
    '#10b981', // Emerald
    '#ec4899', // Pink
    '#0f172a', // Navy/Black
    '#f59e0b', // Amber
];

const Accounts: React.FC = () => {
    const { accounts, addAccount, updateAccount, deleteAccount, userProfile, transactions, categories, addManyTransactions } = useFinance();
    const [showForm, setShowForm] = useState(false);
    const [viewingAccount, setViewingAccount] = useState<Account | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [activeCardId, setActiveCardId] = useState<string | null>(null);

    // Form States
    const [newAccName, setNewAccName] = useState('');
    const [newAccType, setNewAccType] = useState<AccountType>('CHECKING');
    const [newAccOwner, setNewAccOwner] = useState<AccountOwner>('ME');
    const [newAccBalance, setNewAccBalance] = useState('');
    const [newAccLimit, setNewAccLimit] = useState('');
    const [newAccLastFour, setNewAccLastFour] = useState('');
    const [newAccNetwork, setNewAccNetwork] = useState<CardNetwork>('MASTERCARD');
    const [newAccClosingDay, setNewAccClosingDay] = useState('');
    const [newAccDueDay, setNewAccDueDay] = useState('');
    const [newAccColor, setNewAccColor] = useState(CARD_COLORS[6]);

    // Payment Logic State
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState(0);
    const [paymentSourceId, setPaymentSourceId] = useState('');

    const creditCards = accounts.filter(a => a.type === 'CREDIT_CARD');
    const otherAccounts = accounts.filter(a => a.type !== 'CREDIT_CARD');

    // --- Stats Calculations for Cards ---
    const totalInvoices = creditCards.reduce((acc, card) => acc + Math.abs(card.balance), 0);
    const totalLimit = creditCards.reduce((acc, card) => acc + (card.creditLimit || 0), 0);
    const totalAvailable = totalLimit - totalInvoices;
    const limitUsage = totalLimit > 0 ? (totalInvoices / totalLimit) * 100 : 0;

    // Find next due date
    const today = new Date();
    const nextDueCard = [...creditCards]
        .filter(c => c.dueDay)
        .sort((a, b) => {
            let dateA = new Date(today.getFullYear(), today.getMonth(), a.dueDay!);
            if (dateA < today) dateA = new Date(today.getFullYear(), today.getMonth() + 1, a.dueDay!);

            let dateB = new Date(today.getFullYear(), today.getMonth(), b.dueDay!);
            if (dateB < today) dateB = new Date(today.getFullYear(), today.getMonth() + 1, b.dueDay!);

            return dateA.getTime() - dateB.getTime();
        })[0];

    let daysUntilDue = 0;
    let nextDueDateDisplay = "Sem faturas";

    if (nextDueCard && nextDueCard.dueDay) {
        let dueDate = new Date(today.getFullYear(), today.getMonth(), nextDueCard.dueDay);
        if (dueDate < today) dueDate = new Date(today.getFullYear(), today.getMonth() + 1, nextDueCard.dueDay);
        const diffTime = Math.abs(dueDate.getTime() - today.getTime());
        daysUntilDue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        nextDueDateDisplay = `Dia ${nextDueCard.dueDay}`;
    }

    // --- Helper Functions ---
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
            setNewAccColor(account.color || CARD_COLORS[6]);
        } else {
            setNewAccBalance(account.balance.toString());
        }

        setShowForm(true);
        window.scrollTo(0, 0);
    };

    const handleDelete = (id: string, name: string) => {
        if (window.confirm(`Tem certeza que deseja excluir "${name}"?`)) {
            deleteAccount(id);
            if (activeCardId === id) setActiveCardId(null);
        }
    };

    const resetForm = () => {
        setNewAccName(''); setNewAccBalance(''); setNewAccLimit(''); setNewAccType('CHECKING');
        setNewAccOwner('ME'); setNewAccLastFour(''); setNewAccNetwork('MASTERCARD');
        setNewAccClosingDay(''); setNewAccDueDay(''); setNewAccColor(CARD_COLORS[6]);
        setEditingId(null); setShowForm(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAccName) return;

        let finalBalance = newAccBalance ? parseFloat(newAccBalance) : 0;
        if (newAccType === 'CREDIT_CARD') {
            finalBalance = -Math.abs(finalBalance);
        }

        const accountData: any = {
            name: newAccName, type: newAccType, owner: newAccOwner, balance: finalBalance,
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

    // --- Payment Logic reused ---
    const handlePayInvoice = () => {
        if (!viewingAccount || !paymentSourceId || paymentAmount <= 0) return;
        const now = new Date().toISOString();
        const description = `Pagamento Fatura ${viewingAccount.name}`;

        const transactionsToAdd = [
            {
                accountId: paymentSourceId, description: description, value: -paymentAmount, date: now, type: 'EXPENSE' as const,
                categoryId: categories.find(c => c.name === 'Transferências')?.id || categories[0].id
            },
            {
                accountId: viewingAccount.id, description: 'Pagamento Recebido', value: paymentAmount, date: now, type: 'INCOME' as const,
                categoryId: categories.find(c => c.name === 'Transferências')?.id || categories[0].id
            }
        ];
        // @ts-ignore
        addManyTransactions(transactionsToAdd);
        setIsPaymentModalOpen(false);
        setViewingAccount(null);
        alert('Fatura paga com sucesso!');
    };

    const openPaymentModal = (account: Account) => {
        setViewingAccount(account);
        setPaymentAmount(Math.abs(account.balance));
        const defaultSource = accounts.find(a => a.type === 'CHECKING')?.id || '';
        setPaymentSourceId(defaultSource);
        setIsPaymentModalOpen(true);
    };

    // --- Dashboard Data for Cards ---
    // Recent Purchases across ALL cards (or specific if selected?) -> Let's show aggregated for "Meus Cartões" context
    const getRecentCardTransactions = () => {
        const cardIds = creditCards.map(c => c.id);
        return transactions
            .filter(t => cardIds.includes(t.accountId) && t.type === 'EXPENSE')
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5);
    };
    const recentCardTx = getRecentCardTransactions();

    // Spending by Category for Cards
    const cardCategoryData = Object.entries(
        transactions
            .filter(t => creditCards.map(c => c.id).includes(t.accountId) && t.type === 'EXPENSE' && new Date(t.date).getMonth() === today.getMonth())
            .reduce((acc, t) => {
                acc[t.categoryId] = (acc[t.categoryId] || 0) + t.value;
                return acc;
            }, {} as Record<string, number>)
    ).map(([catId, value]: [string, number]) => {
        const cat = categories.find(c => c.id === catId);
        return { name: cat?.name || 'Outros', value, color: cat?.color, icon: cat?.icon };
    }).sort((a: { value: number }, b: { value: number }) => b.value - a.value).slice(0, 3);


    return (
        <div className="p-4 md:p-6 min-h-full space-y-8 animate-fade-in pb-24">

            {/* --- FORM OVERLAY --- */}
            {showForm && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#0f172a] w-full max-w-lg rounded-2xl shadow-2xl p-6 border border-gray-200 dark:border-gray-800 animate-slide-up max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-gray-900 dark:text-white text-xl">{editingId ? 'Editar Conta' : 'Nova Conta'}</h3>
                            <button onClick={resetForm}><X size={24} className="text-gray-500 hover:text-gray-700 dark:hover:text-white" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome da Instituição</label>
                                <input type="text" placeholder="Ex: Nubank, Itaú..." value={newAccName} onChange={e => setNewAccName(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none focus:border-accent text-gray-900 dark:text-white" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tipo</label>
                                    <select value={newAccType} onChange={e => setNewAccType(e.target.value as AccountType)} className="w-full p-3 bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none focus:border-accent text-gray-900 dark:text-white">
                                        <option value="CHECKING">Conta Corrente</option>
                                        <option value="CREDIT_CARD">Cartão de Crédito</option>
                                        <option value="INVESTMENT">Investimento</option>
                                        <option value="CASH">Dinheiro</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Proprietário</label>
                                    <select value={newAccOwner} onChange={e => setNewAccOwner(e.target.value as AccountOwner)} className="w-full p-3 bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none focus:border-accent text-gray-900 dark:text-white">
                                        <option value="ME">Minha Conta</option>
                                        <option value="SPOUSE">Conta do Cônjuge</option>
                                        <option value="JOINT">Conta Conjunta</option>
                                    </select>
                                </div>
                            </div>
                            {newAccType === 'CREDIT_CARD' && (
                                <div className="bg-gray-50 dark:bg-black/20 p-4 rounded-xl border border-gray-200 dark:border-gray-800 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Final (4 dígitos)</label>
                                            <input type="text" maxLength={4} placeholder="1234" value={newAccLastFour} onChange={e => setNewAccLastFour(e.target.value.replace(/\D/g, ''))} className="w-full p-3 bg-white dark:bg-black/30 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none text-gray-900 dark:text-white" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Bandeira</label>
                                            <select value={newAccNetwork} onChange={e => setNewAccNetwork(e.target.value as CardNetwork)} className="w-full p-3 bg-white dark:bg-black/30 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none text-gray-900 dark:text-white">
                                                <option value="MASTERCARD">Mastercard</option>
                                                <option value="VISA">Visa</option>
                                                <option value="ELO">Elo</option>
                                                <option value="AMEX">Amex</option>
                                                <option value="OTHER">Outros</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Dia Fechamento</label>
                                            <input type="number" min={1} max={31} placeholder="Ex: 5" value={newAccClosingDay} onChange={e => setNewAccClosingDay(e.target.value)} className="w-full p-3 bg-white dark:bg-black/30 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none text-gray-900 dark:text-white" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Dia Vencimento</label>
                                            <input type="number" min={1} max={31} placeholder="Ex: 10" value={newAccDueDay} onChange={e => setNewAccDueDay(e.target.value)} className="w-full p-3 bg-white dark:bg-black/30 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none text-gray-900 dark:text-white" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Cor do Cartão</label>
                                        <div className="flex flex-wrap gap-2">
                                            {CARD_COLORS.map(color => (
                                                <button key={color} type="button" onClick={() => setNewAccColor(color)} className={`w-8 h-8 rounded-full border-2 transition-transform ${newAccColor === color ? 'border-white scale-110 ring-2 ring-gray-400' : 'border-transparent'}`} style={{ backgroundColor: color }} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className="flex space-x-2">
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{newAccType === 'CREDIT_CARD' ? "Fatura Atual" : "Saldo Atual"}</label>
                                    <input type="number" step="0.01" placeholder="0,00" value={newAccBalance} onChange={e => setNewAccBalance(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none font-bold text-gray-900 dark:text-white" />
                                </div>
                                {newAccType === 'CREDIT_CARD' && (
                                    <div className="flex-1">
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Limite Total</label>
                                        <input type="number" step="0.01" placeholder="0,00" value={newAccLimit} onChange={e => setNewAccLimit(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none font-bold text-gray-900 dark:text-white" required />
                                    </div>
                                )}
                            </div>
                            <button type="submit" className="w-full bg-accent text-white py-3 rounded-xl font-bold hover:bg-blue-600 transition-all">{editingId ? 'Salvar Alterações' : 'Criar Conta'}</button>
                        </form>
                    </div>
                </div>
            )}

            {/* --- CARDS DASHBOARD SECTION (NEW) --- */}
            <div>
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Meus Cartões</h2>
                        <p className="text-gray-500 text-sm">Gerencie seus limites e faturas em um só lugar</p>
                    </div>
                    <div className="flex space-x-3">
                        <button className="hidden md:flex items-center space-x-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-all">
                            <Download size={16} /> <span>Exportar</span>
                        </button>
                        <button
                            onClick={() => { resetForm(); setNewAccType('CREDIT_CARD'); setShowForm(true); }}
                            className="bg-accent hover:bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 transition-all flex items-center"
                        >
                            <Plus size={18} className="mr-2" /> Adicionar Cartão
                        </button>
                    </div>
                </div>

                {/* Top Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white dark:bg-[#0f172a] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 relative overflow-hidden">
                        <div className="relative z-10">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Total em Faturas</p>
                            <h3 className="text-3xl font-black text-gray-900 dark:text-white">{formatCurrency(totalInvoices)}</h3>
                            <p className="text-xs text-gray-500 mt-1">Referente ao mês atual</p>
                        </div>
                        <Receipt className="absolute right-[-20px] bottom-[-20px] text-gray-100 dark:text-gray-800 opacity-50" size={120} strokeWidth={0.5} />
                    </div>
                    <div className="bg-white dark:bg-[#0f172a] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 relative overflow-hidden">
                        <div className="relative z-10">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Limite Total Disponível</p>
                            <h3 className="text-3xl font-black text-gray-900 dark:text-white">{formatCurrency(totalAvailable)}</h3>
                            <div className="w-full bg-gray-100 dark:bg-gray-700 h-1.5 rounded-full mt-3 overflow-hidden">
                                <div className="bg-accent h-full rounded-full" style={{ width: `${Math.min(limitUsage, 100)}%` }}></div>
                            </div>
                            <p className="text-xs text-accent font-bold mt-2">{Math.round(limitUsage)}% do limite total utilizado</p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-[#0f172a] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 relative overflow-hidden">
                        <div className="relative z-10">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Próximo Vencimento</p>
                            <h3 className="text-3xl font-black text-white mix-blend-difference">{nextDueDateDisplay}</h3>
                            <span className="text-xs text-gray-500 font-bold">{nextDueCard ? nextDueCard.name : ''}</span>
                            {daysUntilDue > 0 && <p className="text-xs text-orange-500 font-bold mt-1">Faltam {daysUntilDue} dias</p>}
                        </div>
                        <Calendar className="absolute right-[-10px] bottom-[-20px] text-gray-100 dark:text-gray-800 opacity-50" size={120} strokeWidth={0.5} />
                    </div>
                </div>

                {/* Main Content: Cards List & Sidebar */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Cards List */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Seus Cartões</h3>
                        </div>

                        {creditCards.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 dark:bg-[#0f172a] rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                                <CreditCard size={48} className="mx-auto text-gray-300 mb-4" />
                                <p className="text-gray-500 font-medium">Você ainda não tem cartões cadastrados.</p>
                                <button onClick={() => { resetForm(); setNewAccType('CREDIT_CARD'); setShowForm(true); }} className="mt-4 text-accent font-bold text-sm hover:underline">Cadastrar Cartão</button>
                            </div>
                        ) : (
                            creditCards.map(card => {
                                const limit = card.creditLimit || 0;
                                const used = Math.abs(card.balance);
                                const available = limit - used;
                                const percent = limit > 0 ? (used / limit) * 100 : 0;

                                return (
                                    <div key={card.id} className="bg-white dark:bg-[#0f172a] rounded-3xl p-1 shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col md:flex-row">
                                        {/* Card Visual */}
                                        <div className="w-full md:w-[280px] p-6 lg:p-6 flex flex-col justify-between text-white rounded-[20px] relative overflow-hidden shrink-0 min-h-[160px]"
                                            style={{ background: card.color || '#0f172a' }}
                                        >
                                            {/* Background Pattern */}
                                            <div className="absolute top-0 right-0 p-8 opacity-10"><Wifi size={64} /></div>

                                            <div className="flex justify-between items-start z-10">
                                                <span className="font-bold tracking-widest uppercase">{card.name}</span>
                                                <Wifi size={20} className="rotate-90" />
                                            </div>
                                            <div className="z-10 mt-6">
                                                <div className="w-10 h-7 bg-yellow-400/80 rounded-md mb-3 flex items-center justify-center relative overflow-hidden">
                                                    <div className="absolute w-[120%] h-[1px] bg-black/20 inset-0 m-auto rotate-45"></div>
                                                </div>
                                                <p className="font-mono text-sm tracking-widest opacity-90">
                                                    •••• •••• •••• {card.lastFourDigits || '0000'}
                                                </p>
                                                <div className="flex justify-between items-end mt-2">
                                                    <p className="text-[10px] opacity-70 uppercase tracking-widest">RICARDO SILVA</p>
                                                    {card.network === 'VISA' && <span className="font-bold italic text-lg">VISA</span>}
                                                    {card.network === 'MASTERCARD' && <div className="flex -space-x-1.5"><div className="w-4 h-4 rounded-full bg-red-500/90"></div><div className="w-4 h-4 rounded-full bg-yellow-500/90"></div></div>}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Card Details */}
                                        <div className="flex-1 p-6 flex flex-col justify-center">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h4 className="font-bold text-gray-900 dark:text-white text-lg">{card.name}</h4>
                                                    <p className="text-xs text-gray-400">Conta Corrente Final 4022</p>
                                                </div>
                                                <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded border border-emerald-500/20 uppercase">Ativo</span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-8 mb-4">
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1">Fatura Atual</p>
                                                    <p className="text-xl font-black text-gray-900 dark:text-white">{formatCurrency(Math.abs(card.balance))}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1">Limite Disponível</p>
                                                    <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(available)}</p>
                                                </div>
                                            </div>

                                            <div className="mb-6">
                                                <div className="flex justify-between text-xs mb-1.5">
                                                    <span className="text-gray-500">Usado: {Math.round(percent)}%</span>
                                                    <span className="text-gray-400">Limite: {formatCurrency(limit)}</span>
                                                </div>
                                                <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                                                    <div className="bg-accent h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min(percent, 100)}%` }}></div>
                                                </div>
                                            </div>

                                            <div className="flex gap-3">
                                                <button onClick={() => handleEditClick(card)} className="flex-1 py-2.5 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 font-bold text-sm rounded-xl hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
                                                    Detalhes
                                                </button>
                                                <button onClick={() => openPaymentModal(card)} className="flex-1 py-2.5 bg-[#0f172a] dark:bg-accent text-white font-bold text-sm rounded-xl hover:opacity-90 transition-colors">
                                                    Pagar Fatura
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Right Column: Summaries */}
                    <div className="space-y-6">

                        {/* Category Summary */}
                        <div className="bg-white dark:bg-[#0f172a] p-6 rounded-3xl border border-gray-100 dark:border-gray-800">
                            <h4 className="font-bold text-gray-900 dark:text-white mb-6">Resumo Mensal</h4>
                            <div className="space-y-6">
                                {cardCategoryData.length === 0 ? <p className="text-sm text-gray-400 italic">Sem gastos este mês.</p> : cardCategoryData.map((data, idx) => (
                                    <div key={idx} className="flex items-center justify-between group">
                                        <div className="flex items-center space-x-3">
                                            <div className="p-2 rounded-lg bg-gray-50 dark:bg-white/5 text-gray-500 group-hover:text-white group-hover:bg-accent transition-colors">
                                                <CategoryIcon iconName={data.icon} size={18} />
                                            </div>
                                            <span className="font-bold text-sm text-gray-700 dark:text-gray-300">{data.name}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="font-bold text-sm text-gray-900 dark:text-white block">{formatCurrency(data.value)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Transactions */}
                        <div className="bg-white dark:bg-[#0f172a] p-6 rounded-3xl border border-gray-100 dark:border-gray-800">
                            <div className="flex justify-between items-center mb-6">
                                <h4 className="font-bold text-gray-900 dark:text-white">Últimas Compras</h4>
                                <button className="text-xs font-bold text-accent">Ver extrato</button>
                            </div>
                            <div className="space-y-5">
                                {recentCardTx.length === 0 ? <p className="text-sm text-gray-400 italic">Sem compras recentes.</p> : recentCardTx.map(tx => {
                                    const cat = categories.find(c => c.id === tx.categoryId);
                                    const cardName = accounts.find(a => a.id === tx.accountId)?.name || 'Cartão';
                                    return (
                                        <div key={tx.id} className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="p-2.5 rounded-full bg-gray-100 dark:bg-white/5">
                                                    <ShoppingBag size={16} className="text-gray-500 dark:text-gray-400" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm text-gray-900 dark:text-white truncate max-w-[120px]">{tx.description}</p>
                                                    <div className="flex items-center text-[10px] text-gray-400">
                                                        <span>{formatDate(tx.date).slice(0, 5)}</span>
                                                        <span className="mx-1">•</span>
                                                        <span className="truncate max-w-[80px]">{cardName}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="font-bold text-sm text-gray-900 dark:text-white">
                                                {formatCurrency(Math.abs(tx.value))}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* --- OTHER ACCOUNTS SECTION --- */}
            <div className="pt-8 border-t border-gray-200 dark:border-gray-800">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                        <Building className="mr-2 text-gray-400" size={24} />
                        Outras Contas Bancárias
                    </h2>
                    <button onClick={() => { resetForm(); setNewAccType('CHECKING'); setShowForm(true); }} className="text-accent text-sm font-bold hover:underline">+ Adicionar Conta</button>
                </div>

                {otherAccounts.length === 0 ? (
                    <div className="bg-gray-50 dark:bg-[#0f172a] rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 p-8 text-center">
                        <p className="text-gray-500 text-sm">Nenhuma conta corrente ou investimento cadastrado.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {otherAccounts.map(account => (
                            <div key={account.id} className="bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-colors group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 border border-gray-100 dark:border-gray-700 rounded-lg bg-white">
                                            <BankLogo name={account.name} type={account.type} size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 dark:text-white text-sm">{account.name}</h4>
                                            <p className="text-[10px] text-gray-500 uppercase">{getLabel(account.type)}</p>
                                        </div>
                                    </div>
                                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleEditClick(account)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-gray-400"><Edit2 size={14} /></button>
                                        <button onClick={() => handleDelete(account.id, account.name)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-400"><Trash2 size={14} /></button>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 mb-1">Saldo Atual</p>
                                    <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(account.balance)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Payment Modal Reuse */}
            {isPaymentModalOpen && viewingAccount && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#1e293b] rounded-2xl w-full max-w-sm shadow-2xl p-6 animate-slide-up border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Pagar Fatura</h3>
                        <p className="text-sm text-gray-500 mb-6">{viewingAccount.name}</p>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Valor do Pagamento</label>
                                <input type="number" step="0.01" value={paymentAmount} onChange={(e) => setPaymentAmount(parseFloat(e.target.value))} className="w-full p-3 bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-gray-600 rounded-xl font-bold text-gray-900 dark:text-white outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Pagar com</label>
                                <select value={paymentSourceId} onChange={(e) => setPaymentSourceId(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-gray-600 rounded-xl text-sm outline-none text-gray-900 dark:text-white">
                                    <option value="" disabled>Selecione uma conta</option>
                                    {accounts.filter(a => a.type === 'CHECKING' || a.type === 'CASH').map(acc => (
                                        <option key={acc.id} value={acc.id}>{acc.name} ({formatCurrency(acc.balance)})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button onClick={() => setIsPaymentModalOpen(false)} className="flex-1 py-3 text-gray-500 font-bold text-sm hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl">Cancelar</button>
                                <button onClick={handlePayInvoice} disabled={!paymentSourceId || paymentAmount <= 0} className="flex-1 py-3 bg-emerald-500 text-white font-bold text-sm rounded-xl hover:bg-emerald-600 shadow-lg shadow-emerald-200/20 disabled:opacity-50">Confirmar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Helper for missing icons */}
            <div className="hidden">
                <Users /> <Heart /> <Wifi />
            </div>
        </div>
    );
};

export default Accounts;
