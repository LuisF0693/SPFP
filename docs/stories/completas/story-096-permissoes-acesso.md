# STY-096: Permissões e Controle de Acesso de Automação

**Epic:** EPIC-003 - AI Automation
**PRD:** EPIC-003-AI-Automation.md
**Priority:** P2 BAIXA
**Effort:** 5h
**Status:** PENDING

---

## Descrição

Implementar sistema robusto de permissões para controlar o que a IA pode fazer no browser do usuário. Inclui toggles de habilitação, confirmação de ações, whitelist de domínios, rate limiting e log de segurança.

## User Story

**Como** usuário do SPFP,
**Quero** controlar exatamente o que a IA pode fazer no meu browser,
**Para que** eu me sinta seguro e protegido contra usos indevidos.

---

## Acceptance Criteria

- [ ] **AC-096.1:** Toggle para habilitar/desabilitar automação globalmente
- [ ] **AC-096.2:** Confirmação antes de executar ações perigosas (navegações)
- [ ] **AC-096.3:** Whitelist de domínios permitidos (opcional/vazio = todos)
- [ ] **AC-096.4:** Limite configurável de ações por sessão (padrão: 100)
- [ ] **AC-096.5:** Toggles individuais: permitir navegação, cliques, typing
- [ ] **AC-096.6:** Log de segurança com todas as ações executadas
- [ ] **AC-096.7:** Aviso claro sobre sites bancários (bloqueados por padrão)
- [ ] **AC-096.8:** Persistência de configurações em localStorage (por usuário)

---

## Technical Implementation

### Interface de Permissões

```typescript
// src/services/automationService.ts (tipos)

export interface AutomationPermissions {
  // Controle global
  enabled: boolean;

  // Confirmação
  requireConfirmation: boolean;

  // Domínios
  allowedDomains: string[]; // vazio = todos permitidos
  blockedDomains: string[]; // sempre bloqueados
  blockBankingSites: boolean; // padrão: true

  // Rate limiting
  maxActionsPerSession: number; // padrão: 100
  maxActionsPerHour: number; // padrão: 50

  // Funcionalidades
  allowNavigation: boolean;
  allowClick: boolean;
  allowTyping: boolean;
  allowSelect: boolean;

  // Auditoria
  logSecurityEvents: boolean;
}

export const DEFAULT_PERMISSIONS: AutomationPermissions = {
  enabled: false,
  requireConfirmation: true,
  allowedDomains: [],
  blockedDomains: ['*.bank.com', '*.banking.com', 'paypal.com'],
  blockBankingSites: true,
  maxActionsPerSession: 100,
  maxActionsPerHour: 50,
  allowNavigation: true,
  allowClick: false,
  allowTyping: false,
  allowSelect: false,
  logSecurityEvents: true,
};

export interface SecurityLog {
  id: string;
  timestamp: string;
  userId?: string;
  action: string;
  actionId: string;
  allowed: boolean;
  reason?: string;
  details?: Record<string, any>;
}
```

### Service de Automação com Permissões

```typescript
// src/services/automationService.ts (extensão)

class AutomationService {
  private permissions: AutomationPermissions = { ...DEFAULT_PERMISSIONS };
  private securityLogs: SecurityLog[] = [];
  private actionsThisSession = 0;
  private actionsThisHour: { timestamp: number; count: number } = {
    timestamp: Date.now(),
    count: 0,
  };

  constructor(userId?: string) {
    this.userId = userId;
    this.loadPermissionsFromStorage();
  }

  /**
   * Verifica se uma ação é permitida
   */
  private async checkPermission(action: AutomationAction): Promise<{
    allowed: boolean;
    reason?: string;
  }> {
    // Verificar se automação está habilitada
    if (!this.permissions.enabled) {
      return { allowed: false, reason: 'Automação desabilitada' };
    }

    // Verificar tipo de ação
    if (action.type === 'navigate' && !this.permissions.allowNavigation) {
      return { allowed: false, reason: 'Navegação não permitida' };
    }
    if (action.type === 'click' && !this.permissions.allowClick) {
      return { allowed: false, reason: 'Cliques não permitidos' };
    }
    if (action.type === 'fill' && !this.permissions.allowTyping) {
      return { allowed: false, reason: 'Digitação não permitida' };
    }
    if (action.type === 'select' && !this.permissions.allowSelect) {
      return { allowed: false, reason: 'Seleção não permitida' };
    }

    // Verificar rate limiting (ações por sessão)
    if (this.actionsThisSession >= this.permissions.maxActionsPerSession) {
      return {
        allowed: false,
        reason: `Limite de ações por sessão atingido (${this.permissions.maxActionsPerSession})`,
      };
    }

    // Verificar rate limiting (ações por hora)
    const now = Date.now();
    if (now - this.actionsThisHour.timestamp > 3600000) {
      // Reset contador após 1 hora
      this.actionsThisHour = { timestamp: now, count: 0 };
    }
    if (this.actionsThisHour.count >= this.permissions.maxActionsPerHour) {
      return {
        allowed: false,
        reason: `Limite de ações por hora atingido (${this.permissions.maxActionsPerHour})`,
      };
    }

    // Verificar whitelist/blacklist de domínios (para navegações)
    if (action.type === 'navigate' && action.params?.url) {
      const url = new URL(action.params.url);
      const hostname = url.hostname;

      // Verificar bloqueados
      if (this.isDomainBlocked(hostname)) {
        return { allowed: false, reason: `Domínio ${hostname} bloqueado` };
      }

      // Verificar whitelist
      if (
        this.permissions.allowedDomains.length > 0 &&
        !this.isDomainInWhitelist(hostname)
      ) {
        return {
          allowed: false,
          reason: `Domínio ${hostname} não está na whitelist`,
        };
      }
    }

    return { allowed: true };
  }

  private isDomainBlocked(hostname: string): boolean {
    // Verificar sites bancários
    if (this.permissions.blockBankingSites) {
      const bankingKeywords = ['bank', 'banking', 'paypal', 'credit'];
      if (bankingKeywords.some((kw) => hostname.includes(kw))) {
        return true;
      }
    }

    // Verificar lista de bloqueados
    return this.permissions.blockedDomains.some((blocked) => {
      const pattern = blocked.replace('*', '.*');
      const regex = new RegExp(`^${pattern}$`);
      return regex.test(hostname);
    });
  }

  private isDomainInWhitelist(hostname: string): boolean {
    return this.permissions.allowedDomains.some((allowed) => {
      const pattern = allowed.replace('*', '.*');
      const regex = new RegExp(`^${pattern}$`);
      return regex.test(hostname);
    });
  }

  /**
   * Registra evento de segurança
   */
  private logSecurityEvent(
    action: string,
    actionId: string,
    allowed: boolean,
    reason?: string
  ): void {
    if (!this.permissions.logSecurityEvents) return;

    const log: SecurityLog = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      userId: this.userId,
      action,
      actionId,
      allowed,
      reason,
    };

    this.securityLogs.unshift(log);
    if (this.securityLogs.length > 100) {
      this.securityLogs = this.securityLogs.slice(0, 100);
    }

    this.saveSecurityLogsToStorage();
  }

  /**
   * Executa ação com verificação de permissões
   */
  async executeWithPermissionCheck<T>(
    action: AutomationAction,
    executor: () => Promise<T>
  ): Promise<T> {
    const { allowed, reason } = await this.checkPermission(action);

    this.logSecurityEvent(
      `${action.type.toUpperCase()}_ATTEMPT`,
      action.id,
      allowed,
      reason
    );

    if (!allowed) {
      throw new Error(reason || 'Ação não permitida');
    }

    // Verificar se precisa de confirmação
    if (this.permissions.requireConfirmation && action.type === 'navigate') {
      const confirmed = await this.requestUserConfirmation(action);
      if (!confirmed) {
        this.logSecurityEvent(
          `${action.type.toUpperCase()}_REJECTED`,
          action.id,
          false,
          'Usuário rejeitou confirmação'
        );
        throw new Error('Ação cancelada pelo usuário');
      }
    }

    try {
      const result = await executor();
      this.actionsThisSession++;
      this.actionsThisHour.count++;
      this.logSecurityEvent(
        `${action.type.toUpperCase()}_SUCCESS`,
        action.id,
        true
      );
      return result;
    } catch (error: any) {
      this.logSecurityEvent(
        `${action.type.toUpperCase()}_ERROR`,
        action.id,
        true,
        error.message
      );
      throw error;
    }
  }

  /**
   * Solicita confirmação do usuário (será integrado com componente)
   */
  private async requestUserConfirmation(
    action: AutomationAction
  ): Promise<boolean> {
    // Será implementado como modal/diálogo
    // Por enquanto, retorna true (será sobrescrito pelo componente)
    return true;
  }

  // Getters e Setters
  getPermissions(): AutomationPermissions {
    return { ...this.permissions };
  }

  setPermissions(perms: Partial<AutomationPermissions>): void {
    this.permissions = { ...this.permissions, ...perms };
    this.savePermissionsToStorage();
  }

  getSecurityLogs(): SecurityLog[] {
    return [...this.securityLogs];
  }

  getSessionStats() {
    return {
      actionsThisSession: this.actionsThisSession,
      maxActionsPerSession: this.permissions.maxActionsPerSession,
      actionsThisHour: this.actionsThisHour.count,
      maxActionsPerHour: this.permissions.maxActionsPerHour,
    };
  }

  resetSessionStats(): void {
    this.actionsThisSession = 0;
    this.actionsThisHour = { timestamp: Date.now(), count: 0 };
  }

  private savePermissionsToStorage(): void {
    try {
      localStorage.setItem(
        `spfp_automation_permissions_${this.userId}`,
        JSON.stringify(this.permissions)
      );
    } catch (err) {
      console.warn('Erro ao salvar permissões:', err);
    }
  }

  private loadPermissionsFromStorage(): void {
    try {
      const stored = localStorage.getItem(
        `spfp_automation_permissions_${this.userId}`
      );
      if (stored) {
        this.permissions = { ...DEFAULT_PERMISSIONS, ...JSON.parse(stored) };
      }
    } catch (err) {
      console.warn('Erro ao carregar permissões:', err);
    }
  }

  private saveSecurityLogsToStorage(): void {
    try {
      localStorage.setItem(
        `spfp_automation_security_logs_${this.userId}`,
        JSON.stringify(this.securityLogs.slice(0, 50))
      );
    } catch (err) {
      console.warn('Erro ao salvar logs de segurança:', err);
    }
  }

  private userId?: string;
}
```

### Componente PermissionsPanel

```tsx
// src/components/automation/PermissionsPanel.tsx

interface PermissionsPanelProps {
  permissions: AutomationPermissions;
  onPermissionsChange: (perms: Partial<AutomationPermissions>) => void;
  stats: ReturnType<AutomationService['getSessionStats']>;
}

export function PermissionsPanel({
  permissions,
  onPermissionsChange,
  stats,
}: PermissionsPanelProps) {
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 space-y-4">
      <h3 className="font-semibold text-lg">Controle de Acesso</h3>

      {/* Aviso de Segurança */}
      <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 p-3 rounded">
        <div className="font-medium text-yellow-800 dark:text-yellow-200">
          ⚠️ Permissões de Segurança
        </div>
        <p className="text-sm text-yellow-700 dark:text-yellow-300">
          Sites bancários e de pagamento são bloqueados por padrão para sua proteção.
        </p>
      </div>

      {/* Toggle Principal */}
      <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded">
        <label className="font-medium">Habilitar Automação</label>
        <input
          type="checkbox"
          checked={permissions.enabled}
          onChange={(e) =>
            onPermissionsChange({ enabled: e.target.checked })
          }
          className="w-5 h-5"
        />
      </div>

      {permissions.enabled && (
        <>
          {/* Permissões de Ação */}
          <div className="border-t pt-4 space-y-2">
            <h4 className="font-medium text-sm">Funcionalidades Permitidas:</h4>
            {[
              {
                key: 'allowNavigation',
                label: '🔗 Navegar para URLs',
              },
              {
                key: 'allowClick',
                label: '👆 Clicar em elementos',
              },
              {
                key: 'allowTyping',
                label: '✏️ Digitar em campos',
              },
              {
                key: 'allowSelect',
                label: '☑️ Selecionar opções',
              },
            ].map(({ key, label }) => (
              <label
                key={key}
                className="flex items-center gap-2 p-2 hover:bg-slate-50 dark:hover:bg-slate-900 rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={
                    permissions[key as keyof AutomationPermissions] as boolean
                  }
                  onChange={(e) =>
                    onPermissionsChange({
                      [key]: e.target.checked,
                    })
                  }
                  className="w-4 h-4"
                />
                <span>{label}</span>
              </label>
            ))}
          </div>

          {/* Rate Limiting */}
          <div className="border-t pt-4 space-y-3">
            <h4 className="font-medium text-sm">Limites de Taxa:</h4>
            <div>
              <label className="text-sm">
                Ações por Sessão: {permissions.maxActionsPerSession}
              </label>
              <input
                type="range"
                min="10"
                max="1000"
                step="10"
                value={permissions.maxActionsPerSession}
                onChange={(e) =>
                  onPermissionsChange({
                    maxActionsPerSession: parseInt(e.target.value),
                  })
                }
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm">
                Ações por Hora: {permissions.maxActionsPerHour}
              </label>
              <input
                type="range"
                min="10"
                max="500"
                step="10"
                value={permissions.maxActionsPerHour}
                onChange={(e) =>
                  onPermissionsChange({
                    maxActionsPerHour: parseInt(e.target.value),
                  })
                }
                className="w-full"
              />
            </div>
          </div>

          {/* Confirmação */}
          <div className="border-t pt-4">
            <label className="flex items-center gap-2 p-2 hover:bg-slate-50 dark:hover:bg-slate-900 rounded cursor-pointer">
              <input
                type="checkbox"
                checked={permissions.requireConfirmation}
                onChange={(e) =>
                  onPermissionsChange({
                    requireConfirmation: e.target.checked,
                  })
                }
                className="w-4 h-4"
              />
              <span>Confirmar antes de executar ações perigosas</span>
            </label>
          </div>

          {/* Estatísticas */}
          <div className="border-t pt-4 bg-slate-50 dark:bg-slate-900 p-3 rounded">
            <h4 className="font-medium text-sm mb-2">Uso Atual:</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <div className="text-slate-600 dark:text-slate-400">
                  Sessão:
                </div>
                <div className="font-mono">
                  {stats.actionsThisSession} / {stats.maxActionsPerSession}
                </div>
              </div>
              <div>
                <div className="text-slate-600 dark:text-slate-400">
                  Por Hora:
                </div>
                <div className="font-mono">
                  {stats.actionsThisHour} / {stats.maxActionsPerHour}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
```

---

## Tasks

- [ ] 1. Definir interfaces `AutomationPermissions` e `SecurityLog`
- [ ] 2. Implementar lógica de permissões no `automationService`
- [ ] 3. Implementar verificação de domínios (whitelist/blacklist)
- [ ] 4. Implementar rate limiting (por sessão e por hora)
- [ ] 5. Implementar log de segurança
- [ ] 6. Criar componente `PermissionsPanel.tsx`
- [ ] 7. Integrar permissões com ações (executeWithPermissionCheck)
- [ ] 8. Persistir configurações em localStorage

---

## Dependencies

- **Bloqueia:** Nenhum (Story final)
- **Bloqueado por:** STY-093, STY-094, STY-095 (Precisa das ações para validar)

---

## Test Cases

| # | Cenário | Passos | Resultado Esperado |
|---|---------|--------|-------------------|
| 1 | Automação desabilitada | Tentar ação com toggle off | Ação bloqueada |
| 2 | Navegação bloqueada | Tentar ir para bank.com | Ação bloqueada (site bancário) |
| 3 | Whitelist | Configurar whitelist com google.com | Só google.com permitido |
| 4 | Rate limiting | 100 ações no limite | 101ª ação bloqueada |
| 5 | Confirmação | Tentar navegar com toggle on | Modal de confirmação aparece |
| 6 | Rejeição | Usuário rejeita confirmação | Ação cancelada |
| 7 | Persistência | Alterar permissões, recarregar | Configurações mantidas |
| 8 | Log de segurança | Fazer 5 ações | Todas as 5 logadas |

---

## Definition of Done

- [ ] Interfaces de permissões definidas e tipadas
- [ ] Lógica de verificação implementada
- [ ] Rate limiting funcionando
- [ ] Domínios bloqueados/whitelist implementado
- [ ] Log de segurança funcional
- [ ] Componente PermissionsPanel criado e estilizado
- [ ] Permissões persistem em localStorage
- [ ] TypeScript sem erros
- [ ] Testes unitários para lógica de permissões
- [ ] PR aprovado

---

## File List

```
Created:
- src/components/automation/PermissionsPanel.tsx

Modified:
- src/services/automationService.ts (adicionar lógica de permissões)
- src/components/automation/AutomationDashboard.tsx (integrar PermissionsPanel)
```

---

**Created by:** @sm (Max)
**Assigned to:** @dev
**Sprint:** EPIC-003 Sprint 3 (Fase 4.3)
