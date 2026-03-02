# EPIC-007 — Relatórios v2

## Objetivo
Evoluir o módulo de Relatórios com filtros avançados, PDF enriquecido com gráficos e export CSV customizável.

## Stories

| Story | Título | Status | Prioridade |
|-------|--------|--------|------------|
| 7.1 | Filtros avançados no relatório | Pending | Alta |
| 7.2 | PDF melhorado com gráficos e resumo | Pending | Alta |
| 7.3 | Export CSV personalizado | Pending | Média |

## Dependências
- `src/components/Reports.tsx` — componente principal
- `src/services/pdfService.ts` — geração de PDF
- `src/services/csvService.ts` — export CSV
- `src/context/FinanceContext.tsx` — dados financeiros

## Resultado Esperado
- Filtros por conta, categoria, tipo e período customizado funcionando em tempo real
- PDF exportado com gráficos Recharts, logo SPFP e resumo executivo
- CSV com seleção de colunas e período antes de exportar
