# Task: Gestão de Acessos
**Agente:** Facilities
**Input:** Pedido de criação, revogação ou ajuste de acesso
**Output:** Acesso configurado (ou revogado) + confirmação ao solicitante

---

## Objetivo
Garantir que cada pessoa tenha acesso exatamente às ferramentas que precisa — nem mais, nem menos.

## Processo

```
Criação de acesso:
1. Pedido recebido (via admin-chief ou RH no onboarding)
2. Verifica: Head do squad autorizou este acesso?
3. Cria acesso na ferramenta correta
4. Define permissões (viewer / editor / admin) conforme função
5. Adiciona ao 1Password vault correto
6. Testa acesso funcionando
7. Confirma para o solicitante

Revogação de acesso (ex.: desligamento):
1. RH aciona imediatamente no dia do desligamento
2. Revoga TODOS os acessos em < 2 horas
3. Remove de 1Password, Google, Slack, ClickUp, Notion, ferramentas do squad
4. Confirma revogação completa para RH
```

## Inventário de Acessos

Cada colaborador tem acesso registrado em planilha:
- Ferramenta → Nível de acesso → Responsável → Data de criação

## Critérios de Done
- [ ] Acesso criado/revogado no sistema
- [ ] Permissões corretas aplicadas
- [ ] Inventário atualizado
- [ ] Confirmação enviada ao solicitante (e ao RH em casos de desligamento)
