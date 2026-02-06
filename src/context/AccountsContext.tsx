import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Account, Category } from '../types';
import { INITIAL_ACCOUNTS, INITIAL_CATEGORIES } from '../data/initialData';
import { generateId } from '../utils';

interface AccountsState {
  accounts: Account[];
  categories: Category[];
  lastUpdated: number;
}

export interface AccountsContextType {
  accounts: Account[];
  categories: Category[];
  addAccount: (account: Omit<Account, 'id'>) => void;
  updateAccount: (account: Account) => void;
  deleteAccount: (id: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => string;
  updateCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;
  getAccountBalance: (accountId: string) => number;
  totalBalance: number;
  recoverAccount: (id: string) => void;
  getDeletedAccounts: () => Account[];
}

const AccountsContext = createContext<AccountsContextType | undefined>(undefined);

const getStorageKey = (userId?: string) => userId ? `visao360_v2_accounts_${userId}` : 'visao360_v2_accounts';

const filterActive = <T extends { deletedAt?: number }>(items: T[] | undefined | null): T[] => {
  if (!Array.isArray(items)) return [];
  return items.filter(item => !item.deletedAt);
};

const filterDeleted = <T extends { deletedAt?: number }>(items: T[] | undefined | null): T[] => {
  if (!Array.isArray(items)) return [];
  return items.filter(item => item.deletedAt);
};

export interface AccountsProviderProps {
  children: React.ReactNode;
  userId?: string;
  onStateChange?: (state: AccountsState) => void;
}

export const AccountsProvider: React.FC<AccountsProviderProps> = ({
  children,
  userId,
  onStateChange
}) => {
  const getInitialState = useCallback((id?: string): AccountsState => {
    const key = getStorageKey(id);
    const local = localStorage.getItem(key);
    if (local) {
      try {
        const parsedData = JSON.parse(local);
        return {
          accounts: Array.isArray(parsedData.accounts) ? parsedData.accounts : INITIAL_ACCOUNTS,
          categories: Array.isArray(parsedData.categories) ? parsedData.categories : INITIAL_CATEGORIES,
          lastUpdated: parsedData.lastUpdated || 0
        };
      } catch (e) {
        console.error("Error reading accounts cache", e);
      }
    }
    return {
      accounts: INITIAL_ACCOUNTS,
      categories: INITIAL_CATEGORIES,
      lastUpdated: 0
    };
  }, []);

  const [state, setState] = useState<AccountsState>(() => getInitialState(userId));

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(state));
  }, [state, userId]);

  // Notify parent on state change
  useEffect(() => {
    onStateChange?.(state);
  }, [state, onStateChange]);

  const addAccount = (d: Omit<Account, 'id'>) => {
    setState(prev => ({
      ...prev,
      accounts: [...prev.accounts, { ...d, id: generateId() }],
      lastUpdated: Date.now()
    }));
  };

  const updateAccount = (u: Account) => {
    setState(prev => ({
      ...prev,
      accounts: prev.accounts.map(a => a.id === u.id ? u : a),
      lastUpdated: Date.now()
    }));
  };

  const deleteAccount = (id: string) => {
    const account = state.accounts.find(a => a.id === id);
    if (!account || account.deletedAt) return;
    setState(prev => ({
      ...prev,
      accounts: prev.accounts.map(a => a.id === id ? { ...a, deletedAt: Date.now() } : a),
      lastUpdated: Date.now()
    }));
  };

  const addCategory = (d: Omit<Category, 'id'>) => {
    const id = generateId();
    setState(prev => ({
      ...prev,
      categories: [...prev.categories, { ...d, id }],
      lastUpdated: Date.now()
    }));
    return id;
  };

  const updateCategory = (u: Category) => {
    setState(prev => ({
      ...prev,
      categories: prev.categories.map(c => c.id === u.id ? u : c),
      lastUpdated: Date.now()
    }));
  };

  const deleteCategory = (id: string) => {
    const category = state.categories.find(c => c.id === id);
    if (!category || category.deletedAt) return;
    setState(prev => ({
      ...prev,
      categories: prev.categories.map(c => c.id === id ? { ...c, deletedAt: Date.now() } : c),
      lastUpdated: Date.now()
    }));
  };

  const getAccountBalance = (accountId: string): number => {
    return filterActive(state.accounts).find(a => a.id === accountId)?.balance || 0;
  };

  const totalBalance: number = filterActive(state.accounts).reduce((acc, curr) => acc + curr.balance, 0);

  const recoverAccount = (id: string) => {
    const account = state.accounts.find(a => a.id === id);
    if (!account || !account.deletedAt) return;
    setState(prev => ({
      ...prev,
      accounts: prev.accounts.map(a => a.id === id ? { ...a, deletedAt: undefined } : a),
      lastUpdated: Date.now()
    }));
  };

  const getDeletedAccounts = (): Account[] => {
    return filterDeleted(state.accounts);
  };

  return (
    <AccountsContext.Provider value={{
      accounts: filterActive(state.accounts),
      categories: filterActive(state.categories),
      addAccount,
      updateAccount,
      deleteAccount,
      addCategory,
      updateCategory,
      deleteCategory,
      getAccountBalance,
      totalBalance,
      recoverAccount,
      getDeletedAccounts
    }}>
      {children}
    </AccountsContext.Provider>
  );
};

export const useAccounts = () => {
  const context = useContext(AccountsContext);
  if (!context) throw new Error('useAccounts must be used within an AccountsProvider');
  return context;
};
