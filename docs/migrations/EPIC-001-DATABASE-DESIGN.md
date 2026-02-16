# EPIC-001: CRM v2 - Database Design & Migrations

**Version:** 1.0
**Created:** 2026-02-16
**Status:** Ready for Implementation
**Target Migration Date:** Sprint 2 Kickoff (2026-02-19)

---

## Overview

EPIC-001 requires 3 new tables and 2 column additions to the existing `clients` table:

| Table | Purpose | Rows (Est.) | Size (MB) |
|-------|---------|------------|-----------|
| `sent_atas` | Meeting notes & investment recommendations | 10,000/year | ~50 |
| `user_files` | File metadata (Supabase Storage) | 50,000/year | ~5 |
| `custom_templates` | User-customized email/WhatsApp templates | 100-1000 | <1 |
| `health_score_history` | (Optional) Score snapshots for analytics | 1,000/user/year | ~10 |

---

## Table 1: `sent_atas` (Core)

**Purpose:** Store all sent meeting notes and investment recommendations with delivery tracking.

**Criticality:** CRITICAL (core feature)

### Schema

```sql
CREATE TABLE sent_atas (
  -- Primary Key & Ownership
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID,  -- Optional reference to clients table
  client_name VARCHAR(255) NOT NULL,

  -- Content Type & Status
  type VARCHAR(20) NOT NULL
    DEFAULT 'reuniao'
    CHECK (type IN ('reuniao', 'investimentos')),
  status VARCHAR(20) NOT NULL
    DEFAULT 'draft'
    CHECK (status IN ('draft', 'sent', 'failed')),

  -- Delivery Channel
  channel VARCHAR(20)
    CHECK (channel IS NULL OR channel IN ('email', 'whatsapp')),
  recipient VARCHAR(255),  -- Email or phone number

  -- Content
  content TEXT NOT NULL,  -- HTML/rendered ata

  -- Structured Data (JSONB for flexibility)
  meeting_date DATE,
  next_meeting_date DATE,
  next_meeting_time TIME,
  topics JSONB,  -- [{emoji: "🚀", text: "..."}, ...]
  pending_items JSONB,  -- [{text: "...", completed: false}, ...]
  materials JSONB,  -- [{name: "...", description: "..."}, ...]

  -- Investment-specific fields
  investment_data JSONB,  -- {stocks: [], fiis: [], ...}

  -- Timestamps
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  UNIQUE(id),
  CHECK (
    (type = 'reuniao' AND meeting_date IS NOT NULL) OR
    (type = 'investimentos')
  )
);

-- Indexes for performance
CREATE INDEX idx_sent_atas_user_id ON sent_atas(user_id);
CREATE INDEX idx_sent_atas_client_id ON sent_atas(client_id);
CREATE INDEX idx_sent_atas_sent_at ON sent_atas(sent_at DESC);
CREATE INDEX idx_sent_atas_status ON sent_atas(status);
CREATE INDEX idx_sent_atas_type ON sent_atas(type);

-- Trigger for updated_at
CREATE TRIGGER update_sent_atas_updated_at
  BEFORE UPDATE ON sent_atas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policy
ALTER TABLE sent_atas ENABLE ROW LEVEL SECURITY;

CREATE POLICY rls_sent_atas_select ON sent_atas
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY rls_sent_atas_insert ON sent_atas
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY rls_sent_atas_update ON sent_atas
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY rls_sent_atas_delete ON sent_atas
  FOR DELETE USING (auth.uid() = user_id);
```

### Data Model (TypeScript)

```typescript
interface SentAta {
  id: string;
  user_id: string;
  client_id?: string;
  client_name: string;
  type: 'reuniao' | 'investimentos';
  status: 'draft' | 'sent' | 'failed';
  channel?: 'email' | 'whatsapp';
  recipient?: string; // email or phone
  content: string; // HTML
  meeting_date?: string; // ISO date
  next_meeting_date?: string;
  next_meeting_time?: string;
  topics?: Array<{ emoji: string; text: string }>;
  pending_items?: Array<{ text: string; completed: boolean }>;
  materials?: Array<{ name: string; description: string }>;
  investment_data?: {
    stocks: Asset[];
    fiis: Asset[];
    international: Asset[];
    fixed_income: Asset[];
    crypto: Asset[];
  };
  sent_at?: string; // ISO datetime
  created_at: string;
  updated_at: string;
}

interface Asset {
  id: string;
  ticker: string;
  name: string;
  unit_value: number;
  quantity: number;
}
```

### Example Queries

```sql
-- Fetch recent sent atas for a client
SELECT * FROM sent_atas
WHERE user_id = 'xxx' AND client_id = 'yyy'
ORDER BY sent_at DESC
LIMIT 20;

-- Count atas by type and channel
SELECT type, channel, COUNT(*) as count
FROM sent_atas
WHERE user_id = 'xxx'
  AND sent_at > NOW() - INTERVAL '30 days'
GROUP BY type, channel;

-- Find draft atas for auto-recovery
SELECT id, client_id, created_at FROM sent_atas
WHERE user_id = 'xxx' AND status = 'draft'
ORDER BY updated_at DESC;
```

---

## Table 2: `user_files` (Core)

**Purpose:** Metadata for files uploaded to Supabase Storage (not the files themselves, just references).

**Criticality:** CRITICAL (file management)

### Schema

```sql
CREATE TABLE user_files (
  -- Primary Key & Ownership
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID,  -- Which client this file is associated with

  -- File Metadata
  name VARCHAR(255) NOT NULL,  -- Original filename
  category VARCHAR(50) NOT NULL
    DEFAULT 'outros'
    CHECK (category IN ('investimentos', 'planejamento', 'educacional', 'outros')),

  storage_path VARCHAR(500) NOT NULL UNIQUE,  -- Path in Supabase Storage
  size_bytes INTEGER NOT NULL,  -- For quota tracking
  mime_type VARCHAR(100) NOT NULL,  -- e.g., "application/pdf"

  -- User Preferences
  is_favorite BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,  -- Soft delete

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  UNIQUE(user_id, storage_path),
  CHECK (size_bytes > 0)
);

-- Indexes
CREATE INDEX idx_user_files_user_id ON user_files(user_id);
CREATE INDEX idx_user_files_client_id ON user_files(client_id);
CREATE INDEX idx_user_files_category ON user_files(category);
CREATE INDEX idx_user_files_created_at ON user_files(created_at DESC);
CREATE INDEX idx_user_files_is_favorite ON user_files(is_favorite);

-- Trigger for updated_at
CREATE TRIGGER update_user_files_updated_at
  BEFORE UPDATE ON user_files
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policy
ALTER TABLE user_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY rls_user_files_select ON user_files
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY rls_user_files_insert ON user_files
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY rls_user_files_update ON user_files
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY rls_user_files_delete ON user_files
  FOR DELETE USING (auth.uid() = user_id);
```

### Data Model (TypeScript)

```typescript
interface UserFile {
  id: string;
  user_id: string;
  client_id?: string;
  name: string;
  category: 'investimentos' | 'planejamento' | 'educacional' | 'outros';
  storage_path: string;
  size_bytes: number;
  mime_type: string;
  is_favorite: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}
```

### Example Queries

```sql
-- Fetch files for a user, excluding deleted
SELECT * FROM user_files
WHERE user_id = 'xxx' AND is_deleted = FALSE
ORDER BY created_at DESC;

-- Calculate storage usage
SELECT SUM(size_bytes) / 1024 / 1024 as used_mb
FROM user_files
WHERE user_id = 'xxx' AND is_deleted = FALSE;

-- Fetch favorites (pinned files)
SELECT * FROM user_files
WHERE user_id = 'xxx' AND is_favorite = TRUE AND is_deleted = FALSE
ORDER BY name;

-- Find files by category
SELECT * FROM user_files
WHERE user_id = 'xxx'
  AND category = 'investimentos'
  AND is_deleted = FALSE
ORDER BY created_at DESC;
```

---

## Table 3: `custom_templates` (Optional)

**Purpose:** Store user-customized templates for meeting notes and investment recommendations.

**Criticality:** MEDIUM (feature completion)

### Schema

```sql
CREATE TABLE custom_templates (
  -- Primary Key & Ownership
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Template Type
  type VARCHAR(20) NOT NULL
    CHECK (type IN ('reuniao', 'investimentos')),

  -- Template Content
  content TEXT NOT NULL,  -- Handlebars or simple variable template

  -- Status
  is_active BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  UNIQUE(user_id, type)  -- One active template per user per type
);

-- Indexes
CREATE INDEX idx_custom_templates_user_id ON custom_templates(user_id);
CREATE INDEX idx_custom_templates_type ON custom_templates(type);

-- Trigger
CREATE TRIGGER update_custom_templates_updated_at
  BEFORE UPDATE ON custom_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policy
ALTER TABLE custom_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY rls_custom_templates_select ON custom_templates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY rls_custom_templates_insert ON custom_templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY rls_custom_templates_update ON custom_templates
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY rls_custom_templates_delete ON custom_templates
  FOR DELETE USING (auth.uid() = user_id);
```

### Data Model (TypeScript)

```typescript
interface CustomTemplate {
  id: string;
  user_id: string;
  type: 'reuniao' | 'investimentos';
  content: string; // Template with {variables}
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

### Template Variable Reference

**For Meeting Notes (`reuniao`):**
```
{cliente}              - Client name
{data}                 - Meeting date (DD/MM/YYYY)
{data_proxima}         - Next meeting date
{hora_proxima}         - Next meeting time
{topicos}              - Topics section (pre-rendered)
{pendencias}           - Pending items (pre-rendered)
{materiais}            - Materials list (pre-rendered)
```

**For Investment Notes (`investimentos`):**
```
{cliente}              - Client name
{data}                 - Meeting date
{objetivo}             - Client objective/profile
{acoes}                - Stocks section (pre-rendered)
{fiis}                 - FIIs section (pre-rendered)
{internacionais}       - International section (pre-rendered)
{renda_fixa}           - Fixed income section (pre-rendered)
{cripto}               - Crypto section (pre-rendered)
{resumo}               - Summary table (pre-rendered)
{notas}                - Notes section
```

---

## Table 4: `health_score_history` (Optional)

**Purpose:** Track health score snapshots over time for trend analysis and reporting.

**Criticality:** LOW (nice-to-have for analytics)

### Schema

```sql
CREATE TABLE health_score_history (
  -- Primary Key & Ownership
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL,

  -- Score Components
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  financial_health INTEGER CHECK (financial_health >= 0 AND financial_health <= 100),
  goal_progress INTEGER CHECK (goal_progress >= 0 AND goal_progress <= 100),
  engagement INTEGER CHECK (engagement >= 0 AND engagement <= 100),

  -- Metadata
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  UNIQUE(user_id, client_id, DATE(recorded_at))  -- One per client per day
);

-- Indexes
CREATE INDEX idx_health_score_history_user_id ON health_score_history(user_id);
CREATE INDEX idx_health_score_history_client_id ON health_score_history(client_id);
CREATE INDEX idx_health_score_history_recorded_at ON health_score_history(recorded_at DESC);

-- RLS Policy
ALTER TABLE health_score_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY rls_health_score_history_select ON health_score_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY rls_health_score_history_insert ON health_score_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

---

## Column Additions to `clients` Table

### Existing Table

Assuming `clients` table exists from EPIC-004:

```sql
-- Check current schema
\d clients;
```

### Required Additions

```sql
-- Add health score tracking columns (if not present)
ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS health_score INTEGER DEFAULT 50
    CHECK (health_score >= 0 AND health_score <= 100),
  ADD COLUMN IF NOT EXISTS health_score_updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create index for sorting/filtering
CREATE INDEX IF NOT EXISTS idx_clients_health_score
  ON clients(health_score DESC);
```

### Data Model Addition

```typescript
interface Client {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  avatar_url?: string;
  health_score: number; // 0-100
  health_score_updated_at: string; // ISO datetime
  // ... other fields ...
  created_at: string;
  updated_at: string;
}
```

---

## Supabase Storage Configuration

### Create Bucket (via SQL)

```sql
-- Create storage bucket for CRM files
INSERT INTO storage.buckets (id, name, public)
VALUES ('spfp-files', 'spfp-files', false)
ON CONFLICT DO NOTHING;

-- Set up RLS policy for bucket
CREATE POLICY "Users can upload to their own folder" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'spfp-files'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can read their own files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'spfp-files'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'spfp-files'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

### Storage Path Structure

```
spfp-files/
├── {user_id}/
│   ├── investimentos/
│   │   ├── 1708095600000_carteira-2026.pdf
│   │   └── 1708181400000_analise-fiis.pdf
│   ├── planejamento/
│   │   ├── 1708095600000_guia-aposentadoria.pdf
│   │   └── ...
│   ├── educacional/
│   │   └── ...
│   └── outros/
│       └── ...
```

---

## Triggers & Functions

### Update Timestamp Function

```sql
-- Reusable trigger function (should already exist from previous sprints)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Health Score Calculation Function

```sql
CREATE OR REPLACE FUNCTION calculate_client_health_score(p_client_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_financial_health INTEGER := 60;  -- Placeholder for MVP
  v_goal_count INTEGER;
  v_goal_progress INTEGER;
  v_days_since_contact INTEGER;
  v_engagement INTEGER;
  v_has_recent_notes BOOLEAN;
  v_final_score INTEGER;
BEGIN
  -- Financial Health (placeholder for MVP)
  v_financial_health := 60;

  -- Goal Progress
  SELECT COUNT(*) INTO v_goal_count FROM goals
  WHERE client_id = p_client_id AND status = 'active';

  v_goal_progress := CASE
    WHEN v_goal_count = 0 THEN 0
    WHEN v_goal_count <= 2 THEN 25
    WHEN v_goal_count <= 5 THEN 50
    ELSE 100
  END;

  -- Engagement (days since last contact)
  SELECT EXTRACT(DAY FROM (NOW() - MAX(sent_at)))::INTEGER
  INTO v_days_since_contact FROM sent_atas
  WHERE client_id = p_client_id;

  v_engagement := CASE
    WHEN v_days_since_contact IS NULL THEN 50
    WHEN v_days_since_contact < 7 THEN 100
    WHEN v_days_since_contact < 14 THEN 75
    WHEN v_days_since_contact < 30 THEN 50
    WHEN v_days_since_contact < 60 THEN 25
    ELSE 0
  END;

  -- Recent activity bonus
  SELECT COUNT(*) > 0 INTO v_has_recent_notes FROM sent_atas
  WHERE client_id = p_client_id
    AND sent_at > NOW() - INTERVAL '30 days';

  IF v_has_recent_notes THEN
    v_engagement := LEAST(100, v_engagement + 15);
  END IF;

  -- Weighted final score
  v_final_score := (
    (v_financial_health * 0.4) +
    (v_goal_progress * 0.3) +
    (v_engagement * 0.3)
  )::INTEGER;

  RETURN v_final_score;
END;
$$ LANGUAGE plpgsql;
```

### Trigger to Update Health Score on Ata Send

```sql
CREATE OR REPLACE FUNCTION trigger_update_client_health_on_ata()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'sent' AND (OLD.status IS NULL OR OLD.status != 'sent') THEN
    UPDATE clients
    SET health_score = calculate_client_health_score(NEW.client_id),
        health_score_updated_at = NOW()
    WHERE id = NEW.client_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_client_health_on_ata_send
  AFTER INSERT OR UPDATE ON sent_atas
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_client_health_on_ata();
```

---

## Migration Checklist

### Before Migration

- [ ] Backup production database
- [ ] Notify stakeholders of maintenance window (if needed)
- [ ] Prepare rollback script
- [ ] Review all DDL statements
- [ ] Test in staging environment

### Migration Steps

1. **Create Tables**
   ```bash
   # In Supabase SQL Editor
   psql -h db.supabase.co -U postgres -d postgres
   # Paste EPIC-001-migrations.sql
   ```

2. **Add Columns to `clients`**
   ```sql
   ALTER TABLE clients ADD COLUMN health_score ...
   ```

3. **Create Storage Bucket**
   ```sql
   INSERT INTO storage.buckets ...
   ```

4. **Create Triggers & Functions**
   ```sql
   CREATE FUNCTION update_updated_at_column() ...
   CREATE FUNCTION calculate_client_health_score() ...
   ```

5. **Enable RLS on All Tables**
   ```sql
   ALTER TABLE sent_atas ENABLE ROW LEVEL SECURITY;
   ALTER TABLE user_files ENABLE ROW LEVEL SECURITY;
   ALTER TABLE custom_templates ENABLE ROW LEVEL SECURITY;
   ALTER TABLE health_score_history ENABLE ROW LEVEL SECURITY;
   ```

6. **Create RLS Policies** (run for each table)
   ```sql
   CREATE POLICY rls_sent_atas_select ON sent_atas ...
   ```

7. **Create Indexes**
   ```sql
   CREATE INDEX idx_sent_atas_user_id ON sent_atas(user_id);
   -- ... repeat for all indexes
   ```

8. **Verify**
   ```sql
   \d sent_atas
   \d user_files
   SELECT * FROM information_schema.tables WHERE table_name LIKE '%ata%';
   ```

### After Migration

- [ ] Verify all tables created
- [ ] Verify RLS policies active
- [ ] Verify indexes created
- [ ] Run smoke tests (insert dummy row)
- [ ] Confirm app can connect
- [ ] Monitor database performance
- [ ] Document any issues

---

## Rollback Plan

If migration fails:

```sql
-- Drop new tables
DROP TABLE IF EXISTS health_score_history CASCADE;
DROP TABLE IF EXISTS custom_templates CASCADE;
DROP TABLE IF EXISTS user_files CASCADE;
DROP TABLE IF EXISTS sent_atas CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS calculate_client_health_score(UUID);
DROP FUNCTION IF EXISTS trigger_update_client_health_on_ata();

-- Remove columns from clients
ALTER TABLE clients DROP COLUMN IF EXISTS health_score;
ALTER TABLE clients DROP COLUMN IF EXISTS health_score_updated_at;

-- Drop storage bucket (via Supabase dashboard)
-- DELETE FROM storage.buckets WHERE id = 'spfp-files';
```

---

## Performance Considerations

### Query Patterns

```sql
-- Frequently accessed (optimize with indexes)
SELECT * FROM sent_atas WHERE user_id = ? ORDER BY sent_at DESC;  -- idx_user_id
SELECT * FROM user_files WHERE user_id = ? AND is_deleted = FALSE;  -- idx_user_id
SELECT SUM(size_bytes) FROM user_files WHERE user_id = ?;  -- idx_user_id

-- Occasional queries (index helpful but not critical)
SELECT * FROM sent_atas WHERE client_id = ?;  -- idx_client_id
SELECT * FROM sent_atas WHERE type = 'reuniao';  -- idx_type
```

### Storage Limits

```
per user: 500 MB (free tier)
per file: 10 MB max (enforced in app)
total bucket: 10 GB (Supabase free tier)
```

### Archive Strategy

For GDPR compliance, implement soft-delete + periodic archive:

```sql
-- Soft delete (from S1.6)
UPDATE sent_atas SET is_deleted = TRUE WHERE id = ?;

-- Archive old records (optional, for large deployments)
-- After 1 year: Move to cold storage or archive table
```

---

## Testing the Schema

### Insert Test Data

```sql
-- Insert test user (use existing auth.users)
INSERT INTO sent_atas (user_id, client_id, client_name, type, status, content)
VALUES (
  'xxx-user-id',
  'xxx-client-id',
  'John Doe',
  'reuniao',
  'draft',
  '<p>Test ata</p>'
);

-- Verify insert
SELECT * FROM sent_atas WHERE user_id = 'xxx-user-id';

-- Verify RLS (should only see own rows)
-- Log in as different user, should see empty
```

### Load Testing

```sql
-- Insert 1000 atas and measure time
WITH numbered_rows AS (
  SELECT generate_series(1, 1000) as n
)
INSERT INTO sent_atas (user_id, client_id, client_name, type, status, content)
SELECT
  'xxx-user-id',
  'xxx-client-id',
  'Client ' || n,
  'reuniao',
  'draft',
  '<p>Content ' || n || '</p>'
FROM numbered_rows;

-- Measure query time
EXPLAIN ANALYZE
SELECT * FROM sent_atas
WHERE user_id = 'xxx-user-id'
ORDER BY sent_at DESC
LIMIT 50;
```

---

## References

- **Supabase RLS Documentation:** https://supabase.com/docs/guides/auth/row-level-security
- **PostgreSQL Functions:** https://www.postgresql.org/docs/current/sql-createfunction.html
- **JSON/JSONB in PostgreSQL:** https://www.postgresql.org/docs/current/datatype-json.html

---

**Created by:** Morgan (Product Manager)
**Reviewed by:** [Pending Architecture Review]
**Status:** READY FOR IMPLEMENTATION
**Target:** Sprint 2 Kickoff (2026-02-19)

