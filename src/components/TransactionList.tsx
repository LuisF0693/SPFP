
import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, formatDate, getMonthName } from '../utils';
import { Trash2, Edit2, Settings as SettingsIcon, Upload, FileText, Sparkles, X, ChevronLeft, Check } from 'lucide-react';
import { Transaction, Category, CategoryGroup } from '../types';
import { CategoryIcon } from './CategoryIcon';
import { ImportExportModal } from './ImportExportModal';

interface TransactionListProps {
    onEdit: (transaction: Transaction) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({ onEdit }) => {
    const { transactions, categories, deleteTransaction, addCategory, updateCategory, deleteCategory } = useFinance();
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    // View State
    const [showCategoryManager, setShowCategoryManager] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    // Category Management State
    const [catName, setCatName] = useState('');
    const [catColor, setCatColor] = useState('#3b82f6');
    const [catGroup, setCatGroup] = useState<CategoryGroup>('VARIABLE');
    const [catIcon, setCatIcon] = useState('default');
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    // --- Transaction Logic ---
    const filteredTransactions = transactions.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });

    const changeMonth = (delta: number) => {
        let newMonth = selectedMonth + delta;
        let newYear = selectedYear;
        if (newMonth > 11) { newMonth = 0; newYear++; }
        else if (newMonth < 0) { newMonth = 11; newYear--; }
        setSelectedMonth(newMonth);
        setSelectedYear(newYear);
    };

    const handleDeleteTransaction = (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir esta transação?')) deleteTransaction(id);
    };

    // ... Category Management Logic ...
    const handleEditCategory = (cat: Category) => {
        setEditingCategory(cat);
        setCatName(cat.name);
        setCatColor(cat.color);
        setCatGroup(cat.group || 'VARIABLE');
        setCatIcon(cat.icon || 'default');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetCategoryForm = () => {
        setEditingCategory(null); setCatName(''); setCatColor('#3b82f6'); setCatGroup('VARIABLE'); setCatIcon('default');
    };

    const handleSubmitCategory = (e: React.FormEvent) => {
        e.preventDefault();
        if (!catName) return;
        if (editingCategory) updateCategory({ id: editingCategory.id, name: catName, color: catColor, group: catGroup, icon: catIcon });
        else addCategory({ name: catName, color: catColor, group: catGroup, icon: catIcon });
        resetCategoryForm();
    };

    // ... Render Helpers ...
    const groupLabels: Record<CategoryGroup, string> = { 'FIXED': 'Gastos Fixos', 'VARIABLE': 'Gastos Variáveis', 'INVESTMENT': 'Investimentos', 'INCOME': 'Renda' };
    const groupedCategories = categories.reduce((acc, cat) => {
        const group = cat.group || 'VARIABLE';
        if (!acc[group]) acc[group] = []; acc[group].push(cat); return acc;
    }, {} as Record<CategoryGroup, Category[]>);

    const groupOrder: CategoryGroup[] = ['FIXED', 'VARIABLE', 'INVESTMENT', 'INCOME'];

    return (
        <div className="p-5 h-full relative">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                    {showCategoryManager && <button onClick={() => setShowCategoryManager(false)} className="mr-3 text-gray-500 hover:text-gray-800"><ChevronLeft size={24} /></button>}
                    <h2 className="text-2xl font-bold text-gray-900">{showCategoryManager ? 'Gerenciar Categorias' : 'Extrato'}</h2>
                </div>
                {!showCategoryManager ? (
                    <div className="flex items-center space-x-3">
                        <button onClick={() => setIsImportModalOpen(true)} className="p-2 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-full transition-colors flex items-center" title="Importar Extrato PDF">
                            <Upload size={22} />
                            <span className="hidden md:inline ml-2 text-sm font-medium">Importar PDF/CSV</span>
                        </button>
                        <button onClick={() => setShowCategoryManager(true)} className="p-2 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-full transition-colors" title="Categorias"><SettingsIcon size={22} /></button>
                    </div>
                ) : <button onClick={() => setShowCategoryManager(false)} className="text-sm font-medium text-gray-500 hover:text-gray-900">Voltar</button>}
            </div>

            {/* Body Content */}
            {showCategoryManager ? (
                /* Category Manager UI */
                <div className="animate-fade-in space-y-6 pb-20">
                    <form onSubmit={handleSubmitCategory} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                            <Sparkles className="text-accent mr-2" size={20} />
                            {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div><label className="block text-xs font-semibold text-gray-500 mb-1">Nome</label><input type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-accent transition-colors" value={catName} onChange={(e) => setCatName(e.target.value)} placeholder="Ex: Mercado, Lazer..." required /></div>
                            <div><label className="block text-xs font-semibold text-gray-500 mb-1">Divisão</label><select value={catGroup} onChange={(e) => setCatGroup(e.target.value as CategoryGroup)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none">{Object.entries(groupLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
                        </div>
                        <div className="flex justify-between items-center pt-2">
                            {/* Hints or Color Picker could go here */}
                            <div className="flex gap-2">
                                {['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'].map(c => (
                                    <button key={c} type="button" onClick={() => setCatColor(c)} className={`w-6 h-6 rounded-full border-2 ${catColor === c ? 'border-gray-900 scale-110' : 'border-transparent'}`} style={{ backgroundColor: c }} />
                                ))}
                            </div>
                            <div className="flex">
                                {editingCategory && <button type="button" onClick={resetCategoryForm} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg mr-2 text-sm transition-colors">Cancelar Edição</button>}
                                <button type="submit" className="bg-accent hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-bold text-sm shadow-md shadow-blue-500/20 transition-all active:scale-95">
                                    {editingCategory ? 'Salvar Alterações' : 'Criar Categoria'}
                                </button>
                            </div>
                        </div>
                    </form>
                    <div className="space-y-6">
                        {groupOrder.map(groupKey => {
                            const items = groupedCategories[groupKey];
                            if (!items || items.length === 0) return null;
                            return (
                                <div key={groupKey} className="bg-gray-50/50 rounded-xl p-4 border border-gray-100">
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">{groupLabels[groupKey]}</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {items.map(cat => (
                                            <div key={cat.id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg group">
                                                <div className="flex items-center space-x-3"><div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center"><CategoryIcon iconName={cat.icon} color={cat.color} size={16} /></div><span className="text-sm font-bold text-gray-700">{cat.name}</span></div>
                                                <div className="flex space-x-1"><button onClick={() => handleEditCategory(cat)} className="p-1 text-gray-400 hover:text-accent"><Edit2 size={14} /></button><button onClick={() => deleteCategory(cat.id)} className="p-1 text-gray-400 hover:text-danger"><Trash2 size={14} /></button></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                /* Transaction List UI */
                <>
                    <div className="flex items-center justify-between bg-white p-3 rounded-xl shadow-sm border border-gray-100 mb-6">
                        <button onClick={() => changeMonth(-1)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"><ChevronLeft size={20} /></button>
                        <span className="font-bold text-gray-800">{getMonthName(selectedMonth)} {selectedYear}</span>
                        <button onClick={() => changeMonth(1)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg rotate-180"><ChevronLeft size={20} /></button>
                    </div>

                    <div className="space-y-3 pb-20">
                        {filteredTransactions.length === 0 ? <div className="text-center text-gray-400 py-10">Nenhuma transação neste mês.</div> : (
                            filteredTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(tx => {
                                const cat = categories.find(c => c.id === tx.categoryId);
                                return (
                                    <div key={tx.id} className="bg-white p-4 rounded-xl shadow-sm border-l-4 flex items-center" style={{ borderLeftColor: tx.type === 'INCOME' ? '#4caf50' : '#f44336' }}>
                                        <div className="flex-1">
                                            <div className="flex justify-between"><p className="font-bold text-gray-800">{tx.description}</p><p className={`font-bold ${tx.type === 'INCOME' ? 'text-success' : 'text-danger'}`}>{formatCurrency(tx.value)}</p></div>
                                            <div className="flex justify-between mt-1 items-center"><div className="flex items-center bg-gray-50 px-2 py-0.5 rounded border border-gray-100"><CategoryIcon iconName={cat?.icon} color={cat?.color} size={10} className="mr-1" /><span className="text-[10px] font-medium text-gray-600">{cat?.name}</span></div><p className="text-[10px] text-gray-400">{formatDate(tx.date)}</p></div>
                                        </div>
                                        <div className="flex ml-2"><button onClick={() => onEdit(tx)} className="p-2 text-gray-300 hover:text-primary"><Edit2 size={16} /></button><button onClick={() => handleDeleteTransaction(tx.id)} className="p-2 text-gray-300 hover:text-danger"><Trash2 size={16} /></button></div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </>
            )}

            {/* Import Modal */}
            <ImportExportModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} />
        </div>
    );
};

export default TransactionList;
