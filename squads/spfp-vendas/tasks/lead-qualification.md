# Task: Lead Qualification
**Agente:** SDR
**Input:** Lead com score (de lead-scoring)
**Output:** Lead qualificado (SQL) com BANT completo, ou lead descartado com motivo

---

## Objetivo
Aplicar BANT para confirmar que o lead é um SQL real antes de enviar para o Closer.

## Framework BANT

**Budget:** O lead pode pagar pelo SPFP sem que seja uma decisão financeira difícil?
- Proxy: renda estimada, produto de interesse, resposta ao pricing na conversa

**Authority:** O lead é o decisor da própria vida financeira?
- Flag de risco: "vou falar com meu parceiro" sem ele presente

**Need:** O lead tem um problema real que o SPFP resolve?
- Dores válidas: não sabe onde o dinheiro vai, dívidas ativas, quer investir mas não sabe como, quer construir reserva de emergência

**Timeline:** O lead quer resolver agora (< 30 dias)?
- Flag de risco: "quando tiver tempo" ou "no futuro"

## Resultado da Qualificação

| BANT | Ação |
|------|------|
| Completo (4/4) | SQL — avança para first-contact |
| Parcial (3/4) | Investigar item faltante antes de avançar |
| Incompleto (< 3) | Volta para nurture ou descarte com motivo |

## Critérios de Done
- [ ] BANT avaliado e documentado no CRM
- [ ] Decisão tomada: SQL / volta para nurture / descarte
- [ ] Motivo de descarte registrado (se aplicável)
- [ ] Lead SQL avançado para first-contact
