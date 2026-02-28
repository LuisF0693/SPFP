---
task-id: analyze-layers
name: Analyze DNA Mental Layers
agent: cognitive-analyst
version: 1.0.0
purpose: Map all 8 DNA Mental cognitive layers from collected sources
workflow-mode: interactive
elicit: false
prerequisites:
  - "outputs/minds/{slug}/sources/sources.yaml must exist"
  - "outputs/minds/{slug}/sources/raw-excerpts.md must exist"
---

# Analyze Layers Task

## Purpose
Read all collected sources and extract the 8 DNA Mental cognitive layers for the person.

## Execution — For Each Layer

Process each layer by reading sources and extracting evidence:

### Layer 1: Knowledge Base
- List primary domains (3-5) with depth assessment (deep/solid/aware)
- For each domain: provide 2+ evidence quotes from sources
- Note: What does this person know that most people in their field don't?

### Layer 2: Communication Style
- Identify primary tone, register, sentence structure
- Collect 5+ signature phrases with source references
- List favorite metaphor domains (sports? cooking? war? nature?)
- Document: what they AVOID saying (equally important)

### Layer 3: Behavioral Patterns
- List 5+ recurring decision patterns with evidence
- How do they respond to criticism? (find examples in sources)
- How do they handle uncertainty?
- Decision speed, risk tolerance, collaboration style

### Layer 4: Values & Decision Framework
- Identify top 3-5 values — for each: name + definition + evidence + trade-off
- Map explicit trade-offs (ex: "prefers permanence over speed")
- List mental models they reference explicitly

### Layer 5: Meta Axioms
- Find the themes that appear across ALL their work
- These are their unquestioned assumptions — stated as axioms
- The "one sentence that drives everything" — what is it?
- Minimum 3, maximum 7 meta-axioms

### Layer 6: Belief System
- View of human nature (optimistic? pragmatic? skeptical?)
- Theory of change (how does change happen?)
- Role of organizations, leaders, markets
- Relationship with technology, tradition, disruption

### Layer 7: Identity Core
- The cognitive singularity — what do they see uniquely?
- Their most original intellectual contributions
- Their intellectual lineage (who shaped them?)
- How THEY describe themselves (in their own words)

### Layer 8: Productive Paradoxes
- Find apparent contradictions that actually work together
- Example: "Believes in systems AND in individual agency"
- Document each paradox: tension + explanation + how it drives them
- These are gold — they define the most authentic part of the clone

## Output Files

### layers-analysis.md
```markdown
# Layers Analysis — {Full Name}

## Layer 1: Knowledge Base
[Analysis with evidence...]

## Layer 2: Communication Style
[Analysis with quotes and examples...]

[... all 8 layers ...]

## Coverage Summary
| Layer | Score | Evidence Count |
|-------|-------|---------------|
| 1 | 8/10 | 5 |
[...]
```

### evidence-map.md
For each layer: list the specific source IDs and quotes that support each claim.

## Quality Gate
- Minimum 6 layers with score >= 5/10
- Each present layer needs >= 2 evidence items
- Layer 7 and Layer 8 are especially critical for clone authenticity
