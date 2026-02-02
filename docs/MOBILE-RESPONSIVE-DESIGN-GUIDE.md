# Mobile Responsive Design Guide - STY-015

**Date:** February 2, 2026
**Status:** Design Phase 1 - UX Strategy
**Designer:** Uma (UX/UI Designer)
**Effort:** 8 hours total

---

## 🎯 Design Vision

**One app. All devices. Perfect experience.**

SPFP deve funcionar fluidamente em:
- 📱 **Mobile** (320px - 639px) - Primary interaction: Touch
- 📱 **Tablet** (640px - 1023px) - Mixed touch/keyboard
- 💻 **Desktop** (1024px+) - Primary interaction: Mouse/keyboard

---

## 📐 Breakpoint Strategy

### Tailwind Breakpoints (Standard)

```
xs: 320px  (Mobile - iPhone SE, small phones)
sm: 640px  (Tablet - iPad mini, large phones)
md: 768px  (Tablet - iPad, smaller laptops)
lg: 1024px (Desktop standard)
xl: 1280px (Desktop wide)
2xl: 1536px (Desktop extra-wide)
```

### Component Behavior by Breakpoint

#### Mobile-First Design Pattern
```
Start with mobile (320px default)
Then add: sm: (640px+), md: (768px+), lg: (1024px+)

Example:
<div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4">
  Starts full-width, then adapts up
</div>
```

---

## 🎨 Component Responsiveness Strategy

### 1. **Layout Grids**

#### Dashboard Grid
```
MOBILE (320px):
- 1 column stacked
- Full width cards

TABLET (640px+):
- 2 columns for some sections
- 50% width cards

DESKTOP (1024px+):
- 3+ columns
- Optimized width cards
```

**Tailwind Pattern:**
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
  {/* Automatically reflows */}
</div>
```

#### Forms Layout
```
MOBILE:
- Single column (100% width)
- Full-width inputs
- Stacked buttons

TABLET:
- 2 columns for non-critical fields
- Side-by-side buttons

DESKTOP:
- Multi-column layout
- Optimized spacing
```

### 2. **Modals & Overlays**

#### Mobile Modal Behavior (< 768px)
```
MOBILE:
- Full-screen height
- Bottom sheet style (slide up from bottom)
- Padding: 16px
- No semi-transparent overlay (battery savings)

TABLET (640px+):
- 80vh max-height
- Centered on screen
- Semi-transparent overlay

DESKTOP (1024px+):
- Smaller modal (max-w-lg/max-w-md)
- Centered with backdrop
- Full semi-transparent overlay
```

**Implementation Pattern:**
```tsx
<div className="fixed bottom-0 left-0 right-0 md:bottom-auto md:left-1/2 md:-translate-x-1/2 md:top-1/2 md:-translate-y-1/2 rounded-t-2xl md:rounded-2xl">
  {/* Slides from bottom on mobile, centers on desktop */}
</div>
```

### 3. **Navigation & Headers**

#### Mobile Navigation (< 640px)
```
- Hamburger menu (icon only)
- Bottom tab bar (if 5-7 items)
- Touch targets: 48px minimum
- No horizontal scroll
```

#### Tablet Navigation (640px - 1023px)
```
- Sidebar OR top nav visible
- Text labels visible
- More space for navigation
```

#### Desktop Navigation (1024px+)
```
- Full sidebar navigation
- Expandable menu items
- Rich hover states
```

### 4. **Charts & Data Visualization**

#### Recharts Responsive
```
MOBILE:
- Single chart per row
- Horizontal scroll within card
- Reduced data points
- Smaller font sizes

TABLET:
- 2 charts per row possible
- Full chart visibility
- Medium font sizes

DESKTOP:
- Multiple charts side-by-side
- Full interactivity
- Hover tooltips
```

**Pattern:**
```tsx
<ResponsiveContainer width="100%" height={300}>
  <LineChart data={data}>
    {/* ResponsiveContainer handles sizing */}
  </LineChart>
</ResponsiveContainer>
```

### 5. **Forms & Inputs**

#### Touch Target Sizing
```
MOBILE:
- Button height: 48px minimum
- Input height: 44px minimum
- Spacing: 16px (tap accuracy)

TABLET:
- Button height: 44px
- Input height: 44px
- Spacing: 12px

DESKTOP:
- Button height: 40px
- Input height: 40px
- Spacing: 8px
```

#### Form Layout
```
MOBILE:
- Single column
- Full-width inputs
- Vertical button stack

TABLET:
- 2-column grid for some fields
- Still mostly vertical

DESKTOP:
- Multi-column grid
- Horizontal button groups
- Inline labels
```

### 6. **Typography Scaling**

#### Font Sizes by Breakpoint

```
MOBILE (16px base):
- Body: 16px (default, prevents zoom on iOS)
- Small: 14px
- Large: 18px
- Heading 1: 24px
- Heading 2: 20px
- Heading 3: 18px

TABLET (16px base):
- Body: 16px
- Small: 14px
- Large: 16px
- Heading 1: 28px
- Heading 2: 24px
- Heading 3: 20px

DESKTOP (16px base):
- Body: 16px
- Small: 14px
- Large: 18px
- Heading 1: 32px
- Heading 2: 28px
- Heading 3: 24px
```

**Implementation:**
```tsx
<h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
  Responsive Heading
</h1>
```

### 7. **Spacing & Padding**

#### Margin/Padding Scale by Device
```
MOBILE:
- Card padding: 16px
- Section gap: 12px
- Page padding: 16px

TABLET:
- Card padding: 20px
- Section gap: 16px
- Page padding: 20px

DESKTOP:
- Card padding: 24px
- Section gap: 24px
- Page padding: 32px
```

**Pattern:**
```tsx
<div className="p-4 sm:p-5 md:p-6 lg:p-8">
  Padding scales with device
</div>
```

### 8. **Visibility & Hidden Elements**

```
MOBILE:
- Hide: Secondary navigation, detailed stats, non-essential info
- Show: Primary content only
- Use: `hidden sm:block` to hide

TABLET:
- Show: Most content
- Hide: Extra detailed views
- Use: `hidden md:block` to hide

DESKTOP:
- Show: All content
- Use: `block` (no hidden)
```

---

## 📋 Components Needing Responsiveness

### Critical (High Priority)
1. **Modal.tsx** - Bottom sheet on mobile
2. **Dashboard.tsx** - Grid reflow
3. **AccountsList.tsx** - Card grid
4. **TransactionList.tsx** - List compression
5. **Forms** - Input stacking

### Important (Medium Priority)
6. **Charts** (DashboardChart) - ResponsiveContainer
7. **Navigation** (Layout) - Mobile menu
8. **Budget.tsx** - Grid layout
9. **Goals.tsx** - Grid layout
10. **Investments.tsx** - Table responsiveness

### Nice-to-Have (Low Priority)
11. Detailed stats hiding on mobile
12. Micro-interaction optimization
13. Touch-specific gestures

---

## 🎬 Implementation Phases

### Phase 1: Foundation (2 hours)
- [ ] Fix Modal.tsx for mobile bottom sheet
- [ ] Dashboard grid responsive
- [ ] Accounts cards responsive
- [ ] Basic touch targets (44px)

### Phase 2: Details (2 hours)
- [ ] Forms responsive layout
- [ ] Charts ResponsiveContainer
- [ ] Typography scaling
- [ ] Spacing adjustments

### Phase 3: Polish (2 hours)
- [ ] Navigation mobile optimization
- [ ] Hidden elements strategy
- [ ] Performance optimization
- [ ] Touch interactions

### Phase 4: Testing (2 hours)
- [ ] Device testing (physical)
- [ ] Emulator testing (Chrome DevTools)
- [ ] Lighthouse mobile score
- [ ] Accessibility at all breakpoints

---

## 🔍 Testing Strategy

### Manual Testing Devices
- ✅ iPhone 12/13 (390px)
- ✅ iPhone SE (375px)
- ✅ iPhone 6/7/8 (375px)
- ✅ Samsung Galaxy S21 (360px)
- ✅ iPad Mini (768px)
- ✅ iPad Air (820px)
- ✅ Desktop (1920px)

### Chrome DevTools Testing
```
1. Open DevTools (F12)
2. Click Device Toggle (Ctrl+Shift+M)
3. Test breakpoints:
   - iPhone SE (375px)
   - iPad (768px)
   - Desktop (1024px+)
4. Verify:
   - No horizontal scrolling
   - Touch targets ≥ 44px
   - Text readable at 100% zoom
   - Modals fit viewport
```

### Lighthouse Mobile Audit
```
Target scores:
- Performance: ≥ 90
- Accessibility: ≥ 95 (from STY-014)
- Best Practices: ≥ 90
- SEO: ≥ 90
```

---

## 📱 Responsive Classes Cheat Sheet

### Width & Sizing
```
w-full              → 100% width
sm:w-1/2            → 50% width on sm+
md:w-1/3            → 33% width on md+
lg:w-1/4            → 25% width on lg+
max-w-full          → 100% max
sm:max-w-lg         → max-width 32rem on sm+
```

### Padding & Margin
```
p-4                 → 1rem (16px) padding all
sm:p-5              → 1.25rem on sm+
md:p-6              → 1.5rem on md+
px-4 py-2           → horizontal/vertical different
sm:px-6 sm:py-3     → responsive horizontal/vertical
```

### Display & Visibility
```
hidden              → display: none
sm:block            → display: block on sm+
md:hidden           → hidden on md+
lg:flex             → display: flex on lg+
```

### Flexbox & Grid
```
flex flex-col       → Column stack (mobile default)
sm:flex-row         → Row on sm+
grid grid-cols-1   → 1 column
sm:grid-cols-2     → 2 columns on sm+
md:grid-cols-3     → 3 columns on md+
gap-4              → 1rem gap
sm:gap-6           → 1.5rem gap on sm+
```

### Font Sizing
```
text-sm             → 14px
text-base           → 16px
text-lg             → 18px
sm:text-xl          → 20px on sm+
md:text-2xl         → 24px on md+
```

---

## ✅ Acceptance Criteria Checklist

- [ ] Tested on 5+ physical devices
- [ ] Modals stack on mobile (<768px)
- [ ] Charts adapt to screen width
- [ ] Touch targets ≥ 44x44px (WCAG standard)
- [ ] Text readable without horizontal scroll
- [ ] Forms fit in viewport
- [ ] Lighthouse mobile score ≥ 90
- [ ] No layout shift/jank on resize
- [ ] Performance maintained on mobile

---

## 🚀 Next Steps

### For @dev (Implementation)
1. Review this design guide
2. Implement components by priority
3. Test on actual devices
4. Run Lighthouse audits
5. Deploy and monitor

### For @qa (Testing)
1. Physical device testing
2. Emulator testing (all breakpoints)
3. Performance verification
4. Accessibility verification
5. Create testing report

---

**Designer:** Uma (UX/UI Designer)
**Version:** 1.0
**Status:** Ready for Implementation
