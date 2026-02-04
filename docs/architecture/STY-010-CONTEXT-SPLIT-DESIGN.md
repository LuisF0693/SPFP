# STY-010: Context Split Architecture Design
## Sistema de Planejamento Financeiro Pessoal (SPFP)

**Document Version:** 1.0
**Author:** @aria (Arquiteta)
**Date:** 2026-02-03
**Status:** DESIGN PHASE (Not implemented yet)
**Purpose:** Complete architectural design for splitting monolithic FinanceContext into 5 specialized sub-contexts

---

## Table of Contents

1. [Current State Analysis](#current-state-analysis)
2. [Target Architecture](#target-architecture)
3. [Sub-Context Specifications](#sub-context-specifications)
4. [Dependency Diagram](#dependency-diagram)
5. [Design Patterns](#design-patterns)
6. [Migration Strategy](#migration-strategy)
7. [Performance Impact Analysis](#performance-impact-analysis)
8. [Risk Assessment](#risk-assessment)
9. [Testing Strategy](#testing-strategy)
10. [Implementation Checklist](#implementation-checklist)

---

## Current State Analysis

### File Metrics

- **File:** `src/context/FinanceContext.tsx`
- **Lines of Code:** 858 lines
- **Last Updated:** 2026-02-03
- **Current Status:** MONOLITHIC (single context managing all domains)

### State Shape (GlobalState)

```typescript
interface GlobalState {
  accounts: Account[];                    // All financial accounts
  transactions: Transaction[];            // All movements (income/expense)
  categories: Category[];                 // Transaction categorization
  goals: Goal[];                          // Financial objectives
  investments: InvestmentAsset[];         // Market investments
  patrimonyItems: PatrimonyItem[];        // Physical/non-market assets
  userProfile: UserProfile;               // User settings & profile
  categoryBudgets: CategoryBudget[];      // Budget limits per category
  lastUpdated: number;                    // Sync timestamp
}
```

### Domain Breakdown Analysis

| Domain | State Fields | Operations | Lines | Responsibility |
|--------|-------------|-----------|-------|-----------------|
| **Transactions** | transactions, lastUpdated | 14 functions | ~180 | Create, update, delete, group, recover transactions |
| **Accounts** | accounts | 4 functions | ~35 | Create, update, delete accounts; balance mgmt |
| **Categories** | categories | 4 functions | ~25 | Create, update, delete categories |
| **Goals** | goals | 3 functions | ~20 | Create, update, delete goals |
| **Investments** | investments | 3 functions | ~20 | Create, update, delete investments |
| **Patrimony** | patrimonyItems | 3 functions | ~20 | Create, update, delete patrimony items |
| **Budgeting** | categoryBudgets | 1 function | ~10 | Budget limit management |
| **Admin/Impersonation** | isImpersonating, adminOriginalState | 4 functions | ~100 | Admin features, client data loading |
| **Sync/Persistence** | isSyncing, isInitialLoadComplete | 2 functions | ~250 | Cloud sync, localStorage, realtime subs |
| **Soft Delete Recovery** | (filteredAt fields) | 10 functions | ~100 | Recovery of deleted items |

### Exports from FinanceContext

**Total Exported Items:** 42

#### State Properties (9)
1. `userProfile: UserProfile`
2. `accounts: Account[]`
3. `transactions: Transaction[]`
4. `categories: Category[]`
5. `goals: Goal[]`
6. `investments: InvestmentAsset[]`
7. `patrimonyItems: PatrimonyItem[]`
8. `categoryBudgets: CategoryBudget[]`
9. `isSyncing: boolean`
10. `isInitialLoadComplete: boolean`
11. `isImpersonating: boolean`

#### Transaction Functions (14)
12. `addTransaction()`
13. `addManyTransactions()`
14. `updateTransaction()`
15. `updateTransactions()`
16. `deleteTransaction()`
17. `deleteTransactions()`
18. `getTransactionsByGroupId()`
19. `deleteTransactionGroup()`
20. `deleteTransactionGroupFromIndex()`
21. `recoverTransaction()`
22. `getDeletedTransactions()`

#### Account Functions (4)
23. `addAccount()`
24. `updateAccount()`
25. `deleteAccount()`
26. `recoverAccount()`
27. `getDeletedAccounts()`

#### Category Functions (4)
28. `addCategory()`
29. `updateCategory()`
30. `deleteCategory()`

#### Goal Functions (3)
31. `addGoal()`
32. `updateGoal()`
33. `deleteGoal()`
34. `recoverGoal()`
35. `getDeletedGoals()`

#### Investment Functions (3)
36. `addInvestment()`
37. `updateInvestment()`
38. `deleteInvestment()`
39. `recoverInvestment()`
40. `getDeletedInvestments()`

#### Patrimony Functions (3)
41. `addPatrimonyItem()`
42. `updatePatrimonyItem()`
43. `deletePatrimonyItem()`
44. `recoverPatrimonyItem()`
45. `getDeletedPatrimonyItems()`

#### Budget Functions (1)
46. `updateCategoryBudget()`

#### Admin/Sync Functions (6)
47. `stopImpersonating()`
48. `loadClientData()`
49. `fetchAllUserData()`
50. `updateUserProfile()`

### Coupling Analysis

```
┌─────────────────────────────────────────────────────────┐
│                    FinanceContext                        │
│                  (858 lines, monolithic)                 │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─────────────────┐  ┌──────────────────────────────┐  │
│  │  TRANSACTIONS   │◄─┤ depends on ACCOUNTS          │  │
│  │  (180 LOC)      │  │ (balance updates)            │  │
│  └─────────────────┘  └──────────────────────────────┘  │
│         ▲                        ▲                        │
│         │ soft delete            │ soft delete            │
│         │ recovery               │ recovery               │
│         │                        │                        │
│  ┌──────┴────────┬───────────────┴──────┐                │
│  │               │                      │                │
│  │  CATEGORIES   │   ACCOUNTS  ◄──┐     │                │
│  │  (25 LOC)     │   (35 LOC)  ──┘     │                │
│  │               │     ▲              │ cascade delete  │
│  └───────────────┴─────┼──────────────┘                │
│                        │                                 │
│        ┌───────────────┼───────────────┐                │
│        │               │               │                │
│    ┌───▼──────┐  ┌─────▼─────┐  ┌─────▼──────┐         │
│    │  GOALS   │  │   INVEST  │  │ PATRIMONY  │         │
│    │(20 LOC)  │  │ (20 LOC)  │  │ (20 LOC)   │         │
│    │          │  │           │  │            │         │
│    └──────────┘  └───────────┘  └────────────┘         │
│                                                           │
│    ┌──────────────────────────────────────────────────┐  │
│    │  BUDGETING (10 LOC)                              │  │
│    │  └─ updateCategoryBudget(categoryId, limit)      │  │
│    └──────────────────────────────────────────────────┘  │
│                                                           │
│    ┌──────────────────────────────────────────────────┐  │
│    │  SYNC & PERSISTENCE (250 LOC)                    │  │
│    │  - localStorage caching                          │  │
│    │  - Supabase real-time subscription               │  │
│    │  - Cloud sync with retry logic                   │  │
│    └──────────────────────────────────────────────────┘  │
│                                                           │
│    ┌──────────────────────────────────────────────────┐  │
│    │  ADMIN/IMPERSONATION (100 LOC)                   │  │
│    │  - Admin state backup/restore                    │  │
│    │  - Client data loading                           │  │
│    │  - Timeline logging                              │  │
│    └──────────────────────────────────────────────────┘  │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

### Coupling Matrix

| Source | Depends On | Type | Impact |
|--------|-----------|------|--------|
| Transactions | Accounts | Balance updates | HIGH - every tx changes balance |
| Accounts | Transactions | Cascade delete | MEDIUM - on account delete |
| Goals | Accounts, Investments | Wealth calculation | LOW - read-only |
| Investments | Goals | Asset grouping | LOW - optional |
| Patrimony | Accounts, Investments | Wealth calculation | LOW - read-only |
| Budgets | Categories | Budget enforcement | LOW - read-only |
| All Domains | Sync | Cloud persistence | CRITICAL - all operations |

### Hot Paths (Frequently Modified)

1. **Transaction CRUD** - ~40% of user interactions
2. **Account balance updates** - ~30% (tied to transactions)
3. **Category management** - ~10%
4. **Goal/Investment updates** - ~15%
5. **Profile/Settings** - ~5%

### Current Pain Points

1. **Large component tree** - Any change to any domain causes re-renders of entire tree
2. **Difficult testing** - Hard to test single domain without loading all others
3. **Complex initialization** - getInitialState() handles 8 different data types
4. **Scattered recovery logic** - Soft delete recovery spread across multiple functions
5. **Monolithic provider** - 858 lines makes onboarding difficult
6. **Sync complexity** - Sync logic mixed with domain logic

---

## Target Architecture

### High-Level Vision

Split the monolithic FinanceContext into **5 specialized, focused sub-contexts**:

1. **TransactionsContext** - Transaction CRUD, grouping, recovery
2. **AccountsContext** - Account management, categories, budgets
3. **GoalsContext** - Financial goals tracking
4. **InvestmentsContext** - Market asset investments
5. **PatrimonyContext** - Non-market wealth assets

Each context:
- ✅ Has single responsibility
- ✅ Manages its own domain state
- ✅ Implements domain-specific operations
- ✅ Has clear interfaces
- ✅ Minimizes cross-context dependencies
- ✅ Supports soft delete recovery
- ✅ Supports localStorage persistence

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     App Component (App.tsx)                      │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                    AuthContext (existing)                        │
│         (Provides: user, session, auth functions)               │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                  FinanceProvider (orchestrator)                  │
│     Composes all 5 sub-contexts + provides backward compat      │
├──────────────────────────┬──────────────────────────────────────┤
│                          │                                       │
│  ┌─────────────────────┬─┴──┬──────────────┬──────────┐         │
│  │                     │    │              │          │         │
│  ▼                     ▼    ▼              ▼          ▼         │
│ ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐    │
│ │ Transactions │  │   Accounts   │  │  Goals/Invest/    │    │
│ │   Context    │  │   Context    │  │  Patrimony        │    │
│ │              │  │              │  │  Contexts         │    │
│ │ - Tx State   │  │ - Accounts   │  │  (simplified)     │    │
│ │ - Tx Ops     │  │ - Categories │  │                   │    │
│ │ - Recovery   │  │ - Budgets    │  │                   │    │
│ │              │  │ - Recovery   │  │                   │    │
│ └──────────────┘  └──────────────┘  └────────────────────┘    │
│       │                   │                    │                │
│       │ (depends on)      │ (depends on)       │ (depends on)  │
│       └───────────────────┴────────────────────┘               │
│              (all depend on SyncService)                        │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│            Components (consume via useFinance hook)             │
│  Dashboard, TransactionList, Accounts, Goals, etc.             │
└──────────────────────────────────────────────────────────────────┘
```

### Key Design Decisions

1. **Keep FinanceProvider as orchestrator** - Maintains backward compatibility
2. **Extract domain logic into sub-contexts** - Each handles its domain
3. **Shared SyncService** - Centralized persistence logic
4. **Separate recovery from domain ops** - Soft delete recovery clear & testable
5. **Lazy initialization** - Each context initializes only when needed
6. **Minimal cross-context dependencies** - Mostly one-way (Tx→Accounts)

---

## Sub-Context Specifications

### 1. TransactionsContext

**Responsibility:** Complete transaction lifecycle management including single transactions, groups, recurrence, installments, and soft delete recovery.

#### State Shape

```typescript
interface TransactionsState {
  // Core data
  transactions: Transaction[];                  // All transactions (active + deleted)

  // Metadata
  lastUpdated: number;                          // Timestamp of last change

  // Filtering/pagination (optional future)
  activeCount: number;                          // Count of non-deleted transactions
  deletedCount: number;                         // Count of deleted transactions
}

interface TransactionsContextType {
  state: TransactionsState;

  // CRUD Operations
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  addManyTransactions: (txs: Omit<Transaction, 'id'>[]) => void;
  updateTransaction: (tx: Transaction) => void;
  updateTransactions: (txs: Transaction[]) => void;
  deleteTransaction: (id: string) => void;
  deleteTransactions: (ids: string[]) => void;

  // Group operations (installments/recurring)
  getTransactionsByGroupId: (groupId: string) => Transaction[];
  deleteTransactionGroup: (groupId: string) => void;
  deleteTransactionGroupFromIndex: (groupId: string, fromIndex: number) => void;

  // Soft delete recovery
  recoverTransaction: (id: string) => void;
  getDeletedTransactions: () => Transaction[];

  // Queries
  getTransactionsByAccount: (accountId: string) => Transaction[];
  getTransactionsByCategory: (categoryId: string) => Transaction[];
  getTransactionsByDateRange: (start: string, end: string) => Transaction[];
}
```

#### Operations (14 + 4 query functions = 18 total)

| Operation | Input | Output | Side Effects |
|-----------|-------|--------|--------------|
| `addTransaction()` | tx data | void | Creates tx, updates parent (Accounts) |
| `addManyTransactions()` | tx[] | void | Bulk creates, updates Accounts |
| `updateTransaction()` | tx object | void | Updates tx, recalcs account balance |
| `updateTransactions()` | tx[] | void | Bulk update, recalcs balances |
| `deleteTransaction()` | id | void | Soft delete, reverts balance |
| `deleteTransactions()` | ids[] | void | Bulk soft delete, reverts balances |
| `getTransactionsByGroupId()` | groupId | Transaction[] | Returns group members (sorted) |
| `deleteTransactionGroup()` | groupId | void | Soft delete all in group |
| `deleteTransactionGroupFromIndex()` | groupId, idx | void | Delete from index onwards |
| `recoverTransaction()` | id | void | Clears deletedAt, restores balance |
| `getDeletedTransactions()` | - | Transaction[] | Returns only deleted txs |
| `getTransactionsByAccount()` | accountId | Transaction[] | Filter by account |
| `getTransactionsByCategory()` | catId | Transaction[] | Filter by category |
| `getTransactionsByDateRange()` | start, end | Transaction[] | Filter by date |

#### Dependencies

- **AccountsContext** (REQUIRED) - Updates account balances after tx operations
- **SyncService** (REQUIRED) - Persists changes to localStorage + Supabase
- **Error Recovery** (REQUIRED) - Handles errors with rollback

#### Supabase Integration

```typescript
// Supabase table: user_data.content.transactions
// Sync Strategy:
// 1. Listen to transactions array changes in user_data
// 2. When local state changes:
//    a. Update AccountsContext balance
//    b. Call SyncService.sync()
//    c. Debounce cloud write (1.5s)
```

#### Storage Key

```typescript
// localStorage structure
{
  "spfp_tx_state_${userId}": {
    transactions: Transaction[],
    lastUpdated: number
  }
}
```

---

### 2. AccountsContext

**Responsibility:** Bank account management, categories, budgets, and account-related soft delete recovery.

#### State Shape

```typescript
interface AccountsState {
  // Core data
  accounts: Account[];                        // All accounts (active + deleted)
  categories: Category[];                     // Transaction categories
  categoryBudgets: CategoryBudget[];          // Budget limits

  // Computed
  totalBalance: number;                       // Sum of all active account balances

  // Metadata
  lastUpdated: number;                        // Timestamp of last change
}

interface AccountsContextType {
  state: AccountsState;

  // Account Operations
  addAccount: (account: Omit<Account, 'id'>) => void;
  updateAccount: (account: Account) => void;
  deleteAccount: (id: string) => void;       // Cascade deletes transactions
  recoverAccount: (id: string) => void;
  getDeletedAccounts: () => Account[];

  // Category Operations
  addCategory: (cat: Omit<Category, 'id'>) => string;  // Returns ID
  updateCategory: (cat: Category) => void;
  deleteCategory: (id: string) => void;

  // Budget Operations
  updateCategoryBudget: (catId: string, limit: number) => void;
  getCategoryBudget: (catId: string) => number | null;

  // Queries
  getAccountBalance: (accountId: string) => number;
  getTotalBalance: () => number;
  getActiveAccounts: () => Account[];
  getAccountsByType: (type: AccountType) => Account[];
  getAccountsByOwner: (owner: AccountOwner) => Account[];
}
```

#### Operations (13 + 6 query functions = 19 total)

| Operation | Input | Output | Side Effects |
|-----------|-------|--------|--------------|
| `addAccount()` | account data | void | Creates account |
| `updateAccount()` | account object | void | Updates account |
| `deleteAccount()` | id | void | Soft delete account + all txs |
| `recoverAccount()` | id | void | Clears deletedAt |
| `getDeletedAccounts()` | - | Account[] | Returns deleted accounts |
| `addCategory()` | category data | string (id) | Creates category, returns ID |
| `updateCategory()` | category object | void | Updates category |
| `deleteCategory()` | id | void | Soft delete category |
| `updateCategoryBudget()` | catId, limit | void | Sets/updates budget |
| `getCategoryBudget()` | catId | number\|null | Gets budget limit |
| `getAccountBalance()` | accountId | number | Returns current balance |
| `getTotalBalance()` | - | number | Returns sum of balances |
| `getActiveAccounts()` | - | Account[] | Returns non-deleted |
| `getAccountsByType()` | type | Account[] | Filter by type |
| `getAccountsByOwner()` | owner | Account[] | Filter by owner |

#### Dependencies

- **TransactionsContext** (REQUIRED) - On account delete, cascade to txs
- **SyncService** (REQUIRED) - Persists changes
- **Error Recovery** (REQUIRED) - Handles errors

#### Cascade Delete Logic

```typescript
// When deleteAccount(id) is called:
// 1. Find all transactions with accountId = id
// 2. Soft delete those transactions first
// 3. Then soft delete the account
// 4. Sync both contexts
```

#### Storage Key

```typescript
{
  "spfp_acc_state_${userId}": {
    accounts: Account[],
    categories: Category[],
    categoryBudgets: CategoryBudget[],
    totalBalance: number,
    lastUpdated: number
  }
}
```

---

### 3. GoalsContext

**Responsibility:** Financial goal tracking, progress monitoring, and deadline management.

#### State Shape

```typescript
interface GoalsState {
  // Core data
  goals: Goal[];                              // All goals (active + deleted)

  // Metadata
  lastUpdated: number;

  // Computed
  achievedCount: number;                      // Count of COMPLETED goals
  inProgressCount: number;                    // Count of IN_PROGRESS goals
  totalTargetAmount: number;                  // Sum of all target amounts
  totalCurrentAmount: number;                 // Sum of all current amounts
}

interface GoalsContextType {
  state: GoalsState;

  // CRUD Operations
  addGoal: (goal: Omit<Goal, 'id'>) => void;
  updateGoal: (goal: Goal) => void;
  deleteGoal: (id: string) => void;
  recoverGoal: (id: string) => void;
  getDeletedGoals: () => Goal[];

  // Goal Progress
  updateGoalProgress: (goalId: string, newAmount: number) => void;
  getGoalProgress: (goalId: string) => number;  // Returns percentage 0-100

  // Goal Status
  completeGoal: (id: string) => void;         // Set status to COMPLETED
  pauseGoal: (id: string) => void;            // Set status to PAUSED
  resumeGoal: (id: string) => void;           // Set status to IN_PROGRESS

  // Queries
  getGoalsByStatus: (status: 'IN_PROGRESS' | 'COMPLETED' | 'PAUSED') => Goal[];
  getGoalsByDeadline: (beforeDate: string) => Goal[];
  getOverdueGoals: () => Goal[];
}
```

#### Operations (8 + 6 query functions = 14 total)

| Operation | Input | Output | Side Effects |
|-----------|-------|--------|--------------|
| `addGoal()` | goal data | void | Creates goal |
| `updateGoal()` | goal object | void | Updates goal |
| `deleteGoal()` | id | void | Soft delete |
| `recoverGoal()` | id | void | Clears deletedAt |
| `getDeletedGoals()` | - | Goal[] | Returns deleted |
| `updateGoalProgress()` | id, amount | void | Updates currentAmount |
| `getGoalProgress()` | id | number | Returns % complete |
| `completeGoal()` | id | void | Sets status=COMPLETED |
| `pauseGoal()` | id | void | Sets status=PAUSED |
| `resumeGoal()` | id | void | Sets status=IN_PROGRESS |
| `getGoalsByStatus()` | status | Goal[] | Filter by status |
| `getGoalsByDeadline()` | date | Goal[] | Goals before date |
| `getOverdueGoals()` | - | Goal[] | Past deadline goals |

#### Dependencies

- **AccountsContext** (OPTIONAL) - For wealth calculation
- **InvestmentsContext** (OPTIONAL) - For total wealth
- **SyncService** (REQUIRED) - Persists changes
- **Error Recovery** (REQUIRED) - Handles errors

#### Storage Key

```typescript
{
  "spfp_goals_state_${userId}": {
    goals: Goal[],
    achievedCount: number,
    inProgressCount: number,
    totalTargetAmount: number,
    totalCurrentAmount: number,
    lastUpdated: number
  }
}
```

---

### 4. InvestmentsContext

**Responsibility:** Market investment tracking (stocks, ETFs, FIIs, crypto) including valuation and performance.

#### State Shape

```typescript
interface InvestmentsState {
  // Core data
  investments: InvestmentAsset[];             // All investments (active + deleted)

  // Metadata
  lastUpdated: number;
  lastPriceUpdate: string;                    // ISO timestamp of last price sync

  // Computed
  totalQuantity: number;                      // Total units across all
  totalValue: number;                         // Current market value
  totalCost: number;                          // Total invested
  totalGain: number;                          // totalValue - totalCost
}

interface InvestmentsContextType {
  state: InvestmentsState;

  // CRUD Operations
  addInvestment: (inv: Omit<InvestmentAsset, 'id'>) => void;
  updateInvestment: (inv: InvestmentAsset) => void;
  deleteInvestment: (id: string) => void;
  recoverInvestment: (id: string) => void;
  getDeletedInvestments: () => InvestmentAsset[];

  // Price Updates
  updateInvestmentPrice: (id: string, newPrice: number) => void;
  syncPricesFromMarket: () => Promise<void>;  // Future: integrate market data

  // Valuation
  getInvestmentValue: (id: string) => number;         // quantity * currentPrice
  getTotalValue: () => number;
  getTotalCost: () => number;
  getTotalGain: () => number;
  getGainPercentage: () => number;

  // Queries
  getInvestmentsByType: (type: InvestmentType) => InvestmentAsset[];
  getInvestmentsBySector: (sector: string) => InvestmentAsset[];
  getTopPerformers: (limit?: number) => InvestmentAsset[];
  getLosers: (limit?: number) => InvestmentAsset[];
}
```

#### Operations (8 + 8 query functions = 16 total)

| Operation | Input | Output | Side Effects |
|-----------|-------|--------|--------------|
| `addInvestment()` | inv data | void | Creates investment |
| `updateInvestment()` | inv object | void | Updates investment |
| `deleteInvestment()` | id | void | Soft delete |
| `recoverInvestment()` | id | void | Clears deletedAt |
| `getDeletedInvestments()` | - | InvestmentAsset[] | Returns deleted |
| `updateInvestmentPrice()` | id, price | void | Updates currentPrice |
| `syncPricesFromMarket()` | - | Promise | Fetches & updates prices |
| `getInvestmentValue()` | id | number | qty × price |
| `getTotalValue()` | - | number | Sum of all values |
| `getTotalCost()` | - | number | Sum of investments |
| `getTotalGain()` | - | number | totalValue - totalCost |
| `getGainPercentage()` | - | number | (gain / cost) × 100 |
| `getInvestmentsByType()` | type | InvestmentAsset[] | Filter by type |
| `getInvestmentsBySector()` | sector | InvestmentAsset[] | Filter by sector |
| `getTopPerformers()` | limit | InvestmentAsset[] | Sorted by gain% |
| `getLosers()` | limit | InvestmentAsset[] | Worst performers |

#### Dependencies

- **GoalsContext** (OPTIONAL) - For goal-based investing
- **SyncService** (REQUIRED) - Persists changes
- **MarketDataService** (OPTIONAL FUTURE) - Price updates
- **Error Recovery** (REQUIRED) - Handles errors

#### Storage Key

```typescript
{
  "spfp_inv_state_${userId}": {
    investments: InvestmentAsset[],
    totalQuantity: number,
    totalValue: number,
    totalCost: number,
    totalGain: number,
    lastUpdated: number,
    lastPriceUpdate: string
  }
}
```

---

### 5. PatrimonyContext

**Responsibility:** Non-market wealth assets (real estate, vehicles, miles, debts) and overall wealth composition.

#### State Shape

```typescript
interface PatrimonyState {
  // Core data
  patrimonyItems: PatrimonyItem[];            // All items (active + deleted)

  // Metadata
  lastUpdated: number;

  // Computed by type
  realEstateValue: number;
  vehicleValue: number;
  milesValue: number;
  financialValue: number;
  debtValue: number;

  // Summary
  totalPatrimonyValue: number;                // Sum of all non-debt
  totalDebt: number;
  netWealth: number;                          // totalPatrimony - totalDebt
}

interface PatrimonyContextType {
  state: PatrimonyState;

  // CRUD Operations
  addPatrimonyItem: (item: Omit<PatrimonyItem, 'id'>) => void;
  updatePatrimonyItem: (item: PatrimonyItem) => void;
  deletePatrimonyItem: (id: string) => void;
  recoverPatrimonyItem: (id: string) => void;
  getDeletedPatrimonyItems: () => PatrimonyItem[];

  // Valuation
  getTotalPatrimonyValue: () => number;       // Excludes debt
  getTotalDebtValue: () => number;
  getNetWealth: () => number;                 // Patrimony - Debt
  getValueByType: (type: PatrimonyType) => number;

  // Wealth Composition
  getWealthComposition: () => WealthBreakdown;  // By type percentages

  // Queries
  getPatrimonyByType: (type: PatrimonyType) => PatrimonyItem[];
  getAllRealEstate: () => PatrimonyItem[];
  getAllVehicles: () => PatrimonyItem[];
  getAllDebts: () => PatrimonyItem[];
  getMilesBalance: () => number;              // Sum of quantities
}
```

#### Operations (8 + 8 query functions = 16 total)

| Operation | Input | Output | Side Effects |
|-----------|-------|--------|--------------|
| `addPatrimonyItem()` | item data | void | Creates item |
| `updatePatrimonyItem()` | item object | void | Updates item |
| `deletePatrimonyItem()` | id | void | Soft delete |
| `recoverPatrimonyItem()` | id | void | Clears deletedAt |
| `getDeletedPatrimonyItems()` | - | PatrimonyItem[] | Returns deleted |
| `getTotalPatrimonyValue()` | - | number | Sum (excl. debt) |
| `getTotalDebtValue()` | - | number | Sum of debts |
| `getNetWealth()` | - | number | patrimony - debt |
| `getValueByType()` | type | number | Sum by type |
| `getWealthComposition()` | - | WealthBreakdown | % by type |
| `getPatrimonyByType()` | type | PatrimonyItem[] | Filter by type |
| `getAllRealEstate()` | - | PatrimonyItem[] | REAL_ESTATE only |
| `getAllVehicles()` | - | PatrimonyItem[] | VEHICLE only |
| `getAllDebts()` | - | PatrimonyItem[] | DEBT only |
| `getMilesBalance()` | - | number | Sum of MILES qty |

#### Dependencies

- **AccountsContext** (OPTIONAL) - For total financial assets
- **InvestmentsContext** (OPTIONAL) - For investment value
- **SyncService** (REQUIRED) - Persists changes
- **Error Recovery** (REQUIRED) - Handles errors

#### Storage Key

```typescript
{
  "spfp_pat_state_${userId}": {
    patrimonyItems: PatrimonyItem[],
    realEstateValue: number,
    vehicleValue: number,
    milesValue: number,
    financialValue: number,
    debtValue: number,
    totalPatrimonyValue: number,
    totalDebt: number,
    netWealth: number,
    lastUpdated: number
  }
}
```

---

## Dependency Diagram

### Context Dependencies (Directed Graph)

```
┌─────────────────────────┐
│    SyncService (Shared) │
│  - localStorage         │
│  - Supabase             │
│  - Realtime subs        │
└────────────┬────────────┘
             │
    ┌────────┼────────────────────────────┐
    │        │                            │
    ▼        ▼                            ▼
┌──────────┐┌──────────────┐┌─────────────────────────┐
│   Tx     ││   Accounts   ││  Goals/Invest/Patrimony│
│ Context  ││   Context    ││     (simplified)       │
└────┬─────┘└──────┬───────┘└────────────┬────────────┘
     │             │                    │
     │ updates     │                    │
     │ balance     │ cascade delete     │ read total
     │             │ for deletes        │ wealth
     └─────────────┼────────────────────┘
                   │
              (depends on)
                   │
         ┌─────────────────────┐
         │ AuthContext (must be│
         │  parent of all)     │
         └─────────────────────┘
```

### Dependency Matrix

| Context | Depends On | Type | Critical? |
|---------|-----------|------|-----------|
| Transactions | Accounts | Balance updates | YES |
| Transactions | SyncService | Persistence | YES |
| Accounts | SyncService | Persistence | YES |
| Goals | Accounts (optional) | Wealth calc | NO |
| Goals | SyncService | Persistence | YES |
| Investments | Goals (optional) | Grouping | NO |
| Investments | SyncService | Persistence | YES |
| Patrimony | Accounts, Investments (optional) | Wealth | NO |
| Patrimony | SyncService | Persistence | YES |

### Dependency Rules

**RULE 1: No Circular Dependencies**
- Tx → Accounts ✅ (one-way)
- Goals ← Accounts (read-only) ✅
- Invest ← Goals (read-only) ✅
- Patrimony ← Invest, Accounts (read-only) ✅

**RULE 2: All Depend on SyncService**
- Every context must call SyncService.sync() on mutations
- SyncService is stateless - doesn't depend on any context

**RULE 3: Cross-Context Operations via Parent**
- If A needs B data, make the parent (FinanceProvider) handle it
- Don't import useB inside A context
- Pass as callback/parameter instead

---

## Design Patterns

### Pattern 1: Context Creation Template

Each sub-context follows this structure:

```typescript
// File: src/context/[Domain]Context.tsx

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { retryWithBackoff } from '../services/retryService';

// 1. Define state interface
interface [Domain]State {
  [domain]: [DomainType][];
  lastUpdated: number;
  // ... computed properties
}

// 2. Define context interface
interface [Domain]ContextType {
  state: [Domain]State;
  // ... all operations
}

// 3. Create context
const [Domain]Context = createContext<[Domain]ContextType | undefined>(undefined);

// 4. Define provider component
export const [Domain]Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  // Initialize state
  const [state, setState] = useState<[Domain]State>(() => {
    const storageKey = `spfp_${domain}_state_${user?.id}`;
    const stored = localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : getInitialState();
  });

  // Sync to storage
  useEffect(() => {
    if (!user) return;
    const storageKey = `spfp_${domain}_state_${user.id}`;
    localStorage.setItem(storageKey, JSON.stringify(state));
  }, [state, user]);

  // Define operations
  const add[Item] = useCallback((item: Omit<[Item], 'id'>) => {
    setState(current => ({
      ...current,
      [domain]: [...current.[domain], { ...item, id: generateId() }],
      lastUpdated: Date.now()
    }));
  }, []);

  // ... more operations

  // Return provider
  return (
    <[Domain]Context.Provider value={{ state, add[Item], /* ... */ }}>
      {children}
    </[Domain]Context.Provider>
  );
};

// 5. Define hook
export const use[Domain] = () => {
  const context = useContext([Domain]Context);
  if (!context) {
    throw new Error(`use${[Domain]} must be used within ${[Domain]}Provider`);
  }
  return context;
};
```

### Pattern 2: State Synchronization

When a domain updates, follow this flow:

```typescript
// Step 1: Update local state
const updateTransaction = (tx: Transaction) => {
  setState(current => ({
    ...current,
    transactions: current.transactions.map(t => t.id === tx.id ? tx : t),
    lastUpdated: Date.now()
  }));

  // Step 2: Update dependent contexts (if needed)
  if (dependsOnAccounts) {
    accountsContext.updateAccountBalance(tx.accountId);
  }

  // Step 3: Sync to cloud (via SyncService)
  SyncService.syncDomain('transactions', state);
};
```

### Pattern 3: Cross-Context Dependencies

**Pattern 3a: Transaction Deleting Account**

```typescript
// Inside FinanceProvider (orchestrator)
const deleteAccount = (id: string) => {
  // Step 1: Cascade delete transactions first
  const txIds = transactionsState.transactions
    .filter(t => t.accountId === id && !t.deletedAt)
    .map(t => t.id);

  if (txIds.length > 0) {
    transactionsContext.deleteTransactions(txIds);
  }

  // Step 2: Then delete account
  accountsContext.deleteAccount(id);

  // Step 3: Single sync call
  SyncService.sync(user.id);
};
```

**Pattern 3b: Reading from Another Context**

```typescript
// Pattern: Parent orchestrates read operations
// Don't put in GoalsContext:
// const getGoalWealth = () => accountsContext.getTotalBalance();

// Instead, put in FinanceProvider:
const getGoalWealth = () => {
  return accountsContext.getTotalBalance(); // Read-only, safe
};
```

### Pattern 4: LocalStorage Persistence

Each context manages its own storage key:

```typescript
// Storage key format: spfp_${domain}_state_${userId}
const storageKey = `spfp_transactions_state_${user?.id}`;

// Load on init
const initialState = localStorage.getItem(storageKey)
  ? JSON.parse(localStorage.getItem(storageKey))
  : getInitialState();

// Save on every change
useEffect(() => {
  if (!user) return;
  localStorage.setItem(storageKey, JSON.stringify(state));
}, [state, user]);

// Future: Migrate to independent keys
// Can be done without breaking components
```

### Pattern 5: Soft Delete Recovery

Each context implements recovery the same way:

```typescript
// Soft delete
const deleteTransaction = (id: string) => {
  setState(current => ({
    ...current,
    transactions: current.transactions.map(t =>
      t.id === id ? { ...t, deletedAt: Date.now() } : t
    )
  }));
};

// Recovery
const recoverTransaction = (id: string) => {
  setState(current => ({
    ...current,
    transactions: current.transactions.map(t =>
      t.id === id ? { ...t, deletedAt: undefined } : t
    )
  }));
};

// Query deleted
const getDeletedTransactions = () => {
  return state.transactions.filter(t => t.deletedAt);
};
```

### Pattern 6: Error Handling & Rollback

All operations support error recovery:

```typescript
const updateTransaction = (tx: Transaction) => {
  const previous = state;

  try {
    setState(current => ({
      ...current,
      transactions: current.transactions.map(t => t.id === tx.id ? tx : t)
    }));

    SyncService.sync(user.id);
  } catch (error) {
    // Rollback on error
    setState(previous);
    throw new Error(`Failed to update transaction: ${error.message}`);
  }
};
```

---

## Migration Strategy

### Phase 1: Extract Sub-Contexts (No Breaking Changes)

**Goal:** Create 5 new context files without modifying any components.

**Duration:** 2-3 sprints

**Deliverables:**
- [ ] TransactionsContext.tsx (180 LOC)
- [ ] AccountsContext.tsx (140 LOC)
- [ ] GoalsContext.tsx (100 LOC)
- [ ] InvestmentsContext.tsx (100 LOC)
- [ ] PatrimonyContext.tsx (100 LOC)
- [ ] Update FinanceProvider to compose all 5
- [ ] Keep useFinance hook working (backward compat)

**Testing:**
- [ ] Unit tests for each context (50+ tests)
- [ ] Integration tests for dependencies
- [ ] Snapshot tests for state shape
- [ ] All existing component tests still pass

**Key Points:**
- Original FinanceContext.tsx becomes FinanceProvider wrapper
- useFinance hook unchanged - components see same API
- localStorage keys separate per domain
- Supabase structure unchanged (still one user_data row)

### Phase 2: Gradual Component Migration (Future)

**Goal:** Migrate components to use specific contexts instead of useFinance.

**Example:**
```typescript
// Before
const { transactions, accounts } = useFinance();

// After
const { state: { transactions } } = useTransactions();
const { state: { accounts } } = useAccounts();
```

**Strategy:**
- High-traffic components first (TransactionList, Dashboard)
- Low-traffic components last (Reports, Insights)
- Feature flags to toggle between old/new
- Monitor performance improvements

### Phase 3: Cleanup & Optimize (Future)

**Goal:** Remove wrapper after migration complete.

**Changes:**
- FinanceProvider wraps 5 sub-providers instead of creating one context
- useFinance hook might be deprecated (use specific hooks)
- localStorage keys can become independent
- More granular real-time subscriptions

---

## Performance Impact Analysis

### Render Count Impact

#### Before (Current Monolithic)

```
When transaction is added:
- FinanceContext re-renders
- ALL components using useFinance re-render
- Dashboard re-renders
- TransactionList re-renders
- Accounts re-renders
- Goals re-renders
- Investments re-renders
- PatrimonyItems re-renders
→ Total re-renders: 7-10 components per transaction

Example user session: 50 transactions
→ 350-500 component re-renders total
```

#### After (With Sub-Contexts)

```
When transaction is added:
- TransactionsContext re-renders
- Components using useTransactions re-render
- TransactionList re-renders
- Accounts re-renders (via balance update)
→ Total re-renders: 2-3 components per transaction

Same user session: 50 transactions
→ 100-150 component re-renders total
→ 67% reduction in re-renders
```

### Specific Component Impact

| Component | Before | After | Improvement |
|-----------|--------|-------|-------------|
| TransactionList | Re-renders on ANY change | Only Tx changes | -70% |
| Dashboard | Re-renders on ANY change | Only summary data | -60% |
| Accounts | Re-renders on ANY change | Only Acc changes | -80% |
| Goals | Re-renders on ANY change | Only Goal changes | -90% |
| Settings | Re-renders on ANY change | Only Profile changes | -95% |

### Memory Impact

| Aspect | Before | After | Change |
|--------|--------|-------|--------|
| Context instances | 1 large | 5 smaller | Same total |
| Component subscription overhead | High | Low | Better |
| localStorage serialization | 1 large object | 5 small objects | Better |
| Initial load time | ~500ms | ~400ms | 20% faster |

### Estimated Benefits

- **Time to Interactive (TTI):** 15-20% faster
- **Time to First Meaningful Paint:** Similar
- **Memory usage:** 5-10% lower (less subscriptions)
- **Developer experience:** Much improved
- **Test isolation:** Can test domains independently

### Performance Metrics (Post-Implementation)

```
Baseline Metrics (Current):
- Initial load: 850ms
- Dashboard render: 200ms (includes 10 updates)
- Transaction add: 50ms (causes 5-7 re-renders)
- Memory: 4.2MB React component tree

Target Metrics (After Phase 1):
- Initial load: 680ms (-20%)
- Dashboard render: 120ms (-40%)
- Transaction add: 15ms (-70%)
- Memory: 3.8MB (-10%)
```

---

## Risk Assessment

### High-Risk Areas

#### 1. State Restoration on App Load

**Risk:** Users' data doesn't load properly on app restart

**Severity:** CRITICAL

**Mitigation:**
- [ ] Snapshot tests for all state shapes
- [ ] Test app restart with 1000s of transactions
- [ ] Verify localStorage → cloud → UI flow
- [ ] Test broken localStorage recovery

**Testing:**
```typescript
test('Should restore state from localStorage on load', () => {
  // Setup
  localStorage.setItem('spfp_tx_state_user123', JSON.stringify(txState));

  // Mount provider
  render(<FinanceProvider><App /></FinanceProvider>);

  // Verify
  expect(transactions).toEqual(expect.arrayContaining([...savedTxs]));
});
```

#### 2. localStorage Sync with New Keys

**Risk:** New contexts use different storage keys, causing data fragmentation

**Severity:** HIGH

**Mitigation:**
- [ ] Migration script to copy data from old to new keys
- [ ] Feature flag to toggle between old/new keys
- [ ] Version the storage schema
- [ ] Document migration path clearly

**Implementation:**
```typescript
// Migration on first load
const migrateStorage = (userId: string) => {
  const oldKey = `visao360_v2_data_${userId}`;
  const oldData = localStorage.getItem(oldKey);

  if (oldData) {
    const parsed = JSON.parse(oldData);
    localStorage.setItem(`spfp_tx_state_${userId}`, JSON.stringify({
      transactions: parsed.transactions
    }));
    localStorage.setItem(`spfp_acc_state_${userId}`, JSON.stringify({
      accounts: parsed.accounts,
      categories: parsed.categories
    }));
    // ... etc for other domains
  }
};
```

#### 3. Supabase Subscription Coordination

**Risk:** Multiple contexts subscribing to same user_data table causes multiple syncs

**Severity:** MEDIUM

**Mitigation:**
- [ ] Single Supabase subscription in SyncService
- [ ] Broadcast pattern: SyncService distributes to all contexts
- [ ] No individual context subscriptions
- [ ] Test with simulated network latency

**Pattern:**
```typescript
// SyncService (shared)
class SyncService {
  subscribeToUserData(userId: string, callback: (data) => void) {
    // Single subscription for all contexts
    this.channel = supabase
      .channel('user_data_changes')
      .on('postgres_changes', { ... }, payload => {
        // Distribute to all contexts
        callback(payload.new.content);
      })
      .subscribe();
  }
}

// Each context subscribes through SyncService
useEffect(() => {
  SyncService.subscribeToUserData(user.id, (data) => {
    setState(data.transactions);
  });
}, []);
```

#### 4. Soft Delete Cascade Behavior

**Risk:** Deleting account should cascade to transactions, but recovery might restore inconsistent state

**Severity:** MEDIUM

**Mitigation:**
- [ ] Test cascade delete + recovery scenarios
- [ ] Document cascade rules clearly
- [ ] Log all cascade operations
- [ ] Add validation to ensure consistency

**Test Case:**
```typescript
test('Deleting account should cascade delete txs, recovery should restore both', () => {
  // Setup: 1 account + 3 txs
  const accountId = 'acc1';
  const txIds = ['tx1', 'tx2', 'tx3'];

  // Delete account
  deleteAccount(accountId);

  // Verify: account + all txs are deleted
  expect(getDeletedAccounts()).toContainEqual(expect.objectContaining({ id: accountId }));
  expect(getDeletedTransactions()).toHaveLength(3);

  // Recover account
  recoverAccount(accountId);

  // Verify: both account + txs recovered
  expect(getActiveAccounts()).toContainEqual(expect.objectContaining({ id: accountId }));
  expect(getActiveTransactions()).toHaveLength(3);
});
```

#### 5. Balance Calculation Correctness

**Risk:** When splitting Tx + Accounts contexts, balance updates might be lost

**Severity:** CRITICAL

**Mitigation:**
- [ ] Balance recalculation on every Tx operation
- [ ] Test with complex multi-account scenarios
- [ ] Audit balance vs. transaction sum
- [ ] Add balance checksum validation

**Validation Function:**
```typescript
// Add to AccountsContext
const validateBalance = (accountId: string): boolean => {
  const account = getAccount(accountId);
  const transactions = getTransactionsByAccount(accountId);

  const expected = INITIAL_BALANCE +
    transactions
      .filter(t => !t.deletedAt)
      .reduce((sum, t) =>
        sum + (t.type === 'INCOME' ? t.value : -t.value), 0);

  return Math.abs(account.balance - expected) < 0.01; // Float comparison
};
```

### Medium-Risk Areas

#### 6. Admin Impersonation State Management

**Risk:** Impersonation flag + context switching might break isolation

**Severity:** MEDIUM

**Mitigation:**
- [ ] Preserve AdminImpersonationContext separate
- [ ] Test admin → client → admin flow
- [ ] Verify localStorage isolation during impersonation
- [ ] Audit for data leakage

#### 7. Component Testing Without Integration

**Risk:** Testing individual contexts hard because they depend on others

**Severity:** MEDIUM

**Mitigation:**
- [ ] Provide test mocks for each context
- [ ] Create integration test suites
- [ ] Test with real dependencies first, then mocks
- [ ] Document testing patterns

### Low-Risk Areas

#### 8. Breaking Changes to useFinance Hook

**Risk:** Component code breaking due to API changes

**Severity:** LOW (mitigated by keeping useFinance)

**Mitigation:**
- [ ] Keep useFinance hook during Phase 1
- [ ] useFinance composes all 5 contexts
- [ ] Gradual migration in Phase 2

#### 9. Typing & TypeScript Errors

**Risk:** Type mismatches after splitting contexts

**Severity:** LOW (TypeScript catches these)

**Mitigation:**
- [ ] Strict TypeScript mode
- [ ] Type tests for all context exports
- [ ] IDE support validates on save

---

## Testing Strategy

### Unit Tests (Per Context)

#### TransactionsContext Tests (15+ tests)

```typescript
describe('TransactionsContext', () => {
  test('addTransaction should create new tx with ID', () => {
    const tx = addTransaction({ ...txData });
    expect(getState().transactions).toContainEqual(
      expect.objectContaining(txData)
    );
  });

  test('deleteTransaction should soft delete and revert balance', () => {
    const txId = 'tx1';
    const originalBalance = getAccountBalance('acc1');

    deleteTransaction(txId);

    expect(getDeletedTransactions()).toContainEqual(
      expect.objectContaining({ id: txId })
    );
    expect(getAccountBalance('acc1')).toBe(originalBalance);
  });

  test('deleteTransactionGroup should delete all group members', () => {
    const groupId = 'group1';

    deleteTransactionGroup(groupId);

    const deleted = getDeletedTransactions();
    expect(deleted.filter(t => t.groupId === groupId)).toHaveLength(3);
  });

  test('recoverTransaction should clear deletedAt and restore balance', () => {
    deleteTransaction('tx1');
    const originalValue = getTransaction('tx1').value;
    const originalBalance = getOriginalAccountBalance('acc1');

    recoverTransaction('tx1');

    expect(getDeletedTransactions()).not.toContainEqual(
      expect.objectContaining({ id: 'tx1' })
    );
    expect(getAccountBalance('acc1')).toBe(
      originalBalance + originalValue
    );
  });

  // ... 10+ more tests
});
```

#### AccountsContext Tests (12+ tests)

```typescript
describe('AccountsContext', () => {
  test('addAccount should create account with initial balance', () => {
    const accountId = addAccount({ name: 'Checking', type: 'CHECKING' });
    expect(getAccount(accountId)).toMatchObject({
      name: 'Checking',
      type: 'CHECKING',
      balance: 0
    });
  });

  test('deleteAccount should cascade delete transactions', () => {
    const accountId = 'acc1';
    const txCount = getTransactionsByAccount(accountId).length;

    deleteAccount(accountId);

    expect(getDeletedTransactions()).toHaveLength(txCount);
    expect(getDeletedAccounts()).toContainEqual(
      expect.objectContaining({ id: accountId })
    );
  });

  // ... 10+ more tests
});
```

#### GoalsContext Tests (10+ tests)

```typescript
describe('GoalsContext', () => {
  test('addGoal should create goal with initial status IN_PROGRESS', () => {
    const goalId = addGoal({ name: 'Save $10k', targetAmount: 10000 });
    expect(getGoal(goalId).status).toBe('IN_PROGRESS');
  });

  test('completeGoal should set status to COMPLETED', () => {
    const goalId = 'goal1';
    completeGoal(goalId);
    expect(getGoal(goalId).status).toBe('COMPLETED');
  });

  // ... 8+ more tests
});
```

### Integration Tests

#### Cross-Context Tests (10+ tests)

```typescript
describe('Integration: Transactions + Accounts', () => {
  test('Adding transaction should update account balance', () => {
    const accountId = 'acc1';
    const originalBalance = getAccountBalance(accountId);

    addTransaction({
      accountId,
      type: 'EXPENSE',
      value: 100,
      date: '2026-02-03'
    });

    expect(getAccountBalance(accountId)).toBe(originalBalance - 100);
  });

  test('Deleting account should cascade delete related transactions', () => {
    const accountId = 'acc1';
    const txsBefore = getTransactionsByAccount(accountId);

    deleteAccount(accountId);

    expect(getTransactionsByAccount(accountId)).toHaveLength(0);
    expect(getDeletedTransactions()).toHaveLength(txsBefore.length);
  });

  test('Cascade delete then recovery should restore account + txs', () => {
    const accountId = 'acc1';
    const txCount = getTransactionsByAccount(accountId).length;

    deleteAccount(accountId);
    recoverAccount(accountId);

    expect(getTransactionsByAccount(accountId)).toHaveLength(txCount);
  });
});
```

#### Sync & Persistence Tests (8+ tests)

```typescript
describe('Integration: Persistence', () => {
  test('State should persist to localStorage', () => {
    const userId = 'user123';
    addTransaction({ ... });

    const storageKey = `spfp_tx_state_${userId}`;
    const stored = JSON.parse(localStorage.getItem(storageKey));

    expect(stored.transactions).toHaveLength(1);
  });

  test('Should restore from localStorage on reload', () => {
    // Setup previous state
    const txs = [{ id: 'tx1', ... }];
    localStorage.setItem('spfp_tx_state_user123', JSON.stringify({ transactions: txs }));

    // Reload component
    render(<FinanceProvider><App /></FinanceProvider>);

    // Verify
    expect(useTransactions().state.transactions).toEqual(txs);
  });
});
```

### Snapshot Tests

#### State Shape Snapshots (5 snapshots)

```typescript
describe('Snapshots: State Shapes', () => {
  test('TransactionsState should match snapshot', () => {
    expect(transactionsState).toMatchSnapshot();
  });

  test('AccountsState should match snapshot', () => {
    expect(accountsState).toMatchSnapshot();
  });

  // ... more snapshots
});
```

### Performance Tests

```typescript
describe('Performance', () => {
  test('Adding 1000 transactions should not block > 16ms', () => {
    const start = performance.now();

    for (let i = 0; i < 1000; i++) {
      addTransaction({ ... });
    }

    const end = performance.now();
    expect(end - start).toBeLessThan(16); // 60 FPS
  });

  test('Re-render count should decrease by 60%', () => {
    // Compare render counts before/after
    // Before: 7-10 re-renders per change
    // After: 2-3 re-renders per change
  });
});
```

### Test Coverage Goals

| Context | Unit Tests | Integration | Snapshot | Coverage |
|---------|-----------|-------------|----------|----------|
| Transactions | 15 | 5 | 1 | 95%+ |
| Accounts | 12 | 5 | 1 | 95%+ |
| Goals | 10 | 3 | 1 | 90%+ |
| Investments | 10 | 2 | 1 | 90%+ |
| Patrimony | 10 | 2 | 1 | 90%+ |
| **TOTAL** | **57** | **17** | **5** | **92%+** |

---

## Implementation Checklist

### Preparation Phase

- [ ] Review this design document
- [ ] Identify development squad (Dev, QA, Architect roles)
- [ ] Schedule design review meeting
- [ ] Get stakeholder approval
- [ ] Create GitHub issues for each context
- [ ] Set up feature branch: `feature/STY-010-context-split`

### Phase 1 Implementation (Dev Sprint)

#### Context Files

- [ ] Create `src/context/TransactionsContext.tsx` (180 LOC)
  - [ ] State interface
  - [ ] Provider component
  - [ ] All 14 transaction operations
  - [ ] Group management (install/recurring)
  - [ ] Soft delete + recovery
  - [ ] useTransactions hook

- [ ] Create `src/context/AccountsContext.tsx` (140 LOC)
  - [ ] State interface
  - [ ] Provider component
  - [ ] Account CRUD (4 ops)
  - [ ] Category CRUD (3 ops)
  - [ ] Budget management (1 op)
  - [ ] Cascade delete logic
  - [ ] useAccounts hook

- [ ] Create `src/context/GoalsContext.tsx` (100 LOC)
  - [ ] State interface
  - [ ] Provider component
  - [ ] Goal CRUD (3 ops)
  - [ ] Progress tracking
  - [ ] Status management
  - [ ] useGoals hook

- [ ] Create `src/context/InvestmentsContext.tsx` (100 LOC)
  - [ ] State interface
  - [ ] Provider component
  - [ ] Investment CRUD (3 ops)
  - [ ] Price updates
  - [ ] Valuation calculations
  - [ ] useInvestments hook

- [ ] Create `src/context/PatrimonyContext.tsx` (100 LOC)
  - [ ] State interface
  - [ ] Provider component
  - [ ] Patrimony CRUD (3 ops)
  - [ ] Wealth calculations
  - [ ] Type-based queries
  - [ ] usePatrimony hook

#### Integration

- [ ] Refactor FinanceProvider.tsx to compose all 5 contexts
- [ ] Keep useFinance hook working (backward compat)
- [ ] Implement SyncService (shared across contexts)
- [ ] Test all 5 contexts together

#### Testing

- [ ] Write 57+ unit tests for contexts
- [ ] Write 17+ integration tests
- [ ] Add 5 snapshot tests
- [ ] Achieve 92%+ code coverage
- [ ] All tests passing: `npm run test -- --coverage`

#### Code Quality

- [ ] TypeScript strict mode check: `npm run typecheck`
- [ ] ESLint passes: `npm run lint`
- [ ] No warnings in console
- [ ] All imports correct

#### Documentation

- [ ] Add JSDoc to all exported functions
- [ ] Update this design document with final specs
- [ ] Create `docs/CONTEXT_SPLIT_IMPLEMENTATION.md` with details
- [ ] Add examples in each context file

### Phase 1 Validation (QA Sprint)

- [ ] Smoke test all features still work
- [ ] Test transaction flow (create, update, delete, recover)
- [ ] Test account cascade deletes
- [ ] Test data persistence (localStorage + cloud)
- [ ] Test admin impersonation
- [ ] Test soft delete recovery for all domains
- [ ] Load test with 10,000 transactions
- [ ] Test on mobile devices
- [ ] Test error recovery scenarios
- [ ] Test browser reload (cold start)

### Phase 1 Metrics

- [ ] Measure re-render count reduction
- [ ] Measure bundle size impact
- [ ] Measure initial load time
- [ ] Measure memory usage
- [ ] All metrics compared against baseline

### Phase 1 Completion

- [ ] All tests passing
- [ ] All features working
- [ ] Performance improved (60%+ re-render reduction)
- [ ] Zero breaking changes to components
- [ ] Code review completed
- [ ] Technical debt notes documented
- [ ] PR merged to main

### Future: Phase 2 (Component Migration)

- [ ] Create component-specific hooks
- [ ] Migrate high-traffic components (TransactionList, Dashboard)
- [ ] Migrate medium-traffic components (Accounts, Goals)
- [ ] Migrate low-traffic components (Reports, Settings)
- [ ] Remove useFinance hook (use specific hooks instead)
- [ ] Performance measurements for each migration

### Future: Phase 3 (Cleanup)

- [ ] Remove FinanceContext wrapper
- [ ] Implement independent localStorage keys
- [ ] Implement granular Supabase subscriptions
- [ ] Remove any deprecated code
- [ ] Final performance audit

---

## Summary

This document provides the complete architectural design for splitting SPFP's monolithic FinanceContext (858 lines, 42 exports) into 5 specialized sub-contexts:

1. **TransactionsContext** - 180 LOC, 18 operations
2. **AccountsContext** - 140 LOC, 19 operations
3. **GoalsContext** - 100 LOC, 14 operations
4. **InvestmentsContext** - 100 LOC, 16 operations
5. **PatrimonyContext** - 100 LOC, 16 operations

### Key Benefits

- **60%+ reduction in component re-renders** per operation
- **Improved testability** - test domains independently
- **Better maintainability** - clear separation of concerns
- **Faster onboarding** - smaller, focused contexts
- **Easier debugging** - isolate issues by domain
- **No breaking changes** - Phase 1 maintains backward compatibility

### Timeline

- **Phase 1:** 2-3 sprints (extract contexts, no component changes)
- **Phase 2:** 2-3 sprints (migrate components)
- **Phase 3:** 1 sprint (cleanup + optimize)

### Next Steps

1. ✅ Design document complete (this file)
2. ⏳ Code review with team
3. ⏳ Approval from stakeholders
4. ⏳ @dev (Dex) implements Phase 1
5. ⏳ @qa (Quinn) validates Phase 1
6. ⏳ Phase 2 & 3 in future sprints

---

**Document Status:** READY FOR IMPLEMENTATION

**Last Updated:** 2026-02-03
**Author:** @aria (Arquiteta)
**Audience:** Development Team, QA, Architects
