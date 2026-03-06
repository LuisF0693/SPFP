# [TD-S1-001] Fix RLS soft delete nas tabelas core

> Epic: EPIC-TD-001 | Sprint 1 | Prioridade: CRITICO
> Origem: TD-001 (DB-AUDIT.md — Issue #2 / Secao 4)
> Owner: @data-engineer

---

## Contexto

As politicas de Row Level Security (RLS) das tabelas core do SPFP verificam apenas `auth.uid() = user_id`, mas nao incluem o filtro `AND deleted_at IS NULL`. Registros logicamente deletados pelo usuario (soft delete) continuam sendo retornados por queries diretas ao banco via Supabase SDK.

O frontend filtra `deleted_at IS NULL` na camada de aplicacao, mas qualquer acesso via REST API, MCP, ou SDK direto expoe dados que o usuario considera removidos. Isso viola a expectativa de privacidade e cria risco de exposicao de dados pessoais.

**Tabelas afetadas:** `accounts`, `transactions`, `categories`, `goals`, `transaction_groups`, `category_budgets`

**Evidencia tecnica (DB-AUDIT.md — Issue #2):**
```sql
-- Atual (risco): dados deletados retornam em queries diretas
CREATE POLICY "accounts_select" ON accounts
  FOR SELECT USING (auth.uid() = user_id);

-- Correto: filtro de soft delete na politica
CREATE POLICY "accounts_select" ON accounts
  FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);
```

---

## Objetivo

Garantir que registros com `deleted_at IS NOT NULL` nunca sejam retornados por queries SELECT diretas ao Supabase, independente do caminho de acesso (SDK, REST API, MCP, service_role com RLS ativo).

---

## Criterios de Aceitacao

- [ ] AC1: A politica SELECT da tabela `accounts` inclui `AND deleted_at IS NULL` e nao retorna registros soft-deleted em query direta via Supabase SDK
- [ ] AC2: A politica SELECT da tabela `transactions` inclui `AND deleted_at IS NULL` e nao retorna registros soft-deleted
- [ ] AC3: A politica SELECT da tabela `categories` inclui `AND deleted_at IS NULL` e nao retorna registros soft-deleted
- [ ] AC4: A politica SELECT da tabela `goals` inclui `AND deleted_at IS NULL` e nao retorna registros soft-deleted
- [ ] AC5: A politica SELECT da tabela `transaction_groups` inclui `AND deleted_at IS NULL` e nao retorna registros soft-deleted
- [ ] AC6: A politica SELECT da tabela `category_budgets` inclui `AND deleted_at IS NULL` e nao retorna registros soft-deleted
- [ ] AC7: A funcao de recuperacao de registros (ex: `recoverTransaction`) continua funcionando via `service_role` sem restricao do RLS
- [ ] AC8: A migration e idempotente (executa sem erro se rodar duas vezes — usar `DROP POLICY IF EXISTS` + `CREATE POLICY`)

---

## Tarefas Tecnicas

- [ ] Task 1: Auditar as politicas RLS atuais de cada tabela via `supabase db diff` ou Supabase Studio — listar todas as politicas SELECT existentes
- [ ] Task 2: Criar migration `supabase/migrations/20260305_rls_soft_delete_fix.sql` com DROP + CREATE das politicas SELECT corrigidas para as 6 tabelas
- [ ] Task 3: Adicionar `AND deleted_at IS NULL` nas politicas UPDATE e DELETE tambem, se aplicavel (registros deletados nao devem ser modificaveis)
- [ ] Task 4: Testar em ambiente local com `supabase db push` — criar registro, soft delete, verificar que query SELECT nao retorna
- [ ] Task 5: Verificar que `recoverTransaction` em `FinanceContext.tsx` ainda funciona (usa UPDATE para limpar deleted_at — nao e afetado pelo SELECT policy)
- [ ] Task 6: Aplicar migration em staging e validar com testes manuais
- [ ] Task 7: Documentar na migration o antes/depois de cada politica com comentarios SQL

---

## Definicao de Pronto

- [ ] Codigo revisado por pelo menos 1 outro desenvolvedor
- [ ] Migration testada em ambiente local e staging
- [ ] Nenhuma regressao no frontend (transacoes, contas e metas continuam aparecendo normalmente)
- [ ] Registro soft-deleted verificado como nao retornado via Supabase SDK em teste manual
- [ ] Migration commitada em `supabase/migrations/` com nome convencional

---

## Esforo Estimado

**S** (1-4 horas)
- Task 1 (auditoria): ~30min
- Task 2-3 (migration): ~1h
- Task 4-6 (testes): ~1h
- Task 7 (documentacao): ~30min

---

## Dependencias

Nenhuma — esta story e independente e pode ser executada no inicio do Sprint 1.

---

## Notas Tecnicas

- Arquivo de migration a criar: `supabase/migrations/20260305_rls_soft_delete_fix.sql`
- Politicas RLS atuais podem ser consultadas em: Supabase Studio > Authentication > Policies, ou via `select * from pg_policies where tablename in ('accounts','transactions','categories','goals','transaction_groups','category_budgets');`
- A funcao `recoverTransaction` em `src/context/FinanceContext.tsx` executa UPDATE (nao SELECT), portanto nao e afetada pelas politicas SELECT
- Atencao: se houver politicas de UPDATE/DELETE, tambem avaliar se precisam do filtro `deleted_at IS NULL` para evitar modificacao de registros deletados
- Referencia: `docs/prd/technical-debt-DRAFT.md` — TD-001, `docs/architecture/technical-debt-assessment.md` — Secao 3 (TD-001)
