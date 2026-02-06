import React, { useState } from 'react';
import { TransactionType, CategoryGroup, Category, Account, UserProfile } from '../../types';
import { ChevronDown, ChevronRight, Check, Sparkles } from 'lucide-react';
import { getOwnerDisplayName } from '../../utils/ownerUtils';
import { CategorySelectorModal } from './CategorySelectorModal';
import { CreateCategoryModal } from './CreateCategoryModal';

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
  const [isCategorySelectorOpen, setIsCategorySelectorOpen] = useState(false);
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false);

  const selectedAccount = accounts.find((a) => a.id === accountId);

  const handleCategoryCreated = (newCategoryId: string) => {
    onCategoryChange(newCategoryId);
    setIsCreateCategoryOpen(false);
  };

  const handleOpenCreateCategory = () => {
    setIsCategorySelectorOpen(false);
    setIsCreateCategoryOpen(true);
  };

  return (
    <>
      {/* Type Toggle: Saída / Entrada */}
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

      {/* Paid Status Toggle */}
      <button
        type="button"
        onClick={() => onPaidChange(!paid)}
        aria-label={paid ? 'Marcar como pendente' : 'Marcar como pago'}
        aria-pressed={paid}
        className={`w-full p-3 rounded-xl border-2 flex items-center justify-center font-bold text-sm transition-all ${
          paid
            ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
            : 'border-slate-600 bg-slate-800/50 text-slate-400'
        }`}
      >
        <Check size={20} className={`mr-2 ${paid ? 'fill-current' : ''}`} aria-hidden="true" />
        {paid ? 'Pago / Recebido' : 'Pendente / Agendado'}
      </button>

      {/* Value Input */}
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

      {/* Description Input */}
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

      {/* Category Selector - Compact Chip that opens Modal */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-slate-300">Categoria</label>
          {wasCategoryAutoSelected && (
            <div className="flex items-center text-[10px] text-blue-400 font-bold bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full animate-pulse">
              <Sparkles size={10} className="mr-1" /> Auto-detectada
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsCategorySelectorOpen(true)}
          className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all hover:bg-slate-700/30 ${
            selectedCategory
              ? 'border-slate-600 bg-slate-800/50'
              : 'border-dashed border-slate-600 bg-slate-800/30'
          }`}
        >
          <div className="flex items-center gap-3">
            {selectedCategory ? (
              <>
                <span className="text-2xl">{selectedCategory.icon || '📦'}</span>
                <div className="text-left">
                  <div className="text-slate-100 font-medium">{selectedCategory.name}</div>
                  <div className="text-xs text-slate-500">
                    {GROUP_LABELS[selectedCategory.group as CategoryGroup]}
                  </div>
                </div>
              </>
            ) : (
              <>
                <span className="text-2xl opacity-50">📦</span>
                <span className="text-slate-500">Selecionar categoria</span>
              </>
            )}
          </div>
          <ChevronRight size={20} className="text-slate-500" />
        </button>
      </div>

      {/* Account and Date - Side by Side */}
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

      {/* Category Selector Modal */}
      <CategorySelectorModal
        isOpen={isCategorySelectorOpen}
        onClose={() => setIsCategorySelectorOpen(false)}
        categories={categories}
        selectedId={categoryId}
        onSelect={onCategoryChange}
        onCreateNew={handleOpenCreateCategory}
      />

      {/* Create Category Modal */}
      <CreateCategoryModal
        isOpen={isCreateCategoryOpen}
        onClose={() => setIsCreateCategoryOpen(false)}
        onCreateCategory={onCreateCategory}
        onCategoryCreated={handleCategoryCreated}
      />
    </>
  );
};
