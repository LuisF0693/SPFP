# EPIC-001: CRM v2 - QUICK REFERENCE

**Status:** Ready for Sprint 2 Kickoff
**Total Points:** 89 | **Total Hours:** ~190 developer-hours
**Duration:** 4 weeks (Feb 19 - Mar 26, 2026)
**Teams:** 3 developers, 1 architect, 1 PM, 1 QA

---

## Visual Sprint Timeline

```
SPRINT 2 (Feb 19-Mar 5)          SPRINT 3 (Mar 5-12)       SPRINT 4 (Mar 12-26)
Foundation & UI (34 pts)         Core Features (37 pts)    Polish & Integration (18 pts)
┌──────────────────────┐         ┌──────────────┐         ┌────────────────────┐
│ S1.1: CRM Setup [8] ├────────→ │              │         │                    │
│ S1.2: Client List [13]├────────→ S1.5: Files  │         │ S1.10: Templates   │
│ S1.3: Profile [8] ├────────→ [8]│              │         │      [5]           │
│ S1.4: Notes MVP [5]├────────→ S1.6: Send [13]├────────→ S1.11: Perms [5]   │
│                    │         S1.7: Invest [8]│         │ S1.12: Dashboard   │
│                    │         S1.8: Score [5] │         │      [8]           │
│                    │         S1.9: Edit [3]  │         │                    │
└──────────────────────┘         └──────────────┘         └────────────────────┘
          ↓                                ↓                         ↓
    Ready for Launch              Core Features Live        Production Ready
```

---

## Story Priorities by Sprint

### SPRINT 2: FOUNDATION (34 pts, 52 hrs)

| Priority | Story | Points | Hours | Status |
|----------|-------|--------|-------|--------|
| 1 | **S1.1: Setup CRM Module** | 8 | 16 | BLOCKER |
| 2 | **S1.2: Client Dashboard List** | 13 | 26 | Depends on S1.1 |
| 3 | **S1.3: Client Profile Overview** | 8 | 16 | Depends on S1.2 |
| 4 | **S1.4: Meeting Notes Modal (MVP)** | 5 | 10 | Depends on S1.3 |

**Week-by-Week Breakdown:**
- **Week 1 (Feb 19-26):** S1.1 (Mon-Tue), S1.2 (Wed-Fri)
- **Week 2 (Feb 26-Mar 5):** S1.3 (Mon-Wed), S1.4 (Thu-Fri)

**Acceptance Criteria:** All 4 stories complete, tested, merged to main.

---

### SPRINT 3: CORE FEATURES (37 pts, 68 hrs, 1-week intensive)

| Priority | Story | Points | Hours | Dependencies |
|----------|-------|--------|-------|--------------|
| 1 | **S1.6: Meeting History & Send** | 13 | 26 | S1.4 + S1.5 |
| 2 | **S1.5: Upload Files** | 8 | 16 | S1.3 |
| 3 | **S1.7: Investment Notes** | 8 | 16 | S1.4 |
| 4 | **S1.8: Health Score** | 5 | 10 | S1.3 |
| 5 | **S1.9: Edit Client Modal** | 3 | 6 | S1.3 |

**Parallelization:**
```
S1.5 & S1.8 & S1.9 (Independent) → S1.6 (Critical)
S1.7 (Parallel with S1.6)
```

**Daily Standups Required:** Yes (1 week, fast pace)

**Acceptance Criteria:** Email + WhatsApp sending working, file uploads working, health scores calculating.

---

### SPRINT 4: POLISH (18 pts, 36 hrs, 2 weeks)

| Priority | Story | Points | Hours | Dependencies |
|----------|-------|--------|-------|--------------|
| 1 | **S1.12: Dashboard Integration** | 8 | 16 | All previous |
| 2 | **S1.10: Template Management** | 5 | 10 | S1.6 |
| 3 | **S1.11: Permissions & Access** | 5 | 10 | All |

**Week-by-Week:**
- **Week 1:** S1.10 + S1.11 (parallel)
- **Week 2:** S1.12 + final QA + bug fixes

**Acceptance Criteria:** Full CRM feature parity, all integrations working, 80%+ test coverage.

---

## Key Dependencies Map

```
START
  ↓
[S1.1] CRM Module Setup
  ↓
[S1.2] Client Dashboard List (depends on S1.1)
  ├────────────────┬───────────────┐
  ↓                ↓               ↓
[S1.3] Profile   (Depends S1.2)   |
  │     │          │               ↓
  │     └─→[S1.4]  │         [S1.8] Health Score (can start with S1.3)
  │          │      │         [S1.9] Edit Modal (can start with S1.3)
  │          ├──→[S1.5] Files (depends S1.3)
  │          │      │
  │          ├──→[S1.7] Investment (depends S1.4)
  │          │      │
  │          └──→[S1.6] Send & History (depends S1.4, S1.5) ← CRITICAL
  │                  │
  └──────────────→[S1.10] Templates (depends S1.6)
                    │
[S1.11] Permissions (can start anytime)
                    │
                    └──→[S1.12] Dashboard Integration (last, depends on all)

DONE
```

**Critical Path (Sequential, No Parallelization):**
S1.1 → S1.2 → S1.3 → S1.4 → S1.6 (12 weeks of work)

**Parallelizable Savings:**
- S1.5, S1.7, S1.8, S1.9 can run in parallel with S1.4
- S1.11 can run anytime
- Realistic timeline with 3 devs: ~4 weeks

---

## Resource Allocation

### Recommended Team Setup

```
Dev Team (3):
├── @dev-lead: S1.1, S1.2, S1.3 (Foundation expert)
├── @dev-backend: S1.6, S1.10 (Email/API integration)
└── @dev-frontend: S1.5, S1.7, S1.8, S1.9, S1.12 (UI heavy)

Supporting:
├── @architect: Design reviews, technical spike (S1.1, S1.6)
├── @pm (Morgan): Sprint planning, unblocking
└── @qa (Quinn): Test strategy, E2E coverage
```

### Effort Distribution

```
Sprint 2: 52 hours → 17h/dev
Sprint 3: 68 hours → 23h/dev (intensive!)
Sprint 4: 36 hours → 12h/dev

Total: 156 hours = 52 hours/dev over 4 weeks
      = ~13 hrs/dev/week (realistic for parallel work)
```

---

## Tech Stack & Dependencies

### New Libraries to Install

```bash
npm install resend                    # Email sending
npm install react-pdf                 # PDF viewer
npm install react-dropzone            # File uploads
npm install browser-image-compression # Image optimization
npm install phone-parser              # Phone validation (optional)
```

### Database Changes

```sql
-- 3 new tables (from migrations)
CREATE TABLE sent_atas           -- Meeting notes & investments
CREATE TABLE custom_templates    -- User-customized templates
CREATE TABLE user_files          -- File metadata
CREATE TABLE health_score_history -- (Optional) Score trends

-- 2 new columns
ALTER TABLE clients ADD health_score
ALTER TABLE clients ADD health_score_updated_at

-- RLS policies (for all new tables)
-- Triggers (auto-update health score)
```

### Environment Variables

```env
REACT_APP_RESEND_API_KEY=re_xxxxxxxxxxxxx  # Add to .env.local
VITE_SUPABASE_URL=<already set>
VITE_SUPABASE_ANON_KEY=<already set>
```

---

## Testing Requirements by Sprint

### Sprint 2 Testing (Foundation)

```
Unit Tests:
  ✓ Route guards (CRM access)
  ✓ Client filtering/sorting
  ✓ Health score calculations (placeholder)

Integration Tests:
  ✓ Sidebar navigation
  ✓ Fetch clients from Supabase
  ✓ Client profile load + tab switching

E2E Tests:
  ✓ Admin login → access /crm
  ✓ Non-admin login → redirect from /crm
  ✓ List clients → click client → view profile
  ✓ Open meeting notes modal → close
```

### Sprint 3 Testing (Core Features)

```
New Unit Tests:
  ✓ Email validation, phone validation
  ✓ Template HTML rendering
  ✓ File type/size validation
  ✓ Health score auto-calculations
  ✓ WhatsApp link generation

New Integration Tests:
  ✓ Send email via Resend API (mock)
  ✓ Upload file to Supabase Storage
  ✓ Record ata in sent_atas
  ✓ Fetch file list with filters
  ✓ Trigger health score update

New E2E Tests:
  ✓ Create meeting notes → save draft
  ✓ Send via email → verify in DB
  ✓ Send via WhatsApp → verify link
  ✓ Upload file → view in list
  ✓ View history → filter by channel
```

### Sprint 4 Testing (Polish)

```
Final Coverage Target: 80% (unit + integration + E2E)

Regression Tests:
  ✓ All S2-S3 functionality still works
  ✓ Dashboard widgets display correctly
  ✓ Report generation and export

New Tests:
  ✓ Custom template save/restore
  ✓ Permission checks (RLS policies)
  ✓ Dashboard integration scenarios
```

---

## Risk Dashboard

| Risk | Prob. | Impact | Mitigation | Status |
|------|-------|--------|-----------|--------|
| **Email API limits** | MEDIUM | HIGH | Show quota in UI, document upgrade path | PLANNED |
| **WhatsApp link too long** | LOW | MEDIUM | Compress text, show warning | PLANNED |
| **Health score formula drift** | LOW | MEDIUM | Start simple, iterate, monitor | PLANNED |
| **Mobile responsiveness** | MEDIUM | MEDIUM | Test on 2+ devices daily | PLANNED |
| **File storage quota exceeded** | LOW | MEDIUM | Set clear quotas, auto-warning | PLANNED |
| **CRM feature creep** | HIGH | MEDIUM | Strict MVP scope, defer to phase 2 | CONTROLLED |
| **Team context loss** | LOW | MEDIUM | Daily standups, wiki updates | MITIGATED |

---

## Success Criteria Checklist

### End of Sprint 2
- [ ] CRM module accessible only to admins
- [ ] 100+ clients displayable in grid/list
- [ ] Client profile shows all details
- [ ] Meeting notes draft auto-saves
- [ ] No TypeScript errors
- [ ] Lighthouse score > 85
- [ ] Mobile responsive tested

### End of Sprint 3
- [ ] Email sending working (Resend API)
- [ ] WhatsApp deep links working
- [ ] File uploads with progress bar
- [ ] Health scores calculating
- [ ] Ata history filterable
- [ ] All E2E tests passing
- [ ] 50%+ test coverage

### End of Sprint 4
- [ ] Custom templates saved/used
- [ ] RLS policies enforced
- [ ] Dashboard widgets showing CRM data
- [ ] Reports page functional
- [ ] All stories merged to main
- [ ] 80%+ test coverage
- [ ] Production deployment ready

---

## Recommended Kickoff Agenda

**Date:** Tuesday, Feb 18, 2026 @ 10 AM

1. **Overview** (10 min)
   - 12 stories, 89 points, 4-week timeline
   - Dependencies and critical path

2. **Sprint 2 Deep Dive** (20 min)
   - S1.1 through S1.4 scope
   - Database migrations review
   - Design specifications

3. **Dev Team Assignments** (10 min)
   - Who owns which story
   - Pairing/support strategy

4. **Testing Strategy** (10 min)
   - Unit test expectations
   - Integration test framework
   - E2E test scenarios

5. **Q&A & Unblocking** (10 min)
   - Address blockers
   - Clarify acceptance criteria

**Deliverables for Kickoff:**
- [ ] Full EPIC-001 PRD (already sent)
- [ ] PRIORITIZED-ROADMAP.md (this doc)
- [ ] Design mockups & component specs
- [ ] Database migration scripts
- [ ] Test strategy document

---

## Communication & Tracking

### Daily Standup (9 AM, 15 min)
- What did you complete yesterday?
- What are you working on today?
- Any blockers?

### Sprint Planning (Monday, 1 hour)
- Backlog refinement
- Story estimation
- Sprint commitment

### Sprint Review (Friday, 1 hour)
- Demo completed stories
- Gather feedback
- Plan next sprint

### Tracking Tool
- **GitHub Projects:** Epic-001 board with columns (Backlog, In Progress, Review, Done)
- **GitHub Issues:** One issue per story, linked to PRs
- **PR Reviews:** Require 2 approvals (one @architect, one @dev-lead)

---

## Next Steps

### For @pm (Morgan)
- [ ] Send PRIORITIZED-ROADMAP to dev team
- [ ] Schedule kickoff meeting for Feb 18
- [ ] Prepare Resend API account (get key)
- [ ] Confirm design mockups with @ux

### For @architect
- [ ] Review database migrations
- [ ] Validate RLS policy approach
- [ ] Design review for CRM components
- [ ] Spike on health score formula

### For @dev-lead
- [ ] Create GitHub project board
- [ ] Set up branch protection rules
- [ ] Prepare test scaffolding
- [ ] Clone repo for local setup

### For @qa (Quinn)
- [ ] Design test cases for each story
- [ ] Prepare test environment
- [ ] Set up automated test CI
- [ ] Mobile device testing plan

---

**Prepared by:** Morgan (AIOS PM Agent)
**Date:** 2026-02-16
**Status:** READY FOR KICKOFF
**Next Update:** Post-kickoff (Feb 18)

