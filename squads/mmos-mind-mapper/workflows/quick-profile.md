---
workflow-id: quick-profile
name: Quick Mind Profile
version: 1.0.0
agent: mmos-chief
description: >-
  Perfil rápido usando apenas fontes públicas facilmente disponíveis.
  Ideal para figuras públicas com muito conteúdo online. 3 fases (sem enriquecimento).

trigger: "*map {person_name} --quick"
estimated-duration: "30-60 minutos"

phases:
  phase_1:
    name: "Quick Source Scan"
    agent: source-collector
    task: collect-sources.md
    mode: quick
    target: "Top 10 most available sources only"
    outputs:
      - "outputs/minds/{slug}/sources/sources.yaml"
      - "outputs/minds/{slug}/sources/raw-excerpts.md"

  phase_2:
    name: "Core Layers Analysis"
    agent: cognitive-analyst
    task: analyze-layers.md
    mode: focused
    target: "Layers 2, 4, 5, 7, 8 priority (most impactful for clone fidelity)"
    outputs:
      - "outputs/minds/{slug}/analysis/layers-analysis.md"

  phase_3:
    name: "Synthesis + Basic KB"
    agent: persona-synthesizer + knowledge-curator
    tasks: [synthesize-persona.md, build-knowledge-base.md]
    mode: minimal
    outputs:
      - "outputs/minds/{slug}/system_prompts/{slug}-system-prompt.md"
      - "outputs/minds/{slug}/analysis/cognitive-spec.yaml"
      - "outputs/minds/{slug}/kb/core-principles.md"
      - "outputs/minds/{slug}/kb/key-ideas.md"

note: |
  Quick profile produces a functional but thinner mind.
  Expected readiness score: 60-75.
  Recommended to enrich later with *workflow enrich-mind {slug}.
---
