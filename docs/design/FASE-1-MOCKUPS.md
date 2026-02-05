# SPFP FASE 1 - DESIGN MOCKUPS & SPECIFICATIONS

**Designer:** Luna - UX/UI Design Expert
**Project:** SPFP (Sistema de Planejamento Financeiro Pessoal)
**Date:** Fevereiro 2026
**Design System:** TailwindCSS + Glassmorphism + Dark Mode First

---

## TABLE OF CONTENTS

1. [FEATURE 1: SIDEBAR REDESIGN (STY-052, 053, 054, 055)](#feature-1-sidebar-redesign)
2. [FEATURE 2: REALISTIC CREDIT CARD VISUAL (STY-061)](#feature-2-credit-card-visual)
3. [FEATURE 3: RETIREMENT DASHPLAN VISUALIZATION (STY-067)](#feature-3-retirement-dashplan)
4. [DESIGN SPECIFICATIONS](#design-specifications)
5. [COMPONENT MAPPING FOR DEV](#component-mapping)
6. [ACCESSIBILITY & WCAG AA COMPLIANCE](#accessibility)

---

## FEATURE 1: SIDEBAR REDESIGN

### STY-052, STY-053, STY-054, STY-055

**Status:** Ready for Implementation
**Effort:** 25-28 hours
**Priority:** P0 BLOCKER

### 1.1 OVERVIEW & USER JOURNEY

**Goal:** Reorganize sidebar into collapsible sections to reduce visual clutter and improve navigation across desktop and mobile.

**Sections:**
1. **Budget** - 3 top spending categories with progress bars
2. **Accounts** - Account balances with bank icons
3. **Transactions** - Recent unconfirmed transactions
4. **Installments** - Grouped installment plans

### 1.2 DESKTOP LAYOUT (1440px+)

#### Sidebar Structure

```
┌─────────────────────────────────────────┐
│  SPFP                              [X]  │  Logo + Brand
│  PREMIUM                                │
├─────────────────────────────────────────┤
│                                         │
│  📊 ORÇAMENTO                    [v]    │  Section Header + Chevron
│  ├─ 🛒 Alimentação   R$ 450      ▓▓▓▓░│  Progress Bar (75% - Yellow)
│  ├─ 🚗 Transporte    R$ 200      ▓▓▓░░│  Progress Bar (60% - Green)
│  └─ 🏥 Saúde         R$ 150      ▓▓▓▓▓│  Progress Bar (100% - Red)
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  💳 CONTAS                       [v]    │  Collapsible Section
│  ├─ 🏦 Nubank           R$ 5.200       │  Account with balance
│  ├─ 🏦 Bradesco         R$ 12.500      │  Scrollable if 8+
│  └─ [+] Adicionar Nova              │  Add button
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  📋 LANÇAMENTOS                  [v]    │  Transactions Section
│  ├─ Uber - R$ 35        Pendente       │  Category + Status
│  ├─ Netflix - R$ 49.9   Pendente       │
│  └─ Supermercado...     Confirmado     │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  📅 PARCELAMENTOS               [v]    │  Installments Section
│  ├─ iPhone [2/12]       R$ 199.90      │  Grouped by groupId
│  └─ Viagem [5/10]       R$ 500         │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  👤 Nando | [⚙️] [🔐] [🚪]          │  User footer
│                                         │
└─────────────────────────────────────────┘

Desktop Width: 288px (w-72)
Sidebar Background:
  - Light: rgba(255, 255, 255, 0.8) + backdrop-blur
  - Dark: rgba(15, 23, 42, 0.8) + backdrop-blur
Border: white/5 right border
```

#### Section States

**Expanded Section (Default on Desktop)**
```
Height: Auto (content + padding)
Transition: max-height 300ms ease-in-out
Chevron: ↓ (Down arrow)
Children: Visible
Padding: 1rem (md spacing token)
```

**Collapsed Section (Mobile Default)**
```
Height: max-h-0
Overflow: hidden
Chevron: → (Right arrow)
Children: Hidden
Padding: Collapsed
```

#### Budget Section Details

```
📊 ORÇAMENTO
├─ Category Item 1
│  ├─ Name: 🛒 Alimentação (emoji + category name)
│  ├─ Amount: R$ 450 / R$ 600 (spent / limit)
│  └─ Progress Bar:
│     ├─ Green (0-49%): bg-emerald-500
│     ├─ Yellow (50-79%): bg-amber-500
│     └─ Red (80-100%): bg-rose-500
│
├─ Show only TOP 3 categories by current month spending
└─ Click category → Navigate to /budget with filter param
```

**Design Tokens Used:**
- Progress bar colors: `colorTokens.emerald[500]`, `amber[500]`, `rose[500]`
- Spacing: `spacingTokens.md` (section padding), `xs` (item spacing)
- Typography: `fontSize.sm`, `fontWeight.medium`
- Border radius: `borderRadiusTokens.lg`

#### Accounts Section Details

```
💳 CONTAS
├─ Account Item (Max 8 visible, scroll if more)
│  ├─ Icon: BankLogo component (Nubank, Bradesco, etc)
│  ├─ Name: Account type (Corrente, Poupança)
│  ├─ Balance: formatCurrency(balance) in emerald-500
│  └─ Click → Filter TransactionList to this account
│
└─ Add Button [+]
   └─ Click → Open AccountForm modal

Spacing: 8px between items
Max height with scroll: 192px (max-h-48)
Scroll styling: Custom scrollbar (transparent)
```

#### Transactions Section Details

```
📋 LANÇAMENTOS
├─ Transaction Item (Max 5, unconfirmed first)
│  ├─ Category icon + Description
│  ├─ Amount: R$ 35 (right-aligned)
│  ├─ Status badge:
│  │  ├─ Pending: bg-amber-500/20 text-amber-600
│  │  └─ Confirmed: bg-emerald-500/20 text-emerald-600
│  └─ Quick confirm: Right-click or swipe → Mark as confirmed
│
└─ Show: Unconfirmed transactions from today onwards

Date display: "Uber - 15 de fev" format (pt-BR)
Sort by: Date ascending (today first)
```

#### Installments Section Details

```
📅 PARCELAMENTOS
├─ Installment Group (grouped by groupId)
│  ├─ Name: "iPhone" or description
│  ├─ Progress: "[2/12]" (current/total)
│  ├─ Amount: R$ 199.90 (monthly payment)
│  └─ Status: Color-coded by progress
│
└─ Colors by progress:
   ├─ 0-33%: bg-blue-500/20 (Early)
   ├─ 33-66%: bg-emerald-500/20 (On track)
   └─ 66-100%: bg-amber-500/20 (Final stretch)

Sort by: Next due date
```

### 1.3 MOBILE LAYOUT (375px, 768px)

#### Small Mobile (375px)

```
┌──────────────────────────────┐
│ ☰                       ⚙️    │  Hamburger + Settings
├──────────────────────────────┤
│                              │
│ Main Content Area            │
│ (Dashboard / Transaction)    │
│                              │
└──────────────────────────────┘

[Mobile Bottom Navigation Bar]
├─ 🏠 Início
├─ 📄 Extrato
├─ 📈 Investir
├─ 💼 Patrimônio
└─ ⚙️ Menu

[Sidebar Drawer - When ☰ clicked]
┌─────────────────────────────────┐
│ X                               │
│ SPFP                            │
│ PREMIUM                         │
├─────────────────────────────────┤
│ [Same sections as desktop]      │
│ - But all collapsed by default  │
│                                 │
│ [Backdrop: rgba(0,0,0,0.5)]     │
│ [Animation: slide-right 300ms]  │
└─────────────────────────────────┘
```

**Mobile Drawer Specifications:**
- Width: 85vw (max 320px)
- Position: Fixed, left: -100%, slide in on toggle
- Z-index: 50 (above content)
- Backdrop: Semi-transparent (backdrop-blur)
- Animation: 300ms ease-out
- Close triggers: Click outside, ESC key, click close X

#### Tablet (768px)

```
┌──────────────────┬─────────────────────┐
│   Sidebar        │  Main Content       │
│   (expanded)     │  (responsive width) │
│                  │                     │
│ 240px            │ calc(100vw - 240px) │
│                  │                     │
└──────────────────┴─────────────────────┘

All sections visible (expanded by default)
Sidebar stays visible (no drawer)
```

### 1.4 STATE CHANGES & ANIMATIONS

#### Section Expand/Collapse Animation

```css
/* TailwindCSS classes to use */
.section-content {
  max-height: auto;  /* When expanded */
  transition: max-height 300ms cubic-bezier(0.4, 0, 0.2, 1),
              opacity 200ms ease-out;
  opacity: 1;
}

.section-content.collapsed {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
}

.section-chevron {
  transition: transform 300ms ease-out;
  /* rotate 90deg when collapsed */
}
```

#### Hover States

```
Section Header on Hover:
├─ Background: rgba(255, 255, 255, 0.05) [light]
│               rgba(255, 255, 255, 0.02) [dark]
├─ Cursor: pointer
├─ Chevron color: primary-500
└─ Duration: 150ms ease-out

Budget Bar on Hover:
├─ Opacity: 1.0 (was 0.85)
├─ Shadow: md
└─ Duration: 150ms

Account Item on Hover:
├─ Background: rgba(primary-500, 0.1)
├─ Shadow: sm
└─ Slight scale: 1.02
```

### 1.5 ACCESSIBILITY (WCAG 2.1 AA)

**Keyboard Navigation:**
- Tab order: Header → Sections → Footer
- Enter/Space: Toggle section expand/collapse
- Arrow keys: Navigate within section items
- ESC: Close mobile drawer
- Focus indicator: 2px solid primary-500 outline with 2px offset

**ARIA Labels:**
```html
<button aria-label="Expandir seção Orçamento" aria-expanded="true">
  📊 Orçamento <ChevronDown />
</button>

<section aria-label="Seção de Contas com saldos" role="region">
  <!-- Account items -->
</section>

<div role="status" aria-live="polite" aria-atomic="true">
  Conta atualizada: Nubank
</div>
```

**Color Contrast:**
- Text on background: 4.5:1 (WCAG AA)
- Progress bar indicators: Distinct hues (not just color)
- Status badges: Include text labels + colors

**Motion & Animation:**
- Provide `prefers-reduced-motion` media query support
- Default animations: 300ms (not too fast)
- No auto-play animations

### 1.6 RESPONSIVE BREAKPOINTS

| Breakpoint | Width | Sidebar | Layout |
|------------|-------|---------|--------|
| Mobile XS | 320px | Drawer | Bottom nav |
| Mobile SM | 375px | Drawer | Bottom nav |
| Tablet | 768px | Visible | Sidebar + Content |
| Desktop | 1024px+ | Visible (expanded) | Full layout |

---

## FEATURE 2: CREDIT CARD VISUAL

### STY-061 - Realistic Card Design

**Status:** Ready for Implementation
**Effort:** 8 hours
**Priority:** P0 BLOCKER

### 2.1 DESIGN VISION

**Inspiration:** Nubank, Apple Card, Stripe Card UI
**Goal:** Display a realistic, premium-feeling credit card that clearly shows the cardholder's name, bank information, and account details.

### 2.2 DESKTOP CARD (1440px)

#### Card Dimensions & Positioning

```
┌─────────────────────────────────────────────────────────┐
│  Credit Card Display Container                          │
│  Width: 480px (16:10 aspect ratio)                      │
│  Height: 300px                                          │
│  Position: Centered in dashboard widget or full-screen  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │                                                  │   │
│  │  [CARD FACE 3D PERSPECTIVE]                      │   │
│  │                                                  │   │
│  │  Perspective: 1000px                             │   │
│  │  Transform-style: preserve-3d                    │   │
│  │  Rotation on hover: rotateY(-15deg) rotateX(5deg)   │
│  │                                                  │   │
│  │  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓     │
│  │  ┃ BRADESCO                           🏦    ┃     │
│  │  ┃                                          ┃     │
│  │  ┃ •••• •••• •••• 1234                      ┃     │
│  │  ┃                                          ┃     │
│  │  ┃ FERNANDO SILVA        VÁLIDO ATÉ        ┃     │
│  │  ┃ (Pessoa A)            02/27              ┃     │
│  │  ┃                                 [VISA]   ┃     │
│  │  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛     │
│  │                                                  │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  [Reveal/Blur Toggle Button Below]                      │
│  ☐ Mostrar número completo                             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### Card Visual Specifications

**Card Container:**
```css
width: 480px;
height: 300px;
border-radius: 16px;
perspective: 1000px;
background: linear-gradient(...); /* Bank-specific */
box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3),
            0 0 1px rgba(255, 255, 255, 0.1) inset; /* Glossy effect */
```

**Card Gradient by Bank:**

| Bank | Gradient | Color Scheme |
|------|----------|--------------|
| Nubank | #8B5CF6 → #6D28D9 | Purple gradient |
| Bradesco | #1e40af → #0c3d66 | Dark blue |
| Itaú | #1f2937 → #111827 | Dark gray (neutral) |
| Caixa | #059669 → #047857 | Dark green |
| Pessoa B | #ec4899 → #be185d | Pink/Magenta |

**Card Content Layout:**

```
┌─ 24px padding (lg token)
│
├─ Header Row (Bank + Icon)
│  ├─ Bank Name: "BRADESCO" (fontSize.xs, fontWeight.bold, text-white/80)
│  └─ Bank Icon: 48x48px (right-aligned)
│
├─ Spacer (120px vertical)
│
├─ Card Number Section
│  ├─ Display: •••• •••• •••• 1234
│  ├─ Font: Monospace (Fira Code)
│  ├─ Size: fontSize.2xl
│  ├─ Color: white/90
│  └─ On hover/click:
│     ├─ Toggle to: 1234 5678 9012 3456 (with blur option)
│     ├─ Animation: Cross-fade (200ms)
│     └─ Show security info: CVV masked
│
├─ Bottom Section
│  ├─ Left: Cardholder Name
│  │  ├─ Label: "TITULAR" (uppercase, micro text)
│  │  ├─ Name: "FERNANDO SILVA" (semibold, white)
│  │  └─ Subtitle: "(Pessoa A)" or "(Pessoa B)" - indicates whose card
│  │
│  ├─ Middle: Spacer
│  │
│  └─ Right: Expiration
│     ├─ Label: "VÁLIDO ATÉ" (uppercase, micro text)
│     ├─ Date: "02/27" (fontSize.lg, semibold, white)
│     └─ Card flag: VISA/MC logo (48x30px)
│
└─ 24px padding
```

#### Color Variants for Person

**Cardholder Identification:**

When displaying multiple cards (husband & wife), use distinct color schemes:

```
Pessoa A (Usually Husband):
├─ Primary: Dark Blue (#1e40af)
├─ Accent: Light Blue (#3b82f6)
├─ Text: White
└─ Gradient: #1e40af → #0c3d66

Pessoa B (Usually Wife):
├─ Primary: Dark Pink (#ec4899)
├─ Accent: Light Pink (#f472b6)
├─ Text: White
└─ Gradient: #ec4899 → #be185d

Shared/Neutral:
├─ Primary: Dark Gray (#1f2937)
├─ Accent: Gray (#6b7280)
├─ Text: White
└─ Gradient: #1f2937 → #111827
```

### 2.3 CARD STATES

#### State 1: Default (Active, Normal View)

```
Visual:
├─ Opacity: 1
├─ Transform: translateZ(0)
├─ Shadow: Elevated (xl token)
└─ Card number: Masked (•••• •••• •••• 1234)

Border:
├─ Light: 1px solid rgba(255, 255, 255, 0.3)
└─ Dark: 1px solid rgba(255, 255, 255, 0.2)
```

#### State 2: Hover (Desktop)

```
Visual:
├─ Transform: rotateY(-15deg) rotateX(5deg) scale(1.05)
├─ Shadow: Larger (2xl token)
├─ Opacity: 1
└─ Cursor: pointer

Duration: 300ms ease-out
```

#### State 3: Revealed (Number Shown)

```
Card Number Section:
├─ Transition from: •••• •••• •••• 1234
├─ Transition to: 1234 5678 9012 3456
├─ Animation: Fade in/out (200ms)
├─ Additional info: CVV hidden under hover tooltip
└─ Warning badge: "Não compartilhe este número"

Toggle button text changes:
├─ Before: "☐ Mostrar número completo"
└─ After: "☑️ Ocultar número completo"
```

#### State 4: Blocked/Expired

```
Blocked Card:
├─ Opacity: 0.6
├─ Filter: grayscale(100%)
├─ Badge: "🔒 BLOQUEADO" (top-right, bg-rose-500)
├─ Cursor: not-allowed
└─ Shadow: Reduced (sm token)

Expired Card:
├─ Opacity: 0.5
├─ Filter: grayscale(50%)
├─ Badge: "⚠️ EXPIRADO" (top-right, bg-amber-500)
├─ Expiration date color: rose-500
└─ Text hint: "Renove seu cartão"
```

### 2.4 MOBILE CARD (375px, 768px)

#### Small Mobile (375px)

```
Card dimensions scale down:
├─ Width: 90vw (max 340px)
├─ Height: 212px (maintain 16:10 aspect)
├─ Border-radius: 12px
└─ Padding: 16px (md token)

Layout adjustments:
├─ Bank icon: 40x40px
├─ Card number font: fontSize.lg (was 2xl)
├─ Cardholder font: fontSize.sm
├─ Expiration font: fontSize.base
└─ No 3D perspective (performance)

Touch interaction:
├─ Long-press (500ms): Reveal number
├─ Tap toggle: Hide/Show with slide animation
└─ Swipe: Next card (if multiple)
```

#### Tablet (768px)

```
Card dimensions:
├─ Width: 420px
├─ Height: 262px
└─ Border-radius: 14px

Layout: Standard, but slightly reduced 3D effect
```

### 2.5 CARD REVEAL ANIMATION

**Sequence: Masked → Revealed**

```
Step 1: User clicks "Mostrar número"
Time: 0ms
│ Card number: •••• •••• •••• 1234
│ Opacity: 1
└ State: Hidden

Step 2: Blur-out animation
Time: 100ms
│ Card number: Still visible, opacity fading
│ Filter: blur(2px)
└ Opacity: 0.7

Step 3: Content switch
Time: 150ms
│ New content loaded (full number)
│ Opacity: 0
└ Filter: blur(0)

Step 4: Blur-in animation
Time: 200ms
│ Card number: 1234 5678 9012 3456
│ Opacity: Increasing
└ Filter: blur(0)

Step 5: Final state (250ms+)
│ Card number: Fully visible
│ Opacity: 1
└ State: Revealed ✓
```

**CSS Implementation:**

```css
@keyframes cardReveal {
  0% {
    opacity: 0;
    filter: blur(4px);
  }
  100% {
    opacity: 1;
    filter: blur(0);
  }
}

.card-number {
  animation: cardReveal 300ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

### 2.6 MULTI-CARD CAROUSEL (If Multiple Cards)

**When user has multiple cards:**

```
┌─────────────────────────────────────────┐
│                                         │
│  [← CARD 1 (FERNANDO) →]                │
│                                         │
│     Card display with indicators        │
│                                         │
│  ◯ ◯ ◯ (Page dots - which card shown) │
│                                         │
│  Button: [Adicionar novo cartão]        │
│                                         │
└─────────────────────────────────────────┘

Carousel behavior:
├─ Swipe left/right on desktop: Next/previous
├─ Mobile swipe: Native swipe gesture
├─ Keyboard: Arrow left/right
├─ Auto-height: Adjust to active card
└─ Duration between slides: 300ms ease-out
```

### 2.7 COMPONENT STRUCTURE (For Dev)

**File:** `src/components/CreditCardDisplay.tsx`

```typescript
interface CreditCardProps {
  card: {
    id: string;
    number: string;          // Last 4 digits shown
    cardholder: string;      // "FERNANDO SILVA"
    expiryDate: string;      // "02/27"
    bank: 'nubank' | 'bradesco' | 'itau' | 'caixa';
    person: 'A' | 'B' | 'shared';
    status: 'active' | 'blocked' | 'expired';
  };
  onReveal?: (cardId: string) => void;
  showAnimation?: boolean;
}
```

**Sub-components:**
```
CreditCardDisplay
├─ CardContainer (3D perspective wrapper)
├─ CardFace (Gradient + border styling)
├─ CardContent
│  ├─ CardHeader (Bank name + icon)
│  ├─ CardNumber (Masked or revealed)
│  ├─ CardSpacer
│  └─ CardFooter
│     ├─ CardholderInfo
│     ├─ ExpiryInfo
│     └─ CardFlag (Visa/MC logo)
├─ RevealToggle (Checkbox button)
├─ StateOverlay (If blocked/expired)
└─ CardCarousel (If multiple cards)
```

---

## FEATURE 3: RETIREMENT DASHPLAN VISUALIZATION

### STY-067 - Retirement Projection Chart

**Status:** Ready for Implementation
**Effort:** 10 hours
**Priority:** P0 BLOCKER

### 3.1 DESIGN VISION

**Inspiration:** DashPlan, Vanguard Retirement Planner, Personal Capital
**Goal:** Provide an intuitive, multi-scenario view of retirement savings trajectory with clear visual indicators of target dates and milestones.

### 3.2 DESKTOP LAYOUT (1440px)

#### Full-Screen Retirement Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│  APOSENTADORIA                                     [⚙️ Editar] │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  CENÁRIOS DE PROJEÇÃO                                       ││
│  │                                                              ││
│  │  [Conservador] [Moderado] [Agressivo]  (Tab buttons)       ││
│  │                                                              ││
│  │  Meta: R$ 1.200.000 | Prazo: 20 anos | Taxa de retorno: ? ││
│  │                                                              ││
│  │  ┌──────────────────────────────────────────────────────┐  ││
│  │  │                                                      │  ││
│  │  │         [LINE CHART: 3 scenarios]                   │  ││
│  │  │                                                      │  ││
│  │  │   Y-Axis: Patrimônio (R$ Milhões)                   │  ││
│  │  │   X-Axis: Anos de investimento (0 a 40)             │  ││
│  │  │                                                      │  ││
│  │  │   Legendas:                                          │  ││
│  │  │   ━━━━ Conservador (Yellow)                          │  ││
│  │  │   ━━━━ Moderado (Blue)                              │  ││
│  │  │   ━━━━ Agressivo (Green)                            │  ││
│  │  │                                                      │  ││
│  │  │   Vertical line: Target date (red dashed)           │  ││
│  │  │                                                      │  ││
│  │  └──────────────────────────────────────────────────────┘  ││
│  │                                                              ││
│  │  Hover Info:                                                ││
│  │  ├─ Year: "Ano 20"                                          ││
│  │  ├─ Age: "60 anos"                                          ││
│  │  ├─ Value: "R$ 1.200.000"                                   ││
│  │  ├─ Annual Yield: "R$ 75.000"                               ││
│  │  └─ Rate: "4.5% a.a."                                       ││
│  │                                                              ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  RESUMO     │  │  RESUMO     │  │  RESUMO     │             │
│  │  CONSERVADOR│  │  MODERADO   │  │  AGRESSIVO  │             │
│  │             │  │             │  │             │             │
│  │ Meta em 20: │  │ Meta em 20: │  │ Meta em 20: │             │
│  │ R$ 1,0M    │  │ R$ 1,2M    │  │ R$ 1,5M    │             │
│  │             │  │             │  │             │             │
│  │ Taxa anual: │  │ Taxa anual: │  │ Taxa anual: │             │
│  │ 3% a.a.    │  │ 5% a.a.    │  │ 7% a.a.    │             │
│  │             │  │ ✓ RECOMENDADO│ │             │             │
│  │             │  │             │  │             │             │
│  │ [Selecionar]│  │ [Selecionar]│  │ [Selecionar]│             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  PRÓXIMOS MILESTONES                                            │
│  ├─ 50% da meta: Ano 12 (~R$ 600k)  [████░░░░░░░░░ 50%]       │
│  ├─ 75% da meta: Ano 16 (~R$ 900k)  [███████░░░░░░░░ 75%]      │
│  └─ 100% da meta: Ano 20 (~R$ 1.2M) [███████████████░ 100%]    │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 3.3 CHART SPECIFICATIONS (Recharts)

#### Chart Type: Line Chart

**Chart Component:**
```
Component: Recharts LineChart
Type: LineChart
Dimensions:
├─ Width: 100% (responsive)
├─ Height: 400px
└─ Margin: { top: 20, right: 30, left: 60, bottom: 60 }

Data Structure:
├─ Array of objects:
│  {
│    year: 0,
│    age: 40,
│    conservador: 50000,
│    moderado: 50000,
│    agressivo: 50000
│  },
│  ... (40 items for 40 years)
```

#### Axes Configuration

**X-Axis (Years):**
```
Type: Numeric
Label: "Anos de investimento"
Ticks: 0, 10, 20, 30, 40
Format: "{value}a"
Grid: Visible, light gray
Opacity: 0.3
```

**Y-Axis (Amount):**
```
Type: Numeric
Label: "Patrimônio (R$ Milhões)"
Format: "${value / 1000000}M" or "1,2M"
Grid: Visible, light gray
Opacity: 0.3
Ticks: Auto (0, 0.5M, 1M, 1.5M, 2M, etc)
```

#### Lines (3 Scenarios)

**Line 1: Conservador (Conservative)**
```
Scenario: 3% annual return
Color: Amber-500 (#f59e0b)
Stroke: 3px solid
Dot size: 5px (hover: 8px)
Label: "Conservador"
Opacity: 0.8
Animation: True (slideInFromLeft)
```

**Line 2: Moderado (Moderate)**
```
Scenario: 5% annual return
Color: Blue-500 (#3b82f6)
Stroke: 3px solid
Dot size: 5px (hover: 8px)
Label: "Moderado (RECOMENDADO)"
Opacity: 1.0 (slightly bolder)
Animation: True (slideInFromLeft, 100ms delay)
Emphasis: Slightly thicker, more prominent
```

**Line 3: Agressivo (Aggressive)**
```
Scenario: 7% annual return
Color: Emerald-500 (#10b981)
Stroke: 3px solid
Dot size: 5px (hover: 8px)
Label: "Agressivo"
Opacity: 0.8
Animation: True (slideInFromLeft, 200ms delay)
```

**Target Date Indicator:**
```
Visual: Vertical reference line (dashed, red)
Color: Rose-500 (#f43f5e)
Stroke: 2px dashed
Position: X-axis at target year (e.g., year 20)
Label: "Target: Ano 20 (60 anos)"
Opacity: 0.6
On hover: Opacity → 1.0
```

#### Tooltip Configuration

**Appearance:**
```
Background: rgba(15, 23, 42, 0.95) [dark mode]
Border: 1px solid white/20
Border-radius: 8px
Padding: 12px
Box-shadow: lg

Content format:
┌────────────────────────┐
│ Ano 20                 │
│ Idade: 60 anos        │
│                        │
│ Conservador: R$ 980k  │
│ Moderado: R$ 1.2M    │
│ Agressivo: R$ 1.5M   │
│                        │
│ Rendimento anual:      │
│ Moderado: R$ 60k      │
│ Taxa: 5.0% a.a.       │
└────────────────────────┘
```

**Tooltip Triggers:**
```
Hover on chart: Show nearest year data
Mobile: Tap on line to show data point
Animation: Fade in 150ms
```

### 3.4 SCENARIO CARDS

**Location:** Below chart, 3-column grid (desktop) or 1-column stack (mobile)

#### Card Template

```
┌──────────────────────────────┐
│ 📊 CENÁRIO CONSERVADOR       │
│ (3% retorno anual)           │
├──────────────────────────────┤
│                              │
│  Patrimônio após 20 anos:    │
│  R$ 980.000                  │
│                              │
│  Renda anual estimada:       │
│  R$ 49.000                   │
│                              │
│  Tempo até meta:             │
│  22 anos (aos 62 anos)       │
│                              │
│  Taxa média de retorno:      │
│  3.0% a.a.                   │
│                              │
├──────────────────────────────┤
│ [Selecionar este cenário]    │
│                              │
└──────────────────────────────┘
```

**Card Styling by Scenario:**

| Scenario | Color | Icon | Highlight |
|----------|-------|------|-----------|
| Conservador | Amber (#f59e0b) | 🏦 Safe | Lower risk |
| Moderado | Blue (#3b82f6) | ⚖️ Balanced | Recommended ✓ |
| Agressivo | Emerald (#10b981) | 📈 Growth | Higher risk |

**Recommended Badge:**
```
Position: Top-right corner
Badge: "✓ RECOMENDADO"
Background: Emerald-500/20
Text color: Emerald-600
Border: 1px solid emerald-500
Border-radius: 20px
Padding: 4px 12px
Font-size: xs, semibold
```

### 3.5 MILESTONES PROGRESS

**Visual: Stacked Progress Indicators**

```
┌─ PRÓXIMOS MILESTONES ─────────────────────┐
│                                            │
│ 📌 50% da meta (R$ 600k)                  │
│    Ano 12 • 52 anos                       │
│    [████████░░░░░░░░░░░░░░░░] 50%         │
│                                            │
│ 📌 75% da meta (R$ 900k)                  │
│    Ano 16 • 56 anos                       │
│    [████████████░░░░░░░░░░░░] 75%         │
│                                            │
│ 📌 100% da meta (R$ 1.2M)                 │
│    Ano 20 • 60 anos                       │
│    [███████████████░░░░░░░░] 100%         │
│                                            │
└────────────────────────────────────────────┘
```

**Milestone Animation:**
```
On load:
├─ Animate from 0% → target %
├─ Duration: 600ms per bar
├─ Stagger: 200ms between bars
├─ Timing: ease-out
└─ On complete: Show checkmark ✓

Colors:
├─ Completed: Green (#10b981)
├─ In progress: Blue (#3b82f6)
└─ Future: Gray (#cbd5e1)
```

### 3.6 MOBILE LAYOUT (375px, 768px)

#### Small Mobile (375px)

```
Screen layout:
├─ Header: "APOSENTADORIA" + edit button
├─ Quick stats (cards stacked):
│  ├─ Tempo até meta: 20 anos
│  ├─ Meta: R$ 1.2M
│  └─ Taxa de retorno (active scenario): 5%
│
├─ Scenario tabs: Horizontal scroll
│  └─ [Conservador] [Moderado] [Agressivo]
│
├─ Chart: 90vw width, 300px height
│  ├─ Smaller fonts (12px)
│  ├─ Reduced margin
│  ├─ Touch-friendly tooltips
│  └─ No 3D animation
│
├─ Scenario cards: Stacked vertically
│  ├─ Full width (90vw)
│  ├─ Alternate background colors
│  └─ Large tap targets (44px+ buttons)
│
└─ Milestones: Simplified view
   └─ Horizontal stacked bars (smaller)
```

#### Tablet (768px)

```
Screen layout:
├─ 2-column grid for scenario cards
├─ Chart width: 100% (container-responsive)
├─ Chart height: 350px
└─ Milestones: 3-column grid or full-width stack
```

### 3.7 INTERACTION PATTERNS

#### Scenario Selection

```
User clicks scenario card:
├─ Card receives focus state (border 2px primary-500)
├─ Background lightens slightly
├─ Checkmark appears on card
├─ Chart animates to show selected scenario emphasis
│  └─ Selected line: Opacity 1.0, stroke 4px
│  └─ Other lines: Opacity 0.4, stroke 2px
├─ Duration: 300ms ease-out
└─ Result: Sidebar updates with recommendation
```

#### Goal Editing

**Click "⚙️ Editar" button:**
```
Modal opens:
├─ Title: "Editar Meta de Aposentadoria"
├─ Fields:
│  ├─ Data alvo: [Date picker - yyyy-mm-dd]
│  ├─ Idade alvo: [Number input, 55-75]
│  ├─ Renda mensal desejada: [Currency input]
│  ├─ Patrimônio atual: [Currency input, read-only display]
│  └─ Aporte mensal: [Currency input]
│
├─ Presets row:
│  ├─ [20 anos] [30 anos] [40 anos]
│  └─ Auto-fill date picker
│
├─ Buttons:
│  ├─ [Cancelar] [Salvar]
│  └─ On save: Close modal, recalculate chart
│
└─ Validation:
   ├─ Data > today
   ├─ Idade 55-75
   ├─ Renda > 0
   └─ Show error toast on fail
```

### 3.8 DESIGN TOKENS USED

**Color Tokens:**
```
Scenarios:
├─ Conservador: amber-500 (#f59e0b)
├─ Moderado: blue-500 (#3b82f6)
├─ Agressivo: emerald-500 (#10b981)

UI:
├─ Text primary: slate[900] [light] / slate[50] [dark]
├─ Text secondary: slate[600] [light] / slate[300] [dark]
├─ Borders: slate[200] [light] / slate[700] [dark]
├─ Background: white [light] / slate[900] [dark]
└─ Card: slate[50] [light] / slate[800] [dark]
```

**Typography Tokens:**
```
Headlines: fontSize.2xl, fontWeight.bold
Subtitle: fontSize.lg, fontWeight.semibold
Body: fontSize.base, fontWeight.normal
Small: fontSize.sm, fontWeight.normal
```

**Spacing Tokens:**
```
Card padding: xl (32px)
Section gap: lg (24px)
Item gap: md (16px)
```

**Shadow Tokens:**
```
Cards: md (default)
Hover: lg (on interaction)
Chart: md
```

---

## DESIGN SPECIFICATIONS

### 4.1 COLOR PALETTE

**Primary Colors (From Design Tokens):**

| Color | Hex | Usage |
|-------|-----|-------|
| Primary | #0ea5e9 | Buttons, focus, links |
| Success | #22c55e | Positive indicators, emerald-500 |
| Warning | #f59e0b | Caution, progress bars, amber-500 |
| Error | #f43f5e | Danger, errors, rose-500 |
| Info | #3b82f6 | Information, blue-500 |

**Neutral Scale:**

| Level | Hex | Usage |
|-------|-----|-------|
| Slate 50 | #f8fafc | Light backgrounds |
| Slate 100 | #f1f5f9 | Light UI |
| Slate 200 | #e2e8f0 | Light borders |
| Slate 600 | #475569 | Dark text |
| Slate 800 | #1e293b | Card backgrounds (dark) |
| Slate 900 | #0f172a | App background (dark) |

**Dark Mode Adjustments:**
- All backgrounds shift 2-3 levels up (darker)
- All text inverts contrast (light on dark)
- Borders become white/10 opacity (subtle)
- Shadows more pronounced

### 4.2 TYPOGRAPHY SYSTEM

**Font Stack:**
```
Sans-serif (default): Inter, system-ui, -apple-system, sans-serif
Serif (branding): Playfair, serif
Monospace (code): Fira Code, monospace
```

**Size Scale:**

| Level | Size | Usage |
|-------|------|-------|
| xs | 12px | Micro labels, badges |
| sm | 14px | Secondary text, small buttons |
| base | 16px | Body text, inputs |
| lg | 18px | Section labels, secondary headings |
| xl | 20px | Primary headings |
| 2xl | 24px | Feature titles |
| 3xl | 30px | Dashboard titles |
| 4xl | 36px | Page titles |

**Weight Distribution:**

| Weight | Value | Usage |
|--------|-------|-------|
| Light | 300 | De-emphasized text |
| Normal | 400 | Body text |
| Medium | 500 | Labels, secondary emphasis |
| Semibold | 600 | Section headings, highlights |
| Bold | 700 | Primary headings |

### 4.3 SPACING SYSTEM

**Base Unit:** 4px (0.25rem)

| Token | Size | px | Usage |
|-------|------|-----|-------|
| xs | 0.25rem | 4px | Micro spacing |
| sm | 0.5rem | 8px | Tight spacing |
| md | 1rem | 16px | Standard padding |
| lg | 1.5rem | 24px | Section padding |
| xl | 2rem | 32px | Large spacing |
| 2xl | 2.5rem | 40px | Major sections |
| 3xl | 3rem | 48px | Page sections |

### 4.4 BORDER RADIUS

| Token | Value | px | Usage |
|-------|-------|-----|-------|
| xs | 0.125rem | 2px | Subtle corners |
| sm | 0.25rem | 4px | Input fields |
| md | 0.375rem | 6px | Standard UI |
| lg | 0.5rem | 8px | Cards, buttons |
| xl | 0.75rem | 12px | Large elements |
| 2xl | 1rem | 16px | Prominent cards |
| full | 9999px | - | Pills, circles |

### 4.5 SHADOWS

**Shadow System:**

| Token | CSS | Usage |
|-------|-----|-------|
| xs | 0 1px 2px rgba(0,0,0,0.05) | Subtle depth |
| sm | 0 1px 3px rgba(0,0,0,0.1) | Slight elevation |
| md | 0 4px 6px -1px rgba(0,0,0,0.1) | Card shadow |
| lg | 0 10px 15px -3px rgba(0,0,0,0.1) | Hover elevation |
| xl | 0 20px 25px -5px rgba(0,0,0,0.1) | Modal shadow |
| 2xl | 0 25px 50px -12px rgba(0,0,0,0.25) | Dropdown shadow |

### 4.6 ANIMATIONS & TRANSITIONS

**Duration Scale:**

| Token | Duration | Usage |
|-------|----------|-------|
| fast | 150ms | Quick feedback |
| base | 200ms | Standard interaction |
| slow | 300ms | Emphasis animation |
| slower | 500ms | Long transitions |

**Timing Functions:**

| Function | Easing | Usage |
|----------|--------|-------|
| linear | linear | Progress bars |
| easeIn | cubic-bezier(0.4, 0, 1, 1) | Entrance |
| easeOut | cubic-bezier(0, 0, 0.2, 1) | Exit |
| easeInOut | cubic-bezier(0.4, 0, 0.2, 1) | Reversible |

### 4.7 GLASSMORPHISM EFFECT

**Applied to:**
- Sidebar background
- Card overlays
- Modal backdrops
- Dashboard widgets

**Specifications:**
```
Light Mode:
├─ Background: rgba(255, 255, 255, 0.8)
├─ Backdrop-filter: blur(10px)
└─ Border: 1px solid rgba(255, 255, 255, 0.2)

Dark Mode:
├─ Background: rgba(15, 23, 42, 0.8)
├─ Backdrop-filter: blur(10px)
└─ Border: 1px solid rgba(51, 65, 85, 0.2)
```

---

## COMPONENT MAPPING FOR DEV

### Component Hierarchy

```
Feature 1: Sidebar Redesign
├─ src/components/Layout.tsx (modify existing)
├─ src/components/ui/SidebarSection.tsx (NEW)
├─ src/components/ui/SidebarDrawer.tsx (NEW - mobile)
├─ src/context/SidebarContext.tsx (NEW - manage state)
└─ Sub-components:
   ├─ SidebarBudgetSection.tsx
   ├─ SidebarAccountsSection.tsx
   ├─ SidebarTransactionsSection.tsx
   └─ SidebarInstallmentsSection.tsx

Feature 2: Credit Card Visual
├─ src/components/CreditCardDisplay.tsx (NEW)
├─ Sub-components:
│  ├─ CardContainer.tsx
│  ├─ CardFace.tsx
│  ├─ CardContent.tsx
│  ├─ CardRevealToggle.tsx
│  ├─ CardCarousel.tsx (if multiple)
│  └─ CardStateOverlay.tsx (blocked/expired)
└─ Hooks:
   └─ useCardReveal.ts

Feature 3: Retirement Dashboard
├─ src/components/Retirement.tsx (NEW - main page)
├─ src/components/RetirementDashPlanChart.tsx (NEW - Recharts)
├─ src/components/RetirementGoalForm.tsx (NEW - modal)
├─ src/components/RetirementScenarioCards.tsx (NEW)
├─ src/components/RetirementMilestones.tsx (NEW)
├─ src/context/RetirementContext.tsx (NEW)
├─ src/services/retirementService.ts (NEW - calculations)
└─ src/types/retirement.ts (NEW)
```

### File Organization

```
docs/design/
├─ FASE-1-MOCKUPS.md (this file)
├─ COMPONENT-SPECS.md (detailed component specs)
└─ ACCESSIBILITY-CHECKLIST.md

src/components/
├─ sidebar/ (NEW folder)
│  ├─ SidebarSection.tsx
│  ├─ SidebarBudgetSection.tsx
│  ├─ SidebarAccountsSection.tsx
│  ├─ SidebarTransactionsSection.tsx
│  └─ SidebarInstallmentsSection.tsx
│
├─ creditcard/ (NEW folder)
│  ├─ CreditCardDisplay.tsx
│  ├─ CardContainer.tsx
│  ├─ CardFace.tsx
│  └─ CardRevealToggle.tsx
│
└─ retirement/ (NEW folder)
   ├─ Retirement.tsx
   ├─ RetirementDashPlanChart.tsx
   ├─ RetirementGoalForm.tsx
   ├─ RetirementScenarioCards.tsx
   └─ RetirementMilestones.tsx
```

---

## ACCESSIBILITY & WCAG 2.1 AA COMPLIANCE

### 4.1 WCAG AA STANDARDS

**Scope:** All 3 features must meet WCAG 2.1 Level AA standards

### 4.2 CONTRAST RATIOS

**Requirement:** Minimum 4.5:1 for normal text, 3:1 for large text

**Sidebar:**
- Text on background: 4.5:1 ✓
- Progress bar text: 4.5:1 ✓
- Labels on dark bg: 4.5:1 ✓

**Credit Card:**
- Card text on gradient: 4.5:1+ ✓
- Status badges: Distinct hue + contrast ✓

**Retirement Chart:**
- Legend text: 4.5:1 ✓
- Axis labels: 4.5:1 ✓
- Tooltip text: 4.5:1 ✓

### 4.3 KEYBOARD NAVIGATION

**Sidebar:**
```
Tab order:
├─ Logo/Header
├─ Each section header (button)
│  └─ Space/Enter: Expand/collapse
├─ Items within section
│  └─ Arrow keys: Navigate items
└─ Footer (user info + settings)

Focus indicator: 2px solid primary-500 with 2px offset
```

**Credit Card:**
```
Tab order:
├─ Reveal toggle (button)
├─ Card container (decorative, not tabbed)
└─ Next/previous carousel (if multiple)

Focus indicator: Clear outline on toggle button
```

**Retirement:**
```
Tab order:
├─ Edit goal button
├─ Scenario tabs (or radio buttons)
├─ Chart (focusable for tooltip via arrow keys)
└─ Cards and buttons

Focus indicator: 2px primary outline
```

### 4.4 ARIA LABELS & ROLES

**Sidebar:**
```html
<nav role="navigation" aria-label="Navegação de finanças">
  <button
    aria-label="Expandir seção Orçamento"
    aria-expanded="true"
    aria-controls="budget-section"
  >
    📊 Orçamento
  </button>

  <section id="budget-section" aria-label="Seção de Orçamento com gastos por categoria">
    <!-- Section content -->
  </section>
</nav>
```

**Credit Card:**
```html
<div
  role="region"
  aria-label="Exibição do cartão de crédito com nome do titular"
>
  <div aria-hidden="true" class="card-visual">
    <!-- Visual only -->
  </div>

  <button
    aria-label="Alternar visibilidade do número completo do cartão"
    aria-pressed="false"
  >
    ☐ Mostrar número completo
  </button>
</div>
```

**Retirement:**
```html
<div role="region" aria-label="Painel de planejamento de aposentadoria">
  <h2>APOSENTADORIA</h2>

  <div role="tablist" aria-label="Seleção de cenários de investimento">
    <button role="tab" aria-selected="true" aria-controls="conservative-panel">
      Conservador
    </button>
    <!-- Other tabs -->
  </div>

  <div id="conservative-panel" role="tabpanel" aria-labelledby="conservative-tab">
    <!-- Chart and content -->
  </div>
</div>
```

### 4.5 COLOR NOT ONLY INDICATOR

**Sidebar Progress Bars:**
```
Don't rely on color alone:
├─ Use both color AND fill percentage
├─ Add text label: "75% - Amarelo"
└─ Add pattern overlay (optional)
```

**Retirement Scenarios:**
```
Lines must be distinguishable:
├─ Different colors: ✓
├─ Different line styles (solid/dashed): ✓
├─ Different stroke widths: ✓
└─ Legend always visible: ✓
```

### 4.6 MOTION & ANIMATION

**Prefers Reduced Motion Support:**

```css
@media (prefers-reduced-motion: reduce) {
  /* Reduce all animations */
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

**Animation Guidelines:**
- No auto-playing animations
- No infinite animations without pause option
- All animations ≤ 300ms (fast feedback)

### 4.7 FORM ACCESSIBILITY

**Retirement Goal Form:**
```html
<form>
  <fieldset>
    <legend>Editar Meta de Aposentadoria</legend>

    <label for="target-date">Data Alvo:</label>
    <input
      id="target-date"
      type="date"
      aria-required="true"
      aria-describedby="target-date-hint"
    />
    <span id="target-date-hint">Selecione uma data no futuro</span>
  </fieldset>
</form>
```

### 4.8 RESPONSIVE TEXT

**Font Sizing:**
- Base: 16px (1rem) - no smaller
- Minimum line height: 1.5
- Minimum letter spacing: 0.02em

**Touch Target Size:**
- Minimum: 44x44px (2020 WCAG requirement)
- All buttons, links, and interactive elements

---

## TESTING CHECKLIST

### Mobile Testing Breakpoints

- [ ] **320px (Mobile XS)** - iPhone SE
- [ ] **375px (Mobile SM)** - iPhone 13
- [ ] **768px (Tablet)** - iPad mini
- [ ] **1024px (Desktop)** - MacBook
- [ ] **1440px (Desktop XL)** - 27" monitor

### Accessibility Testing

- [ ] Keyboard navigation (Tab, Enter, Space, Arrows, ESC)
- [ ] Screen reader (NVDA, JAWS, VoiceOver)
- [ ] Color contrast (WCAG AA 4.5:1)
- [ ] Focus indicators visible
- [ ] No keyboard traps
- [ ] Motion preferences respected

### Browser Testing

- [ ] Chrome 120+
- [ ] Firefox 121+
- [ ] Safari 17+
- [ ] Edge 120+
- [ ] iOS Safari 17+
- [ ] Android Chrome 120+

### Performance Metrics

- [ ] Lighthouse Accessibility ≥ 90
- [ ] Lighthouse Performance ≥ 85
- [ ] First Contentful Paint (FCP) < 1.8s
- [ ] Cumulative Layout Shift (CLS) < 0.1
- [ ] No console errors/warnings

---

## HANDOFF TO DEV (@dex)

**Deliverables:**

1. ✅ Detailed mockups for 3 features (this document)
2. ✅ Design tokens already implemented (src/styles/tokens.ts)
3. ✅ Component specifications & file structure
4. ✅ Accessibility checklist (WCAG 2.1 AA)
5. ✅ Responsive breakpoints tested
6. ✅ Color palette & typography guide
7. ✅ Animation & interaction specs

**Next Steps:**

1. Review this mockup document
2. Ask Luna for clarifications on any component
3. Refer to `src/styles/tokens.ts` for all design values
4. Create feature branches: `feature/STY-052`, `feature/STY-061`, `feature/STY-067`
5. Implement components following the hierarchy in "Component Mapping for Dev"
6. Use `useDesignTokens()` hook for all styling
7. Test on all breakpoints before creating PR
8. Ensure WCAG AA compliance before review

---

**Prepared by:** Luna - UX/UI Design Expert
**Date:** Fevereiro 2026
**Status:** READY FOR IMPLEMENTATION
**Revision:** v1.0

For questions or design clarifications, contact Luna via the team Slack or @luna mentions in PRs.

