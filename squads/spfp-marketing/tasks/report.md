---
task-id: report
agent: content-manager
inputs:
  - name: metricas-mensais
    description: Dados de tráfego orgânico, rankings e performance de conteúdo do mês
outputs:
  - description: Relatório mensal de SEO e conteúdo orgânico com insights e próximos passos
ferramentas: [Google Search Console, SEMrush, Google Analytics]
---

## O que faz
- Coleta dados mensais do Google Search Console (impressões, cliques, CTR, posição média)
- Identifica artigos que subiram e desceram no ranking
- Identifica oportunidades de atualização (artigos na posição 4-15 que podem subir)
- Compara com mês anterior e com meta estabelecida
- Gera relatório com análise e recomendações para próximo mês
- Apresenta para Head de Marketing

## Não faz
- Criar dashboard automatizado (pede OPS)
- Reescrever artigos diretamente (identifica o que precisa e pede COPY)
- Analisar canais além de SEO/conteúdo orgânico

## Ferramentas
- Google Search Console (dados primários)
- SEMrush / Ahrefs (ranking externo)
- Google Analytics 4 (comportamento do usuário)

## Formato do relatório mensal

```markdown
## Relatório SEO — [Mês/Ano]

### Performance Geral
- Tráfego orgânico: X visitas (+X% vs. mês anterior)
- Impressões no Google: X
- CTR médio: X%
- Posição média: X

### Top 5 Conteúdos do Mês
1. [Artigo X] — X visitas, posição Y
2. ...

### Oportunidades de Quick Win
- [Artigo X] está na posição 8 — update pode subir para top 3

### Recomendações para próximo mês
- [3-5 ações concretas]
```
