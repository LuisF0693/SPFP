# Story 008: Implement Soft Delete Strategy

**Epic:** Technical Debt Resolution - SPFP
**Sprint:** 1
**Story ID:** STY-008
**Status:** READY FOR DEVELOPMENT
**Effort:** 2 hours
**Priority:** P1 HIGH
**Type:** Database / Compliance

## User Story

**As a** compliance officer
**I want** soft delete support for user data
**So that** deleted data can be recovered and audit trails maintained (GDPR compliance)

## Description

Implement soft delete strategy using `deleted_at` timestamp field instead of hard deletes:
1. Add `deleted_at: timestamp` to relevant tables
2. Update queries to filter `deleted_at IS NULL`
3. Create recovery functions (undelete capability)
4. Update transaction deletion logic

**Reference:** Technical Debt ID: DB-004

## Acceptance Criteria

- [ ] `deleted_at` field added to `user_data`, `transactions`, `accounts` tables
- [ ] All SELECT queries filtered by `deleted_at IS NULL`
- [ ] Soft delete function implemented (sets `deleted_at` instead of DELETE)
- [ ] Recovery function implemented (clears `deleted_at`)
- [ ] RLS policies updated (exclude soft-deleted rows)
- [ ] Database migration created and tested
- [ ] Code review: 2+ approvals

## Definition of Done

- [ ] Migration script created and applied
- [ ] Queries updated (no hard DELETEs for user-facing data)
- [ ] Recovery functions available for admin
- [ ] Tested in staging
- [ ] PR merged to main

## Effort Breakdown

| Task | Hours | Owner |
|------|-------|-------|
| Database migration | 1 | Backend |
| Update query layer | 0.5 | Full-Stack |
| Test + documentation | 0.5 | QA |
| **Total** | **2** | - |

## Blockers & Dependencies

- **Blocked By:** None
- **Blocks:** DB-008 (audit trail depends on soft delete)
- **External Dependencies:** Supabase

## Testing Strategy

- **Migration Test:** Script applies cleanly to staging
- **Query Test:** SELECT excludes soft-deleted rows
- **Recovery Test:** Undelete restores deleted data

## Files to Modify

- [ ] `supabase/migrations/YYYYMMDD_add_soft_delete.sql` (new)
- [ ] `src/services/dataLayer.ts` (update delete operations)
- [ ] `src/context/FinanceContext.tsx` (use soft delete service)

## Notes & Recommendations

**Soft Delete Query Pattern:**
```sql
SELECT * FROM transactions
WHERE user_id = auth.uid()
AND deleted_at IS NULL;
```

**Recovery Pattern:**
```typescript
async function recoverTransaction(id: string) {
  return supabase
    .from('transactions')
    .update({ deleted_at: null })
    .eq('id', id);
}
```

---

**Created:** 2026-01-26
**Owner Assignment:** @backend / Full-Stack
**Status:** READY FOR IMPLEMENTATION
