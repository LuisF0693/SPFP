# Resource Allocation & Team Structure

## Team Composition

### Recommended Setup: 3-Person Squad

```
┌─────────────────────────────────────────────────────────┐
│                    SPFP REFACTOR SQUAD                   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  1. ARCHITECT (1.0 FTE)                                │
│     └─ Design, strategic decisions, code reviews      │
│                                                          │
│  2. FULL-STACK DEVELOPER (1.0 FTE)                     │
│     └─ Implementation, context/components, testing    │
│                                                          │
│  3. QA/FRONTEND SPECIALIST (1.0 FTE)                   │
│     └─ Testing, performance, UX validation            │
│                                                          │
│  TOTAL: 3.0 FTE = 120 developer-hours/week             │
│  PROJECT DURATION: 6 weeks                              │
│  TOTAL EFFORT: ~180 developer-hours                     │
└─────────────────────────────────────────────────────────┘
```

---

## Role Descriptions & Responsibilities

### 1. Architect (Lead) - 40 hours/week

**Name Placeholder:** Senior Technical Lead

**Primary Responsibilities:**
- Design context split strategy and execution plan
- Define service layer abstractions
- Oversee component refactoring architecture
- Code review for architectural patterns
- Unblock technical decisions
- Mentor team on patterns and best practices

**Skills Required:**
- React context & state management patterns
- TypeScript advanced features (generics, utility types)
- System design and API design
- Refactoring strategies
- Performance optimization fundamentals
- 5+ years backend/full-stack experience

**Sprint-by-Sprint Allocation:**

```
Sprint 0 (40h)     Sprint 1 (36h)     Sprint 2 (40h)     Sprint 3 (32h)
├─ RLS Design (4h) ├─ Arch Review (4h) ├─ CP Execution(12h) ├─ Perf Review(4h)
├─ TS Setup (3h)   ├─ Context API(6h)  ├─ CP Mentor(8h)    ├─ DB Review(4h)
├─ Error BD(2h)    ├─ Dashboard(6h)    ├─ Srv Design(8h)   ├─ Services(8h)
├─ CI/CD (4h)      ├─ Code Review(12h) ├─ Code Review(12h) ├─ Code Rev(8h)
├─ Test Plan(4h)   ├─ Blocker Fix(8h)  └─ Blocker Fix(0h)  └─ Mentoring(8h)
└─ Retro(1h)       └─ Retro(1h)                               └─ Retro(1h)

Sprint 4 (32h)     Sprint 5 (28h)
├─ Test Review(6h) ├─ Final Review(4h)
├─ Perf Review(6h) ├─ Security Audit(4h)
├─ Code Review(12h)├─ Go-live Plan(4h)
├─ Mentoring(6h)   ├─ Support(12h)
└─ Retro(2h)       └─ Docs(4h)
```

**Decision Authority:**
- Architecture & design patterns
- Scope changes (approve/defer)
- Timeline adjustments
- Risk escalation
- Technical direction

**Success Metrics:**
- Code review turnaround < 4 hours
- 0 architectural rework needed
- Team context high (feedback score)
- 0 unresolved blockers > 2 hours

---

### 2. Full-Stack Developer - 40 hours/week

**Name Placeholder:** Senior React/TypeScript Developer

**Primary Responsibilities:**
- Implement context split (critical path)
- Decompose and refactor components
- Extract service layer
- Implement features and fixes
- Write unit and integration tests
- Maintain code quality standards

**Skills Required:**
- React 19 + TypeScript proficiency
- Context API and hooks expertise
- Vite and build tools
- Testing with Vitest/React Testing Library
- Performance profiling
- 4+ years React experience

**Sprint-by-Sprint Allocation:**

```
Sprint 0 (40h)     Sprint 1 (40h)     Sprint 2 (42h)     Sprint 3 (38h)
├─ TS Setup(4h)    ├─ Acct Ext(6h)    ├─ FC Split(21h)   ├─ Txn Perf(7h)
├─ CI/CD (6h)      ├─ Goals Ext(7h)   ├─ Srv Extract(8h) ├─ Caching(6h)
├─ Test Frame(6h)  ├─ Dashboard(8h)   ├─ DB Norm(4h)     ├─ Dashboard(6h)
├─ ESLint (4h)     ├─ Forms/List(10h) ├─ Testing(4h)     ├─ Load Test(5h)
├─ Error BD(4h)    ├─ Testing(6h)     ├─ Debug(5h)       ├─ Memory Opt(5h)
├─ RLS Support(2h) ├─ Debug(3h)       └─ Retro(1h)       └─ Retro(1h)
└─ Retro(1h)       └─ Retro(1h)

Sprint 4 (40h)     Sprint 5 (36h)
├─ Int Tests(8h)   ├─ Final Build(4h)
├─ E2E Tests(8h)   ├─ Deploy Test(8h)
├─ Perf Tests(6h)  ├─ Support(12h)
├─ Bug Fixes(6h)   ├─ Docs(4h)
├─ Code Improve(8h)├─ Final Review(4h)
└─ Retro(1h)       └─ Retro(1h)
```

**Code Output:**
- ~60% of total codebase changes
- Commits: 5-10 per day average
- Code review: Architect + QA

**Success Metrics:**
- Feature delivery on time
- Code review feedback score
- Test coverage improvement
- Zero critical bugs post-merge
- Velocity consistency

---

### 3. QA/Frontend Specialist - 40 hours/week

**Name Placeholder:** Senior QA Engineer / Frontend Test Specialist

**Primary Responsibilities:**
- Build test infrastructure and suites
- Implement performance testing
- Validate UX and accessibility
- Review and approve QA standards
- Profile and optimize performance
- Lead integration testing efforts

**Skills Required:**
- Vitest and React Testing Library
- JavaScript/TypeScript
- Performance profiling tools
- UI/UX validation
- Accessibility standards (WCAG)
- 3+ years testing automation

**Sprint-by-Sprint Allocation:**

```
Sprint 0 (40h)     Sprint 1 (40h)     Sprint 2 (42h)     Sprint 3 (38h)
├─ Error BD(2h)    ├─ Acct Test(6h)   ├─ Context Test(10h)├─ Perf Profile(6h)
├─ Test Frame(8h)  ├─ Goal Test(6h)   ├─ Int Test(8h)    ├─ Load Test(8h)
├─ CI/CD Setup(4h) ├─ Dashboard(6h)   ├─ DB Norm Test(4h)├─ Memory Prof(6h)
├─ Test Utils(6h)  ├─ Form Test(6h)   ├─ Coverage(12h)   ├─ Validation(8h)
├─ RTL Setup(4h)   ├─ List Test(6h)   ├─ Debug(6h)       ├─ Optimization(6h)
├─ Coverage Plan(4h)├─ Perf Plan(8h)  ├─ Perf Tune(2h)   └─ Retro(1h)
└─ Retro(1h)       └─ Retro(1h)       └─ Retro(1h)

Sprint 4 (40h)     Sprint 5 (36h)
├─ Int Tests(12h)  ├─ Final Tests(6h)
├─ E2E Tests(12h)  ├─ Performance(6h)
├─ Perf Tests(8h)  ├─ Security Test(6h)
├─ Coverage(6h)    ├─ Deploy Test(8h)
├─ Bug Validate(2h)├─ Final QA(4h)
└─ Retro(1h)       └─ Retro(1h)
```

**Test Deliverables:**
- 80% code coverage by Sprint 4
- 100+ unit tests
- 20+ integration tests
- 10+ E2E scenarios
- Performance baselines & benchmarks

**Success Metrics:**
- Test coverage growth (1% → 80%)
- Bug detection rate (pre-merge)
- Performance improvement %
- E2E test stability (< 5% flaky)
- Team confidence score

---

## Sprint-by-Sprint Staffing

### Sprint 0: Foundation (Week 1)

```
MON    TUE       WED       THU       FRI
─────┬─────────┬─────────┬─────────┬──────────
 Arch│Arch+Dev │Arch+QA  │Dev+QA   │All Team
 Dev │+QA      │+Dev     │+Arch    │
 QA  │(Focus)  │(Focus)  │(Focus)  │Retro
─────┴─────────┴─────────┴─────────┴──────────

Collaboration: High (new infrastructure)
Daily sync: 30 min standups + collab blocks
Pair programming: 50% (Setup decisions)
```

**Highlights:**
- Arch leads design decisions
- Dev implements with QA oversight
- QA builds test infrastructure
- High communication overhead

---

### Sprint 1: Decomposition (Week 2)

```
MON      TUE      WED      THU      FRI
──────┬──────┬──────┬──────┬──────┬──────
Arch  │Dev   │Dev   │Arch  │Arch  │Arch
+Dev  │(Solo)│+QA   │+QA   │+Dev  │+Dev
+QA   │      │      │      │      │+QA
──────┴──────┴──────┴──────┴──────┴──────

Collaboration: Medium (parallel work)
Daily sync: 15 min standups
Pair programming: 25% (Complex components)
Async review: Code reviews between work
```

**Highlights:**
- Dev leads component extraction
- Arch provides design guidance
- QA builds component tests
- Async code review workflow

---

### Sprint 2: Critical Path (Week 3)

```
MON      TUE      WED      THU      FRI
──────┬──────┬──────┬──────┬──────┬──────
Arch  │Dev   │Dev   │Dev   │Arch  │Dev
+Dev  │+Arch │(SOLO)│(SOLO)│+QA   │+QA
+QA   │(CP)  │(CP)  │(CP)  │      │
──────┴──────┴──────┴──────┴──────┴──────

Collaboration: HIGH on Critical Path
Dev Focus: Mon-Wed CRITICAL PATH (21h)
Arch Role: Unblock, review, mentor
QA Role: Test each context split, validate

Daily sync: 30 min standups + CP review (15 min)
Pair programming: 40% (Critical path + testing)
Async review: Hold for daily CP sync
```

**Highlights:**
- **MON-WED: Dev-solo on critical path**
- Arch available for immediate unblocking
- QA tests each split as completed
- Thu-Fri: Catch-up & cleanup

**Critical Path Schedule:**
```
Mon 09:00-17:00: FC Part 1 (Accounts & Goals) - 7h
               + Buffer time for issues
               + Testing & debug (1.5h)
               → EOD: First two contexts working

Tue 09:00-17:00: FC Part 2 (Investments & Budget) - 7h
               + Cross-dependency testing
               + Debug integration (1.5h)
               → EOD: Four contexts working

Wed 09:00-17:00: FC Part 3 (Patrimony & Reports) - 7h
               + Aggregation testing
               + Full integration (1.5h)
               → EOD: All five contexts working
                      60% coverage achieved
                      CRITICAL PATH COMPLETE

Thu-Fri: Parallel streams resume
```

---

### Sprint 3: Optimization (Week 4)

```
MON      TUE      WED      THU      FRI
──────┬──────┬──────┬──────┬──────┬──────
Dev   │Dev   │Arch  │Arch  │Arch  │All
+Arch │+QA   │+Dev  │+Dev  │+Dev  │Team
+QA   │(Solo)│+QA   │+QA   │+QA   │Retro
──────┴──────┴──────┴──────┴──────┴──────

Collaboration: Medium
Dev Focus: Implementation + performance
Arch Role: Design, code review, optimization strategy
QA Role: Performance testing, profiling

Daily sync: 15 min
Pair programming: 30% (Performance optimization)
```

**Highlights:**
- Dev implements optimizations
- Arch reviews performance designs
- QA measures & validates improvements

---

### Sprint 4: Testing (Week 5)

```
MON      TUE      WED      THU      FRI
──────┬──────┬──────┬──────┬──────┬──────
Dev   │Dev   │QA    │QA    │Arch  │All
+Arch │+QA   │+Dev  │+Dev  │+Dev  │Team
      │      │      │      │+QA   │Retro
──────┴──────┴──────┴──────┴──────┴──────

Collaboration: High (testing is collaborative)
Dev Focus: Bug fixes, support testing
QA Focus: Test coverage, integration tests
Arch: Review, final validation

Daily sync: 30 min (test results)
Pair debugging: 40% (E2E troubleshooting)
```

**Highlights:**
- QA leads test execution
- Dev fixes bugs reported
- Arch validates overall system

---

### Sprint 5: Launch (Week 6)

```
MON      TUE      WED      THU      FRI
──────┬──────┬──────┬──────┬──────┬──────
Arch  │Arch  │All   │All   │All   │All
+Dev  │+Dev  │Team  │Team  │Team  │Team
+QA   │+QA   │      │Deploy│Go-live│Retro
──────┴──────┴──────┴──────┴──────┴──────

Collaboration: VERY HIGH
Dev Focus: Final fixes, staging
QA Focus: Final validation, go-live checks
Arch: Overall readiness, decisions

Daily sync: 30 min + ad-hoc as needed
War room ready: Thu-Fri
```

**Highlights:**
- Team stays close for launch
- Daily deployment testing
- Go-live procedures practiced
- Support ready for issues

---

## Skill Matrix

### Architect

```
┌────────────────────────────────────────┐
│ ARCHITECT SKILL REQUIREMENTS            │
├────────────────────────────────────────┤
│ React/TypeScript Expertise      ████░░  │
│ System Design                   █████░  │
│ Performance Optimization        ████░░  │
│ Team Leadership                 █████░  │
│ Testing Practices               ████░░  │
│ DevOps/CI-CD Basics             ███░░░  │
│ Database Design                 ███░░░  │
└────────────────────────────────────────┘
```

**Must Have:**
- Refactoring experience (large codebases)
- Context API mastery
- TypeScript advanced patterns
- Code review discipline
- Technical mentoring ability

**Nice to Have:**
- Performance profiling tools
- Supabase expertise
- DevOps pipeline experience
- Security best practices

---

### Full-Stack Developer

```
┌────────────────────────────────────────┐
│ DEV SKILL REQUIREMENTS                  │
├────────────────────────────────────────┤
│ React/TypeScript Expertise      █████░  │
│ Component Development           █████░  │
│ Testing (Unit/Integration)      ████░░  │
│ Performance Debugging           ████░░  │
│ Vite/Build Tools                ███░░░  │
│ CSS/Styling                     ███░░░  │
│ Supabase Integration            ███░░░  │
│ Git Workflow                    █████░  │
└────────────────────────────────────────┘
```

**Must Have:**
- React hooks & context mastery
- TypeScript proficiency
- Component design patterns
- Testing mindset
- Debugging skills

**Nice to Have:**
- Performance optimization
- Accessibility knowledge
- Design system experience
- Backend basics

---

### QA/Frontend Specialist

```
┌────────────────────────────────────────┐
│ QA SKILL REQUIREMENTS                   │
├────────────────────────────────────────┤
│ React Testing Library           █████░  │
│ Vitest                          ████░░  │
│ Performance Testing             ████░░  │
│ Accessibility (WCAG)            ████░░  │
│ JavaScript/TypeScript           ████░░  │
│ Browser DevTools                █████░  │
│ CI/CD Understanding             ███░░░  │
│ E2E Testing Tools               ███░░░  │
└────────────────────────────────────────┘
```

**Must Have:**
- React Testing Library expertise
- Test structure understanding
- Performance profiling basics
- Accessibility knowledge
- Debugging React apps

**Nice to Have:**
- E2E testing tools (Playwright, Cypress)
- Performance analysis
- UX/UI validation
- DevOps basics

---

## Communication & Sync Cadence

### Daily Standups (15-30 minutes)

```
Time: 09:00 UTC
Attendees: All 3 team members + Architect lead
Format:
  - Yesterday completed
  - Today goals
  - Blockers & risks
  - CP status (if Sprint 2)

Frequency: 5 days/week (Mon-Fri)
Location: Video call (recorded for async review)
```

### Code Review Process

```
Submission:
  ├─ Push branch with PR
  ├─ Link to story/task
  └─ Run CI/CD checks

Review Cycle:
  ├─ Architect: 4h turnaround (design, patterns)
  ├─ QA: 4h turnaround (tests, coverage)
  └─ Dev: Address feedback same day

Approval:
  ├─ Both Architect + QA approve
  ├─ 0 failing tests
  ├─ 0 ESLint warnings
  └─ Coverage threshold met

Merge:
  ├─ Rebase/squash commits
  ├─ Link to story completion
  └─ Update changelog
```

### Weekly Sync (1 hour)

```
Time: Friday 16:00 UTC (end of week)
Attendees: All 3 + Product Manager (optional)
Topics:
  - Sprint progress review
  - Metrics & velocity
  - Upcoming risks
  - Resource needs
  - Stakeholder updates

Outcomes:
  - Sprint status report
  - Blockers escalated
  - Next week planning
```

---

## Workload & Burnout Prevention

### Weekly Hours

```
Week Allocation per Person:
├─ Core work: 32 hours (8h/day × 4 days)
├─ Meetings: 5 hours (standups + syncs)
├─ Code review: 2 hours
├─ Documentation: 1 hour
└─ Total: 40 hours/week (sustainable)
```

### Burnout Prevention

```
Sprint Planning:
├─ Buffer time built in (Sprint 2: 1 day buffer)
├─ No overtime expected
├─ Async work encouraged
└─ Flexible hours OK (document decisions)

Vacation Policy:
├─ Max 1 person absent per week
├─ 2 weeks notice required
├─ Documented handoff required
└─ Cross-training: Arch covers Dev role

Rotation (Optional):
├─ Every 2 sprints: role swap
├─ Architect ↔ Dev on simpler tasks
├─ Keeps skills fresh
└─ Prevents silos
```

---

## Onboarding New Team Member (If Needed)

### Ramp-Up Timeline: 1 week

```
Day 1 (4h):
├─ Project overview
├─ Architecture briefing
├─ Codebase walkthrough
└─ Dev environment setup

Day 2-3 (8h):
├─ Read CLAUDE.md & architecture docs
├─ Run existing test suite
├─ Make small fix/test PR
└─ Code review participation

Day 4-5 (4h):
├─ Assign first story
├─ Pair with current dev
├─ Submit PR with support
└─ Complete story independently

Full Productivity: Week 2+
```

---

## Success Metrics for Team

| Metric | Target | Owner | Check |
|--------|--------|-------|-------|
| **Delivery On-time** | 95% sprints on schedule | Architect | Weekly review |
| **Code Quality** | 0 critical bugs post-merge | QA Spec | Code review |
| **Test Coverage** | 1% → 80% progression | QA Spec | Weekly report |
| **Team Morale** | Feedback score 4+/5 | Architect | Monthly survey |
| **Communication** | All async decisions logged | All | Checkin comments |
| **Knowledge** | Each person can cover 2+ roles | Arch | End of project |

---

## Budget & Resource Costs

### Personnel Costs (6 weeks)

```
Architect:       240 hours × $150/h = $36,000
Full-Stack Dev:  240 hours × $120/h = $28,800
QA/Frontend:     240 hours × $100/h = $24,000
─────────────────────────────────────────────
TOTAL:                               $88,800

+15% management/overhead          = $102,120
```

### Infrastructure & Tools

```
Supabase Pro:           $1,000/month × 1.5 months = $1,500
GitHub Enterprise:      $300/month × 1.5 months   = $450
Code review tools:      $0 (GitHub included)
Monitoring/Analytics:   $500/month × 1.5 months   = $750
─────────────────────────────────────────────────
TOTAL:                                           = $2,700

GRAND TOTAL (Personnel + Infrastructure):        $104,820
```

---

## Decision Framework

### Who Decides What?

| Decision | Owner | Consulted | Input |
|----------|-------|-----------|-------|
| Architecture & patterns | Architect | Dev + QA | Decisions made weekly |
| Feature scope | Architect | Product | Stories in backlog |
| Timeline adjustments | Architect | All | Escalated immediately |
| Performance targets | QA Spec | Architect + Dev | Baselines set Sprint 0 |
| Testing strategy | QA Spec | Dev + Architect | Test plan approved Day 1 |
| Code quality | Dev | Architect | Code review feedback |
| Bug priority | Architect | Dev + QA | Triage in standups |
| Tech debt | Architect | All | Sprint planning |

---

**Last Updated:** January 2026
**Prepared by:** Product & Engineering Leadership
**Approval:** CTO / VP Engineering
