# Task: Forecast
**Agente:** Analista de Vendas
**Input:** Pipeline atual (deals + probabilidades)
**Output:** Projeção de receita + alerta se meta em risco + sugestões corretivas

---

## Objetivo
Projetar a receita do mês/trimestre e alertar o Head de Vendas quando a meta está em risco.

## Metodologia de Forecast

```
Receita Projetada = Σ (Valor de cada deal × Probabilidade de fechamento)

Probabilidade por etapa:
- Lead Scoring: 5%
- Lead Qualification: 15%
- First Contact: 25%
- Discovery Call: 40%
- Proposta enviada: 55%
- Negociação ativa: 75%
- Contrato assinado: 95%
```

## Alertas de Risco

| Situação | Alerta |
|----------|--------|
| Forecast < 80% da meta | 🔴 RISCO — ação imediata necessária |
| Forecast 80–95% da meta | 🟡 ATENÇÃO — monitorar diariamente |
| Forecast > 95% da meta | 🟢 ON TRACK |

## Output Esperado

```
FORECAST — [mês/período]

META DO PERÍODO: R$X
RECEITA JÁ FECHADA: R$X (X% da meta)
RECEITA PROJETADA (pipeline ponderado): R$X
TOTAL ESPERADO: R$X (X% da meta)

STATUS: 🔴/🟡/🟢

DETALHAMENTO DO PIPELINE
[tabela com deals, valores, probabilidade, data esperada de fechamento]

CENÁRIOS
Pessimista (75% do forecast): R$X
Esperado (100%): R$X
Otimista (125%): R$X

AÇÕES PARA ATINGIR META
1. [ação específica — ex: reativar X deals parados em proposta]
2. [ação específica — ex: acelerar Y deals em discovery]
```

## Critérios de Done
- [ ] Forecast calculado com probabilidades por etapa
- [ ] Status de risco definido (🔴/🟡/🟢)
- [ ] Três cenários calculados (pessimista/esperado/otimista)
- [ ] Ações corretivas sugeridas se em risco
- [ ] Relatório entregue ao Head de Vendas
