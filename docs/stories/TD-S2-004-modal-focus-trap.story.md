# [TD-S2-004] Focus trap em modais (acessibilidade WCAG 2.1 AA)

> Epic: EPIC-TD-001 | Sprint 2 | Prioridade: CRITICO
> Origem: TD-007 (frontend-spec.md — Secao 6)
> Owner: @dev

---

## Contexto

Os modais do SPFP (Onboarding, TransactionForm em modo fullscreen, e outros dialogs bloqueantes) nao implementam focus trap. Isso significa que usuarios que navegam via teclado (Tab) podem "escapar" do modal e acessar elementos do conteudo ao fundo — que esta semanticamente inacessivel enquanto o modal esta aberto.

Esse comportamento viola o criterio de sucesso **WCAG 2.1 — 2.1.2 No Keyboard Trap** (nivel A) e a diretriz **WCAG 2.4 Navigable** — e considerado um defeito de acessibilidade critico que pode impedir usuarios com deficiencias motoras de usar o aplicativo.

**Evidencia tecnica (frontend-spec.md — Secao 6):**
> "Sem focus trap em modais — usuario escapa com Tab"

**Modais identificados como bloqueantes:**
- `src/components/Onboarding.tsx` — overlay fullscreen de onboarding
- `src/components/TransactionForm.tsx` — formulario em modo modal/fullscreen
- Qualquer outro componente que renderize um `<dialog>` ou overlay com `fixed inset-0`

---

## Objetivo

Garantir que o foco do teclado fique contido dentro de qualquer modal bloqueante enquanto ele estiver aberto, e retorne ao elemento que o abriu ao fechar — atendendo ao criterio WCAG 2.1 AA.

---

## Criterios de Aceitacao

- [ ] AC1: Ao abrir o modal de Onboarding, o foco e movido para o primeiro elemento interativo dentro do modal — verificado com Tab a partir de qualquer ponto da pagina
- [ ] AC2: Ao pressionar Tab repetidamente dentro do Onboarding, o foco cicla entre os elementos interativos do modal e NAO escapa para o conteudo ao fundo
- [ ] AC3: Ao pressionar Escape no Onboarding (se aplicavel), o modal fecha e o foco retorna ao elemento que acionou o modal
- [ ] AC4: Ao abrir o TransactionForm em modo modal/fullscreen, o foco e movido para o primeiro campo do formulario
- [ ] AC5: Ao pressionar Tab no TransactionForm, o foco cicla entre os campos do formulario e os botoes de acao — nao escapa
- [ ] AC6: Ao fechar o TransactionForm (cancelar ou salvar), o foco retorna ao elemento que o abriu (ex: botao "Adicionar transacao")
- [ ] AC7: Todos os outros modais/dialogs bloqueantes identificados no codebase tem o mesmo comportamento de focus trap
- [ ] AC8: O focus trap e removido corretamente quando o modal fecha — nao ha vazamento de focus trap para a pagina principal

---

## Tarefas Tecnicas

- [ ] Task 1: Instalar biblioteca de focus trap — `npm install focus-trap-react` (bem mantida, compativel com React 19)
- [ ] Task 2: Auditar o codebase para identificar TODOS os modais bloqueantes — buscar por `fixed inset-0`, `z-50`, `<dialog`, `modal`, `overlay` em `src/components/`
- [ ] Task 3: Criar componente wrapper `src/components/ui/FocusTrapModal.tsx` que encapsula `FocusTrap` da biblioteca com configuracao padrao (initialFocus, returnFocusOnDeactivate, etc.)
- [ ] Task 4: Aplicar `FocusTrapModal` em `src/components/Onboarding.tsx` — envolver o conteudo do modal no wrapper
- [ ] Task 5: Aplicar `FocusTrapModal` em `src/components/TransactionForm.tsx` — envolver o formulario no wrapper quando em modo modal
- [ ] Task 6: Para cada outro modal identificado na Task 2, aplicar `FocusTrapModal` ou o foco trap diretamente
- [ ] Task 7: Testar com teclado (sem mouse): abrir cada modal → Tab em todos os elementos → Escape para fechar → verificar que foco retornou
- [ ] Task 8: (Opcional mas recomendado) Testar com leitor de tela: NVDA (Windows) ou narrador nativo — verificar que anuncio do modal e correto (`role="dialog"`, `aria-modal="true"`, `aria-labelledby`)

---

## Definicao de Pronto

- [ ] `focus-trap-react` instalado
- [ ] Componente `FocusTrapModal.tsx` criado
- [ ] Focus trap aplicado em: Onboarding, TransactionForm, e todos os modais bloqueantes identificados
- [ ] Testado com teclado: Tab cicla apenas dentro do modal, Escape fecha e retorna foco
- [ ] `aria-modal="true"` e `role="dialog"` presentes nos modais (acessibilidade semantica)
- [ ] Nenhuma regressao: modais abrem e fecham normalmente com mouse/touch

---

## Esforo Estimado

**S** (2-4 horas)
- Task 1-3 (instalacao + componente wrapper): ~1h
- Task 4-6 (aplicacao nos modais): ~1-2h
- Task 7-8 (testes): ~1h

---

## Dependencias

Nenhuma — esta story e independente dentro do Sprint 2.

---

## Notas Tecnicas

- `focus-trap-react` API: `<FocusTrap active={isOpen} focusTrapOptions={{ initialFocus: '#first-input', returnFocusOnDeactivate: true }}>`
- Alternativa sem biblioteca: implementar logica nativa com `useRef` capturando primeiro e ultimo elementos focaveis e interceptando Tab/Shift+Tab — mais complexo, nao recomendado
- Adicionar `aria-modal="true"`, `role="dialog"`, e `aria-labelledby` nos elementos de modal para semantica correta com leitores de tela
- Busca sugerida para auditar modais: `grep -r "fixed inset-0\|z-50\|z-\[" src/components/ --include="*.tsx" -l`
- Onboarding em `src/components/Onboarding.tsx` — criado no EPIC-013
- TransactionForm em `src/components/TransactionForm.tsx`
- Referencia: `docs/prd/technical-debt-DRAFT.md` — TD-007, `docs/architecture/technical-debt-assessment.md` — Secao 3 (TD-007)
- WCAG 2.1 criterio relevante: Success Criterion 2.1.2 — No Keyboard Trap (Level A), Success Criterion 2.4.3 — Focus Order (Level A)
