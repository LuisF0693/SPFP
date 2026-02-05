# ROADMAP ESTRATÉGICO: Features Aprovadas Cliente
## STY-051 a STY-085 (35 Stories | 200-260 horas)

**Prepared by:** Morgan - Product Manager
**Date:** Fevereiro 2026
**Duration:** 7 semanas (3 fases)
**Team Size:** 1 Dev + 1 QA + 1 Architect

---

## SUMÁRIO EXECUTIVO

Este roadmap estrutura as 10 features aprovadas pelo cliente em 35 user stories distribuídas em 3 fases sequenciais. O objetivo é entregar incrementos funcionais a cada 2 semanas, iniciando por features de fundação (sidebar, faturas, cartão) e evoluindo para features de alto valor (aposentadoria, patrimônio, CRM).

### 10 Features Aprovadas pelo Cliente
1. Sidebar reorganizado: Orçamento expandível + Contas/Lançamentos/Parcelamentos
2. Faturas de cartão: Puxar parcelas atuais, futuras e valor ideal
3. Investimentos: Portfólio simples
4. Aposentadoria: NOVO VISUAL tipo DashPlan com gráfico de evolução
5. Aquisições de Bens: Comparação de vantagens
6. Patrimônio: Listagem melhorada
7. Cartão: VISUAL REALISTA com nome da pessoa
8. CRM - Parcerias: Aba com parceiros + recebíveis + datas
9. CRM - Financeiro: Datas de renovação + histórico de pagamentos
10. Mobile: PWA + offline + push notifications

### Métricas de Entrega
- **FASE 1 (2 sem):** 60-80h | 15 stories | P0 = 10 blockers
- **FASE 2 (3 sem):** 80-100h | 10 stories | P0 = 5 blockers
- **FASE 3 (2 sem):** 60-80h | 10 stories | P1/P2 mix

**Total:** 35 stories | 200-260h | 100% client-approved features

---

## FASE 1: FOUNDATION (2 SEMANAS - 60-80 HORAS)

### Feature Area 1: Sidebar Reorganization (STY-051 a STY-057)

## STY-051: Sidebar Context & State Management
**Prioridade:** P0 ⚠️ BLOCKER
**Esforço:** 6h
**Sprint:** Fase 1
**Status:** READY

### User Story
Como desenvolvedor backend, quero criar um contexto React para gerenciar o estado expandido/colapsado do sidebar, para que todos os componentes estejam sincronizados

### Acceptance Criteria
- [ ] Critério 1: SidebarContext criado com estado `isExpanded` (boolean) e `toggleSidebar()` função
- [ ] Critério 2: Context salvo em localStorage com chave `spfp_sidebar_state`
- [ ] Critério 3: Hook `useSidebar()` exportado e funcionando em todos os componentes
- [ ] Critério 4: Estado persiste ao recarregar página
- [ ] Critério 5: TypeScript interfaces definidas em `src/types/sidebar.ts`

### Technical Notes
- Criar `src/context/SidebarContext.tsx`
- Integrar com FinanceContext sem duplicação de dados
- Usar localStorage com fallback `{ isExpanded: true }`
- Implementar com error recovery

### Dependencies
- Nenhuma

### Files to Modify/Create
- src/context/SidebarContext.tsx (NEW)
- src/types/sidebar.ts (NEW)
- src/App.tsx (modificar Provider)

### Success Metrics
- Context criado e testado
- localStorage funcionando
- Zero prop drilling no Layout

---

## STY-052: Sidebar Layout Redesign - UI Component
**Prioridade:** P0 ⚠️ BLOCKER
**Esforço:** 8h
**Sprint:** Fase 1
**Status:** READY

### User Story
Como usuário, quero que o sidebar se reorganize com seções colapsáveis (Orçamento, Contas, Lançamentos, Parcelamentos), para facilitar a navegação e reduzir o clutter visual

### Acceptance Criteria
- [ ] Critério 1: Sidebar redesenhado com 4 seções expandíveis (Orçamento, Contas, Lançamentos, Parcelamentos)
- [ ] Critério 2: Ícone de chevron (chevron-down/up) indica estado expandido/colapsado
- [ ] Critério 3: Cada seção possui altura variável com animação suave (transition: 300ms)
- [ ] Critério 4: No mobile (< 768px), sidebar inicia colapsado; no desktop (>= 768px), inicia expandido
- [ ] Critério 5: Glassmorphism mantido com nova layout

### Technical Notes
- Usar Tailwind CSS com `max-h` e `overflow-hidden` para animação
- Ícones do Lucide React (ChevronDown, ChevronUp)
- Breakpoint: md (768px)
- Cor de fundo: `bg-white/10 backdrop-blur-md` mantido

### Dependencies
- STY-051 (SidebarContext necessário)

### Files to Modify/Create
- src/components/Layout.tsx (modificar Sidebar)
- src/components/ui/SidebarSection.tsx (NEW)

### Success Metrics
- Visual design aprovado por cliente
- Animação suave em todos os browsers
- Responsivo em mobile e desktop

---

## STY-053: Budget Section in Sidebar
**Prioridade:** P0 ⚠️ BLOCKER
**Esforço:** 7h
**Sprint:** Fase 1
**Status:** READY

### User Story
Como usuário, quero ver um resumo do meu orçamento no sidebar expandível, para ter visibilidade rápida dos limites gastos vs planejado

### Acceptance Criteria
- [ ] Critério 1: Seção "Orçamento" exibe 3 principais categorias com barra de progresso
- [ ] Critério 2: Barra de progresso mostra percentual gasto (vermelho > 80%, amarelo 50-80%, verde < 50%)
- [ ] Critério 3: Clique na categoria leva para página de Budget com filtro pré-aplicado
- [ ] Critério 4: Valor total e limite exibidos abaixo do nome da categoria
- [ ] Critério 5: Atualiza em tempo real quando transação é adicionada/removida

### Technical Notes
- Reutilizar dados de `useFinance()` hook
- Calcular top 3 categorias por gasto do mês atual
- Usar cores já definidas no design system
- Implementar com `useMemo` para otimização

### Dependencies
- STY-051 (SidebarContext)
- STY-052 (Sidebar Layout)

### Files to Modify/Create
- src/components/ui/SidebarSection.tsx (adicionar Budget section)

### Success Metrics
- Sidebar Budget section visível e funcional
- Cores indicam status corretamente
- Navegação para Budget funciona

---

## STY-054: Accounts Section in Sidebar
**Prioridade:** P0 ⚠️ BLOCKER
**Esforço:** 5h
**Sprint:** Fase 1
**Status:** READY

### User Story
Como usuário, quero listar minhas contas no sidebar com saldo atual, para acesso rápido aos dados de contas

### Acceptance Criteria
- [ ] Critério 1: Seção "Contas" lista todas as contas (max 8 visíveis, com scroll se houver mais)
- [ ] Critério 2: Cada conta mostra: nome, ícone do banco (BankLogo.tsx), saldo em formato BRL
- [ ] Critério 3: Clique na conta filtra TransactionList para aquela conta
- [ ] Critério 4: Ícone "+" ao lado permite adicionar nova conta (abre modal AccountForm)
- [ ] Critério 5: Saldo atualiza em tempo real

### Technical Notes
- Reutilizar `BankLogo.tsx` existente
- Usar `useFinance().accounts` para listar
- Implementar scroll em sidebar se necessário (max-h-48)
- Formatar com `formatCurrency()`

### Dependencies
- STY-051 (SidebarContext)
- STY-052 (Sidebar Layout)

### Files to Modify/Create
- src/components/ui/SidebarSection.tsx (adicionar Accounts section)

### Success Metrics
- Sidebar Accounts section funcional
- Saldo atualiza em tempo real
- Navegação filtra transações corretamente

---

## STY-055: Transactions & Installments Section in Sidebar
**Prioridade:** P1
**Esforço:** 6h
**Sprint:** Fase 1
**Status:** READY

### User Story
Como usuário, quero visualizar lançamentos pendentes e parcelamentos no sidebar, para ter visibilidade de compromissos futuros

### Acceptance Criteria
- [ ] Critério 1: Seção "Lançamentos" lista transações recentes (últimas 5 não confirmadas)
- [ ] Critério 2: Seção "Parcelamentos" lista parcelamentos em aberto (agrupados por `groupId`)
- [ ] Critério 3: Cada item mostra: data, descrição, valor, status (pendente/confirmado)
- [ ] Critério 4: Clique em item expande detalhes (modal ou inline)
- [ ] Critério 5: Botão rápido para confirmar transação diretamente do sidebar

### Technical Notes
- Filtrar transações: `!confirmed && date >= today`
- Agrupar parcelamentos por `groupId`
- Ordenar por data crescente
- Considerar performance com `useMemo`

### Dependencies
- STY-051 (SidebarContext)
- STY-052 (Sidebar Layout)

### Files to Modify/Create
- src/components/ui/SidebarSection.tsx (adicionar Transactions + Installments)

### Success Metrics
- Sidebar mostra lançamentos e parcelamentos
- Confirmação rápida funciona
- Performance não afetada

---

## STY-056: Sidebar Mobile Drawer Implementation
**Prioridade:** P1
**Esforço:** 5h
**Sprint:** Fase 1
**Status:** READY

### User Story
Como usuário mobile, quero que o sidebar se converta em drawer deslizável, para não perder espaço da tela

### Acceptance Criteria
- [ ] Critério 1: Em mobile (< 768px), sidebar é substituído por drawer deslizável (left-to-right)
- [ ] Critério 2: Botão hambúrguer (HiMenu icon) abre/fecha drawer
- [ ] Critério 3: Clique fora do drawer o fecha automaticamente
- [ ] Critério 4: Drawer tem backdrop semi-transparente (backdrop-blur)
- [ ] Critério 5: Animação suave de deslizamento (300ms)

### Technical Notes
- Usar Radix UI Dialog ou implementar com Framer Motion
- Detectar mobile com useMediaQuery hook (md breakpoint)
- Drawer com z-index 50
- Estado controlado por SidebarContext

### Dependencies
- STY-051 (SidebarContext)
- STY-052 (Sidebar Layout)

### Files to Modify/Create
- src/components/ui/SidebarDrawer.tsx (NEW)
- src/components/Layout.tsx (modificar)

### Success Metrics
- Drawer funcional em mobile
- Animação suave
- Clique fora fecha drawer

---

## STY-057: Sidebar Persistence & Analytics
**Prioridade:** P2
**Esforço:** 4h
**Sprint:** Fase 1
**Status:** READY

### User Story
Como PM, quero registrar quais seções do sidebar o usuário expande/colapsa, para entender quais features são mais acessadas

### Acceptance Criteria
- [ ] Critério 1: Evento de analytics enviado quando seção é expandida/colapsada
- [ ] Critério 2: Log registra: `{ userId, section, action: 'expand'|'collapse', timestamp }`
- [ ] Critério 3: Dados salvos em Supabase table `sidebar_analytics`
- [ ] Critério 4: Dashboard admin exibe heatmap de seções mais usadas
- [ ] Critério 5: Erro em envio de analytics não bloqueia UI

### Technical Notes
- Usar `logService.ts` existente ou estender
- Implementar com error recovery (não crítico)
- Rate limit: max 1 evento por seção por 5s
- Integração com Supabase opcional (fallback: localStorage)

### Dependencies
- STY-051 (SidebarContext)
- STY-052 (Sidebar Layout)

### Files to Modify/Create
- src/services/analyticsService.ts (NEW/modificar)
- Supabase migration: `sidebar_analytics` table

### Success Metrics
- Analytics registrados em Supabase
- Dashboard mostra heatmap
- Sem impacto em performance

---

### Feature Area 2: Credit Card Invoices (STY-058 a STY-062)

## STY-058: Credit Card Invoice Fetching Service
**Prioridade:** P0 ⚠️ BLOCKER
**Esforço:** 8h
**Sprint:** Fase 1
**Status:** READY

### User Story
Como desenvolvedor backend, quero criar um serviço que puxe faturas de cartão de crédito de APIs bancárias, para sincronizar dados de faturas automaticamente

### Acceptance Criteria
- [ ] Critério 1: Serviço `cardInvoiceService.ts` criado com função `fetchInvoices(accountId)`
- [ ] Critério 2: Suporta integração com Open Finance APIs (Bacen/PIX/Cosmos)
- [ ] Critério 3: Retorna array de invoices com: `{ id, invoiceNumber, dueDate, amount, status, installments }`
- [ ] Critério 4: Implementado com error recovery (retry com exponential backoff)
- [ ] Critério 5: TypeScript types definidas em `src/types/creditCard.ts`

### Technical Notes
- Usar `retryService.ts` para resilência
- Suportar múltiplos bancos (Nubank, Bradesco, Itaú, etc. - stub implementation)
- Cache em localStorage com TTL 1 hora
- Suportar fallback para mock data (desenvolvimento)

### Dependencies
- Nenhuma (mas bloqueia STY-059, STY-060, STY-061)

### Files to Modify/Create
- src/services/cardInvoiceService.ts (NEW)
- src/types/creditCard.ts (NEW)
- src/services/bankAPIConnector.ts (NEW - stub)

### Success Metrics
- Serviço funcional e testado
- Error recovery implementado
- Mock data funciona em dev

---

## STY-059: Invoice Context Integration
**Prioridade:** P0 ⚠️ BLOCKER
**Esforço:** 6h
**Sprint:** Fase 1
**Status:** READY

### User Story
Como desenvolvedor, quero integrar faturas de cartão ao FinanceContext, para acessar dados de faturas em toda a aplicação

### Acceptance Criteria
- [ ] Critério 1: GlobalState interface atualizada com `creditCardInvoices: Invoice[]`
- [ ] Critério 2: Função `syncCreditCardInvoices()` implementada no FinanceContext
- [ ] Critério 3: Hook `useFinance()` expõe: `creditCardInvoices`, `syncCreditCardInvoices`, `isInvoicesSyncing`
- [ ] Critério 4: Dados persistem em localStorage com chave `spfp_cc_invoices`
- [ ] Critério 5: Sincronização automática a cada 30 min ou ao abrir app

### Technical Notes
- Adicionar tipos ao GlobalState
- Usar `cardInvoiceService.fetchInvoices()`
- Implementar debounce para sync automático
- Integrar com error recovery

### Dependencies
- STY-058 (Card Invoice Service)

### Files to Modify/Create
- src/context/FinanceContext.tsx (modificar)
- src/types/index.ts (adicionar Invoice type)

### Success Metrics
- FinanceContext gerencia invoices
- localStorage sincroniza
- Auto-sync funciona

---

## STY-060: Current & Future Installments Display
**Prioridade:** P0 ⚠️ BLOCKER
**Esforço:** 7h
**Sprint:** Fase 1
**Status:** READY

### User Story
Como usuário, quero visualizar as parcelas atuais, futuras e valor ideal da minha fatura, para planejar meu orçamento

### Acceptance Criteria
- [ ] Critério 1: Novo componente `CreditCardInvoiceDetails.tsx` exibe faturas em tabela
- [ ] Critério 2: Colunas: Número da fatura, Data Vencimento, Valor Total, Status, Ações
- [ ] Critério 3: Clique em fatura expande lista de parcelas (installments)
- [ ] Critério 4: Cada parcela mostra: número, data, valor, categoria (calculada)
- [ ] Critério 5: Rodapé da tabela mostra: Total pendente, Total previsto (próx. 90 dias), Valor ideal (recomendado)

### Technical Notes
- Reutilizar components de tabela existentes
- Calcular valor ideal baseado em 10% da renda ou regra definida
- Parcelas agrupadas por invoice
- Integrar com BankLogo para visual de banco

### Dependencies
- STY-058 (Card Invoice Service)
- STY-059 (Invoice Context)

### Files to Modify/Create
- src/components/CreditCardInvoiceDetails.tsx (NEW)
- src/utils/invoiceCalculations.ts (NEW)

### Success Metrics
- Tabela de faturas visível e funcional
- Parcelas expandem corretamente
- Cálculos de valor ideal precisos

---

## STY-061: Credit Card Visual - Realistic Card Design
**Prioridade:** P0 ⚠️ BLOCKER
**Esforço:** 8h
**Sprint:** Fase 1
**Status:** READY

### User Story
Como usuário, quero visualizar meu cartão de crédito em um design realista com nome da pessoa, para ter visibilidade clara do cartão que estou usando

### Acceptance Criteria
- [ ] Critério 1: Novo componente `CreditCardDisplay.tsx` mostra card em design 3D realista
- [ ] Critério 2: Card exibe: Nome do titular (primeiro + último nome), Número do cartão (últimos 4 dígitos), Data vencimento, Bandeira (Visa, Mastercard, etc)
- [ ] Critério 3: Card tem gradiente de cor baseado em banco (Nubank: roxo, Bradesco: verde, etc)
- [ ] Critério 4: Clique no card revela/oculta número completo (com blur/reveal animation)
- [ ] Critério 5: Card é responsive em mobile (scale menor, mantém proporção)

### Technical Notes
- Design inspirado em Stripe, Apple Card, etc
- Usar CSS transforms para efeito 3D
- Integrar com `BankLogo.tsx` para ícone de banco
- Cores configuráveis em design tokens

### Dependencies
- STY-051 (pode estar no sidebar ou Dashboard)

### Files to Modify/Create
- src/components/CreditCardDisplay.tsx (NEW)
- src/components/Dashboard.tsx (adicionar widget)

### Success Metrics
- Card visual atrativo e realista
- Nome do titular visível
- Animação reveal/blur suave
- Responsive em mobile

---

## STY-062: Credit Card Transaction Sync
**Prioridade:** P1
**Esforço:** 6h
**Sprint:** Fase 1
**Status:** READY

### User Story
Como usuário, quero que meus gastos de cartão sejam sincronizados automaticamente com minhas transações, para ter visão 360 dos meus gastos

### Acceptance Criteria
- [ ] Critério 1: Transações de cartão (invoice installments) são importadas como transações
- [ ] Critério 2: Cada transação criada tem `source: 'credit_card'` e referência à invoice
- [ ] Critério 3: Duplicatas são evitadas (verificar ID da transação externa)
- [ ] Critério 4: Sync automático ao abrir app ou manualmente via botão
- [ ] Critério 5: Log de sync registra timestamp e quantidade de transações importadas

### Technical Notes
- Usar `groupId` para agrupar parcelas do mesmo cartão
- Implementar deduplicação com `externalId`
- Usar error recovery para falhas de sync
- Mostrar toast com resultado do sync

### Dependencies
- STY-059 (Invoice Context)
- STY-060 (Invoice Details)

### Files to Modify/Create
- src/services/cardInvoiceService.ts (modificar - adicionar sync)
- src/context/FinanceContext.tsx (adicionar sync logic)

### Success Metrics
- Transações de cartão sincronizadas
- Sem duplicatas
- Sync automático funciona

---

### Feature Area 3: Investments Portfolio (STY-063 a STY-065)

## STY-063: Investment Portfolio Data Model
**Prioridade:** P0 ⚠️ BLOCKER
**Esforço:** 6h
**Sprint:** Fase 1
**Status:** READY

### User Story
Como desenvolvedor, quero estender o modelo de investimentos para suportar portfólio simples com tipos de ativos básicos, para gerenciar investimentos no app

### Acceptance Criteria
- [ ] Critério 1: Types criados em `src/types/investment.ts`: `Investment`, `AssetType` (Ações, Fundos, Renda Fixa, Criptos, ETFs)
- [ ] Critério 2: FinanceContext estendido com `investments: Investment[]`
- [ ] Critério 3: Funções CRUD: `addInvestment()`, `updateInvestment()`, `deleteInvestment()`, `getInvestmentTotal()`
- [ ] Critério 4: Investimentos persistem em localStorage e Supabase
- [ ] Critério 5: Suporte a real-time sync com Supabase (subscription opcional)

### Technical Notes
- Reutilizar padrão de context existente
- Investments schema: `{ id, name, assetType, quantity, price, totalValue, dateAdded, notes }`
- Implementar validação com Zod
- Usar error recovery em operações Supabase

### Dependencies
- Nenhuma (bloqueia STY-064, STY-065)

### Files to Modify/Create
- src/types/investment.ts (NEW)
- src/context/FinanceContext.tsx (modificar)
- src/services/investmentService.ts (NEW)

### Success Metrics
- Types definidos corretamente
- CRUD funcional
- localStorage sincroniza

---

## STY-064: Investment Portfolio Simple Display
**Prioridade:** P0 ⚠️ BLOCKER
**Esforço:** 7h
**Sprint:** Fase 1
**Status:** READY

### User Story
Como usuário, quero visualizar meu portfólio de investimentos em uma tabela simples mostrando ativos, quantidades e valores totais, para entender minha alocação

### Acceptance Criteria
- [ ] Critério 1: Novo componente `InvestmentPortfolioSimple.tsx` exibe tabela com colunas: Ativo, Tipo, Quantidade, Preço Unitário, Valor Total
- [ ] Critério 2: Linha de total mostra valor total do portfólio
- [ ] Critério 3: Possibilidade de adicionar novo investimento via modal `InvestmentForm.tsx` (refatorado)
- [ ] Critério 4: Possibilidade de editar/deletar investimento
- [ ] Critério 5: Indicador visual de performance (verde se +5%, vermelho se -5%, cinza se sem mudança)

### Technical Notes
- Reuso de `InvestmentForm.tsx` existente se possível
- Tabela com sort e filter
- Performance: usar `useMemo` para cálculos
- Cores padronizadas para gain/loss

### Dependencies
- STY-063 (Investment Data Model)

### Files to Modify/Create
- src/components/InvestmentPortfolioSimple.tsx (NEW ou modificar Investments.tsx)

### Success Metrics
- Tabela de portfólio funcional
- CRUD operacional
- Performance aceitável

---

## STY-065: Investment Metrics & Totals Widget
**Prioridade:** P1
**Esforço:** 5h
**Sprint:** Fase 1
**Status:** READY

### User Story
Como usuário, quero ver um widget com total de investimentos, rentabilidade média e asset breakdown no dashboard, para visualizar saúde do portfólio

### Acceptance Criteria
- [ ] Critério 1: Widget exibe: Total Investido, Valor Atual, Rendimento (R$), Rendimento (%), Breakeven date
- [ ] Critério 2: Gráfico pie exibe distribuição de ativos por tipo (Ações 30%, Fundos 50%, etc)
- [ ] Critério 3: Clique no widget leva à página de investimentos
- [ ] Critério 4: Widget atualiza em tempo real
- [ ] Critério 5: Em mobile, widget é responsivo (pie chart adapta tamanho)

### Technical Notes
- Usar Recharts para pie chart
- Cálculos: `total = sum(investments.totalValue)`, `gain = total - sum(invested)`
- Cores por tipo de ativo
- Integrar com Dashboard.tsx

### Dependencies
- STY-063 (Investment Data Model)
- STY-064 (Portfolio Display)

### Files to Modify/Create
- src/components/dashboard/InvestmentMetricsWidget.tsx (NEW)
- src/components/Dashboard.tsx (adicionar widget)

### Success Metrics
- Widget visível no dashboard
- Cálculos precisos
- Gráfico pie renderizado corretamente

---

## FIM FASE 1 - RESUMO

**Total Stories:** 15 (STY-051 a STY-065)
**Total Horas Estimadas:** 65-80h
**P0 Blockers:** 10 stories (STY-051, 052, 053, 054, 058, 059, 060, 061, 063, 064)
**P1 Stories:** 4 stories
**P2 Stories:** 1 story

**Deliverables:**
1. ✓ Sidebar redesenhado com 4 seções expandíveis
2. ✓ Faturas de cartão integradas e sincronizadas
3. ✓ Cartão visual realista com nome do titular
4. ✓ Portfólio de investimentos básico

**Critical Path (P0 Blockers):**
STY-051 → STY-052 → STY-053/054/055/056 → STY-058 → STY-059 → STY-060 → STY-061 → STY-063 → STY-064

---

## FASE 2: FEATURES (3 SEMANAS - 80-100 HORAS)

### Feature Area 4: Retirement Planning (STY-066 a STY-070)

## STY-066: Retirement Context & Calculations
**Prioridade:** P0 ⚠️ BLOCKER
**Esforço:** 8h
**Sprint:** Fase 2
**Status:** READY

### User Story
Como desenvolvedor, quero criar um contexto de aposentadoria com cálculos de projeção e evolução temporal, para suportar visualização tipo DashPlan

### Acceptance Criteria
- [ ] Critério 1: Types criados: `RetirementPlan`, `RetirementScenario` (conservador, moderado, agressivo)
- [ ] Critério 2: FinanceContext estendido com `retirementPlan: RetirementPlan`
- [ ] Critério 3: Funções: `calculateRetirementProjection(scenario)` retorna array de projeções anuais
- [ ] Critério 4: Projeção inclui: ano, idade, patrimônio, contribuição, rentabilidade, valor resgate estimado
- [ ] Critério 5: Suporta diferentes cenários de inflação (2%, 4%, 6%)

### Technical Notes
- Usar `projectionService.ts` existente ou estender
- Fórmula: `FV = PV * (1 + taxa)^n + PMT * [((1 + taxa)^n - 1) / taxa]`
- Cache cálculos em estado (custo computacional alto)
- Integrar com error recovery

### Dependencies
- STY-063 (Investment Data Model)

### Files to Modify/Create
- src/types/retirement.ts (NEW)
- src/context/FinanceContext.tsx (modificar)
- src/services/retirementService.ts (NEW)

### Success Metrics
- Types definidos
- Cálculos funcionam
- Múltiplos cenários suportados

---

## STY-067: Retirement DashPlan-Style Visualization
**Prioridade:** P0 ⚠️ BLOCKER
**Esforço:** 10h
**Sprint:** Fase 2
**Status:** READY

### User Story
Como usuário, quero visualizar minha aposentadoria em um gráfico de evolução temporal tipo DashPlan, mostrando projeção de patrimônio até a data alvo

### Acceptance Criteria
- [ ] Critério 1: Componente `RetirementDashPlanChart.tsx` exibe gráfico de linha com evolução de patrimônio
- [ ] Critério 2: Eixo X: anos (0 a 40+), Eixo Y: valor do patrimônio em milhões
- [ ] Critério 3: 3 linhas representam 3 cenários (conservador/amarelo, moderado/azul, agressivo/verde)
- [ ] Critério 4: Linha vertical marca a data-alvo de aposentadoria (ex: 20 anos)
- [ ] Critério 5: Hover sobre pontos exibe tooltip com: ano, idade, valor, rendimento anual

### Technical Notes
- Usar Recharts (LineChart + Lines + CartesianGrid + Tooltip)
- Cores: conservador (#F59E0B), moderado (#3B82F6), agressivo (#10B981)
- Dados gerados por `calculateRetirementProjection()`
- Responsivo em mobile

### Dependencies
- STY-066 (Retirement Context)

### Files to Modify/Create
- src/components/RetirementDashPlanChart.tsx (NEW)
- src/components/Retirement.tsx (NEW ou modificar Goals.tsx)

### Success Metrics
- Gráfico renderizado corretamente
- 3 cenários visíveis
- Tooltips funcionam
- Responsivo

---

## STY-068: Retirement Target Date & Goal Setting
**Prioridade:** P0 ⚠️ BLOCKER
**Esforço:** 6h
**Sprint:** Fase 2
**Status:** READY

### User Story
Como usuário, quero definir minha data-alvo de aposentadoria e renda mensal desejada, para personalizar a projeção

### Acceptance Criteria
- [ ] Critério 1: Modal `RetirementGoalForm.tsx` com inputs: Data Alvo (picker), Renda Mensal Desejada, Idade Atual
- [ ] Critério 2: Validação: Data alvo > data atual, Renda > 0, Idade >= 18 e <= 70
- [ ] Critério 3: Salvar e cancelar funcionam, dados persistem em localStorage
- [ ] Critério 4: Prédefinições rápidas: "Próximos 20 anos", "Próximos 30 anos", "Próximos 40 anos"
- [ ] Critério 5: Clique em meta recalcula projeção automaticamente

### Technical Notes
- Usar DatePicker existente ou Shadcn/ui
- Validação com Zod
- Error recovery em caso de erro
- Update FinanceContext ao salvar

### Dependencies
- STY-066 (Retirement Context)
- STY-067 (Retirement Chart)

### Files to Modify/Create
- src/components/RetirementGoalForm.tsx (NEW)
- src/context/FinanceContext.tsx (modificar)

### Success Metrics
- Form valida corretamente
- Dados persistem
- Projeção recalcula

---

## STY-069: Retirement Scenario Comparison
**Prioridade:** P1
**Esforço:** 7h
**Sprint:** Fase 2
**Status:** READY

### User Story
Como usuário, quero comparar os 3 cenários de aposentadoria (conservador, moderado, agressivo) lado a lado, para entender o impacto de decisões de investimento

### Acceptance Criteria
- [ ] Critério 1: Tabela com 3 colunas (um por cenário) e linhas: Patrimônio Final, Renda Anual, Tempo até Aposentadoria, Taxa de Retorno Média
- [ ] Critério 2: Coluna "Melhor Caso" tem destaque visual (fundo mais claro ou border)
- [ ] Critério 3: Botão "Recomendar" seleciona cenário baseado em perfil de risco
- [ ] Critério 4: Clique em cenário aplica configurações de portfólio recomendadas
- [ ] Critério 5: Info text explica diferenças entre cenários

### Technical Notes
- Dados gerados por `calculateRetirementProjection()`
- Lógica de recomendação: conservador (renda baixa/risco baixo), moderado (médio), agressivo (renda alta/risco alto)
- Integrar com Investment Portfolio

### Dependencies
- STY-066 (Retirement Context)
- STY-067 (Retirement Chart)
- STY-068 (Goal Setting)
- STY-063 (Investment Data Model)

### Files to Modify/Create
- src/components/RetirementScenarioComparison.tsx (NEW)

### Success Metrics
- Tabela comparativa funcional
- Recomendação de cenário funciona
- Visual claro das diferenças

---

## STY-070: Retirement Alerts & Milestones
**Prioridade:** P2
**Esforço:** 5h
**Sprint:** Fase 2
**Status:** READY

### User Story
Como usuário, quero receber alertas quando atinjo milestones de aposentadoria (50%, 75%, 100% da meta), para me manter motivado

### Acceptance Criteria
- [ ] Critério 1: Sistema detecta quando patrimônio cruza 50%, 75%, 100% da meta
- [ ] Critério 2: Alerta exibido como toast ou notificação push (se mobile)
- [ ] Critério 3: Histórico de milestones armazenado em localStorage
- [ ] Critério 4: Dashboard exibe progress bar com milestones marcados
- [ ] Critério 5: Usuário pode ocultar alerta por 30 dias

### Technical Notes
- Verificar milestones ao sincronizar dados
- Integrar com notification service (push notif no STY-083)
- Toast com duração 5s e ação "Ver Projeção"
- Armazenar em localStorage com timestamp

### Dependencies
- STY-066 (Retirement Context)
- STY-068 (Goal Setting)

### Files to Modify/Create
- src/services/alertService.ts (NEW/modificar)
- src/components/RetirementMilestonesWidget.tsx (NEW)

### Success Metrics
- Alertas disparados corretamente
- Milestones visíveis
- Toast funciona

---

### Feature Area 5: Asset Acquisition (STY-071 a STY-073)

## STY-071: Asset Acquisition Data Model & Context
**Prioridade:** P1
**Esforço:** 6h
**Sprint:** Fase 2
**Status:** READY

### User Story
Como desenvolvedor, quero criar um modelo de aquisições de bens com comparação de vantagens (compra vs aluguel), para suportar análise de decisões de investimento

### Acceptance Criteria
- [ ] Critério 1: Types criados: `Asset`, `AssetComparison`, `AcquisitionScenario`
- [ ] Critério 2: Asset schema: `{ id, name, category, price, condition, notes, scenarios[] }`
- [ ] Critério 3: Scenario schema: `{ type: 'buy'|'rent', monthlyPayment, loanTerm, rate, maintenanceCost, totalCost30y }`
- [ ] Critério 4: FinanceContext estendido com `assets: Asset[]`
- [ ] Critério 5: Funções CRUD: `addAsset()`, `updateAsset()`, `deleteAsset()`, `getAssetComparison()`

### Technical Notes
- Reutilizar padrão de context
- Fórmula comparação: `totalCost = initial + (monthlyPayment * months) + maintenance`
- Suportar depreciação linear
- Validação com Zod

### Dependencies
- Nenhuma (bloqueia STY-072, STY-073)

### Files to Modify/Create
- src/types/assets.ts (NEW)
- src/context/FinanceContext.tsx (modificar)
- src/services/assetService.ts (NEW)

### Success Metrics
- Types definidos
- CRUD funcional
- Cálculos corretos

---

## STY-072: Asset Acquisition Comparison UI
**Prioridade:** P1
**Esforço:** 8h
**Sprint:** Fase 2
**Status:** READY

### User Story
Como usuário, quero comparar dois cenários de aquisição (compra vs aluguel) lado a lado, para tomar decisão informada sobre aquisição de bem

### Acceptance Criteria
- [ ] Critério 1: Novo componente `AssetComparisonCard.tsx` exibe card comparativo com 2 colunas (Compra | Aluguel)
- [ ] Critério 2: Cada coluna mostra: Pagamento Inicial, Mensalidade, Taxa, Custo de Manutenção, Custo Total (30 anos)
- [ ] Critério 3: Gráfico de linha exibe evolução de custo acumulado ao longo do tempo
- [ ] Critério 4: Recomendação visual: coluna mais econômica é destacada (verde)
- [ ] Critério 5: Botão "Simular outro cenário" permite modificar parâmetros em modal

### Technical Notes
- Usar comparação de 30 anos como padrão
- Recharts LineChart para evolução de custo
- Cores: compra (azul), aluguel (verde)
- Animação de mudança de cenário

### Dependencies
- STY-071 (Asset Data Model)

### Files to Modify/Create
- src/components/AssetComparisonCard.tsx (NEW)
- src/components/Assets.tsx (NEW ou modificar)

### Success Metrics
- Card comparativo funcional
- Gráfico renderizado
- Recomendação visual clara

---

## STY-073: Asset Form & Quick Add
**Prioridade:** P1
**Esforço:** 5h
**Sprint:** Fase 2
**Status:** READY

### User Story
Como usuário, quero adicionar um bem para análise rapidamente preenchendo nome, preço e escolhendo cenário (compra/aluguel)

### Acceptance Criteria
- [ ] Critério 1: Componente `AssetAcquisitionForm.tsx` com campos: Nome, Categoria (dropdown), Preço, Condição (novo/usado)
- [ ] Critério 2: Abas para "Compra" e "Aluguel" com inputs específicos (montante inicial, mensalidade, taxa, etc)
- [ ] Critério 3: Botão "Adicionar" valida dados e calcula comparação automaticamente
- [ ] Critério 4: Form limpa após adicionar
- [ ] Critério 5: Integração com `AssetComparisonCard.tsx` - novo asset exibido automaticamente

### Technical Notes
- Validação com Zod
- Valores numéricos com formatação (máscara)
- Categorias pré-definidas (Imóvel, Carro, Moto, Eletrônicos, etc)
- Error recovery em cálculos

### Dependencies
- STY-071 (Asset Data Model)
- STY-072 (Comparison UI)

### Files to Modify/Create
- src/components/AssetAcquisitionForm.tsx (NEW)

### Success Metrics
- Form valida corretamente
- Cálculos precisos
- UI clara e acessível

---

### Feature Area 6: Improved Patrimony (STY-074 a STY-075)

## STY-074: Patrimony Listing Enhancement
**Prioridade:** P1
**Esforço:** 6h
**Sprint:** Fase 2
**Status:** READY

### User Story
Como usuário, quero visualizar meu patrimônio (contas, investimentos, bens, imóveis) em uma listagem melhorada com filtros e sorting, para ter visão consolidada do patrimônio

### Acceptance Criteria
- [ ] Critério 1: Novo componente `PatrimonyListEnhanced.tsx` lista todos os ativos com: Tipo, Nome, Valor, Data Adição, Ações
- [ ] Critério 2: Filtros: Por Tipo (Contas, Investimentos, Bens, Imóveis), Por Valor (range slider), Por Data
- [ ] Critério 3: Sorting: Por valor (asc/desc), Por data, Por tipo
- [ ] Critério 4: Totais por categoria no rodapé (Ex: Contas Total: R$ 50k, Investimentos: R$ 100k)
- [ ] Critério 5: Ícone de edição/deleção em cada linha, com confirmação

### Technical Notes
- Consolidar dados de: accounts, investments, assets, patrimony (Patrimony.tsx)
- Usar tabela com sort/filter implementado
- Ícones por tipo de ativo
- Performance: `useMemo` para agregações

### Dependencies
- STY-063 (Investment Data Model)
- STY-071 (Asset Data Model)

### Files to Modify/Create
- src/components/PatrimonyListEnhanced.tsx (NEW)
- src/components/Patrimony.tsx (modificar)

### Success Metrics
- Listagem completa de ativos
- Filtros funcionam
- Totais corretos
- Responsivo

---

## STY-075: Patrimony Evolution Chart
**Prioridade:** P1
**Esforço:** 5h
**Sprint:** Fase 2
**Status:** READY

### User Story
Como usuário, quero visualizar a evolução do meu patrimônio ao longo do tempo em um gráfico, para entender crescimento e tendências

### Acceptance Criteria
- [ ] Critério 1: Gráfico de área exibe evolução patrimonial mês a mês (últimos 12 meses)
- [ ] Critério 2: Cores por categoria de ativo (contas: azul, investimentos: verde, bens: laranja, imóveis: roxo)
- [ ] Critério 3: Hover exibe tooltip com valor total e breakdownby categoria
- [ ] Critério 4: Projeção futura (próximos 12 meses) em linha pontilhada
- [ ] Critério 5: Indicador de CAGR (Crescimento Anual Composto) abaixo do gráfico

### Technical Notes
- Dados históricos de histórico mensal do patrimônio (store em localStorage com timestamps)
- Projeção: trending simples (últimos 3 meses)
- Recharts AreaChart com múltiplas series
- Cálculo CAGR: `((endValue / startValue) ^ (1 / years) - 1)`

### Dependencies
- STY-074 (Patrimony Listing)

### Files to Modify/Create
- src/components/PatrimonyEvolutionChart.tsx (NEW)
- src/components/Dashboard.tsx (adicionar widget)

### Success Metrics
- Gráfico renderizado
- Projeção visível
- CAGR calculado corretamente

---

## FIM FASE 2 - RESUMO

**Total Stories:** 10 (STY-066 a STY-075)
**Total Horas Estimadas:** 82-95h
**P0 Blockers:** 4 stories (STY-066, 067, 068, 071)
**P1 Stories:** 5 stories
**P2 Stories:** 1 story

**Deliverables:**
1. ✓ Aposentadoria com gráfico DashPlan (3 cenários)
2. ✓ Aquisições de bens com comparação buy vs rent
3. ✓ Patrimônio listagem e evolução melhorada

**Critical Path (P0 Blockers):**
STY-066 → STY-067 → STY-068 → STY-071

---

## FASE 3: POLISH + MOBILE (2 SEMANAS - 60-80 HORAS)

### Feature Area 7: CRM Partnerships (STY-076 a STY-078)

## STY-076: CRM Partnerships Context & Data Model
**Prioridade:** P1
**Esforço:** 5h
**Sprint:** Fase 3
**Status:** READY

### User Story
Como desenvolvedor, quero criar um modelo de parceiros para gerenciar dados de partnerships, recebíveis e datas de contato

### Acceptance Criteria
- [ ] Critério 1: Types criados: `Partner`, `PartnerShip`, `Receivable`
- [ ] Critério 2: Partnership schema: `{ id, partnerName, contactPerson, email, phone, lastContact, status, category }`
- [ ] Critério 3: Receivable schema: `{ id, partnerId, amount, dueDate, paid, notes }`
- [ ] Critério 4: CRM context criado separado do Finance context (pode coexistir)
- [ ] Critério 5: Funções CRUD: `addPartner()`, `updatePartner()`, `deletePartner()`, `addReceivable()`

### Technical Notes
- Usar padrão similar a FinanceContext
- Dados persistem em localStorage + Supabase (tabela `crm_partnerships`)
- Suportar múltiplos contatos por parceiro
- Status: Ativo, Inativo, Prospecto

### Dependencies
- Nenhuma (bloqueia STY-077, STY-078)

### Files to Modify/Create
- src/types/crm.ts (NEW)
- src/context/CRMContext.tsx (NEW)
- src/services/crmService.ts (NEW)

### Success Metrics
- Context criado
- CRUD funcional
- localStorage sincroniza

---

## STY-077: CRM Partnerships Tab UI
**Prioridade:** P1
**Esforço:** 7h
**Sprint:** Fase 3
**Status:** READY

### User Story
Como usuário CRM, quero visualizar lista de parceiros com recebíveis, para gerenciar relacionamentos comerciais

### Acceptance Criteria
- [ ] Critério 1: Nova aba "Parcerias" em `AdminCRM.tsx` lista parceiros em tabela
- [ ] Critério 2: Colunas: Nome Parceiro, Contato, Email, Último Contato, Status, Total Recebível, Ações
- [ ] Critério 3: Clique em parceiro expande linha mostrando recebíveis pendentes
- [ ] Critério 4: Botão "Adicionar Parceiro" abre modal com form
- [ ] Critério 5: Ícone de edição/contato/deleção em cada linha

### Technical Notes
- Reutilizar tabela com sort/filter
- Status visual: Ativo (verde), Inativo (cinza), Prospecto (amarelo)
- Integração com CRMContext
- "Último Contato" atualizado via botão ou automático

### Dependencies
- STY-076 (CRM Data Model)

### Files to Modify/Create
- src/components/CRMPartnershipsTab.tsx (NEW)
- src/components/AdminCRM.tsx (modificar)

### Success Metrics
- Aba Parcerias funcional
- Parceiros listados corretamente
- Recebíveis visíveis
- CRUD operacional

---

## STY-078: CRM Receivables Management
**Prioridade:** P1
**Esforço:** 6h
**Sprint:** Fase 3
**Status:** READY

### User Story
Como usuário CRM, quero gerenciar recebíveis de parceiros (adicionar, editar, marcar como pago), para acompanhar fluxo de caixa de parcerias

### Acceptance Criteria
- [ ] Critério 1: Componente `CRMReceivablesManager.tsx` com form para adicionar recebível
- [ ] Critério 2: Inputs: Parceiro (dropdown), Valor, Data Vencimento, Notas
- [ ] Critério 3: Botão "Marcar como Pago" altera status e data de pagamento
- [ ] Critério 4: Filtro por status (Pendente, Pago, Atrasado)
- [ ] Critério 5: Total de recebíveis pendentes exibido em card destaque

### Technical Notes
- Integração com CRMContext
- Status automático: "Atrasado" se dueDate < hoje
- Alertas para vencimentos próximos (5 dias)
- Histórico de pagamentos armazenado

### Dependencies
- STY-076 (CRM Data Model)
- STY-077 (Partnerships Tab)

### Files to Modify/Create
- src/components/CRMReceivablesManager.tsx (NEW)

### Success Metrics
- Gerenciamento de recebíveis funcional
- Filtros funcionam
- Alertas de vencimento funcionam

---

### Feature Area 8: CRM Financial (STY-079 a STY-081)

## STY-079: CRM Financial Renewal Dates
**Prioridade:** P1
**Esforço:** 6h
**Sprint:** Fase 3
**Status:** READY

### User Story
Como usuário CRM, quero registrar datas de renovação de contratos/assinaturas de parceiros, para organizar agenda de renovações

### Acceptance Criteria
- [ ] Critério 1: Campo "Data de Renovação" adicionado ao modelo de Partnership
- [ ] Critério 2: Novo componente `CRMRenewalDates.tsx` exibe timeline/calendário de renovações
- [ ] Critério 3: Cores indicam status: Verde (renovado recentemente), Amarelo (próximo 30 dias), Vermelho (atrasado)
- [ ] Critério 4: Clique em data abre modal para registrar renovação
- [ ] Critério 5: Alertas enviados 7 dias antes de vencimento

### Technical Notes
- Adicionar campo ao Partnership schema
- Timeline view ou Calendar view
- Integração com alert service
- Notificações push opcional

### Dependencies
- STY-076 (CRM Data Model)

### Files to Modify/Create
- src/types/crm.ts (modificar)
- src/context/CRMContext.tsx (modificar)
- src/components/CRMRenewalDates.tsx (NEW)

### Success Metrics
- Datas de renovação registradas
- Timeline/Calendário renderizado
- Alertas funcionam

---

## STY-080: CRM Payment History per Partner
**Prioridade:** P1
**Esforço:** 7h
**Sprint:** Fase 3
**Status:** READY

### User Story
Como usuário CRM, quero visualizar histórico de pagamentos de cada parceiro, para auditar fluxo de caixa e negociações

### Acceptance Criteria
- [ ] Critério 1: Clique em parceiro abre página de detalhes com abas: Info | Recebíveis | Histórico
- [ ] Critério 2: Aba "Histórico" exibe tabela com: Data Pagamento, Valor, Status, Notas
- [ ] Critério 3: Gráfico de linha exibe evolução de pagamentos (últimos 12 meses)
- [ ] Critério 4: Indicador de "Padrão de Pagamento" (Pontual, Ocasionalmente Atrasado, Frequentemente Atrasado)
- [ ] Critério 5: Botão "Registrar Pagamento" adiciona nova entrada ao histórico

### Technical Notes
- Histórico armazenado em array dentro do Partner
- Gráfico com Recharts
- Análise automática de padrão (calcular avg de atraso)
- Integração com CRMContext

### Dependencies
- STY-076 (CRM Data Model)
- STY-077 (Partnerships Tab)

### Files to Modify/Create
- src/components/CRMPartnerDetails.tsx (NEW)
- src/components/CRMPaymentHistory.tsx (NEW)

### Success Metrics
- Página de detalhes do parceiro funcional
- Histórico exibido corretamente
- Gráfico renderizado
- Padrão de pagamento calculado

---

## STY-081: CRM Dashboard Overview
**Prioridade:** P2
**Esforço:** 5h
**Sprint:** Fase 3
**Status:** READY

### User Story
Como usuário CRM, quero ter um dashboard overview com KPIs de parcerias (total recebível, parceiros ativos, renovações próximas), para ter visão gerencial

### Acceptance Criteria
- [ ] Critério 1: Dashboard com cards exibindo: Total Recebível, Número de Parceiros Ativos, Renovações em 30 dias, Taxa de Pontualidade
- [ ] Critério 2: Gráfico de barras com top 5 parceiros por volume de recebível
- [ ] Critério 3: Timeline com próximas 5 renovações/vencimentos
- [ ] Critério 4: Indicators com status (verde/amarelo/vermelho) para saúde geral
- [ ] Critério 5: Responsivo em mobile

### Technical Notes
- Reutilizar padrão de dashboard
- Cards com ícones significativos
- Cálculos de KPI com `useMemo`
- Dados do CRMContext

### Dependencies
- STY-076 (CRM Data Model)
- STY-077 (Partnerships Tab)
- STY-079 (Renewal Dates)

### Files to Modify/Create
- src/components/CRMDashboard.tsx (NEW)

### Success Metrics
- Dashboard renderizado
- KPIs calculados
- Indicadores visuais funcionam

---

### Feature Area 9: Mobile PWA & Offline (STY-082 a STY-085)

## STY-082: PWA Setup & Service Worker
**Prioridade:** P0 ⚠️ BLOCKER (Mobile)
**Esforço:** 7h
**Sprint:** Fase 3
**Status:** READY

### User Story
Como desenvolvedor, quero implementar PWA (Progressive Web App) com service worker, para permitir instalação e funcionamento offline do app

### Acceptance Criteria
- [ ] Critério 1: Arquivo `manifest.json` criado com metadados da app (name, icons, theme, display)
- [ ] Critério 2: Service worker registrado em `src/main.tsx` via `navigator.serviceWorker.register()`
- [ ] Critério 3: Caching strategy: Cache-first para assets estáticos (CSS, JS), Network-first para data
- [ ] Critério 4: App pode ser instalada em iOS/Android (icon no browser)
- [ ] Critério 5: Funciona offline para páginas já carregadas (fallback UI para network-dependent features)

### Technical Notes
- Usar Vite PWA plugin ou implementar manualmente
- Icons em múltiplos tamanhos (192x192, 512x512)
- Caching de static assets em install event
- Network intercept em fetch event com try-catch

### Dependencies
- Nenhuma (bloqueia STY-083, STY-084, STY-085)

### Files to Modify/Create
- public/manifest.json (NEW)
- src/service-worker.ts (NEW)
- src/main.tsx (modificar)
- vite.config.ts (adicionar PWA plugin se usar)

### Success Metrics
- App instalável
- Service worker registrado
- Offline mode funciona para páginas cached
- Lighthouse PWA score >= 80

---

## STY-083: Offline Data Sync & Conflict Resolution
**Prioridade:** P0 ⚠️ BLOCKER (Mobile)
**Esforço:** 8h
**Sprint:** Fase 3
**Status:** READY

### User Story
Como usuário mobile, quero que dados sejam sincronizados automaticamente quando volto online, para não perder dados adicionados offline

### Acceptance Criteria
- [ ] Critério 1: Operações offline (add transaction, add investment) são armazenadas em IndexedDB com flag `synced: false`
- [ ] Critério 2: Quando conexão retorna, app detecta (online event) e sincroniza dados via API
- [ ] Critério 3: Conflitos de sincronização: server timestamp é autoridade (server wins), local changes preserved se não conflitar
- [ ] Critério 4: Toast mostra status de sync ("Sincronizando...", "Sincronizado", ou erro)
- [ ] Critério 5: Fallback: dados não sincronizados são mantidos em IndexedDB até sucesso

### Technical Notes
- Usar IndexedDB com dexie.js ou similar
- Detectar online/offline com `navigator.onLine` + online/offline events
- Adicionar campo `externalId` e `syncedAt` em transações
- Retry logic com exponential backoff

### Dependencies
- STY-082 (PWA Setup)

### Files to Modify/Create
- src/services/offlineService.ts (NEW)
- src/context/FinanceContext.tsx (modificar - adicionar sync logic)
- src/utils/conflictResolver.ts (NEW)

### Success Metrics
- IndexedDB armazena dados offline
- Sync funciona quando volta online
- Conflitos resolvidos corretamente
- Toast mostra status

---

## STY-084: Push Notifications Setup
**Prioridade:** P1
**Esforço:** 6h
**Sprint:** Fase 3
**Status:** READY

### User Story
Como usuário mobile, quero receber notificações push para alertas de orçamento, vencimentos e transações, para não perder avisos importantes

### Acceptance Criteria
- [ ] Critério 1: Serviço de push notifications criado com suporte para FCM (Firebase Cloud Messaging) ou Web Push API
- [ ] Critério 2: Usuário pode permitir/negar permissão de notificação ao abrir app
- [ ] Critério 3: Tipos de notificações: Budget alert, Duedate alert, Transaction confirmation
- [ ] Critério 4: Clique em notificação leva a página relevante (ex: notif de budget → Budget page)
- [ ] Critério 5: Usuário pode gerenciar preferências de notificação em Settings

### Technical Notes
- Implementar com Web Push API + service worker
- ou usar Firebase Cloud Messaging (FCM)
- Armazenar subscription em backend/Supabase
- Integrar com alert system existente

### Dependencies
- STY-082 (PWA Setup)

### Files to Modify/Create
- src/services/pushNotificationService.ts (NEW)
- src/components/NotificationPermissionPrompt.tsx (NEW)
- src/components/Settings.tsx (modificar)

### Success Metrics
- Push notifications funcional
- Permissão solicitada corretamente
- Clique em notificação navega
- Preferences funcionam

---

## STY-085: Mobile Responsive Complete & Testing
**Prioridade:** P1
**Esforço:** 8h
**Sprint:** Fase 3
**Status:** READY

### User Story
Como desenvolvedor QA, quero testar completamente a responsividade do app em múltiplos dispositivos móveis, para garantir UX em mobile

### Acceptance Criteria
- [ ] Critério 1: Testes manuais em breakpoints: 320px (mobile small), 768px (tablet), 1024px (laptop)
- [ ] Critério 2: Todos os componentes redimensionam corretamente sem horizontal scroll
- [ ] Critério 3: Tabelas e gráficos são usáveis em mobile (swipe ou collapse)
- [ ] Critério 4: Touch interactions funcionam (tap, long-press, swipe)
- [ ] Critério 5: Lighthouse score em mobile >= 85 (Performance, Accessibility, Best Practices)

### Technical Notes
- Usar Chrome DevTools mobile emulation
- Testar em iOS Safari e Android Chrome
- Recharts responsivo (verificar width em mobile)
- Modals, drawers, popovers usáveis em touch
- Form inputs com tamanho de touch (min 44x44px)

### Dependencies
- STY-082 (PWA Setup)
- STY-083 (Offline Sync)
- STY-084 (Push Notifications)
- Todas as features anteriores (STY-051 a STY-081)

### Files to Modify/Create
- src/test/mobile.test.tsx (NEW - test suite)
- Documentação em docs/MOBILE-TESTING.md (NEW)

### Success Metrics
- Testes manuais passam
- Lighthouse score >= 85
- Sem bugs em mobile
- UX satisfatória

---

## FIM FASE 3 - RESUMO

**Total Stories:** 10 (STY-076 a STY-085)
**Total Horas Estimadas:** 61-76h
**P0 Blockers:** 2 stories (STY-082, STY-083)
**P1 Stories:** 7 stories
**P2 Stories:** 1 story

**Deliverables:**
1. ✓ CRM - Partnerships e Receivables management
2. ✓ CRM - Financial (Renewal dates, Payment history)
3. ✓ PWA funcional + Service Worker
4. ✓ Offline sync com conflict resolution
5. ✓ Push notifications
6. ✓ Mobile responsivo completo

**Critical Path (P0 Blockers):**
STY-082 → STY-083 → STY-084/085

---

## SUMÁRIO CONSOLIDADO: 35 STORIES

| Fase | Stories | Range | P0 | P1 | P2 | Horas |
|------|---------|-------|-----|----|----|-------|
| FASE 1 | STY-051 a STY-065 | 15 | 10 | 4 | 1 | 65-80h |
| FASE 2 | STY-066 a STY-075 | 10 | 4 | 5 | 1 | 82-95h |
| FASE 3 | STY-076 a STY-085 | 10 | 2 | 7 | 1 | 61-76h |
| **TOTAL** | **35 stories** | **35** | **16** | **16** | **3** | **208-251h** |

---

## MATRIZ DE DEPENDÊNCIAS (VISUAL)

```
FASE 1 Foundation:
├─ STY-051: SidebarContext
│  ├─ STY-052: Sidebar Layout
│  │  ├─ STY-053: Budget Section
│  │  ├─ STY-054: Accounts Section
│  │  ├─ STY-055: Transactions Section
│  │  ├─ STY-056: Mobile Drawer
│  │  └─ STY-057: Analytics
│  │
├─ STY-058: Card Invoice Fetching [P0 BLOCKER]
│  ├─ STY-059: Invoice Context [P0 BLOCKER]
│  │  ├─ STY-060: Current/Future Installments [P0 BLOCKER]
│  │  └─ STY-062: Transaction Sync
│  ├─ STY-061: Card Visual [P0 BLOCKER]
│  │
├─ STY-063: Investment Data Model [P0 BLOCKER]
│  ├─ STY-064: Portfolio Display [P0 BLOCKER]
│  └─ STY-065: Metrics Widget

FASE 2 Features:
├─ STY-066: Retirement Context [P0 BLOCKER]
│  ├─ STY-067: DashPlan Chart [P0 BLOCKER]
│  ├─ STY-068: Goal Setting [P0 BLOCKER]
│  │  ├─ STY-069: Scenario Comparison
│  │  └─ STY-070: Alerts & Milestones
│  │
├─ STY-071: Asset Acquisition Model [P0 BLOCKER]
│  ├─ STY-072: Comparison UI
│  └─ STY-073: Asset Form
│  │
├─ STY-074: Patrimony Listing [depends on: STY-063, STY-071]
└─ STY-075: Patrimony Evolution [depends on: STY-074]

FASE 3 Polish + Mobile:
├─ STY-076: CRM Data Model
│  ├─ STY-077: Partnerships Tab
│  │  ├─ STY-078: Receivables Manager
│  │  └─ STY-081: Dashboard Overview
│  │
│  └─ STY-079: Renewal Dates
│
├─ STY-080: Payment History [depends on: STY-076, STY-077]
│
├─ STY-082: PWA Setup [P0 BLOCKER - Mobile]
│  ├─ STY-083: Offline Sync [P0 BLOCKER - Mobile]
│  ├─ STY-084: Push Notifications
│  └─ STY-085: Mobile Testing [depends on all]
```

---

## CRITICAL PATH ANALYSIS

### Path 1: Sidebar + Invoice (Fase 1)
**Duration:** 2 semanas | **Horas:** ~35h (50% Fase 1)
```
STY-051 (6h) → STY-052 (8h) → [STY-053/054/055/056 parallel (22h)]
STY-058 (8h) → STY-059 (6h) → STY-060 (7h) → STY-061 (8h) → STY-062 (6h)
```
**Blocker:** STY-051 e STY-058 devem iniciar imediatamente

### Path 2: Investments (Fase 1)
**Duration:** 1.5 semanas | **Horas:** ~18h
```
STY-063 (6h) → STY-064 (7h) → STY-065 (5h)
```
**Parallelizável:** com Path 1 após 1 semana

### Path 3: Retirement + Assets (Fase 2)
**Duration:** 2 semanas | **Horas:** ~32h (P0 + P1)
```
STY-066 (8h) → STY-067 (10h) → STY-068 (6h) → STY-069/STY-070 parallel (12h)
STY-071 (6h) → STY-072 (8h) → STY-073 (5h)
```
**Parallelizável:** STY-066 com STY-071

### Path 4: CRM (Fase 3)
**Duration:** 1.5 semanas | **Horas:** ~26h (P1 focus)
```
STY-076 (5h) → STY-077 (7h) → STY-078 (6h)
STY-079 (6h) → STY-080 (7h) → STY-081 (5h)
```

### Path 5: Mobile (Fase 3 - Parallelizável com CRM)
**Duration:** 1.5 semanas | **Horas:** ~29h (P0 + P1)
```
STY-082 (7h) → STY-083 (8h) → [STY-084 (6h), STY-085 (8h)]
```

---

## TIMELINE RECOMENDADO

```
SEMANA 1 (60h):
├─ Dev: STY-051, STY-052, STY-053, STY-054 (setup sidebar)
├─ Parallel Dev: STY-058, STY-059 (card invoices)
├─ QA: Setup test framework, test STY-051/052

SEMANA 2 (65h):
├─ Dev: STY-060, STY-061, STY-062 (card visuals + sync)
├─ Parallel Dev: STY-063, STY-064 (investments)
├─ Dev: STY-055, STY-056, STY-057 (sidebar finish)
├─ QA: Test STY-053/054/055/056, STY-058/059

SEMANA 3 (85h):
├─ Dev: STY-065 (investment metrics)
├─ Dev: STY-066, STY-067, STY-068 (retirement foundation)
├─ QA: Test STY-060/061/062, STY-063/064/065

SEMANA 4 (90h):
├─ Dev: STY-069, STY-070 (retirement features)
├─ Parallel Dev: STY-071, STY-072, STY-073 (assets)
├─ Dev: STY-074, STY-075 (patrimony)
├─ QA: Test STY-066/067/068, STY-069/070

SEMANA 5 (75h):
├─ Dev: STY-076, STY-077, STY-078 (CRM basics)
├─ Parallel Dev: STY-082, STY-083 (PWA + offline)
├─ QA: Test STY-071/072/073, STY-074/075

SEMANA 6 (80h):
├─ Dev: STY-079, STY-080, STY-081 (CRM features)
├─ Parallel Dev: STY-084, STY-085 (push notifs + mobile testing)
├─ QA: Test STY-076/077/078, STY-082/083

SEMANA 7 (60h):
├─ Dev: Final polish, bug fixes, performance tuning
├─ QA: Full regression testing, mobile testing, Lighthouse
├─ Docs: Update README, release notes, deployment guide
```

---

## RESOURCE PLANNING

### Team Composition (Recomendado)
- **1x Developer Full Stack** (120h) - React/TypeScript/Services
- **1x QA Engineer** (60h) - Testing/Validation
- **0.5x Architect** (20h) - Code review/design decisions
- **Total:** ~200h team effort (Sprint de 7 semanas)

### Dev Allocation per Phase
- **FASE 1:** 1 Dev full-time (2 semanas) = 80h
- **FASE 2:** 1 Dev full-time + 50% parallelização (3 semanas) = 100h
- **FASE 3:** 1 Dev full-time (2 semanas) = 80h

### QA Allocation per Phase
- **FASE 1:** 30h (testing stories daily, regression)
- **FASE 2:** 35h (feature testing, integration)
- **FASE 3:** 25h (mobile testing, full regression, UAT)

### Architect/Review
- Weekly code review: 2h/week = 14h total
- Design decisions: 6h total
- Deployment/DevOps coordination: 10h total

---

## RISK ASSESSMENT & MITIGATION

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| API Integration (Card Invoices) fails | Medium | High | Start STY-058 early, create mock service, have fallback |
| Mobile PWA complexity underestimated | Medium | High | Spike STY-082 early, use proven libraries (Workbox) |
| Offline sync conflict resolution complex | Low | High | Implement server-timestamp authority, thorough testing |
| Performance issues with data sync | Medium | Medium | Profile early, use IndexedDB for large datasets, pagination |
| QA finds critical bugs in integration | Medium | Medium | Daily QA integration testing, not just at end |
| Team context switching | Low | High | Minimize interruptions, batch changes, clear ownership |
| Scope creep on CRM features | Medium | Medium | Strict acceptance criteria, no feature additions |

---

## SUCCESS CRITERIA

### Fase 1 Complete:
- ✅ Sidebar redesenhado com 4 seções funcionais
- ✅ Faturas de cartão sincronizadas
- ✅ Cartão visual realista exibido
- ✅ Portfólio de investimentos básico
- ✅ Todos os P0 blockers completados
- ✅ Lighthouse score >= 80
- ✅ Zero critical bugs

### Fase 2 Complete:
- ✅ Aposentadoria com 3 cenários visíveis
- ✅ Aquisições de bens com comparação funcional
- ✅ Patrimônio listagem e evolução visíveis
- ✅ CRM foundations pronto
- ✅ Lighthouse score >= 80
- ✅ Zero critical bugs

### Fase 3 Complete:
- ✅ CRM completo com parcerias e financeiro
- ✅ PWA instalável e offline funcional
- ✅ Push notifications funcionais
- ✅ Mobile responsivo (Lighthouse >= 85)
- ✅ 100% acceptance criteria met
- ✅ Client UAT aprovado

---

## DOCUMENTAÇÃO & HANDOFF

### Deliverables por Fase
1. **Fase 1:** Feature branch + PR, test coverage >= 80%, deployment guide
2. **Fase 2:** Feature branch + PR, test coverage >= 80%, deployment guide
3. **Fase 3:** Main branch merge, test coverage >= 85%, release notes, user guide

### Git Strategy
- Feature branches: `feature/STY-XXX-description`
- PRs: Link stories, include test screenshots
- Commits: `feat: STY-XXX - Description [Story Context]`

### Testing Strategy
- Unit tests: 80% coverage min
- Integration tests: All API integrations
- E2E tests: Critical user journeys (login → add transaction → sync offline)
- Mobile tests: Manual + Lighthouse

### Documentation
- Update CLAUDE.md com novas features
- Create docs/features/ directory with feature guides
- Update README com screenshots de novas features
- Create MOBILE-TESTING.md para PWA/offline testing

---

## NOTAS FINAIS - MORGAN

Este roadmap entrega **100% das features aprovadas pelo cliente** em 3 fases bem definidas, com:

- **16 P0 Blockers** claramente identificados e sequenciados
- **Critical paths** mapeados para evitar wait states
- **Risk mitigation** planejada
- **Resource planning** realista (200h total)
- **Quality gates** em cada fase

**Próximos passos:**
1. Validar timeline com Dev + QA
2. Ajustar horas se necessário (±15% margem permitida)
3. Iniciar STY-051 + STY-058 imediatamente
4. Daily standup para track de progresso
5. Weekly review of critical path

**Go live estimado:** 7 semanas a partir do início de Fase 1

---

*Documento preparado por: Morgan - Product Manager*
*Data: Fevereiro 2026*
*Status: APROVADO PARA IMPLEMENTAÇÃO*
