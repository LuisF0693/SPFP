import { useState, useEffect } from 'react';
import { Transaction, TransactionType, CategoryGroup } from '../types';
import { RecurrenceType } from '../components/transaction/TransactionRecurrenceForm';

interface FormState {
  description: string;
  value: string;
  type: TransactionType;
  categoryId: string;
  accountId: string;
  date: string;
  spender: string;
  paid: boolean;
  sentiment?: string;
  recurrence: RecurrenceType;
  installments: number;
  invoiceOffset: number;
  wasCategoryAutoSelected: boolean;
  userManuallyChangedCategory: boolean;
  showImpulseAlert: boolean;
}

interface UseTransactionFormProps {
  initialData?: Transaction | null;
  accounts: any[];
  categories: any[];
  transactions: any[];
}

export const useTransactionForm = ({
  initialData,
  accounts,
  categories,
  transactions,
}: UseTransactionFormProps) => {
  const [state, setState] = useState<FormState>(() => ({
    description: '',
    value: '',
    type: 'EXPENSE' as TransactionType,
    categoryId: '',
    accountId: '',
    date: new Date().toISOString().split('T')[0],
    spender: 'ME',
    paid: true,
    sentiment: undefined,
    recurrence: 'NONE',
    installments: 2,
    invoiceOffset: 0,
    wasCategoryAutoSelected: false,
    userManuallyChangedCategory: false,
    showImpulseAlert: false,
  }));

  // Initialize form with initial data or defaults
  useEffect(() => {
    if (initialData) {
      setState((prev) => ({
        ...prev,
        description: initialData.description,
        value: initialData.value.toString(),
        type: initialData.type,
        categoryId: initialData.categoryId,
        accountId: initialData.accountId,
        date: initialData.date.split('T')[0],
        spender: initialData.spender || 'ME',
        paid: initialData.paid ?? true,
        sentiment: initialData.sentiment,
        userManuallyChangedCategory: true,
      }));
    } else {
      if (categories.length > 0) {
        setState((prev) => ({ ...prev, categoryId: categories[0].id }));
      }
      if (accounts.length > 0) {
        setState((prev) => ({ ...prev, accountId: accounts[0].id }));
      }
    }
  }, [initialData, categories, accounts]);

  // Update paid state based on date
  useEffect(() => {
    if (!initialData) {
      const today = new Date().toISOString().split('T')[0];
      setState((prev) => ({
        ...prev,
        paid: prev.date <= today,
      }));
    }
  }, [state.date, initialData]);

  // Auto-detect invoice offset for credit card
  useEffect(() => {
    const selectedAccount = accounts.find((a) => a.id === state.accountId);
    const isCreditCardExpense = selectedAccount?.type === 'CREDIT_CARD' && state.type === 'EXPENSE';

    if (isCreditCardExpense && selectedAccount?.closingDay && state.date) {
      const purchaseDay = parseInt(state.date.split('-')[2]);
      setState((prev) => ({
        ...prev,
        invoiceOffset: purchaseDay >= selectedAccount.closingDay ? 1 : 0,
      }));
    } else {
      setState((prev) => ({ ...prev, invoiceOffset: 0 }));
    }
  }, [state.date, state.accountId, state.type, accounts]);

  // Auto-detect category based on description
  useEffect(() => {
    if (!initialData && !state.userManuallyChangedCategory && state.description.length >= 3) {
      const cleanDesc = state.description.toLowerCase().trim();
      const match = transactions.find(
        (t: any) =>
          t.description.toLowerCase().trim() === cleanDesc ||
          t.description.toLowerCase().includes(cleanDesc) ||
          cleanDesc.includes(t.description.toLowerCase().trim())
      );
      if (match && match.categoryId !== state.categoryId) {
        setState((prev) => ({
          ...prev,
          categoryId: match.categoryId,
          wasCategoryAutoSelected: true,
        }));
      }
    }
    if (state.description.length < 3) {
      setState((prev) => ({ ...prev, wasCategoryAutoSelected: false }));
    }
  }, [state.description, transactions, initialData, state.userManuallyChangedCategory, state.categoryId]);

  // Calculate impulse alert
  useEffect(() => {
    if (!state.value || parseFloat(state.value) <= 0 || !state.categoryId) {
      setState((prev) => ({ ...prev, showImpulseAlert: false }));
      return;
    }

    const numericValue = parseFloat(state.value);
    const categoryTransactions = transactions.filter(
      (t: any) => t.categoryId === state.categoryId && t.type === 'EXPENSE'
    );

    let shouldShowAlert = false;
    if (categoryTransactions.length >= 3) {
      const sum = categoryTransactions.reduce((acc: number, t: any) => acc + t.value, 0);
      const avg = sum / categoryTransactions.length;
      shouldShowAlert = numericValue > avg * 1.5;
    } else if (numericValue > 500) {
      shouldShowAlert = true;
    }

    setState((prev) => ({ ...prev, showImpulseAlert: shouldShowAlert }));
  }, [state.value, state.categoryId, transactions]);

  // Update methods
  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setState((prev) => ({ ...prev, [key]: value }));
  };

  const setDescription = (description: string) => updateField('description', description);
  const setValue = (value: string) => updateField('value', value);
  const setType = (type: TransactionType) => updateField('type', type);
  const setCategoryId = (categoryId: string) => {
    setState((prev) => ({
      ...prev,
      categoryId,
      userManuallyChangedCategory: true,
      wasCategoryAutoSelected: false,
    }));
  };
  const setAccountId = (accountId: string) => updateField('accountId', accountId);
  const setDate = (date: string) => updateField('date', date);
  const setSpender = (spender: string) => updateField('spender', spender);
  const setPaid = (paid: boolean) => updateField('paid', paid);
  const setSentiment = (sentiment: string | undefined) => updateField('sentiment', sentiment);
  const setRecurrence = (recurrence: RecurrenceType) => updateField('recurrence', recurrence);
  const setInstallments = (installments: number) => updateField('installments', installments);
  const setInvoiceOffset = (invoiceOffset: number) => updateField('invoiceOffset', invoiceOffset);

  return {
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
  };
};
