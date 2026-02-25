# Workflow: Sales Pipeline

## ENTRADA: Lead vem do Marketing (MQL)

---

## Fase 1: QUALIFICAÇÃO (SDR)

```
lead-scoring → Lead com score (0–100) + prioridade
```

### QUALITY GATE 1: Lead bom? (score >= 60)
- **NÃO (score < 60)** → Descarta ou volta para nurture (Marketing assume)
- **SIM (score >= 60)** → Lead Qualification

```
lead-qualification → Aplica BANT → Lead qualificado (SQL) ou descartado
```

### QUALITY GATE 2: Qualificado (BANT completo)?
- **NÃO** → Volta para SDR (score, requalifica ou descarta)
- **SIM** → First Contact

```
first-contact → Primeiro contato + agendamento de Discovery Call
```

---

## Fase 2: FECHAMENTO (Closer)

```
discovery-call → Entende dor + mapeia necessidades + valida fit
```

### QUALITY GATE 3: Qualificado para proposta?
- **NÃO** → Lost (Analista registra motivo) ou volta para SDR (nurture)
- **SIM** → Proposta

```
proposta → Apresenta Grand Slam Offer personalizado
  ↓
negotiation → Trata objeções + negocia condições
  ↓
close-deal → Fecha contrato + coleta pagamento + passa bastão para CS
```

### QUALITY GATE FINAL: Fechou?
- **NÃO** → Lost (Analista registra motivo)
- **SIM** → ✅ VENDA FECHADA → CS ASSUME (Lead Contact)

---

## Fase 3: ANÁLISE (Analista de Vendas) — Paralelo e Contínuo

```
pipeline-analysis → Identifica gargalos + taxas de conversão + velocity
  ↓
forecast → Projeção de receita + alerta se meta em risco
  ↓
report → Relatório semanal/mensal para Head de Vendas
```

---

## Conexões com outros Squads

| Direção | De | Para | O quê |
|---------|-----|------|-------|
| ENTRADA | Marketing | Vendas | MQL (lead qualificado pelo marketing) |
| SAÍDA | Vendas | CS | Cliente fechado + contexto completo |
| SAÍDA | Vendas | Marketing | Lead frio → volta para nurture |
| SAÍDA | CS Retenção | Vendas (SDR) | Lead quente de upsell identificado |

---

## Resultados esperados por etapa

| Etapa | Métrica | Meta |
|-------|---------|------|
| Lead Scoring | Taxa de leads quentes (score > 60) | > 40% dos MQLs |
| Lead Qualification | BANT completo | > 60% dos leads quentes |
| First Contact | Taxa de agendamento | > 50% dos qualificados |
| Discovery Call | Taxa de avanço para proposta | > 70% |
| Proposta → Fechamento | Win rate | > 25% |
| Ciclo total | Tempo médio MQL → venda | < 7 dias |
| Receita | CAC | < R$150 |
| Receita | LTV/CAC | > 3:1 |
