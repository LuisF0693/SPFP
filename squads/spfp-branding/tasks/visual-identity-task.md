---
task: Visual Identity
responsavel: "@visual-identity-designer"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - brand-strategy-document: Output da brand-strategy-task (posicionamento, brand personality, brand ladder)
  - materiais-visuais-atuais: Logo atual (se existir), paleta em uso, screenshots do app, landing page
Saida: |
  - Brand Guidelines visual completo: logo system, paleta de cores (com WCAG AA), tipografia, iconografia e exemplos de aplicação
Checklist:
  - "[ ] Analisar identidade visual atual à luz da brand strategy"
  - "[ ] Criar 3 direções visuais distintas (moodboard + conceito)"
  - "[ ] Apresentar direções para aprovação do CEO"
  - "[ ] Desenvolver a direção aprovada em sistema completo"
  - "[ ] Verificar logo em preto/branco e em 16px-300px"
  - "[ ] Verificar contraste WCAG AA (mínimo 4.5:1) em todas as combinações"
  - "[ ] Verificar funcionamento em modo claro e escuro"
  - "[ ] Documentar Brand Guidelines com regras de uso e usos incorretos"
  - "[ ] Exportar assets prontos (SVG, PNG, exports)"
ferramentas:
  - Figma
  - Canva Pro
  - Coolors
  - Google Fonts
  - Font Pair
  - Adobe Color
---

## O que faz

- Analisa identidade visual atual à luz da brand strategy
- Desenvolve ou refina logo system (principal + variações)
- Define paleta de cores com valores HEX/RGB/HSL e verificação de acessibilidade WCAG AA
- Estabelece sistema tipográfico (famílias, pesos, escala, uso)
- Define estilo de iconografia e ilustração
- Documenta Brand Guidelines com regras de uso e usos incorretos
- Cria exemplos de aplicação (app UI, social media, landing page)

## Não faz

- Definir estratégia ou posicionamento (brand-chief faz)
- Escrever copy ou definir tom de voz (brand-copywriter faz)
- Medir brand equity ou auditar consistência histórica (brand-auditor faz)

## Critérios de aprovação visual

1. Logo funciona em preto e branco
2. Logo funciona em 16px e em 300px
3. Contraste de texto mínimo 4.5:1 (WCAG AA)
4. Paleta funciona em modo claro E escuro
5. Sistema é replicável por qualquer designer sem ambiguidade

## Como executar

1. Receber Brand Strategy Document do brand-chief
2. Criar 3 direções visuais distintas (moodboard + conceito)
3. Apresentar direções para aprovação (não implementar tudo de uma vez)
4. Desenvolver a direção aprovada em sistema completo
5. Documentar Brand Guidelines em PDF/Figma
6. Entregar assets prontos para uso (SVG, PNG, exports)

## Output esperado

```
BRAND GUIDELINES VISUAL — SPFP

1. LOGO SYSTEM
   - Logo principal (horizontal + vertical)
   - Variações: positivo, negativo, monocromático
   - Favicon e app icon (1024x1024)
   - Zona de proteção e tamanho mínimo
   - Usos incorretos (exemplos)

2. PALETA DE CORES
   - Cor primária: HEX + variações 50-900
   - Cor secundária: HEX + variações
   - Neutras: cinzas
   - Feedback: sucesso/erro/alerta/info
   - Verificação WCAG AA para todas as combinações

3. SISTEMA TIPOGRÁFICO
   - Família principal + web-safe fallback
   - Escala: H1-H6, body, caption, label
   - Pesos: Regular/Medium/Semibold/Bold
   - Line-height e letter-spacing por tamanho

4. ICONOGRAFIA
   - Estilo (outline/filled/rounded)
   - Biblioteca recomendada
   - Regras de uso

5. APLICAÇÕES
   - 3 telas do app (mockup)
   - Template Instagram feed + stories
   - Header de email
   - Thumbnail para ads
```
