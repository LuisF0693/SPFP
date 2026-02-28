---
task-id: synthesize-persona
name: Synthesize Persona & System Prompt
agent: persona-synthesizer
version: 1.0.0
purpose: Create system prompt and synthesis documents from layer analysis
workflow-mode: interactive
elicit: false
prerequisites:
  - "outputs/minds/{slug}/analysis/layers-analysis.md must exist"
  - "Minimum 6 of 8 layers covered"
---

# Synthesize Persona Task

## Purpose
Transform the layer analysis into a first-person system prompt that makes an LLM sound like the person.

## Execution

### Step 1: Read Layer Analysis
Read `outputs/minds/{slug}/analysis/layers-analysis.md` completely.

### Step 2: Build System Prompt
Use `templates/system-prompt-template.md` as structure.

**Critical rules:**
- Write in first person ("Eu sou...", "Para mim...", "Quando penso sobre...")
- Use the person's actual vocabulary from Layer 2
- Open with Identity Core (Layer 7) + Productive Paradoxes (Layer 8)
- Make it feel like the person is speaking, not being described
- Target 2000-5000 tokens
- Include behavioral constraints (what the clone would NOT do/say)

### Step 3: Create Synthesis Documents

**worldview.md** — Expanded worldview based on Layers 5+6
- Their theory of how the world works
- What they believe about human nature, organizations, change
- 800-1500 tokens

**communication-style.md** — Complete communication guide from Layer 2
- Tone and register guide
- Vocabulary list with context
- Metaphor domains
- Sentence structure patterns
- DO and DON'T examples
- 500-1000 tokens

**signature-phrases.md** — Characteristic expressions
- 20-30 phrases the person actually uses
- Context for when/how they use each
- Phrases that would BREAK the illusion (anti-patterns)
- 400-600 tokens

### Step 4: Build Cognitive Spec
Fill in `templates/cognitive-spec-template.yaml` with all extracted data.
Save as `outputs/minds/{slug}/analysis/cognitive-spec.yaml`.

## Output Files
- `outputs/minds/{slug}/system_prompts/{slug}-system-prompt.md`
- `outputs/minds/{slug}/synthesis/worldview.md`
- `outputs/minds/{slug}/synthesis/communication-style.md`
- `outputs/minds/{slug}/synthesis/signature-phrases.md`
- `outputs/minds/{slug}/analysis/cognitive-spec.yaml`

## Quality Check
After creating system prompt, test it mentally:
- Read 3 questions to the prompt — does it respond in a recognizable voice?
- Does it use vocabulary from Layer 2?
- Does it reflect values from Layer 4?
- Does it express beliefs from Layers 5+6?
- Does it embody the paradoxes from Layer 8?
