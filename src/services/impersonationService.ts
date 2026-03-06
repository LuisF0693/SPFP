/**
 * Impersonation Service
 *
 * Gerencia a persistência do estado de impersonation no localStorage.
 * Extraído do FinanceContext (TD-S6-003) para centralizar as chaves e
 * operações de leitura/escrita, tornando-as testáveis independentemente.
 */

export const IMPERSONATION_KEY = 'spfp_is_impersonating';
export const IMPERSONATED_USER_ID_KEY = 'spfp_impersonated_user_id';

export const impersonationService = {
  /** Retorna true se há uma sessão de impersonation ativa no localStorage */
  isActive: (): boolean => {
    return localStorage.getItem(IMPERSONATION_KEY) === 'true';
  },

  /** Retorna o userId sendo impersonado, ou null se não há impersonation ativa */
  getTargetUserId: (): string | null => {
    return localStorage.getItem(IMPERSONATED_USER_ID_KEY);
  },

  /** Persiste o início de uma sessão de impersonation */
  persist: (userId: string): void => {
    localStorage.setItem(IMPERSONATION_KEY, 'true');
    localStorage.setItem(IMPERSONATED_USER_ID_KEY, userId);
  },

  /** Remove a sessão de impersonation do localStorage */
  clear: (): void => {
    localStorage.removeItem(IMPERSONATION_KEY);
    localStorage.removeItem(IMPERSONATED_USER_ID_KEY);
  },
};
