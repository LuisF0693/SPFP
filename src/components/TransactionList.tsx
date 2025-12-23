
import React, { useState, useRef } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, formatDate, getMonthName } from '../utils';
import { Trash2, Edit2, Settings as SettingsIcon, Upload, FileText, Sparkles, X, ChevronLeft, Check } from 'lucide-react';
import { Transaction, Category, CategoryGroup } from '../types';
import { CategoryIcon } from './CategoryIcon';

interface TransactionListProps {
    onEdit: (transaction: Transaction) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({ onEdit }) => {
  const { transactions, categories, accounts, deleteTransaction, addCategory, updateCategory, deleteCategory, addManyTransactions } = useFinance();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  // View State
  const [showCategoryManager, setShowCategoryManager] = useState(false);

  // Import State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importPreview, setImportPreview] = useState<(Partial<Transaction> & { autoCategorized?: boolean })[]>([]);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importTargetAccount, setImportTargetAccount] = useState('');
  const [importDefaultCategory, setImportDefaultCategory] = useState('');

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
      if(window.confirm('Tem certeza que deseja excluir esta transação?')) deleteTransaction(id);
  };

  // --- CSV Import Logic ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      processCSV(text);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const parseBrazilianCurrency = (str: string): number => {
      // Normaliza para lidar com formatos variados (R$, espaços, etc)
      let cleanStr = str.toUpperCase().trim();
      
      // Detecção de sinal negativo ou sufixo D/C
      let isNegative = cleanStr.startsWith('-') || cleanStr.endsWith('-');
      if (cleanStr.includes(' D') || cleanStr.endsWith('D')) isNegative = true; // Débito
      
      // Remove tudo que não for número, vírgula, ponto ou traço
      cleanStr = cleanStr.replace(/[^0-9,\.-]/g, '');
      
      // Lógica para detectar se é formato BR (1.000,00) ou US (1,000.00)
      if (cleanStr.includes(',') && cleanStr.includes('.')) {
          const lastDot = cleanStr.lastIndexOf('.');
          const lastComma = cleanStr.lastIndexOf(',');
          if (lastComma > lastDot) {
              // BR: Remove pontos de milhar, troca vírgula por ponto
              cleanStr = cleanStr.replace(/\./g, '').replace(',', '.');
          } else {
              // US: Remove vírgulas de milhar
              cleanStr = cleanStr.replace(/,/g, '');
          }
      } else if (cleanStr.includes(',')) {
          // Apenas vírgula: assume decimal (BR)
          cleanStr = cleanStr.replace(',', '.');
      }
      
      let val = parseFloat(cleanStr);
      if (isNaN(val)) return 0;
      return isNegative ? -Math.abs(val) : Math.abs(val);
  };

  const parseDate = (str: string): string | null => {
      // Tenta DD/MM/YYYY ou DD/MM/YY
      const ptBrMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
      if (ptBrMatch) {
          const day = ptBrMatch[1].padStart(2, '0');
          const month = ptBrMatch[2].padStart(2, '0');
          let year = ptBrMatch[3];
          if (year.length === 2) year = '20' + year;
          return `${year}-${month}-${day}`;
      }
      // Tenta YYYY-MM-DD
      const isoMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
      return isoMatch ? isoMatch[0] : null;
  };

  const processCSV = (text: string) => {
      const lines = text.split(/\r\n|\n/);
      const extracted: (Partial<Transaction> & { autoCategorized?: boolean })[] = [];
      const defaultCat = categories.find(c => c.name.toLowerCase().includes('outros')) || categories[0];

      lines.forEach(line => {
          if (!line.trim()) return;
          
          // Tenta separar por ponto-e-vírgula (comum no BR) ou vírgula
          let cols = line.split(';');
          if (cols.length < 2) cols = line.split(',');
          if (cols.length < 2) return; 

          let date: string | null = null;
          let description: string = '';
          let value: number | null = null;

          // Heurística para identificar colunas
          for (const col of cols) {
              const cleanCol = col.replace(/"/g, '').trim();
              
              // 1. Tenta identificar Data
              if (!date) { 
                  const d = parseDate(cleanCol); 
                  if (d) { date = d; continue; } 
              }
              
              // 2. Tenta identificar Valor (se parece número e não é data)
              if (value === null) {
                  // Regex permissiva para moeda
                  if (/^-?[R$\s]*[\d\.,]+[DC]?$/.test(cleanCol) && /\d/.test(cleanCol) && !cleanCol.includes('/')) {
                      value = parseBrazilianCurrency(cleanCol);
                      continue; 
                  }
              }
              
              // 3. Descrição é geralmente a string mais longa que sobra
              if (cleanCol.length > description.length && isNaN(Number(cleanCol.replace(',','.'))) && !cleanCol.includes('/')) {
                  description = cleanCol;
              }
          }

          if (date && value !== null) {
              const safeDate = new Date(date + 'T12:00:00').toISOString();
              const cleanDesc = description.toLowerCase().trim();
              
              // Auto-categorização baseada em histórico
              const predictedTx = transactions.find(t => t.description.toLowerCase().trim() === cleanDesc);
              
              extracted.push({
                  date: safeDate,
                  description: description || 'Importado via CSV',
                  value: Math.abs(value),
                  type: value < 0 ? 'EXPENSE' : 'INCOME',
                  categoryId: predictedTx ? predictedTx.categoryId : defaultCat?.id,
                  autoCategorized: !!predictedTx
              });
          }
      });

      if (extracted.length > 0) {
          setImportPreview(extracted);
          if (accounts.length > 0) setImportTargetAccount(accounts[0].id);
          // Set default category for items that weren't auto-detected
          if (defaultCat) setImportDefaultCategory(defaultCat.id);
          setIsImportModalOpen(true);
      } else {
          alert('Não foi possível identificar transações válidas neste arquivo. Verifique se é um CSV com datas e valores.');
      }
  };

  const confirmImport = () => {
      if (!importTargetAccount) return;
      const finalTransactions = importPreview.map(t => ({
          ...t,
          accountId: importTargetAccount,
          // Se não foi auto-categorizado, usa a categoria escolhida no modal
          categoryId: t.autoCategorized ? t.categoryId : (importDefaultCategory || categories[0].id),
      })) as Omit<Transaction, 'id'>[];
      
      addManyTransactions(finalTransactions);
      setIsImportModalOpen(false);
      setImportPreview([]);
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
                     <input type="file" accept=".csv,.txt" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                     <button onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-full transition-colors flex items-center" title="Importar Extrato">
                        <Upload size={22} />
                        <span className="hidden md:inline ml-2 text-sm font-medium">Importar CSV</span>
                     </button>
                     <button onClick={() => setShowCategoryManager(true)} className="p-2 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-full transition-colors" title="Categorias"><SettingsIcon size={22} /></button>
                </div>
            ) : <button onClick={() => setShowCategoryManager(false)} className="text-sm font-medium text-gray-500 hover:text-gray-900">Voltar</button>}
        </div>

        {/* Body Content */}
        {showCategoryManager ? (
            /* Category Manager UI */
            <div className="animate-fade-in space-y-6 pb-20">
                <form onSubmit={handleSubmitCategory} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div><label className="block text-xs font-semibold text-gray-500 mb-1">Nome</label><input type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none" value={catName} onChange={(e) => setCatName(e.target.value)} required /></div>
                        <div><label className="block text-xs font-semibold text-gray-500 mb-1">Divisão</label><select value={catGroup} onChange={(e) => setCatGroup(e.target.value as CategoryGroup)} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none">{Object.entries(groupLabels).map(([k,v]) => <option key={k} value={k}>{v}</option>)}</select></div>
                    </div>
                    <div className="flex justify-end pt-2">{editingCategory && <button type="button" onClick={resetCategoryForm} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg mr-2 text-sm">Cancelar</button>}<button type="submit" className="bg-accent text-white px-6 py-2 rounded-lg font-bold text-sm">{editingCategory ? 'Salvar' : 'Adicionar'}</button></div>
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
                    filteredTransactions.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(tx => {
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
        {isImportModalOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-slide-up overflow-hidden">
                    <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h3 className="font-bold text-gray-900 flex items-center"><FileText size={18} className="mr-2 text-primary" /> Confirmar Importação</h3>
                        <button onClick={() => setIsImportModalOpen(false)} className="p-2 bg-white rounded-full text-gray-400 hover:text-gray-800"><X size={20} /></button>
                    </div>
                    <div className="p-4 bg-blue-50 border-b border-blue-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="block text-[10px] font-bold text-blue-800 uppercase mb-1">Conta de Destino</label><select className="w-full p-2 rounded-lg border border-blue-200 bg-white text-xs" value={importTargetAccount} onChange={(e) => setImportTargetAccount(e.target.value)}>{accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}</select></div>
                        <div><label className="block text-[10px] font-bold text-blue-800 uppercase mb-1">Categoria Padrão (Se não detectada)</label><select className="w-full p-2 rounded-lg border border-blue-200 bg-white text-xs" value={importDefaultCategory} onChange={(e) => setImportDefaultCategory(e.target.value)}>{categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}</select></div>
                    </div>
                    <div className="flex-1 overflow-y-auto no-scrollbar bg-gray-50/30">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 sticky top-0 text-[10px] font-bold text-gray-500 uppercase">
                                <tr><th className="p-3 border-b">Data</th><th className="p-3 border-b">Descrição</th><th className="p-3 border-b">Categoria</th><th className="p-3 border-b text-right">Valor</th></tr>
                            </thead>
                            <tbody className="text-xs">
                                {importPreview.map((item, idx) => {
                                    const cat = categories.find(c => c.id === item.categoryId);
                                    return (
                                        <tr key={idx} className="border-b border-gray-100 hover:bg-white transition-colors">
                                            <td className="p-3 text-gray-500 font-mono">{item.date && formatDate(item.date).substring(0,5)}</td>
                                            <td className="p-3 font-medium text-gray-800 truncate max-w-[150px]">{item.description}</td>
                                            <td className="p-3">
                                                <div className={`inline-flex items-center px-2 py-1 rounded-md border ${item.autoCategorized ? 'bg-blue-50 border-blue-200' : 'bg-gray-100 border-gray-200'}`}>
                                                    <CategoryIcon iconName={cat?.icon} color={cat?.color} size={10} className="mr-1.5" />
                                                    <span className={`text-[10px] font-bold ${item.autoCategorized ? 'text-blue-700' : 'text-gray-600'}`}>{cat?.name}</span>
                                                    {item.autoCategorized && <Sparkles size={8} className="ml-1 text-blue-500 fill-blue-500" />}
                                                </div>
                                            </td>
                                            <td className={`p-3 text-right font-bold ${item.type === 'INCOME' ? 'text-emerald-600' : 'text-red-500'}`}>{item.value && formatCurrency(item.value)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 border-t border-gray-100 flex justify-end bg-white">
                        <button onClick={() => setIsImportModalOpen(false)} className="px-4 py-2 text-gray-500 text-sm font-medium hover:text-gray-700 mr-2">Cancelar</button>
                        <button onClick={confirmImport} disabled={!importTargetAccount} className="px-6 py-2 bg-primary text-white rounded-lg text-sm font-bold shadow-lg hover:bg-slate-800 transition-all flex items-center disabled:opacity-50 disabled:cursor-not-allowed">
                            <Check size={16} className="mr-2" />
                            Confirmar {importPreview.length} Itens
                        </button>
                    </div>
                </div>
            </div>
        )}
      </div>
  );
};

export default TransactionList;
