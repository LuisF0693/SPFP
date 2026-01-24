-- ============================================
-- RLS Policy para tabela ai_history
-- Garante que cada usuário só vê seus próprios insights
-- ============================================

-- 1. Habilitar RLS na tabela ai_history
ALTER TABLE ai_history ENABLE ROW LEVEL SECURITY;

-- 2. Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Users can view their own AI history" ON ai_history;
DROP POLICY IF EXISTS "Users can insert their own AI history" ON ai_history;
DROP POLICY IF EXISTS "Users can delete their own AI history" ON ai_history;

-- 3. Criar política de SELECT - usuário só vê seus próprios registros
CREATE POLICY "Users can view their own AI history"
ON ai_history
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 4. Criar política de INSERT - usuário só pode inserir com seu próprio ID
CREATE POLICY "Users can insert their own AI history"
ON ai_history
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 5. Criar política de DELETE - usuário só pode deletar seus próprios registros
CREATE POLICY "Users can delete their own AI history"
ON ai_history
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 6. (Opcional) Criar política de UPDATE - se precisar atualizar insights
CREATE POLICY "Users can update their own AI history"
ON ai_history
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- INSTRUÇÕES:
-- 1. Acesse o Supabase Dashboard
-- 2. Vá em SQL Editor
-- 3. Cole e execute este script
-- ============================================
