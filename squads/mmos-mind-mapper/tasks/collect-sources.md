---
task-id: collect-sources
name: Collect Source Material
agent: source-collector
version: 1.0.0
purpose: Research and collect all available source material about a person for cognitive mapping
workflow-mode: interactive
elicit: true
---

# Collect Sources Task

## Purpose
Gather all publicly available sources about the target person. These sources will feed the cognitive analysis (8 DNA Mental layers) and knowledge base construction.

## Elicitation

Before collecting, ask:

1. **Person name and slug**: "Qual é o nome completo e o slug desejado? (ex: 'Seth Godin' → 'seth_godin')"
2. **Source focus**: "Quer foco em algum tipo de fonte específico? (livros, blog, podcasts, vídeos) ou tudo?"
3. **Language preference**: "Material em português, inglês ou ambos?"
4. **Known sources**: "Você já tem alguma fonte específica que quer incluir? (URLs, títulos de livros)"

## Execution Steps

### Step 1: Create Directory Structure
```
outputs/minds/{slug}/
└── sources/
```

### Step 2: Web Research
Search for and catalog:
- Books written by the person
- Blog posts / newsletter archives
- Interviews (text and video)
- Podcast appearances
- Speeches and talks (YouTube, TED, etc.)
- Wikipedia article (for quick overview)
- Social media presence (Twitter/X, LinkedIn)

### Step 3: Extract Key Excerpts
From the most important sources, extract:
- Passages that reveal thinking patterns
- Quotes that capture voice and style
- Examples of their frameworks in action
- Statements of belief or values

### Step 4: Create Output Files

**sources.yaml:**
```yaml
slug: "{slug}"
person_name: "{Full Name}"
collected_at: "{timestamp}"
sources:
  - id: src-001
    type: book|article|interview|talk|podcast|social
    title: ""
    url: ""
    date: ""
    language: pt|en
    reliability: primary|secondary
    key_themes: []
    excerpt_available: true|false
```

**raw-excerpts.md:**
```markdown
# Raw Excerpts — {Full Name}

## [Source Title] ({year})
> [Exact quote or paraphrase with context]
*Source: src-001*

## [Next Source]...
```

**source-summary.md:**
```markdown
# Source Summary — {Full Name}
Total sources: N
Primary sources: N
Secondary sources: N
Date range: YYYY - YYYY
Coverage assessment: [brief summary of what domains are well covered]
Gaps: [what types of sources are missing]
```

## Quality Criteria
- Minimum: 5 primary sources
- Ideal: 20+ sources across multiple types
- Must include: at least 1 long-form interview OR 5+ blog posts

## Output
Files created in `outputs/minds/{slug}/sources/`
