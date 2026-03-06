# DB Specialist Review — Brownfield Discovery Fase 5
> @data-engineer (Dara) | 2026-03-05
> Documento revisado: `docs/prd/technical-debt-DRAFT.md`
> Referencias: `supabase/docs/DB-AUDIT.md`, `supabase/docs/SCHEMA.md`

---

## 1. Validacao dos Debitos de Database no DRAFT

### TD-001 — RLS sem filtro de deleted_at nas tabelas core

**Status: EXPANDIDO**

A descricao esta correta e bem fundamentada. A proposta de fix esta alinhada com o DB-AUDIT.md (Issue #2, Secao 4). Porem a lista de tabelas afetadas esta incompleta.

**O DRAFT lista 6 tabelas:** accounts, transactions, categories, goals, transaction_groups, category_budgets.

**Tabelas adicionais afetadas (omitidas no DRAFT):**

O SCHEMA.md confirma que 38 de 50 tabelas possuem `deleted_at`. Entre as que tem `deleted_at` e RLS padrao de usuario (nao service_role), as seguintes foram omitidas da lista de correcao:
- `patrimony_items` — possui `deleted_at`, RLS padrao sem filtro
- `operational_tasks` — possui `deleted_at`, RLS padrao sem filtro
- `sales_leads` — possui `deleted_at`, RLS padrao sem filtro
- `marketing_posts` — verificar existencia de `deleted_at`

A correcao parcial cria falsa sensacao de seguranca: usuario que chama diretamente o SDK ainda obtem dados "deletados" de patrimony_items ou sales_leads.

**Criterio de aceitacao adicional sugerido:**
- Script de auditoria SQL para detectar automaticamente politicas SELECT sem `AND deleted_at IS NULL` em tabelas que possuem a coluna.

**Estimativa de esforco:** S (1-4h) permanece valida. A migration sera maior, mas o padrao de fix e trivialmente repetivel.

---

### TD-002 — Ausencia de hard_delete_user_data (LGPD/GDPR)

**Status: CORRIGIDO**

A descricao e proposta estao corretas, mas ha inconsistencia no SQL proposto e tabelas criticas omitidas.

**Inconsistencia de tipo de retorno:**
O DRAFT define `RETURNS JSONB` com `RETURN jsonb_build_object(...)`. O DB-AUDIT.md (Issue #3) define `RETURNS void`. Ambas sao validas, mas o JSONB e preferivel para auditoria (confirma quais dados foram deletados). O DRAFT esta correto neste ponto; apenas requer documentacao explicita de que a chamada exige `service_role`.

**Tabelas omitidas na proposta do DRAFT:**
- `sent_atas` — contem dados de clientes gerenciados pelo usuario (CRM)
- `category_budgets` — dados financeiros do usuario
- `transaction_groups` — agrupamentos de transacoes do usuario
- `retirement_settings` — configuracoes sensiveis de planejamento
- `patrimony_items` — dados de patrimonio pessoal
- `automation_logs` — logs de acoes do usuario (privacidade)
- `automation_permissions` — configuracoes do usuario

Sem cobrir essas tabelas, o sistema nao atende ao direito ao esquecimento da LGPD mesmo apos o fix.

**Estimativa de esforco corrigida:** S (1-4h) esta subestimada. A implementacao completa com Edge Function protegida, validacao de autenticidade e UI requer M (4-8h). A estimativa do Sprint 1 deve ser ajustada.

---

### TD-003 — sent_atas.client_id sem FK constraint

**Status: CONFIRMADO**

Descricao precisa e alinhada com DB-AUDIT.md Issue #1 e SCHEMA.md Secao 6. O SQL de fix proposto esta correto.

**Contexto adicional critico (ausente no DRAFT):**
Antes de aplicar a migration, e necessario limpar registros orfaos existentes. A migration falhara em producao se houver `client_id` com valores nao presentes em `auth.users`. O criterio de aceitacao menciona "registros orfaos tratados (SET NULL)" mas nao inclui o UPDATE de limpeza na propria migration.

Pre-fix obrigatorio (deve estar na mesma transacao da migration — ver Secao 5 abaixo para SQL completo).

**Estimativa de esforco:** XS (<1h) confirmada.

---

### TD-017 — Ausencia de data export function (portabilidade LGPD)

**Status: EXPANDIDO**

A descricao esta correta. A proposta simplificada no DRAFT omite dois problemas tecnicos importantes.

**Ponto 1 — Volume de dados:**
Um usuario com 500K transacoes nao pode receber tudo em um JSON sincronico via HTTP. A Edge Function precisa de estrategia assincrona: gerar arquivo no Supabase Storage, retornar URL assinada (expiracao 1h). O DRAFT menciona "link de download com expiracao" nos criterios de aceitacao mas nao enderea a estrategia de geracao assincrona na proposta de solucao.

**Ponto 2 — Tabelas faltando na exportacao:**
O DRAFT menciona "transacoes, contas, metas, investimentos, historico Finn" mas omite: goals (mencionado separado de metas?), patrimony_items, category_budgets, retirement_settings, transaction_groups, sent_atas.

**Formato de exportacao:**
JSON e tecnicamente adequado, mas um ZIP com CSVs por tabela seria mais defensavel juridicamente ("formato estruturado e de uso corrente") e mais util para o usuario final.

**Estimativa de esforco corrigida:** S (1-4h) subestima a implementacao robusta. M (4-8h) e mais realista.

---

### TD-021 — Ausencia de full-text search indexes (GIN)

**Status: CONFIRMADO**

Alinhado com DB-AUDIT.md Secao 2.2. A proposta esta correta.

**Contexto adicional:**
O DB-AUDIT lista `idx_transactions_user_amount` (filtro por valor) como outro index ausente de baixa prioridade. Pode ser incluido na mesma migration por eficiencia de deploy.

**Nota de implementacao:** Usar `CREATE INDEX CONCURRENTLY` para nao bloquear tabela em producao durante a criacao do GIN index (que e mais lento que B-tree).

**Estimativa de esforco:** S (1-4h) confirmada.

---

### TD-022 — Sem particionamento para transactions

**Status: CONFIRMADO**

A descricao e correta. O DB-AUDIT.md Secao 2.4 projeta 500K-5M rows em 1 ano. O threshold de 500K como gatilho e tecnicamente conservador — PostgreSQL com indexes adequados sustenta ate ~5M rows sem degradacao significativa. O DRAFT e prudente ao planejar antecipadamente.

**Contexto adicional omitido:**
- `automation_logs` tambem pode necessitar particionamento (100K-500K rows/ano) e ja possui `cleanup_old_automation_logs()` como mitigacao temporaria
- `ai_history` (50K-500K rows/ano) deve ser avaliada no mesmo planejamento

**Alerta de sequenciamento:** Particionamento em tabela ativa com dados existentes requer recriar a tabela e re-aplicar politicas RLS. TD-001 (RLS fix) DEVE ser aplicado antes, senao a migracao de particionamento precisara re-aplicar o fix novamente.

**Estimativa de esforco:** L (16-40h) confirmada. Requer janela de manutencao.

---

### TD-023 — company_tasks.assignee_id sem validacao de squad membership

**Status: CONFIRMADO**

Alinhado com SCHEMA.md Secao 7 e DB-AUDIT.md Issue #3.

**Contexto adicional:**
O SCHEMA.md indica que `company_tasks` tem `service_role full access` para agentes AI. O trigger de validacao deve conter excecao para `service_role`, caso contrario bloqueara operacoes legitimas de agentes que criam tasks sem ter membership formal no squad.

**Implementacao sugerida:** `IF current_setting('role') = 'service_role' THEN RETURN NEW; END IF;` no inicio do trigger.

**Estimativa de esforco:** S (1-4h) confirmada, com a ressalva acima.

---

### TD-024 — Views ausentes de alto valor

**Status: EXPANDIDO**

O DRAFT lista 3 views. O DB-AUDIT.md tambem identifica oportunidades adicionais nao capturadas.

**Views adicionais de alto valor omitidas no DRAFT:**
- `dashboard_metrics_this_month` e `dashboard_metrics_this_year` — o DB-AUDIT (Secao 5.1) aponta que `dashboard_metrics` filtra apenas `CURRENT_DATE`, tornando-a muito restrita para analytics de periodo. O frontend provavelmente calcula isso em JavaScript (desperdicio de performance)
- `finn_usage_summary` — agrega uso do Finn por usuario e mes, util para billing analytics e rate limiting management

**Estimativa de esforco:** S (1-4h) confirmada para as 3 views do DRAFT. Com as views adicionais de `dashboard_metrics`, estima S/M (2-6h total).

---

### TD-025 — Ausencia de rollback scripts para migrations criticas

**Status: CONFIRMADO**

O DB-AUDIT.md Secao 6.3 confirma: migrations sao idempotentes (positivo) mas sem rollback explicito.

**Ponto critico de sequenciamento (ausente no DRAFT):**
O DRAFT coloca TD-025 no Sprint 4, mas as migrations mais criticas sao do Sprint 1 (RLS fix, FK constraint, BIGINT). Os rollback scripts precisam ser criados ANTES do deploy do Sprint 1, nao 3 sprints depois. Recomendo mover a criacao dos rollbacks para Sprint 1 junto com as migrations correspondentes.

**Migrations do Sprint 1 que necessitam rollback imediato:**
1. RLS fix (TD-001) — rollback critico se quebrar acesso de dados legitimos
2. sent_atas FK (TD-003) — rollback simples (`DROP CONSTRAINT`)
3. investments soft delete (TD-039) — rollback simples (`DROP COLUMN`)

**Estimativa de esforco:** M (4-16h) confirmada para o conjunto completo.

---

### TD-030 — webhook_logs.payload sem criptografia (PII potencial)

**Status: EXPANDIDO**

O DRAFT esta correto mas incompleto na analise de escopo.

**Campos adicionais com risco similar (omitidos no DRAFT):**
- `automation_logs.value` — mencionado no DB-AUDIT.md Secao 1.2 como podendo conter dados de formularios
- `company_revenue.metadata` — JSONB que pode conter dados do Stripe/Hotmart

**Proposta refinada:**
A estrategia de criptografia via `pgcrypto` adiciona complexidade operacional (gerenciamento de chaves de criptografia, rotacao, etc.). Para o nivel de maturidade atual do projeto, a alternativa mais pragmatica e igualmente eficaz: deletar o payload apos processamento bem-sucedido (retencao de 30 dias conforme criterio de aceitacao do DRAFT) e armazenar apenas `external_id`, `event_type`, `status`. Isso dispensa gerenciamento de chaves e e mais simples de auditar.

**Estimativa de esforco:** S (1-4h) confirmada.

---

### TD-031 — Naming conventions inconsistentes (policies e views)

**Status: CONFIRMADO**

O DB-AUDIT.md Secao 3.4 documenta as inconsistencias exatamente como descrito no DRAFT:
- Views: `partnership_summary_by_partner` vs `sales_pipeline_summary`
- Policies: `"Users can view their own..."` vs `accounts_select`

Fix trivial via migration de DROP/CREATE com nomenclatura padronizada.

**Estimativa de esforco:** XS (<1h) confirmada.

---

### TD-035 — automation_logs.duration_ms tipo INT (overflow potencial)

**Status: CONFIRMADO**

O DB-AUDIT.md Secao 3.1 confirma. O limite de INT4 e 2.147.483.647 ms (~24.8 dias). Automacoes longas (crawlers, processamento de batch) podem exceder esse limite.

A conversao `INT → BIGINT` e widening cast no PostgreSQL: sem rewrite de tabela, sem risco de data loss, executavel sem janela de manutencao.

**Estimativa de esforco:** XS (<1h) confirmada.

---

## 2. Debitos de Database Nao Capturados

Os seguintes debitos foram identificados nos documentos de referencia mas nao constam no DRAFT:

### TD-036 — dashboard_metrics view com escopo temporal insuficiente

**Fonte:** DB-AUDIT.md Secao 5.1
**Descricao:** A view `dashboard_metrics` filtra apenas `CURRENT_DATE`. Impossivel consultar metricas de "ontem", "esta semana" ou "este mes" via view. Frontend provavelmente contorna com calculos JavaScript, desperdicando o potencial de performance do banco.
**Severidade:** MEDIO
**Esforco:** S (1-2h)
**Proposta:** Criar `dashboard_metrics_this_month` e `dashboard_metrics_this_year` com janelas de data parametrizadas, ou transformar `dashboard_metrics` em funcao SQL com parametro de periodo.

---

### TD-037 — automation_logs sem estrategia de archive

**Fonte:** DB-AUDIT.md Secao 2.4 + SCHEMA.md Secao 4
**Descricao:** `cleanup_old_automation_logs()` deleta registros > 90 dias diretamente. Nao ha tabela de arquivo. Dados de automacoes podem ser relevantes para auditoria retroativa e debugging por periodos maiores que 90 dias. Delecao permanente pode ser insuficiente para cenarios de compliance.
**Severidade:** BAIXO
**Esforco:** S (2-4h)
**Proposta:** Criar `automation_logs_archive` e modificar a funcao de cleanup para mover (INSERT INTO archive + DELETE) ao inves de deletar permanentemente.

---

### TD-038 — ai_history sem estrategia de retencao

**Fonte:** DB-AUDIT.md Secao 2.4
**Descricao:** `ai_history` pode atingir 500K rows em 1 ano sem nenhuma funcao de cleanup ou archive. Diferente de `automation_logs`, nao ha cleanup job. O SCHEMA.md menciona "arquivamento de conversas antigas" como acao recomendada mas nenhum debito foi criado no DRAFT.
**Severidade:** MEDIO
**Esforco:** S (1-3h)
**Proposta:** Criar `cleanup_old_ai_history(p_months INT DEFAULT 6)` que arquiva ou deleta conversas com mais de N meses. Parametrizavel para permitir decisao de produto sobre retencao.

---

### TD-039 — investments sem soft delete

**Fonte:** SCHEMA.md Secao 2 + DB-AUDIT.md Secao 4
**Descricao:** A tabela `investments` nao possui `deleted_at` (nao listada entre as 38 tabelas com soft delete confirmadas). Investimentos deletados sao removidos permanentemente, sem possibilidade de recuperacao ou auditoria. Para dados financeiros, soft delete e especialmente importante. Alem disso, TD-001 nao pode cobrir `investments` sem a coluna existir — este debito e pre-requisito tecnico para o TD-001 completo.
**Severidade:** MEDIO (pre-requisito para TD-001)
**Esforco:** XS (<2h)
**Proposta:** Ver Secao 5, Script 3 abaixo.

---

### TD-040 — Ausencia de reconciliacao de webhooks

**Fonte:** DB-AUDIT.md Secao 9, Prioridade 3, Item 12
**Descricao:** Falhas durante processamento de webhooks do Stripe ou Hotmart (timeout de rede, erro na Edge Function) podem resultar em eventos perdidos sem mecanismo de retry ou reconciliacao. `webhook_logs` armazena o payload mas nao possui colunas de status de processamento ou logica de reprocessamento.
**Severidade:** MEDIO
**Esforco:** M (4-8h)
**Proposta:** Adicionar colunas `processed_at TIMESTAMPTZ`, `retry_count INT DEFAULT 0`, `processing_error TEXT` em `webhook_logs`. Criar Edge Function de reconciliacao que reprocessa webhooks com `processed_at IS NULL AND retry_count < 3`.

---

## 3. Sequenciamento de Database

Ordem tecnica correta para resolver os debitos de DB, considerando dependencias de migrations e riscos:

### Bloco 1 — Migrations Independentes (Sprint 1, qualquer ordem interna)

```
TD-035  automation_logs.duration_ms → BIGINT
  Sem dependencias. ALTER TYPE sem rewrite de tabela.

TD-031  Naming conventions (policies e views)
  Sem dependencias. DROP/CREATE de policies sem impacto em dados.
```

### Bloco 2 — Integridade Referencial (Sprint 1, apos limpeza de orphans)

```
TD-003  sent_atas FK constraint
  Pre-requisito: UPDATE para NULL dos orphans na mesma transacao.
  Sem dependencias de outras migrations.
```

### Bloco 3 — Preparacao para RLS completo (Sprint 1, antes de TD-001)

```
TD-039  investments soft delete
  DEVE vir antes de TD-001.
  Justificativa: TD-001 corrige RLS para tabelas com deleted_at.
  investments precisa ter a coluna antes de ser incluida na lista de tabelas do fix.
```

### Bloco 4 — Seguranca (Sprint 1, apos Bloco 3)

```
TD-001  RLS soft delete fix (lista expandida de tabelas)
  DEVE vir depois de TD-039.
  Cobre: accounts, transactions, categories, goals, transaction_groups,
         category_budgets, patrimony_items, operational_tasks, sales_leads,
         investments (agora com deleted_at).
```

### Bloco 5 — Compliance LGPD (Sprint 1, paralelo ao Bloco 4)

```
TD-002  hard_delete_user_data()
  Independente de TD-001.
  DEVE vir antes de TD-017 (data export) no roadmap de produto,
  para que a UI de Settings exiba ambas as opcoes juntas.

TD-017  data export function
  DEVE vir depois de TD-002 na sequencia de produto.
```

### Bloco 6 — Integridade e Views (Sprint 3)

```
TD-023  trigger validate_task_assignee
  Independente.

TD-036  dashboard_metrics views melhoradas
  Independente.

TD-024  views ausentes (financial_summary, investment_performance, goal_progress)
  DEVE vir antes de TD-029 (dashboard paginacao — Sprint 6)
  pois as views fornecem as agregacoes necessarias para o backend.
```

### Bloco 7 — Performance (Sprint 4)

```
TD-021  GIN indexes para full-text search
  Independente. Usar CREATE INDEX CONCURRENTLY.

TD-025  rollback scripts
  NOTA: Rollbacks do Sprint 1 devem ser criados antes do deploy do Sprint 1,
  nao no Sprint 4. Apenas rollbacks do Sprint 3/4 ficam para o Sprint 4.
```

### Bloco 8 — Retencao e Reconciliacao (Sprint 5)

```
TD-038  ai_history cleanup function
TD-037  automation_logs archive strategy
TD-040  webhook retry mechanism
```

### Bloco 9 — Performance de Longo Prazo (Sprint 6 ou quando volume justificar)

```
TD-022  particionamento transactions
  DEPENDE de volume real >= 500K rows.
  DEVE vir DEPOIS de TD-001: particionamento recria a tabela
  e as politicas RLS precisam ser re-aplicadas na versao corrigida.
```

### Diagrama de Dependencias DB

```
BLOCO 1 (independentes, Sprint 1):
  TD-035 ──────────────────────────────────────► deploy
  TD-031 ──────────────────────────────────────► deploy

BLOCO 2 (Sprint 1):
  [limpeza orphans] ──► TD-003 ────────────────► deploy

BLOCO 3→4 (Sprint 1, sequencial):
  TD-039 ──► TD-001 ───────────────────────────► deploy

BLOCO 5 (Sprint 1, sequencial de produto):
  TD-002 ──► TD-017 ───────────────────────────► deploy

BLOCO 6 (Sprint 3):
  TD-024 ──────────────────────────────────────► (precede TD-029 no Sprint 6)
  TD-023 ──────────────────────────────────────► deploy
  TD-036 ──────────────────────────────────────► deploy

BLOCO 7 (Sprint 4):
  TD-021 (CONCURRENTLY) ───────────────────────► deploy

BLOCO 8 (Sprint 5):
  TD-038, TD-037, TD-040 ──────────────────────► deploy

BLOCO 9 (Sprint 6, condicional):
  TD-001 ──► TD-022 ───────────────────────────► deploy (se volume justificar)
```

---

## 4. Riscos de Migracao

### TD-001 — RLS soft delete fix

| Dimensao | Avaliacao |
|----------|----------|
| Risco de data loss | NENHUM — apenas alteracao de politica RLS, sem toque em dados |
| Backup necessario | Recomendado (snapshot das politicas RLS atuais como DDL) |
| Estrategia de rollback | Reverter DROP/CREATE de politicas sem o `AND deleted_at IS NULL` |
| Janela de manutencao | NAO necessaria — politicas RLS sao aplicadas atomicamente |
| Risco operacional | BAIXO — frontend ja filtra deleted_at IS NULL; usuarios nao sentirao mudanca |
| Risco de regressao | MEDIO — verificar que `restore_user_data()` usa service_role (nao afetado por RLS de usuario). A funcao esta listada no SCHEMA.md Secao 11 sem especificacao de role — requer verificacao no codigo antes do deploy |

**Teste pre-deploy obrigatorio:** Confirmar via Supabase Dashboard que `restore_user_data(user_id)` e `SECURITY DEFINER` com role adequado.

---

### TD-002 — hard_delete_user_data()

| Dimensao | Avaliacao |
|----------|----------|
| Risco de data loss | CRITICO — funcao apaga dados permanentemente e irreversivelmente |
| Backup necessario | OBRIGATORIO — pg_dump completo antes de expor a funcao em producao |
| Estrategia de rollback | IMPOSSIVEL apos execucao — dados deletados permanentemente |
| Janela de manutencao | NAO necessaria para criar a funcao; SIM para qualquer execucao em massa |
| Mitigacao principal | Funcao SECURITY DEFINER acessivel APENAS via Edge Function autenticada com validacao de JWT + log de auditoria imutavel gravado ANTES de executar DELETE |
| Gate adicional | Confirmacao dupla na UI + delay de 24h entre solicitacao e execucao (pratica recomendada para LGPD) |

**Esta funcao NAO deve ser exposta via RPC anonimo sob hipotese alguma.**

---

### TD-003 — sent_atas FK constraint

| Dimensao | Avaliacao |
|----------|----------|
| Risco de data loss | BAIXO — ON DELETE SET NULL preserva os registros existentes |
| Backup necessario | Recomendado como precaucao |
| Estrategia de rollback | `ALTER TABLE sent_atas DROP CONSTRAINT fk_sent_atas_client;` |
| Janela de manutencao | NAO necessaria se tabela for pequena |
| Risco de falha | MEDIO — a migration falhara se houver orphans sem o UPDATE de limpeza na mesma transacao |

---

### TD-035 — automation_logs.duration_ms → BIGINT

| Dimensao | Avaliacao |
|----------|----------|
| Risco de data loss | NENHUM — widening cast (INT → BIGINT) sem perda de dados |
| Backup necessario | NAO necessario |
| Estrategia de rollback | `ALTER TABLE automation_logs ALTER COLUMN duration_ms TYPE INT;` (pode falhar se houver valores > 2147483647 — verificar antes do rollback) |
| Janela de manutencao | NAO necessaria — PostgreSQL nao reescreve a tabela para widening cast |

---

### TD-039 — investments soft delete

| Dimensao | Avaliacao |
|----------|----------|
| Risco de data loss | NENHUM — ADD COLUMN com NULL default nao afeta dados existentes |
| Backup necessario | NAO necessario |
| Estrategia de rollback | `ALTER TABLE investments DROP COLUMN deleted_at;` |
| Janela de manutencao | NAO necessaria |
| Impacto em aplicacao | MEDIO — frontend deve ser atualizado para filtrar `deleted_at IS NULL` em queries de investments apos a migration |

---

### TD-021 — GIN indexes para full-text search

| Dimensao | Avaliacao |
|----------|----------|
| Risco de data loss | NENHUM |
| Backup necessario | NAO necessario |
| Estrategia de rollback | `DROP INDEX CONCURRENTLY idx_transactions_description_fts;` |
| Janela de manutencao | NAO necessaria se usar `CREATE INDEX CONCURRENTLY` (nao bloqueia tabela) |
| Risco operacional | BAIXO — criacao de GIN index pode ser lenta (minutos em tabelas grandes); `CONCURRENTLY` mitiga o impacto |

---

### TD-022 — Particionamento transactions

| Dimensao | Avaliacao |
|----------|----------|
| Risco de data loss | ALTO — requer migracao de dados existentes para novas particoes |
| Backup necessario | OBRIGATORIO — pg_dump completo verificado antes de iniciar |
| Estrategia de rollback | Complexa — requer restaurar backup completo |
| Janela de manutencao | SIM — janela de baixo trafego, estimativa 2-6h dependendo do volume atual |
| Prerequisito | Executar APENAS quando transactions >= 500K rows OU quando EXPLAIN ANALYZE mostrar degradacao real |
| Pre-requisito adicional | TD-001 deve estar aplicado; politicas RLS corretas devem ser re-aplicadas nas particoes apos migracao |

---

## 5. Scripts de Fix Prontos para Uso

### Script 1 — automation_logs.duration_ms → BIGINT (TD-035)

**Filename:** `supabase/migrations/20260305_automation_logs_duration_bigint.sql`

```sql
-- TD-035: automation_logs.duration_ms overflow fix
-- Converte INT para BIGINT (widening cast, sem risco de data loss)
-- Idempotente via DO block

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'automation_logs'
      AND column_name = 'duration_ms'
      AND data_type = 'integer'
  ) THEN
    ALTER TABLE automation_logs ALTER COLUMN duration_ms TYPE BIGINT;
    RAISE NOTICE 'automation_logs.duration_ms convertido para BIGINT';
  ELSE
    RAISE NOTICE 'automation_logs.duration_ms ja e BIGINT ou nao existe. Nenhuma acao necessaria.';
  END IF;
END $$;
```

---

### Script 2 — sent_atas FK constraint com limpeza de orphans (TD-003)

**Filename:** `supabase/migrations/20260305_sent_atas_fk_fix.sql`

```sql
-- TD-003: sent_atas.client_id sem FK constraint
-- Idempotente: limpa orphans antes de adicionar FK

BEGIN;

-- Passo 1: Limpar orphans (client_id com usuario inexistente em auth.users)
-- Necessario para evitar falha na adicao da FK constraint
UPDATE sent_atas
SET client_id = NULL
WHERE client_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM auth.users WHERE id = sent_atas.client_id
  );

-- Log de orphans tratados (para auditoria)
DO $$
DECLARE
  affected_rows INT;
BEGIN
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  IF affected_rows > 0 THEN
    RAISE WARNING 'sent_atas: % registros com client_id orfao foram setados para NULL', affected_rows;
  END IF;
END $$;

-- Passo 2: Adicionar FK constraint (idempotente)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'sent_atas'
      AND constraint_name = 'fk_sent_atas_client'
  ) THEN
    ALTER TABLE sent_atas
    ADD CONSTRAINT fk_sent_atas_client
      FOREIGN KEY (client_id) REFERENCES auth.users(id) ON DELETE SET NULL;
    RAISE NOTICE 'FK fk_sent_atas_client adicionada com sucesso';
  ELSE
    RAISE NOTICE 'FK fk_sent_atas_client ja existe. Nenhuma acao necessaria.';
  END IF;
END $$;

COMMIT;
```

---

### Script 3 — investments soft delete (TD-039)

**Filename:** `supabase/migrations/20260305_investments_soft_delete.sql`

```sql
-- TD-039: investments sem soft delete
-- Pre-requisito para TD-001 (RLS fix completo)
-- Idempotente via IF NOT EXISTS

-- Adicionar coluna deleted_at
ALTER TABLE investments
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Index para queries de soft delete (registros deletados)
CREATE INDEX IF NOT EXISTS idx_investments_deleted_at
  ON investments(deleted_at)
  WHERE deleted_at IS NOT NULL;

-- Index parcial para queries ativas (padrao do projeto)
CREATE INDEX IF NOT EXISTS idx_investments_user_active
  ON investments(user_id)
  WHERE deleted_at IS NULL;

-- Atualizar politica RLS SELECT para filtrar soft-deleted
-- (idempotente: DROP IF EXISTS + CREATE)
DROP POLICY IF EXISTS investments_select ON investments;
CREATE POLICY investments_select ON investments
  FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);

COMMENT ON COLUMN investments.deleted_at IS
  'Soft delete timestamp. NULL = ativo. Populado por soft_delete_user_data().';
```

---

## 6. Recomendacao Final

### Aprovacao dos debitos de DB no DRAFT

**APROVADO COM RESSALVAS**

O DRAFT captura corretamente os principais debitos de database com descricoes tecnicamente precisas e priorizacao adequada. O trabalho do @architect (Aria) na Fase 4 foi solido. As ressalvas sao especificas e acionaveis:

**Ressalva 1 (Impacto Alto): Lista de tabelas no TD-001 esta incompleta.**
A migration deve cobrir todas as tabelas com `deleted_at` acessiveis por usuarios regulares, nao apenas as 6 listadas. A correcao parcial cria falsa sensacao de seguranca.

**Ressalva 2 (Impacto Alto): TD-002 omite tabelas criticas na funcao hard_delete.**
sent_atas, category_budgets, transaction_groups, retirement_settings e patrimony_items devem estar listadas. Sem isso, o sistema nao atende completamente ao direito ao esquecimento da LGPD mesmo apos o fix.

**Ressalva 3 (Impacto Medio): TD-039 (investments sem soft delete) nao foi capturado.**
E pre-requisito tecnico para TD-001 completo. Deve ser adicionado ao inventario e executado antes de TD-001 no Sprint 1.

**Ressalva 4 (Impacto Medio): Pre-fix de orphans ausente no TD-003.**
A migration falhara em producao sem o UPDATE de limpeza na mesma transacao.

**Ressalva 5 (Impacto Baixo): TD-025 (rollback scripts) mal sequenciado.**
Rollbacks para migrations do Sprint 1 devem ser criados antes do deploy do Sprint 1, nao no Sprint 4.

---

### Confianca na estimativa de esforco total de DB

**Media**

| Debito | Estimativa DRAFT | Estimativa Revisada | Variacao |
|--------|-----------------|-------------------|---------|
| TD-001 | S (1-4h) | S (2-4h) | +1h — lista expandida de tabelas |
| TD-002 | S (1-4h) | M (4-8h) | +2-4h — Edge Function + tabelas omitidas |
| TD-003 | XS (<1h) | XS (<1h) | Confirmada |
| TD-017 | S (1-4h) | M (4-8h) | +2-4h — estrategia assincrona |
| TD-021 | S (1-4h) | S (1-4h) | Confirmada |
| TD-022 | L (16-40h) | L (16-40h) | Confirmada |
| TD-023 | S (1-4h) | S (1-4h) | Confirmada (com ressalva service_role) |
| TD-024 | S (1-4h) | S/M (2-6h) | +1-2h — views adicionais de dashboard_metrics |
| TD-025 | M (4-16h) | M (4-16h) | Confirmada, mas deve ser antecipado para Sprint 1 |
| TD-030 | S (1-4h) | S (1-4h) | Confirmada |
| TD-031 | XS (<1h) | XS (<1h) | Confirmada |
| TD-035 | XS (<1h) | XS (<1h) | Confirmada |
| TD-039 (novo) | — | XS (<2h) | Adicionado |
| **Total DB Sprint 1** | ~8-12h | ~12-18h | +4-6h |
| **Total DB todos os sprints** | ~60-100h | ~70-115h | +10-15h |

O DRAFT subestima o esforco total de DB em ~15-20%, principalmente em TD-002 e TD-017. Nao e uma distorcao critica, mas o planejamento do Sprint 1 deve ser ajustado de 8-12h para 12-18h.

---

### Comentarios para o @architect

**1. Adicionar TD-039 ao inventario oficial.**
E um pre-requisito tecnico para TD-001 completo. Severidade MEDIO, esforco XS. Deve aparecer no Sprint 1 antes de TD-001 no sequenciamento.

**2. Sprint 1 precisa de sequenciamento DB explicito.**
TD-039 deve rodar antes de TD-001 no mesmo ciclo de deploy. Considerar uma migration consolidada `20260305_sprint1_db_fixes.sql` que executa TD-039, TD-001, TD-003, TD-031 e TD-035 em ordem dentro de uma unica transacao, minimizando o numero de deployments em producao.

**3. TD-002 requer gate de seguranca dedicado.**
A funcao `hard_delete_user_data()` e a operacao mais destrutiva do sistema. Recomendo criar uma story separada com criterios de aceitacao de seguranca proprios: backup verificado antes do deploy, review de codigo da Edge Function, teste completo em staging com usuario real, log de auditoria imutavel.

**4. TD-025 (rollback scripts) deve ser antecipado para Sprint 1.**
A proposta atual coloca TD-025 no Sprint 4, mas os rollbacks mais criticos sao para as migrations do Sprint 1. Rollbacks devem acompanhar as migrations correspondentes, nao ser criados 3 sprints depois.

**5. Quatro novos debitos identificados (TD-036 a TD-040):**
Recomendo adicionar ao inventario oficial com as seguintes priorizacoes:
- TD-039: MEDIO, pre-requisito Sprint 1 (URGENTE)
- TD-036: MEDIO, Sprint 3
- TD-038: MEDIO, Sprint 5
- TD-040: MEDIO, Sprint 5
- TD-037: BAIXO, Sprint 6

**6. Verificar `restore_user_data()` antes do deploy de TD-001.**
A funcao deve usar `SECURITY DEFINER` com role adequado para nao ser afetada pelas novas politicas RLS. Verificar no codigo da funcao antes do deploy de producao.

---

> Revisao concluida em: 2026-03-05
> @data-engineer (Dara) — Brownfield Discovery Fase 5
> Veredicto: APROVADO COM RESSALVAS
> Proximo passo: @ux-design-expert (Fase 6) — QA Gate final
