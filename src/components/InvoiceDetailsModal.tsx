import React, { useState, useMemo } from 'react';
import { Account, Transaction } from '../types';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, formatDate, getMonthName } from '../utils';
import { X, ChevronLeft, ChevronRight, Calendar, ShoppingBag, CreditCard } from 'lucide-react';
import { CategoryIcon } from './CategoryIcon';

interface InvoiceDetailsModalProps {
    account: Account;
    isOpen: boolean;
    onClose: () => void;
}

export const InvoiceDetailsModal: React.FC<InvoiceDetailsModalProps> = ({ account, isOpen, onClose }) => {
    const { transactions, categories } = useFinance();
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    if (!isOpen) return null;

    // Navigation
    const changeMonth = (delta: number) => {
        let newMonth = selectedMonth + delta;
        let newYear = selectedYear;
        if (newMonth > 11) { newMonth = 0; newYear++; }
        else if (newMonth < 0) { newMonth = 11; newYear--; }
        setSelectedMonth(newMonth);
        setSelectedYear(newYear);
    };

    // Filter Transactions for this Account & Month
    const invoiceTransactions = useMemo(() => {
        return transactions.filter(t => {
            const d = new Date(t.date);
            const isSameMonth = d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
            const isSameAccount = t.accountId === account.id;
            const isExpense = t.type === 'EXPENSE';
            return isSameMonth && isSameAccount && isExpense;
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [transactions, account.id, selectedMonth, selectedYear]);

    // Calculate Totals
    const totalInvoice = invoiceTransactions.reduce((acc, t) => acc + t.value, 0);

    // Due Date Calculation (Simple logic: Due day of this month) (If passed, maybe next month? keeping simple)
    const dueDate = new Date(selectedYear, selectedMonth, account.dueDay || 10);
    const isPastDue = new Date() > dueDate;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#0f172a] w-full max-w-2xl rounded-3xl border border-gray-800 shadow-2xl flex flex-col max-h-[90vh] animate-slide-up">

                {/* Header */}
                <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#1e293b]/50 rounded-t-3xl">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-8 rounded-md bg-gradient-to-br from-gray-700 to-gray-900 border border-gray-600 flex items-center justify-center shadow-inner relative overflow-hidden">
                            {/* Mini Card Rep */}
                            <div className="absolute w-20 h-2 bg-white/10 rotate-45"></div>
                            <CreditCard size={14} className="text-gray-400 relative z-10" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-lg">{account.name}</h3>
                            <p className="text-xs text-gray-400 uppercase tracking-widest">Fatura do Cartão</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                {/* Month Navigator & Summary */}
                <div className="p-6 bg-gradient-to-b from-[#1e293b]/30 to-transparent">
                    <div className="flex items-center justify-between mb-8 text-white">
                        <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-white/10 rounded-full"><ChevronLeft size={24} /></button>
                        <div className="text-center">
                            <h2 className="text-xl font-bold capitalize">{getMonthName(selectedMonth)} <span className="text-gray-500 font-normal">{selectedYear}</span></h2>
                            <p className={`text-xs font-bold mt-1 ${isPastDue ? 'text-red-400' : 'text-emerald-400'}`}>
                                Vencimento dia {account.dueDay || 10}/{selectedMonth + 1 < 10 ? `0${selectedMonth + 1}` : selectedMonth + 1}
                            </p>
                        </div>
                        <button onClick={() => changeMonth(1)} className="p-2 hover:bg-white/10 rounded-full"><ChevronRight size={24} /></button>
                    </div>

                    <div className="flex flex-col items-center justify-center mb-2">
                        <span className="text-sm text-gray-400 font-medium mb-1">Valor da Fatura</span>
                        <h1 className="text-4xl font-black text-white">{formatCurrency(totalInvoice)}</h1>
                    </div>
                </div>

                {/* Transactions List */}
                <div className="flex-1 overflow-y-auto p-2 md:p-6 space-y-3 min-h-[300px]">
                    {invoiceTransactions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-4 opacity-50">
                            <ShoppingBag size={48} strokeWidth={1} />
                            <p>Nenhuma compra neste mês.</p>
                        </div>
                    ) : (
                        invoiceTransactions.map(tx => {
                            const cat = categories.find(c => c.id === tx.categoryId);
                            return (
                                <div key={tx.id} className="flex items-center justify-between p-4 rounded-2xl bg-[#1e293b]/40 hover:bg-[#1e293b] border border-transparent hover:border-gray-700 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-[#0f172a] flex items-center justify-center text-gray-400 border border-gray-800 group-hover:border-gray-600 transition-colors">
                                            <CategoryIcon iconName={cat?.icon} size={18} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white text-sm">{tx.description}</h4>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <span>{formatDate(tx.date)}</span>
                                                <span>•</span>
                                                <span className="text-gray-400">{cat?.name}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-bold text-white block">{formatCurrency(tx.value)}</span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-gray-800 bg-[#0f172a] rounded-b-3xl">
                    {/* Placeholder for action, maybe "Pay Invoice" later if needed here, currently just Close */}
                    <button onClick={onClose} className="w-full py-3 bg-[#1e293b] hover:bg-[#334155] text-white font-bold rounded-xl transition-colors">
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};
