---
task-id: health-check
agent: cs-retencao
inputs:
  - name: base-clientes-ativos
    description: Lista de clientes ativos com dados de uso dos últimos 30 dias
outputs:
  - description: Health score atualizado por cliente + lista de clientes em risco priorizados
ferramentas: [CRM, Intercom, Notion]
---

## O que faz
- Avalia health score de cada cliente com base em uso, engajamento e satisfação
- Identifica clientes com score baixo (< 50) para ação imediata
- Identifica clientes em risco médio (50-79) para engajamento proativo
- Categoriza a base: Saudável / Em Risco / Crítico
- Cria lista de ação priorizada com próximos passos para cada cliente em risco
- Atualiza health scores no CRM

## Não faz
- Entrar em contato com clientes nessa task (isso é a task engagement)
- Criar dashboard de métricas (pede OPS)
- Tomar decisões de cancelamento

## Ferramentas
- CRM (dados de histórico e uso)
- Intercom (dados de engajamento)
- Notion (registro e categorização)

## Dimensões do Health Score SPFP

| Dimensão | Peso | Como medir |
|----------|------|-----------|
| Frequência de uso | 35% | Acessos ao app nos últimos 7 dias |
| Profundidade de uso | 25% | Quantas features usou no mês |
| Engajamento com CS | 20% | Respondeu mensagens, participou de check-ins |
| Satisfação (NPS) | 20% | Última pesquisa NPS |

**Score 80-100**: 🟢 Saudável — manter, verificar upsell
**Score 50-79**: 🟡 Em Risco — engajamento proativo esta semana
**Score < 50**: 🔴 Crítico — intervenção imediata (churn-prevention)

## Frequência
- **Semanal**: Para clientes em risco (score < 60)
- **Quinzenal**: Para todos os clientes
- **Mensal**: Relatório completo para Head de CS
