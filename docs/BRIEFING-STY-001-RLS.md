# 🔐 BRIEFING EXECUTIVO - STY-001: Implement RLS Policies

**DESTINADO PARA:** Backend Senior / DBA
**PRIORIDADE:** 🔴 P0 CRÍTICA - Bloqueia Sprint 0
**ESFORÇO:** 4 horas
**DATA:** 2026-01-30
**STATUS:** PRONTO PARA IMPLEMENTAÇÃO

---

## 📌 CONTEXTO

Seu projeto SPFP (Sistema de Planejamento Financeiro Pessoal) atualmente **viola compliance de dados** (GDPR/LGPD). A tabela `user_data` não tem Row-Level Security (RLS), permitindo que **qualquer usuário autenticado leia dados de TODOS os outros usuários**.

**Risco:** 🚨 Dados financeiros sensíveis expostos | Não-conformidade regulatória | Possível parada produção

---

## ✅ O QUE FAZER (4 horas)

### **1. Validar Migração SQL (0.5h)**
A migração SQL já foi criada em:
```
supabase/migrations/001-add-rls-policies.sql
```

**Você precisa:**
- [ ] Revisar as policies SQL (verificar se estão corretas)
- [ ] Confirmar que cobrem SELECT, INSERT, UPDATE, DELETE
- [ ] Verificar isolamento: `auth.uid() = user_id`

**SQL Esperado:**
```sql
-- Exemplo de uma policy correta:
CREATE POLICY "Users can view their own user_data"
ON user_data
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
```

---

### **2. Aplicar Migração no Supabase Staging (1.5h)**

**Passo 1: Acessar Supabase**
- URL: https://supabase.com
- Projeto: Buscar por "SPFP" ou `jqmlloimcgsfjhhbenzk`
- Ambiente: **STAGING** (não production ainda)

**Passo 2: Executar Migração (Opção A - Recomendado)**
```bash
# Via Supabase CLI (se instalado)
supabase db push --local
```

**Opção B - Via Dashboard Supabase:**
1. Ir para **SQL Editor**
2. Criar nova query
3. Copiar conteúdo de `supabase/migrations/001-add-rls-policies.sql`
4. Executar

**Passo 3: Verificar Aplicação**
```sql
-- Executar isso para confirmar que as policies foram criadas:
SELECT tablename, policyname
FROM pg_policies
WHERE tablename IN ('user_data', 'interaction_logs')
ORDER BY tablename, policyname;
```

**Resultado esperado:** 8 policies (4 por tabela: SELECT, INSERT, UPDATE, DELETE)

---

### **3. Criar Testes SQL de Isolamento (1h)**

**Arquivo a criar:** `supabase/tests/rls-user-isolation.test.sql`

**Conteúdo (copiar e adaptar):**
```sql
-- ============================================
-- RLS Isolation Test - user_data Table
-- Purpose: Verify that users cannot access other users' data
-- ============================================

-- Setup: Create test users
-- (Normalmente feito via Auth context, aqui simulamos)

-- Test 1: User A cannot SELECT User B data
-- ❌ Should FAIL with "permission denied for table user_data"
-- SELECT * FROM user_data
-- WHERE user_id != auth.uid();

-- Test 2: User A cannot INSERT with User B's ID
-- ❌ Should FAIL with "new row violates row-level security policy"
-- INSERT INTO user_data (user_id, data_column)
-- VALUES (uuid_b, some_data)
-- WHERE auth.uid() != uuid_b;

-- Test 3: User A CAN SELECT their own data
-- ✅ Should SUCCEED
-- SELECT * FROM user_data
-- WHERE user_id = auth.uid();

-- Test 4: User A CAN UPDATE their own data
-- ✅ Should SUCCEED
-- UPDATE user_data
-- SET some_field = 'value'
-- WHERE user_id = auth.uid();

-- Test 5: User A cannot DELETE User B data
-- ❌ Should FAIL
-- DELETE FROM user_data
-- WHERE user_id != auth.uid();

-- Verification Query
SELECT COUNT(*) as total_policies
FROM pg_policies
WHERE tablename IN ('user_data', 'interaction_logs');
-- Expected: 8 policies
```

---

### **4. Documentação de Deployment (0.5h)**

**Arquivo a criar/atualizar:** `docs/DEPLOYMENT.md`

**Seção a adicionar:**
```markdown
## RLS Policies (Row-Level Security)

### Overview
All user data tables have Row-Level Security (RLS) enabled to ensure GDPR/LGPD compliance.

### Tables Protected
- `user_data` - Financial records (transactions, accounts, goals, investments, patrimony)
- `interaction_logs` - User action logs

### Policy Rules
| Operation | Rule |
|-----------|------|
| SELECT | Users can only view their own records (`auth.uid() = user_id`) |
| INSERT | Users can only insert records with their own user_id |
| UPDATE | Users can only update their own records |
| DELETE | Users can only delete their own records |

### Verification
To verify RLS is working:

```sql
-- Check all RLS policies are active
SELECT tablename, policyname, permissive, roles, qual
FROM pg_policies
WHERE tablename IN ('user_data', 'interaction_logs')
ORDER BY tablename;

-- Attempt unauthorized SELECT (should fail)
SELECT * FROM user_data WHERE user_id != auth.uid();
-- Result: ERROR: permission denied for table user_data
```

### Deployment Steps
1. Apply migration: `supabase/migrations/001-add-rls-policies.sql`
2. Run verification query above
3. Confirm 8 policies are active
4. Test with multi-user scenario in staging
5. Deploy to production only after sign-off

### Rollback
If issues arise:
```sql
ALTER TABLE user_data DISABLE ROW LEVEL SECURITY;
ALTER TABLE interaction_logs DISABLE ROW LEVEL SECURITY;
```
(Then delete policies and re-apply)
```

---

## 🎯 CHECKLIST DE TAREFAS

- [ ] **Revisar** migração SQL em `supabase/migrations/001-add-rls-policies.sql`
- [ ] **Conectar** ao Supabase staging
- [ ] **Executar** migração via CLI ou SQL Editor
- [ ] **Verificar** que 8 policies foram criadas (ver query acima)
- [ ] **Criar** testes SQL em `supabase/tests/rls-user-isolation.test.sql`
- [ ] **Validar** testes localmente (ou em staging)
- [ ] **Documentar** em `docs/DEPLOYMENT.md`
- [ ] **Fazer commit** e criar PR
- [ ] **Code review** - pedir 2 approvals mínimo
- [ ] **Merge** para main
- [ ] **Validação final** em staging
- [ ] **Sign-off** security review

---

## 📊 EFFORT BREAKDOWN

| Tarefa | Tempo | Status |
|--------|-------|--------|
| Revisar SQL | 0.5h | 👤 Você |
| Aplicar no Supabase | 1.5h | 👤 Você |
| Testes SQL | 1h | 👤 Você + QA (se houver) |
| Documentação | 0.5h | 👤 Você |
| **TOTAL** | **4h** | |

---

## 🔗 RECURSOS & CONTEXTO

**Sprint 0 Plan:**
- Este é o **primeiro de 5 stories** do Sprint 0
- Bloqueia: Nada (foundation)
- Bloqueado por: Nada
- **Deadline:** Fim da semana (para liberar Sprint 1)

**Outros Stories Paralelos (Sprint 0):**
- STY-002: TypeScript Strict Mode (DevOps)
- STY-003: Error Boundaries (Frontend)
- STY-004: CI/CD Pipeline (DevOps)
- STY-005: Test Infrastructure (QA)

---

## 🚀 COMO COMEÇAR

**AGORA:**
1. Leia `supabase/migrations/001-add-rls-policies.sql`
2. Verifique se tem acesso ao Supabase staging
3. Comece com "Validar Migração SQL" (0.5h)

**DEPOIS:**
4. Aplique a migração (1.5h)
5. Crie testes (1h)
6. Documente (0.5h)
7. Faça PR

---

## ❓ PERGUNTAS FREQUENTES

**P: Qual é a URL do Supabase?**
R: `https://jqmlloimcgsfjhhbenzk.supabase.co` (ver `src/supabase.ts`)

**P: Preciso de permission especial?**
R: Você precisa ter acesso como "Owner" ou "Developer" ao projeto Supabase

**P: O que fazer se a migração falhar?**
R: Verifique a mensagem de erro. Provavelmente a tabela `user_data` não existe ainda. Se for o caso, crie a tabela primeiro.

**P: Posso testar localmente antes?**
R: Sim, use `supabase start` localmente se tiver Supabase CLI instalado

---

## 📞 ESCALAÇÃO

Se tiver dúvidas:
- **Arquitetura:** Pergunte ao Orion (Orchestrator)
- **Database Design:** Revisar `docs/prd/technical-debt-assessment.md`
- **Supabase Help:** Documentação oficial: https://supabase.com/docs

---

**Criado por:** Orion (AIOS Master)
**Data:** 2026-01-30
**Status:** 🟢 READY FOR EXECUTION
**Next Review:** Quando PR for criado
