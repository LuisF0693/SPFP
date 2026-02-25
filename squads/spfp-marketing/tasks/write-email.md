---
task-id: write-email
agent: email-strategist
inputs:
  - name: briefing
    description: Objetivo do email, produto/oferta, segmento da lista, tom desejado
outputs:
  - description: Segmentação configurada + briefing detalhado para COPY escrever o email
ferramentas: [ActiveCampaign, RD Station, Notion]
---

## O que faz
- Recebe briefing com objetivo do email (venda, nurture, reativação, informativo)
- Segmenta a lista por comportamento (abriu emails anteriores, comprou, não comprou, inativo há X dias)
- Define tags e critérios de quem deve receber o email
- Remove inativos há > 90 dias da lista de envio
- Cria briefing detalhado para o COPY escrever: objetivo, tom, estrutura, CTA, público
- Configura o disparo na ferramenta (assunto, remetente, horário, lista segmentada)

## Não faz
- Escrever o texto do email (pede para COPY)
- Definir o produto ou preço (pede para Head de Marketing)
- Enviar email sem teste A/B de assunto quando possível

## Ferramentas
- ActiveCampaign / RD Station (segmentação e disparo)
- Notion (briefing para COPY)

## Template de briefing para COPY

```markdown
## Briefing: Email [Nome]

**Objetivo**: [vender / nutrir / reativar / informar]
**Segmento**: [ex: leads que não compraram nos últimos 30 dias]
**Tamanho da lista**: [X contatos]
**Tom**: [urgente / educativo / inspiracional / direto]
**CTA principal**: [ex: Assinar o SPFP Pro]
**Assunto sugerido**: [2-3 opções para teste A/B]
**Pré-header sugerido**: [...]
**Estrutura recomendada**: [problema → solução → prova → CTA]
**Deadline para COPY**: [data]
```
