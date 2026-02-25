---
task-id: engagement
agent: cs-retencao
inputs:
  - name: clientes-monitorados
    description: Lista de clientes em risco ou inativos identificados no health-check
outputs:
  - description: Ações de engajamento executadas + registro de respostas dos clientes
ferramentas: [CRM, WhatsApp, Email, Intercom]
---

## O que faz
- Contato proativo com clientes que estão inativos há 7+ dias
- Reativação de usuários silenciosos (não respondem comunicações)
- Identifica o momento certo e o canal certo para tocar cada cliente
- Envia conteúdo de valor personalizado ao perfil do cliente
- Oferece ajuda sem pressionar
- Registra resposta do cliente no CRM

## Não faz
- Tentar vender ou fazer upsell (escopo é engajamento)
- Contatar clientes saudáveis desnecessariamente
- Spam de mensagens sem intervalo mínimo

## Ferramentas
- WhatsApp (mensagens personalizadas)
- Email (comunicação mais formal)
- Intercom (mensagens in-app)
- CRM (registro de contatos)

## Playbook de engajamento por situação

### Cliente inativo há 7-14 dias
```
"Oi [Nome]! Vi que faz alguns dias que não acessa o SPFP.
Você está conseguindo usar normalmente?
Posso te ajudar com alguma coisa?"
```

### Cliente inativo há 15-30 dias
```
"Oi [Nome]! Tô passando para te mostrar uma novidade do SPFP
que pode ser muito útil pro seu objetivo de [objetivo declarado].
Posso te mandar mais detalhes?"
```

### Cliente que parou de responder
```
"Oi [Nome], última tentativa de contato.
Se quiser pausar ou cancelar, é só falar —
sem complicação.
Mas se quiser continuar, tô aqui para ajudar no que precisar."
```

## Limite de contato
- Máximo 3 tentativas de engajamento sem resposta
- Intervalo mínimo de 3 dias entre contatos
- Após 3 tentativas sem resposta → acionar churn-prevention
