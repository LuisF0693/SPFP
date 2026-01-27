
import React, { useState, useEffect, useRef } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Transaction, TransactionType, CategoryGroup, Category, TransactionGroupType } from '../types';
import { generateId } from '../utils';
import { ChevronLeft, ChevronDown, Search, Check, X, CalendarClock, RefreshCw, Sparkles, Plus, Palette, Repeat, CreditCard, CalendarRange, CheckCircle, AlertTriangle } from 'lucide-react';
import { CategoryIcon, AVAILABLE_ICONS } from './CategoryIcon';
import { formatCurrency, getMonthName } from '../utils';

interface TransactionFormProps {
    onClose: () => void;
    initialData?: Transaction | null;
}

const COLOR_PALETTE = [
    '#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6',
    '#ec4899', '#06b6d4', '#f97316', '#64748b', '#000000'
];

type RecurrenceType = 'NONE' | 'INSTALLMENT' | 'REPEATED';

/**
 * Transaction Form component.
 * Provides a form to create or edit financial transactions, including support for 
 * expense/income types, categories, accounts, and recurrence logic.
 */
export const TransactionForm: React.FC<TransactionFormProps> = ({ onClose, initialData }) => {
    const { accounts, categories, transactions, addTransaction, addManyTransactions, updateTransaction, addCategory } = useFinance();

    const [description, setDescription] = useState('');
    const [value, setValue] = useState('');
    const [type, setType] = useState<TransactionType>('EXPENSE');
    const [categoryId, setCategoryId] = useState('');
    const [accountId, setAccountId] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [spender, setSpender] = useState<string>('ME');
    const [paid, setPaid] = useState(true);
    const [sentiment, setSentiment] = useState<string | undefined>(undefined);
    const [showImpulseAlert, setShowImpulseAlert] = useState(false);

    // Update paid default based on date
    useEffect(() => {
        if (!initialData) {
            const today = new Date().toISOString().split('T')[0];
            setPaid(date <= today);
        }
    }, [date, initialData]);

    const [wasCategoryAutoSelected, setWasCategoryAutoSelected] = useState(false);
    const [userManuallyChangedCategory, setUserManuallyChangedCategory] = useState(false);

    // Estados de Recorrência
    const [recurrence, setRecurrence] = useState<RecurrenceType>('NONE');
    const [installments, setInstallments] = useState(2);

    // Estados de Fatura de Cartão de Crédito
    const [invoiceOffset, setInvoiceOffset] = useState(0); // 0 = Mês atual, 1 = Mês seguinte, 2 = 2 meses

    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [categorySearch, setCategorySearch] = useState('');
    const categoryDropdownRef = useRef<HTMLDivElement>(null);

    // Estados para Criar Nova Categoria
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);
    const [newCatName, setNewCatName] = useState('');
    const [newCatGroup, setNewCatGroup] = useState<CategoryGroup>('VARIABLE');
    const [newCatColor, setNewCatColor] = useState(COLOR_PALETTE[0]);
    const [newCatIcon, setNewCatIcon] = useState('default');

    const selectedAccount = accounts.find((a: any) => a.id === accountId);
    const isCreditCardExpense = selectedAccount?.type === 'CREDIT_CARD' && type === 'EXPENSE';

    useEffect(() => {
        if (initialData) {
            setDescription(initialData.description);
            setValue(initialData.value.toString());
            setType(initialData.type);
            setCategoryId(initialData.categoryId);
            setAccountId(initialData.accountId);
            setUserManuallyChangedCategory(true);
            if (initialData.date) setDate(initialData.date.split('T')[0]);
            if (initialData.spender) setSpender(initialData.spender);
            setPaid(initialData.paid ?? true);
            setSentiment(initialData.sentiment);
        } else {
            if (categories.length > 0) setCategoryId(categories[0].id);
            if (accounts.length > 0) setAccountId(accounts[0].id);
        }
    }, [initialData, categories, accounts]);

    // Efeito para detectar automaticamente se a compra cai na fatura seguinte
    useEffect(() => {
        if (isCreditCardExpense && selectedAccount?.closingDay && date) {
            const purchaseDay = parseInt(date.split('-')[2]);
            if (purchaseDay >= selectedAccount.closingDay) {
                setInvoiceOffset(1); // Virou a fatura
            } else {
                setInvoiceOffset(0);
            }
        } else {
            setInvoiceOffset(0);
        }
    }, [date, accountId, isCreditCardExpense, selectedAccount]);

    useEffect(() => {
        if (!initialData && !userManuallyChangedCategory && description.length >= 3) {
            const cleanDesc = description.toLowerCase().trim();
            const match = transactions.find((t: any) =>
                t.description.toLowerCase().trim() === cleanDesc ||
                t.description.toLowerCase().includes(cleanDesc) ||
                cleanDesc.includes(t.description.toLowerCase().trim())
            );
            if (match && match.categoryId !== categoryId) {
                setCategoryId(match.categoryId);
                setWasCategoryAutoSelected(true);
            }
        }
        if (description.length < 3) setWasCategoryAutoSelected(false);
    }, [description, transactions, initialData, userManuallyChangedCategory, categoryId]);

    // Impulsivity Alert Logic
    useEffect(() => {
        if (!value || parseFloat(value) <= 0 || !categoryId) {
            setShowImpulseAlert(false);
            return;
        }

        const numericValue = parseFloat(value);
        const categoryTransactions = transactions.filter((t: any) => t.categoryId === categoryId && t.type === 'EXPENSE');

        if (categoryTransactions.length >= 3) {
            const sum = categoryTransactions.reduce((acc: number, t: any) => acc + t.value, 0);
            const avg = sum / categoryTransactions.length;
            if (numericValue > avg * 1.5) {
                setShowImpulseAlert(true);
            } else {
                setShowImpulseAlert(false);
            }
        } else if (numericValue > 500) {
            // Threshold for new categories or little data
            setShowImpulseAlert(true);
        } else {
            setShowImpulseAlert(false);
        }
    }, [value, categoryId, transactions]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
                setIsCategoryOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleCreateCategory = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!newCatName) return;
        const newId = addCategory({
            name: newCatName,
            group: newCatGroup,
            color: newCatColor,
            icon: newCatIcon
        });
        setCategoryId(newId);
        setIsCreatingCategory(false);
        setIsCategoryOpen(false);
        setNewCatName('');
        setUserManuallyChangedCategory(true);
        setWasCategoryAutoSelected(false);
    };

    const getTargetDate = (baseDateStr: string, offset: number) => {
        const d = new Date(baseDateStr + 'T12:00:00');
        d.setMonth(d.getMonth() + offset);
        return d;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!description || !value || !accountId || !categoryId) return;

        const rawValue = parseFloat(value);
        const baseDate = getTargetDate(date, isCreditCardExpense ? invoiceOffset : 0);
        const baseDateStr = baseDate.toISOString().split('T')[0];

        // Lógica para Recorrência (Parcelado ou Fixo)
        if (recurrence !== 'NONE' && installments > 1) {
            const [year, month, day] = baseDateStr.split('-').map(Number);
            const monthlyValue = recurrence === 'INSTALLMENT' ? rawValue / installments : rawValue;

            // Gerar groupId único para vincular todas as parcelas
            const groupId = generateId();
            const groupType: TransactionGroupType = recurrence === 'INSTALLMENT' ? 'INSTALLMENT' : 'RECURRING';

            // Se for Parcelado e estamos editando, a primeira parcela substitui o gasto atual
            if (initialData) {
                const firstInstallmentDesc = recurrence === 'INSTALLMENT' ? `${description} (1/${installments})` : description;
                updateTransaction({
                    id: initialData.id,
                    description: firstInstallmentDesc,
                    value: monthlyValue,
                    type,
                    categoryId,
                    accountId,
                    date: baseDate.toISOString(),
                    spender,
                    paid,
                    sentiment,
                    groupId,
                    groupType,
                    groupIndex: 1,
                    groupTotal: recurrence === 'INSTALLMENT' ? installments : undefined
                });

                // Cria as demais parcelas (da 2 em diante)
                const extraTransactions = [];
                for (let i = 1; i < installments; i++) {
                    const txDate = new Date(year, month - 1 + i, day, 12, 0, 0);
                    let descSuffix = '';
                    if (recurrence === 'INSTALLMENT') descSuffix = ` (${i + 1}/${installments})`;

                    extraTransactions.push({
                        description: `${description}${descSuffix}`,
                        value: monthlyValue,
                        type,
                        categoryId,
                        accountId,
                        date: txDate.toISOString(),
                        spender,
                        paid,
                        sentiment,
                        groupId,
                        groupType,
                        groupIndex: i + 1,
                        groupTotal: recurrence === 'INSTALLMENT' ? installments : undefined
                    });
                }
                addManyTransactions(extraTransactions);
            } else {
                // Modo criação (comportamento que já existia)
                const newTransactions = [];
                for (let i = 0; i < installments; i++) {
                    const txDate = new Date(year, month - 1 + i, day, 12, 0, 0);
                    let descSuffix = '';
                    if (recurrence === 'INSTALLMENT') descSuffix = ` (${i + 1}/${installments})`;

                    newTransactions.push({
                        description: `${description}${descSuffix}`,
                        value: monthlyValue,
                        type,
                        categoryId,
                        accountId,
                        date: txDate.toISOString(),
                        spender,
                        paid,
                        sentiment,
                        groupId,
                        groupType,
                        groupIndex: i + 1,
                        groupTotal: recurrence === 'INSTALLMENT' ? installments : undefined
                    });
                }
                addManyTransactions(newTransactions);
            }
        } else {
            // Caso de transação única
            const payload = {
                description,
                value: rawValue,
                type,
                categoryId,
                accountId,
                date: baseDate.toISOString(),
                spender,
                paid,
                sentiment
            };
            if (initialData) updateTransaction({ ...payload, id: initialData.id });
            else addTransaction(payload);
        }
        onClose();
    };

    const groupLabels: Record<CategoryGroup, string> = { 'FIXED': 'Gastos Fixos', 'VARIABLE': 'Gastos Variáveis', 'INVESTMENT': 'Investimentos', 'INCOME': 'Renda' };
    const filteredCategories = categories.filter((c: any) => c.name.toLowerCase().includes(categorySearch.toLowerCase()));
    const groupedFilteredCategories = filteredCategories.reduce((acc: any, cat: any) => {
        const group = cat.group || 'VARIABLE';
        if (!acc[group]) acc[group] = [];
        acc[group].push(cat);
        return acc;
    }, {} as Record<CategoryGroup, Category[]>);

    const selectedCategory = categories.find((c: any) => c.id === categoryId);
    const numericValue = value ? parseFloat(value) : 0;

    // Texto auxiliar para mostrar onde a fatura vai cair
    const targetInvoiceDate = getTargetDate(date, invoiceOffset);
    const targetMonthName = getMonthName(targetInvoiceDate.getMonth());
    const targetYear = targetInvoiceDate.getFullYear();

    return (
        <div className="glass w-full p-6 relative rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-700/50">
            <div className="flex items-center mb-6">
                <button onClick={onClose} className="mr-4 p-2 -ml-2 text-slate-400 hover:bg-slate-700/50 hover:text-slate-200 rounded-full transition-colors"><ChevronLeft size={24} /></button>
                <h2 className="text-2xl font-bold text-slate-100">{initialData ? 'Editar Transação' : 'Nova Transação'}</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex bg-slate-800/60 p-1 rounded-xl border border-slate-700/50">
                    <button type="button" className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${type === 'EXPENSE' ? 'bg-gradient-to-r from-rose-500/20 to-rose-600/20 text-rose-400 shadow-lg shadow-rose-500/10 border border-rose-500/30' : 'text-slate-400 hover:text-slate-200'}`} onClick={() => setType('EXPENSE')}>Saída</button>
                    <button type="button" className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${type === 'INCOME' ? 'bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 text-emerald-400 shadow-lg shadow-emerald-500/10 border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200'}`} onClick={() => setType('INCOME')}>Entrada</button>
                </div>

                <div className="flex items-center space-x-2">
                    <button
                        type="button"
                        onClick={() => setPaid(!paid)}
                        className={`flex-1 p-3 rounded-xl border-2 flex items-center justify-center font-bold text-sm transition-all ${paid ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400' : 'border-slate-600 bg-slate-800/50 text-slate-400'}`}
                    >
                        <CheckCircle size={20} className={`mr-2 ${paid ? 'fill-current' : ''}`} />
                        {paid ? 'Pago / Recebido' : 'Pendente / Agendado'}
                    </button>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Valor {recurrence === 'INSTALLMENT' ? 'TOTAL' : ''}</label>
                    <div className="relative border-b-2 border-slate-700 focus-within:border-blue-500 transition-colors pb-2">
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-500">R$</span>
                        <input type="number" step="0.01" required value={value} onChange={(e) => setValue(e.target.value)} placeholder="0,00" className={`w-full pl-10 text-4xl font-bold bg-transparent outline-none transition-colors ${type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'}`} />
                    </div>
                    {showImpulseAlert && type === 'EXPENSE' && (
                        <div className="mt-2 flex items-center text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 p-2 rounded-lg animate-bounce">
                            <AlertTriangle size={14} className="mr-2" />
                            Atenção: Este gasto está acima do seu padrão para esta categoria!
                        </div>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Descrição</label>
                    <input type="text" required value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-4 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 outline-none text-slate-100 placeholder-slate-500" placeholder="Ex: iFood, Uber, Aluguel" />
                </div>

                <div className="relative" ref={categoryDropdownRef}>
                    <div className="flex justify-between items-end mb-1">
                        <label className="block text-sm font-medium text-slate-300">Categoria</label>
                        {wasCategoryAutoSelected && !userManuallyChangedCategory && (
                            <div className="flex items-center text-[10px] text-blue-400 font-bold bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full animate-pulse"><Sparkles size={10} className="mr-1" /> Auto-detectada</div>
                        )}
                    </div>

                    <button type="button" onClick={() => setIsCategoryOpen(!isCategoryOpen)} className={`w-full p-4 bg-slate-800/50 border rounded-xl flex items-center justify-between hover:bg-slate-700/50 transition-colors ${wasCategoryAutoSelected && !userManuallyChangedCategory ? 'border-blue-500/50 ring-2 ring-blue-500/10' : 'border-slate-700'}`}>
                        <div className="flex items-center">
                            {selectedCategory ? (
                                <><div className="mr-3"><CategoryIcon iconName={selectedCategory.icon} color={selectedCategory.color} /></div><span className="text-slate-100 font-medium">{selectedCategory.name}</span></>
                            ) : <span className="text-slate-500">Selecione uma categoria</span>}
                        </div>
                        <ChevronDown size={20} className={`text-slate-500 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isCategoryOpen && (
                        <div className="absolute z-50 w-full mt-2 bg-slate-800/95 backdrop-blur-xl rounded-xl shadow-2xl border border-slate-700/50 overflow-hidden animate-fade-in origin-top">
                            <div className="p-3 border-b border-slate-700/50 bg-slate-900/50 flex flex-col space-y-2">
                                <div className="relative">
                                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input type="text" placeholder="Buscar categoria..." className="w-full pl-9 pr-3 py-2 text-sm bg-slate-800/50 border border-slate-700 rounded-lg outline-none text-slate-100 placeholder-slate-500 focus:border-blue-500/50" value={categorySearch} onChange={(e) => setCategorySearch(e.target.value)} />
                                </div>
                                <button type="button" onClick={() => setIsCreatingCategory(true)} className="flex items-center justify-center p-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-500 transition-colors"><Plus size={14} className="mr-2" /> Criar Nova Categoria</button>
                            </div>
                            <div className="max-h-60 overflow-y-auto no-scrollbar">
                                {['FIXED', 'VARIABLE', 'INVESTMENT', 'INCOME'].map(group => {
                                    const items = groupedFilteredCategories[group as CategoryGroup];
                                    if (!items || items.length === 0) return null;
                                    return (
                                        <div key={group}>
                                            <div className="px-4 py-2 bg-slate-900/50 text-[10px] font-bold text-slate-500 uppercase tracking-widest">{groupLabels[group as CategoryGroup]}</div>
                                            {items.map((cat: any) => (
                                                <button key={cat.id} type="button" onClick={() => { setCategoryId(cat.id); setIsCategoryOpen(false); setUserManuallyChangedCategory(true); }} className={`w-full px-4 py-3 flex items-center justify-between hover:bg-slate-700/50 transition-colors ${categoryId === cat.id ? 'bg-blue-500/10' : ''}`}>
                                                    <div className="flex items-center"><div className="mr-3"><CategoryIcon iconName={cat.icon} color={cat.color} size={18} /></div><span className={`text-sm ${categoryId === cat.id ? 'font-bold text-blue-400' : 'text-slate-300'}`}>{cat.name}</span></div>
                                                    {categoryId === cat.id && <Check size={16} className="text-blue-400" />}
                                                </button>
                                            ))}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Conta / Cartão</label>
                        <div className={`relative transition-all border rounded-xl overflow-hidden ${isCreditCardExpense ? 'border-blue-500/50 ring-2 ring-blue-500/10 bg-blue-500/5' : 'border-slate-700 bg-slate-800/50'}`}>
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                {isCreditCardExpense ? <CreditCard size={18} className="text-blue-400" /> : <Plus size={18} className="text-slate-500 rotate-45" />}
                            </div>
                            <select
                                value={accountId}
                                onChange={(e) => setAccountId(e.target.value)}
                                className="w-full pl-11 pr-4 py-4 bg-transparent outline-none appearance-none cursor-pointer text-sm font-medium text-slate-100"
                            >
                                {accounts.map((acc: any) => (
                                    <option key={acc.id} value={acc.id} className="bg-slate-800 text-slate-100">
                                        {acc.type === 'CREDIT_CARD' ? '💳 ' : '🏦 '}
                                        {acc.name}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                <ChevronDown size={18} />
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Data da Compra</label>
                        <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-4 bg-slate-800/50 border border-slate-700 rounded-xl outline-none text-sm font-medium text-slate-100 [color-scheme:dark]" />
                    </div>
                </div>

                {/* Seletor de Quem Gastou (Dinâmico) */}
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Quem gastou?</label>
                    <div className="flex flex-wrap gap-3">
                        {/* ME */}
                        <button
                            type="button"
                            onClick={() => setSpender('ME')}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-full border-2 transition-all ${spender === 'ME' ? 'border-indigo-500/50 bg-indigo-500/10 text-indigo-400' : 'border-transparent bg-slate-800/50 text-slate-400'}`}
                        >
                            <div className="w-6 h-6 rounded-full bg-indigo-500/20 overflow-hidden">
                                {useFinance().userProfile.avatar ? <img src={useFinance().userProfile.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs font-bold text-indigo-400">EU</div>}
                            </div>
                            <span className="text-xs font-bold">Eu</span>
                        </button>

                        {/* SPOUSE */}
                        {useFinance().userProfile.hasSpouse && (
                            <button
                                type="button"
                                onClick={() => setSpender('SPOUSE')}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-full border-2 transition-all ${spender === 'SPOUSE' ? 'border-pink-500/50 bg-pink-500/10 text-pink-400' : 'border-transparent bg-slate-800/50 text-slate-400'}`}
                            >
                                <div className="w-6 h-6 rounded-full bg-pink-500/20 overflow-hidden">
                                    {useFinance().userProfile.spouseAvatar ? <img src={useFinance().userProfile.spouseAvatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs font-bold text-pink-400">C</div>}
                                </div>
                                <span className="text-xs font-bold">{useFinance().userProfile.spouseName || 'Cônjuge'}</span>
                            </button>
                        )}

                        {/* CHILDREN */}
                        {(useFinance().userProfile.children || []).map((child: any) => (
                            <button
                                key={child.id}
                                type="button"
                                onClick={() => setSpender(child.id)}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-full border-2 transition-all ${spender === child.id ? 'border-blue-500/50 bg-blue-500/10 text-blue-400' : 'border-transparent bg-slate-800/50 text-slate-400'}`}
                            >
                                <div className="w-6 h-6 rounded-full bg-blue-500/20 overflow-hidden">
                                    {child.avatar ? <img src={child.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs font-bold text-blue-400">{child.name[0]}</div>}
                                </div>
                                <span className="text-xs font-bold">{child.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Sentiment Selector */}
                {type === 'EXPENSE' && (
                    <div className="animate-fade-in">
                        <label className="block text-sm font-medium text-slate-300 mb-2">Como você se sente com essa compra?</label>
                        <div className="flex bg-slate-800/50 p-2 rounded-2xl border border-slate-700/50 justify-between">
                            {[
                                { emoji: '😊', label: 'Feliz', value: 'happy' },
                                { emoji: '😐', label: 'Neutro', value: 'neutral' },
                                { emoji: '😫', label: 'Estressado', value: 'stressed' },
                                { emoji: '💸', label: 'Impulsivo', value: 'impulsive' },
                                { emoji: '🍕', label: 'Conforto', value: 'comfort' }
                            ].map((s) => (
                                <button
                                    key={s.value}
                                    type="button"
                                    onClick={() => setSentiment(sentiment === s.value ? undefined : s.value)}
                                    className={`flex flex-col items-center p-2 rounded-xl transition-all flex-1 ${sentiment === s.value ? 'bg-slate-700/50 shadow-lg border border-blue-500/30 scale-105' : 'hover:bg-slate-700/30 opacity-50 hover:opacity-100'}`}
                                >
                                    <span className="text-2xl mb-1">{s.emoji}</span>
                                    <span className="text-[10px] font-bold text-slate-400">{s.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* SEÇÃO ESPECÍFICA DE CARTÃO DE CRÉDITO */}
                {isCreditCardExpense && (
                    <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 space-y-3 animate-fade-in">
                        <div className="flex items-center space-x-2 text-slate-200 font-medium">
                            <CalendarRange size={18} className="text-blue-400" />
                            <span className="text-sm">Fatura em</span>
                        </div>

                        <div className="flex space-x-2">
                            {[
                                { label: 'Mês da compra', value: 0 },
                                { label: 'Mês seguinte', value: 1 },
                                { label: '2 meses', value: 2 }
                            ].map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setInvoiceOffset(opt.value)}
                                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors border ${invoiceOffset === opt.value
                                        ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/20'
                                        : 'bg-slate-800/50 text-slate-400 border-slate-700 hover:bg-slate-700/50'
                                        }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>

                        <div className="text-xs text-slate-400 flex items-center bg-slate-800/50 p-2 rounded-lg border border-slate-700/50">
                            <CreditCard size={12} className="mr-1.5" />
                            <span>
                                Cobrando na fatura de <strong className="text-slate-200">{targetMonthName}/{targetYear}</strong>
                                {selectedAccount.closingDay && (
                                    <span className="block text-[10px] text-slate-500 mt-0.5">
                                        Fechamento do cartão dia {selectedAccount.closingDay}
                                    </span>
                                )}
                            </span>
                        </div>
                    </div>
                )}

                <div className={`p-4 rounded-xl border transition-all ${recurrence !== 'NONE' ? 'bg-blue-500/5 border-blue-500/20' : 'bg-slate-800/50 border-slate-700'}`}>
                    <div className="flex items-center space-x-2 text-slate-200 font-medium mb-3">
                        <Repeat size={18} className={recurrence !== 'NONE' ? 'text-blue-400' : 'text-slate-500'} />
                        <span className="text-sm">Recorrência / Parcelamento</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-4">
                        <button type="button" onClick={() => setRecurrence('NONE')} className={`py-2 text-xs font-bold rounded-lg transition-colors ${recurrence === 'NONE' ? 'bg-slate-600 text-white shadow-lg' : 'bg-slate-800/50 border border-slate-700 text-slate-400 hover:bg-slate-700/50'}`}>
                            Único
                        </button>
                        <button type="button" onClick={() => setRecurrence('INSTALLMENT')} className={`py-2 text-xs font-bold rounded-lg transition-colors ${recurrence === 'INSTALLMENT' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-800/50 border border-slate-700 text-slate-400 hover:bg-slate-700/50'}`}>
                            Parcelado
                        </button>
                        <button type="button" onClick={() => setRecurrence('REPEATED')} className={`py-2 text-xs font-bold rounded-lg transition-colors ${recurrence === 'REPEATED' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-800/50 border border-slate-700 text-slate-400 hover:bg-slate-700/50'}`}>
                            Fixo Mensal
                        </button>
                    </div>

                    {recurrence !== 'NONE' && (
                        <div className="animate-fade-in bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-xs font-bold text-slate-400 uppercase">{recurrence === 'INSTALLMENT' ? 'Número de Parcelas' : 'Repetir por (meses)'}</label>
                                <select value={installments} onChange={(e) => setInstallments(Number(e.target.value))} className="p-1 bg-slate-700/50 border border-slate-600 rounded text-sm font-bold text-slate-100 outline-none">
                                    {[...Array(11)].map((_, i) => <option key={i} value={i + 2} className="bg-slate-800">{i + 2}x</option>)}
                                    <option value={18} className="bg-slate-800">18x</option>
                                    <option value={24} className="bg-slate-800">24x</option>
                                    <option value={36} className="bg-slate-800">36x</option>
                                    <option value={48} className="bg-slate-800">48x</option>
                                </select>
                            </div>
                            <div className="text-right">
                                {recurrence === 'INSTALLMENT' ? (
                                    <p className="text-xs text-slate-400">
                                        Serão criados <strong className="text-slate-200">{installments}</strong> lançamentos de <strong className="text-blue-400">{formatCurrency(numericValue / installments)}</strong>
                                    </p>
                                ) : (
                                    <p className="text-xs text-slate-400">
                                        Serão criados <strong className="text-slate-200">{installments}</strong> lançamentos de <strong className="text-indigo-400">{formatCurrency(numericValue)}</strong>
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <button type="submit" className={`w-full py-4 text-white font-bold text-lg rounded-xl shadow-lg transition active:scale-95 ${type === 'INCOME' ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-emerald-500/20' : 'bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 shadow-rose-500/20'}`}>
                    {initialData ? 'Salvar Alterações' : (type === 'INCOME' ? 'Receber Valor' : 'Pagar Agora')}
                </button>
            </form>

            {/* MODAL PARA NOVA CATEGORIA */}
            {isCreatingCategory && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
                    <div className="bg-slate-900/95 backdrop-blur-xl rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col animate-slide-up border border-slate-700/50">
                        <div className="p-6 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/50">
                            <h3 className="text-xl font-bold text-slate-100">Nova Categoria</h3>
                            <button onClick={() => setIsCreatingCategory(false)} className="p-2 text-slate-400 hover:text-slate-200 transition-colors"><X size={24} /></button>
                        </div>

                        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh] no-scrollbar">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Nome</label>
                                <input type="text" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder="Ex: Assinaturas, Manutenção..." className="w-full p-3 bg-slate-800/50 border border-slate-700 rounded-xl outline-none focus:border-blue-500/50 text-slate-100 placeholder-slate-500" />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Divisão Financeira</label>
                                <select value={newCatGroup} onChange={(e) => setNewCatGroup(e.target.value as CategoryGroup)} className="w-full p-3 bg-slate-800/50 border border-slate-700 rounded-xl outline-none appearance-none text-slate-100">
                                    {Object.entries(groupLabels).map(([key, label]) => <option key={key} value={key} className="bg-slate-800">{label}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Cor de Destaque</label>
                                <div className="flex flex-wrap gap-3">
                                    {COLOR_PALETTE.map(c => (
                                        <button key={c} type="button" onClick={() => setNewCatColor(c)} className={`w-8 h-8 rounded-full border-2 transition-transform active:scale-90 ${newCatColor === c ? 'border-white scale-110 shadow-lg' : 'border-transparent'}`} style={{ backgroundColor: c }}></button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Ícone Representativo</label>
                                <div className="grid grid-cols-5 gap-3 max-h-32 overflow-y-auto p-2 border border-slate-700/50 rounded-xl bg-slate-800/30">
                                    {AVAILABLE_ICONS.map(icon => (
                                        <button key={icon} type="button" onClick={() => setNewCatIcon(icon)} className={`p-2 rounded-lg flex items-center justify-center transition-all ${newCatIcon === icon ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'}`}>
                                            <CategoryIcon iconName={icon} size={20} color={newCatIcon === icon ? '#fff' : '#9ca3af'} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-slate-800/50 border-t border-slate-700/50">
                            <button onClick={handleCreateCategory} disabled={!newCatName} className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/20 hover:from-blue-500 hover:to-blue-400 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                                Criar e Selecionar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
