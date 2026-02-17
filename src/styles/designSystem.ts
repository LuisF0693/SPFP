/**
 * Design System for CRM UI
 * Consistent color palette, typography, spacing, and shadows
 */

export const designSystem = {
  // Color Palette
  colors: {
    // Primary & Accent
    primary: '#6366F1', // Indigo
    accent: '#6366F1',

    // Semantic Colors
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',

    // Gray Palette (Dark Mode)
    bg: {
      primary: '#0f1419',     // Main background
      secondary: '#1a1f2e',   // Cards
      tertiary: '#232d3f',    // Hover states
    },
    text: {
      primary: '#ffffff',
      secondary: '#9CA3AF',
      tertiary: '#6B7280',
    },
    border: '#374151',

    // Status Colors
    status: {
      healthy: '#10B981',    // Emerald
      warning: '#F59E0B',    // Amber
      risk: '#EF4444',       // Red
    }
  },

  // Typography
  typography: {
    fontFamily: {
      base: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
      mono: '"Fira Code", "Courier New", monospace',
    },

    fontSize: {
      xs: '0.75rem',      // 12px
      sm: '0.875rem',     // 14px
      base: '1rem',       // 16px
      lg: '1.125rem',     // 18px
      xl: '1.25rem',      // 20px
      '2xl': '1.5rem',    // 24px
      '3xl': '1.875rem',  // 30px
      '4xl': '2.25rem',   // 36px
      '5xl': '3rem',      // 48px
    },

    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      black: 900,
    },

    lineHeight: {
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2,
    }
  },

  // Spacing
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
  },

  // Border Radius
  radius: {
    sm: '0.375rem',     // 6px
    md: '0.5rem',       // 8px
    lg: '1rem',         // 16px
    xl: '1.5rem',       // 24px
    '2xl': '2rem',      // 32px
    '3xl': '2.5rem',    // 40px
    full: '9999px',
  },

  // Shadows
  shadows: {
    // Glassmorphism shadows
    glass: '0 8px 32px rgba(0, 0, 0, 0.1)',
    'glass-lg': '0 20px 60px rgba(0, 0, 0, 0.2)',
    'glass-xl': '0 25px 60px rgba(0, 0, 0, 0.3)',

    // Regular shadows
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.1)',
    '2xl': '0 25px 50px rgba(0, 0, 0, 0.25)',

    // Glow effect (for accent color)
    glow: '0 0 20px rgba(99, 102, 241, 0.3)',
    'glow-lg': '0 0 30px rgba(99, 102, 241, 0.4)',
  },

  // Transitions
  transitions: {
    fast: '150ms ease-in-out',
    base: '200ms ease-in-out',
    slow: '300ms ease-in-out',
    slower: '500ms ease-in-out',
  },

  // Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Responsive Grid
  grid: {
    mobile: 1,      // 1 column on mobile
    tablet: 2,      // 2 columns on tablet
    desktop: 3,     // 3 columns on desktop
  },

  // Z-index scale
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modal: 1040,
    popover: 1050,
    tooltip: 1060,
  }
};

// CSS Custom Properties (for Tailwind integration)
export const getCSSVariables = () => ({
  '--color-primary': designSystem.colors.primary,
  '--color-accent': designSystem.colors.accent,
  '--color-bg-primary': designSystem.colors.bg.primary,
  '--color-bg-secondary': designSystem.colors.bg.secondary,
  '--color-text-primary': designSystem.colors.text.primary,
  '--color-text-secondary': designSystem.colors.text.secondary,
  '--shadow-glass': designSystem.shadows.glass,
  '--shadow-glow': designSystem.shadows.glow,
} as any);

export type DesignSystem = typeof designSystem;
