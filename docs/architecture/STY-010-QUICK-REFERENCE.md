# STY-010: Quick Reference Guide

**Format:** Cheat sheet for developers implementing contexts
**Purpose:** Fast lookup of context APIs and operations

---

## Context APIs at a Glance

### TransactionsContext

```typescript
// State
state.transactions: Transaction[]
state.lastUpdated: number

// Operations
addTransaction(tx: Omit<Transaction, 'id'>) → void
addManyTransactions(txs: Omit<Transaction, 'id'>[]) → void
updateTransaction(tx: Transaction) → void
updateTransactions(txs: Transaction[]) → void
deleteTransaction(id: string) → void
deleteTransactions(ids: string[]) → void
getTransactionsByGroupId(groupId: string) → Transaction[]
deleteTransactionGroup(groupId: string) → void
deleteTransactionGroupFromIndex(groupId: string, fromIndex: number) → void
recoverTransaction(id: string) → void
getDeletedTransactions() → Transaction[]
```

**Dependencies:**
- AccountsContext (balance updates)
- SyncService (persistence)

**Storage Key:**
```
spfp_transactions_state_${userId}
```

---

### AccountsContext

```typescript
// State
state.accounts: Account[]
state.categories: Category[]
state.categoryBudgets: CategoryBudget[]
state.totalBalance: number
state.lastUpdated: number

// Account Operations
addAccount(account: Omit<Account, 'id'>) → void
updateAccount(account: Account) → void
deleteAccount(id: string) → void  // Cascades to transactions
recoverAccount(id: string) → void
getDeletedAccounts() → Account[]

// Category Operations
addCategory(cat: Omit<Category, 'id'>) → string (id)
updateCategory(cat: Category) → void
deleteCategory(id: string) → void

// Budget Operations
updateCategoryBudget(catId: string, limit: number) → void
getCategoryBudget(catId: string) → number | null

// Queries
getAccountBalance(accountId: string) → number
getTotalBalance() → number
getActiveAccounts() → Account[]
getAccountsByType(type: AccountType) → Account[]
getAccountsByOwner(owner: AccountOwner) → Account[]
```

**Dependencies:**
- TransactionsContext (cascade delete)
- SyncService (persistence)

**Storage Key:**
```
spfp_accounts_state_${userId}
```

---

### GoalsContext

```typescript
// State
state.goals: Goal[]
state.achievedCount: number
state.inProgressCount: number
state.totalTargetAmount: number
state.totalCurrentAmount: number
state.lastUpdated: number

// Operations
addGoal(goal: Omit<Goal, 'id'>) → void
updateGoal(goal: Goal) → void
deleteGoal(id: string) → void
recoverGoal(id: string) → void
getDeletedGoals() → Goal[]

// Progress Operations
updateGoalProgress(goalId: string, newAmount: number) → void
getGoalProgress(goalId: string) → number (0-100%)

// Status Operations
completeGoal(id: string) → void
pauseGoal(id: string) → void
resumeGoal(id: string) → void

// Queries
getGoalsByStatus(status: 'IN_PROGRESS' | 'COMPLETED' | 'PAUSED') → Goal[]
getGoalsByDeadline(beforeDate: string) → Goal[]
getOverdueGoals() → Goal[]
```

**Dependencies:**
- AccountsContext (optional, for wealth)
- InvestmentsContext (optional, for wealth)
- SyncService (persistence)

**Storage Key:**
```
spfp_goals_state_${userId}
```

---

### InvestmentsContext

```typescript
// State
state.investments: InvestmentAsset[]
state.totalQuantity: number
state.totalValue: number
state.totalCost: number
state.totalGain: number
state.lastUpdated: number
state.lastPriceUpdate: string

// Operations
addInvestment(inv: Omit<InvestmentAsset, 'id'>) → void
updateInvestment(inv: InvestmentAsset) → void
deleteInvestment(id: string) → void
recoverInvestment(id: string) → void
getDeletedInvestments() → InvestmentAsset[]

// Price Operations
updateInvestmentPrice(id: string, newPrice: number) → void
syncPricesFromMarket() → Promise<void> (future)

// Valuation
getInvestmentValue(id: string) → number (qty × price)
getTotalValue() → number
getTotalCost() → number
getTotalGain() → number
getGainPercentage() → number

// Queries
getInvestmentsByType(type: InvestmentType) → InvestmentAsset[]
getInvestmentsBySector(sector: string) → InvestmentAsset[]
getTopPerformers(limit?: number) → InvestmentAsset[]
getLosers(limit?: number) → InvestmentAsset[]
```

**Dependencies:**
- GoalsContext (optional)
- SyncService (persistence)
- MarketDataService (optional, future)

**Storage Key:**
```
spfp_investments_state_${userId}
```

---

### PatrimonyContext

```typescript
// State
state.patrimonyItems: PatrimonyItem[]
state.realEstateValue: number
state.vehicleValue: number
state.milesValue: number
state.financialValue: number
state.debtValue: number
state.totalPatrimonyValue: number
state.totalDebt: number
state.netWealth: number
state.lastUpdated: number

// Operations
addPatrimonyItem(item: Omit<PatrimonyItem, 'id'>) → void
updatePatrimonyItem(item: PatrimonyItem) → void
deletePatrimonyItem(id: string) → void
recoverPatrimonyItem(id: string) → void
getDeletedPatrimonyItems() → PatrimonyItem[]

// Valuation
getTotalPatrimonyValue() → number (excludes debt)
getTotalDebtValue() → number
getNetWealth() → number (patrimony - debt)
getValueByType(type: PatrimonyType) → number

// Wealth Composition
getWealthComposition() → WealthBreakdown (% by type)

// Queries
getPatrimonyByType(type: PatrimonyType) → PatrimonyItem[]
getAllRealEstate() → PatrimonyItem[]
getAllVehicles() → PatrimonyItem[]
getAllDebts() → PatrimonyItem[]
getMilesBalance() → number
```

**Dependencies:**
- AccountsContext (optional)
- InvestmentsContext (optional)
- SyncService (persistence)

**Storage Key:**
```
spfp_patrimony_state_${userId}
```

---

## Usage Patterns

### Single Context

```typescript
const { state, addTransaction, deleteTransaction } = useTransactions();

const txs = state.transactions.filter(t => !t.deletedAt);
```

### Multiple Contexts

```typescript
const tx = useTransactions();
const acc = useAccounts();
const goals = useGoals();

const balance = acc.state.accounts.reduce((s, a) => s + a.balance, 0);
const progressPercent = (balance / goals.state.totalTargetAmount) * 100;
```

### Component Integration

```typescript
// Option 1: Consume directly
export const TransactionItem = () => {
  const { updateTransaction, deleteTransaction } = useTransactions();
  return <div onClick={() => deleteTransaction(id)}>Delete</div>;
};

// Option 2: Receive as prop
export const TransactionItem = ({ tx, onDelete }) => {
  return <div onClick={() => onDelete(tx.id)}>Delete</div>;
};
```

---

## Storage Structure

### localStorage Keys Format

```
spfp_[domain]_state_[userId]
```

### Example Storage Content

```json
{
  "spfp_transactions_state_user-123": {
    "transactions": [
      {
        "id": "tx-1",
        "accountId": "acc-1",
        "description": "Coffee",
        "value": 5.50,
        "date": "2026-02-03",
        "type": "EXPENSE",
        "categoryId": "cat-5",
        "paid": true,
        "deletedAt": null
      }
    ],
    "lastUpdated": 1707000000000
  }
}
```

---

## Type Quick Reference

### Common Types

```typescript
// Transaction Types
type TransactionType = 'INCOME' | 'EXPENSE';
type TransactionGroupType = 'INSTALLMENT' | 'RECURRING';
interface Transaction {
  id: string;
  accountId: string;
  description: string;
  value: number;
  date: string;
  type: TransactionType;
  categoryId: string;
  paid: boolean;
  groupId?: string;
  groupType?: TransactionGroupType;
  groupIndex?: number;
  groupTotal?: number;
  deletedAt?: number;
}

// Account Types
type AccountType = 'CHECKING' | 'INVESTMENT' | 'CASH' | 'CREDIT_CARD';
type AccountOwner = 'ME' | 'SPOUSE' | 'JOINT';
interface Account {
  id: string;
  name: string;
  type: AccountType;
  owner: AccountOwner;
  balance: number;
  creditLimit?: number;
  deletedAt?: number;
}

// Category Types
type CategoryGroup = 'FIXED' | 'VARIABLE' | 'INVESTMENT' | 'INCOME';
interface Category {
  id: string;
  name: string;
  color: string;
  group: CategoryGroup;
  icon?: string;
}

// Goal Types
interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  color: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'PAUSED';
  deletedAt?: number;
}

// Investment Types
type InvestmentType = 'STOCK' | 'FII' | 'ETF' | 'FIXED_INCOME' | 'CRYPTO' | 'OTHER';
interface InvestmentAsset {
  id: string;
  ticker: string;
  name: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  type: InvestmentType;
  sector?: string;
  lastUpdate: string;
  deletedAt?: number;
}

// Patrimony Types
type PatrimonyType = 'REAL_ESTATE' | 'VEHICLE' | 'MILES' | 'DEBT' | 'FINANCIAL' | 'OTHER';
interface PatrimonyItem {
  id: string;
  type: PatrimonyType;
  name: string;
  value: number;
  quantity?: number;
  acquisitionDate?: string;
  deletedAt?: number;
}
```

---

## Common Operations

### Add Item (All Contexts)

```typescript
const newId = useTransactions().addTransaction({
  accountId: 'acc-1',
  description: 'Coffee',
  value: 5.50,
  date: '2026-02-03',
  type: 'EXPENSE',
  categoryId: 'cat-5',
  paid: true
});
```

### Update Item (All Contexts)

```typescript
useTransactions().updateTransaction({
  id: 'tx-1',
  accountId: 'acc-1',
  description: 'Café',  // Changed
  value: 6.00,           // Changed
  date: '2026-02-03',
  type: 'EXPENSE',
  categoryId: 'cat-5',
  paid: true
});
```

### Delete Item (All Contexts - Soft Delete)

```typescript
useTransactions().deleteTransaction('tx-1');
// Does not remove from state, sets deletedAt timestamp
```

### Recover Item (All Contexts)

```typescript
useTransactions().recoverTransaction('tx-1');
// Clears deletedAt, item becomes active again
```

### Query Deleted Items (All Contexts)

```typescript
const deleted = useTransactions().getDeletedTransactions();
// Returns only items with deletedAt set
```

---

## Filtering Active Items

### Pattern (applies to all types)

```typescript
// After fetching from context
const activeTransactions = state.transactions.filter(t => !t.deletedAt);
const activeAccounts = state.accounts.filter(a => !a.deletedAt);
const activeGoals = state.goals.filter(g => !g.deletedAt);
```

---

## Error Handling

### Try-Catch Pattern

```typescript
try {
  useTransactions().addTransaction({...});
} catch (error) {
  console.error('Failed to add:', error);
  // Show user-friendly message
}
```

### Validation Pattern

```typescript
const categoryId = 'cat-5';
const category = useAccounts().state.categories.find(c => c.id === categoryId);

if (!category) {
  throw new Error(`Category not found: ${categoryId}`);
}
```

---

## Performance Tips

1. **Filter at hook call site, not during render:**
   ```typescript
   // Good
   const { state } = useTransactions();
   const active = state.transactions.filter(t => !t.deletedAt);

   // Avoid (re-creates on every render)
   const active = useMemo(() =>
     state.transactions.filter(t => !t.deletedAt),
     [state.transactions]
   );
   ```

2. **Use specific contexts, not all:**
   ```typescript
   // Good - only subscribe to what you need
   const { state: { transactions } } = useTransactions();

   // Avoid - subscribes to everything
   const allData = useFinance();
   ```

3. **Batch operations when possible:**
   ```typescript
   // Better than calling deleteTransaction 1000 times
   useTransactions().deleteTransactions(ids);
   ```

---

## Debugging

### Log State Changes

```typescript
const { state } = useTransactions();

useEffect(() => {
  console.log('Transactions updated:', state.transactions.length);
}, [state.transactions]);
```

### Check localStorage

```typescript
// In browser console
localStorage.getItem('spfp_transactions_state_user-123');
localStorage.getItem('spfp_accounts_state_user-123');
```

### Verify Soft Deletes

```typescript
const { state, getDeletedTransactions } = useTransactions();

console.log('Active:', state.transactions.filter(t => !t.deletedAt).length);
console.log('Deleted:', getDeletedTransactions().length);
```

---

## Testing Quick Start

```typescript
import { renderHook, act } from '@testing-library/react';
import { useTransactions } from '../context/TransactionsContext';

test('adds transaction', () => {
  const { result } = renderHook(() => useTransactions());

  act(() => {
    result.current.addTransaction({
      accountId: 'acc-1',
      description: 'Test',
      value: 100,
      date: '2026-02-03',
      type: 'EXPENSE',
      categoryId: 'cat-1',
      paid: true
    });
  });

  expect(result.current.state.transactions).toHaveLength(1);
});
```

---

## Context Dependency Rules

```
TransactionsContext ──────┐
                          ├──► SyncService
AccountsContext ──────────┤
                          ├──► AuthContext
GoalsContext ─────────────┤
InvestmentsContext ───────┤
PatrimonyContext ─────────┘

✅ ALLOWED: Tx reads from Accounts
❌ NOT ALLOWED: Accounts imports Tx context
```

**Proper way:** Use parent (FinanceProvider) to orchestrate cross-context operations

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-02-03 | Initial design document |

---

**For detailed specs:** See STY-010-CONTEXT-SPLIT-DESIGN.md
**For implementation patterns:** See STY-010-IMPLEMENTATION-PATTERNS.md
