---
workflow-id: enrich-mind
name: Enrich Existing Mind
version: 1.0.0
agent: mmos-chief
description: >-
  Adiciona profundidade a uma mind existente com novas fontes ou layers incompletos.
  Usado após quick-profile ou quando o readiness score precisa melhorar.

trigger: "*workflow enrich-mind {slug}"
estimated-duration: "1-2 horas"

inputs:
  - name: slug
    type: string
    required: true
  - name: focus
    type: enum
    options: ["sources", "layers", "kb", "all"]
    default: "all"

phases:
  diagnose:
    name: "Gap Analysis"
    agent: mind-validator
    action: "Identify which dimensions need improvement"

  enrich:
    name: "Targeted Enrichment"
    route_based_on_gaps:
      weak_sources: "@source-collector *collect {slug}"
      missing_layers: "@cognitive-analyst *layer {slug} {n}"
      thin_kb: "@knowledge-curator *build-kb {slug}"
      weak_prompt: "@persona-synthesizer *refine {slug}"

  validate:
    name: "Re-validation"
    agent: mind-validator
    task: validate-mind.md
---
