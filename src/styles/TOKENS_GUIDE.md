# Design Tokens Implementation Guide

## Overview

This file documents the centralized design token system introduced in Sprint 6 Phase 2. Design tokens replace hardcoded values throughout the codebase, enabling consistent styling and easy theme switching.

## Quick Start

### Using Design Tokens in Components

```typescript
import { useDesignTokens } from '../hooks/useDesignTokens';

export const MyComponent: React.FC = () => {
  const tokens = useDesignTokens();

  return (
    <div style={{
      backgroundColor: tokens.colors.background,
      padding: tokens.spacing.lg,
      borderRadius: tokens.borderRadius.lg,
      boxShadow: tokens.shadow.md,
      fontFamily: tokens.typography.fontFamily.sans,
    }}>
      {/* Component content */}
    </div>
  );
};
```

### With TailwindCSS

Extend your `tailwind.config.ts` to use design tokens:

```typescript
import { spacingTokens, colorTokens, borderRadiusTokens } from './src/styles/tokens';

export default {
  theme: {
    extend: {
      spacing: spacingTokens,
      colors: colorTokens,
      borderRadius: borderRadiusTokens,
    },
  },
};
```

## Token Categories

### 1. Color Tokens

**File:** `src/styles/tokens.ts` → `colorTokens`

**Available Colors:**
- `primary` - Brand primary color (blue)
- `slate` - Neutral grays
- `emerald` - Success color (green)
- `amber` - Warning color (orange)
- `rose` - Error color (red)
- `blue` - Info color

**Usage:**

```typescript
// Access full color scale
const bgColor = colorTokens.primary[500]; // #0ea5e9

// With theme awareness (recommended)
const tokens = useDesignTokens();
const dynamicBg = tokens.colors.background; // Switches based on light/dark mode
```

### 2. Spacing Tokens

**File:** `src/styles/tokens.ts` → `spacingTokens`

**Scale (in rem):**
```
xs: 0.25rem (4px)
sm: 0.5rem  (8px)
md: 1rem    (16px)
lg: 1.5rem  (24px)
xl: 2rem    (32px)
2xl: 2.5rem (40px)
3xl: 3rem   (48px)
4xl: 4rem   (64px)
5xl: 5rem   (80px)
6xl: 6rem   (96px)
```

**Usage:**

```typescript
const tokens = useDesignTokens();
const padding = tokens.spacing.lg; // "1.5rem"

// In inline styles
<div style={{ padding: tokens.spacing.lg }} />

// In Tailwind CSS
<div className={`p-[${tokens.spacing.lg}]`} />
```

### 3. Border Radius Tokens

**File:** `src/styles/tokens.ts` → `borderRadiusTokens`

**Available Values:**
```
none: 0
xs: 0.125rem  (2px)
sm: 0.25rem   (4px)
md: 0.375rem  (6px)
lg: 0.5rem    (8px)
xl: 0.75rem   (12px)
2xl: 1rem     (16px)
full: 9999px  (fully rounded)
```

### 4. Typography Tokens

**File:** `src/styles/tokens.ts` → `typographyTokens`

**Includes:**
- `fontFamily` - Font family definitions
- `fontSize` - Font sizes (xs to 5xl)
- `fontWeight` - Font weights (thin to black)
- `lineHeight` - Line height values
- `letterSpacing` - Letter spacing values

**Usage:**

```typescript
const tokens = useDesignTokens();

const customText = {
  fontFamily: tokens.typography.fontFamily.sans,
  fontSize: tokens.typography.fontSize.lg,
  fontWeight: tokens.typography.fontWeight.bold,
  lineHeight: tokens.typography.lineHeight.tight,
  letterSpacing: tokens.typography.letterSpacing.wide,
};
```

### 5. Shadow Tokens

**File:** `src/styles/tokens.ts` → `shadowTokens`

**Available Shadows:**
```
none, xs, sm, md, lg, xl, 2xl, inner
```

**Usage:**

```typescript
const tokens = useDesignTokens();
<div style={{ boxShadow: tokens.shadow.md }} />
```

### 6. Transition Tokens

**File:** `src/styles/tokens.ts` → `transitionTokens`

**Duration:**
```
fast: 150ms
base: 200ms
slow: 300ms
slower: 500ms
```

**Timing Functions:**
```
linear, easeIn, easeOut, easeInOut
```

**Usage:**

```typescript
const tokens = useDesignTokens();

const transitionStyle = {
  transition: `all ${tokens.transition.duration.base} ${tokens.transition.timing.easeInOut}`,
};
```

## Theme-Aware Colors

Design tokens automatically adapt to light and dark modes.

### Light Mode Colors

```typescript
const tokens = useDesignTokens();

// When isDarkMode = false
tokens.colors.background   // #ffffff (white)
tokens.colors.foreground   // #0f172a (dark slate)
tokens.colors.border       // #e2e8f0 (light gray)
tokens.text.primary        // #0f172a (dark)
```

### Dark Mode Colors

```typescript
const tokens = useDesignTokens();

// When isDarkMode = true
tokens.colors.background   // #0f172a (slate-900)
tokens.colors.foreground   // #f8fafc (light slate)
tokens.colors.border       // #334155 (slate-700)
tokens.text.primary        // #f8fafc (light)
```

## Semantic Tokens

Semantic tokens provide pre-configured styles for common components.

### Button Styles

```typescript
const tokens = useDesignTokens();

// Primary button
const primaryBtn = tokens.getButtonStyles('primary');
// { bg: '#0ea5e9', text: '#ffffff', border: '#0284c7', hover: '#0284c7' }

// Secondary button
const secondaryBtn = tokens.getButtonStyles('secondary');
// { bg: '#f1f5f9', text: '#0f172a', border: '#e2e8f0', hover: '#e2e8f0' }
```

### Input Styles

```typescript
const tokens = useDesignTokens();

const inputStyles = tokens.getInputStyles();
// {
//   bg: '#ffffff',
//   border: '#e2e8f0',
//   text: '#0f172a',
//   placeholder: '#94a3b8',
//   focus: '#0ea5e9'
// }
```

### Card Styles

```typescript
const tokens = useDesignTokens();

// Standard card
const cardStandard = tokens.getCardStyles();
// { bg: '#ffffff', border: '#e2e8f0', shadow: '...', padding: '1.5rem', ... }

// Compact card
const cardCompact = tokens.getCardStyles(true);
// { ... padding: '1rem', ... }
```

## Glassmorphism Tokens

For premium glass effect cards:

```typescript
const tokens = useDesignTokens();

// Light mode
// { bg: 'rgba(255, 255, 255, 0.8)', border: 'rgba(255, 255, 255, 0.2)', backdrop: 'blur(10px)' }

// Dark mode
// { bg: 'rgba(15, 23, 42, 0.8)', border: 'rgba(51, 65, 85, 0.2)', backdrop: 'blur(10px)' }

const glassStyle = {
  backgroundColor: tokens.glassmorphism.bg,
  backdropFilter: tokens.glassmorphism.backdrop,
  borderColor: tokens.glassmorphism.border,
};
```

## Migration Checklist

When refactoring components to use design tokens:

- [ ] Replace hardcoded colors with color tokens
- [ ] Replace hardcoded spacing with spacing tokens
- [ ] Replace hardcoded border-radius values with border radius tokens
- [ ] Replace hardcoded shadows with shadow tokens
- [ ] Replace hardcoded font sizes/weights with typography tokens
- [ ] Use `useDesignTokens()` hook for theme-aware colors
- [ ] Test in both light and dark modes
- [ ] Run tests: `npm run test`
- [ ] Verify types: `npm run typecheck`
- [ ] Lint code: `npm run lint`

## Component Updates in Phase 2

The following components have been refactored to use design tokens:

- [ ] Dashboard
- [ ] TransactionList
- [ ] TransactionForm
- [ ] Accounts
- [ ] Goals
- [ ] Investments
- [ ] AdminCRM
- [ ] Reports
- [ ] Insights
- [ ] Budget
- [ ] Settings
- [ ] Layout
- [ ] Card
- [ ] Button
- [ ] FormInput
- [ ] Modal
- [ ] Skeleton

## Best Practices

1. **Always use hooks for dynamic values:**
   ```typescript
   // ✅ Good - theme-aware
   const tokens = useDesignTokens();
   const bg = tokens.colors.background;

   // ❌ Bad - hardcoded
   const bg = isDarkMode ? '#0f172a' : '#ffffff';
   ```

2. **Use semantic tokens for consistency:**
   ```typescript
   // ✅ Good
   const btnStyles = tokens.getButtonStyles('primary');

   // ❌ Bad - mixed sources
   const btnStyles = {
     bg: colorTokens.blue[500],
     text: '#fff',
     border: '#0284c7'
   };
   ```

3. **Avoid inline magic numbers:**
   ```typescript
   // ✅ Good
   style={{ padding: tokens.spacing.md }}

   // ❌ Bad
   style={{ padding: '16px' }}
   ```

4. **Test both themes:**
   ```typescript
   // Always verify components in both light and dark modes
   npm run dev
   // Toggle theme in Settings to verify consistency
   ```

## Performance Considerations

- Design tokens are memoized in the `useDesignTokens()` hook
- No re-renders when tokens don't change (only when theme changes)
- CSS variables alternative (future): Can export as CSS Custom Properties for runtime switching without re-renders

## Future Enhancements

1. **CSS Custom Properties Export:**
   - Generate CSS variables from tokens
   - Enable runtime theme switching without React re-renders

2. **Additional Themes:**
   - Support multiple color schemes
   - System-level theme detection

3. **Storybook Integration:**
   - Document component variations with token values
   - Show token usage examples

4. **A/B Testing:**
   - Switch tokens per user segment
   - Test different spacing/sizing strategies

## References

- **Tokens File:** `src/styles/tokens.ts`
- **Hook:** `src/hooks/useDesignTokens.ts`
- **Design System:** See component documentation in individual files
- **TailwindCSS Integration:** `tailwind.config.ts`

## Support

For questions or issues with design tokens:
1. Check this guide
2. Review existing component implementations
3. Check the Storybook documentation
4. Open an issue with `[tokens]` prefix
