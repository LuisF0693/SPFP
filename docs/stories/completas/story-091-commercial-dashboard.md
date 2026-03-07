# STY-091: Dashboard Comercial (Pipeline de Vendas)

**Epic:** EPIC-002 - Corporate HQ
**PRD:** EPIC-002-Corporate-HQ.md
**Priority:** P1 ALTA
**Effort:** 10h
**Status:** PENDING

---

## Descrição

Implementar dashboard com pipeline de vendas visual, gestão de leads com drag & drop entre estágios, valor total por estágio, taxa de conversão e acompanhamento de metas comerciais.

## User Story

**Como** empresário usuário do SPFP,
**Quero** visualizar e gerenciar meu pipeline de vendas de forma interativa,
**Para que** eu acompanhe o progresso comercial e identifique oportunidades.

---

## Layout do Dashboard

```
+------------------------------------------------------------------+
| COMERCIAL                                            [X] Fechar  |
+------------------------------------------------------------------+
| Meta: R$ 50.000    Realizado: R$ 32.500 (65%)    [+ Novo Lead]   |
+------------------------------------------------------------------+
| Prospecção | Qualificação | Proposta | Negociação | Fechado      |
|   (12)     |     (5)      |   (3)    |    (2)     |   (4)        |
| R$ 48.000  |  R$ 22.000   | R$ 15.000|  R$ 8.000  | R$ 32.500    |
|------------|--------------|----------|------------|--------------|
| [Lead A]   | [Lead E]     | [Lead H] | [Lead J]   | [Lead L] ✓   |
| [Lead B]   | [Lead F]     | [Lead I] | [Lead K]   | [Lead M] ✓   |
| [Lead C]   | [Lead G]     |          |            | ...          |
| [Lead D]   |              |          |            |              |
+------------------------------------------------------------------+
```

---

## Acceptance Criteria

- [ ] **AC-006.1:** Modal/Drawer abre ao clicar em "Comercial" no mapa
- [ ] **AC-006.2:** Pipeline visual com 5 estágios: Prospecção → Qualificação → Proposta → Negociação → Fechado
- [ ] **AC-006.3:** Adicionar novo lead (nome, empresa, contato, valor, estágio)
- [ ] **AC-006.4:** Mover lead entre estágios via drag & drop
- [ ] **AC-006.5:** Valor total agregado por estágio (soma dos valores dos leads)
- [ ] **AC-006.6:** Taxa de conversão entre estágios (funil visual)
- [ ] **AC-006.7:** Meta do mês vs Realizado (barra de progresso)
- [ ] **AC-006.8:** Detalhes do lead ao clicar (modal expandível)

---

## Estágios do Pipeline

| Estágio | Cor | Probabilidade | Descrição |
|---------|-----|---------------|-----------|
| Prospecção | Slate | 10% | Lead identificado, sem contato |
| Qualificação | Blue | 30% | Contato feito, avaliando fit |
| Proposta | Violet | 50% | Proposta enviada |
| Negociação | Amber | 70% | Negociando termos |
| Fechado Won | Green | 100% | Negócio fechado |
| Fechado Lost | Red | 0% | Negócio perdido |

---

## Technical Implementation

### Modelo de Dados
```typescript
interface SalesLead {
  id: string;
  user_id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  stage: 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  value: number;
  probability: number; // 0-100%
  source?: string;
  notes?: string;
  next_action?: string;
  next_action_date?: string;
  position: number;
  created_at: string;
  updated_at: string;
  closed_at?: string;
}

interface SalesGoal {
  id: string;
  user_id: string;
  month: string; // YYYY-MM-01
  target_value: number;
  created_at: string;
}

type LeadStage = 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';

const STAGE_CONFIG: Record<LeadStage, { label: string; color: string; probability: number }> = {
  prospecting: { label: 'Prospecção', color: 'slate', probability: 10 },
  qualification: { label: 'Qualificação', color: 'blue', probability: 30 },
  proposal: { label: 'Proposta', color: 'violet', probability: 50 },
  negotiation: { label: 'Negociação', color: 'amber', probability: 70 },
  closed_won: { label: 'Fechado', color: 'green', probability: 100 },
  closed_lost: { label: 'Perdido', color: 'red', probability: 0 }
};
```

### Estrutura de Arquivos
```
src/components/corporate/dashboards/
├── CommercialDashboard.tsx
├── SalesPipeline.tsx
├── PipelineColumn.tsx
├── LeadCard.tsx
├── CreateLeadModal.tsx
├── LeadDetailModal.tsx
├── SalesGoalProgress.tsx
└── ConversionFunnel.tsx
```

### Componente Base
```tsx
import { DndContext, DragEndEvent } from '@dnd-kit/core';

const SalesPipeline: React.FC = () => {
  const [leads, setLeads] = useState<SalesLead[]>([]);
  const [goals, setGoals] = useState<SalesGoal[]>([]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const leadId = active.id as string;
    const newStage = over.id as LeadStage;

    // Atualizar estágio do lead
    updateLeadStage(leadId, newStage);
  };

  // Calcular valores por estágio
  const stageValues = useMemo(() => {
    return STAGES.reduce((acc, stage) => {
      acc[stage] = leads
        .filter(l => l.stage === stage)
        .reduce((sum, l) => sum + l.value, 0);
      return acc;
    }, {} as Record<LeadStage, number>);
  }, [leads]);

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="flex gap-2 h-full overflow-x-auto">
        {STAGES.map(stage => (
          <PipelineColumn
            key={stage}
            stage={stage}
            leads={leads.filter(l => l.stage === stage)}
            totalValue={stageValues[stage]}
          />
        ))}
      </div>
    </DndContext>
  );
};
```

---

## Tasks

- [ ] 1. Criar componente `CommercialDashboard.tsx` com layout
- [ ] 2. Criar componente `SalesPipeline.tsx` com DndContext
- [ ] 3. Criar componente `PipelineColumn.tsx` como droppable
- [ ] 4. Criar componente `LeadCard.tsx` como draggable
- [ ] 5. Criar componente `CreateLeadModal.tsx`
- [ ] 6. Criar componente `LeadDetailModal.tsx`
- [ ] 7. Criar componente `SalesGoalProgress.tsx` (barra de meta)
- [ ] 8. Criar componente `ConversionFunnel.tsx` (opcional, fase 2)
- [ ] 9. Implementar drag & drop entre estágios
- [ ] 10. Implementar cálculo de valores por estágio
- [ ] 11. Implementar taxa de conversão
- [ ] 12. Criar tabelas `sales_leads` e `sales_goals` no Supabase
- [ ] 13. Implementar RLS para ambas as tabelas
- [ ] 14. Testar fluxo completo

---

## Dependencies

- **Bloqueado por:** STY-086 (Mapa do Escritório)
- **Bloqueia:** Nenhum

---

## Test Cases

| # | Cenário | Passos | Resultado Esperado |
|---|---------|--------|-------------------|
| 1 | Abrir dashboard | Clicar em "Comercial" | Modal abre com pipeline |
| 2 | Ver estágios | Verificar colunas | 5 estágios visíveis |
| 3 | Criar lead | Clicar "+ Novo Lead", preencher | Lead aparece no estágio inicial |
| 4 | Mover lead | Arrastar para próximo estágio | Estágio atualizado |
| 5 | Valor total | Verificar cabeçalho | Soma correta dos valores |
| 6 | Meta vs realizado | Verificar barra | Porcentagem correta |
| 7 | Detalhes lead | Clicar em card | Modal com informações |
| 8 | Fechar ganho | Mover para "Fechado" | Contabiliza no realizado |
| 9 | Fechar perdido | Mover para "Perdido" | Não contabiliza |
| 10 | Mobile | Testar em tela pequena | Pipeline scrolla horizontalmente |

---

## Database Schema

```sql
CREATE TABLE sales_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  name VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  stage VARCHAR(20) NOT NULL DEFAULT 'prospecting',
  value DECIMAL(18, 2) NOT NULL DEFAULT 0,
  probability INTEGER NOT NULL DEFAULT 0,
  source VARCHAR(100),
  notes TEXT,
  next_action TEXT,
  next_action_date DATE,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at TIMESTAMPTZ
);

CREATE TABLE sales_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  month DATE NOT NULL, -- Primeiro dia do mês
  target_value DECIMAL(18, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, month)
);

ALTER TABLE sales_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own leads"
  ON sales_leads FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own goals"
  ON sales_goals FOR ALL
  USING (auth.uid() = user_id);

-- Índices
CREATE INDEX idx_sales_leads_stage ON sales_leads(user_id, stage);
CREATE INDEX idx_sales_goals_month ON sales_goals(user_id, month);
```

---

## Definition of Done

- [ ] Código implementado e revisado
- [ ] Todos os 8 ACs passando
- [ ] Drag & drop funcionando
- [ ] Cálculos de valor corretos
- [ ] Meta vs realizado atualizando
- [ ] Persistência no Supabase
- [ ] PR aprovado

---

## File List

```
Created:
- src/components/corporate/dashboards/CommercialDashboard.tsx
- src/components/corporate/dashboards/SalesPipeline.tsx
- src/components/corporate/dashboards/PipelineColumn.tsx
- src/components/corporate/dashboards/LeadCard.tsx
- src/components/corporate/dashboards/CreateLeadModal.tsx
- src/components/corporate/dashboards/LeadDetailModal.tsx
- src/components/corporate/dashboards/SalesGoalProgress.tsx
- src/components/corporate/dashboards/ConversionFunnel.tsx

Modified:
- src/components/corporate/DepartmentModal.tsx
```

---

**Created by:** @pm (Morgan)
**Assigned to:** @dev
**Sprint:** EPIC-002 Sprint 6 (Dashboards)