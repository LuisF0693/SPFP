# STY-062: Redesign das Metas Financeiras (Visão de Orçamento)

**Epic:** UX Improvements - Financial Planning
**Priority:** P1 ALTA
**Effort:** 6h
**Status:** READY

---

## Descrição

Redesenhar a página de Metas Financeiras inspirada no layout de orçamento da referência. Incluir visão geral com gráfico de barras empilhadas (Renda vs Gastos) com toggle "Atual/Com metas", lista de categorias com barras de progresso mostrando gasto atual vs meta, e cards de insights com recomendações.

## User Story

**Como** usuário do SPFP,
**Quero** visualizar minhas metas de gastos por categoria de forma clara,
**Para que** eu possa acompanhar meu orçamento e tomar decisões financeiras melhores.

---

## Referência Visual (Screenshot 065414)

O design de referência possui:

1. **Header com métricas**:
   - Renda média: R$ 7.000,00
   - Gastos médios: R$ 8.800,00
   - Saldo do plano: -R$ 1.800,00

2. **Toggle**: [Atual] [Com metas]

3. **Gráfico de barras empilhadas**:
   - Barra esquerda (verde): Renda R$7.000
   - Barra direita (colorida): Gastos divididos
     - Parte superior (laranja): Despesas não obrigatórias R$3.300
     - Parte inferior (azul): Despesas obrigatórias R$5.500
   - Legenda: Renda | Despesas obrigatórias | Empresa | Despesas não obrigatórias | Projetos | Financiamentos | Dívidas

4. **Card de insight** (amarelo):
   - "Você gasta R$1.800,00 (25,7%) a mais do que ganha. Crie metas para otimizar..."

5. **Card de reserva** (azul):
   - "De acordo com seu estilo de vida atual, a reserva de emergência ideal para sua segurança é de R$25.000,00"

6. **Lista de metas por categoria** (lado direito):
   - Cabeçalho: "Fevereiro de 2026" com navegação < >
   - Toggle: Mensal | Anual
   - Cada categoria:
     - Alimentação: Mês R$0,00 (Restam R$1.475,00) | Meta: R$ 1.475,00
     - Saúde: barra de progresso + valores
     - Casa, Compras, Transporte, Lazer...

---

## Acceptance Criteria

- [ ] **AC-1:** Header com 3 métricas (Renda média, Gastos médios, Saldo)
- [ ] **AC-2:** Toggle "Atual / Com metas" que altera visualização
- [ ] **AC-3:** Gráfico de barras empilhadas (renda vs gastos por categoria)
- [ ] **AC-4:** Card de insight amarelo mostrando déficit/superávit
- [ ] **AC-5:** Card azul com cálculo de reserva de emergência ideal
- [ ] **AC-6:** Lista de categorias com barra de progresso e valores
- [ ] **AC-7:** Navegação de mês (< Fevereiro 2026 >)
- [ ] **AC-8:** Toggle Mensal/Anual para visualização
- [ ] **AC-9:** Cada categoria mostra: gasto atual, restante, meta
- [ ] **AC-10:** Responsivo para mobile

---

## Design Specifications

### Layout Geral
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Renda média        Gastos médios       Saldo do plano                       │
│ R$ 7.000,00        R$ 8.800,00         -R$1.800,00                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ [Atual] [Com metas]                                    🔄                   │
│                                                                             │
│ ┌─────────────────────────────────┐    ┌──────────────────────────────────┐ │
│ │ R$8.800 ┌───────────────────┐   │    │ 💡 Ao cumprir sua lição de casa, │ │
│ │         │░░░░░░ R$3.300 ░░░░│   │    │ você reduzirá por mês R$X...     │ │
│ │ R$7.000 │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│   │    └──────────────────────────────────┘ │
│ │ ┌─────┐ │▓▓▓▓▓▓ R$5.500 ▓▓▓│   │                                         │
│ │ │█████│ │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│   │    < Fevereiro de 2026 >    [Mensal ▼] │
│ │ │█████│ └───────────────────┘   │                                         │
│ │ │█████│                         │    ┌──────────────────────────────────┐ │
│ │ │R$7k │                         │    │ 🛒 Alimentação         R$2.500,00 │ │
│ │ └─────┘                         │    │ ████████████░░░░░░░░             │ │
│ │  Renda    Gastos                │    │ Mês: R$1.025 (Restam R$1.475)    │ │
│ └─────────────────────────────────┘    ├──────────────────────────────────┤ │
│                                        │ 🏥 Saúde               R$1.000,00 │ │
│ ● Renda ● Desp. obrigatórias          │ ██░░░░░░░░░░░░░░░░░░             │ │
│ ● Empresa ● Desp. não obrigatórias    │ Mês: R$200 (Restam R$800)        │ │
│ ● Projetos ● Financiamentos ● Dívidas  ├──────────────────────────────────┤ │
│                                        │ 🏠 Casa                R$1.000,00 │ │
│ ┌─────────────────────────────────┐    │ █░░░░░░░░░░░░░░░░░░░░            │ │
│ │ ⚠️ Você gasta R$1.800 (25,7%)   │    │ Mês: R$100 (Restam R$900)        │ │
│ │ a mais do que ganha. Crie metas │    └──────────────────────────────────┘ │
│ │ para otimizar seus gastos...    │                                         │
│ └─────────────────────────────────┘                                         │
│                                                                             │
│ ┌─────────────────────────────────┐                                         │
│ │ 🛡️ Reserva de emergência ideal  │                                         │
│ │ R$25.000,00                  ✏️ │                                         │
│ └─────────────────────────────────┘                                         │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Componente de Categoria com Meta
```tsx
interface BudgetCategoryRowProps {
  icon: string;
  name: string;
  spent: number;      // Gasto no mês atual
  budgetLimit: number; // Meta/Limite definido
  color: string;
}

const BudgetCategoryRow: React.FC<BudgetCategoryRowProps> = ({
  icon, name, spent, budgetLimit, color
}) => {
  const remaining = Math.max(budgetLimit - spent, 0);
  const progress = Math.min((spent / budgetLimit) * 100, 100);
  const isOverBudget = spent > budgetLimit;

  return (
    <div className="p-4 bg-white/5 rounded-xl">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <span className="font-medium">{name}</span>
        </div>
        <span className="font-bold">{formatCurrency(budgetLimit)}</span>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-2">
        <div
          className={`h-full rounded-full ${isOverBudget ? 'bg-red-500' : ''}`}
          style={{ width: `${progress}%`, backgroundColor: isOverBudget ? undefined : color }}
        />
      </div>

      <div className="flex justify-between text-xs text-gray-400">
        <span>Mês: {formatCurrency(spent)} (Restam {formatCurrency(remaining)})</span>
        <span>Meta: {formatCurrency(budgetLimit)}</span>
      </div>
    </div>
  );
};
```

### Cálculo de Reserva de Emergência
```typescript
// Reserva ideal = 6 meses de gastos médios
const calculateEmergencyFund = (averageMonthlyExpenses: number): number => {
  return averageMonthlyExpenses * 6;
};
```

---

## Technical Implementation

### Componentes a Criar/Modificar:
```
src/components/
├── Goals.tsx (MODIFICAR - adicionar nova visão de orçamento)
├── goals/
│   ├── GoalsOverview.tsx (NOVO - header com métricas)
│   ├── BudgetChart.tsx (NOVO - gráfico de barras empilhadas)
│   ├── BudgetCategoryList.tsx (NOVO - lista de categorias)
│   ├── BudgetCategoryRow.tsx (NOVO - linha individual)
│   ├── InsightCard.tsx (NOVO - card de insight)
│   └── EmergencyFundCard.tsx (NOVO - card de reserva)
```

### Interface de Dados
```typescript
interface BudgetOverview {
  averageIncome: number;
  averageExpenses: number;
  balance: number;
}

interface CategoryBudget {
  categoryId: string;
  icon: string;
  name: string;
  color: string;
  limit: number;        // Meta mensal
  currentSpent: number; // Gasto atual no mês
  group: 'FIXED' | 'VARIABLE' | 'INVESTMENT' | 'INCOME';
}

interface BudgetInsight {
  type: 'DEFICIT' | 'SURPLUS' | 'ON_TRACK';
  value: number;
  percentage: number;
  message: string;
}
```

---

## Tasks

- [ ] 1. Criar estrutura de pasta `src/components/goals/`
- [ ] 2. Criar `GoalsOverview.tsx` com 3 métricas e toggle
- [ ] 3. Criar `BudgetChart.tsx` com gráfico de barras empilhadas
- [ ] 4. Criar `BudgetCategoryList.tsx` com navegação de mês
- [ ] 5. Criar `BudgetCategoryRow.tsx` com barra de progresso
- [ ] 6. Criar `InsightCard.tsx` para alertas
- [ ] 7. Criar `EmergencyFundCard.tsx` com cálculo
- [ ] 8. Integrar toggle Mensal/Anual
- [ ] 9. Refatorar `Goals.tsx` para incluir nova visão
- [ ] 10. Responsividade mobile
- [ ] 11. Testar cálculos de média e progresso

---

## Dependencies

- **Bloqueado por:** Nenhum
- **Bloqueia:** Nenhum
- **Relacionado:** Budget.tsx (pode reaproveitar lógica de categoryBudgets)

---

## Test Cases

| # | Cenário | Resultado Esperado |
|---|---------|-------------------|
| 1 | Abrir página | Métricas calculam corretamente |
| 2 | Toggle Atual/Com metas | Gráfico muda visualização |
| 3 | Navegar mês | Dados atualizam para o mês selecionado |
| 4 | Categoria acima da meta | Barra fica vermelha |
| 5 | Categoria dentro da meta | Barra na cor da categoria |
| 6 | Déficit | Card amarelo aparece com alerta |
| 7 | Mobile | Layout empilhado responsivo |

---

## Definition of Done

- [ ] Header com métricas implementado
- [ ] Gráfico de barras empilhadas funcionando
- [ ] Lista de categorias com progresso
- [ ] Cards de insight e reserva
- [ ] Toggle Atual/Com metas
- [ ] Navegação de mês
- [ ] Responsivo
- [ ] Sem erros no console

---

**Created by:** @pm (Morgan)
**Assigned to:** @dev + @ux-design
**Sprint:** UX Improvements - Week 2
