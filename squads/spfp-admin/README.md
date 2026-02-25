# Squad de Administração SPFP

**AI Head de Administração:** Sheryl Sandberg (clone MMOS — `outputs/minds/sheryl-sandberg/`)
**Skill de ativação:** `/spfp-admin`
**Criado em:** 2026-02-25

---

## Missão

Garantir que todo o backoffice do SPFP funcione de forma previsível, eficiente e em conformidade — liberando os outros squads para fazerem o trabalho deles sem se preocupar com administração.

---

## Agentes e Inspirações

| Agente | Skill | Inspiração | Responsabilidade |
|--------|-------|-----------|-----------------|
| Sheryl Sandberg (Chief) | `/spfp-admin` | COO Meta/Google | Triage, coordenação, compliance geral, budget |
| Financeiro | `/spfp-admin:agents:financeiro` | Mike Michalowicz (Profit First) | Contas a pagar/receber, fluxo de caixa, DRE |
| RH/People | `/spfp-admin:agents:rh-people` | Laszlo Bock (Work Rules!) | Recrutamento, onboarding, gestão, offboarding |
| Jurídico | `/spfp-admin:agents:juridico` | Mark Cuban | Contratos, compliance legal, LGPD, disputas |
| Facilities | `/spfp-admin:agents:facilities` | Jason Fried (Rework) | Acessos, ferramentas SaaS, fornecedores |
| Compliance | `/spfp-admin:agents:compliance` | Ray Dalio (Principles) | Auditoria, políticas, governança |

---

## Workflow: Admin Operations

```
ENTRADA: Pedido de qualquer squad
    ↓
TRIAGE (Sheryl Sandberg classifica):
  • Pagamento → FINANCEIRO
  • Pessoa → RH/PEOPLE
  • Contrato/Legal → JURÍDICO
  • Ferramenta/Acesso → FACILITIES
  • Auditoria/Política → COMPLIANCE
    ↓
EXECUTA TASK
    ↓
QUALITY GATE: Precisa aprovação (Head/CEO)?
  SIM → aprova → executa
  NÃO → executa direto
    ↓
ENTREGA → Notifica squad que pediu

PARALELOS CONTÍNUOS:
  Financeiro: DRE mensal → CEO
  Compliance: Auditoria trimestral → Head Admin
  RH: Pesquisa de clima trimestral
  Facilities: Auditoria de ferramentas mensal
```

---

## Tasks Disponíveis

| Task | Agente | Frequência |
|------|--------|-----------|
| `triage` | admin-chief | Sob demanda |
| `contas-a-pagar` | Financeiro | Contínua |
| `contas-a-receber` | Financeiro | Contínua |
| `fluxo-de-caixa` | Financeiro | Semanal |
| `report-financeiro` | Financeiro | Mensal (dia 5) |
| `recrutamento` | RH/People | Sob demanda |
| `onboarding-interno` | RH/People | Por contratação |
| `gestao-pessoas` | RH/People | Contínua |
| `offboarding` | RH/People | Por desligamento |
| `contrato` | Jurídico | Sob demanda |
| `compliance-legal` | Jurídico | Trimestral |
| `disputa` | Jurídico | Sob demanda |
| `gestao-acessos` | Facilities | Sob demanda |
| `gestao-ferramentas` | Facilities | Mensal |
| `gestao-fornecedores` | Facilities | Sob demanda |
| `auditoria` | Compliance | Trimestral |
| `politica` | Compliance | Sob demanda |
| `lgpd` | Compliance | Contínua |

---

## Como Ativar

```bash
# Chief (Sheryl Sandberg — triage e coordenação)
/spfp-admin

# Agentes especializados
/spfp-admin:agents:financeiro
/spfp-admin:agents:rh-people
/spfp-admin:agents:juridico
/spfp-admin:agents:facilities
/spfp-admin:agents:compliance
```

---

## Conexões

| Direção | De → Para | O quê |
|---------|-----------|-------|
| ← Entrada | Qualquer squad → Admin | Pedidos de pagamento, contratação, acesso, contrato |
| → Saída | Admin → CEO | DRE mensal + relatório de saúde admin |
| ↔ | Admin ↔ OPS | Processos admin construídos/melhorados pelo OPS |
| → Saída | Admin → CS | Alerta de inadimplência de cliente |
