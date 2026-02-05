# SPFP FASE 1 - HANDOFF TO DEV (@dex)

**From:** Luna - UX/UI Design Expert
**To:** @dex - Full-Stack Developer
**Date:** Fevereiro 2026
**Status:** READY FOR IMPLEMENTATION

---

## EXECUTIVE SUMMARY

You have received complete design specifications for **3 major features** of FASE 1:

1. **Sidebar Redesign (STY-052, 053, 054, 055)** - Collapsible sections
2. **Credit Card Visual (STY-061)** - Realistic 3D card display
3. **Retirement Dashboard (STY-067)** - DashPlan-style chart with scenarios

All designs follow:
- ✅ TailwindCSS + Design Tokens system (already implemented)
- ✅ Glassmorphism dark mode aesthetic
- ✅ WCAG 2.1 AA accessibility standards
- ✅ Responsive mobile-first approach (320px, 768px, 1440px)

---

## DOCUMENTS DELIVERED

### 1. FASE-1-MOCKUPS.md (Primary Reference)

**Use this for:**
- Overall visual design
- Layout specifications
- Color palette & typography
- Responsive breakpoints
- State changes & animations
- Design tokens mapping

**Key Sections:**
```
├─ Feature 1: Sidebar Redesign (desktop, mobile, drawer)
├─ Feature 2: Credit Card Visual (3D, states, reveal animation)
├─ Feature 3: Retirement DashPlan (chart, scenarios, milestones)
├─ Design Specifications (colors, spacing, typography, shadows)
├─ Component Mapping for Dev (file structure, hierarchy)
└─ Accessibility (WCAG AA compliance)
```

**Find:** Color codes, spacing values, animation durations
**Reference:** When styling components with TailwindCSS

---

### 2. COMPONENT-SPECS.md (Implementation Guide)

**Use this for:**
- Component interfaces (TypeScript)
- HTML structure examples
- CSS class references
- Event handlers
- State management patterns
- Data flow

**Key Sections:**
```
├─ SidebarSection (container wrapper)
├─ SidebarBudgetSection (category progress)
├─ SidebarAccountsSection (account list)
├─ SidebarTransactionsSection (pending transactions)
├─ SidebarInstallmentsSection (grouped installments)
├─ SidebarDrawer (mobile drawer)
├─ CreditCardDisplay (card container)
├─ CardFace (3D perspective)
├─ CardRevealToggle (show/hide number)
├─ RetirementDashPlanChart (Recharts implementation)
├─ RetirementScenarioCards (comparison cards)
├─ RetirementMilestones (progress bars)
└─ Reusable Patterns (ProgressBar, StatusBadge)
```

**Find:** Exact TypeScript interfaces, event handlers, sub-components
**Reference:** When creating component files

---

### 3. ACCESSIBILITY-CHECKLIST.md (Quality Gate)

**Use this for:**
- WCAG 2.1 AA compliance verification
- Testing procedures (automated + manual)
- Keyboard navigation requirements
- Screen reader testing
- Color contrast validation
- Focus management

**Before Merging PR:**
```
1. Run Lighthouse: npm run lighthouse
2. Check keyboard: Unplug mouse, test with Tab/Enter/Arrow/ESC
3. Test screen reader: NVDA or VoiceOver
4. Verify zoom: 200% zoom test
5. Mobile touch: 44x44px targets
```

**Expected Scores:**
- Lighthouse Accessibility: ≥ 90
- Contrast Ratio: ≥ 4.5:1
- Focus visible: Always
- Keyboard accessible: 100%

---

## QUICK START CHECKLIST

### ✅ Pre-Implementation

- [ ] Read FASE-1-MOCKUPS.md (full overview)
- [ ] Read COMPONENT-SPECS.md (implementation details)
- [ ] Review design tokens: `src/styles/tokens.ts`
- [ ] Check existing components: `src/components/ui/`
- [ ] Set up branch: `git checkout -b feature/STY-052-sidebar-redesign`

### ✅ Development Workflow

**For Each Feature:**

1. **Create feature branch:**
   ```bash
   git checkout -b feature/STY-XXX-feature-name
   ```

2. **Create component files:**
   - Follow file structure in "Component Mapping for Dev" section
   - Use interfaces from COMPONENT-SPECS.md
   - Import design tokens: `import { colorTokens, spacingTokens } from '../styles/tokens'`

3. **Style with TailwindCSS:**
   - Use tokens for all values
   - Follow CSS classes in COMPONENT-SPECS.md
   - Test in dark mode: Toggle in Settings

4. **Test accessibility:**
   - Keyboard nav: Tab through all elements
   - Screen reader: Read with NVDA
   - Contrast: Check with color picker
   - Focus: Verify 2px outline visible

5. **Create PR with:**
   - Link to story (STY-XXX)
   - Screenshot of desktop & mobile
   - Accessibility notes
   - Test evidence

---

## FILE STRUCTURE TO CREATE

```
src/components/
├─ sidebar/ (NEW folder)
│  ├─ SidebarSection.tsx
│  ├─ SidebarBudgetSection.tsx
│  ├─ SidebarAccountsSection.tsx
│  ├─ SidebarTransactionsSection.tsx
│  ├─ SidebarInstallmentsSection.tsx
│  └─ index.ts (export all)
│
├─ creditcard/ (NEW folder)
│  ├─ CreditCardDisplay.tsx
│  ├─ CardContainer.tsx
│  ├─ CardFace.tsx
│  ├─ CardRevealToggle.tsx
│  ├─ CardCarouselIndicators.tsx
│  ├─ CardStateOverlay.tsx
│  └─ index.ts (export all)
│
├─ retirement/ (NEW folder)
│  ├─ Retirement.tsx (main page component)
│  ├─ RetirementDashPlanChart.tsx (Recharts)
│  ├─ RetirementGoalForm.tsx (modal)
│  ├─ RetirementScenarioCards.tsx (comparison)
│  ├─ RetirementMilestones.tsx (progress)
│  └─ index.ts (export all)
│
├─ ui/ (existing folder - reuse where possible)
│  ├─ Card.tsx (already exists)
│  ├─ Modal.tsx (already exists)
│  ├─ Button.tsx (already exists)
│  ├─ FormInput.tsx (already exists)
│  ├─ ProgressBar.tsx (NEW - from COMPONENT-SPECS)
│  └─ StatusBadge.tsx (NEW - from COMPONENT-SPECS)
│
├─ Layout.tsx (MODIFY - add drawer for mobile)
├─ Dashboard.tsx (MODIFY - add retirement widget)
└─ ... existing components
```

---

## KEY IMPLEMENTATION PATTERNS

### 1. Use Design Tokens (ALWAYS)

**DON'T:**
```typescript
// ❌ Hardcoded color
const color = '#0ea5e9';

// ❌ Hardcoded spacing
const padding = '16px';
```

**DO:**
```typescript
// ✅ Use token imports
import { colorTokens, spacingTokens } from '../styles/tokens';

const color = colorTokens.primary[500];
const padding = spacingTokens.md;

// ✅ Or use TailwindCSS tokens already configured
className="p-4 bg-primary-500 text-white"
```

### 2. Responsive Design Pattern

**Sidebar (STY-052):**

```typescript
// Desktop: visible sidebar (always)
// Tablet (≥768px): visible sidebar
// Mobile (<768px): drawer

return (
  <>
    {/* Desktop Sidebar */}
    <aside className="hidden md:flex w-72 bg-card-dark ...">
      {/* Sections */}
    </aside>

    {/* Mobile Toggle Button */}
    <button className="md:hidden fixed top-4 left-4 z-40">
      {isDrawerOpen ? '✕' : '☰'}
    </button>

    {/* Mobile Drawer */}
    {isDrawerOpen && <SidebarDrawer onClose={toggleDrawer} />}
  </>
);
```

### 3. Collapsible Section Pattern (STY-052, 053, 054, 055)

```typescript
import { ChevronDown } from 'lucide-react';
import { SidebarSection } from './ui/SidebarSection';

export const SidebarBudgetSection: React.FC<Props> = ({ budgets, onCategoryClick }) => {
  const [isExpanded, setIsExpanded] = useState(true); // desktop default

  return (
    <SidebarSection
      id="budget"
      title="Orçamento"
      icon={<BarChart3 size={20} />}
      isExpanded={isExpanded}
      onToggle={setIsExpanded}
    >
      {/* Budget items */}
      {budgets.slice(0, 3).map(budget => (
        <button
          key={budget.id}
          onClick={() => onCategoryClick(budget.category)}
          className="w-full flex items-center gap-2 p-2 hover:bg-white/5 rounded transition-colors"
        >
          {/* Item content */}
        </button>
      ))}
    </SidebarSection>
  );
};
```

### 4. 3D Card Animation Pattern (STY-061)

```typescript
import { useState } from 'react';

export const CreditCardDisplay: React.FC<Props> = ({ card }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const rotateX = (y / rect.height - 0.5) * 15;
    const rotateY = (x / rect.width - 0.5) * -15;

    e.currentTarget.style.transform = `
      perspective(1000px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      scale(1.05)
    `;
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
      className="transition-transform duration-300"
    >
      {/* Card face */}
    </div>
  );
};
```

### 5. Recharts Pattern (STY-067)

```typescript
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ReferenceLine } from 'recharts';

export const RetirementDashPlanChart: React.FC<Props> = ({
  data,
  targetYear,
  selectedScenario,
}) => {
  return (
    <LineChart data={data} width="100%" height={400}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="year" />
      <YAxis tickFormatter={(v) => `R$ ${(v / 1000000).toFixed(1)}M`} />
      <Tooltip formatter={(v) => `R$ ${v.toLocaleString('pt-BR')}`} />
      <Legend />

      {/* Reference line at target year */}
      <ReferenceLine x={targetYear} stroke="#f43f5e" strokeDasharray="5 5" />

      {/* 3 scenario lines */}
      <Line
        dataKey="conservador"
        stroke={colorTokens.amber[500]}
        strokeWidth={selectedScenario === 'conservador' ? 4 : 2}
        opacity={selectedScenario === 'conservador' ? 1 : 0.4}
      />
      {/* ... other lines */}
    </LineChart>
  );
};
```

---

## DESIGN TOKENS QUICK REFERENCE

### Colors (Use These)

```typescript
import { colorTokens } from '../styles/tokens';

// Primary (Blue)
colorTokens.primary[500]        // #0ea5e9
colorTokens.primary[600]        // #0284c7

// Success (Green)
colorTokens.emerald[500]        // #22c55e

// Warning (Orange)
colorTokens.amber[500]          // #f59e0b

// Error (Red)
colorTokens.rose[500]           // #f43f5e

// Info (Blue alternative)
colorTokens.blue[500]           // #3b82f6

// Neutrals (Gray)
colorTokens.slate[50]           // #f8fafc (light bg)
colorTokens.slate[900]          // #0f172a (dark bg)
colorTokens.slate[400]          // #94a3b8 (text secondary)
```

### Spacing

```tailwind
// Use TailwindCSS classes (no need to import)
p-2  = 0.5rem (8px)     → spacingTokens.sm
p-3  = 0.75rem (12px)   → spacingTokens.md
p-4  = 1rem (16px)      → spacingTokens.md
p-6  = 1.5rem (24px)    → spacingTokens.lg
p-8  = 2rem (32px)      → spacingTokens.xl

gap-2 = 0.5rem
gap-3 = 0.75rem
gap-4 = 1rem
```

### Border Radius

```tailwind
rounded    = 0.25rem (4px)     → borderRadiusTokens.sm
rounded-lg = 0.5rem (8px)      → borderRadiusTokens.lg
rounded-xl = 0.75rem (12px)    → borderRadiusTokens.xl
rounded-2xl = 1rem (16px)      → borderRadiusTokens['2xl']
rounded-full = 9999px          → borderRadiusTokens.full
```

### Typography

```tailwind
text-xs   = 12px   → fontSize.xs
text-sm   = 14px   → fontSize.sm
text-base = 16px   → fontSize.base
text-lg   = 18px   → fontSize.lg
text-xl   = 20px   → fontSize.xl
text-2xl  = 24px   → fontSize['2xl']

font-normal = 400   → fontWeight.normal
font-medium = 500   → fontWeight.medium
font-semibold = 600 → fontWeight.semibold
font-bold = 700     → fontWeight.bold
```

### Shadows

```tailwind
shadow-sm = 0 1px 3px (slight)     → shadowTokens.sm
shadow-md = 0 4px 6px (standard)   → shadowTokens.md
shadow-lg = 0 10px 15px (raised)   → shadowTokens.lg
shadow-xl = 0 20px 25px (modal)    → shadowTokens.xl
```

---

## TESTING BEFORE PR

### Required Tests

```bash
# 1. Type checking
npm run typecheck

# 2. Linting
npm run lint

# 3. Unit tests (if created)
npm run test

# 4. Lighthouse accessibility
npm run lighthouse -- --only-categories=accessibility
```

### Manual Testing Checklist

- [ ] **Desktop (1440px):** All sections visible, no overflow
- [ ] **Tablet (768px):** Responsive, sidebar visible
- [ ] **Mobile (375px):** Drawer toggles, sections stack vertically
- [ ] **Dark mode:** Toggle Settings, verify colors inverted
- [ ] **Keyboard nav:** Tab through all elements, enter activates buttons
- [ ] **Focus visible:** 2px outline appears on Tab
- [ ] **Screen reader:** NVDA reads section headers and values
- [ ] **Contrast:** No text < 4.5:1 ratio (use color picker)
- [ ] **Zoom:** 200% zoom test, no horizontal scroll

### PR Template

```markdown
## Description
Implemented [Feature Name] for STY-XXX

## Related Stories
- [x] STY-XXX: Feature name

## Changes
- Added components: SidebarBudgetSection, etc.
- Modified: Layout.tsx (added drawer)
- New files: src/components/sidebar/

## Testing
- [x] Keyboard navigation working
- [x] Screen reader compatible
- [x] Lighthouse accessibility ≥ 90
- [x] Mobile responsive (375px, 768px, 1440px)
- [x] Dark mode tested
- [x] Contrast ratios ≥ 4.5:1

## Screenshots
[Desktop screenshot]
[Mobile screenshot]
[Dark mode screenshot]

## Questions for Luna
(Any design clarifications needed)
```

---

## CRITICAL REMINDERS

### ❌ DON'T DO

1. **Don't hardcode colors:**
   - ❌ `className="bg-blue-500"`
   - ✅ `className="bg-primary-500"`

2. **Don't use px for spacing:**
   - ❌ `padding: '16px'`
   - ✅ `className="p-4"` or `spacingTokens.md`

3. **Don't skip accessibility:**
   - ❌ Skip ARIA labels
   - ✅ Add `aria-label`, `aria-expanded`, `aria-controls`

4. **Don't break on mobile:**
   - ❌ Ignore responsive design
   - ✅ Test at 375px, 768px, 1440px

5. **Don't create focus traps:**
   - ❌ Tab key gets stuck
   - ✅ Test keyboard nav: Can Tab in/out of all elements

### ✅ DO DO

1. **Use existing components:**
   - Reuse `Card.tsx`, `Button.tsx`, `Modal.tsx`
   - Check `src/components/ui/` first

2. **Follow naming patterns:**
   - Component files: `PascalCase.tsx`
   - Folder structure: `lowercase/`
   - Files reflect story: `SidebarSection.tsx` for STY-052

3. **Test before PR:**
   - Lighthouse ≥ 90
   - Keyboard nav complete
   - Screen reader compatible
   - Mobile responsive

4. **Reference design system:**
   - Always check `src/styles/tokens.ts`
   - Always read COMPONENT-SPECS.md for interfaces
   - Always follow WCAG checklist before PR

5. **Communicate issues:**
   - Design unclear? Ask Luna immediately
   - Token missing? Check tokens.ts
   - Accessibility questions? See ACCESSIBILITY-CHECKLIST.md

---

## WHAT'S ALREADY DONE FOR YOU

✅ **Design Tokens System** (STY-022)
- All colors, spacing, typography defined
- File: `src/styles/tokens.ts`
- Already integrated with TailwindCSS

✅ **Dark Mode Support**
- Light/dark color tokens ready
- Hook: `useDesignTokens()` for theme-aware colors
- Settings toggle working

✅ **Responsive Framework**
- TailwindCSS breakpoints set (sm: 640px, md: 768px, lg: 1024px, xl: 1280px)
- Mobile-first approach enabled

✅ **Base Components**
- Card, Button, Modal, Input, Skeleton already built
- Located: `src/components/ui/`

✅ **Context & State**
- AuthContext (user session)
- FinanceContext (financial data)
- UIContext (dark mode)

---

## TIMELINE & EFFORT ESTIMATES

### STY-052: Sidebar Layout Redesign
- **Effort:** 8 hours
- **Files:** Layout.tsx (modify), SidebarSection.tsx (new)
- **Key:** Animation, collapsible state, responsive

### STY-053: Budget Section
- **Effort:** 7 hours
- **Files:** SidebarBudgetSection.tsx (new)
- **Key:** Progress bars, color logic, category click

### STY-054: Accounts Section
- **Effort:** 5 hours
- **Files:** SidebarAccountsSection.tsx (new)
- **Key:** Bank logos, balance formatting

### STY-055: Transactions Section
- **Effort:** 6 hours
- **Files:** SidebarTransactionsSection.tsx (new)
- **Key:** Status badges, quick confirm

### STY-056: Mobile Drawer
- **Effort:** 5 hours
- **Files:** SidebarDrawer.tsx (new)
- **Key:** Responsive, focus trap, backdrop

### STY-061: Credit Card Visual
- **Effort:** 8 hours
- **Files:** CreditCardDisplay.tsx, CardFace.tsx, CardRevealToggle.tsx (new)
- **Key:** 3D perspective, gradient, reveal animation

### STY-067: Retirement DashPlan Chart
- **Effort:** 10 hours
- **Files:** RetirementDashPlanChart.tsx, scenarios, milestones (new)
- **Key:** Recharts, 3 scenarios, target line, interaction

**Total Phase 1:** ~50-60 hours implementation + testing

---

## QUESTIONS? ASK LUNA

- Design unclear?
- Need component spec variation?
- Accessibility questions?
- Color/spacing confusion?
- Animation timing?
- Responsive behavior?

Luna is available for:
- Design clarifications
- Component feedback
- Accessibility guidance
- Design system questions

**Contact:** @luna on Slack or comment in PRs with `@luna`

---

## NEXT STEPS

1. ✅ You have: FASE-1-MOCKUPS.md, COMPONENT-SPECS.md, ACCESSIBILITY-CHECKLIST.md
2. 📖 Read: All 3 documents (30 min each, 90 min total)
3. 🔍 Review: src/styles/tokens.ts (10 min)
4. ✍️ Create: Feature branch `feature/STY-052-sidebar-redesign`
5. 💻 Start: Building components per COMPONENT-SPECS.md
6. 🧪 Test: Accessibility, keyboard nav, responsive
7. 🔄 PR: Submit with screenshots and accessibility notes
8. 👀 Review: Luna + QA team

---

**Good luck! You've got this! 🚀**

All the design work is done. Now make it beautiful and accessible.

---

**Handoff Prepared By:** Luna
**Date:** Fevereiro 2026
**Status:** READY FOR DEVELOPMENT
**Document:** DEVELOPER-HANDOFF.md

