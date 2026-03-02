-- EPIC-010: Schema Supabase para acesso de Agentes IA
-- Story 10.1

-- Comentários de tasks (agentes e humanos)
CREATE TABLE IF NOT EXISTS task_comments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id      UUID NOT NULL REFERENCES company_tasks(id) ON DELETE CASCADE,
  author_id    TEXT NOT NULL,       -- agent ID (ex: 'agent-marketing') ou user UUID
  author_name  TEXT NOT NULL,
  author_avatar TEXT,
  content      TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;

-- Agentes usam service_role; usuários leem/escrevem os próprios
CREATE POLICY "Service role full access on task_comments"
  ON task_comments FOR ALL
  TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Users read task comments"
  ON task_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM company_tasks ct
      WHERE ct.id = task_comments.task_id AND ct.user_id = auth.uid()
    )
  );

CREATE POLICY "Users insert task comments"
  ON task_comments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM company_tasks ct
      WHERE ct.id = task_id AND ct.user_id = auth.uid()
    )
  );

-- Log de atividade dos agentes
CREATE TABLE IF NOT EXISTS task_activity_log (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id      UUID NOT NULL REFERENCES company_tasks(id) ON DELETE CASCADE,
  agent_id     TEXT NOT NULL,
  agent_name   TEXT NOT NULL,
  action_type  TEXT NOT NULL CHECK (action_type IN ('created','status_changed','commented','assigned','completed')),
  old_value    TEXT,
  new_value    TEXT,
  payload      JSONB,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE task_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on activity_log"
  ON task_activity_log FOR ALL
  TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Users read activity log for their tasks"
  ON task_activity_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM company_tasks ct
      WHERE ct.id = task_activity_log.task_id AND ct.user_id = auth.uid()
    )
  );

-- Garantir service_role acessa company_tasks e company_boards
CREATE POLICY "Service role full access on company_tasks"
  ON company_tasks FOR ALL
  TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on company_boards"
  ON company_boards FOR ALL
  TO service_role USING (true) WITH CHECK (true);

-- RPC: Criar task via agente
CREATE OR REPLACE FUNCTION create_agent_task(
  p_board_id    UUID,
  p_title       TEXT,
  p_assignee_id TEXT DEFAULT NULL,
  p_assignee_name TEXT DEFAULT NULL,
  p_priority    TEXT DEFAULT 'MEDIUM',
  p_description TEXT DEFAULT NULL,
  p_agent_id    TEXT DEFAULT 'agent-system',
  p_agent_name  TEXT DEFAULT 'Sistema'
) RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_task_id UUID;
  v_user_id UUID;
BEGIN
  -- Pega o user_id do board
  SELECT user_id INTO v_user_id FROM company_boards WHERE id = p_board_id;

  INSERT INTO company_tasks (
    board_id, user_id, title, description, status, priority,
    assignee_id, assignee_name, sort_order
  ) VALUES (
    p_board_id, v_user_id, p_title, p_description, 'TODO',
    UPPER(p_priority), p_assignee_id, p_assignee_name,
    (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM company_tasks WHERE board_id = p_board_id)
  ) RETURNING id INTO v_task_id;

  -- Log de atividade
  INSERT INTO task_activity_log (task_id, agent_id, agent_name, action_type, new_value)
  VALUES (v_task_id, p_agent_id, p_agent_name, 'created', p_title);

  RETURN v_task_id;
END;
$$;

-- RPC: Atualizar status de task via agente
CREATE OR REPLACE FUNCTION update_task_status(
  p_task_id     UUID,
  p_new_status  TEXT,
  p_agent_id    TEXT DEFAULT 'agent-system',
  p_agent_name  TEXT DEFAULT 'Sistema',
  p_comment     TEXT DEFAULT NULL
) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_old_status TEXT;
BEGIN
  SELECT status INTO v_old_status FROM company_tasks WHERE id = p_task_id;

  UPDATE company_tasks
  SET status = UPPER(p_new_status), updated_at = now()
  WHERE id = p_task_id;

  -- Log de atividade
  INSERT INTO task_activity_log (task_id, agent_id, agent_name, action_type, old_value, new_value)
  VALUES (p_task_id, p_agent_id, p_agent_name, 'status_changed', v_old_status, UPPER(p_new_status));

  -- Comentário opcional
  IF p_comment IS NOT NULL THEN
    INSERT INTO task_comments (task_id, author_id, author_name, content)
    VALUES (p_task_id, p_agent_id, p_agent_name, p_comment);

    INSERT INTO task_activity_log (task_id, agent_id, agent_name, action_type, new_value)
    VALUES (p_task_id, p_agent_id, p_agent_name, 'commented', p_comment);
  END IF;
END;
$$;

-- View: Dashboard por agente
CREATE OR REPLACE VIEW agent_dashboard AS
SELECT
  ct.assignee_id,
  ct.assignee_name,
  ct.status,
  COUNT(*) as task_count,
  MIN(ct.due_date) as next_due_date
FROM company_tasks ct
WHERE ct.assignee_id IS NOT NULL
GROUP BY ct.assignee_id, ct.assignee_name, ct.status
ORDER BY ct.assignee_name, ct.status;

GRANT SELECT ON agent_dashboard TO service_role, authenticated;
