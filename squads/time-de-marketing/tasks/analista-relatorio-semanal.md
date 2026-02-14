---
task: Relatório Semanal
responsavel: "@analista"
responsavel_type: agent
atomic_layer: task
Entrada: |
  - periodo: Semana a analisar (padrão: última semana)
  - plataformas: Quais plataformas incluir
  - metricas: Métricas fornecidas pelo usuário
  - metas: Metas definidas (opcional)
Saida: |
  - relatorio: Relatório formatado
  - insights: 3-5 insights acionáveis
  - recomendacoes: Próximas ações sugeridas
Checklist:
  - "[ ] Coletar métricas do período"
  - "[ ] Comparar com período anterior"
  - "[ ] Identificar destaques positivos"
  - "[ ] Identificar pontos de atenção"
  - "[ ] Gerar recomendações"
---

# *relatorio-semanal

Gera relatório semanal de performance de marketing com insights acionáveis.

## Uso

```
@analista *relatorio-semanal
# → Modo interativo (pede métricas)

@analista "Relatório semanal do Instagram:
- Alcance: 5.200
- Engajamento: 380
- Novos seguidores: 45
- Cliques no link: 23"
```

## Elicitação

```
1. Quais plataformas incluir?
   [ ] Instagram
   [ ] TikTok
   [ ] YouTube
   [ ] LinkedIn
   [ ] Email
   [ ] Site/Blog

2. Me passe as métricas da semana:

   INSTAGRAM:
   - Alcance total: ___
   - Impressões: ___
   - Engajamento (likes+comments+saves+shares): ___
   - Novos seguidores: ___
   - Cliques no link da bio: ___
   - Melhor post: ___

   (Repetir para cada plataforma)

3. Teve alguma campanha ou ação especial?
   (Lançamento, promoção, collab, etc.)

4. Qual sua meta de [métrica principal]?
   (Para comparação)
```

## Onde Encontrar as Métricas

| Plataforma | Onde Ver |
|------------|----------|
| Instagram | Insights → Conteúdo → Visão geral |
| TikTok | Analytics → Visão geral |
| YouTube | Studio → Analytics |
| LinkedIn | Analytics da página |
| Email | Dashboard da ferramenta |

## Output

```markdown
# Relatório Semanal de Marketing

**Período:** [Data início] a [Data fim]
**Comparativo:** vs semana anterior

---

## Resumo Executivo

### 🎯 Resultado Geral: [BOM/ATENÇÃO/CRÍTICO]

[2-3 frases resumindo a semana]

### Destaques
- ✅ [Ponto positivo 1]
- ✅ [Ponto positivo 2]
- ⚠️ [Ponto de atenção]

---

## Métricas por Plataforma

### Instagram

| Métrica | Esta Semana | Semana Anterior | Variação |
|---------|-------------|-----------------|----------|
| Alcance | [X] | [Y] | [+/-Z%] |
| Engajamento | [X] | [Y] | [+/-Z%] |
| Taxa Engaj. | [X%] | [Y%] | [+/-Z%] |
| Seguidores | [X] | [Y] | [+/-Z] |
| Cliques Bio | [X] | [Y] | [+/-Z%] |

**Melhor Post:**
- Conteúdo: [descrição]
- Alcance: [número]
- Engajamento: [número]
- Por que funcionou: [análise]

**Pior Post:**
- Conteúdo: [descrição]
- Por que não funcionou: [análise]

### [Outras Plataformas]
...

---

## Análise de Conteúdo

### O que funcionou
| Tipo | Performance | Aprendizado |
|------|-------------|-------------|
| [Tipo 1] | ⬆️ Alta | [Por quê] |
| [Tipo 2] | ⬆️ Alta | [Por quê] |

### O que não funcionou
| Tipo | Performance | Aprendizado |
|------|-------------|-------------|
| [Tipo 1] | ⬇️ Baixa | [Por quê] |

---

## Insights da Semana

1. **[Insight 1]**
   [Explicação e evidência]

2. **[Insight 2]**
   [Explicação e evidência]

3. **[Insight 3]**
   [Explicação e evidência]

---

## Recomendações para Próxima Semana

### Fazer Mais
- [ ] [Ação 1] - porque [razão]
- [ ] [Ação 2] - porque [razão]

### Fazer Menos / Parar
- [ ] [Ação a reduzir] - porque [razão]

### Testar
- [ ] [Experimento] - hipótese: [hipótese]

---

## Metas vs Realizado

| Meta | Target | Realizado | Status |
|------|--------|-----------|--------|
| [Meta 1] | [X] | [Y] | ✅/⚠️/❌ |
| [Meta 2] | [X] | [Y] | ✅/⚠️/❌ |

---

## Próxima Revisão
📅 [Data do próximo relatório]
```

## Benchmarks de Referência

### Instagram (contas pequenas 1k-10k)
| Métrica | Bom | Excelente |
|---------|-----|-----------|
| Taxa Engajamento | 3-6% | 6%+ |
| Crescimento/semana | 1-2% | 3%+ |
| Alcance/post | 20-30% seguidores | 40%+ |

### Email Marketing
| Métrica | Bom | Excelente |
|---------|-----|-----------|
| Taxa Abertura | 20-25% | 30%+ |
| Taxa Clique | 2-3% | 4%+ |
| Unsubscribe | <0.5% | <0.2% |
