# Template: Hero Section Blueprint

**Purpose:** Master template for designing Hero sections aligned with SPFP design system

**Used by:** Luna (Designer), Kai (Copywriter), Dex (Developer)

---

## Structure

```
┌─────────────────────────────────────────┐
│                                         │
│     BACKGROUND GRADIENT / IMAGE         │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │                                 │   │
│   │   MAIN HEADLINE (h1)            │   │
│   │   48-60px, bold, dark           │   │
│   │                                 │   │
│   │   Subtitle / Subheading         │   │
│   │   18-24px, medium, gray         │   │
│   │                                 │   │
│   │   ┌──────────────┐ ┌──────────┐ │   │
│   │   │  Primary CTA │ │Secondary │ │   │
│   │   └──────────────┘ └──────────┘ │   │
│   │                                 │   │
│   │   Scroll indicator ↓            │   │
│   │                                 │   │
│   └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

---

## Section 1: Background

### Desktop (1920px+)
- **Image:** Hero background (1920x1080)
- **Gradient overlay:** `from-blue-50 to-white`
- **Parallax:** Optional subtle movement
- **Height:** 100vh (full viewport)

### Mobile (375px)
- **Image:** Scaled/cropped version
- **Gradient overlay:** Darker overlay (visibility)
- **Height:** 100vh or 600px (flexible)

### Code
```typescript
<section className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
  {/* Background gradient */}
  <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-transparent" />

  {/* Content */}
  <div className="relative z-10">
    {/* Hero content here */}
  </div>
</section>
```

---

## Section 2: Headline (H1)

### Copy Framework
```
[TRANSFORMATION OUTCOME], not [OLD PROBLEM]

Examples:
❌ "Financial Software for Everyone"
✅ "Planeje suas finanças em minutos, não horas"

❌ "Get AI-Powered Insights"
✅ "Consultor IA 24/7 que entende você"
```

### Design
```
Size (Desktop):   48-60px (text-5xl to text-6xl)
Size (Mobile):    32-40px (text-4xl)
Font:             Playfair Display, bold
Color:            #111418 (text-gray-950)
Max Width:        600px
Line Height:      1.2
Margin Bottom:    24px
```

### Framer Motion
```typescript
<motion.h1
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8 }}
  className="text-5xl md:text-6xl font-bold mb-6 leading-tight text-gray-950"
>
  Planeje suas finanças em minutos, não horas.
</motion.h1>
```

---

## Section 3: Subheading

### Copy Framework
```
[BENEFIT] that you [DESIRED OUTCOME]

Examples:
❌ "Advanced AI-powered analytics"
✅ "Com inteligência artificial que entende VOCÊ"

❌ "Become financially independent"
✅ "Transforme incerteza em confiança"
```

### Design
```
Size (Desktop):   18-24px (text-xl to text-2xl)
Size (Mobile):    16-18px (text-lg)
Font:             Inter, medium
Color:            #637588 (text-gray-700)
Max Width:        500px
Line Height:      1.6
Margin Bottom:    32px
```

### Framer Motion
```typescript
<motion.p
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8, delay: 0.2 }}
  className="text-xl md:text-2xl mb-8 text-gray-700 leading-relaxed"
>
  Com inteligência artificial que entende VOCÊ
</motion.p>
```

---

## Section 4: Call-to-Action Buttons

### Primary CTA
**Purpose:** Main conversion path

**Copy:**
```
❌ "Sign Up Now"
❌ "Get Started"
✅ "Começar com Plataforma (R$99,90/mês)"
✅ "Agendar Demo"
```

**Design:**
```
Style:        Solid, filled button
Color:        #3b82f6 (Blue-600)
Hover:        #1e40af (Blue-800) + scale(1.05)
Active:       scale(0.95)
Padding:      px-8 py-4
Border Radius:rounded-lg (8px)
Font:         Semibold, white text
Shadow:       shadow-lg, shadow-xl on hover
Cursor:       pointer
```

**Code:**
```typescript
<button
  onClick={() => handleOpenForm('platform')}
  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold
             px-8 py-4 rounded-lg transition-all duration-300
             hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
>
  Começar com Plataforma (R$99,90/mês)
</button>
```

### Secondary CTA
**Purpose:** Alternative conversion path

**Copy:**
```
❌ "Learn More"
✅ "Agendar Demo"
✅ "Ver Features"
```

**Design:**
```
Style:        Outline, bordered button
Color:        #3b82f6 (Blue-600) text + border
Hover:        bg-blue-50 background
Padding:      px-8 py-4
Border:       border-2
Font:         Semibold, blue text
```

**Code:**
```typescript
<button
  onClick={() => handleOpenForm('demo')}
  className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50
             font-semibold px-8 py-4 rounded-lg transition-all
             duration-300 hover:scale-105 active:scale-95"
>
  Agendar Demo
</button>
```

### CTA Layout
```
Desktop:  Flex row, gap-4, center aligned
Mobile:   Flex column (stack), gap-3, full width
```

---

## Section 5: Scroll Indicator

**Purpose:** Visual cue that there's more content below

**Design:**
```
Icon:         ChevronDown (Lucide React)
Color:        #3b82f6 (Blue-600)
Size:         32px
Animation:    y-axis bounce (0 → 10px → 0)
Duration:     2s, infinite loop
Margin Top:   40-64px
```

**Code:**
```typescript
<motion.div
  animate={{ y: [0, 10, 0] }}
  transition={{ repeat: Infinity, duration: 2 }}
  className="mt-16"
>
  <ChevronDown className="w-8 h-8 mx-auto text-blue-600" />
</motion.div>
```

---

## Responsive Behavior

### Desktop (lg+: 1024px)
- Full 100vh viewport
- Side padding: px-4
- Max width container: 1280px
- Headline: text-6xl
- Subheading: text-2xl
- CTA buttons: Row layout

### Tablet (md: 768px)
- 100vh or 90vh viewport
- Side padding: px-4
- Headline: text-5xl
- Subheading: text-xl
- CTA buttons: Row layout (if space)

### Mobile (sm: 640px)
- Min 600px height, 100vh preferred
- Side padding: px-4
- Headline: text-4xl
- Subheading: text-lg
- CTA buttons: Full width stacked (column)

---

## Accessibility

```
✅ Semantic HTML: Use <section>, <h1>, <button>
✅ Heading structure: <h1> for main, <p> for subtitle
✅ Color contrast: 4.5:1 minimum (WCAG AA)
✅ Focus visible: :focus-visible on buttons
✅ ARIA labels: aria-label on icon buttons
✅ Alt text: If background image, describe in text
✅ Keyboard: All CTAs accessible via Tab
```

---

## Variations

### High-Urgency Hero
```
Headline:   Shorter, punchier
Subheading: Benefit-focused
CTA:        "Start Free Trial" + Countdown timer
Color:      More saturated (danger: #ef4444)
```

### Narrative Hero
```
Headline:   Transformation story (longer)
Subheading: Before/After scenario
CTA:        "See my transformation" + Arrow
Background: Hero image (person, achievement)
```

### Video Background Hero
```
Background: Looping video instead of gradient
Overlay:    Dark overlay for text readability
Copy:       Shorter to accommodate video
CTA:        Play button + Primary CTA
```

---

## Copy Best Practices

### Headlines to Test

**Variation A:** Transformation outcome
```
"Planeje suas finanças em minutos, não horas"
```

**Variation B:** Benefit + pain point
```
"Organize-se financeiramente sem stress"
```

**Variation C:** Aspirational
```
"Independência financeira começa aqui"
```

### Subheading Rules

1. **Clarify the benefit** — Not features
2. **Address objections** — "Entende você" = Trust
3. **Create urgency** — "24/7" = Always available
4. **Use social proof** — "10k+ users already saved"

---

## Performance Checklist

- [ ] Hero section loads < 1s (above fold)
- [ ] Background image optimized (< 200kb)
- [ ] Animations 60fps (Framer Motion optimized)
- [ ] Text is readable (color contrast tested)
- [ ] Mobile responsive (tested on 375px+)
- [ ] CTA buttons are visible and clickable
- [ ] Scroll indicator visible on initial load
- [ ] No layout shift (Cumulative Layout Shift = 0)
- [ ] Lighthouse Performance > 90

---

## Design System Alignment

**Colors Used:**
- [ ] Primary: #3b82f6
- [ ] Dark: #0f172a
- [ ] Gray: #637588, #111418
- [ ] No custom colors

**Typography:**
- [ ] Headings: Playfair Display
- [ ] Body: Inter
- [ ] Sizes: text-5xl, text-xl, etc.

**Spacing:**
- [ ] Uses px-4, py-20, gap-4, mb-6, etc.
- [ ] Follows 4px grid

**Components:**
- [ ] Uses Button components
- [ ] Uses motion from Framer Motion
- [ ] Uses Lucide icons

**Animations:**
- [ ] Uses fade-in, slide-up patterns
- [ ] Durations: 0.6s - 0.8s
- [ ] No animation > 1s that blocks interaction

---

**Template Version:** 1.0
**Created:** 2026-02-23
**Last Updated:** 2026-02-23
**Approved by:** Luna (Designer), Kai (Copywriter)
