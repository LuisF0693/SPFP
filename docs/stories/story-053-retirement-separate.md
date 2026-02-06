# STY-053: Separar Aposentadoria de Objetivos

**Epic:** UX Restructure - Sidebar e Navegação
**PRD:** PRD-UX-RESTRUCTURE-SIDEBAR
**Priority:** P1 ALTA
**Effort:** 6h
**Status:** READY

---

## Descrição

Extrair a funcionalidade de planejamento de aposentadoria do componente Objetivos (Goals) para uma página dedicada com rota própria, dando maior destaque e criando um gráfico bonito de projeção.

## User Story

**Como** usuário do SPFP,
**Quero** uma página dedicada para planejamento de aposentadoria,
**Para que** eu possa focar no meu futuro financeiro com ferramentas visuais sofisticadas.

---

## Situação Atual

A funcionalidade de aposentadoria está dentro de `Goals.tsx` usando:
- `RetirementGoalForm.tsx`
- `RetirementDashPlanChart.tsx`
- `RetirementComparison.tsx`
- Tipos em `src/types/retirement.ts`

## Situação Desejada

- Nova rota `/retirement`
- Nova página `Retirement.tsx` (orquestradora)
- Gráfico bonito com 3 cenários de projeção
- Formulário de configuração
- Cálculo de renda passiva
- Remover seção de aposentadoria de `Goals.tsx`

---

## Acceptance Criteria

- [ ] **AC-1:** Nova rota `/retirement` funcionando
- [ ] **AC-2:** Item no sidebar aponta para nova rota
- [ ] **AC-3:** Formulário de configuração de aposentadoria funcional
- [ ] **AC-4:** Gráfico de área com 3 cenários (conservador, moderado, agressivo)
- [ ] **AC-5:** Eixo X mostra anos até aposentadoria
- [ ] **AC-6:** Eixo Y mostra patrimônio acumulado
- [ ] **AC-7:** Tooltip interativo ao hover nos pontos
- [ ] **AC-8:** Gradientes de cores por cenário
- [ ] **AC-9:** Marcador visual do objetivo
- [ ] **AC-10:** Cálculo de renda passiva (regra dos 4%)
- [ ] **AC-11:** Recomendações personalizadas baseadas nos dados
- [ ] **AC-12:** Goals.tsx não tem mais seção de aposentadoria
- [ ] **AC-13:** Responsivo para mobile

---

## Technical Implementation

### Nova Rota:
```typescript
// App.tsx
<Route path="/retirement" element={
  <PrivateRoute>
    <Layout mode="personal">
      <Retirement />
    </Layout>
  </PrivateRoute>
} />
```

### Novo Componente Principal:
```tsx
// src/components/Retirement.tsx
import RetirementGoalForm from './RetirementGoalForm';
import RetirementProjectionChart from './RetirementProjectionChart';
import RetirementSummary from './RetirementSummary';

const Retirement: React.FC = () => {
  const [config, setConfig] = useState<RetirementConfig | null>(null);

  return (
    <div className="space-y-6">
      <h1>🏖️ Planejamento para Aposentadoria</h1>

      <RetirementGoalForm onSave={setConfig} />

      {config && (
        <>
          <RetirementProjectionChart config={config} />
          <RetirementSummary config={config} />
        </>
      )}
    </div>
  );
};
```

### Gráfico de Projeção (Recharts):
```tsx
// src/components/RetirementProjectionChart.tsx
import { AreaChart, Area, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const SCENARIOS = {
  conservative: { rate: 0.06, color: '#3B82F6', label: 'Conservador (6% a.a.)' },
  moderate: { rate: 0.10, color: '#10B981', label: 'Moderado (10% a.a.)' },
  aggressive: { rate: 0.14, color: '#F59E0B', label: 'Agressivo (14% a.a.)' },
};

const RetirementProjectionChart: React.FC<{ config: RetirementConfig }> = ({ config }) => {
  const data = generateProjectionData(config);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4">Projeção de Patrimônio</h2>
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="conservativeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="moderateGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="aggressiveGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="year" label={{ value: 'Anos', position: 'bottom' }} />
          <YAxis
            tickFormatter={(value) => `R$ ${(value / 1000000).toFixed(1)}M`}
            label={{ value: 'Patrimônio', angle: -90, position: 'left' }}
          />
          <Tooltip
            formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR')}`}
            labelFormatter={(year) => `Ano ${year}`}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="conservative"
            stroke="#3B82F6"
            fill="url(#conservativeGradient)"
            name="Conservador"
          />
          <Area
            type="monotone"
            dataKey="moderate"
            stroke="#10B981"
            fill="url(#moderateGradient)"
            name="Moderado"
          />
          <Area
            type="monotone"
            dataKey="aggressive"
            stroke="#F59E0B"
            fill="url(#aggressiveGradient)"
            name="Agressivo"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
```

### Resumo com Renda Passiva:
```tsx
// src/components/RetirementSummary.tsx
const RetirementSummary: React.FC<{ config: RetirementConfig }> = ({ config }) => {
  const projections = calculateProjections(config);

  // Regra dos 4%: renda anual sustentável = patrimônio * 0.04
  const passiveIncome = {
    conservative: projections.conservative.final * 0.04 / 12,
    moderate: projections.moderate.final * 0.04 / 12,
    aggressive: projections.aggressive.final * 0.04 / 12,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <ScenarioCard
        title="Conservador"
        color="blue"
        patrimony={projections.conservative.final}
        monthlyIncome={passiveIncome.conservative}
      />
      <ScenarioCard
        title="Moderado"
        color="green"
        patrimony={projections.moderate.final}
        monthlyIncome={passiveIncome.moderate}
        recommended
      />
      <ScenarioCard
        title="Agressivo"
        color="amber"
        patrimony={projections.aggressive.final}
        monthlyIncome={passiveIncome.aggressive}
      />
    </div>
  );
};
```

---

## Tasks

- [ ] 1. Criar componente `Retirement.tsx` (orquestrador)
- [ ] 2. Adicionar rota `/retirement` em App.tsx
- [ ] 3. Criar/adaptar `RetirementProjectionChart.tsx` com gráfico bonito
- [ ] 4. Criar `RetirementSummary.tsx` com cards de cenários
- [ ] 5. Implementar cálculo de renda passiva (regra 4%)
- [ ] 6. Adicionar gradientes e animações ao gráfico
- [ ] 7. Implementar tooltips interativos
- [ ] 8. Remover seção de aposentadoria de `Goals.tsx`
- [ ] 9. Testar persistência de dados
- [ ] 10. Responsividade mobile

---

## Dependencies

- **Bloqueado por:** STY-051 (Sidebar precisa ter item Aposentadoria)
- **Bloqueia:** Nenhum
- **Reutiliza:** `RetirementGoalForm.tsx`, tipos em `retirement.ts`

---

## Test Cases

| # | Cenário | Resultado Esperado |
|---|---------|-------------------|
| 1 | Acessar /retirement | Página carrega sem erros |
| 2 | Preencher formulário | Gráfico e resumo atualizam |
| 3 | Hover no gráfico | Tooltip mostra valores formatados |
| 4 | Ver renda passiva | Mostra valor mensal por cenário |
| 5 | Goals.tsx | Não tem mais seção de aposentadoria |
| 6 | Mobile | Layout adapta corretamente |

---

## Definition of Done

- [ ] Rota funcionando
- [ ] Gráfico renderiza corretamente
- [ ] 3 cenários calculados
- [ ] Renda passiva calculada
- [ ] Aposentadoria removida de Goals
- [ ] Responsivo
- [ ] Sem erros no console

---

**Created by:** @pm (Morgan)
**Assigned to:** @dev
**Sprint:** UX Restructure - Week 3
