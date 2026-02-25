# Task: Lead Scoring
**Agente:** SDR
**Input:** Lead bruto (nome, email, fonte, dados cadastrais)
**Output:** Lead com score (0–100) + prioridade (quente/morno/frio)

---

## Objetivo
Pontuar cada lead recebido do Marketing com base no fit com o ICP do SPFP.

## Critérios de Score

| Dimensão | Pontos máx | Indicadores |
|----------|-----------|-------------|
| Fit com ICP (perfil) | 30 | Faixa etária, renda estimada, comportamento no site |
| Budget (pode pagar) | 25 | Fonte do lead, produto de interesse, dados autodeclarados |
| Need (tem o problema) | 25 | Conteúdo consumido, formulário preenchido, dor declarada |
| Timeline (quer agora) | 20 | Velocidade de resposta, urgência demonstrada |

## Score → Ação

| Score | Classificação | SLA de contato |
|-------|---------------|---------------|
| 80–100 | 🔥 Lead Quente | Contato em < 2h |
| 60–79 | 🌡️ Lead Morno | Contato em < 24h |
| < 60 | ❄️ Lead Frio | Volta para nurture (Marketing) |

## Critérios de Done
- [ ] Score calculado e documentado no CRM
- [ ] Lead classificado (quente/morno/frio)
- [ ] Leads frios encaminhados para Marketing (nurture)
- [ ] Leads quentes/mornos avançados para lead-qualification
