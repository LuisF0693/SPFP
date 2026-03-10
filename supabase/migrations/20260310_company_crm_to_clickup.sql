-- Migration: Company CRM → ClickUp Sync
-- Data: 2026-03-10
-- Remove estrutura interna de CRM (company_squads, boards, members)
-- Adapta company_tasks → clickup_tasks com campos de sync do ClickUp
-- Mantém: company_revenue, company_products, webhook_logs, social_credentials

-- ============================================================
-- STEP 1: Remover FK de company_tasks → company_boards
--         antes de dropar os boards/squads
-- ============================================================

ALTER TABLE company_tasks
  DROP CONSTRAINT IF EXISTS company_tasks_board_id_fkey;

-- ============================================================
-- STEP 2: Drop tabelas obsoletas (CRM interno)
-- ============================================================

DROP TABLE IF EXISTS company_members CASCADE;
DROP TABLE IF EXISTS company_boards CASCADE;
DROP TABLE IF EXISTS company_squads CASCADE;

-- ============================================================
-- STEP 3: Rename company_tasks → clickup_tasks
-- ============================================================

ALTER TABLE company_tasks RENAME TO clickup_tasks;

-- Remover coluna board_id (era FK para company_boards, agora obsoleta)
ALTER TABLE clickup_tasks DROP COLUMN IF EXISTS board_id;

-- Remover CHECK constraints que limitavam status e priority
-- (ClickUp tem status customizados — não podemos restringir)
ALTER TABLE clickup_tasks DROP CONSTRAINT IF EXISTS company_tasks_status_check;
ALTER TABLE clickup_tasks DROP CONSTRAINT IF EXISTS company_tasks_priority_check;
ALTER TABLE clickup_tasks DROP CONSTRAINT IF EXISTS clickup_tasks_status_check;
ALTER TABLE clickup_tasks DROP CONSTRAINT IF EXISTS clickup_tasks_priority_check;

-- Adicionar colunas de sync com ClickUp
ALTER TABLE clickup_tasks
  ADD COLUMN IF NOT EXISTS clickup_task_id  TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS clickup_list_id  TEXT,
  ADD COLUMN IF NOT EXISTS clickup_space_id TEXT,
  ADD COLUMN IF NOT EXISTS clickup_url      TEXT,
  ADD COLUMN IF NOT EXISTS clickup_status   TEXT;   -- status raw do ClickUp (ex: "in progress", "complete")

-- Atualizar políticas RLS para o nome novo
DROP POLICY IF EXISTS "Users manage own tasks" ON clickup_tasks;
DROP POLICY IF EXISTS "Service role full access on company_tasks" ON clickup_tasks;

CREATE POLICY "Users manage own tasks"
  ON clickup_tasks FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role full access on clickup_tasks"
  ON clickup_tasks FOR ALL
  TO service_role USING (true) WITH CHECK (true);

-- ============================================================
-- STEP 4: Rename task_activity_log → clickup_activity_log
-- ============================================================

ALTER TABLE task_activity_log RENAME TO clickup_activity_log;

-- Remover CHECK de action_type para suportar eventos do ClickUp
ALTER TABLE clickup_activity_log
  DROP CONSTRAINT IF EXISTS task_activity_log_action_type_check;

ALTER TABLE clickup_activity_log
  ADD COLUMN IF NOT EXISTS clickup_event TEXT;  -- evento bruto do ClickUp webhook

-- ============================================================
-- STEP 5: Drop RPCs e Views do CRM interno
-- ============================================================

DROP FUNCTION IF EXISTS create_agent_task(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS update_task_status(UUID, TEXT, TEXT, TEXT, TEXT);
DROP VIEW IF EXISTS agent_dashboard;

-- ============================================================
-- STEP 6: Criar tabela clickup_webhook_events
--         Recebe e processa webhooks do ClickUp em tempo real
-- ============================================================

CREATE TABLE IF NOT EXISTS clickup_webhook_events (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID        REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type       TEXT        NOT NULL,   -- ex: 'taskCreated', 'taskUpdated', 'taskStatusUpdated'
  clickup_task_id  TEXT,
  clickup_list_id  TEXT,
  clickup_space_id TEXT,
  payload          JSONB       NOT NULL DEFAULT '{}',
  processed        BOOLEAN     NOT NULL DEFAULT false,
  error            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE clickup_webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on clickup_webhook_events"
  ON clickup_webhook_events FOR ALL
  TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Users read own webhook events"
  ON clickup_webhook_events FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================
-- STEP 7: Criar tabela clickup_sync_state
--         Controla estado da última sincronização por usuário
-- ============================================================

CREATE TABLE IF NOT EXISTS clickup_sync_state (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_sync_at  TIMESTAMPTZ,
  sync_cursor   TEXT,        -- token/cursor de paginação do ClickUp
  status        TEXT        NOT NULL DEFAULT 'idle',
  error         TEXT,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

ALTER TABLE clickup_sync_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own sync state"
  ON clickup_sync_state FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- STEP 8: Adicionar referência ao ClickUp em marketing_content
-- ============================================================

ALTER TABLE marketing_content
  ADD COLUMN IF NOT EXISTS clickup_task_id  TEXT,
  ADD COLUMN IF NOT EXISTS clickup_list_id  TEXT;

-- ============================================================
-- STEP 9: Indexes de performance
-- ============================================================

CREATE INDEX IF NOT EXISTS clickup_tasks_clickup_task_id_idx
  ON clickup_tasks (clickup_task_id)
  WHERE clickup_task_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS clickup_tasks_user_id_idx
  ON clickup_tasks (user_id);

CREATE INDEX IF NOT EXISTS clickup_tasks_clickup_list_id_idx
  ON clickup_tasks (clickup_list_id)
  WHERE clickup_list_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS clickup_webhook_events_processed_idx
  ON clickup_webhook_events (processed, created_at DESC);

CREATE INDEX IF NOT EXISTS clickup_webhook_events_task_id_idx
  ON clickup_webhook_events (clickup_task_id)
  WHERE clickup_task_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS clickup_sync_state_user_id_idx
  ON clickup_sync_state (user_id);

-- ============================================================
-- STEP 10: View clickup_task_summary (substitui agent_dashboard)
-- ============================================================

CREATE OR REPLACE VIEW clickup_task_summary AS
SELECT
  ct.user_id,
  ct.clickup_space_id,
  ct.clickup_list_id,
  ct.status,
  ct.priority,
  COUNT(*)                    AS task_count,
  COUNT(*) FILTER (WHERE ct.status IN ('DONE', 'complete', 'closed')) AS done_count,
  MIN(ct.due_date)            AS next_due_date
FROM clickup_tasks ct
GROUP BY ct.user_id, ct.clickup_space_id, ct.clickup_list_id, ct.status, ct.priority
ORDER BY ct.user_id, ct.clickup_list_id, ct.status;

GRANT SELECT ON clickup_task_summary TO service_role, authenticated;
