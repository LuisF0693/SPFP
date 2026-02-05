/**
 * SidebarBudgetSection Component (STY-052)
 * Displays top 3 spending categories with progress bars
 *
 * Features:
 * - Category icon + name
 * - Spent / Limit display
 * - Color-coded progress bar (green/yellow/red)
 * - Click to navigate to /budget
 * - Responsive design
 *
 * Design: docs/design/FASE-1-MOCKUPS.md (Budget Section Details)
 */

import React, { useMemo, memo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import {
  mockBudgetCategories,
  formatCurrency,
  getProgressBarColor
} from '../../constants/mockSidebarData';
import { colorTokens } from '../../styles/tokens';

/**
 * Progress Bar Component
 */
interface ProgressBarProps {
  percentage: number;
  spent: number;
  limit: number;
}

const ProgressBar: React.FC<ProgressBarProps> = memo(({ percentage, spent, limit }) => {
  const colorClass = getProgressBarColor(percentage);

  return (
    <div className="space-y-1">
      <div
        className={`w-full h-2 rounded-full bg-slate-700 overflow-hidden transition-all duration-300 ${colorClass}`}
        role="progressbar"
        aria-valuenow={Math.round(percentage)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Progresso de gastos: ${Math.round(percentage)}%`}
      >
        <div
          className={`h-full ${colorClass} transition-all duration-300`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <div className="flex justify-between items-center px-1">
        <span className="text-xs font-medium text-slate-400">
          {formatCurrency(spent)} / {formatCurrency(limit)}
        </span>
        <span className="text-xs font-bold text-slate-300">
          {Math.round(percentage)}%
        </span>
      </div>
    </div>
  );
});

ProgressBar.displayName = 'ProgressBar';

/**
 * Budget Category Item Component
 */
interface BudgetCategoryItemProps {
  emoji: string;
  name: string;
  spent: number;
  limit: number;
  percentage: number;
}

const BudgetCategoryItem: React.FC<BudgetCategoryItemProps> = memo(({
  emoji,
  name,
  spent,
  limit,
  percentage
}) => {
  const navigate = useNavigate();

  const handleClick = useCallback(() => {
    navigate(`/budget?category=${encodeURIComponent(name)}`);
  }, [navigate, name]);

  return (
    <button
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      className="w-full p-3 rounded-lg transition-all duration-200 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-blue-500 group text-left"
      aria-label={`${name}: ${formatCurrency(spent)} de ${formatCurrency(limit)} (${Math.round(percentage)}%)`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-lg flex-shrink-0">{emoji}</span>
          <span className="text-sm font-medium text-slate-100 truncate group-hover:text-slate-50 transition-colors">
            {name}
          </span>
        </div>
        <ChevronRight
          size={16}
          className="flex-shrink-0 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity ml-2"
        />
      </div>
      <ProgressBar percentage={percentage} spent={spent} limit={limit} />
    </button>
  );
});

BudgetCategoryItem.displayName = 'BudgetCategoryItem';

/**
 * SidebarBudgetSection Component
 * Shows top 3 budget categories with spending progress
 */
export const SidebarBudgetSection: React.FC = memo(() => {
  const topCategories = useMemo(() => {
    return mockBudgetCategories.slice(0, 3).sort((a, b) => b.percentage - a.percentage);
  }, []);

  return (
    <div className="space-y-2">
      {topCategories.length === 0 ? (
        <div
          className="p-4 rounded-lg text-center"
          style={{
            backgroundColor: colorTokens.slate[800],
            color: colorTokens.slate[400]
          }}
        >
          <p className="text-sm">Nenhuma categoria orçada</p>
        </div>
      ) : (
        topCategories.map((category) => (
          <BudgetCategoryItem
            key={category.id}
            emoji={category.emoji}
            name={category.name}
            spent={category.spent}
            limit={category.limit}
            percentage={category.percentage}
          />
        ))
      )}

      {/* Link para visualizar todos os orçamentos */}
      <button
        onClick={() => window.location.href = '/budget'}
        className="w-full mt-3 p-2 text-center text-xs font-medium text-blue-400 hover:text-blue-300 rounded-lg transition-colors duration-200 hover:bg-blue-500/10"
        aria-label="Ver todos os orçamentos"
      >
        Ver Todos os Orçamentos →
      </button>
    </div>
  );
});

SidebarBudgetSection.displayName = 'SidebarBudgetSection';

export default SidebarBudgetSection;
