# STY-095: Log de Ações de Automação

**Epic:** EPIC-003 - AI Automation
**PRD:** EPIC-003-AI-Automation.md
**Priority:** P2 BAIXA
**Effort:** 4h
**Status:** PENDING

---

## Descrição

Implementar componente de histórico/log que exibe todas as ações de automação executadas (screenshots, navegações, etc.) com timestamp, status, detalhes e opções de filtro e limpeza.

## User Story

**Como** usuário do SPFP,
**Quero** ver o histórico de ações que a IA executou no meu browser,
**Para que** eu saiba o que foi feito e possa rastrear qualquer problema.

---

## Acceptance Criteria

- [ ] **AC-095.1:** Lista de ações executadas com timestamp completo
- [ ] **AC-095.2:** Tipo de ação exibido (SCREENSHOT, NAVIGATE, CLICK, etc)
- [ ] **AC-095.3:** Status da ação exibido (✓ Success, ✗ Error, ⏳ Pending)
- [ ] **AC-095.4:** Detalhes da ação visíveis (URL, seletor, resultado)
- [ ] **AC-095.5:** Filtro por tipo de ação (todos, screenshots, navegações, etc)
- [ ] **AC-095.6:** Botão "Limpar histórico" com confirmação
- [ ] **AC-095.7:** Últimas ações aparecem primeiro (ordem reversa)
- [ ] **AC-095.8:** Histórico persiste durante a sessão (localStorage)

---

## Technical Implementation

### Tipos de Ação Expandidos

```typescript
// src/services/automationService.ts (tipos atualizados)

export type ActionType = 'screenshot' | 'navigate' | 'click' | 'fill' | 'select';

export interface AutomationAction {
  id: string;
  type: ActionType;
  status: 'pending' | 'running' | 'success' | 'error';
  timestamp: string;
  duration?: number;             // em milissegundos
  params?: Record<string, any>;  // parametros da ação (url, seletor, etc)
  result?: any;
  error?: string;
  details?: string;              // descrição amigável da ação
}

export const ACTION_TYPES = {
  screenshot: { label: 'Screenshot', icon: '📸' },
  navigate: { label: 'Navegação', icon: '🔗' },
  click: { label: 'Clique', icon: '👆' },
  fill: { label: 'Preenchimento', icon: '✏️' },
  select: { label: 'Seleção', icon: '☑️' },
} as const;

export const ACTION_STATUS = {
  pending: { label: 'Pendente', icon: '⏳', color: 'yellow' },
  running: { label: 'Executando', icon: '▶️', color: 'blue' },
  success: { label: 'Sucesso', icon: '✓', color: 'green' },
  error: { label: 'Erro', icon: '✗', color: 'red' },
} as const;
```

### Componente ActionLog

```tsx
// src/components/automation/ActionLog.tsx

import React, { useState } from 'react';
import { AutomationAction, ACTION_TYPES, ACTION_STATUS, ActionType } from '@/services/automationService';

interface ActionLogProps {
  actions: AutomationAction[];
  onClearHistory: () => Promise<void>;
  loading?: boolean;
}

export function ActionLog({ actions, onClearHistory, loading = false }: ActionLogProps) {
  const [filter, setFilter] = useState<ActionType | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredActions = actions.filter(
    (action) => filter === 'all' || action.type === filter
  );

  const handleClearHistory = async () => {
    if (confirm('Tem certeza que deseja limpar o histórico de ações?')) {
      await onClearHistory();
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return '-';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">Histórico de Ações</h3>
        <button
          onClick={handleClearHistory}
          disabled={loading || actions.length === 0}
          className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
        >
          Limpar
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 text-sm rounded transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600'
          }`}
        >
          Todos
        </button>
        {Object.entries(ACTION_TYPES).map(([key, { label, icon }]) => (
          <button
            key={key}
            onClick={() => setFilter(key as ActionType)}
            className={`px-3 py-1 text-sm rounded transition-colors whitespace-nowrap ${
              filter === key
                ? 'bg-blue-600 text-white'
                : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600'
            }`}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      {/* Lista de Ações */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredActions.length === 0 ? (
          <p className="text-slate-500 text-center py-4">Nenhuma ação registrada</p>
        ) : (
          filteredActions.map((action) => {
            const actionType = ACTION_TYPES[action.type];
            const actionStatus = ACTION_STATUS[action.status];
            const isExpanded = expandedId === action.id;

            return (
              <div
                key={action.id}
                className="border border-slate-300 dark:border-slate-600 rounded overflow-hidden"
              >
                {/* Linha Principal */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : action.id)}
                  className="w-full text-left p-3 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 flex-1">
                    {/* Ícone e Tipo */}
                    <div className="text-xl">{actionType.icon}</div>
                    <div className="flex-1">
                      <div className="font-medium">{actionType.label}</div>
                      <div className="text-xs text-slate-500">
                        {formatTime(action.timestamp)}
                      </div>
                    </div>

                    {/* Detalhes curtos */}
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {action.details || action.params?.url || '-'}
                    </div>

                    {/* Status */}
                    <div
                      className={`text-xl`}
                      title={actionStatus.label}
                    >
                      {actionStatus.icon}
                    </div>

                    {/* Tempo */}
                    {action.duration && (
                      <div className="text-xs text-slate-500 w-12 text-right">
                        {formatDuration(action.duration)}
                      </div>
                    )}
                  </div>

                  {/* Chevron */}
                  <div className="text-slate-400 ml-2">
                    {isExpanded ? '▲' : '▼'}
                  </div>
                </button>

                {/* Detalhes Expandidos */}
                {isExpanded && (
                  <div className="bg-slate-50 dark:bg-slate-900 p-3 border-t border-slate-300 dark:border-slate-600 text-sm space-y-2">
                    {action.params && (
                      <div>
                        <div className="font-medium text-slate-700 dark:text-slate-300">
                          Parâmetros:
                        </div>
                        <pre className="bg-slate-200 dark:bg-slate-800 p-2 rounded text-xs overflow-auto">
                          {JSON.stringify(action.params, null, 2)}
                        </pre>
                      </div>
                    )}

                    {action.result && (
                      <div>
                        <div className="font-medium text-slate-700 dark:text-slate-300">
                          Resultado:
                        </div>
                        <pre className="bg-slate-200 dark:bg-slate-800 p-2 rounded text-xs overflow-auto">
                          {typeof action.result === 'string'
                            ? action.result
                            : JSON.stringify(action.result, null, 2)}
                        </pre>
                      </div>
                    )}

                    {action.error && (
                      <div>
                        <div className="font-medium text-red-600">Erro:</div>
                        <div className="text-red-600 bg-red-50 dark:bg-red-900 dark:text-red-200 p-2 rounded">
                          {action.error}
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-slate-500">
                      ID: {action.id.substring(0, 8)}...
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
```

### Extensão do AutomationService para Persistence

```typescript
// src/services/automationService.ts (extensão)

class AutomationService {
  private readonly STORAGE_KEY = 'spfp_automation_history';
  private readonly MAX_HISTORY = 100;

  constructor() {
    this.loadHistoryFromStorage();
  }

  clearHistory(): void {
    this.actionHistory = [];
    localStorage.removeItem(this.STORAGE_KEY);
  }

  private loadHistoryFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.actionHistory = JSON.parse(stored);
      }
    } catch (err) {
      console.warn('Erro ao carregar histórico:', err);
    }
  }

  private saveHistoryToStorage(): void {
    try {
      const toStore = this.actionHistory.slice(0, this.MAX_HISTORY);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(toStore));
    } catch (err) {
      console.warn('Erro ao salvar histórico:', err);
    }
  }

  private recordAction(action: AutomationAction): void {
    this.actionHistory.unshift(action);
    if (this.actionHistory.length > this.MAX_HISTORY) {
      this.actionHistory = this.actionHistory.slice(0, this.MAX_HISTORY);
    }
    this.saveHistoryToStorage();
  }
}
```

---

## Tasks

- [ ] 1. Expandir tipos de ação em `automationService.ts`
- [ ] 2. Criar constantes `ACTION_TYPES` e `ACTION_STATUS`
- [ ] 3. Criar componente `ActionLog.tsx` com filtros
- [ ] 4. Implementar filtro por tipo de ação
- [ ] 5. Implementar expansão/collapse de detalhes
- [ ] 6. Implementar persistência em localStorage
- [ ] 7. Implementar botão "Limpar histórico" com confirmação
- [ ] 8. Integrar `ActionLog` em `AutomationDashboard.tsx`

---

## Dependencies

- **Bloqueia:** STY-096 (Permissões precisam logar ações)
- **Bloqueado por:** STY-093, STY-094 (Precisa de ações para exibir)

---

## Test Cases

| # | Cenário | Passos | Resultado Esperado |
|---|---------|--------|-------------------|
| 1 | Ação registrada | Capturar screenshot | Ação aparece no log |
| 2 | Múltiplas ações | Fazer 5 ações | Todas aparecem (mais recentes primeiro) |
| 3 | Filtro por tipo | Selecionar "Screenshots" | Apenas screenshots no log |
| 4 | Expandir detalhes | Clicar em ação | Detalhes expandem corretamente |
| 5 | Limpar histórico | Clicar "Limpar" | Após confirmação, histórico vazio |
| 6 | Persistência | Recarregar página | Histórico mantido (localStorage) |
| 7 | Status visual | Ação com erro | Status ✗ exibido com cor vermelha |

---

## Definition of Done

- [ ] Componente ActionLog criado e estilizado
- [ ] Filtros funcionando corretamente
- [ ] Expansão de detalhes implementada
- [ ] Persistência em localStorage funcionando
- [ ] Botão de limpeza com confirmação
- [ ] Histórico ordenado (mais recentes primeiro)
- [ ] TypeScript sem erros
- [ ] Testes unitários para ActionLog
- [ ] PR aprovado

---

## File List

```
Created:
- src/components/automation/ActionLog.tsx

Modified:
- src/services/automationService.ts (expandir tipos, adicionar persistência)
- src/components/automation/AutomationDashboard.tsx (integrar ActionLog)
```

---

**Created by:** @sm (Max)
**Assigned to:** @dev
**Sprint:** EPIC-003 Sprint 2 (Fase 4.3)
