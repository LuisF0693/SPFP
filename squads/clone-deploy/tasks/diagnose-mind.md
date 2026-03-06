---
task-id: diagnose-mind
name: Mind Quality Diagnosis
agent: clone-diagnostician
version: 1.0.0
purpose: Evaluate mind quality and readiness for deployment as a conversational clone

workflow-mode: interactive
elicit: true
elicitation-type: custom

prerequisites:
  - Mind processed by MMOS Mind Mapper pipeline
  - Mind directory exists at outputs/minds/{slug}/
  - Supabase instance accessible (if chunks already ingested)

inputs:
  - name: mind_slug
    type: string
    description: The slug of the mind to diagnose (e.g., "naval_ravikant")
    required: true

  - name: check_supabase
    type: boolean
    description: Whether to also check Supabase for ingested chunks
    required: false
    default: true

  - name: threshold
    type: enum
    description: Quality threshold for GO/NO-GO decision
    required: false
    options: ["strict", "standard", "lenient"]
    default: "standard"

outputs:
  - path: "outputs/mind-clone-bot/reports/diagnosis-{slug}-{timestamp}.yaml"
    description: Full diagnosis report with scores and GO/NO-GO verdict
    format: yaml

  - path: "stdout"
    description: Human-readable summary printed to console
    format: text

dependencies:
  agents:
    - clone-diagnostician
  tools:
    - supabase (pgvector)
    - openai (embeddings)
  files:
    - outputs/minds/{slug}/system_prompts/*.md
    - outputs/minds/{slug}/analysis/cognitive-spec.yaml
    - outputs/minds/{slug}/synthesis/*.md
    - outputs/minds/{slug}/kb/*.md

validation:
  success-criteria:
    - "Mind directory exists and contains required files"
    - "System prompt found and readable"
    - "Quality score calculated across all dimensions"
    - "GO/NO-GO verdict issued with justification"

  warning-conditions:
    - "System prompt token count < 2000 (may be too thin)"
    - "No cognitive-spec.yaml found (missing personality layer)"
    - "Fewer than 5 knowledge files (limited RAG context)"
    - "Supabase chunk count < 20 (insufficient for hybrid search)"

  failure-conditions:
    - "Mind directory does not exist"
    - "No system prompt file found"
    - "System prompt is empty or unreadable"
    - "Total knowledge content < 500 tokens"

estimated-duration: "30-60 seconds"
---

# Diagnose Mind Task

## Purpose

Evaluate a mind's completeness, quality, and readiness for deployment as a conversational
clone bot. This task runs a comprehensive diagnostic that checks file structure, content
quality, Supabase ingestion status, and produces a GO/NO-GO recommendation.

**Use before:** Any deployment task (deploy-whatsapp, deploy-telegram, deploy-webapp).
**Use after:** MMOS Mind Mapper pipeline completion or ingest-mind task.

## When to Use This Task

**Use this task when:**
- Before deploying a mind clone to any channel
- After running the MMOS pipeline to validate outputs
- After ingesting a mind to verify Supabase data
- User invokes `/CloneDeploy:tasks:diagnose-mind`
- As the first step of the full-pipeline workflow

**Do NOT use this task when:**
- Mind has not been processed by MMOS yet (run pipeline first)
- Just checking if a directory exists (use `ls` instead)
- Testing clone conversation quality (use test-fidelity instead)

## Quality Dimensions

The diagnosis evaluates 6 dimensions, each scored 0-100:

| Dimension | Weight | What It Checks |
|-----------|--------|-----------------|
| Structure | 15% | Directory layout, required files present |
| System Prompt | 25% | Token count, section coverage, persona depth |
| Knowledge Base | 20% | File count, total tokens, topic diversity |
| Cognitive Profile | 15% | cognitive-spec.yaml completeness |
| Supabase Status | 15% | Chunk count, embedding health, RPC functions |
| Deployment Ready | 10% | Env vars, config, dependencies |

## Key Activities & Instructions

### Step 1: Validate Mind Directory Structure

```python
import os
from pathlib import Path

MINDS_BASE = "outputs/minds"

def check_structure(mind_slug: str) -> dict:
    """Validate the mind directory structure."""
    mind_path = Path(MINDS_BASE) / mind_slug

    results = {
        "directory_exists": mind_path.exists(),
        "system_prompts_dir": (mind_path / "system_prompts").exists(),
        "analysis_dir": (mind_path / "analysis").exists(),
        "synthesis_dir": (mind_path / "synthesis").exists(),
        "kb_dir": (mind_path / "kb").exists(),
        "implementation_dir": (mind_path / "implementation").exists(),
        "sources_dir": (mind_path / "sources").exists(),
    }

    # Check for required files
    results["has_system_prompt"] = False
    if results["system_prompts_dir"]:
        md_files = list((mind_path / "system_prompts").glob("*.md"))
        results["has_system_prompt"] = len(md_files) > 0
        results["system_prompt_files"] = [f.name for f in md_files]

    results["has_cognitive_spec"] = (
        mind_path / "analysis" / "cognitive-spec.yaml"
    ).exists()

    results["has_identity_core"] = (
        mind_path / "analysis" / "identity-core.yaml"
    ).exists()

    # Score: each present item adds points
    required = ["directory_exists", "has_system_prompt"]
    optional = [
        "system_prompts_dir", "analysis_dir", "synthesis_dir",
        "kb_dir", "has_cognitive_spec", "has_identity_core",
    ]

    required_score = sum(1 for k in required if results[k]) / len(required) * 60
    optional_score = sum(1 for k in optional if results[k]) / len(optional) * 40
    results["score"] = int(required_score + optional_score)

    return results
```

**Critical check:** If `directory_exists` is False, STOP immediately with NO-GO.
**Critical check:** If `has_system_prompt` is False, STOP with NO-GO.

### Step 2: Analyze System Prompt Quality

```python
def analyze_system_prompt(mind_path: Path) -> dict:
    """Deep analysis of the system prompt content."""
    prompts_dir = mind_path / "system_prompts"
    md_files = sorted(prompts_dir.glob("*.md"))

    if not md_files:
        return {"score": 0, "error": "No system prompt found"}

    prompt_file = md_files[0]
    content = prompt_file.read_text(encoding="utf-8")

    # Token estimation
    token_count = len(content) // 4
    char_count = len(content)
    line_count = content.count("\n") + 1

    # Section detection - check for key persona sections
    sections_found = {
        "identity": any(
            s in content.lower()
            for s in ["identidade", "identity", "quem sou", "who i am"]
        ),
        "communication_style": any(
            s in content.lower()
            for s in ["comunicacao", "communication", "estilo", "style", "tom", "tone"]
        ),
        "knowledge_domain": any(
            s in content.lower()
            for s in ["conhecimento", "knowledge", "expertise", "dominio"]
        ),
        "mental_models": any(
            s in content.lower()
            for s in ["framework", "modelo mental", "mental model", "heuristic"]
        ),
        "values": any(
            s in content.lower()
            for s in ["valores", "values", "principios", "principles"]
        ),
        "boundaries": any(
            s in content.lower()
            for s in ["limites", "boundaries", "nao faca", "do not", "avoid"]
        ),
        "signature_phrases": any(
            s in content.lower()
            for s in ["frase", "phrase", "signature", "bordao", "catchphrase"]
        ),
    }

    sections_coverage = sum(sections_found.values()) / len(sections_found) * 100

    # Token quality thresholds
    if token_count >= 8000:
        token_score = 100
    elif token_count >= 4000:
        token_score = 80
    elif token_count >= 2000:
        token_score = 60
    elif token_count >= 1000:
        token_score = 40
    else:
        token_score = 20

    # Combined score
    score = int(token_score * 0.4 + sections_coverage * 0.6)

    return {
        "score": score,
        "file": prompt_file.name,
        "char_count": char_count,
        "line_count": line_count,
        "estimated_tokens": token_count,
        "sections_found": sections_found,
        "sections_coverage_pct": round(sections_coverage, 1),
        "token_quality": "rich" if token_count >= 4000 else "adequate" if token_count >= 2000 else "thin",
    }
```

### Step 3: Evaluate Knowledge Base

```python
def evaluate_knowledge_base(mind_path: Path) -> dict:
    """Evaluate KB completeness and diversity."""
    kb_dirs = ["kb", "synthesis", "artifacts"]
    all_files = []
    total_tokens = 0
    topics = set()

    for dir_name in kb_dirs:
        dir_path = mind_path / dir_name
        if not dir_path.exists():
            continue

        for md_file in dir_path.rglob("*.md"):
            content = md_file.read_text(encoding="utf-8")
            tokens = len(content) // 4
            total_tokens += tokens
            all_files.append({
                "path": str(md_file.relative_to(mind_path)),
                "tokens": tokens,
            })

            # Extract topic from filename
            topic = md_file.stem.replace("-", " ").replace("_", " ")
            topics.add(topic)

    file_count = len(all_files)

    # Scoring
    if file_count >= 20 and total_tokens >= 10000:
        score = 100
    elif file_count >= 10 and total_tokens >= 5000:
        score = 80
    elif file_count >= 5 and total_tokens >= 2000:
        score = 60
    elif file_count >= 2:
        score = 40
    else:
        score = 20

    return {
        "score": score,
        "file_count": file_count,
        "total_tokens": total_tokens,
        "topic_diversity": len(topics),
        "files": all_files[:10],  # Top 10 for report
        "quality": "rich" if score >= 80 else "adequate" if score >= 60 else "sparse",
    }
```

### Step 4: Check Cognitive Profile

```python
import yaml

def check_cognitive_profile(mind_path: Path) -> dict:
    """Validate cognitive-spec.yaml completeness."""
    spec_path = mind_path / "analysis" / "cognitive-spec.yaml"

    if not spec_path.exists():
        return {"score": 0, "error": "cognitive-spec.yaml not found"}

    with open(spec_path, "r", encoding="utf-8") as f:
        spec = yaml.safe_load(f) or {}

    # Check for key sections in cognitive spec
    expected_sections = [
        "identity", "personality", "communication",
        "knowledge", "values", "frameworks",
        "obsessions", "contradictions",
    ]

    found = sum(1 for s in expected_sections if s in spec)
    coverage = found / len(expected_sections) * 100

    # Check identity-core.yaml too
    identity_path = mind_path / "analysis" / "identity-core.yaml"
    has_identity = identity_path.exists()

    score = int(coverage * 0.7 + (30 if has_identity else 0))

    return {
        "score": score,
        "has_cognitive_spec": True,
        "has_identity_core": has_identity,
        "sections_found": found,
        "sections_expected": len(expected_sections),
        "coverage_pct": round(coverage, 1),
    }
```

### Step 5: Check Supabase Ingestion Status

```python
def check_supabase_status(mind_slug: str) -> dict:
    """Check if mind is ingested in Supabase and chunk health."""
    from supabase import create_client

    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_KEY")

    if not supabase_url or not supabase_key:
        return {"score": 0, "error": "Supabase credentials not set"}

    supabase = create_client(supabase_url, supabase_key)

    # Check if mind record exists
    mind_result = (
        supabase.table("minds")
        .select("id, slug, name, created_at")
        .eq("slug", mind_slug)
        .execute()
    )

    if not mind_result.data:
        return {
            "score": 0,
            "mind_exists": False,
            "message": "Mind not found in Supabase. Run ingest-mind first.",
        }

    mind_id = mind_result.data[0]["id"]

    # Count chunks
    chunk_result = (
        supabase.table("mind_chunks")
        .select("id", count="exact")
        .eq("mind_id", mind_id)
        .execute()
    )

    chunk_count = chunk_result.count or 0

    # Test search RPC availability
    rpc_available = False
    try:
        supabase.rpc("search_mind_chunks", {
            "p_mind_id": mind_id,
            "p_query_text": "test",
            "p_query_embedding": [0.0] * 1536,
            "p_match_count": 1,
        }).execute()
        rpc_available = True
    except Exception:
        pass

    # Score
    if chunk_count >= 50 and rpc_available:
        score = 100
    elif chunk_count >= 20 and rpc_available:
        score = 80
    elif chunk_count >= 10:
        score = 60
    elif chunk_count > 0:
        score = 40
    else:
        score = 0

    return {
        "score": score,
        "mind_exists": True,
        "mind_id": mind_id,
        "chunk_count": chunk_count,
        "search_rpc_available": rpc_available,
        "health": "healthy" if score >= 80 else "degraded" if score >= 40 else "not_ingested",
    }
```

### Step 6: Check Deployment Readiness

```python
def check_deploy_readiness() -> dict:
    """Check if environment is ready for deployment."""
    env_vars = {
        "SUPABASE_URL": bool(os.getenv("SUPABASE_URL")),
        "SUPABASE_SERVICE_KEY": bool(os.getenv("SUPABASE_SERVICE_KEY")),
        "OPENAI_API_KEY": bool(os.getenv("OPENAI_API_KEY")),
        "ANTHROPIC_API_KEY": bool(os.getenv("ANTHROPIC_API_KEY")),
        "UAZAPI_TOKEN": bool(os.getenv("UAZAPI_TOKEN")),
        "UAZAPI_BASE_URL": bool(os.getenv("UAZAPI_BASE_URL")),
    }

    required = ["SUPABASE_URL", "SUPABASE_SERVICE_KEY", "OPENAI_API_KEY"]
    optional = ["ANTHROPIC_API_KEY", "UAZAPI_TOKEN", "UAZAPI_BASE_URL"]

    required_ok = all(env_vars[k] for k in required)
    optional_count = sum(1 for k in optional if env_vars[k])

    # Check core files
    core_files = {
        "clone_engine.py": Path("outputs/mind-clone-bot/clone_engine.py").exists(),
        "whatsapp_bot.py": Path("outputs/mind-clone-bot/whatsapp_bot.py").exists(),
        "ingest_mind.py": Path("outputs/mind-clone-bot/ingest_mind.py").exists(),
        "Dockerfile": Path("outputs/mind-clone-bot/Dockerfile").exists(),
        "requirements.txt": Path("outputs/mind-clone-bot/requirements.txt").exists(),
    }

    files_ok = sum(core_files.values()) / len(core_files) * 100

    score = 0
    if required_ok:
        score += 60
    score += int(optional_count / len(optional) * 20)
    score += int(files_ok * 0.2)

    return {
        "score": score,
        "env_vars": env_vars,
        "required_env_ok": required_ok,
        "core_files": core_files,
        "missing_required": [k for k in required if not env_vars[k]],
        "missing_optional": [k for k in optional if not env_vars[k]],
    }
```

### Step 7: Calculate Overall Score & Verdict

```python
def calculate_verdict(dimensions: dict, threshold: str = "standard") -> dict:
    """Calculate weighted overall score and issue GO/NO-GO verdict."""

    weights = {
        "structure": 0.15,
        "system_prompt": 0.25,
        "knowledge_base": 0.20,
        "cognitive_profile": 0.15,
        "supabase_status": 0.15,
        "deploy_readiness": 0.10,
    }

    weighted_score = sum(
        dimensions[dim]["score"] * weights[dim]
        for dim in weights
        if dim in dimensions
    )

    # Thresholds
    thresholds = {
        "strict": {"go": 85, "conditional": 70},
        "standard": {"go": 70, "conditional": 50},
        "lenient": {"go": 50, "conditional": 30},
    }

    t = thresholds.get(threshold, thresholds["standard"])

    if weighted_score >= t["go"]:
        verdict = "GO"
        message = "Mind is ready for deployment."
    elif weighted_score >= t["conditional"]:
        verdict = "CONDITIONAL GO"
        message = "Mind can be deployed with noted limitations."
    else:
        verdict = "NO-GO"
        message = "Mind is not ready. Address issues before deployment."

    # Identify blockers
    blockers = []
    for dim, data in dimensions.items():
        if data["score"] < 30:
            blockers.append(f"{dim}: score {data['score']}% (critical)")

    # Identify improvements
    improvements = []
    for dim, data in dimensions.items():
        if 30 <= data["score"] < 70:
            improvements.append(f"{dim}: score {data['score']}% (needs attention)")

    return {
        "overall_score": round(weighted_score, 1),
        "verdict": verdict,
        "message": message,
        "threshold_used": threshold,
        "blockers": blockers,
        "improvements": improvements,
    }
```

### Step 8: Generate Diagnosis Report

```yaml
# outputs/mind-clone-bot/reports/diagnosis-{slug}-{timestamp}.yaml
diagnosis:
  mind_slug: "{{slug}}"
  diagnosed_at: "{{timestamp}}"
  threshold: "{{threshold}}"

dimensions:
  structure:
    score: "{{score}}"
    details: "{{details}}"
  system_prompt:
    score: "{{score}}"
    estimated_tokens: "{{tokens}}"
    sections_coverage: "{{pct}}"
  knowledge_base:
    score: "{{score}}"
    file_count: "{{count}}"
    total_tokens: "{{tokens}}"
  cognitive_profile:
    score: "{{score}}"
    has_spec: "{{bool}}"
    has_identity: "{{bool}}"
  supabase_status:
    score: "{{score}}"
    chunk_count: "{{count}}"
    rpc_available: "{{bool}}"
  deploy_readiness:
    score: "{{score}}"
    required_env_ok: "{{bool}}"

verdict:
  overall_score: "{{score}}"
  decision: "{{GO|CONDITIONAL GO|NO-GO}}"
  message: "{{message}}"
  blockers: ["{{list}}"]
  improvements: ["{{list}}"]
```

### Step 9: Display Results to User

```
============================================================
  MIND DIAGNOSIS REPORT
============================================================

Mind: {{display_name}} ({{slug}})
Diagnosed: {{timestamp}}
Threshold: {{threshold}}

Dimension Scores:
  Structure:         {{score}}% {{bar}}
  System Prompt:     {{score}}% {{bar}}
  Knowledge Base:    {{score}}% {{bar}}
  Cognitive Profile: {{score}}% {{bar}}
  Supabase Status:   {{score}}% {{bar}}
  Deploy Readiness:  {{score}}% {{bar}}

Overall Score: {{overall_score}}%

VERDICT: {{GO|CONDITIONAL GO|NO-GO}}
{{message}}

Blockers:
  - {{blocker_1}}
  - {{blocker_2}}

Recommended Actions:
  -> {{action_1}}
  -> {{action_2}}

============================================================
```

## Example Execution

```bash
/CloneDeploy:tasks:diagnose-mind naval_ravikant

============================================================
  MIND DIAGNOSIS REPORT
============================================================

Mind: Naval Ravikant (naval_ravikant)
Diagnosed: 2026-02-14 10:30:00
Threshold: standard

Dimension Scores:
  Structure:         90% ==================
  System Prompt:     85% =================
  Knowledge Base:    75% ===============
  Cognitive Profile: 80% ================
  Supabase Status:   90% ==================
  Deploy Readiness:  70% ==============

Overall Score: 82.3%

VERDICT: GO
Mind is ready for deployment.

Recommended Actions:
  -> Add more knowledge files to improve RAG diversity
  -> Set UAZAPI_TOKEN env var for WhatsApp deployment

============================================================
```

## Error Handling

| Error | Recovery |
|-------|----------|
| Mind directory not found | Suggest running MMOS pipeline first |
| No system prompt | Check outputs/minds/{slug}/system_prompts/ |
| Supabase unreachable | Skip Supabase checks, note in report |
| Missing env vars | List missing vars with setup instructions |

## Notes

- Run this task BEFORE any deployment task to avoid partial deployments
- The diagnosis report is saved for audit trail and version comparison
- Supabase check can be skipped with `check_supabase: false` for offline diagnosis
- Re-run after any mind update to verify improvements

---

**Task Version:** 1.0.0
**Created:** 2026-02-14
**Agent:** clone-diagnostician (Mind Quality Analyst)
