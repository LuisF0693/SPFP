-- EPIC-011: Marketing Hub
-- Story 11.1

CREATE TABLE IF NOT EXISTS marketing_content (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  content_type    TEXT NOT NULL CHECK (content_type IN ('post','reel','story','carousel','email')),
  platform        TEXT[] NOT NULL DEFAULT '{}',
  caption         TEXT,
  hashtags        TEXT[] DEFAULT '{}',
  media_urls      TEXT[] DEFAULT '{}',
  status          TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','ready','scheduled','publishing','published','failed')),
  scheduled_at    TIMESTAMPTZ,
  published_at    TIMESTAMPTZ,
  published_urls  JSONB DEFAULT '{}',
  created_by_agent TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE marketing_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own marketing content"
  ON marketing_content FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role full access on marketing_content"
  ON marketing_content FOR ALL
  TO service_role USING (true) WITH CHECK (true);

-- Social credentials (tokens criptografados)
CREATE TABLE IF NOT EXISTS social_credentials (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform      TEXT NOT NULL CHECK (platform IN ('meta','youtube','tiktok')),
  access_token  TEXT,
  refresh_token TEXT,
  page_id       TEXT,
  account_id    TEXT,
  expires_at    TIMESTAMPTZ,
  metadata      JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, platform)
);

ALTER TABLE social_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own social credentials"
  ON social_credentials FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role full access on social_credentials"
  ON social_credentials FOR ALL
  TO service_role USING (true) WITH CHECK (true);
