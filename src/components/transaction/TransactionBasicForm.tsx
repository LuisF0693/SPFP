import React, { useRef, useState } from 'react';
import { Transaction, TransactionType, CategoryGroup, Category, Account, UserProfile } from '../../types';
import { ChevronDown, ChevronUp, Search, Check, X, Sparkles, Plus } from 'lucide-react';
import { getOwnerDisplayName } from '../../utils/ownerUtils';

// Emojis disponíveis para categorias
const AVAILABLE_EMOJIS = [
  '🏠', '🚗', '🏥', '🎓', '🛒', '🎉', '🍔', '🛍️', '📈', '🛡️', '☂️', '💰', '💵',
  '✈️', '🎮', '🎬', '📚', '☕', '🎵', '🏋️', '💻', '📱', '🎁', '🔧', '⚡', '📶',
  '🐕', '🐈', '🌿', '💊', '🍕', '🍺', '🚌', '⛽', '🅿️', '🏦', '💳', '🎨', '✂️'
];

interface TransactionBasicFormProps {
  description: string;
  onDescriptionChange: (value: string) => void;
  value: string;
  onValueChange: (value: string) => void;
  type: TransactionType;
  onTypeChange: (type: TransactionType) => void;
  categoryId: string;
  onCategoryChange: (categoryId: string) => void;
  accountId: string;
  onAccountChange: (accountId: string) => void;
  date: string;
  onDateChange: (date: string) => void;
  paid: boolean;
  onPaidChange: (paid: boolean) => void;
  wasCategoryAutoSelected: boolean;
  accounts: Account[];
  categories: Category[];
  selectedCategory: Category | undefined;
  showImpulseAlert: boolean;
  onCreateCategory: (name: string, group: CategoryGroup, color: string, icon: string) => string;
  userProfile?: Partial<UserProfile>;
}

const COLOR_PALETTE = [
  '#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6',
  '#ec4899', '#06b6d4', '#f97316', '#64748b', '#000000'
];

const GROUP_LABELS: Record<CategoryGroup, string> = {
  'FIXED': 'Gastos Fixos',
  'VARIABLE': 'Gastos Variáveis',
  'INVESTMENT': 'Investimentos',
  'INCOME': 'Renda'
};

export const TransactionBasicForm: React.FC<TransactionBasicFormProps> = ({
  description,
  onDescriptionChange,
  value,
  onValueChange,
  type,
  onTypeChange,
  categoryId,
  onCategoryChange,
  accountId,
  onAccountChange,
  date,
  onDateChange,
  paid,
  onPaidChange,
  wasCategoryAutoSelected,
  accounts,
  categories,
  selectedCategory,
  showImpulseAlert,
  onCreateCategory,
  userProfile,
}) => {
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatGroup, setNewCatGroup] = useState<CategoryGroup>('VARIABLE');
  const [newCatColor, setNewCatColor] = useState(COLOR_PALETTE[0]);
  const [newCatIcon, setNewCatIcon] = useState('📦');

  React.useEffect(() => {
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
    const newId = onCreateCategory(newCatName, newCatGroup, newCatColor, newCatIcon);
    onCategoryChange(newId);
    setIsCreatingCategory(false);
    setIsCategoryOpen(false);
    setNewCatName('');
    setNewCatColor(COLOR_PALETTE[0]);
    setNewCatIcon('📦');
  };

  const filteredCategories = categories.filter((c: any) =>
    c.name.toLowerCase().includes(categorySearch.toLowerCase())
  );
  const groupedFilteredCategories = filteredCategories.reduce((acc: any, cat: any) => {
    const group = cat.group || 'VARIABLE';
    if (!acc[group]) acc[group] = [];
    acc[group].push(cat);
    return acc;
  }, {} as Record<CategoryGroup, Category[]>);

  const selectedAccount = accounts.find((a: any) => a.id === accountId);

  return (
    <>
      <div className="flex bg-slate-800/60 p-1 rounded-xl border border-slate-700/50">
        <button
          type="button"
          onClick={() => onTypeChange('EXPENSE')}
          aria-label="Registrar saída, despesa"
          aria-pressed={type === 'EXPENSE'}
          className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${
            type === 'EXPENSE'
              ? 'bg-gradient-to-r from-rose-500/20 to-rose-600/20 text-rose-400 shadow-lg shadow-rose-500/10 border border-rose-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Saída
        </button>
        <button
          type="button"
          onClick={() => onTypeChange('INCOME')}
          aria-label="Registrar entrada, receita"
          aria-pressed={type === 'INCOME'}
          className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${
            type === 'INCOME'
              ? 'bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 text-emerald-400 shadow-lg shadow-emerald-500/10 border border-emerald-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Entrada
        </button>
      </div>

      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={() => onPaidChange(!paid)}
          aria-label={paid ? 'Marcar como pendente' : 'Marcar como pago'}
          aria-pressed={paid}
          className={`flex-1 p-3 rounded-xl border-2 flex items-center justify-center font-bold text-sm transition-all ${
            paid
              ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
              : 'border-slate-600 bg-slate-800/50 text-slate-400'
          }`}
        >
          <Check size={20} className={`mr-2 ${paid ? 'fill-current' : ''}`} aria-hidden="true" />
          {paid ? 'Pago / Recebido' : 'Pendente / Agendado'}
        </button>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Valor</label>
        <div className="relative border-b-2 border-slate-700 focus-within:border-blue-500 transition-colors pb-2">
          <span className="absolute left-0 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-500">R$</span>
          <input
            type="number"
            step="0.01"
            required
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            placeholder="0,00"
            className={`w-full pl-10 text-4xl font-bold bg-transparent outline-none transition-colors ${
              type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'
            }`}
          />
        </div>
        {showImpulseAlert && type === 'EXPENSE' && (
          <div className="mt-2 flex items-center text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 p-2 rounded-lg animate-bounce">
            <span className="mr-2">⚠️</span>
            Atenção: Este gasto está acima do seu padrão para esta categoria!
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Descrição</label>
        <input
          type="text"
          required
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          className="w-full p-4 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 outline-none text-slate-100 placeholder-slate-500"
          placeholder="Ex: iFood, Uber, Aluguel"
        />
      </div>

      {/* Category Selector - Grid Visual com Emojis */}
      <div ref={categoryDropdownRef}>
        <div className="flex justify-between items-center mb-3">
          <label className="block text-sm font-medium text-slate-300">Categoria</label>
          <div className="flex items-center gap-2">
            {wasCategoryAutoSelected && (
              <div className="flex items-center text-[10px] text-blue-400 font-bold bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full animate-pulse">
                <Sparkles size={10} className="mr-1" /> Auto-detectada
              </div>
            )}
            <button
              type="button"
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
            >
              {isCategoryOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              {isCategoryOpen ? 'Menos' : 'Mais'}
            </button>
          </div>
        </div>

        {/* Selected Category Display */}
        {selectedCategory && !isCategoryOpen && (
          <div
            className="flex items-center gap-3 p-3 mb-3 bg-slate-800/50 border border-slate-700 rounded-xl cursor-pointer hover:bg-slate-700/50 transition-colors"
            onClick={() => setIsCategoryOpen(true)}
          >
            <span className="text-2xl">{selectedCategory.icon || '📦'}</span>
            <div className="flex-1">
              <span className="text-slate-100 font-medium">{selectedCategory.name}</span>
              <span className="text-xs text-slate-500 ml-2">{GROUP_LABELS[selectedCategory.group as CategoryGroup]}</span>
            </div>
            <Check size={18} className="text-emerald-400" />
          </div>
        )}

        {/* Category Grid */}
        <div className={`space-y-3 transition-all duration-300 ${isCategoryOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
          {/* Search and Create */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar..."
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-800/50 border border-slate-700 rounded-lg outline-none text-slate-100 placeholder-slate-500 focus:border-blue-500/50"
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={() => setIsCreatingCategory(true)}
              className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-500 transition-colors whitespace-nowrap"
            >
              <Plus size={14} /> Nova
            </button>
          </div>

          {/* Category Groups */}
          {(['FIXED', 'VARIABLE', 'INVESTMENT', 'INCOME'] as CategoryGroup[]).map((group) => {
            const items = groupedFilteredCategories[group];
            if (!items || items.length === 0) return null;
            return (
              <div key={group} className="space-y-2">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">
                  {GROUP_LABELS[group]}
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {items.map((cat: any) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        onCategoryChange(cat.id);
                        setIsCategoryOpen(false);
                      }}
                      className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all hover:scale-[1.02] active:scale-95 ${
                        categoryId === cat.id
                          ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20'
                          : 'border-slate-700/50 bg-slate-800/30 hover:border-slate-600'
                      }`}
                    >
                      <span className="text-2xl mb-1">{cat.icon || '📦'}</span>
                      <span className={`text-[10px] text-center leading-tight truncate w-full ${
                        categoryId === cat.id ? 'font-bold text-blue-400' : 'text-slate-400'
                      }`}>
                        {cat.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Collapsed state: show popular categories */}
        {!isCategoryOpen && !selectedCategory && (
          <div className="grid grid-cols-4 gap-2">
            {filteredCategories.slice(0, 8).map((cat: any) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => onCategoryChange(cat.id)}
                className={`flex flex-col items-center p-2 rounded-xl border-2 transition-all hover:scale-[1.02] active:scale-95 ${
                  categoryId === cat.id
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-slate-700/50 bg-slate-800/30 hover:border-slate-600'
                }`}
              >
                <span className="text-xl">{cat.icon || '📦'}</span>
                <span className="text-[9px] text-slate-400 truncate w-full text-center">{cat.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Conta / Cartão</label>
          <div
            className={`relative transition-all border rounded-xl overflow-hidden ${
              selectedAccount?.type === 'CREDIT_CARD'
                ? 'border-blue-500/50 ring-2 ring-blue-500/10 bg-blue-500/5'
                : 'border-slate-700 bg-slate-800/50'
            }`}
          >
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
              {selectedAccount?.type === 'CREDIT_CARD' ? (
                <span className="text-blue-400">💳</span>
              ) : (
                <span className="text-slate-500">🏦</span>
              )}
            </div>
            <select
              value={accountId}
              onChange={(e) => onAccountChange(e.target.value)}
              className="w-full pl-11 pr-4 py-4 bg-transparent outline-none appearance-none cursor-pointer text-sm font-medium text-slate-100"
            >
              {accounts.map((acc) => {
                const ownerName = getOwnerDisplayName(acc.owner, userProfile);
                const displayName = acc.type === 'CREDIT_CARD'
                  ? `💳 ${acc.name} - ${ownerName}`
                  : `🏦 ${acc.name}`;
                return (
                  <option key={acc.id} value={acc.id} className="bg-slate-800 text-slate-100">
                    {displayName}
                  </option>
                );
              })}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
              <ChevronDown size={18} />
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Data da Compra</label>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full p-4 bg-slate-800/50 border border-slate-700 rounded-xl outline-none text-sm font-medium text-slate-100 [color-scheme:dark]"
          />
        </div>
      </div>

      {isCreatingCategory && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900/95 backdrop-blur-xl rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col animate-slide-up border border-slate-700/50">
            <div className="p-6 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/50">
              <h3 className="text-xl font-bold text-slate-100">Nova Categoria</h3>
              <button
                onClick={() => setIsCreatingCategory(false)}
                aria-label="Fechar criação de categoria"
                className="p-3 text-slate-400 hover:text-slate-200 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X size={24} aria-hidden="true" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh] no-scrollbar">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Nome</label>
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="Ex: Assinaturas, Manutenção..."
                  className="w-full p-3 bg-slate-800/50 border border-slate-700 rounded-xl outline-none focus:border-blue-500/50 text-slate-100 placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Divisão Financeira</label>
                <select
                  value={newCatGroup}
                  onChange={(e) => setNewCatGroup(e.target.value as CategoryGroup)}
                  className="w-full p-3 bg-slate-800/50 border border-slate-700 rounded-xl outline-none appearance-none text-slate-100"
                >
                  {Object.entries(GROUP_LABELS).map(([key, label]) => (
                    <option key={key} value={key} className="bg-slate-800">
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Cor de Destaque</label>
                <div className="flex flex-wrap gap-3">
                  {COLOR_PALETTE.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewCatColor(c)}
                      aria-label={`Cor ${c}`}
                      aria-pressed={newCatColor === c}
                      className={`w-11 h-11 rounded-full border-2 transition-transform active:scale-90 ${
                        newCatColor === c ? 'border-white scale-110 shadow-lg' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Emoji</label>
                <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-40 overflow-y-auto p-2 border border-slate-700/50 rounded-xl bg-slate-800/30">
                  {AVAILABLE_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setNewCatIcon(emoji)}
                      className={`p-2 rounded-lg flex items-center justify-center transition-all text-xl hover:scale-110 active:scale-95 ${
                        newCatIcon === emoji
                          ? 'bg-blue-600 shadow-lg ring-2 ring-blue-400'
                          : 'bg-slate-800/50 hover:bg-slate-700/50'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-800/50 border-t border-slate-700/50">
              <button
                onClick={handleCreateCategory}
                disabled={!newCatName}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/20 hover:from-blue-500 hover:to-blue-400 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Criar e Selecionar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
