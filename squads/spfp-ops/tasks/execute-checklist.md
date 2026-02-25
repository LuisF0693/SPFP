---
task-id: execute-checklist
agent: qa
inputs:
  - name: checklists-definidos
    description: Checklists de validação criados no design-qa-gates
outputs:
  - description: Processo validado (score >70%) ou lista de correções com ponto de retorno exato
ferramentas:
  - ClickUp
  - Notion
  - Sheets
---

## O que faz

- Executa o checklist definido no design-qa-gates
- Valida se o processo completo funciona na prática
- Testa com uma pessoa leiga (sem conhecimento do processo)
- Documenta todos os problemas encontrados com severidade
- Calcula o score final (aprovados/total × 100)
- Aprova (>70%) ou reprova (≤70%) com justificativa
- Indica exatamente onde voltar se reprovado

## Não faz

- Criar o processo (Process Mapper faz)
- Criar automações (Automation Architect faz)
- Corrigir os problemas encontrados (volta pro agente responsável)
- Pular itens do checklist para agilizar

## Ferramentas

- **ClickUp**: Verificação das configurações
- **Notion**: Registro dos resultados
- **Sheets**: Cálculo do score

## Regra do testador leigo

O processo passa no QA somente se uma pessoa que nunca viu o processo conseguir
executá-lo sem receber ajuda. Se precisar de explicação, o processo falhou.

## Ponto de retorno por tipo de problema

| Problema encontrado | Volta para |
|--------------------|-----------|
| Fluxo confuso ou incompleto | Process Mapper (create-process) |
| Estrutura ClickUp inadequada | Architect (design-architecture) |
| Responsabilidades ambíguas | Architect (design-executors) |
| Task mal definida | Architect (create-task-defs) |
| Automação não funciona | Automation Architect (design-workflow) |
| Critério de gate incorreto | QA (design-qa-gates) |

## Relatório de saída

```
QUALITY GATE 4 FINAL
Score: X/100
Resultado: ✅ APROVADO / ❌ REPROVADO

[Se aprovado]
→ ENTREGA ao squad solicitante

[Se reprovado]
Ponto de retorno: [Etapa exata]
Problemas:
1. [Problema] — Severidade: Alta/Média/Baixa
   Agente responsável: [Quem corrige]
```
