# FASE 1 IMPLEMENTATION CHECKLIST

**Author:** Aria - Arquiteta
**Date:** 2026-02-05
**Status:** READY FOR DEVELOPMENT

---

## PRE-IMPLEMENTATION (DO FIRST)

### Database Setup

- [ ] **Apply SQL Migration**
  - File: `docs/migrations/001-fase1-schema.sql`
  - Execute in Supabase SQL Editor
  - Verify tables created: `budget_periods`, `budget_items`, `card_invoices`, `card_invoice_items`
  - Verify RLS policies enabled on all tables
  - Verify indexes created and performance acceptable
  - Verify investments table columns added

- [ ] **Test RLS Policies**
  - [ ] Create test user A
  - [ ] Create budget in user A's schema
  - [ ] Switch to test user B
  - [ ] Verify user B cannot see user A's budget (RLS working)
  - [ ] Verify user B can create own budget

- [ ] **Verify Triggers**
  - [ ] `update_budget_period_total()` - test by creating budget items
  - [ ] `update_invoice_status()` - test by updating payment amounts

### Type System Setup

- [ ] **Create Type Modules**
  - [ ] `src/types/budget.ts` - BudgetPeriod, BudgetItem, BudgetContextType
  - [ ] `src/types/invoice.ts` - CardInvoice, CardInvoiceItem, InvoiceContextType
  - [ ] `src/types/sidebar.ts` - SidebarState, SidebarContextType

- [ ] **Verify TypeScript Compilation**
  - Run: `npm run typecheck`
  - Fix any compilation errors
  - No `any` types allowed

- [ ] **Export New Types**
  - Update `src/types/index.ts` to export from new modules (if using barrel export)
  - Or ensure imports work from individual modules

---

## PHASE 1A: SIDEBAR (Week 1, Days 1-2)

### STY-051: SidebarContext & State Management (6h)

- [ ] **Create SidebarContext**
  - [ ] File: `src/context/SidebarContext.tsx`
  - [ ] Implement: `SidebarProvider` component
  - [ ] Implement: `useSidebar()` hook
  - [ ] State shape: `{ isExpanded, expandedSections, hoveredItem, lastUpdated }`

- [ ] **localStorage Persistence**
  - [ ] Save on every state change
  - [ ] Load on provider mount
  - [ ] Key: `spfp_sidebar_state`
  - [ ] Fallback: `{ isExpanded: true, expandedSections: { ... } }`

- [ ] **Error Recovery Integration**
  - [ ] Wrap localStorage operations with try/catch
  - [ ] Log errors to errorRecovery service
  - [ ] Fallback to default state if load fails

- [ ] **Testing**
  - [ ] Unit: localStorage save/load works
  - [ ] Unit: toggleSidebar updates state
  - [ ] Unit: toggleSection updates expandedSections
  - [ ] Integration: State persists across mount/unmount
  - [ ] E2E: User can collapse/expand sidebar, state persists on refresh

### STY-052: Sidebar Layout Redesign (8h)

- [ ] **Update Layout Component**
  - [ ] File: `src/components/Layout.tsx`
  - [ ] Use: `useSidebar()` hook instead of component state
  - [ ] Remove: Props for sidebar state (was prop drilling)

- [ ] **Create SidebarSection Component**
  - [ ] File: `src/components/ui/SidebarSection.tsx`
  - [ ] Props: `section, isExpanded, onToggle, children`
  - [ ] Render: Chevron icon (lucide-react)
  - [ ] Animation: `max-h transition-all 300ms ease-in-out`

- [ ] **Update Sidebar Component**
  - [ ] Add 4 sections: BUDGET, ACCOUNTS, TRANSACTIONS, INSTALLMENTS
  - [ ] Each section: `<SidebarSection>` with content
  - [ ] Responsive: Mobile (collapsed by default), Desktop (expanded)
  - [ ] Breakpoint: `md` (768px)

- [ ] **Styling & Animation**
  - [ ] Glassmorphism maintained
  - [ ] Dark mode support
  - [ ] Chevron rotates on expand/collapse
  - [ ] Smooth transition on all devices

- [ ] **Testing**
  - [ ] Unit: SidebarSection renders correctly
  - [ ] Unit: Animation classes applied correctly
  - [ ] Integration: Sections toggle independently
  - [ ] E2E: Sidebar collapses/expands on different screen sizes
  - [ ] Lighthouse: No performance regressions

---

## PHASE 1B: BUDGET (Week 1, Days 3-4)

### STY-053: Budget Section in Sidebar (7h)

- [ ] **Create BudgetContext**
  - [ ] File: `src/context/BudgetContext.tsx`
  - [ ] Implement: `BudgetProvider` component
  - [ ] Implement: `useBudget()` hook
  - [ ] State: budgetPeriods, budgetItems, currentPeriod

- [ ] **Create BudgetService**
  - [ ] File: `src/services/budgetService.ts`
  - [ ] Methods: `getBudgetPeriods()`, `getCurrentBudgetPeriod()`, `createBudgetPeriod()`
  - [ ] Calculations: `getSpendingPercentage()`, `getRemainingBudget()`, `getBudgetStatus()`
  - [ ] Error recovery: Wrap all async with `withErrorRecovery()`

- [ ] **localStorage Persistence**
  - [ ] Key: `spfp_budget_${userId}`
  - [ ] Save on state change
  - [ ] Load on provider mount
  - [ ] Fallback to empty array

- [ ] **Create Budget Sidebar Component**
  - [ ] File: `src/components/ui/SidebarBudgetSection.tsx`
  - [ ] Display: Top 3 categories by spending
  - [ ] Progress bars: Color-coded (green < 50%, yellow 50-80%, red > 80%)
  - [ ] Values: Spent / Budget
  - [ ] Link: Click category → navigate to Budget page with filter

- [ ] **Testing**
  - [ ] Unit: BudgetService calculations correct
  - [ ] Unit: Progress bar colors correct for all thresholds
  - [ ] Integration: Budget section updates on transaction add
  - [ ] E2E: Click category → Budget page opens with filter

### STY-054: Accounts Section in Sidebar (5h)

- [ ] **Create Accounts Sidebar Component**
  - [ ] File: `src/components/ui/SidebarAccountsSection.tsx`
  - [ ] Display: List of accounts (bank, credit card, investment)
  - [ ] Show: Account name, balance (or credit limit for cards)
  - [ ] Icon: Account type (bank, credit card, investment)
  - [ ] Link: Click account → Account details page

- [ ] **Reuse FinanceContext Data**
  - [ ] Import: `useFinance()` hook
  - [ ] Get: accounts array
  - [ ] Filter: Only active accounts (not soft-deleted)

- [ ] **Testing**
  - [ ] Unit: Accounts render correctly
  - [ ] Integration: Accounts update on balance change
  - [ ] E2E: Click account → Details page opens

---

## PHASE 1C: TRANSACTIONS & INSTALLMENTS (Week 1, Day 5)

### STY-055: Transactions & Installments Section (6h)

- [ ] **Create Transactions Component**
  - [ ] File: `src/components/ui/SidebarTransactionsSection.tsx`
  - [ ] Display: 5 most recent transactions
  - [ ] Show: Date, description, amount, category
  - [ ] Link: Click → Transaction details / Edit

- [ ] **Create Installments Component**
  - [ ] File: `src/components/ui/SidebarInstallmentsSection.tsx`
  - [ ] Display: Next 3 upcoming installments
  - [ ] Show: Description, month, 3/12, amount
  - [ ] Badge: Warning if within 7 days

- [ ] **Reuse FinanceContext**
  - [ ] Get: transactions, filter by date desc, take 5
  - [ ] Get: transactions with groupId, calculate next installments

- [ ] **Testing**
  - [ ] Unit: Components render correctly
  - [ ] Integration: Lists update on transaction add
  - [ ] E2E: Click transaction → Details open

---

## PHASE 2A: INVOICES (Week 2, Days 1-2)

### STY-058: Card Invoice Service with Retry Logic (8h)

- [ ] **Create InvoiceContext**
  - [ ] File: `src/context/InvoiceContext.tsx`
  - [ ] Implement: `InvoiceProvider` component
  - [ ] Implement: `useInvoice()` hook
  - [ ] State: invoices, invoiceItems, currentInvoices

- [ ] **Create InvoiceService**
  - [ ] File: `src/services/invoiceService.ts`
  - [ ] Methods: `getInvoices()`, `getCurrentInvoices()`, `getFutureInstallments()`
  - [ ] Methods: `markInvoiceAsPaid()`, `calculateIdealPaymentAmount()`
  - [ ] Error recovery: Wrap all async with `withErrorRecovery()`
  - [ ] Retry logic: 3 retries with exponential backoff

- [ ] **Supabase Integration**
  - [ ] Fetch from: `card_invoices` table
  - [ ] Filter: user_id, deleted_at IS NULL
  - [ ] Order: by due_date DESC
  - [ ] Verify: RLS policies working correctly

- [ ] **localStorage Persistence**
  - [ ] Key: `spfp_invoices_${userId}`
  - [ ] Cache: invoices, invoiceItems
  - [ ] Sync: On state change + hourly refresh

- [ ] **Testing**
  - [ ] Unit: Service methods work correctly
  - [ ] Unit: Retry logic: success after 2nd attempt
  - [ ] Unit: Retry logic: rollback after 3 failures
  - [ ] Integration: Context loads from Supabase
  - [ ] E2E: Create invoice → See in context

### STY-059: Invoice Context Integration (6h)

- [ ] **Context Methods**
  - [ ] `createInvoice()` - Create new invoice
  - [ ] `updateInvoice()` - Update existing invoice
  - [ ] `markInvoiceAsPaid()` - Record payment
  - [ ] `deleteInvoice()` - Soft delete
  - [ ] `getCurrentInvoices()` - Get open invoices in next 30 days

- [ ] **State Syncing**
  - [ ] On mount: Fetch from Supabase
  - [ ] On action: Update state + localStorage
  - [ ] On app focus: Refresh from Supabase

- [ ] **Error Handling**
  - [ ] Show error toast on failure
  - [ ] Portuguese error messages
  - [ ] Rollback state on error
  - [ ] Log to errorRecovery service

- [ ] **Testing**
  - [ ] Integration: Create invoice → See in state
  - [ ] Integration: Mark paid → Status updates
  - [ ] Integration: Error recovery works

---

## PHASE 2B: INVOICES (CONTINUED) (Week 2, Days 2-3)

### STY-060: Current & Future Installments (7h)

- [ ] **Create Invoice Display Component**
  - [ ] File: `src/components/Invoices.tsx` (or update existing)
  - [ ] Display: Current invoices (due in next 30 days)
  - [ ] Show: Invoice date, due date, total, paid, status
  - [ ] Color: Status indicator (green = paid, yellow = partial, red = overdue)

- [ ] **Display Future Installments**
  - [ ] File: `src/components/FutureInstallments.tsx`
  - [ ] List: All future installments (next 12 months)
  - [ ] Group by: Invoice date
  - [ ] Show: 3/12, amount, description

- [ ] **Calculate Ideal Payment**
  - [ ] Use: `InvoiceService.calculateIdealPaymentAmount()`
  - [ ] Display: Suggested payment amount in invoice card
  - [ ] Logic: Min payment OR 20% of balance, depending on days to due

- [ ] **Testing**
  - [ ] Unit: Ideal payment calculation correct
  - [ ] Integration: Current invoices display correctly
  - [ ] Integration: Future installments calculate correctly
  - [ ] E2E: User sees current + future invoices

### STY-061: Realistic Credit Card Visual (8h)

- [ ] **Create Credit Card Component**
  - [ ] File: `src/components/CreditCardDisplay.tsx`
  - [ ] Design: Modern credit card visual (SVG or CSS)
  - [ ] Display: Card number (last 4 digits), card name, cardholder name
  - [ ] Show: Chip, hologram, network logo
  - [ ] Animation: Hover effect, flip animation (optional)

- [ ] **Card Selection**
  - [ ] Display: Multiple cards (if user has more than one)
  - [ ] Select: Click card to see invoice details
  - [ ] Tab: "Fatura Atual" vs "Próximas Parcelas"

- [ ] **Invoice Display**
  - [ ] Show: Due date, total amount, paid amount
  - [ ] Progress bar: Payment progress
  - [ ] Buttons: "Registrar Pagamento", "Ver Detalhes"

- [ ] **Styling**
  - [ ] Dark mode support
  - [ ] Glassmorphism for card background
  - [ ] Responsive: Mobile-friendly

- [ ] **Testing**
  - [ ] Visual: Card renders correctly
  - [ ] Responsive: Works on mobile, tablet, desktop
  - [ ] Interactive: Click card → see invoice details
  - [ ] Lighthouse: No performance issues

---

## PHASE 3A: INVESTMENTS (Week 2, Days 4-5)

### STY-063: Investment Portfolio Data Model (6h)

- [ ] **Extend InvestmentAsset Type**
  - [ ] Add: portfolio_value, ytd_return, allocation_percentage
  - [ ] Add: allocation_target, rebalance_frequency
  - [ ] Verify: All fields have defaults or are optional

- [ ] **Extend InvestmentsContext**
  - [ ] Add method: `getPortfolioMetrics()`
  - [ ] Add method: `getAssetAllocation()`
  - [ ] Add method: `calculateRebalancing()`
  - [ ] Extend state: Add portfolio-level calculations

- [ ] **Create InvestmentPortfolioService**
  - [ ] File: `src/services/investmentPortfolioService.ts`
  - [ ] Calculate: Total portfolio value, total return, return %
  - [ ] Calculate: Asset allocation (% of portfolio)
  - [ ] Calculate: Risk profile (conservative/moderate/aggressive)
  - [ ] Calculate: Rebalancing recommendations

- [ ] **Database Columns**
  - [ ] Run migration: Add columns to investments table
  - [ ] Verify: Data loads correctly from Supabase
  - [ ] No breaking changes to existing code

- [ ] **Testing**
  - [ ] Unit: Portfolio value calculation correct
  - [ ] Unit: Asset allocation calculation correct
  - [ ] Unit: Risk profile calculation correct
  - [ ] Integration: Context methods work

### STY-064: Investment Portfolio Display (7h)

- [ ] **Create Portfolio Dashboard Widget**
  - [ ] File: `src/components/InvestmentPortfolioDashboard.tsx`
  - [ ] Show: Total portfolio value, total return ($ and %)
  - [ ] Show: YTD return

- [ ] **Asset Allocation Chart**
  - [ ] File: `src/components/AssetAllocationChart.tsx`
  - [ ] Type: Pie chart (Recharts)
  - [ ] Show: % of portfolio by asset
  - [ ] Color: Different color per asset
  - [ ] Label: Ticker + %

- [ ] **Rebalancing Suggestions**
  - [ ] File: `src/components/RebalancingSuggestions.tsx`
  - [ ] Show: List of actions (BUY/SELL)
  - [ ] Show: Asset name, amount, % change
  - [ ] Filter: Only show > 5% variance

- [ ] **Styling & Responsiveness**
  - [ ] Dark mode support
  - [ ] Responsive: Mobile shows simplified view
  - [ ] Accessible: ARIA labels on charts

- [ ] **Testing**
  - [ ] Unit: Chart renders correctly
  - [ ] Integration: Data from InvestmentsContext
  - [ ] E2E: User sees portfolio dashboard
  - [ ] Responsive: Mobile/tablet/desktop

### STY-065: Investment Metrics Widget (5h) - OPTIONAL for FASE 1

- [ ] **Create Metrics Widget**
  - [ ] File: `src/components/InvestmentMetricsWidget.tsx`
  - [ ] Show: Key metrics (diversity, risk, YTD return)
  - [ ] Color: Risk profile indicator

- [ ] **Dashboard Integration**
  - [ ] Add to: Dashboard widget grid
  - [ ] Toggle: Show/hide in dashboard settings

- [ ] **Testing**
  - [ ] Unit: Widget renders
  - [ ] Integration: Data correct
  - [ ] E2E: Toggle on/off

---

## TESTING & QA (All Phases)

### Unit Tests

- [ ] **Services**
  - [ ] `budgetService.test.ts` - All calculation methods
  - [ ] `invoiceService.test.ts` - Status logic, calculations
  - [ ] `investmentPortfolioService.test.ts` - Portfolio math

- [ ] **Contexts**
  - [ ] `BudgetContext.test.tsx` - State management, sync
  - [ ] `InvoiceContext.test.tsx` - State management, sync
  - [ ] `SidebarContext.test.tsx` - State persistence

### Integration Tests

- [ ] **Context + Service**
  - [ ] Budget sync from Supabase
  - [ ] Invoice sync from Supabase
  - [ ] Error recovery + retry

### E2E Tests (Playwright/Cypress)

- [ ] **Sidebar Workflow**
  - [ ] Expand/collapse sidebar
  - [ ] Click section → Navigate
  - [ ] State persists on reload

- [ ] **Budget Workflow**
  - [ ] Create budget
  - [ ] Add item
  - [ ] Add transaction
  - [ ] Budget section updates
  - [ ] Click category → Budget page

- [ ] **Invoice Workflow**
  - [ ] Create invoice
  - [ ] See current invoices
  - [ ] See future installments
  - [ ] Mark paid → Status updates
  - [ ] Ideal payment calculates

- [ ] **Investment Workflow**
  - [ ] View portfolio
  - [ ] See allocation
  - [ ] See rebalancing suggestions

### Performance Testing

- [ ] **Bundle Size**
  - [ ] Target: < 520 KB (gzipped)
  - [ ] Measure: `npm run build` → analyze

- [ ] **Runtime Performance**
  - [ ] Initial load: < 2s
  - [ ] Context sync: < 500ms
  - [ ] Add item: < 800ms
  - [ ] Lighthouse score: > 85

---

## CODE QUALITY

### TypeScript

- [ ] **No `any` types**
  - [ ] Run: `grep -r "any" src/context src/services src/types`
  - [ ] Fix: Use proper types

- [ ] **Strict mode enabled**
  - [ ] Run: `npm run typecheck`
  - [ ] No errors

### Linting

- [ ] **ESLint**
  - [ ] Run: `npm run lint`
  - [ ] No warnings or errors

- [ ] **Prettier**
  - [ ] Run: `npm run format`
  - [ ] All files formatted

### Documentation

- [ ] **Code comments**
  - [ ] JSDoc on all public methods
  - [ ] Complex logic explained

- [ ] **README updates**
  - [ ] Add section: New contexts
  - [ ] Add section: New services
  - [ ] Add section: Data flow diagrams

---

## DEPLOYMENT PREP

### Before Merge to Main

- [ ] **All tests passing**
  - [ ] Unit tests: 100% for new code
  - [ ] Integration tests: All pass
  - [ ] E2E tests: All workflows pass

- [ ] **No TypeScript errors**
  - [ ] `npm run typecheck` passes

- [ ] **No linting errors**
  - [ ] `npm run lint` passes

- [ ] **Build successful**
  - [ ] `npm run build` completes
  - [ ] No warnings

- [ ] **Performance acceptable**
  - [ ] Bundle size: < 520 KB (gz)
  - [ ] Lighthouse: > 85 all metrics

### Git & PR

- [ ] **Git commits**
  - [ ] Follow conventional commits: `feat:`, `fix:`, `test:`, `docs:`
  - [ ] Reference story ID: `[STY-051]`
  - [ ] Example: `feat: Add SidebarContext for expand/collapse state [STY-051]`

- [ ] **Pull Request**
  - [ ] Description: Clear summary of changes
  - [ ] Checklist: All items checked
  - [ ] Related issues: Link to story
  - [ ] Screenshots: Visual changes

- [ ] **Code Review**
  - [ ] Get approval from @dev or @qa
  - [ ] Address feedback
  - [ ] Re-request review

### Staging Deployment

- [ ] **Deploy to staging**
  - [ ] Run: Deploy script or GitHub Actions
  - [ ] Verify: No errors in logs

- [ ] **Smoke tests on staging**
  - [ ] Login works
  - [ ] Create budget works
  - [ ] Create invoice works
  - [ ] No console errors

- [ ] **Performance on staging**
  - [ ] Lighthouse: > 85
  - [ ] No slow queries
  - [ ] No memory leaks

---

## HANDOFF NOTES

### For Next Phase

- [ ] Document any blockers encountered
- [ ] List any technical debt
- [ ] Suggest future optimizations
- [ ] Update CLAUDE.md with new patterns

### If Incomplete

- [ ] Mark stories as in_progress
- [ ] Create blockers for dependent stories
- [ ] Handoff notes in `docs/sessions/2026-02/`

---

## SUCCESS CRITERIA

### FASE 1 Complete When:

✅ All 15 stories implemented (STY-051 to STY-065)
✅ All tests passing (unit, integration, E2E)
✅ No TypeScript errors
✅ No linting errors
✅ Bundle size acceptable (< 520 KB gz)
✅ Performance meets targets (< 2s initial, < 500ms sync)
✅ All changes merged to main
✅ Staging deployment successful
✅ Handoff documentation complete

---

**Checklist Version:** 1.0
**Last Updated:** 2026-02-05
**Next Review:** 2026-02-19 (end of FASE 1)
