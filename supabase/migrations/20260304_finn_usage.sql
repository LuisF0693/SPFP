-- FINN USAGE — Controle de mensagens por usuário por mês
-- Suporte a rate limiting por plano (Essencial: 30/mês, Wealth Mentor: 300/mês)

CREATE TABLE IF NOT EXISTS finn_usage (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month       TEXT        NOT NULL, -- formato 'YYYY-MM'
  message_count INT       NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, month)
);

-- Index para queries rápidas de rate limit
CREATE INDEX IF NOT EXISTS idx_finn_usage_user_month ON finn_usage(user_id, month);

-- RLS: usuário só acessa seu próprio uso
ALTER TABLE finn_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "finn_usage_own" ON finn_usage
  FOR ALL
  USING (auth.uid() = user_id);

-- Service role pode inserir/atualizar (usado pela Edge Function)
CREATE POLICY "finn_usage_service" ON finn_usage
  FOR ALL
  TO service_role
  USING (true);
