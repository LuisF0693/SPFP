import React from 'react';
import { ChevronLeft, ChevronRight, Edit2 } from 'lucide-react';
import { formatCurrency, getMonthName } from '../../utils';

export interface CategoryBudgetItem {
  id: string;
  name: string;
  icon: string;
  color: string;
  spent: number;
  limit: number;
  group: string;
}

interface BudgetCategoryListProps {
  categories: CategoryBudgetItem[];
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  viewMode: 'MONTHLY' | 'YEARLY';
  onViewModeChange: (mode: 'MONTHLY' | 'YEARLY') => void;
  onEditLimit?: (categoryId: string, newLimit: number) => void;
}

const BudgetCategoryRow: React.FC<{
  item: CategoryBudgetItem;
  viewMode: 'MONTHLY' | 'YEARLY';
  onEdit?: () => void;
}> = ({ item, viewMode, onEdit }) => {
  const remaining = Math.max(item.limit - item.spent, 0);
  const progress = item.limit > 0 ? Math.min((item.spent / item.limit) * 100, 100) : 0;
  const isOverBudget = item.spent > item.limit && item.limit > 0;
  const hasNoLimit = item.limit === 0;

  return (
    <div className="p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl hover:bg-slate-800/50 transition-colors group">
      {/* Header Row */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-3">
          <span className="text-xl">{item.icon || '📦'}</span>
          <span className="font-medium text-white">{item.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`font-bold ${hasNoLimit ? 'text-slate-500' : 'text-white'}`}>
            {hasNoLimit ? 'Sem meta' : formatCurrency(item.limit)}
          </span>
          {onEdit && (
            <button
              onClick={onEdit}
              className="p-1 text-slate-500 hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-all"
            >
              <Edit2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden mb-2">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isOverBudget ? 'bg-rose-500' : ''
          }`}
          style={{
            width: hasNoLimit ? '0%' : `${progress}%`,
            backgroundColor: isOverBudget ? undefined : item.color || '#3B82F6'
          }}
        />
      </div>

      {/* Footer Row */}
      <div className="flex justify-between text-xs">
        <span className="text-slate-500">
          {viewMode === 'MONTHLY' ? 'Mês' : 'Ano'}:{' '}
          <span className={isOverBudget ? 'text-rose-400 font-medium' : 'text-slate-300'}>
            {formatCurrency(item.spent)}
          </span>
          {!hasNoLimit && (
            <span className="text-slate-500">
              {' '}(Restam {formatCurrency(remaining)})
            </span>
          )}
        </span>
        {isOverBudget && (
          <span className="text-rose-400 font-medium">
            Excedido em {formatCurrency(item.spent - item.limit)}
          </span>
        )}
      </div>
    </div>
  );
};

export const BudgetCategoryList: React.FC<BudgetCategoryListProps> = ({
  categories,
  currentDate,
  onPrevMonth,
  onNextMonth,
  viewMode,
  onViewModeChange,
  onEditLimit
}) => {
  const headerTitle = viewMode === 'MONTHLY'
    ? `${getMonthName(currentDate.getMonth())} de ${currentDate.getFullYear()}`
    : `${currentDate.getFullYear()}`;

  // Group categories
  const fixedCategories = categories.filter(c => c.group === 'FIXED');
  const variableCategories = categories.filter(c => c.group === 'VARIABLE');
  const investmentCategories = categories.filter(c => c.group === 'INVESTMENT');

  const renderGroup = (items: CategoryBudgetItem[], title: string) => {
    if (items.length === 0) return null;

    return (
      <div className="space-y-2">
        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">
          {title}
        </h4>
        {items.map(item => (
          <BudgetCategoryRow
            key={item.id}
            item={item}
            viewMode={viewMode}
            onEdit={onEditLimit ? () => {
              const newLimit = prompt(`Nova meta para ${item.name}:`, item.limit.toString());
              if (newLimit !== null) {
                onEditLimit(item.id, parseFloat(newLimit) || 0);
              }
            } : undefined}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5 space-y-4">
      {/* Header with Navigation */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <button
            onClick={onPrevMonth}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-lg font-bold text-white min-w-[180px] text-center">
            {headerTitle}
          </span>
          <button
            onClick={onNextMonth}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* View Mode Toggle */}
        <div className="flex bg-slate-800 rounded-lg p-1">
          <button
            onClick={() => onViewModeChange('MONTHLY')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              viewMode === 'MONTHLY'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Mensal
          </button>
          <button
            onClick={() => onViewModeChange('YEARLY')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              viewMode === 'YEARLY'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Anual
          </button>
        </div>
      </div>

      {/* Category Groups */}
      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
        {renderGroup(fixedCategories, 'Gastos Fixos')}
        {renderGroup(variableCategories, 'Gastos Variáveis')}
        {renderGroup(investmentCategories, 'Investimentos')}

        {categories.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            Nenhuma categoria com gastos neste período
          </div>
        )}
      </div>
    </div>
  );
};
