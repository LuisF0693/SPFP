# Task: Triage
**Agente:** admin-chief
**Input:** Pedido de qualquer squad (pagamento, contratação, contrato, acesso, auditoria, etc.)
**Output:** Pedido classificado + direcionado para o agente correto + SLA definido

---

## Objetivo
Receber pedidos de qualquer squad, classificar e direcionar para a área correta com SLA definido.

## Matriz de Classificação

| Natureza do pedido | Direciona para | SLA típico |
|-------------------|---------------|-----------|
| Pagamento, nota, fatura, DRE | FINANCEIRO | 48h (urgente: 4h) |
| Contratação, férias, desligamento, clima | RH/PEOPLE | 48h |
| Contrato, legal, LGPD, disputa | JURÍDICO | 48h |
| Ferramenta, acesso, fornecedor | FACILITIES | 4h (acesso) / 48h (resto) |
| Auditoria, política, compliance | COMPLIANCE | 5 dias úteis |

## Verificações na Triage

1. **Urgência real?** — "Urgente" é o que impede alguém de trabalhar agora
2. **Aprovação necessária?** — Já tem aprovação do Head? Se não, pedir antes de executar
3. **Budget disponível?** — Para pedidos financeiros, verificar orçamento aprovado
4. **Completo?** — Pedido tem todas as informações para execução?

## Critérios de Done
- [ ] Pedido recebido e entendido completamente
- [ ] Área responsável identificada
- [ ] SLA definido e comunicado ao solicitante
- [ ] Task criada no ClickUp com prioridade correta
- [ ] Agente responsável notificado
