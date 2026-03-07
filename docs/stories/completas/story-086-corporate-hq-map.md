# STY-086: Mapa do Escritório Virtual (Corporate HQ)

**Epic:** EPIC-002 - Corporate HQ
**PRD:** EPIC-002-Corporate-HQ.md
**Priority:** P0 CRÍTICA
**Effort:** 14h (final: ~4h development + testing)
**Status:** ✅ COMPLETED

---

## Descrição

Implementar interface visual 2D top-down de um escritório virtual com 4 departamentos distintos, onde o usuário pode clicar em cada área para acessar dashboards específicos. Inspiração visual no OPES Big Brother com pixel art simplificado.

## User Story

**Como** empresário usuário do SPFP,
**Quero** ver minha empresa como um escritório virtual interativo,
**Para que** eu tenha uma visão clara, engajadora e gamificada dos departamentos da minha empresa.

---

## Layout do Mapa

```
+------------------------------------------------------------------+
|                        CORPORATE HQ                               |
+------------------------------------------------------------------+
|                          |                                        |
|      FINANCEIRO          |           MARKETING                    |
|    [Mesa] [Graficos]     |      [Mesa] [Quadro posts]            |
|      👤 CFO              |           👤 CMO                       |
|                          |                                        |
|--------------------------|----------------------------------------|
|                          |                                        |
|      OPERACIONAL         |           COMERCIAL                    |
|    [Mesa] [Kanban]       |      [Mesa] [Pipeline]                 |
|      👤 COO              |           👤 CSO                       |
|                          |                                        |
+------------------------------------------------------------------+
|  [Pipeline Feed - Lateral ou inferior]                           |
+------------------------------------------------------------------+
```

---

## Acceptance Criteria

- [x] **AC-001.1:** Mapa renderizado em tela cheia (ou área principal do layout)
- [x] **AC-001.2:** 4 áreas visíveis: Financeiro, Marketing, Operacional, Comercial
- [x] **AC-001.3:** Cada área tem visual distinto (cores, emojis temáticos)
- [x] **AC-001.4:** Personagens NPC estáticos em cada departamento (CFO, CMO, COO, CSO)
- [x] **AC-001.5:** Labels identificando cada departamento com nome e ícone
- [x] **AC-001.6:** Hover em departamento mostra highlight visual (glow, borda, scaling)
- [x] **AC-001.7:** Clique em departamento abre modal com dashboard placeholder
- [x] **AC-001.8:** Responsivo - adapta para telas menores (grid flexível)
- [x] **AC-001.9:** Empty state visual placeholder com "COMING SOON"

---

## Technical Implementation

### Tecnologia Recomendada
**Opção A: CSS Grid + SVG** (recomendado para MVP)
- Mais simples, menor curva de aprendizado
- Fácil iteração e manutenção
- Performance adequada para MVP

### Estrutura de Arquivos
```
src/components/corporate/
├── CorporateHQ.tsx          # Container principal
├── OfficeMap.tsx            # Mapa do escritório
├── Department.tsx           # Componente de departamento
├── DepartmentModal.tsx      # Modal genérico para dashboards
└── assets/
    └── office/              # SVGs e assets visuais
```

### Estrutura de Dados
```typescript
interface Department {
  id: string;
  name: string;
  label: string;
  color: string;
  emoji: string;
  npc: {
    role: string;
    emoji: string;
  };
  position: {
    row: number;
    col: number;
  };
}

const departments: Department[] = [
  {
    id: 'financeiro',
    name: 'Financeiro',
    label: 'Financeiro',
    color: '#10B981',
    emoji: '💰',
    npc: { role: 'CFO', emoji: '👤' },
    position: { row: 0, col: 0 }
  },
  {
    id: 'marketing',
    name: 'Marketing',
    label: 'Marketing',
    color: '#8B5CF6',
    emoji: '📣',
    npc: { role: 'CMO', emoji: '👤' },
    position: { row: 0, col: 1 }
  },
  {
    id: 'operacional',
    name: 'Operacional',
    label: 'Operacional',
    color: '#F59E0B',
    emoji: '⚙️',
    npc: { role: 'COO', emoji: '👤' },
    position: { row: 1, col: 0 }
  },
  {
    id: 'comercial',
    name: 'Comercial',
    label: 'Comercial',
    color: '#3B82F6',
    emoji: '🤝',
    npc: { role: 'CSO', emoji: '👤' },
    position: { row: 1, col: 1 }
  }
];
```

### Componente Base
```tsx
const OfficeMap: React.FC = () => {
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [hoveredDepartment, setHoveredDepartment] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-2 grid-rows-2 gap-2 h-full p-4">
      {departments.map((dept) => (
        <Department
          key={dept.id}
          department={dept}
          isHovered={hoveredDepartment === dept.id}
          onMouseEnter={() => setHoveredDepartment(dept.id)}
          onMouseLeave={() => setHoveredDepartment(null)}
          onClick={() => setSelectedDepartment(dept.id)}
        />
      ))}
    </div>
  );
};
```

---

## Tasks

- [x] 1. Criar estrutura de pastas `src/components/corporate/`
- [x] 2. Definir tipos TypeScript para Department e OfficeMap
- [x] 3. Criar componente `OfficeMap.tsx` com grid 2x2
- [x] 4. Criar componente `Department.tsx` com visual temático
- [x] 5. Implementar hover state com highlight
- [x] 6. Implementar clique para selecionar departamento
- [x] 7. Criar `DepartmentModal.tsx` genérico (placeholder inicial)
- [x] 8. Adicionar NPCs estáticos em cada departamento
- [x] 9. Implementar responsividade (mobile grid)
- [x] 10. Adicionar labels e ícones
- [x] 11. Usar emojis como assets visuais (pixel art style)
- [x] 12. Implementar empty state visual
- [x] 13. Integrar com Layout.tsx (nova rota `/corporate`)
- [x] 14. Testar navegação e interações

---

## Dependencies

- **Bloqueado por:** Nenhum (pode começar independente)
- **Bloqueia:** STY-087, STY-088, STY-089, STY-090, STY-091 (dashboards dependem do mapa)

---

## Test Cases

| # | Cenário | Passos | Resultado Esperado |
|---|---------|--------|-------------------|
| 1 | Visualizar mapa | Navegar para /corporate | Mapa 2x2 com 4 departamentos visíveis |
| 2 | Hover departamento | Mouse sobre "Financeiro" | Highlight/glow aparece |
| 3 | Clicar departamento | Clicar em "Marketing" | Modal abre (placeholder) |
| 4 | Fechar modal | Clicar no X ou fora | Modal fecha |
| 5 | Responsividade | Redimensionar para < 768px | Grid adapta (pode ser 1 coluna) |
| 6 | Labels visíveis | Verificar cada departamento | Nome e ícone corretos |
| 7 | NPCs presentes | Verificar cada área | Personagem visível em cada depto |
| 8 | Cores distintas | Verificar paleta | Cada depto tem cor única |

---

## Visual Assets Needed

| Asset | Descrição | Status |
|-------|-----------|--------|
| Desk SVG | Mesa de escritório genérica | A criar |
| Chart icon | Ícone de gráficos (Financeiro) | A criar |
| Whiteboard | Quadro branco (Marketing) | A criar |
| Kanban board | Board de tarefas (Operacional) | A criar |
| Pipeline visual | Funil de vendas (Comercial) | A criar |
| NPC sprites | Personagens estáticos (4) | A criar |

---

## Definition of Done

- [x] Código implementado e revisado
- [x] Todos os 9 ACs passando
- [x] Testes de compilação (typecheck, lint, build)
- [x] Testes unitários setup (RTL com vitest)
- [x] Responsividade verificada (mobile, tablet, desktop)
- [x] Acessibilidade testada (keyboard nav, ARIA labels)
- [x] Sem erros no console (build success)
- [x] Emojis usados como visual assets
- [x] Empty state visual funcional
- [x] Rota `/corporate` funcionando
- [x] Sidebar navigation atualizado
- [x] 2 commits (feature + refinements)

---

## File List

```
Created:
- src/components/corporate/CorporateHQ.tsx
- src/components/corporate/OfficeMap.tsx
- src/components/corporate/Department.tsx
- src/components/corporate/DepartmentModal.tsx
- src/components/corporate/index.ts

Modified:
- src/App.tsx (adicionar rota /corporate)
- src/components/Layout.tsx (adicionar item no sidebar)
```

---

**Created by:** @pm (Morgan)
**Assigned to:** @dev
**Sprint:** EPIC-002 Sprint 5 (Foundation)