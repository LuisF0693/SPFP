# Workflow: Full Clone Deployment Pipeline

**Workflow ID:** full-pipeline
**Version:** 1.0.0
**Purpose:** Complete end-to-end pipeline from mind diagnosis to multi-channel deployment with fidelity validation
**Duration:** 2-4 hours (first deploy), 30-60 min (subsequent deploys)
**Agents Involved:** 8 (clone-deploy-chief, clone-diagnostician, rag-architect, clone-builder, deploy-engineer, whatsapp-specialist, telegram-specialist, webapp-specialist)
**Phases:** 5
**Quality Gates:** 5
**Trigger:** `/CloneDeploy:workflows:full-pipeline` or `@clone-deploy-chief *deploy {mind_slug}`

---

## Overview

This workflow orchestrates the complete lifecycle of deploying a cognitive clone. It takes a mind processed by MMOS Mind Mapper, validates its readiness, ingests source materials into a RAG pipeline (Supabase pgvector), builds a clone engine with persona fidelity, deploys to one or more channels (WhatsApp, Telegram, Web App), and validates the clone through fidelity testing and monitoring setup.

**Principle:** Quality gates are blocking. A clone that passes all gates will faithfully represent the original mind. A clone that fails any gate is stopped before reaching users.

**Dependency:** Requires a mind processed by MMOS Mind Mapper at `outputs/minds/{mind_slug}/`.

---

## Flow Diagram

```
PHASE 1: DIAGNOSIS (Gate: Mind Readiness)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@clone-diagnostician
        │
        ▼
  Validate mind structure
  Check source quality
  Assess persona completeness
  Score readiness (0-100)
        │
        ▼
  GO (score >= 70) / NO-GO (score < 70)
        │
        │  GO
        ▼
PHASE 2: INGESTION (Gate: RAG Quality)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@rag-architect
        │
        ▼
  Chunk source materials
  Generate embeddings (OpenAI ada-002)
  Store in Supabase pgvector
  Build hybrid search index
  Validate retrieval quality
        │
        ▼
  RAG benchmark score >= 0.75
        │
        │  PASS
        ▼
PHASE 3: BUILD (Gate: Clone Fidelity)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@clone-builder
        │
        ▼
  Generate system prompt from PersonaTwin
  Configure clone engine parameters
  Tune persona settings (tone, vocabulary, frameworks)
  Smoke test with 5 calibration questions
        │
        ▼
  Fidelity score >= 7.0/10.0
        │
        │  PASS
        ▼
PHASE 4: DEPLOY (Gate: Health Check)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@deploy-engineer + channel specialists
        │
        ├──────────────────┬──────────────────┐
        ▼                  ▼                  ▼
  WhatsApp            Telegram           Web App
  @whatsapp-spec      @telegram-spec     @webapp-spec
  UazAPI webhook      Bot API webhook    REST API
  Docker deploy       Docker deploy      Docker deploy
  EasyPanel           EasyPanel          EasyPanel
        │                  │                  │
        └──────────────────┴──────────────────┘
        │
        ▼
  All channels respond 200 OK
        │
        │  PASS
        ▼
PHASE 5: VALIDATE (Gate: Production Ready)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@clone-deploy-chief + @clone-builder
        │
        ▼
  Run fidelity test suite (20 questions)
  Score on 6 dimensions
  Configure monitoring dashboards
  Set alert thresholds
  Generate deployment report
        │
        ▼
  Fidelity >= 7.0 AND all monitors green
        │
        ▼
  DEPLOYED - Clone is LIVE
```

---

## Phase 1: DIAGNOSIS

**Agent:** clone-diagnostician
**Task:** `diagnose-mind`
**Duration:** 15-30 minutes
**Purpose:** Evaluate whether the mind has sufficient quality and completeness for clone deployment

### Inputs Required

| Input | Source | Required |
|-------|--------|----------|
| `mind_slug` | User provides (e.g., `jose_carlos_amorim`) | Yes |
| `outputs/minds/{slug}/` | MMOS Mind Mapper output directory | Yes |
| `outputs/minds/{slug}/analysis/identity-core.yaml` | Identity core from MMOS Phase 3 | Yes |
| `outputs/minds/{slug}/analysis/cognitive-spec.yaml` | Cognitive spec from MMOS Phase 3 | Yes |
| `outputs/minds/{slug}/synthesis/` | Synthesis outputs from MMOS Phase 4 | Yes |
| `outputs/minds/{slug}/sources/` | Raw source materials | Yes |

### Steps

1. **Validate directory structure:**
   - Confirm `outputs/minds/{slug}/` exists
   - Check all required subdirectories: `sources/`, `analysis/`, `synthesis/`
   - Verify minimum file count in each directory
   - Flag missing directories as blocking errors

2. **Assess source material quality:**
   - Count total source files and aggregate word count
   - Classify sources by type (transcripts, articles, books, social media, interviews)
   - Check source diversity (minimum 3 source types recommended)
   - Evaluate temporal coverage (date range of sources)
   - Flag if total content < 50,000 words (warning) or < 20,000 words (blocking)

3. **Evaluate identity core completeness:**
   - Parse `identity-core.yaml` for required fields:
     - `name`, `role`, `domain`, `core_beliefs`, `values`
     - `communication_style`, `vocabulary`, `frameworks`
     - `personality_traits`, `emotional_patterns`
   - Score completeness: fields_present / fields_required * 100
   - Flag empty or placeholder values

4. **Evaluate cognitive spec completeness:**
   - Parse `cognitive-spec.yaml` for required sections:
     - `reasoning_patterns`, `decision_frameworks`
     - `knowledge_domains`, `expertise_depth`
     - `teaching_style`, `response_patterns`
   - Score completeness as above

5. **Check synthesis quality:**
   - Verify `frameworks.md` exists and has content
   - Verify `communication-style.md` exists and has content
   - Check for `system-prompt-generalista.md` or equivalent
   - Evaluate synthesis coherence (do frameworks match identity core?)

6. **Calculate readiness score:**
   ```
   readiness_score = (
     source_quality_score * 0.25 +
     identity_completeness * 0.25 +
     cognitive_completeness * 0.25 +
     synthesis_quality * 0.25
   ) * 100
   ```

7. **Generate diagnosis report:**
   - Overall score with GO/NO-GO recommendation
   - Breakdown by dimension
   - Specific gaps identified
   - Remediation steps if NO-GO

### Quality Gate QG-001: Mind Readiness

```yaml
gate: QG-001
name: "Mind Readiness Assessment"
type: blocking
criteria:
  - mind_directory_exists: true
  - identity_core_present: true
  - cognitive_spec_present: true
  - source_word_count: ">= 20000"
  - readiness_score: ">= 70"
pass_action: "Proceed to Phase 2 (Ingestion)"
fail_action: "Generate remediation report, return to MMOS Mind Mapper"
fail_output: "diagnosis-report.md with specific gaps and fix instructions"
```

### Checkpoint

Before proceeding to Phase 2, the following MUST be true:
- [ ] Mind directory exists at `outputs/minds/{slug}/`
- [ ] `identity-core.yaml` is present and has >= 80% field completeness
- [ ] `cognitive-spec.yaml` is present and has >= 80% field completeness
- [ ] Source materials total >= 20,000 words
- [ ] Readiness score >= 70/100
- [ ] Diagnosis report generated at `outputs/minds/{slug}/docs/diagnosis-report.md`

### Outputs Produced

| Output | Location | Description |
|--------|----------|-------------|
| Diagnosis Report | `outputs/minds/{slug}/docs/diagnosis-report.md` | Full readiness assessment with scores |
| Source Inventory | `outputs/minds/{slug}/docs/source-inventory.md` | Cataloged sources with metadata |
| GO/NO-GO Decision | Console output + report header | Binary deployment readiness |

---

## Phase 2: INGESTION

**Agent:** rag-architect
**Task:** `ingest-mind`
**Duration:** 30-60 minutes
**Purpose:** Process all source materials into optimized RAG chunks stored in Supabase pgvector

### Inputs Required

| Input | Source | Required |
|-------|--------|----------|
| Phase 1 GO decision | QG-001 passed | Yes |
| `outputs/minds/{slug}/sources/` | Source materials directory | Yes |
| `outputs/minds/{slug}/analysis/identity-core.yaml` | For metadata enrichment | Yes |
| Supabase connection string | `credentials.yaml` or `.env` | Yes |
| OpenAI API key | `credentials.yaml` or `.env` (for embeddings) | Yes |

### Steps

1. **Prepare Supabase schema:**
   - Verify Supabase pgvector extension is enabled
   - Create or verify table: `mind_chunks_{slug}`
   - Schema:
     ```sql
     CREATE TABLE IF NOT EXISTS mind_chunks_{slug} (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       content TEXT NOT NULL,
       metadata JSONB NOT NULL,
       embedding VECTOR(1536),
       source_file TEXT,
       source_type TEXT,
       chunk_index INTEGER,
       word_count INTEGER,
       created_at TIMESTAMPTZ DEFAULT NOW()
     );
     ```
   - Create indexes:
     ```sql
     CREATE INDEX IF NOT EXISTS idx_{slug}_embedding
       ON mind_chunks_{slug}
       USING ivfflat (embedding vector_cosine_ops);
     CREATE INDEX IF NOT EXISTS idx_{slug}_metadata
       ON mind_chunks_{slug}
       USING gin (metadata);
     CREATE INDEX IF NOT EXISTS idx_{slug}_content_fts
       ON mind_chunks_{slug}
       USING gin (to_tsvector('portuguese', content));
     ```

2. **Chunk source materials:**
   - Load all files from `sources/`
   - Apply chunking strategy per source type:
     - **Transcripts:** Chunk by speaker turn or topic shift, 500-800 tokens per chunk
     - **Articles/essays:** Chunk by paragraph/section, 400-600 tokens per chunk
     - **Books:** Chunk by section with overlap, 600-1000 tokens per chunk
     - **Social media:** Each post is its own chunk
     - **Interviews:** Q&A pairs as individual chunks
   - Add 50-token overlap between sequential chunks
   - Preserve metadata: source file, chunk index, source type, date (if available)

3. **Enrich chunks with metadata:**
   - Tag each chunk with relevant identity-core categories:
     - `topic`: extracted topic of the chunk
     - `framework`: if chunk references a known framework
     - `sentiment`: emotional tone (positive, neutral, reflective, critical)
     - `domain`: knowledge domain (from cognitive-spec)
   - Store metadata as JSONB for filtering during retrieval

4. **Generate embeddings:**
   - Use OpenAI `text-embedding-ada-002` (1536 dimensions)
   - Batch process: 100 chunks per API call
   - Validate embedding dimensions match vector column
   - Log any failed embeddings for retry

5. **Store in Supabase:**
   - Batch insert chunks with embeddings
   - Verify row count matches expected chunk count
   - Run sample queries to validate retrieval

6. **Build hybrid search function:**
   - Create Supabase RPC function for hybrid search:
     ```sql
     CREATE OR REPLACE FUNCTION search_{slug}(
       query_embedding VECTOR(1536),
       query_text TEXT,
       match_count INT DEFAULT 5,
       semantic_weight FLOAT DEFAULT 0.7
     ) RETURNS TABLE (
       id UUID,
       content TEXT,
       metadata JSONB,
       similarity FLOAT
     ) AS $$
     BEGIN
       RETURN QUERY
       SELECT
         mc.id,
         mc.content,
         mc.metadata,
         (semantic_weight * (1 - (mc.embedding <=> query_embedding)) +
          (1 - semantic_weight) * ts_rank(
            to_tsvector('portuguese', mc.content),
            plainto_tsquery('portuguese', query_text)
          )) AS similarity
       FROM mind_chunks_{slug} mc
       ORDER BY similarity DESC
       LIMIT match_count;
     END;
     $$ LANGUAGE plpgsql;
     ```

7. **Validate retrieval quality:**
   - Run 10 benchmark queries derived from identity-core topics
   - For each query, verify top-3 results are relevant
   - Calculate Mean Reciprocal Rank (MRR)
   - Calculate Precision@5
   - Log results for quality tracking

### Quality Gate QG-002: RAG Quality

```yaml
gate: QG-002
name: "RAG Pipeline Quality"
type: blocking
criteria:
  - chunks_stored: ">= 100"
  - embedding_failures: "< 5%"
  - hybrid_search_functional: true
  - mrr_score: ">= 0.75"
  - precision_at_5: ">= 0.60"
pass_action: "Proceed to Phase 3 (Build)"
fail_action: "Review chunking strategy, adjust parameters, re-ingest"
fail_output: "rag-quality-report.md with failed queries and retrieval analysis"
```

### Checkpoint

Before proceeding to Phase 3, the following MUST be true:
- [ ] Supabase table `mind_chunks_{slug}` exists with pgvector enabled
- [ ] All source files processed and chunked (>= 100 chunks)
- [ ] Embeddings generated for all chunks (< 5% failure rate)
- [ ] Hybrid search RPC function created and tested
- [ ] MRR score >= 0.75 on benchmark queries
- [ ] RAG quality report generated

### Outputs Produced

| Output | Location | Description |
|--------|----------|-------------|
| RAG chunks | Supabase `mind_chunks_{slug}` table | Chunked content with embeddings |
| Hybrid search function | Supabase RPC `search_{slug}` | Combined semantic + full-text search |
| Chunk manifest | `outputs/minds/{slug}/docs/chunk-manifest.json` | Chunk count, source mapping, stats |
| RAG quality report | `outputs/minds/{slug}/docs/rag-quality-report.md` | MRR, Precision, failed queries |
| Ingestion log | `outputs/minds/{slug}/logs/ingestion-log.md` | Timestamped processing log |

---

## Phase 3: BUILD

**Agent:** clone-builder
**Task:** `build-clone`
**Duration:** 30-45 minutes
**Purpose:** Create the clone engine with system prompt, persona configuration, and fidelity tuning

### Inputs Required

| Input | Source | Required |
|-------|--------|----------|
| Phase 2 passed (RAG ready) | QG-002 passed | Yes |
| `outputs/minds/{slug}/analysis/identity-core.yaml` | Identity core | Yes |
| `outputs/minds/{slug}/analysis/cognitive-spec.yaml` | Cognitive spec | Yes |
| `outputs/minds/{slug}/synthesis/communication-style.md` | Communication style | Yes |
| `outputs/minds/{slug}/synthesis/frameworks.md` | Known frameworks | Yes |
| `outputs/minds/{slug}/implementation/system-prompt-generalista.md` | Base system prompt | Recommended |
| Clone config template | `squads/clone-deploy/templates/clone-config.yaml` | Yes |
| System prompt template | `squads/clone-deploy/templates/system-prompt-template.md` | Yes |

### Steps

1. **Generate system prompt:**
   - Load system prompt template
   - Inject identity-core values:
     - Name, role, domain expertise
     - Core beliefs and values
     - Communication style markers
     - Vocabulary and expressions
     - Known frameworks and mental models
   - Inject cognitive spec values:
     - Reasoning patterns and decision frameworks
     - Teaching style preferences
     - Response structure patterns
   - Inject RAG integration instructions:
     - How to use retrieved context
     - When to say "I don't know" vs. use general knowledge
     - Citation behavior
   - Add persona guardrails:
     - Stay in character boundaries
     - Handle off-topic gracefully
     - Never break persona for meta-questions
   - Output: `clone-system-prompt.md`

2. **Configure clone engine parameters:**
   - Create `clone-config.yaml` from template:
     ```yaml
     clone:
       mind_slug: "{slug}"
       display_name: "{name}"
       model: "claude-sonnet-4-20250514"
       temperature: 0.7
       max_tokens: 2048
       top_p: 0.9

     rag:
       supabase_table: "mind_chunks_{slug}"
       search_function: "search_{slug}"
       top_k: 5
       semantic_weight: 0.7
       min_similarity: 0.3
       context_window: 4000

     persona:
       greeting: "{personalized_greeting}"
       fallback_response: "{in_character_fallback}"
       off_topic_response: "{gentle_redirect}"
       language: "pt-BR"
       formality: "{from_identity_core}"
       humor_level: "{from_identity_core}"
       emoji_usage: "{from_identity_core}"

     guardrails:
       max_response_length: 2000
       block_sensitive_topics: true
       require_rag_context: false
       confidence_threshold: 0.5

     monitoring:
       log_conversations: true
       track_fidelity: true
       alert_on_low_confidence: true
     ```

3. **Tune persona settings:**
   - Analyze communication-style.md for:
     - Sentence length distribution (short, medium, long)
     - Paragraph structure preferences
     - Use of questions, analogies, stories
     - Emotional expression patterns
     - Technical depth default level
   - Create persona tuning parameters:
     - `avg_sentence_length`: target word count per sentence
     - `paragraph_style`: "dense" | "airy" | "conversational"
     - `analogy_frequency`: "never" | "rare" | "frequent" | "always"
     - `question_usage`: "never" | "rhetorical" | "socratic" | "frequent"
     - `storytelling`: "never" | "occasional" | "primary_device"

4. **Create clone engine file:**
   - Generate `clone_engine.py` (or update existing):
     - Load system prompt
     - Initialize Supabase client
     - Implement RAG retrieval pipeline
     - Implement conversation handler
     - Implement conversation history management
     - Add logging and monitoring hooks
   - Ensure gateway pattern compatibility (thin adapter interface)

5. **Smoke test with calibration questions:**
   - Run 5 calibration questions that test different dimensions:
     1. **Identity:** "Tell me about yourself and what you do"
     2. **Expertise:** "{domain_specific_question}"
     3. **Framework:** "How do you approach {known_framework}?"
     4. **Style:** "What advice would you give to someone starting in {domain}?"
     5. **Boundary:** "What do you think about {off_topic_subject}?"
   - For each response, score:
     - Persona consistency (1-10)
     - Knowledge accuracy (1-10)
     - Communication style match (1-10)
   - Calculate average fidelity score

### Quality Gate QG-003: Clone Fidelity

```yaml
gate: QG-003
name: "Clone Fidelity Assessment"
type: blocking
criteria:
  - system_prompt_generated: true
  - clone_config_created: true
  - clone_engine_functional: true
  - calibration_avg_score: ">= 7.0"
  - no_calibration_score_below: 5.0
pass_action: "Proceed to Phase 4 (Deploy)"
fail_action: "Iterate on system prompt and persona tuning, re-test"
fail_iterations_max: 3
fail_escalation: "Flag for human review if 3 iterations fail"
```

### Checkpoint

Before proceeding to Phase 4, the following MUST be true:
- [ ] System prompt generated at `outputs/mind-clone-bot/clone-system-prompt.md`
- [ ] Clone config created at `outputs/mind-clone-bot/clone-config.yaml`
- [ ] Clone engine file created/updated at `outputs/mind-clone-bot/clone_engine.py`
- [ ] 5 calibration questions answered with avg score >= 7.0
- [ ] No single calibration score below 5.0
- [ ] Build report generated

### Outputs Produced

| Output | Location | Description |
|--------|----------|-------------|
| System prompt | `outputs/mind-clone-bot/clone-system-prompt.md` | Full persona system prompt |
| Clone config | `outputs/mind-clone-bot/clone-config.yaml` | Engine configuration |
| Clone engine | `outputs/mind-clone-bot/clone_engine.py` | Core engine with RAG integration |
| Calibration report | `outputs/minds/{slug}/docs/calibration-report.md` | Smoke test results |
| Build log | `outputs/minds/{slug}/logs/build-log.md` | Timestamped build process |

---

## Phase 4: DEPLOY

**Agent:** deploy-engineer + channel specialists (whatsapp-specialist, telegram-specialist, webapp-specialist)
**Tasks:** `deploy-whatsapp`, `deploy-telegram`, `deploy-webapp`
**Duration:** 30-60 minutes per channel
**Purpose:** Deploy the clone bot to selected communication channels

### Inputs Required

| Input | Source | Required |
|-------|--------|----------|
| Phase 3 passed (clone built) | QG-003 passed | Yes |
| Clone engine + config | Phase 3 outputs | Yes |
| Channel selection | User selects which channels to deploy | Yes |
| Channel credentials | `credentials.yaml` or `.env` | Per channel |
| Docker/EasyPanel access | Infrastructure credentials | Yes |

### Step 4.0: Channel Selection

**Agent:** clone-deploy-chief

1. **Present available channels:**
   ```
   Select deployment channels:
   1. WhatsApp (via UazAPI) - requires UazAPI instance + phone number
   2. Telegram (via Bot API) - requires Telegram Bot Token
   3. Web App (REST API) - requires domain + hosting
   4. All channels
   ```

2. **Validate credentials for selected channels:**
   - WhatsApp: UazAPI URL, API key, phone number connected
   - Telegram: Bot token from @BotFather, webhook URL
   - Web App: Domain configured, SSL certificate

3. **Prepare deployment manifest:**
   - Generate `deploy-manifest.yaml` from template
   - Include selected channels with their configs
   - Set environment variables per channel

### Step 4.1: Docker Build

**Agent:** deploy-engineer

1. **Create/verify Dockerfile:**
   ```dockerfile
   FROM python:3.11-slim
   WORKDIR /app
   COPY requirements.txt .
   RUN pip install --no-cache-dir -r requirements.txt
   COPY . .
   EXPOSE 8080
   CMD ["python", "whatsapp_bot.py"]
   ```

2. **Create/verify .dockerignore:**
   - Exclude: `.git`, `__pycache__`, `.env`, `*.md`, `tests/`

3. **Build Docker image:**
   ```bash
   docker build -t clone-{slug}:latest .
   ```

4. **Test locally:**
   ```bash
   docker run -p 8080:8080 --env-file .env clone-{slug}:latest
   curl http://localhost:8080/health
   ```

### Step 4.2: Deploy WhatsApp Channel

**Agent:** whatsapp-specialist
**Task:** `deploy-whatsapp`

1. **Configure UazAPI integration:**
   - Verify UazAPI instance is running and phone is connected
   - Set webhook URL: `https://{domain}/webhook/uazapi`
   - Configure webhook events: `messages.upsert`

2. **Deploy to EasyPanel:**
   - Create/update service in EasyPanel
   - Set environment variables:
     - `UAZAPI_URL`, `UAZAPI_TOKEN`
     - `SUPABASE_URL`, `SUPABASE_KEY`
     - `ANTHROPIC_API_KEY`
     - `MIND_SLUG`
   - Configure health check endpoint: `/health`
   - Set restart policy: `always`

3. **Verify deployment:**
   - Health check returns 200
   - Webhook receives test message
   - Bot responds correctly to test message

### Step 4.3: Deploy Telegram Channel

**Agent:** telegram-specialist
**Task:** `deploy-telegram`

1. **Configure Telegram Bot:**
   - Verify bot token with `getMe` API call
   - Set webhook: `https://{domain}/webhook/telegram`
   - Configure allowed updates: `message`, `callback_query`

2. **Deploy to EasyPanel:**
   - Create/update service (can share container with WhatsApp if using gateway pattern)
   - Set environment variables:
     - `TELEGRAM_BOT_TOKEN`
     - `TELEGRAM_WEBHOOK_SECRET`
     - All shared vars (Supabase, Anthropic, slug)
   - Configure health check

3. **Verify deployment:**
   - Health check returns 200
   - `/start` command responds with greeting
   - Bot responds correctly to test message

### Step 4.4: Deploy Web App Channel

**Agent:** webapp-specialist
**Task:** `deploy-webapp`

1. **Configure REST API:**
   - Set up API endpoints:
     - `POST /api/chat` - Send message, receive response
     - `GET /api/health` - Health check
     - `GET /api/info` - Clone metadata
   - Configure CORS for allowed origins
   - Set up rate limiting

2. **Deploy embeddable chat widget (optional):**
   - Generate widget embed code
   - Configure widget appearance (colors, avatar, greeting)
   - Set widget domain restrictions

3. **Deploy to EasyPanel:**
   - Create/update service
   - Configure domain + SSL
   - Set environment variables
   - Configure health check

4. **Verify deployment:**
   - Health check returns 200
   - API accepts and responds to chat requests
   - Widget loads correctly (if applicable)

### Quality Gate QG-004: Deployment Health

```yaml
gate: QG-004
name: "Deployment Health Check"
type: blocking
criteria:
  - all_selected_channels_deployed: true
  - health_checks_passing: true
  - test_message_response: true
  - response_time: "< 10s"
  - no_error_logs: true
pass_action: "Proceed to Phase 5 (Validate)"
fail_action: "Debug failing channel, check logs, retry deployment"
fail_output: "deploy-error-report.md with logs and diagnostics"
```

### Checkpoint

Before proceeding to Phase 5, the following MUST be true:
- [ ] Docker image built and tested locally
- [ ] All selected channels deployed to EasyPanel
- [ ] Health checks passing on all channels (HTTP 200)
- [ ] Test message sent and received correctly on each channel
- [ ] Response time < 10 seconds on all channels
- [ ] No error logs in first 5 minutes of operation
- [ ] Deployment manifest saved

### Outputs Produced

| Output | Location | Description |
|--------|----------|-------------|
| Docker image | EasyPanel registry | Deployable container image |
| Deployment manifest | `outputs/mind-clone-bot/deploy-manifest.yaml` | Channel configs and endpoints |
| WhatsApp config | EasyPanel service config | UazAPI integration settings |
| Telegram config | EasyPanel service config | Bot API integration settings |
| Web App config | EasyPanel service config | REST API + widget settings |
| Deploy log | `outputs/minds/{slug}/logs/deploy-log.md` | Timestamped deployment process |

---

## Phase 5: VALIDATE

**Agent:** clone-deploy-chief + clone-builder
**Task:** `test-fidelity` + `monitor-health`
**Duration:** 30-45 minutes
**Purpose:** Validate clone fidelity across multiple dimensions and configure production monitoring

### Inputs Required

| Input | Source | Required |
|-------|--------|----------|
| Phase 4 passed (channels deployed) | QG-004 passed | Yes |
| Deployed channel endpoints | Phase 4 outputs | Yes |
| `outputs/minds/{slug}/analysis/identity-core.yaml` | For benchmark generation | Yes |
| Fidelity report template | `squads/clone-deploy/templates/fidelity-report.md` | Yes |
| Fidelity checklist | `squads/clone-deploy/checklists/fidelity-checklist.md` | Yes |

### Step 5.1: Generate Benchmark Test Suite

**Agent:** clone-builder

1. **Create 20 benchmark questions across 6 dimensions:**

   | Dimension | Questions | What it Tests |
   |-----------|-----------|---------------|
   | Identity (3) | "Who are you?", "What drives you?", "What's your story?" | Persona accuracy |
   | Expertise (4) | Domain-specific questions from cognitive-spec | Knowledge depth |
   | Frameworks (3) | Questions about known methodologies | Framework application |
   | Communication (3) | Open-ended advice questions | Style and tone match |
   | Boundaries (3) | Off-topic, controversial, meta questions | Guardrail enforcement |
   | Consistency (4) | Rephrased versions of earlier questions | Response stability |

2. **Define expected response characteristics for each question:**
   - Key phrases or concepts that should appear
   - Tone and formality level expected
   - Maximum and minimum response length
   - Topics that should NOT appear

### Step 5.2: Execute Fidelity Test

**Agent:** clone-deploy-chief

1. **Send all 20 questions through deployed channels:**
   - Use the primary deployed channel for testing
   - Record full responses with timestamps
   - Measure response latency for each

2. **Score each response on 6 dimensions (1-10 scale):**

   | Dimension | Weight | Scoring Criteria |
   |-----------|--------|-----------------|
   | Persona Accuracy | 25% | Does it sound like the original person? |
   | Knowledge Depth | 20% | Are answers substantively correct? |
   | Communication Style | 20% | Does tone/vocabulary match? |
   | Framework Usage | 15% | Does it reference known frameworks correctly? |
   | Boundary Respect | 10% | Does it handle off-topic gracefully? |
   | Consistency | 10% | Are rephrased questions answered similarly? |

3. **Calculate composite fidelity score:**
   ```
   fidelity_score = sum(dimension_score * weight) for each dimension
   ```

4. **Generate fidelity report:**
   - Overall score and verdict
   - Breakdown by dimension with examples
   - Strongest and weakest areas
   - Specific improvement recommendations

### Step 5.3: Configure Monitoring

**Agent:** deploy-engineer

1. **Set up health monitoring:**
   - Endpoint polling every 60 seconds
   - Alert on: 3 consecutive failures, response time > 15s
   - Alert channels: WhatsApp notification to owner, email

2. **Set up conversation analytics:**
   - Log all conversations (with user consent)
   - Track metrics:
     - Messages per day
     - Average response time
     - Average response length
     - Conversation depth (messages per session)
     - User satisfaction signals (if available)

3. **Set up fidelity monitoring:**
   - Weekly automated fidelity test (5 benchmark questions)
   - Alert if fidelity drops below 6.5
   - Monthly full fidelity test (20 questions)

4. **Create monitoring dashboard config:**
   - Define panels for each metric
   - Set alert thresholds
   - Configure notification routing

### Quality Gate QG-005: Production Ready

```yaml
gate: QG-005
name: "Production Readiness"
type: blocking
criteria:
  - fidelity_score: ">= 7.0"
  - no_dimension_below: 5.0
  - health_monitoring_configured: true
  - conversation_logging_enabled: true
  - fidelity_monitoring_scheduled: true
  - deployment_report_generated: true
pass_action: "Mark clone as LIVE, notify stakeholders"
fail_action: "Return to Phase 3 for system prompt iteration"
fail_output: "fidelity-report.md with specific areas needing improvement"
```

### Checkpoint

Before marking clone as LIVE, the following MUST be true:
- [ ] 20 benchmark questions answered and scored
- [ ] Composite fidelity score >= 7.0
- [ ] No single dimension scored below 5.0
- [ ] Health monitoring configured and active
- [ ] Conversation logging enabled
- [ ] Weekly fidelity monitoring scheduled
- [ ] Deployment report generated and saved
- [ ] Stakeholder notification sent

### Outputs Produced

| Output | Location | Description |
|--------|----------|-------------|
| Fidelity report | `outputs/minds/{slug}/docs/fidelity-report.md` | Full 20-question assessment |
| Monitoring config | `outputs/mind-clone-bot/monitoring-config.yaml` | Dashboard and alert settings |
| Deployment report | `outputs/minds/{slug}/docs/deployment-report.md` | Complete deployment summary |
| Benchmark suite | `outputs/minds/{slug}/docs/benchmark-questions.json` | Reusable test questions |

---

## Error Handling

```yaml
phase_1_errors:
  mind_not_found:
    action: "List available minds, ask user to confirm slug"
    command: "ls outputs/minds/"
  incomplete_mind:
    action: "Generate gap report, recommend running MMOS pipeline phases"

phase_2_errors:
  supabase_connection_failed:
    action: "Check credentials, verify Supabase project status"
  embedding_api_failure:
    action: "Retry with exponential backoff, switch to backup model if persistent"
  low_mrr_score:
    action: "Adjust chunking parameters, add more source context, re-ingest"

phase_3_errors:
  low_calibration_score:
    action: "Iterate system prompt (max 3 iterations), then escalate to human"
  clone_engine_crash:
    action: "Check dependencies, validate config, review error logs"

phase_4_errors:
  docker_build_failure:
    action: "Check Dockerfile, verify dependencies, review build logs"
  easypanel_deploy_failure:
    action: "Check EasyPanel access, verify domain, review service logs"
  webhook_not_receiving:
    action: "Verify URL, check SSL, test with curl, check firewall"

phase_5_errors:
  low_fidelity_score:
    action: "Identify weakest dimensions, iterate system prompt, re-test"
  monitoring_setup_failure:
    action: "Manually configure alerts, document workaround"
```

---

## Rollback Procedures

| Scenario | Rollback Action |
|----------|----------------|
| Phase 2 fails after partial ingestion | Drop Supabase table, re-ingest from scratch |
| Phase 3 produces poor clone | Revert to previous system prompt version, re-test |
| Phase 4 deploy breaks existing service | Rollback EasyPanel to previous deployment |
| Phase 5 fidelity too low | Return to Phase 3, iterate (max 3 times) |
| Complete pipeline failure | Archive artifacts, generate failure report, start fresh |

---

## Workflow Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Total pipeline duration (first deploy) | < 4 hours | Timer from Phase 1 start to Phase 5 end |
| Total pipeline duration (subsequent) | < 1 hour | Phases 3-5 only |
| Mind readiness pass rate | > 80% | Percentage of minds passing QG-001 |
| RAG quality pass rate | > 90% | Percentage passing QG-002 on first attempt |
| Clone fidelity first-pass rate | > 70% | Percentage passing QG-003 without iteration |
| Deployment success rate | > 95% | Percentage passing QG-004 on first attempt |
| Production fidelity | >= 7.0/10.0 | Ongoing weekly fidelity scores |

---

## Agents Summary

| Phase | Agent | Role | Handoff To |
|-------|-------|------|------------|
| 1 | clone-diagnostician | Evaluates mind readiness | rag-architect (if GO) |
| 2 | rag-architect | Builds RAG pipeline | clone-builder |
| 3 | clone-builder | Creates clone engine | deploy-engineer |
| 4 | deploy-engineer | Orchestrates deployment | channel specialists |
| 4a | whatsapp-specialist | WhatsApp via UazAPI | deploy-engineer |
| 4b | telegram-specialist | Telegram via Bot API | deploy-engineer |
| 4c | webapp-specialist | Web App REST API | deploy-engineer |
| 5 | clone-deploy-chief | Fidelity validation | (end) |

---

## Handoff: Pipeline Complete

When the pipeline finishes successfully, the clone-deploy-chief generates a final handoff:

```markdown
## Clone Deployment Complete

**Mind:** {mind_slug}
**Date:** {date}
**Duration:** {total_duration}

### Deployed Channels
- WhatsApp: {url} (status: LIVE)
- Telegram: @{bot_username} (status: LIVE)
- Web App: {url} (status: LIVE)

### Scores
- Mind Readiness: {score}/100
- RAG Quality (MRR): {score}
- Clone Fidelity: {score}/10.0

### Monitoring
- Health check: every 60s
- Fidelity test: weekly (5q) + monthly (20q)
- Alerts: WhatsApp + email

### Next Steps
- Monitor first 48h for anomalies
- Review first 10 real conversations for quality
- Schedule fidelity review in 7 days
```

---

_Workflow Version: 1.0.0_
_Last Updated: 2026-02-14_
_Squad: clone-deploy_
_Dependencies: mmos-mind-mapper (required), etl-data-collector (optional)_
