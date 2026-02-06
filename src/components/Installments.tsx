/**
 * Installments Component
 * STY-052: Dedicated page for viewing and managing installment payments
 *
 * Features:
 * - Lists all active installments from credit cards and transactions
 * - Monthly limit configuration for installment spending
 * - Visual alerts when approaching or exceeding limit
 * - Filters by card/account and status
 * - Sorting by due date, value
 */

import React, { useState, useMemo } from 'react';
import { useSafeFinance } from '../hooks/useSafeFinance';
import { formatCurrency, formatDate } from '../utils';
import { Calendar, CreditCard, AlertTriangle, CheckCircle, Clock, Filter, ArrowUpDown, Edit2 } from 'lucide-react';
import { getOwnerDisplayName } from '../utils/ownerUtils';

interface InstallmentView {
  id: string;
  description: string;
  amount: number;
  currentInstallment: number;
  totalInstallments: number;
  dueDate: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
  cardId?: string;
  cardName?: string;
  cardOwner?: string;
  transactionId: string;
  groupId: string;
}

type SortOption = 'dueDate' | 'amount' | 'card';
type FilterStatus = 'ALL' | 'PENDING' | 'PAID' | 'OVERDUE';

export const Installments: React.FC = () => {
  const { transactions, accounts, userProfile } = useSafeFinance();

  // State for monthly limit
  const [monthlyLimit, setMonthlyLimit] = useState<number>(
    () => {
      const saved = localStorage.getItem('spfp_installment_limit');
      return saved ? parseFloat(saved) : 3000;
    }
  );
  const [isEditingLimit, setIsEditingLimit] = useState(false);
  const [tempLimit, setTempLimit] = useState(monthlyLimit.toString());

  // Filters
  const [filterCard, setFilterCard] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('dueDate');

  // Get credit cards
  const creditCards = useMemo(() =>
    (Array.isArray(accounts) ? accounts : []).filter(a => a.type === 'CREDIT_CARD'),
    [accounts]
  );

  // Aggregate installments from transactions
  const installments = useMemo(() => {
    const safeTransactions = Array.isArray(transactions) ? transactions : [];

    // Group transactions by groupId for installments
    const installmentGroups = safeTransactions.filter(
      t => t.groupType === 'INSTALLMENT' && t.groupId
    );

    // Create installment views
    const views: InstallmentView[] = installmentGroups.map(t => {
      const card = creditCards.find(c => c.id === t.accountId);
      const ownerName = card ? getOwnerDisplayName(card.owner, userProfile) : '';

      // Determine status based on date and paid flag
      const dueDate = new Date(t.date);
      const today = new Date();
      let status: 'PENDING' | 'PAID' | 'OVERDUE' = 'PENDING';
      if (t.paid) {
        status = 'PAID';
      } else if (dueDate < today) {
        status = 'OVERDUE';
      }

      return {
        id: t.id,
        description: t.description,
        amount: Math.abs(t.value),
        currentInstallment: t.groupIndex || 1,
        totalInstallments: t.groupTotal || 1,
        dueDate: t.date,
        status,
        cardId: t.accountId,
        cardName: card?.name || 'Conta',
        cardOwner: ownerName,
        transactionId: t.id,
        groupId: t.groupId || t.id,
      };
    });

    return views;
  }, [transactions, creditCards, userProfile]);

  // Filter and sort
  const filteredInstallments = useMemo(() => {
    let result = [...installments];

    // Filter by card
    if (filterCard !== 'ALL') {
      result = result.filter(i => i.cardId === filterCard);
    }

    // Filter by status
    if (filterStatus !== 'ALL') {
      result = result.filter(i => i.status === filterStatus);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'amount':
          return b.amount - a.amount;
        case 'card':
          return (a.cardName || '').localeCompare(b.cardName || '');
        default:
          return 0;
      }
    });

    return result;
  }, [installments, filterCard, filterStatus, sortBy]);

  // Calculate totals
  const totalPendingAmount = useMemo(() =>
    filteredInstallments
      .filter(i => i.status === 'PENDING' || i.status === 'OVERDUE')
      .reduce((sum, i) => sum + i.amount, 0),
    [filteredInstallments]
  );

  const limitPercentage = monthlyLimit > 0 ? (totalPendingAmount / monthlyLimit) * 100 : 0;
  const isNearLimit = limitPercentage >= 80 && limitPercentage < 100;
  const isOverLimit = limitPercentage >= 100;

  // Save limit
  const handleSaveLimit = () => {
    const value = parseFloat(tempLimit) || 0;
    setMonthlyLimit(value);
    localStorage.setItem('spfp_installment_limit', value.toString());
    setIsEditingLimit(false);
  };

  // Get status icon
  const getStatusIcon = (status: InstallmentView['status']) => {
    switch (status) {
      case 'PAID':
        return <CheckCircle size={16} className="text-emerald-500" />;
      case 'OVERDUE':
        return <AlertTriangle size={16} className="text-red-500" />;
      default:
        return <Clock size={16} className="text-amber-500" />;
    }
  };

  // Get days until due
  const getDaysUntil = (dateStr: string) => {
    const due = new Date(dateStr);
    const today = new Date();
    const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <main className="p-4 md:p-6 min-h-full space-y-6 animate-fade-in pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <span>📅</span> Parcelamentos
          </h1>
          <p className="text-gray-500 mt-1">
            Gerencie suas parcelas e controle seus gastos
          </p>
        </div>
      </div>

      {/* Limit Card */}
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-500 font-medium">Limite Mensal de Parcelas</p>
            {isEditingLimit ? (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-gray-500">R$</span>
                <input
                  type="number"
                  value={tempLimit}
                  onChange={(e) => setTempLimit(e.target.value)}
                  className="w-32 p-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-xl font-bold text-gray-900 dark:text-white"
                  autoFocus
                />
                <button
                  onClick={handleSaveLimit}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700"
                >
                  Salvar
                </button>
                <button
                  onClick={() => {
                    setIsEditingLimit(false);
                    setTempLimit(monthlyLimit.toString());
                  }}
                  className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-bold"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(monthlyLimit)}
                </span>
                <button
                  onClick={() => setIsEditingLimit(true)}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <Edit2 size={16} />
                </button>
              </div>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 font-medium">Total em Parcelas</p>
            <p className={`text-2xl font-bold ${isOverLimit ? 'text-red-500' : isNearLimit ? 'text-amber-500' : 'text-gray-900 dark:text-white'}`}>
              {formatCurrency(totalPendingAmount)}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative">
          <div className="w-full bg-gray-100 dark:bg-gray-800 h-3 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isOverLimit ? 'bg-red-500' : isNearLimit ? 'bg-amber-500' : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min(limitPercentage, 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>{Math.round(limitPercentage)}% utilizado</span>
            <span>{formatCurrency(Math.max(monthlyLimit - totalPendingAmount, 0))} disponível</span>
          </div>
        </div>

        {/* Alert */}
        {(isNearLimit || isOverLimit) && (
          <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${
            isOverLimit
              ? 'bg-red-500/10 border border-red-500/20 text-red-500'
              : 'bg-amber-500/10 border border-amber-500/20 text-amber-500'
          }`}>
            <AlertTriangle size={18} />
            <span className="text-sm font-medium">
              {isOverLimit
                ? 'Limite ultrapassado! Considere renegociar suas parcelas.'
                : 'Atenção: Você está próximo do seu limite mensal de parcelas.'}
            </span>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-500" />
          <select
            value={filterCard}
            onChange={(e) => setFilterCard(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300"
          >
            <option value="ALL">Todos os Cartões</option>
            {creditCards.map(card => (
              <option key={card.id} value={card.id}>
                {card.name} - {getOwnerDisplayName(card.owner, userProfile)}
              </option>
            ))}
          </select>
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
          className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300"
        >
          <option value="ALL">Todos os Status</option>
          <option value="PENDING">Pendentes</option>
          <option value="PAID">Pagas</option>
          <option value="OVERDUE">Atrasadas</option>
        </select>

        <div className="flex items-center gap-2">
          <ArrowUpDown size={16} className="text-gray-500" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300"
          >
            <option value="dueDate">Ordenar por Vencimento</option>
            <option value="amount">Ordenar por Valor</option>
            <option value="card">Ordenar por Cartão</option>
          </select>
        </div>
      </div>

      {/* Installments List */}
      <div className="space-y-4">
        {filteredInstallments.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
            <Calendar size={48} className="mx-auto text-gray-300 dark:text-gray-700 mb-4" />
            <p className="text-gray-500 font-medium">Nenhuma parcela encontrada</p>
            <p className="text-sm text-gray-400 mt-1">
              Suas compras parceladas aparecerão aqui
            </p>
          </div>
        ) : (
          filteredInstallments.map((installment) => {
            const daysUntil = getDaysUntil(installment.dueDate);
            const isLastInstallment = installment.currentInstallment === installment.totalInstallments;

            return (
              <div
                key={installment.id}
                className="bg-white dark:bg-[#0f172a] rounded-xl p-4 border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Card indicator */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <CreditCard size={20} className="text-white" />
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">
                        {installment.description}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {installment.cardName} - {installment.cardOwner}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatCurrency(installment.amount)}
                    </p>
                    <div className="flex items-center gap-2 justify-end">
                      <span className="text-xs font-bold bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded">
                        {installment.currentInstallment}/{installment.totalInstallments}
                      </span>
                      {getStatusIcon(installment.status)}
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Calendar size={14} />
                    <span>Vence: {formatDate(installment.dueDate)}</span>
                  </div>

                  {installment.status === 'PENDING' && (
                    <span className={`text-xs font-medium ${
                      daysUntil < 0 ? 'text-red-500' :
                      daysUntil <= 7 ? 'text-amber-500' :
                      'text-gray-500'
                    }`}>
                      {daysUntil < 0
                        ? `Atrasada há ${Math.abs(daysUntil)} dias`
                        : daysUntil === 0
                        ? 'Vence hoje!'
                        : `Em ${daysUntil} dias`}
                    </span>
                  )}

                  {isLastInstallment && installment.status === 'PENDING' && (
                    <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">
                      Última parcela!
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Summary */}
      {filteredInstallments.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {filteredInstallments.filter(i => i.status === 'PENDING').length}
              </p>
              <p className="text-xs text-gray-500">Pendentes</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-500">
                {filteredInstallments.filter(i => i.status === 'PAID').length}
              </p>
              <p className="text-xs text-gray-500">Pagas</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-500">
                {filteredInstallments.filter(i => i.status === 'OVERDUE').length}
              </p>
              <p className="text-xs text-gray-500">Atrasadas</p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Installments;
