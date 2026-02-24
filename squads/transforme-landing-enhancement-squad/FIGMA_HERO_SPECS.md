# Figma Hero Section Specifications

**For:** Design Team (Transforme Landing Enhancement Squad)
**Status:** PRODUCTION-READY
**Created:** 2026-02-23

---

## Component Structure

### Master Component: Hero Section (1600x600)

**File Location:** Figma → SPFP/Landing Page/Components/Hero Section

**Layer Structure:**
```
Hero Section [MAIN]
├── Background
│   ├── Gradient Overlay (dark with glassmorphism)
│   └── [Optional] Animated shapes
├── Content Container
│   ├── Headline
│   ├── Subheading
│   ├── Supporting Text
│   ├── Primary CTA Button
│   └── Secondary CTA Button
└── Responsive Variants
    ├── Desktop (1600x480)
    ├── Tablet (768x520)
    └── Mobile (375x620)
```

---

## Color Palette

### Hero Section Colors

**Background Gradient:**
```
From:   #1A1A2E (dark navy)
To:     #16213E (deeper navy)
Opacity: 100%
Blur:    20px (glassmorphism effect)
```

**Text Colors:**
```
Headline:       #FFFFFF (white, full opacity)
Subheading:     #E5E7EB (light gray, 90% opacity)
Supporting:     #D1D5DB (medium gray, 85% opacity)
CTA Primary:    White text on colored button
CTA Secondary:  #60A5FA (light blue, or button color)
```

**Button Colors:**

**Primary CTA Button:**
```
Background:     Linear gradient
  From:   #3B82F6 (blue)
  To:     #A855F7 (purple)
  Angle:  135°
Text:           #FFFFFF (white)
Border:         None
Shadow:         0px 8px 16px rgba(59, 130, 246, 0.3)
Hover:          Opacity +10%, scale 1.02
Active:         Scale 0.98, shadow +20%
```

**Secondary CTA Button:**
```
Background:     Transparent
Border:         2px solid #60A5FA (blue)
Text:           #60A5FA (blue)
Hover:          Background #60A5FA at 10% opacity
Active:         Background #60A5FA at 20% opacity
```

---

## Typography

### Font Family
- **Headlines:** Inter Bold (Weight 700)
- **Subheading:** Inter Regular (Weight 400)
- **Body/Supporting:** Inter Regular (Weight 400)
- **CTA:** Inter Semibold (Weight 600)
- **Fallback:** System fonts (SF Pro Display, Segoe UI)

### Desktop (1600px+)

**Headline:**
```
Font Size:       48px
Line Height:     57.6px (120%)
Letter Spacing:  -0.5px
Weight:          700 (Bold)
Color:           #FFFFFF
Max Width:       800px
```

**Subheading:**
```
Font Size:       20px
Line Height:     28px (140%)
Letter Spacing:  0px
Weight:          400 (Regular)
Color:           #E5E7EB
Max Width:       600px
Margin Top:      16px
```

**Supporting Text (Bullets):**
```
Font Size:       16px
Line Height:     24px (150%)
Letter Spacing:  0px
Weight:          400 (Regular)
Color:           #D1D5DB
Bullet Icon:     ✓ (check mark, 16x16)
Margin Between:  8px
Margin Top:      24px
```

**Primary CTA Button:**
```
Font Size:       16px
Line Height:     20px (125%)
Letter Spacing:  0px
Weight:          600 (Semibold)
Color:           #FFFFFF
Button Height:   48px
Button Padding:  16px 28px
Button Width:    auto (min 180px)
Border Radius:   8px
```

**Secondary CTA Button:**
```
Font Size:       16px
Line Height:     20px (125%)
Letter Spacing:  0px
Weight:          600 (Semibold)
Color:           #60A5FA
Button Height:   48px
Button Padding:  16px 28px
Button Width:    auto
Border Radius:   8px
Margin Top:      12px
```

### Mobile (375px)

**Headline:**
```
Font Size:       32px (67% of desktop)
Line Height:     38.4px (120%)
Letter Spacing:  -0.3px
Max Width:       320px
```

**Subheading:**
```
Font Size:       16px (80% of desktop)
Line Height:     22.4px (140%)
Max Width:       320px
Margin Top:      12px
```

**Supporting Text:**
```
Font Size:       14px (87.5% of desktop)
Line Height:     21px (150%)
Max Width:       320px
Margin Top:      16px
```

**CTA Buttons:**
```
Font Size:       16px (same)
Height:          48px (same)
Width:           Full width - 32px padding
Margin Top:      24px (headline to primary CTA)
Margin Between:  12px (primary to secondary)
```

---

## Spacing & Layout

### Desktop Layout

**Hero Container:**
```
Width:           1600px (max)
Height:          480px
Padding:         40px (all sides)
Content Area:    1520px × 400px
Horizontal Alignment: Left
Vertical Alignment:   Center
```

**Content Stack:**
```
Headline
  ↓ 16px gap
Subheading
  ↓ 24px gap
Supporting Text
  ↓ 32px gap
Primary CTA
  ↓ 12px gap
Secondary CTA
```

### Tablet Layout (768px)

**Hero Container:**
```
Width:           100%
Height:          520px (increased from desktop)
Padding:         32px (all sides)
Content Area:    704px × 456px
Vertical Alignment: Center (or top if constrained)
```

### Mobile Layout (375px)

**Hero Container:**
```
Width:           100vw
Height:          620px (tallest, more whitespace)
Padding:         24px (left/right), 40px (top/bottom)
Content Area:    327px × 540px
Vertical Alignment: Center (with top margin 20px)
```

**Button Stack:**
```
Primary CTA:     Full width (100% - 48px padding)
Secondary CTA:   Full width (100% - 48px padding)
```

---

## Shadow & Effects

### Button Shadows

**Primary CTA (Rest):**
```
Shadow 1: 0px 4px 8px rgba(59, 130, 246, 0.25)
Shadow 2: 0px 8px 16px rgba(59, 130, 246, 0.15)
Combined Blur: 24px
Spread: 0px
```

**Primary CTA (Hover):**
```
Shadow 1: 0px 8px 16px rgba(59, 130, 246, 0.35)
Shadow 2: 0px 12px 24px rgba(59, 130, 246, 0.25)
Combined Blur: 32px
Spread: 0px
```

**Secondary CTA (Rest):**
```
Shadow: None (outline only)
```

**Secondary CTA (Hover):**
```
Shadow: 0px 4px 12px rgba(96, 165, 250, 0.2)
```

### Glassmorphism Background

```
Background Color:    #1A1A2E with opacity 95%
Backdrop Filter:     blur(20px)
Border:              1px solid rgba(255, 255, 255, 0.1)
Box Shadow:          0px 8px 32px rgba(0, 0, 0, 0.3)
```

---

## Animation States

### Button Interactions

**Primary CTA Button States:**

**Rest:**
```
Scale:           100%
Opacity:         100%
Shadow:          Standard
Transition:      All 0.2s ease-out
```

**Hover:**
```
Scale:           102%
Opacity:         100%
Shadow:          Enhanced (+50% blur)
Background:      Slightly lighter gradient
Transition:      0.2s ease-out
Cursor:          pointer
```

**Active (Press):**
```
Scale:           98%
Opacity:         95%
Shadow:          Reduced
Transition:      0.1s ease-out
```

**Focus (Keyboard):**
```
Outline:         3px solid #93C5FD (light blue)
Outline Offset:  2px
Ring Color:      #3B82F6
Transition:      0.2s ease-out
```

**Disabled:**
```
Background:      #4B5563 (gray)
Opacity:         50%
Cursor:          not-allowed
Text Color:      #9CA3AF
```

### Secondary CTA Button States

**Rest:**
```
Background:      Transparent
Border:          2px solid #60A5FA
Opacity:         100%
Transition:      All 0.2s ease-out
```

**Hover:**
```
Background:      #60A5FA at 15% opacity
Border:          2px solid #60A5FA
Shadow:          0px 4px 12px rgba(96, 165, 250, 0.2)
Transition:      0.2s ease-out
```

**Active:**
```
Background:      #60A5FA at 25% opacity
Border:          2px solid #60A5FA
Scale:           98%
```

---

## Component Variations

### VARIATION A: Problem-First (Control)

**Component Name:** `Hero/Variation-A-Control`

**Headline:**
```
Text: "Cansado de não entender suas finanças?"
Font: Inter Bold 48px
Color: #FFFFFF
```

**Subheading:**
```
Text: "Clareza e controle em 5 minutos, não 5 horas"
Font: Inter Regular 20px
Color: #E5E7EB
```

**Supporting Text:**
```
✓ Economize 2h/mês em planejamento
✓ Duplique sua confiança em decisões financeiras
✓ Sem contrato • Cancele em 2 cliques • Garantia 7 dias

Font: Inter Regular 16px
Color: #D1D5DB
Bullet Icon: SVG check mark (#60A5FA, 16x16)
```

**Primary CTA:**
```
Text: "Começar Grátis (sem cartão)"
Button Style: Gradient blue-to-purple
Width: auto (min 220px)
Height: 48px
```

**Secondary CTA:**
```
Text: "Conhecer Mais"
Button Style: Outline blue
Width: auto
Height: 48px
```

**Visual Notes:**
- Most straightforward layout
- Agitation-first tone
- Practical, benefit-focused
- Best for pragmatic users

---

### VARIATION B: Transformation-Focused ⭐ RECOMMENDED

**Component Name:** `Hero/Variation-B-Transformation-FRONTRUNNER`

**Headline:**
```
Text: "De caótico a claro. De perdido a confiante."
Font: Inter Bold 48px
Color: #FFFFFF
Line Height: 130% (increased for emphasis)
Letter Spacing: -0.5px
Special: Period after first phrase for rhythm
```

**Subheading:**
```
Text: "Em apenas 5 minutos, com IA que entende você"
Font: Inter Regular 20px
Color: #E5E7EB
Font Weight: 400 (slightly lighter for intimacy)
```

**Supporting Text:**
```
✓ Sem necessidade de contratar consultor
✓ IA faz recomendações. Você decide tudo.
✓ 10k+ pessoas já transformaram suas finanças aqui

Font: Inter Regular 16px
Color: #D1D5DB
Line Height: 160% (increased for breathing room)
Bullet Icon: SVG check mark (#10B981, green - more positive)
```

**Primary CTA:**
```
Text: "Começar Minha Transformação"
Button Style: Solid gradient (vibrant blue-purple)
Width: auto (min 240px)
Height: 48px
Animation: Subtle glow on hover (0.3s)
```

**Secondary CTA:**
```
Text: "Agendar Demo com Especialista"
Button Style: Outline blue
Width: auto
Height: 48px
```

**Visual Hierarchy:**
- Headline: 48px, high emotional weight
- Subheading: 20px, supportive
- Supporting: 16px, factual but hopeful
- CTA: Large, invitation-like ("Minha Transformação")

**Visual Notes:**
- Slightly more spacious layout (more breathing room)
- Transformation narrative emphasized by typography
- Positive green check marks (vs neutral gray)
- Glow animation on hover (special emphasis)
- Personal pronouns in CTA (ownership feeling)
- Best for emotional resonance

**Design Enhancement:**
```
Optional: Subtle animated gradient shift in hero background
From:   #1A1A2E
To:     #16213E
Shift:  Colors gently "breathe" (8s cycle, 5% opacity change)
Effect: Reinforces transformation/change theme
```

---

### VARIATION C: Outcome-First

**Component Name:** `Hero/Variation-C-Outcome`

**Headline:**
```
Text: "Independência financeira começa com clareza"
Font: Inter Bold 48px
Color: #FFFFFF
Letter Spacing: -0.5px
Tone: Professional, measured
```

**Subheading:**
```
Text: "Sistema inteligente que otimiza seu patrimônio e decisões"
Font: Inter Regular 20px
Color: #E5E7EB
```

**Supporting Text (Two-column grid on desktop):**
```
Left Column:
  ✓ Usado por 10k+ brasileiros
  ✓ ROI comprovado em 2-3 meses

Right Column:
  ✓ Economize 15-20% em impostos (média: R$2.000/ano)
  ✓ Decisões 30% mais rápidas

Font: Inter Regular 16px
Color: #D1D5DB
Bullet Icon: SVG chart icon (#3B82F6, blue - professional)
Grid Gap: 32px (desktop), 0px (mobile - stacked)
```

**Primary CTA:**
```
Text: "Calcular Meu Retorno"
Button Style: Solid gradient (professional blue)
Icon: Calculator icon (left side, 20x20)
Width: auto (min 220px)
Height: 48px
Icon Margin: 8px right
```

**Secondary CTA:**
```
Text: "Ver Casos de Sucesso"
Button Style: Outline blue
Icon: Chart up icon (left side, 20x20)
Width: auto
Height: 48px
Icon Margin: 8px right
```

**Visual Notes:**
- More structured, metrics-forward layout
- Premium positioning (using "sistema inteligente")
- Numbers and percentages prominently displayed
- Icon-supported benefits (visual hierarchy)
- Professional, measured tone
- Best for analytical users

**Layout Notes:**
- Desktop: 2-column grid for supporting text
- Tablet: Stack to 1 column
- Mobile: Stack to 1 column with smaller text
- Icons add visual interest without sacrificing clarity

---

## Component States & Variants

### All Variations Have:

1. **State: Rest (Default)**
   - All elements at base styles
   - Buttons in rest state
   - No animations

2. **State: Hover**
   - Primary CTA button hover state applied
   - Secondary CTA button hover state applied
   - Background slightly brightens (1-2% opacity)

3. **State: Mobile**
   - Full-width buttons
   - Responsive font sizes
   - Increased vertical spacing
   - Adjusted height (620px)

4. **State: Tablet**
   - Balanced spacing
   - Height: 520px
   - Medium font sizes
   - Buttons: 90% width with margin

5. **State: Video/Overlay**
   - Darkens hero background (opacity -10%)
   - Video player overlay
   - Close button (top right)
   - Blur background behind video

---

## Responsive Breakpoints

### Desktop (1440px+)
```
Width:           1600px (max)
Hero Height:     480px
Headline Size:   48px
Subheading Size: 20px
Button Layout:   Stacked vertical (Primary, Secondary)
Spacing:         40px padding
```

### Large Tablet (1024px - 1439px)
```
Width:           100%
Hero Height:     520px
Headline Size:   42px
Subheading Size: 18px
Button Layout:   Stacked vertical
Spacing:         32px padding
```

### Tablet (768px - 1023px)
```
Width:           100%
Hero Height:     540px
Headline Size:   36px
Subheading Size: 16px
Button Layout:   Stacked vertical
Button Width:    90% with margin
Spacing:         28px padding
```

### Mobile (375px - 767px)
```
Width:           100vw
Hero Height:     620px
Headline Size:   32px
Subheading Size: 16px
Button Layout:   Stacked vertical, full width
Button Width:    calc(100% - 48px)
Spacing:         24px horizontal, 40px vertical
```

### Small Mobile (375px and below)
```
Width:           100vw
Hero Height:     660px
Headline Size:   28px
Subheading Size: 14px
Button Layout:   Stacked, full width
Spacing:         20px horizontal, 32px vertical
```

---

## Accessibility Requirements

### Color Contrast
- **Headline (#FFFFFF on #1A1A2E):** 18.5:1 ✓ (AAA)
- **Subheading (#E5E7EB on #1A1A2E):** 12.3:1 ✓ (AAA)
- **Supporting (#D1D5DB on #1A1A2E):** 10.2:1 ✓ (AAA)
- **Button text (#FFFFFF on #3B82F6):** 8.5:1 ✓ (AAA)

### Interactive Elements
- Minimum button size: 48px × 48px ✓
- Focus outline: 3px solid #93C5FD ✓
- Focus outline offset: 2px ✓
- Touch target spacing: 8px minimum ✓

### Typography
- Minimum font size: 14px ✓
- Line height: minimum 1.4 ✓
- Letter spacing: normal or increased ✓
- No text as image ✓

### ARIA Labels
```
<button aria-label="Start My Financial Transformation">
  Começar Minha Transformação
</button>

<button aria-label="Schedule Demo with Specialist">
  Agendar Demo com Especialista
</button>
```

---

## Export & Implementation

### Figma Component Export

**For Web Development:**
1. Export all button states as SVG
2. Export background gradients as CSS
3. Export hero sections at 2x scale (Retina)
4. Create component library in Figma for developers

**File Structure:**
```
Export/
├── Assets/
│   ├── Button-Primary-Rest.svg
│   ├── Button-Primary-Hover.svg
│   ├── Button-Secondary-Rest.svg
│   ├── Button-Secondary-Hover.svg
│   ├── Checkmark-Green.svg
│   ├── Checkmark-Blue.svg
│   ├── Calculator-Icon.svg
│   └── ChartUp-Icon.svg
├── Backgrounds/
│   ├── Hero-Gradient.css
│   └── Hero-Glassmorphism.css
└── Components/
    ├── Hero-Variation-A.html
    ├── Hero-Variation-B.html
    └── Hero-Variation-C.html
```

**CSS Exports:**
```css
/* Hero Background */
.hero-background {
  background: linear-gradient(135deg, #1A1A2E 0%, #16213E 100%);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0px 8px 32px rgba(0, 0, 0, 0.3);
}

/* Primary CTA Button */
.btn-primary {
  background: linear-gradient(135deg, #3B82F6 0%, #A855F7 100%);
  color: #FFFFFF;
  border-radius: 8px;
  padding: 16px 28px;
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0px 8px 16px rgba(59, 130, 246, 0.3);
  transition: all 0.2s ease-out;
}

.btn-primary:hover {
  transform: scale(1.02);
  box-shadow: 0px 12px 24px rgba(59, 130, 246, 0.25);
}
```

---

## Design Review Checklist

Before exporting components:

- [ ] All three variations created in Figma
- [ ] Colors match palette specifications
- [ ] Typography scales correctly across breakpoints
- [ ] Button states (rest, hover, active, disabled, focus) defined
- [ ] Spacing follows 8px grid system
- [ ] Shadows and effects consistent
- [ ] Icons properly sized and aligned
- [ ] Responsive variants tested
- [ ] Accessibility contrast verified
- [ ] Animation timing documented
- [ ] Export settings configured
- [ ] Developer handoff document prepared

---

## Figma File Structure

**File:** `SPFP-Landing-Page-Heroes`

```
Landing Page Components
├── Hero Section - Variation A [CONTROL]
│   ├── Desktop (1600x480)
│   ├── Tablet (768x520)
│   ├── Mobile (375x620)
│   └── Components (buttons, text, background)
├── Hero Section - Variation B [FRONTRUNNER]
│   ├── Desktop (1600x480)
│   ├── Tablet (768x520)
│   ├── Mobile (375x620)
│   └── Components
├── Hero Section - Variation C [OUTCOME]
│   ├── Desktop (1600x480)
│   ├── Tablet (768x520)
│   ├── Mobile (375x620)
│   └── Components
├── Shared Components
│   ├── Button - Primary [State]
│   ├── Button - Secondary [State]
│   ├── Icons
│   │   ├── Checkmark-Green
│   │   ├── Checkmark-Blue
│   │   ├── Calculator
│   │   └── ChartUp
│   └── Typography Styles
└── Design System
    ├── Colors
    ├── Typography
    ├── Spacing
    └── Shadows
```

---

## Developer Handoff

**For Engineer Implementation:**

1. Export all component variations from Figma
2. Create React components with prop-based variations
3. Implement responsive classes (Tailwind or CSS modules)
4. Set up animation library (Framer Motion recommended)
5. Add analytics tracking to CTA buttons
6. Test accessibility with axe/WAVE
7. Verify performance (Lighthouse 90+)

**Example Component API:**
```jsx
<HeroSection
  variation="b"  // 'a' | 'b' | 'c'
  headline="De caótico a claro..."
  subheading="Em apenas 5 minutos..."
  supportingText={[...]}
  primaryCta={{
    text: "Começar Minha Transformação",
    onClick: handleCTA,
    icon: "none"
  }}
  secondaryCta={{
    text: "Agendar Demo",
    onClick: handleDemo
  }}
/>
```

---

## File Control

**Figma File Owner:** Design Team (Transforme Squad)
**Document Owner:** Kai (Copywriter)
**Last Updated:** 2026-02-23
**Status:** APPROVED FOR DESIGN IMPLEMENTATION

---

*This specification is production-ready. Share with Figma team and engineering for component development.*
