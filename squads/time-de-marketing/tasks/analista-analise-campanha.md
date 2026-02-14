---
task: Análise de Campanha
responsavel: "@analista"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - campanha: Nome/descrição da campanha
  - periodo: Duração da campanha
  - objetivo: Objetivo original (vendas, leads, awareness)
  - metricas: Dados de performance
  - investimento: Valor investido (se ads)
Saida: |
  - analise: Análise completa de performance
  - roi: Cálculo de ROI/ROAS
  - aprendizados: O que funcionou e o que não
  - proximos_passos: Recomendações
Checklist:
  - "[ ] Entender objetivo da campanha"
  - "[ ] Coletar todas as métricas"
  - "[ ] Calcular ROI/ROAS"
  - "[ ] Analisar funil completo"
  - "[ ] Identificar aprendizados"
  - "[ ] Gerar recomendações"
---

# *analise-campanha

Analisa performance completa de uma campanha de marketing com ROI e aprendizados.

## Uso

```
@analista *analise-campanha
# → Modo interativo

@analista "Analise minha campanha de Black Friday:
- Investido: R$500 em ads
- Alcance: 25.000
- Cliques: 800
- Leads: 120
- Vendas: 15
- Receita: R$3.000"
```

## Elicitação

```
1. Qual era o objetivo da campanha?
   A. Vendas diretas
   B. Geração de leads
   C. Awareness/alcance
   D. Lançamento de produto

2. Qual foi o período?
   (Data início e fim)

3. Quanto investiu em anúncios?
   (R$0 se foi apenas orgânico)

4. Me passe os números do funil:

   TOPO (Awareness):
   - Alcance/Impressões: ___

   MEIO (Consideração):
   - Cliques/Visitas: ___
   - Engajamento: ___

   FUNDO (Conversão):
   - Leads capturados: ___
   - Vendas realizadas: ___
   - Receita total: ___

5. O que você esperava de resultado?
   (Meta original)
```

## Output

```markdown
# Análise de Campanha: [Nome]

## Visão Geral

| Item | Valor |
|------|-------|
| **Campanha** | [Nome] |
| **Período** | [Início] a [Fim] |
| **Objetivo** | [Objetivo] |
| **Investimento** | R$ [valor] |
| **Resultado** | [Resumo em 1 linha] |

---

## Performance do Funil

```
ALCANCE          CLIQUES         LEADS           VENDAS
[número]    →    [número]    →   [número]    →   [número]
            [X%]            [X%]            [X%]
```

### Métricas Detalhadas

| Etapa | Número | Taxa | Benchmark |
|-------|--------|------|-----------|
| Alcance | [X] | - | - |
| Cliques | [X] | [X%] CTR | 1-3% |
| Leads | [X] | [X%] Conv. | 5-15% |
| Vendas | [X] | [X%] Close | 2-10% |

---

## ROI / ROAS

### Cálculos

```
Investimento Total: R$ [X]
├── Ads: R$ [X]
├── Ferramentas: R$ [X]
└── Outros: R$ [X]

Receita Gerada: R$ [X]
├── Vendas diretas: R$ [X]
└── Valor estimado leads: R$ [X]

ROI = (Receita - Investimento) / Investimento × 100
ROI = [X]%

ROAS = Receita / Investimento em Ads
ROAS = [X]x
```

### Interpretação

| Métrica | Resultado | Avaliação |
|---------|-----------|-----------|
| ROI | [X%] | [Bom/Regular/Ruim] |
| ROAS | [X]x | [Bom/Regular/Ruim] |
| CPL (Custo por Lead) | R$ [X] | [Bom/Regular/Ruim] |
| CPA (Custo por Venda) | R$ [X] | [Bom/Regular/Ruim] |

---

## Análise por Canal

| Canal | Investido | Resultado | ROI |
|-------|-----------|-----------|-----|
| Instagram | R$ [X] | [X] vendas | [X%] |
| Facebook | R$ [X] | [X] vendas | [X%] |
| Email | R$ [X] | [X] vendas | [X%] |
| Orgânico | R$ 0 | [X] vendas | ∞ |

**Melhor Canal:** [Nome] - [por quê]
**Pior Canal:** [Nome] - [por quê]

---

## O Que Funcionou

1. **[Elemento 1]**
   - Evidência: [dados]
   - Por quê: [análise]
   - Replicar: [como usar novamente]

2. **[Elemento 2]**
   - Evidência: [dados]
   - Por quê: [análise]
   - Replicar: [como usar novamente]

---

## O Que Não Funcionou

1. **[Elemento 1]**
   - Evidência: [dados]
   - Por quê: [análise]
   - Evitar/Ajustar: [o que fazer diferente]

2. **[Elemento 2]**
   - Evidência: [dados]
   - Por quê: [análise]
   - Evitar/Ajustar: [o que fazer diferente]

---

## Comparativo com Meta

| Métrica | Meta | Realizado | Status |
|---------|------|-----------|--------|
| [Métrica 1] | [X] | [Y] | ✅ +[Z%] |
| [Métrica 2] | [X] | [Y] | ❌ -[Z%] |
| ROI | [X%] | [Y%] | ✅/❌ |

---

## Aprendizados Chave

### Para o Time

1. **@cmo:** [Insight estratégico]
2. **@copywriter:** [Insight sobre textos]
3. **@designer:** [Insight sobre visuais]

### Para Próximas Campanhas

1. [Aprendizado aplicável]
2. [Aprendizado aplicável]
3. [Aprendizado aplicável]

---

## Recomendações

### Escalar (funcionou bem)
- [ ] [Ação 1]
- [ ] [Ação 2]

### Otimizar (precisa ajuste)
- [ ] [Ação 1]
- [ ] [Ação 2]

### Cortar (não funcionou)
- [ ] [Ação 1]

---

## Próximos Passos

1. [ ] [Ação imediata - responsável]
2. [ ] [Ação curto prazo - responsável]
3. [ ] [Ação médio prazo - responsável]
```

## Benchmarks de Referência

### Meta Ads (e-commerce)
| Métrica | Bom | Excelente |
|---------|-----|-----------|
| CTR | 1-2% | 2%+ |
| CVR (landing) | 2-5% | 5%+ |
| ROAS | 3x | 5x+ |
| CPM | <R$30 | <R$15 |

### Infoprodutos
| Métrica | Bom | Excelente |
|---------|-----|-----------|
| CPL | <R$5 | <R$2 |
| Taxa conversão | 1-3% | 3%+ |
| ROAS | 5x | 10x+ |
