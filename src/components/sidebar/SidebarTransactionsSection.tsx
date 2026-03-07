/**
 * SidebarTransactionsSection Component (STY-052)
 * Displays recent unconfirmed transactions
 *
 * Features:
 * - Category icon + description
 * - Amount (right-aligned)
 * - Status badge (pending/confirmed)
 * - Date display (pt-BR format)
 * - Max 5 transactions
 * - Quick confirm via right-click (future)
 *
 * Design: docs/design/FASE-1-MOCKUPS.md (Transactions Section Details)
 */

import React, { useMemo, memo, useCallback } from 'react';
import { CheckCircle2, Clock } from 'lucide-react';
import { mockTransactions, formatCurrency, getStatusBadgeColor } from '../../constants/mockSidebarData';
import { colorTokens } from '../../styles/tokens';

/**
 * Transaction Item Component
 */
interface TransactionItemProps {
  emoji: string;
  description: string;
  amount: number;
  date: string;
  status: 'pending' | 'confirmed';
  onConfirm?: () => void;
}

const TransactionItem: React.FC<TransactionItemProps> = memo(({
  emoji,
  description,
  amount,
  date,
  status,
  onConfirm
}) => {
  const { bg, text } = getStatusBadgeColor(status);

  return (
    <div
      className="p-3 rounded-lg hover:bg-white/5 transition-all duration-200 group cursor-pointer"
      onContextMenu={(e) => {
        e.preventDefault();
        if (status === 'pending' && onConfirm) {
          onConfirm();
        }
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-lg flex-shrink-0">{emoji}</span>
          <span className="text-sm font-medium text-slate-100 truncate">
            {description}
          </span>
        </div>
        <span className="text-sm font-semibold text-rose-400 flex-shrink-0 ml-2">
          -{formatCurrency(amount)}
        </span>
      </div>

      {/* Date and Status */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs text-slate-400">{date}</span>
        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${bg}`}>
          {status === 'pending' ? (
            <>
              <Clock size={12} className={text} />
              <span className={`text-xs font-medium ${text}`}>Pendente</span>
            </>
          ) : (
            <>
              <CheckCircle2 size={12} className={text} />
              <span className={`text-xs font-medium ${text}`}>Confirmado</span>
            </>
          )}
        </div>
      </div>

      {/* Helper text for pending transactions */}
      {status === 'pending' && (
        <p className="text-xs text-slate-500 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          Clique com botão direito para confirmar
        </p>
      )}
    </div>
  );
});

TransactionItem.displayName = 'TransactionItem';

/**
 * SidebarTransactionsSection Component
 * Shows recent unconfirmed transactions (max 5)
 */
export const SidebarTransactionsSection: React.FC = memo(() => {
  const recentTransactions = useMemo(() => {
    // Sort by date (today first) and show max 5
    return mockTransactions
      .sort((a, b) => {
        const dateOrder = { 'pending': -1, 'confirmed': 1 };
        return (dateOrder[a.status] ?? 0) - (dateOrder[b.status] ?? 0);
      })
      .slice(0, 5);
  }, []);

  const handleConfirmTransaction = useCallback((txnId: string) => {
    // TODO: Mark transaction as confirmed
    console.log('Confirm transaction:', txnId);
  }, []);

  return (
    <div className="space-y-2">
      {recentTransactions.length === 0 ? (
        <div
          className="p-4 rounded-lg text-center"
          style={{
            backgroundColor: colorTokens.slate[800],
            color: colorTokens.slate[400]
          }}
        >
          <p className="text-sm">Sem lançamentos recentes</p>
        </div>
      ) : (
        recentTransactions.map((txn) => (
          <TransactionItem
            key={txn.id}
            emoji={txn.categoryEmoji}
            description={txn.description}
            amount={txn.amount}
            date={txn.date}
            status={txn.status}
            onConfirm={() => handleConfirmTransaction(txn.id)}
          />
        ))
      )}

      {/* Link to view all transactions */}
      <button
        onClick={() => window.location.href = '/transactions'}
        className="w-full mt-3 p-2 text-center text-xs font-medium text-blue-400 hover:text-blue-300 rounded-lg transition-colors duration-200 hover:bg-blue-500/10"
        aria-label="Ver todos os lançamentos"
      >
        Ver Todos os Lançamentos →
      </button>
    </div>
  );
});

SidebarTransactionsSection.displayName = 'SidebarTransactionsSection';

export default SidebarTransactionsSection;
