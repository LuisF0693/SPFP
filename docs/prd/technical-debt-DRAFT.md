# Technical Debt Assessment - DRAFT
**Projeto:** SPFP (Sistema de Planejamento Financeiro Pessoal)
**Data:** 2026-01-26
**Status:** ⚠️ PENDENTE REVISÃO DOS ESPECIALISTAS
**Analisador:** @architect (Aria)

---

## Resumo Executivo

SPFP é um aplicativo de gestão financeira pessoal com IA construído em React 19 + TypeScript + Vite, com backend Supabase e integrações Google Gemini. A análise inicial identifica **42 débitos técnicos** distribuídos entre:
- **Sistema/Arquitetura (14):** Monolithic components, state management overcomplexity, missing abstractions
- **Database (8):** Schema gaps, missing RLS policies, index strategy undefined
- **Frontend/UX (12):** Large components, accessibility debt, performance issues
- **Testing/Quality (8):** Minimal test coverage, missing integration tests, type safety gaps

**Impacto Geral:** MÉDIO-ALTO (2-3 sprints de refatoração necessárias antes de scale)

---

## 1. Débitos de Sistema (Arquitetura & Code)

### 1.1 Monolithic Components

| ID | Débito | Arquivo | LOC | Severidade | Impacto | Esforço | Prioridade |
|----|--------|---------|-----|-----------|---------|---------|-----------|
| SYS-001 | Dashboard component muito grande e com responsabilidades múltiplas | `src/components/Dashboard.tsx` | 658 | **ALTO** | Difícil manutenção, renders desnecessários, CRM alert fetch inline | 8 | P1 |
| SYS-002 | TransactionForm com lógica complexa de recorrência/parcelamento | `src/components/TransactionForm.tsx` | 641 | **ALTO** | Estado fragmentado (20+ useState), hard to test, business logic misplaced | 13 | P1 |
| SYS-003 | Accounts component combina lista + formulário + validações | `src/components/Accounts.tsx` | 647 | **ALTO** | Mixing concerns, no separation of presentation/logic | 10 | P1 |
| SYS-004 | TransactionList com filtros complexos e memoization insuficiente | `src/components/TransactionList.tsx` | 597 | **MÉDIO** | N+1 filtering on every prop change, no memo boundaries | 7 | P2 |
| SYS-005 | Insights component acumula lógica de chat + IA + histórico | `src/components/Insights.tsx` | 494 | **MÉDIO** | Mixed concerns (UI + service layer), state complexity | 9 | P2 |

**Padrão:** Components > 500 LOC em 5 dos 14 componentes principais. Nenhum usa React.memo ou lazy loading.

---

### 1.2 FinanceContext Overcomplexity

| ID | Débito | Severidade | Impacto | Esforço | Prioridade |
|----|--------|-----------|---------|---------|-----------|
| SYS-006 | FinanceContext com 96 exports e 613 LOC gerenciando 9 domains | **CRÍTICO** | Single point of failure, tudo re-renderiza no change | 21 | P0 |
| SYS-007 | Admin impersonation logic entrelçada com user context | **ALTO** | Unclear flows, state restoration risks, localStorage-dependent | 8 | P1 |
| SYS-008 | Supabase sync channel sem error recovery ou exponential backoff | **ALTO** | Silent failures, no retry mechanism, data stale risk | 6 | P1 |
| SYS-009 | 35 instances of `as any` type casts no frontend | **MÉDIO** | Type safety compromised, runtime errors possible | 4 | P2 |

**Padrão:** Context exposes `useFinance()` hook com >50 destructurable items. No context splitting by domain (auth, transactions, goals, etc).

---

### 1.3 State Management Architecture

| ID | Débito | Severidade | Impacto | Esforço | Prioridade |
|----|--------|-----------|---------|---------|-----------|
| SYS-010 | No memoization boundaries between Dashboard child components | **MÉDIO** | Every transaction change re-renders entire Dashboard | 5 | P2 |
| SYS-011 | localStorage sync without debouncing (every state change = write) | **MÉDIO** | Browser I/O bottleneck, poor mobile experience | 3 | P2 |
| SYS-012 | Admin state restoration on impersonation exit uses stale refs | **MÉDIO** | Potential data inconsistency if admin makes changes during impersonate | 4 | P2 |
| SYS-013 | useCallback dependencies missing in AdminCRM + Dashboard | **MÉDIO** | Infinite re-renders risk if used with memoized children | 2 | P3 |

---

### 1.4 Type Safety & Error Handling

| ID | Débito | Severidade | Impacto | Esforço | Prioridade |
|----|--------|-----------|---------|---------|-----------|
| SYS-014 | 35 `as any` type casts across codebase (Dashboard, AdminCRM, pdfService) | **MÉDIO** | TypeScript not catching runtime errors | 4 | P2 |
| SYS-015 | aiService.ts `ChatMessage.role` union type allows 'system' but Gemini SDK doesn't support it | **MÉDIO** | Runtime error if system prompt in history | 2 | P2 |
| SYS-016 | Error handling gaps: 45 catch blocks with only console.error, no recovery | **MÉDIO** | Silent failures, poor user feedback (CRM briefing, AI chat) | 6 | P2 |
| SYS-017 | No validation layer for transaction data (groupId, groupIndex consistency) | **MÉDIO** | Orphaned transaction groups if delete fails mid-transaction | 5 | P2 |

**Padrão:** Minimal error boundaries. CSV import, PDF generation, AI calls can fail silently.

---

### 1.5 Business Logic Misplacement

| ID | Débito | Severidade | Impacto | Esforço | Prioridade |
|----|--------|-----------|---------|---------|-----------|
| SYS-018 | Recurrence/installment logic split between TransactionForm (UI) + FinanceContext (state) | **ALTO** | Duplicate logic, hard to test, single source of truth missing | 8 | P1 |
| SYS-019 | CRM health score calculation (calculateHealthScore) lives in utils, not domain service | **MÉDIO** | Business logic scattered, no central AI analysis module | 4 | P2 |
| SYS-020 | PDF generation, CSV parsing, market data logic without abstraction layers | **MÉDIO** | Services tightly coupled to components, hard to mock/test | 6 | P2 |

---

## 2. Débitos de Database

### 2.1 Schema & RLS Gaps

| ID | Débito | Severidade | Impacto | Esforço | Prioridade |
|----|--------|-----------|---------|---------|-----------|
| DB-001 | No RLS policies defined for user_data table | **CRÍTICO** | Users can read/write other users' financial data | 3 | P0 |
| DB-002 | user_data table stores entire GlobalState JSON blob vs normalized tables | **MÉDIO** | Query optimization impossible, analytics hard, no granular access | 13 | P1 |
| DB-003 | Missing indexes on user_data.created_at, user_data.updated_at | **MÉDIO** | Admin queries (fetchAllUserData) sequential scan on large dataset | 2 | P2 |
| DB-004 | No soft delete strategy (deleted_at field) for GDPR compliance | **MÉDIO** | Permanent deletes only, audit trail missing | 4 | P2 |
| DB-005 | AI history table (for Insights) schema not defined | **MÉDIO** | AI chat history stored only in localStorage, lost on clear/logout | 6 | P2 |

---

### 2.2 Data Integrity & Relationships

| ID | Débito | Severidade | Impacto | Esforço | Prioridade |
|----|--------|-----------|---------|---------|-----------|
| DB-006 | No foreign key constraints (transactions -> accounts, categories, goals) | **MÉDIO** | Orphaned records possible, no cascade delete support | 3 | P2 |
| DB-007 | Transaction groupId references non-existent records (no integrity check) | **MÉDIO** | Orphaned transaction groups if parent deleted | 2 | P2 |
| DB-008 | User impersonation audit table missing (admin_id, client_id, timestamp, action) | **MÉDIO** | Compliance gap, no audit trail for CRM operations | 5 | P2 |

---

## 3. Débitos de Frontend/UX

### 3.1 Component Architecture

| ID | Débito | Severidade | Impacto | Esforço | Prioridade |
|----|--------|-----------|---------|---------|-----------|
| FE-001 | Zero accessibility attributes (aria-label, role, tabIndex) across 50+ components | **ALTO** | Not WCAG compliant, keyboard nav broken, screen reader unsupported | 12 | P1 |
| FE-002 | No mobile responsiveness testing (modals, charts overflow on <768px) | **ALTO** | Mobile users experience broken layouts | 8 | P1 |
| FE-003 | Recharts integration without ResponsiveContainer optimization for mobile | **MÉDIO** | Charts don't scale, slow renders on mobile | 4 | P2 |
| FE-004 | No lazy loading of components (Dashboard, Insights, Reports loaded at once) | **MÉDIO** | Initial bundle size likely >300KB, slow first paint | 6 | P2 |
| FE-005 | CategoryIcon component missing icons for new categories, fallback to string | **MÉDIO** | UX inconsistency, custom categories show plain text icon | 2 | P3 |

---

### 3.2 Performance Bottlenecks

| ID | Débito | Severidade | Impacto | Esforço | Prioridade |
|----|--------|-----------|---------|---------|-----------|
| FE-006 | Dashboard renders full transaction list (filter on client) vs server-side pagination | **MÉDIO** | 1000+ transactions = janky filtering, memory leak risk | 7 | P2 |
| FE-007 | No memoization of expensive calculations (total balance, category summaries) | **MÉDIO** | Every prop change recalculates everything | 4 | P2 |
| FE-008 | PDF export generates full table in memory before rendering | **MÉDIO** | Large datasets (500+ transactions) cause memory spike | 3 | P2 |

---

### 3.3 Design System Consistency

| ID | Débito | Severidade | Impacto | Esforço | Prioridade |
|----|--------|-----------|---------|---------|-----------|
| FE-009 | No design tokens (colors, spacing, typography standardized) | **MÉDIO** | Tailwind classes scattered, hard to maintain theme | 5 | P2 |
| FE-010 | Modal/form components duplicated across Settings, ImportExport, Goals, Investments | **MÉDIO** | Code duplication, inconsistent UX patterns | 6 | P2 |
| FE-011 | Dark mode toggle exists but theme not persisted or properly isolated | **MÉDIO** | Theme resets on refresh, TailwindCSS config incomplete | 2 | P3 |

---

### 3.4 Missing Components & Patterns

| ID | Débito | Severidade | Impacto | Esforço | Prioridade |
|----|--------|-----------|---------|---------|-----------|
| FE-012 | No loading skeleton components, only Loading spinner (generic) | **MÉDIO** | Poor perceived performance, layout shift on data load | 3 | P2 |
| FE-013 | No error boundary component for graceful fallback | **MÉDIO** | Single component crash brings down entire app | 2 | P2 |
| FE-014 | Transaction filters (date range, category, type) not persisted | **BAIXO** | UX friction, users reset filters on navigate | 2 | P3 |

---

## 4. Débitos de Testing & Quality

### 4.1 Test Coverage

| ID | Débito | Severidade | Impacto | Esforço | Prioridade |
|----|--------|-----------|---------|---------|-----------|
| TEST-001 | Only 2 test files in entire codebase (test coverage = ~1%) | **CRÍTICO** | No regression detection, refactoring risky | 34 | P0 |
| TEST-002 | No unit tests for business logic (transaction balance calc, recurrence grouping) | **CRÍTICO** | Bug-prone, hard to maintain financial calculations | 12 | P0 |
| TEST-003 | No integration tests for Supabase sync, auth flows, CRM impersonation | **ALTO** | End-to-end failures only caught in production | 18 | P1 |
| TEST-004 | No E2E tests for critical paths (add transaction, import CSV, AI chat) | **ALTO** | Manual testing bottleneck, human error risk | 20 | P1 |

---

### 4.2 Code Quality

| ID | Débito | Severidade | Impacto | Esforço | Prioridade |
|----|--------|-----------|---------|---------|-----------|
| TEST-005 | No linting/prettier config (inconsistent formatting, no auto-fix) | **MÉDIO** | Code review friction, style inconsistency | 1 | P3 |
| TEST-006 | No GitHub Actions CI/CD (tests not run on PR) | **MÉDIO** | Bad code merged, broken builds undetected | 6 | P2 |
| TEST-007 | No TypeScript strict mode (implicit any, loose checks) | **MÉDIO** | Type safety compromised | 2 | P2 |
| TEST-008 | Vitest + React Testing Library setup incomplete (no .test.tsx pattern adoption) | **MÉDIO** | Test infrastructure exists but unused | 1 | P3 |

---

## 5. Matriz Preliminar de Priorização

| Categoria | Críticos | Altos | Médios | Baixos | Total |
|-----------|----------|-------|--------|--------|-------|
| **Sistema** | 1 (SYS-006) | 5 (SYS-001/002/003/008/018) | 7 | 1 | **14** |
| **Database** | 1 (DB-001) | 2 (DB-002/003) | 4 | 1 | **8** |
| **Frontend** | 0 | 2 (FE-001/002) | 8 | 2 | **12** |
| **Testing** | 2 (TEST-001/002) | 2 (TEST-003/004) | 4 | 0 | **8** |
| **TOTAL** | **4** | **11** | **23** | **4** | **42** |

---

## 6. Impacto de Severidade por Esforço (Bubble Chart)

### Críticos (P0 - Drop Everything)
- **SYS-006** (FinanceContext): 21 dias, CRÍTICO → Split into 3 sub-contexts
- **TEST-001** (Zero tests): 34 dias, CRÍTICO → Bootstrap test suite
- **DB-001** (RLS missing): 3 dias, CRÍTICO → Add security policies
- **TEST-002** (Unit tests): 12 dias, CRÍTICO → Test calculator logic

### Altos (P1 - Sprint 1-2)
- **SYS-001** (Dashboard): 8 dias → Decompose into sub-components
- **SYS-002** (TransactionForm): 13 dias → Extract recurrence service
- **FE-001** (Accessibility): 12 dias → WCAG audit + fixes
- **FE-002** (Mobile): 8 dias → Responsive design audit
- **TEST-003** (Integration tests): 18 dias → Supabase sync tests
- **TEST-004** (E2E tests): 20 dias → Playwright or Cypress setup

### Médios (P2 - Sprint 3-4)
Priorizar por impacto/esforço ratio:
- **SYS-008** (Sync error handling): 6 dias, ALTO impacto
- **FE-006** (Pagination): 7 dias, MÉDIO impacto
- **DB-002** (Normalize schema): 13 dias, MÉDIO impacto (long-term)
- **SYS-012** (Impersonation state): 4 dias, MÉDIO impacto

---

## 7. Arquitetura Recomendada (Pós-Refatoração)

### 7.1 Proposed Context Split
```
FinanceContext (current: 96 exports) →
├── AuthContext (keep as is)
├── TransactionsContext (transactions, balance calc)
├── AccountsContext (accounts, CRUD)
├── GoalsContext (goals, investments, patrimony)
├── UIContext (dashboard layout, theme, modals)
└── SettingsContext (user profile, AI config)
```

### 7.2 Component Extraction Pattern
```
Dashboard.tsx (658 LOC) →
├── DashboardLayout (container)
├── UpcomingBillsWidget (isolated, memoized)
├── BalanceCard (isolated, memoized)
├── SpendingChart (isolated, memoized)
├── RecentTransactionsList (isolated, memoized)
└── CRMAlerts (isolated, async)
```

### 7.3 Service Layer Abstraction
```
services/
├── transactionService.ts (balance calc, recurrence grouping)
├── aiService.ts (unified AI + error recovery)
├── storageService.ts (localStorage abstraction, debouncing)
├── supabaseService.ts (Supabase wrapper, retry logic)
└── crmService.ts (health score, briefing generation)
```

---

## 8. Perguntas para Especialistas

### Para @data-engineer:
1. **RLS Policy Severity:** Quão crítica é a falta de RLS policies para escalabilidade e conformidade? Há risco de dados vazando entre usuários?
2. **Schema Normalization:** Seria melhor manter GlobalState JSON blob ou normalizar para tabelas específicas? Trade-off entre simplicidade e queryability?
3. **Index Strategy:** Quais índices são críticos para `fetchAllUserData()` performance com 1000+ usuários?
4. **Backup & Disaster Recovery:** Há política de backup automático para Supabase? Recoverable até quando?
5. **Audit Trail:** Implementar audit table para impersonation é essencial pré-produção?

### Para @ux-design-expert:
1. **Accessibility:** Qual é a prioridade: WCAG 2.1 AA ou AAA? Há clients com acessibilidade requisito?
2. **Mobile-First:** SPFP é used-first mobile ou desktop? Responsive breakpoints devem ser redesenhados?
3. **Component Debt:** Quais componentes causam mais UX friction? (Modals, forms, charts?)
4. **Design Tokens:** Há design system guideline já definido ou começamos do zero?
5. **Onboarding:** Há fluxo de onboarding para novos users? Isso deve ser prioritário?

### Para @qa:
1. **Critical Paths:** Quais flows são absolutamente não-negociáveis? (Auth, add transaction, export?)
2. **Test Coverage Target:** Meta de cobertura pré-produção? (80%, 90%?)
3. **Browser Support:** Quais browsers devem ser testados? (Chrome, Firefox, Safari, Edge?)
4. **Regression Risk:** Há histórico de regressions em features específicas?
5. **Performance Baselines:** Há SLOs definidos? (Bundle size, Time-to-Interactive, etc?)

---

## 9. Estimativa de Effort & Timeline

### Sprint 0 (Bootstrap - 1 semana)
- [ ] Setup test infrastructure (Vitest + React Testing Library)
- [ ] Add TypeScript strict mode
- [ ] Create GH Actions CI/CD pipeline
- [ ] Begin RLS policy definition

**Esforço:** 8 dias

### Sprint 1 (Security & Critical Bugs - 2 semanas)
- [ ] Implement RLS policies (DB-001) - 3 dias
- [ ] Add 40% unit test coverage (TEST-002) - 12 dias
- [ ] Fix `as any` type casts (SYS-014) - 4 dias

**Esforço:** 19 dias

### Sprint 2-3 (Component Refactoring - 4 semanas)
- [ ] Decompose Dashboard (SYS-001) - 8 dias
- [ ] Extract TransactionForm logic to service (SYS-002) - 13 dias
- [ ] Split FinanceContext into 3 sub-contexts (SYS-006) - 21 dias
- [ ] Add accessibility attributes (FE-001) - 12 dias

**Esforço:** 54 dias

### Sprint 4-5 (Performance & Testing - 4 semanas)
- [ ] Add pagination/virtualization (FE-006) - 7 dias
- [ ] Add E2E tests (TEST-004) - 20 dias
- [ ] Mobile responsive design (FE-002) - 8 dias
- [ ] Error recovery for sync (SYS-008) - 6 dias

**Esforço:** 41 dias

### Sprint 6 (Database Normalization - 3 semanas)
- [ ] Normalize user_data schema (DB-002) - 13 dias
- [ ] Add audit table (DB-008) - 5 dias

**Esforço:** 18 dias

**Total Estimated:** 130 dias ≈ 26 sprints (1.5 pessoas, 6.5 meses) ou 13 sprints (3 pessoas, 3 meses)

---

## 10. Próximos Passos

### Fase 5 (Data Engineer Review)
- [ ] @data-engineer revisar e validar (RLS, schema, index strategy)
- [ ] Responder 5 perguntas acima
- [ ] Propor ordem de implementação para DBs
- [ ] Estimar DB refactor effort

### Fase 6 (UX Designer Review)
- [ ] @ux-design-expert revisar e validar (accessibility, mobile, components)
- [ ] Responder 5 perguntas acima
- [ ] Propor component decomposition strategy
- [ ] Estimar UX effort

### Fase 7 (QA Review)
- [ ] @qa fazer review geral (test coverage, critical paths)
- [ ] Responder 5 perguntas acima
- [ ] Define test strategy por tier (unit, integration, E2E)
- [ ] Estimar QA effort

### Fase 8 (Architect Consolidation)
- [ ] @architect consolidar assessment final
- [ ] Crear detailed epic breakdown
- [ ] Propor implementation order (dependencies)
- [ ] Publish final Technical Debt Roadmap

---

## Anexo A: Code Snippet Examples

### Exemplo 1: FinanceContext Overcomplexity
```typescript
// src/context/FinanceContext.tsx (613 LOC, 96 exports)
// Problema: Tudo em um único contexto
const FinanceProvider: React.FC<{ children }> = ({ children }) => {
  const [state, setState] = useState(getInitialState());
  // ... 613 linhas depois com:
  // - addTransaction, updateTransaction, deleteTransaction, deleteTransactions
  // - addAccount, updateAccount, deleteAccount
  // - addGoal, updateGoal, deleteGoal
  // - addInvestment, updateInvestment, deleteInvestment
  // - addPatrimonyItem, updatePatrimonyItem
  // - loadClientData, stopImpersonating (impersonation logic)
  // - saveToCloud, sync logic
  // - ... e muito mais

  return <FinanceContext.Provider value={{...state, ...functions}}>{children}</FinanceContext.Provider>
};
```

**Impacto:** useFinance() hook retorna >50 items, impossível tree-shake, mudança no estado = re-render de toda árvore.

### Exemplo 2: TransactionForm State Explosion
```typescript
// src/components/TransactionForm.tsx (641 LOC, 20+ useState)
const TransactionForm = ({ onClose, initialData }) => {
  const [description, setDescription] = useState('');
  const [value, setValue] = useState('');
  const [type, setType] = useState('EXPENSE');
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [date, setDate] = useState(new Date()...);
  const [spender, setSpender] = useState('ME');
  const [paid, setPaid] = useState(true);
  const [sentiment, setSentiment] = useState(undefined);
  const [showImpulseAlert, setShowImpulseAlert] = useState(false);
  const [recurrence, setRecurrence] = useState('NONE');
  const [installments, setInstallments] = useState(2);
  const [invoiceOffset, setInvoiceOffset] = useState(0);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatGroup, setNewCatGroup] = useState('VARIABLE');
  const [newCatColor, setNewCatColor] = useState('#3b82f6');
  const [newCatIcon, setNewCatIcon] = useState('default');
  // ... + complex useEffect chains
};
```

**Impacto:** Hard to test (20 state vars), difficult to extract logic, tight coupling to UI.

### Exemplo 3: Type Safety Issues
```typescript
// src/components/AdminCRM.tsx:80
const response = await chatWithAI(
  [{ role: 'system', content: '...' }, { role: 'user', content: prompt }],
  { provider: provider as any, apiKey: apiKey, model: aiConfig?.model } // 'any'!
);

// src/services/aiService.ts:4-5
interface ChatMessage {
  role: 'user' | 'assistant' | 'model' | 'system'; // 'system' não é suportado por Gemini
  content: string;
}
```

**Impacto:** Runtime error se system prompt incluído no histórico.

---

## Anexo B: Referências e Padrões

- **Context Splitting:** Redux pattern for multiple domains
- **Component Decomposition:** Atomic Design + Compound Components
- **State Management:** Zustand or Redux Toolkit (vs Context API)
- **Performance:** React.memo, useMemo, useCallback + virtualization
- **Testing:** Jest/Vitest + React Testing Library + Cypress E2E
- **Accessibility:** WCAG 2.1 AA guidelines + axe audit tools
- **DB Design:** Supabase best practices + RLS examples

---

**Documento gerado:** 2026-01-26
**Versão:** 1.0 DRAFT
**Aprovação Pendente:** @data-engineer, @ux-design-expert, @qa
