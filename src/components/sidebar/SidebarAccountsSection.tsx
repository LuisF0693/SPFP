/**
 * SidebarAccountsSection Component (STY-052)
 * Displays account balances with bank icons
 *
 * Features:
 * - Bank logo + account type
 * - Balance display (color-coded: positive/negative/zero)
 * - Max 8 visible accounts (scroll if more)
 * - Click account → Filter TransactionList
 * - Add button → Open AccountForm modal
 *
 * Design: docs/design/FASE-1-MOCKUPS.md (Accounts Section Details)
 */

import React, { useMemo, memo, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { mockAccounts, formatCurrency } from '../../constants/mockSidebarData';
import { colorTokens } from '../../styles/tokens';

/**
 * Account Item Component
 */
interface AccountItemProps {
  name: string;
  bank: string;
  balance: number;
  type: 'checking' | 'savings' | 'investment' | 'credit';
  onClick: (bank: string) => void;
}

const AccountItem: React.FC<AccountItemProps> = memo(({
  name,
  bank,
  balance,
  type,
  onClick
}) => {
  const getBalanceColor = useCallback(() => {
    if (balance > 0) return 'text-emerald-400';
    if (balance < 0) return 'text-rose-400';
    return 'text-slate-400';
  }, [balance]);

  const getAccountTypeLabel = useCallback(() => {
    const labels: Record<string, string> = {
      checking: 'Corrente',
      savings: 'Poupança',
      investment: 'Investimento',
      credit: 'Crédito'
    };
    return labels[type] || type;
  }, [type]);

  return (
    <button
      onClick={() => onClick(bank)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(bank);
        }
      }}
      className="w-full p-3 rounded-lg transition-all duration-200 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-blue-500 group text-left"
      aria-label={`${bank} - ${name}: ${formatCurrency(balance)}`}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-blue-400">
              {bank.substring(0, 2).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-100 truncate">
              {bank}
            </p>
            <p className="text-xs text-slate-400">
              {getAccountTypeLabel()}
            </p>
          </div>
        </div>
      </div>
      <div className={`text-right font-semibold ${getBalanceColor()}`}>
        {formatCurrency(balance)}
      </div>
    </button>
  );
});

AccountItem.displayName = 'AccountItem';

/**
 * SidebarAccountsSection Component
 * Shows account balances (max 8 visible with scroll)
 */
export const SidebarAccountsSection: React.FC = memo(() => {
  const visibleAccounts = useMemo(() => {
    return mockAccounts.slice(0, 8);
  }, []);

  const handleAccountClick = useCallback((bank: string) => {
    // TODO: Filter TransactionList by account
    console.log('Account clicked:', bank);
  }, []);

  const handleAddAccount = useCallback(() => {
    // TODO: Open AccountForm modal
    console.log('Add account clicked');
  }, []);

  return (
    <div className="space-y-2">
      {/* Accounts List - Scrollable */}
      <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
        {visibleAccounts.length === 0 ? (
          <div
            className="p-4 rounded-lg text-center"
            style={{
              backgroundColor: colorTokens.slate[800],
              color: colorTokens.slate[400]
            }}
          >
            <p className="text-sm">Nenhuma conta adicionada</p>
          </div>
        ) : (
          visibleAccounts.map((account) => (
            <AccountItem
              key={account.id}
              name={account.name}
              bank={account.bank}
              balance={account.balance}
              type={account.type}
              onClick={handleAccountClick}
            />
          ))
        )}
      </div>

      {/* Add Account Button */}
      <button
        onClick={handleAddAccount}
        className="w-full p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 transition-all duration-200 flex items-center justify-center gap-2 text-xs font-medium"
        aria-label="Adicionar nova conta"
      >
        <Plus size={16} />
        Adicionar Conta
      </button>
    </div>
  );
});

SidebarAccountsSection.displayName = 'SidebarAccountsSection';

export default SidebarAccountsSection;
