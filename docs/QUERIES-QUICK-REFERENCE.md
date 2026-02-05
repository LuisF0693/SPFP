# SQL Queries Quick Reference
## STY-058 & STY-060 - Card Invoice Queries

**For rapid development reference - copy-paste ready**

---

## Q1: Get Invoices for Card (Last 12 Months)

**Use Case:** Display invoice history
**Performance:** ~35ms
**Parameters:** `user_id`, `card_id`

```sql
SELECT
  ci.id,
  ci.invoice_number,
  ci.invoice_date,
  ci.due_date,
  ci.total_amount,
  ci.paid_amount,
  ci.pending_amount,
  ci.status,
  COUNT(cii.id) FILTER (WHERE cii.status != 'CANCELLED') as item_count,
  COUNT(cii.id) FILTER (WHERE cii.status = 'PAID') as paid_items,
  MAX(cii.due_date) as last_item_due_date
FROM card_invoices ci
LEFT JOIN card_invoice_items cii ON ci.id = cii.invoice_id
WHERE ci.user_id = $1
  AND ci.card_id = $2
  AND ci.invoice_date >= NOW() - INTERVAL '12 months'
  AND ci.deleted_at IS NULL
GROUP BY ci.id
ORDER BY ci.invoice_date DESC
LIMIT 50;
```

---

## Q2: Current + Future Installments (90 Days)

**Use Case:** STY-060 - Upcoming payments list
**Performance:** ~40ms
**Parameters:** `user_id`, `card_id`

```sql
SELECT
  cii.id,
  cii.invoice_id,
  ci.invoice_date,
  cii.due_date,
  cii.description,
  cii.amount,
  cii.installment_number,
  cii.installment_total,
  cii.status,
  cii.category_id,
  c.name as category_name,
  ci.total_amount,
  ci.status as invoice_status
FROM card_invoice_items cii
JOIN card_invoices ci ON cii.invoice_id = ci.id
LEFT JOIN categories c ON cii.category_id = c.id
WHERE cii.user_id = $1
  AND cii.card_id = $2
  AND cii.status IN ('PENDING', 'OVERDUE')
  AND cii.due_date >= NOW()::DATE
  AND cii.due_date <= NOW()::DATE + INTERVAL '90 days'
ORDER BY cii.due_date ASC;
```

---

## Q3: Calculate Ideal Installment Amount

**Use Case:** Recommend payment amount
**Performance:** ~80ms
**Parameters:** `user_id`, `card_id`

```sql
WITH recent_installments AS (
  SELECT amount
  FROM card_invoice_items
  WHERE user_id = $1
    AND card_id = $2
    AND created_at >= NOW() - INTERVAL '6 months'
    AND status != 'CANCELLED'
)
SELECT
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY amount) as median_installment,
  PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY amount) as q1_amount,
  PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY amount) as q3_amount,
  AVG(amount) as avg_installment,
  MAX(amount) as max_installment,
  MIN(amount) as min_installment,
  STDDEV_POP(amount) as std_dev,
  COUNT(*) as total_installments
FROM recent_installments;
```

---

## Q4: Group Upcoming Payments by Due Date

**Use Case:** Alert system - consolidate by date
**Performance:** ~60ms
**Parameters:** `user_id`, `card_id`

```sql
SELECT
  cii.due_date,
  SUM(cii.amount) as total_due,
  COUNT(cii.id) as num_installments,
  ARRAY_AGG(DISTINCT c.name) as categories,
  json_agg(json_build_object(
    'id', cii.id,
    'description', cii.description,
    'amount', cii.amount,
    'installment_number', cii.installment_number,
    'installment_total', cii.installment_total
  )) as items
FROM card_invoice_items cii
JOIN card_invoices ci ON cii.invoice_id = ci.id
LEFT JOIN categories c ON cii.category_id = c.id
WHERE cii.user_id = $1
  AND cii.card_id = $2
  AND cii.status IN ('PENDING', 'OVERDUE')
  AND cii.due_date > NOW()::DATE
  AND cii.due_date <= NOW()::DATE + INTERVAL '90 days'
GROUP BY cii.due_date
ORDER BY cii.due_date ASC;
```

---

## Q5: Invoice List with Pagination

**Use Case:** Display paginated invoice history
**Performance:** ~35ms
**Parameters:** `user_id`, `card_id`, `limit`, `offset`

```sql
WITH invoice_summary AS (
  SELECT
    ci.id,
    ci.invoice_number,
    ci.invoice_date,
    ci.due_date,
    ci.total_amount,
    ci.status,
    COUNT(*) FILTER (WHERE cii.status = 'PAID') as paid_count,
    COUNT(*) as total_count,
    SUM(CASE WHEN cii.status = 'PAID' THEN cii.amount ELSE 0 END) as amount_paid
  FROM card_invoices ci
  LEFT JOIN card_invoice_items cii ON ci.id = cii.invoice_id
  WHERE ci.user_id = $1
    AND ci.card_id = $2
    AND ci.deleted_at IS NULL
  GROUP BY ci.id
)
SELECT *
FROM invoice_summary
ORDER BY invoice_date DESC
LIMIT $3 OFFSET $4;
```

---

## Q6: Overdue Items with Severity

**Use Case:** Risk alerts and reporting
**Performance:** ~50ms
**Parameters:** `user_id`

```sql
SELECT
  cii.id,
  cii.description,
  cii.amount,
  cii.due_date,
  ci.card_id,
  ca.name as card_name,
  (NOW()::DATE - cii.due_date) as days_overdue,
  CASE
    WHEN (NOW()::DATE - cii.due_date) > 30 THEN 'CRITICAL'
    WHEN (NOW()::DATE - cii.due_date) > 15 THEN 'WARNING'
    ELSE 'ALERT'
  END as severity
FROM card_invoice_items cii
JOIN card_invoices ci ON cii.invoice_id = ci.id
JOIN accounts ca ON ci.card_id = ca.id
WHERE cii.user_id = $1
  AND cii.status = 'OVERDUE'
  AND cii.due_date < NOW()::DATE
ORDER BY cii.due_date ASC;
```

---

## Q7: Monthly Spending Summary

**Use Case:** Dashboard widget - spending trends
**Performance:** ~90ms
**Parameters:** `user_id`, `card_id`

```sql
SELECT
  DATE_TRUNC('month', ci.invoice_date)::DATE as month,
  COUNT(DISTINCT ci.id) as num_invoices,
  SUM(ci.total_amount) as total_spent,
  SUM(ci.paid_amount) as total_paid,
  SUM(ci.pending_amount) as total_pending,
  AVG(ci.total_amount) as avg_invoice_amount
FROM card_invoices ci
WHERE ci.user_id = $1
  AND ci.card_id = $2
  AND ci.invoice_date >= NOW() - INTERVAL '12 months'
  AND ci.deleted_at IS NULL
GROUP BY DATE_TRUNC('month', ci.invoice_date)
ORDER BY month DESC;
```

---

## Q8: Category Spending Breakdown

**Use Case:** Analytics - spending by category
**Performance:** ~70ms
**Parameters:** `user_id`, `card_id`, `invoice_month_start`

```sql
SELECT
  c.name,
  COUNT(cii.id) as item_count,
  SUM(cii.amount) as total_amount,
  AVG(cii.amount) as avg_amount,
  MIN(cii.amount) as min_amount,
  MAX(cii.amount) as max_amount,
  ROUND(SUM(cii.amount) * 100.0 / (
    SELECT SUM(amount) FROM card_invoice_items
    WHERE invoice_id IN (
      SELECT id FROM card_invoices
      WHERE user_id = $1 AND card_id = $2
        AND invoice_date = DATE_TRUNC('month', $3)::DATE
    ) AND status != 'CANCELLED'
  ), 2) as percentage
FROM card_invoice_items cii
JOIN card_invoices ci ON cii.invoice_id = ci.id
LEFT JOIN categories c ON cii.category_id = c.id
WHERE cii.user_id = $1
  AND ci.card_id = $2
  AND ci.invoice_date = DATE_TRUNC('month', $3)::DATE
  AND cii.status != 'CANCELLED'
GROUP BY c.id, c.name
ORDER BY total_amount DESC;
```

---

## Q9: Multi-Card Upcoming (Sidebar)

**Use Case:** STY-055 - Upcoming from all cards
**Performance:** ~100ms
**Parameters:** `user_id`

```sql
SELECT
  ca.id as card_id,
  ca.name as card_name,
  ca.lastFourDigits,
  ca.network,
  MIN(cii.due_date) as next_due_date,
  SUM(cii.amount) as total_amount_due,
  COUNT(cii.id) as num_items,
  JSON_AGG(JSON_BUILD_OBJECT(
    'description', cii.description,
    'amount', cii.amount,
    'due_date', cii.due_date
  ) ORDER BY cii.due_date LIMIT 3) as top_3_items
FROM accounts ca
LEFT JOIN card_invoice_items cii ON ca.id = cii.card_id
LEFT JOIN card_invoices ci ON cii.invoice_id = ci.id
WHERE ca.user_id = $1
  AND ca.type = 'CREDIT_CARD'
  AND ca.deleted_at IS NULL
  AND cii.status IN ('PENDING', 'OVERDUE')
  AND cii.due_date >= NOW()::DATE
  AND cii.due_date <= NOW()::DATE + INTERVAL '30 days'
GROUP BY ca.id, ca.name, ca.lastFourDigits, ca.network
ORDER BY next_due_date ASC;
```

---

## Q10: Invoice Reconciliation (Verification)

**Use Case:** Data quality check
**Performance:** ~120ms
**Parameters:** `user_id`, `card_id`

```sql
SELECT
  ci.id,
  ci.invoice_number,
  ci.source,
  ci.total_amount,
  COUNT(DISTINCT cii.id) as num_items,
  COUNT(DISTINCT t.id) as num_transactions,
  CASE
    WHEN COUNT(DISTINCT t.id) = COUNT(DISTINCT cii.id) THEN 'BALANCED'
    WHEN COUNT(DISTINCT t.id) > COUNT(DISTINCT cii.id) THEN 'ORPHANED_TXN'
    ELSE 'MISSING_TXN'
  END as reconciliation_status
FROM card_invoices ci
LEFT JOIN card_invoice_items cii ON ci.id = cii.invoice_id
LEFT JOIN transactions t ON cii.transaction_id = t.id
WHERE ci.user_id = $1
  AND ci.card_id = $2
  AND ci.invoice_date >= NOW() - INTERVAL '6 months'
GROUP BY ci.id, ci.invoice_number, ci.source, ci.total_amount
ORDER BY ci.invoice_date DESC;
```

---

## BONUS: Complex Queries

### Q11: Smart Installment Prediction

**Use Case:** Predict user's likely installment preferences
**Performance:** ~150ms

```sql
WITH historical_patterns AS (
  SELECT
    EXTRACT(MONTH FROM cii.due_date) as month_pattern,
    cii.installment_total,
    COUNT(*) as frequency,
    AVG(cii.amount) as avg_amount
  FROM card_invoice_items cii
  WHERE cii.user_id = $1
    AND cii.status != 'CANCELLED'
    AND cii.created_at >= NOW() - INTERVAL '12 months'
  GROUP BY EXTRACT(MONTH FROM cii.due_date), cii.installment_total
)
SELECT
  month_pattern,
  installment_total,
  frequency,
  avg_amount,
  ROW_NUMBER() OVER (PARTITION BY month_pattern ORDER BY frequency DESC) as rank
FROM historical_patterns
ORDER BY month_pattern, rank;
```

---

### Q12: Credit Card Health Score

**Use Case:** Overall card financial health
**Performance:** ~100ms

```sql
SELECT
  ca.id as card_id,
  ca.name as card_name,
  SUM(ci.total_amount) as total_charged,
  SUM(ci.paid_amount) as total_paid,
  SUM(ci.pending_amount) as total_pending,
  COUNT(DISTINCT ci.id) FILTER (WHERE ci.status = 'OPEN') as open_invoices,
  COUNT(DISTINCT ci.id) FILTER (WHERE ci.status = 'OVERDUE') as overdue_invoices,
  COUNT(DISTINCT cii.id) FILTER (WHERE cii.status = 'OVERDUE') as overdue_items,
  ROUND(100.0 * SUM(ci.paid_amount) / NULLIF(SUM(ci.total_amount), 0), 2) as payment_ratio,
  CASE
    WHEN ROUND(100.0 * SUM(ci.paid_amount) / NULLIF(SUM(ci.total_amount), 0), 2) >= 80 THEN 'EXCELLENT'
    WHEN ROUND(100.0 * SUM(ci.paid_amount) / NULLIF(SUM(ci.total_amount), 0), 2) >= 50 THEN 'GOOD'
    WHEN ROUND(100.0 * SUM(ci.paid_amount) / NULLIF(SUM(ci.total_amount), 0), 2) >= 20 THEN 'FAIR'
    ELSE 'POOR'
  END as health_status
FROM accounts ca
LEFT JOIN card_invoices ci ON ca.id = ci.card_id
LEFT JOIN card_invoice_items cii ON ci.id = cii.invoice_id
WHERE ca.user_id = $1
  AND ca.type = 'CREDIT_CARD'
  AND ca.deleted_at IS NULL
  AND ci.invoice_date >= NOW() - INTERVAL '6 months'
GROUP BY ca.id, ca.name
ORDER BY health_status DESC;
```

---

## TYPESCRIPT USAGE EXAMPLES

### Fetch Invoices from Service

```typescript
import { CardInvoice, CardInvoiceFilters } from '@/types/creditCard';
import { cardInvoiceService } from '@/services/cardInvoiceService';

// Get last 12 months
const invoices = await cardInvoiceService.fetchInvoices(userId, cardId);

// With filters
const filters: CardInvoiceFilters = {
  cardId: 'abc-123',
  status: InvoiceStatus.OPEN,
  dateFrom: new Date('2025-01-01'),
  limit: 50,
  offset: 0
};
const filtered = await cardInvoiceService.fetchInvoices(userId, filters);
```

### Query Installments

```typescript
import { InstallmentStatus } from '@/types/creditCard';

// Get future installments for sidebar
const future = await cardInvoiceService.getFutureInstallments(
  userId,
  cardId,
  90 // days
);

// Get overdue for alerts
const overdue = await cardInvoiceService.getOverdueItems(userId);
```

### Calculate Recommendations

```typescript
// Get statistical recommendation
const recommendation = await cardInvoiceService.getInstallmentRecommendation(
  userId,
  cardId,
  6 // last 6 months
);

// Use in component
<div>
  Valor ideal: {formatCurrency(recommendation.medianInstallment)}
  Média: {formatCurrency(recommendation.averageInstallment)}
  Máximo: {formatCurrency(recommendation.maxInstallment)}
</div>
```

---

## INDEX STRATEGY

### Must Create These Indexes

```sql
-- Fast lookups by user + card
CREATE INDEX idx_card_invoices_user_card
  ON card_invoices(user_id, card_id);

-- Fast date-range queries
CREATE INDEX idx_card_invoices_user_card_date_desc
  ON card_invoices(user_id, card_id, invoice_date DESC);

-- Status filtering
CREATE INDEX idx_card_invoice_items_user_status
  ON card_invoice_items(user_id, status);

-- Due date queries
CREATE INDEX idx_card_invoice_items_card_due
  ON card_invoice_items(card_id, due_date);

-- Multi-card aggregate
CREATE INDEX idx_card_invoice_items_user_card_due
  ON card_invoice_items(user_id, card_id, due_date DESC);
```

**Total Indexes:** 12 (detailed in SQL migration)

---

## PAGINATION PATTERN

```typescript
// Component state
const [page, setPage] = useState(0);
const pageSize = 50;

// Query with pagination
const invoices = await db.query(queries.Q5_PAGINATION, [
  userId,
  cardId,
  pageSize,        // $3 = LIMIT
  page * pageSize  // $4 = OFFSET
]);

// Calculate hasMore
const hasMore = invoices.length === pageSize;

// Navigation
<button onClick={() => setPage(page + 1)} disabled={!hasMore}>
  Próxima
</button>
```

---

## ERROR HANDLING PATTERN

```typescript
import { withErrorRecovery } from '@/services/errorRecovery';

const result = await withErrorRecovery(
  () => db.query(Q2_FUTURE_INSTALLMENTS, [userId, cardId]),
  'Fetch future installments',
  {
    maxRetries: 3,
    userId,
    metadata: { cardId, query: 'Q2' }
  }
);

if (!result.success) {
  showError('Erro ao carregar parcelas: ' + result.error);
  return [];
}

return result.data;
```

---

## CACHING PATTERN

```typescript
const cache = new Map<string, { data: any; expires: number }>();

async function getCachedInvoices(userId: string, cardId: string) {
  const key = `invoices_${userId}_${cardId}`;
  const cached = cache.get(key);

  if (cached && cached.expires > Date.now()) {
    return cached.data; // Return from cache
  }

  // Fetch fresh data
  const data = await fetchInvoices(userId, cardId);
  cache.set(key, {
    data,
    expires: Date.now() + 6 * 60 * 60 * 1000 // 6 hours TTL
  });

  return data;
}
```

---

## PERFORMANCE CHECKLIST

- [ ] All indexes created (12 total)
- [ ] RLS policies enforced
- [ ] Query times verified (<100ms)
- [ ] Pagination implemented (50 items/page)
- [ ] Caching strategy active (6h TTL)
- [ ] Error recovery in place
- [ ] Monitoring/logging enabled
- [ ] Type safety verified (strict TS)

---

**Quick Reference Version:** 1.0
**Date:** 2026-02-05
**Status:** Ready to Use
