---
task-id: create-process
agent: process-mapper
inputs:
  - name: documento-discovery
    description: Documento de processo atual mapeado (output do discovery-process)
outputs:
  - description: Desenho do processo novo — fluxograma com etapas, handoffs e veto conditions
ferramentas:
  - Figma
  - Notion
  - Miro
---

## O que faz

- Desenha o processo novo com base no discovery
- Define todas as etapas e seus responsáveis
- Elimina os caminhos errados encontrados no discovery
- Define handoffs claros entre etapas
- Documenta veto conditions (o que bloqueia avanço em cada etapa)
- Valida o fluxo com os stakeholders antes de passar pro Architect

## Não faz

- Implementar no ClickUp (Architect faz)
- Criar automações (Automation Architect faz)
- Executar qualquer tarefa do processo
- Definir campos e status (Architect faz)

## Ferramentas

- **Figma/Miro**: Fluxograma do processo novo
- **Notion**: Documentação de handoffs e veto conditions

## O que um bom fluxograma contém

```
Para cada etapa:
- Nome da etapa
- Executor (papel, não pessoa)
- Input recebido
- Output entregue
- Handoff: para quem vai
- Veto condition: o que impede avançar
- Tempo estimado
```

## Output esperado

Fluxograma aprovado pelos stakeholders, pronto para o Architect criar a
arquitetura ClickUp. Deve ser claro o suficiente para alguém que não
participou do processo entender sem explicação.
