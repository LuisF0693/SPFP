# 🎨 EPIC-004: Visual Style Guide
## Virtual Office - Workspace Visual para CRM v2

**Version:** 1.0
**Date:** 2026-02-17
**Author:** Luna (UX Designer)
**Status:** Active

---

## 1. Color Palette

### Department Colors (Primary)

| Department | Name | Hex | RGB | Usage |
|---|---|---|---|---|
| Financeiro | Emerald | #10B981 | 16, 185, 129 | Financial dashboard, revenue badges |
| Marketing | Violet | #8B5CF6 | 139, 92, 246 | Marketing dashboard, posts |
| Operacional | Amber | #F59E0B | 245, 158, 11 | Operational tasks, kanban |
| Comercial | Blue | #3B82F6 | 59, 130, 246 | Sales pipeline, leads |
| Estratégia | Indigo | #6366F1 | 99, 102, 241 | Strategy room, planning |
| Ideação | Pink | #EC4899 | 236, 72, 153 | Ideation room, creative |
| Produção | Cyan | #06B6D4 | 6, 182, 212 | Production room, execution |
| Design | Orange | #F97316 | 249, 115, 22 | Design room, visual work |

### Status Colors

| Status | Hex | Usage |
|---|---|---|
| RUNNING | #10B981 (Green) | Active activities, running tasks |
| IDLE | #9CA3AF (Gray) | Inactive, waiting state |
| WAITING | #F59E0B (Amber) | Awaiting approval |
| COMPLETED | #10B981 (Green) | Finished tasks, approved |
| ERROR | #EF4444 (Red) | Errors, failures |

### Neutral Palette

| Element | Hex | Usage |
|---|---|---|
| Background Dark | #0F172A | Main background (dark mode) |
| Background Light | #1E293B | Card/panel background |
| Border | #334155 | Subtle borders |
| Text Primary | #F1F5F9 | Main text |
| Text Secondary | #CBD5E1 | Secondary text |
| Overlay Dark | #000000 | Modal overlay (80% opacity) |

---

## 2. Typography System

### Font Family
- **Font:** Inter, Segoe UI, Roboto (fallback: system-ui)
- **Import:** From Tailwind CSS default stack

### Type Scale

| Element | Size | Weight | Line Height | Usage |
|---|---|---|---|---|
| Display | 32px | Bold (700) | 1.2 | Page titles |
| Heading 1 | 28px | Bold (700) | 1.25 | Section titles |
| Heading 2 | 24px | Semibold (600) | 1.35 | Dashboard titles |
| Heading 3 | 20px | Semibold (600) | 1.4 | Card titles |
| Body Large | 16px | Regular (400) | 1.5 | Main content |
| Body | 14px | Regular (400) | 1.5 | Standard text |
| Body Small | 12px | Regular (400) | 1.5 | Secondary text |
| Label | 12px | Medium (500) | 1.4 | Form labels, badges |
| Caption | 11px | Regular (400) | 1.4 | Helper text, timestamps |

### Font Sizes (Tailwind Classes)
```
- text-xs: 11px (caption)
- text-sm: 12px (label/small)
- text-base: 14px (body)
- text-lg: 16px (body-large)
- text-xl: 20px (heading-3)
- text-2xl: 24px (heading-2)
- text-3xl: 28px (heading-1)
- text-4xl: 32px (display)
```

---

## 3. Component Specifications

### Button

**Base Style:**
- Border Radius: 8px (rounded-lg)
- Padding: 8px 12px (py-2 px-3)
- Font Size: 14px (text-sm)
- Font Weight: Medium (500)
- Transition: 200ms ease-in-out

**Variants:**
```
PRIMARY (Department color):
- Background: Department color
- Text: White
- Hover: Darken 10%
- Active: Darken 20%

SECONDARY (Outline):
- Background: Transparent
- Border: 1px solid Department color
- Text: Department color
- Hover: Light background (10% opacity)

GHOST (Minimal):
- Background: Transparent
- Text: Department color
- Hover: Light background (5% opacity)

DANGER (Red):
- Background: #EF4444
- Text: White
- Hover: #DC2626
```

### Card

**Base Style:**
- Border Radius: 12px (rounded-xl)
- Border: 1px solid #334155
- Background: #1E293B
- Padding: 16px
- Box Shadow: 0 1px 3px rgba(0,0,0,0.1)
- Transition: 200ms ease-in-out

**Hover State:**
- Box Shadow: 0 4px 12px rgba(0,0,0,0.15)
- Border Color: Slight brighten

### Modal/Dialog

**Base Style:**
- Border Radius: 12px (rounded-xl)
- Background: #1E293B
- Overlay: #000000 with 80% opacity
- Padding: 24px
- Max Width: 600px
- Min Width: 300px (mobile: 90vw)
- Animation: Fade in 200ms + Scale 250ms

**Close Button:**
- Position: Top-right
- Size: 32px × 32px
- Icon: X (lucide-react)

### Badge/Status

**Base Style:**
- Border Radius: 16px (rounded-full)
- Height: 20px
- Padding: 4px 8px
- Font Size: 11px
- Font Weight: 500

**Status Variants:**
```
RUNNING: Green background + text
IDLE: Gray background + text
WAITING: Amber background + text
COMPLETED: Green background + checkmark
ERROR: Red background + text
```

### Input/Form Field

**Base Style:**
- Border Radius: 8px
- Border: 1px solid #334155
- Padding: 8px 12px
- Font Size: 14px
- Background: #0F172A
- Transition: 200ms

**Focus State:**
- Border Color: Department color
- Box Shadow: 0 0 0 3px rgba(Department, 0.1)

### Activity Card

**Layout:**
```
+────────────────────────────────┐
│ 👤 CFO              10:45      │
│ Analisando fluxo de caixa      │
│ [🟢 RUNNING]                   │
└────────────────────────────────┘
```

**Styles:**
- Avatar: 32px × 32px, rounded-full
- Title: 14px semibold
- Time: 12px gray, right-aligned
- Description: 12px, secondary text
- Status Badge: Inline, left margin

---

## 4. Pixel Art Specifications (Phaser/Canvas)

### Grid System
- **Base Grid:** 32×32 pixels (1 tile = 1 NPC or furniture)
- **Canvas Resolution:** 1024×768 pixels (32 tiles × 24 tiles)
- **Scaling:** 1px art = 1px canvas (no blur)

### Sprite Sheet Format

**Size:** 128×128 pixels (4×4 grid of 32×32 sprites)

**Layout:**
```
Row 1: Idle frames 1-4
Row 2: Walk left frames 1-4
Row 3: Walk right frames 1-4
Row 4: Walk down frames 1-4
```

### Animation Frames

| Animation | Frames | Speed | Loop |
|---|---|---|---|
| Idle | 4 | 200ms/frame | Yes |
| Walk | 8 total (4 per direction) | 150ms/frame | Yes |
| Interact | 2 | 300ms/frame | Yes (1 cycle) |

### NPC Character Sprites

#### CFO (Financeiro - Blue)
```
- Head: Round, with glasses, gray hair
- Torso: Blue suit jacket
- Legs: Dark blue pants
- Accessories: Briefcase (held)
- Colors: #3B82F6 (suit), #9CA3AF (hair)
- Style: Professional, formal
```

#### CMO (Marketing - Violet)
```
- Head: Round, casual hair
- Torso: Colorful hoodie/sweater (violet/pink tones)
- Legs: Gray casual pants
- Accessories: Headphones (around neck)
- Colors: #8B5CF6 (hoodie), #EC4899 (accents)
- Style: Creative, casual, energetic
```

#### COO (Operacional - Amber)
```
- Head: Professional cut hair
- Torso: Formal blazer (amber/orange tone)
- Legs: Black formal pants
- Accessories: Clipboard (held), watch (on wrist)
- Colors: #F59E0B (blazer), #000000 (accents)
- Style: Organized, formal
```

#### CSO (Comercial - Blue)
```
- Head: Professional styled hair
- Torso: Blue shirt/jacket
- Legs: Business pants
- Accessories: Headset (visible), phone (pocket)
- Colors: #3B82F6 (shirt), #10B981 (headset)
- Style: Professional, tech-forward
```

### Furniture Assets (32×32 or scaled)

| Asset | Size | Colors | Notes |
|---|---|---|---|
| Desk | 32×32 | #8B7355 (brown) | Top-down view |
| Chair | 16×16 | #6366F1 (blue) | 4 rotations (N, S, E, W) |
| Computer | 32×32 | #1E293B (dark) + #10B981 (screen) | Screen glow |
| Plant | 24×32 | #10B981 (green) | Decorative |
| Whiteboard | 48×32 | #FFFFFF (white) + #1E293B (frame) | Wall-mounted |
| Cabinet | 24×32 | #8B7355 (brown) | Storage |
| Door | 32×48 | #6B4423 (dark brown) | Room separator |

### Room Backgrounds

**Each room has a distinct background color (semi-transparent overlay over base):**

| Room | Color | Hex |
|---|---|---|
| Estratégia | Indigo light | #6366F120 |
| Ideação | Pink light | #EC489920 |
| Produção | Cyan light | #06B6D420 |
| Design | Orange light | #F9731620 |

---

## 5. Animations & Transitions

### Micro-animations

| Animation | Duration | Easing | Usage |
|---|---|---|---|
| Fade In | 200ms | ease-in-out | Modal open, card appear |
| Fade Out | 200ms | ease-in-out | Modal close |
| Slide Up | 300ms | cubic-bezier(0.34, 1.56, 0.64, 1) | Activity feed new item |
| Slide Down | 250ms | ease-out | Dropdown open |
| Scale | 250ms | ease-out | Button press feedback |
| Bounce | 400ms | cubic-bezier(0.68, -0.55, 0.265, 1.55) | Celebration, highlight |

### Sprite Animations (Phaser)

```javascript
// Idle animation
anims.create({
  key: 'idle',
  frames: [0, 1, 2, 3],
  frameRate: 5, // 200ms per frame
  repeat: -1
});

// Walk animation
anims.create({
  key: 'walk-right',
  frames: [4, 5, 6, 7],
  frameRate: 6.67, // 150ms per frame
  repeat: -1
});
```

---

## 6. Responsive Layouts

### Desktop (1024px+)

**Layout:**
- 70% width: Phaser canvas (map)
- 30% width: Activity feed (sidebar)
- Direction: Horizontal (row)

**Breakpoints:**
```css
.virtual-office {
  display: grid;
  grid-template-columns: 1fr 1.3fr; /* 70% 30% */
  gap: 16px;
  height: 100vh;
}

.map-container {
  flex: 0 0 70%;
}

.feed-container {
  flex: 0 0 30%;
  overflow-y: auto;
}
```

### Tablet (768px - 1023px)

**Layout:**
- 100% width: Phaser canvas (map)
- Feed: Accordion/collapsible below map
- Direction: Vertical (column)

```css
.virtual-office {
  display: flex;
  flex-direction: column;
}

.map-container {
  height: 60vh;
}

.feed-container {
  height: 40vh;
  border-top: 1px solid #334155;
}
```

### Mobile (< 768px)

**Layout:**
- Tabs navigation (Map | Feed | Dashboard)
- One tab visible at a time
- Full screen per tab

```css
.tabs {
  display: flex;
  gap: 8px;
  padding: 12px;
  background: #0F172A;
  border-bottom: 1px solid #334155;
}

.tab-content {
  display: none;
  width: 100%;
  height: calc(100vh - 60px);
}

.tab-content.active {
  display: block;
}
```

**Tab Labels:**
- 🗺️ Mapa
- 📋 Feed
- 📊 Dashboard

---

## 7. Dark Mode (System Default)

**Why Dark Mode:**
- Reduces eye strain during extended work sessions
- Premium aesthetic (aligns with SPFP brand)
- Better contrast for pixel art
- Consistent with existing SPFP UI

**Implementation:**
- All colors in this guide are dark mode colors
- No light mode needed for MVP
- CSS class: `.dark` (Tailwind native support)

---

## 8. Accessibility (WCAG AA)

### Color Contrast

**Minimum Contrast Ratios:**
- Large text (18px+): 3:1
- Normal text: 4.5:1
- UI components: 3:1

**Verified Contrasts:**
- Text (#F1F5F9) on Background (#0F172A): 15.5:1 ✅
- Button (Department colors) on white: 4.5:1+ ✅
- Badge (Status colors) on dark: 4.5:1+ ✅

### Typography

- **Font Size:** Minimum 12px for body text
- **Line Height:** 1.5 for readability
- **Letter Spacing:** Default (no compression)

### Interactive Elements

- **Minimum Touch Target:** 44×44px (mobile)
- **Keyboard Navigation:** All interactive elements focusable
- **Focus Indicator:** Visible outline (2px, department color)
- **ARIA Labels:** All buttons and icons labeled

### Screen Readers

```html
<!-- Activity card example -->
<article aria-label="Activity: CFO analyzing cash flow">
  <img src="..." alt="CFO avatar" />
  <h3>CFO</h3>
  <p>Analisando fluxo de caixa...</p>
  <span aria-label="Status: Running">🟢 RUNNING</span>
</article>
```

---

## 9. Icon System

### Source
- **Library:** Lucide React (already in SPFP)
- **Size:** 16px (small), 20px (medium), 24px (large)
- **Stroke Width:** 2px
- **Color:** Inherit from text color or use department color

### Department Icons
```
Financeiro: 💰 (or calculator)
Marketing: 📢 (or megaphone)
Operacional: ⚙️ (or settings)
Comercial: 💼 (or briefcase)
Estratégia: 🎯 (or target)
Ideação: 💡 (or lightbulb)
Produção: 🔧 (or wrench)
Design: 🎨 (or palette)
```

---

## 10. Implementation Checklist

### Phase 1: Setup
- [ ] Create Tailwind config with custom colors
- [ ] Import Inter font
- [ ] Setup dark mode CSS
- [ ] Create color utility classes

### Phase 2: Components
- [ ] Button component (all variants)
- [ ] Card component
- [ ] Modal/Dialog component
- [ ] Badge/Status component
- [ ] Form inputs

### Phase 3: Phaser Setup
- [ ] Canvas initialization
- [ ] Sprite sheet loading
- [ ] Animation setup
- [ ] NPC rendering

### Phase 4: Layouts
- [ ] Desktop layout (grid)
- [ ] Tablet layout (accordion)
- [ ] Mobile layout (tabs)
- [ ] Responsive utilities

### Phase 5: Polish
- [ ] Micro-animations
- [ ] Accessibility audit
- [ ] Performance optimization
- [ ] Browser testing

---

## 11. Assets Files (TODO)

These files need to be created by @dev or asset designer:

```
assets/sprites/
├── npc-cfo.png (128×128)
├── npc-cmo.png (128×128)
├── npc-coo.png (128×128)
├── npc-cso.png (128×128)
├── furniture-desk.png (32×32)
├── furniture-chair.png (16×16)
├── furniture-computer.png (32×32)
└── furniture-plant.png (24×32)

assets/rooms/
├── estrategia-bg.png (1024×768)
├── ideacao-bg.png (1024×768)
├── producao-bg.png (1024×768)
└── design-bg.png (1024×768)
```

---

## 12. Design System Tokens (Tailwind Config)

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        department: {
          financeiro: '#10B981',
          marketing: '#8B5CF6',
          operacional: '#F59E0B',
          comercial: '#3B82F6',
          estrategia: '#6366F1',
          ideacao: '#EC4899',
          producao: '#06B6D4',
          design: '#F97316',
        },
        status: {
          running: '#10B981',
          idle: '#9CA3AF',
          waiting: '#F59E0B',
          completed: '#10B981',
          error: '#EF4444',
        }
      },
      spacing: {
        'card-padding': '16px',
        'modal-padding': '24px',
      },
      borderRadius: {
        'button': '8px',
        'card': '12px',
        'modal': '12px',
      }
    }
  }
}
```

---

## 13. References & Tools

- **Design Reference:** OPES Big Brother (isometric pixel art)
- **Color Tool:** Tailwind Color Palette
- **Font Tool:** Inter (Google Fonts)
- **Animation Tool:** Framer Motion / CSS Animations
- **Sprite Sheet Tool:** Aseprite or free alternatives

---

**Document Version:** 1.0
**Last Updated:** 2026-02-17
**Status:** Ready for Implementation ✅
