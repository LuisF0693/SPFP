import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Account, Category, Transaction, FinanceContextType, UserProfile, DashboardWidget, Goal, InvestmentAsset, PatrimonyItem } from '../types';
import { INITIAL_ACCOUNTS, INITIAL_CATEGORIES, INITIAL_TRANSACTIONS } from '../data/initialData';
import { generateId } from '../utils';
import { supabase } from '../supabase';
import { useAuth } from './AuthContext';

interface GlobalState {
  accounts: Account[];
  transactions: Transaction[];
  categories: Category[];
  goals: Goal[];
  investments: InvestmentAsset[];
  patrimonyItems: PatrimonyItem[];
  userProfile: UserProfile;
  lastUpdated: number;
}

export interface FinanceContextData extends FinanceContextType {
  isSyncing: boolean;
  isInitialLoadComplete: boolean;
  addCategory: (category: Omit<Category, 'id'>) => string;
  isImpersonating: boolean;
  stopImpersonating: () => void;
  loadClientData: (userId: string) => Promise<void>;
  fetchAllUserData: () => Promise<any[]>;
}

const FinanceContext = createContext<FinanceContextData | undefined>(undefined);

const getStorageKey = (userId?: string) => userId ? `visao360_v2_data_${userId}` : 'visao360_v2_data';

const DEFAULT_LAYOUT: DashboardWidget[] = [
  { id: 'upcoming_bills', visible: true },
  { id: 'balance_card', visible: true },
  { id: 'compass', visible: true },
  { id: 'spending_chart', visible: true },
  { id: 'recent_transactions', visible: true }
];

const INITIAL_PROFILE: UserProfile = {
  name: '', email: '', cpf: '', phone: '',
  hasChildren: false, children: [],
  hasSpouse: false, spouseName: '', spouseCpf: '', spouseEmail: '',
  dashboardLayout: DEFAULT_LAYOUT,
  monthlySavingsTarget: 0,
  apiToken: '',
  geminiToken: ''
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
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [impersonatedUserId, setImpersonatedUserId] = useState<string | null>(null);
  const [adminOriginalState, setAdminOriginalState] = useState<GlobalState | null>(null);
  const stateUserIdRef = useRef<string | null>(null);
  const navigate = useNavigate();

  const getInitialState = useCallback((userId?: string): GlobalState => {
    const key = getStorageKey(userId);
    const local = localStorage.getItem(key);
    if (local) {
      try {
        const parsedData = JSON.parse(local);
        return {
          accounts: Array.isArray(parsedData.accounts) ? parsedData.accounts : INITIAL_ACCOUNTS,
          transactions: Array.isArray(parsedData.transactions) ? parsedData.transactions : INITIAL_TRANSACTIONS,
          categories: Array.isArray(parsedData.categories) ? parsedData.categories : INITIAL_CATEGORIES,
          goals: Array.isArray(parsedData.goals) ? parsedData.goals : [],
          investments: Array.isArray(parsedData.investments) ? parsedData.investments : [],
          patrimonyItems: Array.isArray(parsedData.patrimonyItems) ? parsedData.patrimonyItems : [],
          userProfile: parsedData.userProfile || INITIAL_PROFILE,
          lastUpdated: parsedData.lastUpdated || 0
        };
      } catch (e) {
        console.error("Erro ao ler cache local", e);
      }
    }
    return {
      accounts: INITIAL_ACCOUNTS,
      transactions: INITIAL_TRANSACTIONS,
      categories: INITIAL_CATEGORIES,
      goals: [],
      investments: [],
      patrimonyItems: [],
      userProfile: INITIAL_PROFILE,
      lastUpdated: 0
    };
  }, []);

  const [state, setState] = useState<GlobalState>(() => getInitialState());

  useEffect(() => {
    if (user?.id && stateUserIdRef.current === user.id) {
      localStorage.setItem(getStorageKey(user.id), JSON.stringify(state));
    }
  }, [state, user?.id]);

  const saveToCloud = useCallback(async (newState: GlobalState) => {
    if (!user || !isInitialLoadComplete) return;

    // Se estiver personificando, salva no ID do cliente, não no do admin
    const targetUserId = isImpersonating ? impersonatedUserId : user.id;
    // CAPTURA: O targetUserId deve ser fixado agora para o timeout não usar o estado futuro do isImpersonating
    const finalTargetUserId = targetUserId;

    if (!finalTargetUserId) return;

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
            user_id: finalTargetUserId,
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
  }, [user, isInitialLoadComplete, isImpersonating, impersonatedUserId]);

  useEffect(() => {
    if (!user) {
      setIsInitialLoadComplete(false);
      stateUserIdRef.current = null;
      setState(getInitialState()); // Reset to default/non-user state
      return;
    }

    // Importante: Marcar que o load começou para este usuário
    setIsInitialLoadComplete(false);

    // Carregar dados iniciais do localStorage do usuário antes mesmo do fetch da nuvem
    // Isso evita o flash de dados do usuário anterior
    const initialState = getInitialState(user.id);
    stateUserIdRef.current = user.id;
    setState(initialState);

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
                // Ensure goals exists in cloud data structure merge
                const safeCloudData = {
                  ...cloudData,
                  goals: Array.isArray(cloudData.goals) ? cloudData.goals : [],
                  investments: Array.isArray(cloudData.investments) ? cloudData.investments : []
                };
                return safeCloudData;
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

  // Goal Logic
  const addGoal = (g: Omit<Goal, 'id'>) => updateAndSync({ goals: [...state.goals, { ...g, id: generateId() }] });
  const updateGoal = (u: Goal) => updateAndSync({ goals: state.goals.map(g => g.id === u.id ? u : g) });
  const deleteGoal = (id: string) => updateAndSync({ goals: state.goals.filter(g => g.id !== id) });

  // Investment Logic
  const addInvestment = (i: Omit<InvestmentAsset, 'id'>) => updateAndSync({ investments: [...state.investments, { ...i, id: generateId() }] });
  const updateInvestment = (u: InvestmentAsset) => updateAndSync({ investments: state.investments.map(i => i.id === u.id ? u : i) });
  const deleteInvestment = (id: string) => updateAndSync({ investments: state.investments.filter(i => i.id !== id) });

  // Patrimony Logic
  const addPatrimonyItem = (item: Omit<PatrimonyItem, 'id'>) => updateAndSync({ patrimonyItems: [...state.patrimonyItems, { ...item, id: generateId() }] });
  const updatePatrimonyItem = (item: PatrimonyItem) => updateAndSync({ patrimonyItems: state.patrimonyItems.map(i => i.id === item.id ? item : i) });
  const deletePatrimonyItem = (id: string) => updateAndSync({ patrimonyItems: state.patrimonyItems.filter(i => i.id !== id) });

  // Admin Methods
  const fetchAllUserData = async () => {
    const { data, error } = await supabase
      .from('user_data')
      .select('user_id, content, last_updated');
    if (error) throw error;
    return data || [];
  };

  const loadClientData = async (userId: string) => {
    setIsSyncing(true);
    try {
      const { data, error } = await supabase
        .from('user_data')
        .select('content')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      if (data && data.content) {
        // Backup original state before impersonating
        if (!isImpersonating) {
          setAdminOriginalState(state);
        }
        setState(data.content as GlobalState);
        stateUserIdRef.current = userId; // Vincula o estado ao ID do personificado
        setIsImpersonating(true);
        setImpersonatedUserId(userId);
        window.scrollTo(0, 0);
        navigate('/'); // Redireciona para o Dashboard para ver os dados
      }
    } catch (e) {
      console.error("Erro ao carregar dados do cliente:", e);
    } finally {
      setIsSyncing(false);
    }
  };

  const stopImpersonating = () => {
    if (adminOriginalState && user) {
      setState(adminOriginalState);
      stateUserIdRef.current = user.id; // Volta para o ID do admin original
      setAdminOriginalState(null);
      setIsImpersonating(false);
      setImpersonatedUserId(null);
      navigate('/admin'); // Volta para o painel admin
    }
  };

  return (
    <FinanceContext.Provider value={{
      userProfile: state.userProfile,
      updateUserProfile: (p) => updateAndSync({ userProfile: p }),
      accounts: state.accounts,
      transactions: state.transactions,
      categories: state.categories,
      goals: state.goals,
      investments: state.investments,
      addTransaction, addManyTransactions, updateTransaction, deleteTransaction, deleteTransactions,
      addAccount, updateAccount, deleteAccount, addCategory, updateCategory, deleteCategory,
      addGoal, updateGoal, deleteGoal,
      addInvestment, updateInvestment, deleteInvestment,
      patrimonyItems: state.patrimonyItems,
      addPatrimonyItem, updatePatrimonyItem, deletePatrimonyItem,
      getAccountBalance: (id) => state.accounts.find(a => a.id === id)?.balance || 0,
      totalBalance: state.accounts.reduce((acc, curr) => acc + curr.balance, 0),
      isSyncing,
      isInitialLoadComplete,
      isImpersonating,
      stopImpersonating,
      loadClientData,
      fetchAllUserData
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
