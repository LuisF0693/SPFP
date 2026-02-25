---
task-id: upsell-detection
agent: cs-retencao
inputs:
  - name: historico-cliente
    description: Histórico de uso, comportamento e perfil do cliente
outputs:
  - description: Oportunidades de upsell identificadas e documentadas + encaminhadas para Vendas
ferramentas: [CRM, Intercom, ClickUp]
---

## O que faz
- Analisa padrão de uso do cliente em busca de sinais de expansão
- Identifica quando o cliente está "outgrow-ing" o plano atual
- Detecta necessidades não atendidas que um plano superior resolveria
- Documenta a oportunidade com contexto e timing ideal
- Encaminha a oportunidade para Vendas com briefing completo
- Não faz o pitch de venda (isso é responsabilidade de Vendas)

## Não faz
- Vender diretamente ao cliente (passa para Vendas)
- Forçar upsell em clientes insatisfeitos
- Detectar oportunidades sem contexto sólido de uso

## Ferramentas
- CRM (análise de histórico)
- Intercom (dados de engajamento)
- ClickUp (registro de oportunidades)

## Sinais de upsell no SPFP

| Sinal | O que indica | Upsell sugerido |
|-------|-------------|-----------------|
| Usa o produto diariamente | Alta dependência / engajamento | Plano anual (desconto) |
| Tem 3+ contas cadastradas | Usuário avançado | Plano com mais integrações |
| Perguntou sobre feature premium | Interesse expresso | Demo do plano Pro |
| Indicou 2+ amigos | Embaixador | Plano família / grupo |
| NPS 9-10 | Promotor satisfeito | Timing ideal para upgrade |

## Template de briefing para Vendas

```markdown
## Oportunidade de Upsell — [Nome do Cliente]

**Plano atual**: [plano]
**Tempo como cliente**: [X meses]
**Health Score**: [score]

**Sinal identificado**: [descreva o sinal]
**Oportunidade**: [qual upgrade faz sentido e por quê]
**Momento ideal para abordar**: [agora / após X evento]

**Tom sugerido**: [consultivo, não empurrativo]
**O que NÃO mencionar**: [pontos sensíveis se houver]
```
