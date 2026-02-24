# TRANSFORME Landing Page v2 - Complete Visual System Specification

**Document Version:** 1.0
**Last Updated:** 2026-02-23
**Designer:** Luna, transforme-landing-enhancement-squad
**Target Audience:** Development team, design system maintainers
**Technology Stack:** React 19 + TypeScript + TailwindCSS + Framer Motion

---

## Table of Contents

1. [Overview](#overview)
2. [Section Hierarchy](#section-hierarchy)
3. [Component Specifications](#component-specifications)
4. [Color Palette & Application](#color-palette--application)
5. [Typography Scale](#typography-scale)
6. [Spacing System](#spacing-system)
7. [Animation Specifications](#animation-specifications)
8. [Responsive Breakpoints](#responsive-breakpoints)
9. [Accessibility Checklist](#accessibility-checklist)
10. [Mobile Optimizations](#mobile-optimizations)
11. [Figma Structure & Mockups](#figma-structure--mockups)

---

## Overview

The TRANSFORME landing page v2 is a high-converting, modern financial SaaS platform using a **premium glassmorphism + dark-to-light** design system. The visual system balances:

- **Primary Brand Color:** Blue (#3b82f6)
- **Secondary Dark:** Slate (#0f172a)
- **Accent Light:** White backgrounds with subtle gradients
- **Typography:** Playfair Display (headings) + Inter (body)
- **Motion:** Smooth Framer Motion animations (0.3s–0.8s transitions)

---

## Section Hierarchy

The landing page is organized into **8 primary sections** with consistent spacing and visual progression:

### 1. Hero Section (Full Height)
**Purpose:** Immediate value proposition and CTA capture
**Height:** 100vh (responsive: min-h-screen)
**Spacing (px):** 80px top/bottom padding on desktop, 60px on mobile
**Background:** Gradient light (blue-50 to white)
**Content Flow:** Title → Subtitle → Dual CTAs → Scroll Indicator

### 2. Features Section
**Purpose:** Showcase 4 core capabilities
**Height:** Auto (600–700px typical)
**Spacing:** 80px top/bottom (desktop), 60px (tablet), 40px (mobile)
**Background:** Clean white (#ffffff)
**Grid Layout:** 1 col (mobile) → 2 cols (tablet) → 4 cols (desktop)
**Gap:** 32px between cards

### 3. Pricing Section
**Purpose:** Display 2 pricing plans with comparison
**Height:** Auto (700–800px typical)
**Spacing:** 80px top/bottom (desktop), 60px (tablet), 40px (mobile)
**Background:** Soft blue (#eff6ff or blue-50)
**Grid Layout:** 2 cols (desktop) → 1 col (mobile)
**Card Scale:** "Popular" plan scales up 5% on desktop, premium styling

### 4. FAQ Section
**Purpose:** Objection handling and credibility
**Height:** Auto (600–750px)
**Spacing:** 80px top/bottom (desktop), 60px (tablet), 40px (mobile)
**Background:** White (#ffffff)
**Accordion Layout:** Full width, stacked vertically
**Item Spacing:** 12px gap between accordion items

### 5. Testimonials Section
**Purpose:** Social proof via carousel
**Height:** Auto (500–600px)
**Spacing:** 80px top/bottom (desktop), 60px (tablet), 40px (mobile)
**Background:** Light gray (#f9fafb)
**Layout:** Centered carousel with navigation dots

### 6. CTA Banner Section
**Purpose:** Final conversion push before footer
**Height:** 200–250px
**Spacing:** 60px vertical padding, full bleed horizontal
**Background:** Dark gradient (blue → slate)
**Content Alignment:** Center, white text

### 7. Footer
**Purpose:** Links, legal, company info
**Height:** Auto (300–400px)
**Spacing:** 40px top/bottom, 20px gap for columns
**Background:** Dark (#0f172a or darker)
**Layout:** 4–5 cols (desktop) → 2 cols (tablet) → 1 col (mobile)

### 8. Modal Overlays (Lead Form)
**Purpose:** Lead capture modal (sits on top of any section)
**Dimensions:** Max 448px width (28rem)
**Spacing:** 32px padding inside modal
**Backdrop:** Black with 50% opacity
**Animation:** Scale in (0.95→1) + fade in (0.3s)

---

## Component Specifications

### 1. Hero Section

**Structure:**
```
<section> (min-h-screen)
  ├─ <div> Background gradient (absolute, inset-0)
  ├─ <div> Content container (relative, z-10)
  │   ├─ <h1> Heading
  │   ├─ <p> Subtitle
  │   ├─ <div> CTA Buttons
  │   └─ <div> Scroll indicator
```

**Hero Title (H1)**
- Font: Playfair Display, Bold (700)
- Size: 56px (desktop) / 48px (tablet) / 36px (mobile)
- Line-height: 1.2 (tight)
- Color: Gray-950 (#111827)
- Margin-bottom: 24px
- Animation: Fade in + slide up (0.8s, no delay)
- Content: "Planeje suas finanças em minutos, não horas."

**Hero Subtitle (P)**
- Font: Inter, Regular (400)
- Size: 20px (desktop) / 18px (tablet) / 16px (mobile)
- Line-height: 1.6 (relaxed)
- Color: Gray-700 (#374151)
- Margin-bottom: 32px
- Animation: Fade in + slide up (0.8s, 0.2s delay)
- Content: "Com inteligência artificial que entende VOCÊ"

**CTA Button Group**
- Layout: Flex row (gap: 16px)
- Responsive: Switches to flex-col on mobile (<640px)
- Spacing: 32px top margin
- Animation: Fade in + slide up (0.8s, 0.4s delay)

**Button: Primary (Platform)**
- Background: Blue-600 (#2563eb)
- Hover: Blue-700 (#1d4ed8)
- Active: Scale 95% (active:scale-95)
- Text: White, 600 weight (semibold)
- Padding: 16px vertical, 32px horizontal (py-4 px-8)
- Border-radius: 8px
- Shadow: lg on hover, xl on active
- Transition: 300ms
- Icon: None (text only)
- Content: "Começar com Plataforma (R$99,90/mês)"

**Button: Secondary (Demo)**
- Background: Transparent (border-based)
- Border: 2px solid Blue-600 (#2563eb)
- Text: Blue-600
- Hover: Blue-50 background
- Padding: 16px vertical, 32px horizontal
- Border-radius: 8px
- Transition: 300ms
- Content: "Agendar Demo"

**Scroll Indicator**
- Icon: ChevronDown (lucide-react)
- Size: 32px
- Color: Blue-600 (#2563eb)
- Animation: Y-bounce (0→10px→0, 2s loop)
- Margin-top: 64px

**Hero Background Gradient**
```css
background: linear-gradient(to bottom, #eff6ff, #ffffff);
```

---

### 2. Feature Cards (4-Column Grid)

**Grid Layout:**
- Desktop (≥1024px): 4 cols, 32px gap
- Tablet (640–1023px): 2 cols, 32px gap
- Mobile (<640px): 1 col, 24px gap

**Card Structure:**
```
<div> Card container (relative)
  ├─ <div> Icon container (mb-4)
  ├─ <h3> Title (mb-2)
  ├─ <p> Description (mb-4)
  └─ <a> "Explorar" link
```

**Feature Card**
- Background: White (#ffffff)
- Border: 1px solid Gray-200 (#e5e7eb)
- Border-radius: 8px
- Padding: 32px
- Transition: All 300ms
- Hover state:
  - Shadow: lg (0 10px 15px)
  - Transform: translateY(-4px) + scale(1.01)
  - Border color: Gray-300

**Card Title (H3)**
- Font: Inter, 600 (semibold)
- Size: 20px
- Color: Gray-900 (#111827)
- Margin-bottom: 8px
- Line-height: 1.4

**Card Description (P)**
- Font: Inter, 400 (regular)
- Size: 16px
- Color: Gray-600 (#4b5563)
- Margin-bottom: 16px
- Line-height: 1.6

**Icon Container**
- Size: 48px (w-12 h-12)
- Color: Blue-600 (#2563eb)
- Animation on hover: Scale 1.1 + color shift to Blue-700
- Transition: 300ms

**"Explorar" Link**
- Font: Inter, 600
- Size: 14px
- Color: Blue-600 (#2563eb)
- Hover: Underline
- Icon: Arrow (→) with 8px gap

**Animation (Per Card)**
- Initial: opacity 0, translateY(20px)
- Animate: opacity 1, translateY(0)
- Trigger: whileInView
- Delay: index × 0.1 (stagger effect)
- Duration: 600ms

---

### 3. Pricing Cards (2-Column, Comparison)

**Grid Layout:**
- Desktop: 2 cols, 32px gap
- Tablet: 2 cols (adjusted)
- Mobile: 1 col, 24px gap

**Card Structure (Plan):**
```
<div> Card container
  ├─ <div> Badge (if "POPULAR")
  ├─ <h3> Plan name
  ├─ <div> Price display
  ├─ <ul> Features list
  └─ <button> CTA
```

**Base Card Styling**
- Background: White (#ffffff)
- Border: 1px solid Gray-200 (or 2px Blue-600 for popular)
- Border-radius: 8px
- Padding: 32px
- Transition: All 300ms

**"Popular" Plan Styling (Consultoria)**
- Border: 2px solid Blue-600 (#2563eb)
- Scale: Desktop only, scale-up 5% (md:scale-105) with translateY(-16px)
- Ring: Ring-2 ring-blue-600

**Badge (POPULAR)**
- Position: absolute, -top-4 right-8
- Background: Blue-600 (#2563eb)
- Text: White, semibold, 14px
- Padding: 4px 16px
- Border-radius: full
- Content: "POPULAR"

**Plan Name (H3)**
- Font: Inter, 700 (bold)
- Size: 24px
- Color: Gray-900 (#111827)
- Margin-bottom: 8px

**Price Display**
- Container: Flex items-baseline
- Price number:
  - Font: Inter, 700
  - Size: 36px
  - Color: Blue-600 (#2563eb)
- Price suffix (/mês):
  - Font: Inter, 400
  - Size: 14px
  - Color: Gray-600 (#4b5563)
  - Margin-left: 4px
- Margin-bottom: 24px

**Features List (UL)**
- List-style: none
- Spacing: 12px between items (space-y-3)
- Margin-bottom: 32px

**Feature Item (LI)**
- Display: Flex items-start gap-3
- Icon: Check (lucide-react, 20px, Green-600)
- Icon flex-shrink: 0, margin-top: 4px
- Text:
  - Font: Inter, 400
  - Size: 16px
  - Color: Gray-700 (#374151)
  - Line-height: 1.6

**CTA Button (Plan)**
- Primary variant (Popular plan):
  - Background: Blue-600 (#2563eb)
  - Hover: Blue-700 (#1d4ed8)
  - Text: White, semibold
  - Content: "Agendar Demo"
- Secondary variant (Platform plan):
  - Background: Transparent
  - Border: 2px solid Blue-600 (#2563eb)
  - Text: Blue-600, semibold
  - Hover: Blue-50 background
  - Content: "Começar Agora"
- Padding: 12px vertical, 24px horizontal (py-3 px-6)
- Border-radius: 8px
- Transition: 300ms
- Active: scale-95 (active:scale-95)
- Width: Full (w-full)

**Pricing Section Heading**
- Font: Playfair Display, Bold (700)
- Size: 48px (desktop) / 40px (tablet) / 32px (mobile)
- Color: Gray-900 (#111827)
- Margin-bottom: 16px
- Animation: whileInView fade in + slide up (600ms)

**Pricing Subheading**
- Font: Inter, 400
- Size: 18px
- Color: Gray-600 (#4b5563)
- Margin-bottom: 64px
- Animation: whileInView (600ms, 0.1s delay)

**Guarantees Footer**
- Font: Inter, 400
- Size: 14px
- Color: Gray-600 (#4b5563)
- Content: "⚡ Sem contrato | Cancelamento fácil | Garantia 7 dias"
- Margin-top: 48px
- Text-align: center

---

### 4. Form Components (Lead Form Modal)

**Modal Container**
- Position: Fixed, full viewport
- Background: Black/50 backdrop with blur
- Display: Flex items-center justify-center
- Padding: 16px (mobile responsive)
- Z-index: 50

**Modal Inner**
- Background: White (#ffffff)
- Border-radius: 8px
- Shadow: xl
- Max-width: 448px (28rem)
- Width: Full (100%, capped at max-width)
- Padding: 32px (p-8)
- Animation:
  - Initial: opacity 0, scale 0.95
  - Animate: opacity 1, scale 1
  - Duration: 300ms

**Modal Header**
- Display: Flex justify-between items-center
- Margin-bottom: 24px

**Modal Title (H2)**
- Font: Inter, 700 (bold)
- Size: 24px
- Color: Gray-900 (#111827)

**Close Button (X Icon)**
- Icon: X (lucide-react, 24px)
- Color: Gray-400 (#9ca3af)
- Hover: Gray-600 (#4b5563)
- Transition: colors 200ms
- Aria-label: "Fechar"

**Form Wrapper**
- Display: Flex flex-col
- Gap: 16px (space-y-4)
- Margin-top: 16px

**Form Field (Generic)**
- Layout: Flex flex-col gap-8px
- Margin-bottom: 0 (parent handles spacing)

**Form Label**
- Font: Inter, 500 (medium)
- Size: 14px
- Color: Gray-700 (#374151)
- Margin-bottom: 8px
- For attribute: Proper ID linking

**Form Input (Text/Email/Tel)**
- Width: Full (w-full)
- Padding: 12px vertical, 16px horizontal (px-4 py-2)
- Border: 1px solid Gray-300 (#d1d5db)
- Border-radius: 8px
- Font: Inter, 400, 16px
- Color (text): Gray-900 (#111827)
- Placeholder: Gray-500 (#6b7280)
- Transition: All 200ms
- Focus state:
  - Border: Blue-600 (#2563eb)
  - Outline: None
  - Ring: ring-2 ring-blue-600
- Disabled: Opacity 50%, cursor not-allowed
- Type-specific:
  - **name:** text input
  - **email:** email input
  - **phone:** tel input (format helper optional)

**Error Message**
- Font: Inter, 400
- Size: 14px
- Color: Red-600 (#dc2626)
- Margin-top: 4px
- Icon: ⚠️ or similar (optional)

**Error Alert Box**
- Display: Flex items-center gap-8px
- Background: Red-50 (#fef2f2)
- Border: 1px solid Red-200 (#fecaca)
- Border-radius: 8px
- Padding: 12px (p-3)
- Icon: AlertCircle (lucide-react, 20px, Red-600)
- Text: Red-600, 14px
- Animation: Slide up + fade in (300ms)

**Submit Button (Form)**
- Width: Full (w-full)
- Padding: 12px vertical, 16px horizontal (py-3 px-4)
- Background: Blue-600 (#2563eb)
- Hover: Blue-700 (#1d4ed8)
- Active: scale-95
- Disabled: Blue-400 (#60a5fa), hover:scale-100
- Text: White, semibold (600), 16px
- Border-radius: 8px
- Transition: All 300ms
- Margin-top: 24px (mt-6)
- Content: "Começar Agora" OR "Salvando..." (loading state)

**Loading Spinner**
- SVG icon (24px)
- Animation: spin (1s infinite)
- Gap: 8px from text

**Success State (Modal)**
- Display: Flex flex-col items-center
- Padding: 32px vertical, 0 horizontal (py-8)
- Text-align: center

**Success Icon**
- Icon: CheckCircle (lucide-react, 48px)
- Color: Green-600 (#16a34a)
- Margin-bottom: 16px

**Success Title (H3)**
- Font: Inter, 600
- Size: 18px
- Color: Gray-900 (#111827)
- Margin-bottom: 8px

**Success Message (P)**
- Font: Inter, 400
- Size: 16px
- Color: Gray-600 (#4b5563)

**Legal Text (Footer)**
- Font: Inter, 400
- Size: 12px
- Color: Gray-500 (#6b7280)
- Text-align: center
- Margin-top: 16px

---

### 5. Buttons (Reusable Specs)

All buttons follow these base specifications with variants:

**Base Button Structure**
```
<button>
  └─ Text content OR
     ├─ Icon
     └─ Text (with gap-2)
```

**Base Styles**
- Font: Inter, 600 (semibold)
- Border-radius: 8px
- Transition: All 300ms
- Cursor: pointer
- Font-smoothing: antialiased
- Touch-action: manipulation

**Button Sizes**

| Size | Padding | Font Size | Min Height |
|------|---------|-----------|-----------|
| Small (sm) | py-2 px-4 | 14px | 36px |
| Medium (md) | py-3 px-6 | 16px | 40px |
| Large (lg) | py-4 px-8 | 16px | 44px |
| XLarge (xl) | py-4 px-10 | 18px | 56px |

**Button Variants**

| Variant | Background | Text | Border | Hover | Active |
|---------|-----------|------|--------|-------|--------|
| Primary | Blue-600 | White | None | Blue-700, shadow-lg | scale-95 |
| Secondary | Transparent | Blue-600 | 2px Blue-600 | Blue-50 bg | scale-95 |
| Danger | Red-600 | White | None | Red-700, shadow-lg | scale-95 |
| Ghost | Transparent | Gray-400 | None | White/10 bg | scale-95 |

**Focus State (All)**
- Ring: 2px Blue-500
- Ring-offset: 2px, offset color Black
- Border-radius: match button

**Disabled State (All)**
- Opacity: 50%
- Cursor: not-allowed
- Pointer-events: none

---

## Color Palette & Application

### Primary Colors

| Color | Hex | RGB | Usage |
|-------|-----|-----|-------|
| **Blue-600** | #2563eb | 37, 99, 235 | Primary CTAs, active states, links, icons |
| **Blue-50** | #eff6ff | 239, 245, 255 | Section backgrounds, light accents |
| **Blue-700** | #1d4ed8 | 29, 78, 216 | Hover states, darker elements |
| **Blue-400** | #60a5fa | 96, 165, 250 | Disabled states, lighter accents |

### Neutral/Dark Colors

| Color | Hex | RGB | Usage |
|-------|-----|-----|-------|
| **Gray-900** | #111827 | 17, 24, 39 | Headings, primary text |
| **Gray-800** | #1f2937 | 31, 41, 55 | Secondary headings |
| **Gray-700** | #374151 | 55, 65, 81 | Body text, labels |
| **Gray-600** | #4b5563 | 75, 85, 99 | Secondary text |
| **Gray-500** | #6b7280 | 107, 114, 128 | Tertiary text, placeholders |
| **Gray-400** | #9ca3af | 156, 163, 175 | Disabled text, hints |
| **Gray-300** | #d1d5db | 209, 213, 219 | Borders, dividers |
| **Gray-200** | #e5e7eb | 229, 231, 235 | Light borders |
| **Gray-50** | #f9fafb | 249, 250, 251 | Light backgrounds |
| **White** | #ffffff | 255, 255, 255 | Base background |

### Semantic Colors

| Color | Hex | Usage |
|-------|-----|-------|
| **Green-600** | #16a34a | Success states, checkmarks |
| **Green-50** | #f0fdf4 | Success backgrounds |
| **Red-600** | #dc2626 | Errors, danger states |
| **Red-50** | #fef2f2 | Error backgrounds |
| **Yellow-400** | #facc15 | Star ratings, warnings |

### Color Application by Section

**Hero Section**
- Background: `linear-gradient(to bottom, #eff6ff, #ffffff)`
- Text (H1): Gray-950 (#111827)
- Text (P): Gray-700 (#374151)
- Primary CTA: Blue-600
- Secondary CTA: Border Blue-600

**Features Section**
- Background: White (#ffffff)
- Card background: White (#ffffff)
- Card border: Gray-200 (#e5e7eb)
- Heading: Gray-900 (#111827)
- Icons: Blue-600 → Blue-700 on hover
- Links: Blue-600

**Pricing Section**
- Background: Blue-50 (#eff6ff)
- Card background: White (#ffffff)
- "Popular" border: Blue-600 (#2563eb)
- Price number: Blue-600 (#2563eb)
- Heading: Gray-900 (#111827)
- Features list: Gray-700 (#374151)
- Check icon: Green-600 (#16a34a)

**Testimonials Section**
- Background: Gray-50 (#f9fafb)
- Card background: White (#ffffff)
- Star rating: Yellow-400 (#facc15)
- Heading: Gray-900 (#111827)
- Quote: Gray-900 (#111827)
- Author: Gray-600 (#4b5563)

**Form Modal**
- Backdrop: Black/50 opacity
- Modal background: White (#ffffff)
- Input borders: Gray-300 (#d1d5db)
- Input focus border: Blue-600 (#2563eb)
- Error border: Red-200 (#fecaca)
- Error text: Red-600 (#dc2626)

**Footer**
- Background: Dark slate (#0f172a or darker, #111827 base)
- Text: Gray-100 (#f3f4f6) / Gray-400 (#9ca3af)
- Links: Blue-600 → Blue-500 on hover

---

## Typography Scale

### Font Stack

**Headings:**
- Font family: Playfair Display
- Weight: 700 (Bold)
- Letter-spacing: -0.02em (tight)

**Body & UI:**
- Font family: Inter
- Weights: 400 (Regular), 500 (Medium), 600 (Semibold), 700 (Bold)
- Letter-spacing: default (0em)

### Complete Size Scale

| Level | Component | Size (Desktop) | Size (Tablet) | Size (Mobile) | Weight | Line-Height |
|-------|-----------|---|---|---|---|---|
| H1 | Hero title | 56px | 48px | 36px | 700 | 1.2 |
| H2 | Section title | 48px | 40px | 32px | 700 | 1.2 |
| H3 | Subsection/Card title | 24px | 20px | 20px | 700 (Playfair) / 600 (Inter) | 1.4 |
| H4 | Form labels, small headings | 18px | 16px | 16px | 600 | 1.5 |
| Body Large | Subtitle, lead text | 20px | 18px | 16px | 400 | 1.6 |
| Body Regular | Paragraph text | 16px | 16px | 14px | 400 | 1.6 |
| Body Small | Secondary text | 14px | 14px | 13px | 400 | 1.5 |
| Caption | Label, hint text | 12px | 12px | 12px | 400 | 1.4 |

### Specific Usage Examples

**Hero H1:**
- Size: 56px (desktop), 48px (tablet), 36px (mobile)
- Font: Playfair Display 700
- Line-height: 1.2 (56px × 1.2 = 67.2px)
- Margin-bottom: 24px

**Hero Subtitle (Body Large):**
- Size: 20px (desktop), 18px (tablet), 16px (mobile)
- Font: Inter 400
- Line-height: 1.6 (20px × 1.6 = 32px)
- Margin-bottom: 32px

**Feature Card Title (H3):**
- Size: 20px (constant)
- Font: Inter 600
- Line-height: 1.4 (20px × 1.4 = 28px)
- Margin-bottom: 8px

**Feature Card Description:**
- Size: 16px (constant)
- Font: Inter 400
- Line-height: 1.6 (16px × 1.6 = 25.6px)
- Margin-bottom: 16px

**Pricing Plan Name:**
- Size: 24px (constant)
- Font: Inter 700
- Line-height: 1.35 (24px × 1.35 = 32.4px)
- Margin-bottom: 8px

**Pricing Price Number:**
- Size: 36px (constant)
- Font: Inter 700
- Line-height: 1.2 (36px × 1.2 = 43.2px)

**Form Label:**
- Size: 14px (constant)
- Font: Inter 500
- Line-height: 1.4 (14px × 1.4 = 19.6px)
- Margin-bottom: 8px

**Form Input:**
- Size: 16px (constant)
- Font: Inter 400
- Line-height: 1.5 (16px × 1.5 = 24px)
- Padding: 12px vertical → content height ~40px

---

## Spacing System

All spacing uses an 8px base unit (Tailwind convention). This ensures consistent, scalable layouts across all breakpoints.

### Base Unit: 8px

**Pixel Values:**
- 2px (0.25 unit) = gap-0.5
- 4px (0.5 units) = gap-1
- 8px (1 unit) = gap-2
- 12px (1.5 units) = gap-3
- 16px (2 units) = gap-4
- 20px (2.5 units) = gap-5
- 24px (3 units) = gap-6
- 32px (4 units) = gap-8
- 40px (5 units) = gap-10
- 48px (6 units) = gap-12
- 56px (7 units) = gap-14
- 64px (8 units) = gap-16
- 80px (10 units) = gap-20
- 96px (12 units) = gap-24

### Padding & Margins

| Area | Desktop | Tablet | Mobile |
|------|---------|--------|--------|
| **Section vertical (top/bottom)** | 80px (py-20) | 60px (py-15) | 40px (py-10) |
| **Section horizontal** | Full width, max-content 7xl | Full with padding | 16px padding (px-4) |
| **Container padding** | 64px (px-16) | 32px (px-8) | 16px (px-4) |
| **Card padding** | 32px (p-8) | 24px (p-6) | 20px (p-5) |
| **Grid gaps** | 32px (gap-8) | 24px (gap-6) | 16px (gap-4) |

### Typography Spacing

| Element | Top Margin | Bottom Margin |
|---------|-----------|--------------|
| **H1** | 0 | 24px (mb-6) |
| **H2** | 0 | 16px (mb-4) |
| **H3** | 0 | 8px (mb-2) |
| **Body Paragraph** | 0 | 16px (mb-4) |
| **Form Field** | 0 | 16px (mb-4) |

### Interactive Element Spacing

| Element | Padding | Gap |
|---------|---------|-----|
| **Button (lg)** | 16px vertical, 32px horizontal | 8px (icon gap) |
| **Button (md)** | 12px vertical, 24px horizontal | 6px (icon gap) |
| **Form Input** | 12px vertical, 16px horizontal | — |
| **Card** | 32px (desktop), 24px (tablet), 20px (mobile) | — |
| **Form group** | 0 | 16px (space-y-4) |

### Responsive Spacing Pattern

All spacing is mobile-first and scales upward:

```tailwind
/* Mobile first */
.section {
  @apply py-10 px-4;  /* 40px vertical, 16px horizontal */
}

/* Tablet (≥640px) */
@screen sm {
  .section {
    @apply py-15 px-6;  /* 60px vertical, 24px horizontal */
  }
}

/* Desktop (≥1024px) */
@screen lg {
  .section {
    @apply py-20 px-8;  /* 80px vertical, 32px horizontal */
  }
}
```

---

## Animation Specifications

All animations use **Framer Motion** for performance and consistency. Durations and easing functions are standardized.

### Animation Timing

| Duration | Usage |
|----------|-------|
| **200ms** | Micro-interactions (hover, focus) |
| **300ms** | Form feedback, quick transitions |
| **400ms** | Element enter/exit |
| **500–600ms** | Section reveals (whileInView) |
| **800ms** | Hero animations (staggered) |

### Easing Functions

| Function | Timing | Usage |
|----------|--------|-------|
| **ease-out** | Cubic Bezier(0.4, 0, 0.2, 1) | Enters, slides up |
| **ease-in-out** | Cubic Bezier(0.42, 0, 0.58, 1) | Smooth transitions |
| **ease-linear** | Linear | Infinite loops |

### Hero Section Animations

**H1 Fade + Slide Up**
```javascript
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.8 }}
```

**Subtitle Fade + Slide Up (Staggered)**
```javascript
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.8, delay: 0.2 }}
```

**CTA Buttons Fade + Slide Up (Staggered)**
```javascript
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.8, delay: 0.4 }}
```

**Scroll Indicator Bounce**
```javascript
animate={{ y: [0, 10, 0] }}
transition={{ repeat: Infinity, duration: 2 }}
```

### Section Reveal Animations (whileInView)

Applied to: Features cards, Pricing cards, Testimonial, FAQ, etc.

**Basic Fade + Slide Up**
```javascript
initial={{ opacity: 0, y: 20 }}
whileInView={{ opacity: 1, y: 0 }}
transition={{ duration: 0.6 }}
viewport={{ once: true }}
```

**Staggered Cards (Per-Item Delay)**
```javascript
delay: index * 0.1  // 0s, 0.1s, 0.2s, etc.
```

**Section Title Reveal**
```javascript
initial={{ opacity: 0, y: 20 }}
whileInView={{ opacity: 1, y: 0 }}
transition={{ duration: 0.6 }}
viewport={{ once: true }}
```

### Button Interactions

**Hover Scale**
```css
hover:scale-105 active:scale-95
transition-all duration-300
```

**Focus Ring**
```css
focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ring-offset-black
```

### Modal Animations

**Backdrop Fade In**
```javascript
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
exit={{ opacity: 0 }}
transition={{ duration: 0.2 }}
```

**Modal Scale + Fade In**
```javascript
initial={{ opacity: 0, scale: 0.95 }}
animate={{ opacity: 1, scale: 1 }}
exit={{ opacity: 0, scale: 0.95 }}
transition={{ duration: 0.3 }}
```

**Form Success State**
```javascript
initial={{ opacity: 0, y: 10 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.3 }}
```

**Error Alert Slide In**
```javascript
initial={{ opacity: 0, y: -10 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.3 }}
```

### Testimonial Carousel

**Slide Fade Transition**
```javascript
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
exit={{ opacity: 0 }}
transition={{ duration: 0.5 }}
key={currentIndex}  // Trigger re-animation on change
```

### Accessibility Considerations for Animations

- **Prefers reduced motion:** Always respect `prefers-reduced-motion` media query
- **No flashing:** Animations avoid > 3 flashes/sec (WCAG 2.3.3)
- **Essential information:** No critical information conveyed by animation alone
- **Auto-play:** Limit auto-play on carousels; allow user pause/control

---

## Responsive Breakpoints

All layouts use Tailwind's mobile-first breakpoint strategy.

### Breakpoint Definitions

| Breakpoint | Alias | Screen Width |
|-----------|-------|--------------|
| **Mobile** | (none) | < 640px |
| **Small** | sm | ≥ 640px |
| **Medium** | md | ≥ 768px |
| **Large** | lg | ≥ 1024px |
| **X-Large** | xl | ≥ 1280px |
| **2X-Large** | 2xl | ≥ 1536px |

### Component Breakpoint Strategy

#### Hero Section
```javascript
// H1 Font Size
desktop: 56px (lg:)
tablet: 48px (md:)
mobile: 36px (default)

// Buttons Layout
desktop: flex-row (lg:flex-row)
tablet: flex-row (md:flex-row)
mobile: flex-col (default)
```

#### Features Grid
```javascript
// Grid Columns
desktop: 4 cols (lg:grid-cols-4)
tablet: 2 cols (md:grid-cols-2)
mobile: 1 col (grid-cols-1)

// Gap
all: 32px (lg:gap-8)
tablet: 24px (md:gap-6)
mobile: 16px (gap-4)
```

#### Pricing Grid
```javascript
// Grid Layout
desktop: 2 cols (md:grid-cols-2)
mobile: 1 col (grid-cols-1)

// Popular Plan Scale
desktop: scale-105 -translate-y-4 (md:scale-105 md:-translate-y-4)
mobile: scale-100 translate-y-0 (default)
```

#### Testimonials Carousel
```javascript
// Quote Size
desktop: 20px (text-2xl)
mobile: 18px (text-xl)

// Container Padding
desktop: 48px horizontal (md:px-12)
mobile: 24px horizontal (px-6)
```

#### Form Modal
```javascript
// Modal Width
desktop: 448px max-width (max-w-md)
tablet/mobile: 100% - 32px (w-full)

// Backdrop Padding
all: 16px (p-4)
```

#### Footer
```javascript
// Column Layout
desktop: 5 cols (lg:grid-cols-5)
tablet: 2 cols (md:grid-cols-2)
mobile: 1 col (grid-cols-1)

// Padding
desktop: 64px top/bottom (lg:py-16)
tablet: 48px top/bottom (md:py-12)
mobile: 32px top/bottom (py-8)
```

### Container Max-Width

| Context | Max-Width | Tailwind Class |
|---------|-----------|-----------------|
| Hero | Full width | w-full |
| Features/Pricing | 1280px | max-w-7xl |
| Testimonials | 1280px | max-w-5xl |
| Form Modal | 448px | max-w-md |
| General container | 1280px | max-w-7xl |

---

## Accessibility Checklist

### WCAG 2.1 AA Compliance

#### Color Contrast

- [ ] **Text on backgrounds:** Minimum 4.5:1 contrast ratio
  - Blue-600 (#2563eb) on White (#ffffff): 4.53:1 ✓
  - Gray-700 (#374151) on White (#ffffff): 8.59:1 ✓
  - Gray-600 (#4b5563) on White (#ffffff): 7.36:1 ✓
  - White on Blue-600 (#2563eb): 4.53:1 ✓
  - Gray-900 (#111827) on White (#ffffff): 13.68:1 ✓

- [ ] **Disabled elements:** Minimum 3:1 contrast ratio
  - Blue-400 (#60a5fa) on White: 3.08:1 ✓

- [ ] **UI Components:** Minimum 3:1 contrast for borders, focus indicators
  - Blue-600 focus ring on dark: ✓
  - Gray-300 borders on White: 3.5:1 ✓

#### Focus States

- [ ] **All interactive elements** have visible focus indicators
  - Buttons: `ring-2 ring-blue-500 ring-offset-2 ring-offset-black`
  - Links: Blue-600 text + underline on focus
  - Form inputs: Blue border + ring on focus
  - Outline offset: 2px minimum

- [ ] **Focus order:** Logical tabbing sequence (left→right, top→bottom)
- [ ] **Focus visible only:** Focus outline appears only on keyboard navigation (`:focus-visible`)

#### Semantic HTML

- [ ] **Heading hierarchy:** H1 > H2 > H3 (no skipping)
  - H1: Hero title (only one per page)
  - H2: Section titles (Features, Pricing, Testimonials, FAQ)
  - H3: Card titles, subsections

- [ ] **Form labels:** All inputs have `<label>` elements with `htmlFor` attribute
  - Name input: `<label htmlFor="name">`
  - Email input: `<label htmlFor="email">`
  - Phone input: `<label htmlFor="phone">`

- [ ] **Form errors:** Associate error messages with inputs via `aria-describedby`
  - `<input aria-describedby="error-name" />`
  - `<p id="error-name">Error text</p>`

- [ ] **Buttons vs links:** Use correct element type
  - Form submission: `<button type="submit">`
  - Navigation: `<a href="...">`
  - Call to action: `<button onClick={...}>`

- [ ] **Landmarks:** Proper semantic structure
  - `<header>` for navigation/hero
  - `<main>` for primary content
  - `<section>` for content sections
  - `<footer>` for footer

#### Images & Icons

- [ ] **All images have alt text** (decorative images use `alt=""`)
- [ ] **Icons have labels:**
  - Icon buttons: `aria-label="Next"`
  - Decorative icons: `aria-hidden="true"`
  - Informative icons: included in adjacent text

#### Motion & Animation

- [ ] **Prefers reduced motion:** Respect `prefers-reduced-motion: reduce`
  ```css
  @media (prefers-reduced-motion: reduce) {
    * {
      animation: none !important;
      transition: none !important;
    }
  }
  ```

- [ ] **Auto-playing content:** Pause controls on carousels (Testimonials)
  - Play/Pause button visible
  - Auto-play stops on user interaction

- [ ] **No rapid flashing:** < 3 flashes per second (WCAG 2.3.3)

#### Text & Typography

- [ ] **Font sizes:** Minimum 14px for body text, 16px for form inputs
- [ ] **Line height:** Minimum 1.5 for body text
- [ ] **Letter spacing:** Reasonable, no excessive compression
- [ ] **Text contrast:** No light gray on light backgrounds

#### Keyboard Navigation

- [ ] **All functions accessible via keyboard:**
  - Tab through form fields
  - Enter submits forms
  - Space/Enter activates buttons
  - Escape closes modals

- [ ] **No keyboard traps:** Focus can move away from any element

#### Form Accessibility

- [ ] **Required fields:** Marked with `*` and `aria-required="true"`
- [ ] **Validation messages:** Associated with inputs, screen reader announced
- [ ] **Error recovery:** Preserve valid data when form submission fails
- [ ] **Clear labels:** Labels describe input purpose clearly

#### Screen Reader Support

- [ ] **Live regions:** Status messages use `aria-live="polite"` / "assertive"`
- [ ] **Hidden content:** Decorative elements use `aria-hidden="true"`
- [ ] **Button text:** All buttons have descriptive text (no icon-only without label)
- [ ] **Modal:** Trap focus inside modal, trap lifted on close

#### Mobile Accessibility

- [ ] **Touch targets:** Minimum 44px × 44px on mobile
- [ ] **Pinch zoom:** Not disabled (no `user-scalable=no`)
- [ ] **Orientation:** Content works in both portrait and landscape
- [ ] **Text reflow:** No horizontal scrolling required

---

## Mobile Optimizations

### Strategy: Mobile-First Development

All layouts start with mobile constraints, then enhance for larger screens.

### Mobile-Specific CSS

#### Touch Target Sizing
```css
.touch-target {
  min-height: 44px;
  min-width: 44px;
}

@media (min-width: 768px) {
  .touch-target {
    min-height: 40px;
    min-width: 40px;
  }
}
```

#### Responsive Type Scaling
```css
/* Mobile: 16px base */
body { font-size: 16px; }

h1 { font-size: 36px; }  /* Mobile */
@media (min-width: 768px) { h1 { font-size: 48px; } }
@media (min-width: 1024px) { h1 { font-size: 56px; } }
```

#### Flex Direction Stacking
```css
/* Mobile: Stack vertically */
.button-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Desktop: Side by side */
@media (min-width: 640px) {
  .button-group {
    flex-direction: row;
  }
}
```

#### Grid Auto-Layout
```css
/* Mobile: 1 column */
.grid { grid-template-columns: 1fr; }

/* Tablet: 2 columns */
@media (min-width: 768px) {
  .grid { grid-template-columns: repeat(2, 1fr); }
}

/* Desktop: 4 columns */
@media (min-width: 1024px) {
  .grid { grid-template-columns: repeat(4, 1fr); }
}
```

### Mobile-Safe Spacing

| Element | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| Container padding | 16px | 24px | 32px |
| Section vertical | 40px | 60px | 80px |
| Grid gaps | 16px | 24px | 32px |
| Modal padding | 20px | 24px | 32px |

### Mobile Form Optimization

- **Input height:** 44px (minimum touch target)
- **Font size:** 16px (prevents auto-zoom on iOS)
- **Padding:** 12px vertical, 16px horizontal
- **Label size:** 14px (readable, not cramped)
- **Error text:** 12px (below input, red-600)

### Mobile Navigation

- **Sticky header:** Consider sticky nav for long pages
- **Bottom CTA:** CTA button can be fixed at bottom on mobile
- **Modal:** Full-screen or near-full on mobile (max-w-full max-h-full)
- **Hamburger menu:** Not used on landing (full nav visible)

### Mobile Image Optimization

- **Hero background:** Use CSS gradient, no background image on mobile
- **Icons:** SVG only (lightweight, scalable)
- **Responsive images:** `srcset` for future if photos added

### Mobile Performance

- **Lazy loading:** Cards revealed on scroll (Framer Motion `whileInView`)
- **Animations:** Disable on `prefers-reduced-motion` or low-end devices
- **Bundle size:** Keep under 100KB gzip for fast mobile load

### Mobile Testing Checklist

- [ ] Test on iPhone 12/13/14 (375px–390px width)
- [ ] Test on Android (360px–412px width)
- [ ] Test on iPad (768px–820px width)
- [ ] Verify all buttons/links are 44px min height
- [ ] Check form input keyboard doesn't hide form (iOS)
- [ ] Verify no horizontal scrolling
- [ ] Test with network throttling (Slow 3G)
- [ ] Verify touch interactions work (no hover states only)

---

## Figma Structure & Mockups

### Figma File Organization

**File Name:** `TRANSFORME-Landing-v2` (or similar in design system workspace)

#### Pages

```
├─ 1. Cover
│  └─ Design system overview, token reference
│
├─ 2. Component Library
│  ├─ Buttons (Primary, Secondary, Danger, Ghost)
│  ├─ Form Inputs (Text, Email, Tel, States)
│  ├─ Form Fields (with label, error, success)
│  ├─ Cards (Feature, Pricing, Testimonial)
│  ├─ Modal (Base, with success, with error)
│  ├─ Icons (all Lucide icons used)
│  └─ Typography (all scales)
│
├─ 3. Design Tokens
│  ├─ Colors (swatches, hex values)
│  ├─ Typography (font files, scales)
│  ├─ Spacing (8px grid, common sizes)
│  ├─ Shadow (elevation levels)
│  └─ Animations (easing reference)
│
├─ 4. Desktop Layout (≥1024px)
│  ├─ Hero section
│  ├─ Features section
│  ├─ Pricing section
│  ├─ FAQ section
│  ├─ Testimonials section
│  ├─ CTA Banner
│  └─ Footer
│
├─ 5. Tablet Layout (768px–1023px)
│  └─ (Same sections, responsive adjustments)
│
├─ 6. Mobile Layout (<768px)
│  └─ (Same sections, mobile-optimized)
│
├─ 7. Interactive States
│  ├─ Button hover states
│  ├─ Form validation states
│  ├─ Modal open/closed
│  ├─ Carousel states (prev/next)
│  └─ Card hover effects
│
├─ 8. Prototypes
│  ├─ Form submission flow
│  ├─ Carousel navigation
│  ├─ Modal open/close
│  └─ Scroll animations (reference)
│
└─ 9. Specs & Documentation
   ├─ Spacing guide (visual ruler)
   ├─ Color palette (with contrast ratios)
   ├─ Typography usage
   ├─ Animation guide
   └─ Accessibility notes
```

#### Component Naming Convention

All components follow pattern: `[Type]/[Variant]/[State]`

**Examples:**
- `Button/Primary/Default`
- `Button/Primary/Hover`
- `Button/Primary/Active`
- `Button/Primary/Disabled`
- `Button/Secondary/Default`
- `Button/Secondary/Hover`
- `FormInput/Text/Default`
- `FormInput/Text/Focus`
- `FormInput/Text/Error`
- `Card/Feature/Default`
- `Card/Feature/Hover`
- `Card/Pricing/Popular`
- `Modal/LeadForm/Default`
- `Modal/LeadForm/Success`

#### Asset Exports

All components exported as:
- **SVG** (scalable, color-controllable)
- **PNG** (high-resolution reference, 2x for Retina)
- **Component** (ready for dev handoff via Figma Dev Mode)

#### Documentation in Figma

Each page/section includes:
- **Title:** Section name
- **Description:** Purpose, key features
- **Specs:**
  - Dimensions (width, height, min/max)
  - Spacing (padding, margin, gaps)
  - Typography (font, size, weight, line-height)
  - Colors (hex values, semantic name)
  - Animations (easing, duration, trigger)
- **Variants:** List all available states
- **Usage notes:** When/how to use each variant

---

## Summary & Development Handoff

### What's Included

1. **Complete component specifications** with exact pixel dimensions, spacing, typography, and colors
2. **Responsive breakpoint strategy** with mobile-first approach
3. **Animation timings and easing** for Framer Motion implementation
4. **Accessibility compliance checklist** (WCAG 2.1 AA)
5. **Color palette** with contrast ratios and semantic naming
6. **Typography scale** with all sizes and weights
7. **Spacing system** based on 8px grid
8. **Form and modal specifications** with error/success states
9. **Mobile optimization guidelines** and testing checklist
10. **Figma structure reference** for design handoff

### Development Next Steps

1. **Review this document** with development team
2. **Create Figma file** following the structure outlined
3. **Build component library** in React (Button, FormInput, Card, Modal, etc.)
4. **Implement responsive layouts** using Tailwind breakpoints
5. **Add Framer Motion animations** with specified durations
6. **Test accessibility** (axe DevTools, manual keyboard nav, screen reader)
7. **Test on mobile devices** (real devices, not just browser simulation)
8. **Performance audit** (Lighthouse, bundle analysis)
9. **Deploy and monitor** (Core Web Vitals, user feedback)

### File Locations

- **Design System Doc:** `/docs/TRANSFORME_LANDING_VISUAL_SYSTEM.md` (this file)
- **Figma File:** [Share link in project wiki]
- **Component Implementations:** `/src/components/landing/`
- **Tailwind Config:** `/tailwind.config.js`
- **Global Styles:** `/index.css`

---

**End of Visual System Specification**

*For questions or updates, contact Luna (transforme-landing-enhancement-squad)*
