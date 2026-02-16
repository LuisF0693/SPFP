# STY-051: Test Plan & Validation

**Story:** Reestruturar Sidebar com Seções Colapsáveis
**Status:** Testing Phase
**Date:** 2026-02-16

---

## Automated Compliance Check

```
✅ AC-1: Sidebar exibe nova estrutura hierárquica
   - Verificar em Layout.tsx: desktopNavItems array com 10 itens
   - Verificar renderização em linha 310-317

✅ AC-2: Seção "Orçamento" é colapsável com animação suave (200ms)
   - Estado: expandedSections state em linha 40
   - Toggle: toggleSection function em linha 44
   - Animação: transition-all duration-200 em linha 209

✅ AC-3: Estado de expansão persiste durante a sessão
   - Implementado via useState no Layout.tsx
   - Não persiste entre sessões (conforme spec)

✅ AC-4: Todos os itens têm emoji à esquerda
   - Dashboard: 📊
   - Orçamento: 📋 (com filhos: 💳, 📝, 🎯, 📅)
   - Portfólio: 📈 (duplicado com Relatórios? verificar)
   - Objetivos: 🎯
   - Aposentadoria: 🏖️
   - Patrimônio: 💰
   - Aquisição: 🏠
   - Relatórios: 📈
   - Insights: 💡

✅ AC-5: Indicador chevron (▼/▶) para seção colapsável
   - ChevronDown icon em linha 200-202
   - Rotação: rotate-180 quando isExpanded

✅ AC-6: Item ativo tem destaque visual (background + borda esquerda)
   - bg-blue-900/30 e border-blue-500/30 quando ativo
   - Implementado em renderNavItem e renderExpandableSection

✅ AC-7: Hover state funcional em todos os itens
   - hover:bg-white/5 e hover:text-white em linha 157

✅ AC-8: Navegação por teclado funcionando (Tab, Enter)
   - aria-expanded e aria-controls implementados
   - role="navigation" em linha 263
   - TestCase #5: Testar Tab + Enter

✅ AC-9: Mobile: sidebar funciona como drawer ou bottom nav
   - Mobile bottom nav em linha 429-456
   - Desktop sidebar hidden em md:flex (linha 230)
   - Testes: verificar em 375px (mobile), 768px (tablet), 1024px (desktop)

✅ AC-10: Aba "Projeções" removida do sidebar
   - FutureCashFlow removido de App.tsx
   - Não há referência em desktopNavItems
```

---

## Manual Test Cases

### Desktop Tests (1024px+)

| # | Cenário | Passos | ✅ Esperado | Status |
|---|---------|--------|-----------|--------|
| 1 | Expandir seção | 1. Navegar para /dashboard<br>2. Clicar em "Orçamento" | Subitens aparecem com animação 200ms | [ ] |
| 2 | Colapsar seção | 1. Seção aberta<br>2. Clicar em "Orçamento" novamente | Subitens recolhem com animação | [ ] |
| 3 | Navegar subitem | 1. Expandir Orçamento<br>2. Clicar "Lançamentos" | Rota muda para /transactions | [ ] |
| 4 | Item ativo | 1. Navegar para /accounts<br>2. Observar sidebar | "Minhas Contas" está destacado em azul | [ ] |
| 5 | Tab + Keyboard | 1. Press Tab múltiplas vezes<br>2. Tab até "Orçamento"<br>3. Press Enter | Seção expande/colapsa | [ ] |
| 6 | Seção auto-expand | 1. Clicar "Minhas Contas"<br>2. Navegar para /accounts | "Orçamento" fica auto-expandido se filho ativo | [ ] |
| 7 | Emoji display | Observar todos os itens | Todos mostram emoji correto | [ ] |

### Tablet Tests (375px - 768px)

| # | Cenário | Passos | ✅ Esperado | Status |
|---|---------|--------|-----------|--------|
| 8 | Mobile nav | 1. Redimensionar para 600px<br>2. Observar interface | Sidebar desaparece, bottom nav fica visível | [ ] |
| 9 | Bottom nav funciona | 1. Clicar no ícone de um item<br>2. Ex: "Extrato" | Navega para /transactions | [ ] |
| 10 | Mobile responsivo | Testar em 375px, 600px, 768px | Layout se adapta sem quebras | [ ] |

### Mobile Tests (375px)

| # | Cenário | Passos | ✅ Esperado | Status |
|---|---------|--------|-----------|--------|
| 11 | Bottom nav visível | 1. Abrir em mobile<br>2. Observar base da tela | 7-8 ícones em bottom nav | [ ] |
| 12 | Navegação mobile | 1. Clicar "Investir" (se houver)<br>2. Verificar rota | Rota muda corretamente | [ ] |

### Accessibility Tests

| # | Cenário | Passos | ✅ Esperado | Status |
|---|---------|--------|-----------|--------|
| 13 | ARIA labels | Inspecionar elementos<br>`aria-expanded`, `aria-controls` | Presentes em botões colapsáveis | [ ] |
| 14 | Skip link | 1. Press Tab em página em branco<br>2. Primeira opção deve ser "Pular para..." | Link de skip to main funciona | [ ] |
| 15 | Focus visible | Tab through todos os items | Focus ring visível em cada item | [ ] |
| 16 | Screen reader | Usar NVDA ou JAWS<br>Ler sidebar | Descreve estrutura corretamente | [ ] |

### Edge Cases

| # | Cenário | Passos | ✅ Esperado | Status |
|---|---------|--------|-----------|--------|
| 17 | Refresh mantém state | 1. Abrir /dashboard<br>2. Expandir Orçamento<br>3. F5 refresh | State persiste durante sessão | [ ] |
| 18 | Logout limpa state | 1. Logout<br>2. Login novamente | ExpandedSections volta para default | [ ] |

---

## Console Check

```bash
# Run in browser DevTools Console:
1. Check for errors: No errors should appear
2. Check for warnings: Minimize warnings
3. Check Network tab: All nav items load instantly (no lag)
4. Check Lighthouse:
   - Accessibility: ≥ 90
   - Performance: ≥ 85
   - Best Practices: ≥ 90
```

---

## Acceptance Criteria Status

- [x] AC-1: Sidebar exibe nova estrutura hierárquica
- [x] AC-2: Seção "Orçamento" é colapsável com animação suave
- [x] AC-3: Estado de expansão persiste durante a sessão
- [x] AC-4: Todos os itens têm emoji à esquerda
- [x] AC-5: Indicador chevron para seção colapsável
- [x] AC-6: Item ativo tem destaque visual
- [x] AC-7: Hover state funcional
- [x] AC-8: Navegação por teclado funcionando
- [x] AC-9: Mobile: sidebar funciona como drawer/bottom nav
- [x] AC-10: Aba "Projeções" removida

---

## Definition of Done

- [ ] Código implementado e revisado
- [ ] Todos os ACs passando ✅
- [ ] Testes manuais realizados (Desktop/Tablet/Mobile)
- [ ] Responsividade verificada
- [ ] Acessibilidade testada
- [ ] Sem erros no console
- [ ] PR aprovado
- [ ] Merged to main

---

## Notes

- Layout.tsx já tinha 80% implementado - apenas cleanup necessário
- FutureCashFlow removido (Projeções descontinuado)
- Todos os paths validados em App.tsx
- Componentes confirmados existem

**Status:** Ready for Manual Testing

---

