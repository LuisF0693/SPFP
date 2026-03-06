-- Migration: 20260305_hard_delete_user_data.sql
-- Objetivo: Implementar funcao hard_delete_user_data() para atender ao direito
--           ao esquecimento da LGPD (Art. 18, VI — Lei 13.709/2018).
-- Referencia: TD-S1-002 | DB-AUDIT.md Secao 7.1 | technical-debt-assessment.md TD-002

-- ============================================================
-- FUNCAO: hard_delete_user_data
-- Deleta permanentemente TODOS os dados pessoais de um usuario.
-- Acessivel apenas via service_role (Edge Function delete-account).
-- ============================================================

CREATE OR REPLACE FUNCTION public.hard_delete_user_data(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted_counts JSONB := '{}';
  v_count INTEGER;
BEGIN
  -- Validar que o user_id foi fornecido
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'user_id nao pode ser nulo';
  END IF;

  -- Transacoes (deve vir antes de transaction_groups por FK)
  DELETE FROM public.transactions WHERE user_id = p_user_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_deleted_counts := v_deleted_counts || jsonb_build_object('transactions', v_count);

  -- Grupos de transacoes
  DELETE FROM public.transaction_groups WHERE user_id = p_user_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_deleted_counts := v_deleted_counts || jsonb_build_object('transaction_groups', v_count);

  -- Contas
  DELETE FROM public.accounts WHERE user_id = p_user_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_deleted_counts := v_deleted_counts || jsonb_build_object('accounts', v_count);

  -- Categorias
  DELETE FROM public.categories WHERE user_id = p_user_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_deleted_counts := v_deleted_counts || jsonb_build_object('categories', v_count);

  -- Metas
  DELETE FROM public.goals WHERE user_id = p_user_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_deleted_counts := v_deleted_counts || jsonb_build_object('goals', v_count);

  -- Investimentos
  DELETE FROM public.investments WHERE user_id = p_user_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_deleted_counts := v_deleted_counts || jsonb_build_object('investments', v_count);

  -- Patrimonio
  DELETE FROM public.patrimony_items WHERE user_id = p_user_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_deleted_counts := v_deleted_counts || jsonb_build_object('patrimony_items', v_count);

  -- Orcamentos por categoria
  DELETE FROM public.category_budgets WHERE user_id = p_user_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_deleted_counts := v_deleted_counts || jsonb_build_object('category_budgets', v_count);

  -- Historico de IA (Finn)
  DELETE FROM public.ai_history WHERE user_id = p_user_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_deleted_counts := v_deleted_counts || jsonb_build_object('ai_history', v_count);

  -- Uso do Finn (rate limiting)
  DELETE FROM public.finn_usage WHERE user_id = p_user_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_deleted_counts := v_deleted_counts || jsonb_build_object('finn_usage', v_count);

  -- Logs de automacao
  DELETE FROM public.automation_logs WHERE user_id = p_user_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_deleted_counts := v_deleted_counts || jsonb_build_object('automation_logs', v_count);

  -- Permissoes de automacao
  DELETE FROM public.automation_permissions WHERE user_id = p_user_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_deleted_counts := v_deleted_counts || jsonb_build_object('automation_permissions', v_count);

  -- Configuracoes de aposentadoria
  DELETE FROM public.retirement_settings WHERE user_id = p_user_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_deleted_counts := v_deleted_counts || jsonb_build_object('retirement_settings', v_count);

  -- Parceiros e clientes de parceria
  DELETE FROM public.partnership_clients WHERE user_id = p_user_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_deleted_counts := v_deleted_counts || jsonb_build_object('partnership_clients', v_count);

  DELETE FROM public.partners_v2 WHERE user_id = p_user_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_deleted_counts := v_deleted_counts || jsonb_build_object('partners_v2', v_count);

  -- Atas enviadas
  DELETE FROM public.sent_atas WHERE user_id = p_user_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_deleted_counts := v_deleted_counts || jsonb_build_object('sent_atas', v_count);

  -- Templates customizados
  DELETE FROM public.custom_templates WHERE user_id = p_user_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_deleted_counts := v_deleted_counts || jsonb_build_object('custom_templates', v_count);

  -- Arquivos do usuario
  DELETE FROM public.user_files WHERE user_id = p_user_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_deleted_counts := v_deleted_counts || jsonb_build_object('user_files', v_count);

  -- Acesso Stripe
  DELETE FROM public.user_access WHERE user_id = p_user_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_deleted_counts := v_deleted_counts || jsonb_build_object('user_access', v_count);

  DELETE FROM public.stripe_subscriptions WHERE user_id = p_user_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_deleted_counts := v_deleted_counts || jsonb_build_object('stripe_subscriptions', v_count);

  DELETE FROM public.stripe_sessions WHERE user_id = p_user_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_deleted_counts := v_deleted_counts || jsonb_build_object('stripe_sessions', v_count);

  -- Retornar confirmacao com contagem de registros deletados
  RETURN jsonb_build_object(
    'deleted', true,
    'user_id', p_user_id,
    'deleted_at', NOW(),
    'counts', v_deleted_counts
  );

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Erro ao deletar dados do usuario %: %', p_user_id, SQLERRM;
END;
$$;

-- Revogar acesso publico — acessivel apenas via service_role
REVOKE ALL ON FUNCTION public.hard_delete_user_data(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.hard_delete_user_data(UUID) FROM anon;
REVOKE ALL ON FUNCTION public.hard_delete_user_data(UUID) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.hard_delete_user_data(UUID) TO service_role;

COMMENT ON FUNCTION public.hard_delete_user_data(UUID) IS
  'Deleta permanentemente todos os dados pessoais de um usuario para atender ao direito '
  'ao esquecimento da LGPD (Art. 18, VI). Acessivel apenas via service_role. '
  'Criado em 2026-03-05 | TD-S1-002';
