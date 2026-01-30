# ⚡ EXECUTION CHECKLIST - STY-001
## RLS Policies Implementation
**Executor:** Backend Senior
**Sprint:** 0
**Deadline:** End of Sprint (1 week)
**Status:** 🟢 READY

---

## FASE 1: SETUP (30 minutos)

- [ ] **1.1** Ler `docs/BRIEFING-STY-001-RLS.md` completamente
- [ ] **1.2** Verificar acesso a Supabase (staging)
- [ ] **1.3** Clone/Pull do repositório (branch `main`)
- [ ] **1.4** Revisar `supabase/migrations/001-add-rls-policies.sql`

**Checkpoint:** Todas as tasks acima = você está pronto para começar

---

## FASE 2: VALIDAR & TESTAR SQL (1.5 horas)

### 2.1 Conectar ao Supabase Staging (15 min)
- [ ] Ir para https://supabase.com
- [ ] Login com suas credenciais
- [ ] Selecionar projeto SPFP (ID: `jqmlloimcgsfjhhbenzk`)
- [ ] Confirmar que está em **STAGING** (não production)
- [ ] Abrir **SQL Editor**

### 2.2 Executar Migração (30 min)
**Opção A - CLI (preferido):**
- [ ] Abrir terminal na raiz do projeto
- [ ] Executar: `supabase db push --local`
- [ ] Confirmar sucesso na saída

**Opção B - Dashboard (se CLI não funcionar):**
- [ ] No SQL Editor, criar nova query
- [ ] Copiar todo conteúdo de `supabase/migrations/001-add-rls-policies.sql`
- [ ] Colar no editor
- [ ] Executar
- [ ] Verificar que não houve erros

### 2.3 Verificar Aplicação (15 min)
- [ ] Executar query de verificação:
```sql
SELECT tablename, policyname, permissive, roles
FROM pg_policies
WHERE tablename IN ('user_data', 'interaction_logs')
ORDER BY tablename, policyname;
```
- [ ] **ESPERADO:** 8 linhas (4 policies por tabela)
- [ ] **Se menos:** Migração não funcionou, volte a 2.2
- [ ] **Se mais:** Pode ter policies duplicadas, verifique

### 2.4 Testar Isolamento de Dados (30 min)
- [ ] Tentar SELECT de dados de outro usuário:
```sql
SELECT * FROM user_data WHERE user_id != auth.uid();
```
- [ ] **ESPERADO:** Erro `permission denied for table user_data`
- [ ] Se retornar dados = RLS não está funcional, debug

**Checkpoint:** Você viu as 8 policies criadas e testou isolamento com sucesso

---

## FASE 3: CRIAR TESTES (1 hora)

### 3.1 Criar Arquivo de Testes (20 min)
- [ ] Criar novo arquivo: `supabase/tests/rls-user-isolation.test.sql`
- [ ] Copiar template de testes do BRIEFING
- [ ] Adaptar para seu schema (ajustar nomes de colunas se necessário)

### 3.2 Executar Testes (20 min)
- [ ] No SQL Editor, executar cada teste um por um
- [ ] Verificar que:
  - [ ] ❌ Testes de "não autorizado" falham com erro esperado
  - [ ] ✅ Testes de "autorizado" funcionam
- [ ] Documentar resultados em comentários no arquivo

### 3.3 Cleanup (20 min)
- [ ] Remover dados de teste (se criou)
- [ ] Verificar que tabelas voltaram ao estado limpo
- [ ] Salvar arquivo de testes

**Checkpoint:** Arquivo `supabase/tests/rls-user-isolation.test.sql` criado e testes passando

---

## FASE 4: DOCUMENTAÇÃO (30 minutos)

### 4.1 Criar/Atualizar docs/DEPLOYMENT.md (20 min)
- [ ] Se arquivo não existe, criar novo
- [ ] Adicionar seção de RLS Policies (template no BRIEFING)
- [ ] Incluir:
  - [ ] Overview do que é RLS
  - [ ] Tabelas protegidas
  - [ ] Regras de policy
  - [ ] Verification query
  - [ ] Deployment steps
  - [ ] Rollback instructions

### 4.2 Atualizar docs/BRIEFING-STY-001-RLS.md (10 min)
- [ ] Adicionar nota: "✅ Implementado em [DATA]"
- [ ] Adicionar link para PR que fez merge

**Checkpoint:** Documentação completa e clara

---

## FASE 5: GIT & REVIEW (1 hora)

### 5.1 Commit Changes (20 min)
- [ ] `git add supabase/migrations/001-add-rls-policies.sql`
- [ ] `git add supabase/tests/rls-user-isolation.test.sql`
- [ ] `git add docs/DEPLOYMENT.md`
- [ ] `git add docs/BRIEFING-STY-001-RLS.md`
- [ ] Commit com mensagem:
```
feat: implement RLS policies on user_data and interaction_logs [STY-001]

- Enable RLS on user_data table (4 policies: SELECT, INSERT, UPDATE, DELETE)
- Enable RLS on interaction_logs table (3 policies: SELECT, INSERT, DELETE)
- Add SQL isolation tests in supabase/tests/rls-user-isolation.test.sql
- Document RLS deployment procedures in docs/DEPLOYMENT.md
- Verify user data isolation: auth.uid() = user_id for all operations

Closes #STY-001
```

### 5.2 Create Pull Request (20 min)
- [ ] Push branch: `git push origin main`
- [ ] Ir para GitHub: https://github.com/[seu-repo]
- [ ] Criar PR com título: "feat: implement RLS policies [STY-001]"
- [ ] Adicionar checklist de acceptance criteria no PR:
```markdown
## Acceptance Criteria Checklist
- [x] RLS policies created and enabled on user_data table
- [x] SELECT policy restricts to auth.uid() match
- [x] INSERT policy prevents cross-user writes
- [x] UPDATE/DELETE policies restrict to own rows
- [x] SQL test confirms user A cannot read user B data
- [x] Supabase RLS tester shows zero policy violations
- [x] Staging deployment tested and validated
- [x] Code review: 2+ approvals
- [x] All tests passing

## Testing Performed
- [ ] Multi-user isolation verified
- [ ] Permission denied errors confirmed for unauthorized access
- [ ] All 8 policies active in staging
```

### 5.3 Code Review (20 min)
- [ ] Pedir review a 2 seniorores (arquiteto + outro backend)
- [ ] Responder comentários/feedback
- [ ] Fazer adjustments se necessário

**Checkpoint:** PR criado, reviewers atribuídos

---

## FASE 6: VALIDAÇÃO FINAL (30 minutos)

### 6.1 Staging Validation (20 min)
- [ ] Confirmar que migração está em staging
- [ ] Executar verification query uma última vez
- [ ] Testar via aplicação (se possível):
  - [ ] Login com usuário A
  - [ ] Verificar que vê só dados dele
  - [ ] Tentar acessar dados de usuário B via browser console (deve falhar)

### 6.2 Merge & Close (10 min)
- [ ] Após 2 approvals, fazer merge para `main`
- [ ] Deletar branch se quiser
- [ ] Fechar issue/story

**Checkpoint:** PR merged, STY-001 completado

---

## 📊 PROGRESS TRACKER

| Fase | Status | Tempo | Concluído |
|------|--------|-------|-----------|
| 1. Setup | ⬜ | 0.5h | |
| 2. SQL & Testes | ⬜ | 1.5h | |
| 3. Testes | ⬜ | 1h | |
| 4. Documentação | ⬜ | 0.5h | |
| 5. Git & Review | ⬜ | 1h | |
| 6. Validação | ⬜ | 0.5h | |
| **TOTAL** | ⬜ | **4h** | |

---

## 🆘 TROUBLESHOOTING

### ❌ "Migração executou, mas não vejo 8 policies"
```
1. Verifique que executou a query de verificação
2. Se vê 0 policies: Migração provavelmente não rodou
3. Se vê menos de 8: Verifique se há erros na saída SQL
4. Se vê mais de 8: Pode ter duplicatas, delete antigas:
   DROP POLICY IF EXISTS "policy-name" ON table-name;
```

### ❌ "Permission denied error ao executar query"
```
✅ Isso é esperado! Significa RLS está funcionando
   Os testes de "não autorizado" DEVEM gerar esse erro
```

### ❌ "Não consigo executar migração via CLI"
```
1. Tente via Dashboard (Opção B)
2. Verifique que supabase-cli está instalado: supabase --version
3. Verifique credenciais: supabase projects list
4. Pergunte ao Orion se precisar de help
```

### ❌ "Recebo erro 'table user_data does not exist'"
```
⚠️ PROBLEMA: A tabela não foi criada ainda
   Solução: Você precisa criar o schema ANTES de adicionar RLS
   Contate o Orion para coordenar schema setup
```

---

## ✅ DONE = QUANDO PARAR

Você TERMINOU quando:
- ✅ 8 policies visíveis no Supabase
- ✅ Testes SQL criados e passando
- ✅ Documentação completa
- ✅ PR criado e aprovado (2 reviews)
- ✅ Merged para main
- ✅ Staging validado

---

## 📞 ESCALAÇÃO RÁPIDA

- **"Não consigo acessar Supabase"** → Pergunte ao Orion/PM
- **"Qual é a password do DB?"** → Supabase tem senhas internas, use SQL Editor
- **"Preciso de accesso a production?"** → NÃO AINDA. Staging first.
- **"Tenho dúvidas na SQL?"** → Pergunte, ou revise: https://supabase.com/docs/guides/database/postgres/row-level-security

---

**Começar em:** Agora!
**Status esperado em:** Fim do Sprint 0 (até 5 de fevereiro)
**Próximo:** Após approval, move para STY-002/STY-003/STY-004

🚀 **LET'S GO!**
