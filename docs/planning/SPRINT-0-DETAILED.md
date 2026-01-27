# Sprint 0: Foundation & Setup (Week 1)

## Overview

**Duration:** 5 working days (40 hours)
**Team Size:** 3 developers
**Goal:** Establish development infrastructure, tooling, and quality standards
**Gate Decision:** Go/No-Go for Sprint 1 (Component Decomposition)

---

## Daily Schedule & Allocation

### Monday: Row-Level Security (RLS) Setup (8 hours)

**Lead:** Architect (4h) + Full-stack Dev (4h)

#### Morning (Architect)
```
09:00-10:00  Team Kickoff & Sprint Planning
10:00-12:00  Analyze Current Supabase Schema
```

**Tasks:**
1. Review existing Supabase tables:
   - users, accounts, transactions, goals, investments, budgets, patrimony
2. Design RLS policies:
   - All tables: `user_id = auth.uid()`
   - Admin role: Bypass RLS for impersonation
   - Cross-tenant isolation validation

**Deliverable:** RLS policy matrix document

#### Afternoon (Full-stack Dev)
```
13:00-14:00  Database Policy Testing Setup
14:00-17:00  Implement RLS Policies
```

**Tasks:**
1. Create Supabase migration file
2. Implement RLS policies on all tables
3. Test with test users (admin, regular)
4. Validate impersonation flow still works

**Deliverable:** RLS policies enabled, test users created

**Tests:**
```sql
-- Test regular user sees only their data
SELECT * FROM transactions WHERE user_id = 'test-user-1';
-- Should return 0 rows if table is empty for user

-- Test admin impersonation works
SELECT is_admin FROM users WHERE id = 'admin-user';
-- Should return true
```

---

### Tuesday: TypeScript Strict Mode & ESLint (8 hours)

**Lead:** Full-stack Dev (5h) + QA Specialist (3h)

#### Morning (Full-stack Dev)
```
09:00-10:30  Audit Current TypeScript Issues
10:30-12:00  Configure Strict Mode
```

**Tasks:**
1. Run TypeScript compiler in strict mode:
   ```bash
   npx tsc --noEmit --strict --skipLibCheck false
   ```
2. Document errors by category:
   - Missing type annotations
   - Implicit `any` types
   - Unsafe property access
   - Null/undefined checks

3. Prioritize fixes:
   - Context providers (critical)
   - Services (critical)
   - Components (medium priority)

**Deliverable:** Error categorization report

#### Afternoon (Full-stack Dev + QA Specialist)
```
13:00-14:30  Configure ESLint & Prettier
14:30-17:00  Fix Top 20 Issues
```

**Tasks:**
1. Install/configure ESLint with React plugin:
   ```bash
   npm install --save-dev eslint @eslint/js typescript-eslint
   ```
2. Create `.eslintrc.json`:
   ```json
   {
     "extends": ["eslint:recommended", "plugin:react/recommended"],
     "parserOptions": { "ecmaVersion": 2022, "sourceType": "module" },
     "rules": {
       "react/jsx-uses-react": "off",
       "react/react-in-jsx-scope": "off",
       "prefer-const": "warn",
       "no-unused-vars": "warn"
     }
   }
   ```
3. Fix top 20 blocking issues (types, imports)

**Deliverable:** ESLint passing, tsconfig.json in strict mode

**Test Command:**
```bash
npm run lint
npm run typecheck
```

---

### Wednesday: Error Boundaries & Fallbacks (8 hours)

**Lead:** QA Specialist (5h) + Full-stack Dev (3h)

#### Morning (QA Specialist)
```
09:00-10:30  Design Error Boundary Strategy
10:30-12:00  Create Error Boundary Component
```

**Tasks:**
1. Define error boundary levels:
   - App-level: Catch all unhandled errors
   - Page-level: Catch page-specific errors
   - Feature-level: Catch component errors

2. Create `src/components/ui/ErrorBoundary.tsx`:
   ```typescript
   interface ErrorBoundaryProps {
     children: React.ReactNode;
     level?: 'app' | 'page' | 'feature';
     onError?: (error: Error) => void;
   }

   export class ErrorBoundary extends React.Component<ErrorBoundaryProps> {
     // Catch errors during render
     componentDidCatch(error, info) {
       console.error('Error caught:', error);
       // Log to service/Sentry
     }

     render() {
       if (this.state.hasError) {
         return <ErrorFallback level={this.props.level} />;
       }
       return this.props.children;
     }
   }
   ```

**Deliverable:** ErrorBoundary component with tests

#### Afternoon (Full-stack Dev)
```
13:00-14:30  Integrate Error Boundaries
14:30-17:00  Test & Document
```

**Tasks:**
1. Wrap App.tsx with app-level boundary
2. Wrap Route pages with page-level boundaries
3. Wrap Context providers with feature boundaries
4. Create error fallback UI components

**Test Scenarios:**
```javascript
// Test throwing error in component
<ErrorBoundary level="feature">
  <ComponentThatThrows />
</ErrorBoundary>

// Verify error caught and fallback shown
expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
```

**Deliverable:** Error boundaries integrated, 5 test cases passing

---

### Thursday: CI/CD Pipeline Setup (8 hours)

**Lead:** Full-stack Dev (6h) + QA Specialist (2h)

#### Morning (Full-stack Dev)
```
09:00-11:00  GitHub Actions Configuration
11:00-12:00  Test Workflow Trigger
```

**Tasks:**
1. Create `.github/workflows/test.yml`:
   ```yaml
   name: Tests & Lint
   on: [push, pull_request]
   jobs:
     test:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
           with:
             node-version: '18'
         - run: npm ci
         - run: npm run lint
         - run: npm run typecheck
         - run: npm run test
   ```

2. Create `.github/workflows/build.yml`:
   ```yaml
   name: Build
   on: [push]
   jobs:
     build:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
         - run: npm ci
         - run: npm run build
         - uses: actions/upload-artifact@v3
           with:
             name: dist
             path: dist/
   ```

3. Set branch protection rules:
   - Require tests to pass
   - Require review on main

**Deliverable:** CI/CD workflows active

#### Afternoon (QA Specialist)
```
13:00-14:30  Setup GitHub Secrets & Environment
14:30-17:00  Test CI/CD End-to-End
```

**Tasks:**
1. Configure environment variables in GitHub:
   - GEMINI_API_KEY (masked)
   - SUPABASE_URL
   - SUPABASE_ANON_KEY

2. Create `.env.example`:
   ```
   VITE_GEMINI_API_KEY=your_api_key
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_key
   ```

3. Test workflow:
   - Create test PR
   - Verify tests run
   - Verify build passes
   - Merge and verify main workflow

**Deliverable:** CI/CD passing on test PR, main branch protected

---

### Friday: Test Infrastructure & Kickoff Readiness (8 hours)

**Lead:** QA Specialist (5h) + Full-stack Dev (3h)

#### Morning (QA Specialist)
```
09:00-10:30  Setup Vitest Configuration
10:30-12:00  Create Test Utilities & Helpers
```

**Tasks:**
1. Configure `vitest.config.ts`:
   ```typescript
   import { defineConfig } from 'vitest/config';
   import react from '@vitejs/plugin-react';

   export default defineConfig({
     plugins: [react()],
     test: {
       globals: true,
       environment: 'jsdom',
       setupFiles: ['./src/test/setup.ts'],
       coverage: {
         provider: 'v8',
         reporter: ['text', 'json', 'html'],
         exclude: ['node_modules/', 'src/test/']
       }
     }
   });
   ```

2. Create test setup file (`src/test/setup.ts`):
   ```typescript
   import { expect, afterEach, vi } from 'vitest';
   import { cleanup } from '@testing-library/react';

   afterEach(() => cleanup());

   // Mock localStorage
   const localStorageMock = {
     getItem: vi.fn(),
     setItem: vi.fn(),
     removeItem: vi.fn(),
     clear: vi.fn()
   };
   global.localStorage = localStorageMock as any;
   ```

3. Create test utilities:
   - `renderWithContext()` - Render component with Auth/Finance contexts
   - `mockAuthContext()` - Mock auth state
   - `mockFinanceContext()` - Mock finance state

**Deliverable:** Test infrastructure ready, utilities created

#### Afternoon (Full-stack Dev + QA Specialist)
```
13:00-14:30  Write First Test Suite
14:30-15:30  Sprint 0 Retrospective
15:30-17:00  Sprint 1 Planning
```

**Tasks:**
1. Write tests for ErrorBoundary:
   ```typescript
   describe('ErrorBoundary', () => {
     it('catches errors and shows fallback', () => {
       // Test implementation
     });

     it('logs errors to console', () => {
       // Test implementation
     });
   });
   ```

2. Achieve 5% test coverage as baseline

3. Document test patterns for sprint 1

4. Sprint 0 Review:
   - RLS policies deployed ✓
   - TS strict mode enabled ✓
   - Error boundaries working ✓
   - CI/CD pipeline live ✓
   - Test infrastructure ready ✓

5. **Go/No-Go Decision:**

   **GO CRITERIA** (All must pass):
   - [ ] RLS policies protecting user data
   - [ ] TypeScript strict mode enabled, no blocking errors
   - [ ] Error boundaries catching errors in all layers
   - [ ] CI/CD pipeline passing on main
   - [ ] Test framework running, 5% baseline coverage
   - [ ] Team understands test patterns

   **NO-GO CRITERIA** (Any of these fails):
   - [ ] RLS allowing unauthorized data access
   - [ ] TS strict mode has > 20 blocking errors
   - [ ] Error boundaries not catching errors
   - [ ] CI/CD pipeline failing
   - [ ] Test framework not working
   - [ ] Team concerns on readiness

**Deliverable:** Go/No-Go decision documented, Sprint 1 kickoff scheduled

---

## Success Criteria for Sprint 0

| Criterion | Target | Method | Owner |
|-----------|--------|--------|-------|
| **RLS Policies** | All tables protected | Query testing | Architect |
| **TypeScript** | Strict mode enabled | `tsc --strict` passes | Full-stack Dev |
| **ESLint** | 0 errors, < 10 warnings | `npm run lint` | Full-stack Dev |
| **Error Boundaries** | 3 levels deployed | Component integration tests | QA Specialist |
| **CI/CD** | Green on main | GitHub Actions status | Full-stack Dev |
| **Tests** | 5% coverage baseline | Coverage report | QA Specialist |
| **Team Alignment** | 100% ready | Team vote | All |

---

## Daily Standup Template

**Time:** 09:00 UTC (before work begins)
**Duration:** 15 minutes
**Attendees:** Architect, Full-stack Dev, QA Specialist

```
Architect:
- Yesterday: ___
- Today: ___
- Blockers: ___

Full-stack Dev:
- Yesterday: ___
- Today: ___
- Blockers: ___

QA Specialist:
- Yesterday: ___
- Today: ___
- Blockers: ___
```

---

## Risk & Escalation

### Risk Register

| Risk | Impact | Mitigation | Owner |
|------|--------|-----------|-------|
| Supabase RLS syntax errors | 4h delay | Test policies in staging first | Architect |
| TS issues blocking compilation | 6h delay | Prioritize critical services | Full-stack Dev |
| ESLint rule conflicts | 3h delay | Use recommended config | Full-stack Dev |
| CI/CD auth issues | 5h delay | Set env vars early | Full-stack Dev |
| Test framework JSDOM issues | 4h delay | Spike test setup Monday | QA Specialist |

### Escalation Path

1. **Design issues:** Escalate to CTO/Architect
2. **Blocking errors:** Daily standup, reassign if needed
3. **Environment issues:** DevOps/CI team support
4. **Scope creep:** Defer to Sprint 1

---

## Outputs & Deliverables

### By EOD Friday:
- [ ] RLS policies on all tables
- [ ] TypeScript strict mode enabled
- [ ] ESLint configured & passing
- [ ] Error boundary components
- [ ] CI/CD workflows active
- [ ] Test infrastructure running
- [ ] Go/No-Go decision made
- [ ] Sprint 1 detailed plan ready

### Documentation:
- RLS policy matrix (Confluence/Wiki)
- TypeScript migration notes
- Error handling guidelines
- CI/CD runbook
- Test patterns guide

---

**Sprint 0 Kickoff:** Monday, January 27, 2026, 09:00 UTC
**Sprint 0 Exit Gate:** Friday, January 31, 2026, 17:00 UTC
**Sprint 1 Begins:** Monday, February 3, 2026, 09:00 UTC
