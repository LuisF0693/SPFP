import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Account, Transaction } from '../types';
import { formatCurrency } from '../utils';
import { AccountsList } from './AccountsList';
import { BankAccountsList } from './BankAccountsList';
import { Modal } from './ui/Modal';
import { AccountForm } from './forms/AccountForm';
import { InvoiceDetailsModal } from './InvoiceDetailsModal';

/**
 * Accounts management component (orchestrator pattern)
 * Manages state and composes AccountsList and BankAccountsList components
 */
export const Accounts: React.FC = () => {
  const {
    accounts,
    addAccount,
    updateAccount,
    deleteAccount,
    userProfile,
    transactions,
    categories,
    addManyTransactions,
  } = useFinance();

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Payment modal state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentSourceId, setPaymentSourceId] = useState('');
  const [paymentAccount, setPaymentAccount] = useState<Account | null>(null);

  // Invoice details modal state
  const [viewingInvoiceAccount, setViewingInvoiceAccount] = useState<Account | null>(null);

  // Separate accounts by type
  const creditCards = accounts.filter(a => a.type === 'CREDIT_CARD');
  const otherAccounts = accounts.filter(a => a.type !== 'CREDIT_CARD');

  // Form handlers
  const handleEditClick = (account: Account) => {
    setEditingId(account.id);
    setShowForm(true);
    window.scrollTo(0, 0);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Tem certeza que deseja excluir "${name}"?`)) {
      deleteAccount(id);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setShowForm(false);
  };

  const handleAccountFormSubmit = (accountData: Omit<Account, 'id'>) => {
    let finalBalance = accountData.balance;
    if (accountData.type === 'CREDIT_CARD') {
      finalBalance = -Math.abs(finalBalance);
    }

    const data: any = {
      name: accountData.name,
      type: accountData.type,
      owner: accountData.owner,
      balance: finalBalance,
    };

    if (accountData.type === 'CREDIT_CARD') {
      data.creditLimit = accountData.limit;
      data.lastFourDigits = accountData.lastFour;
      data.network = accountData.network;
      data.closingDay = accountData.closingDay;
      data.dueDay = accountData.dueDay;
      data.color = accountData.color;
    }

    if (editingId) {
      updateAccount({ ...data, id: editingId });
    } else {
      addAccount(data);
    }
    resetForm();
  };

  // Payment modal handlers
  const openPaymentModal = (account: Account) => {
    setPaymentAccount(account);
    setPaymentAmount(Math.abs(account.balance));
    const defaultSource = accounts.find(a => a.type === 'CHECKING')?.id || '';
    setPaymentSourceId(defaultSource);
    setIsPaymentModalOpen(true);
  };

  const handlePayInvoice = () => {
    if (!paymentAccount || !paymentSourceId || paymentAmount <= 0) return;

    const now = new Date().toISOString();
    const description = `Pagamento Fatura ${paymentAccount.name}`;

    const transactionsToAdd = [
      {
        accountId: paymentSourceId,
        description,
        value: -paymentAmount,
        date: now,
        type: 'EXPENSE' as const,
        categoryId:
          categories.find(c => c.name === 'Transferências')?.id || categories[0].id,
      },
      {
        accountId: paymentAccount.id,
        description: 'Pagamento Recebido',
        value: paymentAmount,
        date: now,
        type: 'INCOME' as const,
        categoryId:
          categories.find(c => c.name === 'Transferências')?.id || categories[0].id,
      },
    ];

    // @ts-ignore
    addManyTransactions(transactionsToAdd);
    setIsPaymentModalOpen(false);
    setPaymentAccount(null);
    alert('Fatura paga com sucesso!');
  };

  const handleAddNewCard = () => {
    setEditingId(null);
    setShowForm(true);
  };

  const handleAddNewBankAccount = () => {
    setEditingId(null);
    setShowForm(true);
  };

  return (
    <div className="p-4 md:p-6 min-h-full space-y-8 animate-fade-in pb-24">
      {/* Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={resetForm}
        title={editingId ? 'Editar Conta' : 'Nova Conta'}
        size="lg"
        variant="dark"
      >
        <AccountForm
          onClose={resetForm}
          initialData={editingId ? accounts.find(a => a.id === editingId) || null : null}
          onSubmit={handleAccountFormSubmit}
        />
      </Modal>

      {/* Credit Cards Section */}
      <AccountsList
        creditCards={creditCards}
        transactions={transactions}
        categories={categories}
        userProfile={userProfile}
        onEdit={handleEditClick}
        onDelete={handleDelete}
        onPayInvoice={openPaymentModal}
        onAddNew={handleAddNewCard}
        onViewInvoice={setViewingInvoiceAccount}
      />

      {/* Bank Accounts Section */}
      <BankAccountsList
        accounts={otherAccounts}
        onEdit={handleEditClick}
        onDelete={handleDelete}
        onAddNew={handleAddNewBankAccount}
      />

      {/* Payment Modal */}
      <Modal
        isOpen={isPaymentModalOpen && !!paymentAccount}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Pagar Fatura"
        size="md"
        variant="dark"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-400">{paymentAccount?.name}</p>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
              Valor do Pagamento
            </label>
            <input
              type="number"
              step="0.01"
              value={paymentAmount}
              onChange={e => setPaymentAmount(parseFloat(e.target.value))}
              className="w-full p-3 bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-gray-600 rounded-xl font-bold text-gray-900 dark:text-white outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
              Pagar com
            </label>
            <select
              value={paymentSourceId}
              onChange={e => setPaymentSourceId(e.target.value)}
              className="w-full p-3 bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-gray-600 rounded-xl text-sm outline-none text-gray-900 dark:text-white"
            >
              <option value="" disabled>
                Selecione uma conta
              </option>
              {accounts
                .filter(a => a.type === 'CHECKING' || a.type === 'CASH')
                .map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({formatCurrency(acc.balance)})
                  </option>
                ))}
            </select>
          </div>
          <div className="pt-4 flex gap-3">
            <button
              onClick={() => setIsPaymentModalOpen(false)}
              className="flex-1 py-3 text-gray-500 font-bold text-sm hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl"
            >
              Cancelar
            </button>
            <button
              onClick={handlePayInvoice}
              disabled={!paymentSourceId || paymentAmount <= 0}
              className="flex-1 py-3 bg-emerald-500 text-white font-bold text-sm rounded-xl hover:bg-emerald-600 shadow-lg shadow-emerald-200/20 disabled:opacity-50"
            >
              Confirmar
            </button>
          </div>
        </div>
      </Modal>

      {/* Invoice Details Modal */}
      {viewingInvoiceAccount && (
        <InvoiceDetailsModal
          account={viewingInvoiceAccount}
          isOpen={!!viewingInvoiceAccount}
          onClose={() => setViewingInvoiceAccount(null)}
        />
      )}
    </div>
  );
};
