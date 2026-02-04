// Export all sub-contexts and hooks
export { TransactionsProvider, useTransactions } from './TransactionsContext';
export type { TransactionsContextType, TransactionsProviderProps } from './TransactionsContext';

export { AccountsProvider, useAccounts } from './AccountsContext';
export type { AccountsContextType, AccountsProviderProps } from './AccountsContext';

export { GoalsProvider, useGoals } from './GoalsContext';
export type { GoalsContextType, GoalsProviderProps } from './GoalsContext';

export { InvestmentsProvider, useInvestments } from './InvestmentsContext';
export type { InvestmentsContextType, InvestmentsProviderProps } from './InvestmentsContext';

export { PatrimonyProvider, usePatrimony } from './PatrimonyContext';
export type { PatrimonyContextType, PatrimonyProviderProps } from './PatrimonyContext';

// Export main FinanceContext for backward compatibility
export { FinanceProvider, useFinance } from './FinanceContext';
export type { FinanceContextData } from './FinanceContext';

// Export AuthContext
export { AuthProvider, useAuth } from './AuthContext';
export type { AuthContextType } from './AuthContext';
