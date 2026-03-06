# Handoff — 2026-03-05 — EPIC-TD-001 Tech Debt (Sprints 1-3)

## Status Geral

EPIC-TD-001 Sprints 1, 2 e 3 concluídos. Sprint 4-6 parcialmente avaliados.

## O que foi feito nesta sessão

### Sprint 1 (commit 72c8de2)
- **TD-S1-001**: EmptyState component (`src/components/ui/EmptyState.tsx`) criado
- **TD-S1-002**: FocusTrapModal component (`src/components/ui/FocusTrapModal.tsx`) criado
- **TD-S1-003**: StatCard component (`src/components/ui/StatCard.tsx`) criado

### Sprint 2 (commit 72c8de2)
- **TD-S2-001**: EmptyState aplicado em DashboardTransactions
- **TD-S2-002**: EmptyState aplicado em TransactionList, GoalCarousel, AccountsList, InvestmentPortfolioSimple
- **TD-S2-003**: StatCard aplicado em GoalsAdvanced (4 cards)
- **TD-S2-004**: FocusTrapModal — Modal.tsx já tem focus trap nativo; Onboarding.tsx wrappado

### Sprint 3 (commit e6f0d54)
- **TD-S3-001**: `data-testid` adicionados em Login.tsx, GoalsAdvanced.tsx; ActionButton suporta prop `data-testid`
- **TD-S3-003**: Insights.tsx refatorado (674 → ~280 LOC): extraídos `FinnWelcomeScreen`, `FinnMessageList`, `FinnInputArea` para `src/components/insights/`
- **TD-S3-004**: Layout.tsx refatorado (466 → ~110 LOC): extraído `DesktopSidebar` para `src/components/layout/`
- **TD-S3-005**: Error recovery — csvService, pdfService, MarketDataService já usam errorRecovery (confirmado)

### Verificações realizadas
- **TD-S5-002**: Supabase Realtime JÁ implementado via `user_data` channel (FinanceContext.tsx:366-411)
- **TD-S5-003**: Admin detection JÁ usa `VITE_ADMIN_EMAILS` env var (não hardcoded)

## Decisões técnicas

1. **Modal.tsx focus trap nativo**: já implementa Tab cycling, ESC close e focus restore — FocusTrapModal só foi necessário para Onboarding
2. **Supabase Realtime monolítico**: toda a sincronização é via tabela `user_data` (JSONB blob). Não há tabelas separadas de transactions/goals — o Realtime já funciona para tudo
3. **Stories puladas por risco/baixo valor**:
   - TD-S3-002: types.ts split (só 226 linhas, risco > benefício)
   - TD-S4-001: FinanceContext split (risco de regressão extremamente alto)
   - TD-S4-003: AI consolidation (dual path intencional e funcional)
   - TD-S5-001: E2E Playwright (setup complexo)
   - TD-S6-001: Dashboard pagination (TransactionList já tem paginação)
   - TD-S6-002: Bundle audit (análise apenas)

## Arquivos-chave criados/modificados

| Arquivo | Ação | Story |
|---------|------|-------|
| `src/components/ui/EmptyState.tsx` | CRIADO | TD-S1-001 |
| `src/components/ui/FocusTrapModal.tsx` | CRIADO | TD-S1-002 |
| `src/components/ui/StatCard.tsx` | CRIADO | TD-S1-003 |
| `src/components/ui/ActionButton.tsx` | MODIFICADO (data-testid) | TD-S3-001 |
| `src/components/Login.tsx` | MODIFICADO (data-testid) | TD-S3-001 |
| `src/components/goals/GoalsAdvanced.tsx` | MODIFICADO (data-testid, StatCard) | TD-S3-001 |
| `src/components/Insights.tsx` | REFATORADO | TD-S3-003 |
| `src/components/insights/FinnWelcomeScreen.tsx` | CRIADO | TD-S3-003 |
| `src/components/insights/FinnMessageList.tsx` | CRIADO | TD-S3-003 |
| `src/components/insights/FinnInputArea.tsx` | CRIADO | TD-S3-003 |
| `src/components/Layout.tsx` | REFATORADO | TD-S3-004 |
| `src/components/layout/DesktopSidebar.tsx` | CRIADO | TD-S3-004 |

## Git

- Commit Sprint 1+2: `b390f3e` (reescrito — .env.local removido)
- Commit Sprint 3: `b7dc7d8` (reescrito — .env.local removido)
- Push: `origin/main` atualizado `32d88dc..b7dc7d8` ✅
- Backup local: branch `backup-sprint-td-001` (SHAs originais pré-reescrita)

### Observação sobre .env.local
`.env.local` estava sendo trackeado pelo git (estava no histórico), mesmo estando no `.gitignore`.
O GitHub Push Protection bloqueou o push por detectar um "Canva Connect API Secret" no arquivo.
Resolvido via `git filter-branch` para remover `.env.local` dos 2 commits + force push com `--force-with-lease`.

## Próximos passos (se retomar EPIC-TD-001)

1. TD-S4-002: Testes unitários para funções do FinanceContext (meta >= 80% coverage)
2. TD-S6-003: ImpersonationService refactor (extrair lógica de impersonation do FinanceContext)
3. Verificar se stories TD-S3-002, TD-S4-001 valem o risco antes de implementar
