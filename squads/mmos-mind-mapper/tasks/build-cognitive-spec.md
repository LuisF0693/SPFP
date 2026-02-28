---
task-id: build-cognitive-spec
name: Build Cognitive Spec YAML
agent: persona-synthesizer
version: 1.0.0
purpose: Generate the cognitive-spec.yaml file with all 8 layers structured
workflow-mode: automated
elicit: false
prerequisites:
  - "layers-analysis.md must exist"
  - "system-prompt must be created or in-progress"
---

# Build Cognitive Spec Task

## Purpose
Generate `outputs/minds/{slug}/analysis/cognitive-spec.yaml` using the template.
This file is consumed by clone-diagnostician for quality scoring.

## Execution
1. Read `templates/cognitive-spec-template.yaml`
2. Fill in all fields from `layers-analysis.md`
3. Calculate layer coverage scores (0-10 per layer)
4. Count evidence items per layer
5. Set readiness to "PENDING" (mind-validator will update)
6. Save to `outputs/minds/{slug}/analysis/cognitive-spec.yaml`
