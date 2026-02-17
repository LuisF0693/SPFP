/**
 * Permissions Panel Component
 * Allows users to configure automation security settings
 */

import { useState } from 'react';
import { AutomationPermissions } from '@/services/automationService';

interface PermissionsPanelProps {
  permissions: AutomationPermissions;
  onPermissionsChange: (perms: Partial<AutomationPermissions>) => void;
  stats: ReturnType<(permissions: AutomationPermissions) => {
    actionsThisSession: number;
    maxActionsPerSession: number;
    actionsThisHour: number;
    maxActionsPerHour: number;
  }>;
}

export function PermissionsPanel({
  permissions,
  onPermissionsChange,
  stats,
}: PermissionsPanelProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const percentUsedSession = (stats.actionsThisSession / stats.maxActionsPerSession) * 100;
  const percentUsedHour = (stats.actionsThisHour / stats.maxActionsPerHour) * 100;

  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 border-b border-slate-200 dark:border-slate-700">
        <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <span>🔐</span>
          Controle de Acesso
        </h3>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 bg-white dark:bg-slate-950">
        {/* Security Warning */}
        <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700">
          <div className="font-medium text-yellow-900 dark:text-yellow-200 flex items-center gap-2">
            <span>⚠️</span>
            Proteção de Segurança
          </div>
          <p className="text-sm text-yellow-800 dark:text-yellow-300 mt-1">
            Sites bancários e de pagamento são bloqueados por padrão para sua proteção.
          </p>
        </div>

        {/* Main Toggle */}
        <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="font-medium text-slate-900 dark:text-slate-100">
              Habilitar Automação
            </span>
            <input
              type="checkbox"
              checked={permissions.enabled}
              onChange={(e) => onPermissionsChange({ enabled: e.target.checked })}
              className="w-5 h-5 cursor-pointer"
            />
          </label>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            {permissions.enabled
              ? 'Automação está ativada. Todos os recursos estão disponíveis.'
              : 'Automação está desativada. Nenhuma ação será executada.'}
          </p>
        </div>

        {permissions.enabled && (
          <>
            {/* Confirmation Toggle */}
            <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  Confirmar Ações Perigosas
                </span>
                <input
                  type="checkbox"
                  checked={permissions.requireConfirmation}
                  onChange={(e) =>
                    onPermissionsChange({ requireConfirmation: e.target.checked })
                  }
                  className="w-5 h-5 cursor-pointer"
                />
              </label>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Se ativado, solicita confirmação antes de navegar
              </p>
            </div>

            {/* Allowed Actions */}
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
              <h4 className="font-medium text-sm text-slate-900 dark:text-slate-100">
                Funcionalidades Permitidas:
              </h4>
              {[
                { key: 'allowNavigation', label: '🔗 Navegar para URLs', desc: 'Permite navegação automática' },
                { key: 'allowClick', label: '👆 Clicar em elementos', desc: 'Permite cliques automáticos' },
                { key: 'allowTyping', label: '✏️ Digitar em campos', desc: 'Permite digitação automática' },
                { key: 'allowSelect', label: '☑️ Selecionar opções', desc: 'Permite seleção automática' },
              ].map(({ key, label, desc }) => (
                <label
                  key={key}
                  className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-900 rounded cursor-pointer"
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
                    className="w-4 h-4 cursor-pointer flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {label}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {desc}
                    </div>
                  </div>
                </label>
              ))}
            </div>

            {/* Rate Limiting */}
            <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-700">
              <h4 className="font-medium text-sm text-slate-900 dark:text-slate-100">
                Limites de Taxa:
              </h4>

              {/* Session Limit */}
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-sm text-slate-700 dark:text-slate-300">
                    Ações por Sessão:
                  </label>
                  <span className="text-sm font-mono text-slate-900 dark:text-slate-100">
                    {permissions.maxActionsPerSession}
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="500"
                  step="10"
                  value={permissions.maxActionsPerSession}
                  onChange={(e) =>
                    onPermissionsChange({
                      maxActionsPerSession: parseInt(e.target.value),
                    })
                  }
                  className="w-full"
                />
                <div className="mt-1 flex items-center gap-2 text-xs">
                  <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        percentUsedSession > 90
                          ? 'bg-red-500'
                          : percentUsedSession > 70
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(percentUsedSession, 100)}%` }}
                    />
                  </div>
                  <span className="text-slate-600 dark:text-slate-400">
                    {stats.actionsThisSession} / {stats.maxActionsPerSession}
                  </span>
                </div>
              </div>

              {/* Hour Limit */}
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-sm text-slate-700 dark:text-slate-300">
                    Ações por Hora:
                  </label>
                  <span className="text-sm font-mono text-slate-900 dark:text-slate-100">
                    {permissions.maxActionsPerHour}
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="300"
                  step="10"
                  value={permissions.maxActionsPerHour}
                  onChange={(e) =>
                    onPermissionsChange({
                      maxActionsPerHour: parseInt(e.target.value),
                    })
                  }
                  className="w-full"
                />
                <div className="mt-1 flex items-center gap-2 text-xs">
                  <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        percentUsedHour > 90
                          ? 'bg-red-500'
                          : percentUsedHour > 70
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(percentUsedHour, 100)}%` }}
                    />
                  </div>
                  <span className="text-slate-600 dark:text-slate-400">
                    {stats.actionsThisHour} / {stats.maxActionsPerHour}
                  </span>
                </div>
              </div>
            </div>

            {/* Advanced Settings */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center gap-1"
              >
                {showAdvanced ? '▼' : '▶'} Configurações Avançadas
              </button>

              {showAdvanced && (
                <div className="mt-3 space-y-3 p-3 rounded-lg bg-slate-100 dark:bg-slate-900">
                  {/* Banking Sites Protection */}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.blockBankingSites}
                      onChange={(e) =>
                        onPermissionsChange({ blockBankingSites: e.target.checked })
                      }
                      className="w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        Bloquear Sites Bancários
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        Sites com "bank", "banking", "paypal" serão bloqueados
                      </div>
                    </div>
                  </label>

                  {/* Security Logging */}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.logSecurityEvents}
                      onChange={(e) =>
                        onPermissionsChange({ logSecurityEvents: e.target.checked })
                      }
                      className="w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        Log de Eventos de Segurança
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        Registra todas as tentativas de ação para auditoria
                      </div>
                    </div>
                  </label>
                </div>
              )}
            </div>
          </>
        )}

        {/* Info Box */}
        <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 text-xs text-blue-800 dark:text-blue-200">
          <strong>💡 Dica:</strong> Todas as suas configurações de segurança são salvas localmente no seu navegador.
        </div>
      </div>
    </div>
  );
}
