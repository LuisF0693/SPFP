---
task-id: resolve
agent: suporte
inputs:
  - name: ticket-n1
    description: Ticket classificado como N1 (dúvida de uso, FAQ, configuração básica)
outputs:
  - description: Solução aplicada e documentada + cliente satisfeito
ferramentas: [Notion (KB), Intercom]
---

## O que faz
- Acessa a base de conhecimento (KB) para encontrar a solução correta
- Responde ao cliente com a solução de forma clara e amigável
- Confirma que o cliente conseguiu resolver o problema
- Documenta a solução no ticket para histórico
- Identifica se a dúvida é frequente e deveria estar na KB (se não estiver)
- Fecha o ticket após confirmação de resolução

## Não faz
- Inventar soluções que não estão na KB
- Resolver problemas técnicos que são N2/N3
- Fechar ticket sem confirmar resolução com o cliente

## Ferramentas
- Notion KB (base de conhecimento de suporte)
- Intercom (comunicação com cliente)
- Zendesk / Freshdesk (registro da solução)

## Dúvidas N1 mais comuns no SPFP

1. **Como lançar uma transação parcelada?**
   → Transações → Nova → Parcelado → define parcelas

2. **Como exportar relatório?**
   → Relatórios → Exportar → escolhe período e formato

3. **Como criar orçamento mensal?**
   → Orçamento → Nova categoria → define valor mensal

4. **Esqueci minha senha**
   → Login → Esqueci a senha → email de recuperação

5. **Como categorizar uma transação?**
   → Clica na transação → Editar → seleciona categoria

## Formato da resposta padrão

```
Oi [Nome]! Consegui resolver aqui.

[Solução passo a passo, simples e clara]

Se precisar de mais alguma coisa, é só chamar! 😊
```
