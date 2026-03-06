-- Migration: 20260305_rls_soft_delete_fix.sql
-- Objetivo: Adicionar filtro `AND deleted_at IS NULL` nas politicas RLS SELECT
--           das tabelas core para que registros soft-deleted nao sejam expostos
--           via queries diretas ao Supabase SDK ou REST API.
-- Tabelas: accounts, transactions, categories, goals, transaction_groups, category_budgets
-- Referencia: TD-S1-001 | DB-AUDIT.md Issue #2 | technical-debt-assessment.md TD-001

-- ============================================================
-- ACCOUNTS
-- ============================================================

-- SELECT: ocultar soft-deleted
DROP POLICY IF EXISTS "accounts_select" ON public.accounts;
DROP POLICY IF EXISTS "Users can view their own accounts" ON public.accounts;
CREATE POLICY "accounts_select" ON public.accounts
  FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);

-- UPDATE: nao permitir modificar registros ja deletados
DROP POLICY IF EXISTS "accounts_update" ON public.accounts;
DROP POLICY IF EXISTS "Users can update their own accounts" ON public.accounts;
CREATE POLICY "accounts_update" ON public.accounts
  FOR UPDATE USING (auth.uid() = user_id AND deleted_at IS NULL);

-- INSERT: sem alteracao (deleted_at nao se aplica a inserts)
DROP POLICY IF EXISTS "accounts_insert" ON public.accounts;
DROP POLICY IF EXISTS "Users can insert their own accounts" ON public.accounts;
CREATE POLICY "accounts_insert" ON public.accounts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- DELETE: manter para permitir soft delete (UPDATE de deleted_at) e hard delete admin
DROP POLICY IF EXISTS "accounts_delete" ON public.accounts;
DROP POLICY IF EXISTS "Users can delete their own accounts" ON public.accounts;
CREATE POLICY "accounts_delete" ON public.accounts
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- TRANSACTIONS
-- ============================================================

DROP POLICY IF EXISTS "transactions_select" ON public.transactions;
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;
CREATE POLICY "transactions_select" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);

DROP POLICY IF EXISTS "transactions_update" ON public.transactions;
DROP POLICY IF EXISTS "Users can update their own transactions" ON public.transactions;
CREATE POLICY "transactions_update" ON public.transactions
  FOR UPDATE USING (auth.uid() = user_id AND deleted_at IS NULL);

DROP POLICY IF EXISTS "transactions_insert" ON public.transactions;
DROP POLICY IF EXISTS "Users can insert their own transactions" ON public.transactions;
CREATE POLICY "transactions_insert" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "transactions_delete" ON public.transactions;
DROP POLICY IF EXISTS "Users can delete their own transactions" ON public.transactions;
CREATE POLICY "transactions_delete" ON public.transactions
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- CATEGORIES
-- ============================================================

DROP POLICY IF EXISTS "categories_select" ON public.categories;
DROP POLICY IF EXISTS "Users can view their own categories" ON public.categories;
CREATE POLICY "categories_select" ON public.categories
  FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);

DROP POLICY IF EXISTS "categories_update" ON public.categories;
DROP POLICY IF EXISTS "Users can update their own categories" ON public.categories;
CREATE POLICY "categories_update" ON public.categories
  FOR UPDATE USING (auth.uid() = user_id AND deleted_at IS NULL);

DROP POLICY IF EXISTS "categories_insert" ON public.categories;
DROP POLICY IF EXISTS "Users can insert their own categories" ON public.categories;
CREATE POLICY "categories_insert" ON public.categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "categories_delete" ON public.categories;
DROP POLICY IF EXISTS "Users can delete their own categories" ON public.categories;
CREATE POLICY "categories_delete" ON public.categories
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- GOALS
-- ============================================================

DROP POLICY IF EXISTS "goals_select" ON public.goals;
DROP POLICY IF EXISTS "Users can view their own goals" ON public.goals;
CREATE POLICY "goals_select" ON public.goals
  FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);

DROP POLICY IF EXISTS "goals_update" ON public.goals;
DROP POLICY IF EXISTS "Users can update their own goals" ON public.goals;
CREATE POLICY "goals_update" ON public.goals
  FOR UPDATE USING (auth.uid() = user_id AND deleted_at IS NULL);

DROP POLICY IF EXISTS "goals_insert" ON public.goals;
DROP POLICY IF EXISTS "Users can insert their own goals" ON public.goals;
CREATE POLICY "goals_insert" ON public.goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "goals_delete" ON public.goals;
DROP POLICY IF EXISTS "Users can delete their own goals" ON public.goals;
CREATE POLICY "goals_delete" ON public.goals
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- TRANSACTION_GROUPS
-- ============================================================

DROP POLICY IF EXISTS "transaction_groups_select" ON public.transaction_groups;
DROP POLICY IF EXISTS "Users can view their own transaction groups" ON public.transaction_groups;
CREATE POLICY "transaction_groups_select" ON public.transaction_groups
  FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);

DROP POLICY IF EXISTS "transaction_groups_update" ON public.transaction_groups;
DROP POLICY IF EXISTS "Users can update their own transaction groups" ON public.transaction_groups;
CREATE POLICY "transaction_groups_update" ON public.transaction_groups
  FOR UPDATE USING (auth.uid() = user_id AND deleted_at IS NULL);

DROP POLICY IF EXISTS "transaction_groups_insert" ON public.transaction_groups;
DROP POLICY IF EXISTS "Users can insert their own transaction groups" ON public.transaction_groups;
CREATE POLICY "transaction_groups_insert" ON public.transaction_groups
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "transaction_groups_delete" ON public.transaction_groups;
DROP POLICY IF EXISTS "Users can delete their own transaction groups" ON public.transaction_groups;
CREATE POLICY "transaction_groups_delete" ON public.transaction_groups
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- CATEGORY_BUDGETS
-- ============================================================

DROP POLICY IF EXISTS "category_budgets_select" ON public.category_budgets;
DROP POLICY IF EXISTS "Users can view their own category budgets" ON public.category_budgets;
CREATE POLICY "category_budgets_select" ON public.category_budgets
  FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);

DROP POLICY IF EXISTS "category_budgets_update" ON public.category_budgets;
DROP POLICY IF EXISTS "Users can update their own category budgets" ON public.category_budgets;
CREATE POLICY "category_budgets_update" ON public.category_budgets
  FOR UPDATE USING (auth.uid() = user_id AND deleted_at IS NULL);

DROP POLICY IF EXISTS "category_budgets_insert" ON public.category_budgets;
DROP POLICY IF EXISTS "Users can insert their own category budgets" ON public.category_budgets;
CREATE POLICY "category_budgets_insert" ON public.category_budgets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "category_budgets_delete" ON public.category_budgets;
DROP POLICY IF EXISTS "Users can delete their own category budgets" ON public.category_budgets;
CREATE POLICY "category_budgets_delete" ON public.category_budgets
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- VERIFICACAO: registros soft-deleted nao retornam via SDK
-- Executar manualmente apos aplicar a migration:
--
-- SELECT id FROM accounts WHERE auth.uid() = user_id AND deleted_at IS NOT NULL;
-- (deve retornar 0 registros para qualquer usuario autenticado)
-- ============================================================
