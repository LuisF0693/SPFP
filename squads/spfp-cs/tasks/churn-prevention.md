---
task-id: churn-prevention
agent: cs-retencao
inputs:
  - name: sinais-churn
    description: Cliente com health score crítico (< 50) ou sinais de cancelamento identificados
outputs:
  - description: Plano de prevenção de churn executado + resultado documentado
ferramentas: [CRM, ClickUp, WhatsApp, Notion]
---

## O que faz
- Identifica e valida os sinais de churn do cliente
- Cria plano de ação personalizado para o perfil do cliente
- Executa intervenção proativa (antes do cliente cancelar)
- Resolve a causa raiz do problema (quando possível)
- Envolve o Head de CS para casos críticos
- Documenta o resultado (retido, cancelou, resolvido)

## Não faz
- Oferecer desconto sem aprovação do Head de CS
- Ignorar sinais de churn esperando o cliente cancelar
- Usar abordagem genérica (precisa ser personalizada)

## Ferramentas
- CRM (contexto completo do cliente)
- ClickUp (plano de ação)
- WhatsApp / Email (comunicação direta)
- Notion (documentação do caso)

## Principais causas de churn no SPFP e intervenções

| Causa | Sinal | Intervenção |
|-------|-------|-------------|
| Não vê valor | Baixo uso, não ativou | Reactivation call + mostrar primeira vitória |
| Problema técnico não resolvido | Reclamações abertas | Resolver urgente + compensação |
| Preço | Falou em custo | ROI conversation + opção de plano menor |
| Mudança de situação | "Não preciso mais" | Entender situação + pausa ao invés de cancela |
| Concorrente | "Vou tentar X" | Comparação honesta + diferenciais do SPFP |

## Playbook de retenção

### Nível 1 — Score 40-50 (risco)
1. Ligar ou mensagem pessoal de check-in
2. Descobrir causa raiz
3. Resolver o problema imediato
4. Follow-up em 3 dias

### Nível 2 — Score < 40 (crítico)
1. Envolver Head de CS
2. Ligação de retenção formal
3. Oferta de valor (com aprovação do Head)
4. Decisão do cliente documentada

### Nível 3 — Cliente já pediu cancelamento
1. Escalamento imediato para Head de CS
2. "Save call" estruturado
3. Última oferta
4. Aceitar cancelamento com elegância se não reverter

## Documentação obrigatória

Após cada caso de churn prevention, registrar no CRM:
- Causa raiz identificada
- Intervenção realizada
- Resultado (retido / cancelou / pausou)
- Lição aprendida
