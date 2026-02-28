---
task-id: build-knowledge-base
name: Build Knowledge Base
agent: knowledge-curator
version: 1.0.0
purpose: Organize source material into RAG-optimized knowledge base files
workflow-mode: interactive
elicit: false
prerequisites:
  - "outputs/minds/{slug}/sources/ must have content"
---

# Build Knowledge Base Task

## Purpose
Create structured KB files optimized for RAG chunking (chunk_size=800, overlap=100).

## Execution

### Step 1: Read All Sources
Load `raw-excerpts.md` and `sources.yaml`.

### Step 2: Create KB Files

For each file, use `## Section Title` as chunk boundaries.
Each section should be self-contained and meaningful without context.

**core-principles.md**
```markdown
# Core Principles — {Name}

## Principle: {Name of Principle}
{200-400 word explanation with quotes from sources}
*Sources: [src-001, src-003]*

## Principle: {Next Principle}
...
```

**mental-models.md**
```markdown
# Mental Models — {Name}

## {Model Name}
**Definition:** {How this person defines/uses this model}
**Application:** {Concrete example of them applying it}
**Quote:** "{Direct quote if available}"
*Sources: [src-002]*

## {Next Model}
...
```

**key-ideas.md**
```markdown
# Key Ideas — {Name}

## {Idea Title}
{Core concept in 200-400 words, in the person's framing}
{Why this matters / what it changes}
*Sources: [src-001, src-005]*

## {Next Idea}
...
```

**notable-works.md**
```markdown
# Notable Works — {Name}

## {Book/Article/Talk Title} ({Year})
**Core Thesis:** {1-2 sentences}
**Key Concepts:**
- {Concept}: {Brief explanation}
- {Concept}: {Brief explanation}
**Most Quoted Passage:** "{Quote}"
*Source: [src-001]*

## {Next Work}
...
```

### Step 3: Verify Chunk Quality
Each ## section should:
- Be 150-600 words (fits well in 800-token chunks)
- Make sense standalone (no "as mentioned above")
- Contain the person's name or key identifiers for retrieval
- Have source attribution

## Output Files
All files in `outputs/minds/{slug}/kb/`

## Token Target
- Minimum: 5,000 total tokens across all files
- Ideal: 15,000-25,000 total tokens
