# Hero Section — Quick Reference Card

**TL;DR** — Copy-paste specifications for rapid development

---

## Color Palette (Copy These Hex Codes)

```
Primary:         #3b82f6  (blue-600)
Primary Hover:   #2563eb  (blue-700)
Primary Active:  #1d4ed8  (blue-800)

Light Background: #f0f6ff  (blue-50)
White:           #ffffff

Text Primary:    #111827  (gray-950)
Text Secondary:  #374151  (gray-700)
Border:          #e5e7eb  (gray-200)

Disabled:        #cbd5e1  (slate-300)
Disabled Text:   #64748b  (slate-500)
```

---

## Typography (Copy These Sizes)

| Element | Desktop | Tablet | Mobile | Font | Weight | Line-Height |
|---------|---------|--------|--------|------|--------|-----------|
| Headline | 60px | 48px | 36px | Playfair Display | 700 | 1.2 |
| Subheading | 24px | 20px | 18px | Inter | 400 | 1.6 |
| Button Text | 16px | 16px | 16px | Inter | 600 | 1.5 |

---

## Spacing (Tailwind Classes)

```
Section padding:    py-20 (Desktop) → py-16 (Tablet) → py-12 (Mobile)
Headline gap:       mb-6 (Desktop) → mb-4 (Tablet) → mb-3 (Mobile)
Subheading gap:     mb-8 (Desktop) → mb-5 (Tablet) → mb-4 (Mobile)
Button gap (row):   gap-4 (Desktop/Tablet) → gap-2 (Mobile)
Buttons to scroll:  mt-16 (Desktop) → mt-12 (Tablet) → mt-8 (Mobile)
```

---

## Button Styles (Copy-Paste)

### Primary Button
```html
<!-- Default -->
<button class="bg-blue-600 hover:bg-blue-700 text-white font-semibold
               px-8 py-4 rounded-lg transition-all duration-300
               hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl
               focus:outline-none focus:ring-2 focus:ring-offset-2
               focus:ring-blue-400">
  Começar com Plataforma (R$99,90/mês)
</button>
```

### Secondary Button
```html
<!-- Default -->
<button class="border-2 border-blue-600 text-blue-600 hover:bg-blue-50
               font-semibold px-8 py-4 rounded-lg transition-all
               duration-300 hover:scale-105 active:scale-95
               focus:outline-none focus:ring-2 focus:ring-offset-2
               focus:ring-blue-400">
  Agendar Demo
</button>
```

---

## Animation Timings

```
Entrance (all elements):
├─ Duration: 0.8s (800ms)
├─ Easing: easeOut
├─ Headline delay: 0ms
├─ Subheading delay: 200ms
└─ Buttons delay: 400ms

Hover (buttons):
├─ Duration: 300ms
├─ Scale: 1.0 → 1.05
└─ Easing: ease-out

Active (buttons):
├─ Duration: 300ms
├─ Scale: 1.05 → 0.95
└─ Easing: ease-out

Scroll Indicator:
├─ Duration: 2s (loop)
├─ Y-offset: 0px → 10px → 0px
└─ Repeat: infinite (easeInOut)
```

---

## Responsive Breakpoints (Tailwind)

```
Mobile:  320px - 639px (no prefix, default)
Tablet:  640px - 767px (sm: prefix)
Tablet+: 768px - 1023px (md: prefix)
Desktop: 1024px+ (lg: prefix)

For Hero:
├─ Use md: for heading size changes
├─ Use sm:flex-row to show buttons side-by-side
└─ Use flex-col (default) for mobile stacked buttons
```

---

## Accessibility Checklist

```
✅ h1 for headline (only one per page)
✅ p for subheading (not h2)
✅ button elements (not div onClick)
✅ aria-label on buttons
✅ Focus ring visible (focus:ring-2)
✅ Color contrast > 4.5:1
✅ Touch targets 44px+ (buttons: 56px)
✅ No keyboard traps (Tab works correctly)
✅ aria-hidden="true" on decorative elements
✅ prefers-reduced-motion respected
```

---

## File Paths & Imports

```typescript
// Component location
src/components/landing/Hero.tsx

// Imports needed
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { LeadForm } from './LeadForm';

// Export
export const Hero: React.FC = () => { ... };
export default Hero;
```

---

## Component Props

```typescript
interface HeroProps {
  // Optional: customize if needed
  primaryButtonText?: string;      // Default: "Começar com Plataforma..."
  secondaryButtonText?: string;    // Default: "Agendar Demo"

  // Optional: callbacks
  onPrimaryClick?: (source: 'platform') => void;
  onSecondaryClick?: (source: 'demo') => void;
}

// Current implementation uses internal state
// No props required for MVP
```

---

## Testing Checklist

```bash
# Unit Tests
npm run test -- Hero.test.tsx

# Type checking
npm run typecheck

# Linting
npm run lint

# Lighthouse audit
npm run build && npm run preview
# Open DevTools → Lighthouse tab
```

**Target Scores:**
- Performance: > 90
- Accessibility: 100
- Best Practices: 95
- SEO: 95

---

## Browser Support

```
✅ Chrome 90+
✅ Firefox 88+
✅ Safari 14.1+
✅ Edge 90+

Features used:
├─ CSS Grid/Flexbox (full support)
├─ CSS Gradients (full support)
├─ Transform animations (full support)
├─ CSS Variables (full support)
└─ prefers-reduced-motion (full support)
```

---

## Performance Notes

```
Target: 60fps animations
├─ Use GPU-accelerated transforms (transform, opacity)
├─ Avoid layout-triggering properties (width, height)
└─ Use will-change sparingly: will-change: transform

No custom CSS needed:
├─ All styles via Tailwind utilities
├─ All animations via Framer Motion
└─ All icons via Lucide React
```

---

## Common Tasks

### Task: Change button text
```typescript
// In Hero.tsx
<button>Your new text here</button>
```

### Task: Change colors
```javascript
// In tailwind.config.js
colors: {
  primary: '#YOUR_HEX_CODE', // Change here
}

// Then use: bg-primary, text-primary, etc.
```

### Task: Adjust animation timing
```typescript
// In Hero.tsx
<motion.h1
  transition={{ duration: 0.6 }} // Change 0.8 to whatever
>
```

### Task: Change button sizes
```html
<!-- Change py-4 and px-8 to your values -->
<!-- py-4 = 16px vertical, px-8 = 32px horizontal -->
<button class="px-6 py-3">Smaller button</button>
<button class="px-10 py-5">Larger button</button>
```

### Task: Disable animations (for accessibility)
```typescript
import { useReducedMotion } from 'framer-motion';

const shouldReduceMotion = useReducedMotion();

<motion.h1
  transition={{
    duration: shouldReduceMotion ? 0 : 0.8,
  }}
>
```

---

## Debugging Tips

### Button not responding to click?
```typescript
// Check:
1. onClick handler is defined
2. onClick={() => handleOpenForm('platform')}
3. setIsFormOpen(true) is being called
4. LeadForm isOpen prop is set correctly
5. LeadForm onClose prop closes the modal
```

### Animations not smooth?
```typescript
// Check:
1. Using transform (not top/left)
2. Using opacity (not visibility)
3. Duration > 200ms (too fast looks jerky)
4. 60fps target: Use DevTools → Performance tab
5. Check GPU acceleration: transform: translateY()
```

### Focus ring not visible?
```css
/* Check in DevTools: */
button:focus {
  outline: 2px solid #3b82f6;  /* Must be visible */
  outline-offset: 2px;
}

/* Apply in HTML: */
className="focus:outline-none focus:ring-2 focus:ring-blue-600"
```

### Responsive layout broken?
```html
<!-- Check media queries: -->
<h1 class="text-4xl md:text-5xl lg:text-6xl">
  <!-- Use: md: for 768px+, lg: for 1024px+ -->
</h1>

<div class="flex-col sm:flex-row">
  <!-- Mobile: column (default), 640px+: row (sm:) -->
</div>
```

---

## Resources

**Design Specification:**
- Full spec: `HERO_SECTION_DESIGN_SPEC.md`
- Design tool guide: `HERO_DESIGN_TOOL_GUIDE.md`

**Documentation:**
- SPFP Design System: `squads/transforme-landing-enhancement-squad/config/design-system.md`
- Landing Page Setup: `LANDING_PAGE_SETUP.md`
- CLAUDE.md: Project guidelines & architecture

**Tools:**
- Color contrast checker: https://webaim.org/resources/contrastchecker/
- Responsiveness tester: https://responsivedesignchecker.com/
- Animation performance: DevTools → Performance tab (record)

---

## Quick Command Reference

```bash
# Start dev server
npm run dev

# Type checking
npm run typecheck

# Linting
npm run lint:fix

# Testing
npm run test -- Hero.test.tsx

# Build production
npm run build

# Preview build
npm run preview
```

---

## Design Specification Links

- ✅ **Full Specification:** `HERO_SECTION_DESIGN_SPEC.md` (18 sections, 400+ lines)
- ✅ **Design Tool Guide:** `HERO_DESIGN_TOOL_GUIDE.md` (12 sections)
- ✅ **Quick Reference:** This document
- 📁 **Figma File:** (shared with team)
- 🎨 **Design System:** `config/design-system.md` (comprehensive)

---

**Prepared by:** Luna, UX Designer
**Date:** 2026-02-23
**Status:** ✅ Production Ready
**Last Updated:** 2026-02-23

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-02-23 | Initial specification complete |

---

**Need clarification? Check the full `HERO_SECTION_DESIGN_SPEC.md` document.**
