# [TD-S1-002] Implementar hard_delete_user_data (LGPD — Direito ao Esquecimento)

> Epic: EPIC-TD-001 | Sprint 1 | Prioridade: CRITICO
> Origem: TD-002 (DB-AUDIT.md — Secao 7.1)
> Owner: @data-engineer + @dev

---

## Contexto

A LGPD (Lei 13.709/2018) garante ao titular dos dados o direito de ter seus dados completamente apagados ("direito ao esquecimento" — Art. 18, VI). O SPFP possui a funcao `soft_delete_user_data()` para exclusao logica, mas nao possui uma funcao de exclusao permanente (`hard_delete_user_data()`).

Isso significa que ao cancelar a conta, os dados do usuario permanecem fisicamente no banco em tabelas como `transactions`, `accounts`, `goals`, `investments`, `ai_history`, `finn_usage` e `automation_logs`. Em caso de requisicao de exclusao por usuario, o sistema nao consegue garantir erradicacao completa — expondo o negocio a risco legal.

**Evidencia tecnica (DB-AUDIT.md — Secao 7.1):**
> "`hard_delete_user_data()` — right to be forgotten: Ausente"
> "Data export function (portabilidade): Ausente"

---

## Objetivo

Implementar o fluxo completo de exclusao permanente de dados do usuario: funcao PostgreSQL `hard_delete_user_data()`, Edge Function protegida para acesso seguro, e UI de "Excluir minha conta" em Settings com confirmacao dupla.

---

## Criterios de Aceitacao

- [ ] AC1: A funcao PostgreSQL `hard_delete_user_data(p_user_id UUID)` existe no banco e deleta permanentemente TODOS os registros do usuario nas tabelas: `transactions`, `accounts`, `categories`, `goals`, `investments`, `ai_history`, `finn_usage`, `automation_logs`, `transaction_groups`, `category_budgets`
- [ ] AC2: A funcao retorna `JSONB` confirmando a exclusao (`{deleted: true, user_id: "..."}`) ou laneca excecao em caso de falha
- [ ] AC3: A funcao e acessivel APENAS via `service_role` (SECURITY DEFINER) — chamadas de usuarios comuns sao bloqueadas
- [ ] AC4: A Edge Function `delete-account` existe em `supabase/functions/delete-account/`, valida o JWT do usuario, e executa `hard_delete_user_data` apenas para o proprio usuario
- [ ] AC5: A UI em `src/components/Settings.tsx` (ou equivalente) possui botao "Excluir minha conta" visivel apenas para o usuario logado
- [ ] AC6: O fluxo de exclusao requer confirmacao dupla: primeiro dialogo de aviso, segundo dialogo pedindo o usuario digitar "EXCLUIR" para confirmar
- [ ] AC7: Apos exclusao bem-sucedida, o usuario e redirecionado para `/login` e a sessao e encerrada
- [ ] AC8: O fluxo completo e testado em ambiente de staging — validar que registros nao existem mais no banco apos chamada

---

## Tarefas Tecnicas

- [ ] Task 1: Listar todas as tabelas com `user_id` no schema (`select table_name from information_schema.columns where column_name = 'user_id'`) — garantir cobertura completa
- [ ] Task 2: Criar migration `supabase/migrations/20260305_hard_delete_user_data.sql` com a funcao `hard_delete_user_data(p_user_id UUID)` deletando em todas as tabelas identificadas
- [ ] Task 3: Criar Edge Function `supabase/functions/delete-account/index.ts` que valida JWT, extrai `user_id` do token, e chama `hard_delete_user_data` via `service_role`
- [ ] Task 4: Adicionar secao "Zona de Perigo" em `src/components/Settings.tsx` com botao "Excluir minha conta" (estilo destrutivo — vermelho)
- [ ] Task 5: Implementar dialogo de confirmacao dupla: modal 1 (aviso sobre irreversibilidade), modal 2 (digitar "EXCLUIR" no campo de texto para confirmar)
- [ ] Task 6: Implementar chamada a Edge Function `delete-account` + `logout()` apos confirmacao, com loading state durante exclusao
- [ ] Task 7: Testar em staging: criar usuario de teste, adicionar dados, chamar exclusao, verificar no Supabase Studio que registros foram removidos
- [ ] Task 8: Adicionar log de auditoria (`audit_logs` ou similar) registrando o evento de hard delete com timestamp — sem dados pessoais

---

## Definicao de Pronto

- [ ] Codigo revisado por pelo menos 1 outro desenvolvedor
- [ ] Migration testada em staging
- [ ] Edge Function deployada e funcional em staging
- [ ] UI de exclusao testada manualmente (fluxo completo: clicar → aviso → digitar → confirmar → logout)
- [ ] Verificado que dados nao existem no banco apos exclusao
- [ ] Nenhuma regressao para usuarios que nao excluem conta

---

## Esforo Estimado

**M** (4-12 horas)
- Task 1 (auditoria de tabelas): ~30min
- Task 2 (migration funcao): ~1h
- Task 3 (Edge Function): ~2h
- Task 4-6 (UI + dialogo): ~3h
- Task 7-8 (testes + auditoria): ~2h

---

## Dependencias

- TD-S1-001 (RLS fix) deve estar completo — nao e um pre-requisito tecnico, mas e recomendado executar RLS fix antes para staging estar limpo
- Ambiente de staging com Supabase CLI configurado
- Acesso ao painel Supabase para verificar exclusao no banco

---

## Notas Tecnicas

- Arquivo de migration: `supabase/migrations/20260305_hard_delete_user_data.sql`
- Edge Function: `supabase/functions/delete-account/index.ts`
- A funcao deve usar `SECURITY DEFINER` e `SET search_path = public` para seguranca
- Referencia de estrutura da funcao em `docs/prd/technical-debt-DRAFT.md` — TD-002
- Auth.users: o usuario deve ser excluido do Auth pelo Supabase Admin API via Edge Function (nao via SQL diretamente)
- Chamar `supabase.auth.admin.deleteUser(userId)` na Edge Function apos `hard_delete_user_data` para remover do Auth
- Settings.tsx localizado em `src/components/Settings.tsx` — verificar se existe ou usar componente equivalente de configuracoes
