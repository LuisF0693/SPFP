---
task: Brand Strategy
responsavel: "@brand-chief"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - brand-health-report: Output da brand-audit-task (Brand Health Report com score e gaps)
  - contexto-negocio: Modelo de negócio, ICP, concorrentes, diferenciais percebidos pelo CEO
Saida: |
  - Brand Strategy Document: posicionamento, brand ladder, brand architecture, positioning statement e brand personality
Checklist:
  - "[ ] Revisar Brand Health Report da auditoria"
  - "[ ] Mapear concorrentes no mapa perceptual (2 eixos)"
  - "[ ] Identificar espaço não ocupado (o 'zag')"
  - "[ ] Definir Brand Ladder completo (atributos → espírito)"
  - "[ ] Escrever positioning statement formal"
  - "[ ] Definir brand personality (4 adjetivos com definições)"
  - "[ ] Documentar brand architecture e justificativa"
  - "[ ] Validar direção com CEO antes de distribuir para squad"
ferramentas:
  - Notion
  - Miro (brand map)
---

## O que faz

- Define posicionamento único no mercado (onde o SPFP compete e onde não compete)
- Cria Brand Ladder completo: atributos → benefícios → valores → espírito da marca
- Define brand architecture (marca única vs. sub-marcas)
- Escreve positioning statement formal
- Cria brand personality com 4-5 adjetivos e suas definições
- Mapeia o território competitivo e encontra o "zag"

## Não faz

- Criar identidade visual ou guidelines (visual-identity-designer faz)
- Escrever copy de campanha (brand-copywriter faz)
- Executar auditorias de consistência (brand-auditor faz)

## Como executar

1. Revisar Brand Health Report da auditoria
2. Mapear concorrentes no mapa perceptual (2 eixos de diferenciação)
3. Identificar espaço não ocupado que o SPFP pode dominar
4. Definir Brand Ladder (de dentro para fora: atributos → espírito)
5. Escrever positioning statement no formato: "Para [ICP], o SPFP é o [categoria] que [benefício único] porque [razão para acreditar]"
6. Definir brand personality: 4 adjetivos com definições e exemplos de como se manifesta
7. Documentar tudo no Brand Strategy Document

## Output esperado

```
BRAND STRATEGY DOCUMENT — SPFP

POSICIONAMENTO:
Mapa perceptual + espaço escolhido

BRAND LADDER:
Atributos → Benefícios → Valores → Espírito

POSITIONING STATEMENT:
"Para [ICP], o SPFP é..."

BRAND PERSONALITY:
4 adjetivos com definições

BRAND ARCHITECTURE:
Modelo escolhido + justificativa

PRÓXIMOS PASSOS:
→ Para visual-identity-designer: direção visual
→ Para brand-copywriter: direção de voz
```

Documento serve como briefing oficial para todos os outros agentes do squad.
