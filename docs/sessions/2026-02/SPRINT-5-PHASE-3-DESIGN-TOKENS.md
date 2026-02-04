# Sprint 5 Phase 3: Design Tokens System Implementation 🎨

**Date:** February 4, 2026
**Phase:** 3 - Design Tokens + Polish (12h)
**Leads:** Uma (@ux-design-expert) + Dex (@dev)
**Story:** STY-022
**Status:** IMPLEMENTATION PHASE

---

## 🎯 MISSION: Complete Design Tokenization

**Objective:** Create centralized design token system for consistency, customization, and maintainability

**Timeline:** 12 hours
- Design Token System: 4h
- CSS Implementation: 3h
- Documentation: 5h

---

## 🎨 DESIGN TOKENS SPECIFICATION

### Color Palette Tokens

```typescript
// Semantic Colors
const colors = {
  // Brand
  primary: {
    50: '#eef2ff',
    100: '#e0e7ff',
    400: '#818cf8',
    500: '#6366f1',    // Main brand
    600: '#4f46e5',
    900: '#312e81',
  },

  // Accent
  accent: {
    50: '#eff6ff',
    400: '#38bdf8',
    500: '#3b82f6',    // Main accent
    600: '#2563eb',
  },

  // Status
  success: {
    50: '#f0fdf4',
    500: '#22c55e',    // Success
    700: '#15803d',
  },

  warning: {
    50: '#fffbeb',
    500: '#eab308',    // Warning
    700: '#b45309',
  },

  error: {
    50: '#fef2f2',
    500: '#ef4444',    // Error
    700: '#b91c1c',
  },

  // Neutral
  neutral: {
    0: '#ffffff',
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
  },

  // Dark mode
  dark: {
    bg: '#020617',           // Main background
    card: '#0f172a',         // Card background
    border: '#1e293b',       // Borders
    text: '#f8fafc',         // Primary text
    textSecondary: '#94a3b8' // Secondary text
  }
};
```

### Typography Tokens

```typescript
const typography = {
  // Font families
  family: {
    sans: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    serif: '"Georgia", serif',
    mono: '"Fira Code", monospace'
  },

  // Font sizes
  size: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem',// 30px
    '4xl': '2.25rem', // 36px
  },

  // Font weights
  weight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800
  },

  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2
  }
};
```

### Spacing Tokens

```typescript
const spacing = {
  // In rem (1rem = 16px)
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
};
```

### Shadow Tokens

```typescript
const shadows = {
  none: 'none',

  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',

  dark: {
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.4)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
  }
};
```

### Border & Radius Tokens

```typescript
const radius = {
  none: '0',
  sm: '0.125rem',   // 2px
  base: '0.375rem', // 6px
  md: '0.5rem',     // 8px
  lg: '0.75rem',    // 12px
  xl: '1rem',       // 16px
  '2xl': '1.5rem',  // 24px
  full: '9999px'
};

const borderWidth = {
  0: '0',
  1: '1px',
  2: '2px',
  4: '4px',
  8: '8px'
};
```

### Animation Tokens

```typescript
const transitions = {
  // Durations
  duration: {
    fastest: '75ms',
    faster: '100ms',
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms',
    slowest: '1000ms'
  },

  // Timing functions
  easing: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)'
  },

  // Common transitions
  standard: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)'
};
```

---

## 🎨 CSS VARIABLES IMPLEMENTATION

### New File: `src/styles/tokens.css`

```css
/* Design Tokens - CSS Variables */
:root {
  /* Color Palette */
  --color-primary: #6366f1;
  --color-primary-dark: #4f46e5;
  --color-accent: #3b82f6;
  --color-success: #22c55e;
  --color-warning: #eab308;
  --color-error: #ef4444;

  /* Neutral Colors */
  --color-white: #ffffff;
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-200: #e5e7eb;
  --color-gray-400: #9ca3af;
  --color-gray-600: #4b5563;
  --color-gray-900: #111827;

  /* Dark Mode */
  --color-dark-bg: #020617;
  --color-dark-card: #0f172a;
  --color-dark-border: #1e293b;
  --color-dark-text: #f8fafc;
  --color-dark-text-secondary: #94a3b8;

  /* Typography */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-bold: 700;
  --line-height-normal: 1.5;
  --line-height-tight: 1.2;

  /* Spacing */
  --spacing-1: 0.25rem;
  --spacing-2: 0.5rem;
  --spacing-4: 1rem;
  --spacing-6: 1.5rem;
  --spacing-8: 2rem;
  --spacing-12: 3rem;

  /* Shadows */
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);

  /* Radius */
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;

  /* Transitions */
  --transition-normal: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-fast: all 100ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* Dark Mode Overrides */
html.dark {
  --color-bg: var(--color-dark-bg);
  --color-card: var(--color-dark-card);
  --color-text: var(--color-dark-text);
  --color-text-secondary: var(--color-dark-text-secondary);
}
```

### Update: `index.css`

```css
/* Import Design Tokens */
@import './tokens.css';

/* Apply Tokens to Global Styles */
:root {
  /* Use tokens for consistency */
  font-family: var(--font-sans);
  font-size: var(--font-size-base);
  line-height: var(--line-height-normal);
  color: var(--color-text);
  background-color: var(--color-bg);
}

body {
  margin: 0;
  padding: 0;
  background-color: var(--color-dark-bg);
  color: var(--color-dark-text);
}

/* Button Tokens */
.btn {
  padding: var(--spacing-2) var(--spacing-4);
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-medium);
  transition: var(--transition-normal);
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
}

.btn-primary:hover {
  background-color: var(--color-primary-dark);
}

/* Card Tokens */
.card {
  background-color: var(--color-dark-card);
  border-radius: var(--radius-lg);
  padding: var(--spacing-6);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--color-dark-border);
}
```

---

## 📋 COMPONENT INTEGRATION

### Update Components to Use Tokens

```typescript
// Before: Hard-coded values
<div className="p-6 rounded-xl bg-[#0f172a] border border-gray-800">

// After: Token-based
<div className="p-[--spacing-6] rounded-[--radius-xl] bg-[--color-dark-card] border border-[--color-dark-border]">

// Or better: Tailwind extends
<div className="p-6 rounded-xl bg-card border border-border">
```

### Tailwind Config Extension

```typescript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        accent: 'var(--color-accent)',
        dark: {
          bg: 'var(--color-dark-bg)',
          card: 'var(--color-dark-card)',
          text: 'var(--color-dark-text)',
        }
      },
      spacing: {
        '1': 'var(--spacing-1)',
        '2': 'var(--spacing-2)',
        '4': 'var(--spacing-4)',
        '6': 'var(--spacing-6)',
        '8': 'var(--spacing-8)',
      },
      borderRadius: {
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
      },
      transitionDuration: {
        fast: 'var(--transition-fast)',
        normal: 'var(--transition-normal)',
        slow: 'var(--transition-slow)',
      }
    }
  }
};
```

---

## 🌙 DARK MODE SUPPORT

### Dynamic Theme Switching

```typescript
// useTheme hook
export const useTheme = () => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  return { isDark, setIsDark };
};
```

### CSS Variables Override

```css
/* Light mode */
html.light {
  --color-bg: var(--color-white);
  --color-card: var(--color-gray-100);
  --color-text: var(--color-gray-900);
  --color-text-secondary: var(--color-gray-600);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

/* Dark mode (default) */
html.dark {
  --color-bg: var(--color-dark-bg);
  --color-card: var(--color-dark-card);
  --color-text: var(--color-dark-text);
  --color-text-secondary: var(--color-dark-text-secondary);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.4);
}
```

---

## 📊 DESIGN TOKENS CHECKLIST

- [ ] 25+ color tokens defined
- [ ] Typography tokens (sizes, weights, families)
- [ ] Spacing system (4px baseline)
- [ ] Shadow tokens (6+ levels)
- [ ] Border radius tokens
- [ ] Animation tokens (transitions, durations)
- [ ] CSS variables file created
- [ ] Tailwind config extended
- [ ] Dark mode fully supported
- [ ] Components refactored to use tokens
- [ ] Documentation complete
- [ ] All tests passing
- [ ] Zero visual regressions

---

## 🎨 CUSTOMIZATION SUPPORT

### How Users Can Customize

```typescript
// Client-side customization
const customTheme = {
  primaryColor: '#ff0000',
  accentColor: '#00ff00',
  fontFamily: 'Trebuchet MS',
  // ...
};

// Apply custom theme
function applyCustomTheme(theme: CustomTheme) {
  const root = document.documentElement;
  Object.entries(theme).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value);
  });
}
```

---

## 📈 EXPECTED BENEFITS

### Before Tokens
❌ Values scattered across components
❌ Hard to maintain consistency
❌ Theme changes require multiple edits
❌ Hard to customize

### After Tokens
✅ Single source of truth
✅ Automatic consistency
✅ Theme changes in one place
✅ Easy customization
✅ Better maintainability
✅ Improved developer experience

---

## 🚀 NEXT STEPS

### Phase 3.1: Token System Creation (4h)
- Create CSS variables file
- Define all token values
- Tailwind config extension

### Phase 3.2: CSS Implementation (3h)
- Update global styles
- Apply tokens to components
- Dark mode testing

### Phase 3.3: Documentation (5h)
- Token library documentation
- Usage guide
- Customization guide
- Component examples

---

**Created by:** Uma (@ux-design-expert) + Dex (@dev)
**Date:** February 4, 2026
**Status:** SPECIFICATION COMPLETE - IMPLEMENTATION STARTING
