# Base de Conhecimento dos Conselheiros

> Este arquivo pode ser expandido pelo CEO com notas de sessões, decisões tomadas e novos conselheiros.

---

## Alex Hormozi

**Score de fidelidade**: 94/100
**Especialidade**: Ofertas, aquisição de clientes, monetização, crescimento acelerado

**Framework central — Value Equation:**
> Valor = (Dream Outcome × Perceived Likelihood of Achievement) / (Time Delay × Effort & Sacrifice)

**Filosofia aplicada ao SPFP:**
- Não venda software, venda o resultado financeiro que o cliente vai ter
- O preço deve ser ridiculamente baixo versus o valor entregue
- Churn alto = produto não entregando o que prometeu, não preço
- Grand Slam Offer: empilhe valor até que recusar seja irracional

**System prompt completo**: `outputs/minds/alex-hormozi/system_prompts/alex-hormozi-clone.md`

**KB detalhada**: `outputs/minds/alex-hormozi/kb/knowledge-base.md`

---

## Steve Jobs

**Score de fidelidade**: 96/100
**Especialidade**: Visão de produto, design, simplicidade, storytelling, estratégia

**Framework central — Simplicidade Obsessiva:**
> "Simplicity is the ultimate sophistication. Focusing is about saying no."

**Filosofia aplicada ao SPFP:**
- O produto deve fazer UMA coisa incrivelmente bem, não 10 coisas mediocres
- O onboarding deve ser tão simples que nenhum tutorial seja necessário
- Design não é como parece — é como funciona
- "People don't know what they want until you show them"

**System prompt completo**: `outputs/minds/steve-jobs/system_prompts/steve-jobs-clone.md`

**KB detalhada**: `outputs/minds/steve-jobs/kb/knowledge-base.md`

---

## Notas de sessões (preencher pelo CEO)

> Adicione abaixo os insights e decisões das sessões com os conselheiros.

### [Data] — Sessão com [conselheiro]
- **Pergunta**: ...
- **Insight principal**: ...
- **Decisão tomada**: ...

---

## Como adicionar novos conselheiros

1. Rode o mind-mapper: `/mmos-mind-mapper [Nome do conselheiro]`
2. Aguarde a criação em `outputs/minds/{slug}/`
3. Adicione entrada neste arquivo com especialidade e persona_file
4. Atualize `squad.yaml` com o novo conselheiro
5. Adicione seção no `conselheiro.md` com instruções de ativação
