# STY-060: Redesign do Formulário de Nova Transação

**Epic:** UX Improvements - Forms & Modals
**Priority:** P1 ALTA
**Effort:** 5h
**Status:** DONE

---

## Descrição

Reformular o formulário de nova transação para uma experiência mais clean e organizada. O seletor de categorias deve abrir em um modal/drawer separado ao invés de expandir inline, tornando a interface mais limpa e intuitiva.

## User Story

**Como** usuário do SPFP,
**Quero** um formulário de lançamento mais limpo e organizado,
**Para que** eu possa registrar transações de forma rápida e agradável.

---

## Situação Atual

1. Formulário com muitos campos visíveis de uma vez
2. Seletor de categorias expande inline (ocupa muito espaço)
3. Grid de emojis/categorias fica "apertado" no form
4. Experiência visual pode ser melhorada

## Situação Desejada (Referência: Screenshot 070433)

1. Formulário mais compacto e elegante
2. Categoria selecionada mostra apenas emoji + nome em um botão
3. Ao clicar no botão de categoria, abre modal/drawer com grid completo
4. Campos organizados em seções visuais claras
5. Animações suaves nas transições

---

## Acceptance Criteria

- [x] **AC-1:** Formulário principal mais compacto (campos essenciais visíveis)
- [x] **AC-2:** Seletor de categoria em modal/drawer separado
- [x] **AC-3:** Modal de categoria com busca e grid de emojis
- [x] **AC-4:** Categoria selecionada exibe como "chip" (emoji + nome)
- [x] **AC-5:** Transições suaves ao abrir/fechar modal
- [x] **AC-6:** Botão de criar nova categoria dentro do modal
- [x] **AC-7:** Responsivo para mobile (drawer bottom-sheet via Modal component)
- [x] **AC-8:** Acessibilidade mantida (ARIA, focus trap)

---

## Design Specifications

### Layout Principal do Form
```
┌─────────────────────────────────────────┐
│  ← Nova Transação                       │
├─────────────────────────────────────────┤
│                                         │
│  [Saída]  [Entrada]     (toggle)        │
│                                         │
│  R$ 0,00                (valor grande)  │
│  ─────────────────────                  │
│                                         │
│  Descrição                              │
│  ┌─────────────────────────────────┐    │
│  │ Ex: iFood, Uber, Aluguel        │    │
│  └─────────────────────────────────┘    │
│                                         │
│  Categoria                              │
│  ┌─────────────────────────────────┐    │
│  │ 🏠 Moradia           [Alterar >]│    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌──────────┐  ┌──────────────────┐     │
│  │ Conta    │  │ Data             │     │
│  │ Nubank   │  │ 06/02/2026       │     │
│  └──────────┘  └──────────────────┘     │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │        PAGAR AGORA              │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

### Modal de Seleção de Categoria
```
┌─────────────────────────────────────────┐
│  Selecionar Categoria              [X]  │
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────┐    │
│  │ 🔍 Buscar categoria...          │    │
│  └─────────────────────────────────┘    │
│                                         │
│  GASTOS FIXOS                           │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐           │
│  │ 🏠 │ │ 🚗 │ │ 🏥 │ │ 🎓 │           │
│  │Casa│ │Auto│ │Saúd│ │Edu │           │
│  └────┘ └────┘ └────┘ └────┘           │
│                                         │
│  GASTOS VARIÁVEIS                       │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐           │
│  │ 🛒 │ │ 🎉 │ │ 🍔 │ │ 🛍️ │           │
│  │Merc│ │Laze│ │Rest│ │Comp│           │
│  └────┘ └────┘ └────┘ └────┘           │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ + Criar Nova Categoria          │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

---

## Technical Implementation

### Componentes a Criar/Modificar:
```
src/components/transaction/
├── TransactionBasicForm.tsx (MODIFICAR - extrair categoria)
├── CategorySelectorModal.tsx (NOVO - modal de seleção)
├── CategoryChip.tsx (NOVO - display da categoria selecionada)
└── CreateCategoryModal.tsx (EXTRAIR - já existe inline)
```

### CategorySelectorModal.tsx
```tsx
interface CategorySelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  selectedId: string;
  onSelect: (categoryId: string) => void;
  onCreateNew: () => void;
}

const CategorySelectorModal: React.FC<CategorySelectorModalProps> = ({
  isOpen, onClose, categories, selectedId, onSelect, onCreateNew
}) => {
  const [search, setSearch] = useState('');

  // Filter and group categories
  const grouped = useMemo(() => {
    const filtered = categories.filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase())
    );
    return groupBy(filtered, 'group');
  }, [categories, search]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Selecionar Categoria">
      <div className="space-y-4">
        {/* Search */}
        <input ... />

        {/* Category Grid by Group */}
        {Object.entries(grouped).map(([group, items]) => (
          <div key={group}>
            <h4>{GROUP_LABELS[group]}</h4>
            <div className="grid grid-cols-4 gap-2">
              {items.map(cat => (
                <CategoryButton
                  key={cat.id}
                  category={cat}
                  isSelected={selectedId === cat.id}
                  onClick={() => { onSelect(cat.id); onClose(); }}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Create New */}
        <button onClick={onCreateNew}>+ Criar Nova</button>
      </div>
    </Modal>
  );
};
```

---

## Tasks

- [x] 1. Criar `CategorySelectorModal.tsx`
- [x] 2. Criar `CategoryChip.tsx` para display compacto (inline no BasicForm)
- [x] 3. Extrair `CreateCategoryModal.tsx` do BasicForm
- [x] 4. Refatorar `TransactionBasicForm.tsx` para usar modal
- [x] 5. Adicionar animações de transição (CSS via Modal component)
- [x] 6. Implementar bottom-sheet para mobile (Modal já suporta)
- [x] 7. Testar acessibilidade (focus trap, ARIA - via Modal)
- [x] 8. Testar responsividade (build passou)

## Files Changed

- `src/components/transaction/CategorySelectorModal.tsx` - **NOVO**
- `src/components/transaction/CreateCategoryModal.tsx` - **NOVO**
- `src/components/transaction/TransactionBasicForm.tsx` - **MODIFICADO** - Formulário compacto com modais

---

## Dependencies

- **Bloqueado por:** Nenhum
- **Bloqueia:** Nenhum
- **Relacionado:** STY-058 (emojis no form - já implementado)

---

## Test Cases

| # | Cenário | Resultado Esperado |
|---|---------|-------------------|
| 1 | Abrir form | Categoria mostra chip compacto |
| 2 | Clicar em categoria | Modal abre com grid |
| 3 | Selecionar categoria | Modal fecha, chip atualiza |
| 4 | Buscar no modal | Filtra categorias |
| 5 | Mobile | Abre como bottom-sheet |
| 6 | Tab/Enter | Navegação por teclado funciona |

---

## Definition of Done

- [x] Modal de categoria implementado
- [x] Form mais limpo e compacto
- [x] Animações suaves
- [x] Bottom-sheet mobile
- [x] Acessível
- [x] Sem erros no console

---

**Created by:** @pm (Morgan)
**Assigned to:** @dev + @ux-design
**Sprint:** UX Improvements - Week 1
