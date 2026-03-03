-- EPIC-012: Financial Integrations
-- company_revenue: vendas Stripe + Hotmart
-- company_products: catálogo de produtos
-- webhook_logs: auditoria de webhooks recebidos

CREATE TABLE IF NOT EXISTS company_revenue (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source        TEXT        NOT NULL CHECK (source IN ('stripe', 'hotmart')),
  event_type    TEXT        NOT NULL,
  amount        DECIMAL(10,2),
  currency      TEXT        DEFAULT 'BRL',
  product_name  TEXT,
  customer_name TEXT,
  customer_email TEXT,
  status        TEXT        CHECK (status IN ('paid', 'refunded', 'cancelled', 'pending')),
  external_id   TEXT,
  metadata      JSONB,
  occurred_at   TIMESTAMPTZ NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS company_revenue_external_id_idx
  ON company_revenue (user_id, source, external_id)
  WHERE external_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS company_products (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source              TEXT        NOT NULL CHECK (source IN ('stripe', 'hotmart')),
  external_product_id TEXT,
  name                TEXT        NOT NULL,
  price               DECIMAL(10,2),
  type                TEXT        CHECK (type IN ('subscription', 'course', 'one_time')),
  is_active           BOOLEAN     DEFAULT true,
  created_at          TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, source, external_product_id)
);

CREATE TABLE IF NOT EXISTS webhook_logs (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        REFERENCES auth.users(id) ON DELETE CASCADE,
  source      TEXT        NOT NULL,
  event_type  TEXT,
  payload     JSONB,
  processed   BOOLEAN     DEFAULT false,
  error       TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE company_revenue  ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs     ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own revenue"
  ON company_revenue FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own products"
  ON company_products FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own webhook_logs"
  ON webhook_logs FOR ALL USING (auth.uid() = user_id);

-- Service role: Edge Functions sem auth (webhooks externos)
CREATE POLICY "Service role full access revenue"
  ON company_revenue FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access products"
  ON company_products FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access webhook_logs"
  ON webhook_logs FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS company_revenue_user_id_idx     ON company_revenue (user_id);
CREATE INDEX IF NOT EXISTS company_revenue_source_idx      ON company_revenue (source);
CREATE INDEX IF NOT EXISTS company_revenue_occurred_at_idx ON company_revenue (occurred_at DESC);
CREATE INDEX IF NOT EXISTS company_products_user_id_idx    ON company_products (user_id);
CREATE INDEX IF NOT EXISTS webhook_logs_source_idx         ON webhook_logs (source);
CREATE INDEX IF NOT EXISTS webhook_logs_created_at_idx     ON webhook_logs (created_at DESC);
