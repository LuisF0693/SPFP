# STY-054: Implementar Aba de Aquisição

**Epic:** UX Restructure - Sidebar e Navegação
**PRD:** PRD-UX-RESTRUCTURE-SIDEBAR
**Priority:** P1 ALTA
**Effort:** 10h
**Status:** READY

---

## Descrição

Criar nova página para ajudar usuários a decidir a melhor forma de adquirir bens de alto valor (imóveis, veículos), comparando: compra à vista, financiamento e consórcio.

## User Story

**Como** usuário do SPFP,
**Quero** uma ferramenta que compare formas de aquisição de bens,
**Para que** eu tome decisões financeiras mais inteligentes ao comprar imóvel ou carro.

---

## Acceptance Criteria

- [ ] **AC-1:** Nova rota `/acquisition` funcionando
- [ ] **AC-2:** Seletor de tipo de bem: Imóvel, Veículo
- [ ] **AC-3:** Formulário de entrada com todos os campos necessários
- [ ] **AC-4:** Cálculo automático de custo total para cada cenário
- [ ] **AC-5:** Tabela comparativa dos 3 cenários
- [ ] **AC-6:** Gráfico de barras comparando custo total
- [ ] **AC-7:** Indicador visual da "Melhor Opção"
- [ ] **AC-8:** Explicação de cada cenário
- [ ] **AC-9:** Responsivo para mobile
- [ ] **AC-10:** Dados do formulário persistem localmente

---

## Cenários de Comparação

### 1. Compra à Vista
- **Custo Total:** Valor do bem
- **Vantagem:** Sem juros, poder de negociação (desconto ~10%)
- **Desvantagem:** Imobiliza capital

### 2. Financiamento
- **Custo Total:** Entrada + (Parcela × Prazo) + Juros
- **Fórmula:** Sistema PRICE ou SAC
- **Inputs:** Valor, entrada, taxa a.a., prazo (meses)

### 3. Consórcio
- **Custo Total:** (Parcela × Prazo) + Taxa administração
- **Vantagem:** Sem juros, disciplina de poupança
- **Desvantagem:** Não tem o bem imediatamente

---

## Technical Implementation

### Nova Rota:
```typescript
// App.tsx
<Route path="/acquisition" element={
  <PrivateRoute>
    <Layout mode="personal">
      <Acquisition />
    </Layout>
  </PrivateRoute>
} />
```

### Interface de Dados:
```typescript
// src/types/acquisition.ts
interface AcquisitionInput {
  assetType: 'REAL_ESTATE' | 'VEHICLE';
  assetValue: number;
  availableDownPayment: number;

  // Financiamento
  financingRate: number; // taxa anual
  financingTerm: number; // meses
  financingSystem: 'PRICE' | 'SAC';

  // Consórcio
  consortiumAdminRate: number; // taxa administração total
  consortiumTerm: number; // meses
}

interface AcquisitionScenario {
  type: 'CASH' | 'FINANCING' | 'CONSORTIUM';
  totalCost: number;
  monthlyPayment: number;
  term: number; // meses
  effectiveRate: number; // custo efetivo
  pros: string[];
  cons: string[];
}

interface AcquisitionComparison {
  input: AcquisitionInput;
  scenarios: AcquisitionScenario[];
  recommendation: 'CASH' | 'FINANCING' | 'CONSORTIUM';
  recommendationReason: string;
}
```

### Componente Principal:
```tsx
// src/components/Acquisition.tsx
const Acquisition: React.FC = () => {
  const [input, setInput] = useState<AcquisitionInput | null>(null);
  const [comparison, setComparison] = useState<AcquisitionComparison | null>(null);

  const handleCalculate = (data: AcquisitionInput) => {
    setInput(data);
    const result = calculateComparison(data);
    setComparison(result);
  };

  return (
    <div className="space-y-6">
      <h1>🏠 Análise de Aquisição</h1>
      <p className="text-gray-600">
        Compare as melhores formas de adquirir seu imóvel ou veículo
      </p>

      <AcquisitionForm onSubmit={handleCalculate} />

      {comparison && (
        <>
          <AcquisitionComparisonTable comparison={comparison} />
          <AcquisitionChart comparison={comparison} />
          <AcquisitionRecommendation comparison={comparison} />
        </>
      )}
    </div>
  );
};
```

### Formulário:
```tsx
// src/components/acquisition/AcquisitionForm.tsx
const AcquisitionForm: React.FC<{ onSubmit: (data: AcquisitionInput) => void }> = ({ onSubmit }) => {
  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tipo de Bem */}
        <div>
          <label>Tipo de Bem</label>
          <select>
            <option value="REAL_ESTATE">🏠 Imóvel</option>
            <option value="VEHICLE">🚗 Veículo</option>
          </select>
        </div>

        {/* Valor do Bem */}
        <div>
          <label>Valor do Bem</label>
          <input type="number" placeholder="R$ 500.000,00" />
        </div>

        {/* Entrada Disponível */}
        <div>
          <label>Entrada Disponível</label>
          <input type="number" placeholder="R$ 100.000,00" />
        </div>

        {/* Financiamento */}
        <fieldset className="col-span-2 border rounded p-4">
          <legend>Financiamento</legend>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label>Taxa Anual (%)</label>
              <input type="number" step="0.1" placeholder="12.5" />
            </div>
            <div>
              <label>Prazo (meses)</label>
              <input type="number" placeholder="360" />
            </div>
            <div>
              <label>Sistema</label>
              <select>
                <option value="PRICE">PRICE</option>
                <option value="SAC">SAC</option>
              </select>
            </div>
          </div>
        </fieldset>

        {/* Consórcio */}
        <fieldset className="col-span-2 border rounded p-4">
          <legend>Consórcio</legend>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label>Taxa Administração Total (%)</label>
              <input type="number" step="0.1" placeholder="15" />
            </div>
            <div>
              <label>Prazo (meses)</label>
              <input type="number" placeholder="180" />
            </div>
          </div>
        </fieldset>
      </div>

      <button type="submit" className="mt-6 w-full btn-primary">
        Calcular Comparação
      </button>
    </form>
  );
};
```

### Tabela Comparativa:
```tsx
// src/components/acquisition/AcquisitionComparisonTable.tsx
const AcquisitionComparisonTable: React.FC<{ comparison: AcquisitionComparison }> = ({ comparison }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr>
            <th>Cenário</th>
            <th>Custo Total</th>
            <th>Parcela Mensal</th>
            <th>Prazo</th>
            <th>Custo Efetivo</th>
          </tr>
        </thead>
        <tbody>
          {comparison.scenarios.map(scenario => (
            <tr key={scenario.type} className={scenario.type === comparison.recommendation ? 'bg-green-50' : ''}>
              <td>
                {scenario.type === 'CASH' && '💵 À Vista'}
                {scenario.type === 'FINANCING' && '🏦 Financiamento'}
                {scenario.type === 'CONSORTIUM' && '🤝 Consórcio'}
                {scenario.type === comparison.recommendation && ' ⭐'}
              </td>
              <td>R$ {scenario.totalCost.toLocaleString('pt-BR')}</td>
              <td>{scenario.monthlyPayment > 0 ? `R$ ${scenario.monthlyPayment.toLocaleString('pt-BR')}` : '-'}</td>
              <td>{scenario.term > 0 ? `${scenario.term} meses` : 'Imediato'}</td>
              <td>{(scenario.effectiveRate * 100).toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

### Gráfico de Barras:
```tsx
// src/components/acquisition/AcquisitionChart.tsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = {
  CASH: '#10B981',      // Verde
  FINANCING: '#EF4444', // Vermelho
  CONSORTIUM: '#3B82F6', // Azul
};

const AcquisitionChart: React.FC<{ comparison: AcquisitionComparison }> = ({ comparison }) => {
  const data = comparison.scenarios.map(s => ({
    name: s.type === 'CASH' ? 'À Vista' : s.type === 'FINANCING' ? 'Financiamento' : 'Consórcio',
    value: s.totalCost,
    type: s.type,
  }));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
      <h3 className="text-lg font-bold mb-4">Comparação de Custo Total</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`} />
          <Tooltip formatter={(v: number) => `R$ ${v.toLocaleString('pt-BR')}`} />
          <Bar dataKey="value">
            {data.map((entry, index) => (
              <Cell key={index} fill={COLORS[entry.type as keyof typeof COLORS]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
```

### Lógica de Cálculo:
```typescript
// src/services/acquisitionService.ts
export function calculateComparison(input: AcquisitionInput): AcquisitionComparison {
  const scenarios: AcquisitionScenario[] = [];

  // 1. À Vista (com desconto de 10%)
  const cashDiscount = 0.10;
  const cashTotal = input.assetValue * (1 - cashDiscount);
  scenarios.push({
    type: 'CASH',
    totalCost: cashTotal,
    monthlyPayment: 0,
    term: 0,
    effectiveRate: 0,
    pros: ['Sem juros', 'Desconto de 10%', 'Propriedade imediata'],
    cons: ['Imobiliza capital', 'Perde rendimentos do dinheiro'],
  });

  // 2. Financiamento (Sistema PRICE)
  const monthlyRate = input.financingRate / 12 / 100;
  const n = input.financingTerm;
  const pv = input.assetValue - input.availableDownPayment;

  // PMT = PV * [r(1+r)^n] / [(1+r)^n - 1]
  const pmt = pv * (monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
  const financingTotal = input.availableDownPayment + (pmt * n);

  scenarios.push({
    type: 'FINANCING',
    totalCost: financingTotal,
    monthlyPayment: pmt,
    term: n,
    effectiveRate: (financingTotal / input.assetValue) - 1,
    pros: ['Possui o bem imediatamente', 'Parcelas fixas (PRICE)'],
    cons: ['Juros altos', 'Risco de inadimplência'],
  });

  // 3. Consórcio
  const consortiumTotal = input.assetValue * (1 + input.consortiumAdminRate / 100);
  const consortiumMonthly = consortiumTotal / input.consortiumTerm;

  scenarios.push({
    type: 'CONSORTIUM',
    totalCost: consortiumTotal,
    monthlyPayment: consortiumMonthly,
    term: input.consortiumTerm,
    effectiveRate: input.consortiumAdminRate / 100,
    pros: ['Sem juros, apenas taxa admin', 'Disciplina de poupança'],
    cons: ['Não tem o bem imediatamente', 'Depende de sorteio/lance'],
  });

  // Determinar recomendação
  const sorted = [...scenarios].sort((a, b) => a.totalCost - b.totalCost);
  const recommendation = sorted[0].type;
  const recommendationReason = getRecommendationReason(recommendation, input);

  return {
    input,
    scenarios,
    recommendation,
    recommendationReason,
  };
}
```

---

## Tasks

- [ ] 1. Criar tipos em `src/types/acquisition.ts`
- [ ] 2. Criar serviço `acquisitionService.ts` com cálculos
- [ ] 3. Criar componente `Acquisition.tsx` (orquestrador)
- [ ] 4. Criar `AcquisitionForm.tsx`
- [ ] 5. Criar `AcquisitionComparisonTable.tsx`
- [ ] 6. Criar `AcquisitionChart.tsx` (gráfico de barras)
- [ ] 7. Criar `AcquisitionRecommendation.tsx`
- [ ] 8. Adicionar rota `/acquisition` em App.tsx
- [ ] 9. Persistir dados no localStorage
- [ ] 10. Responsividade mobile
- [ ] 11. Testar cálculos com valores reais

---

## Dependencies

- **Bloqueado por:** STY-051 (Sidebar precisa ter item Aquisição)
- **Bloqueia:** Nenhum
- **Reutiliza:** Componentes de assets existentes (`src/types/assets.ts`)

---

## Test Cases

| # | Cenário | Resultado Esperado |
|---|---------|-------------------|
| 1 | Imóvel R$ 500k, entrada R$ 100k | Calcula 3 cenários corretamente |
| 2 | Veículo R$ 80k | Calcula com taxas apropriadas |
| 3 | À vista mais barato | Indica como melhor opção |
| 4 | Sem entrada | Financiamento e consórcio somente |
| 5 | Mobile | Layout responsivo |
| 6 | Persistência | Dados salvos no localStorage |

---

## Definition of Done

- [ ] Rota funcionando
- [ ] Formulário captura todos os inputs
- [ ] Cálculos corretos
- [ ] Tabela comparativa clara
- [ ] Gráfico de barras renderiza
- [ ] Recomendação exibida
- [ ] Responsivo
- [ ] Sem erros no console

---

**Created by:** @pm (Morgan)
**Assigned to:** @dev
**Sprint:** UX Restructure - Week 3
