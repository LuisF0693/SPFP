import { Transaction, CategoryBudget, Account } from '../types';

export interface ProjectionPoint {
    date: string;
    balance: number;
    income: number;
    expense: number;
}

export interface ProjectionResult {
    points: ProjectionPoint[];
    summary: {
        finalBalance: number;
        peakBalance: number;
        lowestBalance: number;
        projectedSavings: number;
    };
}

/**
 * Service to calculate future cash flow projections.
 * 
 * @param currentBalance - Current total balance from all accounts
 * @param transactions - List of current transactions (including future/unpaid)
 * @param budgets - Monthly category budgets to use as predictors
 * @param months - Number of months to project into the future
 * @returns ProjectionResult object
 */
export const calculateProjection = (
    currentBalance: number,
    transactions: Transaction[],
    budgets: CategoryBudget[],
    projectionMonths: number = 6
): ProjectionResult => {
    const points: ProjectionPoint[] = [];
    const today = new Date();

    // 1. Initial State
    let runningBalance = currentBalance;

    // 2. Adjust for Unpaid Transactions (Historical or future unpaid that should be subtracted now)
    // Actually, currentBalance usually comes from "Account.balance". 
    // If the account balance already includes paid items, we only care about UNPAID items.
    const unpaidTransactions = transactions.filter(t => !t.paid);

    // Note: We'll assume the projection starts FROM NOW.
    // Day-by-day or Month-by-month? Let's do month-by-month for clarity, with a starting point.

    points.push({
        date: today.toISOString(),
        balance: runningBalance,
        income: 0,
        expense: 0
    });

    const monthlyPrediction = budgets.reduce((acc, b) => acc + b.limit, 0);

    // For each month, we project based on:
    // - Fixed known transactions (future unpaid)
    // - Budgeted amounts (if no specific transactions exist)

    for (let i = 1; i <= projectionMonths; i++) {
        const projectionDate = new Date(today);
        projectionDate.setMonth(today.getMonth() + i);

        // Calculate targeted transactions for THIS month
        const targetMonth = projectionDate.getMonth();
        const targetYear = projectionDate.getFullYear();

        const specificTxs = unpaidTransactions.filter(t => {
            const d = new Date(t.date);
            return d.getMonth() === targetMonth && d.getFullYear() === targetYear;
        });

        const specificIncome = specificTxs.filter(t => t.type === 'INCOME').reduce((a, b) => a + b.value, 0);
        const specificExpense = specificTxs.filter(t => t.type === 'EXPENSE').reduce((a, b) => a + b.value, 0);

        // If we have BUDGETS, we use them as "estimated" expenses if specific expenses are lower than budget
        // This is a conservative projection.
        const estimatedExpense = Math.max(specificExpense, monthlyPrediction);

        // For simplicity in this first version:
        // Income is only what's scheduled. Expense is scheduled OR budget.

        runningBalance += (specificIncome - estimatedExpense);

        points.push({
            date: projectionDate.toISOString(),
            balance: runningBalance,
            income: specificIncome,
            expense: estimatedExpense
        });
    }

    const balances = points.map(p => p.balance);

    return {
        points,
        summary: {
            finalBalance: runningBalance,
            peakBalance: Math.max(...balances),
            lowestBalance: Math.min(...balances),
            projectedSavings: runningBalance - currentBalance
        }
    };
};
