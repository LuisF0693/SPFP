# STY-059: Remover Aba de Projeções

**Epic:** UX Restructure - Sidebar e Navegação
**PRD:** PRD-UX-RESTRUCTURE-SIDEBAR
**Priority:** P2 MÉDIA
**Effort:** 1h
**Status:** READY

---

## Descrição

Remover a aba de Projeções do sidebar e do roteamento, mantendo o componente `FutureCashFlow.tsx` para possível uso futuro.

## User Story

**Como** usuário do SPFP,
**Quero** uma navegação mais enxuta,
**Para que** eu foque nas funcionalidades principais.

---

## Acceptance Criteria

- [ ] **AC-1:** Item "Projeções" removido do sidebar
- [ ] **AC-2:** Rota `/projections` removida do App.tsx
- [ ] **AC-3:** Componente `FutureCashFlow.tsx` mantido (não deletar)
- [ ] **AC-4:** Nenhum link quebrado para /projections
- [ ] **AC-5:** Navegação funciona sem erros

---

## Technical Implementation

### Arquivos a Modificar:

**1. `src/App.tsx`** - Remover rota:
```tsx
// REMOVER esta rota:
<Route path="/projections" element={
  <PrivateRoute>
    <Layout mode="personal">
      <FutureCashFlow />
    </Layout>
  </PrivateRoute>
} />
```

**2. `src/components/Layout.tsx`** - Remover do sidebar:
```tsx
// REMOVER este item do array de navegação:
{ name: 'Projeções', path: '/projections', icon: TrendingUp }
```

### Arquivos a NÃO Modificar:

- `src/components/FutureCashFlow.tsx` ← **MANTER** (pode ser usado no Dashboard ou Relatórios futuramente)

---

## Tasks

- [ ] 1. Remover rota `/projections` de `App.tsx`
- [ ] 2. Remover item "Projeções" do sidebar em `Layout.tsx`
- [ ] 3. Buscar por links para `/projections` em todo o projeto
- [ ] 4. Remover qualquer referência encontrada
- [ ] 5. Testar navegação do sidebar
- [ ] 6. Verificar que não há erros no console

---

## Search Command

```bash
# Buscar referências a /projections
grep -r "projections" --include="*.tsx" --include="*.ts" src/
```

---

## Test Cases

| # | Cenário | Resultado Esperado |
|---|---------|-------------------|
| 1 | Verificar sidebar | "Projeções" não aparece |
| 2 | Acessar /projections | Redireciona para 404 ou Dashboard |
| 3 | Navegar pelo app | Nenhum link quebrado |
| 4 | Build | Compila sem erros |

---

## Definition of Done

- [ ] Rota removida
- [ ] Item do sidebar removido
- [ ] Nenhum link quebrado
- [ ] Build funciona
- [ ] Componente FutureCashFlow.tsx preservado

---

## Notes

O componente `FutureCashFlow.tsx` pode ser útil futuramente para:
- Widget no Dashboard
- Seção em Relatórios
- Parte da nova aba de Aposentadoria

Por isso, **não deletar** o arquivo, apenas remover o acesso via navegação.

---

**Created by:** @pm (Morgan)
**Assigned to:** @dev
**Sprint:** UX Restructure - Week 4
**Estimated Time:** 30 min - 1h
