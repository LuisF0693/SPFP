/**
 * Installments Component v2
 * Stories 3.2 + 3.3 + 3.4
 *
 * Features:
 * - Status visual: verde (paga), vermelho (atrasada), amarelo (pendente)
 * - Sub-abas por cartão com parcelas agrupadas (accordion)
 * - Navegação mensal (< Mês >)
 * - Visualização anual (totais por mês)
 * - Barra de limite do cartão (usado vs total)
 * - Contadores por status
 */

import React, { useState, useMemo } from 'react';
import { useSafeFinance } from '../hooks/useSafeFinance';
import { formatCurrency, formatDate } from '../utils';
import {
  Calendar,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  BarChart2,
  List,
} from 'lucide-react';
import { getOwnerDisplayName } from '../utils/ownerUtils';

interface InstallmentView {
  id: string;
  description: string;
  amount: number;
  currentInstallment: number;
  totalInstallments: number;
  dueDate: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
  cardId: string;
  cardName: string;
  cardOwner: string;
  transactionId: string;
  groupId: string;
}

type ViewMode = 'monthly' | 'by_card' | 'annual';

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

export const Installments: React.FC = () => {
  const { transactions, accounts, userProfile } = useSafeFinance();

  const today = new Date();

  // View mode
  const [viewMode, setViewMode] = useState<ViewMode>('by_card');

  // Monthly navigation
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  // Expanded cards (for by_card mode)
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const toggleCard = (cardId: string) => {
    setExpandedCards(prev => {
      const next = new Set(prev);
      if (next.has(cardId)) next.delete(cardId);
      else next.add(cardId);
      return next;
    });
  };

  const navigateMonth = (dir: -1 | 1) => {
    let m = selectedMonth + dir;
    let y = selectedYear;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setSelectedMonth(m);
    setSelectedYear(y);
  };

  // Get credit cards
  const creditCards = useMemo(() =>
    (Array.isArray(accounts) ? accounts : []).filter(a => a.type === 'CREDIT_CARD'),
    [accounts]
  );

  // All installments (no date filter)
  const allInstallments = useMemo(() => {
    const safeTransactions = Array.isArray(transactions) ? transactions : [];

    const installmentGroups = safeTransactions.filter(
      t => t.groupType === 'INSTALLMENT' && t.groupId
    );

    return installmentGroups.map(t => {
      const card = creditCards.find(c => c.id === t.accountId);
      const ownerName = card ? getOwnerDisplayName(card.owner, userProfile) : '';
      const dueDate = new Date(t.date);

      let status: InstallmentView['status'] = 'PENDING';
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
        cardId: t.accountId || '',
        cardName: card?.name || 'Conta',
        cardOwner: ownerName,
        transactionId: t.id,
        groupId: t.groupId || t.id,
      };
    });
  }, [transactions, creditCards, userProfile]);

  // Monthly view: installments for the selected month
  const monthlyInstallments = useMemo(() =>
    allInstallments.filter(i => {
      const d = new Date(i.dueDate);
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    }),
    [allInstallments, selectedMonth, selectedYear]
  );

  // Annual view: sum by month for current year
  const annualData = useMemo(() => {
    return MONTH_NAMES.map((name, idx) => {
      const monthItems = allInstallments.filter(i => {
        const d = new Date(i.dueDate);
        return d.getMonth() === idx && d.getFullYear() === selectedYear;
      });
      return {
        month: name,
        total: monthItems.reduce((s, i) => s + i.amount, 0),
        paid: monthItems.filter(i => i.status === 'PAID').reduce((s, i) => s + i.amount, 0),
        pending: monthItems.filter(i => i.status !== 'PAID').reduce((s, i) => s + i.amount, 0),
        count: monthItems.length,
      };
    });
  }, [allInstallments, selectedYear]);

  // By-card view: installments grouped by card (showing selected month)
  const byCardData = useMemo(() => {
    const activeInstallments = monthlyInstallments;
    const cardMap: Record<string, { card: typeof creditCards[0]; items: InstallmentView[] }> = {};

    activeInstallments.forEach(i => {
      const card = creditCards.find(c => c.id === i.cardId);
      if (!cardMap[i.cardId]) {
        cardMap[i.cardId] = { card: card!, items: [] };
      }
      cardMap[i.cardId].items.push(i);
    });

    // Also include cards with no installments in selected month (to show empty state)
    creditCards.forEach(card => {
      if (!cardMap[card.id]) {
        cardMap[card.id] = { card, items: [] };
      }
    });

    return Object.values(cardMap).filter(g => g.card);
  }, [monthlyInstallments, creditCards]);

  // Status badge
  const StatusBadge: React.FC<{ status: InstallmentView['status'] }> = ({ status }) => {
    const configs = {
      PAID: { label: 'Paga', bg: 'bg-emerald-500/15', text: 'text-emerald-400', icon: <CheckCircle size={12} /> },
      OVERDUE: { label: 'Atrasada', bg: 'bg-red-500/15', text: 'text-red-400', icon: <AlertTriangle size={12} /> },
      PENDING: { label: 'Pendente', bg: 'bg-amber-500/15', text: 'text-amber-400', icon: <Clock size={12} /> },
    };
    const c = configs[status];
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${c.bg} ${c.text}`}>
        {c.icon} {c.label}
      </span>
    );
  };

  // Card limit bar
  const CardLimitBar: React.FC<{ card: typeof creditCards[0] }> = ({ card }) => {
    if (!card?.creditLimit) return null;
    const cardTx = (Array.isArray(transactions) ? transactions : []).filter(
      t => t.accountId === card.id && !t.deletedAt && t.type === 'EXPENSE'
    );
    const used = cardTx.reduce((s, t) => s + t.value, 0);
    const pct = Math.min((used / card.creditLimit) * 100, 100);
    const barColor = pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-emerald-500';
    return (
      <div className="mt-2">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Limite usado: {formatCurrency(used)}</span>
          <span>Limite total: {formatCurrency(card.creditLimit)}</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
        </div>
        <div className="text-right text-xs text-gray-500 mt-0.5">{Math.round(pct)}% utilizado</div>
      </div>
    );
  };

  // Installment row
  const InstallmentRow: React.FC<{ item: InstallmentView }> = ({ item }) => {
    const daysUntil = Math.ceil(
      (new Date(item.dueDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    return (
      <div className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
        item.status === 'PAID'
          ? 'bg-emerald-500/5 border-emerald-500/20 opacity-80'
          : item.status === 'OVERDUE'
          ? 'bg-red-500/5 border-red-500/20'
          : 'bg-white dark:bg-gray-900/50 border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
      }`}>
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
            item.status === 'PAID' ? 'bg-emerald-500/20' :
            item.status === 'OVERDUE' ? 'bg-red-500/20' : 'bg-blue-500/20'
          }`}>
            {item.status === 'PAID'
              ? <CheckCircle size={16} className="text-emerald-500" />
              : item.status === 'OVERDUE'
              ? <AlertTriangle size={16} className="text-red-500" />
              : <Clock size={16} className="text-blue-500" />
            }
          </div>
          <div className="min-w-0">
            <p className={`font-semibold text-sm truncate ${
              item.status === 'PAID' ? 'text-gray-500 line-through' : 'text-gray-900 dark:text-white'
            }`}>
              {item.description}
            </p>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-xs text-gray-500">{formatDate(item.dueDate)}</span>
              <span className="text-xs font-bold bg-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded">
                {item.currentInstallment}/{item.totalInstallments}
              </span>
              {item.status === 'PENDING' && daysUntil <= 7 && daysUntil >= 0 && (
                <span className="text-xs font-medium text-amber-500">
                  {daysUntil === 0 ? 'Vence hoje!' : `${daysUntil}d`}
                </span>
              )}
              {item.status === 'OVERDUE' && (
                <span className="text-xs font-medium text-red-500">
                  {Math.abs(daysUntil)}d atrasada
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-2">
          <p className={`font-bold text-sm ${
            item.status === 'PAID' ? 'text-gray-400 line-through' : 'text-gray-900 dark:text-white'
          }`}>
            {formatCurrency(item.amount)}
          </p>
          <StatusBadge status={item.status} />
        </div>
      </div>
    );
  };

  const currentInstallments = viewMode === 'by_card' ? monthlyInstallments : monthlyInstallments;
  const totalPaid = currentInstallments.filter(i => i.status === 'PAID').length;
  const totalOverdue = currentInstallments.filter(i => i.status === 'OVERDUE').length;
  const totalPending = currentInstallments.filter(i => i.status === 'PENDING').length;
  const totalAmount = currentInstallments.reduce((s, i) => s + i.amount, 0);

  return (
    <main className="p-4 md:p-6 min-h-full space-y-5 animate-fade-in pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CreditCard size={24} className="text-blue-500" /> Parcelamentos
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Gerencie suas parcelas e controle seus gastos</p>
        </div>

        {/* View mode tabs */}
        <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
          {[
            { key: 'by_card', label: 'Por Cartão', icon: <CreditCard size={14} /> },
            { key: 'monthly', label: 'Mensal', icon: <List size={14} /> },
            { key: 'annual', label: 'Anual', icon: <BarChart2 size={14} /> },
          ].map(v => (
            <button
              key={v.key}
              onClick={() => setViewMode(v.key as ViewMode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === v.key
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {v.icon} {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Month navigation (not shown in annual view) */}
      {viewMode !== 'annual' && (
        <div className="flex items-center justify-between bg-white dark:bg-gray-900/50 rounded-xl p-3 border border-gray-100 dark:border-gray-800">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ChevronLeft size={18} className="text-gray-600 dark:text-gray-400" />
          </button>
          <div className="text-center">
            <p className="font-bold text-gray-900 dark:text-white">
              {MONTH_NAMES[selectedMonth]} {selectedYear}
            </p>
            {selectedMonth === today.getMonth() && selectedYear === today.getFullYear() && (
              <p className="text-xs text-blue-500 font-medium">Mês atual</p>
            )}
          </div>
          <button
            onClick={() => navigateMonth(1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ChevronRight size={18} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      )}

      {/* Annual view */}
      {viewMode === 'annual' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-bold text-gray-900 dark:text-white">Visão Anual — {selectedYear}</h2>
            <div className="flex gap-2">
              <button onClick={() => setSelectedYear(y => y - 1)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                <ChevronLeft size={16} />
              </button>
              <button onClick={() => setSelectedYear(y => y + 1)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
          {annualData.map((month, idx) => {
            const maxTotal = Math.max(...annualData.map(m => m.total), 1);
            const barWidth = (month.total / maxTotal) * 100;
            const isCurrentMonth = idx === today.getMonth() && selectedYear === today.getFullYear();
            return (
              <div
                key={month.month}
                className={`bg-white dark:bg-gray-900/50 rounded-xl p-3 border cursor-pointer transition-all hover:border-blue-300 dark:hover:border-blue-600 ${
                  isCurrentMonth ? 'border-blue-300 dark:border-blue-700' : 'border-gray-100 dark:border-gray-800'
                }`}
                onClick={() => { setSelectedMonth(idx); setViewMode('by_card'); }}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${isCurrentMonth ? 'text-blue-500' : 'text-gray-700 dark:text-gray-300'}`}>
                      {month.month}
                    </span>
                    {isCurrentMonth && <span className="text-xs bg-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded font-bold">Atual</span>}
                    {month.count > 0 && (
                      <span className="text-xs text-gray-400">{month.count} parcela{month.count > 1 ? 's' : ''}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {month.paid > 0 && <span className="text-xs font-bold text-emerald-500">{formatCurrency(month.paid)} pago</span>}
                    <span className={`text-sm font-bold ${month.total === 0 ? 'text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                      {formatCurrency(month.total)}
                    </span>
                  </div>
                </div>
                {month.total > 0 && (
                  <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden flex">
                    <div className="h-full bg-emerald-500 transition-all" style={{ width: `${(month.paid / month.total) * barWidth}%` }} />
                    <div className="h-full bg-amber-500 transition-all" style={{ width: `${(month.pending / month.total) * barWidth}%` }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Monthly view */}
      {viewMode === 'monthly' && (
        <div className="space-y-3">
          {/* Counters */}
          {currentInstallments.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-amber-500/10 rounded-xl p-3 text-center border border-amber-500/20">
                <p className="text-xl font-bold text-amber-500">{totalPending}</p>
                <p className="text-xs text-gray-500 mt-0.5">Pendentes</p>
              </div>
              <div className="bg-emerald-500/10 rounded-xl p-3 text-center border border-emerald-500/20">
                <p className="text-xl font-bold text-emerald-500">{totalPaid}</p>
                <p className="text-xs text-gray-500 mt-0.5">Pagas</p>
              </div>
              <div className="bg-red-500/10 rounded-xl p-3 text-center border border-red-500/20">
                <p className="text-xl font-bold text-red-500">{totalOverdue}</p>
                <p className="text-xs text-gray-500 mt-0.5">Atrasadas</p>
              </div>
            </div>
          )}

          {currentInstallments.length === 0 ? (
            <div className="text-center py-14 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
              <Calendar size={40} className="mx-auto text-gray-300 dark:text-gray-700 mb-3" />
              <p className="text-gray-500 font-medium">Nenhuma parcela em {MONTH_NAMES[selectedMonth]}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {currentInstallments
                .sort((a, b) => {
                  const order = { OVERDUE: 0, PENDING: 1, PAID: 2 };
                  return order[a.status] - order[b.status];
                })
                .map(item => <InstallmentRow key={item.id} item={item} />)
              }
            </div>
          )}

          {currentInstallments.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-3 border border-gray-200 dark:border-gray-800 flex justify-between">
              <span className="text-sm text-gray-500 font-medium">Total do mês</span>
              <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(totalAmount)}</span>
            </div>
          )}
        </div>
      )}

      {/* By Card view */}
      {viewMode === 'by_card' && (
        <div className="space-y-3">
          {/* Counters */}
          {currentInstallments.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-amber-500/10 rounded-xl p-3 text-center border border-amber-500/20">
                <p className="text-xl font-bold text-amber-500">{totalPending}</p>
                <p className="text-xs text-gray-500 mt-0.5">Pendentes</p>
              </div>
              <div className="bg-emerald-500/10 rounded-xl p-3 text-center border border-emerald-500/20">
                <p className="text-xl font-bold text-emerald-500">{totalPaid}</p>
                <p className="text-xs text-gray-500 mt-0.5">Pagas</p>
              </div>
              <div className="bg-red-500/10 rounded-xl p-3 text-center border border-red-500/20">
                <p className="text-xl font-bold text-red-500">{totalOverdue}</p>
                <p className="text-xs text-gray-500 mt-0.5">Atrasadas</p>
              </div>
            </div>
          )}

          {byCardData.length === 0 ? (
            <div className="text-center py-14 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
              <CreditCard size={40} className="mx-auto text-gray-300 dark:text-gray-700 mb-3" />
              <p className="text-gray-500 font-medium">Nenhum cartão de crédito cadastrado</p>
              <p className="text-sm text-gray-400 mt-1">Adicione um cartão para gerenciar seus parcelamentos</p>
            </div>
          ) : (
            byCardData.map(({ card, items }) => {
              const isExpanded = expandedCards.has(card.id);
              const cardPaid = items.filter(i => i.status === 'PAID').length;
              const cardOverdue = items.filter(i => i.status === 'OVERDUE').length;
              const cardPending = items.filter(i => i.status === 'PENDING').length;
              const cardTotal = items.reduce((s, i) => s + i.amount, 0);

              return (
                <div
                  key={card.id}
                  className={`bg-white dark:bg-gray-900/50 rounded-2xl border overflow-hidden transition-all ${
                    cardOverdue > 0
                      ? 'border-red-200 dark:border-red-900/50'
                      : 'border-gray-100 dark:border-gray-800'
                  }`}
                >
                  {/* Card header */}
                  <button
                    onClick={() => toggleCard(card.id)}
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: card.color || '#3b82f6' + '33' }}
                      >
                        <CreditCard size={18} style={{ color: card.color || '#3b82f6' }} />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-gray-900 dark:text-white text-sm">{card.name}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          {items.length === 0
                            ? <span className="text-xs text-gray-400">Sem parcelas neste mês</span>
                            : <>
                                {cardPending > 0 && <span className="text-xs font-bold text-amber-500">{cardPending} pendente{cardPending > 1 ? 's' : ''}</span>}
                                {cardPaid > 0 && <span className="text-xs font-bold text-emerald-500">{cardPaid} paga{cardPaid > 1 ? 's' : ''}</span>}
                                {cardOverdue > 0 && <span className="text-xs font-bold text-red-500">{cardOverdue} atrasada{cardOverdue > 1 ? 's' : ''}</span>}
                              </>
                          }
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {items.length > 0 && (
                        <div className="text-right">
                          <p className="font-bold text-gray-900 dark:text-white text-sm">{formatCurrency(cardTotal)}</p>
                          <p className="text-xs text-gray-500">{items.length} parcela{items.length > 1 ? 's' : ''}</p>
                        </div>
                      )}
                      {isExpanded
                        ? <ChevronUp size={18} className="text-gray-400" />
                        : <ChevronDown size={18} className="text-gray-400" />
                      }
                    </div>
                  </button>

                  {/* Card limit bar (always visible) */}
                  {card.creditLimit && (
                    <div className="px-4 pb-3">
                      <CardLimitBar card={card} />
                    </div>
                  )}

                  {/* Installments list (expanded) */}
                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-2 border-t border-gray-100 dark:border-gray-800 pt-3">
                      {items.length === 0 ? (
                        <p className="text-sm text-center text-gray-400 py-4">
                          Sem parcelas em {MONTH_NAMES[selectedMonth]} neste cartão
                        </p>
                      ) : (
                        items
                          .sort((a, b) => {
                            const order = { OVERDUE: 0, PENDING: 1, PAID: 2 };
                            return order[a.status] - order[b.status];
                          })
                          .map(item => <InstallmentRow key={item.id} item={item} />)
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}

          {currentInstallments.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-3 border border-gray-200 dark:border-gray-800 flex justify-between">
              <span className="text-sm text-gray-500 font-medium">Total do mês</span>
              <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(totalAmount)}</span>
            </div>
          )}
        </div>
      )}
    </main>
  );
};
