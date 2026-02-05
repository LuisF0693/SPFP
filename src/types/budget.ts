/**
 * Budget Management Type Definitions
 * FASE 1: STY-053 (Budget Section in Sidebar)
 *
 * Defines types for budget periods, items, and calculations
 */

/**
 * Budget period status lifecycle
 * ACTIVE: Currently accepting transactions
 * CLOSED: Period ended, ready for archival
 * ARCHIVED: Historical reference, read-only
 */
export type BudgetPeriodStatus = 'ACTIVE' | 'CLOSED' | 'ARCHIVED';

/**
 * Budget item status based on spending
 * IN_PROGRESS: Within budget (< 90%)
 * COMPLETED: Near limit (90-100%)
 * EXCEEDED: Over budget (> 100%)
 */
export type BudgetItemStatus = 'IN_PROGRESS' | 'EXCEEDED' | 'COMPLETED';

/**
 * Budget period: Monthly, quarterly, or annual spending cycle
 */
export interface BudgetPeriod {
  id: string;
  user_id: string;
  period_name: string; // e.g., "Fevereiro 2026" or "Q1 2026"
  period_start: string; // ISO date
  period_end: string; // ISO date
  total_amount: number; // Total budget for period
  total_spent: number; // Denormalized sum of budget_items (for performance)
  status: BudgetPeriodStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
  deletedAt?: number; // Soft delete timestamp (milliseconds)
}

/**
 * Budget item: Category-level budget within a period
 */
export interface BudgetItem {
  id: string;
  budget_period_id: string; // Reference to budget period
  user_id: string;
  category_id: string; // e.g., "FOOD", "TRANSPORT", etc.
  category_name: string; // Display name
  budgeted_amount: number; // Amount allocated for this category
  spent_amount: number; // Actual spending this period
  rollover_amount: number; // Unused budget for next period
  status: BudgetItemStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
  deletedAt?: number; // Soft delete timestamp (milliseconds)
}

/**
 * Budget summary for dashboard display
 */
export interface BudgetSummary {
  totalBudgeted: number;
  totalSpent: number;
  totalRemaining: number;
  utilizationRate: number; // 0-100%
  overBudgetCount: number;
  budgetItems: BudgetItem[];
}

/**
 * Budget period with calculated metrics
 */
export interface BudgetPeriodWithMetrics extends BudgetPeriod {
  itemsCount: number;
  spentPercentage: number; // 0-100
  remainingDays: number;
  onTrack: boolean; // true if spending matches pace
}

/**
 * Context type for BudgetContext hook
 */
export interface BudgetContextType {
  // State
  budgetPeriods: BudgetPeriod[];
  budgetItems: BudgetItem[];
  currentPeriod: BudgetPeriod | null;
  isSyncing: boolean;
  isInitialLoadComplete: boolean;
  lastUpdated: number;

  // Period Management
  createBudgetPeriod(
    period: Omit<BudgetPeriod, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'total_spent'>
  ): Promise<BudgetPeriod>;

  updateBudgetPeriod(period: BudgetPeriod): Promise<void>;
  closeBudgetPeriod(periodId: string): Promise<void>;
  archiveBudgetPeriod(periodId: string): Promise<void>;
  getCurrentBudgetPeriod(): BudgetPeriod | null;

  // Item Management
  addBudgetItem(
    item: Omit<BudgetItem, 'id' | 'user_id' | 'spent_amount' | 'created_at' | 'updated_at'>
  ): Promise<BudgetItem>;

  updateBudgetItem(item: BudgetItem): Promise<void>;
  deleteBudgetItem(itemId: string): Promise<void>;

  // Calculations
  getBudgetItemsByPeriod(periodId: string): BudgetItem[];
  getSpendingPercentage(itemId: string): number;
  getOverBudgetItems(periodId: string): BudgetItem[];
  getRemainingBudget(itemId: string): number;
  getBudgetSummary(periodId: string): BudgetSummary;
  getTopCategoriesBySpending(periodId: string, limit?: number): BudgetItem[];

  // Sync & Persistence
  syncBudgetsFromSupabase(): Promise<void>;
  saveBudgetsToLocalStorage(): void;
  loadBudgetsFromLocalStorage(): void;
}

/**
 * Props for BudgetProvider component
 */
export interface BudgetProviderProps {
  children: React.ReactNode;
  userId?: string;
  onStateChange?: (state: BudgetPeriodState) => void;
}

/**
 * Internal state for BudgetContext
 */
export interface BudgetPeriodState {
  budgetPeriods: BudgetPeriod[];
  budgetItems: BudgetItem[];
  currentPeriodId: string | null;
  lastUpdated: number;
  isSyncing: boolean;
}
