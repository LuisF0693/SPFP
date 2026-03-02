-- ============================================
-- SPFP - AI History Table
-- Story 5.2: Insights histórico por cliente
-- Date: 2026-03-02
-- ============================================

CREATE TABLE IF NOT EXISTS ai_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  response TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast per-user queries (ordered by most recent)
CREATE INDEX IF NOT EXISTS idx_ai_history_user_created
  ON ai_history(user_id, created_at DESC);

-- RLS: each user can only see/delete their own history
ALTER TABLE ai_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can read own ai_history"
  ON ai_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert own ai_history"
  ON ai_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete own ai_history"
  ON ai_history FOR DELETE
  USING (auth.uid() = user_id);
