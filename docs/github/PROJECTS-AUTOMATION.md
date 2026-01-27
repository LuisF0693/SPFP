# GitHub Projects Automation Configuration - SPFP Sprint Management

**Version:** 1.0
**Created:** 2026-01-27
**Owner:** @devops / DevOps Team
**Status:** READY FOR IMPLEMENTATION

---

## Executive Summary

This document specifies the complete GitHub Projects automation configuration for SPFP (Sistema de Planejamento Financeiro Pessoal). It provides a production-ready blueprint for DevOps to implement automated sprint management, issue-to-board workflow automation, and real-time project metrics.

**Key Benefits:**
- Fully automated issue workflow management
- Real-time sprint burndown tracking
- Zero manual board updates
- PR → Done automation
- Integrated metrics & reporting

---

## 1. Board Configuration

### 1.1 Project Structure

```
SPFP Sprint Management (v1.0)
├── Board: Planning (Backlog Management)
├── Board: Active Sprint (Current Sprint Development)
├── Board: Releases (Deployment Tracking)
└── Views: Metrics & Reporting
```

### 1.2 Board: Active Sprint

**Purpose:** Track current sprint work (1-week sprints, Monday-Sunday)

**Columns (Left-to-Right Flow):**

| Column | Purpose | Auto-Transition Rules | WIP Limit |
|--------|---------|----------------------|-----------|
| **Backlog** | Sprint 0 unstarted work | Issue created → Backlog | 15 |
| **Ready** | Approved, ready to start | PR approved OR manual move | 8 |
| **In Progress** | Currently being developed | Issue assigned → In Progress | 5 |
| **In Review** | PR open, awaiting review | PR opened → In Review | 8 |
| **Done** | Merged to main | PR merged → Done | ∞ |

### 1.3 Board: Planning (Backlog Management)

**Purpose:** Groom, estimate, and prioritize future sprints (Sprints 1-6)

**Columns:**

| Column | Purpose | Auto-Transition Rules |
|--------|---------|----------------------|
| **Icebox** | Unspecified, low priority | New epic/story → Icebox |
| **Prioritized** | Sprint roadmap decided | Manual move only |
| **Estimated** | Ready for implementation | All tasks estimated |
| **Ready for Sprint** | Next sprint selection | Sprint assigned |

### 1.4 Board: Releases (Deployment Tracking)

**Purpose:** Track staging and production releases

**Columns:**

| Column | Purpose | Auto-Transition |
|--------|---------|-----------------|
| **Staging Ready** | All tests passing | PR merged to `release/*` |
| **In Staging** | Deployed to staging | Release tag created |
| **Production Ready** | QA sign-off complete | Manual approval |
| **Released** | Live in production | Release tag merged to main |

---

## 2. Auto-Transition Rules (GitHub Automation)

### 2.1 Issue Lifecycle Automation

```yaml
# Rule 1: New Issue Created
Trigger: Issue opened with label "Sprint0"
Actions:
  - Move to: "Backlog"
  - Set Fields:
    - Status: "Backlog"
    - Priority: "P2" (default)
    - Sprint: "Sprint 0"
  - Notify: Project maintainer

# Rule 2: Issue Assigned (Developer Starts Work)
Trigger: Issue assigned to team member
Actions:
  - Move to: "In Progress"
  - Update Status: "In Progress"
  - Set Field: "Assignee"
  - Add Label: "assigned"
  - Notify: Assignee

# Rule 3: Issue Status Ready
Trigger: Issue marked with label "ready"
Actions:
  - Move to: "Ready"
  - Update Status: "Ready"
  - Clear blockers checklist
  - Notify: Team
```

### 2.2 Pull Request Lifecycle Automation

```yaml
# Rule 4: PR Opened (Code Review Requested)
Trigger: Pull Request opened against "main" branch
Actions:
  - Move to: "In Review"
  - Set Status: "In Review"
  - Link connected issues: Auto-detect from PR description
  - Add Label: "pr-open"
  - Notify: Code reviewers
  - Start: Deployment preview

# Rule 5: PR Review Requested
Trigger: Review requested on PR
Actions:
  - Add Label: "awaiting-review"
  - Move to: "In Review"
  - Notify: Requested reviewers
  - Set Status: "Review Requested"

# Rule 6: PR Approved (All Reviews Complete)
Trigger: PR receives approval from 2+ reviewers AND all checks pass
Actions:
  - Move to: "Ready"
  - Add Label: "ready-to-merge"
  - Set Status: "Ready for Merge"
  - Notify: PR author

# Rule 7: PR Merged to Main
Trigger: PR merged to "main" branch
Actions:
  - Move connected issues to: "Done"
  - Close connected issues: Auto-detect from PR
  - Add Label: "merged"
  - Set Status: "Done"
  - Create: Release notes entry
  - Trigger: Post-merge CI/CD pipeline

# Rule 8: PR Closed (Without Merge)
Trigger: PR closed without merging
Actions:
  - Move to: "Backlog"
  - Set Status: "Backlog"
  - Add Label: "closed-pr"
  - Notify: Author & reviewers
```

### 2.3 Sprint Automation Rules

```yaml
# Rule 9: Sprint Start (Monday 00:00 UTC)
Trigger: Scheduled - Weekly Monday
Actions:
  - Archive previous sprint board
  - Create new sprint board view
  - Reset WIP limits
  - Generate: Sprint velocity report
  - Notify: Team in Slack

# Rule 10: Sprint End (Sunday 23:59 UTC)
Trigger: Scheduled - Weekly Sunday
Actions:
  - Calculate: Sprint burndown final metrics
  - Generate: Velocity report
  - Move incomplete items to: Backlog
  - Notify: Team retrospective
  - Create: Sprint summary document

# Rule 11: Blocked Item Detection
Trigger: Issue has "blocked" label
Actions:
  - Highlight: Red background in board
  - Add to: "Blocked Items" view
  - Notify: Project manager
  - Set Status: "Blocked"
  - Create: Blocker issue template
```

### 2.4 Story Status Sync with Issues

```yaml
# Rule 12: Story File Sync
Trigger: Story file modified in docs/stories/
Actions:
  - Extract: Story ID (STY-XXX)
  - Update: Connected GitHub issue
  - Sync Fields:
    - Effort estimate
    - Acceptance criteria
    - Dependencies
    - Status

# Rule 13: Issue Status → Story File
Trigger: GitHub issue status updated
Actions:
  - Detect: Story reference (STY-XXX in issue title/body)
  - Update: docs/stories/story-XXX.md
  - Modify: Status field in story file
  - Commit: "chore: sync story status [Story XXX]"
```

---

## 3. Sprint 0 Board Template

### 3.1 Sprint 0 Configuration

**Sprint Dates:** 2026-01-27 - 2026-02-02 (Week 5)
**Sprint Goal:** Establish project infrastructure and automation foundation
**Capacity:** 40 hours (5 devs × 8 hrs)
**Sprint Type:** Foundation (Security, Tooling, Infrastructure)

### 3.2 Sprint 0 Stories

#### Story 1: Implement RLS Policies on user_data Table

```
Issue ID: [Auto-generated by GitHub]
Story ID: STY-001
Title: Implement RLS Policies on user_data Table
Status: Ready
Priority: P0 CRITICAL
Type: Security / Tech Debt
Effort: 4 hours
Sprint: Sprint 0
Assignee: @backend-senior
Due Date: 2026-01-29
Labels: Sprint0, Security, Critical, Database

Description:
Implement Row-Level Security (RLS) policies on the `user_data` table to ensure
users can only access their own financial data (GDPR/LGPD compliance).

Acceptance Criteria:
- [ ] RLS policies created and enabled on `user_data` table
- [ ] SELECT policy restricts to `auth.uid()` match
- [ ] INSERT policy prevents cross-user writes
- [ ] UPDATE/DELETE policies restrict to own rows
- [ ] SQL test confirms user A cannot read user B data

Blockers: None
Dependencies: None
```

#### Story 2: Enable TypeScript Strict Mode

```
Issue ID: [Auto-generated]
Story ID: STY-002
Title: Enable TypeScript Strict Mode
Status: Ready
Priority: P0 CRITICAL
Type: Tech Debt / Quality
Effort: 3 hours
Sprint: Sprint 0
Assignee: @frontend-lead
Due Date: 2026-01-30
Labels: Sprint0, TypeScript, Quality

Description:
Enable TypeScript strict mode (`"strict": true`) to catch type errors
and improve code quality across the entire codebase.

Acceptance Criteria:
- [ ] `tsconfig.json` updated with `"strict": true`
- [ ] All type errors resolved
- [ ] No `any` types in production code
- [ ] Type checking passes in CI/CD
- [ ] Tests updated for stricter types

Blockers: None
Dependencies: None
```

#### Story 3: Implement Error Boundary Components

```
Issue ID: [Auto-generated]
Story ID: STY-003
Title: Implement Error Boundary Components
Status: Ready
Priority: P1 HIGH
Type: Feature / Quality
Effort: 3 hours
Sprint: Sprint 0
Assignee: @frontend-senior
Due Date: 2026-01-30
Labels: Sprint0, React, ErrorHandling

Description:
Create React Error Boundary components to catch and gracefully handle
component errors, preventing full app crashes.

Acceptance Criteria:
- [ ] ErrorBoundary component created (src/components/ui/ErrorBoundary.tsx)
- [ ] Wraps Dashboard and CRM sections
- [ ] Error logging integrated (logService.ts)
- [ ] User-friendly error messages displayed
- [ ] Tests cover error boundary scenarios

Blockers: None
Dependencies: None
```

#### Story 4: Setup CI/CD Pipeline (GitHub Actions)

```
Issue ID: [Auto-generated]
Story ID: STY-004
Title: Setup CI/CD Pipeline (GitHub Actions)
Status: Ready
Priority: P0 CRITICAL
Type: DevOps / Infrastructure
Effort: 5 hours
Sprint: Sprint 0
Assignee: @devops
Due Date: 2026-02-01
Labels: Sprint0, CI/CD, DevOps, Infrastructure

Description:
Implement complete CI/CD pipeline using GitHub Actions for automated
testing, linting, type checking, and deployment.

Acceptance Criteria:
- [ ] Workflow file created (.github/workflows/ci-cd.yml)
- [ ] Automated tests run on PR creation
- [ ] Linting passes before merge
- [ ] Type checking enforced
- [ ] Staging deployment on main merge
- [ ] Slack notifications configured

Blockers: None
Dependencies: None
```

#### Story 5: Setup Test Infrastructure (Vitest + React Testing Library)

```
Issue ID: [Auto-generated]
Story ID: STY-005
Title: Setup Test Infrastructure (Vitest + React Testing Library)
Status: Ready
Priority: P0 CRITICAL
Type: Test / Infrastructure
Effort: 4 hours
Sprint: Sprint 0
Assignee: @qa-lead
Due Date: 2026-02-01
Labels: Sprint0, Testing, Infrastructure

Description:
Configure Vitest testing framework with React Testing Library for
unit and integration tests.

Acceptance Criteria:
- [ ] vitest.config.ts created and configured
- [ ] React Testing Library installed and setup
- [ ] Sample test files created for core components
- [ ] Test coverage reporting enabled
- [ ] CI/CD integration for test running
- [ ] Documentation: TESTING.md created

Blockers: None
Dependencies: Story STY-004 (CI/CD must be ready)
```

### 3.3 Sprint 0 Board Template (JSON for GitHub Projects API)

```json
{
  "name": "SPFP Sprint 0 - Foundation",
  "template": "sprint_management",
  "fields": {
    "Status": {
      "type": "single_select",
      "options": ["Backlog", "Ready", "In Progress", "In Review", "Done"]
    },
    "Priority": {
      "type": "single_select",
      "options": ["P0 CRITICAL", "P1 HIGH", "P2 MEDIUM", "P3 LOW"]
    },
    "Effort": {
      "type": "number",
      "unit": "hours"
    },
    "Sprint": {
      "type": "single_select",
      "options": ["Sprint 0", "Sprint 1", "Sprint 2", "Backlog"]
    },
    "Story Type": {
      "type": "single_select",
      "options": ["Security", "Feature", "Tech Debt", "DevOps", "Test", "Docs"]
    },
    "Component": {
      "type": "single_select",
      "options": ["Frontend", "Backend", "Database", "AI/Gemini", "Auth", "DevOps"]
    }
  },
  "items": [
    {
      "number": 1,
      "title": "Implement RLS Policies on user_data Table",
      "story_id": "STY-001",
      "status": "Ready",
      "priority": "P0 CRITICAL",
      "effort": 4,
      "assignee": "backend-senior",
      "due_date": "2026-01-29",
      "labels": ["Sprint0", "Security", "RLS", "Database"]
    },
    {
      "number": 2,
      "title": "Enable TypeScript Strict Mode",
      "story_id": "STY-002",
      "status": "Ready",
      "priority": "P0 CRITICAL",
      "effort": 3,
      "assignee": "frontend-lead",
      "due_date": "2026-01-30",
      "labels": ["Sprint0", "TypeScript", "Quality"]
    },
    {
      "number": 3,
      "title": "Implement Error Boundary Components",
      "story_id": "STY-003",
      "status": "Ready",
      "priority": "P1 HIGH",
      "effort": 3,
      "assignee": "frontend-senior",
      "due_date": "2026-01-30",
      "labels": ["Sprint0", "React", "ErrorHandling"]
    },
    {
      "number": 4,
      "title": "Setup CI/CD Pipeline (GitHub Actions)",
      "story_id": "STY-004",
      "status": "Ready",
      "priority": "P0 CRITICAL",
      "effort": 5,
      "assignee": "devops",
      "due_date": "2026-02-01",
      "labels": ["Sprint0", "CI/CD", "DevOps"]
    },
    {
      "number": 5,
      "title": "Setup Test Infrastructure (Vitest + React Testing Library)",
      "story_id": "STY-005",
      "status": "Ready",
      "priority": "P0 CRITICAL",
      "effort": 4,
      "assignee": "qa-lead",
      "due_date": "2026-02-01",
      "labels": ["Sprint0", "Testing", "Infrastructure"],
      "depends_on": ["#4"]
    }
  ],
  "total_effort": 19,
  "sprint_capacity": 40,
  "utilization": "47.5%"
}
```

---

## 4. Labels & Filters System

### 4.1 Priority Labels

```yaml
Priority System:
  P0-CRITICAL:
    Description: "Blocking release, security issue, or production bug"
    Color: "#ff0000" (Red)
    Used In: "All boards"
    Filter: "priority:critical OR impact:production"

  P1-HIGH:
    Description: "Important feature for next sprint, high business value"
    Color: "#ff6600" (Orange)
    Used In: "Sprint boards"
    Filter: "priority:high"

  P2-MEDIUM:
    Description: "Nice-to-have feature, technical improvement"
    Color: "#ffff00" (Yellow)
    Used In: "Backlog planning"
    Filter: "priority:medium"

  P3-LOW:
    Description: "Polish, documentation, future consideration"
    Color: "#00ff00" (Green)
    Used In: "Icebox"
    Filter: "priority:low"
```

### 4.2 Sprint Labels

```yaml
Sprint Management:
  Sprint0:
    Description: "Foundation phase: security, CI/CD, testing"
    Applied To: 5 stories
    Duration: 2026-01-27 to 2026-02-02

  Sprint1:
    Description: "Core feature implementation phase 1"
    Applied To: [Backlog items]
    Planned: 2026-02-03 to 2026-02-09

  Sprint2-Sprint6:
    Description: "Subsequent sprints (planned)"
    Applied To: [Backlog items]

  Backlog:
    Description: "No sprint assigned, future consideration"
    Applied To: [Planning board icebox]
```

### 4.3 Type Labels

```yaml
Issue Type Classification:

  Bug:
    Color: "#d73a49" (Red)
    Prefix: "bug:"
    Example: "bug: transaction list crashes on empty state"

  Feature:
    Color: "#0366d6" (Blue)
    Prefix: "feat:"
    Example: "feat: add PDF export for reports"

  Tech-Debt:
    Color: "#8b4513" (Brown)
    Prefix: "refactor:"
    Example: "refactor: remove legacy context API usage"

  Performance:
    Color: "#28a745" (Green)
    Prefix: "perf:"
    Example: "perf: optimize transaction filtering"

  Documentation:
    Color: "#6f42c1" (Purple)
    Prefix: "docs:"
    Example: "docs: add API endpoint documentation"

  Test:
    Color: "#005cc5" (Dark Blue)
    Prefix: "test:"
    Example: "test: add unit tests for aiService"

  Security:
    Color: "#ff0000" (Bright Red)
    Prefix: "security:"
    Example: "security: implement RLS policies"
```

### 4.4 Component Labels

```yaml
Component Classification:

  Component-Frontend:
    Color: "#3498db"
    Used By: UI developers
    Examples: Dashboard, TransactionForm, Reports

  Component-Backend:
    Color: "#e74c3c"
    Used By: Backend developers
    Examples: RLS policies, API routes

  Component-Database:
    Color: "#2ecc71"
    Used By: Database engineers
    Examples: Schema, migrations, queries

  Component-AI:
    Color: "#f39c12"
    Used By: AI engineers
    Examples: Gemini API, prompts, insights

  Component-Auth:
    Color: "#9b59b6"
    Used By: Security engineers
    Examples: OAuth, JWT, RLS

  Component-DevOps:
    Color: "#34495e"
    Used By: DevOps engineers
    Examples: CI/CD, Supabase, deployment

  Component-Test:
    Color: "#1abc9c"
    Used By: QA engineers
    Examples: Unit tests, integration tests
```

### 4.5 Status Labels

```yaml
Workflow Status Labels:

  assigned:
    Description: "Issue assigned to team member (auto-applied)"

  in-progress:
    Description: "Actively being worked on"

  awaiting-review:
    Description: "PR awaiting reviewer feedback"

  ready-to-merge:
    Description: "Approved and ready to merge (2+ approvals)"

  blocked:
    Description: "Cannot proceed due to blocker"
    Manual trigger: Assignee adds label when blocked

  duplicate:
    Description: "Duplicate of another issue"

  wontfix:
    Description: "Will not be implemented"

  on-hold:
    Description: "Temporarily paused, waiting for something"
```

### 4.6 Filter Views

#### View 1: My Sprint Items (Personal)

```
Filters:
  - Sprint: "Sprint 0"
  - Assignee: "@{current-user}"
  - Status: ["Ready", "In Progress", "In Review"]

Display: Cards
Sort: "Effort (ascending)"
Purpose: Personal daily standup
```

#### View 2: Blocked Items (Risk)

```
Filters:
  - Labels: "blocked"
  - Status: ["Backlog", "Ready", "In Progress"]

Display: Table
Sort: "Priority (descending)"
Color: Red background
Purpose: Daily check - unblock as top priority
```

#### View 3: Code Review Queue (Team)

```
Filters:
  - Status: "In Review"
  - Awaiting: "review"

Display: Cards
Sort: "Created (ascending)" - oldest first
Purpose: PR review priority queue
```

#### View 4: Sprint Progress (Management)

```
Filters:
  - Sprint: "Sprint 0"
  - Status: ["Ready", "In Progress", "In Review", "Done"]

Display: Board view with progress bar
Metrics:
  - Effort completed
  - WIP count
  - Burndown rate
Purpose: Sprint health dashboard
```

#### View 5: Backlog Refinement (Planning)

```
Filters:
  - Status: ["Icebox", "Prioritized", "Estimated"]

Display: Table
Sort: "Priority (descending)"
Purpose: Quarterly planning and grooming
```

---

## 5. Auto-Transition Workflow Diagrams

### 5.1 Issue Lifecycle

```
┌──────────────────┐
│  Issue Created   │ ← GitHub issue opened
└────────┬─────────┘
         │
         ├─ Has Sprint Label? NO → Backlog
         │                  YES ↓
         │              [Categorized]
         │
    ┌────────────────────────────────────────┐
    │ Backlog                                │
    │ Status: Not Started                    │
    │ WIP Limit: 15                         │
    └────────┬─────────────────────────────────┘
             │
       Developer selects for work
             │
    ┌────────▼─────────────────────────────────┐
    │ In Progress                             │
    │ Status: Active Development              │
    │ WIP Limit: 5                           │
    │ Trigger: Issue assigned                │
    └────────┬─────────────────────────────────┘
             │
        Opens PR for review
             │
    ┌────────▼─────────────────────────────────┐
    │ In Review                               │
    │ Status: Code Review                     │
    │ WIP Limit: 8                           │
    │ Trigger: PR opened on main             │
    └────────┬─────────────────────────────────┘
             │
    ┌────────▼──────────────────┐
    │ Review Passed?            │
    │ 2+ Approvals + CI Passing?│
    └────┬──────────────┬───────┘
         │              │
        YES             NO
         │              │
         ▼              ▼
    ┌─────────┐   ┌──────────┐
    │ Ready   │   │ Backlog  │
    │ for     │   │ (return) │
    │ Merge   │   └──────────┘
    └────┬────┘
         │
    Author merges to main
         │
    ┌────▼──────────────────────────────────┐
    │ Done                                  │
    │ Status: Merged & Closed               │
    │ Trigger: PR merged                    │
    │ Actions:                              │
    │ - Close connected issues             │
    │ - Create release notes               │
    │ - Update deployment status           │
    └───────────────────────────────────────┘
```

### 5.2 PR → Done Automation

```
Developer commits → Pushes to branch
         │
         ▼
Creates Pull Request
         │
         ├─ Title matches story pattern? (e.g., "feat: add STY-001")
         │  NO: Manual entry required
         │  YES: Auto-link issue
         │
    ┌────▼─────────────────────────────┐
    │ PR Opened                         │
    │ - Link connected issues          │
    │ - Set status "In Review"         │
    │ - Trigger deployment preview     │
    │ - Request reviewers              │
    └────┬─────────────────────────────┘
         │
    Reviewer requests changes?
         │
      YES ▼                          NO
    ┌──────────┐          ┌──────────────┐
    │ Changes  │          │ Approve      │
    │ Requested│          │ (2+ needed)  │
    └────┬─────┘          └────┬─────────┘
         │                     │
    Developer updates        All checks
    code                     passing?
         │                     │
         └──────────┬──────────┘
                    │ YES
         ┌──────────▼────────┐
         │ PR Ready to Merge │
         │ Status: Ready     │
         │ Label: ready-to- │
         │        merge      │
         └──────────┬────────┘
                    │
              Author merges
                    │
         ┌──────────▼─────────────┐
         │ Merged to main         │
         │ - Close issue          │
         │ - Update status: Done  │
         │ - Add release notes    │
         │ - Trigger deployment  │
         └───────────────────────┘
```

---

## 6. Metrics & Reporting Views

### 6.1 Burndown Chart View

```
Configuration:
  Type: Line chart
  X-Axis: Days in sprint (Mon-Sun)
  Y-Axis: Hours remaining (cumulative)

Data Points:
  - Ideal line: Linear decrease
  - Actual line: Effort remaining by day

Calculation:
  Hours Remaining = Total Sprint Effort - Hours Completed

Interpretation:
  - Above ideal: Behind schedule
  - Below ideal: Ahead of schedule
  - Flat sections: Blocked or no progress

Example Sprint 0:
  Monday (Day 1):    19 hours → Start
  Tuesday (Day 2):   14 hours → 5 hours completed
  Wednesday (Day 3): 11 hours → 3 hours completed
  Thursday (Day 4):  8 hours  → 3 hours completed
  Friday (Day 5):    4 hours  → 4 hours completed
  Sunday (Day 7):    0 hours  → Done!
```

### 6.2 Velocity Tracking

```
Metric: Sprint Velocity
Definition: Total effort (hours) completed per sprint
Period: Rolling 6-sprint average

Calculation:
  Sprint Velocity = Sum of completed story effort

Sprint 0:     19 hours (foundation work)
Sprint 1:     40 hours (target capacity)
Sprint 2:     40 hours (target capacity)
Sprint 3:     40 hours (target capacity)
Sprint 4:     40 hours (target capacity)
Sprint 5:     40 hours (target capacity)
Sprint 6:     40 hours (target capacity)

Average Velocity: 38.4 hours per sprint

Trending:
  ↗ Increasing: Team productivity improving
  ↘ Decreasing: Technical blockers or scope issues
  ⎯ Flat: Consistent team output
```

### 6.3 Blocked Items Highlighting

```
Visual Indicator: Red background card
Automatic Detection:
  - Issue labeled "blocked"
  - Issue with blocking issue link
  - Issue with unresolved dependency

Quick Actions:
  1. Click card → View blocker
  2. Open issue → Edit dependencies
  3. Move to "Blocked" view for daily standup

Blocked Item Report:
  - Show blocking issue
  - Show impact (how many items blocked)
  - Show duration (how long blocked)
  - Auto-escalate if > 1 day
```

### 6.4 WIP (Work In Progress) Limits

```
Active Sprint Board:

Column          | Limit | Current | Status      | Alert
===============|=======|=========|=============|=======
Backlog         | 15    | 8       | ✓ OK        | -
Ready           | 8     | 5       | ✓ OK        | -
In Progress     | 5     | 4       | ✓ OK        | -
In Review       | 8     | 7       | ⚠ CAUTION   | 87% full
Done            | ∞     | 6       | ✓ OK        | -

Rules:
- When column reaches WIP limit, no new items can be moved in
- Developer must complete/merge item before new work starts
- Slack notification: "@team In Review WIP limit reached"
- Daily standup: Review WIP overages
```

### 6.5 Priority Distribution Chart

```
Type: Pie Chart
Categories: P0, P1, P2, P3

Sprint 0 Distribution:
  P0 CRITICAL: 4 stories (80%) - 16 hours
  P1 HIGH:     1 story   (20%) - 3 hours
  P2 MEDIUM:   0 stories (0%)  - 0 hours
  P3 LOW:      0 stories (0%)  - 0 hours

Sprint 1+ Target:
  P0: 30-40% (must complete)
  P1: 40-50% (business value)
  P2: 10-20% (tech debt)
  P3: 5-10%  (polish)
```

### 6.6 Daily Metrics Dashboard

```
Real-time Updates (Every 30 min)

Sprint Status Card:
  Sprint: Sprint 0
  Duration: Mon 1/27 - Sun 2/2 (Day 1/7)
  Capacity: 40 hours
  Current: 19 hours completed (47.5%)
  Velocity: On target

Progress Indicators:
  - Effort complete: ████████░░ 47.5%
  - Items done: █████░░░░░ 50%
  - Blocked items: 0 (✓ none)
  - PR pending review: 2

Key Metrics:
  - Burndown rate: 2.7 hours/day (on target 2.7)
  - Cycle time: 2.3 days avg
  - PR review time: 4.2 hours avg
  - Deploy frequency: 3x/day
```

---

## 7. GitHub Actions Workflow Configuration

### 7.1 Issue Auto-Categorization Workflow

```yaml
# File: .github/workflows/issue-automation.yml

name: Issue Auto-Categorization

on:
  issues:
    types: [opened, labeled, unlabeled]

jobs:
  categorize:
    runs-on: ubuntu-latest
    permissions:
      issues: write
      pull-requests: write

    steps:
      - name: Auto-assign to Project
        uses: actions/github-script@v6
        with:
          script: |
            const issue = context.payload.issue;

            // Rule 1: Detect story ID from title (STY-XXX)
            const storyMatch = issue.title.match(/STY-(\d+)/);
            if (storyMatch) {
              github.rest.issues.createLabel({
                owner: context.repo.owner,
                repo: context.repo.repo,
                name: `STY-${storyMatch[1]}`
              });
            }

            // Rule 2: Auto-assign to SPFP Sprint board
            if (issue.labels.some(l => l.name.includes('Sprint'))) {
              github.rest.projects.addCard({
                project_id: process.env.PROJECT_ID,
                content_id: issue.id,
                content_type: 'Issue'
              });
            }

            // Rule 3: Set default priority if missing
            if (!issue.labels.some(l => l.name.match(/^P[0-3]-/))) {
              github.rest.issues.addLabels({
                owner: context.repo.owner,
                repo: context.repo.repo,
                issue_number: issue.number,
                labels: ['P2-MEDIUM']
              });
            }

      - name: Link to Story File
        uses: actions/github-script@v6
        with:
          script: |
            const issue = context.payload.issue;
            const storyMatch = issue.title.match(/STY-(\d+)/);

            if (storyMatch) {
              const storyNum = storyMatch[1].padStart(3, '0');
              const comment = `📄 **Story File:** docs/stories/story-${storyNum}.md`;

              github.rest.issues.createComment({
                owner: context.repo.owner,
                repo: context.repo.repo,
                issue_number: issue.number,
                body: comment
              });
            }

      - name: Notify in Slack
        if: github.event.action == 'opened'
        uses: slackapi/slack-github-action@v1
        with:
          webhook-url: ${{ secrets.SLACK_WEBHOOK }}
          payload: |
            {
              "text": "📌 New Issue: ${{ issue.title }}",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*${{ issue.title }}*\n${{ issue.html_url }}"
                  }
                }
              ]
            }
```

### 7.2 PR Review Automation Workflow

```yaml
# File: .github/workflows/pr-automation.yml

name: PR Auto-Transition

on:
  pull_request:
    types: [opened, synchronize, review_requested]
  pull_request_review:
    types: [submitted, dismissed]

jobs:
  auto_transition:
    runs-on: ubuntu-latest
    permissions:
      pull-requests: write
      issues: write

    steps:
      - name: Move PR to In Review
        if: github.event.action == 'opened'
        uses: actions/github-script@v6
        with:
          script: |
            const pr = context.payload.pull_request;

            // Move to "In Review" column
            github.rest.projects.moveCard({
              card_id: card.id,
              position: 'top',
              column_id: process.env.IN_REVIEW_COLUMN_ID
            });

            // Add label
            github.rest.issues.addLabels({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: pr.number,
              labels: ['pr-open']
            });

      - name: Check PR Readiness
        if: github.event.action == 'submitted' && github.event.review.state == 'approved'
        uses: actions/github-script@v6
        with:
          script: |
            const pr = context.payload.pull_request;

            // Get all reviews
            const reviews = await github.rest.pulls.listReviews({
              owner: context.repo.owner,
              repo: context.repo.repo,
              pull_number: pr.number
            });

            const approvals = reviews.data.filter(r => r.state === 'APPROVED').length;
            const checksPass = context.payload.pull_request.mergeable &&
                             context.payload.pull_request.draft === false;

            // Rule: 2+ approvals + all checks pass
            if (approvals >= 2 && checksPass) {
              github.rest.issues.removeLabel({
                owner: context.repo.owner,
                repo: context.repo.repo,
                issue_number: pr.number,
                name: 'awaiting-review'
              });

              github.rest.issues.addLabels({
                owner: context.repo.owner,
                repo: context.repo.repo,
                issue_number: pr.number,
                labels: ['ready-to-merge']
              });

              // Move to "Ready" column
              github.rest.projects.moveCard({
                card_id: card.id,
                position: 'top',
                column_id: process.env.READY_COLUMN_ID
              });

              // Comment
              github.rest.issues.createComment({
                owner: context.repo.owner,
                repo: context.repo.repo,
                issue_number: pr.number,
                body: '✅ **Ready to merge** - All approvals received and checks passing'
              });
            }
```

### 7.3 Merge to Done Automation

```yaml
# File: .github/workflows/merge-automation.yml

name: Merge to Done

on:
  push:
    branches: [main]

jobs:
  merge_to_done:
    runs-on: ubuntu-latest
    permissions:
      issues: write
      pull-requests: write

    steps:
      - name: Get Merged PR
        id: pr
        uses: actions/github-script@v6
        with:
          script: |
            const commit = context.payload.head_commit;
            const prs = await github.rest.pulls.list({
              owner: context.repo.owner,
              repo: context.repo.repo,
              state: 'closed',
              sort: 'updated',
              direction: 'desc'
            });

            const pr = prs.data.find(p => p.merge_commit_sha === commit.id);
            return pr;

      - name: Move to Done & Close Issues
        uses: actions/github-script@v6
        with:
          script: |
            const pr = steps.pr.outputs.result;
            if (!pr) return;

            // Extract connected issue numbers from PR body
            const issueMatches = pr.body.match(/#(\d+)/g) || [];

            for (const match of issueMatches) {
              const issueNum = parseInt(match.substring(1));

              // Close issue
              github.rest.issues.update({
                owner: context.repo.owner,
                repo: context.repo.repo,
                issue_number: issueNum,
                state: 'closed'
              });

              // Move to Done
              github.rest.projects.moveCard({
                card_id: card.id,
                position: 'top',
                column_id: process.env.DONE_COLUMN_ID
              });

              // Add merged label
              github.rest.issues.addLabels({
                owner: context.repo.owner,
                repo: context.repo.repo,
                issue_number: issueNum,
                labels: ['merged']
              });
            }

            // Create release notes entry
            const releaseBody = `## ${pr.title}\n${pr.body}`;
            github.rest.repos.createRelease({
              owner: context.repo.owner,
              repo: context.repo.repo,
              tag_name: `release-${Date.now()}`,
              body: releaseBody,
              draft: true
            });
```

---

## 8. Implementation Checklist for DevOps

### Phase 1: GitHub Projects Setup

- [ ] **Create Project Board**
  - [ ] Create GitHub Project (v2) at organization level
  - [ ] Name: "SPFP Sprint Management"
  - [ ] Template: "Table view" or "Board view"
  - [ ] Set to public (allows external integrations)

- [ ] **Configure Board Columns**
  - [ ] Create Status field (single_select)
  - [ ] Options: Backlog, Ready, In Progress, In Review, Done
  - [ ] Create Priority field (single_select)
  - [ ] Options: P0, P1, P2, P3
  - [ ] Create Effort field (number, hours)
  - [ ] Create Sprint field (single_select)
  - [ ] Create Component field (single_select)

- [ ] **Create Automation Rules (Built-in GitHub Projects)**
  - [ ] Rule: New issue → Backlog column
  - [ ] Rule: PR opened → In Review column
  - [ ] Rule: PR merged → Done column & auto-close
  - [ ] Rule: Issue labeled "blocked" → Red highlight

### Phase 2: Labels & Filters

- [ ] **Create Priority Labels**
  - [ ] P0-CRITICAL (#ff0000)
  - [ ] P1-HIGH (#ff6600)
  - [ ] P2-MEDIUM (#ffff00)
  - [ ] P3-LOW (#00ff00)

- [ ] **Create Sprint Labels**
  - [ ] Sprint0, Sprint1, Sprint2, etc.
  - [ ] Backlog (for unscheduled items)

- [ ] **Create Type Labels**
  - [ ] Bug, Feature, Tech-Debt, Perf, Docs, Test, Security

- [ ] **Create Component Labels**
  - [ ] Component-Frontend, Component-Backend, etc.

- [ ] **Create Status Labels**
  - [ ] assigned, in-progress, awaiting-review, ready-to-merge, blocked

### Phase 3: GitHub Actions Workflows

- [ ] **Create .github/workflows/ directory**

- [ ] **Issue Auto-Categorization**
  - [ ] Copy `issue-automation.yml` from section 7.1
  - [ ] Update PROJECT_ID (from GitHub Projects URL)
  - [ ] Configure Slack webhook (optional)
  - [ ] Test: Open new issue → Check auto-labeling

- [ ] **PR Review Automation**
  - [ ] Copy `pr-automation.yml` from section 7.2
  - [ ] Update column IDs (get from Projects API)
  - [ ] Configure approval requirements (2+ reviewers)
  - [ ] Test: Open PR → Request review → Approve

- [ ] **Merge to Done Automation**
  - [ ] Copy `merge-automation.yml` from section 7.3
  - [ ] Configure release drafting
  - [ ] Test: Merge PR → Check issue closed

### Phase 4: Sprint 0 Setup

- [ ] **Create 5 GitHub Issues**
  - [ ] Issue #?: STY-001 - RLS Policies (P0, 4h, @backend-senior)
  - [ ] Issue #?: STY-002 - TypeScript Strict (P0, 3h, @frontend-lead)
  - [ ] Issue #?: STY-003 - Error Boundaries (P1, 3h, @frontend-senior)
  - [ ] Issue #?: STY-004 - CI/CD Pipeline (P0, 5h, @devops)
  - [ ] Issue #?: STY-005 - Test Infrastructure (P0, 4h, @qa-lead)

- [ ] **Add Issues to Project**
  - [ ] Bulk add all 5 issues to "SPFP Sprint Management" project
  - [ ] Set Status: "Ready" for all
  - [ ] Set Sprint: "Sprint0" for all
  - [ ] Set Effort, Assignee, Due dates
  - [ ] Verify burndown view calculates correctly

### Phase 5: Slack Integration (Optional)

- [ ] **Setup Slack Notifications**
  - [ ] Create Slack app in workspace
  - [ ] Generate webhook URL
  - [ ] Store in GitHub repo secrets: `SLACK_WEBHOOK`
  - [ ] Configure notifications:
    - New issue → #spfp-issues
    - PR opened → #spfp-pr-review
    - Daily standup → #spfp-standups

### Phase 6: Testing & Validation

- [ ] **Test Issue Workflow**
  - [ ] Create test issue → Verify auto-moves to Backlog
  - [ ] Assign issue → Verify status updates to "In Progress"
  - [ ] Label as "blocked" → Verify appears in blocked view

- [ ] **Test PR Workflow**
  - [ ] Open test PR → Verify moves to "In Review"
  - [ ] Request review → Verify notification sent
  - [ ] Approve PR (2+) → Verify moves to "Ready"
  - [ ] Merge PR → Verify moves to "Done" & issue closes

- [ ] **Test Burndown Calculation**
  - [ ] Manually mark items "Done"
  - [ ] Verify burndown chart updates
  - [ ] Confirm sprint velocity calculated

- [ ] **Documentation**
  - [ ] Create GITHUB-PROJECTS.md in docs/github/
  - [ ] Document all automation rules
  - [ ] Create troubleshooting guide
  - [ ] Add dashboard usage guidelines

---

## 9. API Integration Points

### 9.1 GitHub Projects API (REST v2)

```bash
# Get project details
GET /repos/{owner}/{repo}/projects/{project_id}

# Get project columns
GET /projects/{project_id}/columns

# Move item to column
POST /projects/columns/cards/{card_id}/moves
{
  "position": "top",
  "column_id": {column_id}
}

# Update item fields
PATCH /repos/{owner}/{repo}/issues/{issue_number}
{
  "labels": ["Sprint0", "P0-CRITICAL"],
  "milestone": 1
}

# Get project statistics
GET /repos/{owner}/{repo}/projects/{project_id}/columns
# Calculate burndown from issue closed_at timestamps
```

### 9.2 GitHub Actions Secrets Required

```yaml
PROJECT_ID: "123456"           # From GitHub Projects URL
BACKLOG_COLUMN_ID: "1"
READY_COLUMN_ID: "2"
IN_PROGRESS_COLUMN_ID: "3"
IN_REVIEW_COLUMN_ID: "4"
DONE_COLUMN_ID: "5"

SLACK_WEBHOOK: "https://hooks.slack.com/..."
GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### 9.3 Webhook Configuration

```yaml
Repository Webhooks:
  - Payload URL: GitHub Actions (automatic)
  - Events:
    - Issues: opened, labeled, unlabeled
    - Pull requests: opened, synchronize, review_requested
    - Pull request reviews: submitted, dismissed
    - Pushes: main branch only
```

---

## 10. Troubleshooting & Edge Cases

### 10.1 Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Issue not moving to board | Project not added | Manual add via GitHub Projects UI |
| PR not linking to issue | Title format wrong | Use `#123` or `closes #123` in PR body |
| Burndown not calculating | No effort field set | Set Effort field on all issues |
| Automation not triggering | Workflow not enabled | Check .github/workflows/*.yml committed |
| Slack notifications not sent | Webhook URL invalid | Regenerate webhook in Slack app settings |

### 10.2 Edge Cases

```yaml
# Edge Case 1: PR with multiple issues
# Solution: Use comma-separated in PR body
# Closes #1, #2, #3

# Edge Case 2: Issue reopened after merge
# Action: Manual move back to Backlog + change status

# Edge Case 3: Blocked item dependency circular
# Prevention: Workflow should reject circular deps

# Edge Case 4: Sprint ends mid-week with incomplete items
# Action: Auto-move incomplete items to "Backlog" on Sunday
```

---

## 11. Success Metrics

### 11.1 Automation Effectiveness

```
Target: 95%+ of issues auto-categorized (no manual intervention)
Baseline: 30% (current manual process)
Expected: Week 1 → 60%, Week 2 → 80%, Week 3 → 95%+

Measurement:
  - Track issues needing manual re-categorization
  - Monitor automation rule failures
  - Measure time saved per sprint
```

### 11.2 Sprint Health Indicators

```
Velocity Tracking:
  ✓ Sprint 0: 19 hours (foundation)
  ✓ Sprint 1+: 40 hours (capacity)
  ✓ 6-sprint average: 35+ hours (healthy)

Burndown Quality:
  ✓ Burndown slope matches ideal: ±10%
  ✓ No flat sections > 1 day
  ✓ Zero scope creep (no items added mid-sprint)

Quality Gates:
  ✓ 100% PR review before merge
  ✓ 2+ approvals required
  ✓ All CI checks passing
  ✓ Zero blocked items > 1 day
```

### 11.3 Team Productivity

```
Cycle Time: PR open → Merged
  Target: < 24 hours
  Baseline: 3-5 days (manual)
  Expected Week 1: 48 hours

Code Review Time: PR open → First review
  Target: < 4 hours
  Baseline: 8+ hours

Deploy Frequency:
  Target: 3+ deploys/day
  Baseline: 1x/day
```

---

## 12. Future Enhancements

### Phase 2 (Sprint 2+): Advanced Automation

- [ ] **Dependency Management**
  - Auto-block items with unmet dependencies
  - Visual dependency graph in project

- [ ] **Risk Detection**
  - AI-powered blocker prediction
  - Automatic escalation for high-risk items

- [ ] **Reporting Dashboard**
  - Real-time sprint metrics in Slack
  - Automated weekly team reports
  - Trend analysis (velocity, cycle time)

- [ ] **Integration with Tools**
  - Time tracking integration (Toggl)
  - Document linking (Notion)
  - Deployment status (Vercel)

### Phase 3 (Sprint 4+): ML/AI Features

- [ ] **Effort Estimation**
  - Historical data ML model
  - Auto-suggest effort based on story type

- [ ] **Sprint Planning AI**
  - Capacity-based story recommendation
  - Risk balancing algorithm

- [ ] **Anomaly Detection**
  - Detect unusual velocity swings
  - Flag burndown anomalies

---

## 13. Related Documentation

| Document | Location | Purpose |
|----------|----------|---------|
| Sprint Stories | docs/stories/ | Individual story details |
| Technical Architecture | docs/architecture/ | System design |
| CI/CD Pipelines | .github/workflows/ | Automation configs |
| Development Guide | CLAUDE.md | Local development setup |
| GitHub Infrastructure | docs/github/ | GitHub-specific docs |

---

## Appendix A: Example Sprint 0 Board (Visual)

```
SPFP Sprint Management - Sprint 0

┌────────────────┬────────────────┬────────────────┬────────────────┬────────────────┐
│   BACKLOG      │    READY       │  IN PROGRESS   │   IN REVIEW    │     DONE       │
│   (WIP: 15)    │   (WIP: 8)     │   (WIP: 5)     │   (WIP: 8)     │  (WIP: ∞)      │
├────────────────┼────────────────┼────────────────┼────────────────┼────────────────┤
│                │ STY-001        │ STY-004        │ PR #42         │ (empty start)  │
│                │ RLS Policies   │ CI/CD Setup    │ (STY-004)      │                │
│                │ @backend-sr    │ @devops        │ 3/2 approvals  │                │
│                │ P0 CRITICAL    │ P0 CRITICAL    │ (in progress)  │                │
│                │ 4h effort      │ 5h effort      │                │                │
│                │ Due: 1/29      │ Due: 2/1       │                │                │
│                ├────────────────┼────────────────┤                │                │
│                │ STY-002        │ STY-005        │ PR #45         │                │
│                │ TypeScript     │ Test Infra     │ (STY-002)      │                │
│                │ @frontend-lead │ @qa-lead       │ Waiting for    │                │
│                │ P0 CRITICAL    │ P0 CRITICAL    │ review         │                │
│                │ 3h effort      │ 4h effort      │                │                │
│                │ Due: 1/30      │ Due: 2/1       │                │                │
│                ├────────────────┤                ├────────────────┤                │
│                │ STY-003        │                │ PR #47         │                │
│                │ Error          │                │ (STY-003)      │                │
│                │ Boundaries     │                │ Awaiting 2nd   │                │
│                │ @frontend-sr   │                │ approval       │                │
│                │ P1 HIGH        │                │                │                │
│                │ 3h effort      │                │                │                │
│                │ Due: 1/30      │                │                │                │
└────────────────┴────────────────┴────────────────┴────────────────┴────────────────┘

Sprint Metrics:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Effort: 19h (Sprint 0 foundation) | Capacity: 40h (47.5% utilized)
  Done: 0/5 stories | In Progress: 2 | In Review: 1
  Burndown: Day 1/7 - On target ━━━━━━━━━━━━━━━━━
  Blocked: 0 items | Code reviews: 3 pending
```

---

## Appendix B: Sprint 0 GitHub Issues Template

```markdown
# STY-001: Implement RLS Policies on user_data Table

**Effort:** 4 hours
**Priority:** P0 CRITICAL
**Sprint:** Sprint 0
**Component:** Database

## Story Context
Implement Row-Level Security (RLS) policies on the `user_data` table
to ensure users can only access their own financial data (GDPR/LGPD compliance).

## Acceptance Criteria
- [ ] RLS policies created and enabled on `user_data` table
- [ ] SELECT policy restricts to `auth.uid()` match
- [ ] INSERT policy prevents cross-user writes
- [ ] UPDATE/DELETE policies restrict to own rows
- [ ] SQL test confirms user A cannot read user B data
- [ ] Supabase RLS tester shows zero policy violations

## Technical Details
- Create RLS policy: SELECT only user_id = auth.uid()
- Create RLS policy: INSERT only user_id = auth.uid()
- Create RLS policy: UPDATE only user_id = auth.uid()
- Create RLS policy: DELETE only user_id = auth.uid()
- Enable RLS on user_data table
- Validate isolation with SQL test

## Files to Modify
- supabase/migrations/YYYYMMDD_add_rls_user_data.sql (new)
- supabase/tests/rls-user-isolation.test.sql (new)
- docs/DEPLOYMENT.md

## Related Documentation
📄 Story file: docs/stories/story-001-rls-policies.md

## Blockers
None

## Notes
This is blocking production deployment. Must be completed and tested
before feature work resumes.

---
**Linked to:** docs/stories/story-001-rls-policies.md
**Labels:** Sprint0, Security, RLS, Database, P0-CRITICAL
**Assignee:** @backend-senior
**Due Date:** 2026-01-29
```

---

## Document Metadata

| Attribute | Value |
|-----------|-------|
| **Document ID** | GITHUB-PROJ-001 |
| **Version** | 1.0 |
| **Status** | READY FOR IMPLEMENTATION |
| **Owner** | @devops |
| **Created** | 2026-01-27 |
| **Last Updated** | 2026-01-27 |
| **Maintained By** | DevOps Team |
| **Review Cycle** | Quarterly |

---

**END OF DOCUMENT**

For questions or implementation support, contact: @devops / DevOps Engineering Team
