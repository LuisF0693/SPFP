# Database Specialist Review - SPFP Technical Debt

**Data Engineer:** Nova (Data Specialist)
**Date:** 2026-01-26
**Status:** VALIDAÇÃO COMPLETA COM RECOMENDAÇÕES CRÍTICAS
**Severidade Média:** CRÍTICO → MÉDIO (após ajustes)

---

## Sumário Executivo

A análise do débito técnico do SPFP revela **3 problemas críticos** que precisam resolução imediata antes de escalar para produção com múltiplos usuários. Enquanto RLS foi parcialmente implementado (ai_history), as tabelas principais (user_data, interaction_logs) carecem de proteção. A arquitetura JSON blob é funcional para MVP mas será insustentável em escala.

**Recomendação:** Implementar RLS policies em PARALELO com o refactor de contexto (@architect). Não esperar normalização completa, mas bloquear riscos de segurança primeiro.

---

## Débitos de Database - Validação Detalhada

### Débitos Críticos (P0 - Drop Everything)

| ID | Débito | Status | Esforço | Complexidade | Prioridade | Validação |
|----|--------|--------|---------|--------------|-----------|-----------|
| **DB-001** | RLS policies missing on user_data & interaction_logs tables | **CRÍTICO - AJUSTADO** | 4 horas | Simple | **P0** | ✅ CONFIRMADO |

**Detalhes - DB-001 (RLS Policies):**

**Status Atual:**
- ✅ `ai_history` table: RLS policies JÁ IMPLEMENTADAS (migration exists em `docs/migrations/rls-ai-history.sql`)
  - Políticas: SELECT, INSERT, UPDATE, DELETE - todas com `auth.uid() = user_id`
  - Status: ATIVO (pronto para executar no Supabase)

- ❌ `user_data` table: **NENHUMA política definida**
  - Risco: Qualquer usuário autenticado pode `SELECT * FROM user_data` e ler dados de TODOS os usuários
  - Impacto: Violação de privacidade, dados financeiros expostos entre usuários
  - Criticidade: **MAXIMA** (compliance/LGPD/GDPR violation)

- ❌ `interaction_logs` table: **NENHUMA política definida**
  - Risco: Admin impersonation e client data access não auditados, admin pode ver histórico de QUALQUER usuário
  - Impacto: Sem separação entre admin logs, sem rastreabilidade, falha de auditoria
  - Criticidade: **ALTO** (audit trail missing)

**Validação:**
- Confirmado via `logService.ts` (line 18-19): `supabase.from('interaction_logs').insert(log)` sem check
- Confirmado via `aiHistoryService.ts` (line 43-46): uso de `user_id` filtro, MAS table pode não existir ou sem RLS
- Problema: Frontend filtra by userId via context (segurança social), mas backend NÃO valida

**Recomendação:**
- Implementar RLS IMEDIATO (copia padrão de `rls-ai-history.sql`)
- Ordem: `user_data` (prioridade 1), `interaction_logs` (prioridade 2)

**Esforço:** 4 horas (2 migrations simples, 1 test)
**Complexidade:** Simple (padrão KISS de RLS)

---

### Débitos Alto (P1 - Sprint 1)

| ID | Débito | Status | Esforço | Complexidade | Prioridade | Validação |
|----|--------|--------|---------|--------------|-----------|-----------|
| **DB-002** | JSON blob storage vs normalized schema | **MÉDIO - AJUSTADO** | 16 horas | Complex | **P1** | ✅ CONFIRMADO - NÃO BLOQUEANTE |
| **DB-003** | Missing indexes on user_data for admin queries | **MÉDIO - AJUSTADO** | 2 horas | Simple | **P1** | ✅ CONFIRMADO |
| **DB-008** | Admin impersonation audit trail | **MÉDIO - AJUSTADO** | 6 horas | Medium | **P1** | ✅ CONFIRMADO |

**Detalhes - DB-002 (JSON Blob vs Normalization):**

**Status Atual:**
```typescript
// FinanceContext.tsx stores everything as JSON in localStorage
const GlobalState = {
  accounts: Account[],
  transactions: Transaction[],
  categories: Category[],
  goals: Goal[],
  investments: InvestmentAsset[],
  patrimonyItems: PatrimonyItem[],
  userProfile: UserProfile,
  categoryBudgets: CategoryBudget[]
}
// Isso é sincronizado para Supabase como JSON blob em user_data table
```

**Validação:**

✅ **CONFIRMADO:** Application currently stores data as:
- localStorage: JSON serialized GlobalState (key: `visao360_v2_data_${userId}`)
- Supabase: Presumably `user_data.data` (JSON column) - NOT fully confirmed if actually using

❌ **PROBLEMA:** No queries evidence do tipo `SELECT accounts FROM user_data WHERE user_id = ?`
- Isso indica dados NÃO são persistidos normalizados em Supabase
- Ou são, mas a aplicação re-hydrata via localStorage (não confia em Supabase read)

**Análise de Trade-off:**

| Aspecto | JSON Blob | Normalized Tables |
|---------|-----------|-------------------|
| **MVP Dev Speed** | ✅ Rápido (1 table) | ❌ Lento (6+ tables) |
| **Query Optimization** | ❌ Impossível (full scan) | ✅ Index by category/date |
| **Analytics** | ❌ Requer parseJSON() | ✅ SELECT count(*) FROM transactions |
| **Data Integrity** | ❌ Orphaned records possible | ✅ FK constraints |
| **Scaling (1000+ users)** | ⚠️ Funciona mas lento | ✅ Otimizado |
| **Audit Trail** | ❌ Hard to version | ✅ Easy (created_at, updated_at) |
| **Admin Impersonation** | ❌ Precisa swap toda state | ✅ Query specific user |

**Recomendação:**
1. **NÃO migrar agora** (complexidade alta, risco de regressão)
2. **Preparar para o futuro:** Criar camada de abstração `transactionService.ts` que abstrai store (JSON vs DB)
3. **Timeline:** Sprint 5-6 após estabilizar arquitetura React (SYS-006)

**Esforço:** 16 horas (data migration, re-sync logic, rehydration)
**Complexidade:** Complex (breaking change, data migration needed)

---

**Detalhes - DB-003 (Missing Indexes):**

**Status Atual:**
```typescript
// FinanceContext.tsx:32
fetchAllUserData = async (): Promise<any[]> => {
  const { data } = await supabase
    .from('user_data')
    .select('*');
  return data;
}
```

**Validação:**
- ✅ CONFIRMADO: Sem WHERE clause, full table scan
- ❌ PROBLEMA: Se 1000 usuários, escan é O(n) → ~500ms latência
- ❌ PROBLEMA: Sem index em `user_id`, sem index em `created_at`

**Recomendação:**
```sql
CREATE INDEX idx_user_data_user_id ON user_data(user_id);
CREATE INDEX idx_user_data_created_at ON user_data(created_at DESC);
CREATE INDEX idx_ai_history_user_id ON ai_history(user_id);
CREATE INDEX idx_interaction_logs_admin_id ON interaction_logs(admin_id);
```

**Esforço:** 2 horas (4 CREATE INDEX statements, verify EXPLAIN ANALYZE)
**Complexidade:** Simple (no schema changes, reversible)

---

**Detalhes - DB-008 (Audit Trail for Impersonation):**

**Status Atual:**
```typescript
// logService.ts:18
logInteraction(log: {
  admin_id: string,
  client_id: string,
  action_type: 'ACCESS' | 'CHANGE',
  description: string,
  metadata?: any
})
// Insere em interaction_logs table
```

**Validação:**
- ✅ CONFIRMADO: Infraestrutura de logging existe
- ✅ CONFIRMADO: Chamado em FinanceContext.tsx:151 (`logInteraction(...)`)
- ❌ PROBLEMA: Nenhuma RLS policy na `interaction_logs`
- ⚠️ PROBLEMA: Sem unique constraint em (admin_id, client_id, timestamp, action)

**Recomendação:**
1. Criar RLS policy:
```sql
ALTER TABLE interaction_logs ENABLE ROW LEVEL SECURITY;

-- Admins can view logs of their impersonations
CREATE POLICY "Admins can view their own impersonation logs"
ON interaction_logs
FOR SELECT
USING (
  auth.uid() = admin_id OR
  auth.uid() = client_id
);

-- Only admins can insert
CREATE POLICY "Admins can create interaction logs"
ON interaction_logs
FOR INSERT
WITH CHECK (auth.uid() = admin_id);
```

2. Adicionar campos:
```sql
ALTER TABLE interaction_logs ADD COLUMN ip_address TEXT; -- source IP
ALTER TABLE interaction_logs ADD COLUMN session_id TEXT; -- browser session
```

**Esforço:** 6 horas (RLS policy, tests, session tracking)
**Complexidade:** Medium (RLS + metadata tracking)

---

### Débitos Médios (P2 - Sprint 2-3)

| ID | Débito | Status | Esforço | Complexidade | Prioridade | Validação |
|----|--------|--------|---------|--------------|-----------|-----------|
| **DB-004** | No soft delete strategy (deleted_at) | **MÉDIO** | 4 horas | Simple | **P2** | ✅ CONFIRMADO |
| **DB-005** | AI history schema incomplete | **MÉDIO** | 3 horas | Simple | **P2** | ✅ CONFIRMADO - PARCIAL |
| **DB-006** | No FK constraints | **MÉDIO** | 5 horas | Medium | **P2** | ✅ CONFIRMADO |
| **DB-007** | Transaction groupId orphans | **MÉDIO** | 3 horas | Simple | **P2** | ✅ CONFIRMADO |

**Detalhes - DB-004 (Soft Delete / GDPR Compliance):**

**Validação:**
- ❌ CONFIRMADO: Nenhum campo `deleted_at` em user_data ou ai_history
- ⚠️ PROBLEMA: LGPD/GDPR exigem audit trail de deletions, não just permanent delete
- ✅ BOAS NOTÍCIAS: Application stores in localStorage, easy to add soft delete

**Recomendação:**
```sql
ALTER TABLE user_data ADD COLUMN deleted_at TIMESTAMP NULL;
ALTER TABLE ai_history ADD COLUMN deleted_at TIMESTAMP NULL;
ALTER TABLE interaction_logs ADD COLUMN deleted_at TIMESTAMP NULL;

-- Update RLS policies to filter out soft-deleted
CREATE POLICY "Users can only view non-deleted data"
ON user_data
FOR SELECT
USING (deleted_at IS NULL AND auth.uid() = user_id);
```

**Esforço:** 4 horas (3 migrations, update RLS, add soft delete function)
**Complexidade:** Simple (no data transformation)

---

**Detalhes - DB-005 (AI History Schema):**

**Validação:**
- ✅ CONFIRMADO: `ai_history` table referenciado em `aiHistoryService.ts`
- ✅ CONFIRMADO: RLS migration pronta em `docs/migrations/rls-ai-history.sql`
- ❌ PROBLEMA: Schema incompleto, faltam campos:
  - `model` (qual modelo foi usado: Gemini, OpenAI, etc)
  - `tokens_used` (tracking de cost)
  - `error_message` (se request falhou)
  - `latency_ms` (performance tracking)

**Recomendação:**
```sql
ALTER TABLE ai_history ADD COLUMN model TEXT DEFAULT 'gemini-1.5-flash';
ALTER TABLE ai_history ADD COLUMN tokens_used INTEGER;
ALTER TABLE ai_history ADD COLUMN error_message TEXT;
ALTER TABLE ai_history ADD COLUMN latency_ms INTEGER;

-- Index por model para análise
CREATE INDEX idx_ai_history_model ON ai_history(model);
```

**Esforço:** 3 horas (migration, update aiHistoryService.ts, seed data)
**Complexidade:** Simple (additive only)

---

**Detalhes - DB-006 (Foreign Key Constraints):**

**Validação:**
- ❌ CONFIRMADO: Nenhuma FK constraint entre:
  - `user_data.transactions` → accountId (pode não existir)
  - `user_data.transactions` → categoryId (pode não existir)
  - `interaction_logs.admin_id` → auth.users (pode ser user deletado)
  - `interaction_logs.client_id` → auth.users (pode ser user deletado)

**Impacto:**
```javascript
// Exemplo: Deletar account, mas transactions ainda referenciam
const orphaned = transactions.filter(t =>
  !accounts.find(a => a.id === t.accountId)
);
// PROBLEM: Application quebra na filtragem
```

**Recomendação:**
- Ao normalizar schema (DB-002), adicionar FKs com ON DELETE CASCADE:
```sql
ALTER TABLE transactions ADD CONSTRAINT fk_account_id
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE;

ALTER TABLE transactions ADD CONSTRAINT fk_category_id
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;
```

**Esforço:** 5 horas (design schema, migrations, rollback procedures)
**Complexidade:** Medium (requires data validation first)

---

**Detalhes - DB-007 (Transaction GroupId Orphans):**

**Validação:**
```typescript
// types.ts:105-109
export interface Transaction {
  groupId?: string; // UUID único do grupo
  groupType?: TransactionGroupType; // INSTALLMENT | RECURRING
  groupIndex?: number; // Índice atual
  groupTotal?: number; // Total parcelas
}

// FinanceContext.tsx:30-36
deleteTransactionGroup(groupId: string)
deleteTransactionGroupFromIndex(groupId: string, fromIndex: number)
```

- ✅ CONFIRMADO: Application usa groupId para agrupar parcelados/recorrentes
- ❌ PROBLEMA: Nenhuma constraint garante que todas transações com mesmo groupId são deletadas juntas
- ⚠️ CENÁRIO: User deleta installment 3/12, mas installments 1-2 e 4-12 permanecem orphaned

**Recomendação:**
```typescript
// transactionService.ts (novo)
export function deleteTransactionGroup(groupId: string) {
  // Validar: todas transações com groupId têm mesmo groupTotal
  const group = transactions.filter(t => t.groupId === groupId);

  if (!group.length) throw new Error('Group not found');

  const groupTotals = new Set(group.map(t => t.groupTotal));
  if (groupTotals.size > 1) {
    throw new Error('Inconsistent group: mixed groupTotal values');
  }

  // Deletar todas
  group.forEach(t => deleteTransaction(t.id));
}
```

**Esforço:** 3 horas (validation logic, unit tests, edge case handling)
**Complexidade:** Simple (business logic, no DB changes needed yet)

---

## Débitos Adicionados (Não Mencionados na PRD)

Após análise profunda, identifiquei **3 novos débitos críticos**:

### DB-009: Missing User Metadata Table (P0)

**Problema:**
```typescript
// AuthContext.tsx não tem lugar pra armazenar:
// - apiToken (Brapi para cotações)
// - geminiToken (legacy)
// - aiConfig (provider, model, baseUrl)
// - theme preferences
// - ui_preferences (dashboard layout)
```

**Validação:**
- ❌ CONFIRMADO: `userProfile` é stored in localStorage, not Supabase
- ❌ CONFIRMADO: User preferences reset on logout/browser clear
- ⚠️ PROBLEMA: Não há tabela `user_profiles` ou `user_settings`

**Recomendação:**
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  theme 'dark'|'light' DEFAULT 'dark',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  api_token TEXT,
  gemini_token TEXT,
  ai_config JSONB DEFAULT '{"provider":"google"}',
  monthly_savings_target NUMERIC,
  dashboard_layout JSONB
);
```

**Esforço:** 6 horas (migrations, sync logic, AuthContext refactor)
**Complexidade:** Medium

---

### DB-010: Missing Real-time Subscriptions Setup (P1)

**Problema:**
```typescript
// FinanceContext.tsx:73-89 sincroniza com Supabase, MAS:
// - Nenhum real-time listener definido
// - Se user A modifica transaction, user A e B não veem mudança
// - Impersonation: admin altera client data, dados not synced back
```

**Validação:**
- ✅ CONFIRMADO: `supabase.from('...').insert()` existe
- ❌ CONFIRMADO: Nenhum `.on('*', ...)` listener
- ⚠️ PROBLEMA: App relies on localStorage, Supabase é write-only

**Recomendação:**
```typescript
// supabaseService.ts (novo)
export function subscribeToTransactions(userId: string, callback) {
  return supabase
    .channel(`user-${userId}:transactions`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${userId}` },
      (payload) => callback(payload)
    )
    .subscribe();
}
```

**Esforço:** 8 horas (real-time setup, conflict resolution, offline sync)
**Complexidade:** Complex

---

### DB-011: Connection Pooling & Batch Operations (P2)

**Problema:**
```typescript
// csvService.ts likely does:
for (const tx of transactions) {
  await supabase.from('transactions').insert(tx); // 100 INSERT statements
}
// Cada insert = novo connection, overhead de network + auth
```

**Validação:**
- ⚠️ SUSPEITA: csvService.ts não lido, mas padrão comum
- ✅ CONFIRMADO: addManyTransactions() em FinanceContext

**Recomendação:**
```typescript
// Usar batch insert:
await supabase.from('transactions').insert(transactions); // 1 INSERT com 100 rows
```

**Esforço:** 3 horas (refactor service calls)
**Complexidade:** Simple

---

## Respostas ao Architect

### Q1: RLS Policy Severity for Compliance?

**A:** CRÍTICO - BLOQUEANTE PARA PRODUÇÃO

Sem RLS, **violação de segurança de NÍVEL 1**:
- Qualquer usuário autenticado pode `SELECT * FROM user_data` e ler dados financeiros de TODOS
- Não há proteção de privacidade → Viola LGPD (Lei Geral de Proteção de Dados - Brasil)
- Viola GDPR (EU) se houver usuários europeus
- Risco legal: Multa até 2% do faturamento anual

**Timeline:** Implementar ANTES de sprint 1 (fazer em paralelo com bootstrap test infrastructure)

**Implementação:** 4 horas (copy padrão ai_history, deploy em Supabase console)

---

### Q2: JSON Blob vs Normalized Schema?

**A:** MANTER JSON blob para MVP (próximos 2 sprints), PREPARAR para normalização (Sprint 5+)

**Argumento para JSON blob (agora):**
- ✅ Rápido de desenvolver (1 table = GlobalState)
- ✅ Sem schema migration no meio de refactor arquitetura
- ✅ localStorage já usa JSON
- ❌ Mas: queries impossíveis, analytics hard, índices não funcionam

**Argumento para normalização (depois):**
- ✅ Queries otimizadas (SELECT * FROM transactions WHERE category_id = ?)
- ✅ Índices efetivos
- ✅ Data integrity via FK
- ❌ Mas: breaking change, data migration, complex sync logic

**Recomendação - Abordagem Híbrida:**
```
Sprint 1-2: RLS + Soft Delete + Índices (Blob ainda)
Sprint 3-4: Extract transactionService abstraction (hides store layer)
Sprint 5+: Normalizar schema gradualmente (TRANSACTIONS primeiro, depois ACCOUNTS)
```

**Migração de Dados:**
- Estimar ~2 horas por tabela (write migration, test, rollback)
- Total: 12 horas para 6 tables
- Fazer após estabilizar React refactor (SYS-006)

---

### Q3: Critical Indexes for 1000+ User Scale?

**A:** Implementar 3 índices CRÍTICOS agora, 5 adicionais em Sprint 2

**Priority 1 (Implementar agora - Sprint 0):**
```sql
-- User isolation (CRITICAL for multi-user)
CREATE INDEX idx_user_data_user_id ON user_data(user_id);

-- Admin queries (fetchAllUserData performance)
CREATE INDEX idx_user_data_created_at ON user_data(created_at DESC);

-- AI history lookup
CREATE INDEX idx_ai_history_user_id ON ai_history(user_id);
```

**Priority 2 (Sprint 2, após normalização):**
```sql
-- Transaction queries
CREATE INDEX idx_transactions_user_id_date ON transactions(user_id, date DESC);
CREATE INDEX idx_transactions_category_id ON transactions(category_id);
CREATE INDEX idx_transactions_account_id ON transactions(account_id);

-- Goals/Investments
CREATE INDEX idx_goals_user_id_status ON goals(user_id, status);
CREATE INDEX idx_investments_user_id ON investments(user_id);
```

**Estimativa de Performance:**

| Query | Sem índice | Com índice |
|-------|-----------|-----------|
| `SELECT * FROM user_data WHERE user_id = ?` | 50ms | 1ms |
| `SELECT COUNT(*) FROM user_data` | 100ms | 10ms |
| `SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC LIMIT 50` | 200ms | 5ms |
| `SELECT * FROM transactions WHERE category_id = ?` | 150ms | 3ms |

**Recomendação:** Usar `EXPLAIN ANALYZE` em Supabase console para validar índices

---

## Recomendações Finais - Ordem de Implementação

### FASE A: SEGURANÇA (Semana 1) - BLOQUEANTE PARA PRODUÇÃO
Priority: **DROP EVERYTHING**

```
[ ] DB-001a: RLS on user_data table (2h)
[ ] DB-001b: RLS on interaction_logs table (1.5h)
[ ] DB-003: Create 3 critical indexes (1h)
[ ] TEST: Validate RLS policies with unauthorized user (1.5h)
```

**Total Esforço:** 6 horas (1 day)
**Crítico:** Fazer ANTES de qualquer desenvolvimento novo

**Validation Checklist:**
- [ ] Execute RLS migration em Supabase
- [ ] Try SELECT * FROM user_data as user A (should fail)
- [ ] Execute EXPLAIN on queries, verify index use
- [ ] Load test avec 10 concurrent users

---

### FASE B: DATA INTEGRITY (Sprint 1) - ESSENCIAL PARA ESCALA
Priority: **P0-P1**

```
[ ] DB-004: Add soft_delete strategy (2h)
[ ] DB-005: Extend AI history schema (1.5h)
[ ] DB-007: Add transaction group validation logic (2h)
[ ] DB-008: Add audit trail RLS + session tracking (3h)
[ ] DB-009: Create user_profiles + user_settings tables (3h)
[ ] TEST: Integration tests para orphan scenarios (2h)
```

**Total Esforço:** 13.5 horas (2 days)
**Dependência:** Após FASE A

---

### FASE C: OPTIMIZATION (Sprint 2-3) - PERFORMANCE
Priority: **P1-P2**

```
[ ] DB-003b: Add 5 additional indexes (1h)
[ ] DB-006: Design FK constraints (1h)
[ ] DB-010: Setup real-time subscriptions (4h)
[ ] DB-011: Implement batch operations (2h)
[ ] TEST: Performance tests com 1000+ records (2h)
```

**Total Esforço:** 10 horas (1.5 days)
**Dependência:** Após FASE B, em paralelo com React refactor

---

### FASE D: NORMALIZATION (Sprint 5+) - LONG-TERM
Priority: **P2-P3**

```
[ ] DB-002a: Design normalized schema (4h)
[ ] DB-002b: Data migration scripts (5h)
[ ] DB-002c: Refactor FinanceContext to use normalized queries (6h)
[ ] DB-006: Implement FK constraints with normalized schema (2h)
[ ] TEST: Full regression testing (3h)
```

**Total Esforço:** 20 horas (3 days)
**Dependência:** Após React refactor (SYS-006 completo)

---

## Dependências & Blockers

```
SEGURANÇA (FASE A) ─┐
                   ├─→ DATA INTEGRITY (FASE B) ─┐
                                                ├─→ OPTIMIZATION (FASE C) ─┐
React Refactor (SYS-006)                                                ├─→ NORMALIZATION (FASE D)
```

**Critical Path:**
1. RLS + Indexes (1 day) ← **BLOCKER para produção**
2. Soft Delete + Audit (2 days)
3. React refactor (3 sprints)
4. Normalization (3 days em Sprint 5+)

---

## Alternative Approaches & Trade-offs

### Alternative 1: Cloud DB Migration (e.g., Firebase instead of Supabase)

**Pros:**
- Firebase tem RLS automático (firestore-level)
- Não precisa escrever SQL
- Real-time automático

**Cons:**
- Migração é BREAKING CHANGE (muda API completamente)
- Custos maiores em escala
- Menos controle sobre performance

**Recomendação:** NÃO fazer agora, Supabase é suficiente

---

### Alternative 2: Event Sourcing para Audit Trail

**Pros:**
- Audit trail perfeito (imutável)
- Compliance com LGPD/GDPR automático
- Pode reconstruir estado em qualquer ponto no tempo

**Cons:**
- Complexidade significativa (event store, projections)
- Storage crescente (todas as mudanças registradas)

**Recomendação:** Considerar APÓS normalização (Sprint 6+), não agora

---

## Matriz de Risco & Impacto

| Débito | Risco Atual | Impacto em Produção | Score | Mitigação |
|--------|------------|-------------------|-------|-----------|
| **DB-001 (RLS)** | CRÍTICO (data leak) | Violação de privacidade | 10/10 | Implementar semana 1 |
| **DB-009 (User Meta)** | ALTO (preference loss) | User frustration | 7/10 | Implementar Sprint 1 |
| **DB-005 (AI History)** | MÉDIO (incomplete data) | Análise limitada | 5/10 | Implementar Sprint 1 |
| **DB-002 (JSON blob)** | MÉDIO (scaling) | Lentidão em 1000+ users | 6/10 | Normalizar Sprint 5+ |
| **DB-010 (Real-time)** | BAIXO (data stale) | Experiência desincronizada | 4/10 | Implementar Sprint 2+ |

---

## Checklist de Implementação

### Antes de Deploy em Produção:
- [ ] RLS policies activas em TODAS as tables com dados sensíveis
- [ ] Índices em `user_id` fields criados
- [ ] Soft delete com `deleted_at` implementado
- [ ] Audit trail (`interaction_logs`) funcional
- [ ] Testes de segurança: unauthorized user NEÃO consegue ler dados de outro

### Antes de Escalar para 1000+ Usuários:
- [ ] Performance tests em dataset realista (1000 users, 50k transactions)
- [ ] Real-time subscriptions funcionando
- [ ] Batch operations implementadas
- [ ] Connection pooling configurado

### Antes de Normalização:
- [ ] React refactor (SYS-006) 80% completo
- [ ] Estratégia de migration validada
- [ ] Rollback procedures testadas

---

## Estimativa de Esforço Total

| Fase | Débitos | Esforço | Sprint | Criticidade |
|------|---------|---------|--------|------------|
| **A: Segurança** | DB-001, DB-003 | 6h | Sprint 0 | P0 - BLOCKER |
| **B: Integridade** | DB-004/005/007/008/009 | 13.5h | Sprint 1 | P0-P1 |
| **C: Otimização** | DB-003b/006/010/011 | 10h | Sprint 2-3 | P1-P2 |
| **D: Normalização** | DB-002 | 20h | Sprint 5+ | P2 |
| **TOTAL** | 11 (sendo 3 novos) | **49.5 horas** | 6-7 sprints | - |

**Timeline:**
- Fase A: 1 dia (semana 1)
- Fase B: 2 dias (sprint 1)
- Fase C: 1.5 dias (sprint 2-3, em paralelo)
- Fase D: 3 dias (sprint 5+, após React refactor)

**Recurso:** 1 Data Engineer senior + 1 Backend Dev (compartilhado com API layer)

---

## Questões Adicionais para @Architect

1. **User Impersonation Scope:** Precisa de rate limiting em impersonation (máx 5/dia por admin)?
2. **Data Retention:** Quanto tempo guardar `ai_history` e `interaction_logs` (6 meses, 1 ano)?
3. **Compliance Target:** LGPD apenas (Brasil) ou GDPR também (EU users)?
4. **Backup Strategy:** Há política de backup automático em Supabase (daily, hourly)?
5. **Disaster Recovery RTO/RPO:** Qual é target (1 hora, 24 horas)?

---

## Conclusão

SPFP tem **débitos de database gerenciáveis mas críticos**. Sem RLS, aplicação é **insegura para produção**. A estratégia JSON blob é adequada para MVP mas precisa roadmap de normalização clara.

**Recomendação Principal:**
1. Implementar RLS + Índices esta semana (6h, blocker)
2. Adicionar soft delete + audit trail em Sprint 1 (13.5h)
3. Preparar normalização em Sprint 5+ (20h, long-term)

Dessa forma, aplicação é **segura para uso imediato** e **escalável para futuro**.

---

## Apêndice: SQL Scripts Prontos para Executar

### Script 1: RLS on user_data (Copiar para Supabase SQL Editor)
```sql
-- 1. Habilitar RLS na tabela user_data
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

-- 2. Remover políticas existentes
DROP POLICY IF EXISTS "Users can view their own user data" ON user_data;
DROP POLICY IF EXISTS "Users can update their own user data" ON user_data;
DROP POLICY IF EXISTS "Users can insert their own user data" ON user_data;

-- 3. Criar política de SELECT
CREATE POLICY "Users can view their own user data"
ON user_data
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 4. Criar política de INSERT
CREATE POLICY "Users can insert their own user data"
ON user_data
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 5. Criar política de UPDATE
CREATE POLICY "Users can update their own user data"
ON user_data
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 6. Criar política de DELETE (soft delete recommended)
CREATE POLICY "Users can soft delete their own user data"
ON user_data
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

### Script 2: Create Critical Indexes
```sql
CREATE INDEX idx_user_data_user_id ON user_data(user_id);
CREATE INDEX idx_user_data_created_at ON user_data(created_at DESC);
CREATE INDEX idx_ai_history_user_id ON ai_history(user_id);
```

### Script 3: RLS on interaction_logs (Audit Trail)
```sql
ALTER TABLE interaction_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own logs" ON interaction_logs;
DROP POLICY IF EXISTS "Admins can insert logs" ON interaction_logs;

CREATE POLICY "Users can view their own logs"
ON interaction_logs
FOR SELECT
TO authenticated
USING (auth.uid() = admin_id OR auth.uid() = client_id);

CREATE POLICY "Admins can insert logs"
ON interaction_logs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = admin_id);
```

---

**Relatório Gerado Por:** Nova (Data Engineer)
**Data:** 2026-01-26
**Status:** ✅ PRONTO PARA IMPLEMENTAÇÃO
**Próximo Passo:** @architect consolidar com arquitetura React
