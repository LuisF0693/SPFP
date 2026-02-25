# Workflow: Admin Operations

## ENTRADA: Pedido de qualquer squad (pagamento, contratação, contrato, acesso, etc.)

---

## TRIAGE (admin-chief)

```
admin-chief classifica o pedido:

• Pagamento / nota / fatura / DRE → FINANCEIRO
• Contratação / férias / clima / desligamento → RH/PEOPLE
• Contrato / legal / LGPD / disputa → JURÍDICO
• Ferramenta / acesso / fornecedor → FACILITIES
• Auditoria / política / compliance → COMPLIANCE
```

---

## EXECUÇÃO POR ÁREA

### FINANCEIRO
```
contas-a-pagar → contas-a-receber → fluxo-de-caixa → report-financeiro (mensal)
```

### RH/PEOPLE
```
recrutamento → onboarding-interno → gestao-pessoas → offboarding (quando necessário)
```

### JURÍDICO
```
contrato → compliance-legal → disputa (quando necessário)
```

### FACILITIES
```
gestao-acessos → gestao-ferramentas → gestao-fornecedores
```

### COMPLIANCE
```
auditoria (trimestral) → politica → lgpd (contínuo)
```

---

## QUALITY GATE 1: Precisa aprovação?

```
Task executada
    ↓
Precisa aprovação do Head/CEO?
    SIM → admin-chief (Head) revisa → CEO aprova se necessário → Executa
    NÃO → Executa direto
    ↓
ENTREGA
    ↓
Notifica squad que pediu
```

### Exemplos que precisam aprovação:
- Pagamento acima de R$X → Head Admin aprova
- Pagamento acima de R$Y → CEO aprova
- Nova contratação → Head + CEO decidem
- Desconto em contrato → CEO assina
- Nova política interna → CEO aprova

### Exemplos que NÃO precisam aprovação:
- Emitir nota fiscal de venda normal
- Criar acesso a ferramenta existente para colaborador existente
- Agendar pagamento dentro do budget aprovado
- Publicar vaga aprovada pelo Head do squad
- Responder solicitação LGPD de titular

---

## PARALELOS CONTÍNUOS

```
FINANCEIRO (mensal):
  Contas a pagar → Contas a receber → Fluxo de caixa → DRE + Relatório CEO

COMPLIANCE (trimestral):
  Auditoria de todos os squads → Gaps identificados → Relatório → Head Admin

RH/PEOPLE (contínuo):
  Monitoramento de vencimentos (contratos de trabalho, férias vencendo)
  Pesquisa de clima (trimestral)
  NPS de onboarding (por contratação)

FACILITIES (mensal):
  Auditoria de ferramentas → Assinaturas não usadas → Candidatas a cancelamento
```

---

## Conexões com outros Squads

| Direção | De → Para | O quê |
|---------|-----------|-------|
| ← Entrada | Qualquer squad → Admin | Pedido de pagamento, contratação, acesso, contrato |
| → Saída | Admin → Financeiro | Pagamento processado, nota emitida |
| → Saída | Admin → Squad | Colaborador integrado (RH) |
| → Saída | Admin → Squad | Acesso liberado (Facilities) |
| → Saída | Admin → CEO | DRE + relatório de saúde administrativa |
| ↔ Bidirecional | Admin ↔ OPS | Processos de admin construídos/melhorados pelo OPS |

---

## SLAs por Tipo de Pedido

| Tipo | SLA | Escalona para |
|------|-----|---------------|
| Urgente (impede trabalho) | < 4h | admin-chief imediatamente |
| Normal (operacional) | < 48h | admin-chief revisa |
| Planejado (não urgente) | < 5 dias úteis | Fila normal |
| Aprovação CEO | < 24h | CEO via admin-chief |
