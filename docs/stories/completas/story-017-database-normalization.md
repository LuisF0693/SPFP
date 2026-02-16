# Story 017: Design and Implement Database Schema Normalization

**Epic:** Technical Debt Resolution - SPFP
**Sprint:** 5-6
**Story ID:** STY-017
**Status:** READY FOR DEVELOPMENT
**Effort:** 16 hours
**Priority:** P1 HIGH
**Type:** Database / Architecture

## User Story

**As a** data engineer
**I want** to normalize the database schema
**So that** queries are efficient, data integrity is enforced, and scaling is possible

## Description

Current schema stores data as JSON blobs (not normalized). This story:
1. Design normalized schema (transactions, accounts, goals tables)
2. Create data migration scripts (JSON → normalized)
3. Add foreign key constraints
4. Test rollback procedures
5. Document migration strategy

**Reference:** Technical Debt ID: DB-002

## Acceptance Criteria

- [ ] Normalized schema designed and documented
- [ ] Migration script tested in staging
- [ ] All data migrated successfully (zero loss)
- [ ] Foreign key constraints enforced
- [ ] Indexes created on critical columns
- [ ] Rollback procedure tested and documented
- [ ] Code review: 2+ approvals

## Definition of Done

- [ ] Schema design document created
- [ ] Migration script created and tested
- [ ] Rollback procedure documented
- [ ] Data integrity verified
- [ ] Performance validated (faster queries)
- [ ] PR merged to main
- [ ] Deployment guide updated

## Effort Breakdown

| Task | Hours | Owner |
|------|-------|-------|
| Schema design | 4 | Architect |
| Migration script development | 5 | Backend |
| Staging dry-run + validation | 3 | Backend |
| Rollback testing | 2 | Backend |
| Documentation | 2 | Backend |
| **Total** | **16** | - |

## Blockers & Dependencies

- **Blocked By:** Story 010 (context should be flexible first)
- **Blocks:** None (can proceed in parallel)
- **External Dependencies:** Supabase database access

## Testing Strategy

- **Migration Test:** Script runs successfully on staging data clone
- **Data Integrity Test:** Row counts match before/after migration
- **Query Test:** Normalized queries return same data as blob queries
- **Performance Test:** Normalized schema queries faster
- **Rollback Test:** Rollback procedure restores original state

## Files to Modify

- [ ] `supabase/migrations/YYYYMMDD_normalize_schema.sql` (new)
- [ ] `docs/DATABASE_MIGRATION.md` (new)
- [ ] `src/services/dataLayer.ts` (update query layer)
- [ ] Schema diagram file (new)

## Notes & Recommendations

**Normalized Schema Structure:**
```sql
-- transactions table (currently in JSON blob)
CREATE TABLE transactions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  account_id UUID NOT NULL,
  category TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  description TEXT,
  date TIMESTAMP NOT NULL,
  type TEXT CHECK (type IN ('income', 'expense')),
  group_id UUID, -- for recurring transactions
  created_at TIMESTAMP DEFAULT now(),
  FOREIGN KEY (user_id) REFERENCES auth.users(id),
  FOREIGN KEY (account_id) REFERENCES accounts(id),
  FOREIGN KEY (group_id) REFERENCES transaction_groups(id)
);

-- accounts table
CREATE TABLE accounts (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  balance DECIMAL NOT NULL,
  currency TEXT DEFAULT 'BRL',
  created_at TIMESTAMP DEFAULT now(),
  FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- goals table
CREATE TABLE goals (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  target_amount DECIMAL NOT NULL,
  current_amount DECIMAL,
  deadline DATE,
  created_at TIMESTAMP DEFAULT now(),
  FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
```

**Migration Strategy:**
1. Create new normalized tables alongside old JSON table
2. Migrate data with verification
3. Redirect queries to normalized tables (with fallback to JSON)
4. Monitor for errors
5. After 1-2 weeks, drop old JSON table

**Risk Mitigation:**
- Backup Supabase before migration
- Dry-run in staging first
- Monitor query performance post-migration
- Keep rollback script ready

---

**Created:** 2026-01-26
**Owner Assignment:** @architect / @backend
**Status:** READY FOR IMPLEMENTATION
