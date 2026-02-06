# STY-058: UI - Emojis no Formulário de Lançamentos

**Epic:** UX Restructure - Sidebar e Navegação
**PRD:** PRD-UX-RESTRUCTURE-SIDEBAR
**Priority:** P2 MÉDIA
**Effort:** 3h
**Status:** READY

---

## Descrição

Mover o seletor de emojis/sentimento para dentro do formulário de novo lançamento, e padronizar o uso apenas de emojis (removendo ícones SVG) para categorias.

## User Story

**Como** usuário do SPFP,
**Quero** selecionar emojis para categorias dentro do formulário,
**Para que** a experiência seja mais integrada e consistente.

---

## Situação Atual

1. Emojis de sentimento estão em `TransactionMetadata.tsx` (separado)
2. Categorias usam tanto ícones (Lucide) quanto emojis
3. `EmojiPicker.tsx` existe mas não está integrado no form principal

## Situação Desejada

1. Seletor de emoji integrado na etapa de categoria do form
2. Apenas emojis para categorias (sem ícones SVG)
3. Interface consistente e intuitiva

---

## Acceptance Criteria

- [ ] **AC-1:** Seletor de emoji aparece dentro do formulário de novo lançamento
- [ ] **AC-2:** Emoji selecionado aparece junto com o nome da categoria
- [ ] **AC-3:** Categorias usam apenas emojis (não ícones SVG)
- [ ] **AC-4:** Usuário pode mudar emoji de uma categoria
- [ ] **AC-5:** Emoji persiste com a transação
- [ ] **AC-6:** Lista de transações mostra emoji da categoria
- [ ] **AC-7:** Design responsivo para mobile

---

## Technical Implementation

### Arquivos a Modificar:
```
src/components/TransactionForm.tsx
src/components/transaction/TransactionBasicForm.tsx
src/components/CategoryIcon.tsx
src/data/initialData.ts
```

### Remover Ícones SVG:
```typescript
// src/components/CategoryIcon.tsx
// ANTES: Mix de ícones e emojis
// DEPOIS: Apenas emojis

interface CategoryIconProps {
  categoryId: string;
  emoji?: string;
  size?: 'sm' | 'md' | 'lg';
}

const CategoryIcon: React.FC<CategoryIconProps> = ({ categoryId, emoji, size = 'md' }) => {
  const category = INITIAL_CATEGORIES.find(c => c.id === categoryId);
  const displayEmoji = emoji || category?.emoji || '📦';

  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  return (
    <span className={sizeClasses[size]} role="img" aria-label={category?.name || 'categoria'}>
      {displayEmoji}
    </span>
  );
};
```

### Seletor de Categoria com Emoji no Form:
```tsx
// src/components/transaction/TransactionBasicForm.tsx

const CategorySelector: React.FC<{
  categories: Category[];
  selected: string;
  onSelect: (categoryId: string) => void;
}> = ({ categories, selected, onSelect }) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">Categoria</label>
      <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
        {categories.map(cat => (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelect(cat.id)}
            className={`
              flex flex-col items-center p-3 rounded-lg border-2 transition-all
              ${selected === cat.id
                ? 'border-primary bg-primary/10'
                : 'border-gray-200 hover:border-gray-300'
              }
            `}
          >
            <span className="text-2xl mb-1">{cat.emoji}</span>
            <span className="text-xs text-center truncate w-full">{cat.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
```

### Atualizar Categorias Iniciais:
```typescript
// src/data/initialData.ts
export const INITIAL_CATEGORIES: Category[] = [
  { id: 'MORADIA', name: 'Moradia', type: 'EXPENSE', emoji: '🏠' },
  { id: 'TRANSPORTE', name: 'Transporte', type: 'EXPENSE', emoji: '🚗' },
  { id: 'SAUDE', name: 'Saúde', type: 'EXPENSE', emoji: '🏥' },
  { id: 'EDUCACAO', name: 'Educação', type: 'EXPENSE', emoji: '🎓' },
  { id: 'ALIMENTACAO', name: 'Alimentação', type: 'EXPENSE', emoji: '🛒' },
  { id: 'LAZER', name: 'Lazer', type: 'EXPENSE', emoji: '🎉' },
  { id: 'RESTAURANTE', name: 'Restaurante', type: 'EXPENSE', emoji: '🍔' },
  { id: 'COMPRAS', name: 'Compras', type: 'EXPENSE', emoji: '🛍️' },
  { id: 'APORTE', name: 'Aporte Mensal', type: 'INVESTMENT', emoji: '📈' },
  { id: 'RESERVA', name: 'Reserva de Emergência', type: 'INVESTMENT', emoji: '🛡️' },
  { id: 'SEGUROS', name: 'Seguros', type: 'EXPENSE', emoji: '☂️' },
  { id: 'SALARIO', name: 'Salário', type: 'INCOME', emoji: '💰' },
  { id: 'OUTRAS_RENDAS', name: 'Outras Rendas', type: 'INCOME', emoji: '💵' },
];
```

### Integrar no Formulário Principal:
```tsx
// src/components/TransactionForm.tsx
const TransactionForm: React.FC = () => {
  // ... estado existente

  return (
    <form>
      {/* Etapa 1: Informações Básicas */}
      <TransactionBasicForm
        description={description}
        value={value}
        date={date}
        type={type}
        categoryId={categoryId}
        onCategorySelect={setCategoryId}
        // ... outros props
      />

      {/* Categoria com emoji (movido para BasicForm) */}
      {/* Não precisa mais de TransactionMetadata separado para emoji */}
    </form>
  );
};
```

---

## Emoji Mapping (Referência)

| Categoria | Emoji |
|-----------|-------|
| Moradia | 🏠 |
| Transporte | 🚗 |
| Saúde | 🏥 |
| Educação | 🎓 |
| Alimentação | 🛒 |
| Lazer | 🎉 |
| Restaurante | 🍔 |
| Compras | 🛍️ |
| Aporte | 📈 |
| Reserva | 🛡️ |
| Seguros | ☂️ |
| Salário | 💰 |
| Outras Rendas | 💵 |

---

## Tasks

- [ ] 1. Atualizar `CategoryIcon.tsx` para usar apenas emojis
- [ ] 2. Criar componente `CategorySelector` com grid de emojis
- [ ] 3. Integrar `CategorySelector` em `TransactionBasicForm`
- [ ] 4. Remover imports de ícones Lucide não utilizados
- [ ] 5. Atualizar `INITIAL_CATEGORIES` com emojis
- [ ] 6. Atualizar `TransactionList` para mostrar emojis
- [ ] 7. Testar criação de transação
- [ ] 8. Testar listagem de transações
- [ ] 9. Responsividade mobile

---

## Dependencies

- **Bloqueado por:** Nenhum
- **Bloqueia:** Nenhum

---

## Test Cases

| # | Cenário | Resultado Esperado |
|---|---------|-------------------|
| 1 | Abrir form de lançamento | Categorias mostram emojis |
| 2 | Selecionar categoria | Emoji fica destacado |
| 3 | Salvar transação | Emoji persiste |
| 4 | Listar transações | Emoji da categoria aparece |
| 5 | Mobile | Grid adapta para 3 colunas |

---

## Definition of Done

- [ ] Emojis no formulário
- [ ] Ícones SVG removidos
- [ ] Lista mostra emojis
- [ ] Responsivo
- [ ] Sem erros no console

---

**Created by:** @pm (Morgan)
**Assigned to:** @dev
**Sprint:** UX Restructure - Week 4
