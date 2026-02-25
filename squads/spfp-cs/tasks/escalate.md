---
task-id: escalate
agent: suporte
inputs:
  - name: ticket-n2-n3
    description: Ticket classificado como N2 (bug técnico) ou N3 (problema crítico/cancelamento)
outputs:
  - description: Ticket escalado com contexto completo + cliente informado + acompanhamento ativo
ferramentas: [ClickUp, Slack, Intercom]
---

## O que faz
- Documenta contexto completo do problema para quem vai resolver
- Escala N2 para DEV via ClickUp com todos os detalhes técnicos
- Escala N3 para Head de CS via Slack com urgência marcada
- Informa o cliente sobre o escalamento e prazo de retorno
- Acompanha o ticket até a resolução final
- Confirma com o cliente quando o problema foi resolvido

## Não faz
- Tentar resolver problemas N2/N3 sem o suporte correto
- Prometer solução antes de ter confirmação do responsável
- Escalar sem contexto completo (o responsável precisa de todas as informações)

## Ferramentas
- ClickUp (tarefas para DEV — N2)
- Slack (alerta urgente para Head — N3)
- Intercom (comunicação com cliente)

## Template de escalamento N2 (DEV)

```
📋 TICKET N2 — [Tipo do problema]

Cliente: [Nome] | Plano: [Plano]
Data do problema: [data]
Urgência: [alta/média]

DESCRIÇÃO DO PROBLEMA:
[Descreva exatamente o que o cliente relatou]

PASSOS PARA REPRODUZIR:
1. [passo 1]
2. [passo 2]

IMPACTO PARA O CLIENTE:
[O que o cliente não consegue fazer por causa disso]

EVIDÊNCIAS:
[Print/vídeo se disponível]
```

## Template de escalamento N3 (Head de CS)

```
🚨 ESCALAMENTO URGENTE — N3

@Head de CS — ação necessária

Cliente: [Nome] | Plano: [Plano]
Situação: [cancelamento / cobrança indevida / perda de dados]
Histórico: [tempo como cliente, valor do plano]
Contexto: [o que aconteceu]

Mensagem do cliente: "[citação direta]"
```

## Mensagem para o cliente ao escalar

```
Oi [Nome], entendi seu problema.
Este caso precisa do nosso time especializado para resolver com a atenção que merece.

Já abri uma tarefa para eles com todos os detalhes que você me passou.
Prazo de retorno: até [X horas/dia].

Vou te avisar assim que tiver uma atualização!
```
