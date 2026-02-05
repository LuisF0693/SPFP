# ARCHITECTURE QUICK REFERENCE - FASE 1

**Status:** Ready for Development
**Last Updated:** 2026-02-05

---

## CONTEXT STRUCTURE (Option B - Separate Contexts)

```
AuthContext (unchanged)
├── BudgetContext (NEW)
│   ├── budgetPeriods: BudgetPeriod[]
│   ├── budgetItems: BudgetItem[]
│   └── methods: create/update/delete items, calculate spending
│
├── InvoiceContext (NEW)
│   ├── invoices: CardInvoice[]
│   ├── invoiceItems: CardInvoiceItem[]
│   └── methods: fetch invoices, track payments, installments
│
├── InvestmentContext (EXTEND)
│   ├── investments: InvestmentAsset[] (with new fields)
│   └── methods: getPortfolioMetrics(), calculateRebalancing()
│
├── SidebarContext (NEW)
│   ├── isExpanded: boolean
│   ├── expandedSections: Record<Section, boolean>
│   └── methods: toggle, save/load state
│
└── UIContext (existing - unchanged)
    └── theme, layout state, etc.
```

---

## TYPE FILES ORGANIZATION

### New Type Modules

| File | Purpose | Stories |
|------|---------|---------|
| `src/types/budget.ts` | Budget periods, items, calculations | STY-053 |
| `src/types/invoice.ts` | Invoices, items, payments | STY-058 to STY-062 |
| `src/types/sidebar.ts` | Sidebar state, sections | STY-051 to STY-057 |

### Existing Types

- `src/types.ts` - Core types (Account, Transaction, Goal, InvestmentAsset, etc.)
- `src/types/aria.types.ts` - ARIA accessibility tokens

---

## SUPABASE TABLES (NEW)

### 4 New Tables

1. **budget_periods**
   - Primary: `id` (UUID)
   - Foreign: `user_id` → auth.users
   - Indexes: `(user_id, period_start DESC)`
   - RLS: User isolation

2. **budget_items**
   - Primary: `id` (UUID)
   - Foreign: `budget_period_id`, `user_id`
   - Indexes: `(budget_period_id)`, `(user_id, category_id)`
   - RLS: User isolation

3. **card_invoices**
   - Primary: `id` (UUID)
   - Foreign: `user_id` → auth.users
   - Unique: `(user_id, card_id, invoice_date)`
   - Indexes: `(user_id, due_date DESC, status)`
   - RLS: User isolation

4. **card_invoice_items**
   - Primary: `id` (UUID)
   - Foreign: `invoice_id`, `user_id`
   - Indexes: `(invoice_id)`, `(user_id, is_installment, installment_number)`
   - RLS: User isolation

### 1 Modified Table

- **investments** - Add fields: `portfolio_value`, `ytd_return`, `allocation_percentage`, `allocation_target`, `rebalance_frequency`

---

## SERVICE LAYER (NEW)

### 3 New Services

1. **BudgetService** (`src/services/budgetService.ts`)
   - Static methods: `getBudgetPeriods()`, `getCurrentBudgetPeriod()`, `createBudgetPeriod()`
   - Calculations: `getSpendingPercentage()`, `getRemainingBudget()`, `getBudgetStatus()`
   - Uses: `withErrorRecovery()` on all async ops

2. **InvoiceService** (`src/services/invoiceService.ts`)
   - Methods: `getInvoices()`, `getCurrentInvoices()`, `getFutureInstallments()`
   - Payments: `markInvoiceAsPaid()`, `calculateIdealPaymentAmount()`
   - Uses: `withErrorRecovery()` on all async ops

3. **InvestmentPortfolioService** (`src/services/investmentPortfolioService.ts`)
   - Portfolio: `calculatePortfolioValue()`, `calculateTotalReturn()`, `getPortfolioMetrics()`
   - Allocation: `getAssetAllocation()`, `calculateRebalancing()`
   - Risk: `calculateRiskProfile()`

---

## ERROR RECOVERY INTEGRATION

All new services/contexts must follow:

```typescript
import { withErrorRecovery } from '../services/errorRecovery';

async function myAsyncOperation() {
  return withErrorRecovery(
    () => supabase.from('table').insert([...]),
    'Human-readable action name',
    {
      maxRetries: 3,
      userId,
      metadata: { /* context */ }
    }
  );
}
```

**Retry Strategy:**
- Initial: 1000ms delay
- Multiplier: 2x (1s → 2s → 4s → 8s max)
- Max retries: 3 (typically)
- Fallback: State rollback + Portuguese error message

---

## LOCALSTORAGE CACHING

| Context | Key | Size | Sync Policy |
|---------|-----|------|------------|
| BudgetContext | `spfp_budget_${userId}` | ~100 KB | Sync on change + hourly |
| InvoiceContext | `spfp_invoices_${userId}` | ~200 KB | Sync on change + 15min |
| SidebarContext | `spfp_sidebar_state` | ~1 KB | Sync immediately |

**Pattern:**
```typescript
// 1. Load from localStorage (fast)
const cached = localStorage.getItem(storageKey);

// 2. Fetch fresh from Supabase (parallel)
const fresh = await fetchFromSupabase();

// 3. Merge and update state + localStorage
```

---

## IMPLEMENTATION ORDER (FASE 1: 2 weeks)

### Week 1: Foundation

```
Mon: STY-051 (6h)  → SidebarContext + hook
     STY-052 (8h)  → Sidebar UI + sections

Tue: STY-053 (7h)  → Budget section display
     STY-054 (5h)  → Accounts section display

Wed: STY-055 (6h)  → Transactions & Installments
     Testing (8h)  → All components

```

### Week 2: Invoices & Investments

```
Mon: STY-058 (8h)  → InvoiceService + types
     STY-059 (6h)  → InvoiceContext

Wed: STY-060 (7h)  → Current & future installments
     STY-061 (8h)  → Credit card visual

Fri: STY-063 (6h)  → Investment portfolio model
     STY-064 (5h)  → Portfolio display
     Testing (8h)  → All flows
```

---

## DATA FLOW EXAMPLES

### Add Budget Item Flow

```
Component
  ├─ User submits form
  └─ Call: budgetContext.addBudgetItem(item)
     └─ BudgetContext
        ├─ Optimistic update (localStorage + state)
        ├─ Show loading toast
        └─ Call: BudgetService.addBudgetItem()
           └─ withErrorRecovery() wraps:
              ├─ supabase.from('budget_items').insert()
              │  └─ RLS checks: user_id = auth.uid()
              ├─ On success: keep state
              └─ On failure: rollback + error message (PT)
```

### Fetch Current Invoices Flow

```
Component (on mount)
  └─ Call: invoiceContext.fetchCurrentInvoices()
     └─ InvoiceContext
        ├─ Check localStorage (cache hit?)
        ├─ If cached + fresh: return immediately
        └─ Otherwise:
           ├─ Fetch from Supabase
           │  └─ withErrorRecovery() with 3 retries
           ├─ Merge with local cache
           └─ Update state + localStorage
```

---

## TESTING CHECKLIST

### Unit Tests (Services)

- [ ] BudgetService.getSpendingPercentage() - boundary cases
- [ ] BudgetService.getBudgetStatus() - status transitions
- [ ] InvoiceService.calculateIdealPaymentAmount() - logic
- [ ] InvestmentPortfolioService.calculatePortfolioValue() - math

### Integration Tests (Contexts)

- [ ] BudgetContext syncs from Supabase on mount
- [ ] BudgetContext persists to localStorage
- [ ] Error recovery rollback works
- [ ] SidebarContext persists state across sessions

### E2E Tests (Full Flows)

- [ ] Create budget → Add item → See in sidebar
- [ ] Add invoice → Mark paid → Status updates
- [ ] Upload transactions → See invoice payment link (STY-062)

---

## PERFORMANCE TARGETS

| Metric | Target | Current | FASE 1 |
|--------|--------|---------|--------|
| Initial Load | < 2s | 1.8s | 1.9s |
| Context Sync | < 500ms | 400ms | 450ms |
| Add Budget Item | < 800ms | - | < 800ms |
| Add Invoice | < 800ms | - | < 800ms |
| Bundle Size | < 600 KB (gz) | 450 KB | 515 KB (45 KB increase) |

**Optimization:**
- Lazy load contexts per route (FASE 3: STY-082)
- Denormalize expensive calculations (budget_periods.total_spent)
- Index frequently queried columns

---

## DECISION SUMMARY

| Decision | Choice | Why |
|----------|--------|-----|
| Context Pattern | Separate contexts | Scalability, independence |
| Error Recovery | Integrate everywhere | Reliability, user experience |
| Cache Strategy | localStorage + Supabase | Performance + correctness |
| Invoice Status | 5 states (not 3) | Support partial payments |
| Budget Denormalization | Trigger-based | Fast queries, consistent |

---

## BLOCKERS TO REMOVE (Priority Order)

1. **STY-051** - SidebarContext (blocks all sidebar work)
2. **STY-058** - InvoiceService (blocks invoice features)
3. **STY-063** - Investment model (blocks portfolio display)

---

## FILES TO CREATE/MODIFY

### Create (New Files)

```
src/context/
  ├── BudgetContext.tsx (NEW)
  ├── InvoiceContext.tsx (NEW)
  └── SidebarContext.tsx (NEW)

src/services/
  ├── budgetService.ts (NEW)
  ├── invoiceService.ts (NEW)
  └── investmentPortfolioService.ts (NEW)

src/types/
  ├── budget.ts (NEW)
  ├── invoice.ts (NEW)
  └── sidebar.ts (NEW)

docs/migrations/
  └── 001-fase1-schema.sql (NEW)
```

### Modify (Existing Files)

```
src/App.tsx
  - Add BudgetProvider, InvoiceProvider, SidebarProvider

src/context/InvestmentContext.tsx
  - Extend with portfolio calculation methods

src/components/Layout.tsx
  - Update Sidebar to use SidebarContext

src/types.ts
  - Reference new type modules (or keep separate)
```

---

## QUESTIONS & ANSWERS

**Q: Why separate contexts instead of one mega-context?**
A: Scalability. Each domain has independent data lifecycle, lifecycle, error recovery. Easier testing and parallel development.

**Q: What about prop drilling with 5+ contexts?**
A: Not an issue. Each context is independent. Components only use what they need. No cross-context dependencies.

**Q: When to use localStorage vs state?**
A: localStorage for persistence across sessions. State for immediate UI updates. Always fetch fresh from Supabase on app load.

**Q: How do error recovery and retries affect UX?**
A: Max delay is 8 seconds (after 3 retries). Show loading toast during retries. If all fail, show friendly error message in Portuguese.

**Q: Do I need to migrate data from FinanceContext?**
A: No. FinanceContext stays for transactions/accounts. New contexts are additive (not replacing anything).

---

## REFERENCES

- Full Architecture: `docs/ARCHITECTURE-FASE-1.md`
- Migration SQL: `docs/migrations/001-fase1-schema.sql`
- Type Definitions: `src/types/{budget,invoice,sidebar}.ts`
- Roadmap: `docs/stories/ROADMAP-STY-051-085.md`
- Error Recovery: `docs/CLAUDE.md` (ErrorRecoveryService section)

---

**Ready to Start Development:** ✅
**FASE 1 Duration:** 2 weeks (65-80 hours)
**Target Completion:** 2026-02-19
