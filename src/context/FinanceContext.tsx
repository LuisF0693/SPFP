import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Account, Category, Transaction, FinanceContextType, UserProfile, DashboardWidget, Goal, InvestmentAsset, PatrimonyItem, CategoryBudget } from '../types';
import { INITIAL_ACCOUNTS, INITIAL_CATEGORIES, INITIAL_TRANSACTIONS } from '../data/initialData';
import { generateId } from '../utils';
import { supabase } from '../supabase';
import { logInteraction } from '../services/logService';
import { useAuth } from './AuthContext';
import { retryWithBackoff, logDetailedError, getErrorMessage } from '../services/retryService';
import { CardInvoice } from '../types/creditCard';
import cardInvoiceService from '../services/cardInvoiceService';
import { Partner } from '../types/partnership';
import { partnershipService } from '../services/partnershipService';
import { offlineSyncService } from '../services/offlineSyncService';
import { Asset } from '../types/assets';
import { assetService } from '../services/assetService';

interface GlobalState {
  accounts: Account[];
  transactions: Transaction[];
  categories: Category[];
  goals: Goal[];
  investments: InvestmentAsset[];
  patrimonyItems: PatrimonyItem[];
  userProfile: UserProfile;
  categoryBudgets: CategoryBudget[];
  creditCardInvoices: CardInvoice[];
  partners: Partner[];
  assets: Asset[];
  lastUpdated: number;
}

// Supabase payload types
interface SupabasePayload {
  new: Record<string, unknown> | null;
  old: Record<string, unknown> | null;
  eventType: string;
}

export interface FinanceContextData extends FinanceContextType {
  isSyncing: boolean;
  isInitialLoadComplete: boolean;
  addCategory: (category: Omit<Category, 'id'>) => string;
  addManyTransactions: (transactions: Omit<Transaction, 'id'>[]) => void;
  deleteTransactions: (ids: string[]) => void;
  updateTransactions: (transactions: Transaction[]) => void;
  isImpersonating: boolean;
  stopImpersonating: (redirectPath?: string) => void;
  loadClientData: (userId: string) => Promise<void>;
  fetchAllUserData: () => Promise<any[]>;
  // Cascade deletion functions for grouped transactions
  getTransactionsByGroupId: (groupId: string) => Transaction[];
  deleteTransactionGroup: (groupId: string) => void;
  deleteTransactionGroupFromIndex: (groupId: string, fromIndex: number) => void;
  // Soft Delete Recovery
  recoverTransaction: (id: string) => void;
  recoverAccount: (id: string) => void;
  recoverGoal: (id: string) => void;
  recoverInvestment: (id: string) => void;
  recoverPatrimonyItem: (id: string) => void;
  getDeletedTransactions: () => Transaction[];
  getDeletedAccounts: () => Account[];
  getDeletedGoals: () => Goal[];
  getDeletedInvestments: () => InvestmentAsset[];
  getDeletedPatrimonyItems: () => PatrimonyItem[];
  // STY-059: Invoice Context Integration
  creditCardInvoices: CardInvoice[];
  syncCreditCardInvoices: () => Promise<void>;
  isInvoicesSyncing: boolean;
  // FASE 3: Partnership Management (STY-076 to STY-078)
  partners: Partner[];
  addPartner: (partner: Omit<Partner, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updatePartner: (id: string, updates: Partial<Partner>) => void;
  deletePartner: (id: string) => void;
  recoverPartner: (id: string) => void;
  getDeletedPartners: () => Partner[];
  // FASE 2: Asset Acquisition (STY-071 to STY-075)
  assets: Asset[];
  addAsset: (asset: Omit<Asset, 'id' | 'dateAdded' | 'lastUpdated'>) => void;
  updateAsset: (id: string, updates: Partial<Asset>) => void;
  deleteAsset: (id: string) => void;
  recoverAsset: (id: string) => void;
  getDeletedAssets: () => Asset[];
}

const FinanceContext = createContext<FinanceContextData | undefined>(undefined);

const getStorageKey = (userId?: string) => userId ? `visao360_v2_data_${userId}` : 'visao360_v2_data';

/**
 * Helper to filter out soft-deleted items (items with deletedAt timestamp)
 */
const filterActive = <T extends { deletedAt?: number }>(items: T[] | undefined | null): T[] => {
  if (!Array.isArray(items)) return [];
  return items.filter(item => !item.deletedAt);
};

/**
 * Helper to get soft-deleted items only
 */
const filterDeleted = <T extends { deletedAt?: number }>(items: T[] | undefined | null): T[] => {
  if (!Array.isArray(items)) return [];
  return items.filter(item => item.deletedAt);
};

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

/**
 * Finance Provider component (REFACTORED - Split Architecture).
 *
 * This provider maintains the monolithic data structure for backward compatibility
 * while leveraging sub-context architecture for better performance and maintainability.
 *
 * Architecture:
 * - Accounts & Categories managed via AccountsContext
 * - Transactions managed via TransactionsContext
 * - Goals managed via GoalsContext
 * - Investments managed via InvestmentsContext
 * - Patrimony managed via PatrimonyContext
 *
 * This composite provider orchestrates all sub-contexts while exposing the unified API.
 */
export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const syncTimeoutRef = useRef<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);
  const [isInvoicesSyncing, setIsInvoicesSyncing] = useState(false);

  // Persistent Impersonation State Keys
  const IMPERSONATION_KEY = 'spfp_is_impersonating';
  const IMPERSONATED_USER_ID_KEY = 'spfp_impersonated_user_id';

  // Initialize state from localStorage
  const [isImpersonating, setIsImpersonating] = useState(() => {
    return localStorage.getItem(IMPERSONATION_KEY) === 'true';
  });
  const [impersonatedUserId, setImpersonatedUserId] = useState<string | null>(() => {
    return localStorage.getItem(IMPERSONATED_USER_ID_KEY);
  });

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
          categoryBudgets: Array.isArray(parsedData.categoryBudgets) ? parsedData.categoryBudgets : [],
          creditCardInvoices: Array.isArray(parsedData.creditCardInvoices) ? parsedData.creditCardInvoices : [],
          partners: Array.isArray(parsedData.partners) ? parsedData.partners : [],
          assets: Array.isArray(parsedData.assets) ? parsedData.assets : [],
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
      categoryBudgets: [],
      creditCardInvoices: [],
      partners: [],
      assets: [],
      userProfile: INITIAL_PROFILE,
      lastUpdated: 0
    };
  }, []);

  const [state, setState] = useState<GlobalState>(() => {
    // Se estiver personificando no load inicial, tenta carregar o estado desse usuário alvo
    const storedTargetId = localStorage.getItem(IMPERSONATED_USER_ID_KEY);
    if (storedTargetId) {
      return getInitialState(storedTargetId);
    }
    return getInitialState();
  });

  useEffect(() => {
    if (user?.id && stateUserIdRef.current === user.id) {
      // Só salva no localStorage do usuário autenticado se NÃO estiver personificando
      // Se estiver personificando, o saveToCloud já lida com o user_id correto,
      // e não queremos sobrescrever o cache local do admin com dados do cliente.
      if (!isImpersonating) {
        localStorage.setItem(getStorageKey(user.id), JSON.stringify(state));
      }
    }
  }, [state, user?.id, isImpersonating]);

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

        // Wrap Supabase upsert with retry logic
        await retryWithBackoff(
          async () => {
            const { error } = await supabase
              .from('user_data')
              .upsert({
                user_id: finalTargetUserId,
                content: dataToSave,
                last_updated: dataToSave.lastUpdated
              });

            if (error) throw error;
          },
          {
            maxRetries: 3,
            initialDelayMs: 500,
            timeoutMs: 10000,
            operationName: `Supabase Upsert user_data ${finalTargetUserId}`
          }
        );

        setIsSyncing(false);
      } catch (e: any) {
        logDetailedError('Supabase Save Error', e, {
          userId: finalTargetUserId,
          isImpersonating
        });

        // Alert the user if it's a permission error or other save failure
        // Use a less intrusive toast in production, but for now specific alert for the admin
        if (isImpersonating || user?.email === 'nando062218@gmail.com') {
          alert(`Erro ao salvar dados: ${getErrorMessage(e)}. Verifique as permissões.`);
        }
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

    // Determines the effective User ID to load data for
    const effectiveUserId = (isImpersonating && impersonatedUserId) ? impersonatedUserId : user.id;

    // Carregar dados iniciais do localStorage do usuário efetivo
    const initialState = getInitialState(effectiveUserId);
    stateUserIdRef.current = effectiveUserId;
    setState(initialState);

    setIsSyncing(true);

    // Initial Fetch with retry logic
    const fetchData = async () => {
      try {
        await retryWithBackoff(
          async () => {
            const { data, error } = await supabase
              .from('user_data')
              .select('content')
              .eq('user_id', effectiveUserId)
              .single();

            if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows found, which is ok

            if (data && data.content) {
              const cloudData = data.content as GlobalState;
              setState(current => {
                if (cloudData.lastUpdated > current.lastUpdated || current.lastUpdated === 0) {
                  // Ensure all arrays exist to prevent "Cannot read properties of undefined" errors
                  return {
                    ...cloudData,
                    accounts: Array.isArray(cloudData.accounts) ? cloudData.accounts : INITIAL_ACCOUNTS,
                    transactions: Array.isArray(cloudData.transactions) ? cloudData.transactions : INITIAL_TRANSACTIONS,
                    categories: Array.isArray(cloudData.categories) ? cloudData.categories : INITIAL_CATEGORIES,
                    goals: Array.isArray(cloudData.goals) ? cloudData.goals : [],
                    investments: Array.isArray(cloudData.investments) ? cloudData.investments : [],
                    patrimonyItems: Array.isArray(cloudData.patrimonyItems) ? cloudData.patrimonyItems : [],
                    categoryBudgets: Array.isArray(cloudData.categoryBudgets) ? cloudData.categoryBudgets : [],
                    creditCardInvoices: Array.isArray(cloudData.creditCardInvoices) ? cloudData.creditCardInvoices : [],
                    partners: Array.isArray(cloudData.partners) ? cloudData.partners : [],
                    assets: Array.isArray(cloudData.assets) ? cloudData.assets : [],
                    userProfile: cloudData.userProfile || INITIAL_PROFILE,
                    lastUpdated: cloudData.lastUpdated || Date.now(),
                  };
                }
                return current;
              });
            }
          },
          {
            maxRetries: 2,
            initialDelayMs: 500,
            timeoutMs: 10000,
            operationName: `Supabase Fetch user_data ${effectiveUserId}`
          }
        );
      } catch (error: any) {
        logDetailedError('Supabase Initial Fetch Error', error, {
          userId: effectiveUserId
        });
        // Continue with local data on error
        console.warn('Failed to fetch cloud data, using local cache');
      } finally {
        setIsInitialLoadComplete(true);
        setIsSyncing(false);
      }
    };

    fetchData();

    // Realtime Subscription for the effective user
    const channel = supabase
      .channel('user_data_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_data',
          filter: `user_id=eq.${effectiveUserId}`
        },
        (payload: SupabasePayload) => {
          const newData = payload.new as Record<string, unknown> | null;
          if (newData && newData.content) {
            const cloudData = newData.content as GlobalState;
            setState(current => {
              if (cloudData.lastUpdated > current.lastUpdated) {
                // Ensure all arrays exist in cloud data structure merge to prevent undefined access
                const safeCloudData = {
                  ...cloudData,
                  accounts: Array.isArray(cloudData.accounts) ? cloudData.accounts : INITIAL_ACCOUNTS,
                  transactions: Array.isArray(cloudData.transactions) ? cloudData.transactions : INITIAL_TRANSACTIONS,
                  categories: Array.isArray(cloudData.categories) ? cloudData.categories : INITIAL_CATEGORIES,
                  goals: Array.isArray(cloudData.goals) ? cloudData.goals : [],
                  investments: Array.isArray(cloudData.investments) ? cloudData.investments : [],
                  categoryBudgets: Array.isArray(cloudData.categoryBudgets) ? cloudData.categoryBudgets : [],
                  patrimonyItems: Array.isArray(cloudData.patrimonyItems) ? cloudData.patrimonyItems : [],
                  creditCardInvoices: Array.isArray(cloudData.creditCardInvoices) ? cloudData.creditCardInvoices : [],
                  partners: Array.isArray(cloudData.partners) ? cloudData.partners : [],
                  assets: Array.isArray(cloudData.assets) ? cloudData.assets : [],
                  userProfile: cloudData.userProfile || INITIAL_PROFILE,
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
  }, [user, isImpersonating, impersonatedUserId]); // Re-run if impersonation changes

  /**
   * Updates the local state and triggers a cloud synchronization.
   * @param partial - Partial state to update
   */
  const updateAndSync = (partial: Partial<Omit<GlobalState, 'lastUpdated'>>) => {
    if (!isInitialLoadComplete && user) {
      return;
    }
    const nextState = { ...state, ...partial, lastUpdated: Date.now() };
    setState(nextState);
    saveToCloud(nextState);

    // Timeline Logging: Track changes made by admin while impersonating
    if (isImpersonating && impersonatedUserId && user) {
      const keys = Object.keys(partial).join(', ');
      logInteraction({
        admin_id: user.id,
        client_id: impersonatedUserId,
        action_type: 'CHANGE',
        description: `Alteração de dados: ${keys}`,
        metadata: { updated_fields: keys }
      });
    }
  };

  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const shouldAffectBalanceNow = (date: string) => new Date(date) <= today;

  /**
   * Adds a single transaction and updates the corresponding account balance.
   * @param d - Transaction data without ID
   */
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

  /**
   * Adds multiple transactions in bulk and calculates all balance updates efficiently.
   * @param txs - Array of transaction data without IDs
   */
  const addManyTransactions = (txs: Omit<Transaction, 'id'>[]) => {
    const newTxs = txs.map(t => ({ ...t, id: generateId() }));
    const nextAcc = state.accounts.map(a => {
      let b = a.balance;
      txs.forEach(tx => { if (tx.accountId === a.id && shouldAffectBalanceNow(tx.date)) b += (tx.type === 'INCOME' ? tx.value : -tx.value); });
      return { ...a, balance: b };
    });
    updateAndSync({ transactions: [...newTxs, ...state.transactions], accounts: nextAcc });
  };

  /**
   * Updates an existing transaction and adjusts account balances accordingly (reverting old values and applying new ones).
   * @param u - Updated transaction object
   */
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

  /**
   * Efficiently updates multiple transactions and recalculates affected balances.
   * @param updates - Array of updated transaction objects
   */
  const updateTransactions = (updates: Transaction[]) => {
    let nextAcc = [...state.accounts];
    const updateMap = new Map(updates.map(u => [u.id, u]));

    // Revert old effects
    updates.forEach(u => {
      const old = state.transactions.find(t => t.id === u.id);
      if (old && shouldAffectBalanceNow(old.date)) {
        nextAcc = nextAcc.map(a => a.id === old.accountId ? { ...a, balance: a.balance + (old.type === 'INCOME' ? -old.value : old.value) } : a);
      }
    });

    // Apply new effects
    updates.forEach(u => {
      if (shouldAffectBalanceNow(u.date)) {
        nextAcc = nextAcc.map(a => a.id === u.accountId ? { ...a, balance: a.balance + (u.type === 'INCOME' ? u.value : -u.value) } : a);
      }
    });

    const nextTxs = state.transactions.map(t => updateMap.get(t.id) || t);
    updateAndSync({ accounts: nextAcc, transactions: nextTxs });
  };

  /**
   * Soft-deletes a single transaction and reverts its effect on the account balance.
   * @param id - ID of the transaction to delete
   */
  const deleteTransaction = (id: string) => {
    const tx = state.transactions.find(t => t.id === id);
    if (!tx || tx.deletedAt) return; // Skip if not found or already deleted
    const nextAcc = state.accounts.map(a => (a.id === tx.accountId && shouldAffectBalanceNow(tx.date)) ? { ...a, balance: a.balance + (tx.type === 'INCOME' ? -tx.value : tx.value) } : a);
    const nextTx = state.transactions.map(t => t.id === id ? { ...t, deletedAt: Date.now() } : t);
    updateAndSync({ accounts: nextAcc, transactions: nextTx });
  };

  /**
   * Soft-deletes multiple transactions and reverts their effects on balances in bulk.
   * @param ids - Array of transaction IDs to delete
   */
  const deleteTransactions = (ids: string[]) => {
    let nextAcc = [...state.accounts];
    let nextTx = [...state.transactions];
    const idSet = new Set(ids);
    ids.forEach(id => {
      const tx = nextTx.find(t => t.id === id);
      if (tx && !tx.deletedAt) {
        if (shouldAffectBalanceNow(tx.date)) nextAcc = nextAcc.map(a => a.id === tx.accountId ? { ...a, balance: a.balance + (tx.type === 'INCOME' ? -tx.value : tx.value) } : a);
      }
    });
    nextTx = nextTx.map(t => idSet.has(t.id) && !t.deletedAt ? { ...t, deletedAt: Date.now() } : t);
    updateAndSync({ accounts: nextAcc, transactions: nextTx });
  };

  /**
   * Returns all transactions belonging to a specific group.
   * @param groupId - The group ID to filter by
   */
  const getTransactionsByGroupId = (groupId: string): Transaction[] => {
    return filterActive(state.transactions.filter(t => t.groupId === groupId)).sort((a, b) => (a.groupIndex || 0) - (b.groupIndex || 0));
  };

  /**
   * Soft-deletes ALL transactions in a group (parcelado/recorrente).
   * @param groupId - The group ID to delete
   */
  const deleteTransactionGroup = (groupId: string) => {
    const groupTxs = state.transactions.filter(t => t.groupId === groupId && !t.deletedAt);
    if (groupTxs.length === 0) return;

    const ids = groupTxs.map(t => t.id);
    deleteTransactions(ids);
  };

  /**
   * Soft-deletes transactions in a group from a specific index onwards (this + future).
   * @param groupId - The group ID
   * @param fromIndex - Delete from this index onwards (inclusive)
   */
  const deleteTransactionGroupFromIndex = (groupId: string, fromIndex: number) => {
    const groupTxs = state.transactions.filter(t => t.groupId === groupId && (t.groupIndex || 0) >= fromIndex && !t.deletedAt);
    if (groupTxs.length === 0) return;

    const ids = groupTxs.map(t => t.id);
    deleteTransactions(ids);
  };

  const addAccount = (d: Omit<Account, 'id'>) => updateAndSync({ accounts: [...state.accounts, { ...d, id: generateId() }] });
  const updateAccount = (u: Account) => updateAndSync({ accounts: state.accounts.map(a => a.id === u.id ? u : a) });
  const deleteAccount = (id: string) => {
    const account = state.accounts.find(a => a.id === id);
    if (!account || account.deletedAt) return;
    // Soft delete transactions associated with this account
    const nextTx = state.transactions.map(t => t.accountId === id && !t.deletedAt ? { ...t, deletedAt: Date.now() } : t);
    // Soft delete the account itself
    const nextAcc = state.accounts.map(a => a.id === id ? { ...a, deletedAt: Date.now() } : a);
    updateAndSync({ transactions: nextTx, accounts: nextAcc });
  };

  const addCategory = (d: Omit<Category, 'id'>) => {
    const id = generateId();
    updateAndSync({ categories: [...state.categories, { ...d, id }] });
    return id;
  };

  const updateCategory = (u: Category) => updateAndSync({ categories: state.categories.map(c => c.id === u.id ? u : c) });
  const deleteCategory = (id: string) => {
    const category = state.categories.find(c => c.id === id);
    if (!category || category.deletedAt) return;
    const nextCat = state.categories.map(c => c.id === id ? { ...c, deletedAt: Date.now() } : c);
    updateAndSync({ categories: nextCat });
  };

  // Goal Logic
  const addGoal = (g: Omit<Goal, 'id'>) => updateAndSync({ goals: [...state.goals, { ...g, id: generateId() }] });
  const updateGoal = (u: Goal) => updateAndSync({ goals: state.goals.map(g => g.id === u.id ? u : g) });
  const deleteGoal = (id: string) => {
    const goal = state.goals.find(g => g.id === id);
    if (!goal || goal.deletedAt) return;
    const nextGoals = state.goals.map(g => g.id === id ? { ...g, deletedAt: Date.now() } : g);
    updateAndSync({ goals: nextGoals });
  };

  // Investment Logic
  const addInvestment = (i: Omit<InvestmentAsset, 'id'>) => updateAndSync({ investments: [...state.investments, { ...i, id: generateId() }] });
  const updateInvestment = (u: InvestmentAsset) => updateAndSync({ investments: state.investments.map(i => i.id === u.id ? u : i) });
  const deleteInvestment = (id: string) => {
    const investment = state.investments.find(i => i.id === id);
    if (!investment || investment.deletedAt) return;
    const nextInv = state.investments.map(i => i.id === id ? { ...i, deletedAt: Date.now() } : i);
    updateAndSync({ investments: nextInv });
  };

  // Patrimony Logic
  const addPatrimonyItem = (item: Omit<PatrimonyItem, 'id'>) => updateAndSync({ patrimonyItems: [...state.patrimonyItems, { ...item, id: generateId() }] });
  const updatePatrimonyItem = (item: PatrimonyItem) => updateAndSync({ patrimonyItems: state.patrimonyItems.map(i => i.id === item.id ? item : i) });
  const deletePatrimonyItem = (id: string) => {
    const item = state.patrimonyItems.find(i => i.id === id);
    if (!item || item.deletedAt) return;
    const nextItems = state.patrimonyItems.map(i => i.id === id ? { ...i, deletedAt: Date.now() } : i);
    updateAndSync({ patrimonyItems: nextItems });
  };

  // Budgeting Logic
  const updateCategoryBudget = (categoryId: string, limit: number) => {
    const budgets = state.categoryBudgets || [];
    const existing = budgets.find(b => b.categoryId === categoryId);
    let newBudgets;
    if (existing) {
      newBudgets = budgets.map(b => b.categoryId === categoryId ? { ...b, limit } : b);
    } else {
      newBudgets = [...budgets, { categoryId, limit }];
    }
    updateAndSync({ categoryBudgets: newBudgets });
  };

  // Admin Methods
  const fetchAllUserData = async () => {
    try {
      return await retryWithBackoff(
        async () => {
          const { data, error } = await supabase
            .from('user_data')
            .select('user_id, content, last_updated');
          if (error) throw error;
          return data || [];
        },
        {
          maxRetries: 3,
          initialDelayMs: 1000,
          timeoutMs: 15000,
          operationName: 'Supabase Fetch All User Data'
        }
      );
    } catch (error: any) {
      logDetailedError('Supabase Fetch All User Data Error', error);
      throw new Error(getErrorMessage(error));
    }
  };

  /**
   * Loads a client's data for admin impersonation.
   * Fetches data from cloud and switches application context to target user.
   * Implements retry logic for reliable data loading.
   *
   * @param userId - ID of the user to impersonate
   */
  const loadClientData = async (userId: string) => {
    setIsSyncing(true);
    try {
      await retryWithBackoff(
        async () => {
          const { data, error } = await supabase
            .from('user_data')
            .select('content')
            .eq('user_id', userId)
            .single();

          if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows found

          if (data && data.content) {
            // Backup original state before impersonating if not already
            if (!isImpersonating && user) {
              // We can optimistically save current state.
              // Ideally we just rely on localStorage/re-fetch for admin when they come back
              // But let's keep the adminOriginalState in memory for quick back button within session
              setAdminOriginalState(state);
            }

            // Update State
            const clientContent = data.content as GlobalState;
            setState({
              ...clientContent,
              accounts: Array.isArray(clientContent.accounts) ? clientContent.accounts : INITIAL_ACCOUNTS,
              transactions: Array.isArray(clientContent.transactions) ? clientContent.transactions : INITIAL_TRANSACTIONS,
              categories: Array.isArray(clientContent.categories) ? clientContent.categories : INITIAL_CATEGORIES,
              goals: Array.isArray(clientContent.goals) ? clientContent.goals : [],
              investments: Array.isArray(clientContent.investments) ? clientContent.investments : [],
              patrimonyItems: Array.isArray(clientContent.patrimonyItems) ? clientContent.patrimonyItems : [],
              categoryBudgets: Array.isArray(clientContent.categoryBudgets) ? clientContent.categoryBudgets : [],
              creditCardInvoices: Array.isArray(clientContent.creditCardInvoices) ? clientContent.creditCardInvoices : [],
              partners: Array.isArray(clientContent.partners) ? clientContent.partners : [],
              assets: Array.isArray(clientContent.assets) ? clientContent.assets : [],
              userProfile: clientContent.userProfile || INITIAL_PROFILE,
            } as GlobalState);
            stateUserIdRef.current = userId;

            // PERSIST IMPERSONATION
            localStorage.setItem(IMPERSONATION_KEY, 'true');
            localStorage.setItem(IMPERSONATED_USER_ID_KEY, userId);

            setIsImpersonating(true);
            setImpersonatedUserId(userId);

            // Timeline Logging: Track access by admin
            if (user) {
              logInteraction({
                admin_id: user.id,
                client_id: userId,
                action_type: 'ACCESS',
                description: 'Acesso ao dashboard do cliente',
                metadata: { timestamp: Date.now() }
              });
            }

            window.scrollTo(0, 0);
            navigate('/dashboard'); // Redirect to Dashboard
          }
        },
        {
          maxRetries: 3,
          initialDelayMs: 500,
          timeoutMs: 10000,
          operationName: `Load Client Data ${userId}`
        }
      );
    } catch (e: any) {
      logDetailedError('Load Client Data Error', e, {
        clientUserId: userId
      });
      alert(`Erro ao carregar dados do cliente: ${getErrorMessage(e)}`);
    } finally {
      setIsSyncing(false);
    }
  };

  /**
   * Stops the current impersonation session and returns to the admin view.
   * @param redirectPath - Path to navigate after stopping impersonation
   */
  const stopImpersonating = (redirectPath: string = '/admin') => {
    // Clear Persistence
    localStorage.removeItem(IMPERSONATION_KEY);
    localStorage.removeItem(IMPERSONATED_USER_ID_KEY);

    setIsImpersonating(false);
    setImpersonatedUserId(null);
    setAdminOriginalState(null); // Clear memory state as we will reload fresh

    // IMPORTANT: Do NOT manually set stateUserIdRef.current here.
    // We want the main useEffect to detect that user.id != stateUserIdRef.current (which is currently the client ID)
    // and trigger a fresh load of the admin's data.

    navigate(redirectPath);
  };

  // Soft Delete Recovery Functions
  /**
   * Recovers a soft-deleted transaction by clearing its deletedAt flag.
   * @param id - ID of the transaction to recover
   */
  const recoverTransaction = (id: string) => {
    const tx = state.transactions.find(t => t.id === id);
    if (!tx || !tx.deletedAt) return; // Skip if not found or not deleted

    // Restore the balance impact when recovering
    const nextAcc = state.accounts.map(a => (a.id === tx.accountId && shouldAffectBalanceNow(tx.date)) ? { ...a, balance: a.balance + (tx.type === 'INCOME' ? tx.value : -tx.value) } : a);
    const nextTx = state.transactions.map(t => t.id === id ? { ...t, deletedAt: undefined } : t);
    updateAndSync({ accounts: nextAcc, transactions: nextTx });
  };

  /**
   * Recovers a soft-deleted account by clearing its deletedAt flag.
   * @param id - ID of the account to recover
   */
  const recoverAccount = (id: string) => {
    const account = state.accounts.find(a => a.id === id);
    if (!account || !account.deletedAt) return;
    const nextAcc = state.accounts.map(a => a.id === id ? { ...a, deletedAt: undefined } : a);
    updateAndSync({ accounts: nextAcc });
  };

  /**
   * Recovers a soft-deleted goal by clearing its deletedAt flag.
   * @param id - ID of the goal to recover
   */
  const recoverGoal = (id: string) => {
    const goal = state.goals.find(g => g.id === id);
    if (!goal || !goal.deletedAt) return;
    const nextGoals = state.goals.map(g => g.id === id ? { ...g, deletedAt: undefined } : g);
    updateAndSync({ goals: nextGoals });
  };

  /**
   * Recovers a soft-deleted investment by clearing its deletedAt flag.
   * @param id - ID of the investment to recover
   */
  const recoverInvestment = (id: string) => {
    const investment = state.investments.find(i => i.id === id);
    if (!investment || !investment.deletedAt) return;
    const nextInv = state.investments.map(i => i.id === id ? { ...i, deletedAt: undefined } : i);
    updateAndSync({ investments: nextInv });
  };

  /**
   * Recovers a soft-deleted patrimony item by clearing its deletedAt flag.
   * @param id - ID of the patrimony item to recover
   */
  const recoverPatrimonyItem = (id: string) => {
    const item = state.patrimonyItems.find(i => i.id === id);
    if (!item || !item.deletedAt) return;
    const nextItems = state.patrimonyItems.map(i => i.id === id ? { ...i, deletedAt: undefined } : i);
    updateAndSync({ patrimonyItems: nextItems });
  };

  /**
   * Gets all soft-deleted transactions
   */
  const getDeletedTransactions = (): Transaction[] => {
    return filterDeleted(state.transactions);
  };

  /**
   * Gets all soft-deleted accounts
   */
  const getDeletedAccounts = (): Account[] => {
    return filterDeleted(state.accounts);
  };

  /**
   * Gets all soft-deleted goals
   */
  const getDeletedGoals = (): Goal[] => {
    return filterDeleted(state.goals);
  };

  /**
   * Gets all soft-deleted investments
   */
  const getDeletedInvestments = (): InvestmentAsset[] => {
    return filterDeleted(state.investments);
  };

  /**
   * Gets all soft-deleted patrimony items
   */
  const getDeletedPatrimonyItems = (): PatrimonyItem[] => {
    return filterDeleted(state.patrimonyItems);
  };

  /**
   * FASE 2: Asset Acquisition Management (STY-071 to STY-075)
   */
  const addAsset = (asset: Omit<Asset, 'id' | 'dateAdded' | 'lastUpdated'>) => {
    const newAsset = assetService.createAsset(asset);
    updateAndSync({ assets: [...state.assets, newAsset] });
  };

  const updateAsset = (id: string, updates: Partial<Asset>) => {
    const asset = state.assets.find(a => a.id === id);
    if (!asset) return;
    const updated = assetService.updateAsset(asset, updates);
    updateAndSync({ assets: state.assets.map(a => a.id === id ? updated : a) });
  };

  const deleteAsset = (id: string) => {
    const asset = state.assets.find(a => a.id === id);
    if (!asset) return;
    const deleted = assetService.deleteAsset(asset);
    updateAndSync({ assets: state.assets.map(a => a.id === id ? deleted : a) });
  };

  const recoverAsset = (id: string) => {
    const asset = state.assets.find(a => a.id === id);
    if (!asset || !asset.deletedAt) return;
    const nextAssets = state.assets.map(a => a.id === id ? { ...a, deletedAt: undefined } : a);
    updateAndSync({ assets: nextAssets });
  };

  const getDeletedAssets = (): Asset[] => {
    return filterDeleted(state.assets);
  };

  /**
   * STY-059: Sync credit card invoices from service
   */
  const syncCreditCardInvoices = useCallback(async () => {
    if (!user?.id) return;

    setIsInvoicesSyncing(true);
    try {
      // Fetch invoices for each credit card account
      const creditCards = filterActive(state.accounts).filter(a => a.type === 'CREDIT_CARD');
      const allInvoices: CardInvoice[] = [];

      for (const card of creditCards) {
        try {
          const invoices = await cardInvoiceService.fetchCardInvoices({
            cardId: card.id,
            months: 3,
            includeHistory: true
          });
          allInvoices.push(...invoices);
        } catch (error) {
          console.warn(`Failed to sync invoices for card ${card.id}:`, error);
        }
      }

      // Update state with invoices
      updateAndSync({ creditCardInvoices: allInvoices });

      // Log sync
      logInteraction({
        action: 'sync_credit_card_invoices',
        metadata: { invoiceCount: allInvoices.length }
      });
    } catch (error) {
      logDetailedError(
        error as Error,
        'Failed to sync credit card invoices',
        { action: 'syncCreditCardInvoices', severity: 'medium' }
      );
    } finally {
      setIsInvoicesSyncing(false);
    }
  }, [user?.id, state.accounts]);

  // Auto-sync invoices on app load (every 30 minutes)
  useEffect(() => {
    if (!isInitialLoadComplete || !user?.id) return;

    // Initial sync
    syncCreditCardInvoices();

    // Set up interval for periodic sync (30 minutes)
    const intervalId = setInterval(syncCreditCardInvoices, 30 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [isInitialLoadComplete, user?.id, syncCreditCardInvoices]);

  /**
   * FASE 3: Partnership Management (STY-076 to STY-078)
   */
  const addPartner = (partner: Omit<Partner, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newPartner = partnershipService.createPartner(partner);
    updateAndSync({ partners: [...state.partners, newPartner] });
  };

  const updatePartner = (id: string, updates: Partial<Partner>) => {
    const partner = state.partners.find(p => p.id === id);
    if (!partner) return;
    const updated = partnershipService.updatePartner(partner, updates);
    updateAndSync({ partners: state.partners.map(p => p.id === id ? updated : p) });
  };

  const deletePartner = (id: string) => {
    const partner = state.partners.find(p => p.id === id);
    if (!partner) return;
    const deleted = partnershipService.deletePartner(partner);
    updateAndSync({ partners: state.partners.map(p => p.id === id ? deleted : p) });
  };

  const recoverPartner = (id: string) => {
    const partner = state.partners.find(p => p.id === id);
    if (!partner || !partner.deletedAt) return;
    const nextPartners = state.partners.map(p => p.id === id ? { ...p, deletedAt: undefined } : p);
    updateAndSync({ partners: nextPartners });
  };

  const getDeletedPartners = (): Partner[] => {
    return filterDeleted(state.partners);
  };

  // Initialize offline sync service
  useEffect(() => {
    offlineSyncService.init().catch(err => console.warn('Offline sync init failed:', err));

    // Register online/offline listeners
    const unsubscribe = offlineSyncService.registerSyncListeners({
      onOnline: async () => {
        console.log('Back online - syncing pending operations');
        const result = await offlineSyncService.syncPendingOperations();
        console.log(`Synced: ${result.successful} successful, ${result.failed} failed`);
      },
      onOffline: () => {
        console.log('Now offline - operations will be queued');
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <FinanceContext.Provider value={{
      userProfile: state.userProfile,
      updateUserProfile: (p) => updateAndSync({ userProfile: p }),
      accounts: filterActive(state.accounts),
      transactions: filterActive(state.transactions),
      categories: filterActive(state.categories),
      goals: filterActive(state.goals),
      investments: filterActive(state.investments),
      addTransaction, addManyTransactions, updateTransaction, deleteTransaction, deleteTransactions,
      addAccount, updateAccount, deleteAccount, addCategory, updateCategory, deleteCategory,
      addGoal, updateGoal, deleteGoal,
      addInvestment, updateInvestment, deleteInvestment,
      updateTransactions,
      patrimonyItems: filterActive(state.patrimonyItems),
      addPatrimonyItem, updatePatrimonyItem, deletePatrimonyItem,
      getAccountBalance: (id) => filterActive(state.accounts).find(a => a.id === id)?.balance || 0,
      totalBalance: filterActive(state.accounts).reduce((acc, curr) => acc + curr.balance, 0),
      isSyncing,
      isInitialLoadComplete,
      isImpersonating,
      stopImpersonating,
      loadClientData,
      fetchAllUserData,
      categoryBudgets: state.categoryBudgets || [],
      updateCategoryBudget,
      getTransactionsByGroupId: (groupId: string) => filterActive(state.transactions.filter(t => t.groupId === groupId)).sort((a, b) => (a.groupIndex || 0) - (b.groupIndex || 0)),
      deleteTransactionGroup,
      deleteTransactionGroupFromIndex,
      recoverTransaction,
      recoverAccount,
      recoverGoal,
      recoverInvestment,
      recoverPatrimonyItem,
      getDeletedTransactions,
      getDeletedAccounts,
      getDeletedGoals,
      getDeletedInvestments,
      getDeletedPatrimonyItems,
      // STY-059: Invoice Context Integration
      creditCardInvoices: state.creditCardInvoices || [],
      syncCreditCardInvoices,
      isInvoicesSyncing,
      // FASE 3: Partnership Management (STY-076 to STY-078)
      partners: filterActive(state.partners),
      addPartner,
      updatePartner,
      deletePartner,
      recoverPartner,
      getDeletedPartners,
      // FASE 2: Asset Acquisition (STY-071 to STY-075)
      assets: filterActive(state.assets),
      addAsset,
      updateAsset,
      deleteAsset,
      recoverAsset,
      getDeletedAssets
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
