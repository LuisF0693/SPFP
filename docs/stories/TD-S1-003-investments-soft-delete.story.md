# [TD-S1-003] Fix soft delete em investments e patrimony

> Epic: EPIC-TD-001 | Sprint 1 | Prioridade: CRITICO
> Origem: TD-001 (extensao — tabelas nao cobertas na story TD-S1-001)
> Owner: @data-engineer

---

## Contexto

A story TD-S1-001 corrige o RLS de soft delete nas 6 tabelas core (`accounts`, `transactions`, `categories`, `goals`, `transaction_groups`, `category_budgets`). No entanto, o SPFP possui duas tabelas adicionais com dados financeiros sensiveis — `investments` e patrimony-related — que podem ter o mesmo problema de RLS sem filtro `deleted_at IS NULL`.

Alem disso, as operacoes de exclusao no frontend para investimentos e patrimonio precisam ser auditadas para garantir que estao usando soft delete consistentemente com o resto do sistema (e nao DELETE permanente acidental).

**Motivacao:** Garantir que o padrao de soft delete seja completo e consistente em TODO o schema financeiro do usuario, nao apenas nas tabelas core identificadas inicialmente.

---

## Objetivo

Auditar e corrigir as politicas RLS e o padrao de soft delete nas tabelas `investments`, `patrimony` (e quaisquer outras tabelas financeiras com `deleted_at`) para garantir que registros logicamente deletados nao sejam expostos por queries diretas.

---

## Criterios de Aceitacao

- [ ] AC1: A tabela `investments` possui coluna `deleted_at` — verificado via `\d investments` no psql ou Supabase Studio
- [ ] AC2: Se `investments` possui `deleted_at`, a politica RLS SELECT inclui `AND deleted_at IS NULL` — validado por query direta ao Supabase SDK
- [ ] AC3: A tabela de patrimony (verificar nome real no schema — pode ser `patrimony`, `assets`, ou outro) possui coluna `deleted_at` e politica RLS corrigida
- [ ] AC4: As operacoes de exclusao de investimentos em `src/context/FinanceContext.tsx` usam UPDATE com `deleted_at = NOW()` (soft delete) e NAO usam DELETE permanente
- [ ] AC5: As operacoes de exclusao de patrimony em `src/context/FinanceContext.tsx` usam soft delete — verificado no codigo
- [ ] AC6: Migration de correcao criada e aplicada em staging sem erros
- [ ] AC7: Teste manual confirma que investimento excluido pelo usuario nao aparece no frontend nem em query direta ao Supabase

---

## Tarefas Tecnicas

- [ ] Task 1: Listar todas as tabelas do schema com coluna `deleted_at` via `select table_name from information_schema.columns where column_name = 'deleted_at' and table_schema = 'public'` — mapear quais nao foram cobertas em TD-S1-001
- [ ] Task 2: Para cada tabela identificada fora do escopo de TD-S1-001, verificar politicas RLS SELECT atuais via `select * from pg_policies where tablename = '<tabela>'`
- [ ] Task 3: Criar migration `supabase/migrations/20260305_rls_soft_delete_investments.sql` para tabelas de investimentos e patrimony com o filtro `AND deleted_at IS NULL` nas politicas SELECT
- [ ] Task 4: Auditar `src/context/FinanceContext.tsx` — funcoes `deleteInvestment`, `deletePatrimony` (ou equivalentes) — verificar se usam soft delete ou DELETE
- [ ] Task 5: Se encontrar DELETE permanente nessas funcoes, converter para UPDATE com `deleted_at = new Date().toISOString()` (padrao do resto do contexto)
- [ ] Task 6: Testar localmente: criar investimento, "excluir" pelo frontend, verificar via SDK que nao retorna
- [ ] Task 7: Aplicar migration em staging e validar

---

## Definicao de Pronto

- [ ] Codigo revisado
- [ ] Migration testada em staging
- [ ] Todas as tabelas com `deleted_at` possuem politica RLS SELECT corrigida
- [ ] Operacoes de exclusao no frontend para investments e patrimony confirmadas como soft delete
- [ ] Nenhuma regressao: investments e patrimony continuam aparecendo normalmente para registros ativos

---

## Esforo Estimado

**S** (2-4 horas)
- Task 1-2 (auditoria): ~1h
- Task 3 (migration): ~30min
- Task 4-5 (auditoria frontend): ~1h
- Task 6-7 (testes): ~1h

---

## Dependencias

- TD-S1-001 deve estar completo primeiro — ela estabelece o padrao; esta story estende para tabelas nao cobertas
- Acesso ao Supabase Studio ou psql para consulta de schema

---

## Notas Tecnicas

- A lista de tabelas com `deleted_at` pode ser maior do que o esperado — verificar tambem tabelas CRM como `sales_leads`, `company_tasks`, etc.
- Para tabelas CRM (nao financeiras do usuario), avaliar se o mesmo padrao de RLS deve ser aplicado — pode ser fora do escopo desta story
- `src/context/FinanceContext.tsx` — buscar por `delete` (case-insensitive) para encontrar todas as funcoes de exclusao
- Referencia: `docs/architecture/technical-debt-assessment.md` — Secao 3 (TD-001), `docs/architecture/SCHEMA.md` para lista completa de tabelas
