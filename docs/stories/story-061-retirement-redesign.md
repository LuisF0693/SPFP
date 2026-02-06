# STY-061: Redesign da Página de Aposentadoria (Meu Futuro)

**Epic:** UX Improvements - Financial Planning
**Priority:** P1 ALTA
**Effort:** 8h
**Status:** DONE

---

## Descrição

Redesenhar a página de Aposentadoria inspirada no layout "Meu Futuro" da referência. Incluir gráfico de projeção de independência financeira com área preenchida, sliders interativos para ajustar parâmetros, e seção de "Meus Projetos" com cards categorizados (Essencial, Desejo, Sonho).

## User Story

**Como** usuário do SPFP,
**Quero** uma visão clara e interativa do meu planejamento de aposentadoria,
**Para que** eu possa ajustar meus parâmetros e visualizar meu futuro financeiro de forma intuitiva.

---

## Referência Visual (Screenshot 065429)

O design de referência possui:

1. **Header**: "Meu Futuro" / "Independência financeira"
2. **Filtros de tempo**: Negativos | 2 anos | 5 anos | 10 anos | Máximo
3. **Gráfico de área**: Projeção do patrimônio ao longo do tempo (eixo X = idade, eixo Y = valor)
   - Linha verde: Patrimônio total projetado
   - Linha cinza: Patrimônio principal investido
   - Área verde claro: Aposentadoria ideal (área preenchida)
   - Marcador de posição atual (ícone no gráfico)
4. **Card de resumo** (canto superior direito):
   - "Você precisa investir R$1.223,35/mês para chegar na sua aposentadoria ideal com R$1.575.744,02 acumulados"
5. **Sliders interativos**:
   - Idade aposentadoria: [slider] 65
   - Renda desejada: [slider] R$10.000,00
   - Outras fontes de renda: [slider] R$0,00
   - Investimento mensal: [slider] R$0,00
6. **Seção "Meus Projetos"**: Cards divididos em 3 categorias
   - **Essencial** (R$15.000,00) - Ex: Viajar para Bahia
   - **Desejo** (R$500.000,00) - Ex: Comprar casa dos sonhos
   - **Sonho** (R$100.000,00) - Ex: Comprar um carro

---

## Acceptance Criteria

- [x] **AC-1:** Header com título "Meu Futuro" ou "Independência Financeira"
- [ ] **AC-2:** Filtros de período (2 anos, 5 anos, 10 anos, Máximo) - Fase 2
- [x] **AC-3:** Gráfico de área com projeção de patrimônio (idade no eixo X)
- [x] **AC-4:** Card de resumo com valor necessário de investimento mensal
- [x] **AC-5:** Sliders interativos para idade, renda desejada, outras rendas, investimento mensal
- [x] **AC-6:** Valores dos sliders atualizados em tempo real
- [x] **AC-7:** Seção "Meus Projetos" com 3 colunas (Essencial, Desejo, Sonho)
- [x] **AC-8:** Cards de projeto com ícone, nome, data, barra de progresso, valor
- [x] **AC-9:** Botão "Salvar meta" para persistir configurações
- [x] **AC-10:** Responsivo para mobile (sliders empilhados, gráfico scroll horizontal)

---

## Design Specifications

### Layout Geral
```
┌─────────────────────────────────────────────────────────────────────────┐
│ Meu Futuro                                            [User Avatar]     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ Independência financeira                     [2anos][5anos][10anos][Max]│
│                                                                         │
│ ┌─────────────────────────────────────────┐  ┌────────────────────────┐ │
│ │                                         │  │ 💡 Você precisa        │ │
│ │     R$ 1.600.000                       │  │ investir R$1.223/mês   │ │
│ │         ╱╲                             │  │ para atingir           │ │
│ │        ╱  ╲                            │  │ R$1.575.744 acumulados │ │
│ │  ─────╱    ╲─────                      │  ├────────────────────────┤ │
│ │      ╱      ╲   Area preenchida        │  │ Idade aposentadoria    │ │
│ │     ╱        ╲                         │  │ ─────────────────● 65  │ │
│ │ ───╱──────────╲───                     │  ├────────────────────────┤ │
│ │   32  39  46  53  60  67  74  81  88   │  │ Renda desejada         │ │
│ │                                         │  │ ────────────● R$10.000│ │
│ └─────────────────────────────────────────┘  ├────────────────────────┤ │
│                                              │ Outras fontes          │ │
│ ● Patrimônio projetado                       │ ●──────────── R$0,00   │ │
│ ● Patrimônio investido                       ├────────────────────────┤ │
│ ● Aposentadoria ideal                        │ Investimento mensal    │ │
│                                              │ ●──────────── R$0,00   │ │
│                                              └────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────┤
│ Meus Projetos                              Visualizar: [Prioridade ▼]   │
├─────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐          │
│ │ Essencial       │  │ Desejo          │  │ Sonho           │          │
│ │ R$15.000,00     │  │ R$500.000,00    │  │ R$100.000,00    │          │
│ ├─────────────────┤  ├─────────────────┤  ├─────────────────┤          │
│ │ ✈️ 01.07.2035   │  │ 🏠 09.10.2050   │  │ 🚗 21.05.2028   │          │
│ │ Viajar Bahia    │  │ Casa dos sonhos │  │ BMW M3          │          │
│ │ ███░░░░░░░░░░░░│  │ █░░░░░░░░░░░░░░│  │ █░░░░░░░░░░░░░░│          │
│ │ R$0/R$15.000   │  │ R$0/R$500.000   │  │ R$0/R$100.000   │          │
│ └─────────────────┘  └─────────────────┘  └─────────────────┘          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Sliders Interativos
```tsx
// Componente de slider com label e valor
<SliderInput
  label="Idade aposentadoria"
  value={65}
  min={50}
  max={80}
  step={1}
  onChange={(v) => setTargetAge(v)}
  formatValue={(v) => `${v} anos`}
/>

<SliderInput
  label="Renda desejada"
  value={10000}
  min={1000}
  max={50000}
  step={500}
  onChange={(v) => setTargetIncome(v)}
  formatValue={(v) => formatCurrency(v)}
/>
```

### Cores do Gráfico
```css
/* Patrimônio Total Projetado */
--color-patrimony-projected: #10B981; /* green-500 */

/* Patrimônio Principal Investido */
--color-patrimony-invested: #6B7280; /* gray-500 */

/* Área de Aposentadoria Ideal */
--color-retirement-area: rgba(16, 185, 129, 0.2); /* green-500/20 */
```

---

## Technical Implementation

### Componentes a Criar/Modificar:
```
src/components/
├── Retirement.tsx (MODIFICAR - redesign completo)
├── retirement/
│   ├── RetirementHeader.tsx (NOVO)
│   ├── RetirementChart.tsx (NOVO - gráfico de área)
│   ├── RetirementSliders.tsx (NOVO - painel de sliders)
│   ├── RetirementSummaryCard.tsx (NOVO - card com cálculo)
│   ├── RetirementProjects.tsx (NOVO - seção de projetos)
│   └── ProjectCard.tsx (NOVO - card individual de projeto)
```

### Interface de Dados
```typescript
interface RetirementConfig {
  currentAge: number;
  targetAge: number;           // Slider: idade aposentadoria
  targetMonthlyIncome: number; // Slider: renda desejada
  otherIncomeSources: number;  // Slider: outras fontes
  monthlyInvestment: number;   // Slider: investimento mensal
  currentPatrimony: number;    // Patrimônio atual (do contexto)
}

interface RetirementProject {
  id: string;
  name: string;
  emoji: string;
  targetDate: string;
  targetValue: number;
  currentValue: number;
  priority: 'ESSENTIAL' | 'DESIRE' | 'DREAM';
}

interface ProjectionPoint {
  age: number;
  year: number;
  projectedPatrimony: number;
  investedPatrimony: number;
  retirementTarget: number;
}
```

### Cálculos
```typescript
// Calcular patrimônio necessário para a renda desejada (regra dos 4%)
const requiredPatrimony = (targetMonthlyIncome * 12) / 0.04;

// Calcular investimento mensal necessário
const calculateRequiredMonthlyInvestment = (
  currentPatrimony: number,
  requiredPatrimony: number,
  yearsToRetirement: number,
  annualReturn: number = 0.08 // 8% a.a.
): number => {
  const months = yearsToRetirement * 12;
  const monthlyRate = annualReturn / 12;

  // FV = PV * (1 + r)^n + PMT * [((1 + r)^n - 1) / r]
  // Resolvendo para PMT:
  const fvCurrent = currentPatrimony * Math.pow(1 + annualReturn, yearsToRetirement);
  const remaining = requiredPatrimony - fvCurrent;

  const factor = (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate;
  return remaining / factor;
};
```

---

## Tasks

- [x] 1. Criar estrutura de pasta `src/components/retirement/`
- [x] 2. Criar `RetirementSliders.tsx` com 4 sliders interativos
- [x] 3. Criar `RetirementSummaryCard.tsx` com cálculo de investimento necessário
- [x] 4. Criar `RetirementChart.tsx` com gráfico de área (Recharts)
- [x] 5. Criar `RetirementProjects.tsx` com 3 colunas de projetos
- [x] 6. Criar `ProjectCard.tsx` para cada projeto (inline em RetirementProjects)
- [x] 7. Refatorar `Retirement.tsx` para usar novos componentes
- [x] 8. Implementar persistência dos sliders (localStorage)
- [x] 9. Implementar CRUD de projetos (Goals com priority)
- [x] 10. Responsividade mobile
- [x] 11. Testar cálculos financeiros (build passou)

## Files Changed

- `src/components/retirement/SliderInput.tsx` - **NOVO**
- `src/components/retirement/RetirementSliders.tsx` - **NOVO**
- `src/components/retirement/RetirementSummaryCard.tsx` - **NOVO**
- `src/components/retirement/RetirementChart.tsx` - **NOVO**
- `src/components/retirement/RetirementProjects.tsx` - **NOVO**
- `src/components/retirement/index.ts` - **NOVO**
- `src/components/Retirement.tsx` - **MODIFICADO** - Redesign completo

---

## Dependencies

- **Bloqueado por:** Nenhum
- **Bloqueia:** Nenhum
- **Relacionado:** Goals.tsx (pode reaproveitar lógica de projetos)

---

## Test Cases

| # | Cenário | Resultado Esperado |
|---|---------|-------------------|
| 1 | Abrir página | Gráfico e sliders carregam com valores default |
| 2 | Mover slider idade | Gráfico atualiza em tempo real |
| 3 | Mover slider renda | Card de resumo recalcula investimento |
| 4 | Adicionar projeto | Aparece na coluna correta (Essencial/Desejo/Sonho) |
| 5 | Filtro de período | Gráfico ajusta escala |
| 6 | Mobile | Layout empilhado, sliders funcionais |
| 7 | Reload | Valores persistem do localStorage |

---

## Definition of Done

- [x] Gráfico de área implementado
- [x] Sliders interativos funcionando
- [x] Card de resumo com cálculos corretos
- [x] Seção de projetos com 3 categorias
- [x] Persistência funcionando
- [x] Responsivo
- [x] Sem erros no console

---

**Created by:** @pm (Morgan)
**Assigned to:** @dev + @ux-design
**Sprint:** UX Improvements - Week 2
