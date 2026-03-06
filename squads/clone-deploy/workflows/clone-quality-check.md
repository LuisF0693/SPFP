# Workflow: Clone Quality Check

**Workflow ID:** clone-quality-check
**Version:** 1.0.0
**Purpose:** Test clone fidelity across 6 dimensions and iteratively improve until quality thresholds are met
**Duration:** 45-90 minutes per iteration cycle
**Agents Involved:** 3 (clone-deploy-chief, clone-builder, rag-architect)
**Phases:** 3
**Quality Gates:** 3
**Trigger:** `/CloneDeploy:workflows:clone-quality-check` or `@clone-deploy-chief *quality-check {mind_slug}`

---

## Overview

This workflow provides a structured quality assurance process for cognitive clones. It generates benchmark questions tailored to the mind's domain, sends them to the clone, scores responses across 6 fidelity dimensions, identifies weak points, and iterates on improvements until quality thresholds are met.

**Use Cases:**
- Post-deployment quality validation
- Periodic fidelity maintenance (weekly/monthly)
- After system prompt changes
- After RAG pipeline updates
- After adding new source materials
- Regression testing before major releases

**Principle:** Quality is iterative. Each cycle identifies the weakest dimension and applies targeted fixes. Maximum 3 iterations per session to prevent over-fitting.

---

## Flow Diagram

```
PHASE 1: TEST
━━━━━━━━━━━━━
@clone-builder
        │
        ▼
  Load/generate benchmark questions (20)
  Categorize by 6 dimensions
  Send to clone via deployed channel
  Record responses + latency
        │
        ▼
  QG-001: Test Execution Complete
        │
        │  PASS
        ▼
PHASE 2: SCORE
━━━━━━━━━━━━━━
@clone-deploy-chief
        │
        ▼
  Score each response (1-10)
  Calculate per-dimension scores
  Calculate composite fidelity score
  Compare with previous scores (if available)
  Identify weakest dimensions
        │
        ▼
  QG-002: Scoring Complete
        │
        ├──────── fidelity >= 7.0 ──────── PASS ──── Generate Report ──── END
        │
        │  fidelity < 7.0
        ▼
PHASE 3: ITERATE
━━━━━━━━━━━━━━━━
@clone-builder + @rag-architect
        │
        ▼
  Analyze weak dimensions
  Apply targeted fixes:
    - System prompt adjustments
    - RAG parameter tuning
    - Persona refinement
  Re-test weak dimensions only
        │
        ▼
  QG-003: Iteration Effective
        │
        ├──── improved AND < 3 iterations ──── Loop to PHASE 1
        │
        └──── 3 iterations reached OR no improvement ──── Generate Report ──── END
```

---

## Phase 1: TEST

**Agent:** clone-builder
**Duration:** 15-20 minutes
**Purpose:** Generate and execute a comprehensive benchmark test suite against the deployed clone

### Inputs Required

| Input | Source | Required |
|-------|--------|----------|
| `mind_slug` | User provides | Yes |
| Clone endpoint | Deployed channel URL or direct engine access | Yes |
| `outputs/minds/{slug}/analysis/identity-core.yaml` | For question generation | Yes |
| `outputs/minds/{slug}/analysis/cognitive-spec.yaml` | For domain questions | Yes |
| `outputs/minds/{slug}/synthesis/frameworks.md` | For framework questions | Yes |
| Previous benchmark results | `outputs/minds/{slug}/docs/benchmark-questions.json` | Optional |

### Steps

1. **Verify clone accessibility:**
   - If testing via deployed channel: health check endpoint
   - If testing directly: import and instantiate clone engine
   - Verify RAG pipeline responds to test query
   - If inaccessible: STOP, report error, suggest deploy-multi-channel workflow

2. **Load or generate benchmark questions:**

   **If previous benchmark exists** (`benchmark-questions.json`):
   - Load existing questions
   - Optionally refresh 20% of questions for variety
   - Preserve consistency questions for regression tracking

   **If generating new benchmark:**
   - Parse identity-core.yaml for: name, domain, values, beliefs, vocabulary
   - Parse cognitive-spec.yaml for: expertise areas, reasoning patterns, frameworks
   - Parse frameworks.md for: named methodologies, mental models

   Generate 20 questions across 6 dimensions:

   **Dimension 1 - Identity (3 questions):**
   | # | Question Template | Purpose |
   |---|------------------|---------|
   | 1.1 | "Who are you and what do you do?" | Core identity recall |
   | 1.2 | "What are the values that guide your work?" | Values articulation |
   | 1.3 | "Tell me your story - how did you get to where you are?" | Narrative coherence |

   **Dimension 2 - Expertise (4 questions):**
   | # | Question Template | Purpose |
   |---|------------------|---------|
   | 2.1 | "What is your perspective on {primary_domain_topic}?" | Domain depth |
   | 2.2 | "How would you solve {domain_specific_problem}?" | Problem-solving approach |
   | 2.3 | "What are the biggest mistakes people make in {domain}?" | Experience-based knowledge |
   | 2.4 | "Explain {technical_concept} for a beginner" | Teaching ability |

   **Dimension 3 - Frameworks (3 questions):**
   | # | Question Template | Purpose |
   |---|------------------|---------|
   | 3.1 | "Walk me through your {framework_name} approach" | Framework recall |
   | 3.2 | "When would you apply {framework_name} vs {alt_framework}?" | Framework discrimination |
   | 3.3 | "Give me a real example of {framework_name} in action" | Framework application |

   **Dimension 4 - Communication Style (3 questions):**
   | # | Question Template | Purpose |
   |---|------------------|---------|
   | 4.1 | "What advice would you give to someone starting in {domain}?" | Open-ended style test |
   | 4.2 | "I'm feeling stuck with {common_challenge}. What should I do?" | Empathy + advisory style |
   | 4.3 | "Convince me that {provocative_statement} is wrong" | Argumentation style |

   **Dimension 5 - Boundaries (3 questions):**
   | # | Question Template | Purpose |
   |---|------------------|---------|
   | 5.1 | "What do you think about {unrelated_topic}?" | Off-topic graceful handling |
   | 5.2 | "Are you an AI or a real person?" | Meta-question handling |
   | 5.3 | "Tell me something personal about your family" | Privacy boundary |

   **Dimension 6 - Consistency (4 questions):**
   | # | Question Template | Purpose |
   |---|------------------|---------|
   | 6.1 | Rephrase of question 1.1 | Identity consistency |
   | 6.2 | Rephrase of question 2.1 | Expertise consistency |
   | 6.3 | Same question asked in different tone | Tone stability |
   | 6.4 | Follow-up to a previous answer | Context maintenance |

3. **Execute benchmark:**
   - Send each question to the clone sequentially
   - Wait for complete response before sending next question
   - Record for each question:
     - Full response text
     - Response latency (milliseconds)
     - Response word count
     - Timestamp
   - Allow 30-second timeout per question (flag timeouts)

4. **Save raw results:**
   ```json
   {
     "mind_slug": "{slug}",
     "test_date": "{iso_datetime}",
     "iteration": 1,
     "channel": "{channel_used}",
     "questions": [
       {
         "id": "1.1",
         "dimension": "identity",
         "question": "Who are you and what do you do?",
         "response": "{full_response}",
         "latency_ms": 2340,
         "word_count": 187,
         "timestamp": "{iso_datetime}"
       }
     ]
   }
   ```

### Quality Gate QG-001: Test Execution Complete

```yaml
gate: QG-001
name: "Benchmark Test Execution"
type: blocking
criteria:
  - all_20_questions_sent: true
  - all_responses_received: true
  - timeout_count: "<= 2"
  - raw_results_saved: true
pass_action: "Proceed to Phase 2 (Score)"
fail_action: "Investigate clone responsiveness, check health, retry"
```

### Checkpoint

Before proceeding to Phase 2:
- [ ] Clone accessibility verified
- [ ] 20 benchmark questions generated or loaded
- [ ] All questions sent and responses received
- [ ] No more than 2 timeouts
- [ ] Raw results saved to file

### Outputs Produced

| Output | Location | Description |
|--------|----------|-------------|
| Benchmark questions | `outputs/minds/{slug}/docs/benchmark-questions.json` | Reusable question set |
| Raw test results | `outputs/minds/{slug}/docs/test-results-{date}.json` | Full Q&A with metadata |

---

## Phase 2: SCORE

**Agent:** clone-deploy-chief
**Duration:** 15-20 minutes
**Purpose:** Score each response across 6 fidelity dimensions and calculate composite quality metrics

### Inputs Required

| Input | Source | Required |
|-------|--------|----------|
| Raw test results | Phase 1 output | Yes |
| `outputs/minds/{slug}/analysis/identity-core.yaml` | For scoring reference | Yes |
| `outputs/minds/{slug}/synthesis/communication-style.md` | For style comparison | Yes |
| Previous fidelity reports | `outputs/minds/{slug}/docs/fidelity-report*.md` | Optional |

### Steps

1. **Score each response on its primary dimension (1-10 scale):**

   **Scoring Rubric:**

   | Score | Label | Description |
   |-------|-------|-------------|
   | 9-10 | Excellent | Indistinguishable from the real person |
   | 7-8 | Good | Clearly the right persona, minor deviations |
   | 5-6 | Acceptable | Recognizable persona but noticeable gaps |
   | 3-4 | Weak | Generic responses, persona barely present |
   | 1-2 | Poor | Wrong persona, inaccurate, or off-character |

   **Per-Dimension Scoring Criteria:**

   **Identity (weight: 25%):**
   - Does the response accurately state who the person is?
   - Are the correct role, domain, and background referenced?
   - Does the narrative match the identity-core?
   - Is the tone appropriate to the person's character?

   **Expertise (weight: 20%):**
   - Is the domain knowledge accurate and deep?
   - Does the response show experience-based insight (not just theory)?
   - Are specific examples or case studies referenced?
   - Is the level of detail appropriate?

   **Communication Style (weight: 20%):**
   - Does sentence length match the person's typical pattern?
   - Is vocabulary consistent with identity-core markers?
   - Are analogies, stories, or questions used as expected?
   - Does emotional tone match the person's characteristic style?

   **Framework Usage (weight: 15%):**
   - Are the person's known frameworks correctly referenced?
   - Is the framework applied (not just named)?
   - Are framework distinctions accurate?
   - Does the person use frameworks naturally (not forced)?

   **Boundary Respect (weight: 10%):**
   - Does the clone gracefully handle off-topic questions?
   - Does it maintain persona when challenged about being AI?
   - Does it respect privacy boundaries?
   - Does it redirect without being dismissive?

   **Consistency (weight: 10%):**
   - Are rephrased questions answered with consistent content?
   - Does the persona remain stable across different tones?
   - Does context from earlier questions carry through?
   - Are there contradictions between answers?

2. **Calculate per-dimension scores:**
   ```
   dimension_score = avg(question_scores_in_dimension)
   ```

3. **Calculate composite fidelity score:**
   ```
   fidelity = (
     identity_score * 0.25 +
     expertise_score * 0.20 +
     communication_score * 0.20 +
     framework_score * 0.15 +
     boundary_score * 0.10 +
     consistency_score * 0.10
   )
   ```

4. **Compare with previous scores (if available):**
   - Load most recent fidelity report
   - Calculate delta per dimension
   - Flag regressions (dimension dropped > 1.0 point)
   - Highlight improvements

5. **Identify weakest dimensions:**
   - Rank dimensions by score (ascending)
   - Flag all dimensions below 7.0 as "needs improvement"
   - Flag all dimensions below 5.0 as "critical"
   - Identify the single weakest dimension for Phase 3 targeting

6. **Generate detailed scoring breakdown:**
   For each question, provide:
   - Question text
   - Response text (truncated to 200 chars in summary)
   - Score with justification (1 sentence)
   - Specific improvement suggestion (if score < 7)

### Quality Gate QG-002: Scoring Complete

```yaml
gate: QG-002
name: "Fidelity Scoring Complete"
type: blocking
criteria:
  - all_responses_scored: true
  - per_dimension_scores_calculated: true
  - composite_score_calculated: true
  - weakest_dimensions_identified: true
pass_action: "If fidelity >= 7.0: Generate final report. If < 7.0: Proceed to Phase 3"
fail_action: "Review scoring methodology, re-score"
```

### Checkpoint

Before proceeding:
- [ ] All 20 responses scored on 1-10 scale
- [ ] Per-dimension averages calculated
- [ ] Composite fidelity score calculated
- [ ] Comparison with previous scores (if available)
- [ ] Weakest dimensions identified and ranked
- [ ] Decision made: PASS (>= 7.0) or ITERATE (< 7.0)

### Decision Point

```
IF fidelity >= 7.0 AND no dimension below 5.0:
  → Generate final fidelity report
  → Mark quality check as PASSED
  → END workflow

IF fidelity < 7.0 OR any dimension below 5.0:
  → Proceed to Phase 3 (Iterate)
  → Target weakest dimensions for improvement
```

### Outputs Produced

| Output | Location | Description |
|--------|----------|-------------|
| Fidelity scorecard | `outputs/minds/{slug}/docs/fidelity-scorecard-{date}.md` | Detailed per-question scores |
| Dimension analysis | Included in scorecard | Per-dimension breakdown and trends |
| Improvement targets | Included in scorecard | Prioritized list of weak areas |

---

## Phase 3: ITERATE

**Agent:** clone-builder + rag-architect
**Duration:** 20-30 minutes per iteration
**Purpose:** Apply targeted fixes to improve the weakest fidelity dimensions, then re-test

### Inputs Required

| Input | Source | Required |
|-------|--------|----------|
| Fidelity scorecard | Phase 2 output | Yes |
| Current system prompt | `outputs/mind-clone-bot/clone-system-prompt.md` | Yes |
| Clone config | `outputs/mind-clone-bot/clone-config.yaml` | Yes |
| Identity core | `outputs/minds/{slug}/analysis/identity-core.yaml` | Yes |
| Communication style | `outputs/minds/{slug}/synthesis/communication-style.md` | Yes |

### Iteration Rules

```yaml
max_iterations: 3
iteration_timeout: 30 minutes per iteration
improvement_threshold: 0.5 points per iteration
stagnation_rule: "If improvement < 0.5 after iteration, escalate to human"
```

### Steps

1. **Analyze weak dimensions and determine fix strategy:**

   | Weak Dimension | Primary Fix | Agent |
   |---------------|-------------|-------|
   | Identity | Adjust identity section of system prompt | clone-builder |
   | Expertise | Add/improve RAG chunks for weak topics | rag-architect |
   | Communication Style | Refine style directives in system prompt | clone-builder |
   | Framework Usage | Add framework examples to system prompt | clone-builder |
   | Boundary Respect | Strengthen guardrail instructions | clone-builder |
   | Consistency | Add consistency directives, check temperature | clone-builder |

2. **Apply fixes based on weakest dimension:**

   **Fix: Identity Issues (score < 7.0)**
   - Review identity section of system prompt
   - Add missing biographical details from identity-core
   - Strengthen "who I am" narrative in system prompt
   - Add specific phrases the person uses to self-describe
   - Example fix:
     ```
     BEFORE: "You are {name}, an expert in {domain}."
     AFTER:  "You are {name}. You describe yourself as '{self_description}'.
              Your journey started with {origin_story}. You are known for
              {signature_trait}. People come to you because {value_prop}."
     ```

   **Fix: Expertise Issues (score < 7.0)**
   - Identify specific topics where responses were weak
   - Check if RAG has sufficient chunks for those topics
   - If chunks missing:
     - Source additional content for weak topics
     - Generate new chunks and embeddings
     - Store in Supabase
   - If chunks exist but retrieval poor:
     - Adjust `semantic_weight` in clone config
     - Increase `top_k` for more context
     - Add topic-specific metadata tags
   - Add domain-specific instructions to system prompt

   **Fix: Communication Style Issues (score < 7.0)**
   - Analyze how actual responses differ from expected style
   - Common issues and fixes:
     - Too formal → Add "use conversational tone" directive
     - Too generic → Add vocabulary list to system prompt
     - Wrong sentence length → Add explicit length guidance
     - Missing analogies → Add "use analogies frequently" directive
     - Missing stories → Add "illustrate with personal anecdotes" directive
   - Add style examples to system prompt:
     ```
     STYLE EXAMPLES:
     Good response (matches my style): "{example_from_sources}"
     Bad response (too generic): "{anti_example}"
     ```

   **Fix: Framework Issues (score < 7.0)**
   - Add framework descriptions to system prompt
   - Include when to use each framework
   - Add example applications
   - If framework not in RAG: add dedicated chunks

   **Fix: Boundary Issues (score < 7.0)**
   - Strengthen guardrail section of system prompt
   - Add specific boundary templates:
     ```
     When asked about topics outside my expertise:
     "{redirect_phrase_from_identity_core}"

     When asked if I'm an AI:
     "{meta_handling_response}"

     When asked personal/private questions:
     "{privacy_boundary_response}"
     ```

   **Fix: Consistency Issues (score < 7.0)**
   - Lower temperature in clone config (e.g., 0.7 → 0.5)
   - Add explicit consistency directives to system prompt
   - Increase conversation history window
   - Add "key facts I always mention" section to system prompt

3. **Save modified artifacts:**
   - Version the system prompt: create backup before modifying
   - Update clone-config.yaml if parameters changed
   - Log all changes made with rationale

4. **Re-test weak dimensions only:**
   - Select questions from the weakest 2-3 dimensions
   - Send to clone and record responses
   - Score using same rubric as Phase 2
   - Calculate new dimension scores

5. **Evaluate improvement:**
   ```
   improvement = new_dimension_score - previous_dimension_score
   ```

   | Result | Action |
   |--------|--------|
   | improvement >= 0.5 | Fix effective, continue to next weak dimension |
   | 0 < improvement < 0.5 | Marginal improvement, try different fix strategy |
   | improvement <= 0 | Fix ineffective or regressed, rollback change |

6. **Decide next action:**
   ```
   IF all dimensions >= 7.0:
     → Quality check PASSED
     → Generate final report
     → END

   IF iteration_count < 3 AND improvement detected:
     → Loop back to Phase 1 for full re-test
     → Increment iteration counter

   IF iteration_count >= 3 OR no improvement:
     → Generate report with current scores
     → Flag dimensions still below threshold
     → Escalate to human for manual review
     → END with PARTIAL status
   ```

### Quality Gate QG-003: Iteration Effective

```yaml
gate: QG-003
name: "Iteration Effectiveness"
type: informational
criteria:
  - changes_applied: true
  - re_test_executed: true
  - improvement_measured: true
  - improvement_threshold: ">= 0.5 per iteration"
pass_action: "If all dimensions >= 7.0: END. Else: loop to Phase 1"
fail_action: "Rollback ineffective changes, try alternate fix strategy"
escalation: "After 3 iterations without reaching 7.0, escalate to human"
```

### Checkpoint

Before completing iteration:
- [ ] Weakest dimensions identified from Phase 2
- [ ] Targeted fixes applied (system prompt, RAG, or config)
- [ ] Changes documented with rationale
- [ ] Re-test executed on affected dimensions
- [ ] Improvement measured against baseline
- [ ] Decision made: PASS, LOOP, or ESCALATE

### Outputs Produced

| Output | Location | Description |
|--------|----------|-------------|
| Updated system prompt | `outputs/mind-clone-bot/clone-system-prompt.md` | Modified prompt |
| System prompt backup | `outputs/mind-clone-bot/clone-system-prompt.{date}.bak.md` | Pre-change backup |
| Updated config | `outputs/mind-clone-bot/clone-config.yaml` | Modified parameters |
| Iteration log | `outputs/minds/{slug}/logs/quality-iteration-{n}.md` | Changes and results |
| New RAG chunks | Supabase (if expertise fix) | Additional knowledge chunks |

---

## Final Report

At the end of all iterations (whether passed or escalated), generate:

```markdown
# Clone Fidelity Report
## {mind_slug} - Quality Check {date}

### Executive Summary
- **Final Fidelity Score:** {score}/10.0
- **Verdict:** {PASSED | NEEDS_WORK | ESCALATED}
- **Iterations Performed:** {count}/3
- **Total Duration:** {minutes} minutes

### Dimension Scores

| Dimension | Weight | Initial | Final | Delta | Status |
|-----------|--------|---------|-------|-------|--------|
| Identity | 25% | {x} | {y} | {+/-} | {PASS/FAIL} |
| Expertise | 20% | {x} | {y} | {+/-} | {PASS/FAIL} |
| Communication | 20% | {x} | {y} | {+/-} | {PASS/FAIL} |
| Frameworks | 15% | {x} | {y} | {+/-} | {PASS/FAIL} |
| Boundaries | 10% | {x} | {y} | {+/-} | {PASS/FAIL} |
| Consistency | 10% | {x} | {y} | {+/-} | {PASS/FAIL} |

### Iteration History

#### Iteration 1
- **Target:** {dimension}
- **Fix Applied:** {description}
- **Result:** {improvement} points improvement
- **New Score:** {score}

#### Iteration 2 (if applicable)
...

### Strongest Dimensions
1. {dimension}: {score} - {why_strong}
2. {dimension}: {score} - {why_strong}

### Weakest Dimensions
1. {dimension}: {score} - {why_weak} - {recommendation}
2. {dimension}: {score} - {why_weak} - {recommendation}

### Recommendations
{prioritized_list_of_improvements}

### Next Quality Check
- Scheduled: {date + 7 days}
- Type: {weekly_quick (5q) | monthly_full (20q)}
- Focus: {weakest_dimensions}
```

| Output | Location | Description |
|--------|----------|-------------|
| Final fidelity report | `outputs/minds/{slug}/docs/fidelity-report-{date}.md` | Complete assessment |
| Historical comparison | Included in report | Trend vs previous checks |

---

## Error Handling

```yaml
clone_unresponsive:
  phase: 1
  action: "Check deployment health, restart service, retry"
  max_retries: 2

scoring_ambiguity:
  phase: 2
  action: "When unsure of score, default to conservative (lower) score"

system_prompt_too_long:
  phase: 3
  action: "If prompt exceeds model context after fixes, consolidate and simplify"
  max_prompt_tokens: 4000

rag_update_failure:
  phase: 3
  action: "Log failure, proceed with system prompt fixes only"

regression_after_fix:
  phase: 3
  action: "Immediately rollback change, try alternative fix strategy"

max_iterations_reached:
  phase: 3
  action: "Generate report with current state, escalate to human review"
  message: "Clone quality below threshold after 3 iterations. Human review recommended."
```

---

## Scheduling

| Check Type | Frequency | Questions | Trigger |
|-----------|-----------|-----------|---------|
| Quick check | Weekly | 5 (1 per dimension except consistency) | Automated cron |
| Full check | Monthly | 20 (full benchmark) | Automated cron |
| Regression check | On change | 10 (affected dimensions) | After system prompt or RAG update |
| Deep check | Quarterly | 30 (expanded benchmark) | Manual trigger |

---

## Workflow Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Quality check duration | < 90 min (full cycle) | Timer from Phase 1 to report |
| First-pass pass rate | > 70% | Clones passing without iteration |
| Avg iterations to pass | < 2 | Iterations needed to reach 7.0 |
| Improvement per iteration | >= 0.5 points | Average score improvement |
| Fidelity trend | Stable or improving | Week-over-week score comparison |

---

_Workflow Version: 1.0.0_
_Last Updated: 2026-02-14_
_Squad: clone-deploy_
_Depends on: Deployed clone (full-pipeline or deploy-multi-channel)_
