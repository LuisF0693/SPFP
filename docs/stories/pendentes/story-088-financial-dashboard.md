# STY-088: Dashboard Financeiro

**Epic:** EPIC-002 - Corporate HQ
**PRD:** EPIC-002-Corporate-HQ.md
**Priority:** P0 CRÍTICA
**Effort:** 12h (revisado: +2h para 6 componentes + gráficos)
**Status:** PENDING

---

## Descrição

Implementar dashboard com métricas financeiras da empresa ao clicar no departamento Financeiro do mapa. Exibe receita vs despesa, saldo atual, contas a pagar/receber, fluxo de caixa projetado e DRE simplificado.

## User Story

**Como** empresário usuário do SPFP,
**Quero** acessar um dashboard financeiro completo ao clicar no departamento Financeiro,
**Para que** eu tenha visão clara da saúde financeira da minha empresa.

---

## Layout do Dashboard

```
+------------------------------------------------------------------+
| FINANCEIRO                                           [X] Fechar  |
+------------------------------------------------------------------+
|                                                                  |
|  💰 Saldo Atual        📈 Receita Mês      📉 Despesa Mês        |
|  R$ 45.230,00          R$ 28.500,00        R$ 18.200,00          |
|                                                                  |
+------------------------------------------------------------------+
|  [Gráfico Receita vs Despesa - últimos 6 meses]                  |
+------------------------------------------------------------------+
|                                                                  |
|  Contas a Pagar (5)              Contas a Receber (3)            |
|  - Aluguel    R$ 2.500  15/02    - Cliente A  R$ 5.000  20/02   |
|  - Internet   R$ 200    20/02    - Cliente B  R$ 3.200  25/02   |
|                                                                  |
+------------------------------------------------------------------+
|  DRE Simplificado                                                |
|  Receita: R$ 28.500                                              |
|  (-) Custos: R$ 8.500                                            |
|  (-) Despesas: R$ 9.700                                          |
|  = Lucro: R$ 10.300                                              |
+------------------------------------------------------------------+
```

---

## Acceptance Criteria

- [ ] **AC-003.1:** Modal/Drawer abre ao clicar em "Financeiro" no mapa
- [ ] **AC-003.2:** Gráfico de Receita vs Despesa (barras mensal, últimos 6 meses)
- [ ] **AC-003.3:** Saldo atual em card de destaque com indicador de tendência
- [ ] **AC-003.4:** Lista de Contas a Pagar com vencimentos ordenados por data
- [ ] **AC-003.5:** Lista de Contas a Receber com datas ordenadas
- [ ] **AC-003.6:** Fluxo de caixa projetado (próximos 3 meses, linha)
- [ ] **AC-003.7:** DRE simplificado (receita - custos - despesas = lucro)
- [ ] **AC-003.8:** Filtro por período (mês atual, trimestre, ano)

---

## Technical Implementation

### Componentes
```typescript
interface FinancialDashboardProps {
  onClose: () => void;
}

// Sub-componentes
const SaldoCard: React.FC<{ value: number; trend: 'up' | 'down' | 'stable' }>;
const ReceitaDespesaChart: React.FC<{ data: MonthlyData[] }>;
const ContasList: React.FC<{ type: 'pagar' | 'receber'; items: Conta[] }>;
const FluxoCaixaChart: React.FC<{ projections: Projection[] }>;
const DRESummary: React.FC<{ dre: DREData }>;
```

### Estrutura de Arquivos
```
src/components/corporate/dashboards/
├── FinancialDashboard.tsx
├── SaldoCard.tsx
├── ReceitaDespesaChart.tsx
├── ContasList.tsx
├── FluxoCaixaChart.tsx
└── DRESummary.tsx
```

### Integração com Dados Existentes
```typescript
// Usar dados do FinanceContext existente
import { useFinance } from '@/context/FinanceContext';

const FinancialDashboard: React.FC<FinancialDashboardProps> = ({ onClose }) => {
  const { accounts, transactions, goals } = useFinance();

  // Calcular métricas
  const saldoAtual = calculateTotalBalance(accounts);
  const receitaMes = calculateMonthlyIncome(transactions);
  const despesaMes = calculateMonthlyExpenses(transactions);
  const contasPagar = getUpcomingBills(transactions);
  const contasReceber = getUpcomingIncome(transactions);

  // ...
};
```

---

## Tasks

- [ ] 1. Criar pasta `src/components/corporate/dashboards/`
- [ ] 2. Criar componente `FinancialDashboard.tsx` com layout
- [ ] 3. Criar componente `SaldoCard.tsx` com indicador de tendência
- [ ] 4. Criar componente `ReceitaDespesaChart.tsx` usando Recharts
- [ ] 5. Criar componente `ContasList.tsx` para pagar e receber
- [ ] 6. Criar componente `FluxoCaixaChart.tsx` com projeções
- [ ] 7. Criar componente `DRESummary.tsx` com cálculos
- [ ] 8. Implementar filtro por período
- [ ] 9. Integrar com FinanceContext para dados reais
- [ ] 10. Conectar com DepartmentModal no OfficeMap
- [ ] 11. Testar responsividade do dashboard
- [ ] 12. Testar cálculos e formatação de moeda

---

## Dependencies

- **Bloqueado por:** STY-086 (Mapa do Escritório)
- **Bloqueia:** Nenhum

---

## Test Cases

| # | Cenário | Passos | Resultado Esperado |
|---|---------|--------|-------------------|
| 1 | Abrir dashboard | Clicar em "Financeiro" | Modal abre com métricas |
| 2 | Saldo visível | Verificar card principal | Saldo atual com tendência |
| 3 | Gráfico receita/despesa | Verificar gráfico de barras | 6 meses de dados visíveis |
| 4 | Contas a pagar | Verificar lista | Vencimentos ordenados |
| 5 | Contas a receber | Verificar lista | Datas ordenadas |
| 6 | Fluxo caixa | Verificar gráfico de linha | 3 meses projetados |
| 7 | DRE | Verificar resumo | Cálculo correto do lucro |
| 8 | Filtro período | Selecionar "Trimestre" | Dados atualizados |
| 9 | Fechar modal | Clicar no X | Modal fecha |
| 10 | Dados reais | Verificar conexão | Dados do FinanceContext |

---

## Definition of Done

- [ ] Código implementado e revisado
- [ ] Todos os 8 ACs passando
- [ ] Gráficos renderizando corretamente (Recharts)
- [ ] Cálculos financeiros corretos
- [ ] Formatação de moeda (BRL)
- [ ] Responsividade verificada
- [ ] Integração com FinanceContext funcionando
- [ ] PR aprovado

---

## File List

```
Created:
- src/components/corporate/dashboards/FinancialDashboard.tsx
- src/components/corporate/dashboards/SaldoCard.tsx
- src/components/corporate/dashboards/ReceitaDespesaChart.tsx
- src/components/corporate/dashboards/ContasList.tsx
- src/components/corporate/dashboards/FluxoCaixaChart.tsx
- src/components/corporate/dashboards/DRESummary.tsx

Modified:
- src/components/corporate/DepartmentModal.tsx (integrar dashboard)
```

---

**Created by:** @pm (Morgan)
**Assigned to:** @dev
**Sprint:** EPIC-002 Sprint 6 (Dashboards)