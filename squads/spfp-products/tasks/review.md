---
task-id: review
agent: content-creator
inputs:
  - name: feedback-qa
    description: Lista de ajustes necessários documentados pelo QA Experience
outputs:
  - description: Conteúdo ajustado e pronto para nova rodada de QA
ferramentas: [Loom, Canva, Google Drive, Notion]
---

## O que faz
- Lê o feedback do QA completo antes de começar qualquer ajuste
- Resolve todos os itens classificados como "crítico" e "importante"
- Atualiza vídeos, áudios ou materiais escritos conforme necessário
- Documenta o que foi ajustado (para o QA verificar eficientemente)
- Entrega o conteúdo revisado para nova rodada de QA

## Não faz
- Aprovar sozinho após o review (QA aprova sempre)
- Ignorar feedback crítico por ser trabalhoso
- Fazer ajustes não solicitados sem consultar PM

## Ferramentas
- Loom (re-gravação de vídeos)
- Canva (ajuste de materiais visuais)
- Google Drive (atualização de arquivos)
- Notion (documentação das mudanças)

## Template de entrega pós-review

```markdown
## Review Concluído — [Nome do Conteúdo] — [Data]

### Itens críticos resolvidos
- [x] [Item 1 do feedback QA] → [O que foi feito]
- [x] [Item 2] → [O que foi feito]

### Itens importantes resolvidos
- [x] [Item 3] → [O que foi feito]

### Sugestões implementadas (opcional)
- [x/☐] [Item X] — [implementado ou não, com motivo]

### Itens que precisam de conversa
- [Se algum ajuste não foi possível, documentar aqui com motivo]
```
