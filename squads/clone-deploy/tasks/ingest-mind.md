---
task-id: ingest-mind
name: Mind RAG Ingestion Pipeline
agent: rag-architect
version: 1.0.0
purpose: Process MMOS mind outputs and create RAG chunks in Supabase pgvector

workflow-mode: automated
elicit: false

prerequisites:
  - Mind processed by MMOS Mind Mapper pipeline
  - Mind directory exists at outputs/minds/{slug}/
  - Supabase instance with pgvector extension enabled
  - OpenAI API key set (for text-embedding-3-small)
  - Supabase service key with write permissions

inputs:
  - name: mind_slug
    type: string
    description: The slug of the mind to ingest (e.g., "naval_ravikant")
    required: true

  - name: chunk_size
    type: integer
    description: Maximum chunk size in characters
    required: false
    default: 800

  - name: chunk_overlap
    type: integer
    description: Overlap between consecutive chunks in characters
    required: false
    default: 100

  - name: embedding_model
    type: string
    description: OpenAI embedding model to use
    required: false
    default: "text-embedding-3-small"

  - name: force_reindex
    type: boolean
    description: Delete existing chunks and re-ingest from scratch
    required: false
    default: true

outputs:
  - path: "Supabase minds table"
    description: Mind record with slug, name, system_prompt, cognitive_profile
    format: database row

  - path: "Supabase mind_chunks table"
    description: Chunked content with embeddings for vector search
    format: database rows

  - path: "stdout"
    description: Ingestion report with chunk counts and token estimates
    format: text

dependencies:
  agents:
    - rag-architect
  tools:
    - supabase (pgvector)
    - openai (text-embedding-3-small)
    - langchain_text_splitters (RecursiveCharacterTextSplitter)
  files:
    - outputs/mind-clone-bot/ingest_mind.py
    - outputs/minds/{slug}/system_prompts/*.md
    - outputs/minds/{slug}/analysis/cognitive-spec.yaml
    - outputs/minds/{slug}/kb/*.md
    - outputs/minds/{slug}/synthesis/*.md
    - outputs/minds/{slug}/artifacts/*.md

validation:
  success-criteria:
    - "Mind record created/updated in Supabase minds table"
    - "All knowledge files chunked and embedded"
    - "Chunks inserted into mind_chunks table with embeddings"
    - "search_mind_chunks RPC function returns results for test query"
    - "match_mind_chunks RPC function returns results for test embedding"

  warning-conditions:
    - "Fewer than 10 chunks created (limited RAG context)"
    - "No cognitive-spec.yaml found (missing personality metadata)"
    - "Embedding API rate limited (retries needed)"

  failure-conditions:
    - "Mind directory does not exist"
    - "No content files found to chunk"
    - "Supabase connection failed"
    - "OpenAI embedding API failed"
    - "Zero chunks successfully inserted"

estimated-duration: "1-5 minutes depending on content volume"
---

# Ingest Mind Task

## Purpose

Process a mind's MMOS outputs (system prompt, knowledge base, synthesis, cognitive profile)
into RAG-ready chunks stored in Supabase with pgvector embeddings. This is the bridge
between the MMOS pipeline outputs and the clone engine's retrieval system.

**Pipeline position:** After MMOS Mind Mapper, before build-clone or deploy tasks.
**Implementation:** `outputs/mind-clone-bot/ingest_mind.py`

## When to Use This Task

**Use this task when:**
- First time deploying a mind clone (initial ingestion)
- After updating mind content via MMOS pipeline
- After adding new knowledge base files
- Re-indexing with different chunk parameters
- User invokes `/CloneDeploy:tasks:ingest-mind`

**Do NOT use this task when:**
- Mind has not been processed by MMOS yet
- Just testing clone conversation (mind already ingested)
- Modifying clone behavior without content changes (edit system prompt directly)

## Supabase Schema

### Table: minds

```sql
CREATE TABLE minds (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    system_prompt TEXT,
    cognitive_profile JSONB,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast slug lookup
CREATE INDEX idx_minds_slug ON minds(slug);
```

### Table: mind_chunks

```sql
CREATE TABLE mind_chunks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    mind_id UUID NOT NULL REFERENCES minds(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    embedding VECTOR(1536),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- pgvector index for semantic search (IVFFlat for production)
CREATE INDEX idx_mind_chunks_embedding ON mind_chunks
    USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);

-- Index for mind_id filtering
CREATE INDEX idx_mind_chunks_mind_id ON mind_chunks(mind_id);

-- Full-text search index for hybrid search
ALTER TABLE mind_chunks ADD COLUMN fts tsvector
    GENERATED ALWAYS AS (to_tsvector('portuguese', content)) STORED;
CREATE INDEX idx_mind_chunks_fts ON mind_chunks USING gin(fts);
```

### RPC: search_mind_chunks (Hybrid Search)

```sql
CREATE OR REPLACE FUNCTION search_mind_chunks(
    p_mind_id UUID,
    p_query_text TEXT,
    p_query_embedding VECTOR(1536),
    p_match_count INT DEFAULT 5
)
RETURNS TABLE (
    id UUID,
    content TEXT,
    metadata JSONB,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        mc.id,
        mc.content,
        mc.metadata,
        (
            -- Hybrid score: 70% semantic + 30% full-text
            0.7 * (1 - (mc.embedding <=> p_query_embedding)) +
            0.3 * COALESCE(
                ts_rank(mc.fts, plainto_tsquery('portuguese', p_query_text)),
                0
            )
        ) AS similarity
    FROM mind_chunks mc
    WHERE mc.mind_id = p_mind_id
    ORDER BY similarity DESC
    LIMIT p_match_count;
END;
$$;
```

### RPC: match_mind_chunks (Pure Vector Search - Fallback)

```sql
CREATE OR REPLACE FUNCTION match_mind_chunks(
    p_mind_id UUID,
    p_query_embedding VECTOR(1536),
    p_match_count INT DEFAULT 5
)
RETURNS TABLE (
    id UUID,
    content TEXT,
    metadata JSONB,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        mc.id,
        mc.content,
        mc.metadata,
        (1 - (mc.embedding <=> p_query_embedding)) AS similarity
    FROM mind_chunks mc
    WHERE mc.mind_id = p_mind_id
    ORDER BY mc.embedding <=> p_query_embedding
    LIMIT p_match_count;
END;
$$;
```

## Key Activities & Instructions

### Step 1: Validate Mind Directory

```python
from pathlib import Path

MINDS_BASE_PATH = "/Users/josecarlosamorim/mmos/outputs/minds"

def resolve_mind_path(mind_slug: str) -> Path:
    """Resolve and validate the mind directory path."""
    mind_path = Path(MINDS_BASE_PATH) / mind_slug
    if not mind_path.exists():
        print(f"[ERROR] Mind directory not found: {mind_path}")
        sys.exit(1)
    return mind_path
```

**Verify directory structure:**
```
outputs/minds/{slug}/
    system_prompts/          # REQUIRED - contains the system prompt .md
        system-prompt-generalista.md
    analysis/                # RECOMMENDED - cognitive analysis outputs
        cognitive-spec.yaml
        identity-core.yaml
    synthesis/               # RECOMMENDED - synthesized knowledge
        frameworks.md
        communication-style.md
        ...
    kb/                      # OPTIONAL - knowledge base fragments
        fragment-001.md
        ...
    artifacts/               # OPTIONAL - additional artifacts
    sources/                 # NOT INGESTED - raw source material
```

### Step 2: Read System Prompt

The system prompt is the core persona definition. It is stored as the `system_prompt`
column in the `minds` table and used by clone_engine.py at query time.

```python
def read_system_prompt(mind_path: Path) -> str:
    """Read the first .md file in system_prompts/ directory."""
    prompts_dir = mind_path / "system_prompts"
    if not prompts_dir.exists():
        print(f"[WARN] No system_prompts/ directory found at {prompts_dir}")
        return ""

    md_files = sorted(prompts_dir.glob("*.md"))
    if not md_files:
        print(f"[WARN] No .md files found in {prompts_dir}")
        return ""

    prompt_file = md_files[0]
    print(f"  System prompt: {prompt_file.name}")
    return prompt_file.read_text(encoding="utf-8")
```

### Step 3: Read Cognitive Profile

The cognitive profile (cognitive-spec.yaml) provides structured personality data
used as metadata in the `minds` table.

```python
import yaml

def read_cognitive_profile(mind_path: Path) -> dict:
    """Read cognitive-spec.yaml from analysis/ directory."""
    spec_path = mind_path / "analysis" / "cognitive-spec.yaml"
    if not spec_path.exists():
        print(f"[WARN] No cognitive-spec.yaml found at {spec_path}")
        return {}

    print(f"  Cognitive profile: analysis/cognitive-spec.yaml")
    with open(spec_path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f) or {}
```

### Step 4: Collect Knowledge Files

Collect all markdown files from kb/, synthesis/, and artifacts/ directories.
The sources/ directory is NOT included (raw material, not processed knowledge).

```python
def collect_knowledge_files(mind_path: Path) -> list[tuple[str, str]]:
    """
    Collect all .md files from kb/, synthesis/, artifacts/ directories.
    Returns list of (relative_path, content) tuples.
    """
    knowledge_dirs = ["kb", "synthesis", "artifacts"]
    files = []

    for dir_name in knowledge_dirs:
        dir_path = mind_path / dir_name
        if not dir_path.exists():
            continue

        for md_file in sorted(dir_path.rglob("*.md")):
            relative = md_file.relative_to(mind_path)
            content = md_file.read_text(encoding="utf-8")
            if content.strip():
                files.append((str(relative), content))

    return files
```

### Step 5: Chunk Content

Uses LangChain's RecursiveCharacterTextSplitter with markdown-aware separators
to create semantically coherent chunks.

```python
from langchain_text_splitters import RecursiveCharacterTextSplitter

CHUNK_SIZE = 800
CHUNK_OVERLAP = 100

def chunk_text(text: str, source: str) -> list[dict]:
    """Split text into chunks with metadata."""
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
        separators=["\n## ", "\n### ", "\n\n", "\n", ". ", " "],
    )

    chunks = splitter.split_text(text)
    return [
        {"content": chunk, "source": source, "chunk_index": i}
        for i, chunk in enumerate(chunks)
    ]
```

**Separator hierarchy:**
1. `\n## ` - H2 headings (strongest boundary)
2. `\n### ` - H3 headings
3. `\n\n` - Paragraph breaks
4. `\n` - Line breaks
5. `. ` - Sentence boundaries
6. ` ` - Word boundaries (last resort)

**Why these parameters:**
- `chunk_size=800`: Balances context richness with embedding quality
- `chunk_overlap=100`: Preserves context continuity at chunk boundaries
- Markdown separators: Respects document structure

### Step 6: Generate Embeddings

Uses OpenAI text-embedding-3-small (1536 dimensions) for vector representations.
Processes in batches of 100 to respect API rate limits.

```python
from openai import OpenAI

EMBEDDING_MODEL = "text-embedding-3-small"

def generate_embeddings(openai_client: OpenAI, texts: list[str]) -> list[list[float]]:
    """Generate embeddings for a list of texts using OpenAI."""
    all_embeddings = []
    batch_size = 100

    for i in range(0, len(texts), batch_size):
        batch = texts[i : i + batch_size]
        response = openai_client.embeddings.create(
            model=EMBEDDING_MODEL,
            input=batch,
        )
        batch_embeddings = [item.embedding for item in response.data]
        all_embeddings.extend(batch_embeddings)
        print(f"  Embedded batch {i//batch_size + 1} ({len(batch)} texts)")

    return all_embeddings
```

**Cost estimation:**
- text-embedding-3-small: ~$0.02 per 1M tokens
- Average mind (50 chunks, ~500 tokens each): ~25K tokens = ~$0.0005

### Step 7: Upsert to Supabase

```python
from supabase import create_client, Client

def upsert_mind_and_chunks(
    supabase: Client,
    mind_slug: str,
    system_prompt: str,
    cognitive_profile: dict,
    all_chunks: list[dict],
    embeddings: list[list[float]],
) -> str:
    """Upsert mind record and insert chunks with embeddings."""

    # 1. Upsert mind record
    mind_data = {
        "slug": mind_slug,
        "name": mind_slug.replace("_", " ").title(),
        "system_prompt": system_prompt,
        "cognitive_profile": cognitive_profile,
    }

    result = supabase.table("minds").upsert(
        mind_data, on_conflict="slug"
    ).execute()

    mind_id = result.data[0]["id"]
    print(f"  Mind record upserted (id: {mind_id})")

    # 2. Delete old chunks for this mind (clean re-index)
    supabase.table("mind_chunks").delete().eq("mind_id", mind_id).execute()
    print(f"  Old chunks deleted")

    # 3. Insert new chunks in batches
    batch_size = 50
    inserted = 0

    for i in range(0, len(all_chunks), batch_size):
        batch = all_chunks[i : i + batch_size]
        batch_embeddings = embeddings[i : i + batch_size]

        rows = [
            {
                "mind_id": mind_id,
                "content": chunk["content"],
                "embedding": embedding,
                "metadata": {
                    "source": chunk["source"],
                    "chunk_index": chunk["chunk_index"],
                },
            }
            for chunk, embedding in zip(batch, batch_embeddings)
        ]

        supabase.table("mind_chunks").insert(rows).execute()
        inserted += len(rows)
        print(f"  Inserted {inserted}/{len(all_chunks)} chunks...")

    return mind_id
```

### Step 8: Validate Ingestion with Test Query

After inserting chunks, run a test query to verify the search pipeline works.

```python
def validate_ingestion(supabase: Client, mind_id: str, openai_client: OpenAI) -> dict:
    """Run a test query to validate the ingestion."""
    test_query = "Quem e voce? Qual sua filosofia?"

    # Generate test embedding
    response = openai_client.embeddings.create(
        model=EMBEDDING_MODEL,
        input=test_query,
    )
    test_embedding = response.data[0].embedding

    # Test hybrid search RPC
    hybrid_ok = False
    try:
        result = supabase.rpc("search_mind_chunks", {
            "p_mind_id": mind_id,
            "p_query_text": test_query,
            "p_query_embedding": test_embedding,
            "p_match_count": 3,
        }).execute()
        hybrid_ok = len(result.data) > 0
        print(f"  Hybrid search: {'OK' if hybrid_ok else 'EMPTY'} ({len(result.data)} results)")
    except Exception as e:
        print(f"  Hybrid search: FAILED ({e})")

    # Test pure vector search RPC
    vector_ok = False
    try:
        result = supabase.rpc("match_mind_chunks", {
            "p_mind_id": mind_id,
            "p_query_embedding": test_embedding,
            "p_match_count": 3,
        }).execute()
        vector_ok = len(result.data) > 0
        print(f"  Vector search: {'OK' if vector_ok else 'EMPTY'} ({len(result.data)} results)")
    except Exception as e:
        print(f"  Vector search: FAILED ({e})")

    return {
        "hybrid_search": hybrid_ok,
        "vector_search": vector_ok,
        "test_query": test_query,
    }
```

### Step 9: Generate Ingestion Report

```python
def print_report(
    mind_slug: str,
    mind_id: str,
    file_count: int,
    chunk_count: int,
    estimated_tokens: int,
    validation: dict,
) -> None:
    """Print final ingestion report."""
    print(f"\n{'='*60}")
    print(f"  INGESTION COMPLETE")
    print(f"{'='*60}")
    print(f"  Mind: {mind_slug} (id: {mind_id})")
    print(f"  Files processed: {file_count}")
    print(f"  Chunks created: {chunk_count}")
    print(f"  Estimated tokens: ~{estimated_tokens:,}")
    print(f"  Hybrid search: {'OK' if validation['hybrid_search'] else 'FAILED'}")
    print(f"  Vector search: {'OK' if validation['vector_search'] else 'FAILED'}")
    print(f"{'='*60}\n")
```

## Full Pipeline Execution

The complete ingestion pipeline (as implemented in `ingest_mind.py`):

```bash
# Standard usage
python outputs/mind-clone-bot/ingest_mind.py naval_ravikant

# Alternative flag syntax
python outputs/mind-clone-bot/ingest_mind.py --mind_slug naval_ravikant

# Using environment variable
DEFAULT_MIND_SLUG=naval_ravikant python outputs/mind-clone-bot/ingest_mind.py
```

**Pipeline steps (6 phases):**
1. Resolve mind directory path
2. Read system prompt from system_prompts/
3. Read cognitive profile from analysis/cognitive-spec.yaml
4. Collect and chunk all knowledge files (kb/, synthesis/, artifacts/)
5. Generate embeddings via OpenAI text-embedding-3-small
6. Upsert mind record and insert chunks to Supabase

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Yes | Supabase service role key (write access) |
| `OPENAI_API_KEY` | Yes | OpenAI API key for embeddings |
| `DEFAULT_MIND_SLUG` | No | Fallback mind slug if not provided as argument |

## Example Execution

```bash
$ python ingest_mind.py jose_carlos_amorim

============================================================
  MMOS Mind Ingestion: jose_carlos_amorim
============================================================

[1/6] Mind directory: /Users/josecarlosamorim/mmos/outputs/minds/jose_carlos_amorim

[2/6] Reading system prompt...
  System prompt: system-prompt-generalista.md

[3/6] Reading cognitive profile...
  Cognitive profile: analysis/cognitive-spec.yaml

[4/6] Collecting knowledge files...
  Found 12 files
    kb/fragment-001.md: 3 chunks
    kb/fragment-002.md: 4 chunks
    synthesis/frameworks.md: 5 chunks
    synthesis/communication-style.md: 2 chunks
    synthesis/knowledge-domains.md: 6 chunks
    analysis/cognitive-spec.yaml: 2 chunks

  Total chunks: 22

[5/6] Generating embeddings (text-embedding-3-small)...
  Generated 22 embeddings
  Estimated tokens embedded: ~8,500

[6/6] Upserting to Supabase...
  Mind record upserted (id: a1b2c3d4-...)
  Old chunks deleted
  Inserted 22/22 chunks...

============================================================
  Ingestion complete!
  Mind: jose_carlos_amorim (id: a1b2c3d4-...)
  Files processed: 12
  Chunks created: 22
  Estimated tokens: ~8,500
============================================================
```

## Error Handling

| Error | Cause | Recovery |
|-------|-------|----------|
| Mind directory not found | Slug typo or MMOS not run | Check outputs/minds/ and run MMOS pipeline |
| No content files | Empty kb/synthesis dirs | Add knowledge files or run MMOS synthesis phase |
| Supabase connection failed | Wrong URL/key or network | Verify SUPABASE_URL and SUPABASE_SERVICE_KEY |
| OpenAI rate limit | Too many embedding requests | Script handles batching; increase wait if needed |
| RPC function not found | Missing SQL migration | Run the CREATE FUNCTION statements from schema section |
| Chunk insert failed | Schema mismatch | Verify mind_chunks table has embedding VECTOR(1536) column |

## Dependencies (requirements.txt)

```
openai>=1.0.0
supabase>=2.0.0
python-dotenv>=1.0.0
langchain-text-splitters>=0.2.0
PyYAML>=6.0
```

## Notes

- The ingestion is **destructive by default**: old chunks are deleted before re-inserting
- System prompt is stored in the `minds` table, NOT chunked into `mind_chunks`
- The `sources/` directory is intentionally excluded (raw material, not processed knowledge)
- Embedding dimensions (1536) must match the pgvector column definition
- For large minds (>200 chunks), consider increasing the IVFFlat lists parameter
- Re-ingestion is safe and idempotent (upsert on mind, delete+insert on chunks)

---

**Task Version:** 1.0.0
**Created:** 2026-02-14
**Agent:** rag-architect (RAG Pipeline Designer)
