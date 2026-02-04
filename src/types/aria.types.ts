/**
 * ARIA Token System for WCAG 2.1 Level AA Compliance
 * STY-014: Accessibility patterns and semantic HTML tokens
 */

/**
 * ARIA Landmarks - Page structure tokens
 * Helps screen readers navigate page sections
 */
export const AriaLandmarks = {
  MAIN: {
    role: 'main',
    label: 'Painel de Controle Financeiro'
  },
  NAV: {
    role: 'navigation',
    label: 'Navegação Principal'
  },
  SIDEBAR: {
    role: 'complementary',
    label: 'Menu Lateral'
  },
  ALERTS: {
    role: 'region',
    label: 'Alertas e Notificações'
  },
  METRICS: {
    role: 'region',
    label: 'Métricas Financeiras'
  },
  TRANSACTIONS: {
    role: 'region',
    label: 'Lista de Transações'
  },
  FILTERS: {
    role: 'search',
    label: 'Filtros de Pesquisa'
  },
  CHARTS: {
    role: 'region',
    label: 'Visualizações de Dados'
  }
} as const;

/**
 * ARIA Live Regions - Real-time announcements
 * For data updates, errors, and status messages
 */
export const AriaLivePatterns = {
  STATUS: {
    'aria-live': 'polite',
    'aria-atomic': 'true',
    role: 'status'
  },
  ALERT: {
    'aria-live': 'assertive',
    'aria-atomic': 'true',
    role: 'alert'
  },
  LOG: {
    'aria-live': 'polite',
    role: 'log',
    'aria-label': 'Histórico de Mensagens'
  }
} as const;

/**
 * ARIA Form Patterns - Form accessibility
 * For fieldsets, legends, error association
 */
export const AriaFormPatterns = {
  REQUIRED: {
    'aria-required': 'true',
    required: true
  },
  INVALID: {
    'aria-invalid': 'true'
  },
  VALID: {
    'aria-invalid': 'false'
  }
} as const;

/**
 * Keyboard Shortcuts - Accessibility hotkeys
 * Helps keyboard-only and power users navigate
 */
export const AriaKeyboardShortcuts = {
  FORM_SUBMIT: 'Alt+S',
  FORM_RESET: 'Escape',
  SEARCH_FOCUS: 'Ctrl+F',
  DELETE_CONFIRM: 'Alt+D',
  CLOSE_MODAL: 'Escape',
  FOCUS_MAIN: 'Ctrl+M'
} as const;

/**
 * Touch Target Sizes - Mobile accessibility
 * WCAG 2.5.5: Minimum 44px × 44px for motor disabilities
 */
export const TouchTargets = {
  MOBILE: 44, // <480px: 44px minimum
  TABLET: 40, // 480-768px: 40px acceptable
  LAPTOP: 36, // 768-1024px: 36px ok
  DESKTOP: 32 // >1024px: 32px standard
} as const;

/**
 * Color Contrast Ratios - WCAG compliance
 * AA level: 4.5:1 for normal text, 3:1 for large text
 * AAA level: 7:1 for normal text, 4.5:1 for large text
 */
export const ContrastRatios = {
  AA_NORMAL: '4.5:1',
  AA_LARGE: '3:1',
  AAA_NORMAL: '7:1',
  AAA_LARGE: '4.5:1'
} as const;

/**
 * Type definitions for ARIA props
 */
export type AriaLandmark = typeof AriaLandmarks[keyof typeof AriaLandmarks];
export type AriaLivePattern = typeof AriaLivePatterns[keyof typeof AriaLivePatterns];
export type AriaKeyboardShortcut = typeof AriaKeyboardShortcuts[keyof typeof AriaKeyboardShortcuts];
