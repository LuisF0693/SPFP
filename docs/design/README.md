# SPFP FASE 1 - DESIGN SYSTEM & MOCKUPS

**Created by:** Luna - UX/UI Design Expert
**Date:** Fevereiro 2026
**Project:** SPFP (Sistema de Planejamento Financeiro Pessoal)
**Status:** READY FOR DEVELOPMENT

---

## 📋 OVERVIEW

This directory contains **complete design specifications** for 3 major features of **FASE 1**:

1. **Sidebar Redesign** (STY-052, 053, 054, 055) - Collapsible sections with Orçamento, Contas, Lançamentos, Parcelamentos
2. **Realistic Credit Card Visual** (STY-061) - Premium 3D card display with cardholder name & bank info
3. **Retirement DashPlan Dashboard** (STY-067) - Multi-scenario chart with 3% / 5% / 7% return projections

**Design System:**
- Design Tokens: `src/styles/tokens.ts` (already implemented)
- Glassmorphism aesthetic with dark mode
- Responsive mobile-first (320px, 768px, 1440px)
- WCAG 2.1 AA accessibility compliance

---

## 📁 FILES INCLUDED

### 1. FASE-1-MOCKUPS.md (4500+ lines)
**The Main Design Document**

Comprehensive visual specifications including:
- Desktop layouts (1440px) with detailed wireframes
- Mobile layouts (375px, 768px) with drawer interactions
- State changes & animations (expand/collapse, reveal, hover)
- Design tokens reference (colors, spacing, typography)
- Component mapping for developers
- Accessibility guidelines (WCAG AA)

**Use When:**
- Understanding overall visual design
- Need color codes, spacing values
- Designing responsive behavior
- Planning animations/transitions

**Sections:**
```
├─ Feature 1: Sidebar Redesign (STY-052 onwards)
│  ├─ Desktop layout with 4 sections
│  ├─ Mobile drawer implementation
│  ├─ State changes & animations
│  └─ Accessibility (keyboard nav, ARIA)
│
├─ Feature 2: Credit Card Visual (STY-061)
│  ├─ Card dimensions & perspective
│  ├─ Gradient by bank & person (A/B)
│  ├─ States: active, blocked, expired, revealed
│  ├─ 3D hover effect & reveal animation
│  └─ Mobile card scaling
│
├─ Feature 3: Retirement Dashboard (STY-067)
│  ├─ Full-page layout with chart
│  ├─ DashPlan-style line chart (3 scenarios)
│  ├─ Scenario comparison cards
│  ├─ Progress milestones
│  └─ Edit goal modal
│
├─ Design Specifications
│  ├─ Color palette (6 colors + neutrals)
│  ├─ Typography system (font stack, sizes, weights)
│  ├─ Spacing system (8px base unit)
│  ├─ Border radius scale
│  ├─ Shadows (8 levels)
│  └─ Animations & transitions
│
├─ Component Mapping for Dev
│  └─ File structure, component hierarchy
│
└─ Accessibility & WCAG AA Compliance
   └─ Contrast, keyboard nav, ARIA labels
```

---

### 2. COMPONENT-SPECS.md (3000+ lines)
**Implementation-Ready Component Details**

Ready-to-code component specifications with:
- TypeScript interfaces for all components
- HTML/JSX structure examples
- TailwindCSS class references
- Event handler patterns
- State management examples
- CSS animation code

**Use When:**
- Creating React components
- Implementing specific UI elements
- Needing exact TypeScript types
- Writing component event handlers

**Components Documented:**
```
Sidebar Components:
├─ SidebarSection (container)
├─ SidebarBudgetSection (progress bars)
├─ SidebarAccountsSection (account list)
├─ SidebarTransactionsSection (pending)
├─ SidebarInstallmentsSection (grouped)
└─ SidebarDrawer (mobile)

Credit Card Components:
├─ CreditCardDisplay (main container)
├─ CardFace (gradient background)
├─ CardNumberDisplay (masked/revealed)
├─ CardRevealToggle (checkbox)
├─ CardCarouselIndicators (if multiple)
└─ CardStateOverlay (blocked/expired)

Retirement Components:
├─ RetirementDashPlanChart (Recharts)
├─ RetirementScenarioCards (comparison)
└─ RetirementMilestones (progress bars)

Reusable Patterns:
├─ ProgressBar (utility)
└─ StatusBadge (utility)
```

---

### 3. ACCESSIBILITY-CHECKLIST.md (2500+ lines)
**WCAG 2.1 AA Compliance Guide**

Complete accessibility testing & implementation guide:
- WCAG 2.1 AA criteria mapping (Perceivable, Operable, Understandable, Robust)
- Contrast ratio requirements (4.5:1 minimum)
- Keyboard navigation patterns (Tab, Enter, Arrow keys, ESC)
- Screen reader testing procedures (NVDA, JAWS, VoiceOver)
- Focus management & indicators
- Motion & animation accessibility
- ARIA labels & semantic HTML
- Testing procedures (automated + manual)

**Use When:**
- Before merging any PR
- Testing accessibility
- Verifying keyboard navigation
- Ensuring contrast compliance
- Screen reader compatibility

**Test Categories:**
```
✓ Color Contrast (4.5:1 minimum)
✓ Keyboard Navigation (Tab, Enter, Space, Arrow, ESC)
✓ Focus Indicators (2px solid outline, always visible)
✓ Screen Reader (ARIA labels, semantic HTML)
✓ Motion Accessibility (respects prefers-reduced-motion)
✓ Touch Targets (44x44px minimum)
✓ Text Sizing (responsive, scalable)
✓ Form Accessibility (labels, hints, errors)
✓ Modal Focus Trap (Tab cycles within, ESC closes)
✓ Responsive Design (no horizontal scroll at 200% zoom)
```

---

### 4. DEVELOPER-HANDOFF.md (2000+ lines)
**Quick Start Guide for @dex**

Handoff document specifically for developers:
- Executive summary of what's being delivered
- Quick start checklist
- File structure to create
- Key implementation patterns (with code examples)
- Design tokens quick reference
- Testing before PR checklist
- Timeline & effort estimates
- Critical reminders (what to do/not do)

**Use When:**
- Starting development
- Need quick reference
- Questions about approach
- Checking tokens to use

---

## 🎨 DESIGN SYSTEM REFERENCE

### Colors (From Design Tokens)

```
Primary (Blue):     #0ea5e9  (primary-500)
Success (Green):    #22c55e  (emerald-500)
Warning (Orange):   #f59e0b  (amber-500)
Error (Red):        #f43f5e  (rose-500)
Info (Blue):        #3b82f6  (blue-500)
Neutral (Gray):     #f8fafc to #0f172a (slate scale)
```

### Spacing (Base 4px = 0.25rem)

```
xs: 4px     sm: 8px     md: 16px    lg: 24px
xl: 32px    2xl: 40px   3xl: 48px   4xl: 64px
```

### Typography

```
Base font: Inter (sans-serif)
Size range: 12px (xs) to 48px (5xl)
Weights: 300-900 (light to black)
Line height: 1.5 minimum
Letter spacing: 0.02em minimum
```

### Animations

```
Durations: 150ms (fast), 200ms (base), 300ms (slow), 500ms (slower)
Timing: linear, easeIn, easeOut, easeInOut
Max: 300ms for standard interactions
Respects: prefers-reduced-motion media query
```

---

## ✅ QUALITY GATES

### Before PR Merge

- [ ] **Design Tokens Used:** All colors/spacing from tokens system
- [ ] **Responsive:** Works at 375px, 768px, 1440px
- [ ] **Dark Mode:** Tested with theme toggle
- [ ] **Keyboard Nav:** Tab through all elements, Enter/Space activates
- [ ] **Focus Visible:** 2px outline always visible
- [ ] **Contrast:** 4.5:1 minimum (use color picker)
- [ ] **Screen Reader:** NVDA/VoiceOver compatible
- [ ] **Lighthouse:** Accessibility score ≥ 90
- [ ] **Zoom:** 200% zoom test, no horizontal scroll
- [ ] **Mobile Touch:** 44x44px target sizes

### Test Commands

```bash
npm run typecheck      # Type checking
npm run lint           # Linting
npm run test           # Unit tests
npm run lighthouse     # Accessibility audit
```

---

## 🚀 GETTING STARTED

### 1. Read (90 minutes total)

```
Week 1:
├─ FASE-1-MOCKUPS.md (30 min - overview & visuals)
├─ COMPONENT-SPECS.md (30 min - implementation details)
└─ DEVELOPER-HANDOFF.md (10 min - quick reference)

Keep for reference:
└─ ACCESSIBILITY-CHECKLIST.md (use during dev & before PR)
```

### 2. Review Existing Code (20 minutes)

```bash
# Check design tokens
cat src/styles/tokens.ts

# Check existing components
ls src/components/ui/

# Check how dark mode works
grep -r "useDesignTokens" src/components/ui/
```

### 3. Create Feature Branch

```bash
git checkout -b feature/STY-052-sidebar-redesign
```

### 4. Build Components

```
For each feature:
1. Create folder in src/components/
2. Create component files
3. Use interfaces from COMPONENT-SPECS.md
4. Import design tokens
5. Style with TailwindCSS classes
6. Test accessibility (keyboard, screen reader, contrast)
7. Submit PR with evidence
```

### 5. Submit PR with Checklist

```markdown
## Accessibility Verified
- [x] Keyboard nav (Tab, Enter, Space, Arrow, ESC)
- [x] Screen reader compatible (ARIA labels)
- [x] Contrast ≥ 4.5:1
- [x] Focus visible (2px outline)
- [x] Responsive (375px, 768px, 1440px)
- [x] Dark mode tested
- [x] Lighthouse ≥ 90

## Attachments
- Screenshot (desktop + mobile)
- Evidence of testing
```

---

## 📞 CONTACT FOR CLARIFICATIONS

**Questions during development?**

- Design unclear → @luna
- Accessibility questions → ACCESSIBILITY-CHECKLIST.md first, then @luna
- Token missing → Check src/styles/tokens.ts, then @luna
- Component specification unclear → COMPONENT-SPECS.md first, then @luna

---

## 📊 EFFORT ESTIMATE

| Feature | Hours | Components |
|---------|-------|------------|
| STY-052 Sidebar Layout | 8 | SidebarSection, Layout modify |
| STY-053 Budget Section | 7 | SidebarBudgetSection |
| STY-054 Accounts Section | 5 | SidebarAccountsSection |
| STY-055 Transactions Section | 6 | SidebarTransactionsSection |
| STY-056 Mobile Drawer | 5 | SidebarDrawer |
| STY-061 Credit Card Visual | 8 | CreditCardDisplay, CardFace, CardReveal |
| STY-067 Retirement Dashboard | 10 | RetirementChart, ScenarioCards, Milestones |
| **TOTAL FASE 1** | **~50-60h** | **15 components** |

---

## 🎯 SUCCESS CRITERIA

### Visual Design
- ✅ Desktop layout matches FASE-1-MOCKUPS.md
- ✅ Mobile responsive (375px, 768px)
- ✅ Dark mode working
- ✅ Glassmorphism effect visible (blur, transparency)

### Functionality
- ✅ Sidebar sections expand/collapse
- ✅ Credit card reveal animation works
- ✅ Retirement chart shows 3 scenarios
- ✅ All buttons/links functional

### Accessibility
- ✅ WCAG 2.1 AA compliant
- ✅ Keyboard navigable
- ✅ Screen reader compatible
- ✅ Contrast ≥ 4.5:1
- ✅ Touch targets ≥ 44x44px

### Code Quality
- ✅ Uses design tokens
- ✅ TailwindCSS classes
- ✅ TypeScript types defined
- ✅ No console errors
- ✅ Lighthouse ≥ 90

---

## 📚 RELATED DOCUMENTATION

**Project:**
- `CLAUDE.md` - Project overview & architecture
- `src/styles/tokens.ts` - Design tokens system
- `src/styles/TOKENS_GUIDE.md` - How to use tokens

**Stories:**
- `docs/stories/ROADMAP-STY-051-085.md` - Full FASE 1 breakdown
- `docs/stories/story-022-design-tokens.md` - Design tokens story

---

## 📝 DOCUMENT VERSIONS

| Document | Version | Date | Status |
|----------|---------|------|--------|
| FASE-1-MOCKUPS.md | 1.0 | 2026-02-05 | Ready |
| COMPONENT-SPECS.md | 1.0 | 2026-02-05 | Ready |
| ACCESSIBILITY-CHECKLIST.md | 1.0 | 2026-02-05 | Ready |
| DEVELOPER-HANDOFF.md | 1.0 | 2026-02-05 | Ready |
| README.md | 1.0 | 2026-02-05 | Ready |

---

## 🎉 YOU'RE ALL SET!

All design work is complete. The mockups, specifications, and accessibility guidelines are ready for development.

**Next:** @dex starts building! Follow DEVELOPER-HANDOFF.md for quick start.

---

**Prepared by:** Luna - UX/UI Design Expert
**For:** @dex - Full-Stack Developer
**Date:** Fevereiro 2026
**Status:** ✅ READY FOR IMPLEMENTATION

For questions, contact Luna via Slack or in PR comments.

