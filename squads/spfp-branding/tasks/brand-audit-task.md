---
task: Brand Audit
responsavel: "@brand-auditor"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - materiais-atuais: Logo, paleta, screenshots do app, landing page, posts de redes sociais, exemplos de copy
  - dados-de-usuarios: NPS atual, reviews do app, menções espontâneas (se disponível)
Saida: |
  - Brand Health Report com score de brand equity (0-100), mapa de touchpoints com scores e top 5 ações prioritárias
Checklist:
  - "[ ] Coletar todos os materiais visuais e de comunicação atuais"
  - "[ ] Aplicar pesquisa de percepção com 5-10 usuários"
  - "[ ] Analisar reviews App Store / Google Play (últimos 90 dias)"
  - "[ ] Auditar cada touchpoint com checklist de consistência"
  - "[ ] Calcular score por dimensão do Aaker Model"
  - "[ ] Identificar gap identidade pretendida vs. percebida"
  - "[ ] Montar Brand Health Report com prioridades"
ferramentas:
  - Notion
  - Google Forms (pesquisa de percepção)
  - SurveyMonkey
  - App Store / Google Play (reviews)
---

## O que faz

- Coleta e analisa todos os materiais visuais e de comunicação atuais da marca
- Mede brand equity nas 5 dimensões do modelo Aaker
- Mapeia todos os touchpoints (app, landing, social, email, ads) com score de consistência
- Identifica gap entre identidade pretendida, comunicada e percebida
- Prioriza ações de melhoria por impacto e esforço

## Não faz

- Definir nova estratégia de marca (brand-chief faz)
- Criar ou redesenhar identidade visual (visual-identity-designer faz)
- Reescrever copy existente (brand-copywriter faz)

## Como executar

1. Solicitar ao CEO todos os materiais atuais da marca
2. Fazer pesquisa de percepção com 5-10 usuários atuais (formulário 10 perguntas)
3. Analisar reviews da App Store e Google Play (últimos 90 dias)
4. Auditar cada touchpoint com checklist de consistência
5. Calcular score por dimensão do Aaker Model
6. Montar Brand Health Report com prioridades

## Output esperado

```
BRAND HEALTH REPORT — SPFP
Score geral: XX/100
Dimensões: Loyalty XX | Awareness XX | Quality XX | Associations XX | Assets XX
Top 5 ações prioritárias
Mapa de touchpoints com scores
Baseline para medição futura
```

Documento deve ser claro o suficiente para brand-chief usar como input da brand-strategy-task.
