# Squad de Vendas SPFP

**AI Head de Vendas:** Alex Hormozi (clone, `outputs/minds/alex-hormozi/`, score 94/100)
**Skill de ativação:** `/spfp-vendas`
**Criado em:** 2026-02-25

---

## Missão

Transformar leads qualificados (MQL) do Marketing em receita recorrente, com um processo de vendas consultivo que maximiza CAC e LTV.

---

## Agentes

| Agente | Skill | Responsabilidade |
|--------|-------|-----------------|
| Alex Hormozi (Chief) | `/spfp-vendas` | Define metas, distribui leads, define oferta, reporta ao CEO |
| SDR | `/spfp-vendas:agents:sdr` | Lead Scoring, Qualification, First Contact |
| Closer | `/spfp-vendas:agents:closer` | Discovery Call, Proposta, Negociação, Fechamento |
| Analista de Vendas | `/spfp-vendas:agents:analista-vendas` | Pipeline Analysis, Forecast, Report |

---

## Workflow: Sales Pipeline

```
ENTRADA: Lead vem do Marketing (MQL)
    ↓
SDR → Lead Scoring → [QG1: Lead bom?]
    → NÃO → Nurture (Marketing)
    → SIM → Lead Qualification → [QG2: BANT completo?]
        → NÃO → Volta para SDR
        → SIM → First Contact (agendamento de call)
            ↓
    Closer → Discovery Call → [QG3: Qualificado para proposta?]
        → NÃO → Lost (Analista registra motivo)
        → SIM → Proposta → Negociação → Close Deal
            → NÃO → Lost (Analista registra motivo)
            → SIM → ✅ VENDA FECHADA → CS ASSUME

PARALELO (Analista):
    Pipeline Analysis → Forecast → Report (semanal/mensal)
```

---

## Conexões com outros Squads

| Direção | De → Para | O quê |
|---------|-----------|-------|
| ← Entrada | Marketing → Vendas | MQL (lead qualificado pelo marketing) |
| → Saída | Vendas → CS | Cliente fechado + contexto completo |
| → Saída | Vendas → Marketing | Lead frio → nurture |
| ← Entrada | CS Retenção → Vendas | Lead quente de upsell |

---

## Tasks

| Task | Agente | Descrição |
|------|--------|-----------|
| `lead-scoring` | SDR | Pontua lead 0–100 baseado em fit com ICP |
| `lead-qualification` | SDR | Aplica BANT — SQL ou nurture |
| `first-contact` | SDR | Primeiro contato + agendamento de Discovery |
| `discovery-call` | Closer | Call de discovery — mapeia dores e valida fit |
| `proposta` | Closer | Apresenta Grand Slam Offer personalizado |
| `negotiation` | Closer | Trata objeções e negocia condições |
| `close-deal` | Closer | Fecha contrato + pagamento + handoff para CS |
| `pipeline-analysis` | Analista | Analisa funil e identifica gargalos |
| `forecast` | Analista | Projeta receita e alerta riscos de meta |
| `report` | Analista | Relatório semanal/mensal de performance |

---

## Como Ativar

```bash
# Chief (Alex Hormozi como Head de Vendas)
/spfp-vendas

# Agentes especializados
/spfp-vendas:agents:sdr
/spfp-vendas:agents:closer
/spfp-vendas:agents:analista-vendas
```
