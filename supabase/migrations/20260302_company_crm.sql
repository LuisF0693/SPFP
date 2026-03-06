-- Company CRM — Squads, Boards, Tasks, Members
-- Story 9.2 / EPIC-009

-- Squads (Spaces equivalente ao ClickUp)
CREATE TABLE IF NOT EXISTS company_squads (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  icon         TEXT NOT NULL DEFAULT '🏢',
  color        TEXT NOT NULL DEFAULT '#6366f1',
  description  TEXT,
  is_archived  BOOLEAN NOT NULL DEFAULT false,
  sort_order   INT NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE company_squads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own squads"
  ON company_squads FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Boards (Lists dentro de Squads)
CREATE TABLE IF NOT EXISTS company_boards (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  squad_id     UUID NOT NULL REFERENCES company_squads(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  description  TEXT,
  is_archived  BOOLEAN NOT NULL DEFAULT false,
  sort_order   INT NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE company_boards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own boards"
  ON company_boards FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Tasks (com status Kanban)
CREATE TABLE IF NOT EXISTS company_tasks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id        UUID NOT NULL REFERENCES company_boards(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT,
  status          TEXT NOT NULL DEFAULT 'TODO' CHECK (status IN ('TODO','IN_PROGRESS','REVIEW','DONE')),
  priority        TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('LOW','MEDIUM','HIGH','URGENT')),
  assignee_id     UUID REFERENCES auth.users(id),
  assignee_name   TEXT,
  assignee_avatar TEXT,
  tags            TEXT[] DEFAULT '{}',
  due_date        DATE,
  sort_order      INT NOT NULL DEFAULT 0,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE company_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own tasks"
  ON company_tasks FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Members (Agentes e usuários como membros de squads)
CREATE TABLE IF NOT EXISTS company_members (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  squad_id     UUID NOT NULL REFERENCES company_squads(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  role         TEXT NOT NULL DEFAULT 'Member',
  avatar_url   TEXT,
  is_ai_agent  BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, squad_id)
);

ALTER TABLE company_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own members"
  ON company_members FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
