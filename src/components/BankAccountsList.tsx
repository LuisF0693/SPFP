import React from 'react';
import { Building, Edit2, Trash2 } from 'lucide-react';
import { Account } from '../types';
import { getAccountTypeLabel } from '../services/accountService';
import { formatCurrency } from '../utils';
import { BankLogo } from './BankLogo';

interface BankAccountsListProps {
  accounts: Account[];
  onEdit: (account: Account) => void;
  onDelete: (id: string, name: string) => void;
  onAddNew: () => void;
}

/**
 * Displays bank accounts, investments, and cash accounts in a grid
 */
export const BankAccountsList: React.FC<BankAccountsListProps> = ({
  accounts,
  onEdit,
  onDelete,
  onAddNew,
}) => {
  return (
    <section className="pt-8 border-t border-gray-200 dark:border-gray-800" aria-label="Outras Contas Bancárias" role="region">
      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
          <Building className="mr-2 text-gray-400" size={24} />
          Outras Contas Bancárias
        </h2>
        <button
          onClick={onAddNew}
          className="text-accent text-sm font-bold hover:underline"
        >
          + Adicionar Conta
        </button>
      </header>

      {/* Accounts Grid */}
      {accounts.length === 0 ? (
        <div className="bg-gray-50 dark:bg-[#0f172a] rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 p-8 text-center">
          <p className="text-gray-500 text-sm">
            Nenhuma conta corrente ou investimento cadastrado.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {accounts.map(account => (
            <div
              key={account.id}
              className="bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-colors group"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 border border-gray-100 dark:border-gray-700 rounded-lg bg-white">
                    <BankLogo name={account.name} type={account.type} size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                      {account.name}
                    </h4>
                    <p className="text-[10px] text-gray-500 uppercase">
                      {getAccountTypeLabel(account.type)}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onEdit(account)}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-gray-400"
                    title="Editar Conta"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => onDelete(account.id, account.name)}
                    className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-400"
                    title="Excluir Conta"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Balance */}
              <div>
                <p className="text-xs text-gray-400 mb-1">Saldo Atual</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(account.balance)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
