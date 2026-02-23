# Template: Feature Card Blueprint

**Purpose:** Master template for Feature cards in the landing page

**Used by:** Luna (Designer), Dex (Developer), Kai (Copywriter)

---

## Single Feature Card

### Structure
```
┌─────────────────────────┐
│  ICON (12×12 or 16×16)  │
├─────────────────────────┤
│  Feature Title (h3)     │
│                         │
│  Feature description    │
│  (2-3 lines max)        │
│                         │
│  [Explore →]            │
└─────────────────────────┘
```

### Design
```
Container:
  - Background: white
  - Border: 1px solid #e6e8eb
  - Padding: p-8 (32px)
  - Border radius: rounded-lg (8px)
  - Hover state: shadow-lg, -translate-y-1
  - Transition: duration-300

Icon:
  - Size: 48px (w-12 h-12)
  - Color: #3b82f6 (text-blue-600)
  - Margin bottom: mb-4
  - Hover: color-blue-700, scale-110

Title (h3):
  - Font size: text-xl (20px)
  - Font weight: semibold
  - Color: #111418 (text-gray-900)
  - Margin bottom: mb-2

Description:
  - Font size: text-base (16px)
  - Color: #637588 (text-gray-600)
  - Line height: leading-relaxed
  - Margin bottom: mb-4

Link:
  - Color: #3b82f6 (text-blue-600)
  - Weight: font-semibold
  - Hover: underline
  - Arrow: →
```

### Code Template
```typescript
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  linkText?: string;
  onClick?: () => void;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  linkText = 'Explorar',
  onClick
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="bg-white border border-gray-200 rounded-lg p-8
                 hover:shadow-lg hover:-translate-y-1
                 transition-all duration-300 cursor-pointer group"
    >
      {/* Icon */}
      <div className="mb-4 text-blue-600 group-hover:text-blue-700
                      group-hover:scale-110 transition-all duration-300">
        {icon}
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold mb-2 text-gray-900">
        {title}
      </h3>

      {/* Description */}
      <p className="text-gray-600 mb-4 leading-relaxed">
        {description}
      </p>

      {/* Link */}
      <button
        onClick={onClick}
        className="text-blue-600 font-semibold hover:underline
                   inline-flex items-center gap-2"
      >
        {linkText}
        <span className="text-lg">→</span>
      </button>
    </motion.div>
  );
};
```

---

## Feature Grid Layout

### 4-Column Grid (4 features)
```
Desktop (lg):     grid-cols-4
Tablet (md):      grid-cols-2
Mobile (sm):      grid-cols-1

Gap:              gap-8
Container:        max-w-7xl mx-auto
Padding:          px-4
```

### Code
```typescript
<section className="py-20 px-4 bg-white">
  <div className="max-w-7xl mx-auto">
    {/* Section heading */}
    <div className="text-center mb-16">
      <h2 className="text-4xl md:text-5xl font-bold mb-4">
        Tudo que você precisa
      </h2>
      <p className="text-lg text-gray-600">
        Todos os recursos para transformar
      </p>
    </div>

    {/* Feature grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {features.map((feature, index) => (
        <FeatureCard key={feature.id} {...feature} />
      ))}
    </div>
  </div>
</section>
```

---

## Writing Feature Copy

### Formula
```
TITLE: [Benefit/Outcome]
(2-4 words, clear benefit)

DESCRIPTION: [Problem context] → [How we solve] → [Outcome]
(2-3 sentences maximum)
```

### Examples

**❌ Bad:**
```
Title: "Advanced Dashboard"
Description: "Our dashboard uses machine learning to provide
             insights about your financial data in real-time."
```

**✅ Good:**
```
Title: "Veja tudo de uma olhada"
Description: "Dashboard visual que qualquer um entende.
              Não precisa ser expert em finanças."
```

### Copy Examples

```
Feature 1:
  Title:       "Veja tudo de uma olhada"
  Description: "Dashboard visual que qualquer um entende.
                Não precisa ser expert em finanças."

Feature 2:
  Title:       "Consultor IA 24/7"
  Description: "Recomendações personalizadas instantaneamente.
                Você decide."

Feature 3:
  Title:       "Consultoria Humana"
  Description: "Especialistas disponíveis para planejamento
                complexo."

Feature 4:
  Title:       "Relatórios Automáticos"
  Description: "Dados que você entende. Progresso mensal claro."
```

---

## Hover States & Interactions

### Desktop Hover
```css
.feature-card:hover {
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
  transform: translateY(-4px);
  transition: all 300ms;
}

.feature-card:hover .icon {
  color: #1e40af;
  transform: scale(1.1);
}

.feature-card:hover .link {
  text-decoration: underline;
}
```

### Mobile Interaction
```
Tap: Expands card or navigates to detail
Hold: No additional state needed
```

---

## Responsive Adjustments

### Mobile (sm: 640px)
```
Cards per row:     1
Padding:           p-6 (instead of p-8)
Icon size:         w-10 h-10 (instead of w-12 h-12)
Font size (title): text-lg (instead of text-xl)
Gap between cards: gap-6 (instead of gap-8)
```

### Tablet (md: 768px)
```
Cards per row:     2
Padding:           p-7
Icon size:         w-11 h-11
Gap:               gap-7
```

### Desktop (lg: 1024px+)
```
Cards per row:     4
Padding:           p-8
Icon size:         w-12 h-12
Gap:               gap-8
```

---

## Accessibility

```
✅ Semantic: Use <div role="group"> or <article>
✅ Headings: Use <h3> for title
✅ Color contrast: Icon color vs. background ≥ 4.5:1
✅ Focus: Card and link should be focusable
✅ Link text: "Explorar →" is clear
✅ Icon: Add aria-hidden if decorative, or describe
```

### Code
```typescript
<article
  className="group border rounded-lg p-8"
  role="region"
  aria-label={title}
>
  <div className="mb-4" aria-hidden="true">
    {icon}
  </div>
  <h3>{title}</h3>
  <p>{description}</p>
  <a href="#" className="focus:outline-none focus:ring-2">
    {linkText} →
  </a>
</article>
```

---

## Animation Stagger

**Group Entrance:**
```typescript
{features.map((feature, index) => (
  <motion.div
    key={feature.id}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{
      duration: 0.6,
      delay: index * 0.1  // 0.1s stagger between cards
    }}
    viewport={{ once: true }}
  >
    <FeatureCard {...feature} />
  </motion.div>
))}
```

---

## Icon Selection

**Use Lucide React icons:**
```typescript
import { BarChart3, Brain, Users, FileText } from 'lucide-react';

const features = [
  {
    id: 'dashboard',
    icon: <BarChart3 className="w-12 h-12" />,
    title: 'Veja tudo de uma olhada',
    description: '...'
  },
  {
    id: 'ai',
    icon: <Brain className="w-12 h-12" />,
    title: 'Consultor IA 24/7',
    description: '...'
  },
  {
    id: 'support',
    icon: <Users className="w-12 h-12" />,
    title: 'Consultoria Humana',
    description: '...'
  },
  {
    id: 'reports',
    icon: <FileText className="w-12 h-12" />,
    title: 'Relatórios Automáticos',
    description: '...'
  }
];
```

---

## Performance Checklist

- [ ] Cards render in grid without layout shift
- [ ] Hover animations are 60fps
- [ ] Icons are SVG (not images)
- [ ] Text is readable on mobile
- [ ] Click targets are 48px+ (for buttons)
- [ ] Card heights are equal (visual balance)
- [ ] Animations respect `prefers-reduced-motion`

---

## Design System Alignment

**Colors:**
- [ ] Icon: #3b82f6 (text-blue-600)
- [ ] Border: #e6e8eb (border-gray-200)
- [ ] Background: white
- [ ] Text: #111418, #637588

**Typography:**
- [ ] Title: text-xl, font-semibold
- [ ] Description: text-base, text-gray-600
- [ ] Link: font-semibold, text-blue-600

**Spacing:**
- [ ] Uses px-4, py-20, mb-4, gap-8, etc.
- [ ] Follows 4px grid

---

**Template Version:** 1.0
**Created:** 2026-02-23
**Approved by:** Luna, Kai
