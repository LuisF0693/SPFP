/**
 * Centralized color constants to replace hardcoded hex values
 * Reduces duplication from 15+ files to single source of truth
 */

export const COLORS = {
  // Dark Theme
  DARK_BG: '#0f172a',
  DARK_BG_ALT: '#1e293b',
  DARK_BORDER: '#gray-800',
  DARK_HOVER: '#334155',

  // Light/Transparent
  LIGHT_BG: '#ffffff',
  LIGHT_BORDER: '#e2e8f0',
  GLASS_BG: 'rgba(15, 23, 42, 0.6)',
  GLASS_BORDER: 'rgba(255, 255, 255, 0.08)',

  // Semantic Colors
  SUCCESS: '#10b981', // emerald-600
  ERROR: '#ef4444',   // rose-600
  WARNING: '#f59e0b', // amber-500
  INFO: '#3b82f6',    // blue-600

  // Interactive States
  HOVER_LIGHT: 'rgba(255, 255, 255, 0.1)',
  HOVER_DARK: 'rgba(0, 0, 0, 0.1)',

  // Status Colors
  POSITIVE: '#10b981',  // emerald
  NEGATIVE: '#ef4444',  // rose
  NEUTRAL: '#6b7280',   // gray

  // Opacity Levels
  OVERLAY_LIGHT: 'rgba(0, 0, 0, 0.5)',
  OVERLAY_DARK: 'rgba(0, 0, 0, 0.7)',
} as const;

/**
 * Color palette for charts and analytics
 */
export const CHART_COLORS = {
  INCOME: '#10b981',    // emerald - positive cash flow
  EXPENSE: '#ef4444',   // rose - negative cash flow
  SAVINGS: '#3b82f6',   // blue - accumulation
  INVESTMENT: '#8b5cf6', // purple - growth
  NEUTRAL: '#6b7280',   // gray - neutral/other
} as const;

/**
 * Card color variants for different contexts
 */
export const CARD_COLORS = [
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ec4899', // pink
  '#06b6d4', // cyan
] as const;

/**
 * Modal specific colors
 */
export const MODAL_COLORS = {
  DELETE: {
    border: 'rose-500/20',
    icon_bg: 'rose-500/10',
    icon_color: 'text-rose-500',
    button: 'bg-rose-600 hover:bg-rose-500',
  },
  INFO: {
    border: 'blue-500/20',
    icon_bg: 'blue-500/10',
    icon_color: 'text-blue-500',
    button: 'bg-blue-600 hover:bg-blue-500',
  },
  WARNING: {
    border: 'amber-500/20',
    icon_bg: 'amber-500/10',
    icon_color: 'text-amber-500',
    button: 'bg-amber-600 hover:bg-amber-500',
  },
  SUCCESS: {
    border: 'emerald-500/20',
    icon_bg: 'emerald-500/10',
    icon_color: 'text-emerald-500',
    button: 'bg-emerald-600 hover:bg-emerald-700',
  },
} as const;
