# Squad Branding SPFP

Squad de branding com experts clonados por IA para verificar, modificar e criar a identidade de marca do SPFP.

## Agents

| Agent | Inspiração | Escopo |
|-------|-----------|--------|
| `brand-chief` | Marty Neumeier | Brand strategy, positioning, brand architecture |
| `visual-identity-designer` | Paula Scher | Logo, cores, tipografia, identidade visual |
| `brand-auditor` | David Aaker | Brand audit, brand equity, consistência da marca |
| `brand-copywriter` | Ann Handley | Tom de voz, messaging, copywriting da marca |

## Tasks

| Task | Executor | Output |
|------|---------|--------|
| `brand-audit-task` | brand-auditor | Relatório de auditoria da marca atual |
| `brand-strategy-task` | brand-chief | Brand strategy document + positioning statement |
| `visual-identity-task` | visual-identity-designer | Brand guidelines visuais |
| `brand-voice-task` | brand-copywriter | Brand voice & tone guide |

## Workflow Recomendado

1. **Auditar** → `brand-auditor *brand-audit` — Entender o estado atual da marca
2. **Estrategia** → `brand-chief *brand-strategy` — Definir posicionamento e arquitetura de marca
3. **Visual** → `visual-identity-designer *visual-identity` — Criar/atualizar identidade visual
4. **Voz** → `brand-copywriter *brand-voice` — Definir tom de voz e mensagens-chave
