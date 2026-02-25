# Task: Contas a Pagar
**Agente:** Financeiro
**Input:** Fatura / boleto de qualquer squad
**Output:** Pagamento processado (aprovado pelo Head)

---

## Objetivo
Garantir que todos os pagamentos sejam processados no prazo, dentro do budget aprovado e devidamente registrados.

## Processo

```
1. Recebe pedido de pagamento (de qualquer squad)
2. Verifica: tem aprovação do Head responsável?
3. Verifica: está dentro do budget do squad?
4. Agenda pagamento (ou executa se urgente)
5. Registra no sistema financeiro (Conta Azul / Omie)
6. Confirma pagamento e notifica squad solicitante
```

## Limites de Aprovação

| Valor | Aprovação necessária |
|-------|---------------------|
| < R$500 | Automático (dentro de budget aprovado) |
| R$500–R$5.000 | Head Admin |
| > R$5.000 | CEO |

## Critérios de Done
- [ ] Aprovação confirmada (se necessária)
- [ ] Budget verificado
- [ ] Pagamento executado ou agendado
- [ ] Registrado no sistema financeiro com categoria correta
- [ ] Comprovante arquivado
- [ ] Squad solicitante notificado
