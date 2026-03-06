# [TD-S2-002] Implementar empty states pos-onboarding

> Epic: EPIC-TD-001 | Sprint 2 | Prioridade: ALTO
> Origem: Assessment final (technical-debt-assessment.md — Secao 1, risco UX #3)
> Owner: @dev

---

## Contexto

O assessment final identificou que a ausencia de empty states no pos-onboarding e causa de abandono no D1 (primeiro dia de uso). Apos o usuario completar o onboarding de 5 telas com o Finn, ele chega ao Dashboard e ve uma tela vazia — sem transacoes, sem contas configuradas, sem metas. Nao ha instrucoes visuais ou calls-to-action que guiem o proximo passo.

Esse "vazio de intencao" e um padrao de UX classico de abandono: o usuario nao sabe o que fazer a seguir e abandona o app antes de criar valor.

**Problema identificado (technical-debt-assessment.md — Executive Summary, risco UX #3):**
> "Duplicacao ativa de Goals v1+v2 e Retirement v1+v2 fragmenta UX; ausencia de empty states no pos-onboarding causa abandono no D1."

---

## Objetivo

Implementar estados vazios com orientacao clara e calls-to-action em todas as secoes principais que o usuario vera vazias no primeiro acesso: Dashboard, Transactions, Accounts, Goals, Investments.

---

## Criterios de Aceitacao

- [ ] AC1: O Dashboard exibe um empty state quando nao ha transacoes — inclui ilustracao/icone, mensagem ("Comece adicionando sua primeira transacao") e botao CTA que abre o TransactionForm
- [ ] AC2: A lista de transacoes em `src/components/TransactionList.tsx` exibe empty state quando vazia — diferencia entre "sem transacoes no filtro atual" vs "sem transacoes ainda"
- [ ] AC3: A secao de Accounts exibe empty state quando sem contas — inclui CTA para adicionar primeira conta
- [ ] AC4: A secao de Goals exibe empty state quando sem metas — inclui CTA para criar primeira meta com mensagem motivacional alinhada ao tom do Finn
- [ ] AC5: A secao de Investments exibe empty state quando sem investimentos — inclui CTA para adicionar primeiro investimento
- [ ] AC6: Os empty states sao visuais e consistentes com o design system da plataforma (glassmorphism, dark mode, paleta SPFP)
- [ ] AC7: O Finn aparece nos empty states das secoes principais com uma dica contextual (ex: "Quer uma dica de como comecar?" com link para o chat do Finn)
- [ ] AC8: Empty states NAO aparecem durante carregamento de dados — so aparecem apos `isInitialLoadComplete === true` no FinanceContext

---

## Tarefas Tecnicas

- [ ] Task 1: Criar componente reutilizavel `src/components/ui/EmptyState.tsx` com props: `icon`, `title`, `description`, `ctaLabel`, `onCta`, `finnTip` (opcional)
- [ ] Task 2: Identificar em `src/components/Dashboard.tsx` onde a lista de transacoes recentes e renderizada — adicionar EmptyState quando `transactions.length === 0 && isInitialLoadComplete`
- [ ] Task 3: Em `src/components/TransactionList.tsx`, adicionar EmptyState distinguindo "sem transacoes no filtro" (ajuste o filtro) vs "sem transacoes ainda" (adicione a primeira)
- [ ] Task 4: Em `src/components/Accounts.tsx`, adicionar EmptyState quando `accounts.length === 0 && isInitialLoadComplete` com CTA para adicionar conta
- [ ] Task 5: Em `src/components/Goals.tsx` (versao canonica apos TD-S2-001), adicionar EmptyState quando `goals.length === 0 && isInitialLoadComplete`
- [ ] Task 6: Em `src/components/Investments.tsx`, adicionar EmptyState quando `investments.length === 0 && isInitialLoadComplete`
- [ ] Task 7: Testar com usuario novo (sem dados): verificar empty states em todas as 5 secoes
- [ ] Task 8: Testar com usuario existente (com dados): verificar que empty states nao aparecem quando ha dados

---

## Definicao de Pronto

- [ ] Componente `EmptyState.tsx` criado e reutilizavel
- [ ] Empty states implementados em: Dashboard, TransactionList, Accounts, Goals, Investments
- [ ] Empty states nao aparecem durante loading (aguarda `isInitialLoadComplete`)
- [ ] Design alinhado ao dark mode e paleta SPFP — revisado visualmente
- [ ] Testado com usuario novo (sem dados) e usuario existente (com dados)
- [ ] Nenhuma regressao nas secoes modificadas

---

## Esforo Estimado

**M** (4-8 horas)
- Task 1 (componente EmptyState): ~1h
- Task 2-6 (implementacao por secao): ~4h (45min por secao)
- Task 7-8 (testes): ~1h

---

## Dependencias

- TD-S2-001 deve estar completo — precisamos da versao canonica de Goals para implementar o empty state correto
- `isInitialLoadComplete` deve estar disponivel no `useFinance()` hook — verificar em `src/context/FinanceContext.tsx`

---

## Notas Tecnicas

- `isInitialLoadComplete` esta disponivel no FinanceContext — buscar em `src/context/FinanceContext.tsx`
- FinnAvatar ja existe em `src/components/FinnAvatar.tsx` com props `mode` (advisor/partner) e `size` — usar no componente EmptyState para o finn tip
- Paleta de cores SPFP esta em `tailwind.config.js`
- Para o Dashboard, verificar se usa `transactions` direto ou um `recentTransactions` computado
- Tom de voz dos empty states deve ser encorajador e direto — alinhado com brand voice do Finn
- Referencia: `docs/architecture/technical-debt-assessment.md` — Secao 1 (Executive Summary, risco UX)
- Assets do Finn: `public/branding/finn-advisor.png` e `public/branding/finn-partner.png`
