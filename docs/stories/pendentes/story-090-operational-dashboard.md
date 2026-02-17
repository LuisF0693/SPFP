# STY-090: Dashboard Operacional (Kanban)

**Epic:** EPIC-002 - Corporate HQ
**PRD:** EPIC-002-Corporate-HQ.md
**Priority:** P1 ALTA
**Effort:** 10h
**Status:** PENDING

---

## Descrição

Implementar dashboard com gestão de tarefas e processos operacionais usando Kanban board, com drag & drop entre colunas, criação de tarefas, filtros por prioridade e alertas visuais para vencimentos.

## User Story

**Como** empresário usuário do SPFP,
**Quero** gerenciar tarefas operacionais em um Kanban board visual,
**Para que** eu acompanhe o progresso das atividades da empresa.

---

## Layout do Dashboard

```
+------------------------------------------------------------------+
| OPERACIONAL                                          [X] Fechar  |
+------------------------------------------------------------------+
| [+ Nova Tarefa]                      Filtro: [Todas ▼]            |
+------------------------------------------------------------------+
|   A FAZER (4)    |  EM PROGRESSO (2)  |   CONCLUÍDO (8)          |
|------------------|--------------------|-----------------------   |
| [Tarefa 1]  🔴   | [Tarefa 5]    🟡   | [Tarefa 9]    ✓         |
| [Tarefa 2]  🟡   | [Tarefa 6]    🟢   | [Tarefa 10]   ✓         |
| [Tarefa 3]  🟢   |                    | ...                      |
| [Tarefa 4]  🔴   |                    |                          |
+------------------------------------------------------------------+
```

---

## Acceptance Criteria

- [ ] **AC-005.1:** Modal/Drawer abre ao clicar em "Operacional" no mapa
- [ ] **AC-005.2:** Kanban board com 3 colunas: A Fazer, Em Progresso, Concluído
- [ ] **AC-005.3:** Criar nova tarefa (título, descrição, prioridade, responsável)
- [ ] **AC-005.4:** Drag & drop entre colunas funcional
- [ ] **AC-005.5:** Filtro por prioridade (Alta 🔴, Média 🟡, Baixa 🟢)
- [ ] **AC-005.6:** Contador de tarefas por coluna
- [ ] **AC-005.7:** Data de vencimento com alerta visual (vermelho se vencida, amarelo se próxima)

---

## Prioridades Visuais

| Prioridade | Cor | Ícone | Descrição |
|------------|-----|-------|-----------|
| Alta | Vermelho | 🔴 | Urgente, precisa de atenção imediata |
| Média | Amarelo | 🟡 | Importante, mas não urgente |
| Baixa | Verde | 🟢 | Pode esperar |

---

## Technical Implementation

### Modelo de Dados
```typescript
interface OperationalTask {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'completed';
  priority: 'high' | 'medium' | 'low';
  assignee?: string;
  due_date?: string;
  completed_at?: string;
  position: number;
  created_at: string;
  updated_at: string;
}

type TaskStatus = 'todo' | 'in_progress' | 'completed';
type TaskPriority = 'high' | 'medium' | 'low';

const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string }> = {
  todo: { label: 'A Fazer', color: 'slate' },
  in_progress: { label: 'Em Progresso', color: 'blue' },
  completed: { label: 'Concluído', color: 'green' }
};

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string; icon: string }> = {
  high: { label: 'Alta', color: 'red', icon: '🔴' },
  medium: { label: 'Média', color: 'amber', icon: '🟡' },
  low: { label: 'Baixa', color: 'green', icon: '🟢' }
};
```

### Biblioteca de Drag & Drop
**Opção recomendada:** `@dnd-kit/core` + `@dnd-kit/sortable`
- Moderno, mantido ativamente
- Funciona bem com React 18+
- Melhor performance que react-beautiful-dnd
- Suporta touch para mobile

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

### Estrutura de Arquivos
```
src/components/corporate/dashboards/
├── OperationalDashboard.tsx
├── KanbanBoard.tsx
├── KanbanColumn.tsx
├── TaskCard.tsx
├── CreateTaskModal.tsx
└── TaskDetailModal.tsx
```

### Componente Base
```tsx
import { DndContext, DragEndEvent } from '@dnd-kit/core';

const KanbanBoard: React.FC = () => {
  const [tasks, setTasks] = useState<OperationalTask[]>([]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as TaskStatus;

    // Atualizar status da tarefa
    updateTaskStatus(taskId, newStatus);
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 h-full">
        <KanbanColumn status="todo" tasks={tasks.filter(t => t.status === 'todo')} />
        <KanbanColumn status="in_progress" tasks={tasks.filter(t => t.status === 'in_progress')} />
        <KanbanColumn status="completed" tasks={tasks.filter(t => t.status === 'completed')} />
      </div>
    </DndContext>
  );
};
```

---

## Tasks

- [ ] 1. Instalar `@dnd-kit/core` e dependências
- [ ] 2. Criar componente `OperationalDashboard.tsx` com layout
- [ ] 3. Criar componente `KanbanBoard.tsx` com DndContext
- [ ] 4. Criar componente `KanbanColumn.tsx` como droppable
- [ ] 5. Criar componente `TaskCard.tsx` como draggable
- [ ] 6. Criar componente `CreateTaskModal.tsx`
- [ ] 7. Criar componente `TaskDetailModal.tsx`
- [ ] 8. Implementar drag & drop entre colunas
- [ ] 9. Implementar filtros por prioridade
- [ ] 10. Implementar alerta visual de vencimento
- [ ] 11. Criar tabela `operational_tasks` no Supabase
- [ ] 12. Implementar RLS para operational_tasks
- [ ] 13. Testar fluxo completo

---

## Dependencies

- **Bloqueado por:** STY-086 (Mapa do Escritório)
- **Bloqueia:** Nenhum

---

## Test Cases

| # | Cenário | Passos | Resultado Esperado |
|---|---------|--------|-------------------|
| 1 | Abrir dashboard | Clicar em "Operacional" | Modal abre com Kanban |
| 2 | Ver colunas | Verificar layout | 3 colunas visíveis |
| 3 | Criar tarefa | Clicar "+ Nova", preencher | Tarefa aparece em "A Fazer" |
| 4 | Drag para progresso | Arrastar tarefa | Status muda para "Em Progresso" |
| 5 | Drag para concluído | Arrastar tarefa | Status muda para "Concluído" |
| 6 | Filtro prioridade | Selecionar "Alta" | Só tarefas alta prioridade |
| 7 | Contador | Verificar cabeçalho coluna | Número correto de tarefas |
| 8 | Vencimento | Criar tarefa vencida | Alerta vermelho visível |
| 9 | Mobile | Testar em tela pequena | Drag funciona com touch |

---

## Database Schema

```sql
CREATE TABLE operational_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'todo',
  priority VARCHAR(10) NOT NULL DEFAULT 'medium',
  assignee VARCHAR(100),
  due_date DATE,
  completed_at TIMESTAMPTZ,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE operational_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own tasks"
  ON operational_tasks FOR ALL
  USING (auth.uid() = user_id);

-- Índice para ordenação
CREATE INDEX idx_operational_tasks_position ON operational_tasks(user_id, status, position);
```

---

## Definition of Done

- [ ] Código implementado e revisado
- [ ] Todos os 7 ACs passando
- [ ] Drag & drop funcionando (desktop e mobile)
- [ ] Filtros funcionais
- [ ] Alertas de vencimento visuais
- [ ] Persistência no Supabase
- [ ] PR aprovado

---

## File List

```
Created:
- src/components/corporate/dashboards/OperationalDashboard.tsx
- src/components/corporate/dashboards/KanbanBoard.tsx
- src/components/corporate/dashboards/KanbanColumn.tsx
- src/components/corporate/dashboards/TaskCard.tsx
- src/components/corporate/dashboards/CreateTaskModal.tsx
- src/components/corporate/dashboards/TaskDetailModal.tsx

Modified:
- src/components/corporate/DepartmentModal.tsx
```

---

**Created by:** @pm (Morgan)
**Assigned to:** @dev
**Sprint:** EPIC-002 Sprint 7 (Feed e Kanban)