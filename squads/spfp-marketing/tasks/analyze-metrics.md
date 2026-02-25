---
task-id: analyze-metrics
agent: email-strategist
inputs:
  - name: dados-envio
    description: Relatório de performance dos emails enviados na semana
outputs:
  - description: Relatório semanal de email marketing + recomendações de otimização
ferramentas: [ActiveCampaign, Google Sheets]
---

## O que faz
- Coleta métricas semanais de todos os disparos realizados
- Calcula open rate, CTR, conversão, receita gerada, cancelamentos
- Identifica emails com performance abaixo do benchmark
- Identifica emails com performance acima da média (aprender o que funcionou)
- Gera relatório com análise e recomendações para próxima semana
- Apresenta para Head de Marketing com insights acionáveis

## Não faz
- Criar dashboard visual/automatizado (pede OPS)
- Implementar mudanças sem aprovação do Head
- Analisar dados de canais além de email (escopo é só email)

## Ferramentas
- ActiveCampaign / RD Station (dados nativos)
- Google Sheets (consolidação)

## Métricas analisadas

| Métrica | Benchmark | Ação se abaixo |
|---------|-----------|----------------|
| Open Rate | > 30% | Testar assunto diferente |
| CTR | > 4% | Melhorar CTA ou conteúdo |
| Conversão | > 2.5% | Revisar oferta ou segmentação |
| Cancelamentos | < 0.3% | Revisar frequência ou relevância |
| Bounce Rate | < 2% | Limpar lista |

## Formato do relatório semanal

```markdown
## Relatório Email Marketing — Semana [X]

**Resumo**: X emails enviados, X% open rate médio, R$ X em receita

**Destaques positivos**: [O que funcionou bem]
**Pontos de atenção**: [O que precisa melhorar]
**Recomendações**: [3 ações para a próxima semana]
```
