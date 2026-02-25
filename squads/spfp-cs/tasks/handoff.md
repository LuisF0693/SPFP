---
task-id: handoff
agent: onboarding-specialist
inputs:
  - name: cliente-ativado
    description: Cliente que teve primeira vitória e está pronto para CS Retenção
outputs:
  - description: Contexto completo documentado no CRM + cliente apresentado ao CS Retenção
ferramentas: [CRM, ClickUp]
---

## O que faz
- Documenta contexto completo do cliente no CRM para o CS Retenção
- Registra: objetivos do cliente, primeira vitória, dificuldades encontradas, preferência de comunicação
- Apresenta formalmente o cliente ao responsável de CS Retenção
- Informa o cliente sobre quem será seu contato daqui em diante
- Marca a tarefa como concluída no ClickUp
- Deixa de acompanhar o cliente após a apresentação

## Não faz
- Continuar sendo o ponto de contato após o handoff
- Deixar o handoff sem documentar o contexto
- Fazer handoff de cliente que ainda não foi ativado (voltar para first-value)

## Ferramentas
- CRM (documentação completa)
- ClickUp (task de handoff)

## Template de documentação de handoff

```markdown
## Handoff — [Nome do Cliente] — [Data]

### Contexto da jornada
- **Data de entrada**: [data de fechamento]
- **Plano**: [plano contratado]
- **Objetivos declarados**: [o que o cliente quer alcançar com o SPFP]

### Onboarding
- **Setup completo**: [sim/não + o que configurou]
- **Primeira vitória**: [descrever o momento]
- **Dificuldades encontradas**: [o que foi difícil]

### Perfil de comunicação
- **Canal preferido**: [WhatsApp / Email / Ligação]
- **Frequência OK**: [semanal / quinzenal / só quando precisar]
- **Horário preferido**: [manhã / tarde / qualquer]

### Notas importantes
- [Qualquer informação relevante para CS Retenção]

### Handoff para
- **CS Retenção**: [Nome do responsável]
- **Data**: [hoje]
```
