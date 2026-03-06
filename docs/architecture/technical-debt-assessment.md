# Technical Debt Assessment — SPFP Platform
> Brownfield Discovery — Fase 8 (FINAL) | @architect (Aria) | 2026-03-05
> Incorpora Fases 1–7: Arquitetura, DB Schema, DB Audit, Frontend Spec, DRAFT, DB Review, UX Review, QA Gate

---

## 1. Executive Summary

**SPFP** é uma aplicação de planejamento financeiro pessoal com stack moderna (React 19, TypeScript, Vite, Supabase PostgreSQL) e arquitetura funcional pronta para produção. Em 2026-03-05, o sistema está operacional com banco de dados bem projetado, frontend estruturado com code splitting e memoization, e camada de IA operacional via Edge Function `finn-chat`.

Os riscos estruturais concentram-se em quatro vetores:

1. **Segurança/Compliance** — RLS não filtra registros soft-deleted; ausência de `hard_delete_user_data()` viola direito ao esquecimento da LGPD.
2. **Arquitetura** — `FinanceContext.tsx` com 1.079 LOC é single point of failure de todo o estado financeiro da aplicação.
3. **UX** — Duplicação ativa de Goals v1+v2 e Retirement v1+v2 fragmenta UX; ausência de empty states no pós-onboarding causa abandono no D1.
4. **Testes** — Cobertura real a verificar (`npm run test -- --coverage`); claims anteriores de "cobertura nula" contradizem 45+ arquivos identificados em `src/test/`.

### Score Consolidado Final por Dimensão

| Dimensão | Score Atual | Score Alvo (após Sprint 6) |
|----------|-------------|---------------------------|
| Segurança | 5/10 | 9/10 |
| Compliance (LGPD) | 3/10 | 9/10 |
| Performance | 6/10 | 8/10 |
| Consistência DB | 7/10 | 9/10 |
| UX/Frontend | 5/10 | 9/10 |
| Testes | 3/10 | 8/10 |
| Arquitetura | 6/10 | 9/10 |
| **TOTAL** | **35/70** (50%) | **61/70** (87%) |

### Inventário por Severidade (consolidado, 48 débitos)

| Severidade | Quantidade |
|-----------|-----------|
| CRITICO | 9 |
| ALTO | 15 |
| MEDIO | 16 |
| BAIXO | 8 |
| **TOTAL** | **48** |

### Top 5 Riscos e Ações Imediatas

| # | Risco | Ação Imediata | Sprint |
|---|-------|--------------|--------|
| 1 | RLS expõe dados soft-deleted via SDK direto | Migration `rls_soft_delete_fix.sql` (após TD-039) | Sprint 1 |
| 2 | Sem `hard_delete_user_data()` — violação LGPD | Criar função + Edge Function `delete-account` | Sprint 1 |
| 3 | FinanceContext 1.079 LOC — single point of failure | Split em sub-contexts (precedido por types split) | Sprint 4a |
| 4 | Empty states ausentes no Dashboard — abandono D1 | FinnAvatar partner + CTA quando `transactions.length === 0` | Sprint 2 |
| 5 | Gemini API key no bundle + dual AI path = bypass de rate limit | Consolidar em `callFinnProxy()`; mover key para Edge Function | Sprint 4b |

---

## 2. Estado Atual do Sistema

### 2.1 Pontos Fortes

**Arquitetura:**
- Code splitting via `React.lazy` em todas as páginas — TTI otimizado
- Error boundaries global e específico para Dashboard
- `useSafeFinance()` previne crashes com defaults seguros
- `errorRecovery.ts` com retry exponencial backoff implementado em Auth e AI services
- Finn centralizado via Edge Function com rate limiting por plano (Essencial 10, Wealth 15 msgs/mês)
- Provider hierarchy bem definida (ErrorBoundary → Auth → Sidebar → Finance)

**Database:**
- 52+ tabelas com schema normalizado (3NF após migration de fevereiro 2026)
- 60+ indexes estratégicos incluindo compostos e parciais
- Soft delete em 38/50 tabelas com partial indexes `WHERE deleted_at IS NULL`
- Migrations idempotentes (`CREATE IF NOT EXISTS`, `DROP IF EXISTS`)
- `stripe_audit_log` com triggers automáticos para auditoria de pagamentos
- Views analíticas: `sales_pipeline_summary`, `partnership_summary_by_partner`, health checks por domínio
- `soft_delete_user_data()` e `restore_user_data()` para gerenciamento de ciclo de vida

**UX/Frontend:**
- Paleta de cores coerente (Navy-900/Navy-700/Blue-Logo/Teal-500) pós-rebranding EPIC-013
- Tipografia unificada (Plus Jakarta Sans como primária)
- Bottom navigation mobile com 8 itens — responsividade forte
- Finn AI bem integrado (FinnAvatar em dois modos, Onboarding 5-telas, rate limit overlay)
- Skip link de acessibilidade implementado (`#main-content`)
- ARIA roles semânticos em Layout (`navigation`, `main`, `complementary`)

### 2.2 Áreas Críticas

**Segurança/Compliance:**
- Políticas RLS das tabelas core verificam apenas `auth.uid() = user_id` sem `AND deleted_at IS NULL` — dados soft-deleted expostos via SDK direto
- `ADMIN_EMAILS = ['nando062218@gmail.com']` hardcoded em `AuthContext.tsx:17` — email exposto no bundle público
- Sem `hard_delete_user_data()` — violação do direito ao esquecimento da LGPD
- Gemini API key exposta no bundle frontend (vite.config.ts) — combinada com dual AI path permite bypass de rate limit
- `webhook_logs.payload` armazenado em texto plano (dados Stripe/Hotmart com PII potencial)

**Arquitetura:**
- `FinanceContext.tsx` com 1.079 LOC gerencia todos os domínios (accounts, transactions, goals, investments, patrimony, budgets) em um único arquivo — single point of failure
- Dois caminhos paralelos para IA: `callFinnProxy()` (Edge Function, com rate limit) e `chatWithAI()` (SDK direto, sem rate limit)
- Sistema de impersonação com 5 mecanismos descoordenados (flags, 2 chaves localStorage, state backup em memória, ref)
- `types.ts` monolítico com 250+ LOC sem separação por domínio

**Database:**
- `sent_atas.client_id` sem FK constraint — risco de registros órfãos
- `investments` sem `deleted_at` — deleção permanente de dados financeiros sem possibilidade de recuperação
- `dashboard_metrics` view filtra apenas `CURRENT_DATE` — inútil para analytics de período
- `ai_history` sem cleanup job — crescimento não controlado (50K–500K rows/ano)
- Sem `hard_delete_user_data()` completo (tabelas omitidas: sent_atas, category_budgets, transaction_groups, retirement_settings, patrimony_items)

**UX/Frontend:**
- Goals v1 (`/goals`) e v2 (`/goals-v2`) coexistem no sidebar — usuário não sabe qual versão usar
- Retirement v1 (`/retirement`) e v2 (`/retirement-v2`) com o mesmo problema
- `TransactionForm` opera como fullscreen modal sem `<Layout>` — fluxo mais frequente do app com UX inconsistente
- Sem empty states no Dashboard, TransactionList, Patrimony — usuário novo sem direção pós-onboarding
- Sem sistema de toast notifications — falhas silenciosas em FinanceContext criam duplicatas e dados percebidos como perdidos
- `Insights.tsx` com ~675 LOC e 10+ useState — manutenibilidade crítica
- `Layout.tsx` com ~467 LOC sem `memo()` — re-renders desnecessários em toda navegação

### 2.3 Cobertura de Testes (Real)

O QA Gate (Fase 7) identificou 45+ arquivos em `src/test/`, incluindo `financeContextLogic.test.ts`, `softDelete.test.ts`, `errorRecovery.test.ts`, além de diretórios `integration/` e `a11y/`. O claim anterior de "cobertura praticamente nula (2/10)" precisa ser revisitado.

**Status atual:** A VERIFICAR — executar `npm run test -- --coverage` para cobertura quantificada.

**O que sabemos estar coberto (por existência de arquivos):**
- Lógica do FinanceContext (financeContextLogic.test.ts)
- Soft delete (softDelete.test.ts)
- Error recovery (errorRecovery.test.ts)
- Testes de integração (integration/)
- Testes de acessibilidade (a11y/)

**O que está descoberto (por ausência ou confirmação):**
- Testes E2E (Playwright) — ausentes confirmados
- Testes de impersonação — status a verificar
- `FinanceContext` como React Context via React Testing Library — provavelmente não coberto
- TransactionForm, Goals, Insights como componentes renderizados — status a verificar

**Score de testes revisado:** Entre 3/10 (se arquivos são stubs) e 5/10 (se implementados) — A VERIFICAR com cobertura real.

---

## 3. Inventário Final de Débitos Técnicos (CONSOLIDADO)

Tabela mestre com todos os 48 débitos. IDs únicos e sequenciais.

| ID | Área | Título | Severidade | Esforço | Sprint | Status |
|----|------|--------|-----------|---------|--------|--------|
| TD-001 | DB/Segurança | RLS sem filtro deleted_at nas tabelas core | CRITICO | S (2-4h) | 1 | Aberto |
| TD-002 | DB/Compliance | Ausência de hard_delete_user_data (LGPD/GDPR) | CRITICO | M (4-8h) | 1 | Aberto |
| TD-003 | DB/Integridade | sent_atas.client_id sem FK constraint | CRITICO | XS (<1h) | 1 | Aberto |
| TD-004 | Segurança/Arch | Admin emails hardcoded em AuthContext | CRITICO | S (1-4h) | 1 | Aberto |
| TD-005 | Frontend | Duplicação ativa Goals v1+v2 / Retirement v1+v2 | CRITICO | L (16-40h) | 2 | Aberto |
| TD-006 | Frontend | Ausência de data-testid (impossibilita testes UI) | CRITICO | M (4-16h) | 3 | Aberto |
| TD-007 | Frontend/a11y | Sem focus trap em modais (acessibilidade crítica) | CRITICO | S (1-4h) | 2 | Aberto |
| TD-008 | Arquitetura | FinanceContext monolítico (~1079 LOC) | ALTO | XL (40h+) | 4a | Aberto |
| TD-009 | Arquitetura | Impersonation state com 5 mecanismos descoordenados | ALTO | M (4-16h) | 6 | Aberto |
| TD-010 | Segurança/Arch | Dual path AI: Finn Edge vs aiService SDK (bypass rate limit) | ALTO | M (4-16h) | 4b | Aberto |
| TD-011 | Testes | Ausência de testes React Context para FinanceContext | ALTO | L (16-40h) | 4b | Aberto |
| TD-012 | Testes | Ausência de testes E2E (login, transação, Finn) | ALTO | L (16-40h) | 5 | Aberto |
| TD-013 | Frontend | Insights.tsx muito grande (~675 LOC, 10+ useState) | ALTO | M (4-16h) | 3 | Aberto |
| TD-014 | Frontend | Layout.tsx muito grande (~467 LOC, sem memo()) | ALTO | M (4-16h) | 3 | Aberto |
| TD-015 | Frontend | Sem sistema de toast notifications global | ALTO | S (1-4h) | 2 | Aberto |
| TD-016 | Frontend/a11y | Contraste WCAG não validado (múltiplos pares de cor) | ALTO | S (1-4h) auditoria + M correção | 2 | Aberto |
| TD-017 | DB/Compliance | Ausência de data export function (portabilidade LGPD) | ALTO | M (4-8h) | 1 | Aberto |
| TD-018 | Arquitetura | Real-time sync Supabase não implementado | MEDIO | L (16-40h) | 5 | Aberto |
| TD-019 | Arquitetura | Error recovery não universalizado (4 de 12 serviços) | MEDIO | M (4-16h) | 3 | Aberto |
| TD-020 | Arquitetura | types.ts monolítico (~250+ LOC, sem split por domínio) | MEDIO | M (4-16h) | 3 | Aberto |
| TD-021 | DB/Performance | Ausência de full-text search indexes (GIN) | MEDIO | S (1-4h) | 4a | Aberto |
| TD-022 | DB/Performance | Sem estratégia de particionamento para transactions | MEDIO | L (16-40h) | 6 | Aberto |
| TD-023 | DB/Integridade | company_tasks.assignee_id sem validação de squad membership | MEDIO | S (1-4h) | 3 | Aberto |
| TD-024 | DB/Analytics | Views ausentes de alto valor (financial_summary, investment_performance, goal_progress) | MEDIO | S/M (2-6h) | 3 | Aberto |
| TD-025 | DB/Governança | Ausência de rollback scripts para migrations críticas | MEDIO | M (4-16h) | 1 (Sprint 1+) | Aberto |
| TD-026 | Frontend | Mobile: Recharts overflow em telas pequenas | MEDIO | S (1-4h) | 2 | Aberto |
| TD-027 | Frontend | useEffect cleanup ausente — risco de memory leaks | MEDIO | M (4-16h) | 5 | Aberto |
| TD-028 | Frontend | Strings hard-coded sem i18n | MEDIO | M (4-16h) | 5 | Aberto |
| TD-029 | Arquitetura | Dashboard sem paginação (carrega tudo em memória) | MEDIO | M (4-16h) | 6 | Aberto |
| TD-030 | DB/Segurança | webhook_logs.payload sem criptografia (PII potencial) | ALTO | S (1-4h) | 1 | Aberto |
| TD-031 | DB | Naming conventions inconsistentes (policies e views) | BAIXO | XS (<1h) | 1 | Aberto |
| TD-032 | Frontend/a11y | Animações sem prefers-reduced-motion | MEDIO | XS (<1h) | 2 | Aberto |
| TD-033 | Frontend | Skeleton colors não alinhados ao tema SPFP | BAIXO | XS (<1h) | 2 | Aberto |
| TD-034 | Arquitetura | Bundle size / chunk warnings (chunkSizeWarningLimit: 600) | BAIXO | M (4-16h) | 6 | Aberto |
| TD-035 | DB | automation_logs.duration_ms tipo INT (overflow potencial) | BAIXO | XS (<1h) | 1 | Aberto |
| TD-036 | DB/Analytics | dashboard_metrics view com escopo temporal insuficiente | MEDIO | S (1-2h) | 3 | Aberto |
| TD-037 | DB | automation_logs sem estratégia de archive | BAIXO | S (2-4h) | 6 | Aberto |
| TD-038 | DB | ai_history sem estratégia de retenção/cleanup | MEDIO | S (1-3h) | 5 | Aberto |
| TD-039 | DB/Integridade | investments sem soft delete (pré-requisito TD-001) | CRITICO | XS (<2h) | 1 | Aberto |
| TD-040 | DB | Ausência de reconciliação de webhooks (retry mechanism) | MEDIO | M (4-8h) | 5 | Aberto |
| TD-041 | Frontend/UX | TransactionForm sem Layout wrapper (UX inconsistente) | ALTO | M (4-16h) | 2 | Aberto |
| TD-042 | Frontend/UX | Ausência de error boundaries granulares em páginas críticas | ALTO | S (1-4h) | 2 | Aberto |
| TD-043 | Frontend/UX | Dashboard/TransactionList/Patrimony sem empty states | ALTO | S (1-4h) | 2 | Aberto |
| TD-044 | Frontend/UX | TransactionForm e Patrimony sem loading states em submit | MEDIO | S (1-4h) | 2 | Aberto |
| TD-045 | Frontend/a11y | Input fields sem aria-describedby (associação com erros) | MEDIO | S (1-4h) | 2 | Aberto |
| TD-046 | Frontend/a11y | Goals, Insights, Budget com cobertura ARIA insuficiente | MEDIO | M (4-16h) | 3 | Aberto |
| TD-047 | Frontend/a11y | Recharts sem custom tooltips acessíveis | MEDIO | M (4-16h) | 5 | Aberto |
| TD-048 | Frontend/UX | SalesPage sem social proof e micro-copy de confiança | BAIXO | M (4-16h) | 6 | Aberto |

---

## 4. Débitos por Área (Detalhado)

### 4.1 Segurança & Compliance

#### TD-001 — RLS sem filtro de deleted_at nas tabelas core

**Problema:** Políticas SELECT das tabelas core verificam apenas `auth.uid() = user_id`, sem `AND deleted_at IS NULL`. Registros logicamente deletados permanecem acessíveis via Supabase SDK direto.

**Tabelas afetadas (lista expandida pela Fase 5):** accounts, transactions, categories, goals, transaction_groups, category_budgets, patrimony_items, operational_tasks, sales_leads, investments (após TD-039).

**Impacto:** Dados "deletados" pelo usuário acessíveis via REST API — violação de expectativa de privacidade e risco de exposição.

**Solução proposta:** Migration `20260305_rls_soft_delete_fix.sql` adicionando `AND deleted_at IS NULL` nas políticas SELECT. Executar APÓS TD-039 (investments soft delete).

**Critérios de aceitação:**
- [ ] Todas as tabelas listadas têm `AND deleted_at IS NULL` nas políticas SELECT
- [ ] Records com deleted_at não retornam em queries diretas ao Supabase
- [ ] `restore_user_data()` continua funcionando (verificar que usa SECURITY DEFINER)
- [ ] Script de auditoria SQL detecta automaticamente políticas sem o filtro

---

#### TD-002 — Ausência de hard_delete_user_data (LGPD/GDPR)

**Problema:** `soft_delete_user_data()` existe, mas sem hard delete. LGPD Art. 18 garante direito ao esquecimento.

**Tabelas que DEVEM ser cobertas (lista completa):** transactions, accounts, goals, investments, ai_history, finn_usage, automation_logs, automation_permissions, sent_atas, category_budgets, transaction_groups, retirement_settings, patrimony_items, category_budgets.

**Impacto:** Risco legal de não conformidade com LGPD. Dados persistem mesmo após cancelamento de conta.

**Solução proposta:** Função `hard_delete_user_data(p_user_id UUID) RETURNS JSONB` com SECURITY DEFINER, acessível apenas via Edge Function autenticada `delete-account`. UI em Settings com confirmação dupla.

**Critérios de aceitação:**
- [ ] Função implementada cobrindo todas as tabelas listadas
- [ ] Acessível apenas via service_role (Edge Function com JWT verificado)
- [ ] Log de auditoria imutável gravado ANTES de executar DELETEs
- [ ] UI "Excluir minha conta" em Settings com confirmação dupla + delay de 24h
- [ ] Testado em ambiente de staging com usuário real

---

#### TD-004 — Admin emails hardcoded em AuthContext

**Problema:** `ADMIN_EMAILS = ['nando062218@gmail.com']` hardcoded em `AuthContext.tsx:17`. Email de admin exposto no bundle JavaScript público.

**Impacto:** Mudança de admin requer deploy. Email exposto via DevTools.

**Solução proposta (2 passos):**
- Step 1 (Sprint 1 — rápido): mover para variável de ambiente `VITE_ADMIN_EMAILS`.
- Step 2 (Sprint 5 — correto): tabela `admin_roles` no Supabase + verificação via user_metadata do Auth.

**Critérios de aceitação:**
- [ ] Email de admin não aparece no bundle JS público (step 1)
- [ ] Adicionar/remover admin não requer deploy do frontend (step 2)

---

#### TD-010 — Dual path AI com risco de bypass de rate limit

**Problema:** Dois caminhos paralelos: `callFinnProxy()` (Edge Function, com rate limit e JWT) e `chatWithAI()` (SDK Gemini direto, sem rate limit). Gemini API key está exposta no bundle frontend. Combinação permite bypass total do rate limit.

**Impacto:** Usuários podem consumir API do Gemini sem restrição, gerando custos não previstos e comprometendo o modelo de negócio.

**Solução proposta:** Consolidar em `callFinnProxy()` para produção. Remover a API key do frontend; toda chamada Gemini deve passar pela Edge Function. Manter `aiService.ts` apenas como fallback de desenvolvimento.

**Critérios de aceitação:**
- [ ] Único ponto de entrada para IA em produção
- [ ] API key do Gemini removida do bundle frontend
- [ ] Rate limit sempre aplicado independente do caminho
- [ ] Fallback documentado para ambiente de desenvolvimento

---

#### TD-030 — webhook_logs.payload sem criptografia

**Problema:** Webhooks do Stripe e Hotmart contêm dados de pagamento e PII. Campo `payload` em texto plano. Campos adicionais com risco similar: `automation_logs.value` e `company_revenue.metadata`.

**Solução proposta:** Estratégia pragmática — deletar payload após processamento bem-sucedido (retenção de 30 dias); armazenar apenas `external_id`, `event_type`, `status`.

---

#### TD-039 — investments sem soft delete (pré-requisito crítico)

**Problema:** Tabela `investments` não possui `deleted_at`. Investimentos deletados são permanentes. Pré-requisito técnico para TD-001 completo.

**Solução proposta:** Migration `20260305_investments_soft_delete.sql` — `ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ` + indexes + atualização da política RLS SELECT.

**Nota importante:** Esta migration deve ser executada ANTES de TD-001 no mesmo ciclo de deploy.

---

### 4.2 Arquitetura

#### TD-008 — FinanceContext Monolítico (~1.079 LOC)

**Problema:** Arquivo único gerenciando todos os domínios financeiros. Qualquer mudança causa re-render global. 1.079 LOC confirmados pelo QA Gate.

**Impacto:** Dificulta testes unitários, escalabilidade e refatoração segura. Um bug derruba toda a aplicação financeira.

**Solução proposta:** Split em sub-contexts: `AccountsContext`, `TransactionsContext`, `GoalsContext`, `InvestmentsContext`, `BudgetsContext`. FinanceContext fica como agregador fino. Precedido por TD-020 (types split).

**Critérios de aceitação:**
- [ ] Sub-contexts independentes com testes isolados por domínio
- [ ] Nenhuma regressão no comportamento existente
- [ ] Re-renders localizados por sub-context (não mais global)
- [ ] FinanceContext agregador com < 200 LOC

---

#### TD-009 — Impersonation State com 5 Mecanismos

**Problema:** Sistema de impersonação usa flags de estado, 2 chaves localStorage (`spfp_is_impersonating`, `spfp_impersonated_user_id`), state backup em memória, e ref — cinco pontos de sincronização potencialmente dessincronizáveis.

**Solução proposta:** `ImpersonationService` dedicado com estado centralizado e log de auditoria imutável. Testes de cenário: iniciar, navegar durante, encerrar impersonação.

---

#### TD-018 — Real-time Sync Supabase não implementado

**Problema:** `FinanceContext` tem flags `isSyncing`/`isInitialLoadComplete` mas listeners Supabase não ativados. localStorage é source-of-truth; dados não atualizam em múltiplas abas/dispositivos.

**Solução proposta:** Implementar listeners Supabase para tabelas críticas (transactions, goals). Executar após TD-008 (FinanceContext split) para listeners por sub-context.

---

#### TD-019 — Error Recovery não universalizado

**Problema:** `errorRecovery.ts` implementado em Auth e AI services, mas pdfService, csvService, MarketDataService e outros 8 serviços sem cobertura.

**Solução proposta:** Adicionar `errorRecovery.handleOperation()` em todos os serviços de I/O.

---

#### TD-020 — types.ts Monolítico

**Problema:** Arquivo único com todas as interfaces TypeScript (~250+ LOC). Pré-requisito para TD-008.

**Solução proposta:** Split por domínio: `types/transactions.ts`, `types/accounts.ts`, `types/goals.ts`, `types/investments.ts`, `types/ai.ts`.

---

### 4.3 Database

#### TD-003 — sent_atas.client_id sem FK Constraint

**Problema:** `client_id` UUID sem FK constraint. Permite registros órfãos.

**Solução (com pré-limpeza obrigatória de órfãos na mesma transação):**
```sql
UPDATE sent_atas SET client_id = NULL
WHERE client_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM auth.users WHERE id = sent_atas.client_id);

ALTER TABLE sent_atas ADD CONSTRAINT fk_sent_atas_client
  FOREIGN KEY (client_id) REFERENCES auth.users(id) ON DELETE SET NULL;
```

---

#### TD-017 — Ausência de Data Export Function (LGPD)

**Problema:** LGPD exige portabilidade de dados em formato estruturado. Nenhuma função de exportação completa existe.

**Solução proposta (robusta):** Edge Function `export-user-data` com estratégia assíncrona (geração de arquivo no Supabase Storage + URL assinada com expiração 1h). Formato: ZIP com CSVs por tabela (defensável juridicamente como "formato estruturado e de uso corrente"). Cobrir: transactions, accounts, goals, investments, patrimony_items, category_budgets, transaction_groups, retirement_settings, sent_atas, ai_history.

---

#### TD-021 — Ausência de Full-Text Search Indexes (GIN)

**Problema:** Sem índices de busca textual em `transactions.description` e `sales_leads.notes`.

**Solução:** `CREATE INDEX CONCURRENTLY` (não bloqueia tabela) para GIN indexes. Incluir `idx_transactions_user_amount` na mesma migration.

---

#### TD-022 — Sem Particionamento para transactions

**Problema:** Tabela `transactions` projetada para 500K–5M rows em 1 ano. Sem RANGE partitioning.

**Nota:** TD-001 DEVE estar aplicado antes — particionamento recria a tabela e as políticas RLS precisam ser re-aplicadas na versão corrigida.

**Ação:** Executar quando `transactions >= 500K rows` OU quando `EXPLAIN ANALYZE` mostrar degradação real.

---

#### TD-023 — company_tasks.assignee_id sem validação de squad

**Problema:** `assignee_id` não valida membership em `company_members`.

**Solução:** Trigger `validate_task_assignee()` com exceção para `service_role` (agentes AI têm acesso legítimo sem membership formal).

---

#### TD-024 — Views ausentes de alto valor

**Views a criar:**
- `user_financial_summary` — net worth snapshot (accounts + patrimony + investments)
- `investment_performance` — ROI tracking (current vs. average price)
- `goal_progress` — % de conclusão por meta
- `dashboard_metrics_this_month` e `dashboard_metrics_this_year` — complementos temporais da view atual
- `finn_usage_summary` — uso do Finn por usuário/mês (útil para billing analytics)

---

#### TD-025 — Ausência de Rollback Scripts

**Problema:** Migrations são idempotentes mas sem rollback explícito. IMPORTANTE: rollbacks para migrations do Sprint 1 devem ser criados ANTES do deploy do Sprint 1 (não no Sprint 4 como estava no DRAFT).

**Prioridade imediata:** Criar rollbacks para TD-039 (investments soft delete), TD-001 (RLS fix) e TD-003 (FK constraint) antes de qualquer deploy do Sprint 1.

---

#### TD-036 — dashboard_metrics View com Escopo Temporal Insuficiente

**Problema:** View `dashboard_metrics` filtra apenas `CURRENT_DATE`. Frontend contorna com cálculos JavaScript, desperdiçando potencial de performance do banco.

**Solução:** Criar `dashboard_metrics_this_month` e `dashboard_metrics_this_year`, ou transformar em função SQL com parâmetro de período.

---

#### TD-037 — automation_logs sem Estratégia de Archive

**Problema:** `cleanup_old_automation_logs()` deleta permanentemente logs > 90 dias. Sem tabela de arquivo para auditoria retroativa.

**Solução:** Criar `automation_logs_archive` e modificar função para mover (INSERT INTO archive + DELETE) ao invés de deletar.

---

#### TD-038 — ai_history sem Estratégia de Retenção

**Problema:** `ai_history` pode atingir 500K rows em 1 ano sem cleanup job.

**Solução:** `cleanup_old_ai_history(p_months INT DEFAULT 6)` — parametrizável para decisão de produto sobre retenção.

---

#### TD-040 — Ausência de Reconciliação de Webhooks

**Problema:** Falhas durante processamento de webhooks do Stripe/Hotmart (timeout, erros) não têm mecanismo de retry.

**Solução:** Adicionar colunas `processed_at TIMESTAMPTZ`, `retry_count INT DEFAULT 0`, `processing_error TEXT` em `webhook_logs`. Edge Function de reconciliação para webhooks com `processed_at IS NULL AND retry_count < 3`.

---

### 4.4 Frontend / UX

#### TD-005 — Duplicação ativa Goals v1+v2 / Retirement v1+v2

**Problema:** Duas versões paralelas ativas de Goals e Retirement no sidebar. Usuário não sabe qual usar. Risco adicional (Fase 6): dados de usuários em v1 podem não aparecer em v2 se os componentes não compartilharem fonte de dados — percepção de perda de dados.

**Decisão necessária (antes de implementar):** PO deve decidir qual versão é canônica e validar que dados existentes serão preservados na transição.

**Critérios de aceitação:**
- [ ] Decisão de produto documentada (qual versão é canônica)
- [ ] Apenas uma versão visível no sidebar
- [ ] Rota antiga redireciona com `history.replace` (sem entrada fantasma no histórico)
- [ ] Componentes deprecados removidos do codebase
- [ ] Todos os dados de usuários existentes preservados na transição

---

#### TD-007 — Sem Focus Trap em Modais

**Problema:** Modais (Onboarding, TransactionForm fullscreen) não implementam focus trap. Usuários de teclado e leitores de tela podem "escapar" do modal. `aria-modal="true"` também ausente — agrava o problema.

**Solução:** `focus-trap-react` ou lógica nativa em `Modal.tsx`. Adicionar `aria-modal="true"` e `role="dialog"`.

---

#### TD-013 — Insights.tsx Muito Grande

**Problema:** ~675 LOC, 10+ useState, mistura lógica de negócio com renderização.

**Split proposto:** `FinnChat.tsx` (input + histórico), `FinnDiagnosis.tsx` (diagnóstico 360), `FinnRateLimit.tsx` (overlay de limite), `FinnQuickChips.tsx` (prompts rápidos).

---

#### TD-014 — Layout.tsx Muito Grande

**Problema:** ~467 LOC sem `memo()` — re-renders em toda a árvore de navegação a cada mudança de estado global.

**Split proposto:** `DesktopSidebar.tsx`, `MobileBottomNav.tsx`, `AdminSidebar.tsx` — todos com `React.memo()`.

---

#### TD-015 — Sem Sistema de Toast Notifications Global

**Problema:** Falhas silenciosas em FinanceContext. Usuário não sabe se dado foi salvo. Pode criar duplicatas ao tentar novamente.

**Solução:** `sonner` (compatível com Tailwind dark mode e paleta SPFP Navy-900 #0A1628). Toasts de sucesso (2-3s), erros (dismiss manual), loading para operações > 500ms com ação de retry.

---

#### TD-016 — Contraste WCAG não Validado

**Pares de cor com risco (escopo expandido pela Fase 6):**

| Par de Cores | Uso | Risco Estimado |
|-------------|-----|----------------|
| `#6AA9F4` sobre `#0A1628` | Texto auxiliar sobre fundo principal | ALTO — ratio estimado ~3.8:1 |
| `#92a4c9` sobre `#1A2233` | Textos secundários em cards | ALTO |
| `#00C2A0` sobre `#0A1628` | Indicadores Finn e metas | MEDIO — a verificar |
| `#1B85E3` sobre `#0A1628` | Links e ações primárias | MEDIO |

**Critérios de aceitação:** Auditoria com axe DevTools. Relatório com ratios medidos (não apenas pass/fail). Tokens corrigidos atualizados em `tailwind.config.js`.

---

#### TD-041 — TransactionForm sem Layout Wrapper

**Problema:** Adicionar uma transação é a ação mais frequente do app. O usuário perde sidebar, header e contexto de posição. Em mobile, perde o bottom navigation completamente.

**Solução proposta:** Slideover lateral (desktop) ou bottom sheet (mobile), mantendo contexto de navegação. Não reutilizar o padrão de fullscreen modal.

---

#### TD-042 — Ausência de Error Boundaries Granulares

**Problema:** `ErrorBoundary` global derruba toda a aplicação quando `Insights.tsx` falha (API Gemini tem variabilidade alta). Usuário perde acesso ao Dashboard, Transações e todos os dados da sessão.

**Solução:** `<ErrorBoundary>` individual em Insights, Goals, AdminCRM, Budget e Patrimony. Fallback com mensagem amigável e link para Dashboard.

---

#### TD-043 — Dashboard/TransactionList/Patrimony sem Empty States

**Problema:** Onboarding com Finn (5 telas, bem implementado no EPIC-013) termina e entrega usuário em Dashboard vazio sem next steps. Janela de maior risco de churn é os primeiros 5 minutos.

**Solução:** `<FinnAvatar mode="partner" />` + CTA em Dashboard ("Adicione sua primeira transação"), TransactionList, Goals, e Patrimony quando respectivos arrays são vazios.

**Nota:** Implementar imediatamente sem esperar TD-008 (FinanceContext split). Verificar `transactions.length === 0` no estado atual.

---

#### TD-044 — Forms sem Loading States em Submit

**Problema:** TransactionForm e Patrimony sem feedback visual de loading durante submit. Usuário clica múltiplas vezes, criando duplicatas no banco.

**Solução:** `disabled={isSubmitting}` + `<Loader2 className="animate-spin" />` durante operações assíncronas.

---

#### TD-045 — Input Fields sem aria-describedby

**Problema:** Mensagens de erro não associadas programaticamente ao campo via `aria-describedby`. Leitores de tela não anunciam o erro quando usuário foca o campo.

**Solução:** `aria-describedby="campo-error-id"` e `aria-invalid="true"` nos inputs com erro em TransactionForm, Login e Settings.

---

#### TD-046 — Goals, Insights, Budget com Cobertura ARIA Insuficiente

**Problema:** Elementos interativos (botões de progresso de metas, mensagens de chat do Finn, gráficos de orçamento) sem descrições ARIA adequadas.

**Prioridade:** Elementos interativos primeiro (botões, inputs, controles de chart), depois informativos.

---

### 4.5 Testes

#### TD-006 — Ausência de data-testid

**Problema:** Nenhum componente possui `data-testid`. Impossibilita testes E2E estáveis com Playwright.

**Solução:** 50+ elementos críticos com `data-testid` semântico: `data-testid="add-transaction-btn"`, `data-testid="finn-chat-input"`, etc. Guia de nomenclatura documentado.

---

#### TD-011 — Ausência de Testes React Context para FinanceContext

**Nota:** O arquivo `src/test/financeContextLogic.test.ts` existe. Porém, testar lógica isolada é diferente de testar o FinanceContext como React Context via React Testing Library (com Provider/Consumer e side effects). A cobertura real deve ser verificada com `npm run test -- --coverage`.

**Critérios de aceitação:**
- [ ] FinanceContext testado como React Context (Provider + hooks)
- [ ] Cobertura >= 80% das funções de estado
- [ ] Cenários de impersonação e soft delete cobertos

---

#### TD-012 — Ausência de Testes E2E

**Solução:** Playwright para: login (Google + email), adicionar transação, visualizar dashboard, enviar mensagem ao Finn, checkout Stripe.

---

### 4.6 Performance

#### TD-026 — Mobile Recharts Overflow

**Viewports críticos:** 320px (iPhone SE — amplamente usado no Brasil), 375px, 390px.

**Solução:** `ResponsiveContainer` com `minHeight` adequado em `DashboardChart` e `DashboardMetrics`.

---

#### TD-027 — useEffect Cleanup Ausente

**Componentes críticos:** Insights.tsx (confirmado), AdminCRM.tsx, FinanceContext. Memory leaks acumulados degradam sessões longas — power users do Finn são os mais afetados.

---

#### TD-029 — Dashboard sem Paginação

**Problema:** Carrega todas as transações em memória. Com 10K+ transações, rendering fica lento em mobile.

**Solução:** Paginação virtual em TransactionList (`react-window`). Agregações de dashboard no backend via views (TD-024 é pré-requisito).

---

### 4.7 DevOps / Observabilidade

**Items identificados mas sem stories criadas (para avaliação futura):**
- Sem CI/CD ativo documentado (estado base desconhecido — A VERIFICAR)
- Sem monitoramento em produção (Sentry mencionado como "futuro" em CLAUDE.md)
- Sem baseline de volume de dados em produção (necessário para priorizar TD-022)
- Edge Functions ativas: `finn-chat` confirmada; demais — A VERIFICAR no Supabase dashboard
- Audit trail de impersonação mutável — admin poderia deletar logs próprios (ver RISCO-003 do QA Gate)

---

## 5. Mapa de Dependências (Final)

```
BLOCO INDEPENDENTE (qualquer ordem no Sprint 1):
  TD-035 ─────────────────────────────────────► deploy
  TD-031 ─────────────────────────────────────► deploy
  TD-004 (step 1: env var) ───────────────────► deploy

BLOCO DB Sprint 1 (sequência obrigatória):
  [limpeza orphans] ──► TD-003 ──────────────► deploy
  TD-039 ─────────────► TD-001 ──────────────► deploy
  TD-002 ─────────────► TD-017 ──────────────► deploy (sequência de produto)
  TD-025 (rollbacks) ─────────────────────────► ANTES do deploy Sprint 1

BLOCO UX Sprint 2 (independentes entre si):
  TD-007 ─────────────────────────────────────► deploy
  TD-015 ─────────────────────────────────────► deploy (precede TD-019)
  TD-043 ─────────────────────────────────────► deploy (não bloqueia por TD-008)
  TD-041, TD-042, TD-044 ─────────────────────► deploy

BLOCO TIPOS E CONTEXTO (sequência obrigatória):
  TD-020 (types split)
    └─► TD-008 (FinanceContext split)
          ├─► TD-011 (testes Context)
          ├─► TD-018 (real-time sync)
          └─► TD-029 (dashboard paginação)

BLOCO TESTABILIDADE (precedem testes E2E):
  TD-006 (data-testid) ─┐
  TD-013 (Insights split) ─┼─────────────────► TD-012 (testes E2E)
  TD-014 (Layout split) ──┘

BLOCO OBSERVABILIDADE:
  TD-015 (toast) ─────────────────────────────► TD-019 (error recovery)
  TD-010 (dual AI) ───────────────────────────► TD-019

BLOCO DB Sprint 3+:
  TD-024 (views) ─────────────────────────────► TD-029 (paginação)
  TD-023 ─────────────────────────────────────► deploy
  TD-036 ─────────────────────────────────────► deploy

BLOCO PERFORMANCE (condicional):
  TD-001 ─────────────────────────────────────► TD-022 (particionamento)
  TD-022: apenas quando transactions >= 500K rows

DIAGRAMA RESUMIDO POR SPRINT:
  Sprint 1: TD-001(após TD-039), TD-002, TD-003, TD-004(step1),
            TD-017, TD-025(parcial), TD-030, TD-031, TD-035, TD-039
  Sprint 2: TD-005, TD-007, TD-015, TD-016, TD-026, TD-032, TD-033,
            TD-041, TD-042, TD-043, TD-044, TD-045
  Sprint 3: TD-006, TD-013, TD-014, TD-019, TD-020, TD-023,
            TD-024, TD-025(restante), TD-036, TD-046
  Sprint 4a: TD-008, TD-021
  Sprint 4b: TD-010, TD-011, TD-004(step2)
  Sprint 5: TD-012, TD-018, TD-027, TD-028, TD-038, TD-040, TD-047
  Sprint 6: TD-009, TD-022(condicional), TD-029, TD-034, TD-037, TD-048
```

---

## 6. Roadmap Final (Corrigido)

### Sprint 1 — Segurança & LGPD (Semanas 1–2)

**Objetivo:** Eliminar riscos de segurança e compliance LGPD antes do crescimento de usuários.

| ID | Débito | Esforço | Owner |
|----|--------|---------|-------|
| TD-039 | investments soft delete (pré-req TD-001) | XS (<2h) | @data-engineer |
| TD-001 | RLS soft delete fix (lista expandida) | S (2-4h) | @data-engineer |
| TD-002 | hard_delete_user_data + Edge Function | M (4-8h) | @data-engineer + @dev |
| TD-003 | sent_atas FK constraint + limpeza órfãos | XS (<1h) | @data-engineer |
| TD-004 | Admin emails → env var (step 1) | S (1-2h) | @dev |
| TD-017 | Data export function LGPD (assíncrona) | M (4-8h) | @data-engineer + @dev |
| TD-025 | Rollback scripts para migrations Sprint 1 | S (2-4h) | @data-engineer |
| TD-030 | webhook_logs.payload — estratégia de limpeza | S (1-4h) | @data-engineer |
| TD-031 | Naming conventions DB (policies/views) | XS (<1h) | @data-engineer |
| TD-035 | automation_logs.duration_ms → BIGINT | XS (<1h) | @data-engineer |

**Esforço total revisado:** 12–18h (ajustado da estimativa original de 8–12h per Fase 5).

**Critério de saída:** Zero débitos CRÍTICOS de segurança/compliance ativos. RLS correto em todas as tabelas core. `hard_delete_user_data()` testado em staging.

---

### Sprint 2 — UX Crítica & Acessibilidade (Semanas 3–4)

**Objetivo:** Resolver issues críticos de UX com impacto direto em retenção e conversão.

| ID | Débito | Esforço | Owner |
|----|--------|---------|-------|
| TD-043 | Empty states Dashboard/TransactionList/Patrimony | S (1-4h) | @dev |
| TD-005 | Deprecar Goals v1 ou v2 (decisão PO + impl) | L (16-40h) | @dev + @po |
| TD-007 | Focus trap em modais + aria-modal | S (1-4h) | @dev |
| TD-015 | Sistema de toast notifications (sonner) | S (1-4h) | @dev |
| TD-041 | TransactionForm → slideover (desktop) / bottom sheet (mobile) | M (4-16h) | @dev |
| TD-042 | Error boundaries granulares em Insights, Goals, AdminCRM | S (1-4h) | @dev |
| TD-044 | Loading states em TransactionForm e Patrimony | S (1-4h) | @dev |
| TD-045 | Input fields aria-describedby (TransactionForm, Login, Settings) | S (1-4h) | @dev |
| TD-016 | Auditoria de contraste WCAG (axe DevTools) | S (1-4h) | @ux-design-expert |
| TD-026 | Mobile Recharts overflow fix | S (1-4h) | @dev |
| TD-032 | prefers-reduced-motion nas animações | XS (<1h) | @dev |
| TD-033 | Skeleton colors match tema SPFP | XS (<1h) | @dev |

**Esforço total:** 18–30h (variável com decisão sobre TD-005).

**Critério de saída:** Zero débitos de churn risk (Tier 1 UX) ativos. Dashboard com empty states. Toast system funcionando.

---

### Sprint 3 — Testabilidade & Infraestrutura de Qualidade (Semanas 5–6)

**Objetivo:** Criar infraestrutura de testes e reduzir tamanho dos componentes críticos.

| ID | Débito | Esforço | Owner |
|----|--------|---------|-------|
| TD-006 | Adicionar data-testid em 50+ componentes | M (4-16h) | @dev |
| TD-013 | Insights.tsx → FinnChat, FinnDiagnosis, FinnRateLimit, FinnQuickChips | M (4-16h) | @dev |
| TD-014 | Layout.tsx → DesktopSidebar, MobileBottomNav, AdminSidebar | M (4-16h) | @dev |
| TD-019 | Error recovery universal (8 serviços restantes) | M (4-16h) | @dev |
| TD-020 | types.ts split por domínio (pré-req TD-008) | M (4-16h) | @dev |
| TD-023 | Trigger validate_task_assignee (com exceção service_role) | S (1-4h) | @data-engineer |
| TD-024 | Views ausentes: financial_summary, investment_performance, goal_progress, dashboard_metrics, finn_usage_summary | S/M (2-6h) | @data-engineer |
| TD-025 | Rollback scripts para migrations Sprint 3 | M (4-8h) | @data-engineer |
| TD-036 | dashboard_metrics views melhoradas | S (1-2h) | @data-engineer |
| TD-046 | Auditoria ARIA Goals, Insights, Budget | M (4-16h) | @dev |

**Esforço total:** 25–35h.

**Critério de saída:** Nenhum componente > 400 LOC. Codebase preparado para testes automatizados. types.ts dividido por domínio.

---

### Sprint 4a — Arquitetura Core: FinanceContext Split (Semanas 7–8)

**Objetivo:** Eliminar o single point of failure da arquitetura. Sprint isolado para TD-008 (XL).

| ID | Débito | Esforço | Owner |
|----|--------|---------|-------|
| TD-008 | FinanceContext split em sub-contexts | XL (40h+) | @dev + @architect |
| TD-021 | GIN indexes para full-text search (CONCURRENTLY) | S (1-4h) | @data-engineer |

**Esforço total:** 40–50h.

**Critério de saída:** Sub-contexts independentes sem regressão. Re-renders localizados por domínio. Nenhum componente de página quebrando.

---

### Sprint 4b — Testes Unitários & AI Consolidado (Semanas 9–10)

**Objetivo:** Cobertura de testes nas camadas críticas e consolidação do caminho de IA.

| ID | Débito | Esforço | Owner |
|----|--------|---------|-------|
| TD-011 | Testes unitários FinanceContext (React Context + hooks) | L (16-40h) | @qa + @dev |
| TD-010 | Consolidar dual path AI (Finn único, API key removida do frontend) | M (4-16h) | @dev |
| TD-004 | Admin detection via Supabase (step 2) | M (4-16h) | @dev |

**Esforço total:** 25–45h.

**Critério de saída:** >= 70% de cobertura em FinanceContext. Dual AI path consolidado. API key Gemini removida do bundle.

---

### Sprint 5 — AI Real-time & Observabilidade (Semanas 11–12)

**Objetivo:** Testes E2E, real-time sync, e observabilidade em produção.

| ID | Débito | Esforço | Owner |
|----|--------|---------|-------|
| TD-012 | Testes E2E com Playwright (5+ cenários em CI) | L (16-40h) | @qa |
| TD-018 | Real-time sync Supabase (transactions, goals) | L (16-40h) | @dev |
| TD-027 | useEffect cleanup audit (Insights, AdminCRM, FinanceContext) | M (4-16h) | @dev |
| TD-028 | Strings hard-coded → i18n | M (4-16h) | @dev |
| TD-038 | ai_history cleanup function | S (1-3h) | @data-engineer |
| TD-040 | Webhook retry mechanism | M (4-8h) | @data-engineer |
| TD-047 | Recharts custom tooltips acessíveis | M (4-16h) | @dev |

**Esforço total:** 30–45h.

**Critério de saída:** 5+ testes E2E passando em CI. Real-time sync ativo para transactions. Memory leaks auditados.

---

### Sprint 6 — Performance & Polish (Semanas 13–14)

**Objetivo:** Performance de longo prazo e itens de backlog restantes.

| ID | Débito | Esforço | Owner |
|----|--------|---------|-------|
| TD-009 | ImpersonationService refactor | M (4-16h) | @dev |
| TD-029 | Dashboard paginação / virtual scroll | M (4-16h) | @dev |
| TD-034 | Bundle size audit e otimização | M (4-16h) | @dev |
| TD-022 | Particionamento transactions (condicional ≥ 500K rows) | L (16-40h) | @data-engineer + @architect |
| TD-037 | automation_logs archive strategy | S (2-4h) | @data-engineer |
| TD-048 | SalesPage social proof e micro-copy | M (4-16h) | @dev + @ux-design-expert |

**Esforço total:** 25–40h (+ 16-40h se TD-022 for ativado).

**Critério de saída:** Dashboard funcional com 10K+ transações. Bundle principal < 500KB gzip.

---

## 7. Verificações Pendentes (A VERIFICAR)

Estes itens não foram possíveis de verificar automaticamente durante a Discovery e devem ser confirmados manualmente antes ou durante o Sprint 1:

| # | Item | Como Verificar | Impacto se Pendente |
|---|------|---------------|-------------------|
| 1 | Tabelas legadas `user_data` e `interaction_logs` no Supabase dashboard | Supabase Dashboard → Table Editor | Se existirem com dados, adicionar auditoria de RLS ao Sprint 1 |
| 2 | Cobertura real de testes | `npm run test -- --coverage` | Pode alterar score de testes de 3/10 para 5/10 |
| 3 | `restore_user_data()` usa SECURITY DEFINER | Supabase Dashboard → Database → Functions | Se não, RLS fix (TD-001) pode bloquear restauração de dados |
| 4 | Edge Functions ativas (além de `finn-chat`) | Supabase Dashboard → Edge Functions | Identificar funções sem documentação |
| 5 | Contraste WCAG real dos pares de cor identificados | axe DevTools no Dashboard e Insights | Pode elevar ou reduzir o esforço de TD-016 |
| 6 | Bundle size atual | `npm run build` → verificar chunks | Calibrar esforço de TD-034 |
| 7 | Lighthouse Performance Score atual | Chrome DevTools → Lighthouse | Baseline para meta de >= 85 |
| 8 | Volume de dados em produção (rows por tabela) | Supabase Dashboard → Table Editor | Priorização de TD-022 |
| 9 | CI/CD ativo | Verificar GitHub Actions / Vercel settings | Estado base para Sprint 5 |
| 10 | Rota `/transforme` — propósito e estado atual | Grep no codebase + navegação manual | Pode ser landing page degradada recebendo tráfego |

---

## 8. Score Final por Dimensão

### Score Atual e Alvo

| Dimensão | Score Atual | Justificativa | Score Alvo Sprint 6 |
|----------|------------|---------------|---------------------|
| Segurança | 5/10 | RLS 98% em schema atual, mas sem deleted_at filter; admin hardcoded; API key exposta | 9/10 |
| Compliance (LGPD) | 3/10 | Sem hard delete, sem data export, sem direito ao esquecimento | 9/10 |
| Performance | 6/10 | Code splitting + memo OK; sem paginação, sem real-time sync | 8/10 |
| Consistência DB | 7/10 | Schema normalizado, 60+ indexes; sent_atas FK ausente; investments sem soft delete | 9/10 |
| UX/Frontend | 5/10 | Design sólido pós-EPIC-013; duplicações v1/v2; sem empty states; falhas silenciosas | 9/10 |
| Testes | 3/10 | 45+ arquivos existem, mas cobertura real A VERIFICAR; zero E2E confirmados | 8/10 |
| Arquitetura | 6/10 | Patterns corretos; FinanceContext monolítico; dual AI path inseguro | 9/10 |
| **TOTAL** | **35/70 (50%)** | | **61/70 (87%)** |

### Progressão por Sprint

| Momento | Score Estimado | Principais Ganhos |
|---------|--------------|------------------|
| Baseline (agora) | 35/70 (50%) | — |
| Após Sprint 1 | 44/70 (63%) | Segurança +4, Compliance +5 |
| Após Sprint 2 | 51/70 (73%) | UX +4, Compliance +2 |
| Após Sprint 3 | 55/70 (79%) | Arquitetura +2, Testes +2 |
| Após Sprint 4a | 57/70 (81%) | Arquitetura +2 |
| Após Sprint 4b | 59/70 (84%) | Testes +2 |
| Após Sprint 5 | 61/70 (87%) | Testes +2, Performance +1 |
| Após Sprint 6 | 61/70 (87%) | Performance +0 (ganhos de polish não alteram score calculado) |

---

## 9. Critério de "Sistema Saudável"

O SPFP será considerado tecnicamente saudável quando atingir **TODOS** os critérios abaixo:

### Segurança & Compliance (obrigatório)

| Critério | Meta | Verificação |
|---------|------|-------------|
| Zero débitos CRÍTICOS de segurança abertos | 0 | Issues tracker |
| RLS com filtro `deleted_at IS NULL` em tabelas core | 100% | SQL audit script |
| `hard_delete_user_data()` implementado e testado | Ativo em produção | Teste em staging |
| `data_export_user()` implementado | Ativo em produção | Teste de download |
| Admin emails não expostos no bundle | Verificado via DevTools | Build artifact |
| API key Gemini removida do bundle frontend | Verificado via DevTools | Build artifact |

### Qualidade de Código (obrigatório)

| Critério | Meta | Verificação |
|---------|------|-------------|
| Cobertura de testes FinanceContext | >= 80% | `npm run test -- --coverage` |
| Testes E2E cobrindo fluxos críticos | >= 5 cenários passando em CI | GitHub Actions |
| Nenhum componente de página > 400 LOC | 100% das páginas | ESLint max-lines rule |
| Zero falhas silenciosas em operações de dado | Toast em 10+ pontos de ação | Revisão manual |

### UX & Acessibilidade (obrigatório)

| Critério | Meta | Verificação |
|---------|------|-------------|
| Contraste WCAG AA validado | 100% dos pares de cor/fundo | axe DevTools report |
| Focus trap em todos os modais bloqueantes | 100% | Teste manual com teclado |
| Empty states com CTA em todas as listas | Dashboard, TransactionList, Goals, Patrimony | Revisão visual com usuário novo |
| Apenas uma versão de Goals e uma de Retirement | Sem duplicações no sidebar | Revisão do Layout |

### Performance (desejável)

| Critério | Meta | Verificação |
|---------|------|-------------|
| Bundle principal | < 500KB gzip | `npm run build` |
| Lighthouse Performance | >= 85 | Chrome DevTools |
| Dashboard funcional com 10K+ transações | Sem lag visível | Teste de carga manual |

---

## 10. Notas sobre Tabelas Legadas e RLS

### Contradição Identificada pelo QA Gate (RISCO-001)

O DB-AUDIT.md (Fase 2, Marco 2026) afirma "98% RLS coverage". Porém, a migration `001-add-rls-policies.sql` cria RLS apenas para `user_data` e `interaction_logs` — tabelas não listadas no SCHEMA.md atual do schema normalizado.

**Interpretações possíveis:**
1. `user_data` e `interaction_logs` foram descontinuadas nas migrations de normalização (fevereiro 2026) e não existem mais no Supabase ativo.
2. As tabelas existem com dados de usuários anteriores à normalização e podem ter RLS desatualizado.

**Ação obrigatória antes do Sprint 1:** Verificar no Supabase Dashboard → Table Editor se `user_data` e `interaction_logs` existem.

- **Se não existem:** Documentar explicitamente. Claim de "98% RLS" é correto. Nenhuma ação adicional.
- **Se existem com dados:** Adicionar ao Sprint 1 como TD-049 (CRÍTICO): auditoria e correção de RLS para tabelas legadas com dados de usuários.

---

## Apêndice A — Rastreabilidade por Documento Fonte

| Documento Fonte | Débitos Originados |
|----------------|-------------------|
| system-architecture.md (Fase 1) | TD-004, TD-008, TD-009, TD-010, TD-011, TD-018, TD-019, TD-020, TD-029, TD-034 |
| SCHEMA.md (Fase 2) | TD-003, TD-022, TD-023, TD-024 |
| DB-AUDIT.md (Fase 2) | TD-001, TD-002, TD-017, TD-021, TD-025, TD-030, TD-031, TD-035 |
| frontend-spec.md (Fase 3) | TD-005, TD-006, TD-007, TD-012, TD-013, TD-014, TD-015, TD-016, TD-026, TD-027, TD-028, TD-032, TD-033 |
| technical-debt-DRAFT.md (Fase 4) | Consolidação de TD-001 a TD-035 com critérios de aceitação |
| db-specialist-review.md (Fase 5) | TD-036, TD-037, TD-038, TD-039, TD-040 + expansões de TD-001/002/017 |
| ux-specialist-review.md (Fase 6) | TD-041, TD-042, TD-043, TD-044, TD-045, TD-046, TD-047, TD-048 + expansões de TD-005/007/013/014/015/016 |
| qa-review.md (Fase 7) | Validação de claims; identificação de GAPs; exigência de Sprint 4a/4b; quantificação de testes |

## Apêndice B — Edge Functions Documentadas

| Edge Function | Propósito | Autenticação | Rate Limit |
|--------------|-----------|-------------|------------|
| `finn-chat` | Proxy para API Gemini com rate limiting | JWT Supabase | Essencial: 10/mês, Wealth: 15/mês |
| `delete-account` | A criar (TD-002) | JWT Supabase (service_role) | — |
| `export-user-data` | A criar (TD-017) | JWT Supabase | — |

Demais Edge Functions ativas: A VERIFICAR no Supabase Dashboard.

---

> Produzido por @architect (Aria) — Brownfield Discovery Fase 8 (FINAL)
> 48 débitos consolidados | 9 CRÍTICOS | 15 ALTOS | 16 MÉDIOS | 8 BAIXOS
> Score atual: 35/70 (50%) | Meta pós-Sprint 6: 61/70 (87%)
> Incorpora correções das Fases 5 (DB), 6 (UX) e 7 (QA Gate)
> Data: 2026-03-05
