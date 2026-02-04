/**
 * Design Tokens System
 * Centralized design token definitions for colors, spacing, typography, and shadows.
 * Used to ensure consistency across all UI components and enable easy theming.
 */

// ============================================================================
// COLOR TOKENS
// ============================================================================

export const colorTokens = {
  // Primary Colors
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9', // Primary brand color
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c3d66',
  },

  // Neutral/Gray
  slate: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },

  // Success
  emerald: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e', // Success color
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#134e4a',
  },

  // Warning
  amber: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b', // Warning color
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },

  // Error/Danger
  rose: {
    50: '#fff1f2',
    100: '#ffe4e6',
    200: '#fecdd3',
    300: '#fda29b',
    400: '#f87171',
    500: '#f43f5e', // Error color
    600: '#e11d48',
    700: '#be123c',
    800: '#9d174d',
    900: '#831843',
  },

  // Info
  blue: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6', // Info color
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },

  // Special Colors
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
};

// ============================================================================
// SPACING TOKENS
// ============================================================================

export const spacingTokens = {
  xs: '0.25rem', // 4px
  sm: '0.5rem', // 8px
  md: '1rem', // 16px
  lg: '1.5rem', // 24px
  xl: '2rem', // 32px
  '2xl': '2.5rem', // 40px
  '3xl': '3rem', // 48px
  '4xl': '4rem', // 64px
  '5xl': '5rem', // 80px
  '6xl': '6rem', // 96px
} as const;

// ============================================================================
// BORDER RADIUS TOKENS
// ============================================================================

export const borderRadiusTokens = {
  none: '0',
  xs: '0.125rem', // 2px
  sm: '0.25rem', // 4px
  md: '0.375rem', // 6px
  lg: '0.5rem', // 8px
  xl: '0.75rem', // 12px
  '2xl': '1rem', // 16px
  full: '9999px',
} as const;

// ============================================================================
// TYPOGRAPHY TOKENS
// ============================================================================

export const typographyTokens = {
  // Font families
  fontFamily: {
    sans: 'Inter, system-ui, -apple-system, sans-serif',
    serif: 'Playfair, serif',
    mono: 'Fira Code, monospace',
  },

  // Font sizes
  fontSize: {
    xs: '0.75rem', // 12px
    sm: '0.875rem', // 14px
    base: '1rem', // 16px
    lg: '1.125rem', // 18px
    xl: '1.25rem', // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem', // 48px
  },

  // Font weights
  fontWeight: {
    thin: 100,
    extralight: 200,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },

  // Line heights
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  // Letter spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
} as const;

// ============================================================================
// SHADOW TOKENS
// ============================================================================

export const shadowTokens = {
  none: 'none',
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
} as const;

// ============================================================================
// TRANSITION/ANIMATION TOKENS
// ============================================================================

export const transitionTokens = {
  duration: {
    fast: '150ms',
    base: '200ms',
    slow: '300ms',
    slower: '500ms',
  },
  timing: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

// ============================================================================
// DARK MODE OVERRIDES
// ============================================================================

export const darkModeTokens = {
  colors: {
    background: colorTokens.slate[900],
    foreground: colorTokens.slate[50],
    border: colorTokens.slate[700],
    card: colorTokens.slate[800],
    muted: colorTokens.slate[600],
    mutedForeground: colorTokens.slate[300],
  },
  text: {
    primary: colorTokens.slate[50],
    secondary: colorTokens.slate[300],
    tertiary: colorTokens.slate[400],
    disabled: colorTokens.slate[500],
  },
} as const;

// ============================================================================
// LIGHT MODE COLORS
// ============================================================================

export const lightModeTokens = {
  colors: {
    background: colorTokens.white,
    foreground: colorTokens.slate[900],
    border: colorTokens.slate[200],
    card: colorTokens.slate[50],
    muted: colorTokens.slate[400],
    mutedForeground: colorTokens.slate[700],
  },
  text: {
    primary: colorTokens.slate[900],
    secondary: colorTokens.slate[700],
    tertiary: colorTokens.slate[600],
    disabled: colorTokens.slate[500],
  },
} as const;

// ============================================================================
// SEMANTIC TOKEN MAPPING
// ============================================================================

export const semanticTokens = {
  // Component-specific tokens
  button: {
    primary: {
      light: {
        bg: colorTokens.primary[500],
        text: colorTokens.white,
        border: colorTokens.primary[600],
        hover: colorTokens.primary[600],
      },
      dark: {
        bg: colorTokens.primary[600],
        text: colorTokens.white,
        border: colorTokens.primary[700],
        hover: colorTokens.primary[700],
      },
    },
    secondary: {
      light: {
        bg: colorTokens.slate[100],
        text: colorTokens.slate[900],
        border: colorTokens.slate[200],
        hover: colorTokens.slate[200],
      },
      dark: {
        bg: colorTokens.slate[700],
        text: colorTokens.slate[100],
        border: colorTokens.slate[600],
        hover: colorTokens.slate[600],
      },
    },
  },
  input: {
    light: {
      bg: colorTokens.white,
      border: colorTokens.slate[200],
      text: colorTokens.slate[900],
      placeholder: colorTokens.slate[400],
      focus: colorTokens.primary[500],
    },
    dark: {
      bg: colorTokens.slate[800],
      border: colorTokens.slate[700],
      text: colorTokens.slate[100],
      placeholder: colorTokens.slate[500],
      focus: colorTokens.primary[600],
    },
  },
  card: {
    light: {
      bg: colorTokens.white,
      border: colorTokens.slate[200],
      shadow: shadowTokens.md,
    },
    dark: {
      bg: colorTokens.slate[800],
      border: colorTokens.slate[700],
      shadow: shadowTokens.md,
    },
  },
} as const;

// ============================================================================
// GLASSMORPHISM TOKENS (Premium Design)
// ============================================================================

export const glassmorphismTokens = {
  light: {
    bg: 'rgba(255, 255, 255, 0.8)',
    border: 'rgba(255, 255, 255, 0.2)',
    backdrop: 'blur(10px)',
  },
  dark: {
    bg: 'rgba(15, 23, 42, 0.8)', // slate-900 with opacity
    border: 'rgba(51, 65, 85, 0.2)', // slate-700 with opacity
    backdrop: 'blur(10px)',
  },
} as const;

// ============================================================================
// COMPOUND TOKENS (Combined utilities)
// ============================================================================

export const compoundTokens = {
  // Card styles
  card: {
    default: {
      padding: spacingTokens.lg,
      borderRadius: borderRadiusTokens['2xl'],
      shadow: shadowTokens.md,
    },
    compact: {
      padding: spacingTokens.md,
      borderRadius: borderRadiusTokens.lg,
      shadow: shadowTokens.sm,
    },
    elevated: {
      padding: spacingTokens.xl,
      borderRadius: borderRadiusTokens['2xl'],
      shadow: shadowTokens.lg,
    },
  },

  // Focus states for accessibility
  focus: {
    outline: `2px solid ${colorTokens.primary[500]}`,
    outlineOffset: '2px',
  },

  // Disabled state
  disabled: {
    opacity: '0.5',
    cursor: 'not-allowed',
  },
} as const;

// ============================================================================
// EXPORT TYPE FOR TYPED ACCESS
// ============================================================================

export type ColorToken = typeof colorTokens;
export type SpacingToken = typeof spacingTokens;
export type TypographyToken = typeof typographyTokens;
export type ShadowToken = typeof shadowTokens;
export type TransitionToken = typeof transitionTokens;
