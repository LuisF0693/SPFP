# STY-092: Setup @dnd-kit para Corporate HQ

**Epic:** EPIC-002 - Corporate HQ
**PRD:** EPIC-002-Corporate-HQ.md
**Priority:** P0 CRÍTICA
**Effort:** 2h
**Status:** PENDING

---

## Descrição

Instalar e configurar a biblioteca @dnd-kit para suportar drag & drop nos dashboards Operacional (Kanban) e Comercial (Pipeline de Vendas). Criar tipos base e wrapper components reutilizáveis.

## User Story

**Como** desenvolvedor do SPFP,
**Quero** ter o @dnd-kit configurado com componentes base reutilizáveis,
**Para que** eu possa implementar drag & drop de forma consistente nos dashboards.

---

## Acceptance Criteria

- [ ] **AC-092.1:** Pacotes @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities instalados
- [ ] **AC-092.2:** Tipos TypeScript base criados (DraggableItem, DroppableZone)
- [ ] **AC-092.3:** Wrapper component `DraggableCard` criado e documentado
- [ ] **AC-092.4:** Wrapper component `DroppableColumn` criado e documentado
- [ ] **AC-092.5:** Exemplo de uso documentado em comentário JSDoc
- [ ] **AC-092.6:** Touch support verificado em dispositivo móvel

---

## Technical Implementation

### Instalação
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

### Estrutura de Arquivos
```
src/components/corporate/shared/
├── dnd/
│   ├── index.ts
│   ├── DraggableCard.tsx
│   ├── DroppableColumn.tsx
│   └── types.ts
```

### Tipos Base
```typescript
// src/components/corporate/shared/dnd/types.ts

export interface DraggableItem {
  id: string;
  position: number;
}

export interface DroppableZone {
  id: string;
  accepts: string[];
}

export interface DndContextConfig {
  onDragEnd: (event: DragEndEvent) => void;
  onDragOver?: (event: DragOverEvent) => void;
}
```

### Componente DraggableCard
```tsx
// src/components/corporate/shared/dnd/DraggableCard.tsx
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface DraggableCardProps {
  id: string;
  children: React.ReactNode;
  disabled?: boolean;
}

/**
 * Wrapper reutilizável para cards arrastáveis.
 *
 * @example
 * <DraggableCard id={task.id}>
 *   <TaskCard task={task} />
 * </DraggableCard>
 */
export function DraggableCard({ id, children, disabled }: DraggableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="touch-none"
    >
      {children}
    </div>
  );
}
```

### Componente DroppableColumn
```tsx
// src/components/corporate/shared/dnd/DroppableColumn.tsx
import { useDroppable } from '@dnd-kit/core';

interface DroppableColumnProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Wrapper reutilizável para colunas que recebem drop.
 *
 * @example
 * <DroppableColumn id="todo">
 *   {tasks.map(task => (
 *     <DraggableCard key={task.id} id={task.id}>
 *       <TaskCard task={task} />
 *     </DraggableCard>
 *   ))}
 * </DroppableColumn>
 */
export function DroppableColumn({ id, children, className }: DroppableColumnProps) {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`${className} ${isOver ? 'ring-2 ring-blue-500' : ''}`}
    >
      {children}
    </div>
  );
}
```

---

## Tasks

- [ ] 1. Instalar pacotes: `npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`
- [ ] 2. Criar pasta `src/components/corporate/shared/dnd/`
- [ ] 3. Criar arquivo `types.ts` com interfaces base
- [ ] 4. Criar componente `DraggableCard.tsx`
- [ ] 5. Criar componente `DroppableColumn.tsx`
- [ ] 6. Criar arquivo `index.ts` com exports
- [ ] 7. Adicionar JSDoc com exemplos de uso
- [ ] 8. Testar touch em mobile (emulator ou dispositivo)

---

## Dependencies

- **Bloqueado por:** Nenhum (pode começar independente)
- **Bloqueia:** STY-090, STY-091 (requerem drag & drop)

---

## Test Cases

| # | Cenário | Passos | Resultado Esperado |
|---|---------|--------|-------------------|
| 1 | Instalação | Rodar npm install | Pacotes instalados sem erros |
| 2 | Import | Importar DraggableCard | Componente disponível |
| 3 | Touch support | Testar em mobile | Drag funciona com touch |
| 4 | TypeScript | Rodar typecheck | Sem erros de tipo |

---

## Definition of Done

- [ ] Pacotes instalados e no package.json
- [ ] Tipos TypeScript compilando sem erros
- [ ] Componentes documentados com JSDoc
- [ ] Touch support verificado
- [ ] PR aprovado

---

## File List

```
Created:
- src/components/corporate/shared/dnd/types.ts
- src/components/corporate/shared/dnd/DraggableCard.tsx
- src/components/corporate/shared/dnd/DroppableColumn.tsx
- src/components/corporate/shared/dnd/index.ts

Modified:
- package.json (adicionar dependências)
```

---

**Created by:** @sm (Max)
**Assigned to:** @dev
**Sprint:** EPIC-002 Sprint 5 (Foundation - deve ser feito antes de 090 e 091)