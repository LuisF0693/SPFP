# STY-057: Bug Fix - Nome do Dono em Lançamentos com Cartão

**Epic:** UX Restructure - Sidebar e Navegação
**PRD:** PRD-UX-RESTRUCTURE-SIDEBAR
**Priority:** P1 ALTA
**Effort:** 3h
**Status:** READY

---

## Descrição

Corrigir a exibição do nome do proprietário do cartão nos lançamentos. Quando o proprietário é "ME", deve mostrar o nome do usuário logado. Na seleção de cartão em lançamentos, mostrar "Nome do Cartão - Nome do Dono".

## User Story

**Como** usuário do SPFP,
**Quero** ver o nome real do dono do cartão nos lançamentos,
**Para que** eu identifique facilmente de quem é cada cartão.

---

## Bug Report

### Comportamento Atual:
- Seletor de cartão mostra: "Nubank" ou "Nubank - ME"
- Não mostra o nome real do usuário

### Comportamento Esperado:
- Seletor de cartão mostra: "Nubank - João"
- Quando dono é "ME", usar nome do usuário logado
- Quando dono é "SPOUSE", usar nome do cônjuge
- Quando dono é "JOINT", mostrar "Conjunto"

---

## Acceptance Criteria

- [ ] **AC-1:** Seletor de cartão mostra "Nome do Cartão - Nome do Dono"
- [ ] **AC-2:** "ME" é substituído pelo nome do usuário
- [ ] **AC-3:** "SPOUSE" é substituído pelo nome do cônjuge (se disponível)
- [ ] **AC-4:** "JOINT" mostra "Conjunto"
- [ ] **AC-5:** Lista de transações mostra nome correto do dono
- [ ] **AC-6:** Funciona em novo lançamento e edição

---

## Technical Implementation

### Arquivos Afetados:
```
src/components/TransactionForm.tsx
src/components/transaction/TransactionBasicForm.tsx
src/components/TransactionList.tsx
```

### Helper Function:
```typescript
// src/utils/ownerUtils.ts
export function getOwnerDisplayName(
  owner: AccountOwner,
  userProfile?: UserProfile,
  user?: User
): string {
  switch (owner) {
    case 'ME':
      return userProfile?.name || user?.email?.split('@')[0] || 'Eu';
    case 'SPOUSE':
      return userProfile?.spouseName || 'Cônjuge';
    case 'JOINT':
      return 'Conjunto';
    default:
      return owner;
  }
}

export function getCardDisplayName(
  card: Account,
  userProfile?: UserProfile,
  user?: User
): string {
  const ownerName = getOwnerDisplayName(card.owner, userProfile, user);
  return `${card.name} - ${ownerName}`;
}
```

### Uso no TransactionForm:
```tsx
// src/components/transaction/TransactionBasicForm.tsx
import { getCardDisplayName } from '../../utils/ownerUtils';

const { user } = useAuth();
const { accounts, userProfile } = useFinance();

const creditCards = accounts.filter(a => a.type === 'CREDIT_CARD');

// No select de cartões
<select value={selectedCardId} onChange={...}>
  <option value="">Selecione um cartão</option>
  {creditCards.map(card => (
    <option key={card.id} value={card.id}>
      {getCardDisplayName(card, userProfile, user)}
    </option>
  ))}
</select>
```

### Uso no TransactionList:
```tsx
// src/components/TransactionList.tsx
const getCardInfo = (accountId: string) => {
  const account = accounts.find(a => a.id === accountId);
  if (!account) return 'Conta não encontrada';

  if (account.type === 'CREDIT_CARD') {
    return getCardDisplayName(account, userProfile, user);
  }

  return account.name;
};
```

---

## Tasks

- [ ] 1. Criar `src/utils/ownerUtils.ts` com helpers
- [ ] 2. Atualizar `TransactionBasicForm.tsx` para usar helper
- [ ] 3. Atualizar `TransactionList.tsx` para exibir nome correto
- [ ] 4. Verificar se `userProfile` tem campo `spouseName`
- [ ] 5. Testar criação de lançamento com cartão
- [ ] 6. Testar listagem de lançamentos
- [ ] 7. Testar edição de lançamento

---

## UserProfile Check

Verificar se existe campo para nome do cônjuge:
```typescript
// src/types.ts
interface UserProfile {
  name?: string;
  spouseName?: string; // ← Precisa existir
  // ...
}
```

Se não existir, adicionar e criar campo na tela de Settings.

---

## Test Cases

| # | Cenário | Resultado Esperado |
|---|---------|-------------------|
| 1 | Cartão com dono "ME" | Mostra "Nubank - João" |
| 2 | Cartão com dono "SPOUSE" | Mostra "Itaú - Maria" |
| 3 | Cartão com dono "JOINT" | Mostra "Bradesco - Conjunto" |
| 4 | Sem nome no profile | Mostra email ou fallback |
| 5 | Lista de transações | Mostra nome correto |
| 6 | Editar transação | Seletor mostra nome correto |

---

## Definition of Done

- [ ] Helper criado e funcionando
- [ ] TransactionForm usando helper
- [ ] TransactionList usando helper
- [ ] Nome do dono aparece corretamente
- [ ] Fallbacks funcionando
- [ ] Sem erros no console

---

**Created by:** @pm (Morgan)
**Assigned to:** @dev
**Sprint:** UX Restructure - Week 2
