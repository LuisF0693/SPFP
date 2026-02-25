# Task: Contas a Receber
**Agente:** Financeiro
**Input:** Contratos de clientes / dados de cobrança
**Output:** Faturas emitidas + inadimplência controlada + recebimentos conciliados

---

## Objetivo
Garantir que toda receita seja faturada, cobrada e registrada corretamente.

## Processo

```
1. Emite nota fiscal / fatura conforme contrato
2. Monitora status de pagamento (pago / pendente / vencido)
3. Alerta CS sobre inadimplência (> 15 dias) para contato com cliente
4. Concilia recebimento com extrato bancário
5. Registra no sistema financeiro
```

## Alertas de Inadimplência

| Situação | Ação |
|----------|------|
| 1–15 dias em atraso | Lembrete automático (email/WhatsApp) |
| 15–30 dias | Alerta para CS contatar cliente |
| > 30 dias | Escalonamento para Head Admin + Jurídico |

## Critérios de Done
- [ ] Faturas do período emitidas corretamente
- [ ] Inadimplência mapeada e alertas enviados
- [ ] Recebimentos conciliados com extrato
- [ ] DRE atualizado
