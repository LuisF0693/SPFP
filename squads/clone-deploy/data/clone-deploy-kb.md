# Clone Deploy Knowledge Base

## Domain Overview

Mental clone deployment is the process of taking a processed cognitive profile (created by the MMOS Mind Mapper pipeline) and making it available as a live, interactive conversational agent across multiple channels. The deployed clone is a RAG-powered AI assistant that emulates a specific person's knowledge, voice, thinking patterns, and productive paradoxes. It uses Retrieval-Augmented Generation to ground responses in the person's actual knowledge base, producing answers that are both contextually accurate and stylistically authentic.

The clone-deploy pipeline bridges the gap between a static mind profile (system prompt + knowledge chunks sitting in files) and a production-grade chatbot that real users can interact with via WhatsApp, Telegram, or a web application.

---

## Key Concepts

### Mind

A processed cognitive profile output by the MMOS Mind Mapper pipeline. A mind consists of:

- **System Prompt**: The identity, voice, values, mental models, and behavioral boundaries that define the clone's personality. Built from all 8 DNA Mental cognitive layers.
- **Knowledge Chunks**: Vectorized fragments of the person's knowledge base (from books, interviews, frameworks, essays) stored in Supabase pgvector.
- **Cognitive Profile**: A YAML specification (`cognitive-spec.yaml`) capturing the person's cognitive architecture in structured form.
- **Mind Record**: A database row in the `minds` table containing slug, name, system_prompt, cognitive_profile, and status.

### RAG Pipeline

Retrieval-Augmented Generation is the core retrieval strategy. Instead of stuffing the entire knowledge base into the system prompt (which would exceed token limits and dilute relevance), the pipeline:

1. Embeds the user's query using `text-embedding-3-small` (1536 dimensions)
2. Searches `mind_chunks` in Supabase pgvector using hybrid search (semantic + full-text)
3. Returns the top-K most relevant chunks (default: 5)
4. Appends those chunks to the system prompt as "Conhecimento Relevante"
5. The LLM generates a response grounded in both persona and retrieved knowledge

### Clone Engine

The central component (`clone_engine.py`) that orchestrates the full RAG cycle:

1. **fetch_mind()** - Retrieves the mind record from Supabase (with in-memory caching)
2. **generate_query_embedding()** - Creates a vector embedding of the user's question
3. **search_relevant_chunks()** - Hybrid search via Supabase RPC, with vector-only and basic-query fallbacks
4. **build_system_message()** - Combines system prompt + RAG context into a single system message
5. **build_messages()** - Constructs the message list including conversation history
6. **_call_llm()** - Calls Claude Haiku 4.5 (primary) with GPT-4o-mini fallback
7. **chat_with_clone()** - Public API that ties all steps together

The clone engine is channel-agnostic. It receives a mind slug, a message, and optional conversation history, and returns an answer with sources.

### Channel Adapter

A thin integration layer per platform that handles:

- Receiving inbound messages (webhooks, polling)
- Extracting phone/user ID and message text from platform-specific payload formats
- Managing conversation history per user
- Calling `chat_with_clone()` from the clone engine
- Sending the response back through the platform's API

Current adapters:

| Channel | Adapter | Integration |
|---------|---------|-------------|
| WhatsApp | `whatsapp_bot.py` | UazAPI webhook |
| Telegram | `telegram_bot.py` | Bot API / grammY |
| Web App | `webapp_api.py` | REST API endpoint |

### Fidelity Score

A metric measuring how well the deployed clone represents the original mind. Based on the DPRF (Digital Persona Response Fidelity) framework:

- **95%+** - Exceptional, production-ready
- **85-94%** - Good, acceptable for deployment
- **75-84%** - Needs refinement, iterate on weak layers
- **Below 75%** - Significant issues, review Layer 6-8

Fidelity is tested through benchmark questions covering personality consistency, knowledge accuracy, style authenticity, paradox functionality, and edge cases.

### Mind Chunks

Vectorized knowledge fragments stored in the `mind_chunks` table in Supabase. Each chunk contains:

- `mind_id` - Foreign key to the parent mind
- `content` - The text content of the chunk
- `embedding` - The 1536-dimensional vector from text-embedding-3-small
- `metadata` - JSON with source file path and chunk index

Chunks are created by `ingest_mind.py` using `RecursiveCharacterTextSplitter` with:

- `chunk_size=800`
- `chunk_overlap=100`
- Separators: `["\n## ", "\n### ", "\n\n", "\n", ". ", " "]`

### System Prompt

The identity definition for a clone. Compiled from all 8 DNA Mental cognitive layers:

1. Identity Core (Layers 7+8) - Cognitive singularity + productive paradoxes
2. Meta Axioms (Layers 5+6) - Core obsessions + belief system
3. Values and Decision Framework (Layers 4+6) - Values hierarchy + mental models
4. Behavioral Patterns (Layer 3) - Recurring decision patterns
5. Communication Style (Layer 2) - Linguistic patterns, tone, metaphors
6. Knowledge Base (Layer 1) - Domain expertise areas

### Gateway Pattern

The architectural pattern used for multi-channel deployment: a platform-agnostic core engine with thin adapters per channel. This means:

- Business logic lives in `clone_engine.py` (one place)
- Each channel adapter is minimal (webhook parsing + response sending)
- Adding a new channel requires only a new adapter, not duplicating the engine
- Testing is simplified: test the engine once, test each adapter for I/O only

---

## Tech Stack

### Storage and Retrieval

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Vector DB | Supabase pgvector | Store and search mind_chunks embeddings |
| Database | Supabase PostgreSQL | Mind records, conversation logs, metadata |
| Embeddings | OpenAI text-embedding-3-small | 1536-dimension vectors for semantic search |
| Search | Supabase RPC functions | Hybrid search (semantic + full-text) with vector fallback |

### AI and Generation

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Primary LLM | Claude Haiku 4.5 (`claude-haiku-4-5-20251001`) | Main generation model for clone responses |
| Fallback LLM | GPT-4o-mini | Fallback when Claude API fails |
| Embeddings | OpenAI text-embedding-3-small | Query and chunk embedding |
| Text Splitting | LangChain RecursiveCharacterTextSplitter | Chunking knowledge files |

### Application Layer

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Web Framework | Flask | Webhook server for WhatsApp bot |
| HTTP Client | httpx | Outbound API calls (UazAPI, etc.) |
| Config | python-dotenv | Environment variable management |
| YAML | PyYAML | Cognitive profile parsing |

### Channel Integrations

| Channel | Technology | Purpose |
|---------|-----------|---------|
| WhatsApp | UazAPI | WhatsApp Business API wrapper |
| Telegram | python-telegram-bot / grammY | Telegram Bot API |
| Web App | Flask/FastAPI REST | Embeddable chat widget backend |

### Infrastructure

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Containerization | Docker (python:3.12-slim) | Reproducible deployment |
| Orchestration | EasyPanel | GUI-based Docker management with auto-SSL |
| DNS/SSL | Cloudflare | Domain management and SSL termination |
| Hosting | VPS/Cloud | Server running EasyPanel |

---

## Best Practices from Research

### Jerry Liu (LlamaIndex) - Chunking and Search

- **chunk_size=512** for general RAG (we use 800 for richer mind content)
- **chunk_overlap=50** minimum to preserve context across boundaries (we use 100)
- **Hybrid search** combining semantic similarity with keyword matching outperforms either alone
- **Metadata filtering** (by source, by section type) improves relevance significantly
- **Re-ranking** retrieved chunks before passing to LLM reduces noise

### PersonaTwin (ACL 2025) - Digital Twin Memory

- Persona-driven memory retrieval prioritizes chunks that match the persona's domain expertise
- Conversation context should influence which memories are retrieved (not just the current query)
- Memory consolidation: frequently accessed chunks should be weighted higher
- Temporal awareness: recent knowledge should be preferred when recency matters

### DPRF Framework - Digital Persona Response Fidelity

- Fidelity scoring across 5 dimensions: personality consistency, knowledge accuracy, style authenticity, paradox functionality, edge case handling
- Minimum 85% fidelity for production deployment
- Regular regression testing to catch drift over time
- A/B testing with real users provides the most reliable fidelity signal

### Gateway Pattern (amiable.dev) - Multi-Channel Architecture

- Platform-agnostic core engine that processes messages identically regardless of source
- Thin adapters that handle only platform-specific I/O (webhook parsing, response formatting)
- Shared conversation state across channels (same user, different platforms)
- Channel-specific formatting (WhatsApp supports bold/italic, Telegram supports HTML, etc.)

---

## Common Patterns

### Self-Chat Filter for WhatsApp

WhatsApp bots via UazAPI receive ALL messages, including those sent by others. The self-chat filter ensures the bot only responds in the owner's self-chat window:

```python
# 1. Check if message was sent by the owner (fromMe flag)
is_from_me = payload.get("message", {}).get("fromMe", False)
if not is_from_me:
    return  # Ignore messages from others

# 2. Check if the chat is the owner's self-chat
phone = extract_phone(payload)
if phone != OWNER_PHONE:
    return  # Ignore fromMe messages in other chats
```

This prevents the bot from responding to incoming messages from contacts and only activates when the owner types in their own chat window.

### Conversation History with Sliding Window

Maintain per-user conversation history with a maximum window size:

```python
MAX_HISTORY_PER_USER = 20

def add_to_history(phone, role, content):
    conversations[phone].append({"role": role, "content": content})
    if len(conversations[phone]) > MAX_HISTORY_PER_USER:
        conversations[phone] = conversations[phone][-MAX_HISTORY_PER_USER:]
```

The sliding window ensures:
- Context is preserved across turns
- Memory usage stays bounded
- Older, less relevant messages are dropped
- Token budget for the LLM remains predictable

### LLM Fallback Chain

Always implement a fallback chain to prevent total failure:

```
Claude Haiku 4.5 (primary)
    |-- on failure --> GPT-4o-mini (fallback)
        |-- on failure --> error message to user
```

The fallback catches API outages, rate limits, and transient errors without the user experiencing silence.

### Hybrid Search RPC with Vector Fallback

Three-tier search strategy:

1. **search_mind_chunks** RPC (hybrid: semantic + full-text) - Best quality
2. **match_mind_chunks** RPC (vector-only) - Good quality, simpler
3. **Basic query** with `.limit()` (no vector search) - Last resort

Each tier catches the exception from the previous and degrades gracefully.

### Health Endpoint for Monitoring

Every deployed bot exposes a `/health` endpoint:

```json
{
    "status": "ok",
    "mind": "jose_carlos_amorim",
    "active_conversations": 3,
    "timestamp": "2026-02-14T12:00:00Z"
}
```

This enables:
- EasyPanel health checks (auto-restart on failure)
- External monitoring (UptimeRobot, Healthchecks.io)
- Quick debugging (which mind is active, how many conversations)

---

## Anti-Patterns

### Hardcoding API Keys in Code

Never embed API keys, tokens, or secrets directly in source files. Always use environment variables loaded via `python-dotenv` or platform-level env var management (EasyPanel, Docker secrets).

### Monolithic Bot

Mixing channel-specific logic (webhook parsing, message formatting) with the clone engine (RAG, LLM calls) in a single file creates:

- Untestable code (cannot test RAG without simulating WhatsApp webhooks)
- Duplication when adding new channels
- Harder debugging (is the bug in the webhook parsing or the RAG pipeline?)

Always separate: channel adapter (thin) from clone engine (core).

### No Conversation History (Stateless Responses)

Without conversation history, the clone cannot:

- Reference previous turns ("As I mentioned earlier...")
- Build rapport over a conversation
- Understand follow-up questions ("Tell me more about that")
- Maintain coherent multi-turn dialogues

Always pass conversation history to the LLM, even if it is just the last 10-20 messages.

### Using Full Documents Instead of Chunked Knowledge

Stuffing entire documents into the context window:

- Wastes tokens on irrelevant content
- Reduces response quality (LLM attention diluted)
- Hits context window limits quickly
- Makes retrieval impossible (no granular search)

Always chunk knowledge into 500-1000 token fragments with overlap.

### Ignoring Fidelity Testing Before Production

Deploying a clone without fidelity testing risks:

- The clone contradicting the person's known positions
- Stylistic inconsistencies that break trust
- Knowledge gaps that produce hallucinated answers
- Paradoxes that are not productive (just confusing)

Always run benchmark questions and validate fidelity score before exposing to real users.

---

## Architecture Decisions

### Why Supabase pgvector Over Pinecone

| Factor | Supabase pgvector | Pinecone |
|--------|------------------|----------|
| Cost | Included in Supabase free/pro tier | Separate billing, scales with vectors |
| Familiarity | Standard PostgreSQL with extension | Proprietary API |
| RPC Functions | Custom SQL functions for hybrid search | Limited to their API |
| Co-location | Minds table + chunks in same DB | Separate system, needs sync |
| Flexibility | Full SQL for complex queries | Vector-only operations |
| Ecosystem | Supabase Auth, Storage, Realtime | Vector search only |

**Decision**: Supabase pgvector provides vector search with the full power of PostgreSQL, at lower cost, with all data co-located in one system. The trade-off (slightly lower vector search performance at massive scale) is irrelevant for mind clones (typically hundreds to low thousands of chunks per mind).

### Why Claude Haiku 4.5 Over GPT-4o-mini as Primary LLM

| Factor | Claude Haiku 4.5 | GPT-4o-mini |
|--------|-----------------|-------------|
| Instruction following | Excellent for persona constraints | Good but more likely to break character |
| System prompt adherence | Strict, respects boundaries | Sometimes overrides system prompt |
| Portuguese quality | Strong | Good |
| Persona consistency | Better at maintaining voice across turns | Tends to drift toward generic tone |
| Cost | Comparable | Comparable |

**Decision**: Claude Haiku 4.5 is the primary LLM because it follows system prompt instructions more faithfully, which is critical for persona clones where breaking character destroys the user experience. GPT-4o-mini serves as a reliable fallback for API outages.

### Why Flask Over FastAPI for MVP

| Factor | Flask | FastAPI |
|--------|-------|---------|
| Simplicity | Minimal boilerplate | Requires async patterns |
| Dependencies | Fewer | Pydantic, uvicorn, starlette |
| Webhook handling | Synchronous, straightforward | Async (overkill for webhook processing) |
| Debug experience | Simple, well-documented | More complex error traces |
| Migration path | Easy to swap to FastAPI later | N/A |

**Decision**: Flask is simpler for an MVP webhook server that processes one message at a time. The bot does not need async concurrency (WhatsApp webhooks are sequential per user). FastAPI remains a good choice for the web app REST API where concurrent connections matter.

### Why EasyPanel Over Raw Docker

| Factor | EasyPanel | Raw Docker/docker-compose |
|--------|-----------|---------------------------|
| SSL certificates | Automatic via Let's Encrypt | Manual setup with certbot |
| Environment variables | GUI management | `.env` files or Docker secrets |
| Deployment | Git push or image update via GUI | CLI commands, ssh access |
| Monitoring | Built-in logs viewer | Need separate logging stack |
| Multi-service | GUI for multiple apps | docker-compose files |
| Learning curve | Low (GUI-based) | Medium (CLI-based) |

**Decision**: EasyPanel provides a GUI layer over Docker that dramatically simplifies SSL, env var management, and log viewing. For a solo developer or small team deploying multiple clone bots, EasyPanel reduces DevOps overhead without sacrificing Docker's reproducibility.

---

## Database Schema Reference

### minds table

```sql
CREATE TABLE minds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    system_prompt TEXT,
    cognitive_profile JSONB,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
```

### mind_chunks table

```sql
CREATE TABLE mind_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mind_id UUID REFERENCES minds(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    embedding VECTOR(1536),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX ON mind_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

### Hybrid Search RPC

```sql
CREATE OR REPLACE FUNCTION search_mind_chunks(
    p_mind_id UUID,
    p_query_text TEXT,
    p_query_embedding VECTOR(1536),
    p_match_count INT DEFAULT 5
)
RETURNS TABLE (content TEXT, metadata JSONB, similarity FLOAT)
AS $$
    SELECT content, metadata,
           1 - (embedding <=> p_query_embedding) AS similarity
    FROM mind_chunks
    WHERE mind_id = p_mind_id
      AND (content ILIKE '%' || p_query_text || '%'
           OR 1 - (embedding <=> p_query_embedding) > 0.3)
    ORDER BY embedding <=> p_query_embedding
    LIMIT p_match_count;
$$ LANGUAGE sql;
```

---

## Quick Reference

### File Structure

```
outputs/mind-clone-bot/
    clone_engine.py      # Core RAG engine (channel-agnostic)
    ingest_mind.py       # Mind ingestion pipeline (files -> Supabase)
    whatsapp_bot.py      # WhatsApp channel adapter (UazAPI)
    telegram_bot.py      # Telegram channel adapter (Bot API)
    webapp_api.py        # Web App REST API adapter
    Dockerfile           # Container definition (python:3.12-slim)
    .dockerignore        # Build exclusions
    .env                 # Environment variables (not versioned)
    requirements.txt     # Python dependencies
```

### Required Environment Variables

```bash
# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGci...

# OpenAI (embeddings only)
OPENAI_API_KEY=sk-...

# Anthropic (primary LLM)
ANTHROPIC_API_KEY=sk-ant-api03-...

# WhatsApp (UazAPI)
UAZAPI_BASE_URL=https://xxx.uazapi.com
UAZAPI_TOKEN=your-token

# Clone configuration
DEFAULT_MIND_SLUG=jose_carlos_amorim
OWNER_PHONE=559281951096
CLAUDE_MODEL=claude-haiku-4-5-20251001
```

### Ingestion Command

```bash
python ingest_mind.py jose_carlos_amorim
```

### Deployment Command (Docker)

```bash
docker build -t mind-clone-bot .
docker run -p 8080:8080 --env-file .env mind-clone-bot
```

---

_Version: 1.0.0_
_Last Updated: 2026-02-14_
_Squad: clone-deploy_
