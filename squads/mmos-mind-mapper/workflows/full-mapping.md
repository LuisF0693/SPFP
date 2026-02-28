---
workflow-id: full-mapping
name: Full Mind Mapping Pipeline
version: 1.0.0
agent: mmos-chief
description: >-
  Pipeline completo de mapeamento cognitivo: da pesquisa de fontes
  à mind pronta para clone-deploy. 5 fases sequenciais com quality gates.

trigger: "*map {person_name}"
estimated-duration: "2-4 horas"

inputs:
  - name: person_name
    type: string
    description: Nome completo da pessoa (ex. "Seth Godin")
    required: true
  - name: person_slug
    type: string
    description: Slug para diretórios (ex. "seth_godin") — derivado do nome se não informado
    required: false

outputs:
  - path: "outputs/minds/{slug}/"
    description: Diretório completo da mind, pronto para clone-deploy
  - path: "outputs/minds/{slug}/readiness-report.yaml"
    description: Relatório de prontidão com score

phases:
  phase_1:
    name: "Source Collection"
    agent: source-collector
    task: collect-sources.md
    elicit: true
    inputs:
      - person_name
      - person_slug
    outputs:
      - "outputs/minds/{slug}/sources/sources.yaml"
      - "outputs/minds/{slug}/sources/raw-excerpts.md"
    quality_gate:
      minimum: "5 primary sources collected"
      ideal: "20+ sources across multiple types"
    on_fail: "WARN — proceed with available sources, document gaps"

  phase_2:
    name: "Cognitive Analysis"
    agent: cognitive-analyst
    task: analyze-layers.md
    depends_on: phase_1
    inputs:
      - "outputs/minds/{slug}/sources/sources.yaml"
      - "outputs/minds/{slug}/sources/raw-excerpts.md"
    outputs:
      - "outputs/minds/{slug}/analysis/layers-analysis.md"
      - "outputs/minds/{slug}/analysis/evidence-map.md"
    quality_gate:
      minimum: "6 of 8 layers covered with >= 2 evidence each"
      ideal: "All 8 layers covered with >= 5 evidence each"
    on_fail: "WARN if 6+ layers, BLOCK if fewer than 6"

  phase_3:
    name: "Persona Synthesis"
    agent: persona-synthesizer
    task: synthesize-persona.md
    depends_on: phase_2
    inputs:
      - "outputs/minds/{slug}/analysis/layers-analysis.md"
    outputs:
      - "outputs/minds/{slug}/system_prompts/{slug}-system-prompt.md"
      - "outputs/minds/{slug}/synthesis/worldview.md"
      - "outputs/minds/{slug}/synthesis/communication-style.md"
      - "outputs/minds/{slug}/synthesis/signature-phrases.md"
      - "outputs/minds/{slug}/analysis/cognitive-spec.yaml"
    quality_gate:
      minimum: "System prompt >= 2000 tokens"
      ideal: "System prompt 3000-5000 tokens, all synthesis docs present"
    on_fail: "BLOCK — system prompt is mandatory"

  phase_4:
    name: "Knowledge Base Construction"
    agent: knowledge-curator
    task: build-knowledge-base.md
    depends_on: phase_1
    parallel_with: phase_3
    inputs:
      - "outputs/minds/{slug}/sources/"
    outputs:
      - "outputs/minds/{slug}/kb/core-principles.md"
      - "outputs/minds/{slug}/kb/mental-models.md"
      - "outputs/minds/{slug}/kb/key-ideas.md"
      - "outputs/minds/{slug}/kb/notable-works.md"
    quality_gate:
      minimum: "3 KB files, >= 5000 total tokens"
      ideal: "6 KB files, >= 15000 total tokens"
    on_fail: "WARN — proceed, clone will have less RAG depth"

  phase_5:
    name: "Validation & Readiness"
    agent: mind-validator
    task: validate-mind.md
    depends_on: [phase_3, phase_4]
    inputs:
      - "outputs/minds/{slug}/"
    outputs:
      - "outputs/minds/{slug}/readiness-report.yaml"
    quality_gate:
      minimum: "Readiness score >= 60"
      ideal: "Readiness score >= 80"
    on_fail: "BLOCK if score < 60, WARN if 60-79"

completion:
  success: |
    Mind {slug} pronta! Readiness score: {score}
    Localização: outputs/minds/{slug}/

    Para deployar, ative o Clone Deploy Chief:
    /clone-deploy → *diagnose {slug}

  partial: |
    Mind {slug} criada com score {score} (abaixo do ideal).
    Gaps identificados: {gaps_list}
    Pode prosseguir para clone-deploy com warnings ou corrigir gaps primeiro.

  blocked: |
    BLOQUEADO: Score {score} abaixo do mínimo (60).
    Ações necessárias: {required_actions}
    Execute *gaps {slug} para ver detalhes.
---
