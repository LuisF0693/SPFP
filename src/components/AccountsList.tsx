import React from 'react';
import {
  CreditCard,
  Plus,
  Edit2,
  Trash2,
  ShoppingBag,
  Calendar,
  Wifi,
  Download,
} from 'lucide-react';
import { Account, Transaction, Category, UserProfile } from '../types';
import {
  getInvoiceValue,
  calculateCardBalance,
  getRecentCardTransactions,
  getCardCategoryData,
  calculateCardStatistics,
  getNextDueDateInfo,
} from '../services/accountService';
import { formatCurrency, formatDate } from '../utils';
import { CategoryIcon } from './CategoryIcon';
import { CreditCardDisplay } from './CreditCardDisplay';
import { getCardHolderName } from '../utils/ownerUtils';

interface AccountsListProps {
  creditCards: Account[];
  transactions: Transaction[];
  categories: Category[];
  userProfile: Partial<UserProfile>;
  onEdit: (account: Account) => void;
  onDelete: (id: string, name: string) => void;
  onPayInvoice: (account: Account) => void;
  onAddNew: () => void;
  onViewInvoice: (account: Account) => void;
}

/**
 * Displays credit cards with their limits, invoices, and recent activity
 */
export const AccountsList: React.FC<AccountsListProps> = ({
  creditCards,
  transactions,
  categories,
  userProfile,
  onEdit,
  onDelete,
  onPayInvoice,
  onAddNew,
  onViewInvoice,
}) => {
  const safeCards = Array.isArray(creditCards) ? creditCards : [];
  const cardIds = safeCards.map(c => c.id);
  const stats = calculateCardStatistics(safeCards, transactions);
  const nextDueCard = safeCards
    .filter(c => c.dueDay)
    .sort((a, b) => {
      const today = new Date();
      let dateA = new Date(today.getFullYear(), today.getMonth(), a.dueDay!);
      if (dateA < today) dateA = new Date(today.getFullYear(), today.getMonth() + 1, a.dueDay!);
      let dateB = new Date(today.getFullYear(), today.getMonth(), b.dueDay!);
      if (dateB < today) dateB = new Date(today.getFullYear(), today.getMonth() + 1, b.dueDay!);
      return dateA.getTime() - dateB.getTime();
    })[0];

  const nextDueInfo = getNextDueDateInfo(nextDueCard);
  const recentCardTx = getRecentCardTransactions(cardIds, transactions);
  const cardCategoryData = getCardCategoryData(cardIds, transactions, categories);

  return (
    <section aria-label="Cartões de Crédito" role="region">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <header>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Meus Cartões
          </h2>
          <p className="text-gray-500 text-sm">
            Gerencie seus limites e faturas em um só lugar
          </p>
        </header>
        <div className="flex space-x-3">
          <button className="hidden md:flex items-center space-x-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-all">
            <Download size={16} /> <span>Exportar</span>
          </button>
          <button
            onClick={onAddNew}
            className="bg-accent hover:bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 transition-all flex items-center"
          >
            <Plus size={18} className="mr-2" /> Adicionar Cartão
          </button>
        </div>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white dark:bg-[#0f172a] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Total em Faturas
            </p>
            <h3 className="text-3xl font-black text-gray-900 dark:text-white">
              {formatCurrency(stats.totalInvoices)}
            </h3>
            <p className="text-xs text-gray-500 mt-1">Referente ao mês atual</p>
          </div>
          <ShoppingBag
            className="absolute right-[-20px] bottom-[-20px] text-gray-100 dark:text-gray-800 opacity-50"
            size={120}
            strokeWidth={0.5}
          />
        </div>

        <div className="bg-white dark:bg-[#0f172a] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Limite Total Disponível
            </p>
            <h3 className="text-3xl font-black text-gray-900 dark:text-white">
              {formatCurrency(stats.totalAvailable)}
            </h3>
            <div className="w-full bg-gray-100 dark:bg-gray-700 h-1.5 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-accent h-full rounded-full"
                style={{ width: `${Math.min(stats.limitUsage, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-accent font-bold mt-2">
              {Math.round(stats.limitUsage)}% do limite total utilizado
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0f172a] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Próximo Vencimento
            </p>
            <h3 className="text-3xl font-black text-white mix-blend-difference">
              {nextDueInfo.display}
            </h3>
            <span className="text-xs text-gray-500 font-bold">{nextDueCard?.name || ''}</span>
            {nextDueInfo.daysUntil > 0 && (
              <p className="text-xs text-orange-500 font-bold mt-1">
                Faltam {nextDueInfo.daysUntil} dias
              </p>
            )}
          </div>
          <Calendar
            className="absolute right-[-10px] bottom-[-20px] text-gray-100 dark:text-gray-800 opacity-50"
            size={120}
            strokeWidth={0.5}
          />
        </div>
      </div>

      {/* Main Content: Cards List & Sidebar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
        {/* Left Column: Cards List */}
        <div className="md:col-span-2 lg:col-span-2 space-y-4 sm:space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Seus Cartões</h3>
          </div>

          {creditCards.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 dark:bg-[#0f172a] rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
              <CreditCard size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">
                Você ainda não tem cartões cadastrados.
              </p>
              <button
                onClick={onAddNew}
                className="mt-4 text-accent font-bold text-sm hover:underline"
              >
                Cadastrar Cartão
              </button>
            </div>
          ) : (
            (Array.isArray(creditCards) ? creditCards : []).map(card => {
              const calcInvoice = getInvoiceValue(card.id, transactions);
              const { used, available, percent } = calculateCardBalance(card);

              return (
                <div
                  key={card.id}
                  className="bg-white dark:bg-[#0f172a] rounded-3xl p-1 shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col md:flex-row group/card"
                >
                  {/* Card Visual - Using CreditCardDisplay component */}
                  <div
                    onClick={() => onViewInvoice(card)}
                    className="w-full md:w-[320px] cursor-pointer transition-transform group-hover/card:scale-[1.02] duration-300 shrink-0"
                  >
                    <CreditCardDisplay
                      account={card}
                      holderName={getCardHolderName(card.owner, userProfile)}
                      cardNumber={card.lastFourDigits ? `•••• •••• •••• ${card.lastFourDigits}` : undefined}
                    />
                  </div>

                  {/* Card Details */}
                  <div className="flex-1 p-6 flex flex-col justify-center">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-lg">
                          {card.name}
                        </h4>
                        <p className="text-xs text-gray-400">
                          Conta Corrente Final 4022
                        </p>
                      </div>
                      <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded border border-emerald-500/20 uppercase">
                        Ativo
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-8 mb-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Fatura Atual</p>
                        <p className="text-xl font-black text-gray-900 dark:text-white">
                          {formatCurrency(calcInvoice)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Limite Disponível</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {formatCurrency(available)}
                        </p>
                      </div>
                    </div>

                    <div className="mb-6">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-gray-500">Usado: {Math.round(percent)}%</span>
                        <span className="text-gray-400">
                          Limite: {formatCurrency(card.creditLimit || 0)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-accent h-full rounded-full transition-all duration-1000"
                          style={{ width: `${Math.min(percent, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => onDelete(card.id, card.name)}
                        className="px-3 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-colors flex items-center justify-center"
                        title="Excluir Cartão"
                      >
                        <Trash2 size={20} />
                      </button>
                      <button
                        onClick={() => onEdit(card)}
                        className="flex-1 py-2.5 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 font-bold text-sm rounded-xl hover:bg-gray-200 dark:hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                      >
                        <Edit2 size={16} /> Editar
                      </button>
                      <button
                        onClick={() => onPayInvoice(card)}
                        className="flex-1 py-2.5 bg-[#0f172a] dark:bg-accent text-white font-bold text-sm rounded-xl hover:opacity-90 transition-colors"
                      >
                        Pagar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Summaries */}
        <div className="space-y-6">
          {/* Category Summary */}
          <div className="bg-white dark:bg-[#0f172a] p-6 rounded-3xl border border-gray-100 dark:border-gray-800">
            <h4 className="font-bold text-gray-900 dark:text-white mb-6">Resumo Mensal</h4>
            <div className="space-y-6">
              {cardCategoryData.length === 0 ? (
                <p className="text-sm text-gray-400 italic">Sem gastos este mês.</p>
              ) : (
                cardCategoryData.map((data, idx) => (
                  <div key={idx} className="flex items-center justify-between group">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-gray-50 dark:bg-white/5 text-gray-500 group-hover:text-white group-hover:bg-accent transition-colors">
                        <CategoryIcon iconName={data.icon} size={18} />
                      </div>
                      <span className="font-bold text-sm text-gray-700 dark:text-gray-300">
                        {data.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-sm text-gray-900 dark:text-white block">
                        {formatCurrency(data.value)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white dark:bg-[#0f172a] p-6 rounded-3xl border border-gray-100 dark:border-gray-800">
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-bold text-gray-900 dark:text-white">Últimas Compras</h4>
              <button className="text-xs font-bold text-accent">Ver extrato</button>
            </div>
            <div className="space-y-5">
              {recentCardTx.length === 0 ? (
                <p className="text-sm text-gray-400 italic">Sem compras recentes.</p>
              ) : (
                recentCardTx.map(tx => {
                  const cat = categories.find(c => c.id === tx.categoryId);
                  const cardName =
                    creditCards.find(a => a.id === tx.accountId)?.name || 'Cartão';
                  return (
                    <div key={tx.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2.5 rounded-full bg-gray-100 dark:bg-white/5">
                          <ShoppingBag size={16} className="text-gray-500 dark:text-gray-400" />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-gray-900 dark:text-white truncate max-w-[120px]">
                            {tx.description}
                          </p>
                          <div className="flex items-center text-[10px] text-gray-400">
                            <span>{formatDate(tx.date).slice(0, 5)}</span>
                            <span className="mx-1">•</span>
                            <span className="truncate max-w-[80px]">{cardName}</span>
                          </div>
                        </div>
                      </div>
                      <span className="font-bold text-sm text-gray-900 dark:text-white">
                        {formatCurrency(Math.abs(tx.value))}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
