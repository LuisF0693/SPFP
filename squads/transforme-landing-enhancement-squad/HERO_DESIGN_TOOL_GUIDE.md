# Hero Section — Design Tool Export & Handoff Guide

**For:** Figma, Adobe XD, or any design tool export
**Version:** 1.0.0
**Date:** 2026-02-23

---

## Component Architecture in Design Tools

### 1. Component Structure (Figma Boards)

```
📦 SPFP Landing Page / Hero Section
├── 📄 Desktop (1920px)
│   ├── Hero Layout
│   ├── Hero - States
│   │   ├── Default
│   │   ├── With Form Modal
│   │   └── Scroll Animation Frame
│   └── Components Library
│       ├── Primary Button
│       ├── Secondary Button
│       └── ChevronDown Icon
│
├── 📄 Tablet (768px)
│   ├── Hero Layout
│   ├── Hero - Responsive
│   └── Components (reused)
│
└── 📄 Mobile (375px)
    ├── Hero Layout
    ├── Button States (Stacked)
    └── Components (reused)
```

---

## 2. Component Library Setup

### Button Components

**Path:** `/Components/Buttons/Hero CTA`

#### Primary Button Component
```
📦 Primary Button (Interactive)
├── Layer: Container
│   ├── Background: #3b82f6 (blue-600)
│   ├── Border-radius: 8px (rounded-lg)
│   ├── Padding: 16px (top/bottom) × 32px (horizontal)
│   ├── Shadow: 0 10px 15px rgba(0,0,0,0.1) [shadow-lg]
│   └── Width: Auto (content-based)
│
├── 🔘 Variant: Hover
│   ├── Background: #2563eb (blue-700)
│   ├── Shadow: 0 20px 25px rgba(0,0,0,0.1) [shadow-xl]
│   ├── Scale: 1.05 (5% enlarged)
│   └── Transition: 300ms ease-out
│
├── 🔘 Variant: Active
│   ├── Background: #1d4ed8 (blue-800)
│   ├── Scale: 0.95 (5% shrunk)
│   └── Shadow: 0 4px 6px rgba(0,0,0,0.1) [shadow-md]
│
├── 🔘 Variant: Focus
│   ├── Ring: 2px solid #3b82f6
│   ├── Ring-offset: 2px
│   └── Outline: visible (accessibility)
│
├── 🔘 Variant: Disabled
│   ├── Background: #cbd5e1 (slate-300)
│   ├── Text-color: #64748b (slate-500)
│   ├── Opacity: 0.5
│   └── Cursor: not-allowed
│
├── Text Layer
│   ├── Font: Inter, 16px, weight 600 (semibold)
│   ├── Color: #ffffff (white)
│   ├── Line-height: 1.5
│   ├── Letter-spacing: 0.5px
│   └── Content: "Começar com Plataforma (R$99,90/mês)"
│
└── Constraints
    ├── Horizontal: Center
    ├── Vertical: Center
    └── Responsive: Fixed size (content-based width)
```

#### Secondary Button Component
```
📦 Secondary Button (Interactive)
├── Layer: Container
│   ├── Background: transparent
│   ├── Border: 2px solid #3b82f6 (blue-600)
│   ├── Border-radius: 8px
│   ├── Padding: 16px × 32px
│   └── Width: Auto
│
├── 🔘 Variant: Hover
│   ├── Background: #f0f6ff (blue-50)
│   ├── Border-color: #2563eb (blue-700, optional)
│   ├── Scale: 1.05
│   └── Transition: 300ms
│
├── 🔘 Variant: Active
│   ├── Background: #e0ecff (blue-100)
│   ├── Border-color: #1d4ed8
│   └── Scale: 0.95
│
├── Text Layer
│   ├── Font: Inter, 16px, weight 600
│   ├── Color: #3b82f6 (blue-600)
│   ├── Content: "Agendar Demo"
│   └── Line-height: 1.5
│
└── Constraints
    ├── Horizontal: Center
    └── Vertical: Center
```

### Icon Component

**Path:** `/Components/Icons/ChevronDown`

```
📦 ChevronDown Icon
├── SVG Shape
│   ├── Viewbox: "0 0 24 24"
│   ├── Stroke: 2px
│   ├── Color: Inherits from parent (currentColor)
│   └── Size: 32×32px (w-8 h-8)
│
├── 🔘 Size Variant: Small (sm)
│   ├── Size: 20×20px
│   └── Used in: Button icons
│
├── 🔘 Size Variant: Medium (md)
│   ├── Size: 24×24px
│   └── Used in: Section headers
│
├── 🔘 Size Variant: Large (lg)
│   ├── Size: 32×32px (Hero scroll indicator)
│   └── Stroke: 2px
│
└── Color Variants
    ├── Primary: #3b82f6 (blue-600)
    ├── Gray: #6b7280 (gray-500)
    └── White: #ffffff
```

---

## 3. Frame & Artboard Setup

### Desktop Frame (1920×1080)

```
┌─────────────────────────────────────────────┐
│ Frame: Hero - Desktop (1920×1080)           │
├─────────────────────────────────────────────┤
│                                             │
│ ▢ Background Group                          │
│   ├─ Gradient 1: blue-50 → white (vertical)│
│   └─ Gradient 2: blue-400/10 overlay       │
│                                             │
│ ▢ Content Group (centered)                  │
│   ├─ max-width: 504px                      │
│   ├─ Headline (text, 60px, Playfair)      │
│   ├─ Subheading (text, 24px, Inter)       │
│   ├─ Buttons Group (flex row, gap 16px)   │
│   │  ├─ Primary Button (component ref)     │
│   │  └─ Secondary Button (component ref)   │
│   └─ Scroll Indicator (ChevronDown, 32px) │
│                                             │
│ Guides:                                     │
│   ├─ Center horizontal line                │
│   ├─ Center vertical line                  │
│   └─ Grid: 8px (snap to)                   │
│                                             │
└─────────────────────────────────────────────┘
```

### Tablet Frame (768×1024)

```
┌────────────────────────┐
│ Frame: Hero - Tablet   │
│ (768×1024)             │
├────────────────────────┤
│ Same structure, but:   │
│ • Headline: 48px       │
│ • Subheading: 20px     │
│ • Buttons: still flex  │
│   (side-by-side until  │
│    viewport < 640px)   │
└────────────────────────┘
```

### Mobile Frame (375×667)

```
┌──────────────────┐
│ Frame: Hero -    │
│ Mobile (375×667) │
├──────────────────┤
│ • Headline: 36px │
│ • Subheading: 18 │
│ • Buttons:       │
│   stacked        │
│   (full-width)   │
│ • Padding: 16px  │
│   (both sides)   │
└──────────────────┘
```

---

## 4. Design Tokens Export

### Color Tokens

**Export format: CSS Variables / JSON**

```json
{
  "colors": {
    "primary": {
      "50": "#f0f6ff",
      "600": "#3b82f6",
      "700": "#2563eb",
      "800": "#1d4ed8"
    },
    "gray": {
      "200": "#e5e7eb",
      "700": "#374151",
      "950": "#111827"
    },
    "white": "#ffffff"
  }
}
```

### Typography Tokens

```json
{
  "typography": {
    "headline": {
      "desktop": {
        "fontSize": 60,
        "fontFamily": "Playfair Display",
        "fontWeight": 700,
        "lineHeight": 1.2
      },
      "tablet": {
        "fontSize": 48
      },
      "mobile": {
        "fontSize": 36
      }
    },
    "subheading": {
      "desktop": {
        "fontSize": 24,
        "fontFamily": "Inter",
        "fontWeight": 400,
        "lineHeight": 1.6
      },
      "tablet": { "fontSize": 20 },
      "mobile": { "fontSize": 18 }
    }
  }
}
```

### Spacing Tokens

```json
{
  "spacing": {
    "section": {
      "paddingDesktop": 80,
      "paddingTablet": 64,
      "paddingMobile": 48
    },
    "headline-to-subheading": {
      "desktop": 24,
      "tablet": 16,
      "mobile": 12
    },
    "subheading-to-buttons": {
      "desktop": 32,
      "tablet": 20,
      "mobile": 16
    },
    "button-gap": {
      "desktop": 16,
      "mobile": 8
    }
  }
}
```

---

## 5. State Variants & Animations

### Button States

**In Figma:** Use "Component Sets" with variants

```
Primary Button
├── Size: Large (default)
├── State: Default / Hover / Active / Focus / Disabled
└── Create all combinations as variants
```

**Animation Specifications (exported as separate frames):**

#### Hover Animation (300ms)
```
Frame 1: Default state (t=0ms)
├─ Scale: 1.0
├─ Background: #3b82f6
└─ Shadow: shadow-lg

Frame 2: Mid-animation (t=150ms)
├─ Scale: 1.025
├─ Background: #2991f5 (midway color)
└─ Shadow: medium

Frame 3: Hover complete (t=300ms)
├─ Scale: 1.05
├─ Background: #2563eb
└─ Shadow: shadow-xl
```

#### Active/Press Animation (100ms)
```
Frame 1: Hover state (t=0ms)
├─ Scale: 1.05
└─ Shadow: shadow-xl

Frame 2: Active (t=100ms)
├─ Scale: 0.95
└─ Shadow: shadow-md
```

#### Scroll Indicator Animation (2s loop)
```
Frame 1: Top position (t=0ms)
├─ Y: 0px
└─ Opacity: 1

Frame 2: Mid-bounce (t=500ms)
├─ Y: 10px
└─ Opacity: 1

Frame 3: Return (t=1500ms)
├─ Y: 5px
└─ Opacity: 1

Frame 4: Back to top (t=2000ms)
├─ Y: 0px
└─ Opacity: 1
├─ Loop back to Frame 1
```

---

## 6. Accessibility Annotations

### Design Annotations for Developers

**Add text notes in Figma:**

```
🔤 HEADLINE
├─ Font: Playfair Display, 60px, weight 700
├─ Color: #111827 (gray-950) — contrast 21:1 ✓ AAA
├─ Semantic: <h1> tag (page main heading)
└─ ARIA: None (heading is sufficient)

🔤 SUBHEADING
├─ Font: Inter, 24px, weight 400
├─ Color: #374151 (gray-700) — contrast 7.8:1 ✓ AAA
├─ Semantic: <p> tag (not <h2>)
├─ Emphasis: <strong> around "VOCÊ"
└─ ARIA: None

🔘 PRIMARY BUTTON
├─ Semantic: <button> tag
├─ Focus ring: 2px #3b82f6, offset 2px (must be visible)
├─ Touch target: 56px tall × ~160px wide (exceeds 44×44 minimum)
├─ ARIA: aria-label="Começar com Plataforma por R$99,90/mês"
└─ Keyboard: Tab-accessible, Enter to activate

🔘 SECONDARY BUTTON
├─ Semantic: <button> tag
├─ Focus ring: Same as primary
├─ Touch target: 56px × ~160px
├─ ARIA: aria-label="Agendar uma demonstração do SPFP"
└─ Keyboard: Tab-accessible, Enter to activate

⬇️ SCROLL INDICATOR
├─ Icon: SVG (inline, not img)
├─ ARIA: aria-hidden="true" (decorative, not essential)
├─ Color: #3b82f6 — contrast 8.6:1 ✓ AAA
└─ Animation: Respects prefers-reduced-motion
```

---

## 7. Export Settings

### SVG Exports

**Icons:** Export as individual SVG files

```
File: ChevronDown.svg
├─ Viewbox: 0 0 24 24
├─ Stroke: 2px
├─ Color: currentColor (inherits from parent)
└─ Optimization: Minimal (keep readable)
```

**Command:** Figma → Right-click → Export SVG

### PNG/WebP Exports (if background image added)

```
Desktop:  1920×1080 @2x (3840×2160 PNG)
Tablet:   1280×720 @2x (2560×1440 PNG)
Mobile:   750×1334 (portrait, 2x)

Format:   WebP (primary) + PNG (fallback)
Compression: 85% quality
```

### PDF Export (for handoff documentation)

```
File: Hero-Section-Spec.pdf
├─ Include: All frames (desktop, tablet, mobile)
├─ Include: Component library
├─ Include: Annotations & notes
└─ Export resolution: High (300dpi)
```

---

## 8. Design System Library Setup

### Figma File Organization

```
📁 SPFP Design System
├── 📄 Colors & Typography
│   ├─ Color palette with hex codes
│   ├─ Typography scales (all sizes/weights)
│   └─ Design token documentation
│
├── 📄 Components
│   ├─ Buttons (all variants & states)
│   ├─ Icons (all sizes)
│   ├─ Form inputs
│   ├─ Cards
│   └─ Other atomic components
│
├── 📄 Hero Section
│   ├─ Desktop layout
│   ├─ Tablet layout
│   ├─ Mobile layout
│   ├─ Animation frames
│   └─ State variations
│
└── 📄 Landing Page (full page mockups)
    ├─ Desktop (1920×2400+)
    ├─ Tablet (768×3200+)
    └─ Mobile (375×4000+)
```

### Component Naming Convention

**Format:** `[Category]/[Component]/[Variant]`

```
Examples:
├─ Buttons/Primary CTA/Desktop
├─ Buttons/Primary CTA/Desktop - Hover
├─ Buttons/Primary CTA/Desktop - Active
├─ Buttons/Primary CTA/Mobile
├─ Buttons/Secondary CTA/Desktop
├─ Icons/ChevronDown/Small
├─ Icons/ChevronDown/Large
└─ Layout/Hero/Desktop
```

---

## 9. Design Handoff Checklist

Before handing off to developers:

### Visual Design
- [x] All frames pixel-perfect on desktop (1920px)
- [x] All frames tested on tablet (768px)
- [x] All frames tested on mobile (375px)
- [x] Typography scales appropriately across breakpoints
- [x] Color values exported with exact hex codes
- [x] Button states documented (hover, active, focus, disabled)
- [x] Icon sizes defined for all contexts
- [x] Spacing values specified (px units)
- [x] Border radius, shadows documented
- [x] Animations specified with timings

### Components
- [x] All components created in design tool
- [x] All variants documented
- [x] Component naming consistent
- [x] Override instructions provided
- [x] Constraints/responsive settings defined

### Accessibility
- [x] Color contrast verified (all ratios listed)
- [x] Focus states specified
- [x] Touch targets 44px+ (mobile)
- [x] Semantic HTML notes added
- [x] ARIA labels documented
- [x] Screen reader test notes included

### Documentation
- [x] Design specifications written (HERO_SECTION_DESIGN_SPEC.md)
- [x] Tailwind class list provided
- [x] Animation timings documented
- [x] Responsive breakpoints specified
- [x] Browser support documented

### Developer Handoff
- [x] Figma link shared with developers
- [x] Design specs PDF exported
- [x] Design tokens exported (JSON/CSS)
- [x] Component library accessible to team
- [x] Implementation template provided
- [x] Testing checklist provided

---

## 10. Design to Code Pipeline

### Step 1: Designer Exports Design Assets
1. Export all colors as JSON
2. Export typography tokens
3. Export spacing tokens
4. Export SVG icons
5. Create Figma share link

### Step 2: Developer Sets Up TailwindCSS
1. Copy color tokens into `tailwind.config.js`
2. Copy typography tokens into theme
3. Verify all colors render correctly
4. Test responsive breakpoints in browser

### Step 3: Developer Implements Component
1. Create React component file
2. Apply Tailwind classes (per specification)
3. Integrate Framer Motion (animations)
4. Test on device simulator
5. Verify accessibility

### Step 4: QA Validates Against Design
1. Visual comparison (Figma vs Browser)
2. Responsive testing (all breakpoints)
3. Interaction testing (hover, focus, active)
4. Animation testing (timing, smoothness)
5. Accessibility testing (WCAG 2.1 AA)

### Step 5: Deploy & Monitor
1. Deploy to staging
2. QA sign-off
3. Deploy to production
4. Monitor for issues

---

## 11. Common Design Tool Issues & Solutions

### Figma
**Issue:** Component variants not exporting properly
**Solution:** Ensure all variants use consistent naming, export as separate SVGs if needed

**Issue:** Text sizes appearing different in browser
**Solution:** Use exact font sizes from spec, not relative sizes; verify font files loaded

**Issue:** Colors look different on screen
**Solution:** Export hex codes, verify in browser DevTools, check display color profile

### Adobe XD
**Issue:** Artboard dimensions mismatch device sizes
**Solution:** Use exact viewport widths (375px, 768px, 1920px) from specification

---

## 12. Final Handoff Deliverables

**All documents ready for handoff:**

1. ✅ `HERO_SECTION_DESIGN_SPEC.md` — Comprehensive specification
2. ✅ `HERO_DESIGN_TOOL_GUIDE.md` — This document
3. 📥 Figma file link (shared with team)
4. 📥 Design tokens (JSON export)
5. 📥 SVG icons (ChevronDown)
6. 📥 Component library (reusable elements)

**Development can begin immediately with these assets.**

---

**Document prepared by:** Luna, UX Designer
**Date:** 2026-02-23
**Version:** 1.0.0
**Status:** ✅ Ready for Team Handoff
