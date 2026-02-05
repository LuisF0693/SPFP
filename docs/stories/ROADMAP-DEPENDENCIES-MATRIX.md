# ROADMAP DEPENDENCIES MATRIX
## 35 Stories - Dependency Analysis

---

## DEPENDENCY GRAPH (ASCII Visual)

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                              FASE 1: FOUNDATION                             ║
║                          (2 weeks | 65-80h | 15 stories)                    ║
╚══════════════════════════════════════════════════════════════════════════════╝

[P0] STY-051: SidebarContext
     ├─→ [P0] STY-052: Sidebar Layout UI
     │   ├─→ [P0] STY-053: Budget Section
     │   │   └─→ [P1] STY-057: Sidebar Analytics
     │   ├─→ [P0] STY-054: Accounts Section
     │   ├─→ [P1] STY-055: Transactions Section
     │   └─→ [P1] STY-056: Mobile Drawer

[P0] STY-058: Card Invoice Fetching ⚠️ CRITICAL
     ├─→ [P0] STY-059: Invoice Context ⚠️ CRITICAL
     │   ├─→ [P0] STY-060: Current/Future Installments ⚠️ CRITICAL
     │   │   └─→ [P1] STY-062: Transaction Sync
     │   └─→ [P0] STY-061: Card Visual ⚠️ CRITICAL
     │       └─→ [P1] STY-062: Transaction Sync

[P0] STY-063: Investment Data Model ⚠️ CRITICAL
     ├─→ [P0] STY-064: Portfolio Display ⚠️ CRITICAL
     │   └─→ [P1] STY-065: Metrics Widget
     └─→ (carries to FASE 2) [STY-074]


╔══════════════════════════════════════════════════════════════════════════════╗
║                              FASE 2: FEATURES                               ║
║                         (3 weeks | 82-95h | 10 stories)                     ║
╚══════════════════════════════════════════════════════════════════════════════╝

[P0] STY-066: Retirement Context ⚠️ CRITICAL
     ├─→ [P0] STY-067: DashPlan Chart ⚠️ CRITICAL
     │   ├─→ [P0] STY-068: Goal Setting ⚠️ CRITICAL
     │   │   ├─→ [P1] STY-069: Scenario Comparison
     │   │   └─→ [P2] STY-070: Alerts & Milestones
     │   └─→ [P1] STY-069: Scenario Comparison
     │       └─→ (also depends on STY-063)

[P1] STY-071: Asset Data Model ⚠️ CRITICAL
     ├─→ [P1] STY-072: Comparison UI
     │   └─→ [P1] STY-073: Asset Form
     └─→ [P1] STY-074: Patrimony Listing

[P0] STY-063 (from FASE 1) ──┐
[P1] STY-071 ────────────────┼─→ [P1] STY-074: Patrimony Listing ⚠️ COMBINED
                             └─→ [P1] STY-075: Evolution Chart


╔══════════════════════════════════════════════════════════════════════════════╗
║                          FASE 3: POLISH + MOBILE                            ║
║                         (2 weeks | 61-76h | 10 stories)                     ║
╚══════════════════════════════════════════════════════════════════════════════╝

[P1] STY-076: CRM Data Model ⚠️ CRITICAL
     ├─→ [P1] STY-077: Partnerships Tab
     │   ├─→ [P1] STY-078: Receivables Manager
     │   └─→ [P2] STY-081: Dashboard Overview
     └─→ [P1] STY-079: Renewal Dates

[P1] STY-077 (from above)
     └─→ [P1] STY-080: Payment History

[P0] STY-082: PWA Setup ⚠️ CRITICAL - MOBILE
     └─→ [P0] STY-083: Offline Sync ⚠️ CRITICAL - MOBILE
         ├─→ [P1] STY-084: Push Notifications
         └─→ [P1] STY-085: Mobile Testing
             └─→ (ALL previous stories)
```

---

## DETAILED DEPENDENCY TABLE

### FASE 1: Blocking Relationships

| Story | Blocks | Blocked By | P | Notes |
|-------|--------|-----------|---|-------|
| STY-051 | STY-052 | - | P0 | **CRITICAL:** Start first, creates SidebarContext |
| STY-052 | STY-053, 054, 055, 056 | STY-051 | P0 | **CRITICAL:** Layout foundation for all sidebar sections |
| STY-053 | STY-057 | STY-052 | P0 | Depends on expandable section pattern |
| STY-054 | - | STY-052 | P0 | Independent after layout ready |
| STY-055 | - | STY-052 | P1 | Independent after layout ready |
| STY-056 | - | STY-052 | P1 | Independent after layout ready |
| STY-057 | - | STY-053 | P2 | Analytics for budget section only |
| STY-058 | STY-059, 060, 061 | - | P0 | **CRITICAL:** Card invoice service foundation |
| STY-059 | STY-060, 062 | STY-058 | P0 | **CRITICAL:** Context must exist for components |
| STY-060 | STY-062 | STY-059 | P0 | **CRITICAL:** Displays invoices from context |
| STY-061 | STY-062 | STY-059 | P0 | **CRITICAL:** Visual of card, uses invoice data |
| STY-062 | - | STY-060, STY-061 | P1 | Syncs invoice installments as transactions |
| STY-063 | STY-064, STY-065, STY-074 | - | P0 | **CRITICAL:** Investment data model foundation |
| STY-064 | STY-065 | STY-063 | P0 | **CRITICAL:** Portfolio display uses model |
| STY-065 | - | STY-064 | P1 | Dashboard widget, independent after display ready |

### FASE 2: Blocking Relationships

| Story | Blocks | Blocked By | P | Notes |
|-------|--------|-----------|---|-------|
| STY-066 | STY-067, 068 | - | P0 | **CRITICAL:** Retirement context foundation |
| STY-067 | STY-068, 069 | STY-066 | P0 | **CRITICAL:** Chart visualization foundation |
| STY-068 | STY-069, 070 | STY-067 | P0 | **CRITICAL:** Goal setting enables scenarios |
| STY-069 | - | STY-068, STY-063 | P1 | Comparison uses investment and retirement data |
| STY-070 | - | STY-068 | P2 | Milestone alerts based on goals |
| STY-071 | STY-072, 073, STY-074 | - | P1 | **CRITICAL:** Asset data model foundation |
| STY-072 | STY-073 | STY-071 | P1 | Comparison UI uses asset data |
| STY-073 | - | STY-072 | P1 | Asset form, independent after model ready |
| STY-074 | STY-075 | STY-063, STY-071 | P1 | **COMBINED:** Needs investments AND assets data |
| STY-075 | - | STY-074 | P1 | Evolution chart uses listing data |

### FASE 3: Blocking Relationships

| Story | Blocks | Blocked By | P | Notes |
|-------|--------|-----------|---|-------|
| STY-076 | STY-077, 079 | - | P1 | **CRITICAL:** CRM data model foundation |
| STY-077 | STY-078, 081 | STY-076 | P1 | Partnerships tab uses context |
| STY-078 | - | STY-077 | P1 | Receivables management, independent after tab ready |
| STY-079 | - | STY-076 | P1 | Renewal dates use partnership context |
| STY-080 | - | STY-077 | P1 | Payment history for partners |
| STY-081 | - | STY-076, STY-079 | P2 | Dashboard uses all CRM data |
| STY-082 | STY-083, 084, 085 | - | P0 | **CRITICAL MOBILE:** PWA setup foundation |
| STY-083 | STY-084, 085 | STY-082 | P0 | **CRITICAL MOBILE:** Offline sync uses service worker |
| STY-084 | STY-085 | STY-082 | P1 | Push notifications require PWA |
| STY-085 | - | STY-082, STY-083, STY-084, **ALL FASE 1-2** | P1 | **CRITICAL TEST:** Full regression test |

---

## CRITICAL PATH ANALYSIS

### Critical Path 1: Sidebar Track
```
Duration: ~20h critical time
Parallelizable: 28h additional work

STY-051 (6h) [MUST START DAY 1]
  ↓ (must complete before)
STY-052 (8h) [MUST START DAY 1 + 6h]
  ↓ (before)
STY-053 (7h) + STY-054 (5h) + STY-055 (6h) + STY-056 (5h) [PARALLEL after STY-052]
  ↓ (after all)
STY-057 (4h) [optional, P2]

CRITICAL TIME: 6h + 8h + 7h = 21h (serial)
WALL-CLOCK: ~1 week with parallelization
```

**Start:** Day 1, 9:00 AM
**Finish:** Week 1, Friday

### Critical Path 2: Card Invoice Track
```
Duration: ~25h critical time
Parallelizable: 20h additional work

STY-058 (8h) [MUST START DAY 1]
  ↓ (must complete before)
STY-059 (6h) [MUST START DAY 1 + 8h]
  ↓ (before)
STY-060 (7h) + STY-061 (8h) [PARALLEL after STY-059]
  ↓ (after both)
STY-062 (6h) [AFTER STY-060 + STY-061]

CRITICAL TIME: 8h + 6h + 7h + 6h = 27h (serial)
WALL-CLOCK: ~1.3 weeks with parallelization

Note: STY-060 and STY-061 CAN run in parallel after STY-059
```

**Start:** Day 1, 9:00 AM
**Finish:** Week 1.5, Wednesday

### Critical Path 3: Investments Track
```
Duration: ~13h critical time
Parallelizable: 5h additional work

STY-063 (6h) [MUST START DAY 1 or DAY 5]
  ↓ (must complete before)
STY-064 (7h) [MUST START AFTER STY-063]
  ↓ (optional after)
STY-065 (5h) [P1, can be parallel if resources]

CRITICAL TIME: 6h + 7h = 13h (serial)
WALL-CLOCK: ~4-5 days

Note: Can start after STY-051/058 completed (less resource contention)
```

**Start:** Day 3-4
**Finish:** Week 1.5

### Overall FASE 1 Critical Path
```
Parallel Track 1 (Sidebar):   STY-051 → STY-052 → [STY-053/054/055/056]
Parallel Track 2 (Invoices):  STY-058 → STY-059 → [STY-060/STY-061] → STY-062
Parallel Track 3 (Invest):    STY-063 → STY-064 → STY-065

All tracks can run in parallel with sufficient resources
Longest serial path: 27h (Invoices)
Wall-clock time: ~10-12 days (2 weeks with QA integrated)
```

---

## RESOURCE ALLOCATION STRATEGY

### Parallel Execution Matrix

#### Week 1 (Dev: 40h)
```
Developer A (40h):
├─ Day 1-2: STY-051 (6h) + STY-058 (8h) = 14h ⚠️ Start both critical paths
├─ Day 3-4: STY-052 (8h) ✓ + STY-059 (6h) = 14h
├─ Day 5: STY-063 (6h) ✓ + STY-060 (2h partial) = 8h
├─ (remaining for code review, meetings)

QA (20h):
├─ Day 1-2: Setup testing framework, test plans
├─ Day 3-5: Daily testing of STY-051, STY-052, STY-058, STY-059
├─ Regression: Verify no regressions
```

#### Week 2 (Dev: 40h)
```
Developer A (40h):
├─ Day 1-2: STY-060 (7h) + STY-061 (8h) = 15h (parallel)
├─ Day 3: STY-064 (7h) = 7h
├─ Day 4-5: STY-053/054 (12h) + STY-062 (6h) = 18h
├─ (remaining for fixes, integration)

QA (20h):
├─ Day 1-2: Test STY-060, STY-061 integration
├─ Day 3-5: Test STY-064, STY-062, STY-053/054
├─ Regression: Full FASE 1 testing
```

#### Week 3 Continuation (Dev: 15h - wrap-up)
```
Developer A (15h):
├─ STY-055/056/065 completion (15h)
├─ Bug fixes from QA
├─ Integration verification

QA (10h):
├─ Final STY-055/056/065 testing
├─ Full regression pass
├─ Lighthouse score validation
```

### Optimal Resource Utilization
- **Single Dev:** Can parallelize between typing/reading and coding
- **Dev + QA Rhythm:** QA tests while Dev moves to next story
- **No Dev Idle Time:** Always have 2-3 stories queued and ready
- **Risk:** If Dev gets blocked, QA catches up on testing

---

## BLOCKING RISK MATRIX

### High Risk Blocks (Can delay entire roadmap)
| Block | Risk | Mitigation | Impact |
|-------|------|-----------|--------|
| STY-051 Not Done | HIGH | Start immediately Day 1 | Blocks 6 stories |
| STY-058 Service Fails | HIGH | Create mock API early | Blocks invoice features |
| STY-066 Calculations Wrong | HIGH | Spike calculations early FASE 2 | Blocks retirement |
| STY-082 PWA Complex | HIGH | Prototype PWA in FASE 1 | Blocks FASE 3 |

### Medium Risk Blocks
| Block | Risk | Mitigation | Impact |
|-------|------|-----------|--------|
| STY-052 Layout Issues | MEDIUM | Component library consistency | Blocks 4 stories |
| STY-063 Data Model Gaps | MEDIUM | Validate model with stakeholders | Blocks investments + patrimony |
| STY-076 CRM Context Design | MEDIUM | Design upfront in FASE 2 | Blocks CRM features |

### Low Risk Blocks
| Block | Risk | Mitigation | Impact |
|-------|------|-----------|--------|
| P1/P2 Stories | LOW | Priority can be adjusted | Don't block critical path |
| Analytics (STY-057) | LOW | Can be deferred | Non-critical feature |

---

## DEPENDENCY OPTIMIZATION RECOMMENDATIONS

### Optimization 1: Parallel Context Creation
**What:** Create STY-051, STY-058, STY-063, STY-066, STY-076 in parallel
**Benefit:** Reduce serial dependency chain from 27h to ~13h critical path
**Risk:** Multiple contexts might conflict - need architect review
**Recommendation:** ✅ DO IT - separate contexts, low risk

### Optimization 2: Mock Data for Testing
**What:** Create mock card invoice API while STY-058 in progress
**Benefit:** STY-060/061 can be tested in parallel before STY-058 complete
**Risk:** Mock might not match real API contract
**Recommendation:** ✅ DO IT - mock data is standard practice

### Optimization 3: Early QA Integration
**What:** QA starts testing STY-051 on Day 2, before STY-052 complete
**Benefit:** Find bugs early, don't wait for complete features
**Risk:** Incomplete features, QA might need to retest
**Recommendation:** ✅ DO IT - standard practice, QA can verify requirements

### Optimization 4: FASE 2 Early Start
**What:** Start STY-066 calculations work in parallel with FASE 1 end
**Benefit:** Reduce FASE 2 critical path from 32h to ~24h
**Risk:** FASE 1 team context switch
**Recommendation:** ⚠️ CONDITIONAL - Only if 2+ devs available

### Optimization 5: Defer P2 Stories
**What:** Move STY-057, STY-070, STY-081 to after each phase
**Benefit:** Reduce FASE hours by 12h (4+5+5h)
**Risk:** Features not in first release
**Recommendation:** ✅ CONSIDER - If timeline is tight, P2s are deferrable

---

## GATE CRITERIA FOR MOVING BETWEEN PHASES

### GATE 1: Finish FASE 1, Start FASE 2
**Requirements:**
- [ ] All STY-051 to STY-065 stories "Done Done"
- [ ] All P0 blockers verified working
- [ ] Lighthouse score >= 80
- [ ] Zero critical bugs
- [ ] UAT sign-off: Client accepts Sidebar + Card features
- [ ] Code review: All PRs reviewed and merged

**Gate Decision:** Release FASE 1 branch to staging for UAT

### GATE 2: Finish FASE 2, Start FASE 3
**Requirements:**
- [ ] All STY-066 to STY-075 stories "Done Done"
- [ ] All P0 blockers verified working
- [ ] Lighthouse score >= 80
- [ ] Zero critical bugs
- [ ] Integration testing complete (Retirement + Assets + Patrimony)
- [ ] UAT sign-off: Client accepts new features
- [ ] Performance testing: No degradation from FASE 1

**Gate Decision:** Release FASE 1+2 branch to staging

### GATE 3: Finish FASE 3, Release to Production
**Requirements:**
- [ ] All STY-076 to STY-085 stories "Done Done"
- [ ] All P0 + P1 stories verified working
- [ ] Lighthouse score >= 85 (mobile PWA requirement)
- [ ] Zero critical bugs
- [ ] Mobile testing complete (iOS + Android)
- [ ] Offline mode tested thoroughly
- [ ] Full UAT sign-off: Client approves full release
- [ ] Deployment checklist complete

**Gate Decision:** Release to production

---

## WHEN STORIES GET BLOCKED

### Scenario 1: STY-051 Delayed (Sidebar Context)
**Impact:** STY-052, 053, 054, 055, 056 all blocked
**Mitigation:**
1. Escalate immediately (Day 1, if not done by EOD)
2. Architect pair-programs with Dev
3. Simplify STY-051 scope (defer localStorage initially)
4. Move QA to other prep work (test framework, documentation)

**Recovery Time:** +2-3 days max

### Scenario 2: STY-058 API Integration Fails (Card Invoices)
**Impact:** STY-059, 060, 061, 062 blocked
**Mitigation:**
1. Switch to mock API immediately (should exist)
2. Create issue for real API integration post-release
3. Proceed with STY-059/060/061 using mock data
4. Real data sync can be STY-062 or later sprint

**Recovery Time:** +0-1 days (switch to mock)

### Scenario 3: STY-066 Retirement Calculations Complex (FASE 2)
**Impact:** STY-067, 068, 069, 070 blocked
**Mitigation:**
1. Spike on calculations early (use spreadsheet first)
2. Create calculation service separately from context
3. Hire domain expert consultation if needed
4. Proceed with STY-067 UI using stub calculations, refine later

**Recovery Time:** +2-3 days

### Scenario 4: STY-082 PWA Setup Issues (FASE 3)
**Impact:** STY-083, 084, 085 blocked
**Mitigation:**
1. Use off-the-shelf PWA solution (Vite PWA plugin)
2. Don't reinvent service worker, use Workbox
3. Proceed with offline data model (STY-083) independently
4. Integration can happen after STY-082 basic setup

**Recovery Time:** +1-2 days

---

## RECOMMENDATION: START SEQUENCE

### Day 1 - Morning (Team Kickoff)
1. Architecture review of critical contexts (STY-051, STY-058, STY-063)
2. Assign Dev to STY-051 + STY-058 (both can be started in parallel)
3. Assign QA to setup testing framework + test plans
4. Assign Architect to code review setup

### Day 1 - Afternoon (Dev Starts)
1. Dev: STY-051 SidebarContext (6h target)
2. Dev: STY-058 Card Invoice Service (8h target)
3. Both can run in parallel, no dependency

### Day 2 (Continuing)
1. Dev: Complete STY-051 + STY-058
2. QA: Test STY-051 interface, verify context working
3. Architect: Review PR for both

### Day 3 (Moving Forward)
1. Dev: STY-052 Sidebar Layout (blocks 4 stories)
2. Dev: STY-059 Invoice Context (blocks 2 stories)
3. Dev: STY-063 Investment Model (independent track)
4. QA: Continue testing completed stories

### Day 5 (Week 1 Complete)
1. Dev: All critical paths should have started
2. QA: First round of regression testing
3. Architect: Initial performance check

---

## DEPENDENCY DEBT TRACKING

### Technical Debt Created (to be paid off)
- Mock data for card invoices (STY-058) - **Pay off:** When real API ready
- Stub calculations for retirement (STY-066) - **Pay off:** When finance expert validates
- Simplified offline sync (STY-083) - **Pay off:** When conflict resolution needed

### Technical Debt NOT Created
- No duplication (reusing context patterns)
- No API contracts broken (feature flags used)
- No database schema changes (using localStorage first)

---

## SUMMARY

**Key Insights:**
1. **Critical Path:** 27h serial (invoice track) = ~1.3 weeks wall-clock
2. **Parallelization:** Up to 3 independent tracks (Sidebar, Invoices, Investments)
3. **Resource:** 1 Dev can handle all with ~70% utilization
4. **Bottlenecks:** STY-051, STY-058, STY-066, STY-082 (4 critical blockers)
5. **Risk:** API integration (STY-058), Calculation complexity (STY-066)
6. **Optimization:** All contexts can be created in parallel, defer P2 stories

**Recommendation:** Proceed with timeline as planned. No structural impediments detected.

---

*Document prepared by: Morgan - Product Manager*
*Date: February 2026*
*Status: DEPENDENCY ANALYSIS COMPLETE*
