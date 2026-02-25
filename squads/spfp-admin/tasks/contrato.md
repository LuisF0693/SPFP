# Task: Contrato
**Agente:** Jurídico
**Input:** Necessidade (cliente, fornecedor, funcionário, parceiro)
**Output:** Contrato elaborado / revisado (CEO assina)

---

## Objetivo
Garantir que toda relação contratual do SPFP esteja documentada, revisada e proteja os interesses da empresa.

## Processo

```
1. Recebe pedido de contrato (admin-chief encaminha)
2. Identifica tipo: cliente / fornecedor / funcionário / parceiro / NDA
3. Usa template aprovado (não cria do zero sem autorização)
4. Personaliza para o contexto específico
5. Revisão interna (Jurídico valida)
6. Envia para revisão da outra parte
7. Negocia ajustes (dentro dos limites aprovados pelo Head)
8. Contrato final → CEO assina via DocuSign
9. Arquivo digital + prazo de renovação registrado
```

## Templates Disponíveis

Ver `agents/juridico.md` — seção "Contratos Gerenciados"

## Critérios de Done
- [ ] Contrato baseado em template aprovado
- [ ] Revisado pelo Jurídico
- [ ] Enviado para outra parte e acordado
- [ ] Assinado pelo CEO via DocuSign
- [ ] Arquivado com data de vencimento registrada
- [ ] Alerta de renovação configurado (se aplicável)
