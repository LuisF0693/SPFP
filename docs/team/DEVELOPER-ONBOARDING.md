# SPFP Developer Onboarding Guide

Welcome to the SPFP (Sistema de Planejamento Financeiro Pessoal) refactor team! This guide will help you get up and running in 6-8 hours. By the end, you'll understand the codebase, have a working development environment, and be ready to pick up your first story.

**Time investment:** 6-8 hours (spread over 1-2 days)

---

## Table of Contents

1. [Welcome & Context](#welcome--context) (10 min)
2. [Environment Setup](#environment-setup) (30 min)
3. [Codebase Orientation](#codebase-orientation) (2 hours)
4. [Development Workflow](#development-workflow) (1 hour)
5. [Running Tests](#running-tests) (30 min)
6. [Your First Week Tasks](#your-first-week-tasks) (1 hour)
7. [Debugging & Troubleshooting](#debugging--troubleshooting) (30 min)
8. [Architecture Deep Dive](#architecture-deep-dive) (1 hour)
9. [Key Documentation](#key-documentation)
10. [Your First PR Checklist](#your-first-pr-checklist)

---

## Welcome & Context

### What is SPFP? (2-minute read)

SPFP is a **personal financial planning and AI-powered insights application** built with modern React. Think of it as a comprehensive financial dashboard that helps users:

- Track income, expenses, and accounts
- Set and monitor financial goals
- Analyze investments and wealth
- Get AI-powered financial insights via Google Gemini
- Plan budgets and monitor cash flow

**Tech Stack:**
- **Frontend:** React 19 + TypeScript + Vite
- **Styling:** TailwindCSS with glassmorphism & dark mode
- **Backend:** Supabase (PostgreSQL + Auth)
- **AI:** Google Gemini API
- **Charts:** Recharts for data visualization
- **Routing:** React Router DOM v7
- **Testing:** Vitest + React Testing Library

### Why We're Refactoring (Business Case)

The current codebase has accumulated **significant technical debt** across three main areas:

1. **Security Issues:** Missing Row-Level Security (RLS) policies on Supabase tables (potential cross-user data leakage)
2. **Type Safety:** TypeScript not in strict mode, many implicit `any` types, unsafe property access
3. **Code Quality:** Monolithic components, incomplete test coverage, performance issues, accessibility gaps

**Business Impact:**
- Security vulnerabilities put user financial data at risk
- Poor type safety leads to runtime errors and crashes
- Monolithic components are hard to maintain and slow to render
- Low test coverage makes refactoring risky

**Refactor Goal:** Ship a production-ready financial app with enterprise-grade security, type safety, performance, and accessibility over the next 6 weeks.

### Your Role in the Project

You are joining the core **refactor squad**. Here's how we work:

- **Story-driven development:** All work is organized into stories (user-facing features/fixes) tracked in `docs/stories/`
- **Pair collaboration:** You'll pair with other team members, share context via standups
- **Code review culture:** Every change goes through peer review before merge
- **Definition of Done (DoD):** Lint + type check + tests + PR approval required

Your contribution directly impacts the quality and timeline of the entire refactor.

### Timeline: 6 Weeks to Production

```
Week 1 (Sprint 0):  Foundation & Tooling Setup
Weeks 2-4 (Sprint 1): Component Decomposition & Type Safety
Weeks 5-6 (Sprint 2): Testing, Performance, Polish & Release
```

Each sprint has clear acceptance criteria and deliverables.

---

## Environment Setup

**Time: 30 minutes**

### Prerequisites

Ensure you have these installed:

- **Node.js** v18+ (check: `node --version`)
- **npm** v9+ (check: `npm --version`)
- **Git** (check: `git --version`)
- **VS Code** (recommended) or your preferred editor
- **GitHub CLI** (optional, but helpful): `gh auth status`

### Step 1: Clone the Repository

```bash
# Clone the repo
git clone https://github.com/allfluenceinc/spfp.git
cd spfp

# Or if you've already cloned it:
cd D:\Projetos Antigravity\SPFP\SPFP
```

**Verification:** You should see this directory structure:
```
spfp/
├── src/
├── docs/
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

### Step 2: Install Dependencies

```bash
npm install
```

**Expected output:** Installs ~500+ packages into `node_modules/`

**Verification:**
```bash
npm list react
# Should show: react@19.x.x
```

### Step 3: Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
# Copy the example (if it exists)
cp .env.example .env.local

# Or create manually:
touch .env.local
```

**Required variables:**

```env
# Gemini API Key (get from https://aistudio.google.com/app/apikeys)
GEMINI_API_KEY=your_api_key_here

# Supabase credentials (ask DevOps or team lead)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

**Important:** `.env.local` is already in `.gitignore` — never commit API keys!

### Step 4: Setup Supabase Local (Optional but Recommended)

For local development without hitting the cloud Supabase:

```bash
# Install Supabase CLI
npm install -g supabase

# Start local Supabase (requires Docker)
supabase start

# Stop when done
supabase stop
```

**If Docker isn't available:** You can use cloud Supabase for development. Just be careful with shared credentials.

### Step 5: Start Development Server

```bash
npm run dev
```

**Expected output:**
```
  VITE v5.x.x  ready in 456 ms

  ➜  Local:   http://localhost:3000/
  ➜  press h to show help
```

**Verification:** Open http://localhost:3000 in your browser. You should see the SPFP login page.

### Step 6: Run Tests (Should Pass)

```bash
npm run test
```

**Expected output:**
```
✓ src/test/utils/formatting.test.ts (4 tests)
✓ src/test/services/aiService.test.ts (8 tests)
...
Test Files  12 passed (12)
     Tests  150 passed (150)
```

If any tests fail, check the error logs and ask on Slack or in the next standup.

### Step 7: Verify Type Checking

```bash
npm run typecheck
```

**Expected output:**
```
Type-checking src/...
✓ Type checking passed
```

### Step 8: Run Linter

```bash
npm run lint
```

**Expected output:**
```
✓ ESLint + Prettier checks passed
```

If there are lint errors, don't worry — they're usually fixable with `npm run lint:fix`.

### Troubleshooting Environment Setup

| Issue | Solution |
|-------|----------|
| `npm install` fails | Delete `node_modules/` and `package-lock.json`, then retry |
| Port 3000 already in use | `npm run dev -- --port 3001` or kill the process using port 3000 |
| `.env.local` not being read | Restart dev server after creating the file |
| Supabase connection fails | Check credentials in `.env.local` or use cloud Supabase temporarily |
| Tests timeout | Increase timeout: `npm run test -- --testTimeout=10000` |

---

## Codebase Orientation

**Time: 2 hours**

### Project Structure Overview

```
src/
├── components/                # UI components organized by feature
│   ├── ui/                   # Reusable UI components (Button, Modal, Loading, etc)
│   ├── Layout.tsx            # Main layout wrapper
│   ├── Dashboard.tsx         # Financial dashboard
│   ├── Accounts.tsx          # Account management
│   ├── TransactionForm.tsx   # Add/edit transactions
│   ├── TransactionList.tsx   # View & delete transactions
│   ├── Goals.tsx             # Financial goals
│   ├── Investments.tsx       # Investment tracking
│   ├── Patrimony.tsx         # Wealth tracking
│   ├── Reports.tsx           # Financial reports
│   ├── Insights.tsx          # AI-powered insights
│   ├── Budget.tsx            # Budget management
│   ├── AdminCRM.tsx          # Admin panel & impersonation
│   └── (10+ more components)
│
├── context/                   # React Context API providers
│   ├── AuthContext.tsx       # Auth state (login, Google OAuth, user session)
│   └── FinanceContext.tsx    # Finance state (accounts, transactions, goals, etc)
│
├── services/                  # Business logic & API integrations
│   ├── aiService.ts          # Unified AI service (Google Gemini)
│   ├── geminiService.ts      # Gemini API integration
│   ├── aiHistoryService.ts   # AI chat history persistence
│   ├── pdfService.ts         # PDF generation & export
│   ├── csvService.ts         # CSV import/export
│   ├── MarketDataService.ts  # Market data for investments
│   ├── projectionService.ts  # Financial projections
│   └── logService.ts         # User event logging
│
├── types/                     # TypeScript interfaces & types
│   └── index.ts              # All global types
│
├── utils/                     # Utility functions
│   ├── formatting.ts         # Currency, date formatting
│   ├── calculations.ts       # Financial calculations
│   └── helpers.ts            # General helpers
│
├── data/                      # Static data & constants
│   └── initialData.ts        # Initial state for accounts, categories
│
├── test/                      # Test files (mirrors src/ structure)
│   ├── utils/
│   ├── services/
│   └── components/
│
├── App.tsx                    # Root component with routing
├── main.tsx                   # Entry point
└── supabase.ts               # Supabase client init
```

### Key Components to Know

#### 1. **App.tsx** - Entry Point
```typescript
// Handles:
// - Route definitions (/, /dashboard, /admin, /login, etc)
// - Private/Admin route guards
// - Layout wrapper
// - Error boundaries

// Key routes:
// / → Sales page (unauthenticated)
// /login → Login page
// /dashboard → Main financial dashboard
// /admin → Admin panel (admins only)
```

**What to know:** If you're adding a new page, register it here.

#### 2. **Layout.tsx** - Main Wrapper
```typescript
// Contains:
// - Sidebar navigation
// - Header with user menu
// - Theme toggle (dark/light mode)
// - Responsive layout

// Supports two modes:
// - mode="personal" → User's own finances
// - mode="crm" → Admin viewing client data
```

#### 3. **Dashboard.tsx** - Main Dashboard
```typescript
// Displays:
// - Net worth card
// - Monthly chart (income vs expenses)
// - Account balances
// - Recent transactions
// - Financial widgets (configurable layout)

// Key props:
// - Receives all financial data from FinanceContext
// - Uses Recharts for visualization
```

#### 4. **TransactionForm.tsx & TransactionList.tsx** - Core Features
```typescript
// TransactionForm:
// - Add/edit transactions
// - Support recurring transactions (groupId)
// - Select account, category, date
// - Impulse alert warnings (for large expenses)

// TransactionList:
// - Display all transactions (paginated)
// - Delete transactions
// - Filter by category, account, date
// - Export to CSV
```

#### 5. **Insights.tsx** - AI Insights
```typescript
// Features:
// - Chat interface with Google Gemini
// - Financial analysis & recommendations
// - Uses unified aiService.ts
// - Message history stored in Supabase

// Example insights:
// - "You spent 40% more on dining than last month"
// - "Consider investing idle cash in index funds"
```

### Key Context Providers

#### 1. **AuthContext.tsx** - Authentication

```typescript
// Manages:
interface AuthContext {
  user: User | null;                          // Current logged-in user
  session: Session | null;                    // Auth session
  loading: boolean;                           // Loading state
  isAdmin: boolean;                           // Is user an admin?

  // Methods:
  signInWithGoogle(): Promise<void>;
  signInWithEmail(email, password): Promise<void>;
  registerWithEmail(email, password): Promise<void>;
  logout(): Promise<void>;
}

// Usage in components:
import { useAuth } from '@/context/AuthContext';

function MyComponent() {
  const { user, isAdmin, logout } = useAuth();
  return <div>{user?.email}</div>;
}
```

**Key feature:** Admin emails are hardcoded in `ADMIN_EMAILS` array. Contact team lead to add new admins.

#### 2. **FinanceContext.tsx** - Financial Data

```typescript
// Manages:
interface GlobalState {
  accounts: Account[];
  transactions: Transaction[];
  categories: Category[];
  goals: Goal[];
  investments: Investment[];
  budgets: Budget[];
  patrimony: PatrimonyEntry[];
  // ... more state
}

// Methods:
- addAccount(account)
- updateAccount(id, data)
- deleteAccount(id)
- addTransaction(transaction)
- deleteTransaction(id)
- deleteTransactionGroup(groupId)  // Delete all recurring instances
- addGoal(goal)
- updateGoal(id, data)
- // ... similar methods for all data types

// Special methods:
- loadClientData(userId)          // Admin impersonation
- stopImpersonating()              // Exit impersonation
- syncWithSupabase()              // Sync data to cloud

// Usage in components:
import { useFinance } from '@/context/FinanceContext';

function MyComponent() {
  const { transactions, addTransaction } = useFinance();
  return <div>{transactions.length} transactions</div>;
}
```

**Key feature:** Data syncs to localStorage automatically (per-user storage keys).

### Service Layer Pattern

Services contain business logic and API integrations:

```typescript
// Example: aiService.ts
export const aiService = {
  // Send message to AI
  async sendMessage(
    message: string,
    history: Message[],
    systemPrompt: string,
    options?: { provider?: 'gemini' | 'openai'; model?: string }
  ): Promise<string>,

  // Get available models
  async getAvailableModels(): Promise<string[]>,
};

// Example: pdfService.ts
export const pdfService = {
  // Generate PDF report
  async generateTransactionReport(
    transactions: Transaction[],
    title?: string
  ): Promise<Blob>,

  // Download PDF
  downloadReport(blob: Blob, filename: string): void,
};

// Usage in components:
import { aiService } from '@/services/aiService';
import { pdfService } from '@/services/pdfService';

async function handleExport() {
  const pdf = await pdfService.generateTransactionReport(transactions);
  pdfService.downloadReport(pdf, 'report.pdf');
}
```

**Key principle:** Services are pure business logic, components use them.

### TypeScript Types System

All types are defined in `src/types/index.ts`:

```typescript
// Account
interface Account {
  id: string;
  user_id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'investment';
  balance: number;
  created_at: string;
}

// Transaction
interface Transaction {
  id: string;
  user_id: string;
  account_id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  groupId?: string;      // For recurring transactions
  created_at: string;
}

// Goal
interface Goal {
  id: string;
  user_id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: string;
  created_at: string;
}

// ... and many more types
```

**Important:** When you need to use financial data, always check the type definition first. This prevents `any` types and runtime errors.

### Utils & Helpers

Common utilities you'll use:

```typescript
// src/utils/formatting.ts
export const formatting = {
  formatCurrency(value: number, currency = 'BRL'): string,
  formatDate(date: string | Date, format = 'pt-BR'): string,
  formatPercent(value: number): string,
};

// src/utils/calculations.ts
export const calculations = {
  getTotalBalance(accounts: Account[]): number,
  getMonthlyExpenses(transactions: Transaction[], month: string): number,
  calculateInvestmentReturn(investment: Investment): number,
};

// Usage:
import { formatting, calculations } from '@/utils';

const balance = calculations.getTotalBalance(accounts);
const display = formatting.formatCurrency(balance);  // "R$ 10.000,00"
```

### Admin Impersonation System

**Important feature:** Admins can view client finances from the AdminCRM panel.

```typescript
// Flow:
1. Admin logs in
2. Goes to /admin
3. Selects a client to impersonate
4. FinanceContext loads client's data via loadClientData(userId)
5. Admin sees client's dashboard (with client's transactions, goals, etc)
6. Admin's original state is saved in localStorage
7. Admin clicks "Stop Impersonating"
8. Admin's original state is restored

// Key flags:
isImpersonating: boolean
impersonatedUserId: string | null

// Critical check in App.tsx (line 52):
if (!isImpersonating && user?.id) {
  syncWithSupabase();  // Only sync when viewing own data, not client data
}
```

**What to know:** Never use `user.id` directly for data filtering when impersonating. Always use the context's current state.

---

## Development Workflow

**Time: 1 hour**

### Git Branching Strategy

We follow a simple branching model:

```
main (production-ready code)
 ↑
 └─ sprint/* (feature branches for each sprint)
     ├─ sprint-1-rls-policies
     ├─ sprint-1-typescript-strict
     ├─ sprint-2-component-refactor
     └─ ...
```

### Creating a Feature Branch

```bash
# Always start from the latest main
git fetch origin
git checkout main
git pull origin main

# Create a feature branch for your story
# Format: sprint-{sprint-number}-{story-name}
git checkout -b sprint-1-rls-policies

# Or if it's a bug fix:
git checkout -b fix-transaction-import-bug

# Start working!
```

### Making Commits

Follow conventional commit format:

```bash
git add src/components/MyComponent.tsx src/types/index.ts

git commit -m "feat: implement transaction recurring feature [Story 001]"
```

**Conventional commit types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code reorganization (no behavior change)
- `test:` - Test additions/changes
- `docs:` - Documentation
- `chore:` - Maintenance (deps, config, etc)
- `perf:` - Performance improvement

**Good commit messages:**
- Start with type: `feat:`, `fix:`, etc
- Be concise but descriptive
- Reference story ID: `[Story 001]` or `[S-001]`
- Explain the "why", not just the "what"

**Examples:**
```bash
# Good
git commit -m "fix: prevent null reference in transaction filter [Story 005]"
git commit -m "refactor: extract CategorySelector into separate component"
git commit -m "test: add unit tests for calculations.ts"

# Avoid
git commit -m "update code"
git commit -m "fixed stuff"
git commit -m "WIP"
```

### Creating a Pull Request (PR)

```bash
# Push your branch to GitHub
git push origin sprint-1-rls-policies

# Create PR via GitHub CLI (recommended)
gh pr create --title "Implement RLS policies on all Supabase tables" \
  --body "$(cat <<'EOF'
## Summary
- Implements Row-Level Security (RLS) policies to prevent cross-user data leakage
- All tables now require auth.uid() = user_id check
- Admin role can bypass RLS for impersonation

## Test Plan
- [x] Regular user can only see their own transactions
- [x] Admin can impersonate and see client data
- [x] Cross-user queries return 0 rows

Fixes: Story-001
EOF
)"
```

Or create via GitHub web UI: https://github.com/allfluenceinc/spfp/pulls

**PR Template (what reviewers look for):**
```markdown
## Summary
(1-2 sentences explaining the change)

## Changes Made
- Bullet list of specific changes
- Line numbers if relevant

## Test Plan
- [x] Manual testing
- [x] Unit tests added
- [x] Integration tests pass
- [x] Lint & type check pass

## Screenshots (if UI change)
(Add before/after screenshots)

## Related Stories/Issues
Closes: #123
```

### Code Review Process

1. **You request review** from team lead or peer
2. **Reviewer checks:**
   - Does it solve the story acceptance criteria?
   - Is the code clean and maintainable?
   - Are tests sufficient?
   - Does it follow project patterns?
   - Are there security concerns?

3. **Feedback comes as:**
   - Comments on specific lines
   - Change requests (must be addressed)
   - Approvals (good to merge)

4. **You respond:**
   - Address each comment
   - Commit fixes (new commits, not amends)
   - Push to same branch
   - Re-request review

5. **Merge and deploy:**
   - Once approved, merge to main
   - CI/CD automatically runs tests & deploys

### Definition of Done (DoD)

Before marking a story as done:

- [ ] Code written and all tests pass locally
- [ ] `npm run lint` returns no errors
- [ ] `npm run typecheck` returns no errors
- [ ] PR created and reviewed
- [ ] All PR feedback addressed
- [ ] PR merged to main
- [ ] Story checkbox marked `[x]` in `docs/stories/`

**If DoD is not met, the story is not done.** No exceptions.

---

## Running Tests

**Time: 30 minutes**

### Test Structure

Tests are in `src/test/` and mirror the `src/` directory:

```
src/test/
├── utils/                    # Tests for utils/
│   ├── formatting.test.ts
│   ├── calculations.test.ts
│   └── helpers.test.ts
├── services/                 # Tests for services/
│   ├── aiService.test.ts
│   ├── pdfService.test.ts
│   └── csvService.test.ts
├── components/               # Tests for components/
│   ├── Dashboard.test.tsx
│   ├── TransactionForm.test.tsx
│   └── ...
└── integration/              # Integration tests
    └── auth-flow.test.ts
```

### Running Tests

**Run all tests:**
```bash
npm run test
```

**Run specific test file:**
```bash
npm run test -- src/test/utils/formatting.test.ts
```

**Run tests in watch mode (re-run on file change):**
```bash
npm run test -- --watch
```

**Run tests with UI (visual interface):**
```bash
npm run test:ui
```

Opens http://localhost:51204 with a visual test dashboard.

**Check test coverage:**
```bash
npm run test -- --coverage
```

Shows which lines are tested and which are not.

### Test Examples

**Unit test (testing a function):**
```typescript
// src/test/utils/formatting.test.ts
import { describe, it, expect } from 'vitest';
import { formatting } from '@/utils/formatting';

describe('formatting', () => {
  it('formats currency correctly', () => {
    const result = formatting.formatCurrency(1000, 'BRL');
    expect(result).toBe('R$ 1.000,00');
  });

  it('handles negative amounts', () => {
    const result = formatting.formatCurrency(-500, 'BRL');
    expect(result).toBe('-R$ 500,00');
  });
});
```

**Component test (testing a React component):**
```typescript
// src/test/components/Dashboard.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Dashboard } from '@/components/Dashboard';

describe('Dashboard', () => {
  it('displays net worth', () => {
    render(<Dashboard />);
    expect(screen.getByText(/net worth/i)).toBeInTheDocument();
  });

  it('shows recent transactions', () => {
    render(<Dashboard />);
    expect(screen.getByRole('heading', { name: /recent/i })).toBeInTheDocument();
  });
});
```

**Integration test (testing multiple components):**
```typescript
// src/test/integration/auth-flow.test.ts
import { describe, it, expect } from 'vitest';
import { signInWithEmail } from '@/services/authService';

describe('Auth Flow', () => {
  it('completes login flow', async () => {
    const result = await signInWithEmail('test@example.com', 'password');
    expect(result.user).toBeDefined();
  });
});
```

### Common Test Patterns

**Testing async functions:**
```typescript
it('fetches transactions', async () => {
  const transactions = await loadTransactions();
  expect(transactions.length).toBeGreaterThan(0);
});
```

**Mocking Supabase calls:**
```typescript
import { vi } from 'vitest';

it('handles API errors gracefully', async () => {
  vi.spyOn(supabaseClient, 'from').mockImplementation(() => ({
    select: () => Promise.reject(new Error('Network error'))
  }));

  expect(() => loadTransactions()).rejects.toThrow('Network error');
});
```

**Testing Context/Hooks:**
```typescript
import { renderHook, act } from '@testing-library/react';
import { useFinance } from '@/context/FinanceContext';

it('adds transaction correctly', () => {
  const { result } = renderHook(() => useFinance());

  act(() => {
    result.current.addTransaction({ /* ... */ });
  });

  expect(result.current.transactions.length).toBe(1);
});
```

### Test-Driven Development (TDD)

Our workflow encourages TDD:

1. **Write test first** describing expected behavior
2. **Run test** (fails, because code doesn't exist)
3. **Write minimal code** to make test pass
4. **Refactor** if needed
5. **Run all tests** to ensure no regressions

**Example:**
```typescript
// Step 1: Write test
it('calculates total balance from all accounts', () => {
  const accounts = [
    { id: '1', balance: 1000 },
    { id: '2', balance: 2000 }
  ];
  expect(calculations.getTotalBalance(accounts)).toBe(3000);
});

// Step 2: Implement function
export const calculations = {
  getTotalBalance(accounts: Account[]): number {
    return accounts.reduce((sum, acc) => sum + acc.balance, 0);
  }
};
```

### CI/CD Pipeline

When you push to GitHub:

1. GitHub Actions runs automatically
2. Runs: lint, typecheck, tests, build
3. If all pass → green check ✓ (can merge)
4. If any fail → red X (cannot merge)

**Before pushing, always run locally:**
```bash
npm run lint && npm run typecheck && npm run test
```

---

## Your First Week Tasks

**Time: 1 hour (understanding the tasks)**

### Sprint 0 Overview

Week 1 focuses on **foundation and tooling**. Your first week tasks:

1. **Pick a story** from Sprint 0
2. **Understand acceptance criteria**
3. **Estimate effort**
4. **Execute and deliver**

### How to Pick a Story

Stories are listed in `docs/stories/` and organized by sprint. **Sprint 0 stories include:**

1. **Story 001: RLS Policies** (Architect + Dev)
   - Difficulty: Medium
   - Time: 8 hours
   - Prerequisite: Understand Supabase RLS
   - Your role: Implement policies or test them

2. **Story 002: TypeScript Strict Mode** (Dev + QA)
   - Difficulty: High
   - Time: 12 hours
   - Prerequisite: Know TypeScript strictly modes
   - Your role: Enable strict mode and fix errors

3. **Story 003: Error Boundaries** (Dev)
   - Difficulty: Medium
   - Time: 6 hours
   - Prerequisite: Know React error boundaries
   - Your role: Implement error boundaries in critical components

4. **Story 004: CI/CD Pipeline** (DevOps + Dev)
   - Difficulty: Low
   - Time: 4 hours
   - Prerequisite: Know GitHub Actions
   - Your role: Verify tests run on each PR

5. **Story 005: Test Infrastructure** (Dev + QA)
   - Difficulty: Medium
   - Time: 8 hours
   - Prerequisite: Know Vitest
   - Your role: Setup test infrastructure

**Recommendation for first-time joiner:** Start with **Story 003 (Error Boundaries)** or **Story 004 (CI/CD)** — they're simpler and help you learn the codebase quickly.

### How to Estimate Effort

Each story has acceptance criteria. To estimate:

1. **Read the story** in full
2. **Count acceptance criteria** (each = ~1-2 hours)
3. **Add complexity multiplier:**
   - Simple (CRUD, utils): 1x
   - Medium (components, integrations): 1.5x
   - Complex (context changes, security): 2x

**Example:**
```
Story 003: Error Boundaries
Acceptance Criteria:
1. Implement ErrorBoundary component [ ] = 2h
2. Wrap Dashboard component [ ] = 1h
3. Wrap TransactionForm component [ ] = 1h
4. Add error logging to Supabase [ ] = 2h
5. Write tests for error recovery [ ] = 2h
6. Document error handling pattern [ ] = 1h

Total: 2+1+1+2+2+1 = 9 hours
Complexity multiplier: 1.5x (medium)
Estimate: 9 * 1.5 = 13 hours actual

Reality: Usually 10-15 hours (underestimate is common)
```

### Daily Standup Expectations

Attend or report async in Slack:

**Format (2 minutes max):**
1. What did you do yesterday?
2. What will you do today?
3. Any blockers?

**Example:**
```
Yesterday:
- Implemented ErrorBoundary component
- Added tests for error recovery
- 4 hours of work

Today:
- Wrap Dashboard in ErrorBoundary
- Wrap TransactionForm in ErrorBoundary
- Test error logging

Blockers:
- Waiting on DevOps for Supabase logging setup
```

### Code Review Checklist

When you submit a PR, make sure:

- [ ] Branch name follows convention: `sprint-1-story-name`
- [ ] Commits are atomic (1 logical change per commit)
- [ ] Commit messages follow conventional commit format
- [ ] PR title is clear and references story ID
- [ ] PR description includes:
  - What changed and why
  - How to test it
  - Screenshots if UI changed
  - Story ID/link
- [ ] All tests pass locally (`npm run test`)
- [ ] No lint errors (`npm run lint`)
- [ ] No type errors (`npm run typecheck`)
- [ ] Added/updated tests for new code
- [ ] Documentation updated if needed
- [ ] No console.logs or debug code left in

### Definition of Done (DoD) Checklist

Story is only done when:

- [ ] All acceptance criteria met
- [ ] All tests passing
- [ ] Lint & type check clean
- [ ] PR approved by peer
- [ ] PR merged to main
- [ ] Story checkbox marked `[x]` in docs/stories/
- [ ] No new console warnings/errors

---

## Debugging & Troubleshooting

**Time: 30 minutes (reference guide)**

### Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `Cannot read property 'xyz' of undefined` | Null pointer / missing data | Check null safety: `obj?.xyz` or `obj?.xyz ?? default` |
| `Type 'any' is not assignable to type 'X'` | Implicit any types | Declare type explicitly: `: User[]` not `: any[]` |
| `RLS policy violation` | User accessing other user's data | Check `user_id` filter in query |
| `Transaction not found` | Supabase sync issue | Check browser DevTools → Application → localStorage |
| `Module not found '@/components/X'` | Import path wrong | Check `@` alias in `tsconfig.json` and `vite.config.ts` |
| `Test timeout` | Async operation too slow | Increase timeout: `{ timeout: 10000 }` |
| `Port 3000 already in use` | Another process using port | Kill process or use different port: `--port 3001` |

### TypeScript Strict Mode Gotchas

Strict mode is ON. Common issues:

```typescript
// ❌ Error: Argument of type 'string | undefined' is not assignable to 'string'
const name: string = user?.name;

// ✅ Fix: Use non-null assertion (if you're certain it exists)
const name: string = user?.name!;

// ✅ Better: Use default value
const name: string = user?.name ?? 'Unknown';

// ❌ Error: Object possibly 'null'
const balance = account.balance;

// ✅ Fix: Check null first
const balance = account?.balance ?? 0;
```

### RLS Policy Debugging

If you get "permission denied" errors:

```sql
-- Check your current user ID
SELECT auth.uid();

-- Check if RLS is enabled on table
SELECT relname, rowsecurity
FROM pg_class
WHERE relname = 'transactions';

-- Check RLS policies for table
SELECT * FROM pg_policies
WHERE tablename = 'transactions';

-- Test policy manually (as postgres user)
SELECT * FROM transactions
WHERE user_id = 'your-uuid';
```

### Test Failures

If tests fail:

```bash
# 1. Run test with verbose output
npm run test -- --reporter=verbose

# 2. Run single test file to debug
npm run test -- src/test/components/Dashboard.test.tsx

# 3. Run with UI to see which assertions fail
npm run test:ui

# 4. Check console output in test
console.log('Debug:', data);  // Will appear in test output
```

### CI/CD Pipeline Issues

If GitHub Actions fails:

1. **Click "Details" in the PR** to see full log
2. **Read the error** carefully (usually clear)
3. **Common issues:**
   - Tests failing: Run `npm run test` locally
   - Lint errors: Run `npm run lint -- --fix`
   - Type errors: Run `npm run typecheck`
   - Build errors: Run `npm run build`

### Support Channels

When you're stuck:

1. **Slack**: #spfp-dev channel
2. **GitHub Discussions**: Ask in repo
3. **Daily Standup**: Bring it up with team
4. **Code Review**: Reviewers often help debug

**Before asking:**
- Have you run `npm run test` and `npm run typecheck`?
- Have you checked the error message carefully?
- Have you searched existing GitHub issues?
- Have you tried restarting the dev server?

---

## Architecture Deep Dive

**Time: 1 hour (optional, advanced)**

### State Management: Context API

We use React Context API for global state (no Redux, no Zustand).

**Why Context API?**
- Built into React (no extra dependencies)
- Sufficient for financial app complexity
- Easy to understand for new devs

**How it works:**

```typescript
// 1. Define state shape
interface GlobalState {
  transactions: Transaction[];
  accounts: Account[];
  // ...
}

// 2. Create context
const FinanceContext = createContext<GlobalState | undefined>(undefined);

// 3. Create provider component
export function FinanceProvider({ children }) {
  const [state, setState] = useState<GlobalState>(initialState);

  const addTransaction = (tx) => {
    setState(prev => ({
      ...prev,
      transactions: [...prev.transactions, tx]
    }));
  };

  return (
    <FinanceContext.Provider value={{ ...state, addTransaction }}>
      {children}
    </FinanceContext.Provider>
  );
}

// 4. Create hook for easy access
export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) throw new Error('useFinance must be inside FinanceProvider');
  return context;
}

// 5. Use in components
function Dashboard() {
  const { transactions, addTransaction } = useFinance();
  // ...
}
```

**Optimization:** Context API can cause unnecessary re-renders. If performance becomes issue, consider splitting context by domain (transactions context, accounts context, etc).

### Component Composition Pattern

We follow a strict component hierarchy:

```
App (routing)
  └─ Layout (header, sidebar)
      └─ Dashboard (main page)
          ├─ NetWorthCard (dumb component)
          ├─ MonthlyChart (dumb component)
          ├─ RecentTransactions (smart component)
          │   └─ TransactionRow (dumb component)
          └─ BalanceCard (dumb component)
```

**Smart components (containers):**
- Manage state
- Connect to Context/Services
- Pass data to dumb components

**Dumb components (presentation):**
- Receive data via props only
- No Context access
- Highly reusable

**Example:**
```typescript
// Smart component (Dashboard.tsx)
import { useFinance } from '@/context/FinanceContext';
import { RecentTransactions } from './RecentTransactions';

export function Dashboard() {
  const { transactions } = useFinance();
  return <RecentTransactions transactions={transactions} />;
}

// Dumb component (RecentTransactions.tsx)
interface Props {
  transactions: Transaction[];
}
export function RecentTransactions({ transactions }: Props) {
  return (
    <div>
      {transactions.slice(0, 5).map(tx => (
        <TransactionRow key={tx.id} transaction={tx} />
      ))}
    </div>
  );
}
```

### Service Layer Pattern

Services are pure functions/classes for business logic:

```typescript
// ✅ Good: Service does work, component uses result
const { data, error } = await transactionService.getMonthlyTotal();

// ❌ Bad: Business logic mixed into component
const total = transactions
  .filter(tx => tx.date.startsWith('2026-01'))
  .reduce((sum, tx) => sum + tx.amount, 0);
```

**When to create a service:**
- Multiple components need same logic
- Logic involves API calls or calculations
- Logic is complex or hard to test in component

**Example service:**
```typescript
// src/services/transactionService.ts
export const transactionService = {
  async getMonthlyTotal(month: string): Promise<number> {
    const { data, error } = await supabaseClient
      .from('transactions')
      .select('amount')
      .gte('date', `${month}-01`)
      .lte('date', `${month}-31`);

    if (error) throw error;
    return data.reduce((sum, tx) => sum + tx.amount, 0);
  },

  calculateBalance(transactions: Transaction[]): number {
    return transactions.reduce((sum, tx) => sum + tx.amount, 0);
  }
};
```

### Error Handling Strategy

We're implementing comprehensive error handling:

```typescript
// 1. Error Boundaries for React errors
<ErrorBoundary fallback={<ErrorPage />}>
  <Dashboard />
</ErrorBoundary>

// 2. Try-catch for async operations
async function loadTransactions() {
  try {
    const data = await transactionService.getAll();
    return data;
  } catch (error) {
    console.error('Failed to load transactions:', error);
    throw new Error(`Failed to load transactions: ${error.message}`);
  }
}

// 3. User-friendly error messages
try {
  await deleteTransaction(id);
} catch (error) {
  showToast('Failed to delete transaction. Please try again.', 'error');
}
```

### Performance Optimization

Key optimizations we track:

1. **Memoization**: Prevent unnecessary re-renders
   ```typescript
   const MemoizedChart = React.memo(Chart);
   ```

2. **Code splitting**: Load components on-demand
   ```typescript
   const Insights = lazy(() => import('@/components/Insights'));
   ```

3. **Pagination**: Don't load all 10k transactions at once
   ```typescript
   const [page, setPage] = useState(1);
   const transactions = allTransactions.slice(
     (page - 1) * 20,
     page * 20
   );
   ```

4. **Lazy loading**: Images, charts, heavy components
   ```typescript
   const InvestmentChart = lazy(() => import('@/components/InvestmentChart'));
   <Suspense fallback={<Skeleton />}>
     <InvestmentChart />
   </Suspense>
   ```

### Security Best Practices

1. **Never expose API keys**: Use `.env.local` (in .gitignore)
2. **Validate RLS**: Always assume user could be compromised
3. **Escape user input**: Prevent XSS attacks
4. **Use parameterized queries**: Prevent SQL injection (Supabase handles this)
5. **Check auth before mutations**: Admins should only see /admin route

---

## Key Documentation

Critical docs to read (in order):

### Essential (Read Today)

1. **CLAUDE.md** (5 min)
   - Project overview
   - Tech stack
   - File structure
   - Key patterns
   - Location: `D:\Projetos Antigravity\SPFP\SPFP\CLAUDE.md`

2. **docs/architecture/tech-stack.md** (10 min)
   - Detailed tech stack breakdown
   - Version info
   - Why each technology

3. **docs/planning/SPRINT-0-DETAILED.md** (20 min)
   - Sprint 0 breakdown
   - Daily tasks
   - Acceptance criteria

### Important (Read This Week)

4. **docs/stories/INDEX.md** (10 min)
   - All 50+ stories overview
   - Difficulty ratings
   - Dependencies

5. **docs/stories/epic-technical-debt.md** (15 min)
   - Why we're refactoring
   - What's being fixed
   - Success metrics

6. **docs/architecture/source-tree.md** (15 min)
   - Detailed file structure
   - Component relationships
   - Data flow

### Reference (Bookmark These)

7. **docs/architecture/coding-standards.md**
   - Code style rules
   - TypeScript conventions
   - Component patterns

8. **CONTRIBUTING.md** (when it exists)
   - PR guidelines
   - Commit conventions
   - Review process

9. **docs/sessions/2026-01/HANDOFF-NOTES.md**
   - Previous sprint notes
   - Known issues
   - Next steps

---

## Your First PR Checklist

Before submitting your first PR, verify:

### Pre-Development

- [ ] Story selected and understood
- [ ] Acceptance criteria documented
- [ ] Time estimate written down
- [ ] Dependencies checked (doesn't block others)

### Branch Creation

- [ ] Fetched latest main: `git fetch origin && git pull origin main`
- [ ] Branch named correctly: `sprint-1-story-name`
- [ ] Branch created: `git checkout -b sprint-1-story-name`

### Development

- [ ] Code follows project patterns (Context, Services, Components)
- [ ] TypeScript strict mode: no `any`, no casts
- [ ] Tests written for new code
- [ ] Comments for complex logic only
- [ ] No console.log() or debug code left
- [ ] Verified locally: `npm run dev`

### Quality Checks

- [ ] All tests pass: `npm run test` ✓
- [ ] No lint errors: `npm run lint` ✓
- [ ] No type errors: `npm run typecheck` ✓
- [ ] Code builds: `npm run build` ✓
- [ ] Tested the feature manually in browser

### Git & PR

- [ ] Commits are atomic (1 logical change each)
- [ ] Commit messages follow convention
- [ ] Pushed to GitHub: `git push origin sprint-1-story-name`
- [ ] Created PR with full description
- [ ] PR title is clear and references story
- [ ] PR description includes:
  - [ ] What changed and why
  - [ ] How to test (manual steps)
  - [ ] Screenshots (if UI change)
  - [ ] Related story ID

### Code Review

- [ ] Requested review from team member
- [ ] Addressed all feedback comments
- [ ] Pushed fixes as new commits (not amend)
- [ ] Re-requested review after changes
- [ ] Got approval from reviewer

### Merge & Handoff

- [ ] PR approved
- [ ] Merged to main
- [ ] Verified CI/CD passed
- [ ] Story marked `[x]` done in docs/stories/
- [ ] Updated any documentation
- [ ] Ready to demo or hand off

---

## What's Next?

### After Onboarding (in order)

1. **Read CLAUDE.md** completely (today)
2. **Setup your environment** (today)
3. **Run the app** and explore manually (today)
4. **Pick your first story** (tomorrow)
5. **Estimate effort** and discuss with team
6. **Start developing** (work on story)
7. **Submit PR** when ready
8. **Respond to feedback** and iterate
9. **Merge and move to next story**

### First 30 Days

```
Week 1:  Onboarding + 1 story (foundation)
Week 2:  2-3 stories (type safety, error handling)
Week 3:  2-3 stories (component refactoring)
Week 4:  3-4 stories (testing, performance)
```

By day 30, you should:
- Know the codebase well
- Have shipped 8-10 PR's
- Be comfortable with the workflow
- Be mentoring new team members

### Questions?

Reach out on Slack #spfp-dev:
- `@Architecture` for design questions
- `@Dev` for code/implementation questions
- `@QA` for testing questions
- `@PM` for story/scope questions

---

## Final Notes

### Success Criteria for New Dev

You're successful when you can:

- [ ] Explain what SPFP does and why we're refactoring
- [ ] Navigate the codebase without getting lost
- [ ] Setup your dev environment in < 30 min
- [ ] Write and run tests
- [ ] Follow git/PR workflow without guidance
- [ ] Debug TypeScript strict mode errors
- [ ] Estimate story effort accurately
- [ ] Ship a PR that gets approved first time
- [ ] Help other team members

### Pro Tips

1. **Ask early.** Better to ask "dumb" questions in standup than spend 2 hours stuck
2. **Read code.** Best way to learn is reading similar implementations
3. **Break it down.** Big stories are always easier when split into smaller tasks
4. **Test first.** Write tests before code (TDD mindset)
5. **Keep branches small.** Easier to review, easier to merge, easier to debug
6. **Document as you go.** Future you (and teammates) will thank you
7. **Celebrate wins.** First merged PR? Great! You're part of the team now

### Common Mistakes to Avoid

- ❌ Committing to main instead of feature branch
- ❌ Pushing without running tests locally
- ❌ Creating huge PRs (> 400 lines changed)
- ❌ Using mock data when real data exists
- ❌ Ignoring TypeScript errors
- ❌ Not reading full story acceptance criteria
- ❌ Merging PR without approval
- ❌ Forgetting to update story checkboxes

### Remember

This is a **6-week refactor to production quality**. Your contribution matters. Every bug you catch, every test you write, every PR you ship makes the product better for thousands of users.

Welcome to the team! Let's build something great together.

---

**Questions? Reach out in #spfp-dev or create a GitHub discussion.**

**Last updated:** 2026-01-27
**Maintained by:** Architecture Team
