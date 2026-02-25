# Workflow: Customer Journey

## Entrada: Cliente fechou (vem de VENDAS)

---

## Fase 1: ONBOARDING (Onboarding Specialist)

```
welcome-client → setup-account → first-value
```

### QUALITY GATE 1: Cliente Ativado?
- **NÃO** → Reforço de Onboarding (voltar para setup-account ou first-value)
- **SIM** → Handoff para CS Retenção

```
handoff → CS Retenção recebe cliente com contexto completo
```

---

## Fase 2: CS RETENÇÃO (cs-retencao) — Contínuo

```
health-check (quinzenal) → categoriza base [Saudável / Em Risco / Crítico]
```

**Se Em Risco ou Crítico:**
```
engagement → contato proativo
```

**Se sem resposta após 3 tentativas:**
```
churn-prevention → intervenção estruturada
```

**Se Saudável:**
```
upsell-detection → identifica oportunidade → passa para VENDAS
```

---

## Fase 3: SUPORTE (suporte) — Paralelo e Sob Demanda

```
ticket-triage → classifica N1 / N2 / N3
  ↓ N1: resolve (< 2h)
  ↓ N2: escalate → DEV (< 24h)
  ↓ N3: escalate → Head de CS (< 1h)
```

---

## Fase 4: EXPANSÃO (cs-retencao + Vendas)

```
upsell-detection → oportunidade identificada
  → briefing para VENDAS → Vendas faz o pitch
```

---

## Resultados esperados por fase

| Fase | Métrica | Meta |
|------|---------|------|
| Onboarding | Tempo até primeira vitória | < 7 dias |
| Ativação | % clientes ativados | > 80% |
| Retenção | Monthly Churn Rate | < 3% |
| Satisfação | NPS | > 50 |
| Expansão | NRR (Net Revenue Retention) | > 105% |
