# ROADMAP TIMELINE & GANTT CHART
## 35 Stories | 7 Weeks | 200-260 Hours

---

## EXECUTIVE SUMMARY

```
Start Date:        Monday, [Week 1]
End Date:          Friday, [Week 7]
Total Duration:    7 weeks (35 working days)
Team Size:         3 FTE (1 Dev, 1 QA, 0.5 Architect)
Total Effort:      208-251 hours
Delivery Rate:     30-36 hours/week
Go-Live Date:      End of Week 7, Friday
```

---

## FASE 1: FOUNDATION (WEEKS 1-2)

### Week 1: Sidebar + Card Invoice Start

#### Monday
```
Time    Dev                          QA                          Arch
─────────────────────────────────────────────────────────────────────
09:00   [KICK-OFF] All team          [KICK-OFF] All team         [KICK-OFF]
        ├─ STY-051 Start (6h)        ├─ Setup test framework     ├─ Review
        ├─ STY-058 Start (8h)        ├─ Create test plans        │  context
        ├─ Both parallel             ├─ Prepare test env         │  design
        │                            │                           │
        │                            ├─ Create QA checklist      │
        │                            │ for STY-051/058            │
        │                            │
14:00   Dev: Continue STY-051        QA: Standby/Prepare         Arch: Ready
        Dev: Setup for STY-058       (testing starts Wed)        for review
```
**Deliverables:** STY-051 context started, STY-058 API structure started
**Blockers:** None (day 1)

#### Tuesday
```
Time    Dev                          QA                          Arch
─────────────────────────────────────────────────────────────────────
09:00   [STANDUP] 15 min             [STANDUP] 15 min            [STANDUP]
        ├─ STY-051 Progress: 70%     ├─ Test framework ready     ├─ Ready
        │ (5.2h completed)           ├─ Waiting for STY-051      │ to review
        ├─ STY-058 Progress: 60%     │ to test                   │
        │ (4.8h completed)           ├─ Prepare mock API         │
        │                            │ for fallback              │
        │
14:00   Dev: Continue both           QA: Setup mock data         Arch: Code
        (target: complete by EOD)    (for testing prep)          review ready
```
**Deliverables:** STY-051 and STY-058 both targetted for completion
**Blockers:** None

#### Wednesday
```
Time    Dev                          QA                          Arch
─────────────────────────────────────────────────────────────────────
09:00   [STANDUP]                    [STANDUP]                   [STANDUP]
        ├─ STY-051: DONE ✅ (6h)     ├─ STY-051: Testing ✅      ├─ Review
        │ PR ready for review        ├─ Basic functionality      │ STY-051
        │                            │ verified                  │ PR
        ├─ STY-058: 95% (7.6h)       ├─ Create test cases        │
        │ Final touches              │                           │ Review
        │                            ├─ Verify context           │ STY-058
        ├─ STY-052 Start (8h)        │ localStorage              │ PRs
        │ Sidebar Layout             │
        │
14:00   Dev: STY-052 progress        QA: Full STY-051 testing    Arch: Approved
        Continue STY-058 finish      Prepare STY-058 tests       PRs merged
```
**Deliverables:** STY-051 merged ✅, STY-058 nearly complete, STY-052 started
**Blockers:** None

#### Thursday
```
Time    Dev                          QA                          Arch
─────────────────────────────────────────────────────────────────────
09:00   [STANDUP]                    [STANDUP]                   [STANDUP]
        ├─ STY-052: 70% (5.6h)       ├─ STY-058: Testing         ├─ Review
        │ Layout framework done      ├─ Mock API working         │ remaining
        │                            ├─ Context integration      │ PRs
        ├─ STY-058: DONE ✅ (8h)     │
        │ PR ready for review        ├─ QA Test cases DONE ✅    │
        │                            │
        ├─ STY-063 Start (6h)        ├─ Begin regression         │
        │ Investment Model           │ testing (STY-051/058)     │
        │ (parallel track)           │
        │
14:00   Dev: STY-052 continue        QA: Full STY-058 testing    Arch: Merged
        STY-063 progress            Prepare STY-052 tests       Ready for
                                                                next PRs
```
**Deliverables:** STY-058 merged ✅, STY-052 at 70%, STY-063 started
**Blockers:** None

#### Friday
```
Time    Dev                          QA                          Arch
─────────────────────────────────────────────────────────────────────
09:00   [STANDUP]                    [STANDUP]                   [STANDUP]
        ├─ STY-052: 95% (7.6h)       ├─ STY-052: Testing         ├─ Code
        │ Ready for review           ├─ Regression pass 1        │ review
        │                            │ (STY-051/058) ✅          │
        ├─ STY-063: 40% (2.4h)       ├─ Test cases DONE ✅       │
        │ Data model defined         │
        │                            ├─ Prepare for next         │
        ├─ STY-059 Planned           │ story (STY-059)           │
        │                            │
14:00   Dev: STY-052 finalize        QA: Final Friday checks     Arch: Merged
        Continue STY-063            STY-052 ready for merge     STY-052

[WEEK 1 SUMMARY]
✅ STY-051: COMPLETE (6h)
✅ STY-058: COMPLETE (8h)
🔄 STY-052: IN-PROGRESS (80% - 6.4h done, 1.6h remaining)
🔄 STY-063: IN-PROGRESS (40% - 2.4h done, 3.6h remaining)
⏳ STY-059: READY TO START

TOTAL WEEK 1 EFFORT: ~26h dev, ~15h QA, ~5h Arch
CUMULATIVE: 26h / 208h total (12.5%)
```

---

### Week 2: Complete Sidebar + Invoice Core

#### Monday-Wednesday (Parallel Tracks)

```
TRACK A: Sidebar Layout (STY-052 finish)
Monday:   STY-052 COMPLETE ✅ (final 1.6h + review)
          └─ Unblocks: STY-053, 054, 055, 056

TRACK B: Card Invoice Context (STY-059)
Monday:   STY-059 START (6h target)
Tuesday:  STY-059 COMPLETE ✅ (6h)
          └─ Unblocks: STY-060, 061

TRACK C: Invoice Display (STY-060 + STY-061 in parallel)
Wednesday:  STY-060 START (7h) + STY-061 START (8h)
            └─ Both can run in parallel
```

#### Thursday-Friday (Sidebar Sections + Invoice Finalize)

```
Dev Allocation:
├─ STY-053: Budget Section (7h) - Thu
├─ STY-054: Accounts Section (5h) - Thu
├─ STY-060 + 061: Finish (15h remaining) - Thu/Fri
│
Total Week 2 Dev: 40h (both tracks parallel)

QA Testing Timeline:
├─ STY-052: Full testing ✅
├─ STY-059: Integration testing ✅
├─ STY-060/061: Daily integration tests
├─ STY-053/054: Prepare test cases
│
Total Week 2 QA: 20h
```

---

## FASE 2: FEATURES (WEEKS 3-5)

### Week 3: Retirement Foundation + Continue Sidebar

```
CRITICAL PATH TRACK:
STY-066 (8h) - Retirement Context [P0 BLOCKER]
└─→ STY-067 (10h) - DashPlan Chart [P0 BLOCKER]
    └─→ STY-068 (6h) - Goal Setting [P0 BLOCKER]

SIDEBAR COMPLETION TRACK:
STY-055 (6h) - Transactions Section
STY-056 (5h) - Mobile Drawer
STY-065 (5h) - Investment Metrics Widget

Dev Allocation (40h/week):
├─ STY-066 START (8h) - Mon/Tue
├─ STY-067 START (10h) - Wed/Thu/Fri (5h + overflow to week 4)
├─ STY-055 START (6h) - Tue/Wed
├─ STY-056 START (5h) - Thu/Fri

Expected Completion:
✅ STY-066: 100% by Wed EOD
⏳ STY-067: 50% by Fri EOD (continues Week 4)
✅ STY-055: 100% by Wed EOD
✅ STY-056: 100% by Fri EOD
⏳ STY-065: Ready to start

QA Focus (20h):
├─ STY-066: Context testing
├─ STY-055/056: Regression testing sidebar
├─ Test prep for STY-067 (complex chart)
```

**Status End of Week 3:**
- ✅ STY-051 to STY-065: 18 stories, 16 complete, 2 in-progress
- Critical Path: On schedule
- Cumulative Effort: ~106h / 208h (51%)

---

### Week 4: Retirement Charts + Asset Foundation

```
CRITICAL PATH - RETIREMENT:
STY-067 Completion (5h remaining) - Mon/Tue
STY-068: Goal Setting (6h) - Tue/Wed/Thu
└─ Unblocks: STY-069, STY-070

ASSET TRACK:
STY-071 (6h) - Asset Data Model [P0 BLOCKER] - Thu/Fri
└─ Unblocks: STY-072, STY-073

INVESTMENT/PATRIMONY BRIDGE:
STY-074 (6h) - Patrimony Listing (requires STY-063 + STY-071) - Fri+

Dev Allocation (40h/week):
├─ STY-067: Completion + testing (5h)
├─ STY-068: Goal Setting Form (6h)
├─ STY-065: Investment Widget finish (5h)
├─ STY-069: Scenario Comparison START (7h) - Thu/Fri
├─ STY-071: Asset Model START (6h) - Fri

Parallel QA (20h):
├─ STY-067: Full chart testing
├─ STY-068: Form validation testing
├─ STY-069: Prepare comparison tests
├─ STY-065: Widget integration
```

**Status End of Week 4:**
- ✅ STY-051 to STY-070: 20 stories, 18 complete, 2 in-progress
- Critical Path: On schedule
- Cumulative Effort: ~146h / 208h (70%)

---

### Week 5: Asset Features + Patrimony Enhancement

```
ASSET TRACK COMPLETION:
STY-071: Asset Model completion (6h) - Mon
STY-072: Comparison UI (8h) - Mon/Tue/Wed
STY-073: Asset Form (5h) - Thu/Fri

PATRIMONY UNIFIED VIEW:
STY-074: Enhanced Listing (6h) - Wed/Thu (cross-depends STY-063 + STY-071)
STY-075: Evolution Chart (5h) - Thu/Fri

CLEANUP & TESTING:
STY-069: Scenario Comparison completion (2h)
STY-070: Alerts & Milestones (5h) - P2, if time

Dev Allocation (40h/week):
├─ STY-071: Completion (6h)
├─ STY-072: Full build (8h)
├─ STY-073: Form complete (5h)
├─ STY-074: Start listing (6h)
├─ STY-075: Start charts (5h)
├─ STY-069: Final touches (2h)

QA Focus (20h):
├─ Full FASE 2 regression (all stories)
├─ Performance testing (multiple portfolios)
├─ Data validation (retirement calculations)
├─ Cross-feature integration
```

**Status End of Week 5 (FASE 2 Complete):**
- ✅ STY-051 to STY-075: 25 stories complete
- Critical Path: On schedule
- Cumulative Effort: ~186h / 208h (89%)
- Lighthouse Score: Target 80+

---

## FASE 3: POLISH + MOBILE (WEEKS 6-7)

### Week 6: CRM Foundation + PWA Setup

```
CRM TRACK FOUNDATION:
STY-076 (5h) - CRM Data Model [P1 BLOCKER] - Mon
└─ Unblocks: STY-077, STY-079, STY-081

STY-077 (7h) - Partnerships Tab - Tue/Wed
STY-078 (6h) - Receivables Manager - Thu

MOBILE PWA TRACK FOUNDATION:
STY-082 (7h) - PWA Setup & Service Worker [P0 BLOCKER] - Mon/Tue
└─ Unblocks: STY-083, STY-084, STY-085

Dev Allocation (40h/week):
├─ STY-076: CRM context (5h) - Mon
├─ STY-082: PWA setup (7h) - Mon/Tue/Wed
├─ STY-077: CRM tab UI (7h) - Wed/Thu
├─ STY-078: Receivables (6h) - Thu/Fri
├─ STY-079: Renewal dates START (2h) - Fri

Parallel QA (20h):
├─ STY-076: Context validation
├─ STY-082: PWA testing (install, offline basic)
├─ STY-077: Tab functionality
├─ STY-078: Receivables workflow
├─ Prepare full mobile testing suite
```

**Status Mid-Week 6:**
- ✅ STY-051 to STY-078: 28 stories
- Critical Path: On schedule
- Mobile readiness: PWA framework ready
- Cumulative Effort: ~221h / 208h (106% - on track for 250h total)

---

### Week 7: CRM Complete + Mobile Complete + Release Prep

```
CRM COMPLETION:
STY-079 (6h) - Renewal Dates completion - Mon
STY-080 (7h) - Payment History - Mon/Tue
STY-081 (5h) - CRM Dashboard - Wed

MOBILE PWA COMPLETION:
STY-083 (8h) - Offline Sync - Wed/Thu
STY-084 (6h) - Push Notifications - Thu
STY-085 (8h) - Mobile Testing - Thu/Fri

RELEASE PREP:
├─ Final bug fixes (2h)
├─ Performance optimization (3h)
├─ Documentation updates (2h)
├─ Deployment checklist (2h)

Dev Allocation (40h/week):
├─ STY-079: Renewal dates (6h)
├─ STY-080: Payment history (7h)
├─ STY-081: Dashboard (5h)
├─ STY-083: Offline sync (8h)
├─ STY-084: Push notifs (6h)
├─ STY-085: Mobile test oversight (2h)
├─ Final fixes & optimization (3h)

QA Focus (25h) - FULL REGRESSION:
├─ STY-079/080/081: CRM testing
├─ STY-083/084/085: Mobile comprehensive testing
├─ Full regression: All 35 stories
├─ Lighthouse scoring (target 85+ mobile)
├─ UAT sign-off preparation
```

**Status End of Week 7 (PROJECT COMPLETE):**
- ✅ STY-051 to STY-085: 35 stories COMPLETE
- Critical Path: On schedule ✅
- Cumulative Effort: ~250h / 208h target (100%)
- Lighthouse Score: 85+ (mobile)
- Ready for Production: YES

---

## DETAILED DAY-BY-DAY TIMELINE

### WEEK 1

```
MONDAY, Week 1
09:00-10:00   Kick-off meeting (all team)
              ├─ Review roadmap
              ├─ Define Definition of Done
              ├─ Discuss blockers & escalation
              └─ Confirm start stories

10:00-17:00   Dev: STY-051 (6h target)
              QA: Setup framework, docs (4h)
              Arch: Design review, feedback

TUESDAY, Week 1
09:00-09:15   Daily standup
10:00-17:00   Dev: STY-051 (complete 6h) + STY-058 start (4h)
              QA: Test STY-051 prep, setup mock data (4h)
              Arch: Code review ready, documentation

WEDNESDAY, Week 1
09:00-09:15   Daily standup
09:30-17:00   Dev: STY-058 (6h more, total 10h) + STY-052 start (2h)
              QA: STY-051 full testing ✅, STY-058 prep (6h)
              Arch: PR reviews, merge STY-051 ✅

[... continues for remaining days ...]
```

---

## WEEKLY BURN-DOWN CHART

```
Week 1: 26h complete (12.5% done)
Week 2: 52h complete (25% done)
Week 3: 86h complete (41% done)
Week 4: 126h complete (60% done)
Week 5: 166h complete (80% done)
Week 6: 206h complete (99% done)
Week 7: 250h complete (100% done) ✅

Expected Trajectory:
│
250h│                                          ●  COMPLETE
    │                                        ╱
200h│                              ●       ╱
    │                            ╱       ╱
150h│                      ●   ╱       ╱
    │                    ╱   ╱       ╱
100h│              ●   ╱   ╱       ╱
    │            ╱   ╱   ╱       ╱
 50h│      ●   ╱   ╱   ╱       ╱
    │    ╱   ╱   ╱   ╱
  0h│● ─────────────────────────
    └─────────────────────────────
      W1  W2  W3  W4  W5  W6  W7
```

---

## MILESTONE GATES & RELEASES

### GATE 1: End of Week 2 (FASE 1 Complete)
**Date:** Friday, Week 2
**Requirements:**
- ✅ STY-051 to STY-065: 15 stories, all merged
- ✅ Lighthouse: 80+
- ✅ Zero critical bugs
- ✅ Client UAT passed on Sidebar + Card features
- ✅ Staging deployment successful

**Decision:** Release FASE 1 to staging OR continue to FASE 2

### GATE 2: End of Week 5 (FASE 1+2 Complete)
**Date:** Friday, Week 5
**Requirements:**
- ✅ STY-051 to STY-075: 25 stories, all merged
- ✅ Lighthouse: 80+
- ✅ Zero critical bugs
- ✅ Client UAT passed on Retirement + Assets + Patrimony
- ✅ Integration testing complete

**Decision:** Merge to main, prepare for FASE 3

### GATE 3: End of Week 7 (COMPLETE PROJECT)
**Date:** Friday, Week 7
**Requirements:**
- ✅ STY-051 to STY-085: 35 stories, all merged
- ✅ Lighthouse: 85+ (mobile)
- ✅ Zero critical bugs
- ✅ 100% UAT passed
- ✅ Mobile testing complete
- ✅ Release notes prepared

**Decision:** Go-live to production

---

## TEAM UTILIZATION & AVAILABILITY

### Dev Availability (40h/week typical)
```
Mon: 8h
Tue: 8h
Wed: 8h
Thu: 8h
Fri: 8h
├─ Internal: Standups (0.25h/day), reviews (0.5-1h/day)
├─ Development: 6-7h/day actual coding
├─ Buffer: 10% slack (meeting, context switches)
```

### QA Availability (20h/week typical)
```
Mon: 4h
Tue: 4h
Wed: 4h
Thu: 4h
Fri: 4h
├─ Testing: 3h/day actual testing
├─ Prep: 0.5h/day test case creation
├─ Reporting: 0.5h/day bug triage
```

### Architect Availability (2h/day typical)
```
Mon-Thu: 2h/day (code review, design decisions)
Fri: 1h (weekly recap)
├─ Code reviews: 1-1.5h/day
├─ Architecture decisions: 0.5h/day
├─ Mentoring/Blocker resolution: 0.5h/day
```

---

## HOLIDAY & VACATION CONTINGENCY

### If Dev takes vacation (1 week)
- **Impact:** Delay entire roadmap by ~7-10 days
- **Mitigation:** Frontload FASE 1 P0 stories before vacation
- **Recommendation:** No major vacation during roadmap, or backfill with contractor

### If QA unavailable (1 week)
- **Impact:** Bugs accumulate, UAT delayed by ~5-7 days
- **Mitigation:** Defer non-critical testing, focus on critical paths
- **Recommendation:** QA participation non-negotiable for GATE ceremonies

### If team has interruptions (e.g., production incidents)
- **Absorption:** 1-2 hours/week typical (5-10% of time)
- **Contingency:** Already built into 15% estimation buffer
- **Escalation:** If >3 hours/week, extend timeline or reduce scope

---

## RISK TIMELINE ADJUSTMENTS

### Scenario A: API Integration Fails (Low Probability, High Impact)
**If at:** Day 5 (Thursday, Week 1)
**Delay:** Switch to mock, no timeline impact
**New End Date:** Same

**If at:** Day 20 (Week 2, day 4)
**Delay:** Cannot recover, push STY-058-062 to Week 3
**New End Date:** +1 week (move to Week 8)

### Scenario B: Retirement Calculations Complex
**If discovered:** Week 3, day 1
**Delay:** Spike 2 days, move STY-066-070 forward
**New End Date:** +2 days (impacts Week 4)

### Scenario C: Mobile PWA Underestimated
**If discovered:** Week 6, day 1
**Delay:** Use Vite PWA plugin, reduce complexity
**New End Date:** +3 days max (impacts final deliverable)

### Scenario D: Critical Bug Found in Testing
**If at:** Week 5 (middle of FASE 2)
**Decision:** Branch off hotfix, continue next stories
**Impact:** Minimal if caught early, QA delays by 1-2 days

---

## SUCCESS METRICS PER WEEK

### Week 1 Success
- [ ] STY-051 merged and working
- [ ] STY-058 90% complete
- [ ] QA framework ready
- [ ] No blockers to Week 2

### Week 2 Success
- [ ] FASE 1 complete: STY-051 to STY-065 all merged
- [ ] Lighthouse score 80+
- [ ] Zero critical bugs
- [ ] Client UAT passed

### Week 3 Success
- [ ] STY-066 to STY-068 complete (retirement foundation)
- [ ] STY-055/056/065 complete (sidebar finish)
- [ ] On track for Week 5 GATE

### Week 4 Success
- [ ] Retirement features 80% complete
- [ ] Asset foundation ready
- [ ] Patrimony 50% ready
- [ ] Performance acceptable

### Week 5 Success
- [ ] FASE 1+2 complete: STY-051 to STY-075 all merged
- [ ] Lighthouse score 80+
- [ ] Zero critical bugs
- [ ] Ready for FASE 3

### Week 6 Success
- [ ] CRM foundation working
- [ ] PWA installable and offline mode basic
- [ ] On track for final week

### Week 7 Success
- [ ] All 35 stories complete
- [ ] Lighthouse 85+ (mobile)
- [ ] Zero critical bugs
- [ ] Client UAT 100% passed
- [ ] Ready for production go-live

---

## DAILY STANDUP TEMPLATE

```
DAILY STANDUP (15 minutes)
09:00-09:15 (all team)

Each person reports:
1. What I completed yesterday
   └─ Stories: X, Y, Z (with hours)
   └─ Blockers: None / [describe]

2. What I'm working on today
   └─ Stories: A, B (with hours planned)
   └─ Risk: [if any]

3. Blockers / Help needed
   └─ Blocker 1: [describe, mitigation]
   └─ Blocker 2: [describe, mitigation]

Example (Dev):
├─ Yesterday: Completed STY-051 (6h) ✅, merged after review
├─ Today: STY-058 (6h planned), STY-052 prep
├─ Blockers: Waiting for Arch review of STY-051 PR → RESOLVED ✅

Example (QA):
├─ Yesterday: Setup framework, tested STY-051 ✅
├─ Today: Test STY-058, prepare cases for STY-052
├─ Blockers: Need mock data for STY-058 → Dev providing

Example (Arch):
├─ Yesterday: Reviewed STY-051, approved for merge
├─ Today: Review STY-058 PR, provide feedback on design
├─ Blockers: None
```

---

## AFTER HOURS & OVERTIME POLICY

### Standard Hours
- Dev: 40h/week (8h/day Mon-Fri)
- QA: 20h/week (4h/day Mon-Fri)
- Arch: 10h/week (2h/day Mon-Fri)

### Overtime Authorization
- If critical blocker: Max 4 extra hours/week (with compensation)
- If approaching deadline: Max 8 extra hours/week final week only
- Never: Weekends (unless critical production incident)

### Burnout Prevention
- Weekly 1-on-1 to check well-being
- No mandatory overtime after Week 5
- Vacation accrual: Team gets 2 personal days after Week 7 complete

---

## COMMUNICATION CADENCE

### Weekly Meetings
- **Monday 09:00:** Kick-off standup + roadmap review
- **Wednesday 14:00:** Mid-week sync (blockers, adjustments)
- **Friday 16:00:** Week wrap-up (velocity, next week planning)

### Bi-Weekly Meetings (Weeks 2, 4, 6)
- **Friday 15:00:** GATE ceremony (decision point)
  - Review acceptance criteria
  - Approve merge to main
  - Decide on next phase start

### One-on-Ones (Weekly, 15 min each)
- **Dev:** Friday 14:00
- **QA:** Friday 14:15
- **Arch:** Friday 14:30

### Ad-hoc Escalations
- **Blocker:** Reported immediately, escalated to Arch/PM
- **Bug:** Triaged daily, critical bugs require immediate fix
- **Design Decision:** Scheduled within 2 hours

---

## DOCUMENTATION CHECKPOINTS

### End of Week 1
- [ ] Daily standup notes captured
- [ ] STY-051/058 documentation complete
- [ ] Test cases for Week 1 documented

### End of FASE 1 (Week 2)
- [ ] FASE 1 feature summary document
- [ ] Known issues register
- [ ] Deployment guide (staging)

### End of FASE 2 (Week 5)
- [ ] FASE 2 feature summary document
- [ ] Known issues register update
- [ ] Integration testing results

### End of FASE 3 (Week 7)
- [ ] Complete roadmap retrospective
- [ ] Release notes (all 35 stories)
- [ ] Production deployment checklist
- [ ] Post-launch support documentation

---

## CONCLUSION

This timeline is designed to deliver:
- ✅ 35 user stories
- ✅ 10 approved client features
- ✅ Production-ready code
- ✅ Mobile-first (PWA)
- ✅ Zero technical debt

**In: 7 weeks, with 3-person team, ~250 hours total effort**

---

*Timeline prepared by: Morgan - Product Manager*
*Date: February 2026*
*Last Updated: [Today]*
*Status: APPROVED & READY TO EXECUTE*
