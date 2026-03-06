# Technical Debt — DRAFT Consolidado
> Brownfield Discovery — Fase 4 | @architect (Aria) | 2026-03-05
> Consolidacao das Fases 1 (Arquitetura), 2 (DB/Schema/Audit) e 3 (Frontend/UX)

---

## 1. Executive Summary

O SPFP e uma aplicacao de planejamento financeiro pessoal com stack moderna (React 19, TypeScript, Vite, Supabase) e arquitetura funcional pronta para producao. A plataforma possui banco de dados bem projetado (80% score), frontend estruturado com code splitting e memoization, e camada de IA operacional via Finn Edge Function. Os principais riscos estruturais concentram-se em: (1) um FinanceContext monolitico que e o unico ponto de falha de todo o estado financeiro da aplicacao, (2) ausencia de conformidade LGPD/GDPR no banco (sem hard delete), (3) duplicacao ativa de features v1/v2 (Goals, Retirement) que fragmenta UX e duplica custo de manutencao, e (4) cobertura de testes praticamente nula nas camadas criticas. O sistema e operacional mas acumula debitos que aumentam o risco de regressao a cada nova feature.

**Scores por Dimensao:**

| Dimensao | Score Fase | Referencia |
|----------|-----------|------------|
| Arquitetura (Fase 1) | 7/10 | DT-001 a DT-010 |
| Banco de Dados (Fase 2) | 32/40 (80%) | Issues #1-13 |
| Frontend/UX (Fase 3) | 31/50 (62%) | P0-P2 UX Debts |

**Score Consolidado Estimado: 70/100**

**Inventario por Severidade:**

| Severidade | Quantidade |
|-----------|-----------|
| CRITICO | 7 |
| ALTO | 10 |
| MEDIO | 11 |
| BAIXO | 7 |
| **TOTAL** | **35** |

**Top 3 Riscos Imediatos:**

1. **Exposicao de dados soft-deleted via RLS** — politicas de RLS nao filtram `deleted_at IS NULL`, permitindo que dados "deletados" sejam retornados por queries diretas ao banco via Supabase SDK.
2. **FinanceContext como single point of failure** — ~1000 LOC gerenciando todos os dominios; um bug aqui derruba toda a aplicacao financeira do usuario.
3. **Ausencia de hard_delete_user_data (LGPD)** — sem funcao de exclusao permanente, o sistema nao atende ao direito de exclusao da LGPD/GDPR.

---

## 2. Inventario Completo de Debitos (Tabela Mestre)

| ID | Area | Titulo | Severidade | Esforco | Impacto | Fase Origem |
|----|------|--------|-----------|---------|---------|-------------|
| TD-001 | DB/Seguranca | RLS sem filtro de deleted_at nas tabelas core | CRITICO | S (1-4h) | Seguranca | Fase 2 |
| TD-002 | DB/Compliance | Ausencia de hard_delete_user_data (LGPD/GDPR) | CRITICO | S (1-4h) | Compliance | Fase 2 |
| TD-003 | DB/Integridade | sent_atas.client_id sem FK constraint | CRITICO | XS (<1h) | Seguranca | Fase 2 |
| TD-004 | Seguranca/Arch | Admin emails hardcoded em AuthContext | CRITICO | S (1-4h) | Seguranca | Fase 1 |
| TD-005 | Frontend | Duplicacao ativa Goals v1+v2 / Retirement v1+v2 | CRITICO | M (4-16h) | UX | Fase 3 |
| TD-006 | Frontend | Ausencia de data-testid (impossibilita testes UI) | CRITICO | M (4-16h) | Manutenibilidade | Fase 3 |
| TD-007 | Frontend/a11y | Sem focus trap em modais (acessibilidade critica) | CRITICO | S (1-4h) | UX | Fase 3 |
| TD-008 | Arquitetura | FinanceContext monolitico (~1000+ LOC) | ALTO | XL (40h+) | Manutenibilidade | Fase 1 |
| TD-009 | Arquitetura | Impersonation state com 5 mecanismos descoordenados | ALTO | M (4-16h) | Manutenibilidade | Fase 1 |
| TD-010 | Arquitetura | Dual path de AI (Finn Edge vs aiService SDK direto) | ALTO | M (4-16h) | Manutenibilidade | Fase 1 |
| TD-011 | Testes | Ausencia de testes para FinanceContext | ALTO | L (16-40h) | Manutenibilidade | Fase 1 |
| TD-012 | Testes | Ausencia de testes E2E (login, transacao, Finn) | ALTO | L (16-40h) | Manutenibilidade | Fase 1/3 |
| TD-013 | Frontend | Insights.tsx muito grande (~675 LOC) | ALTO | M (4-16h) | Manutenibilidade | Fase 3 |
| TD-014 | Frontend | Layout.tsx muito grande (~467 LOC) | ALTO | M (4-16h) | Manutenibilidade | Fase 3 |
| TD-015 | Frontend | Sem sistema de toast notifications global | ALTO | S (1-4h) | UX | Fase 3 |
| TD-016 | Frontend/a11y | Contraste WCAG nao validado (#6AA9F4 em fundo escuro) | ALTO | S (1-4h) | UX | Fase 3 |
| TD-017 | DB/Compliance | Ausencia de data export function (portabilidade LGPD) | ALTO | S (1-4h) | Compliance | Fase 2 |
| TD-030 | DB/Seguranca | webhook_logs.payload sem criptografia (PII potencial) | ALTO | S (1-4h) | Seguranca | Fase 2 |
| TD-018 | Arquitetura | Real-time sync Supabase nao implementado | MEDIO | L (16-40h) | Performance | Fase 1 |
| TD-019 | Arquitetura | Error recovery nao universalizado (4 de 12 servicos) | MEDIO | M (4-16h) | Manutenibilidade | Fase 1 |
| TD-020 | Arquitetura | types.ts monolitico (~250+ LOC, sem split por dominio) | MEDIO | M (4-16h) | Manutenibilidade | Fase 1 |
| TD-021 | DB/Performance | Ausencia de full-text search indexes (GIN) | MEDIO | S (1-4h) | Performance | Fase 2 |
| TD-022 | DB/Performance | Sem estrategia de particionamento para transactions | MEDIO | L (16-40h) | Performance | Fase 2 |
| TD-023 | DB/Integridade | company_tasks.assignee_id sem validacao de squad membership | MEDIO | S (1-4h) | Integridade | Fase 2 |
| TD-024 | DB/Analytics | Views ausentes de alto valor (financial_summary, investment_performance, goal_progress) | MEDIO | S (1-4h) | Performance | Fase 2 |
| TD-025 | DB/Governanca | Ausencia de rollback scripts para migrations criticas | MEDIO | M (4-16h) | Manutenibilidade | Fase 2 |
| TD-026 | Frontend | Mobile: Recharts pode overflow em telas pequenas | MEDIO | S (1-4h) | UX | Fase 3 |
| TD-027 | Frontend | useEffect cleanup ausente — risco de memory leaks | MEDIO | M (4-16h) | Performance | Fase 3 |
| TD-028 | Frontend | Strings hard-coded sem i18n | MEDIO | M (4-16h) | Manutenibilidade | Fase 3 |
| TD-029 | Arquitetura | Dashboard sem paginacao (carrega tudo em memoria) | MEDIO | M (4-16h) | Performance | Fase 1/3 |
| TD-031 | DB | Naming conventions inconsistentes (policies e views) | BAIXO | XS (<1h) | Manutenibilidade | Fase 2 |
| TD-032 | Frontend | Animacoes sem prefers-reduced-motion | BAIXO | XS (<1h) | UX | Fase 3 |
| TD-033 | Frontend | Skeleton colors nao alinhados ao tema | BAIXO | XS (<1h) | UX | Fase 3 |
| TD-034 | Arquitetura | Bundle size / chunk warnings (chunkSizeWarningLimit: 600) | BAIXO | M (4-16h) | Performance | Fase 1 |
| TD-035 | DB | automation_logs.duration_ms tipo INT (overflow potencial) | BAIXO | XS (<1h) | Integridade | Fase 2 |

---

## 3. Debitos Criticos (Detalhe Completo)

### TD-001 — RLS sem filtro de deleted_at nas tabelas core

**Descricao do Problema:**
As politicas de Row Level Security (RLS) das tabelas core (accounts, transactions, categories, goals, transaction_groups) verificam apenas `auth.uid() = user_id`, mas nao incluem o filtro `AND deleted_at IS NULL`. Registros logicamente deletados (soft delete) continuam retornados por queries diretas ao banco via Supabase SDK.

**Evidencia Tecnica** (DB-AUDIT.md — Issue #2 / Secao 4):
```sql
-- Atual (risco):
CREATE POLICY "accounts_select" ON accounts
  FOR SELECT USING (auth.uid() = user_id);
  -- Nao filtra deleted_at! Dados deletados retornam.

-- Correto:
CREATE POLICY "accounts_select" ON accounts
  FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);
```

**Impacto se nao resolvido:**
Dados "deletados" pelo usuario permanecem acessiveis via chamadas diretas ao Supabase SDK. O frontend filtra `deleted_at IS NULL` na aplicacao, mas qualquer acesso via REST API ou SDK direto expoe dados que o usuario considera removidos. Risco de privacidade e violacao de expectativa do usuario.

**Proposta de Solucao:**
Criar migration `20260305_rls_soft_delete_fix.sql` adicionando `AND deleted_at IS NULL` nas politicas SELECT de: accounts, transactions, categories, goals, transaction_groups, category_budgets.

**Criterios de Aceitacao:**
- [ ] Todas as 6 tabelas core tem `AND deleted_at IS NULL` nas politicas SELECT
- [ ] Records com deleted_at nao retornam em queries diretas ao Supabase
- [ ] Funcao de recuperacao (recoverTransaction) continua funcionando via service_role
- [ ] Testes manuais confirmam que soft-deleted records nao aparecem no frontend

---

### TD-002 — Ausencia de hard_delete_user_data (LGPD/GDPR)

**Descricao do Problema:**
A funcao `soft_delete_user_data()` existe mas nao ha funcao de exclusao permanente (`hard_delete_user_data()`). A LGPD (Lei 13.709/2018) garante ao usuario o direito de ter seus dados completamente apagados ("direito ao esquecimento"). Sem essa funcao o sistema nao e compliant.

**Evidencia Tecnica** (DB-AUDIT.md — Secao 7.1):
> "`hard_delete_user_data()` — right to be forgotten: Ausente"
> "Data export function (portabilidade): Ausente"

**Impacto se nao resolvido:**
Risco legal de nao conformidade com LGPD. Em caso de requisicao de exclusao de dados por usuario, o sistema nao consegue garantir erradicacao completa. Dados permanecem em `ai_history`, `automation_logs`, `transactions` mesmo apos cancelamento da conta.

**Proposta de Solucao:**
Migration + Edge Function `delete-account` que executa:
```sql
CREATE OR REPLACE FUNCTION hard_delete_user_data(p_user_id UUID)
RETURNS JSONB AS $$
BEGIN
  DELETE FROM transactions WHERE user_id = p_user_id;
  DELETE FROM accounts WHERE user_id = p_user_id;
  DELETE FROM goals WHERE user_id = p_user_id;
  DELETE FROM investments WHERE user_id = p_user_id;
  DELETE FROM ai_history WHERE user_id = p_user_id;
  DELETE FROM finn_usage WHERE user_id = p_user_id;
  DELETE FROM automation_logs WHERE user_id = p_user_id;
  -- ... todas as tabelas com user_id
  RETURN jsonb_build_object('deleted', true, 'user_id', p_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Criterios de Aceitacao:**
- [ ] `hard_delete_user_data(user_id)` implementada e testada
- [ ] Funcao acessivel apenas via service_role (Edge Function protegida)
- [ ] UI de "Excluir minha conta" em Settings com confirmacao dupla
- [ ] Fluxo completo testado em ambiente de staging

---

### TD-003 — sent_atas.client_id sem FK constraint

**Descricao do Problema:**
A tabela `sent_atas` possui coluna `client_id` do tipo UUID referenciando clientes, mas sem constraint de Foreign Key. Permite insercao de `client_id` apontando para usuarios inexistentes, criando registros orfaos.

**Evidencia Tecnica** (SCHEMA.md — Secao 6 / DB-AUDIT.md — Issue #1):
> "client_id — SEM FK"
> "Issue: `client_id` sem FK constraint"

**Impacto se nao resolvido:**
Integridade referencial comprometida. Analytics de engajamento CRM retornam resultados incorretos quando client_id referencia usuario inexistente.

**Proposta de Solucao:**
```sql
-- Migration: 20260305_sent_atas_fk_fix.sql
ALTER TABLE sent_atas
ADD CONSTRAINT fk_sent_atas_client
  FOREIGN KEY (client_id) REFERENCES auth.users(id) ON DELETE SET NULL;
```

**Criterios de Aceitacao:**
- [ ] FK constraint adicionada sem erro
- [ ] Registros orfaos existentes tratados (SET NULL)
- [ ] Migration idempotente (IF NOT EXISTS)

---

### TD-004 — Admin emails hardcoded em AuthContext

**Descricao do Problema:**
Lista de emails administrativos hardcoded em `src/context/AuthContext.tsx`:
```typescript
const ADMIN_EMAILS = ['nando062218@gmail.com'];
```
Mudanca de admin exige deploy do frontend. Email de admin exposto no bundle JavaScript publico (inspecionavel via DevTools).

**Evidencia Tecnica** (system-architecture.md — Secao 11):
> "Admin emails: Hardcoded — ADMIN_EMAILS em AuthContext"

**Impacto se nao resolvido:**
Operacional: adicionar/remover admins requer deploy completo. Seguranca: email exposto no bundle publico. Escalabilidade: impossivel ter multiplos admins sem code change.

**Proposta de Solucao:**
Step 1 (rapido): mover para variavel de ambiente `VITE_ADMIN_EMAILS`.
Step 2 (correto): criar tabela `admin_roles` no Supabase e verificar via Edge Function ou `user_metadata` do Auth.

**Criterios de Aceitacao:**
- [ ] Email de admin nao aparece no bundle JS publico
- [ ] Adicionar/remover admin nao requer deploy do frontend
- [ ] Compatibilidade retroativa com o admin existente garantida

---

### TD-005 — Duplicacao ativa Goals v1+v2 / Retirement v1+v2

**Descricao do Problema:**
Duas versoes paralelas e ativas de Goals (`/goals` e `/goals-v2`) e de Retirement (`/retirement` e `/retirement-v2`), ambas aparecendo no sidebar. Cria confusao de UX, duplica codigo de manutencao, e divide a atencao do time em 4 componentes ao inves de 2.

**Evidencia Tecnica** (frontend-spec.md — Secao 5 e 8):
> "Goals v1 + v2 coexistem — `/goals` e `/goals-v2` ambos no sidebar"
> "Duplicacao Goals/Retirement v1+v2 — confusao de UX e manutencao dupla (Critico P0)"

**Impacto se nao resolvido:**
Usuario nao sabe qual versao usar. Bugs corrigidos em v2 precisam ser replicados em v1. Features novas precisam ser implementadas em 4 componentes ao inves de 2.

**Proposta de Solucao:**
1. Decisao de produto: qual versao e canonica (v1 ou v2)?
2. Migrar estado/dados para a versao escolhida
3. Remover componente depreciado + rota + item de sidebar
4. Redirect da rota antiga para nova

**Criterios de Aceitacao:**
- [ ] Apenas uma versao de Goals visivel no sidebar e em producao
- [ ] Apenas uma versao de Retirement visivel no sidebar
- [ ] Rota antiga redireciona sem quebrar links existentes
- [ ] Componentes deprecados removidos do codebase

---

### TD-006 — Ausencia de data-testid (impossibilita testes UI)

**Descricao do Problema:**
Nenhum componente possui atributos `data-testid`. Impossibilita testes automatizados de UI estaveis com Playwright ou Testing Library, pois selecionar elementos por texto ou estrutura DOM e fragil a refatoracoes.

**Evidencia Tecnica** (frontend-spec.md — Secao 6):
> "Sem `data-testid` — componentes nao testaveis"

**Impacto se nao resolvido:**
Bloqueia toda iniciativa de testes E2E. Com crescimento do produto, a ausencia de testes automatizados de UI aumenta o risco de regressoes nao detectadas em CI.

**Proposta de Solucao:**
Adicionar `data-testid` nos 50+ pontos de interacao criticos: botoes primarios (adicionar transacao, salvar meta, enviar chat Finn), campos de formulario, itens de navegacao do sidebar, modais.

**Criterios de Aceitacao:**
- [ ] 50+ elementos criticos com `data-testid` semantico (ex: `data-testid="add-transaction-btn"`)
- [ ] Guia de nomenclatura documentado
- [ ] Pelo menos 1 teste E2E funcional usando os novos testids

---

### TD-007 — Sem focus trap em modais (acessibilidade critica)

**Descricao do Problema:**
Modais (Onboarding, TransactionForm fullscreen) nao implementam focus trap. Usuarios de teclado e leitores de tela podem "escapar" do modal com Tab, acessando elementos do fundo semanticamente inacessiveis.

**Evidencia Tecnica** (frontend-spec.md — Secao 6):
> "Sem focus trap em modais — usuario escapa com Tab"

**Impacto se nao resolvido:**
Violacao do criterio WCAG 2.1 AA. Usuarios de teclado perdem contexto do modal ao navegar. Potencial falha em auditorias de acessibilidade.

**Proposta de Solucao:**
Implementar focus trap usando `focus-trap-react` ou logica nativa em `Modal.tsx`. Aplicar em Onboarding, TransactionForm, e qualquer dialog que bloqueia interacao com o fundo.

**Criterios de Aceitacao:**
- [ ] Focus fica contido dentro do modal ao pressionar Tab
- [ ] Escape fecha o modal e retorna focus ao elemento que o abriu
- [ ] Testado com NVDA ou VoiceOver
- [ ] Aplicado em todos os modais bloqueantes

---

## 4. Debitos Altos (Detalhe Completo)

### TD-008 — FinanceContext Monolitico (~1000+ LOC)

**Problema:** Arquivo unico gerenciando todos os dominios financeiros (accounts, transactions, categories, goals, investments, patrimony, budgets). Qualquer mudanca impacta todo o contexto e re-renderiza toda a arvore de componentes.

**Evidencia:** system-architecture.md — DT-001: "~1000+ LOC, gerencia todos os dominios em um unico arquivo. Difícil testar, qualquer mudança recausa re-render global."

**Impacto:** Dificulta testes unitarios, escalabilidade e refatoracao segura. Um bug em qualquer funcao pode derrubar toda a aplicacao financeira.

**Proposta:** Split em sub-contexts por dominio: `AccountsContext`, `TransactionsContext`, `GoalsContext`, `InvestmentsContext`, `BudgetsContext`. FinanceContext fica como agregador fino.

**Criterios de Aceitacao:**
- [ ] Sub-contexts independentes com testes isolados por dominio
- [ ] Nenhuma regressao no comportamento existente
- [ ] Re-renders localizados por sub-context (nao mais global)

---

### TD-009 — Impersonation State com 5 Mecanismos

**Problema:** Sistema de impersonacao usa simultaneamente flags de estado, localStorage (2 chaves), state backup em memoria, e ref — cinco pontos de sincronizacao que podem dessincronizar.

**Evidencia:** system-architecture.md — DT-002: "5 mecanismos de estado para impersonacao. Dessincronizacao possivel; bugs se admin navegar durante impersonacao."

**Proposta:** Criar `ImpersonationService` dedicado com estado centralizado, log de auditoria e testes de cenario (iniciar, navegar durante, encerrar impersonacao).

**Criterios de Aceitacao:**
- [ ] Servico unico gerencia todo o ciclo de impersonacao
- [ ] Testes cobrindo: iniciar, navegar, encerrar impersonacao
- [ ] Sem dessincronizacao de estado em cenarios de multiplas abas

---

### TD-010 — Dual Path de AI (Finn vs aiService)

**Problema:** Dois caminhos paralelos para chamadas de IA: `callFinnProxy()` via Edge Function (com rate limit e JWT) e `chatWithAI()` via SDK Gemini direto (sem rate limit). Rate limiting so funciona no caminho do Finn.

**Evidencia:** system-architecture.md — DT-008: "Dois caminhos: callFinnProxy() e chatWithAI(). Rate limit apenas no Finn."

**Proposta:** Consolidar em `callFinnProxy()` para producao. Manter `aiService.ts` apenas como fallback de desenvolvimento. Rate limit deve ser aplicado em 100% das chamadas.

**Criterios de Aceitacao:**
- [ ] Unico ponto de entrada para IA em producao
- [ ] Rate limit sempre aplicado independente do caminho
- [ ] Fallback documentado para ambiente de desenvolvimento

---

### TD-011 — Ausencia de Testes para FinanceContext

**Problema:** A camada central de estado da aplicacao nao possui testes unitarios. Qualquer refatoracao e arriscada e nao verificavel.

**Evidencia:** system-architecture.md — DT-006 e Secao 14: "Testes unitarios FinanceContext — Ausente."

**Proposta:** `src/test/FinanceContext.test.tsx`, `impersonation.test.tsx`, `softDelete.test.tsx`. Minimo 80% de cobertura nas funcoes de estado.

**Criterios de Aceitacao:**
- [ ] Tests passando em CI
- [ ] Cobertura >= 80% do FinanceContext
- [ ] Cenarios de impersonacao e soft delete cobertos

---

### TD-012 — Ausencia de Testes E2E

**Problema:** Zero testes de integracao ou E2E. Fluxos criticos (login, criacao de transacao, chat com Finn) sem cobertura automatizada.

**Evidencia:** system-architecture.md — Secao 14: "Testes E2E — Ausente."

**Proposta:** Playwright para: login (Google + email), adicionar transacao, visualizar dashboard, enviar mensagem ao Finn, checkout Stripe.

**Criterios de Aceitacao:**
- [ ] 5+ cenarios E2E cobrindo fluxos criticos
- [ ] Rodando em CI via GitHub Actions
- [ ] Falhas bloqueiam merge em main

---

### TD-013 — Insights.tsx Muito Grande (~675 LOC)

**Problema:** Componente de chat com Finn concentra logica de historico, rate limit, diagnostico, quick chips, input, e renderizacao de mensagens em 675 linhas.

**Evidencia:** frontend-spec.md — Secao 7: "Insights.tsx ~675 — MUITO GRANDE — quebrar em sub-componentes."

**Proposta:** Split em: `FinnChat.tsx` (input + historico), `FinnDiagnosis.tsx` (diagnostico 360), `FinnRateLimit.tsx` (overlay de limite), `FinnQuickChips.tsx` (prompts rapidos).

**Criterios de Aceitacao:**
- [ ] Nenhum sub-componente > 200 LOC
- [ ] Funcionalidade identica apos refatoracao
- [ ] Testes individuais por sub-componente

---

### TD-014 — Layout.tsx Muito Grande (~467 LOC)

**Problema:** Componente de layout implementa 3 sistemas de navegacao em um arquivo: sidebar desktop, bottom navigation mobile, e sidebar admin CRM.

**Evidencia:** frontend-spec.md — Secao 7: "Layout.tsx ~467 — MUITO GRANDE — separar 3 nav systems."

**Proposta:** `DesktopSidebar.tsx`, `MobileBottomNav.tsx`, `AdminSidebar.tsx`. Layout.tsx fica como orquestrador responsivo (~80 LOC).

**Criterios de Aceitacao:**
- [ ] Layout funciona em desktop, mobile e admin sem regressao
- [ ] Cada sistema de navegacao testavel de forma independente

---

### TD-015 — Sem Sistema de Toast Notifications Global

**Problema:** Erros e confirmacoes mostrados de forma inconsistente: inline em alguns componentes, silenciosa em outros (FinanceContext). Sem padrao de feedback ao usuario.

**Evidencia:** frontend-spec.md — Secao 5: "Sem toast notifications globais; falhas silenciosas em FinanceContext."

**Proposta:** Implementar `react-hot-toast` ou `sonner`. Integrar ao UIContext. Adicionar toasts em: adicionar transacao, salvar meta, sync com Supabase, operacoes do Finn.

**Criterios de Aceitacao:**
- [ ] Sistema de toast instalado e integrado ao UIContext
- [ ] Toasts em 10+ pontos de acao do usuario
- [ ] Toast de sucesso, erro e loading com estilos distintos

---

### TD-016 — Contraste WCAG Nao Validado

**Problema:** A cor `#6AA9F4` (blue-SPFP) sobre fundo dark (`#0A1628`) pode nao atingir ratio minimo de 4.5:1 (WCAG AA para texto normal).

**Evidencia:** frontend-spec.md — Secao 6: "Contraste nao validado — `#6AA9F4` (texto) em fundo preto."

**Proposta:** Auditoria com axe DevTools em todas as combinacoes de cor/fundo do design system. Ajustar tokens que falham em 4.5:1.

**Criterios de Aceitacao:**
- [ ] Todas as combinacoes de texto/fundo passam WCAG AA (4.5:1 texto normal, 3:1 texto grande)
- [ ] Relatorio de auditoria gerado e arquivado em docs/

---

### TD-017 — Ausencia de Data Export Function (LGPD)

**Problema:** LGPD exige que o titular dos dados possa exportar todos os seus dados em formato estruturado. Nao existe funcao de exportacao completa.

**Evidencia:** DB-AUDIT.md — Secao 7.1: "Data export function (portabilidade) — Ausente."

**Proposta:** Edge Function `export-user-data` coletando todos os dados do usuario (transacoes, contas, metas, investimentos, historico Finn) e retornando JSON para download.

**Criterios de Aceitacao:**
- [ ] Export retorna todos os dados do usuario em JSON valido
- [ ] UI "Exportar meus dados" acessivel em Settings
- [ ] Link de download com expiracao (ex: 1h)

---

### TD-030 — webhook_logs.payload Sem Criptografia

**Problema:** Webhooks do Stripe e Hotmart contem dados de pagamento e potencialmente PII. O campo `payload` e armazenado como texto plano em `webhook_logs`.

**Evidencia:** DB-AUDIT.md — Secao 1.2: "webhook_logs.payload — dados Stripe/Hotmart com PII potencial."

**Proposta:** Criptografar payload usando `pgcrypto`, ou armazenar apenas campos nao-sensiveis (external_id, event_type, status) descartando o payload completo apos processamento bem-sucedido.

**Criterios de Aceitacao:**
- [ ] Dados de pagamento nao ficam em texto plano no banco
- [ ] Payloads processados deletados apos 30 dias ou criptografados
- [ ] Documentacao da estrategia escolhida

---

## 5. Debitos Medios (Lista Resumida)

| ID | Titulo | Proposta de Solucao | Esforco |
|----|--------|--------------------|---------|
| TD-018 | Real-time sync Supabase nao implementado | Implementar listeners Supabase em FinanceContext para transactions e goals; mostrar badge de sync em tempo real | L (16-40h) |
| TD-019 | Error recovery nao universalizado (4/12 servicos) | Adicionar `errorRecovery.handleOperation()` em pdfService, csvService, MarketDataService e demais 8 servicos sem cobertura | M (4-16h) |
| TD-020 | types.ts monolitico (~250+ LOC) | Split por dominio: `types/transactions.ts`, `types/accounts.ts`, `types/goals.ts`, `types/investments.ts`, `types/ai.ts` | M (4-16h) |
| TD-021 | Ausencia de full-text search indexes | Adicionar index GIN em `transactions.description` e `sales_leads.notes` para busca textual | S (1-4h) |
| TD-022 | Sem particionamento para transactions | Implementar RANGE partitioning em `transactions(date)` ao atingir 500K+ rows | L (16-40h) |
| TD-023 | company_tasks.assignee_id sem validacao de squad | Criar trigger `validate_task_assignee()` verificando membership em company_members antes de INSERT/UPDATE | S (1-4h) |
| TD-024 | Views ausentes de alto valor | Criar views: `user_financial_summary` (net worth), `investment_performance` (ROI), `goal_progress` (% conclusao) | S (1-4h) |
| TD-025 | Ausencia de rollback scripts para migrations | Criar `supabase/rollbacks/` com reverse migrations para as 5 migrations mais criticas | M (4-16h) |
| TD-026 | Mobile: Recharts overflow em telas pequenas | Adicionar `ResponsiveContainer` com `minHeight` e testar em viewports 320px, 375px, 414px | S (1-4h) |
| TD-027 | useEffect cleanup ausente — memory leaks | Auditoria de useEffect em Insights.tsx, AdminCRM.tsx e FinanceContext; adicionar cleanup e cancelamento de subscriptions | M (4-16h) |
| TD-028 | Strings hard-coded sem i18n | Inventariar strings fora das paginas traduzidas; adicionar chaves i18n no namespace correto | M (4-16h) |
| TD-029 | Dashboard sem paginacao | Implementar paginacao virtual em TransactionList (react-window); agregacoes de dashboard no backend via views | M (4-16h) |

---

## 6. Debitos Baixos (Lista)

| ID | Titulo | Esforco |
|----|--------|---------|
| TD-031 | Naming conventions inconsistentes no DB (policies e views) | XS (<1h) |
| TD-032 | Animacoes sem prefers-reduced-motion | XS (<1h) |
| TD-033 | Skeleton colors nao alinhados ao tema | XS (<1h) |
| TD-034 | Bundle size audit (chunks acima do limite de 600KB) | M (4-16h) |
| TD-035 | automation_logs.duration_ms tipo INT (overflow para runs longas) | XS (<1h) |

---

## 7. Mapa de Dependencias

Debitos que devem ser resolvidos ANTES de outros:

```
BLOCO INDEPENDENTE (executar em qualquer ordem):
  TD-001 → migration independente
  TD-002 → Edge Function + migration independentes
  TD-003 → migration independente
  TD-004 (step 1) → env var, independente
  TD-007 → lib independente (focus-trap-react)
  TD-015 → lib independente (react-hot-toast)
  TD-035 → migration independente

BLOCO DE TIPOS E CONTEXTO:
  TD-020 (types.ts split)
    └─ deve preceder TD-008 (FinanceContext split)
       porque o split de contextos depende de tipos por dominio

  TD-008 (FinanceContext split)
    ├─ deve preceder TD-011 (testes FinanceContext)
    ├─ deve preceder TD-018 (real-time sync)
    └─ deve preceder TD-029 (dashboard paginacao)

BLOCO DE OBSERVABILIDADE:
  TD-015 (toast system)
    └─ deve preceder TD-019 (error recovery universal)
       porque toast e o canal de exibicao dos erros

  TD-010 (dual AI unificado)
    └─ deve preceder TD-019 (error recovery em aiService)

BLOCO DE TESTABILIDADE:
  TD-006 (data-testid) ─┐
  TD-013 (Insights split) ─┼─ devem preceder TD-012 (testes E2E)
  TD-014 (Layout split) ──┘

BLOCO DE PERFORMANCE:
  TD-024 (views DB)
    └─ deve preceder TD-029 (dashboard paginacao)
       porque as views fornecem as agregacoes necessarias

  TD-022 (particionamento)
    └─ depende de volume real >= 500K rows — nao urgente agora

DIAGRAMA SIMPLIFICADO:
  TD-001, TD-002, TD-003 ──────────────────────────► (pronto, Sprint 1)
  TD-004, TD-007, TD-035 ──────────────────────────► (pronto, Sprint 1)
  TD-020 ──► TD-008 ──► TD-011 ──────────────────► (Sprint 4)
                      └──► TD-018 ─────────────────► (Sprint 5)
                      └──► TD-029 ─────────────────► (Sprint 6)
  TD-015 ──► TD-019 ─────────────────────────────► (Sprint 3/5)
  TD-010 ──► TD-019 ─────────────────────────────► (Sprint 4)
  TD-006 ─┐
  TD-013 ─┼──► TD-012 ──────────────────────────► (Sprint 5)
  TD-014 ─┘
  TD-024 ──► TD-029 ────────────────────────────► (Sprint 6)
```

---

## 8. Roadmap de Resolucao (Sprints)

### Sprint 1 — Seguranca e Compliance (Semanas 1-2)

**Objetivo:** Eliminar riscos de seguranca e compliance LGPD antes de crescimento de usuarios.

| ID | Debito | Esforco | Owner Sugerido |
|----|--------|---------|----------------|
| TD-001 | RLS soft delete fix (migration) | S | @data-engineer |
| TD-002 | hard_delete_user_data + Edge Function | S | @data-engineer + @dev |
| TD-003 | sent_atas FK constraint (migration) | XS | @data-engineer |
| TD-004 | Admin emails → env var (step 1 rapido) | S | @dev |
| TD-017 | Data export function (LGPD) | S | @data-engineer + @dev |
| TD-035 | automation_logs.duration_ms → BIGINT | XS | @data-engineer |
| TD-031 | Naming conventions DB (policies/views) | XS | @data-engineer |

**Esforco total estimado:** 8-12h
**Criterio de saida:** Zero debitos CRITICOS de seguranca/compliance ativos.

---

### Sprint 2 — UX Critica e Acessibilidade (Semanas 3-4)

**Objetivo:** Resolver issues criticos de UX que afetam diretamente a experiencia do usuario.

| ID | Debito | Esforco | Owner Sugerido |
|----|--------|---------|----------------|
| TD-005 | Deprecar Goals v1 ou v2 (decisao + impl) | M | @dev + @po |
| TD-005b | Deprecar Retirement v1 ou v2 | M | @dev + @po |
| TD-007 | Focus trap em modais | S | @dev |
| TD-015 | Sistema de toast notifications | S | @dev |
| TD-016 | Auditoria de contraste WCAG | S | @ux-design-expert |
| TD-026 | Mobile Recharts overflow fix | S | @dev |
| TD-032 | prefers-reduced-motion nas animacoes | XS | @dev |
| TD-033 | Skeleton colors match tema | XS | @dev |

**Esforco total estimado:** 12-20h
**Criterio de saida:** Zero debitos CRITICOS de UX/acessibilidade ativos.

---

### Sprint 3 — Testabilidade e Infraestrutura de Qualidade (Semanas 5-6)

**Objetivo:** Criar infraestrutura de testes que permite crescimento seguro do produto.

| ID | Debito | Esforco | Owner Sugerido |
|----|--------|---------|----------------|
| TD-006 | Adicionar data-testid em 50+ componentes | M | @dev |
| TD-020 | types.ts split por dominio | M | @dev |
| TD-013 | Insights.tsx → sub-componentes | M | @dev |
| TD-014 | Layout.tsx → desktop/mobile/admin | M | @dev |
| TD-019 | Error recovery universal (servicos faltantes) | M | @dev |
| TD-023 | Trigger validate_task_assignee | S | @data-engineer |
| TD-024 | Views ausentes (financial_summary, etc.) | S | @data-engineer |

**Esforco total estimado:** 20-30h
**Criterio de saida:** Codebase preparado para testes automatizados; nenhum componente > 400 LOC.

---

### Sprint 4 — Cobertura de Testes Unitarios (Semanas 7-8)

**Objetivo:** Implementar testes nas camadas criticas e consolidar arquitetura de AI.

| ID | Debito | Esforco | Owner Sugerido |
|----|--------|---------|----------------|
| TD-008 | FinanceContext split em sub-contexts | XL | @dev + @architect |
| TD-011 | Testes unitarios FinanceContext | L | @qa + @dev |
| TD-010 | Consolidar dual path de AI (Finn unico) | M | @dev |
| TD-025 | Rollback scripts para migrations criticas | M | @data-engineer |
| TD-021 | GIN indexes para full-text search | S | @data-engineer |

**Esforco total estimado:** 30-50h
**Criterio de saida:** >= 70% de cobertura em FinanceContext, dual AI path consolidado.

---

### Sprint 5 — Testes E2E e Observabilidade (Semanas 9-10)

**Objetivo:** Testes de integracao e melhorias de observabilidade em producao.

| ID | Debito | Esforco | Owner Sugerido |
|----|--------|---------|----------------|
| TD-012 | Testes E2E com Playwright (5+ cenarios) | L | @qa |
| TD-018 | Real-time sync Supabase | L | @dev |
| TD-027 | useEffect cleanup audit | M | @dev |
| TD-028 | Strings hard-coded → i18n | M | @dev |
| TD-004 | Admin detection via Supabase (step 2) | M | @dev |
| TD-030 | Criptografia de webhook_logs.payload | S | @data-engineer |

**Esforco total estimado:** 25-40h
**Criterio de saida:** 5+ testes E2E passando em CI; real-time sync ativo para transactions.

---

### Sprint 6 — Performance e Backlog (Semanas 11-12)

**Objetivo:** Performance de longo prazo e itens de backlog restantes.

| ID | Debito | Esforco | Owner Sugerido |
|----|--------|---------|----------------|
| TD-029 | Dashboard paginacao / virtual scroll | M | @dev |
| TD-034 | Bundle size audit e otimizacao | M | @dev |
| TD-009 | ImpersonationService refactor | M | @dev |
| TD-022 | Estrategia de particionamento (planejamento) | L | @data-engineer + @architect |

**Esforco total estimado:** 20-35h
**Criterio de saida:** Dashboard funcional com 10K+ transacoes, bundle principal < 500KB gzip.

---

## 9. Score Final e Metas

### Score Atual por Dimensao

| Dimensao | Score Atual | Justificativa |
|----------|------------|---------------|
| Seguranca | 6/10 | RLS OK em 98% das tabelas, mas sem hard delete e admin hardcoded |
| Compliance (LGPD) | 4/10 | Sem hard delete, sem data export function |
| Performance | 6/10 | Code splitting + memo OK, sem paginacao, sem real-time |
| Manutenibilidade | 5/10 | FinanceContext monolitico, tipos nao segmentados, sem testes |
| UX/Acessibilidade | 6/10 | Design solido, mas duplicacoes v1/v2 e gaps de a11y |
| Qualidade de Testes | 2/10 | Praticamente zero cobertura em camadas criticas |
| **Consolidado** | **29/60** | **48%** |

### Score Alvo por Sprint

| Momento | Score Estimado | Principais Ganhos |
|---------|--------------|------------------|
| Baseline (agora) | 29/60 (48%) | — |
| Apos Sprint 1 | 37/60 (62%) | Seguranca +4, Compliance +4 |
| Apos Sprint 2 | 42/60 (70%) | UX/a11y +3, Manutenibilidade +2 |
| Apos Sprint 3 | 46/60 (77%) | Manutenibilidade +3, Testes +1 |
| Apos Sprint 4 | 50/60 (83%) | Testes +3, Seguranca +1 |
| Apos Sprint 5 | 54/60 (90%) | Testes +2, Performance +2 |
| Apos Sprint 6 | 57/60 (95%) | Performance +2, Manutenibilidade +1 |

### Criterio de "Projeto Saudavel"

O projeto SPFP sera considerado tecnicamente saudavel quando atingir TODOS os criterios abaixo:

| Criterio | Meta |
|---------|------|
| Zero debitos CRITICOS abertos | 0 |
| Cobertura de testes FinanceContext | >= 80% |
| Testes E2E cobrindo fluxos criticos | >= 5 cenarios em CI |
| Nenhum componente > 400 LOC | 100% das paginas |
| Contraste WCAG AA validado | 100% das combinacoes de cor/fundo |
| Hard delete LGPD implementado | Ativo e testado |
| RLS com filtro deleted_at | Todas as tabelas core |
| Score consolidado | >= 54/60 (90%) |
| Bundle principal | < 500KB gzip |
| Lighthouse Performance | >= 85 |

---

## Apendice — Rastreabilidade por Documento Fonte

| Documento Fonte | Debitos Originados |
|----------------|-------------------|
| system-architecture.md (Fase 1) | TD-004, TD-008, TD-009, TD-010, TD-011, TD-018, TD-019, TD-020, TD-029, TD-034 |
| SCHEMA.md (Fase 2) | TD-003, TD-022, TD-023, TD-024 |
| DB-AUDIT.md (Fase 2) | TD-001, TD-002, TD-017, TD-021, TD-025, TD-030, TD-031, TD-035 |
| frontend-spec.md (Fase 3) | TD-005, TD-006, TD-007, TD-012, TD-013, TD-014, TD-015, TD-016, TD-026, TD-027, TD-028, TD-032, TD-033 |

---

> Produzido por @architect (Aria) — Brownfield Discovery Fase 4
> 35 debitos identificados | 7 CRITICOS | 10 ALTOS | 12 MEDIOS | 7 BAIXOS (inclui TD-030 em ALTOS, ajustado da tabela mestre)
> Score atual: 48% | Meta pos-resolucao completa: 95%
> Proximo passo: Revisao por @data-engineer (Fase 5) e @ux-design-expert (Fase 6) — QA Gate
