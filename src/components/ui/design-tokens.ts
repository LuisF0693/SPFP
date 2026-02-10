// ============================================
// SPFP Evolution v2.0 - Design System STITCH
// ============================================

export const colors = {
  // Primary
  primary: '#135bec',
  primaryHover: '#1048c7',
  primaryLight: 'rgba(19, 91, 236, 0.1)',
  primaryGlow: 'rgba(19, 91, 236, 0.3)',

  // Backgrounds
  background: {
    light: '#f6f6f8',
    dark: '#101622',
  },

  // Surfaces
  surface: {
    light: '#FFFFFF',
    dark: '#1A2233',
    darker: '#111722',
  },

  // Borders
  border: {
    light: '#e6e8eb',
    dark: '#2e374a',
    hover: '#3e4a63',
  },

  // Text
  text: {
    primary: {
      light: '#111418',
      dark: '#FFFFFF',
    },
    secondary: {
      light: '#637588',
      dark: '#92a4c9',
    },
    muted: {
      light: '#9ca3af',
      dark: '#6e85a3',
    },
  },

  // Semantic
  success: {
    DEFAULT: '#22c55e',
    bg: 'rgba(34, 197, 94, 0.1)',
    text: '#22c55e',
    light: '#4ade80',
    dark: '#16a34a',
  },

  danger: {
    DEFAULT: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.1)',
    text: '#ef4444',
    light: '#f87171',
    dark: '#dc2626',
  },

  warning: {
    DEFAULT: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.1)',
    text: '#f59e0b',
  },

  // Chart colors
  chart: {
    primary: '#135bec',
    secondary: '#8b5cf6', // Purple
    tertiary: '#14b8a6', // Teal
    quaternary: '#f59e0b', // Amber
    accumulation: '#22c55e', // Green
    withdrawal: '#f97316', // Orange
  },
} as const;

export const typography = {
  fontFamily: {
    display: ['Inter', 'sans-serif'],
    body: ['Inter', 'sans-serif'],
  },

  fontSize: {
    'display-xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.02em', fontWeight: '800' }], // 36px
    'display-lg': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.02em', fontWeight: '700' }], // 30px
    'heading': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.01em', fontWeight: '700' }], // 24px
    'subheading': ['1.125rem', { lineHeight: '1.75rem', fontWeight: '600' }], // 18px
    'body': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '400' }], // 14px
    'caption': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.05em', fontWeight: '500' }], // 12px
    'micro': ['0.625rem', { lineHeight: '0.875rem', letterSpacing: '0.1em', fontWeight: '600' }], // 10px
  },
} as const;

export const spacing = {
  xs: '0.25rem', // 4px
  sm: '0.5rem', // 8px
  md: '1rem', // 16px
  lg: '1.5rem', // 24px
  xl: '2rem', // 32px
  '2xl': '3rem', // 48px

  // Component specific
  card: '1.5rem', // p-6
  section: '2rem', // gap-8
  items: '1rem', // gap-4
} as const;

export const radius = {
  sm: '0.25rem', // 4px
  md: '0.5rem', // 8px
  lg: '0.75rem', // 12px
  xl: '1rem', // 16px - rounded-2xl equivalent
  '2xl': '1rem',
  full: '9999px',
} as const;

export const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px rgba(0, 0, 0, 0.15)',
  lg: '0 10px 25px rgba(0, 0, 0, 0.2)',
  glow: '0 0 20px rgba(19, 91, 236, 0.3)',
  card: '0 1px 3px rgba(0, 0, 0, 0.1)',
  cardHover: '0 4px 12px rgba(0, 0, 0, 0.15)',
} as const;

export const transitions = {
  fast: '150ms ease-out',
  normal: '200ms ease-out',
  slow: '300ms ease-out',
} as const;

// Tailwind class helpers
export const tw = {
  // Card styles
  card: 'rounded-2xl bg-white dark:bg-[#1A2233] border border-[#e6e8eb] dark:border-[#2e374a] shadow-sm hover:shadow-md transition-shadow',
  cardNoBorder: 'rounded-2xl bg-white dark:bg-[#1A2233] shadow-sm hover:shadow-md transition-shadow',

  // Surface styles
  surface: 'bg-white dark:bg-[#1A2233]',
  surfaceDarker: 'bg-[#f0f2f5] dark:bg-[#111722]',

  // Text styles
  textPrimary: 'text-[#111418] dark:text-white',
  textSecondary: 'text-[#637588] dark:text-[#92a4c9]',
  textMuted: 'text-[#9ca3af] dark:text-[#6e85a3]',

  // Border styles
  border: 'border-[#e6e8eb] dark:border-[#2e374a]',

  // Button styles
  btnPrimary: 'bg-[#135bec] hover:bg-[#1048c7] text-white font-bold rounded-lg shadow-lg shadow-[#135bec]/20 transition-all',
  btnSecondary: 'bg-[#f0f2f5] dark:bg-[#111722] hover:bg-[#e4e6e9] dark:hover:bg-[#1a2233] text-[#111418] dark:text-white rounded-lg transition-colors',

  // Badge styles
  badgeSuccess: 'bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-bold px-2 py-1 rounded-full',
  badgeDanger: 'bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-bold px-2 py-1 rounded-full',
  badgeWarning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold px-2 py-1 rounded-full',

  // Input styles
  input: 'bg-white dark:bg-[#111722] border border-[#e6e8eb] dark:border-[#2e374a] rounded-lg px-4 py-2 text-[#111418] dark:text-white placeholder-[#9ca3af] dark:placeholder-[#6e85a3] focus:outline-none focus:ring-2 focus:ring-[#135bec] focus:border-transparent transition-all',

  // Icon container
  iconContainer: 'size-10 rounded-full flex items-center justify-center',
  iconPrimary: 'bg-[#135bec]/10 text-[#135bec]',
  iconSuccess: 'bg-green-500/10 text-green-500',
  iconDanger: 'bg-red-500/10 text-red-500',
} as const;

// Export everything as default for convenience
export default {
  colors,
  typography,
  spacing,
  radius,
  shadows,
  transitions,
  tw,
};
