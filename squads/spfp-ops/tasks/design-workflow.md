---
task-id: design-workflow
agent: automation-architect
inputs:
  - name: task-definitions
    description: Task definitions documentadas aprovadas no QG2 (output do create-task-defs)
outputs:
  - description: Automações configuradas e testadas — workflow funcional com triggers, notificações e fallbacks
ferramentas:
  - ClickUp Automations
  - N8N
  - Webhooks
  - APIs
---

## O que faz

- Cria automações que bloqueiam erros entre etapas
- Configura triggers baseados em mudança de status
- Move cards automaticamente conforme progresso
- Configura notificações automáticas para executores
- Integra sistemas externos (ex: Tally → ActiveCampaign, ClickUp → Slack)
- Testa cada automação antes de ativar
- Documenta cada automação criada
- Cria fallback para quando a automação falha

## Não faz

- Definir o processo (Process Mapper faz)
- Definir a arquitetura (Architect faz)
- Executar tarefas operacionais do processo
- Criar task definitions (Architect faz)

## Ferramentas

- **ClickUp Automations**: Triggers internos, mudança de status, notificações
- **N8N**: Integrações entre sistemas, lógica condicional complexa
- **Webhooks**: Conectores entre plataformas
- **APIs**: Integrações programáticas

## Critério para escolha da ferramenta

| Cenário | Ferramenta |
|---------|-----------|
| Trigger dentro do ClickUp | ClickUp Automations |
| Integração ClickUp ↔ Slack | ClickUp Automations ou N8N |
| Integração Tally → CRM | N8N |
| Webhook externo | N8N + Webhook |
| Lógica condicional complexa | N8N |

## Template de documentação de automação

```
Automação: [Nome descritivo]
Trigger: [O que dispara]
Condição: [Filtro se necessário]
Ação: [O que acontece]
Ferramenta: [ClickUp / N8N / Webhook]
Testada em: [Data]
Testada por: [Perfil do testador]
Fallback: [O que acontece se falhar]
Doc Notion: [Link]
```
