# STY-051: Reestruturar Sidebar com Seções Colapsáveis

**Epic:** UX Restructure - Sidebar e Navegação
**PRD:** PRD-UX-RESTRUCTURE-SIDEBAR
**Priority:** P0 CRÍTICA
**Effort:** 8h
**Status:** READY

---

## Descrição

Reorganizar completamente o sidebar do SPFP com nova estrutura hierárquica, implementando seções colapsáveis e nova ordem de navegação conforme especificado pelo usuário.

## User Story

**Como** usuário do SPFP,
**Quero** um sidebar organizado com seções colapsáveis,
**Para que** eu encontre funcionalidades relacionadas de forma mais intuitiva.

---

## Estrutura Atual → Nova

### Antes:
```
Dashboard
Minhas Contas
Lançamentos
Investimentos
Patrimônio
Objetivos
Metas Financeiras
Relatórios
Insights Financeiros
Projeções
```

### Depois:
```
📊 Dashboard
📋 Orçamento (expandível)
   ├─ 💳 Minhas Contas
   ├─ 📝 Lançamentos
   ├─ 🎯 Metas
   └─ 📅 Parcelamentos
🎯 Objetivos
🏖️ Aposentadoria
💰 Patrimônio
🏠 Aquisição
📈 Relatórios
💡 Insights Financeiros
```

---

## Acceptance Criteria

- [ ] **AC-1:** Sidebar exibe nova estrutura hierárquica
- [ ] **AC-2:** Seção "Orçamento" é colapsável com animação suave (200ms)
- [ ] **AC-3:** Estado de expansão persiste durante a sessão (não precisa persistir entre sessões)
- [ ] **AC-4:** Todos os itens têm emoji à esquerda
- [ ] **AC-5:** Indicador chevron (▼/▶) para seção colapsável
- [ ] **AC-6:** Item ativo tem destaque visual (background + borda esquerda)
- [ ] **AC-7:** Hover state funcional em todos os itens
- [ ] **AC-8:** Navegação por teclado funcionando (Tab, Enter)
- [ ] **AC-9:** Mobile: sidebar funciona como drawer ou bottom nav
- [ ] **AC-10:** Aba "Projeções" removida do sidebar

---

## Technical Implementation

### Arquivos a Modificar:
1. `src/components/Layout.tsx` - Reestruturar navegação principal
2. `src/components/sidebar/SidebarLayout.tsx` - Se aplicável
3. `src/App.tsx` - Ajustar rotas (adicionar novas, remover projeções)

### Estrutura de Dados:
```typescript
interface NavItem {
  id: string;
  label: string;
  emoji: string;
  path?: string;
  children?: NavItem[];
  isExpandable?: boolean;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', emoji: '📊', path: '/dashboard' },
  {
    id: 'budget',
    label: 'Orçamento',
    emoji: '📋',
    isExpandable: true,
    children: [
      { id: 'accounts', label: 'Minhas Contas', emoji: '💳', path: '/accounts' },
      { id: 'transactions', label: 'Lançamentos', emoji: '📝', path: '/transactions' },
      { id: 'goals-financial', label: 'Metas', emoji: '🎯', path: '/budget' },
      { id: 'installments', label: 'Parcelamentos', emoji: '📅', path: '/installments' },
    ]
  },
  { id: 'goals', label: 'Objetivos', emoji: '🎯', path: '/goals' },
  { id: 'retirement', label: 'Aposentadoria', emoji: '🏖️', path: '/retirement' },
  { id: 'patrimony', label: 'Patrimônio', emoji: '💰', path: '/patrimony' },
  { id: 'acquisition', label: 'Aquisição', emoji: '🏠', path: '/acquisition' },
  { id: 'reports', label: 'Relatórios', emoji: '📈', path: '/reports' },
  { id: 'insights', label: 'Insights Financeiros', emoji: '💡', path: '/insights' },
];
```

### Componente de Seção Colapsável:
```tsx
const CollapsibleSection: React.FC<{
  item: NavItem;
  isExpanded: boolean;
  onToggle: () => void;
}> = ({ item, isExpanded, onToggle }) => {
  return (
    <div>
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150"
        aria-expanded={isExpanded}
      >
        <span className="flex items-center gap-2">
          <span>{item.emoji}</span>
          <span>{item.label}</span>
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-200 ${isExpanded ? 'max-h-96' : 'max-h-0'}`}>
        {item.children?.map(child => (
          <NavLink key={child.id} to={child.path!} className="pl-8">
            <span>{child.emoji}</span> {child.label}
          </NavLink>
        ))}
      </div>
    </div>
  );
};
```

---

## Tasks

- [ ] 1. Definir estrutura de dados dos itens de navegação
- [ ] 2. Criar componente `CollapsibleSection`
- [ ] 3. Atualizar `Layout.tsx` com nova estrutura
- [ ] 4. Implementar estado de expansão com useState
- [ ] 5. Adicionar animações de transição
- [ ] 6. Estilizar item ativo e hover
- [ ] 7. Implementar navegação por teclado
- [ ] 8. Adaptar para mobile (drawer ou bottom nav)
- [ ] 9. Remover entrada de Projeções
- [ ] 10. Testar todas as rotas

---

## Dependencies

- **Bloqueado por:** Nenhum
- **Bloqueia:** STY-052, STY-053, STY-054, STY-055

---

## Test Cases

| # | Cenário | Passos | Resultado Esperado |
|---|---------|--------|-------------------|
| 1 | Expandir seção | Clicar em "Orçamento" | Subitens aparecem com animação |
| 2 | Colapsar seção | Clicar em "Orçamento" novamente | Subitens recolhem |
| 3 | Navegar para subitem | Expandir Orçamento, clicar em "Lançamentos" | Rota muda para /transactions |
| 4 | Item ativo | Navegar para /accounts | "Minhas Contas" fica destacado |
| 5 | Teclado | Tab até "Orçamento", Enter | Seção expande |
| 6 | Mobile | Abrir em tela < 768px | Sidebar vira drawer ou bottom nav |
| 7 | Projeções removido | Verificar sidebar | Não existe mais item "Projeções" |

---

## Definition of Done

- [ ] Código implementado e revisado
- [ ] Todos os ACs passando
- [ ] Testes manuais realizados
- [ ] Responsividade verificada (mobile, tablet, desktop)
- [ ] Acessibilidade testada (keyboard nav, ARIA)
- [ ] Sem erros no console
- [ ] PR aprovado

---

## File List (will be updated during implementation)

```
Modified:
- src/components/Layout.tsx
- src/App.tsx

Created:
- (se necessário) src/components/sidebar/CollapsibleSection.tsx
```

---

**Created by:** @pm (Morgan)
**Assigned to:** @dev
**Sprint:** UX Restructure - Week 1
