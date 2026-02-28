---
task-id: validate-mind
name: Validate Mind Completeness
agent: mind-validator
version: 1.0.0
purpose: Score mind readiness and generate report compatible with clone-deploy
workflow-mode: automated
elicit: false
---

# Validate Mind Task

## Execution

### 1. Structure Check (20 pts)
Verify each required file/directory exists and is non-empty.

### 2. System Prompt Quality (30 pts)
- Count tokens in system-prompt
- Verify first person voice
- Check for presence of signature vocabulary from Layer 2
- Check for behavioral constraints section

### 3. Layer Coverage (25 pts)
Read cognitive-spec.yaml and score each layer (3 pts each, +1 pt if >= 2 evidence).

### 4. Knowledge Base (15 pts)
- Count total KB tokens
- Count distinct topic areas
- Assess chunk quality

### 5. Sources (10 pts)
- Count primary sources
- Check date range
- Verify sources.yaml exists

### Calculate Final Score
Sum all dimension scores → readiness_score (0-100).

### Generate readiness-report.yaml
```yaml
slug: "{slug}"
person_name: "{name}"
readiness_score: {N}
verdict: BLOCKED|CONDITIONAL|APPROVED|EXCELLENT
generated_at: "{timestamp}"
dimension_scores:
  structure: {N}/20
  system_prompt: {N}/30
  layer_coverage: {N}/25
  knowledge_base: {N}/15
  sources: {N}/10
gaps_found:
  - description: ""
    dimension: ""
    impact: low|medium|high
    fix: ""
recommendations:
  - ""
compatible_with: "clone-deploy v1.0 (diagnose-mind threshold: 60)"
```
