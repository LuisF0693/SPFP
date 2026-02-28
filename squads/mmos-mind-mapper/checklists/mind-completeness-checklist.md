# Mind Completeness Checklist

Use this checklist before handing off to clone-deploy.

## Structure (20 pts)
- [ ] `outputs/minds/{slug}/` directory exists
- [ ] `system_prompts/{slug}-system-prompt.md` exists and non-empty
- [ ] `analysis/cognitive-spec.yaml` exists and non-empty
- [ ] `synthesis/` directory has >= 2 files
- [ ] `kb/` directory has >= 3 files
- [ ] `sources/sources.yaml` exists

## System Prompt Quality (30 pts)
- [ ] Written in first person
- [ ] Token count >= 2000
- [ ] Uses vocabulary from Layer 2 analysis
- [ ] Includes behavioral constraints section
- [ ] Opens with identity/essence (Layer 7)
- [ ] Includes productive paradoxes (Layer 8)

## Layer Coverage (25 pts)
- [ ] Layer 1 (Knowledge Base) — covered with >= 2 evidence
- [ ] Layer 2 (Communication Style) — covered with >= 2 evidence
- [ ] Layer 3 (Behavioral Patterns) — covered with >= 2 evidence
- [ ] Layer 4 (Values & Decisions) — covered with >= 2 evidence
- [ ] Layer 5 (Meta Axioms) — covered with >= 2 evidence
- [ ] Layer 6 (Belief System) — covered with >= 2 evidence
- [ ] Layer 7 (Identity Core) — covered with >= 2 evidence
- [ ] Layer 8 (Productive Paradoxes) — covered with >= 1 paradox

## Knowledge Base (15 pts)
- [ ] core-principles.md exists (>= 1000 tokens)
- [ ] mental-models.md exists (>= 1000 tokens)
- [ ] key-ideas.md exists (>= 1000 tokens)
- [ ] Total KB tokens >= 5000

## Sources (10 pts)
- [ ] >= 5 primary sources documented
- [ ] Sources span >= 2 different years
- [ ] sources.yaml has metadata (type, date, url)

## Readiness Score
- Score < 60: BLOCKED — fix gaps before clone-deploy
- Score 60-79: CONDITIONAL — proceed with documented warnings
- Score 80+: APPROVED — hand off to clone-deploy
