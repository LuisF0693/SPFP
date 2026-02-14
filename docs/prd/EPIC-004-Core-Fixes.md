# PRD: EPIC-004 - SPFP Core Fixes

**Product Manager:** Morgan (AIOS PM Agent)
**Versao:** 1.0
**Data:** 2026-02-14
**Prioridade:** CRITICA
**Sprint Estimado:** 1 (1 semana)

---

## 1. Objetivo

Corrigir bugs criticos e implementar melhorias basicas que impactam a experiencia do usuario atual, garantindo uma fundacao solida antes de adicionar novas funcionalidades.

### Problemas a Resolver

1. **Bug Critico:** Parceiros criados na aba de parceiros do CRM nao estao sendo persistidos no Supabase
2. **Feature Gap:** Usuarios nao conseguem editar categorias ja criadas, apenas criar novas

---

## 2. Escopo

### 2.1 Incluso (In Scope)

| ID | Item | Tipo |
|----|------|------|
| F004.1 | Correcao do bug de persistencia de parceiros | Bug Fix |
| F004.2 | Interface para editar categorias existentes | Feature |
| F004.3 | Feedback de erro ao usuario em operacoes de parceiros | Melhoria |
| F004.4 | Validacao de categorias duplicadas | Melhoria |

### 2.2 Excluso (Out of Scope)

- Redesign da UI de parceiros
- Novas funcionalidades de categorias (icones customizados, subcategorias)
- Migracao de dados existentes
- Historico de alteracoes de categorias

---

## 3. Requisitos Funcionais

### RF-001: Correcao Bug Parceiros

**Descricao:** Garantir que parceiros criados sejam persistidos corretamente no Supabase.

**Criterios de Aceitacao:**
- [ ] AC-001.1: Migration `20250210_partnerships.sql` executada no Supabase
- [ ] AC-001.2: Tabela `partners_v2` existe e aceita INSERT
- [ ] AC-001.3: Tabela `partnership_clients` existe e aceita INSERT
- [ ] AC-001.4: Trigger `update_updated_at_column()` existe
- [ ] AC-001.5: RLS policies permitem CRUD para usuario autenticado
- [ ] AC-001.6: Parceiro criado aparece apos refresh da pagina
- [ ] AC-001.7: Parceiro criado persiste apos logout/login

**Arquivos Afetados:**
- `src/hooks/usePartnerships.ts` (adicionar tratamento de erro)
- `supabase/migrations/20250210_partnerships.sql` (executar)

---

### RF-002: Feedback de Erro em Parceiros

**Descricao:** Exibir mensagens de erro claras ao usuario quando operacoes de parceiro falharem.

**Criterios de Aceitacao:**
- [ ] AC-002.1: Toast de erro exibido quando INSERT falha
- [ ] AC-002.2: Toast de erro exibido quando UPDATE falha
- [ ] AC-002.3: Toast de erro exibido quando DELETE falha
- [ ] AC-002.4: Mensagem de erro em portugues e amigavel
- [ ] AC-002.5: Log de erro no console para debug

**Comportamento Esperado:**
```
Sucesso: "Parceiro criado com sucesso!"
Erro: "Erro ao salvar parceiro. Verifique sua conexao e tente novamente."
```

---

### RF-003: Editar Categorias Existentes

**Descricao:** Permitir que usuarios editem nome, cor, icone e grupo de categorias ja criadas.

**Criterios de Aceitacao:**
- [ ] AC-003.1: Botao de editar (icone lapis) visivel em cada categoria na lista
- [ ] AC-003.2: Clicar no botao abre modal de edicao
- [ ] AC-003.3: Modal pre-populado com dados atuais da categoria
- [ ] AC-003.4: Campos editaveis: nome, cor, icone, grupo
- [ ] AC-003.5: Botao "Salvar" atualiza categoria via `updateCategory()`
- [ ] AC-003.6: Botao "Cancelar" fecha modal sem salvar
- [ ] AC-003.7: Alteracoes refletidas imediatamente na lista
- [ ] AC-003.8: Alteracoes persistem apos refresh

**UI Mockup:**
```
+------------------------------------------+
|  Editar Categoria                    [X] |
+------------------------------------------+
|  Nome: [___________________________]     |
|                                          |
|  Grupo: ( ) Fixa  ( ) Variavel           |
|         ( ) Investimento  ( ) Receita    |
|                                          |
|  Cor:   [●][●][●][●][●][●][●][●][●][●]   |
|                                          |
|  Icone: [Grid de emojis]                 |
|                                          |
|  Preview: [🏠 Moradia]                   |
|                                          |
|         [Cancelar]  [Salvar Alteracoes]  |
+------------------------------------------+
```

---

### RF-004: Validacao de Categoria Duplicada

**Descricao:** Impedir criacao/edicao de categoria com nome duplicado.

**Criterios de Aceitacao:**
- [ ] AC-004.1: Validar nome ao salvar (criar ou editar)
- [ ] AC-004.2: Comparacao case-insensitive (ignorar maiusculas)
- [ ] AC-004.3: Exibir erro inline: "Ja existe uma categoria com esse nome"
- [ ] AC-004.4: Botao Salvar desabilitado enquanto nome duplicado
- [ ] AC-004.5: Permitir manter o mesmo nome ao editar (nao e duplicata de si mesma)

---

## 4. Requisitos Nao-Funcionais

### RNF-001: Performance
- Operacoes de CRUD em categorias devem completar em < 500ms
- Feedback visual imediato (loading state)

### RNF-002: Compatibilidade
- Funcionar em todos os navegadores modernos (Chrome, Firefox, Safari, Edge)
- Responsivo para mobile

### RNF-003: Acessibilidade
- Modal de edicao acessivel via teclado (Tab, Enter, Escape)
- Cores com contraste adequado (WCAG AA)

### RNF-004: Tratamento de Erro
- Erros de rede tratados graciosamente
- Retry automatico com backoff para falhas transientes
- Estado local preservado em caso de falha de sync

---

## 5. Especificacoes Tecnicas

### 5.1 Correcao Bug Parceiros

**Diagnostico:**
```
Codigo: OK (usePartnerships.ts funciona corretamente)
Problema: Migration nao executada no Supabase
```

**Solucao:**
1. Verificar se function `update_updated_at_column()` existe
2. Executar migration `20250210_partnerships.sql`
3. Verificar RLS policies
4. Adicionar toast feedback no hook

**Codigo para verificar (Supabase SQL Editor):**
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

### 5.2 Modal Editar Categoria

**Componente:** Reutilizar `CreateCategoryModal.tsx` com prop `mode`

```typescript
interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  category?: Category; // Obrigatorio se mode='edit'
  onSave: (category: Category) => void;
}
```

**Alteracoes necessarias:**
1. Renomear para `CategoryModal.tsx`
2. Adicionar prop `mode` e `category`
3. Pre-popular campos quando `mode='edit'`
4. Alterar titulo: "Nova Categoria" vs "Editar Categoria"
5. Alterar botao: "Criar" vs "Salvar Alteracoes"

---

## 6. Dependencias

### 6.1 Dependencias Tecnicas

| Dependencia | Tipo | Status |
|-------------|------|--------|
| Supabase Database | Infraestrutura | Configurado |
| Migration SQL | Codigo | Existe, nao executada |
| FinanceContext.updateCategory() | Codigo | Implementado |
| Toast/Notification System | UI | A verificar |

### 6.2 Dependencias de Equipe

| Tarefa | Responsavel |
|--------|-------------|
| Executar migration | DevOps ou Dev |
| Implementar UI edicao | Dev Frontend |
| Testes | QA |

---

## 7. Riscos

| Risco | Probabilidade | Impacto | Mitigacao |
|-------|---------------|---------|-----------|
| Migration falha por falta de function | Media | Alto | Criar function primeiro |
| Dados existentes em localStorage inconsistentes | Baixa | Medio | Sync forcado apos fix |
| Modal conflita com outros modais | Baixa | Baixo | Testar fluxos |

---

## 8. Metricas de Sucesso

| Metrica | Baseline | Target |
|---------|----------|--------|
| Parceiros salvos com sucesso | 0% | 100% |
| Erros de parceiro reportados | N/A | 0 |
| Categorias editadas/semana | 0 | 5+ |

---

## 9. User Stories

### US-001: Salvar Parceiro
**Como** planejador financeiro
**Quero** criar um parceiro e ter certeza que foi salvo
**Para que** eu possa gerenciar minhas parcerias de forma confiavel

**Acceptance Criteria:** AC-001.1 a AC-001.7

---

### US-002: Feedback de Erro
**Como** usuario
**Quero** ver uma mensagem clara quando algo der errado
**Para que** eu saiba se preciso tentar novamente ou buscar ajuda

**Acceptance Criteria:** AC-002.1 a AC-002.5

---

### US-003: Editar Categoria
**Como** usuario
**Quero** editar uma categoria que ja criei
**Para que** eu possa corrigir erros ou mudar a organizacao

**Acceptance Criteria:** AC-003.1 a AC-003.8

---

### US-004: Evitar Duplicatas
**Como** usuario
**Quero** ser avisado se tentar criar categoria duplicada
**Para que** eu mantenha minha lista organizada

**Acceptance Criteria:** AC-004.1 a AC-004.5

---

## 10. Checklist de Entrega

- [ ] Migration executada no Supabase
- [ ] Tabelas partners_v2 e partnership_clients funcionais
- [ ] Toast de feedback implementado
- [ ] Modal de edicao de categoria funcionando
- [ ] Validacao de duplicatas implementada
- [ ] Testes manuais realizados
- [ ] Code review aprovado
- [ ] Deploy em producao

---

*PRD criado por Morgan (AIOS PM) - 2026-02-14*
