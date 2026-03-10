# ClickUp — Automações: Passo a Passo Exato
**Arquiteto:** Pedro Valerio (OPS)
**Data:** 2026-03-10

> Como acessar: abra a Lista → clique em "Automate" no canto superior direito → "+ Add automation"

---

## AUTOMAÇÃO 1 — CS › Suporte: Atribuir ao abrir ticket

**Onde configurar:** Space CS → Lista 🎫 Suporte

```
WHEN   → "Task created"
THEN   → "Assign to"  →  escolher seu usuário (Luís Fernando)
```

- [ ] Feito

---

## AUTOMAÇÃO 2 — CS › Suporte: Alertar SLA vencido

**Onde configurar:** Space CS → Lista 🎫 Suporte

```
WHEN   → "Due date" → "Due date passes"
IF     → "Status"  →  "does not equal"  →  "FECHADO"
THEN   → "Post a comment"  →  digitar: "⚠️ SLA vencido — ticket precisa de atenção urgente"
```

- [ ] Feito

---

## AUTOMAÇÃO 3 — Vendas › SDR: Notificar quando virar SQL

**Onde configurar:** Space Vendas → Lista 🎯 Pipeline SDR

```
WHEN   → "Status changes"
IF     → "Status"  →  "equals"  →  "SQL 🎯"
THEN   → "Post a comment"  →  digitar: "✅ Lead qualificado como SQL — passar para Pipeline Closer"
```

- [ ] Feito

---

## AUTOMAÇÃO 4 — Vendas › Closer: Criar task de Onboarding ao fechar venda

**Onde configurar:** Space Vendas → Lista 💰 Pipeline Closer

```
WHEN   → "Status changes"
IF     → "Status"  →  "equals"  →  "GANHO ✅"
THEN   → "Create a task"
         → List: CS › 🚀 Onboarding
         → Task name: "Onboarding — {task name}"
         → Assignee: seu usuário
```

- [ ] Feito

---

## AUTOMAÇÃO 5 — Marketing › Editorial: Notificar aprovador

**Onde configurar:** Space Marketing/Produtos → Folder 📢 Marketing → Lista 🗓️ Calendário Editorial

```
WHEN   → "Status changes"
IF     → "Status"  →  "equals"  →  "REVISÃO"
THEN   → "Post a comment"  →  digitar: "👀 Conteúdo aguardando aprovação"
```

- [ ] Feito

---

## AUTOMAÇÃO 6 — Marketing › Editorial: Confirmar publicação

**Onde configurar:** Space Marketing/Produtos → Folder 📢 Marketing → Lista 🗓️ Calendário Editorial

```
WHEN   → "Status changes"
IF     → "Status"  →  "equals"  →  "PUBLICADO ✅"
THEN   → "Post a comment"  →  digitar: "🚀 Publicado! Registrar métricas em 48h."
```

- [ ] Feito

---

## AUTOMAÇÃO 7 — Produto › Bugs: Marcar urgente se crítico

**Onde configurar:** Space Marketing/Produtos → Folder 📦 Produto → Lista 🐛 Bugs

```
WHEN   → "Task created"
IF     → "Custom field"  →  "Severidade"  →  "equals"  →  "Crítico"
THEN   → "Change priority"  →  "Urgent"
```

- [ ] Feito

---

## AUTOMAÇÃO 8 — Qualquer lista: Alerta de prazo próximo

**Onde configurar:** repetir em cada lista que tiver campo de data

```
WHEN   → "Due date"  →  "Due date is approaching"  →  "1 day before"
THEN   → "Post a comment"  →  digitar: "⏰ Prazo amanhã — verificar andamento"
```

- [ ] CS › Suporte
- [ ] Vendas › Pipeline SDR
- [ ] Vendas › Pipeline Closer
- [ ] Marketing › Calendário Editorial
- [ ] Admin › Financeiro

---

## Dica: onde fica o botão "Automate"

```
Dentro da lista → barra superior direita → ícone de raio ⚡ ou botão "Automate"
                                                              ↑
                                              se não aparecer, clique nos "..."
                                              da lista e procure "Automations"
```

---

*Pedro Valerio, OPS Architect — SPFP*
