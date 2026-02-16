-- ============================================
-- SPFP 2026 Database Optimizations
-- Migration: 20260216_database_optimizations.sql
-- Author: Nova (Data Engineer)
-- Purpose: Add performance indexes, soft delete, constraints, and views
-- Risk Level: LOW (additive changes only)
-- ============================================

BEGIN;

-- ============================================
-- EPIC-004: Core Fixes - Category Validation
-- ============================================

-- Prevent duplicate categories per user (case-insensitive)
ALTER TABLE categories
ADD CONSTRAINT unique_user_category_name UNIQUE(user_id, LOWER(name));

COMMENT ON CONSTRAINT unique_user_category_name ON categories IS 'Prevent duplicate category names per user (case-insensitive)';

-- ============================================
-- EPIC-001: CRM v2 - Soft Delete & Performance
-- ============================================

-- sent_atas: Add updated_at and soft delete
ALTER TABLE sent_atas
ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
ADD COLUMN deleted_at TIMESTAMPTZ;

CREATE INDEX idx_sent_atas_deleted_at ON sent_atas(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX idx_sent_atas_user_type_sent ON sent_atas(user_id, type, sent_at DESC) WHERE deleted_at IS NULL;

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS update_sent_atas_updated_at ON sent_atas;
CREATE TRIGGER update_sent_atas_updated_at
  BEFORE UPDATE ON sent_atas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- custom_templates: Ensure unique default template per type per user
ALTER TABLE custom_templates
ADD CONSTRAINT unique_default_template
UNIQUE (user_id, type) WHERE is_default = true;

COMMENT ON CONSTRAINT unique_default_template ON custom_templates IS 'Ensure only one default template per type per user';

-- user_files: Add soft delete (important for GDPR compliance)
ALTER TABLE user_files
ADD COLUMN deleted_at TIMESTAMPTZ;

CREATE INDEX idx_user_files_deleted_at ON user_files(deleted_at) WHERE deleted_at IS NOT NULL;

-- ============================================
-- EPIC-002: Corporate HQ - Soft Delete & Performance
-- ============================================

-- operational_tasks: Add soft delete and Kanban indexes
ALTER TABLE operational_tasks
ADD COLUMN deleted_at TIMESTAMPTZ;

CREATE INDEX idx_operational_tasks_deleted_at ON operational_tasks(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX idx_operational_tasks_kanban ON operational_tasks(user_id, status, position DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_operational_tasks_due_dates ON operational_tasks(user_id, due_date) WHERE status != 'done' AND deleted_at IS NULL;

-- sales_leads: Add soft delete and pipeline analysis indexes
ALTER TABLE sales_leads
ADD COLUMN deleted_at TIMESTAMPTZ;

CREATE INDEX idx_sales_leads_deleted_at ON sales_leads(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX idx_sales_leads_analysis ON sales_leads(user_id, stage, probability DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_sales_leads_value_analysis ON sales_leads(user_id, value DESC) WHERE stage NOT IN ('closed_won', 'closed_lost') AND deleted_at IS NULL;

-- corporate_activities: Add realtime-optimized indexes
CREATE INDEX idx_corporate_activities_realtime ON corporate_activities(user_id, created_at DESC, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_corporate_activities_approval ON corporate_activities(user_id, status) WHERE requires_approval = true AND approved_at IS NULL AND deleted_at IS NULL;

-- marketing_posts: Add calendar and platform indexes
CREATE INDEX idx_marketing_posts_calendar ON marketing_posts(user_id, scheduled_date DESC) WHERE status != 'rejected' AND deleted_at IS NULL;
CREATE INDEX idx_marketing_posts_by_platform ON marketing_posts(user_id, platform, status) WHERE deleted_at IS NULL;

-- ============================================
-- EPIC-003: AI Automation - Retention & Audit
-- ============================================

-- automation_logs: Add retention cleanup function
CREATE OR REPLACE FUNCTION cleanup_old_automation_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM automation_logs
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_old_automation_logs() IS 'Remove automation logs older than 90 days (to manage storage)';

-- automation_permissions: Add audit trail table
CREATE TABLE IF NOT EXISTS automation_permissions_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  changed_by VARCHAR(255) NOT NULL,
  change_type VARCHAR(50) NOT NULL CHECK (change_type IN ('enabled', 'disabled', 'whitelist_added', 'whitelist_removed', 'blacklist_added', 'blacklist_removed')),
  previous_value TEXT,
  new_value TEXT,

  CONSTRAINT fk_audit_permissions FOREIGN KEY (user_id) REFERENCES automation_permissions(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_automation_permissions_audit_user_id ON automation_permissions_audit(user_id);
CREATE INDEX idx_automation_permissions_audit_changed_at ON automation_permissions_audit(changed_at DESC);

ALTER TABLE automation_permissions_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own permission audit" ON automation_permissions_audit
  FOR SELECT USING (auth.uid() = user_id);

COMMENT ON TABLE automation_permissions_audit IS 'Audit trail for automation permission changes';

-- ============================================
-- Analytics Views
-- ============================================

-- Dashboard metrics view (daily snapshot)
CREATE OR REPLACE VIEW dashboard_metrics AS
SELECT
  user_id,
  CURRENT_DATE as metric_date,
  COUNT(DISTINCT CASE WHEN DATE(created_at) = CURRENT_DATE AND type = 'INCOME' THEN id END) as today_income_count,
  COUNT(DISTINCT CASE WHEN DATE(created_at) = CURRENT_DATE AND type = 'EXPENSE' THEN id END) as today_expense_count,
  COALESCE(SUM(CASE WHEN type = 'INCOME' AND deleted_at IS NULL THEN amount ELSE 0 END), 0) as total_income,
  COALESCE(SUM(CASE WHEN type = 'EXPENSE' AND deleted_at IS NULL THEN amount ELSE 0 END), 0) as total_expense,
  COALESCE(SUM(CASE WHEN type = 'INCOME' AND deleted_at IS NULL THEN amount ELSE 0 END), 0) -
  COALESCE(SUM(CASE WHEN type = 'EXPENSE' AND deleted_at IS NULL THEN amount ELSE 0 END), 0) as net_today
FROM transactions
WHERE deleted_at IS NULL
GROUP BY user_id;

-- CRM health check view
CREATE OR REPLACE VIEW crm_health_check AS
SELECT
  user_id,
  COUNT(DISTINCT client_id) as unique_clients,
  COUNT(DISTINCT type) as ata_types_used,
  COUNT(*) as total_atas_sent,
  MAX(sent_at) as last_ata_sent,
  COUNT(DISTINCT CASE WHEN DATE(sent_at) >= CURRENT_DATE - INTERVAL '30 days' THEN id END) as atas_last_30_days
FROM sent_atas
WHERE deleted_at IS NULL
GROUP BY user_id;

-- Corporate activities health check
CREATE OR REPLACE VIEW corporate_health_check AS
SELECT
  user_id,
  COUNT(DISTINCT department) as departments_active,
  COUNT(DISTINCT status) as status_types_used,
  COUNT(*) as total_activities,
  SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_activities,
  SUM(CASE WHEN requires_approval = true AND approved_at IS NULL THEN 1 ELSE 0 END) as pending_approvals,
  MAX(created_at) as last_activity
FROM corporate_activities
WHERE deleted_at IS NULL
GROUP BY user_id;

-- Sales pipeline health check
CREATE OR REPLACE VIEW sales_health_check AS
SELECT
  user_id,
  COUNT(*) as total_leads,
  SUM(CASE WHEN stage = 'prospecting' THEN 1 ELSE 0 END) as prospecting_count,
  SUM(CASE WHEN stage IN ('qualification', 'proposal', 'negotiation') THEN 1 ELSE 0 END) as active_count,
  SUM(CASE WHEN stage = 'closed_won' THEN 1 ELSE 0 END) as won_count,
  SUM(CASE WHEN stage = 'closed_lost' THEN 1 ELSE 0 END) as lost_count,
  COALESCE(SUM(CASE WHEN stage != 'closed_lost' THEN value ELSE 0 END), 0) as pipeline_value,
  COALESCE(AVG(CASE WHEN stage != 'closed_won' AND stage != 'closed_lost' THEN probability ELSE NULL END), 0) as avg_probability,
  MAX(updated_at) as last_update
FROM sales_leads
WHERE deleted_at IS NULL
GROUP BY user_id;

-- Operational health check
CREATE OR REPLACE VIEW operational_health_check AS
SELECT
  user_id,
  COUNT(*) as total_tasks,
  SUM(CASE WHEN status = 'todo' THEN 1 ELSE 0 END) as todo_count,
  SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_count,
  SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) as done_count,
  SUM(CASE WHEN priority = 'high' AND status != 'done' THEN 1 ELSE 0 END) as high_priority_open,
  SUM(CASE WHEN due_date < CURRENT_DATE AND status != 'done' THEN 1 ELSE 0 END) as overdue_count,
  MAX(updated_at) as last_update
FROM operational_tasks
WHERE deleted_at IS NULL
GROUP BY user_id;

-- Marketing health check
CREATE OR REPLACE VIEW marketing_health_check AS
SELECT
  user_id,
  COUNT(*) as total_posts,
  SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft_count,
  SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_approval_count,
  SUM(CASE WHEN status = 'posted' THEN 1 ELSE 0 END) as posted_count,
  SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_count,
  COUNT(DISTINCT platform) as platforms_used,
  COUNT(DISTINCT CASE WHEN scheduled_date >= CURRENT_DATE THEN id END) as upcoming_posts
FROM marketing_posts
WHERE deleted_at IS NULL
GROUP BY user_id;

-- ============================================
-- Composite Indexes for Common Queries
-- ============================================

-- transactions: Composite for date-range queries
CREATE INDEX IF NOT EXISTS idx_transactions_user_date_paid
ON transactions(user_id, date DESC, paid)
WHERE deleted_at IS NULL;

-- accounts: Composite for balance queries
CREATE INDEX IF NOT EXISTS idx_accounts_user_type
ON accounts(user_id, type)
WHERE deleted_at IS NULL;

-- categories: Composite for ordered lists
CREATE INDEX IF NOT EXISTS idx_categories_user_order
ON categories(user_id, order_index ASC)
WHERE deleted_at IS NULL;

-- goals: Composite for deadline-based queries
CREATE INDEX IF NOT EXISTS idx_goals_user_deadline
ON goals(user_id, deadline)
WHERE deleted_at IS NULL;

-- partnerships: Composite for revenue analysis
CREATE INDEX IF NOT EXISTS idx_partnership_clients_closed
ON partnership_clients(user_id, closed_at)
WHERE status = 'paid' AND closed_at IS NOT NULL;

-- ============================================
-- Comments & Documentation
-- ============================================

COMMENT ON SCHEMA public IS 'SPFP 2026 Main Schema - Personal Financial Planning & AI Insights';

COMMENT ON INDEX idx_sent_atas_user_type_sent IS 'Optimize queries filtering atas by type with ordering by sent_at';
COMMENT ON INDEX idx_operational_tasks_kanban IS 'Optimize Kanban board queries (status filtering + position ordering)';
COMMENT ON INDEX idx_corporate_activities_realtime IS 'Optimize realtime feed subscriptions with time-series ordering';
COMMENT ON INDEX idx_sales_leads_analysis IS 'Optimize pipeline analytics (stage grouping + probability weighting)';
COMMENT ON INDEX idx_marketing_posts_calendar IS 'Optimize calendar view queries (scheduled_date ordering)';

-- ============================================
-- Migration Success
-- ============================================

SELECT 'Database optimizations completed successfully!' AS status;

COMMIT;
