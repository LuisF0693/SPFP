# SPFP + STITCH Design System

Design system integrado para a landing page `/transforme`.

## Color Palette

### Primary Colors
```
Primary Blue:        #3b82f6 (Blue-600)
Primary Blue Hover:  #1e40af (Blue-800)
Primary Dark:        #0f172a (Dark slate)
Primary Darker:      #020617 (Almost black)
```

### STITCH Colors
```
STITCH Primary:      #135bec
STITCH Primary Hover:#1048c7
STITCH Primary Light:rgba(19, 91, 236, 0.1)
```

### Status Colors
```
Success:  #10b981 (Emerald-500)
Warning:  #f59e0b (Amber-500)
Danger:   #ef4444 (Red-500)
Info:     #3b82f6 (Blue-600)
```

### Semantic Colors
```
Light Background:    #f6f6f8
Dark Background:     #101622
Light Surface:       #FFFFFF
Dark Surface:        #1A2233
Darker Surface:      #111722
```

### Text Colors
```
Text Primary Light:     #111418
Text Primary Dark:      #FFFFFF
Text Secondary Light:   #637588
Text Secondary Dark:    #92a4c9
Text Muted:             #6e85a3
```

### Borders
```
Border Light:   #e6e8eb
Border Dark:    #2e374a
Border Hover:   #3e4a63
```

## Typography

### Font Families
```typescript
fontFamily: {
  serif: ['Playfair Display', 'serif'],      // Headings
  sans: ['Inter', 'ui-sans-serif', 'system-ui'],  // Body
  mono: ['Courier New', 'monospace'],        // Code
}
```

### Font Sizes (Tailwind)
```
text-xs:   12px / 1rem   (muted, small labels)
text-sm:   14px / 1.25rem (secondary)
text-base: 16px / 1.5rem  (body, standard)
text-lg:   18px / 1.75rem (emphasize)
text-xl:   20px / 1.75rem (larger text)
text-2xl:  24px / 2rem    (subheading)
text-3xl:  30px / 2.25rem (large subheading)
text-4xl:  36px / 2.25rem (page subheading)
text-5xl:  48px / 1       (hero heading)
text-6xl:  60px / 1       (large hero)
```

### Font Weights
```
font-light:   300 (rarely used)
font-normal:  400 (body)
font-medium:  500 (labels, small emphasis)
font-semibold:600 (important text, buttons)
font-bold:    700 (headings, strong emphasis)
```

### Line Heights
```
leading-tight:   1.25 (headings)
leading-relaxed: 1.625 (body text, readable)
leading-loose:   2 (very large headings)
```

## Spacing

### Scale (based on 4px grid)
```
0:    0
1:    4px
2:    8px
3:    12px
4:    16px
5:    20px
6:    24px
7:    28px
8:    32px
10:   40px
12:   48px
14:   56px
16:   64px
20:   80px
```

### Common Padding
```
Button:      px-6 py-3 (inline padding)
Card:        p-6 to p-8 (internal padding)
Section:     py-20 px-4 (vertical spacing)
Container:   max-w-7xl (max 1280px)
```

## Components

### Button Variants

**Primary Button**
```html
<button class="bg-blue-600 hover:bg-blue-700 text-white font-semibold
               px-8 py-4 rounded-lg transition-all duration-300
               hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl">
  Primary CTA
</button>
```

**Secondary Button (Outline)**
```html
<button class="border-2 border-blue-600 text-blue-600
               hover:bg-blue-50 font-semibold px-8 py-4 rounded-lg
               transition-all duration-300 hover:scale-105 active:scale-95">
  Secondary Action
</button>
```

**Ghost Button**
```html
<button class="text-blue-600 hover:text-blue-700 font-semibold
               transition-colors">
  Link-style Button
</button>
```

### Card Component

**Standard Card**
```html
<div class="bg-white border border-gray-200 rounded-lg p-6
            hover:shadow-lg hover:-translate-y-1
            transition-all duration-300">
  <!-- Card content -->
</div>
```

**Glassmorphism Card (Dark Mode)**
```html
<div class="bg-white/10 backdrop-blur-lg border border-white/20
            rounded-lg p-6">
  <!-- Card content -->
</div>
```

### Form Input

**Standard Input**
```html
<input class="w-full px-4 py-3 border border-gray-300 rounded-lg
              focus:outline-none focus:border-blue-600
              focus:ring-2 focus:ring-blue-100
              transition-colors duration-200"
       type="email" placeholder="seu@email.com" />
```

### Badge

**Status Badge**
```html
<span class="bg-blue-600 text-white px-4 py-1 rounded-full
             text-sm font-semibold">
  POPULAR
</span>
```

## Animations

### Built-in Animations

**Fade In**
```css
animation: fade-in 0.8s ease-out;
```

**Slide Up**
```css
animation: slide-up 0.8s ease-out;
```

**Glow**
```css
animation: glow 2s ease-in-out infinite;
```

### Framer Motion Patterns

**Hero Entrance**
```typescript
<motion.h1
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8 }}
>
  Main heading
</motion.h1>
```

**Staggered List**
```typescript
{items.map((item, index) => (
  <motion.div
    key={index}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: index * 0.1 }}
    viewport={{ once: true }}
  >
    {item}
  </motion.div>
))}
```

**Scroll Animation**
```typescript
<motion.div
  animate={{ y: [0, 10, 0] }}
  transition={{ repeat: Infinity, duration: 2 }}
>
  <ChevronDown />
</motion.div>
```

## Responsive Design

### Breakpoints (Tailwind)
```
sm:  640px   (tablets)
md:  768px   (small laptops)
lg:  1024px  (desktops)
xl:  1280px  (large desktops)
2xl: 1536px  (very large)
```

### Mobile-First Approach
```html
<!-- Mobile default -->
<div class="text-2xl">

<!-- Tablet+ -->
<div class="text-2xl md:text-3xl">

<!-- Desktop+ -->
<div class="text-2xl md:text-3xl lg:text-4xl">
```

### Common Patterns

**Full-width Container**
```html
<section class="w-full px-4">
  <div class="max-w-7xl mx-auto">
    <!-- Content -->
  </div>
</section>
```

**Two-Column Layout**
```html
<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
  <div>Left column</div>
  <div>Right column</div>
</div>
```

## Accessibility

### Color Contrast
- **AA Standard** (normal text): 4.5:1
- **AAA Standard** (normal text): 7:1
- Use tools: [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

### Focus States
```html
<button class="focus:outline-none focus:ring-2
               focus:ring-offset-2 focus:ring-blue-600">
  Button
</button>
```

### Semantic HTML
```html
<!-- Use semantic elements -->
<nav>Navigation</nav>
<main>Main content</main>
<section>Section</section>
<article>Article</article>
<aside>Sidebar</aside>
<footer>Footer</footer>
```

### ARIA Labels
```html
<button aria-label="Close menu" onClick={closeMenu}>×</button>
<nav aria-label="Main navigation">...</nav>
<div role="status" aria-live="polite">Update message</div>
```

## Dark Mode

### Implementation
```typescript
// In tailwind.config.js
darkMode: 'class'

// In component
<div className="bg-white dark:bg-gray-900 text-black dark:text-white">
```

### Common Dark Mode Colors
```
Light Mode:  bg-white      text-gray-900
Dark Mode:   bg-gray-900   text-white

Light Mode:  bg-gray-50    text-gray-600
Dark Mode:   bg-gray-800   text-gray-300
```

## Design Tokens

### Rounded Corners
```
rounded-none: 0
rounded-sm:   0.125rem (2px)
rounded:      0.25rem (4px)
rounded-md:   0.375rem (6px)
rounded-lg:   0.5rem (8px)
rounded-xl:   0.75rem (12px)
rounded-2xl:  1rem (16px)
rounded-full: 9999px (circle)
```

### Shadows
```
shadow:     0 1px 3px rgba(0,0,0,0.1)
shadow-md:  0 4px 6px rgba(0,0,0,0.1)
shadow-lg:  0 10px 15px rgba(0,0,0,0.1)
shadow-xl:  0 20px 25px rgba(0,0,0,0.1)
```

### Transitions
```
transition-all:      all properties
transition-colors:   color changes only
transition-transform: transform only
duration-200:        200ms
duration-300:        300ms (default)
ease-out:            easeOut timing
ease-in-out:         easeInOut timing
```

## Implementation Checklist

Before launching:

- [ ] Colors match design system palette
- [ ] Typography uses correct font families + sizes
- [ ] Spacing follows 4px grid
- [ ] Buttons use correct variants
- [ ] Cards use correct styling
- [ ] Animations use Framer Motion patterns
- [ ] Responsive breakpoints work on mobile/tablet/desktop
- [ ] Focus states visible for keyboard navigation
- [ ] Color contrast meets WCAG AA (4.5:1 minimum)
- [ ] Dark mode works if enabled
- [ ] Accessibility tested with screen reader

---

**Design System Version:** SPFP + STITCH v1.0
**Last Updated:** 2026-02-23
