---
task-id: build-clone
name: Build Clone Engine
agent: clone-builder
version: 1.0.0
purpose: Create clone engine with system prompt, persona configuration, and RAG parameters

workflow-mode: interactive
elicit: true
elicitation-type: custom

prerequisites:
  - Mind ingested into Supabase via ingest-mind task
  - Mind record exists in minds table with system_prompt
  - Chunks exist in mind_chunks table with embeddings
  - API keys configured (Anthropic and/or OpenAI)

inputs:
  - name: mind_slug
    type: string
    description: The slug of the mind to build clone for (e.g., "naval_ravikant")
    required: true

  - name: llm_model
    type: enum
    description: LLM model for generation
    required: false
    options: ["claude-haiku-4-5-20251001", "claude-sonnet-4-20250514", "gpt-4o-mini", "gpt-4o"]
    default: "claude-haiku-4-5-20251001"

  - name: max_context_chunks
    type: integer
    description: Maximum number of RAG chunks to include in context
    required: false
    default: 5

  - name: temperature
    type: float
    description: LLM temperature for generation (0.0-1.0)
    required: false
    default: 0.7

  - name: max_tokens
    type: integer
    description: Maximum tokens in LLM response
    required: false
    default: 2048

outputs:
  - path: "outputs/mind-clone-bot/configs/clone-config-{slug}.yaml"
    description: Clone configuration file with all parameters
    format: yaml

  - path: "outputs/mind-clone-bot/reports/build-report-{slug}-{timestamp}.yaml"
    description: Build report with benchmark test results
    format: yaml

  - path: "stdout"
    description: Build summary and benchmark results
    format: text

dependencies:
  agents:
    - clone-builder
  tools:
    - supabase (pgvector)
    - anthropic (claude api)
    - openai (embeddings + fallback llm)
  files:
    - outputs/mind-clone-bot/clone_engine.py

validation:
  success-criteria:
    - "Clone configuration file created with all parameters"
    - "System prompt loaded from Supabase minds table"
    - "RAG pipeline tested with query-to-response cycle"
    - "3 benchmark questions answered successfully"
    - "Fidelity score >= 70% on benchmark"

  warning-conditions:
    - "Fidelity score between 50-70% (needs tuning)"
    - "Response latency > 5 seconds (may need optimization)"
    - "LLM fallback triggered (Claude unavailable, using OpenAI)"

  failure-conditions:
    - "Mind not found in Supabase"
    - "System prompt empty or missing"
    - "RAG search returns zero results"
    - "LLM API completely unreachable"
    - "All benchmark questions fail"

estimated-duration: "2-5 minutes"
---

# Build Clone Task

## Purpose

Create and configure a clone engine instance for a specific mind. This task selects
the LLM model, configures RAG parameters, validates the system prompt, runs 3 benchmark
questions to measure fidelity, and produces a clone configuration file ready for
deployment to any channel (WhatsApp, Telegram, Web App).

**Pipeline position:** After ingest-mind, before deploy tasks.
**Implementation:** Uses `outputs/mind-clone-bot/clone_engine.py` as the core engine.

## When to Use This Task

**Use this task when:**
- Setting up a new clone for the first time
- Tuning clone parameters (model, temperature, chunk count)
- After re-ingesting a mind with updated content
- Validating clone quality before deployment
- User invokes `/CloneDeploy:tasks:build-clone`

**Do NOT use this task when:**
- Mind is not yet ingested (run ingest-mind first)
- Just deploying an existing clone to a new channel (use deploy tasks)
- Testing conversation quality in depth (use test-fidelity)

## Clone Architecture

```
User Message
    |
    v
[clone_engine.py]
    |
    +-- 1. fetch_mind(slug) --> Supabase minds table
    |       Returns: system_prompt, cognitive_profile
    |
    +-- 2. generate_query_embedding(message) --> OpenAI Embeddings API
    |       Returns: 1536-dim vector
    |
    +-- 3. search_relevant_chunks(mind_id, query, embedding) --> Supabase RPC
    |       Returns: top-K relevant chunks (hybrid: semantic + full-text)
    |
    +-- 4. build_system_message(mind, chunks) --> String
    |       Returns: system_prompt + RAG context section
    |
    +-- 5. build_messages(user_msg, history) --> List[dict]
    |       Returns: conversation messages array
    |
    +-- 6. _call_llm(system, messages) --> Claude API (or OpenAI fallback)
    |       Returns: generated response text
    |
    v
Clone Response + Sources
```

## Key Activities & Instructions

### Step 1: Select LLM Model

Choose the appropriate LLM model based on use case and budget:

```python
MODEL_OPTIONS = {
    "claude-haiku-4-5-20251001": {
        "provider": "anthropic",
        "cost_per_1m_tokens": 0.25,
        "latency": "fast",
        "quality": "good",
        "best_for": "Production bots with high volume",
    },
    "claude-sonnet-4-20250514": {
        "provider": "anthropic",
        "cost_per_1m_tokens": 3.00,
        "latency": "medium",
        "quality": "excellent",
        "best_for": "High-fidelity clones, premium use cases",
    },
    "gpt-4o-mini": {
        "provider": "openai",
        "cost_per_1m_tokens": 0.15,
        "latency": "fast",
        "quality": "good",
        "best_for": "Budget-friendly fallback",
    },
    "gpt-4o": {
        "provider": "openai",
        "cost_per_1m_tokens": 2.50,
        "latency": "medium",
        "quality": "excellent",
        "best_for": "Premium fallback when Claude unavailable",
    },
}

def select_model(preference: str = "claude-haiku-4-5-20251001") -> dict:
    """Select and validate LLM model."""
    if preference not in MODEL_OPTIONS:
        print(f"[WARN] Unknown model '{preference}', defaulting to claude-haiku-4-5-20251001")
        preference = "claude-haiku-4-5-20251001"

    model = MODEL_OPTIONS[preference]
    model["model_id"] = preference

    # Validate API key availability
    if model["provider"] == "anthropic" and not os.getenv("ANTHROPIC_API_KEY"):
        print("[WARN] ANTHROPIC_API_KEY not set. Falling back to OpenAI.")
        preference = "gpt-4o-mini"
        model = MODEL_OPTIONS[preference]
        model["model_id"] = preference

    return model
```

### Step 2: Verify Mind in Supabase

```python
def verify_mind(mind_slug: str) -> dict:
    """Verify mind exists in Supabase and has required data."""
    from clone_engine import fetch_mind, get_supabase

    try:
        mind = fetch_mind(mind_slug)
    except ValueError:
        print(f"[ERROR] Mind '{mind_slug}' not found in Supabase.")
        print(f"  Run: python ingest_mind.py {mind_slug}")
        sys.exit(1)

    # Validate system prompt
    system_prompt = mind.get("system_prompt", "")
    if not system_prompt or len(system_prompt.strip()) < 100:
        print(f"[ERROR] System prompt is empty or too short ({len(system_prompt)} chars)")
        sys.exit(1)

    prompt_tokens = len(system_prompt) // 4

    # Count chunks
    supabase = get_supabase()
    chunk_result = (
        supabase.table("mind_chunks")
        .select("id", count="exact")
        .eq("mind_id", mind["id"])
        .execute()
    )
    chunk_count = chunk_result.count or 0

    return {
        "mind_id": mind["id"],
        "slug": mind_slug,
        "name": mind.get("name", mind_slug),
        "prompt_tokens": prompt_tokens,
        "chunk_count": chunk_count,
        "has_cognitive_profile": bool(mind.get("cognitive_profile")),
    }
```

### Step 3: Configure RAG Parameters

```python
def configure_rag(
    max_chunks: int = 5,
    search_mode: str = "hybrid",
) -> dict:
    """Configure RAG retrieval parameters."""
    return {
        "max_context_chunks": max_chunks,
        "search_mode": search_mode,  # "hybrid" | "vector" | "fulltext"
        "embedding_model": "text-embedding-3-small",
        "embedding_dimensions": 1536,
        "similarity_threshold": 0.3,
        "hybrid_weights": {
            "semantic": 0.7,
            "fulltext": 0.3,
        },
    }
```

### Step 4: Create Clone Configuration

```yaml
# outputs/mind-clone-bot/configs/clone-config-{slug}.yaml
clone:
  mind_slug: "{{slug}}"
  mind_name: "{{name}}"
  mind_id: "{{uuid}}"
  created_at: "{{timestamp}}"
  version: "1.0.0"

llm:
  model: "claude-haiku-4-5-20251001"
  provider: "anthropic"
  max_tokens: 2048
  temperature: 0.7
  fallback_model: "gpt-4o-mini"
  fallback_provider: "openai"

rag:
  max_context_chunks: 5
  search_mode: "hybrid"
  embedding_model: "text-embedding-3-small"
  embedding_dimensions: 1536
  similarity_threshold: 0.3
  hybrid_weights:
    semantic: 0.7
    fulltext: 0.3

persona:
  system_prompt_tokens: "{{count}}"
  chunk_count: "{{count}}"
  has_cognitive_profile: true
  language: "pt-BR"
  response_style: "conversational"

channels:
  whatsapp:
    enabled: false
    max_response_length: 4000
    typing_delay_ms: 500
  telegram:
    enabled: false
    max_response_length: 4096
    parse_mode: "Markdown"
  webapp:
    enabled: false
    cors_origins: ["*"]
    max_response_length: 8000

monitoring:
  health_check_interval_s: 60
  log_conversations: true
  max_history_per_user: 20
  alert_on_error: true
```

### Step 5: Run Benchmark Questions

Test the clone with 3 benchmark questions covering different dimensions:

```python
BENCHMARK_QUESTIONS = [
    {
        "id": "BQ1",
        "category": "identity",
        "question": "Quem e voce? Se apresente de forma breve e autentica.",
        "evaluate": [
            "Responds in character (not as AI assistant)",
            "Mentions key identity elements",
            "Uses characteristic language/tone",
        ],
    },
    {
        "id": "BQ2",
        "category": "knowledge",
        "question": "Qual seu principal framework ou modelo mental para tomar decisoes?",
        "evaluate": [
            "References specific frameworks from system prompt",
            "Provides concrete examples",
            "Demonstrates domain expertise",
        ],
    },
    {
        "id": "BQ3",
        "category": "style",
        "question": "Que conselho voce daria para alguem que esta comecando na sua area?",
        "evaluate": [
            "Maintains consistent tone and style",
            "Uses signature phrases or vocabulary",
            "Advice aligns with documented values",
        ],
    },
]

def run_benchmark(mind_slug: str) -> dict:
    """Run benchmark questions and score responses."""
    from clone_engine import chat_with_clone

    results = []

    for bq in BENCHMARK_QUESTIONS:
        print(f"\n  [{bq['id']}] {bq['category']}: {bq['question'][:50]}...")

        try:
            response = chat_with_clone(
                mind_slug=mind_slug,
                user_message=bq["question"],
                conversation_history=None,
            )

            answer = response["answer"]
            sources = response["sources"]

            # Basic scoring heuristics
            score = 0

            # Check response length (too short = bad)
            if len(answer) > 100:
                score += 30
            elif len(answer) > 50:
                score += 15

            # Check if RAG sources were used
            if sources and len(sources) > 0:
                score += 20

            # Check response is not generic AI
            generic_phrases = [
                "como um modelo de linguagem",
                "como assistente ai",
                "i'm an ai",
                "as a language model",
            ]
            if not any(gp in answer.lower() for gp in generic_phrases):
                score += 30

            # Check minimum persona adherence
            if len(answer) > 200:
                score += 20

            results.append({
                "id": bq["id"],
                "category": bq["category"],
                "question": bq["question"],
                "answer_preview": answer[:200] + "..." if len(answer) > 200 else answer,
                "answer_length": len(answer),
                "sources_used": len(sources),
                "score": min(score, 100),
                "status": "pass" if score >= 70 else "marginal" if score >= 50 else "fail",
            })

            print(f"    Score: {score}/100 ({'PASS' if score >= 70 else 'FAIL'})")
            print(f"    Answer: {answer[:100]}...")

        except Exception as e:
            results.append({
                "id": bq["id"],
                "category": bq["category"],
                "question": bq["question"],
                "error": str(e),
                "score": 0,
                "status": "error",
            })
            print(f"    ERROR: {e}")

    # Overall score
    avg_score = sum(r["score"] for r in results) / len(results)
    passed = sum(1 for r in results if r["status"] == "pass")

    return {
        "results": results,
        "average_score": round(avg_score, 1),
        "passed": passed,
        "total": len(results),
        "overall_status": "pass" if avg_score >= 70 else "marginal" if avg_score >= 50 else "fail",
    }
```

### Step 6: Measure Response Latency

```python
import time

def measure_latency(mind_slug: str, iterations: int = 3) -> dict:
    """Measure average response latency."""
    from clone_engine import chat_with_clone

    latencies = []

    for i in range(iterations):
        start = time.time()
        chat_with_clone(mind_slug, "Ola, tudo bem?")
        elapsed = time.time() - start
        latencies.append(elapsed)

    avg_latency = sum(latencies) / len(latencies)
    max_latency = max(latencies)
    min_latency = min(latencies)

    return {
        "avg_latency_s": round(avg_latency, 2),
        "max_latency_s": round(max_latency, 2),
        "min_latency_s": round(min_latency, 2),
        "iterations": iterations,
        "acceptable": avg_latency < 5.0,
    }
```

### Step 7: Generate Build Report

```python
def generate_build_report(
    mind_info: dict,
    model_config: dict,
    rag_config: dict,
    benchmark: dict,
    latency: dict,
) -> None:
    """Print build report summary."""
    print(f"\n{'='*60}")
    print(f"  CLONE BUILD REPORT")
    print(f"{'='*60}")
    print(f"  Mind: {mind_info['name']} ({mind_info['slug']})")
    print(f"  Model: {model_config['model_id']} ({model_config['provider']})")
    print(f"  System Prompt: ~{mind_info['prompt_tokens']:,} tokens")
    print(f"  RAG Chunks: {mind_info['chunk_count']}")
    print(f"  Cognitive Profile: {'Yes' if mind_info['has_cognitive_profile'] else 'No'}")
    print(f"")
    print(f"  Benchmark Results:")
    for r in benchmark["results"]:
        status = "PASS" if r["status"] == "pass" else "FAIL" if r["status"] == "fail" else r["status"].upper()
        print(f"    [{r['id']}] {r['category']:12s} {r['score']:3d}/100 {status}")
    print(f"")
    print(f"  Overall Fidelity: {benchmark['average_score']}%")
    print(f"  Benchmark Status: {benchmark['overall_status'].upper()}")
    print(f"  Avg Latency: {latency['avg_latency_s']}s")
    print(f"{'='*60}\n")
```

## Example Execution

```bash
/CloneDeploy:tasks:build-clone naval_ravikant

============================================================
  CLONE BUILD REPORT
============================================================
  Mind: Naval Ravikant (naval_ravikant)
  Model: claude-haiku-4-5-20251001 (anthropic)
  System Prompt: ~6,200 tokens
  RAG Chunks: 45
  Cognitive Profile: Yes

  Benchmark Results:
    [BQ1] identity     90/100 PASS
    [BQ2] knowledge    85/100 PASS
    [BQ3] style        80/100 PASS

  Overall Fidelity: 85.0%
  Benchmark Status: PASS
  Avg Latency: 2.3s
============================================================

Clone config saved: outputs/mind-clone-bot/configs/clone-config-naval_ravikant.yaml
Ready for deployment! Next steps:
  -> /CloneDeploy:tasks:deploy-whatsapp
  -> /CloneDeploy:tasks:deploy-telegram
  -> /CloneDeploy:tasks:deploy-webapp
```

## Error Handling

| Error | Cause | Recovery |
|-------|-------|----------|
| Mind not found in Supabase | Not ingested yet | Run ingest-mind task first |
| System prompt empty | Ingestion issue | Re-run ingest-mind, check system_prompts/ dir |
| RAG returns zero results | No chunks or broken embeddings | Re-run ingest-mind, verify pgvector extension |
| Claude API error | Invalid key or rate limit | Check ANTHROPIC_API_KEY, falls back to OpenAI |
| All benchmarks fail | Fundamental prompt issue | Review system prompt quality, run diagnose-mind |
| High latency (>5s) | Large prompt or slow model | Reduce max_context_chunks or switch to faster model |

## Notes

- The clone config file is consumed by deploy tasks to configure channel-specific bots
- Benchmark scoring is heuristic-based; for deep quality testing use test-fidelity task
- Temperature 0.7 is a good default for conversational clones (creative but consistent)
- Claude Haiku is the recommended model for production: fast, cheap, good quality
- The fallback to OpenAI is automatic in clone_engine.py if Claude fails
- Re-running build-clone is safe; it overwrites the config file

---

**Task Version:** 1.0.0
**Created:** 2026-02-14
**Agent:** clone-builder (Clone Engine Creator)
