# STY-010: Implementation Patterns & Developer Guidelines

**Document Version:** 1.0
**Purpose:** Detailed patterns and guidelines for implementing the context split
**Audience:** @dev (Dex) - Developer implementing Phase 1

---

## Table of Contents

1. [Context File Template](#context-file-template)
2. [Provider Pattern](#provider-pattern)
3. [Hook Pattern](#hook-pattern)
4. [State Management Patterns](#state-management-patterns)
5. [Error Handling](#error-handling)
6. [Testing Patterns](#testing-patterns)
7. [Common Pitfalls](#common-pitfalls)
8. [Code Examples](#code-examples)

---

## Context File Template

### File Structure

Every context should follow this structure:

```
src/context/[Domain]Context.tsx
├── Imports
├── Type Definitions
│   ├── [Domain]State
│   ├── [Domain]ContextType
│   └── Helper types
├── Constants
│   ├── Initial state
│   └── Storage keys
├── Helper Functions
│   ├── filterActive
│   ├── filterDeleted
│   └── getStorageKey
├── Context Creation
│   └── const [Domain]Context = createContext()
├── Provider Component
│   ├── initialization
│   ├── localStorage sync
│   ├── cloud sync
│   └── subscription handling
├── Operations
│   ├── CRUD operations
│   ├── Recovery operations
│   └── Query operations
├── Hook Export
│   └── export const use[Domain] = () => {}
└── Provider Export
    └── export const [Domain]Provider = () => {}
```

### Recommended File Size

| Context | LOC Target | Complexity |
|---------|-----------|-----------|
| TransactionsContext | 180-220 | HIGH |
| AccountsContext | 140-180 | MEDIUM |
| GoalsContext | 100-130 | LOW |
| InvestmentsContext | 100-130 | LOW |
| PatrimonyContext | 100-130 | LOW |

---

## Provider Pattern

### Basic Provider Structure

```typescript
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef
} from 'react';
import { useAuth } from './AuthContext';
import { generateId } from '../utils';
import { [Item] } from '../types';

// ============================================================================
// STATE & TYPES
// ============================================================================

interface [Domain]State {
  // Core data
  [items]: [Item][];

  // Metadata
  lastUpdated: number;

  // Computed properties (optional)
  totalCount?: number;
}

interface [Domain]ContextType {
  state: [Domain]State;
  // Operations will be added here
}

const [Domain]Context = createContext<[Domain]ContextType | undefined>(
  undefined
);

// ============================================================================
// CONSTANTS
// ============================================================================

const getStorageKey = (userId?: string) =>
  userId ? `spfp_[domain]_state_${userId}` : 'spfp_[domain]_state';

const INITIAL_STATE: [Domain]State = {
  [items]: [],
  lastUpdated: 0
};

// ============================================================================
// HELPERS
// ============================================================================

const filterActive = <T extends { deletedAt?: number }>(
  items: T[]
): T[] => {
  return items.filter(item => !item.deletedAt);
};

const filterDeleted = <T extends { deletedAt?: number }>(
  items: T[]
): T[] => {
  return items.filter(item => item.deletedAt);
};

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

export const [Domain]Provider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const { user } = useAuth();

  // Initialize state from localStorage
  const [state, setState] = useState<[Domain]State>(() => {
    if (!user) return INITIAL_STATE;

    const storageKey = getStorageKey(user.id);
    const stored = localStorage.getItem(storageKey);

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return {
          [items]: Array.isArray(parsed.[items])
            ? parsed.[items]
            : INITIAL_STATE.[items],
          lastUpdated: parsed.lastUpdated || 0
        };
      } catch (e) {
        console.error('Error parsing stored state:', e);
      }
    }

    return INITIAL_STATE;
  });

  // Sync state to localStorage whenever it changes
  useEffect(() => {
    if (!user) return;

    const storageKey = getStorageKey(user.id);
    localStorage.setItem(storageKey, JSON.stringify(state));
  }, [state, user]);

  // ========================================================================
  // OPERATIONS
  // ========================================================================

  const add[Item] = useCallback(
    (data: Omit<[Item], 'id'>) => {
      setState(current => ({
        ...current,
        [items]: [
          ...current.[items],
          { ...data, id: generateId() }
        ],
        lastUpdated: Date.now()
      }));
    },
    []
  );

  const update[Item] = useCallback(
    (item: [Item]) => {
      setState(current => ({
        ...current,
        [items]: current.[items].map(i =>
          i.id === item.id ? item : i
        ),
        lastUpdated: Date.now()
      }));
    },
    []
  );

  const delete[Item] = useCallback(
    (id: string) => {
      const item = state.[items].find(i => i.id === id);
      if (!item || item.deletedAt) return; // Already deleted

      setState(current => ({
        ...current,
        [items]: current.[items].map(i =>
          i.id === id ? { ...i, deletedAt: Date.now() } : i
        ),
        lastUpdated: Date.now()
      }));
    },
    [state.[items]]
  );

  const recover[Item] = useCallback(
    (id: string) => {
      const item = state.[items].find(i => i.id === id);
      if (!item || !item.deletedAt) return; // Not deleted

      setState(current => ({
        ...current,
        [items]: current.[items].map(i =>
          i.id === id ? { ...i, deletedAt: undefined } : i
        ),
        lastUpdated: Date.now()
      }));
    },
    [state.[items]]
  );

  const getDeleted[Items] = useCallback(
    () => {
      return filterDeleted(state.[items]);
    },
    [state.[items]]
  );

  // ========================================================================
  // CONTEXT VALUE
  // ========================================================================

  const contextValue: [Domain]ContextType = {
    state,
    add[Item],
    update[Item],
    delete[Item],
    recover[Item],
    getDeleted[Items],
    // ... add more operations
  };

  return (
    <[Domain]Context.Provider value={contextValue}>
      {children}
    </[Domain]Context.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

export const use[Domain] = (): [Domain]ContextType => {
  const context = useContext([Domain]Context);

  if (!context) {
    throw new Error(
      `use${[Domain]} must be used within a ${[Domain]}Provider`
    );
  }

  return context;
};
```

---

## Hook Pattern

### Correct Hook Usage

```typescript
// CORRECT: Call hook at top level
export const MyComponent = () => {
  const { state, addTransaction } = useTransactions();

  return (
    <button onClick={() => addTransaction({ ... })}>
      Add
    </button>
  );
};

// WRONG: Don't call inside conditions
if (condition) {
  const { state } = useTransactions(); // ❌ ERROR
}

// WRONG: Don't call inside callbacks
const handleClick = () => {
  const { state } = useTransactions(); // ❌ ERROR
};
```

### Hook Composition

```typescript
// Combine multiple hooks as needed
export const Dashboard = () => {
  const transactions = useTransactions();
  const accounts = useAccounts();
  const goals = useGoals();

  return (
    <>
      <TransactionSummary txs={transactions.state.transactions} />
      <AccountsList accounts={accounts.state.accounts} />
      <GoalsProgress goals={goals.state.goals} />
    </>
  );
};
```

---

## State Management Patterns

### Pattern 1: Simple State Update

```typescript
// For independent updates that don't affect other contexts
const updateTransaction = useCallback((tx: Transaction) => {
  setState(current => ({
    ...current,
    transactions: current.transactions.map(t =>
      t.id === tx.id ? tx : t
    ),
    lastUpdated: Date.now()
  }));
}, []);
```

### Pattern 2: Computed Properties

```typescript
// Calculate derived state
interface GoalsState {
  goals: Goal[];
  lastUpdated: number;
  // Computed on read
}

export const use[Domain] = () => {
  const context = useContext([Domain]Context);

  // Compute at call site, not in state
  const totalTarget = context.state.goals
    .filter(g => !g.deletedAt)
    .reduce((sum, g) => sum + g.targetAmount, 0);

  return { ...context, totalTarget };
};
```

### Pattern 3: Dependent Updates

```typescript
// When updating transaction, also update related account balance
const updateTransaction = useCallback((tx: Transaction) => {
  // Get the old transaction to revert its effects
  const oldTx = state.transactions.find(t => t.id === tx.id);
  if (!oldTx) return;

  // Calculate balance adjustments
  let balanceAdjustment = 0;
  if (oldTx.accountId === tx.accountId) {
    // Same account: revert old, apply new
    balanceAdjustment =
      (oldTx.type === 'INCOME' ? -oldTx.value : oldTx.value) +
      (tx.type === 'INCOME' ? tx.value : -tx.value);
  } else {
    // Different account: revert from old, apply to new
    // This is more complex - might need parent orchestration
  }

  setState(current => ({
    ...current,
    transactions: current.transactions.map(t =>
      t.id === tx.id ? tx : t
    ),
    lastUpdated: Date.now()
    // Note: Balance update handled by AccountsContext
  }));
}, [state.transactions]);
```

### Pattern 4: Bulk Operations

```typescript
// Efficient bulk updates
const updateTransactions = useCallback((updates: Transaction[]) => {
  const updateMap = new Map(updates.map(u => [u.id, u]));

  setState(current => ({
    ...current,
    transactions: current.transactions.map(t =>
      updateMap.get(t.id) || t
    ),
    lastUpdated: Date.now()
  }));
}, []);
```

### Pattern 5: Conditional Updates

```typescript
// Only update if not already deleted
const deleteTransaction = useCallback((id: string) => {
  const tx = state.transactions.find(t => t.id === id);
  if (!tx || tx.deletedAt) return; // Guard: already deleted

  setState(current => ({
    ...current,
    transactions: current.transactions.map(t =>
      t.id === id ? { ...t, deletedAt: Date.now() } : t
    ),
    lastUpdated: Date.now()
  }));
}, [state.transactions]);
```

---

## Error Handling

### Pattern 1: Try-Catch in Operations

```typescript
const addTransaction = useCallback((tx: Omit<Transaction, 'id'>) => {
  try {
    const newTx = { ...tx, id: generateId() };

    setState(current => ({
      ...current,
      transactions: [...current.transactions, newTx],
      lastUpdated: Date.now()
    }));

    // Optional: Notify user
    logInteraction({
      action_type: 'CREATE',
      description: 'Added transaction'
    });
  } catch (error) {
    console.error('Failed to add transaction:', error);
    throw new Error(`Failed to add transaction: ${error.message}`);
  }
}, []);
```

### Pattern 2: Rollback on Error

```typescript
const updateTransaction = useCallback((tx: Transaction) => {
  const previousState = state;

  try {
    setState(current => ({
      ...current,
      transactions: current.transactions.map(t =>
        t.id === tx.id ? tx : t
      ),
      lastUpdated: Date.now()
    }));

    // If sync fails, rollback
    syncToCloud(user.id);
  } catch (error) {
    setState(previousState); // Rollback
    throw new Error(`Failed to update: ${error.message}`);
  }
}, [state, user]);
```

### Pattern 3: Validation Before Update

```typescript
const updateCategoryBudget = useCallback(
  (categoryId: string, limit: number) => {
    // Validate input
    if (limit < 0) {
      throw new Error('Budget limit cannot be negative');
    }

    // Validate category exists
    const category = state.categories.find(c => c.id === categoryId);
    if (!category) {
      throw new Error(`Category ${categoryId} not found`);
    }

    // Update
    setState(current => ({
      ...current,
      categoryBudgets: [
        ...current.categoryBudgets.filter(b => b.categoryId !== categoryId),
        { categoryId, limit }
      ],
      lastUpdated: Date.now()
    }));
  },
  [state.categories]
);
```

---

## Testing Patterns

### Pattern 1: Test Setup

```typescript
describe('TransactionsContext', () => {
  let mockUser: any;

  beforeEach(() => {
    mockUser = { id: 'user-123' };
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  // Tests go here
});
```

### Pattern 2: Provider Test Wrapper

```typescript
const renderWithProvider = (component: React.ReactElement) => {
  const mockAuthValue = {
    user: { id: 'user-123' },
    // ... other auth context values
  };

  return render(
    <AuthContext.Provider value={mockAuthValue}>
      <TransactionsProvider>
        <AccountsProvider>
          {component}
        </AccountsProvider>
      </TransactionsProvider>
    </AuthContext.Provider>
  );
};

test('should add transaction', () => {
  renderWithProvider(<TestComponent />);
  // ... assertions
});
```

### Pattern 3: State Snapshot Tests

```typescript
test('TransactionsState should match snapshot', () => {
  const { result } = renderHook(() => useTransactions());

  expect(result.current.state).toMatchSnapshot();
});
```

### Pattern 4: Operation Tests

```typescript
test('addTransaction should create tx with unique ID', () => {
  const { result } = renderHook(() => useTransactions());

  act(() => {
    result.current.addTransaction({
      accountId: 'acc1',
      description: 'Test',
      value: 100,
      date: '2026-02-03',
      type: 'EXPENSE',
      categoryId: 'cat1',
      paid: true
    });
  });

  expect(result.current.state.transactions).toHaveLength(1);
  expect(result.current.state.transactions[0]).toMatchObject({
    accountId: 'acc1',
    description: 'Test',
    value: 100
  });
  expect(result.current.state.transactions[0].id).toBeDefined();
});
```

### Pattern 5: Storage Persistence Tests

```typescript
test('should persist state to localStorage', () => {
  const { result } = renderHook(() => useTransactions());

  act(() => {
    result.current.addTransaction({ ... });
  });

  const storageKey = 'spfp_transactions_state_user-123';
  const stored = JSON.parse(localStorage.getItem(storageKey)!);

  expect(stored.transactions).toHaveLength(1);
});

test('should restore from localStorage on init', () => {
  const storageKey = 'spfp_transactions_state_user-123';
  const initialData = {
    transactions: [{ id: 'tx1', ... }],
    lastUpdated: Date.now()
  };

  localStorage.setItem(storageKey, JSON.stringify(initialData));

  const { result } = renderHook(() => useTransactions());

  expect(result.current.state.transactions).toEqual(initialData.transactions);
});
```

---

## Common Pitfalls

### Pitfall 1: Missing Dependencies in useCallback

```typescript
// WRONG: Missing state dependencies
const addTransaction = useCallback((tx) => {
  setState(current => ({
    ...current,
    transactions: [...current.transactions, tx]
  }));
}, []); // ❌ Missing [state]

// CORRECT: Include all dependencies
const addTransaction = useCallback((tx) => {
  setState(current => ({
    ...current,
    transactions: [...current.transactions, tx]
  }));
}, [state]);
```

### Pitfall 2: Directly Mutating State

```typescript
// WRONG: Mutating state directly
state.transactions.push(newTx); // ❌ Direct mutation

// CORRECT: Create new state object
setState(current => ({
  ...current,
  transactions: [...current.transactions, newTx]
}));
```

### Pitfall 3: Not Handling Deleted Items in Filters

```typescript
// WRONG: Including deleted items in filtered results
const getTransactionsByAccount = (accountId: string) => {
  return state.transactions.filter(t => t.accountId === accountId);
};

// CORRECT: Filter out deleted items
const getTransactionsByAccount = (accountId: string) => {
  return filterActive(
    state.transactions.filter(t => t.accountId === accountId)
  );
};
```

### Pitfall 4: Forgetting to Update lastUpdated

```typescript
// WRONG: Not updating timestamp
setState(current => ({
  ...current,
  transactions: [...current.transactions, newTx]
  // Missing: lastUpdated: Date.now()
}));

// CORRECT: Always update lastUpdated
setState(current => ({
  ...current,
  transactions: [...current.transactions, newTx],
  lastUpdated: Date.now()
}));
```

### Pitfall 5: Race Conditions with Async Operations

```typescript
// WRONG: State might be stale in callback
useEffect(() => {
  setTimeout(() => {
    setState(state); // ❌ Stale closure
  }, 1000);
}, []);

// CORRECT: Use functional setState
useEffect(() => {
  setTimeout(() => {
    setState(current => ({ ...current })); // ✅ Always current
  }, 1000);
}, []);
```

---

## Code Examples

### Example 1: TransactionsContext (Simplified)

```typescript
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback
} from 'react';
import { useAuth } from './AuthContext';
import { Transaction } from '../types';
import { generateId } from '../utils';

interface TransactionsState {
  transactions: Transaction[];
  lastUpdated: number;
}

interface TransactionsContextType {
  state: TransactionsState;
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  updateTransaction: (tx: Transaction) => void;
  deleteTransaction: (id: string) => void;
  getDeletedTransactions: () => Transaction[];
  recoverTransaction: (id: string) => void;
}

const TransactionsContext = createContext<TransactionsContextType | undefined>(
  undefined
);

const getStorageKey = (userId?: string) =>
  userId ? `spfp_transactions_state_${userId}` : 'spfp_transactions_state';

const filterActive = (items: Transaction[]) =>
  items.filter(t => !t.deletedAt);

const filterDeleted = (items: Transaction[]) =>
  items.filter(t => t.deletedAt);

export const TransactionsProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const { user } = useAuth();

  const [state, setState] = useState<TransactionsState>(() => {
    if (!user) return { transactions: [], lastUpdated: 0 };

    const storageKey = getStorageKey(user.id);
    const stored = localStorage.getItem(storageKey);

    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Error parsing transactions:', e);
      }
    }

    return { transactions: [], lastUpdated: 0 };
  });

  useEffect(() => {
    if (!user) return;

    const storageKey = getStorageKey(user.id);
    localStorage.setItem(storageKey, JSON.stringify(state));
  }, [state, user]);

  const addTransaction = useCallback((tx: Omit<Transaction, 'id'>) => {
    setState(current => ({
      ...current,
      transactions: [{ ...tx, id: generateId() }, ...current.transactions],
      lastUpdated: Date.now()
    }));
  }, []);

  const updateTransaction = useCallback((tx: Transaction) => {
    setState(current => ({
      ...current,
      transactions: current.transactions.map(t => t.id === tx.id ? tx : t),
      lastUpdated: Date.now()
    }));
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    const tx = state.transactions.find(t => t.id === id);
    if (!tx || tx.deletedAt) return;

    setState(current => ({
      ...current,
      transactions: current.transactions.map(t =>
        t.id === id ? { ...t, deletedAt: Date.now() } : t
      ),
      lastUpdated: Date.now()
    }));
  }, [state.transactions]);

  const recoverTransaction = useCallback((id: string) => {
    const tx = state.transactions.find(t => t.id === id);
    if (!tx || !tx.deletedAt) return;

    setState(current => ({
      ...current,
      transactions: current.transactions.map(t =>
        t.id === id ? { ...t, deletedAt: undefined } : t
      ),
      lastUpdated: Date.now()
    }));
  }, [state.transactions]);

  const getDeletedTransactions = useCallback(() => {
    return filterDeleted(state.transactions);
  }, [state.transactions]);

  const value: TransactionsContextType = {
    state,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    recoverTransaction,
    getDeletedTransactions
  };

  return (
    <TransactionsContext.Provider value={value}>
      {children}
    </TransactionsContext.Provider>
  );
};

export const useTransactions = (): TransactionsContextType => {
  const context = useContext(TransactionsContext);
  if (!context) {
    throw new Error('useTransactions must be used within TransactionsProvider');
  }
  return context;
};
```

### Example 2: Using Multiple Contexts

```typescript
import { useTransactions } from '../context/TransactionsContext';
import { useAccounts } from '../context/AccountsContext';
import { useGoals } from '../context/GoalsContext';

export const Dashboard = () => {
  const transactions = useTransactions();
  const accounts = useAccounts();
  const goals = useGoals();

  const recentTransactions = transactions.state.transactions
    .slice(0, 10)
    .filter(t => !t.deletedAt);

  const totalBalance = accounts.state.accounts
    .filter(a => !a.deletedAt)
    .reduce((sum, a) => sum + a.balance, 0);

  const completedGoals = goals.state.goals
    .filter(g => g.status === 'COMPLETED' && !g.deletedAt);

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Total Balance: ${totalBalance.toFixed(2)}</p>
      <p>Completed Goals: {completedGoals.length}</p>
      <RecentTransactionsList txs={recentTransactions} />
    </div>
  );
};
```

### Example 3: Testing a Context

```typescript
import { render, screen } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import { useTransactions } from '../context/TransactionsContext';
import { TransactionsProvider } from '../context/TransactionsContext';
import { AuthContext } from './AuthContext';

describe('TransactionsContext', () => {
  const mockUser = { id: 'test-user' };
  const wrapper = ({ children }: any) => (
    <AuthContext.Provider value={{ user: mockUser, /* ... */ }}>
      <TransactionsProvider>{children}</TransactionsProvider>
    </AuthContext.Provider>
  );

  beforeEach(() => {
    localStorage.clear();
  });

  test('addTransaction should create new transaction', () => {
    const { result } = renderHook(() => useTransactions(), { wrapper });

    act(() => {
      result.current.addTransaction({
        accountId: 'acc1',
        description: 'Coffee',
        value: 5.50,
        date: '2026-02-03',
        type: 'EXPENSE',
        categoryId: 'cat1',
        paid: true
      });
    });

    expect(result.current.state.transactions).toHaveLength(1);
    expect(result.current.state.transactions[0].description).toBe('Coffee');
  });

  test('deleteTransaction should soft delete', () => {
    const { result } = renderHook(() => useTransactions(), { wrapper });

    act(() => {
      result.current.addTransaction({ /* ... */ });
    });

    const txId = result.current.state.transactions[0].id;

    act(() => {
      result.current.deleteTransaction(txId);
    });

    expect(result.current.state.transactions[0].deletedAt).toBeDefined();
    expect(result.current.getDeletedTransactions()).toHaveLength(1);
  });

  test('should persist to localStorage', () => {
    const { result } = renderHook(() => useTransactions(), { wrapper });

    act(() => {
      result.current.addTransaction({ /* ... */ });
    });

    const storageKey = `spfp_transactions_state_test-user`;
    const stored = JSON.parse(localStorage.getItem(storageKey)!);

    expect(stored.transactions).toHaveLength(1);
  });
});
```

---

## Checklist for Implementation

- [ ] Follow the context file template structure
- [ ] Implement all CRUD operations (add, update, delete)
- [ ] Implement soft delete recovery (recover, getDeleted)
- [ ] Add localStorage persistence
- [ ] Add filtering utilities (filterActive, filterDeleted)
- [ ] Export the Provider and Hook
- [ ] Add JSDoc comments to all functions
- [ ] Write unit tests (15+ per context)
- [ ] Write integration tests with dependent contexts
- [ ] Add snapshot tests for state shape
- [ ] Ensure TypeScript strict mode passes
- [ ] Ensure ESLint passes
- [ ] Update this document with learnings
- [ ] Document any deviations from these patterns

---

**Next Step:** Use these patterns to implement the 5 contexts in `src/context/`

**Questions?** Refer to STY-010-CONTEXT-SPLIT-DESIGN.md for complete specifications
