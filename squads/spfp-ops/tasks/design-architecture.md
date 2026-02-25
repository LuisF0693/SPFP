---
task-id: design-architecture
agent: architect
inputs:
  - name: fluxograma-processo
    description: Desenho do processo novo aprovado no QG1 (output do create-process)
outputs:
  - description: Estrutura definida — pastas, listas, campos personalizados, status e fluxo no ClickUp
ferramentas:
  - ClickUp
  - Notion
  - Google Drive
  - Sheets
---

## O que faz

- Define estrutura de pastas e listas no ClickUp
- Define campos personalizados necessários para o processo
- Define status e fluxo (unidirecional — status só avança)
- Define templates de tarefas
- Define views por executor (cada papel vê só o que precisa)

## Não faz

- Mapear o processo (Process Mapper faz)
- Criar automações (Automation Architect faz)
- Implementar no ClickUp (só define a especificação)
- Executar tarefas operacionais

## Ferramentas

- **ClickUp**: Especificação da estrutura (não implementação)
- **Notion**: Documentação da arquitetura
- **Sheets**: Mapeamento de campos e status

## Princípio do fluxo unidirecional

```
ABERTO → EM ANDAMENTO → EM REVISÃO → APROVADO → CONCLUÍDO

❌ NUNCA: status volta para etapa anterior no fluxo
✅ SEMPRE: se reprovado, cria nova task na etapa correta
```

## Output esperado

Documento de arquitetura com:
1. Hierarquia de pastas/listas no ClickUp
2. Lista de campos personalizados com tipo e opções
3. Lista de status por lista com transições permitidas
4. Template de task para cada tipo
5. Views definidas por executor
