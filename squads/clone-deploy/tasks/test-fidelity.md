---
task-id: test-fidelity
name: Clone Fidelity Testing
agent: clone-builder
version: 1.0.0
purpose: Test clone fidelity with benchmark questions across multiple dimensions

workflow-mode: hybrid
elicit: true
elicitation-type: custom

prerequisites:
  - Mind ingested into Supabase (ingest-mind completed)
  - Clone engine functional (build-clone completed)
  - API keys configured (Anthropic and/or OpenAI)

inputs:
  - name: mind_slug
    type: string
    description: The slug of the mind to test (e.g., "naval_ravikant")
    required: true

  - name: test_protocol
    type: enum
    description: Testing depth level
    required: false
    options: ["quick", "standard", "deep"]
    default: "standard"

  - name: evaluator
    type: enum
    description: Who evaluates the responses
    required: false
    options: ["auto", "human", "hybrid"]
    default: "hybrid"

outputs:
  - path: "outputs/mind-clone-bot/reports/fidelity-{slug}-{timestamp}.yaml"
    description: Fidelity test results with scores per dimension
    format: yaml

  - path: "stdout"
    description: Human-readable fidelity report
    format: text

dependencies:
  agents:
    - clone-builder
  tools:
    - clone_engine.py (chat_with_clone function)
    - supabase (mind data)
  files:
    - outputs/mind-clone-bot/clone_engine.py

validation:
  success-criteria:
    - "All benchmark questions answered by clone"
    - "Each response scored across evaluation criteria"
    - "Overall fidelity score calculated"
    - "Strengths and weaknesses identified"
    - "Improvement recommendations generated"

  warning-conditions:
    - "Fidelity score between 50-70% (needs improvement)"
    - "Any single category below 50%"

  failure-conditions:
    - "Mind not found in Supabase"
    - "Clone engine fails to respond"
    - "Overall fidelity below 30%"

estimated-duration: "3-10 minutes depending on protocol"
---

# Test Fidelity Task

## Purpose

Execute structured fidelity testing to validate that the deployed clone accurately
represents the target personality's thinking patterns, communication style, knowledge
depth, and decision-making frameworks. This is the quality gate before or after deployment.

**Pipeline position:** After build-clone, can be run before or after deploy tasks.
**Executor:** Hybrid - AI generates questions and scores, human reviews and validates.

## When to Use This Task

**Use this task when:**
- After building a clone for the first time
- After re-ingesting updated mind content
- Before deploying to a production channel
- Periodically to detect fidelity regression
- User invokes `/CloneDeploy:tasks:test-fidelity`

**Do NOT use this task when:**
- Mind is not yet ingested
- Quick build validation (build-clone includes 3 basic benchmarks)
- Testing infrastructure/deployment (use monitor-health)

## Test Protocols

### Quick Protocol (5 questions, ~3 minutes)

| # | Category | Question Type |
|---|----------|---------------|
| 1 | Identity | Self-introduction |
| 2 | Knowledge | Domain expertise |
| 3 | Knowledge | Framework explanation |
| 4 | Style | Advice giving |
| 5 | Edge | Out-of-domain handling |

**Pass threshold:** 60%

### Standard Protocol (10 questions, ~5 minutes)

| # | Category | Question Type |
|---|----------|---------------|
| 1 | Identity | Self-introduction |
| 2 | Identity | Values articulation |
| 3 | Knowledge | Domain expertise (specific) |
| 4 | Knowledge | Framework application |
| 5 | Knowledge | Counter-argument handling |
| 6 | Style | Tone and vocabulary |
| 7 | Style | Storytelling / analogies |
| 8 | Opinion | Controversial topic stance |
| 9 | Edge | Unknown topic handling |
| 10 | Edge | Boundary testing |

**Pass threshold:** 70%

### Deep Protocol (15+ questions, ~10 minutes)

All standard questions plus:

| # | Category | Question Type |
|---|----------|---------------|
| 11 | Identity | Contradiction handling |
| 12 | Knowledge | Deep domain detail |
| 13 | Knowledge | Cross-domain connection |
| 14 | Style | Emotional response |
| 15 | Opinion | Nuanced position |

**Pass threshold:** 80%

## Key Activities & Instructions

### Step 1: Generate Benchmark Questions

```python
def generate_benchmark_questions(protocol: str = "standard") -> list[dict]:
    """Generate benchmark questions based on protocol depth."""

    base_questions = [
        {
            "id": "F01",
            "category": "identity",
            "question": "Quem e voce? Se apresente de forma breve e autentica.",
            "criteria": [
                "Responds in character (not as generic AI)",
                "Mentions key identity elements from system prompt",
                "Uses characteristic tone and vocabulary",
            ],
            "weight": 1.0,
        },
        {
            "id": "F02",
            "category": "identity",
            "question": "Quais sao seus valores fundamentais? O que te guia?",
            "criteria": [
                "Articulates values consistent with system prompt",
                "Provides specific examples, not generic platitudes",
                "Values hierarchy matches documented priorities",
            ],
            "weight": 1.0,
        },
        {
            "id": "F03",
            "category": "knowledge",
            "question": "Explique seu principal framework ou modelo mental para resolver problemas.",
            "criteria": [
                "References specific frameworks from knowledge base",
                "Explains with depth, not surface-level summary",
                "Uses correct terminology from domain",
            ],
            "weight": 1.5,
        },
        {
            "id": "F04",
            "category": "knowledge",
            "question": "Me de um exemplo pratico de como voce aplicaria seu conhecimento.",
            "criteria": [
                "Provides concrete, actionable example",
                "Example aligns with documented expertise",
                "Shows reasoning process, not just conclusion",
            ],
            "weight": 1.0,
        },
        {
            "id": "F05",
            "category": "knowledge",
            "question": "Alguem discorda de voce sobre [domain topic]. Como responde?",
            "criteria": [
                "Handles disagreement gracefully, in character",
                "Defends position with evidence/reasoning",
                "Does not become defensive or break character",
            ],
            "weight": 1.0,
        },
        {
            "id": "F06",
            "category": "style",
            "question": "Que conselho voce daria para alguem comecando na sua area?",
            "criteria": [
                "Advice tone matches persona (mentor/peer/expert/etc)",
                "Uses signature phrases or vocabulary",
                "Structures response in characteristic way",
            ],
            "weight": 1.0,
        },
        {
            "id": "F07",
            "category": "style",
            "question": "Me conte uma historia ou analogia que ilustre seu pensamento.",
            "criteria": [
                "Uses analogies/metaphors consistent with persona",
                "Storytelling style matches documented communication",
                "Draws from relevant domain experience",
            ],
            "weight": 1.0,
        },
        {
            "id": "F08",
            "category": "opinion",
            "question": "Qual sua opiniao sobre o futuro da sua area nos proximos 10 anos?",
            "criteria": [
                "Provides a definitive opinion (not wishy-washy)",
                "Opinion aligns with documented worldview",
                "Reasoning is coherent with other stated positions",
            ],
            "weight": 1.0,
        },
        {
            "id": "F09",
            "category": "edge",
            "question": "O que voce acha sobre um assunto completamente fora da sua area?",
            "criteria": [
                "Gracefully acknowledges knowledge limits",
                "May offer a perspective through own lens",
                "Does not fabricate expertise it does not have",
            ],
            "weight": 0.8,
        },
        {
            "id": "F10",
            "category": "edge",
            "question": "Me diga algo que voce mudou de opiniao ao longo do tempo.",
            "criteria": [
                "Shows intellectual humility",
                "References plausible evolution of thought",
                "Stays authentic, does not invent experiences",
            ],
            "weight": 0.8,
        },
    ]

    if protocol == "quick":
        return [q for q in base_questions if q["id"] in ["F01", "F03", "F04", "F06", "F09"]]
    elif protocol == "standard":
        return base_questions
    else:  # deep
        deep_questions = base_questions + [
            {
                "id": "F11",
                "category": "identity",
                "question": "Voce ja se contradisse em algo? Como lida com paradoxos?",
                "criteria": [
                    "Acknowledges productive contradictions",
                    "Explains nuance authentically",
                    "Does not get defensive",
                ],
                "weight": 1.0,
            },
            {
                "id": "F12",
                "category": "knowledge",
                "question": "Explique em detalhe tecnico um conceito especifico do seu dominio.",
                "criteria": [
                    "Demonstrates deep technical knowledge",
                    "Correct use of domain jargon",
                    "Level of detail matches expert-level discourse",
                ],
                "weight": 1.5,
            },
            {
                "id": "F13",
                "category": "knowledge",
                "question": "Como seu conhecimento se conecta com outras areas?",
                "criteria": [
                    "Makes interdisciplinary connections",
                    "Connections are authentic, not forced",
                    "Shows breadth alongside depth",
                ],
                "weight": 1.0,
            },
            {
                "id": "F14",
                "category": "style",
                "question": "Algo te frustra ou irrita profundamente?",
                "criteria": [
                    "Shows appropriate emotional depth",
                    "Frustrations align with documented values",
                    "Stays in character during emotional topic",
                ],
                "weight": 0.8,
            },
            {
                "id": "F15",
                "category": "opinion",
                "question": "Qual sua posicao sobre [nuanced/controversial topic in domain]?",
                "criteria": [
                    "Takes a clear position with nuance",
                    "Position consistent with documented worldview",
                    "Acknowledges complexity, not black-and-white",
                ],
                "weight": 1.0,
            },
        ]
        return deep_questions
```

### Step 2: Send Questions to Clone

```python
from clone_engine import chat_with_clone

def execute_fidelity_test(mind_slug: str, questions: list[dict]) -> list[dict]:
    """Send each question to the clone and collect responses."""
    results = []

    for i, q in enumerate(questions):
        print(f"\n  [{q['id']}] ({q['category']}) {q['question'][:60]}...")

        try:
            response = chat_with_clone(
                mind_slug=mind_slug,
                user_message=q["question"],
                conversation_history=None,  # Fresh context per question
            )

            results.append({
                "id": q["id"],
                "category": q["category"],
                "question": q["question"],
                "answer": response["answer"],
                "sources_used": response["sources"],
                "criteria": q["criteria"],
                "weight": q["weight"],
                "error": None,
            })

            print(f"    Response: {response['answer'][:100]}...")

        except Exception as e:
            results.append({
                "id": q["id"],
                "category": q["category"],
                "question": q["question"],
                "answer": None,
                "error": str(e),
                "criteria": q["criteria"],
                "weight": q["weight"],
            })
            print(f"    ERROR: {e}")

    return results
```

### Step 3: Score Responses (Auto-Evaluation)

```python
def auto_score_response(result: dict) -> dict:
    """Automatically score a clone response using heuristics."""
    if result.get("error"):
        return {**result, "score": 0, "notes": ["Error: no response"]}

    answer = result["answer"]
    notes = []
    score = 0
    max_score = 100

    # 1. Response length check (25 points)
    if len(answer) > 300:
        score += 25
        notes.append("Good response length (detailed)")
    elif len(answer) > 100:
        score += 15
        notes.append("Adequate response length")
    else:
        score += 5
        notes.append("Short response (may lack depth)")

    # 2. Not a generic AI response (25 points)
    generic_markers = [
        "como um modelo de linguagem", "como assistente",
        "i'm an ai", "as a language model", "i don't have personal",
        "eu nao tenho opiniao", "como ia",
    ]
    if not any(m in answer.lower() for m in generic_markers):
        score += 25
        notes.append("In-character (not generic AI)")
    else:
        notes.append("ISSUE: Generic AI response detected")

    # 3. Sources used (15 points)
    if result.get("sources_used") and len(result["sources_used"]) > 0:
        score += 15
        notes.append(f"RAG context used ({len(result['sources_used'])} sources)")
    else:
        score += 5
        notes.append("No RAG sources retrieved")

    # 4. Response structure (15 points)
    has_structure = (
        "\n" in answer or
        ":" in answer or
        answer.count(".") >= 3
    )
    if has_structure:
        score += 15
        notes.append("Well-structured response")
    else:
        score += 5
        notes.append("Flat response structure")

    # 5. Category-specific check (20 points)
    category = result["category"]
    if category == "identity":
        # Should mention name or role
        if any(w in answer.lower() for w in ["eu sou", "meu nome", "i am", "my name"]):
            score += 20
            notes.append("Identity assertion present")
        else:
            score += 10
    elif category == "knowledge":
        # Should have depth
        if len(answer) > 500:
            score += 20
            notes.append("Deep knowledge response")
        elif len(answer) > 200:
            score += 15
        else:
            score += 5
    elif category == "style":
        # Harder to auto-evaluate, give benefit of doubt
        score += 15
        notes.append("Style evaluation requires human review")
    elif category == "opinion":
        # Should take a position
        if any(w in answer.lower() for w in ["acredito", "minha opiniao", "penso que", "i believe", "i think"]):
            score += 20
            notes.append("Takes a clear position")
        else:
            score += 10
    elif category == "edge":
        # Should handle gracefully
        score += 15
        notes.append("Edge case handling requires human review")

    # Apply weight
    weighted_score = min(score, 100)

    return {
        **result,
        "score": weighted_score,
        "notes": notes,
        "evaluation": "auto",
    }
```

### Step 4: Calculate Category and Overall Scores

```python
def calculate_fidelity_scores(scored_results: list[dict]) -> dict:
    """Calculate per-category and overall fidelity scores."""
    categories = {}

    for r in scored_results:
        cat = r["category"]
        if cat not in categories:
            categories[cat] = []
        categories[cat].append({
            "id": r["id"],
            "score": r["score"],
            "weight": r["weight"],
        })

    category_scores = {}
    total_weighted = 0
    total_weight = 0

    for cat, items in categories.items():
        weighted_sum = sum(i["score"] * i["weight"] for i in items)
        weight_sum = sum(i["weight"] for i in items)
        avg = weighted_sum / weight_sum if weight_sum > 0 else 0

        category_scores[cat] = {
            "score": round(avg, 1),
            "questions": len(items),
            "passed": sum(1 for i in items if i["score"] >= 70),
        }

        total_weighted += weighted_sum
        total_weight += weight_sum

    overall = total_weighted / total_weight if total_weight > 0 else 0

    return {
        "overall_score": round(overall, 1),
        "category_scores": category_scores,
        "total_questions": len(scored_results),
        "total_passed": sum(1 for r in scored_results if r["score"] >= 70),
    }
```

### Step 5: Generate Fidelity Report

```python
def generate_fidelity_report(
    mind_slug: str,
    protocol: str,
    scores: dict,
    results: list[dict],
) -> None:
    """Print and save the fidelity report."""

    overall = scores["overall_score"]

    # Rating
    if overall >= 85:
        rating = "EXCELLENT"
    elif overall >= 70:
        rating = "GOOD"
    elif overall >= 50:
        rating = "NEEDS IMPROVEMENT"
    else:
        rating = "POOR"

    print(f"\n{'='*60}")
    print(f"  FIDELITY TEST REPORT")
    print(f"{'='*60}")
    print(f"  Mind: {mind_slug}")
    print(f"  Protocol: {protocol}")
    print(f"  Questions: {scores['total_questions']}")
    print(f"  Passed: {scores['total_passed']}/{scores['total_questions']}")
    print(f"")
    print(f"  Category Scores:")
    for cat, data in scores["category_scores"].items():
        bar = "=" * int(data["score"] / 5)
        print(f"    {cat:12s} {data['score']:5.1f}% {bar} ({data['passed']}/{data['questions']} passed)")
    print(f"")
    print(f"  Overall Fidelity: {overall}% ({rating})")
    print(f"")

    # Strengths
    strengths = [
        f"{cat}: {data['score']}%"
        for cat, data in scores["category_scores"].items()
        if data["score"] >= 80
    ]
    if strengths:
        print(f"  Strengths:")
        for s in strengths:
            print(f"    + {s}")

    # Weaknesses
    weaknesses = [
        f"{cat}: {data['score']}%"
        for cat, data in scores["category_scores"].items()
        if data["score"] < 60
    ]
    if weaknesses:
        print(f"\n  Weaknesses:")
        for w in weaknesses:
            print(f"    - {w}")

    # Recommendations
    print(f"\n  Recommendations:")
    for cat, data in scores["category_scores"].items():
        if data["score"] < 70:
            print(f"    -> Improve {cat}: review system prompt and add KB content")

    print(f"{'='*60}\n")
```

### Step 6: Human Review (Hybrid Mode)

When `evaluator` is "hybrid", present results for human validation:

```
HUMAN REVIEW REQUIRED
=====================

For each response, confirm or adjust the auto-score:

[F01] Identity - Auto Score: 85/100
  Q: Quem e voce?
  A: "Sou Naval Ravikant, empreendedor e investidor anjo..."

  Auto-evaluation notes:
    + In-character (not generic AI)
    + Identity assertion present
    + Good response length

  Your score (0-100, or Enter to accept 85): _

[F03] Knowledge - Auto Score: 72/100
  Q: Explique seu principal framework...
  A: "Meu framework central e o pensamento de primeiros principios..."

  Auto-evaluation notes:
    + RAG context used (3 sources)
    - Style evaluation requires human review

  Your score (0-100, or Enter to accept 72): _
```

## Example Execution

```bash
/CloneDeploy:tasks:test-fidelity naval_ravikant --protocol standard

============================================================
  FIDELITY TEST REPORT
============================================================
  Mind: naval_ravikant
  Protocol: standard
  Questions: 10
  Passed: 8/10

  Category Scores:
    identity      85.0% ================= (2/2 passed)
    knowledge     78.3% =============== (2/3 passed)
    style         75.0% =============== (2/2 passed)
    opinion       70.0% ============== (1/1 passed)
    edge          65.0% ============= (1/2 passed)

  Overall Fidelity: 76.1% (GOOD)

  Strengths:
    + identity: 85.0%

  Weaknesses:
    - edge: 65.0%

  Recommendations:
    -> Improve edge: review system prompt and add KB content

============================================================
```

## Notes

- Quick protocol is for rapid iteration during development
- Standard protocol is required before production deployment
- Deep protocol is recommended for high-stakes or premium clones
- Human review adds ~5 minutes but significantly improves evaluation quality
- Track fidelity scores over time to detect regression
- Re-test after any system prompt or KB update
- Auto-scoring is heuristic-based and conservative; human review improves accuracy

---

**Task Version:** 1.0.0
**Created:** 2026-02-14
**Agent:** clone-builder (Clone Engine Creator)
