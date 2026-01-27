# Story 001: Implement RLS Policies on user_data Table

**Epic:** Technical Debt Resolution - SPFP
**Sprint:** 0
**Story ID:** STY-001
**Status:** READY FOR DEVELOPMENT
**Effort:** 4 hours
**Priority:** P0 CRITICAL
**Type:** Security / Tech Debt

## User Story

**As a** backend engineer
**I want** to implement Row-Level Security (RLS) policies on the `user_data` table
**So that** users can only access their own financial data (GDPR/LGPD compliance)

## Description

The `user_data` table currently lacks RLS policies, allowing any authenticated user to read all other users' data (critical security violation). This story implements SQL-level row filtering to ensure data isolation.

**Technical Details:**
- Create RLS policy: `SELECT` only `user_id = auth.uid()`
- Create RLS policy: `INSERT` only `user_id = auth.uid()`
- Create RLS policy: `UPDATE` only `user_id = auth.uid()`
- Create RLS policy: `DELETE` only `user_id = auth.uid()`
- Enable RLS on `user_data` table
- Validate isolation with SQL test

**Reference:** Technical Debt ID: DB-001

## Acceptance Criteria

- [ ] RLS policies created and enabled on `user_data` table
- [ ] SELECT policy restricts to `auth.uid()` match
- [ ] INSERT policy prevents cross-user writes
- [ ] UPDATE/DELETE policies restrict to own rows
- [ ] SQL test confirms user A cannot read user B data
- [ ] Supabase RLS tester shows zero policy violations
- [ ] Staging deployment tested and validated
- [ ] Code review: 2+ approvals
- [ ] All tests passing

## Definition of Done

- [ ] RLS policies deployed to staging Supabase
- [ ] SQL validation test passing (user isolation verified)
- [ ] Security audit sign-off (infrastructure review)
- [ ] Documentation: RLS policy explanation in runbook
- [ ] PR merged to main
- [ ] Staging deployment confirmed

## Effort Breakdown

| Task | Hours | Owner |
|------|-------|-------|
| Design RLS policy rules | 0.5 | Backend |
| Implement SQL policies | 1.5 | Backend |
| Write validation test | 1 | QA |
| Security review + deployment | 1 | Backend |
| **Total** | **4** | - |

## Blockers & Dependencies

- **Blocked By:** None (P0 priority, no dependencies)
- **Blocks:** None initially, but critical foundation for Sprint 1
- **External Dependencies:** Supabase staging environment access

## Testing Strategy

- **Unit Tests:** SQL test in Supabase (confirm isolation)
- **Integration Tests:** Auth + RLS policy interaction test
- **Security Tests:** Multi-user isolation verified
- **Manual Tests:** Try unauthorized SELECT/UPDATE/DELETE via SQL editor

## Files to Modify

- [ ] `supabase/migrations/YYYYMMDD_add_rls_user_data.sql` (new)
- [ ] `supabase/tests/rls-user-isolation.test.sql` (new)
- [ ] `docs/DEPLOYMENT.md` (document RLS policy)

## Notes & Recommendations

**Critical:** This is blocking production deployment. Must be completed and tested before feature work resumes.

**Implementation Hint:** Use Supabase's RLS policy creator in dashboard, then export SQL to migrations folder for version control.

**Validation:** After deployment, run:
```sql
SELECT * FROM user_data WHERE user_id != auth.uid();
-- Should return: ERROR permission denied for table user_data
```

---

**Created:** 2026-01-26
**Owner Assignment:** @backend / Senior
**Status:** READY FOR IMPLEMENTATION
