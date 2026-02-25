---
task-id: content-planning
agent: content-manager
inputs:
  - name: keywords-aprovadas
    description: Lista de keywords priorizadas aprovadas pelo Head de Marketing
outputs:
  - description: Pauta mensal priorizada com título, keyword, formato e prazo para cada conteúdo
ferramentas: [Notion, Google Sheets]
---

## O que faz
- Recebe lista de keywords aprovadas do SEO Research
- Define pauta mensal: quantos artigos, quantos vídeos, quais formatos
- Prioriza por potencial SEO (volume × (1/dificuldade) × intenção comercial)
- Alinha pauta com calendário geral de marketing (campanhas, lançamentos, datas sazonais)
- Define prazo para o COPY escrever cada peça
- Distribui equitativamente ao longo do mês
- Apresenta pauta para aprovação do Head de Marketing

## Não faz
- Escrever os conteúdos (pede COPY)
- Publicar sem aprovação
- Ignorar calendário de campanhas de tráfego pago

## Ferramentas
- Notion (calendário editorial)
- Google Sheets (planilha de pauta)

## Formato da pauta mensal

```markdown
## Pauta de Conteúdo — [Mês/Ano]

| # | Título proposto | Keyword principal | Formato | Prazo COPY | Prazo Publicação |
|---|-----------------|-------------------|---------|------------|------------------|
| 1 | Como organizar... | organizar finanças | Artigo | Dia 5 | Dia 10 |
| 2 | Top 5 apps de... | apps controle gastos | Artigo | Dia 8 | Dia 15 |
| 3 | Como sair das... | sair das dívidas | Vídeo YT | Dia 12 | Dia 20 |

**Meta do mês**: X artigos + Y vídeos
**Tráfego orgânico esperado**: +X visitas/mês em 3 meses
```
