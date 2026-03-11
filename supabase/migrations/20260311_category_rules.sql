-- STY-011: Auto-categorização Inteligente
-- Tabela para armazenar regras de categorização aprendidas por usuário.
-- Cada regra mapeia um padrão normalizado de descrição para uma categoria.
-- A confiança aumenta com o uso (count / 10, máximo 1.0).

CREATE TABLE IF NOT EXISTS category_rules (
  id           UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID         REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  pattern      TEXT         NOT NULL,
  category_id  TEXT         NOT NULL,
  count        INTEGER      DEFAULT 1,
  confidence   DECIMAL(4,3) DEFAULT 0.500,
  created_at   TIMESTAMPTZ  DEFAULT now(),
  updated_at   TIMESTAMPTZ  DEFAULT now(),
  UNIQUE(user_id, pattern)
);

-- Row Level Security: cada usuário só acessa suas próprias regras
ALTER TABLE category_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_own_rules" ON category_rules
  FOR ALL
  USING (auth.uid() = user_id);

-- Índice para busca eficiente por usuário
CREATE INDEX IF NOT EXISTS idx_category_rules_user
  ON category_rules(user_id);

-- Índice composto para busca por usuário + padrão (usado no upsert)
CREATE INDEX IF NOT EXISTS idx_category_rules_user_pattern
  ON category_rules(user_id, pattern);
