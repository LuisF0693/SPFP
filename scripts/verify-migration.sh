#!/bin/bash

# ============================================
# Migration Verification Script
# Purpose: Verify database optimizations migration
# Author: Nova (Data Engineer)
# ============================================

set -e

echo "============================================"
echo "SPFP Database Optimization - Verification"
echo "============================================"
echo ""

# Check if Supabase URL is set
if [ -z "$SUPABASE_URL" ]; then
  echo "ERROR: SUPABASE_URL not set"
  echo "Please set environment variables:"
  echo "  export SUPABASE_URL=<your-supabase-url>"
  echo "  export SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>"
  exit 1
fi

echo "Supabase Project: $SUPABASE_URL"
echo ""

# Function to run SQL query using curl
run_query() {
  local query="$1"
  local description="$2"

  echo "Checking: $description"

  curl -s -X POST "$SUPABASE_URL/rest/v1/rpc/execute_sql" \
    -H "apikey: $SUPABASE_ANON_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"query\": \"$query\"}" | jq '.'

  echo ""
}

# Alternative: Use psql if available
if command -v psql &> /dev/null; then
  echo "Using psql for verification..."
  echo ""

  # Get connection parameters from SUPABASE_URL
  # Format: https://[project-id].supabase.co
  PROJECT_ID=$(echo "$SUPABASE_URL" | sed -E 's|https://([a-z0-9]+)\.supabase\.co|\1|')

  echo "Project ID: $PROJECT_ID"
  echo ""

  # Verify indexes
  echo "1. Verifying Indexes..."
  psql -h "$PROJECT_ID.supabase.co" -U postgres -d postgres -c "
    SELECT COUNT(*) as index_count
    FROM pg_indexes
    WHERE schemaname = 'public'
    AND indexname LIKE 'idx_%';
  "
  echo ""

  # Verify views
  echo "2. Verifying Views..."
  psql -h "$PROJECT_ID.supabase.co" -U postgres -d postgres -c "
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_type = 'VIEW'
    AND (table_name LIKE '%health_check%' OR table_name = 'dashboard_metrics')
    ORDER BY table_name;
  "
  echo ""

  # Verify constraints
  echo "3. Verifying Constraints..."
  psql -h "$PROJECT_ID.supabase.co" -U postgres -d postgres -c "
    SELECT constraint_name, table_name
    FROM information_schema.table_constraints
    WHERE table_schema = 'public'
    AND constraint_name LIKE 'unique_%'
    ORDER BY table_name;
  "
  echo ""

  # Verify soft delete columns
  echo "4. Verifying Soft Delete Columns..."
  psql -h "$PROJECT_ID.supabase.co" -U postgres -d postgres -c "
    SELECT table_name, column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND column_name = 'deleted_at'
    ORDER BY table_name;
  "
  echo ""

  # Performance test
  echo "5. Running Performance Test..."
  psql -h "$PROJECT_ID.supabase.co" -U postgres -d postgres -c "
    EXPLAIN ANALYZE
    SELECT id, title, status, priority, position
    FROM operational_tasks
    LIMIT 10;
  "
  echo ""

else
  echo "psql not found. Using curl API instead..."
  echo ""

  # Fallback: Use REST API (requires different approach)
  # This is limited without direct database access
  echo "For full verification, please:"
  echo "1. Open Supabase Dashboard: https://app.supabase.com"
  echo "2. Go to SQL Editor"
  echo "3. Run: supabase/migrations/20260216_validate_optimizations.sql"
  echo ""
fi

echo "============================================"
echo "Verification complete!"
echo "============================================"
echo ""
echo "Next steps:"
echo "1. Check the results above for any issues"
echo "2. If all checks pass, migration is successful"
echo "3. Review documentation in: docs/data-engineering/"
echo ""
