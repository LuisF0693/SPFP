# Task: Close Deal
**Agente:** Closer
**Input:** Lead pronto (objeções tratadas)
**Output:** Contrato assinado + pagamento coletado + bastão passado para CS

---

## Objetivo
Fechar o contrato, coletar o pagamento e garantir uma transição limpa para CS.

## Processo de Fechamento

```
1. Confirmação verbal
   └── "Com base em tudo que conversamos, você está pronto para começar?"

2. Assinatura do contrato
   └── Envia contrato digital (DocuSign ou equivalente)
   └── Tempo máximo de espera: 48h (depois follow-up)

3. Coleta de pagamento
   └── Processa via Stripe / PagSeguro
   └── Confirma recebimento

4. Confirmação de dados
   └── Email de boas-vindas com dados confirmados
   └── Próximos passos (o que acontece agora)

5. Handoff para CS
   └── Passa contexto completo: dores, motivação de compra, expectativas, tom de comunicação preferido
   └── Introduz o Onboarding Specialist via email/WhatsApp
   └── "A partir de agora [Nome do CS] é seu ponto de contato"
```

## Dados do Handoff para CS

```yaml
cliente:
  nome: [nome completo]
  email: [email]
  whatsapp: [número]
  plano: [plano contratado]
  data_inicio: [data]

contexto_venda:
  dor_principal: [o que motivou a compra]
  expectativa_declarada: [o que o cliente espera em 30/60/90 dias]
  objecoes_superadas: [lista de objeções que foram tratadas]
  tom_de_comunicacao: [formal/informal, canal preferido]

pontos_de_atencao:
  - [qualquer contexto sensível que CS precisa saber]
```

## Critérios de Done
- [ ] Contrato assinado digitalmente
- [ ] Pagamento confirmado no sistema
- [ ] Email de boas-vindas enviado ao cliente
- [ ] Contexto documentado no CRM
- [ ] Handoff realizado: CS notificado com contexto completo
- [ ] Cliente introduzido ao Onboarding Specialist
- [ ] Deal marcado como Fechado/Won no CRM
