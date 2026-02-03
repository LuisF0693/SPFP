import React, { useEffect, useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Transaction } from '../types';
import { generateId } from '../utils';
import { ChevronLeft } from 'lucide-react';
import { TransactionBasicForm } from './transaction/TransactionBasicForm';
import { TransactionRecurrenceForm, RecurrenceType } from './transaction/TransactionRecurrenceForm';
import { TransactionMetadata } from './transaction/TransactionMetadata';
import { useTransactionForm } from '../hooks/useTransactionForm';
import {
  generateTransactions,
  generateSingleTransaction,
  validateRecurrence,
} from '../services/transactionService';
import { validateTransaction } from '../services/validationService';

interface TransactionFormProps {
  onClose: () => void;
  initialData?: Transaction | null;
}

/**
 * Main transaction form component that orchestrates sub-components.
 * Handles form state, validation, and submission.
 */
export const TransactionForm: React.FC<TransactionFormProps> = ({ onClose, initialData }) => {
  const { accounts, categories, addTransaction, addManyTransactions, updateTransaction, addCategory, userProfile } =
    useFinance();

  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const {
    state,
    setDescription,
    setValue,
    setType,
    setCategoryId,
    setAccountId,
    setDate,
    setSpender,
    setPaid,
    setSentiment,
    setRecurrence,
    setInstallments,
    setInvoiceOffset,
  } = useTransactionForm({
    initialData,
    accounts,
    categories,
    transactions: [],
  });

  // Use context transactions for category auto-detection
  const { transactions } = useFinance();
  useEffect(() => {
    // Re-run auto-detection with actual transactions
    if (!initialData && !state.userManuallyChangedCategory && state.description.length >= 3) {
      const cleanDesc = state.description.toLowerCase().trim();
      const match = transactions.find(
        (t: any) =>
          t.description.toLowerCase().trim() === cleanDesc ||
          t.description.toLowerCase().includes(cleanDesc) ||
          cleanDesc.includes(t.description.toLowerCase().trim())
      );
      if (match && match.categoryId !== state.categoryId) {
        setCategoryId(match.categoryId);
      }
    }
  }, [state.description, transactions]);

  const selectedCategory = categories.find((c: any) => c.id === state.categoryId);
  const selectedAccount = accounts.find((a: any) => a.id === state.accountId);
  const isCreditCardExpense = selectedAccount?.type === 'CREDIT_CARD' && state.type === 'EXPENSE';

  const getTargetDate = (baseDateStr: string, offset: number) => {
    const d = new Date(baseDateStr + 'T12:00:00');
    d.setMonth(d.getMonth() + offset);
    return d;
  };

  const handleCreateCategory = (name: string, group: any, color: string, icon: string) => {
    return addCategory({ name, group, color, icon });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Comprehensive validation using validationService
    const transactionData = {
      description: state.description,
      value: parseFloat(state.value) || 0,
      date: state.date,
      type: state.type,
      categoryId: state.categoryId,
      accountId: state.accountId,
      recurrence: state.recurrence,
      installments: state.installments,
      spender: state.spender,
      sentiment: state.sentiment,
      paid: state.paid,
    };

    const validationResult = validateTransaction(transactionData, accounts, categories);

    if (!validationResult.isValid) {
      setValidationErrors(validationResult.errors);
      return;
    }

    // Clear errors on successful validation
    setValidationErrors([]);

    const rawValue = parseFloat(state.value);
    const baseDate = getTargetDate(state.date, isCreditCardExpense ? state.invoiceOffset : 0);
    const baseDateStr = baseDate.toISOString().split('T')[0];

    // Handle recurrence
    if (state.recurrence !== 'NONE' && state.installments > 1) {
      const result = generateTransactions(
        {
          description: state.description,
          value: rawValue,
          type: state.type,
          categoryId: state.categoryId,
          accountId: state.accountId,
          date: baseDateStr,
          spender: state.spender,
          paid: state.paid,
          sentiment: state.sentiment,
          recurrence: state.recurrence,
          installments: state.installments,
        },
        !!initialData,
        initialData?.id
      );

      if (result) {
        if (initialData) {
          // Update first transaction, add rest
          const [firstTx, ...restTx] = result.newTransactions;
          updateTransaction({
            id: initialData.id,
            ...firstTx,
          });
          if (restTx.length > 0) {
            addManyTransactions(restTx);
          }
        } else {
          addManyTransactions(result.newTransactions);
        }
      }
    } else {
      // Single transaction
      const payload = generateSingleTransaction({
        description: state.description,
        value: rawValue,
        type: state.type,
        categoryId: state.categoryId,
        accountId: state.accountId,
        date: baseDate.toISOString(),
        spender: state.spender,
        paid: state.paid,
        sentiment: state.sentiment,
        recurrence: 'NONE',
        installments: 0,
      });

      if (initialData) {
        updateTransaction({ ...payload, id: initialData.id });
      } else {
        addTransaction(payload);
      }
    }

    onClose();
  };

  return (
    <div className="glass w-full p-4 sm:p-6 relative rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-700/50">
      <div className="flex items-center mb-4 sm:mb-6">
        <button
          onClick={onClose}
          aria-label="Fechar formulário de transação"
          className="mr-3 sm:mr-4 p-2 -ml-2 text-slate-400 hover:bg-slate-700/50 hover:text-slate-200 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <ChevronLeft size={20} sm:size={24} aria-hidden="true" />
        </button>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-100">
          {initialData ? 'Editar Transação' : 'Nova Transação'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Validation Errors Display */}
        {validationErrors.length > 0 && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <h3 className="text-sm font-bold text-red-400 mb-2">Erros na validação:</h3>
            <ul className="space-y-1">
              {validationErrors.map((error, idx) => (
                <li key={idx} className="text-sm text-red-300 flex items-start">
                  <span className="mr-2">•</span>
                  <span>{error}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Basic Form Fields */}
        <TransactionBasicForm
          description={state.description}
          onDescriptionChange={setDescription}
          value={state.value}
          onValueChange={setValue}
          type={state.type}
          onTypeChange={setType}
          categoryId={state.categoryId}
          onCategoryChange={setCategoryId}
          accountId={state.accountId}
          onAccountChange={setAccountId}
          date={state.date}
          onDateChange={setDate}
          paid={state.paid}
          onPaidChange={setPaid}
          wasCategoryAutoSelected={state.wasCategoryAutoSelected}
          accounts={accounts}
          categories={categories}
          selectedCategory={selectedCategory}
          showImpulseAlert={state.showImpulseAlert}
          onCreateCategory={handleCreateCategory}
        />

        {/* Spender and Sentiment */}
        <TransactionMetadata
          spender={state.spender}
          onSpenderChange={setSpender}
          sentiment={state.sentiment}
          onSentimentChange={setSentiment}
          type={state.type}
          userProfile={{
            avatar: userProfile.avatar,
            hasSpouse: userProfile.hasSpouse,
            spouseName: userProfile.spouseName,
            spouseAvatar: userProfile.spouseAvatar,
            children: userProfile.children || [],
          }}
        />

        {/* Recurrence */}
        <TransactionRecurrenceForm
          recurrence={state.recurrence as RecurrenceType}
          onRecurrenceChange={(type) => setRecurrence(type as RecurrenceType)}
          installments={state.installments}
          onInstallmentsChange={setInstallments}
          value={parseFloat(state.value) || 0}
          date={state.date}
          accountType={selectedAccount?.type}
          closingDay={selectedAccount?.closingDay}
          invoiceOffset={state.invoiceOffset}
          onInvoiceOffsetChange={setInvoiceOffset}
          isCreditCardExpense={isCreditCardExpense}
        />

        {/* Submit Button */}
        <button
          type="submit"
          className={`w-full py-3 sm:py-4 text-sm sm:text-base text-white font-bold rounded-xl shadow-lg transition active:scale-95 min-h-[44px] ${
            state.type === 'INCOME'
              ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-emerald-500/20'
              : 'bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 shadow-rose-500/20'
          }`}
        >
          {initialData ? 'Salvar Alterações' : state.type === 'INCOME' ? 'Receber Valor' : 'Pagar Agora'}
        </button>
      </form>
    </div>
  );
};
