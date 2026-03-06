-- Migration: 20260305_rls_soft_delete_investments.sql
-- Objetivo: Adicionar filtered `AND deleted_at IS NULL` nas politicas RLS SELECT
--           das tabelas investments e patrimony_items (extensao de TD-S1-001).
-- Referencia: TD-S1-003 | technical-debt-assessment.md TD-001 (extensao)

-- ============================================================
-- INVESTMENTS
-- ============================================================

DROP POLICY IF EXISTS "investments_select" ON public.investments;
DROP POLICY IF EXISTS "Users can view their own investments" ON public.investments;
CREATE POLICY "investments_select" ON public.investments
  FOR SELECT USING (auth.uid() = user_id);

-- Nota: investments nao possui coluna deleted_at no schema atual.
-- Adicionar a coluna e politica atualizada:

ALTER TABLE public.investments
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_investments_deleted_at ON public.investments(deleted_at);

-- Recriar policy com filtro de soft delete
DROP POLICY IF EXISTS "investments_select" ON public.investments;
CREATE POLICY "investments_select" ON public.investments
  FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);

DROP POLICY IF EXISTS "investments_update" ON public.investments;
DROP POLICY IF EXISTS "Users can update their own investments" ON public.investments;
CREATE POLICY "investments_update" ON public.investments
  FOR UPDATE USING (auth.uid() = user_id AND deleted_at IS NULL);

DROP POLICY IF EXISTS "investments_insert" ON public.investments;
DROP POLICY IF EXISTS "Users can insert their own investments" ON public.investments;
CREATE POLICY "investments_insert" ON public.investments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "investments_delete" ON public.investments;
DROP POLICY IF EXISTS "Users can delete their own investments" ON public.investments;
CREATE POLICY "investments_delete" ON public.investments
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- PATRIMONY_ITEMS
-- ============================================================

DROP POLICY IF EXISTS "patrimony_items_select" ON public.patrimony_items;
DROP POLICY IF EXISTS "Users can view their own patrimony items" ON public.patrimony_items;
CREATE POLICY "patrimony_items_select" ON public.patrimony_items
  FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);

DROP POLICY IF EXISTS "patrimony_items_update" ON public.patrimony_items;
DROP POLICY IF EXISTS "Users can update their own patrimony items" ON public.patrimony_items;
CREATE POLICY "patrimony_items_update" ON public.patrimony_items
  FOR UPDATE USING (auth.uid() = user_id AND deleted_at IS NULL);

DROP POLICY IF EXISTS "patrimony_items_insert" ON public.patrimony_items;
DROP POLICY IF EXISTS "Users can insert their own patrimony items" ON public.patrimony_items;
CREATE POLICY "patrimony_items_insert" ON public.patrimony_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "patrimony_items_delete" ON public.patrimony_items;
DROP POLICY IF EXISTS "Users can delete their own patrimony items" ON public.patrimony_items;
CREATE POLICY "patrimony_items_delete" ON public.patrimony_items
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- OPERATIONAL_TASKS
-- ============================================================

DROP POLICY IF EXISTS "operational_tasks_select" ON public.operational_tasks;
DROP POLICY IF EXISTS "Users can view their own operational tasks" ON public.operational_tasks;
CREATE POLICY "operational_tasks_select" ON public.operational_tasks
  FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);

DROP POLICY IF EXISTS "operational_tasks_update" ON public.operational_tasks;
DROP POLICY IF EXISTS "Users can update their own operational tasks" ON public.operational_tasks;
CREATE POLICY "operational_tasks_update" ON public.operational_tasks
  FOR UPDATE USING (auth.uid() = user_id AND deleted_at IS NULL);

DROP POLICY IF EXISTS "operational_tasks_insert" ON public.operational_tasks;
DROP POLICY IF EXISTS "Users can insert their own operational tasks" ON public.operational_tasks;
CREATE POLICY "operational_tasks_insert" ON public.operational_tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "operational_tasks_delete" ON public.operational_tasks;
DROP POLICY IF EXISTS "Users can delete their own operational tasks" ON public.operational_tasks;
CREATE POLICY "operational_tasks_delete" ON public.operational_tasks
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- SALES_LEADS
-- ============================================================

DROP POLICY IF EXISTS "sales_leads_select" ON public.sales_leads;
DROP POLICY IF EXISTS "Users can view their own sales leads" ON public.sales_leads;
CREATE POLICY "sales_leads_select" ON public.sales_leads
  FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);

DROP POLICY IF EXISTS "sales_leads_update" ON public.sales_leads;
DROP POLICY IF EXISTS "Users can update their own sales leads" ON public.sales_leads;
CREATE POLICY "sales_leads_update" ON public.sales_leads
  FOR UPDATE USING (auth.uid() = user_id AND deleted_at IS NULL);

DROP POLICY IF EXISTS "sales_leads_insert" ON public.sales_leads;
DROP POLICY IF EXISTS "Users can insert their own sales leads" ON public.sales_leads;
CREATE POLICY "sales_leads_insert" ON public.sales_leads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "sales_leads_delete" ON public.sales_leads;
DROP POLICY IF EXISTS "Users can delete their own sales leads" ON public.sales_leads;
CREATE POLICY "sales_leads_delete" ON public.sales_leads
  FOR DELETE USING (auth.uid() = user_id);
