# ClickUp Setup — Checklist de Configuração Manual
**Arquiteto:** Pedro Valerio (OPS)
**Data:** 2026-03-10

> Tudo que a API não consegue fazer por você. Siga a ordem — não pule etapa.

---

## PARTE 1 — Limpeza (5 min)

Deletar as listas padrão "List" que existiam antes da implementação:

- [ ] Abrir Space **Marketing/Produtos** → deletar lista chamada `List`
- [ ] Abrir Space **Administração** → deletar lista chamada `List`
- [ ] Abrir Space **OPS** → deletar lista chamada `List`

> Como deletar: clique com botão direito na lista → "Delete List" → confirmar

---

## PARTE 2 — Status Flows (30 min)

Para cada lista abaixo, clique no ícone de status (bolinha colorida no topo da lista)
e configure os status na sequência exata. Remova os padrões e adicione os listados.

### 🟡 CS — Onboarding
```
NOVO           → cor: #87909e  (tipo: open)
CONTATO_INICIAL → cor: #5f55ee (tipo: custom)
SETUP          → cor: #f8ae00  (tipo: custom)
FIRST_VALUE    → cor: #248f7d  (tipo: custom)
ATIVO ✅       → cor: #008844  (tipo: closed)
```
- [ ] Configurado

### 🟡 CS — Suporte
```
ABERTO         → cor: #87909e  (tipo: open)
TRIAGEM        → cor: #5f55ee  (tipo: custom)
EM_ATENDIMENTO → cor: #f8ae00  (tipo: custom)
AGUARD_CLIENTE → cor: #aa8d80  (tipo: custom)
RESOLVIDO      → cor: #248f7d  (tipo: custom)
FECHADO ✅     → cor: #008844  (tipo: closed)
```
- [ ] Configurado

### 🟡 CS — Retenção & Health
```
MONITORANDO    → cor: #87909e  (tipo: open)
ALERTA 🟡      → cor: #f8ae00  (tipo: custom)
INTERVENÇÃO    → cor: #e16b16  (tipo: custom)
REATIVADO ✅   → cor: #008844  (tipo: custom)
CHURNED ❌     → cor: #f50000  (tipo: closed)
```
- [ ] Configurado

### 🟡 CS — NPS & Feedback
```
COLETANDO      → cor: #87909e  (tipo: open)
ANALISANDO     → cor: #5f55ee  (tipo: custom)
AÇÃO           → cor: #f8ae00  (tipo: custom)
FECHADO ✅     → cor: #008844  (tipo: closed)
```
- [ ] Configurado

---

### 🔵 Vendas — Pipeline SDR
```
LEAD           → cor: #87909e  (tipo: open)
PRIMEIRO_CONT  → cor: #5f55ee  (tipo: custom)
QUALIFICANDO   → cor: #f8ae00  (tipo: custom)
SQL 🎯         → cor: #248f7d  (tipo: custom)
PASS_CLOSER    → cor: #0091ff  (tipo: custom)
PERDIDO ❌     → cor: #f50000  (tipo: closed)
```
- [ ] Configurado

### 🔵 Vendas — Pipeline Closer
```
DISCOVERY      → cor: #87909e  (tipo: open)
PROPOSTA       → cor: #5f55ee  (tipo: custom)
NEGOCIAÇÃO     → cor: #f8ae00  (tipo: custom)
GANHO ✅       → cor: #008844  (tipo: custom)
PERDIDO ❌     → cor: #f50000  (tipo: closed)
```
- [ ] Configurado

### 🔵 Vendas — Análise & Forecast
```
A_GERAR        → cor: #87909e  (tipo: open)
EM_ANÁLISE     → cor: #5f55ee  (tipo: custom)
REVISÃO        → cor: #f8ae00  (tipo: custom)
PUBLICADO ✅   → cor: #008844  (tipo: closed)
```
- [ ] Configurado

---

### 🟢 Marketing — Calendário Editorial
```
IDEIA          → cor: #87909e  (tipo: open)
BRIEFING       → cor: #5f55ee  (tipo: custom)
PRODUÇÃO       → cor: #f8ae00  (tipo: custom)
REVISÃO        → cor: #b660e0  (tipo: custom)
APROVADO       → cor: #248f7d  (tipo: custom)
PUBLICADO ✅   → cor: #008844  (tipo: closed)
```
- [ ] Configurado

### 🟢 Marketing — Tráfego Pago
```
PLANEJANDO     → cor: #87909e  (tipo: open)
CRIANDO        → cor: #5f55ee  (tipo: custom)
EM_REVISÃO     → cor: #b660e0  (tipo: custom)
ATIVA ▶️       → cor: #008844  (tipo: custom)
PAUSADA        → cor: #f8ae00  (tipo: custom)
ENCERRADA ✅   → cor: #248f7d  (tipo: closed)
```
- [ ] Configurado

### 🟢 Marketing — Email Marketing
```
RASCUNHO       → cor: #87909e  (tipo: open)
REVISÃO        → cor: #f8ae00  (tipo: custom)
APROVADO       → cor: #248f7d  (tipo: custom)
AGENDADO       → cor: #5f55ee  (tipo: custom)
ENVIADO ✅     → cor: #008844  (tipo: closed)
```
- [ ] Configurado

### 🟢 Marketing — Research & Intel
```
COLETANDO      → cor: #87909e  (tipo: open)
ANALISANDO     → cor: #5f55ee  (tipo: custom)
DOCUMENTADO ✅ → cor: #008844  (tipo: closed)
```
- [ ] Configurado

### 🟢 Marketing — Performance
```
A_GERAR        → cor: #87909e  (tipo: open)
GERANDO        → cor: #5f55ee  (tipo: custom)
REVISÃO        → cor: #f8ae00  (tipo: custom)
PUBLICADO ✅   → cor: #008844  (tipo: closed)
```
- [ ] Configurado

---

### 🟢 Produto — Discovery
```
HIPÓTESE       → cor: #87909e  (tipo: open)
PESQUISANDO    → cor: #5f55ee  (tipo: custom)
VALIDANDO      → cor: #f8ae00  (tipo: custom)
APROVADO ✅    → cor: #008844  (tipo: custom)
DESCARTADO ❌  → cor: #f50000  (tipo: closed)
```
- [ ] Configurado

### 🟢 Produto — Backlog
```
NOVO           → cor: #87909e  (tipo: open)
REFINADO       → cor: #5f55ee  (tipo: custom)
PRIORIZADO     → cor: #f8ae00  (tipo: custom)
PRONTO_SPRINT  → cor: #008844  (tipo: closed)
```
- [ ] Configurado

### 🟢 Produto — Sprint Ativo
```
TODO           → cor: #87909e  (tipo: open)
IN_PROGRESS    → cor: #5f55ee  (tipo: custom)
IN_REVIEW      → cor: #b660e0  (tipo: custom)
DONE ✅        → cor: #008844  (tipo: closed)
```
- [ ] Configurado

### 🟢 Produto — Bugs
```
NOVO           → cor: #87909e  (tipo: open)
TRIAGEM        → cor: #f8ae00  (tipo: custom)
IN_PROGRESS    → cor: #5f55ee  (tipo: custom)
IN_REVIEW      → cor: #b660e0  (tipo: custom)
RESOLVIDO ✅   → cor: #248f7d  (tipo: custom)
FECHADO        → cor: #008844  (tipo: closed)
```
- [ ] Configurado

### 🟢 Produto — Infoprodutos
```
IDEIA          → cor: #87909e  (tipo: open)
PLANEJANDO     → cor: #5f55ee  (tipo: custom)
PRODUÇÃO       → cor: #f8ae00  (tipo: custom)
REVISÃO        → cor: #b660e0  (tipo: custom)
PUBLICADO ✅   → cor: #008844  (tipo: closed)
```
- [ ] Configurado

---

### 🟣 Admin — Financeiro
```
PENDENTE       → cor: #f8ae00  (tipo: open)
EM_PROCESSO    → cor: #5f55ee  (tipo: custom)
CONCLUÍDO ✅   → cor: #008844  (tipo: custom)
VENCIDO ❌     → cor: #f50000  (tipo: closed)
```
- [ ] Configurado

### 🟣 Admin — Jurídico & Compliance
```
NOVO           → cor: #87909e  (tipo: open)
ANÁLISE        → cor: #5f55ee  (tipo: custom)
EM_NEGOCIAÇÃO  → cor: #f8ae00  (tipo: custom)
ASSINADO ✅    → cor: #008844  (tipo: custom)
ARQUIVADO      → cor: #248f7d  (tipo: closed)
```
- [ ] Configurado

### 🟣 Admin — RH & People
```
ABERTO         → cor: #87909e  (tipo: open)
TRIAGEM        → cor: #5f55ee  (tipo: custom)
ENTREVISTANDO  → cor: #f8ae00  (tipo: custom)
OFERTADO       → cor: #248f7d  (tipo: custom)
CONTRATADO ✅  → cor: #008844  (tipo: custom)
ARQUIVADO      → cor: #aa8d80  (tipo: closed)
```
- [ ] Configurado

### 🟣 Admin — Facilities & SaaS
```
SOLICITADO     → cor: #87909e  (tipo: open)
EM_PROCESSO    → cor: #5f55ee  (tipo: custom)
CONCLUÍDO ✅   → cor: #008844  (tipo: closed)
```
- [ ] Configurado

---

### 🔷 OPS — Mapeamento de Processos
```
IDENTIFICADO   → cor: #87909e  (tipo: open)
MAPEANDO       → cor: #5f55ee  (tipo: custom)
REVISÃO        → cor: #f8ae00  (tipo: custom)
APROVADO       → cor: #248f7d  (tipo: custom)
DOCUMENTADO ✅ → cor: #008844  (tipo: closed)
```
- [ ] Configurado

### 🔷 OPS — Arquitetura de Processos
```
RASCUNHO       → cor: #87909e  (tipo: open)
REVISÃO        → cor: #f8ae00  (tipo: custom)
QA_GATE        → cor: #b660e0  (tipo: custom)
APROVADO ✅    → cor: #008844  (tipo: closed)
```
- [ ] Configurado

### 🔷 OPS — Automações
```
BACKLOG        → cor: #87909e  (tipo: open)
ESPECIFICANDO  → cor: #5f55ee  (tipo: custom)
DESENVOLVENDO  → cor: #f8ae00  (tipo: custom)
TESTANDO       → cor: #b660e0  (tipo: custom)
ATIVA ▶️       → cor: #008844  (tipo: custom)
PAUSADA        → cor: #aa8d80  (tipo: closed)
```
- [ ] Configurado

### 🔷 OPS — QA de Processos
```
AGUARD_QA      → cor: #87909e  (tipo: open)
EM_REVIEW      → cor: #5f55ee  (tipo: custom)
APROVADO ✅    → cor: #008844  (tipo: custom)
REPROVADO ❌   → cor: #f50000  (tipo: closed)
```
- [ ] Configurado

### 🔷 OPS — SOPs
```
RASCUNHO       → cor: #87909e  (tipo: open)
REVISÃO        → cor: #f8ae00  (tipo: custom)
PUBLICADO ✅   → cor: #008844  (tipo: custom)
DESATUALIZADO  → cor: #f50000  (tipo: closed)
```
- [ ] Configurado

---

## PARTE 3 — Automações Nativas (20 min)

Configure no menu **Automations** de cada Space/Lista:

### CS — Suporte
- [ ] `Quando: Status → NOVO` / `Ação: Atribuir para responsável de suporte`
- [ ] `Quando: Due Date ultrapassada + Status ≠ FECHADO` / `Ação: Notificar assignee`

### Vendas — Pipeline SDR
- [ ] `Quando: Status → SQL` / `Ação: Notificar Closer + mover para Pipeline Closer`

### Vendas — Pipeline Closer
- [ ] `Quando: Status → GANHO` / `Ação: Criar task em CS › Onboarding com nome do cliente`

### Marketing — Calendário Editorial
- [ ] `Quando: Status → REVISÃO` / `Ação: Notificar campo Aprovador`
- [ ] `Quando: Status → PUBLICADO` / `Ação: Notificar Head de Marketing`

### Produto — Bugs
- [ ] `Quando: task criada + campo Severidade = Crítico` / `Ação: Definir prioridade Urgent + notificar Head de Produto`

### OPS — QA de Processos
- [ ] `Quando: campo Score < 70` / `Ação: Mudar status para REPROVADO`

---

## PARTE 4 — Views (15 min)

Em cada Space, criar as seguintes views além da padrão:

- [ ] **Board View** (Kanban) — visão por status para o executor
- [ ] **Calendar View** — para listas com campo de data (Editorial, Tráfego, Financeiro)
- [ ] **List View filtrada** — `Assignee = Me` + `Due Date = Esta Semana` → chamar de "Minha Semana"

---

## PARTE 5 — Verificação Final

- [ ] Abrir cada lista e criar uma task de teste
- [ ] Confirmar que os campos personalizados aparecem na task
- [ ] Mover a task de teste por todos os status até o fechado
- [ ] Deletar as tasks de teste
- [ ] ✅ ClickUp operante

---

*Checklist gerado por Pedro Valerio (OPS Architect) — SPFP*
*Tempo estimado total: ~70 minutos*
