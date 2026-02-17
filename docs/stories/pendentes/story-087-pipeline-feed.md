# STY-087: Pipeline Feed de Atividades

**Epic:** EPIC-002 - Corporate HQ
**PRD:** EPIC-002-Corporate-HQ.md
**Priority:** P1 ALTA
**Effort:** 10h (revisado: +2h para empty/loading states)
**Status:** PENDING

---

## Descrição

Implementar feed lateral/inferior mostrando atividades dos departamentos em tempo real, com status badges, filtros por departamento, e gates de aprovação para ações que requerem confirmação do usuário.

## User Story

**Como** empresário usuário do SPFP,
**Quero** ver um feed de atividades dos departamentos em tempo real,
**Para que** eu saiba o que está acontecendo e possa aprovar ações importantes.

---

## Layout do Feed

```
+------------------------------------------+
| 📋 PIPELINE FEED           [Filtro ▼]   |
+------------------------------------------+
| 👤 CFO                           10:45   |
| Analisando fluxo de caixa do mês...      |
| [RUNNING 🟢]                             |
+------------------------------------------+
| 👤 CMO                           10:42   |
| Post do Instagram aprovado.              |
| [COMPLETED ✓]                            |
+------------------------------------------+
| 👤 COO                           10:40   |
| Aguardando aprovação para publicar       |
| [WAITING ⏳]  [Aprovar] [Rejeitar]       |
+------------------------------------------+
```

---

## Acceptance Criteria

- [ ] **AC-002.1:** Feed posicionado na lateral direita (ou inferior em mobile)
- [ ] **AC-002.2:** Scroll infinito de atividades com paginação
- [ ] **AC-002.3:** Cada atividade mostra: agente, hora, descrição, status
- [ ] **AC-002.4:** Status badges: RUNNING (verde pulsante), IDLE (cinza), WAITING (amarelo), COMPLETED (check), ERROR (vermelho)
- [ ] **AC-002.5:** Filtro por departamento (dropdown ou tabs)
- [ ] **AC-002.6:** Novas atividades aparecem no topo com animação suave
- [ ] **AC-002.7:** Clicar em atividade expande detalhes (se houver metadata)
- [ ] **AC-002.8:** Gates de aprovação com botões [Aprovar] [Rejeitar] para status WAITING
- [ ] **AC-002.9:** Empty state visível quando não há atividades (mensagem + ícone)
- [ ] **AC-002.10:** Loading state com skeleton/spinner durante carregamento
- [ ] **AC-002.11:** Tratamento de erro de conexão com mensagem amigável

---

## Technical Implementation

### Modelo de Dados
```typescript
interface ActivityFeedItem {
  id: string;
  user_id: string;
  department: 'financeiro' | 'marketing' | 'operacional' | 'comercial';
  agent_name: string;
  agent_role: string;
  description: string;
  status: 'running' | 'idle' | 'waiting' | 'completed' | 'error';
  requires_approval: boolean;
  approved_at?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

type ActivityStatus = 'running' | 'idle' | 'waiting' | 'completed' | 'error';

const STATUS_CONFIG: Record<ActivityStatus, { label: string; color: string; icon: string }> = {
  running: { label: 'Executando', color: 'emerald', icon: '🔄' },
  idle: { label: 'Inativo', color: 'gray', icon: '💤' },
  waiting: { label: 'Aguardando', color: 'amber', icon: '⏳' },
  completed: { label: 'Concluído', color: 'green', icon: '✓' },
  error: { label: 'Erro', color: 'red', icon: '⚠️' }
};
```

### Componente Base
```tsx
const ActivityFeed: React.FC = () => {
  const [activities, setActivities] = useState<ActivityFeedItem[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Mock data inicial - será substituído por Supabase realtime
  useEffect(() => {
    loadActivities();
  }, [filter]);

  const handleApprove = async (id: string) => {
    await approveActivity(id);
    // Atualizar lista
  };

  const handleReject = async (id: string) => {
    await rejectActivity(id);
    // Atualizar lista
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-lg">
      <FeedHeader filter={filter} onFilterChange={setFilter} />
      <div className="flex-1 overflow-y-auto">
        {activities.map((activity) => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            isExpanded={expandedId === activity.id}
            onToggleExpand={() => setExpandedId(
              expandedId === activity.id ? null : activity.id
            )}
            onApprove={() => handleApprove(activity.id)}
            onReject={() => handleReject(activity.id)}
          />
        ))}
      </div>
    </div>
  );
};
```

### Estrutura de Arquivos
```
src/components/corporate/
├── ActivityFeed.tsx          # Container do feed
├── ActivityCard.tsx         # Card individual de atividade
├── ActivityStatus.tsx       # Badge de status
└── ApprovalGate.tsx        # Botões de aprovação
```

---

## Tasks

- [ ] 1. Criar tipos TypeScript para ActivityFeedItem
- [ ] 2. Criar componente `ActivityFeed.tsx`
- [ ] 3. Criar componente `ActivityCard.tsx`
- [ ] 4. Criar componente `ActivityStatus.tsx` com badges
- [ ] 5. Criar componente `ApprovalGate.tsx`
- [ ] 6. Implementar filtro por departamento
- [ ] 7. Implementar expansão de detalhes ao clicar
- [ ] 8. Adicionar animação para novas atividades
- [ ] 9. Implementar scroll infinito/paginação
- [ ] 10. Criar mock data para desenvolvimento
- [ ] 11. Integrar com OfficeMap (posicionar feed)
- [ ] 12. Testar responsividade (mobile: feed abaixo do mapa)

---

## Dependencies

- **Bloqueado por:** STY-086 (Mapa do Escritório)
- **Bloqueia:** Nenhum

---

## Test Cases

| # | Cenário | Passos | Resultado Esperado |
|---|---------|--------|-------------------|
| 1 | Visualizar feed | Abrir Corporate HQ | Feed visível na lateral |
| 2 | Filtrar departamento | Selecionar "Financeiro" no filtro | Só atividades financeiras |
| 3 | Status running | Verificar atividade em execução | Badge verde pulsante |
| 4 | Status waiting | Verificar atividade aguardando | Botões Aprovar/Rejeitar visíveis |
| 5 | Aprovar atividade | Clicar em Aprovar | Status muda para completed |
| 6 | Rejeitar atividade | Clicar em Rejeitar | Atividade some ou marca rejeitada |
| 7 | Expandir detalhes | Clicar em card | Metadata expandida se houver |
| 8 | Nova atividade | Simular nova atividade | Aparece no topo com animação |
| 9 | Scroll infinito | Scrollar até o fim | Mais atividades carregam |
| 10 | Mobile | Redimensionar < 768px | Feed abaixo do mapa |

---

## Database Schema

```sql
-- Tabela já definida no PRD
CREATE TABLE corporate_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  department VARCHAR(20) NOT NULL,
  agent_name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'running',
  requires_approval BOOLEAN DEFAULT FALSE,
  approved_at TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS Policy
ALTER TABLE corporate_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activities"
  ON corporate_activities FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own activities"
  ON corporate_activities FOR UPDATE
  USING (auth.uid() = user_id);
```

---

## Definition of Done

- [ ] Código implementado e revisado
- [ ] Todos os 11 ACs passando
- [ ] Testes manuais realizados
- [ ] Responsividade verificada
- [ ] Animações funcionando suavemente
- [ ] Filtros funcionais
- [ ] Gates de aprovação funcionais
- [ ] Empty state implementado
- [ ] Loading state implementado
- [ ] Tratamento de erro implementado
- [ ] PR aprovado

---

## File List

```
Created:
- src/components/corporate/ActivityFeed.tsx
- src/components/corporate/ActivityCard.tsx
- src/components/corporate/ActivityStatus.tsx
- src/components/corporate/ApprovalGate.tsx

Modified:
- src/components/corporate/CorporateHQ.tsx (integrar feed)
```

---

**Created by:** @pm (Morgan)
**Assigned to:** @dev
**Sprint:** EPIC-002 Sprint 5 (Foundation)