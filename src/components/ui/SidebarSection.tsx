/**
 * SidebarSection Component
 * FASE 1: STY-053 (Budget) + STY-054 (Accounts) + STY-055 (Transactions & Installments)
 *
 * Displays expandable sections for Budget, Accounts, Transactions, and Installments
 * in the sidebar with real-time updates
 */

import React, { useMemo, useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Plus, Check, Clock } from 'lucide-react';
import { BankLogo } from '../BankLogo';
import { formatCurrency, formatDate } from '../../utils';

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
  const { transactions, categoryBudgets, categories } = useSafeFinance();
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
  const { accounts } = useSafeFinance();
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
 * STY-055: Transactions Section Component
 * Shows last 5 unconfirmed transactions
 */
const TransactionsSection: React.FC<{ isExpanded: boolean; onToggle: () => void }> = ({
  isExpanded,
  onToggle,
}) => {
  const { transactions, updateTransactions, categories } = useSafeFinance();
  const navigate = useNavigate();

  // Get last 5 unconfirmed transactions
  const pendingTransactions = useMemo(() => {
    return transactions
      .filter((t) => !t.confirmed)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [transactions]);

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || 'Outro';
  };

  const handleConfirm = (transactionId: string) => {
    const transaction = transactions.find((t) => t.id === transactionId);
    if (transaction) {
      updateTransactions([{ ...transaction, confirmed: true }]);
    }
  };

  return (
    <div className="space-y-2 max-h-64 overflow-y-auto">
      {pendingTransactions.length === 0 ? (
        <div className="text-xs text-gray-400 text-center py-2">Sem lançamentos pendentes</div>
      ) : (
        pendingTransactions.map((tx) => (
          <div
            key={tx.id}
            className="flex items-start justify-between p-2 hover:bg-white/5 rounded transition-colors group"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-1">
                <Clock size={12} className="text-yellow-400 flex-shrink-0" />
                <span className="text-xs font-medium text-gray-300 truncate">
                  {getCategoryName(tx.categoryId)}
                </span>
              </div>
              <div className="text-[10px] text-gray-500">{formatDate(tx.date)}</div>
              <div className="text-xs font-semibold text-red-400">{formatCurrency(tx.amount)}</div>
            </div>
            <button
              onClick={() => handleConfirm(tx.id)}
              className="ml-2 p-1 rounded bg-green-500/10 hover:bg-green-500/20 transition-colors opacity-0 group-hover:opacity-100"
              title="Confirmar"
            >
              <Check size={12} className="text-green-400" />
            </button>
          </div>
        ))
      )}
    </div>
  );
};

/**
 * STY-055: Installments Section Component
 * Shows grouped installments in open status
 */
const InstallmentsSection: React.FC<{ isExpanded: boolean; onToggle: () => void }> = ({
  isExpanded,
  onToggle,
}) => {
  const { transactions, categories } = useSafeFinance();

  // Get grouped installments
  const installmentGroups = useMemo(() => {
    const grouped: Record<string, typeof transactions> = {};
    transactions
      .filter((t) => t.groupId && !t.confirmed)
      .forEach((t) => {
        if (!grouped[t.groupId!]) {
          grouped[t.groupId!] = [];
        }
        grouped[t.groupId!].push(t);
      });
    return Object.entries(grouped).slice(0, 5);
  }, [transactions]);

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || 'Outro';
  };

  return (
    <div className="space-y-3 max-h-64 overflow-y-auto">
      {installmentGroups.length === 0 ? (
        <div className="text-xs text-gray-400 text-center py-2">Sem parcelamentos em aberto</div>
      ) : (
        installmentGroups.map(([groupId, txs]) => {
          const firstTx = txs[0];
          const totalValue = txs.reduce((sum, t) => sum + t.amount, 0);
          return (
            <div key={groupId} className="p-2 rounded border border-gray-300/10 hover:border-gray-300/20 transition-colors">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-gray-300">
                  {getCategoryName(firstTx.categoryId)}
                </span>
                <span className="text-[10px] text-gray-400">{txs.length}x</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-[10px] text-gray-500">{formatDate(firstTx.date)}</div>
                <div className="text-xs font-bold text-orange-400">{formatCurrency(totalValue)}</div>
              </div>
              <div className="mt-1 text-[9px] text-gray-500">
                Próxima: {txs.length > 1 ? formatDate(txs[1].date) : 'Finalizado'}
              </div>
            </div>
          );
        })
      )}
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
        return <TransactionsSection isExpanded={isExpanded} onToggle={onToggle} />;
      case 'INSTALLMENTS':
        return <InstallmentsSection isExpanded={isExpanded} onToggle={onToggle} />;
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
