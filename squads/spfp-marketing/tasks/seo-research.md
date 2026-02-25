---
task-id: seo-research
agent: content-manager
inputs:
  - name: nicho-tema
    description: Tema ou área temática a pesquisar (ex: "controle financeiro", "investimentos iniciantes")
outputs:
  - description: Lista de keywords priorizadas + oportunidades de conteúdo mapeadas
ferramentas: [Google Search Console, SEMrush, Ahrefs, Google Trends]
---

## O que faz
- Pesquisa palavras-chave relacionadas ao tema com volume de busca e dificuldade
- Analisa as primeiras posições do Google para as keywords principais (concorrência)
- Identifica keywords de cauda longa com baixa competição e boa intenção de busca
- Mapeia oportunidades (keywords que concorrentes rankeiam e o SPFP não)
- Analisa tendências sazonais com Google Trends
- Classifica keywords por intenção: informacional, comercial, transacional

## Não faz
- Escrever o artigo (pede COPY)
- Editar vídeo (pede COPY/Designer)
- Publicar sem aprovação do Head de Marketing

## Ferramentas
- Google Search Console (keywords atuais)
- SEMrush / Ahrefs (análise competitiva)
- Google Trends (sazonalidade)
- Google (pesquisa manual das SERPs)

## Output esperado

```markdown
## Relatório SEO Research — [Tema]

### Top 10 Keywords Priorizadas
| Keyword | Volume/mês | Dificuldade | Intenção | Prioridade |
|---------|-----------|-------------|----------|------------|
| ...     | ...       | ...         | ...      | ...        |

### Oportunidades identificadas
- [Keyword X]: Concorrente Y rankeando, SPFP não. Volume: X. Dificuldade: baixa.

### Keywords a evitar
- [Keyword Z]: Altíssima competição, não vale a pena agora
```
