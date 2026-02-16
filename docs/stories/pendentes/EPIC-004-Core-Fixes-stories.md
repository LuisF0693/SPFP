# User Stories - EPIC-004: Core Fixes

**Epic:** Core Fixes - Correcoes Fundamentais
**PRD:** [EPIC-004-Core-Fixes](../prd/EPIC-004-Core-Fixes.md)
**Status:** READY FOR SPRINT PLANNING
**Created:** 2026-02-16
**Scrum Master:** Max (@sm)

---

## Resumo do Epic

Corrigir bugs criticos e implementar melhorias basicas que impactam a experiencia do usuario atual, garantindo uma fundacao solida antes de adicionar novas funcionalidades.

**Sprint Estimado:** 1 (1 semana)
**Total de Story Points:** 21
**Total de Stories:** 6
**Prioridade:** CRITICA - Bloqueia EPIC-001, EPIC-002, EPIC-003

---

## Stories

---

### US-401: Corrigir Bug de Persistencia de Parceiros

**Story ID:** US-401
**Sprint:** 1
**Story Points:** 5
**Prioridade:** Must Have (P0 CRITICA)
**Tipo:** Bug Fix

#### User Story

**Como** planejador financeiro
**Quero** criar um parceiro e ter certeza que foi salvo
**Para que** eu possa gerenciar minhas parcerias de forma confiavel

#### Problema

Parceiros criados na aba de parceiros do CRM nao estao sendo persistidos no Supabase. Ao dar refresh ou relogar, os parceiros desaparecem.

**Diagnostico:**
- Codigo (usePartnerships.ts) funciona corretamente
- Problema: Migration `20250210_partnerships.sql` NAO foi executada no Supabase
- Tabelas `partners_v2` e `partnership_clients` nao existem

#### Criterios de Aceitacao

- [ ] AC-401.1: Verificar se function `update_updated_at_column()` existe no Supabase
- [ ] AC-401.2: Criar function se nao existir
- [ ] AC-401.3: Migration `20250210_partnerships.sql` executada com sucesso
- [ ] AC-401.4: Tabela `partners_v2` existe e aceita INSERT
- [ ] AC-401.5: Tabela `partnership_clients` existe e aceita INSERT
- [ ] AC-401.6: RLS policies permitem CRUD para usuario autenticado
- [ ] AC-401.7: Parceiro criado aparece apos refresh da pagina
- [ ] AC-401.8: Parceiro criado persiste apos logout/login

#### Dependencias

- **Depende de:** Acesso ao Supabase Dashboard
- **Bloqueia:** EPIC-001 (CRM v2)

#### Arquivos Afetados

- `supabase/migrations/20250210_partnerships.sql` (executar)
- `src/hooks/usePartnerships.ts` (adicionar tratamento de erro)

#### Script de Verificacao

```sql
-- Verificar se tabela existe
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_name = 'partners_v2'
);

-- Verificar se function existe
SELECT EXISTS (
  SELECT FROM pg_proc
  WHERE proname = 'update_updated_at_column'
);
```

#### Notas Tecnicas

Se a function `update_updated_at_column()` nao existir, criar antes de executar a migration:

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

### US-402: Feedback de Erro em Operacoes de Parceiros

**Story ID:** US-402
**Sprint:** 1
**Story Points:** 3
**Prioridade:** Must Have
**Tipo:** UX Improvement

#### User Story

**Como** usuario
**Quero** ver uma mensagem clara quando algo der errado
**Para que** eu saiba se preciso tentar novamente ou buscar ajuda

#### Criterios de Aceitacao

- [ ] AC-402.1: Toast de sucesso exibido quando parceiro criado
- [ ] AC-402.2: Toast de erro exibido quando INSERT falha
- [ ] AC-402.3: Toast de erro exibido quando UPDATE falha
- [ ] AC-402.4: Toast de erro exibido quando DELETE falha
- [ ] AC-402.5: Mensagem de erro em portugues e amigavel
- [ ] AC-402.6: Log de erro no console para debug

#### Dependencias

- **Depende de:** US-401

#### Mensagens Padrao

```javascript
const MESSAGES = {
  createSuccess: "Parceiro criado com sucesso!",
  createError: "Erro ao criar parceiro. Verifique sua conexao e tente novamente.",
  updateSuccess: "Parceiro atualizado com sucesso!",
  updateError: "Erro ao atualizar parceiro. Tente novamente.",
  deleteSuccess: "Parceiro removido com sucesso!",
  deleteError: "Erro ao remover parceiro. Tente novamente."
};
```

#### Arquivos a Modificar

- `src/hooks/usePartnerships.ts`
- `src/components/crm/PartnersList.tsx` (ou equivalente)

---

### US-403: Editar Categorias Existentes

**Story ID:** US-403
**Sprint:** 1
**Story Points:** 8
**Prioridade:** Must Have
**Tipo:** Feature

#### User Story

**Como** usuario
**Quero** editar uma categoria que ja criei
**Para que** eu possa corrigir erros ou mudar a organizacao

#### Problema

Atualmente usuarios conseguem criar categorias, mas nao conseguem editar as existentes. Precisam deletar e criar novamente, perdendo historico.

#### Criterios de Aceitacao

- [ ] AC-403.1: Botao de editar (icone lapis) visivel em cada categoria na lista
- [ ] AC-403.2: Clicar no botao abre modal de edicao
- [ ] AC-403.3: Modal pre-populado com dados atuais da categoria
- [ ] AC-403.4: Campos editaveis: nome, cor, icone (emoji), grupo
- [ ] AC-403.5: Botao "Salvar" atualiza categoria via `updateCategory()`
- [ ] AC-403.6: Botao "Cancelar" fecha modal sem salvar
- [ ] AC-403.7: Alteracoes refletidas imediatamente na lista
- [ ] AC-403.8: Alteracoes persistem apos refresh

#### Dependencias

- Nenhuma

#### Arquivos a Modificar

- `src/components/CategoryModal.tsx` (renomear de CreateCategoryModal)
- `src/components/Settings.tsx` (ou onde lista categorias)

#### Especificacao Tecnica

Reutilizar `CreateCategoryModal.tsx` com prop `mode`:

```typescript
interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  category?: Category; // Obrigatorio se mode='edit'
  onSave: (category: Category) => void;
}
```

**Alteracoes:**
1. Renomear para `CategoryModal.tsx`
2. Adicionar prop `mode` e `category`
3. Pre-popular campos quando `mode='edit'`
4. Alterar titulo: "Nova Categoria" vs "Editar Categoria"
5. Alterar botao: "Criar" vs "Salvar Alteracoes"

#### Wireframe

```
+------------------------------------------+
|  Editar Categoria                    [X] |
+------------------------------------------+
|  Nome: [___________________________]     |
|                                          |
|  Grupo: ( ) Fixa  ( ) Variavel           |
|         ( ) Investimento  ( ) Receita    |
|                                          |
|  Cor:   [o][o][o][o][o][o][o][o][o][o]   |
|                                          |
|  Icone: [Grid de emojis]                 |
|                                          |
|  Preview: [icone] [nome]                 |
|                                          |
|         [Cancelar]  [Salvar Alteracoes]  |
+------------------------------------------+
```

---

### US-404: Validacao de Categoria Duplicada

**Story ID:** US-404
**Sprint:** 1
**Story Points:** 2
**Prioridade:** Should Have
**Tipo:** Validation

#### User Story

**Como** usuario
**Quero** ser avisado se tentar criar categoria duplicada
**Para que** eu mantenha minha lista organizada

#### Criterios de Aceitacao

- [x] AC-404.1: Validar nome ao salvar (criar ou editar)
- [x] AC-404.2: Comparacao case-insensitive ("Moradia" = "moradia")
- [x] AC-404.3: Exibir erro inline: "Ja existe uma categoria com esse nome"
- [x] AC-404.4: Botao Salvar desabilitado enquanto nome duplicado
- [x] AC-404.5: Permitir manter o mesmo nome ao editar (nao e duplicata de si mesma)

#### Dependencias

- **Depende de:** US-403

#### Arquivos a Modificar

- `src/components/CategoryModal.tsx`

#### Implementacao

**Status:** COMPLETO ✅

Validação implementada em tempo real com feedback visual:

```typescript
const isNameAvailable = (checkName: string): boolean => {
  const trimmedName = checkName.trim().toLowerCase();
  if (!trimmedName) return true; // Empty é inválido, não duplicata

  return !allCategories.some(cat => {
    const isSameName = cat.name.toLowerCase() === trimmedName;
    const isEditingOwn = mode === 'edit' && category?.id === cat.id;
    return isSameName && !isEditingOwn; // Duplicata se: nome igual E não editando a própria
  });
};
```

**Arquivos Implementados:**
- ✅ `src/components/transaction/CategoryModal.tsx` (edit mode)
- ✅ `src/components/transaction/CreateCategoryModal.tsx` (create mode)
- ✅ `src/components/transaction/TransactionBasicForm.tsx` (integração)
- ✅ `src/components/TransactionList.tsx` (integração)
- ✅ `src/test/categoryDuplicateValidation.test.ts` (testes: 40+ casos)

**Features:**
- Real-time validation on input change
- Red border + error message on duplicate
- Disable save button when duplicate detected
- Allow own category name in edit mode
- Case-insensitive comparison
- Complete test coverage

**Commit:** cc26b3f - feat(categories): add duplicate name validation for create and edit modes (F004.4)

---

### US-405: Loading States em Operacoes de Parceiros

**Story ID:** US-405
**Sprint:** 1
**Story Points:** 2
**Prioridade:** Should Have
**Tipo:** UX Improvement

#### User Story

**Como** usuario
**Quero** ver feedback visual durante operacoes
**Para que** eu saiba que o sistema esta processando

#### Criterios de Aceitacao

- [ ] AC-405.1: Botao "Salvar" mostra spinner enquanto salva
- [ ] AC-405.2: Botao desabilitado durante operacao
- [ ] AC-405.3: Lista mostra skeleton enquanto carrega
- [ ] AC-405.4: Operacao completa em < 500ms (percepcao de rapidez)

#### Dependencias

- **Depende de:** US-401

#### Arquivos a Modificar

- `src/hooks/usePartnerships.ts` (adicionar isLoading state)
- `src/components/crm/PartnersList.tsx`

---

### US-406: Retry Automatico em Falhas de Sync

**Story ID:** US-406
**Sprint:** 1
**Story Points:** 1
**Prioridade:** Could Have
**Tipo:** Reliability

#### User Story

**Como** usuario
**Quero** que o sistema tente novamente automaticamente
**Para que** falhas de rede nao me atrapalhem

#### Criterios de Aceitacao

- [ ] AC-406.1: Retry automatico em falhas de rede (max 2 tentativas)
- [ ] AC-406.2: Backoff exponencial (1s, 2s, 4s)
- [ ] AC-406.3: Estado local preservado em caso de falha
- [ ] AC-406.4: Usar errorRecovery.ts existente

#### Dependencias

- **Depende de:** US-401
- **Reutiliza:** `src/services/errorRecovery.ts`

#### Arquivos a Modificar

- `src/hooks/usePartnerships.ts`

---

## Matriz de Prioridades

| ID | Story | Points | Prioridade | Sprint |
|----|-------|--------|------------|--------|
| US-401 | Bug Persistencia Parceiros | 5 | Must (P0) | 1 |
| US-402 | Feedback de Erro | 3 | Must | 1 |
| US-403 | Editar Categorias | 8 | Must | 1 |
| US-404 | Validacao Duplicata | 2 | Should | 1 |
| US-405 | Loading States | 2 | Should | 1 |
| US-406 | Retry Automatico | 1 | Could | 1 |
| **TOTAL** | | **21** | | |

---

## Grafo de Dependencias

```
US-401 (Bug Parceiros) ----+
    |                      |
    v                      v
US-402 (Feedback) ---> US-405 (Loading) ---> US-406 (Retry)

US-403 (Editar Categorias)
    |
    v
US-404 (Validacao Duplicata)
```

---

## Ordem de Execucao Recomendada

1. **US-401** - Bug Critico (PRIMEIRO - bloqueia tudo)
2. **US-403** - Feature principal da sprint
3. **US-402** - Melhoria de UX importante
4. **US-404** - Complemento de US-403
5. **US-405** - Polish de UX
6. **US-406** - Nice-to-have

---

## Checklist de Entrega

- [ ] Migration executada no Supabase
- [ ] Tabelas partners_v2 e partnership_clients funcionais
- [ ] RLS policies ativas e testadas
- [ ] Toast de feedback implementado
- [ ] Modal de edicao de categoria funcionando
- [ ] Validacao de duplicatas implementada
- [ ] Testes manuais realizados
- [ ] Code review aprovado
- [ ] Deploy em producao

---

## Riscos e Mitigacoes

| Risco | Prob. | Impacto | Mitigacao |
|-------|-------|---------|-----------|
| Migration falha por falta de function | Media | Alto | Criar function primeiro |
| Dados existentes em localStorage inconsistentes | Baixa | Medio | Sync forcado apos fix |
| Modal conflita com outros modais | Baixa | Baixo | Testar fluxos |

---

## Metricas de Sucesso

| Metrica | Baseline | Target | Prazo |
|---------|----------|--------|-------|
| Parceiros salvos com sucesso | 0% | 100% | 1 dia |
| Erros de parceiro reportados | N/A | 0 | 1 semana |
| Categorias editadas/semana | 0 | 5+ | 1 semana |

---

## Impacto nos Outros Epics

| Epic | Status | Impacto |
|------|--------|---------|
| EPIC-001 CRM v2 | BLOQUEADO | Depende de US-401 |
| EPIC-002 Corporate HQ | PARCIAL | Pode iniciar em paralelo |
| EPIC-003 AI Automation | LIVRE | Nao depende |

**IMPORTANTE:** EPIC-004 deve ser concluido PRIMEIRO antes de iniciar trabalho significativo em EPIC-001.

---

**Criado por:** Max (@sm) - Scrum Master AIOS
**Data:** 2026-02-16
**Revisado por:** Morgan (@pm) - Product Manager
