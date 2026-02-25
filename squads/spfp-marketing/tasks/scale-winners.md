---
task-id: scale-winners
agent: media-buyer
inputs:
  - name: ads-roas-acima-meta
    description: Anúncios e campanhas com ROAS consistentemente acima da meta por 7+ dias
outputs:
  - description: Budget redistribuído + campanhas escaladas + plano de escala documentado
ferramentas: [Meta Ads Manager, Google Ads]
---

## O que faz
- Identifica campanhas/conjuntos com ROAS > meta por 7+ dias consecutivos
- Aumenta budget de forma gradual (máximo 20-30% de aumento por vez, a cada 3-4 dias)
- Expande públicos dos anúncios vencedores (lookalike maior, interesse similar)
- Replica estrutura vencedora em novos conjuntos com variações de criativo
- Redireciona budget de campanhas ruins para campanhas vencedoras
- Documenta o que está funcionando para alimentar o swipe file

## Não faz
- Aprovar aumento de budget total sozinho (pede aprovação do Head de Marketing)
- Dobrar budget de uma vez (risco de quebrar o algoritmo de otimização)
- Escalar campanha com menos de 7 dias de dados consistentes

## Ferramentas
- Meta Ads Manager
- Google Ads
- Notion (documentação de winners)

## Regra de escala gradual

```
Dia 1: ROAS > meta → Confirma trend
Dia 3: Ainda performando → +20% budget
Dia 6: Ainda performando → +20% budget
Dia 9: Ainda performando → Duplica conjunto para novo público
```

## Critérios de winner

| Critério | Threshold |
|----------|-----------|
| ROAS mínimo | > 3x |
| Dias consecutivos acima da meta | 7+ dias |
| Volume mínimo de conversões | 20+ conversões |
| Estabilidade (sem pico/queda > 40%) | Sim |
