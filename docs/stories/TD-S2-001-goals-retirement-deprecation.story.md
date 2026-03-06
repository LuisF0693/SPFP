# [TD-S2-001] Deprecar Goals/Retirement v1 e consolidar versao canonica

> Epic: EPIC-TD-001 | Sprint 2 | Prioridade: CRITICO
> Origem: TD-005 (frontend-spec.md — Secao 5 e 8)
> Owner: @dev + @po

---

## Contexto

O SPFP possui duas versoes paralelas e ativas de duas features centrais:

- **Goals:** `/goals` (v1) e `/goals-v2` (v2) — ambos visiveis no sidebar
- **Retirement:** `/retirement` (v1) e `/retirement-v2` (v2) — ambos visiveis no sidebar

As duas versoes coexistem ativamente, criando:
- Confusao de UX: usuario nao sabe qual usar, dados podem estar divididos entre versoes
- Manutencao duplicada: bugs e features precisam ser implementados em 4 componentes
- Sidebar poluido: 4 itens de navegacao onde deveriam ser 2

**Evidencia tecnica (frontend-spec.md — Secao 5 e 8):**
> "Goals v1 + v2 coexistem — `/goals` e `/goals-v2` ambos no sidebar"
> "Duplicacao Goals/Retirement v1+v2 — confusao de UX e manutencao dupla (Critico P0)"

**Pre-requisito de produto:** Esta story requer uma decisao do @po sobre qual versao e a canonica ANTES do inicio da implementacao. A decisao deve ser tomada na planning do Sprint 2.

---

## Objetivo

Ter exatamente uma versao de Goals e uma versao de Retirement ativas e visiveis no sidebar, com rotas antigas redirecionando para a versao canonica, e componentes deprecados removidos do codebase.

---

## Criterios de Aceitacao

- [ ] AC1: Apenas uma rota de Goals e visivel e acessivel (ex: `/goals` ou `/goals-v2` — conforme decisao do @po)
- [ ] AC2: Apenas uma rota de Retirement e visivel e acessivel (ex: `/retirement` ou `/retirement-v2`)
- [ ] AC3: A rota da versao deprecada de Goals redireciona automaticamente para a versao canonica com `<Navigate to="/goals" replace />` (sem quebrar links existentes)
- [ ] AC4: A rota da versao deprecada de Retirement redireciona automaticamente para a versao canonica
- [ ] AC5: O sidebar em `src/components/Layout.tsx` mostra apenas 1 item de Goals e 1 item de Retirement (nao ha duplicata)
- [ ] AC6: Os componentes deprecados (arquivos `.tsx` das versoes removidas) sao deletados do codebase — nao apenas comentados ou ocultados
- [ ] AC7: Todos os dados existentes do usuario (metas, progresso) continuam acessiveis na versao canonica sem perda de dados
- [ ] AC8: Nenhum erro 404 ou redirect loop ao acessar as rotas antigas

---

## Tarefas Tecnicas

- [ ] Task 1: [PRE-SPRINT] @po decide qual versao e canonica para Goals e para Retirement — documentar decisao nesta story antes do inicio
- [ ] Task 2: Mapear onde as rotas sao definidas — `src/App.tsx` — identificar todas as entradas de `/goals`, `/goals-v2`, `/retirement`, `/retirement-v2`
- [ ] Task 3: Mapear onde os itens de sidebar sao definidos — `src/components/Layout.tsx` — identificar as entradas duplicadas
- [ ] Task 4: Verificar se ha dados diferentes nos dois contextos (ex: Goals v2 usa um sub-estado diferente no FinanceContext) — garantir que a versao canonica acessa os mesmos dados
- [ ] Task 5: Em `src/App.tsx`, substituir a rota da versao deprecada por `<Route path="/goals-v2" element={<Navigate to="/goals" replace />} />` (ou equivalente conforme decisao)
- [ ] Task 6: Em `src/components/Layout.tsx`, remover o item de sidebar da versao deprecada para Goals e Retirement
- [ ] Task 7: Deletar os arquivos de componente das versoes deprecadas (ex: `src/components/GoalsV2.tsx`, `src/components/RetirementV2.tsx` — verificar nomes reais)
- [ ] Task 8: Testar navegacao: acessar rota antiga → confirmar redirect; acessar rota nova → dados carregam corretamente
- [ ] Task 9: Verificar que nenhum outro componente importa os arquivos deletados (`grep -r "GoalsV2\|RetirementV2\|goals-v2\|retirement-v2" src/`)

---

## Definicao de Pronto

- [ ] Decisao do @po documentada na story (qual versao e canonica)
- [ ] Codigo revisado
- [ ] Apenas 1 item de Goals e 1 item de Retirement no sidebar — verificado visualmente
- [ ] Rotas antigas redirecionam corretamente — testado no browser
- [ ] Componentes deprecados nao existem mais no `src/`
- [ ] Dados do usuario intactos na versao canonica
- [ ] Nenhum import quebrado (TypeScript compila sem erros)

---

## Esforo Estimado

**M** (4-8 horas)
- Task 1 (decisao @po): externo, nao contabilizado
- Task 2-4 (mapeamento): ~1h
- Task 5-7 (implementacao): ~2h
- Task 8-9 (testes + validacao): ~2h

---

## Dependencias

- **[BLOQUEANTE]** Decisao do @po sobre qual versao e canonica para Goals e Retirement — deve ocorrer antes do desenvolvimento
- TD-S1-001 e TD-S1-002 devem estar completos (Sprint 1) antes desta story ser iniciada (sprint ordering)

---

## Notas Tecnicas

- Nomes reais dos arquivos a verificar: buscar `Goals*.tsx`, `Retirement*.tsx` em `src/components/`
- Rotas em `src/App.tsx` — buscar por "goals" e "retirement" (case-insensitive)
- Sidebar em `src/components/Layout.tsx` — buscar por "goals" e "retirement" nos itens de nav
- Se a versao v2 possui estado adicional no FinanceContext, verificar se precisa de migracao de dados antes de remover v1
- Referencia: `docs/prd/technical-debt-DRAFT.md` — TD-005, `docs/architecture/technical-debt-assessment.md` — Secao 3 (TD-005)

---

## Decisao de Produto (preencher antes do Sprint 2)

| Feature | Versao Canonica | Motivo | Decidido por | Data |
|---------|----------------|--------|--------------|------|
| Goals | v1 / v2* | | @po | |
| Retirement | v1 / v2* | | @po | |

*Riscar o que nao se aplica
