/**
 * Dashboard Components - Decomposed from monolithic Dashboard
 */

export { DashboardHeader } from './DashboardHeader';
export { DashboardMetrics } from './DashboardMetrics';
export { DashboardAlerts } from './DashboardAlerts';
export { DashboardChart } from './DashboardChart';
export { DashboardTransactions } from './DashboardTransactions';

export {
  useMonthlyMetrics,
  useBudgetAlerts,
  useAtypicalSpending,
  useTrendData,
  useCategoryChartData,
  getMonthFilteredTransactions,
  type MonthlyMetrics,
  type BudgetAlert,
  type ChartDataPoint,
  type CategoryChartData,
  type AtypicalTransaction
} from './dashboardUtils';
