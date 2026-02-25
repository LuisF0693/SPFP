---
task-id: ticket-triage
agent: suporte
inputs:
  - name: ticket-aberto
    description: Ticket recebido via Intercom, Zendesk ou email
outputs:
  - description: Ticket classificado (N1/N2/N3) + priorizado + direcionado ao responsável correto
ferramentas: [Intercom, Zendesk, Freshdesk]
---

## O que faz
- Lê e entende o problema descrito no ticket
- Classifica o nível de suporte necessário (N1, N2 ou N3)
- Define a urgência (alta, média, baixa)
- Direciona para o responsável correto (resolve N1, escala N2/N3)
- Envia mensagem de confirmação ao cliente ("recebemos seu ticket, prazo X")
- Registra a classificação no sistema de tickets

## Não faz
- Resolver o ticket nessa task (esta task só classifica e direciona)
- Ignorar tickets sem classificar
- Prometer soluções antes de entender o problema

## Ferramentas
- Intercom (tickets de chat e email)
- Zendesk / Freshdesk (sistema de tickets)

## Matriz de classificação

### N1 — Suporte resolve (< 2h)
- Como fazer X no app?
- Esqueci a senha
- Como cancelar X assinatura?
- Dúvida sobre plano ou funcionalidade

### N2 — Escala para DEV (< 4h)
- Transação não aparecer / aparecer duplicada
- Sincronização bancária com problema
- App travando em X tela
- Erro ao importar extrato CSV

### N3 — Escala para Head de CS (< 1h)
- Cobrança indevida no cartão
- Perda ou corrução de dados
- Cliente solicitando cancelamento
- Ameaça de chargeback ou reclamação pública

## Mensagem padrão de confirmação (N1)

> "Oi [Nome]! Recebemos sua mensagem sobre [resumo do problema].
> Vou resolver isso agora mesmo e te retorno em até 2 horas.
> Qualquer dúvida, é só falar!"
