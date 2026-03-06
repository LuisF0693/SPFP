# Frontend Specification — SPFP Platform
> Brownfield Discovery — Fase 3 | @ux-design-expert (Uma) | 2026-03-05

---

## 1. Mapeamento de Rotas e Páginas

### Rotas Públicas
| Rota | Componente | Propósito |
|------|-----------|-----------|
| `/` | SalesPage | Landing page com pricing |
| `/login` | Login | Auth (email + Google OAuth) |
| `/branding` | Branding | Brand guidelines (acesso aberto) |
| `/transforme` | TransformePage | Rota pública (propósito unclear) |

### Rotas Privadas (PrivateRoute)
| Rota | Componente | Propósito |
|------|-----------|-----------|
| `/dashboard` | Dashboard | Visão geral financeira (métricas, alertas, gráficos) |
| `/accounts` | Accounts | Gerenciamento de contas bancárias |
| `/transactions` | TransactionList | Extrato e histórico |
| `/transactions/add` | TransactionForm | Criar/editar transações (fullscreen modal) |
| `/goals` | Goals | Metas financeiras v1 (clássica) |
| `/goals-v2` | GoalsAdvanced | Metas financeiras v2 (redesenho) |
| `/portfolio` | Portfolio | Investimentos |
| `/patrimony` | Patrimony | Patrimônio (imóveis, veículos, dívidas) |
| `/acquisition` | Acquisition | Aquisição de bens |
| `/retirement` | Retirement | Aposentadoria v1 |
| `/retirement-v2` | RetirementAdvanced | Aposentadoria v2 |
| `/reports` | Reports | Relatórios |
| `/insights` | Insights | Finn chatbot (IA financeira) |
| `/budget` | Budget | Orçamento e metas mensais |
| `/installments` | Installments | Parcelamentos |
| `/settings` | Settings | Perfil e configurações |
| `/automation` | AutomationDashboard | Automações |
| `/checkout-success` | CheckoutSuccess | Stripe (pós-pagamento) |
| `/checkout-cancel` | CheckoutCancel | Stripe (cancelamento) |
| `/oauth/canva/callback` | CanvaOAuthCallback | Callback OAuth Canva |

### Rotas Admin (AdminRoute)
| Rota | Componente | Propósito |
|------|-----------|-----------|
| `/admin` | AdminCRM | Painel administrativo, gerência de clientes |
| `/partnerships` | PartnershipsPage | Gestão de parcerias |
| `/corporate` | CorporateHQ | Sede corporativa |
| `/empresa` | CompanyCRM | CRM empresarial (sem Layout wrapper) |

---

## 2. Design System

### Paleta de Cores (tailwind.config.js)

**Esquema SPFP:**
| Token | Hex | Uso |
|-------|-----|-----|
| Navy-900 | `#0A1628` | Fundo escuro premium |
| Navy-700 | `#1B3A6B` | Cor principal secundária |
| Blue-Logo | `#1B85E3` | Símbolo SPFP |
| Blue-SPFP | `#6AA9F4` | Azul claro auxiliar |
| Teal-500 | `#00C2A0` | Finn (partner mode), metas, sucesso |
| Blue-100 | `#E8F1FD` | Fundo claro |

**Design Tokens adicionais:**
| Token | Hex |
|-------|-----|
| primary | `#135bec` |
| surface-dark | `#1A2233` |
| border-dark | `#2e374a` |
| text-secondary-dark | `#92a4c9` |

### Tipografia
- **UI Primary:** Plus Jakarta Sans
- **UI Fallback:** Inter
- **Display:** Sora, Plus Jakarta Sans
- **Serif:** Playfair Display (headlines)
- **Mono:** Courier New

### Glassmorphism & Dark Mode
- **Dark Mode:** `darkMode: 'class'` (Tailwind)
- **Pattern:** `bg-black/40 backdrop-blur-xl border-white/5`
- Usado em: Insights, Onboarding, Login

### Animações Customizadas
| Animação | Duração | Uso |
|----------|---------|-----|
| `fade-in` | 0.8s ease-out | Entrada de elementos |
| `slide-up` | 0.8s ease-out | Entrada de cards |
| `pulse-slow` | 4s infinite | Background pulse |
| `glow` | 2s infinite | Efeito azul neon |
| `breathing` | — | Virtual office |
| `typing` | — | Finn "digitando" |
| `slide-in-right` | 0.3s | Painéis laterais |
| `scale-in` | 0.2s | Modais |

### Estados Visuais
| Estado | Implementação |
|--------|--------------|
| Active | Bg gradiente + border + shadow da cor da marca |
| Hover | Transparência + mudança de cor + translate |
| Loading | `animate-spin` + pulso |
| Error | Bg `#ef4444`, border `rose-500` |
| Success | Bg `#10b981`, border `emerald-500` |

---

## 3. Inventário de Componentes

### Páginas (Large, > 400 linhas)
| Componente | Linhas est. | Funcionalidade |
|-----------|------------|----------------|
| Insights.tsx | ~675 | Chatbot Finn, diagnóstico 360, histórico |
| Layout.tsx | ~467 | Sidebar + header + nav (3 modos: desktop, mobile, admin) |
| AdminCRM.tsx | ~250+ | Gerência de clientes, briefings IA, timeline |
| SalesPage.tsx | ~200+ | Landing page com pricing |
| Dashboard.tsx | ~211 | Orquestração de sub-componentes |
| Patrimony.tsx | ~250+ | Patrimônio (imóveis, veículos, dívidas) |
| Budget.tsx | ~200+ | Orçamento mensal/anual |

### Features (Medium, 100-400 linhas)
| Componente | Linhas est. | Propósito |
|-----------|------------|----------|
| FinnAvatar.tsx | ~60 | Avatar Finn (2 modos, 4 tamanhos) |
| Onboarding.tsx | ~169 | Onboarding 5-telas |
| Login.tsx | ~200 | Auth form |
| MonthlyRecap.tsx | — | Resumo mensal com Finn |

### UI Reutilizáveis (Small, < 100 linhas)
- ErrorBoundary.tsx
- Loading.tsx
- Modal.tsx
- Skeleton.tsx (card, chart, table-row variants)
- RouteLoadingBoundary.tsx
- PWAStatusBar.tsx
- Logo.tsx
- CategoryIcon.tsx
- PricingCard.tsx

### Componentes Compostos

**dashboard/:**
- DashboardHeader, DashboardMetrics, DashboardChart, DashboardAlerts, DashboardTransactions, DashboardErrorBoundary

**budget/:**
- BudgetMetrics, BudgetChart, BudgetCategoryList, CategoryBudgetItem, InsightCard, EmergencyFundCard

**transaction/:**
- TransactionBasicForm, TransactionRecurrenceForm, TransactionMetadata

**goals/:**
- GoalsAdvanced.tsx

**retirement/:**
- RetirementAdvanced.tsx

**crm/:**
- UnifiedClientModal

**Total estimado de componentes:** 40+

---

## 4. Fluxo de Usuário

### Onboarding (Novo Usuário)
1. Registro (`/login`) — email, senha, nome
2. Verificação de email (Supabase auth)
3. Redirecionamento → `/dashboard`
4. Trigger Onboarding:
   - `localStorage.getItem('spfp_onboarding_seen_{userId}')` === null
   - `transactions.length === 0`
5. 5 Telas com Finn:
   - Tela 1: Welcome (Finn partner, teal)
   - Tela 2: O App (Finn advisor, blue)
   - Tela 3: A Consultoria (Finn advisor)
   - Tela 4: Finn 24h (Finn advisor)
   - Tela 5: Pronto para começar? (Finn partner)
6. Completa → localStorage marked, modal fecha, usuário em `/dashboard`

### Usuário Autenticado
1. Login → Auth guard verifica sessão Supabase
2. Loading → `isInitialLoadComplete` + `isSyncing` checks
3. Redirecionamento:
   - Admin → `/admin`
   - Normal → `/dashboard`
4. Navegação hierárquica no Layout sidebar
5. Finn Insights Flow:
   - 1º acesso → "Gerar Diagnóstico Financeiro"
   - Diagnóstico → contexto financeiro injetado no Gemini
   - Chat mode → quick chips (6 prompts aleatórios)
   - Histórico → salvo em Supabase (aiHistoryService)
   - Rate limit → overlay "Finn bloqueado"

### Admin (Impersonação)
1. Admin acessa `/admin`
2. AdminCRM → lista de clientes com search
3. Clica cliente → `loadClientData(userId)`
4. Estado capturado → admin original salvo em localStorage
5. `isImpersonating = true` → vê dados do cliente
6. "Sair da Visualização" → `stopImpersonating()` → retorna para admin data

---

## 5. Estado de UX

### Consistência Visual

**Forte:**
- Paleta de cores coerente (navy + blue + teal)
- Tipografia consistente (Plus Jakarta Sans)
- Ícones Lucide React padronizados
- Dark mode aplicado globalmente

**Inconsistências:**
1. **Goals v1 + v2 coexistem** — `/goals` e `/goals-v2` ambos no sidebar
2. **Retirement v1 + v2 coexistem** — mesma confusão
3. **TransactionForm sem Layout** — fullscreen modal vs. layout pattern
4. **Button styles variados** — sem padrão único

### Loading States
| Estado | Implementação |
|--------|--------------|
| Global | `isInitialLoadComplete` + `isSyncing` |
| Components | Skeleton.tsx (card, chart, table-row) |
| Rotas | RouteLoadingBoundary + Suspense |
| Finn | "Finn está analisando..." (Loader2) |

**Gaps:** TransactionForm, Patrimony sem loading states explícitos.

### Error States
**Presentes:** ErrorBoundary global, DashboardErrorBoundary, inline errors em Insights/Login/AdminCRM.

**Gaps:** Sem toast notifications globais; falhas silenciosas em FinanceContext.

### Empty States
**Presentes:** Insights ("Oi. Eu sou o Finn"), Login (branding imersivo).

**Gaps:** Dashboard, TransactionList, Patrimony sem empty state visual.

### Mobile Responsiveness
**Bem implementado:**
- Desktop sidebar → Mobile bottom navigation (8 items)
- Breakpoints: `md:` (768px), `lg:` (1024px)
- Flex/grid responsive (1 col mobile, 2-4 cols desktop)

**Risco:** Recharts charts podem overflow em mobile.

---

## 6. Acessibilidade (a11y)

### Implementado
- Skip link: "Pular para o conteúdo principal" (`#main-content`)
- Semantic HTML: `<main>`, `<nav>`, `<header>`, `<section>`
- ARIA roles: `role="navigation"`, `role="main"`, `role="complementary"`
- ARIA labels em Layout
- ARIA expanded em seções expansíveis
- ARIA live regions: `aria-live="polite"` em alertas
- Keyboard nav em admin impersonation (`onKeyDown Enter/Space`)

### Problemas Críticos
1. **Sem `data-testid`** — componentes não testáveis
2. **Baixa cobertura ARIA** — Goals, Insights, Budget faltam labels
3. **Contraste não validado** — `#6AA9F4` (texto) em fundo preto
4. **Sem focus trap em modais** — usuário escapa com Tab
5. **Input fields sem `aria-describedby`** — sem associação com erros

---

## 7. Performance Frontend

### Otimizações Implementadas
1. **Code Splitting** — `React.lazy` em todas as páginas (App.tsx)
2. **Memoization** — `memo()` em Dashboard, `useMemo` em Goals/Budget/Patrimony
3. **Suspense Boundaries** — `<Suspense fallback={<RouteLoadingBoundary />}>`
4. **Custom Hooks** — `useSafeFinance`, `useMonthlyMetrics`, `useBudgetAlerts`, etc.
5. **TailwindCSS** — zero runtime, CSS purged no build

### Problemas de Performance
| Problema | Componente | Severidade |
|----------|-----------|-----------|
| Componente sem memo() | Layout.tsx (467 linhas) | Alta |
| Muitos useState (10+) | Insights.tsx | Alta |
| Sem lazy sub-components | DashboardHeader, etc. | Média |
| localStorage sem debounce | FinanceContext | Média |
| useEffect deps ausentes | Insights.tsx | Média |

### Tamanho dos Componentes
| Componente | Linhas | Avaliação |
|-----------|--------|-----------|
| Insights.tsx | ~675 | MUITO GRANDE — quebrar em sub-componentes |
| Layout.tsx | ~467 | MUITO GRANDE — separar 3 nav systems |
| AdminCRM.tsx | ~250+ | Grande — briefing + timeline como sub-comp |
| Patrimony.tsx | ~250+ | Grande |

---

## 8. Débitos Técnicos UX/Frontend

### Críticos (P0)
1. **Duplicação Goals/Retirement v1+v2** — confusão de UX e manutenção dupla
2. **Sem `data-testid`** — impossibilita testes automatizados de UI
3. **TransactionForm sem Layout** — UX inconsistente (fullscreen vs. roteado)
4. **Sem error boundaries granulares** — falhas em Insights/Goals/AdminCRM sem fallback
5. **Sem focus trap em modais** — acessibilidade crítica

### Altos (P1)
6. **Sem toast notifications** — erros inline sem padrão
7. **Contraste WCAG não validado** — risco de a11y
8. **Mobile Recharts overflow** — charts podem quebrar em telas pequenas
9. **Insights.tsx muito grande** — manutenibilidade baixa
10. **Layout.tsx muito grande** — manutenibilidade baixa

### Médios (P2)
11. Recharts sem custom tooltips acessíveis
12. useEffect cleanup ausente — memory leaks
13. Strings hard-coded sem i18n
14. Animações sem `prefers-reduced-motion`
15. Skeleton colors não matched ao tema

---

## 9. Score UX/Frontend

| Dimensão | Score | Observações |
|----------|-------|-------------|
| Design Consistency | 7/10 | Paleta coerente, mas v1/v2 duplicações |
| Accessibility | 4/10 | ARIA básico OK, sem focus-trap, baixa cobertura |
| Performance Frontend | 6/10 | Code splitting + memo, mas componentes grandes |
| Code Quality | 5/10 | Patterns OK, sem error boundaries granulares |
| User Experience | 7/10 | Fluxos claros, Finn bem implementado |
| Mobile Responsiveness | 8/10 | Bottom nav + responsive layout excelentes |
| Error Handling | 4/10 | Global only, sem toasts, falhas silenciosas |

### **Score Total: 31/50**

---

## 10. Recomendações Prioritárias

### P0 (Imediato)
1. Escolher Goals v1 ou v2 — deprecar o outro
2. Escolher Retirement v1 ou v2 — deprecar o outro
3. Adicionar `data-testid` em 50+ componentes críticos
4. Implementar error boundaries em todas as páginas
5. Adicionar toast notification system (react-hot-toast ou similar)
6. Focus-trap em Onboarding + TransactionForm modais

### P1 (Próximas 2 sprints)
7. Refatorar Insights.tsx → 3-4 sub-componentes
8. Refatorar Layout.tsx → separar desktop/mobile/admin nav
9. Validar contraste WCAG (axe DevTools)
10. Mobile chart responsiveness (Recharts)
11. Memory leak audit (useEffect cleanup)

### P2 (Backlog)
12. Google Analytics
13. `prefers-reduced-motion` nas animações
14. Strings hard-coded → i18n
15. Skeleton colors match theme
16. Documentar PWAStatusBar

---

> Produzido por @ux-design-expert (Uma) — Brownfield Discovery Fase 3
> Score: 31/50 — Frontend bem estruturado, com débitos de qualidade significativos
