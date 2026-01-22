
import React, { useState, useEffect, useRef } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Transaction, TransactionType, CategoryGroup, Category } from '../types';
import { ChevronLeft, ChevronDown, Search, Check, X, CalendarClock, RefreshCw, Sparkles, Plus, Palette, Repeat, CreditCard, CalendarRange, CheckCircle } from 'lucide-react';
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
    const { accounts, categories, transactions, addTransaction, addManyTransactions, updateTransaction, addCategory } = useFinance() as any;

    const [description, setDescription] = useState('');
    const [value, setValue] = useState('');
    const [type, setType] = useState<TransactionType>('EXPENSE');
    const [categoryId, setCategoryId] = useState('');
    const [accountId, setAccountId] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [spender, setSpender] = useState<string>('ME');
    const [paid, setPaid] = useState(true);

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
                    paid
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
                        paid
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
                        paid
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
                paid
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
        <div className="bg-white w-full p-6 relative rounded-2xl">
            <div className="flex items-center mb-6">
                <button onClick={onClose} className="mr-4 p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"><ChevronLeft size={24} /></button>
                <h2 className="text-2xl font-bold text-gray-800">{initialData ? 'Editar Transação' : 'Nova Transação'}</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex bg-gray-100 p-1 rounded-xl">
                    <button type="button" className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${type === 'EXPENSE' ? 'bg-white text-danger shadow-sm' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setType('EXPENSE')}>Saída</button>
                    <button type="button" className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${type === 'INCOME' ? 'bg-white text-success shadow-sm' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setType('INCOME')}>Entrada</button>
                </div>

                <div className="flex items-center space-x-2">
                    <button
                        type="button"
                        onClick={() => setPaid(!paid)}
                        className={`flex-1 p-3 rounded-xl border-2 flex items-center justify-center font-bold text-sm transition-all ${paid ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-gray-200 text-gray-400'}`}
                    >
                        <CheckCircle size={20} className={`mr-2 ${paid ? 'fill-current' : ''}`} />
                        {paid ? 'Pago / Recebido' : 'Pendente / Agendado'}
                    </button>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Valor {recurrence === 'INSTALLMENT' ? 'TOTAL' : ''}</label>
                    <div className="relative border-b-2 border-gray-100 focus-within:border-primary transition-colors pb-2">
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-400">R$</span>
                        <input type="number" step="0.01" required value={value} onChange={(e) => setValue(e.target.value)} placeholder="0,00" className={`w-full pl-10 text-4xl font-bold bg-transparent outline-none transition-colors ${type === 'INCOME' ? 'text-success' : 'text-danger'}`} />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                    <input type="text" required value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none" placeholder="Ex: iFood, Uber, Aluguel" />
                </div>

                <div className="relative" ref={categoryDropdownRef}>
                    <div className="flex justify-between items-end mb-1">
                        <label className="block text-sm font-medium text-gray-700">Categoria</label>
                        {wasCategoryAutoSelected && !userManuallyChangedCategory && (
                            <div className="flex items-center text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-full animate-pulse"><Sparkles size={10} className="mr-1" /> Auto-detectada</div>
                        )}
                    </div>

                    <button type="button" onClick={() => setIsCategoryOpen(!isCategoryOpen)} className={`w-full p-4 bg-gray-50 border rounded-xl flex items-center justify-between hover:bg-gray-100 ${wasCategoryAutoSelected && !userManuallyChangedCategory ? 'border-blue-300 ring-2 ring-blue-50' : 'border-gray-200'}`}>
                        <div className="flex items-center">
                            {selectedCategory ? (
                                <><div className="mr-3"><CategoryIcon iconName={selectedCategory.icon} color={selectedCategory.color} /></div><span className="text-gray-800 font-medium">{selectedCategory.name}</span></>
                            ) : <span className="text-gray-400">Selecione uma categoria</span>}
                        </div>
                        <ChevronDown size={20} className={`text-gray-400 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isCategoryOpen && (
                        <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-fade-in origin-top">
                            <div className="p-3 border-b border-gray-100 bg-gray-50 flex flex-col space-y-2">
                                <div className="relative">
                                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input type="text" placeholder="Buscar categoria..." className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-lg outline-none" value={categorySearch} onChange={(e) => setCategorySearch(e.target.value)} />
                                </div>
                                <button type="button" onClick={() => setIsCreatingCategory(true)} className="flex items-center justify-center p-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors"><Plus size={14} className="mr-2" /> Criar Nova Categoria</button>
                            </div>
                            <div className="max-h-60 overflow-y-auto no-scrollbar">
                                {['FIXED', 'VARIABLE', 'INVESTMENT', 'INCOME'].map(group => {
                                    const items = groupedFilteredCategories[group as CategoryGroup];
                                    if (!items || items.length === 0) return null;
                                    return (
                                        <div key={group}>
                                            <div className="px-4 py-2 bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{groupLabels[group as CategoryGroup]}</div>
                                            {items.map((cat: any) => (
                                                <button key={cat.id} type="button" onClick={() => { setCategoryId(cat.id); setIsCategoryOpen(false); setUserManuallyChangedCategory(true); }} className={`w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 ${categoryId === cat.id ? 'bg-blue-50/50' : ''}`}>
                                                    <div className="flex items-center"><div className="mr-3"><CategoryIcon iconName={cat.icon} color={cat.color} size={18} /></div><span className={`text-sm ${categoryId === cat.id ? 'font-bold text-primary' : 'text-gray-700'}`}>{cat.name}</span></div>
                                                    {categoryId === cat.id && <Check size={16} className="text-primary" />}
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Conta / Cartão</label>
                        <div className={`relative transition-all border rounded-xl overflow-hidden ${isCreditCardExpense ? 'border-primary/50 ring-2 ring-primary/5 shadow-sm bg-blue-50/30' : 'border-gray-200 bg-gray-50'}`}>
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                {isCreditCardExpense ? <CreditCard size={18} className="text-primary" /> : <Plus size={18} className="text-gray-400 rotate-45" />}
                            </div>
                            <select
                                value={accountId}
                                onChange={(e) => setAccountId(e.target.value)}
                                className="w-full pl-11 pr-4 py-4 bg-transparent outline-none appearance-none cursor-pointer text-sm font-medium text-gray-800"
                            >
                                {accounts.map((acc: any) => (
                                    <option key={acc.id} value={acc.id}>
                                        {acc.type === 'CREDIT_CARD' ? '💳 ' : '🏦 '}
                                        {acc.name}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                <ChevronDown size={18} />
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Data da Compra</label>
                        <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm font-medium text-gray-800" />
                    </div>
                </div>

                {/* Seletor de Quem Gastou (Dinâmico) */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quem gastou?</label>
                    <div className="flex flex-wrap gap-3">
                        {/* ME */}
                        <button
                            type="button"
                            onClick={() => setSpender('ME')}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-full border-2 transition-all ${spender === 'ME' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-transparent bg-gray-100 text-gray-500'}`}
                        >
                            <div className="w-6 h-6 rounded-full bg-indigo-200 overflow-hidden">
                                {useFinance().userProfile.avatar ? <img src={useFinance().userProfile.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs font-bold text-indigo-600">EU</div>}
                            </div>
                            <span className="text-xs font-bold">Eu</span>
                        </button>

                        {/* SPOUSE */}
                        {useFinance().userProfile.hasSpouse && (
                            <button
                                type="button"
                                onClick={() => setSpender('SPOUSE')}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-full border-2 transition-all ${spender === 'SPOUSE' ? 'border-pink-500 bg-pink-50 text-pink-700' : 'border-transparent bg-gray-100 text-gray-500'}`}
                            >
                                <div className="w-6 h-6 rounded-full bg-pink-200 overflow-hidden">
                                    {useFinance().userProfile.spouseAvatar ? <img src={useFinance().userProfile.spouseAvatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs font-bold text-pink-600">C</div>}
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
                                className={`flex items-center space-x-2 px-4 py-2 rounded-full border-2 transition-all ${spender === child.id ? 'border-blue-400 bg-blue-50 text-blue-600' : 'border-transparent bg-gray-100 text-gray-500'}`}
                            >
                                <div className="w-6 h-6 rounded-full bg-blue-200 overflow-hidden">
                                    {child.avatar ? <img src={child.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs font-bold text-blue-600">{child.name[0]}</div>}
                                </div>
                                <span className="text-xs font-bold">{child.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* SEÇÃO ESPECÍFICA DE CARTÃO DE CRÉDITO */}
                {isCreditCardExpense && (
                    <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 space-y-3 animate-fade-in">
                        <div className="flex items-center space-x-2 text-gray-700 font-medium">
                            <CalendarRange size={18} className="text-primary" />
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
                                        ? 'bg-primary text-white border-primary shadow-md'
                                        : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-100'
                                        }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>

                        <div className="text-xs text-gray-500 flex items-center bg-white p-2 rounded-lg border border-gray-200">
                            <CreditCard size={12} className="mr-1.5" />
                            <span>
                                Cobrando na fatura de <strong className="text-gray-800">{targetMonthName}/{targetYear}</strong>
                                {selectedAccount.closingDay && (
                                    <span className="block text-[10px] text-gray-400 mt-0.5">
                                        Fechamento do cartão dia {selectedAccount.closingDay}
                                    </span>
                                )}
                            </span>
                        </div>
                    </div>
                )}

                <div className={`p-4 rounded-xl border transition-all ${recurrence !== 'NONE' ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center space-x-2 text-gray-700 font-medium mb-3">
                        <Repeat size={18} className={recurrence !== 'NONE' ? 'text-blue-600' : 'text-gray-400'} />
                        <span className="text-sm">Recorrência / Parcelamento</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-4">
                        <button type="button" onClick={() => setRecurrence('NONE')} className={`py-2 text-xs font-bold rounded-lg transition-colors ${recurrence === 'NONE' ? 'bg-gray-800 text-white shadow-md' : 'bg-white border text-gray-500 hover:bg-gray-100'}`}>
                            Único
                        </button>
                        <button type="button" onClick={() => setRecurrence('INSTALLMENT')} className={`py-2 text-xs font-bold rounded-lg transition-colors ${recurrence === 'INSTALLMENT' ? 'bg-blue-600 text-white shadow-md' : 'bg-white border text-gray-500 hover:bg-gray-100'}`}>
                            Parcelado
                        </button>
                        <button type="button" onClick={() => setRecurrence('REPEATED')} className={`py-2 text-xs font-bold rounded-lg transition-colors ${recurrence === 'REPEATED' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white border text-gray-500 hover:bg-gray-100'}`}>
                            Fixo Mensal
                        </button>
                    </div>

                    {recurrence !== 'NONE' && (
                        <div className="animate-fade-in bg-white p-3 rounded-lg border border-blue-100">
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">{recurrence === 'INSTALLMENT' ? 'Número de Parcelas' : 'Repetir por (meses)'}</label>
                                <select value={installments} onChange={(e) => setInstallments(Number(e.target.value))} className="p-1 bg-gray-50 border border-gray-200 rounded text-sm font-bold text-gray-800 outline-none">
                                    {[...Array(11)].map((_, i) => <option key={i} value={i + 2}>{i + 2}x</option>)}
                                    <option value={18}>18x</option>
                                    <option value={24}>24x</option>
                                    <option value={36}>36x</option>
                                    <option value={48}>48x</option>
                                </select>
                            </div>
                            <div className="text-right">
                                {recurrence === 'INSTALLMENT' ? (
                                    <p className="text-xs text-gray-500">
                                        Serão criados <strong className="text-gray-800">{installments}</strong> lançamentos de <strong className="text-blue-600">{formatCurrency(numericValue / installments)}</strong>
                                    </p>
                                ) : (
                                    <p className="text-xs text-gray-500">
                                        Serão criados <strong className="text-gray-800">{installments}</strong> lançamentos de <strong className="text-indigo-600">{formatCurrency(numericValue)}</strong>
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <button type="submit" className={`w-full py-4 text-white font-bold text-lg rounded-xl shadow-lg transition active:scale-95 ${type === 'INCOME' ? 'bg-success hover:bg-green-600' : 'bg-danger hover:bg-red-600'}`}>
                    {initialData ? 'Salvar Alterações' : (type === 'INCOME' ? 'Receber Valor' : 'Pagar Agora')}
                </button>
            </form>

            {/* MODAL PARA NOVA CATEGORIA */}
            {isCreatingCategory && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col animate-slide-up">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-xl font-bold text-gray-900">Nova Categoria</h3>
                            <button onClick={() => setIsCreatingCategory(false)} className="p-2 text-gray-400 hover:text-gray-800 transition-colors"><X size={24} /></button>
                        </div>

                        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh] no-scrollbar">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Nome</label>
                                <input type="text" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder="Ex: Assinaturas, Manutenção..." className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary" />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Divisão Financeira</label>
                                <select value={newCatGroup} onChange={(e) => setNewCatGroup(e.target.value as CategoryGroup)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none appearance-none">
                                    {Object.entries(groupLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Cor de Destaque</label>
                                <div className="flex flex-wrap gap-3">
                                    {COLOR_PALETTE.map(c => (
                                        <button key={c} type="button" onClick={() => setNewCatColor(c)} className={`w-8 h-8 rounded-full border-2 transition-transform active:scale-90 ${newCatColor === c ? 'border-gray-800 scale-110 shadow-md' : 'border-transparent'}`} style={{ backgroundColor: c }}></button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Ícone Representativo</label>
                                <div className="grid grid-cols-5 gap-3 max-h-32 overflow-y-auto p-2 border border-gray-100 rounded-xl">
                                    {AVAILABLE_ICONS.map(icon => (
                                        <button key={icon} type="button" onClick={() => setNewCatIcon(icon)} className={`p-2 rounded-lg flex items-center justify-center transition-all ${newCatIcon === icon ? 'bg-primary text-white shadow-lg' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}>
                                            <CategoryIcon iconName={icon} size={20} color={newCatIcon === icon ? '#fff' : '#9ca3af'} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-gray-50 border-t border-gray-100">
                            <button onClick={handleCreateCategory} disabled={!newCatName} className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-lg hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                                Criar e Selecionar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
