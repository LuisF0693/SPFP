---
task-id: build-sequence
agent: email-strategist
inputs:
  - name: jornada-lead
    description: Mapa da jornada do lead (entrada, comportamentos, objetivo final)
outputs:
  - description: Automação configurada na ferramenta com sequência de emails agendada
ferramentas: [ActiveCampaign, Klaviyo, RD Station]
---

## O que faz
- Mapeia a jornada do lead desde a entrada até a conversão
- Define sequência de emails: welcome, nurture, venda, reengajamento
- Define calendário de disparos: intervalos, dias da semana, horários
- Configura gatilhos de automação (ex: "se abriu email 3, espera 2 dias e envia email 4")
- Define condições de saída da sequência (ex: "se comprou, sai da sequência de venda")
- Agenda disparos na ferramenta de automação
- Testa o fluxo completo antes de ativar

## Não faz
- Criar a automação técnica/integração com outras ferramentas (pede OPS)
- Escrever os emails da sequência (pede COPY)
- Definir produto ou oferta (pede Head de Marketing)

## Ferramentas
- ActiveCampaign (automação)
- RD Station (alternativo)
- Notion (documentação do fluxo)

## Sequências padrão SPFP

### Welcome Sequence (novo lead)
```
Email 1 (Dia 0): Boas-vindas + lead magnet
Email 2 (Dia 1): O problema que você resolve
Email 3 (Dia 3): Prova social + resultado de cliente
Email 4 (Dia 5): Demo do SPFP
Email 5 (Dia 7): Oferta com urgência
Email 6 (Dia 10): Último aviso da oferta
```

### Reengajamento (inativo > 60 dias)
```
Email 1: "Ainda está aí?"
Email 2 (+3 dias): Novidade do produto
Email 3 (+5 dias): Oferta exclusiva para reativação
→ Se não abriu nenhum: remove da lista ativa
```
