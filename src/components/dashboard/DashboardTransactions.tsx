import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, formatDate } from '../../utils';
import { Wallet, MoreHorizontal } from 'lucide-react';
import { Account, Transaction, Category } from '../../types';
import { CategoryIcon } from '../CategoryIcon';

interface DashboardTransactionsProps {
  accounts: Account[];
  transactions: Transaction[];
  categories: Category[];
}

/**
 * Account list + Recent transactions table
 * ~155 LOC
 */
export const DashboardTransactions = memo<DashboardTransactionsProps>(
  ({ accounts, transactions, categories }) => {
    const navigate = useNavigate();

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 bg-white dark:bg-[#111827] p-6 rounded-[24px] border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Transações Recentes
            </h3>
            <div className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full cursor-pointer">
              <MoreHorizontal size={20} className="text-gray-400" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800">
                  <th className="pb-3 pl-2">Transação</th>
                  <th className="pb-3">Categoria</th>
                  <th className="pb-3">Data</th>
                  <th className="pb-3 text-right pr-2">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {(Array.isArray(transactions) ? transactions : []).slice(0, 5).map(tx => {
                  const cat = categories.find(c => c.id === tx.categoryId);
                  return (
                    <tr
                      key={tx.id}
                      className="group hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="py-4 pl-2">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500">
                            <CategoryIcon iconName={cat?.icon} size={16} />
                          </div>
                          <span className="font-bold text-sm text-gray-900 dark:text-gray-200">
                            {tx.description}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 text-xs text-gray-500 dark:text-gray-400">
                        {cat?.name || 'Geral'}
                      </td>
                      <td className="py-4 text-xs text-gray-500 dark:text-gray-400 capitalize">
                        {formatDate(tx.date).split(',')[0]}
                      </td>
                      <td
                        className={`py-4 text-right pr-2 font-bold text-sm ${
                          tx.type === 'INCOME'
                            ? 'text-emerald-500'
                            : 'text-gray-900 dark:text-white'
                        }`}
                      >
                        {tx.type === 'EXPENSE' ? '-' : '+'}
                        {formatCurrency(tx.value)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {(Array.isArray(transactions) ? transactions : []).length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm">
                Nenhuma transação registrada.
              </div>
            )}
          </div>
        </div>

        {/* Accounts List */}
        <div className="bg-white dark:bg-[#111827] p-6 rounded-[24px] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Minhas Contas
            </h3>
            <button
              onClick={() => navigate('/accounts')}
              className="text-xs font-bold text-accent hover:text-blue-400"
            >
              Ver Todas
            </button>
          </div>

          <div className="flex-1 overflow-auto space-y-4 no-scrollbar">
            {(Array.isArray(accounts) ? accounts : []).slice(0, 4).map(acc => (
              <div
                key={acc.id}
                className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      acc.type === 'CHECKING'
                        ? 'bg-blue-100 text-blue-600'
                        : acc.type === 'INVESTMENT'
                          ? 'bg-purple-100 text-purple-600'
                          : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    <Wallet size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-accent transition-colors">
                      {acc.name}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      **** {acc.id.substring(0, 4)}
                    </p>
                  </div>
                </div>
                <span
                  className={`font-bold text-sm ${
                    acc.balance >= 0
                      ? 'text-gray-900 dark:text-white'
                      : 'text-red-500'
                  }`}
                >
                  {formatCurrency(acc.balance)}
                </span>
              </div>
            ))}

            <button
              className="w-full py-3 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-gray-400 text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center mt-2"
              onClick={() => navigate('/accounts')}
            >
              + Adicionar Conta
            </button>
          </div>
        </div>
      </div>
    );
  }
);

DashboardTransactions.displayName = 'DashboardTransactions';
