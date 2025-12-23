import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Account, Category, Transaction, FinanceContextType, UserProfile, DashboardWidget } from '../types';
import { INITIAL_ACCOUNTS, INITIAL_CATEGORIES, INITIAL_TRANSACTIONS } from '../data/initialData';
import { generateId } from '../utils';
import { supabase } from '../supabase';
import { useAuth } from './AuthContext';

interface GlobalState {
  accounts: Account[];
  transactions: Transaction[];
  categories: Category[];
  userProfile: UserProfile;
  lastUpdated: number;
}

export interface FinanceContextData extends FinanceContextType {
  isSyncing: boolean;
  isInitialLoadComplete: boolean;
  addCategory: (category: Omit<Category, 'id'>) => string;
}

const FinanceContext = createContext<FinanceContextData | undefined>(undefined);

const STORAGE_KEY = 'visao360_v2_data';

const DEFAULT_LAYOUT: DashboardWidget[] = [
  { id: 'upcoming_bills', visible: true },
  { id: 'balance_card', visible: true },
  { id: 'compass', visible: true },
  { id: 'spending_chart', visible: true },
  { id: 'recent_transactions', visible: true }
];

const INITIAL_PROFILE: UserProfile = {
  name: '', email: '', cpf: '', phone: '',
  hasChildren: false, childrenNames: '',
  hasSpouse: false, spouseName: '', spouseCpf: '', spouseEmail: '',
  dashboardLayout: DEFAULT_LAYOUT
};

// Helper to access user metadata properly (Supabase stores display_name in user_metadata)
const getUserDisplayName = (user: any) => {
  return user?.user_metadata?.display_name || user?.user_metadata?.full_name || '';
};

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const syncTimeoutRef = useRef<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);

  const [state, setState] = useState<GlobalState>(() => {
    const local = localStorage.getItem(STORAGE_KEY);
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        console.error("Erro ao ler cache local", e);
      }
    }
    return {
      accounts: INITIAL_ACCOUNTS,
      transactions: INITIAL_TRANSACTIONS,
      categories: INITIAL_CATEGORIES,
      userProfile: INITIAL_PROFILE,
      lastUpdated: 0
    };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const saveToCloud = useCallback(async (newState: GlobalState) => {
    if (!user || !isInitialLoadComplete) return;

    setIsSyncing(true);
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);

    syncTimeoutRef.current = setTimeout(async () => {
      try {
        const dataToSave = JSON.parse(JSON.stringify({
          ...newState,
          lastUpdated: Date.now()
        }));

        const { error } = await supabase
          .from('user_data')
          .upsert({
            user_id: user.id,
            content: dataToSave,
            last_updated: dataToSave.lastUpdated
          });

        if (error) throw error;
        setIsSyncing(false);
      } catch (e) {
        console.error("Erro ao salvar na nuvem:", e);
        setIsSyncing(false);
      }
    }, 1500);
  }, [user, isInitialLoadComplete]);

  useEffect(() => {
    if (!user) {
      setIsInitialLoadComplete(false);
      return;
    }

    setIsSyncing(true);

    // Initial Fetch
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('user_data')
        .select('content')
        .eq('user_id', user.id)
        .single();

      if (data && data.content) {
        const cloudData = data.content as GlobalState;
        setState(current => {
          if (cloudData.lastUpdated > current.lastUpdated || current.lastUpdated === 0) {
            return cloudData;
          }
          return current;
        });
      }
      setIsInitialLoadComplete(true);
      setIsSyncing(false);
    };

    fetchData();

    // Realtime Subscription
    const channel = supabase
      .channel('user_data_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_data',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newData = payload.new as any;
          if (newData && newData.content) {
            const cloudData = newData.content as GlobalState;
            setState(current => {
              if (cloudData.lastUpdated > current.lastUpdated) {
                return cloudData;
              }
              return current;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [user]);

  const updateAndSync = (partial: Partial<Omit<GlobalState, 'lastUpdated'>>) => {
    if (!isInitialLoadComplete && user) {
      return;
    }
    const nextState = { ...state, ...partial, lastUpdated: Date.now() };
    setState(nextState);
    saveToCloud(nextState);
  };

  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const shouldAffectBalanceNow = (date: string) => new Date(date) <= today;

  const addTransaction = (d: Omit<Transaction, 'id'>) => {
    const id = generateId();
    const nextTx = [{ ...d, id }, ...state.transactions];
    const nextAcc = state.accounts.map(acc => {
      if (acc.id === d.accountId && shouldAffectBalanceNow(d.date)) {
        const b = d.type === 'INCOME' ? acc.balance + d.value : acc.balance - d.value;
        return { ...acc, balance: b };
      }
      return acc;
    });
    updateAndSync({ transactions: nextTx, accounts: nextAcc });
  };

  const addManyTransactions = (txs: Omit<Transaction, 'id'>[]) => {
    const newTxs = txs.map(t => ({ ...t, id: generateId() }));
    const nextAcc = state.accounts.map(a => {
      let b = a.balance;
      txs.forEach(tx => { if (tx.accountId === a.id && shouldAffectBalanceNow(tx.date)) b += (tx.type === 'INCOME' ? tx.value : -tx.value); });
      return { ...a, balance: b };
    });
    updateAndSync({ transactions: [...newTxs, ...state.transactions], accounts: nextAcc });
  };

  const updateTransaction = (u: Transaction) => {
    const old = state.transactions.find(t => t.id === u.id);
    if (!old) return;
    const nextAcc = state.accounts.map(a => {
      let b = a.balance;
      if (a.id === old.accountId && shouldAffectBalanceNow(old.date)) b += (old.type === 'INCOME' ? -old.value : old.value);
      if (a.id === u.accountId && shouldAffectBalanceNow(u.date)) b += (u.type === 'INCOME' ? u.value : -u.value);
      return { ...a, balance: b };
    });
    updateAndSync({ accounts: nextAcc, transactions: state.transactions.map(t => t.id === u.id ? u : t) });
  };

  const deleteTransaction = (id: string) => {
    const tx = state.transactions.find(t => t.id === id);
    if (!tx) return;
    const nextAcc = state.accounts.map(a => (a.id === tx.accountId && shouldAffectBalanceNow(tx.date)) ? { ...a, balance: a.balance + (tx.type === 'INCOME' ? -tx.value : tx.value) } : a);
    updateAndSync({ accounts: nextAcc, transactions: state.transactions.filter(t => t.id !== id) });
  };

  const deleteTransactions = (ids: string[]) => {
    let nextAcc = [...state.accounts];
    let nextTx = [...state.transactions];
    ids.forEach(id => {
      const tx = nextTx.find(t => t.id === id);
      if (tx) {
        if (shouldAffectBalanceNow(tx.date)) nextAcc = nextAcc.map(a => a.id === tx.accountId ? { ...a, balance: a.balance + (tx.type === 'INCOME' ? -tx.value : tx.value) } : a);
        nextTx = nextTx.filter(t => t.id !== id);
      }
    });
    updateAndSync({ accounts: nextAcc, transactions: nextTx });
  };

  const addAccount = (d: Omit<Account, 'id'>) => updateAndSync({ accounts: [...state.accounts, { ...d, id: generateId() }] });
  const updateAccount = (u: Account) => updateAndSync({ accounts: state.accounts.map(a => a.id === u.id ? u : a) });
  const deleteAccount = (id: string) => updateAndSync({ transactions: state.transactions.filter(t => t.accountId !== id), accounts: state.accounts.filter(a => a.id !== id) });

  const addCategory = (d: Omit<Category, 'id'>) => {
    const id = generateId();
    updateAndSync({ categories: [...state.categories, { ...d, id }] });
    return id;
  };

  const updateCategory = (u: Category) => updateAndSync({ categories: state.categories.map(c => c.id === u.id ? u : c) });
  const deleteCategory = (id: string) => updateAndSync({ categories: state.categories.filter(c => c.id !== id) });

  return (
    <FinanceContext.Provider value={{
      userProfile: state.userProfile,
      updateUserProfile: (p) => updateAndSync({ userProfile: p }),
      accounts: state.accounts,
      transactions: state.transactions,
      categories: state.categories,
      addTransaction, addManyTransactions, updateTransaction, deleteTransaction, deleteTransactions,
      addAccount, updateAccount, deleteAccount, addCategory, updateCategory, deleteCategory,
      getAccountBalance: (id) => state.accounts.find(a => a.id === id)?.balance || 0,
      totalBalance: state.accounts.reduce((acc, curr) => acc + curr.balance, 0),
      isSyncing,
      isInitialLoadComplete
    }}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) throw new Error('useFinance must be used within a FinanceProvider');
  return context;
};
