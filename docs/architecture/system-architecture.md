# System Architecture — SPFP
> Brownfield Discovery — Fase 1 | @architect (Aria) | 2026-03-05

---

## 1. Visão Geral

**SPFP (Sistema de Planejamento Financeiro Pessoal)** é uma aplicação web de planejamento financeiro pessoal e consultoria de IA, construída com React 19, TypeScript e Vite. A plataforma oferece gerenciamento completo de finanças pessoais com inteligência artificial integrada via Google Gemini, proporcionando insights financeiros personalizados através do assistente **Finn**.

### Stack Tecnológico

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Frontend | React + TypeScript | 19 + 5.8 |
| Build | Vite | 6.2 |
| UI Framework | TailwindCSS | 3.4 |
| Roteamento | React Router DOM | v7 |
| Charts | Recharts | 3.5 |
| Backend/BaaS | Supabase (PostgreSQL, Auth, Real-time) | — |
| IA Principal | Google Gemini | 1.5-flash / 2.0-flash-exp |
| IA Centralizada | Finn Edge Function (Supabase) | — |
| Autenticação | Supabase Auth (Google OAuth + Email) | — |
| Persistência Local | localStorage | — |
| PDF | jsPDF + jsPDF-autotable | — |
| i18n | i18next | pt-BR |
| Pagamentos | Stripe | — |

---

## 2. Estrutura de Diretórios

```
src/
├── components/                          # Componentes React (UI + Pages)
│   ├── ui/                             # Componentes reutilizáveis (Loading, ErrorBoundary, Modal, etc.)
│   ├── dashboard/                      # Sub-componentes do Dashboard
│   │   ├── DashboardHeader.tsx
│   │   ├── DashboardMetrics.tsx
│   │   ├── DashboardChart.tsx
│   │   ├── DashboardAlerts.tsx
│   │   ├── DashboardTransactions.tsx
│   │   ├── DashboardErrorBoundary.tsx
│   │   ├── InvestmentMetricsWidget.tsx
│   │   └── dashboardUtils.ts
│   ├── portfolio/                      # Componentes de Portfólio
│   ├── goals/                          # Componentes de Objetivos (v2)
│   ├── retirement/                     # Componentes de Aposentadoria (v2)
│   ├── company/                        # Componentes CRM (CompanyCRM)
│   ├── partnerships/                   # Gestão de Parcerias
│   ├── corporate/                      # Corporate HQ
│   ├── automation/                     # Automação N8N
│   ├── Layout.tsx                      # Layout principal (sidebar + content)
│   ├── Dashboard.tsx                   # Container do Dashboard (orchestrator)
│   ├── Accounts.tsx                    # Gerenciamento de Contas
│   ├── TransactionForm.tsx             # Formulário de Transações
│   ├── TransactionList.tsx             # Lista de Transações
│   ├── Goals.tsx                       # Metas (v1)
│   ├── Patrimony.tsx                   # Patrimônio (Bens/Dívidas)
│   ├── Investments.tsx                 # Investimentos
│   ├── Reports.tsx                     # Relatórios
│   ├── Insights.tsx                    # IA Assistant (Finn) + Chat
│   ├── Budget.tsx                      # Orçamento/Metas de Gastos
│   ├── AdminCRM.tsx                    # Painel Admin (Impersonação)
│   ├── Login.tsx                       # Autenticação
│   ├── SalesPage.tsx                   # Landing Page (pública)
│   ├── Onboarding.tsx                  # Onboarding para novos usuários
│   ├── FinnAvatar.tsx                  # Avatar do Finn (modes: advisor/partner)
│   └── Branding.tsx                    # Página de Brand Guidelines
│
├── context/                            # Context Providers (State Management)
│   ├── AuthContext.tsx                 # Autenticação (Supabase Auth)
│   ├── FinanceContext.tsx              # Estado Global (Accounts, Transactions, Goals, etc.)
│   ├── UIContext.tsx                   # UI State (dark mode, notifications)
│   └── SidebarContext.tsx              # Sidebar Collapse State
│
├── services/                           # Business Logic & API Integration
│   ├── aiService.ts                    # Serviço unificado de IA (Google + OpenAI-compatible)
│   ├── geminiService.ts                # Integração específica Google Gemini
│   ├── aiHistoryService.ts             # Persistência de histórico (Supabase)
│   ├── errorRecovery.ts                # Tratamento centralizado de erros + logging
│   ├── retryService.ts                 # Retry logic com exponential backoff
│   ├── logService.ts                   # Logging de interações
│   ├── pdfService.ts                   # Geração de PDFs (jsPDF)
│   ├── csvService.ts                   # Import/Export de transações
│   ├── offlineSyncService.ts           # Sync offline-first com Supabase
│   ├── MarketDataService.ts            # Fetch de preços de investimentos
│   ├── projectionService.ts            # Projeções financeiras
│   ├── cardInvoiceService.ts           # Gerenciamento de Faturas de Cartão
│   ├── partnershipService.ts           # Gestão de Parcerias
│   └── assetService.ts                 # Gerenciamento de Ativos
│
├── hooks/                              # Custom React Hooks
│   ├── useSafeFinance.ts               # Safe wrapper para useFinance
│   ├── useAuth.ts
│   ├── useFinance.ts
│   ├── useMonthNavigation.ts
│   ├── useFormState.ts
│   ├── useStripeSubscription.ts
│   ├── useStripeCheckout.ts
│   ├── usePortfolio.ts
│   ├── usePartnerships.ts
│   └── useRetirementSettings.ts
│
├── types/                              # Definições TypeScript (monolítico)
│   └── types.ts
│
├── data/                               # Dados Iniciais & Constantes
│   └── initialData.ts                  # INITIAL_ACCOUNTS, INITIAL_CATEGORIES, INITIAL_TRANSACTIONS
│
├── utils/                              # Funções Auxiliares
│   ├── formatting.ts                   # Formatação (moeda, data, etc.)
│   └── calculations.ts                 # Cálculos financeiros
│
├── i18n/                               # Internacionalização (i18next, pt-BR)
├── test/                               # Testes (Vitest + React Testing Library)
├── supabase.ts                         # Cliente Supabase inicializado
├── App.tsx                             # Componente raiz com routing
└── main.tsx                            # Entry point
```

---

## 3. Arquitetura de Componentes

### Hierarquia de Providers

```
App (Root)
├── ErrorBoundary
├── I18nextProvider
├── UIProvider (dark mode, notifications)
├── BrowserRouter
├── AuthProvider (user, session, isAdmin)
├── SidebarProvider (isCollapsed)
└── FinanceProvider (global financial state)
    └── AppContent (Orchestrador de Rotas)
        ├── PrivateRoute (auth guard)
        ├── AdminRoute (admin guard)
        └── Routes (React Router v7)
```

### Padrões de Componentes

**1. Lazy Loading (Code Splitting)**
```typescript
const Dashboard = React.lazy(() => import('./components/Dashboard').then(m => ({ default: m.Dashboard })));
const Insights = React.lazy(() => import('./components/Insights').then(m => ({ default: m.Insights })));
// Todos os componentes de página carregam sob demanda
```

**2. Error Boundaries**
- `ErrorBoundary` global captura erros de componentes com UI fallback
- `DashboardErrorBoundary` específico para o Dashboard

**3. Safe Defaults Hook**
- `useSafeFinance()` previne crashes com defaults de array vazio e no-op functions

**4. Memoization**
- `React.memo()` em Dashboard, Insights
- `useMemo()` em cálculos pesados (Goals, Budget, Patrimony)

---

## 4. Fluxo de Dados

### Autenticação (AuthContext)

```
User Login/Google OAuth
    ↓
Supabase Auth.signInWithPassword() ou signInWithOAuth()
    ↓
AuthContext.setUser() + isAdmin check (ADMIN_EMAILS)
    ↓
User + Session em React State
    ↓
onAuthStateChange() listener persiste sessão após refresh
```

**Admin Detection:**
- `ADMIN_EMAILS = ['nando062218@gmail.com']` — hardcoded em AuthContext
- Admin acessa `/admin`, `/corporate`, `/partnerships`, `/empresa`

### Estado Financeiro Global (FinanceContext)

```typescript
GlobalState {
  accounts: Account[]
  transactions: Transaction[]
  categories: Category[]
  goals: Goal[]
  investments: InvestmentAsset[]
  patrimonyItems: PatrimonyItem[]
  userProfile: UserProfile
  categoryBudgets: CategoryBudget[]
  creditCardInvoices: CardInvoice[]
  partners: Partner[]
  assets: Asset[]
  lastUpdated: number
}

Persistência:
  - localStorage (chave: `visao360_v2_data_${userId}`)
  - Supabase (dados críticos)
  - offlineSyncService (sincronização background)

Sync Flags:
  - isSyncing
  - isInitialLoadComplete
  - isInvoicesSyncing
  - isImpersonating
```

### Soft Delete Pattern

```typescript
interface Entity {
  id: string;
  deletedAt?: number; // null = ativo, timestamp = deletado
}

filterActive()  // Remove deletedAt
filterDeleted() // Retorna apenas deletados
recoverTransaction(id) // Restaura deletedAt = null
```

### Sistema de Impersonação (AdminCRM)

```
Admin acessa /admin (AdminRoute)
    ↓
AdminCRM.loadClientData(userId)
    ↓
Salva admin state em adminOriginalState
    ↓
Substitui contexto com dados do cliente
    ↓
localStorage['spfp_is_impersonating'] = 'true'
localStorage['spfp_impersonated_user_id'] = userId
    ↓
Admin visualiza dados do cliente
    ↓
stopImpersonating() → restaura adminOriginalState
```

---

## 5. Integrações Externas

### Supabase

| Módulo | Uso | Status |
|--------|-----|--------|
| Auth | Google OAuth + Email/Password + session persistence | Ativo |
| PostgreSQL | Fonte de dados (backup do localStorage) | Parcialmente ativo |
| Real-time | Subscriptions para sync | Não implementado |
| Storage | Imagens (goal imageUrl, partnership logos) | Ativo |
| Edge Functions | Finn AI centralizado + webhooks | Ativo |

### Google Gemini

**aiService.ts:** Interface unificada com:
- **Primário:** gemini-1.5-flash, gemini-2.0-flash-exp, gemini-1.5-pro (fallback automático)
- **Secundário:** OpenAI-compatible endpoints customizados

**Finn Edge Function (Supabase):**
- Endpoint: `${SUPABASE_URL}/functions/v1/finn-chat`
- Rate limit por plano: Essencial 10, Wealth 15 msgs/mês
- Retorna: `{ text, modelName, used, limit }`

### Stripe

- `useStripeSubscription()` — criação de assinaturas
- Planos: Essencial (R$99), Wealth (R$349)
- Fluxo: Landing page → localStorage['pendingSubscriptionPriceId'] → Login → criar subscription

### Canva

- OAuth callback em `/oauth/canva/callback`
- Integração para design de assets (Branding page)

---

## 6. Padrões Arquiteturais

### Error Recovery (STY-007)

```typescript
errorRecovery.captureContext(error, action, options)
  → Captura contexto (userId, timestamp, errorType, stateSnapshot)
  → Detecta tipo de erro (transient, validation, auth, critical)
  → Loga com severity (low, medium, high, critical)
  → Retorna ErrorContext com userMessage em português

// Integrado em:
AuthContext, aiService, geminiService, FinanceContext (ops críticas)
```

### Retry Logic (retryService.ts)

```typescript
retryWithBackoff(operation, config)

Config padrão:
  maxRetries: 3
  initialDelayMs: 1000
  maxDelayMs: 10000
  backoffMultiplier: 2
  jitterFactor: 0.1
```

### Routing

```typescript
// PrivateRoute — auth guard
<Route path="/dashboard" element={
  <PrivateRoute>
    <Layout mode="personal">
      <Dashboard />
    </Layout>
  </PrivateRoute>
} />

// AdminRoute — admin guard
<Route path="/admin" element={
  <AdminRoute>
    <Layout mode="crm">
      <AdminCRM />
    </Layout>
  </AdminRoute>
} />
```

### Transaction Groups (Parcelados/Recorrentes)

```typescript
interface Transaction {
  groupId?: string;             // UUID único do grupo
  groupType?: 'INSTALLMENT' | 'RECURRING';
  groupIndex?: number;          // Posição no grupo
  groupTotal?: number;          // Total de parcelas (null = infinito)
}

// Operações:
getTransactionsByGroupId(groupId): Transaction[]
deleteTransactionGroup(groupId): deleta todas
deleteTransactionGroupFromIndex(groupId, fromIndex): deleta a partir do índice
```

### Layout Modes

| Mode | Sidebar | Usado em |
|------|---------|---------|
| `"personal"` | Portfólio, Objetivos, Patrimônio, Finn | Rotas privadas padrão |
| `"crm"` | Clients, Corporate, Partnerships, Branding | Rotas admin |

---

## 7. State Management

### Context Stack

```
App
  ├── ErrorBoundary
  ├── I18nextProvider
  ├── UIProvider
  │   └── isDark, theme, notifications
  ├── BrowserRouter
  ├── AuthProvider
  │   └── user, session, isAdmin, loading
  ├── SidebarProvider
  │   └── isCollapsed
  └── FinanceProvider
      └── all financial data + sync flags
```

### useSafeFinance Hook

Retorna defaults seguros quando context não disponível:

```typescript
useSafeFinance() {
  accounts: [],
  transactions: [],
  categories: [],
  // todos os arrays → []
  // todas as funções → no-op ()
}
```

---

## 8. Componentes Críticos

### Dashboard

- **Padrão:** Orchestrador que compõe 6 sub-componentes
- **Memoization:** `React.memo()` + 5 custom hooks isolados
- **Data flow:** `useSafeFinance()` → hooks de métricas → sub-componentes

Sub-componentes:
1. `DashboardHeader` — Greeting + action buttons
2. `DashboardMetrics` — 3 cards (saldo, renda, gastos)
3. `DashboardAlerts` — Budget violations + atypical spending
4. `DashboardChart` — Trend chart + category breakdown
5. `DashboardTransactions` — Recent txs + accounts
6. `MonthlyRecap` — Modal de resumo mensal (Finn partner)

### Insights (Finn AI)

Fluxo de mensagem:
```
User input
    ↓
buildSystemPrompt(transactions, goals, accounts, investments)
    ↓
messages = [...history, { role: 'user', content: input }]
    ↓
callFinnProxy(messages) [Edge Function]
    ↓
Parse response → { text, modelName, used, limit }
    ↓
saveAIInteraction(userId, prompt, response)
    ↓
Render response + update finnUsage
    ↓
Handle rate limit (isRateLimit, isNoPlan)
```

### AdminCRM

State keys localStorage:
```typescript
'spfp_is_impersonating': 'true' | null
'spfp_impersonated_user_id': userId | null
adminOriginalState: GlobalState (backed up)
```

---

## 9. Tipos de Dados Principais

### Transaction

```typescript
{
  id: string;
  accountId: string;
  description: string;
  value: number;
  date: string;           // YYYY-MM-DD
  type: 'INCOME' | 'EXPENSE';
  categoryId: string;
  paid: boolean;
  spender?: string;       // 'ME' | 'SPOUSE'
  sentiment?: string;
  groupId?: string;
  groupType?: 'INSTALLMENT' | 'RECURRING';
  groupIndex?: number;
  groupTotal?: number;
  deletedAt?: number;     // Soft delete
}
```

### Account

```typescript
{
  id: string;
  name: string;
  type: 'CHECKING' | 'INVESTMENT' | 'CASH' | 'CREDIT_CARD';
  owner: 'ME' | 'SPOUSE' | 'JOINT';
  balance: number;
  creditLimit?: number;
  color?: string;
  lastFourDigits?: string;
  network?: 'VISA' | 'MASTERCARD' | 'ELO' | 'AMEX' | 'OTHER';
  closingDay?: number;
  dueDay?: number;
  isVirtualCard?: boolean;
  parentCardId?: string;
  deletedAt?: number;
}
```

### Goal

```typescript
{
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;       // YYYY-MM-DD
  color: string;
  icon?: string;
  imageUrl?: string;      // Supabase Storage
  status: 'IN_PROGRESS' | 'COMPLETED' | 'PAUSED' | 'ARCHIVED';
  deletedAt?: number;
}
```

---

## 10. Performance

| Otimização | Onde | Status |
|-----------|------|--------|
| Code splitting (React.lazy) | App.tsx (todas as páginas) | ✅ Implementado |
| Bundle chunking por vendor | vite.config.ts | ✅ Implementado |
| React.memo() | Dashboard, Insights | ✅ Implementado |
| useMemo/useCallback | Goals, Budget, Patrimony | ✅ Parcial |
| localStorage cache | FinanceContext | ✅ Implementado |
| Virtual scrolling | TransactionList | ❌ Não implementado |
| Pagination | Relatórios, listas | ❌ Não implementado |

---

## 11. Segurança

| Item | Status | Observação |
|------|--------|-----------|
| Autenticação | ✅ Supabase Auth | Google OAuth + Email/Password |
| Admin emails | ⚠️ Hardcoded | ADMIN_EMAILS em AuthContext |
| Gemini API key | ⚠️ Frontend | Em vite.config.ts (checar .gitignore) |
| Finn centralizado | ✅ Edge Function | JWT Supabase + rate limit por plano |
| Rate limiting | ✅ Finn | Essencial 10, Wealth 15 msgs/mês |
| Dados por usuário | ✅ RLS + localStorage keys | Sem cross-user leakage |

---

## 12. Fluxos de Negócio Principais

### Onboarding de Novo Usuário

```
Visita / (SalesPage) → Sign up → Logado → /dashboard
    ↓
App.tsx detecta localStorage[`spfp_onboarding_seen_${userId}`] == null
    ↓
Mostra Onboarding (5 telas com Finn) → Completa → oculta
```

### Criação de Transação

```
"Nova Lançamento" → /transactions/add → TransactionForm
    ↓
User preenche → Save → FinanceContext.addTransaction()
    ↓
localStorage atualizado → Supabase sync → /transactions
```

### Análise IA (Finn)

```
/insights → Carrega histórico (getAIHistory)
    ↓
Quick prompt ou mensagem digitada
    ↓
buildSystemPrompt(dados financeiros) → callFinnProxy()
    ↓
Rate limit check → Resposta → saveAIInteraction()
    ↓
FinnAvatar anima → mostra resposta → continua conversa
```

---

## 13. Débitos Técnicos Observados

### DT-001 — FinanceContext Monolítico (Alta)
**Problema:** ~1000+ LOC, gerencia todos os domínios em um único arquivo.
**Impacto:** Difícil testar, qualquer mudança recausa re-render global, escalabilidade baixa.
**Solução:** Split em sub-contexts (AccountsContext, TransactionsContext, GoalsContext, etc.).

### DT-002 — Impersonation State Complexity (Alta)
**Problema:** 5 mecanismos de estado para impersonação (flags, localStorage, state backup, ref).
**Impacto:** Dessincronização possível; bugs se admin navegar durante impersonação.
**Solução:** Criar `ImpersonationService` dedicado com testes de cenário.

### DT-003 — types.ts Monolítico (Média)
**Problema:** Arquivo único com todas as interfaces (~250+ LOC).
**Impacto:** Difícil navegar; imports genéricos.
**Solução:** Split por domínio: `types/transactions.ts`, `types/accounts.ts`, etc.

### DT-004 — Error Recovery Não Universalizado (Média)
**Problema:** pdfService, csvService, MarketDataService sem errorRecovery.
**Impacto:** Erros não logados centralmente; observabilidade reduzida.
**Solução:** Adicionar errorRecovery a todos os serviços de I/O.

### DT-005 — Real-time Sync Não Implementado (Média)
**Problema:** FinanceContext tem `isSyncing` mas listeners Supabase não ativados.
**Impacto:** Dados não atualizam em múltiplas abas/dispositivos; localStorage é source-of-truth.
**Solução:** Implementar listeners para tabelas críticas (transactions, goals).

### DT-006 — Falta de Testes para FinanceContext (Alta)
**Problema:** Camada central de estado sem testes unitários.
**Impacto:** Bugs em operações de estado não detectados; refactor arriscado.
**Solução:** `FinanceContext.test.tsx`, `impersonation.test.tsx`, `softDelete.test.tsx`.

### DT-007 — Escalabilidade do Dashboard (Média)
**Problema:** Dashboard carrega TODOS os dados em memória (sem paginação).
**Impacto:** Com 10k+ transações, rendering fica lento; mobile trava.
**Solução:** Pagination/infinite scroll em TransactionList; aggregações no backend.

### DT-008 — Dual Path de AI (Finn vs aiService) (Média)
**Problema:** Dois caminhos: `callFinnProxy()` (Edge Function) e `chatWithAI()` (SDK direto).
**Impacto:** Code duplication; confusão sobre qual usar; rate limit apenas no Finn.
**Solução:** Consolidar em `callFinnProxy()` para produção; manter aiService como fallback.

### DT-009 — Build Warnings/Bundle Size (Baixa)
**Problema:** `chunkSizeWarningLimit: 600` em vite.config.ts — chunks estão grandes.
**Impacto:** TTI (Time To Interactive) lento em conexões lentas.
**Solução:** Bundle audit com `npm run build`; tree-shake; mais lazy loading.

### DT-010 — Admin Emails Hardcoded (Segurança)
**Problema:** `ADMIN_EMAILS = ['nando062218@gmail.com']` hardcoded em AuthContext.
**Impacto:** Mudança de admin requer deploy.
**Solução:** Configurar via variável de ambiente ou tabela Supabase.

---

## 14. Checklist de Qualidade

| Item | Status |
|------|--------|
| Type coverage (sem `any`) | ⚠️ Parcial |
| Testes unitários FinanceContext | ❌ Ausente |
| Testes de impersonation | ❌ Ausente |
| Error recovery em todos os serviços | ⚠️ Parcial (4/12 serviços) |
| Real-time sync implementado | ❌ Ausente |
| Bundle size < 500KB gzip | ⚠️ A verificar |
| Lighthouse Score > 90 | ⚠️ A verificar |
| WCAG 2.1 AA validado | ❌ Ausente |
| Testes E2E (login, transaction, insights) | ❌ Ausente |

---

## 15. Recomendações para Próximas Fases

### Fase 2 — Arquitetura
1. Split FinanceContext em sub-contexts
2. Consolidar Finn vs aiService
3. Implementar real-time Supabase sync

### Fase 3 — Performance
1. Virtual scrolling para TransactionList
2. Pagination em relatórios
3. Aggregações no backend (Supabase functions)
4. Optimize bundle size

### Fase 4 — Testing
1. Unit tests para FinanceContext
2. Integration tests para critical flows
3. E2E tests (Playwright)
4. Performance testing (Lighthouse CI)

### Fase 5 — DevOps
1. Error monitoring (Sentry)
2. Observability (Datadog/LogRocket)
3. CI/CD pipeline
4. Database migrations (Supabase schema versioning)

---

> Produzido por @architect (Aria) — Brownfield Discovery Fase 1
> 10 débitos técnicos identificados | Arquitetura sólida com pontos de melhoria críticos
