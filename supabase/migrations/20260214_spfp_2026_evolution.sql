-- ============================================
-- SPFP 2026 Evolution - Consolidated Migration
-- Migration: 20260214_spfp_2026_evolution.sql
-- Épicos: EPIC-001, EPIC-002, EPIC-003
-- ============================================

-- ============================================
-- EPIC-001: CRM v2
-- ============================================

-- Atas enviadas (reunião e investimentos)
CREATE TABLE IF NOT EXISTS sent_atas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID,
  client_name VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('reuniao', 'investimentos')),
  channel VARCHAR(20) NOT NULL CHECK (channel IN ('email', 'whatsapp')),
  content TEXT NOT NULL,
  recipient VARCHAR(255) NOT NULL,
  subject VARCHAR(255),
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sent_atas_user_id ON sent_atas(user_id);
CREATE INDEX IF NOT EXISTS idx_sent_atas_client_id ON sent_atas(client_id);
CREATE INDEX IF NOT EXISTS idx_sent_atas_type ON sent_atas(type);
CREATE INDEX IF NOT EXISTS idx_sent_atas_sent_at ON sent_atas(sent_at DESC);

ALTER TABLE sent_atas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own atas" ON sent_atas
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own atas" ON sent_atas
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own atas" ON sent_atas
  FOR DELETE USING (auth.uid() = user_id);

-- Templates customizados de atas
CREATE TABLE IF NOT EXISTS custom_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('reuniao', 'investimentos')),
  name VARCHAR(100) NOT NULL DEFAULT 'Meu Template',
  content TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_custom_templates_user_id ON custom_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_templates_type ON custom_templates(type);

ALTER TABLE custom_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own templates" ON custom_templates
  FOR ALL USING (auth.uid() = user_id);

-- Arquivos do usuário (metadata para Supabase Storage)
CREATE TABLE IF NOT EXISTS user_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('investimentos', 'planejamento', 'educacional', 'outros', 'screenshots')),
  storage_path VARCHAR(500) NOT NULL,
  size_bytes INTEGER NOT NULL CHECK (size_bytes > 0 AND size_bytes <= 10485760), -- Max 10MB
  mime_type VARCHAR(100) NOT NULL,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_files_user_id ON user_files(user_id);
CREATE INDEX IF NOT EXISTS idx_user_files_category ON user_files(category);
CREATE INDEX IF NOT EXISTS idx_user_files_is_favorite ON user_files(is_favorite);

ALTER TABLE user_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own files" ON user_files
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- EPIC-002: Corporate HQ
-- ============================================

-- Atividades do feed (Pipeline Feed)
CREATE TABLE IF NOT EXISTS corporate_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  department VARCHAR(20) NOT NULL CHECK (department IN ('financeiro', 'marketing', 'operacional', 'comercial')),
  agent_name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'idle', 'waiting', 'completed', 'error')),
  requires_approval BOOLEAN DEFAULT FALSE,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_corporate_activities_user_id ON corporate_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_corporate_activities_department ON corporate_activities(department);
CREATE INDEX IF NOT EXISTS idx_corporate_activities_status ON corporate_activities(status);
CREATE INDEX IF NOT EXISTS idx_corporate_activities_created_at ON corporate_activities(created_at DESC);

ALTER TABLE corporate_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own activities" ON corporate_activities
  FOR ALL USING (auth.uid() = user_id);

-- Posts de marketing
CREATE TABLE IF NOT EXISTS marketing_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  platform VARCHAR(20) NOT NULL CHECK (platform IN ('instagram', 'linkedin', 'tiktok', 'youtube', 'twitter', 'facebook', 'other')),
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'posted', 'rejected')),
  scheduled_date DATE,
  posted_date TIMESTAMPTZ,
  image_url VARCHAR(500),
  metrics JSONB DEFAULT '{}',
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_marketing_posts_user_id ON marketing_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_marketing_posts_status ON marketing_posts(status);
CREATE INDEX IF NOT EXISTS idx_marketing_posts_platform ON marketing_posts(platform);
CREATE INDEX IF NOT EXISTS idx_marketing_posts_scheduled_date ON marketing_posts(scheduled_date);

ALTER TABLE marketing_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own posts" ON marketing_posts
  FOR ALL USING (auth.uid() = user_id);

-- Tarefas operacionais (Kanban)
CREATE TABLE IF NOT EXISTS operational_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
  priority VARCHAR(10) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  assignee VARCHAR(100),
  due_date DATE,
  completed_at TIMESTAMPTZ,
  position INTEGER NOT NULL DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_operational_tasks_user_id ON operational_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_operational_tasks_status ON operational_tasks(status);
CREATE INDEX IF NOT EXISTS idx_operational_tasks_priority ON operational_tasks(priority);
CREATE INDEX IF NOT EXISTS idx_operational_tasks_due_date ON operational_tasks(due_date);

ALTER TABLE operational_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own tasks" ON operational_tasks
  FOR ALL USING (auth.uid() = user_id);

-- Leads comerciais (Sales Pipeline)
CREATE TABLE IF NOT EXISTS sales_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  stage VARCHAR(20) NOT NULL DEFAULT 'prospecting' CHECK (stage IN ('prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost')),
  value DECIMAL(18, 2) NOT NULL DEFAULT 0 CHECK (value >= 0),
  probability INTEGER NOT NULL DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
  source VARCHAR(100),
  notes TEXT,
  next_action TEXT,
  next_action_date DATE,
  position INTEGER NOT NULL DEFAULT 0,
  lost_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_sales_leads_user_id ON sales_leads(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_leads_stage ON sales_leads(stage);
CREATE INDEX IF NOT EXISTS idx_sales_leads_next_action_date ON sales_leads(next_action_date);
CREATE INDEX IF NOT EXISTS idx_sales_leads_value ON sales_leads(value DESC);

ALTER TABLE sales_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own leads" ON sales_leads
  FOR ALL USING (auth.uid() = user_id);

-- Metas comerciais
CREATE TABLE IF NOT EXISTS sales_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month DATE NOT NULL,
  target_value DECIMAL(18, 2) NOT NULL CHECK (target_value >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, month)
);

CREATE INDEX IF NOT EXISTS idx_sales_goals_user_id ON sales_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_goals_month ON sales_goals(month);

ALTER TABLE sales_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own goals" ON sales_goals
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- EPIC-003: AI Automation
-- ============================================

-- Log de ações de automação
CREATE TABLE IF NOT EXISTS automation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type VARCHAR(50) NOT NULL CHECK (action_type IN ('screenshot', 'navigate', 'click', 'fill', 'select', 'scroll')),
  target_url VARCHAR(2000),
  selector VARCHAR(500),
  value TEXT,
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'running', 'success', 'error')),
  error_message TEXT,
  screenshot_path VARCHAR(500),
  duration_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_automation_logs_user_id ON automation_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_automation_logs_action_type ON automation_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_automation_logs_status ON automation_logs(status);
CREATE INDEX IF NOT EXISTS idx_automation_logs_created_at ON automation_logs(created_at DESC);

ALTER TABLE automation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own automation logs" ON automation_logs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own automation logs" ON automation_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Configurações de permissões de automação
CREATE TABLE IF NOT EXISTS automation_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT FALSE,
  require_confirmation BOOLEAN DEFAULT TRUE,
  allowed_domains TEXT[] DEFAULT '{}',
  blocked_domains TEXT[] DEFAULT ARRAY['*.bank.*', '*.gov.*', 'login.*'],
  max_actions_per_hour INTEGER DEFAULT 100,
  allow_navigation BOOLEAN DEFAULT TRUE,
  allow_clicks BOOLEAN DEFAULT FALSE,
  allow_typing BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE automation_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own permissions" ON automation_permissions
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- Triggers para updated_at
-- ============================================

-- Função já deve existir, mas criar se não existir
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar triggers
DROP TRIGGER IF EXISTS update_custom_templates_updated_at ON custom_templates;
CREATE TRIGGER update_custom_templates_updated_at
  BEFORE UPDATE ON custom_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_marketing_posts_updated_at ON marketing_posts;
CREATE TRIGGER update_marketing_posts_updated_at
  BEFORE UPDATE ON marketing_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_operational_tasks_updated_at ON operational_tasks;
CREATE TRIGGER update_operational_tasks_updated_at
  BEFORE UPDATE ON operational_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sales_leads_updated_at ON sales_leads;
CREATE TRIGGER update_sales_leads_updated_at
  BEFORE UPDATE ON sales_leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_automation_permissions_updated_at ON automation_permissions;
CREATE TRIGGER update_automation_permissions_updated_at
  BEFORE UPDATE ON automation_permissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Views úteis
-- ============================================

-- View: Resumo de leads por estágio
CREATE OR REPLACE VIEW sales_pipeline_summary AS
SELECT
  user_id,
  stage,
  COUNT(*) as lead_count,
  SUM(value) as total_value,
  AVG(probability) as avg_probability
FROM sales_leads
WHERE stage NOT IN ('closed_won', 'closed_lost')
GROUP BY user_id, stage;

-- View: Resumo de tarefas por status
CREATE OR REPLACE VIEW tasks_summary AS
SELECT
  user_id,
  status,
  COUNT(*) as task_count,
  COUNT(*) FILTER (WHERE priority = 'high') as high_priority_count,
  COUNT(*) FILTER (WHERE due_date < CURRENT_DATE AND status != 'done') as overdue_count
FROM operational_tasks
GROUP BY user_id, status;

-- View: Posts por plataforma
CREATE OR REPLACE VIEW posts_by_platform AS
SELECT
  user_id,
  platform,
  COUNT(*) as total_posts,
  COUNT(*) FILTER (WHERE status = 'posted') as posted_count,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_count
FROM marketing_posts
GROUP BY user_id, platform;

-- ============================================
-- Comentários
-- ============================================

COMMENT ON TABLE sent_atas IS 'SPFP 2026 EPIC-001 - Histórico de atas enviadas por email/whatsapp';
COMMENT ON TABLE custom_templates IS 'SPFP 2026 EPIC-001 - Templates customizados de atas';
COMMENT ON TABLE user_files IS 'SPFP 2026 EPIC-001 - Metadata de arquivos no Supabase Storage';
COMMENT ON TABLE corporate_activities IS 'SPFP 2026 EPIC-002 - Feed de atividades do escritório virtual';
COMMENT ON TABLE marketing_posts IS 'SPFP 2026 EPIC-002 - Posts de marketing (calendário)';
COMMENT ON TABLE operational_tasks IS 'SPFP 2026 EPIC-002 - Tarefas operacionais (Kanban)';
COMMENT ON TABLE sales_leads IS 'SPFP 2026 EPIC-002 - Leads comerciais (Pipeline de vendas)';
COMMENT ON TABLE sales_goals IS 'SPFP 2026 EPIC-002 - Metas comerciais mensais';
COMMENT ON TABLE automation_logs IS 'SPFP 2026 EPIC-003 - Log de ações de automação MCP';
COMMENT ON TABLE automation_permissions IS 'SPFP 2026 EPIC-003 - Permissões de automação por usuário';

-- ============================================
-- Success
-- ============================================
SELECT 'SPFP 2026 Evolution migration completed successfully!' AS status;
