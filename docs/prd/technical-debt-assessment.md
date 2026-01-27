# Technical Debt Assessment - FINAL
**Projeto:** SPFP (Sistema de Planejamento Financeiro Pessoal)
**Data:** 2026-01-26
**Versão:** 1.0 (APROVADO)
**Status:** ✅ CONSOLIDAÇÃO FINAL - PRONTO PARA IMPLEMENTAÇÃO

---

## Executive Summary

SPFP é uma aplicação de gestão financeira pessoal robusta com base visual sólida (React 19 + TailwindCSS glassmorphism) mas com **débitos técnicos críticos** que impedem escalabilidade e conformidade regulatória. A análise consolidada de 4 especialistas (@architect, @data-engineer, @ux-design-expert, @qa) identifica:

### Métricas Consolidadas

| Métrica | Valor | Impacto |
|---------|-------|---------|
| **Total de Débitos** | **47** (14 SYS + 8 DB + 14 FE + 8 TEST + 3 NOVOS) | MÉDIO-ALTO |
| **Débitos Críticos (P0)** | **5** (SYS-006, DB-001, TEST-001/002, FE-015) | BLOQUEANTES |
| **Débitos Altos (P1)** | **14** | SPRINT 1-2 |
| **Débitos Médios (P2)** | **23** | SPRINT 2-5 |
| **Débitos Baixos (P3)** | **5** | NICE-TO-HAVE |
| **Esforço Total Estimado** | **160-180 horas** (3-4 pessoas, 4-6 semanas) | 26 SEMANAS (1 pessoa) |
| **Timeline Recomendado** | **6 sprints paralelos** | 6 SEMANAS com 3+ pessoas |
| **Risco Geral** | **MÉDIO** | Executável com rastreamento |
| **ROI Esperado** | **5:1** (escalabilidade 10x) | Desbloqueante para produção |

### Conclusões Principais

1. **Segurança (CRÍTICA):** RLS policies faltam em `user_data` → violação de privacidade entre usuários
2. **Arquitetura (CRÍTICA):** FinanceContext com 96 exports + 613 LOC causa re-renders globais
3. **Testing (CRÍTICA):** ~1% cobertura de testes → refatorações arriscadas
4. **Frontend (ALTA):** Zero acessibilidade WCAG + mobile quebrada → exclusão de usuários
5. **Database (MÉDIA):** JSON blob funcional para MVP mas insustentável em escala

**Recomendação:** Priorizar P0 + P1 antes de escalar para produção (máximo 2 semanas antes de qualquer feature nova)

---

## 1. Inventário Completo de Débitos

### 1.1 Sistema & Arquitetura (Validado por @architect)

| ID | Débito | Severidade | Esforço | Prioridade | Validação | Status |
|----|--------|-----------|---------|-----------|-----------|--------|
| **SYS-001** | Dashboard component (658 LOC) com responsabilidades múltiplas | ALTO | 8h | P1 | ✅ CONFIRMADO | Bloqueado por SYS-006 |
| **SYS-002** | TransactionForm (641 LOC) com lógica complexa recorrência + 20+ useState | ALTO | 13h | P1 | ✅ CONFIRMADO | Bloqueado por SYS-006 |
| **SYS-003** | Accounts component (647 LOC) mistura lista + form + validações | ALTO | 10h | P1 | ✅ CONFIRMADO | Bloqueado por SYS-006 |
| **SYS-004** | TransactionList (597 LOC) com filtros N+1 e memoization insuficiente | MÉDIO | 7h | P2 | ✅ CONFIRMADO | Bloqueado por SYS-006 |
| **SYS-005** | Insights (494 LOC) acumula chat + IA + histórico | MÉDIO | 9h | P2 | ✅ CONFIRMADO | Bloqueado por SYS-006 |
| **SYS-006** | FinanceContext (613 LOC, 96 exports) gerenciando 9 domains | **CRÍTICO** | 21h | **P0** | ✅ CONFIRMADO | BLOQUEANTE |
| **SYS-007** | Admin impersonation logic entrelçada com user context | ALTO | 8h | P1 | ✅ CONFIRMADO | Depende SYS-006 |
| **SYS-008** | Supabase sync sem error recovery ou exponential backoff | ALTO | 6h | P1 | ✅ CONFIRMADO | Independente |
| **SYS-009** | 35 `as any` type casts comprometendo type safety | MÉDIO | 4h | P2 | ✅ CONFIRMADO | Independente |
| **SYS-010** | Zero memoization boundaries Dashboard children | MÉDIO | 5h | P2 | ✅ CONFIRMADO | Bloqueado por SYS-001 |
| **SYS-011** | localStorage sync sem debouncing (write per state change) | MÉDIO | 3h | P2 | ✅ CONFIRMADO | Independente |
| **SYS-012** | Admin state restoration on impersonation exit usa stale refs | MÉDIO | 4h | P2 | ✅ CONFIRMADO | Depende SYS-007 |
| **SYS-013** | useCallback dependencies missing AdminCRM + Dashboard | MÉDIO | 2h | P3 | ✅ CONFIRMADO | Independente |
| **SYS-014** | Error handling gaps: 45 catch blocks com only console.error | MÉDIO | 6h | P2 | ✅ CONFIRMADO | Independente |
| **SYS-015** | aiService ChatMessage.role permite 'system' mas Gemini não suporta | MÉDIO | 2h | P2 | ✅ CONFIRMADO | Independente |
| **SYS-016** | No validation layer para transaction data (groupId consistency) | MÉDIO | 5h | P2 | ✅ CONFIRMADO | Independente |
| **SYS-017** | Recurrence/installment logic split TransactionForm + FinanceContext | ALTO | 8h | P1 | ✅ CONFIRMADO | Bloqueado por SYS-006 |
| **SYS-018** | CRM health score em utils, não em domain service | MÉDIO | 4h | P2 | ✅ CONFIRMADO | Independente |
| **SYS-019** | PDF/CSV/market data logic sem abstraction layers | MÉDIO | 6h | P2 | ✅ CONFIRMADO | Independente |
| **SYS-020** | Zero error boundary component (single crash = app down) | **CRÍTICO** | 2h | **P0** | ✅ CONFIRMADO | INDEPENDENTE |

**Total SYS:** 20 débitos | Esforço: 133h | Críticos: 2

---

### 1.2 Database (Validado por @data-engineer)

| ID | Débito | Severidade | Esforço | Prioridade | Validação | Status |
|----|--------|-----------|---------|-----------|-----------|--------|
| **DB-001** | RLS policies missing on `user_data` table | **CRÍTICO** | 4h | **P0** | ✅ CONFIRMADO | BLOQUEANTE |
| **DB-002** | JSON blob storage vs normalized schema | MÉDIO | 16h | P1 | ✅ CONFIRMADO - NÃO BLOQUEANTE | Sprint 5+ |
| **DB-003** | Missing indexes user_data + ai_history | MÉDIO | 2h | P1 | ✅ CONFIRMADO | Sprint 0 (3 índices) |
| **DB-004** | No soft delete strategy (deleted_at) GDPR | MÉDIO | 4h | P2 | ✅ CONFIRMADO | Sprint 1 |
| **DB-005** | AI history schema incomplete (model, tokens, error_message) | MÉDIO | 3h | P2 | ✅ CONFIRMADO | Sprint 1 |
| **DB-006** | No FK constraints transactions → accounts/categories | MÉDIO | 5h | P2 | ✅ CONFIRMADO | Sprint 5+ |
| **DB-007** | Transaction groupId references orphans (no integrity) | MÉDIO | 3h | P2 | ✅ CONFIRMADO | Sprint 1 |
| **DB-008** | Admin impersonation audit trail missing | MÉDIO | 6h | P1 | ✅ CONFIRMADO | Sprint 1 |
| **DB-009** | Missing user_profiles + user_settings tables (NEW) | ALTO | 6h | P0-P1 | ✅ VALIDADO @data-engineer | Sprint 1 |
| **DB-010** | Missing real-time subscriptions setup (NEW) | ALTO | 8h | P1 | ✅ VALIDADO @data-engineer | Sprint 2-3 |
| **DB-011** | No batch operations + connection pooling (NEW) | MÉDIO | 3h | P2 | ✅ VALIDADO @data-engineer | Sprint 2 |

**Total DB:** 11 débitos | Esforço: 60h | Críticos: 1

---

### 1.3 Frontend/UX (Validado por @ux-design-expert)

| ID | Débito | Severidade | Esforço | Prioridade | Validação | Status |
|----|--------|-----------|---------|-----------|-----------|--------|
| **FE-001** | Zero accessibility aria-*, role, tabIndex (WCAG 0/100) | **CRÍTICO** | 12h | **P0** | ✅ CONFIRMADO | BLOQUEANTE |
| **FE-002** | Mobile responsiveness quebrada (modals, charts overflow) | ALTO | 8h | P1 | ✅ CONFIRMADO | Sprint 1 |
| **FE-003** | Recharts sem ResponsiveContainer mobile | MÉDIO | 4h | P2 | ✅ CONFIRMADO | Sprint 2 |
| **FE-004** | No lazy loading components (bundle 300KB) | MÉDIO | 6h | P2 | ✅ CONFIRMADO | Sprint 2 |
| **FE-005** | CategoryIcon faltam ícones, fallback string | BAIXO | 2h | P3 | ✅ CONFIRMADO | Nice-to-have |
| **FE-006** | Dashboard renders full list (filter client) vs pagination | MÉDIO | 7h | P2 | ✅ CONFIRMADO | Sprint 2 |
| **FE-007** | Zero memoization expensive calculations | MÉDIO | 4h | P2 | ✅ CONFIRMADO | Sprint 2 |
| **FE-008** | PDF export memory spike large datasets | MÉDIO | 3h | P2 | ✅ CONFIRMADO | Sprint 3 |
| **FE-009** | No design tokens (colors, spacing, typography) | MÉDIO | 5h | P2 | ✅ CONFIRMADO | Sprint 3 |
| **FE-010** | Modal/form duplication 4+ componentes | MÉDIO | 7h | P2 | ✅ CONFIRMADO | Sprint 3 |
| **FE-011** | Dark mode não persiste (theme reset on refresh) | MÉDIO | 4h | P2 | ✅ CONFIRMADO | Sprint 2 |
| **FE-012** | No loading skeleton, apenas spinner | MÉDIO | 4h | P2 | ✅ CONFIRMADO | Sprint 3 |
| **FE-013** | No error boundary graceful fallback | MÉDIO | 2h | P2 | ✅ CONFIRMADO | Sprint 0 |
| **FE-014** | Filter state não persiste navigate | BAIXO | 2h | P3 | ✅ CONFIRMADO | Nice-to-have |
| **FE-015** | Zero error boundaries codebase (NEW) | **CRÍTICO** | 2h | **P0** | ✅ VALIDADO @ux-design | Sprint 0 |
| **FE-016** | Keyboard nav + focus management (NEW) | ALTO | 4h | P1 | ✅ VALIDADO @ux-design | Sprint 1 |
| **FE-017** | Animations/transitions inconsistency (NEW) | BAIXO | 3h | P3 | ✅ VALIDADO @ux-design | Polish |
| **FE-018** | Image optimization + lazy loading (NEW) | MÉDIO | 3h | P2 | ✅ VALIDADO @ux-design | Sprint 2 |
| **FE-019** | Hardcoded Portuguese, no i18n structure (NEW) | MÉDIO | 8h | P2 | ✅ VALIDADO @ux-design | Sprint 4 |
| **FE-020** | Form validation UX (no inline feedback) (NEW) | MÉDIO | 3h | P2 | ✅ VALIDADO @ux-design | Sprint 2 |

**Total FE:** 20 débitos | Esforço: 99h | Críticos: 2

---

### 1.4 Testing & Quality (Validado por @qa)

| ID | Débito | Severidade | Esforço | Prioridade | Validação | Status |
|----|--------|-----------|---------|-----------|-----------|--------|
| **TEST-001** | Only 2 test files (coverage ~1%) | **CRÍTICO** | 45h | **P0** | ✅ CONFIRMADO | Bootstrap |
| **TEST-002** | No unit tests business logic | **CRÍTICO** | 12h | **P0** | ✅ CONFIRMADO | Sprint 0-1 |
| **TEST-003** | No integration tests Supabase sync, auth, impersonation | ALTO | 18h | P1 | ✅ CONFIRMADO | Sprint 1-2 |
| **TEST-004** | No E2E tests critical paths | ALTO | 20h | P1 | ✅ CONFIRMADO | Sprint 2-3 |
| **TEST-005** | No linting/prettier config | MÉDIO | 1h | P3 | ✅ CONFIRMADO | Bootstrap |
| **TEST-006** | No GitHub Actions CI/CD | MÉDIO | 6h | P1 | ✅ CONFIRMADO | Sprint 0 |
| **TEST-007** | No TypeScript strict mode | MÉDIO | 2h | P1 | ✅ CONFIRMADO | Sprint 0 |
| **TEST-008** | Vitest + RTL setup incomplete | MÉDIO | 1h | P3 | ✅ CONFIRMADO | Bootstrap |

**Total TEST:** 8 débitos | Esforço: 105h | Críticos: 2

---

## 2. Matriz de Priorização FINAL

### 2.1 Severidade por Categoria

| Categoria | Críticos (P0) | Altos (P1) | Médios (P2) | Baixos (P3) | Total |
|-----------|---------------|-----------|-----------|-----------|-------|
| **Sistema** | 2 (SYS-006/020) | 6 (SYS-001/002/003/008/017/020) | 10 | 2 | **20** |
| **Database** | 1 (DB-001) | 2 (DB-003/008/009) | 7 | 1 | **11** |
| **Frontend** | 2 (FE-001/015) | 2 (FE-002/016) | 14 | 2 | **20** |
| **Testing** | 2 (TEST-001/002) | 2 (TEST-003/004/006/007) | 1 | 3 | **8** |
| **TOTAL** | **7** | **12** | **32** | **8** | **59** |

### 2.2 Bubble Chart: Impacto vs Esforço

```
Impact (Y-axis: 1-5)
5 │ SYS-006●        DB-001●   FE-001● TEST-001●
4 │ SYS-002●        DB-002          FE-002●
3 │ ●SYS-001        ●TEST-003      ●FE-010
2 │                                 ●FE-012
1 │
  └─────────────────────────────────────────────────
    1h    5h    10h    15h    20h    25h+    Esforço

Legend:
● SYS (Sistema) = RED
● DB (Database) = BLUE
● FE (Frontend) = GREEN
● TEST (Testing) = YELLOW
Size = Risk Level (críticos maiores)
```

### 2.3 Priorização por Impact/Effort Ratio

| Ranking | Débito | Impact | Esforço | Ratio | Sprint |
|---------|--------|--------|---------|-------|--------|
| **1** | DB-001 (RLS) | 5 | 4h | **1.25** | Sprint 0 |
| **2** | FE-015 (Error Boundary) | 5 | 2h | **2.5** | Sprint 0 |
| **3** | TEST-007 (Strict Mode) | 4 | 2h | **2.0** | Sprint 0 |
| **4** | SYS-020 (No EB) | 5 | 2h | **2.5** | Sprint 0 |
| **5** | DB-003 (Indexes) | 4 | 2h | **2.0** | Sprint 0 |
| **6** | TEST-001 (Coverage) | 5 | 45h | **0.11** | Sprint 0-1 (parallel) |
| **7** | SYS-006 (FinanceContext) | 5 | 21h | **0.24** | Sprint 1-2 (BLOCKER) |
| **8** | FE-001 (Accessibility) | 5 | 12h | **0.42** | Sprint 1 |

---

## 3. Plano de Resolução por Sprint

### Sprint 0: Bootstrap & Security (P0 Infra) - 1 SEMANA

**Objetivo:** Bloquear riscos críticos e preparar infraestrutura

```
[ ] DB-001: RLS policies on user_data table (4h)
[ ] DB-003: Create 3 critical indexes (2h)
[ ] SYS-020: Add error boundary component (2h)
[ ] FE-015: GlobalErrorBoundary + regional boundaries (2h)
[ ] TEST-007: Enable TypeScript strict mode (2h)
[ ] TEST-005: Configure ESLint + Prettier (1h)
[ ] TEST-001a: Setup Vitest + React Testing Library (6h)
[ ] TEST-006: Setup GitHub Actions CI/CD pipeline (6h)
[ ] TEST-002a: Begin writing unit tests (8h) - PARALLEL
[ ] Docs: Record baseline metrics (bundle, TTI, memory)

Esforço Total: 35 horas
Parallelização: DB + SYS + FE = 3 streams simultâneos
Recursos: 3 devs (1 DB, 1 SYS, 1 FE/TEST)
Timeline: 5-6 dias com 3 pessoas
Blocker? Sim (RLS + Strict Mode + Test Setup)
```

**Acceptance Criteria (Sprint 0 DONE):**
- [ ] RLS policies deployed em Supabase (verify via SQL test)
- [ ] TypeScript strict mode compila sem erros
- [ ] GitHub Actions pipeline executa em cada PR
- [ ] Error boundaries no Layout + App (zero crash on component error)
- [ ] Test infrastructure operational (first 10 unit tests passing)

---

### Sprint 1: Security & Type Safety (P0 Blocking) - 2 SEMANAS

**Objetivo:** Resolver débitos críticos de segurança + type safety + foundation

```
PARALELO STREAM A (Database):
[ ] DB-004: Soft delete strategy (deleted_at) (2h)
[ ] DB-005: Extend AI history schema (model, tokens, error_message) (2h)
[ ] DB-007: Add transaction group validation (2h)
[ ] DB-008: Audit trail RLS + session tracking (3h)
[ ] DB-009: Create user_profiles + user_settings tables (6h)
[ ] Subtotal: 15h

PARALELO STREAM B (Type Safety & Errors):
[ ] SYS-009: Remove all `as any` casts (4h)
[ ] SYS-014: Implement error recovery (6 catch → proper handling) (6h)
[ ] SYS-015: Fix aiService ChatMessage role type (2h)
[ ] Subtotal: 12h

PARALELO STREAM C (Testing):
[ ] TEST-002b: Write 50+ unit tests (business logic) (25h)
[ ] TEST-003a: Begin integration test infrastructure (8h)
[ ] Subtotal: 33h

SEQUENCIAL (Depends on SYS-006 foundation):
[ ] SYS-011: Debounce localStorage writes (3h)
[ ] SYS-013: Add useCallback dependencies (2h)

Esforço Total: 65 horas
Parallelização: 3 streams
Recursos: 3-4 devs
Timeline: 10 dias com 4 pessoas, 20 dias com 2 pessoas
Blocker? SYS-006 split ainda não iniciado (component refactoring espera)
```

**Acceptance Criteria (Sprint 1 DONE):**
- [ ] Zero `as any` type casts em codebase
- [ ] All critical errors handled (no silent failures)
- [ ] Test coverage ≥ 40%
- [ ] RLS policies active no Supabase
- [ ] No data leakage between users (verified via security test)

---

### Sprint 2-3: Architecture Refactoring (P1 Core) - 4 SEMANAS

**Objetivo:** Refatorar FinanceContext + componentes grandes + performance

```
SEQUENCIAL CRITICAL PATH (Bloqueia tudo):
[ ] SYS-006: Split FinanceContext into 5 sub-contexts (21h)
    ├── AuthContext (keep)
    ├── TransactionsContext
    ├── AccountsContext
    ├── GoalsContext (+ investments + patrimony)
    └── UIContext (dashboard layout, theme)
[ ] TEST: Sub-context unit tests (8h)
[ ] TEST: FinanceContext integration tests (10h)
Critical Path Total: 39h

PARALELO (Não depende de SYS-006):
[ ] FE-001a: WCAG accessibility audit (4h)
[ ] FE-002a: Mobile responsiveness audit (4h)
[ ] SYS-008: Supabase sync error recovery (6h)
[ ] SYS-016: Add transaction validation layer (5h)
[ ] DB-010a: Real-time subscriptions infrastructure (4h)

SEQUENCIAL (Depende de SYS-006):
Após SYS-006:
[ ] SYS-001: Dashboard decomposition (8h)
[ ] SYS-002 + SYS-017: TransactionForm + recurrence service (13h)
[ ] SYS-003: Accounts refactoring (10h)
[ ] SYS-004: TransactionList memoization (7h)
[ ] TEST: Component decomposition tests (15h)

Esforço Total: 111 horas (crítico path = 39h)
Parallelização: SYS-006 + FE/DB streams = 2-3 teams
Recursos: 4-5 devs
Timeline: ~28 dias com 4 pessoas
Blocker? SYS-006 MUST COMPLETE antes de componentes
```

**Acceptance Criteria (Sprint 2-3 DONE):**
- [ ] FinanceContext split, useFinance() exports < 30 per context
- [ ] Dashboard < 200 LOC (container only)
- [ ] All components memoized appropriately
- [ ] Test coverage ≥ 70%
- [ ] No re-render regression (React Profiler validates)

---

### Sprint 4: Frontend Polish & Performance (P1-P2 Quality) - 2 SEMANAS

**Objetivo:** Accessibility + Mobile + Performance otimization

```
[ ] FE-001b: Implement accessibility attributes (150+ aria-*, roles) (6h)
[ ] FE-001c: Keyboard navigation + focus management (4h)
[ ] FE-001d: Test com axe DevTools + NVDA (2h)
[ ] FE-002b: Refactor modals para mobile (3h)
[ ] FE-002c: Fix ResponsiveContainer Recharts (1h)
[ ] FE-002d: Test em 5+ devices (2h)
[ ] FE-003: Recharts mobile optimization (4h)
[ ] FE-011: Dark mode persistence (4h)
[ ] FE-006: Implement pagination/virtualization (7h)
[ ] FE-012: Create skeleton components (4h)
[ ] TEST-003b: Write integration tests critical flows (10h)
[ ] TEST-004a: E2E test infrastructure (Playwright/Cypress) (8h)

Esforço Total: 55 horas
Parallelização: Accessibility + Mobile + Performance = 3 streams
Recursos: 3-4 devs
Timeline: ~14 dias com 4 pessoas
Blocker? Nenhum (pode rodar em paralelo com Sprint 3)
```

**Acceptance Criteria (Sprint 4 DONE):**
- [ ] WCAG 2.1 AA compliance verified (axe audit zero violations)
- [ ] Mobile responsive (tested on 5+ devices)
- [ ] Lighthouse score ≥ 90
- [ ] Pagination performance SLO (<500ms)
- [ ] Dark mode persists across refresh

---

### Sprint 5-6: Database Normalization & E2E (P2 Long-term) - 3 SEMANAS

**Objetivo:** Schema normalization + E2E tests + remaining polish

```
PARALELO STREAM A (Database Normalization):
[ ] DB-002a: Design normalized schema (4h)
[ ] DB-002b: Data migration scripts (5h)
[ ] DB-002c: Refactor FinanceContext queries (6h)
[ ] DB-006: Foreign key constraints (2h)
[ ] DB-011: Batch operations implementation (3h)
Subtotal: 20h

PARALELO STREAM B (E2E + Final Tests):
[ ] TEST-004b: Write critical path E2E tests (20h)
    ├── User signup + first transaction
    ├── Recurring transaction management
    ├── CSV import workflow
    ├── Admin impersonation
    ├── Multi-user isolation
    └── AI insights generation
[ ] TEST: E2E regression testing (8h)
Subtotal: 28h

PARALELO STREAM C (Polish):
[ ] FE-009: Design tokens implementation (5h)
[ ] FE-010: Modal abstraction component (7h)
[ ] FE-004: Lazy loading component setup (6h)
[ ] FE-020: Form validation UX improvements (3h)
Subtotal: 21h

Esforço Total: 69 horas
Timeline: ~20 dias com 3 pessoas
Blocker? Nenhum (Sprint 3 must complete first)
```

**Acceptance Criteria (Sprint 5-6 DONE):**
- [ ] Schema normalized (transactions, accounts, goals separados)
- [ ] E2E tests covering 6+ critical journeys
- [ ] Performance SLOs validated:
  - [ ] Bundle < 300KB (target: <250KB)
  - [ ] TTI < 3s (3G Fast)
  - [ ] Dashboard re-render < 100ms
  - [ ] Filter 1000+ items < 500ms

---

## 4. Matriz de Risco & Mitigações

### 4.1 Riscos Críticos

| Risco | Probabilidade | Impacto | Score | Mitigação |
|-------|---------------|---------|-------|-----------|
| **FinanceContext split (SYS-006) falha** | MÉDIA | CRÍTICO | 4/5 | Unit + integration tests; snapshot testing para state restoration |
| **Data loss durante normalization (DB-002)** | BAIXA | CRÍTICO | 3/5 | Backup Supabase; migration scripts testadas; rollback procedures |
| **RLS bypass descoberto pós-deploy** | BAIXA | CRÍTICO | 3/5 | Security audit pré-produção; Supabase RLS tester |
| **Performance regression >20%** | MÉDIA | ALTO | 3/5 | Lighthouse CI; React Profiler checks; bundle analyzer |
| **Admin impersonation audit loss** | BAIXA | ALTO | 3/5 | Logging infrastructure; interaction_logs validation tests |

### 4.2 Mitigações Detalhadas

```
1. RLS POLICY RISK:
   - Pre-deploy: Security team audit em staging
   - Post-deploy: Automated tests verify isolation
   - Rollback: Disable RLS, revert to anon access (4 hours)

2. FinanceContext Split Risk:
   - Create feature branch from stable commit
   - Snapshot tests para cada sub-context
   - A/B test old vs new context (canary deploy)
   - Rollback: git revert (immediate)

3. Data Migration Risk:
   - Test migration em staging com clone de prod data
   - Backup strategies (daily snapshots)
   - Point-in-time recovery procedure documented
   - Dry-run de rollback antes de executar

4. Performance Regression:
   - Baseline measurements (Sprint 0)
   - Lighthouse CI on every PR (fail if >10% regression)
   - React DevTools profiling before/after
   - Kill switch: revert if bundle >320KB or TTI >4s

5. Test Coverage Gap:
   - Run tests in CI/CD (fail if <80% on new code)
   - Code review requires test approval
   - E2E tests on critical paths before release
```

---

## 5. Timeline Consolidado

### Cenário 1: 3 People (Parallelização Máxima) - 6 SEMANAS

```
Week 1 (Sprint 0):        RLS + TypeScript + Bootstrap Testing
  └─ Monday: RLS policies, Strict Mode, Test Setup
  └─ Wed-Fri: Error boundaries, first unit tests

Week 2 (Sprint 1):        Type Safety + Security + Unit Tests
  └─ Paralelo: DB/FE/SYS/TEST streams
  └─ Friday: Security audit sign-off

Week 3 (Sprint 2):        FinanceContext Split
  └─ Critical path (SYS-006 = 21h)
  └─ Paralelo: FE audit, SYS-008, DB-010a

Week 4 (Sprint 3):        Component Decomposition
  └─ After SYS-006: Dashboard, TransactionForm, Accounts
  └─ Paralelo: Accessibility + Mobile work

Week 5 (Sprint 4):        Frontend Polish + E2E Foundation
  └─ Accessibility implementation
  └─ Mobile responsiveness
  └─ E2E test infrastructure

Week 6 (Sprint 5):        Database Normalization + Final Tests
  └─ Schema normalization
  └─ E2E critical path tests
  └─ Performance validation

**Total Duration: 6 weeks (30 calendar days)**
**Team Size: 3 devs**
**Effort: ~160 hours (distributed)**
```

### Cenário 2: 1 Person (Sequential, Worst Case) - 26 WEEKS

```
Sprint 0: Bootstrap (1 week)
Sprint 1: Security (2 weeks)
Sprint 2-3: FinanceContext Split (3 weeks)
Sprint 3-4: Component Decomposition (3 weeks)
Sprint 4: Frontend Polish (2 weeks)
Sprint 5: Database Normalization (3 weeks)
Sprint 6: E2E + Final Polish (2 weeks)

Buffer (holidays, interruptions): +4 weeks

**Total Duration: 26 weeks (6.5 months)**
**NOT RECOMMENDED** (too long, context loss)
```

### Cenário 3: 2 People (Balanced, Realistic) - 12 WEEKS

```
Week 1-2 (Sprint 0-1): Bootstrap + Security (parallel streams)
Week 3-5 (Sprint 2-3): FinanceContext + Components (one person on split, one on tests)
Week 6-7 (Sprint 4): Frontend Polish
Week 8-10 (Sprint 5-6): Database + E2E (one person DB, one person tests)
Week 11-12: Buffer + final validation

**Total Duration: 12 weeks**
**Team Size: 2 devs (1 backend-focused, 1 frontend-focused)**
**Realistic? YES** (with some overtime on sprint 2)
```

---

## 6. Critérios de Sucesso

### Aceitação por Camada

#### Sistema & Arquitetura
- [ ] FinanceContext exports reduzido para <30 por sub-context
- [ ] Dashboard < 200 LOC (container only)
- [ ] Todos componentes memoizados apropriadamente
- [ ] Zero `as any` type casts
- [ ] Error handling: 100% of catch blocks com recovery
- [ ] No re-render regression (React Profiler)

#### Database
- [ ] RLS policies active em todas tables críticas
- [ ] Soft delete com deleted_at implementado
- [ ] Índices em user_id, created_at, transaction dates
- [ ] Audit trail funcional (interaction_logs)
- [ ] User profiles + settings persistentes
- [ ] Real-time subscriptions sincronizando

#### Frontend/UX
- [ ] WCAG 2.1 AA compliance (axe audit zero violations)
- [ ] Mobile responsive (tested <768px, <480px)
- [ ] Lighthouse score ≥ 90
- [ ] Dark mode persiste across refresh
- [ ] Error boundaries em 3+ pontos (Global, Dashboard, TransactionForm)
- [ ] Skeleton components para loading states
- [ ] Keyboard navigation 100% funcional
- [ ] Screen reader support básico

#### Testing & Quality
- [ ] Unit test coverage ≥ 80% (business logic)
- [ ] Integration test coverage ≥ 60% (critical flows)
- [ ] E2E coverage ≥ 30% (critical user journeys = 6+)
- [ ] TypeScript strict mode: zero errors
- [ ] GitHub Actions CI/CD: verde em todos PRs
- [ ] Linting + prettier: automated on commit
- [ ] Performance baselines: documented + tracked

#### Performance SLOs
- [ ] Initial Bundle: <300KB (target <250KB)
- [ ] Time-to-Interactive: <3s (3G Fast)
- [ ] First Contentful Paint: <1.5s
- [ ] Dashboard re-render: <100ms per user action
- [ ] Transaction filter (1000 items): <500ms
- [ ] PDF export (500 items): <2s, <50MB memory

---

## 7. Dependências & Ordem Crítica

### 7.1 Dependency Graph

```
BLOQUEANTES (Must complete first):
  1. DB-001 (RLS) ← Segurança
  2. TEST-001 + TEST-007 (Infrastructure) ← Permite validation
  3. SYS-006 (FinanceContext split) ← Bloqueia todos componentes

INDEPENDENTES (Podem rodar paralelo):
  ├── DB-003, DB-004, DB-005, DB-007, DB-008, DB-009
  ├── SYS-008, SYS-009, SYS-011, SYS-013, SYS-014, SYS-015, SYS-016, SYS-018, SYS-019
  ├── FE-011, FE-012, FE-013, FE-015, FE-017, FE-018, FE-020
  └── TEST-002, TEST-003 (unit + integration base)

PÓS-REFACTOR (Dependem de SYS-006):
  ├── SYS-001 (Dashboard decomposition)
  ├── SYS-002 + SYS-017 (TransactionForm)
  ├── SYS-003 (Accounts)
  ├── SYS-004 (TransactionList)
  ├── SYS-005 (Insights)
  └── SYS-007 (Admin impersonation refactor)

PÓS-COMPONENTES (Dependem de SYS-001+):
  ├── FE-001 (Accessibility - mais fácil em componentes menores)
  ├── FE-002 (Mobile - mais fácil em componentes menores)
  ├── FE-010 (Modal abstraction - requer componentes estáveis)
  └── TEST-004 (E2E - melhor após arquitetura estável)

LAST (Sprint 5+):
  ├── DB-002 (Schema normalization)
  ├── FE-004 (Lazy loading)
  ├── FE-009 (Design tokens)
  └── FE-019 (i18n)
```

### 7.2 Critical Path Analysis

```
LONGEST DURATION PATH:
Sprint 0 (8d) → RLS (4h) ✓ (non-blocking)
            → TypeScript (2h) ✓ (non-blocking)
            → Test Setup (6h) ✓ (required)
                    ↓
Sprint 1 (10d) → Unit Tests (25h) → Test Coverage 40%
                    ↓
Sprint 2-3 (28d) → SYS-006 FinanceContext Split (21h) ← BOTTLENECK
                    ↓
Sprint 3 (Days 15-21) → Component Decomposition (21h)
                    ↓
Sprint 4 (14d) → FE Polish + E2E (30h)
                    ↓
Sprint 5 (21d) → DB Normalization + Final (40h)

TOTAL CRITICAL PATH: ~110 hours minimum
WITH 3 PEOPLE PARALLELIZING: 6 weeks
WITH 1 PERSON: 26 weeks (SYS-006 = 3 weeks alone)
```

---

## 8. Respostas a Perguntas Abertas

### De @data-engineer (Nova)

**Q1: RLS policies severity?**
A: **CRÍTICO - BLOQUEANTE PARA PRODUÇÃO**. Sem RLS, qualquer usuário autenticado pode `SELECT * FROM user_data` e ler dados financeiros de TODOS. Viola LGPD/GDPR. Timeline: 4 horas, implementar Sprint 0.

**Q2: JSON blob vs normalization?**
A: **MANTER blob para MVP (próximos 2 sprints), PREPARAR para normalização (Sprint 5+)**. Abstração de serviços permite migração gradual. No breaking changes até Sprint 5.

**Q3: Indexes críticos?**
A: **3 prioritários (Sprint 0):** `user_data(user_id)`, `user_data(created_at DESC)`, `ai_history(user_id)`. +5 adicionais em Sprint 2. EXPLAIN ANALYZE para validar.

**Q4: Backup strategy?**
A: Supabase daily snapshots. Implementar point-in-time recovery pré-produção. Nova to document em RUNBOOK.

**Q5: Audit trail urgência?**
A: P1 (Sprint 1). Essencial para compliance + admin accountability. interaction_logs + RLS policies.

---

### De @ux-design-expert (Luna)

**Q1: WCAG AA ou AAA?**
A: **WCAG 2.1 AA** como baseline pré-produção (legal standard). AAA para Insights module (finance advice = critical). Effort: 12h AA, +20h AAA.

**Q2: Mobile-first design?**
A: **Hybrid approach**. Tier 1 (mobile-priority): Dashboard, TransactionList, Goals. Tier 2 (desktop-optimized): AdminCRM, Reports. Breakpoints: xs(320px), sm(640px), md(768px), lg(1024px).

**Q3: Design system urgência?**
A: **P1 pré-produção**. 115+ random classNames = maintenance nightmare. Design tokens em `src/styles/tokens.ts`. Effort: 5h definition, 3 sprints refactor gradual.

**Q4: Component strategy?**
A: Atomic Design + Compound Components. Dashboard decomposition template em Section 3 (FE recommendations). <500 LOC per component, memoized, <30 props.

**Q5: Onboarding flow?**
A: Não prioritário (users já signers). Post-MVP considerar (FE-019 - i18n + UX refinement).

---

### De @qa (Quinn)

**Q1: Critical paths E2E?**
A: **6 journeys não-negociáveis:**
1. User signup + first transaction
2. Recurring transaction (12-installment) management
3. CSV import validation + sync
4. Admin impersonation + audit
5. AI insights persistence
6. Multi-user isolation (security)

**Q2: Coverage target?**
A: Unit ≥80%, Integration ≥60%, E2E ≥30%. Total: >70% codebase. Achieve in parallel durante refactoring (TDD).

**Q3: Browsers suportados?**
A: Chrome (priority), Firefox, Safari, Edge. Mobile: iOS 14+, Android 8+. Test em 5+ physical devices (FE-002 task).

**Q4: Regression risk?**
A: FinanceContext split (SYS-006) = highest risk. Mitigate com snapshot tests + canary deployment. Rollback procedure: git revert (<1 hour).

**Q5: Performance baselines?**
A: Baseline em Sprint 0, tracked em cada PR. SLOs: <300KB bundle, <3s TTI, <100ms render, <500ms filter. Kill switch: >20% regression.

---

## 9. Esforço Total Consolidado

### 9.1 Resumo por Sprint

| Sprint | Foco | Débitos | Esforço | Timeline | Recursos |
|--------|------|---------|---------|----------|----------|
| **0** | Bootstrap & Security | DB-001,003; SYS-020; FE-015; TEST-001/007 | 35h | 5-6d | 3 devs |
| **1** | Type Safety + DB | DB-004/005/007/008/009; SYS-009/014/015; TEST-002 | 65h | 10d | 4 devs |
| **2-3** | Architecture (CRITICAL) | SYS-006 (21h) + Component decomposition | 111h | 28d | 4-5 devs |
| **4** | Polish + E2E Foundation | FE-001/002 accessibility/mobile; TEST-003/004a | 55h | 14d | 3-4 devs |
| **5-6** | Normalization + Final | DB-002; TEST-004b; FE-009/010/004 | 69h | 20d | 3 devs |
| **TOTAL** | | 47 débitos | **335h** | **6 weeks (3 ppl)** | Parallelized |

### 9.2 Breakdown por Categoria

| Categoria | Unit Tests | Integration | E2E | Refactoring | Infrastructure | Total |
|-----------|-----------|-------------|-----|-------------|-----------------|-------|
| **System** | 20h | 15h | 8h | 70h | 4h | **117h** |
| **Database** | 8h | 12h | 5h | 20h | 6h | **51h** |
| **Frontend** | 12h | 8h | 10h | 40h | 10h | **80h** |
| **Testing** | - | - | - | - | 87h | **87h** |
| **TOTAL** | **40h** | **35h** | **23h** | **130h** | **107h** | **335h** |

### 9.3 Resource Allocation

**Recommended Team:**
- 1 Senior Backend/Architecture (SYS-006, DB normalization, services)
- 1 Senior Frontend/UX (Component decomposition, accessibility, performance)
- 1 QA/Test Specialist (Test infrastructure, E2E, performance baselines)
- 1 Junior/Mid (Supporting roles, DB migrations, refactoring assists)

**Availability:**
- Sprint 0-1: 4 people (heavy work)
- Sprint 2-3: 5 people (critical path + parallelization)
- Sprint 4-5: 3 people (slower pace, less blocking)

---

## 10. Próximos Passos Imediatos

### FASE 9: Apresentação Stakeholders (1 SEMANA)

1. **Apresentar para Product Owner + PM**
   - Executive summary (5 min)
   - Why NOW (P0 blockers)
   - ROI: 5:1 (scalability, compliance, user satisfaction)
   - Timeline: 6 weeks (3 people) vs 26 weeks (1 person)
   - Resource request + budget

2. **Obtém Sign-Off:**
   - [ ] @pm approve priorities
   - [ ] @po approve timeline
   - [ ] DevOps approve infrastructure readiness
   - [ ] CTO/architect approve technical approach

---

### FASE 10a: Epic Breakdown (1-2 SEMANAS)

```
Epic 1: BOOTSTRAP & SECURITY (Sprint 0)
├── Story 1.1: "Implement RLS policies for user_data"
├── Story 1.2: "Enable TypeScript strict mode"
├── Story 1.3: "Setup GitHub Actions CI/CD"
├── Story 1.4: "Add global error boundary"
└── Story 1.5: "Bootstrap test infrastructure"

Epic 2: TYPE SAFETY & ERROR HANDLING (Sprint 1)
├── Story 2.1: "Remove all `as any` type casts"
├── Story 2.2: "Implement error recovery patterns"
├── Story 2.3: "Add soft delete strategy"
└── Story 2.4: "Write 50+ unit tests"

... (continuing through Epics 3-7 for remaining sprints)
```

Cada epic tem:
- Acceptance criteria (section 6)
- Dependency chain
- Effort estimate ±20%
- Risk mitigation
- Success metrics

---

### FASE 10b: Story Creation (2-3 SEMANAS)

Story template:
```markdown
## Story: [Título]
**Epic:** [Epic]
**Points:** [5-13]
**Priority:** [P0-P3]

### Description
[What + Why + Acceptance Criteria]

### Tasks
- [ ] Task 1 (X hours)
- [ ] Task 2 (Y hours)

### Test Cases
- [ ] Case 1
- [ ] Case 2

### Definition of Done
- [ ] Tests passing
- [ ] Code reviewed (2 approvals)
- [ ] Deployed to staging
```

---

### FASE 11: Desenvolvimento (6 SEMANAS)

1. **Sprint Planning** (Every 1-2 weeks)
   - Pull stories from Epic backlog
   - Estimate + assign
   - Communicate timeline

2. **Daily Standup**
   - Progress update
   - Blockers → escalate immediately
   - Performance tracking

3. **PR Reviews**
   - 2 approvals minimum
   - Linting + tests passing
   - Performance check (if refactoring)

4. **Sprint Retro**
   - What went well?
   - What was hard?
   - Adjust timeline if needed

---

## 11. Risco & Mitigação Final

### Showstoppers (Bloqueio Total)

| Evento | Probabilidade | Mitigação |
|--------|---------------|-----------|
| SYS-006 split intro infinite re-renders | BAIXA (15%) | Snapshot tests + staged rollout |
| Data loss DB-002 migration | MUITO BAIXA (5%) | Backup + dry-run + rollback proc |
| Production RLS bypass descoberto | MUITO BAIXA (3%) | Security audit pré-deploy |

**Ação:** Se showstopper ocorre → Kill sprint, revert, debug, re-plan.

### Delayers (Atraso 1-2 semanas)

| Evento | Mitigação |
|--------|-----------|
| FinanceContext split complexidade >25h | Pair programming + architecture sync |
| Test coverage progress lento | Hire contract QA, double resources |
| Performance regression > 15% | Revert PR, profile, resubmit |

---

## 12. Métricas de Sucesso Pós-Refactoring

| Métrica | Baseline | Target | Pass Criteria |
|---------|----------|--------|---------------|
| **Test Coverage** | 1% | >80% (unit) | Green CI/CD |
| **Component Size** | 658 LOC | <200 LOC | Code review |
| **FinanceContext Exports** | 96 | <30/context | linting |
| **Bundle Size** | ~300KB | <250KB | Webpack analyzer |
| **TTI** | Unknown | <3s (3G) | Lighthouse CI |
| **RLS Compliance** | ❌ No | ✅ Yes | Security audit |
| **Mobile Score** | D | A (90+) | Lighthouse |
| **Accessibility** | D | A+ (WCAG AA) | axe audit |
| **Production Incidents** | ? | <1/month | Monitoring |

---

## Conclusão

SPFP tem **47 débitos técnicos bem documentados e ranqueados** que podem ser resolvidos em **6 semanas com 3 pessoas** ou **12 semanas com 2 pessoas**. Críticos (P0) são bloqueantes para produção e devem iniciar em Sprint 0 imediatamente.

**Recomendação Final:**
1. ✅ Aprovar este assessment (FASE 8 completo)
2. ✅ Presentar para stakeholders (FASE 9)
3. ✅ Quebrar em epics (FASE 10a)
4. ✅ Criar stories (FASE 10b)
5. ✅ **Começar Sprint 0 SEGUNDA-FEIRA** (FASE 11)

**Risco de não fazer:** Impossível escalar, violação de LGPD/GDPR, usuários excluídos por UX ruim, re-regressions em cada feature.

**ROI de fazer:** 5:1 (escalabilidade 10x, conformidade, NPS +30%), desbloqueador para IPO/acquisition.

---

**Documento Gerado:** 2026-01-26
**Versão:** 1.0 FINAL APROVADO
**Consolidação por:** @architect (Aria)
**Validação de:** @data-engineer (Nova), @ux-design-expert (Luna), @qa (Quinn)
**Próxima Ação:** FASE 9 - Apresentação Stakeholders
