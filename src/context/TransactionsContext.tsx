import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Transaction, CategoryBudget } from '../types';
import { INITIAL_TRANSACTIONS } from '../data/initialData';
import { generateId } from '../utils';

interface TransactionsState {
  transactions: Transaction[];
  categoryBudgets: CategoryBudget[];
  lastUpdated: number;
}

export interface TransactionsContextType {
  transactions: Transaction[];
  categoryBudgets: CategoryBudget[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  addManyTransactions: (transactions: Omit<Transaction, 'id'>[]) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  deleteTransactions: (ids: string[]) => void;
  updateTransactions: (transactions: Transaction[]) => void;
  getTransactionsByGroupId: (groupId: string) => Transaction[];
  deleteTransactionGroup: (groupId: string) => void;
  deleteTransactionGroupFromIndex: (groupId: string, fromIndex: number) => void;
  updateCategoryBudget: (categoryId: string, limit: number) => void;
  recoverTransaction: (id: string) => void;
  getDeletedTransactions: () => Transaction[];
}

const TransactionsContext = createContext<TransactionsContextType | undefined>(undefined);

const getStorageKey = (userId?: string) => userId ? `visao360_v2_transactions_${userId}` : 'visao360_v2_transactions';

const filterActive = <T extends { deletedAt?: number }>(items: T[]): T[] => {
  return items.filter(item => !item.deletedAt);
};

const filterDeleted = <T extends { deletedAt?: number }>(items: T[]): T[] => {
  return items.filter(item => item.deletedAt);
};

export interface TransactionsProviderProps {
  children: React.ReactNode;
  userId?: string;
  onStateChange?: (state: TransactionsState) => void;
}

export const TransactionsProvider: React.FC<TransactionsProviderProps> = ({
  children,
  userId,
  onStateChange
}) => {
  const getInitialState = useCallback((id?: string): TransactionsState => {
    const key = getStorageKey(id);
    const local = localStorage.getItem(key);
    if (local) {
      try {
        const parsedData = JSON.parse(local);
        return {
          transactions: Array.isArray(parsedData.transactions) ? parsedData.transactions : INITIAL_TRANSACTIONS,
          categoryBudgets: Array.isArray(parsedData.categoryBudgets) ? parsedData.categoryBudgets : [],
          lastUpdated: parsedData.lastUpdated || 0
        };
      } catch (e) {
        console.error("Error reading transactions cache", e);
      }
    }
    return {
      transactions: INITIAL_TRANSACTIONS,
      categoryBudgets: [],
      lastUpdated: 0
    };
  }, []);

  const [state, setState] = useState<TransactionsState>(() => getInitialState(userId));

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(state));
  }, [state, userId]);

  // Notify parent on state change
  useEffect(() => {
    onStateChange?.(state);
  }, [state, onStateChange]);

  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const shouldAffectBalanceNow = (date: string) => new Date(date) <= today;

  const addTransaction = (d: Omit<Transaction, 'id'>) => {
    const id = generateId();
    setState(prev => ({
      ...prev,
      transactions: [{ ...d, id }, ...prev.transactions],
      lastUpdated: Date.now()
    }));
  };

  const addManyTransactions = (txs: Omit<Transaction, 'id'>[]) => {
    const newTxs = txs.map(t => ({ ...t, id: generateId() }));
    setState(prev => ({
      ...prev,
      transactions: [...newTxs, ...prev.transactions],
      lastUpdated: Date.now()
    }));
  };

  const updateTransaction = (u: Transaction) => {
    setState(prev => ({
      ...prev,
      transactions: prev.transactions.map(t => t.id === u.id ? u : t),
      lastUpdated: Date.now()
    }));
  };

  const deleteTransaction = (id: string) => {
    const tx = state.transactions.find(t => t.id === id);
    if (!tx || tx.deletedAt) return;
    setState(prev => ({
      ...prev,
      transactions: prev.transactions.map(t => t.id === id ? { ...t, deletedAt: Date.now() } : t),
      lastUpdated: Date.now()
    }));
  };

  const deleteTransactions = (ids: string[]) => {
    const idSet = new Set(ids);
    setState(prev => ({
      ...prev,
      transactions: prev.transactions.map(t => idSet.has(t.id) && !t.deletedAt ? { ...t, deletedAt: Date.now() } : t),
      lastUpdated: Date.now()
    }));
  };

  const updateTransactions = (updates: Transaction[]) => {
    const updateMap = new Map(updates.map(u => [u.id, u]));
    setState(prev => ({
      ...prev,
      transactions: prev.transactions.map(t => updateMap.get(t.id) || t),
      lastUpdated: Date.now()
    }));
  };

  const getTransactionsByGroupId = (groupId: string): Transaction[] => {
    return filterActive(state.transactions.filter(t => t.groupId === groupId)).sort((a, b) => (a.groupIndex || 0) - (b.groupIndex || 0));
  };

  const deleteTransactionGroup = (groupId: string) => {
    const groupTxs = state.transactions.filter(t => t.groupId === groupId && !t.deletedAt);
    if (groupTxs.length === 0) return;
    const ids = groupTxs.map(t => t.id);
    deleteTransactions(ids);
  };

  const deleteTransactionGroupFromIndex = (groupId: string, fromIndex: number) => {
    const groupTxs = state.transactions.filter(t => t.groupId === groupId && (t.groupIndex || 0) >= fromIndex && !t.deletedAt);
    if (groupTxs.length === 0) return;
    const ids = groupTxs.map(t => t.id);
    deleteTransactions(ids);
  };

  const updateCategoryBudget = (categoryId: string, limit: number) => {
    setState(prev => {
      const budgets = prev.categoryBudgets || [];
      const existing = budgets.find(b => b.categoryId === categoryId);
      let newBudgets;
      if (existing) {
        newBudgets = budgets.map(b => b.categoryId === categoryId ? { ...b, limit } : b);
      } else {
        newBudgets = [...budgets, { categoryId, limit }];
      }
      return {
        ...prev,
        categoryBudgets: newBudgets,
        lastUpdated: Date.now()
      };
    });
  };

  const recoverTransaction = (id: string) => {
    const tx = state.transactions.find(t => t.id === id);
    if (!tx || !tx.deletedAt) return;
    setState(prev => ({
      ...prev,
      transactions: prev.transactions.map(t => t.id === id ? { ...t, deletedAt: undefined } : t),
      lastUpdated: Date.now()
    }));
  };

  const getDeletedTransactions = (): Transaction[] => {
    return filterDeleted(state.transactions);
  };

  return (
    <TransactionsContext.Provider value={{
      transactions: filterActive(state.transactions),
      categoryBudgets: state.categoryBudgets,
      addTransaction,
      addManyTransactions,
      updateTransaction,
      deleteTransaction,
      deleteTransactions,
      updateTransactions,
      getTransactionsByGroupId,
      deleteTransactionGroup,
      deleteTransactionGroupFromIndex,
      updateCategoryBudget,
      recoverTransaction,
      getDeletedTransactions
    }}>
      {children}
    </TransactionsContext.Provider>
  );
};

export const useTransactions = () => {
  const context = useContext(TransactionsContext);
  if (!context) throw new Error('useTransactions must be used within a TransactionsProvider');
  return context;
};
