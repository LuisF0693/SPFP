import { useFinance } from '../context/FinanceContext';
import { INITIAL_ACCOUNTS, INITIAL_CATEGORIES, INITIAL_TRANSACTIONS } from '../data/initialData';
import type { FinanceContextData } from '../context/FinanceContext';

/**
 * Safe wrapper around useFinance hook that guarantees all array properties
 * are never undefined, preventing "Cannot read properties of undefined" errors.
 *
 * All array properties default to empty arrays if not available.
 * All function properties default to no-op functions.
 */
export const useSafeFinance = (): FinanceContextData => {
  let context: FinanceContextData | undefined;
  let error: Error | undefined;

  try {
    context = useFinance();
  } catch (e) {
    error = e as Error;
  }

  if (!context || error) {
    // Return safe defaults when context is unavailable
    return {
      // Arrays - always non-null
      userProfile: {
        name: '',
        email: '',
        cpf: '',
        phone: '',
        hasChildren: false,
        children: [],
        hasSpouse: false,
        spouseName: '',
        spouseCpf: '',
        spouseEmail: '',
        dashboardLayout: [],
        monthlySavingsTarget: 0,
        apiToken: '',
        geminiToken: ''
      },
      accounts: [],
      transactions: [],
      categories: [],
      goals: [],
      investments: [],
      patrimonyItems: [],
      categoryBudgets: [],
      creditCardInvoices: [],
      partners: [],
      assets: [],

      // Computed properties
      totalBalance: 0,

      // Sync flags
      isSyncing: false,
      isInitialLoadComplete: false,
      isInvoicesSyncing: false,
      isImpersonating: false,

      // No-op functions (safe to call but do nothing)
      updateUserProfile: () => {},
      addTransaction: () => {},
      addManyTransactions: () => {},
      updateTransaction: () => {},
      deleteTransaction: () => {},
      deleteTransactions: () => {},
      addAccount: () => {},
      updateAccount: () => {},
      deleteAccount: () => {},
      addCategory: () => {},
      updateCategory: () => {},
      deleteCategory: () => {},
      addGoal: () => {},
      updateGoal: () => {},
      deleteGoal: () => {},
      addInvestment: () => {},
      updateInvestment: () => {},
      deleteInvestment: () => {},
      addPatrimonyItem: () => {},
      updatePatrimonyItem: () => {},
      deletePatrimonyItem: () => {},
      getAccountBalance: () => 0,
      updateCategoryBudget: () => {},
      recoverTransaction: () => {},
      recoverAccount: () => {},
      recoverGoal: () => {},
      recoverInvestment: () => {},
      recoverPatrimonyItem: () => {},
      stopImpersonating: () => {},
      loadClientData: async () => {},
      fetchAllUserData: async () => [],
      getTransactionsByGroupId: () => [],
      deleteTransactionGroup: () => {},
      deleteTransactionGroupFromIndex: () => {},
      getDeletedTransactions: () => [],
      getDeletedAccounts: () => [],
      getDeletedGoals: () => [],
      getDeletedInvestments: () => [],
      getDeletedPatrimonyItems: () => [],
      syncCreditCardInvoices: async () => {},
      addPartner: () => {},
      updatePartner: () => {},
      deletePartner: () => {},
      recoverPartner: () => {},
      getDeletedPartners: () => [],
      addAsset: () => {},
      updateAsset: () => {},
      deleteAsset: () => {},
      recoverAsset: () => {},
      getDeletedAssets: () => []
    };
  }

  // Return context with guaranteed non-null arrays
  return {
    ...context,
    accounts: Array.isArray(context.accounts) ? context.accounts : [],
    transactions: Array.isArray(context.transactions) ? context.transactions : [],
    categories: Array.isArray(context.categories) ? context.categories : [],
    goals: Array.isArray(context.goals) ? context.goals : [],
    investments: Array.isArray(context.investments) ? context.investments : [],
    patrimonyItems: Array.isArray(context.patrimonyItems) ? context.patrimonyItems : [],
    categoryBudgets: Array.isArray(context.categoryBudgets) ? context.categoryBudgets : [],
    creditCardInvoices: Array.isArray(context.creditCardInvoices) ? context.creditCardInvoices : [],
    partners: Array.isArray(context.partners) ? context.partners : [],
    assets: Array.isArray(context.assets) ? context.assets : [],
    userProfile: context.userProfile || {
      name: '',
      email: '',
      cpf: '',
      phone: '',
      hasChildren: false,
      children: [],
      hasSpouse: false,
      spouseName: '',
      spouseCpf: '',
      spouseEmail: '',
      dashboardLayout: [],
      monthlySavingsTarget: 0,
      apiToken: '',
      geminiToken: ''
    }
  };
};
