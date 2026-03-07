# STY-056: Bug Fix - Proprietário Duplicado no Cartão

**Epic:** UX Restructure - Sidebar e Navegação
**PRD:** PRD-UX-RESTRUCTURE-SIDEBAR
**Priority:** P0 CRÍTICA
**Effort:** 2h
**Status:** READY

---

## Descrição

Corrigir bug onde "Cônjuge" aparece duplicado na lista de seleção de proprietário do cartão.

## User Story

**Como** usuário do SPFP,
**Quero** selecionar o proprietário do cartão sem opções duplicadas,
**Para que** eu configure meus cartões corretamente.

---

## Bug Report

### Comportamento Atual:
Ao criar/editar um cartão, a lista de proprietários mostra:
- EU
- Cônjuge
- Cônjuge ← **DUPLICADO**
- Conjunto

### Comportamento Esperado:
- EU (ou nome do usuário)
- Cônjuge (ou nome do cônjuge)
- Conjunto

---

## Root Cause Analysis

**Arquivo:** `src/components/forms/AccountForm.tsx`

**Possíveis causas:**
1. Array de opções tem item duplicado
2. Lógica de renderização duplica o item
3. Estado sendo atualizado duas vezes

**Tipo definido:** `AccountOwner = 'ME' | 'SPOUSE' | 'JOINT'` (em `src/types.ts`)

---

## Acceptance Criteria

- [ ] **AC-1:** Lista de proprietários não tem duplicatas
- [ ] **AC-2:** "EU" mostra nome do usuário logado (se disponível)
- [ ] **AC-3:** "Cônjuge" aparece apenas uma vez
- [ ] **AC-4:** "Conjunto" funciona corretamente
- [ ] **AC-5:** Seleção persiste após salvar
- [ ] **AC-6:** Funciona tanto em criação quanto edição

---

## Technical Implementation

### Investigação:
```typescript
// Verificar se o array de opções está correto
const ownerOptions: { value: AccountOwner; label: string }[] = [
  { value: 'ME', label: 'EU' },
  { value: 'SPOUSE', label: 'Cônjuge' },
  { value: 'JOINT', label: 'Conjunto' },
];

// Verificar se não há duplicação na renderização
{ownerOptions.map((option) => (
  <option key={option.value} value={option.value}>
    {option.label}
  </option>
))}
```

### Correção Proposta:
```tsx
// src/components/forms/AccountForm.tsx
const { user } = useAuth();
const { userProfile } = useFinance();

// Obter nome do usuário e cônjuge
const userName = userProfile?.name || user?.email?.split('@')[0] || 'EU';
const spouseName = userProfile?.spouseName || 'Cônjuge';

const ownerOptions: { value: AccountOwner; label: string }[] = [
  { value: 'ME', label: userName },
  { value: 'SPOUSE', label: spouseName },
  { value: 'JOINT', label: 'Conjunto' },
];

// Garantir que não há duplicatas
const uniqueOptions = Array.from(
  new Map(ownerOptions.map(o => [o.value, o])).values()
);
```

### Verificar UserProfile:
```typescript
// src/types.ts
interface UserProfile {
  name?: string;
  spouseName?: string;
  // ... outros campos
}
```

---

## Tasks

- [ ] 1. Reproduzir o bug localmente
- [ ] 2. Localizar a fonte da duplicação em `AccountForm.tsx`
- [ ] 3. Corrigir array/lógica de opções
- [ ] 4. Implementar exibição do nome do usuário (em vez de "EU")
- [ ] 5. Testar criação de novo cartão
- [ ] 6. Testar edição de cartão existente
- [ ] 7. Verificar que persiste corretamente

---

## Files to Modify

```
src/components/forms/AccountForm.tsx  ← Principal
src/types.ts                          ← Verificar AccountOwner type
```

---

## Test Cases

| # | Cenário | Resultado Esperado |
|---|---------|-------------------|
| 1 | Abrir form de novo cartão | 3 opções sem duplicatas |
| 2 | Selecionar "EU" | Mostra nome do usuário |
| 3 | Selecionar "Cônjuge" | Seleciona corretamente |
| 4 | Salvar cartão | Proprietário persiste |
| 5 | Editar cartão existente | Mostra proprietário correto |

---

## Definition of Done

- [ ] Bug corrigido
- [ ] Sem duplicatas na lista
- [ ] Nome do usuário exibido
- [ ] Testes manuais passando
- [ ] Sem erros no console

---

**Created by:** @pm (Morgan)
**Assigned to:** @dev
**Sprint:** UX Restructure - Week 1
