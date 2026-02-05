/**
 * SidebarSection Component
 * FASE 1: STY-053 (Budget Section) + STY-054 (Accounts Section)
 *
 * Displays expandable sections for Budget, Accounts, Transactions, and Installments
 * in the sidebar with real-time updates
 */

import React, { useMemo, useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Plus } from 'lucide-react';
import { BankLogo } from '../BankLogo';
import { formatCurrency } from '../../utils';

interface SidebarSectionProps {
  title: string;
  section: 'BUDGET' | 'ACCOUNTS' | 'TRANSACTIONS' | 'INSTALLMENTS';
  isExpanded: boolean;
  onToggle: () => void;
  icon: React.ReactNode;
}

/**
 * STY-053: Budget Section Component
 * Shows top 3 budget categories with progress bars and spending status
 */
const BudgetSection: React.FC<{ isExpanded: boolean; onToggle: () => void }> = ({
  isExpanded,
  onToggle,
}) => {
  const { transactions, categoryBudgets, categories } = useFinance();
  const navigate = useNavigate();

  // Calculate top 3 categories by spending this month
  const topBudgets = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Calculate spending per category for current month
    const categorySpending: Record<string, { spent: number; limit: number; name: string }> = {};

    // First, initialize from categoryBudgets
    categoryBudgets.forEach((budget) => {
      const category = categories.find((c) => c.id === budget.categoryId);
      if (category) {
        categorySpending[budget.categoryId] = {
          spent: 0,
          limit: budget.limit,
          name: category.name,
        };
      }
    });

    // Then calculate actual spending from transactions
    transactions
      .filter((t) => {
        const tDate = new Date(t.date);
        return (
          tDate.getMonth() === currentMonth &&
          tDate.getFullYear() === currentYear &&
          t.amount > 0
        );
      })
      .forEach((t) => {
        if (!categorySpending[t.categoryId]) {
          const category = categories.find((c) => c.id === t.categoryId);
          categorySpending[t.categoryId] = {
            spent: t.amount,
            limit: 0,
            name: category?.name || 'Outro',
          };
        } else {
          categorySpending[t.categoryId].spent += t.amount;
        }
      });

    // Sort by spending and get top 3
    return Object.entries(categorySpending)
      .map(([id, data]) => ({
        id,
        ...data,
        percentage: data.limit > 0 ? (data.spent / data.limit) * 100 : 0,
      }))
      .sort((a, b) => b.spent - a.spent)
      .slice(0, 3);
  }, [transactions, categoryBudgets, categories]);

  const getProgressColor = (percentage: number): string => {
    if (percentage > 80) return 'bg-red-500';
    if (percentage > 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getProgressBgColor = (percentage: number): string => {
    if (percentage > 80) return 'bg-red-500/10';
    if (percentage > 50) return 'bg-yellow-500/10';
    return 'bg-green-500/10';
  };

  return (
    <div className="space-y-3">
      {topBudgets.map((budget) => (
        <div
          key={budget.id}
          className="space-y-1.5 cursor-pointer hover:bg-white/5 p-2 rounded transition-colors"
          onClick={() => navigate(`/budget?category=${budget.id}`)}
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-gray-300">{budget.name}</span>
            <span className="text-[10px] text-gray-400">{Math.round(budget.percentage)}%</span>
          </div>
          <div className={`w-full h-2 rounded-full ${getProgressBgColor(budget.percentage)}`}>
            <div
              className={`h-full rounded-full transition-all duration-300 ${getProgressColor(
                budget.percentage
              )}`}
              style={{ width: `${Math.min(budget.percentage, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-gray-400">
            <span>{formatCurrency(budget.spent)}</span>
            <span>{budget.limit > 0 ? `de ${formatCurrency(budget.limit)}` : 'Sem limite'}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * STY-054: Accounts Section Component
 * Shows list of accounts with balance and quick add button
 */
const AccountsSection: React.FC<{ isExpanded: boolean; onToggle: () => void }> = ({
  isExpanded,
  onToggle,
}) => {
  const { accounts } = useFinance();
  const navigate = useNavigate();
  const [showAddAccount, setShowAddAccount] = useState(false);

  // Sort accounts by type (checking first, then others) and limit to 8
  const displayAccounts = useMemo(() => {
    return accounts
      .sort((a, b) => {
        if (a.type === 'CHECKING' && b.type !== 'CHECKING') return -1;
        if (a.type !== 'CHECKING' && b.type === 'CHECKING') return 1;
        return a.name.localeCompare(b.name);
      })
      .slice(0, 8);
  }, [accounts]);

  const handleAccountClick = (accountId: string) => {
    navigate(`/transactions?account=${accountId}`);
  };

  return (
    <div className={`space-y-2 ${displayAccounts.length > 0 ? 'max-h-48 overflow-y-auto' : ''}`}>
      {displayAccounts.map((account) => (
        <div
          key={account.id}
          className="flex items-center justify-between p-2 hover:bg-white/5 rounded cursor-pointer transition-colors"
          onClick={() => handleAccountClick(account.id)}
        >
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <BankLogo name={account.name} type={account.type} size={20} />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-gray-300 truncate">{account.name}</div>
              <div className="text-[10px] text-gray-500">{formatCurrency(account.balance)}</div>
            </div>
          </div>
        </div>
      ))}

      {accounts.length > displayAccounts.length && (
        <div className="text-[10px] text-gray-400 px-2 py-1 italic">
          +{accounts.length - displayAccounts.length} mais...
        </div>
      )}

      <button
        onClick={() => setShowAddAccount(true)}
        className="w-full flex items-center justify-center space-x-1.5 mt-2 p-2 rounded border border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10 transition-colors group"
      >
        <Plus size={14} className="text-blue-400 group-hover:text-blue-300" />
        <span className="text-xs font-medium text-blue-400 group-hover:text-blue-300">
          Adicionar Conta
        </span>
      </button>
    </div>
  );
};

/**
 * Main SidebarSection Component
 * Renders collapsible sections for sidebar
 */
export const SidebarSection: React.FC<SidebarSectionProps> = ({
  title,
  section,
  isExpanded,
  onToggle,
  icon,
}) => {
  const renderContent = () => {
    switch (section) {
      case 'BUDGET':
        return <BudgetSection isExpanded={isExpanded} onToggle={onToggle} />;
      case 'ACCOUNTS':
        return <AccountsSection isExpanded={isExpanded} onToggle={onToggle} />;
      case 'TRANSACTIONS':
      case 'INSTALLMENTS':
        return <div className="text-xs text-gray-400">Em desenvolvimento...</div>;
      default:
        return null;
    }
  };

  return (
    <div className="border-b border-gray-100 dark:border-white/10">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors group"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center space-x-2">
          <div className="text-gray-400 group-hover:text-gray-300">{icon}</div>
          <span className="text-sm font-semibold text-gray-300 group-hover:text-white">
            {title}
          </span>
        </div>
        <ChevronDown
          size={16}
          className={`text-gray-400 transition-transform duration-300 ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isExpanded && (
        <div className="px-4 py-3 bg-white/2 space-y-2 max-h-[400px] overflow-y-auto">
          {renderContent()}
        </div>
      )}
    </div>
  );
};
