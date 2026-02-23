# Coding Standards

Code quality standards para o transforme-landing-enhancement-squad.

## TypeScript Standards

### Strict Mode Enabled
```json
{
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true,
    "noImplicitAny": true,
    "strictFunctionTypes": true
  }
}
```

### Type Definitions

**Always define props types:**
```typescript
interface HeroProps {
  title: string;
  subtitle?: string;
  onCTA: () => void;
  isLoading?: boolean;
}

export const Hero: React.FC<HeroProps> = ({
  title,
  subtitle,
  onCTA,
  isLoading = false
}) => {
  // Component code
}
```

**Avoid `any` type:**
```typescript
// ❌ Bad
const hero: any = {};

// ✅ Good
interface HeroData {
  title: string;
  subtitle: string;
}
const hero: HeroData = { title: '', subtitle: '' };
```

**Export types for reuse:**
```typescript
// types/landing.ts
export interface FormData {
  email: string;
  name: string;
  source: 'platform' | 'demo' | 'pricing';
}

// components/landing/LeadForm.tsx
import type { FormData } from '../types/landing';
```

## React Component Standards

### Functional Components with Hooks

```typescript
// ✅ Correct approach
export const MyComponent: React.FC<MyProps> = ({ prop1, prop2 }) => {
  const [state, setState] = useState('initial');
  const memoized = useMemo(() => expensive(), []);

  useEffect(() => {
    // Side effect
  }, [dependency]);

  return <div>Content</div>;
};

export default MyComponent;
```

### Component Props

```typescript
// ✅ Define all props
interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  className
}) => {
  // Implementation
};
```

### Memoization

```typescript
// ✅ Use memo for expensive components
export const HeroCard = memo(({ data }: HeroCardProps) => {
  return <div>{data.title}</div>;
});

// ✅ Use useMemo for expensive calculations
const expensiveValue = useMemo(() => {
  return largeDataset.filter(item => item.active);
}, [largeDataset]);

// ✅ Use useCallback for event handlers passed to children
const handleClick = useCallback(() => {
  setCount(c => c + 1);
}, []);
```

## Component Organization

### Folder Structure
```
components/
├── landing/
│   ├── Hero.tsx
│   ├── Features.tsx
│   ├── Pricing.tsx
│   └── LeadForm.tsx
├── ui/
│   ├── Button.tsx
│   ├── Card.tsx
│   └── Modal.tsx
└── TransformePage.tsx
```

### File Organization

```typescript
// 1. Imports (types, libraries, components)
import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { FormData } from '../types';
import { Button } from './ui/Button';

// 2. Interfaces/Types
interface HeroProps {
  title: string;
}

// 3. Constants
const ANIMATION_DURATION = 0.8;

// 4. Component
export const Hero: React.FC<HeroProps> = ({ title }) => {
  const [isOpen, setIsOpen] = useState(false);

  return <h1>{title}</h1>;
};

// 5. Export
export default Hero;
```

## Styling with TailwindCSS

### Use Tailwind Classes
```typescript
// ✅ Correct
<div className="flex items-center gap-4 p-6 bg-white rounded-lg shadow">

// ❌ Avoid inline styles
<div style={{ display: 'flex', padding: '24px' }}>

// ❌ Avoid CSS modules for simple styling
<div className={styles.container}>
```

### Responsive Design
```typescript
// ✅ Mobile-first approach
<div className="text-lg md:text-xl lg:text-2xl">
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

// ❌ Desktop-first
<div className="text-2xl md:text-lg">  // Wrong order
```

### Component Props for Variants
```typescript
interface CardProps {
  variant?: 'default' | 'featured' | 'compact';
  className?: string;
}

export const Card: React.FC<CardProps> = ({ variant = 'default', className }) => {
  const baseClasses = 'rounded-lg p-6 bg-white shadow';
  const variants = {
    default: 'border border-gray-200',
    featured: 'ring-2 ring-blue-600',
    compact: 'p-4'
  };

  return (
    <div className={`${baseClasses} ${variants[variant]} ${className || ''}`}>
      {/* Content */}
    </div>
  );
};
```

## Animation Standards

### Framer Motion Patterns

```typescript
// ✅ Simple entrance
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8 }}
>
  Content
</motion.div>

// ✅ Scroll-triggered
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
  viewport={{ once: true }}
>
  Content visible when scrolled into view
</motion.div>

// ✅ Staggered list
{items.map((item, index) => (
  <motion.div
    key={item.id}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: index * 0.1 }}
    viewport={{ once: true }}
  >
    {item.name}
  </motion.div>
))}
```

### Animation Naming
```typescript
// ✅ Descriptive animation names
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
};

const slideInLeft = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 }
};

// Use in component
<motion.div {...fadeInUp} transition={{ duration: 0.8 }}>
```

## Code Style

### Naming Conventions

```typescript
// ✅ Components: PascalCase
export const HeroSection = () => {};

// ✅ Functions: camelCase
const calculateTotal = (items: Item[]) => {};

// ✅ Constants: SCREAMING_SNAKE_CASE
const MAX_RETRIES = 3;
const DEFAULT_TIMEOUT = 5000;

// ✅ Interfaces: PascalCase with I prefix (optional)
interface FormData {}
interface UserProps {}

// ✅ Enums: PascalCase
enum ButtonVariant {
  Primary = 'primary',
  Secondary = 'secondary'
}
```

### Formatting

```typescript
// ✅ Max line length: 100 characters
const veryLongVariableName = somethingComplicated
  ? valueA
  : valueB;

// ✅ 2-space indentation
export const Component = () => {
  const [state, setState] = useState(false);

  return (
    <div>
      {state && <p>Visible</p>}
    </div>
  );
};

// ✅ Trailing commas in multiline
const obj = {
  prop1: 'value1',
  prop2: 'value2',
};
```

## Best Practices

### Error Handling
```typescript
// ✅ Try-catch for async operations
try {
  const result = await fetchData();
  setData(result);
} catch (error) {
  console.error('Failed to fetch:', error);
  setError('Unable to load data');
}

// ✅ Optional chaining and nullish coalescing
const name = user?.profile?.name ?? 'Anonymous';
```

### Conditional Rendering
```typescript
// ✅ Ternary for simple conditions
{isLoading ? <Spinner /> : <Content />}

// ✅ Logical AND for single condition
{hasError && <ErrorMessage />}

// ✅ Early return for complex logic
if (!data) return <Empty />;
if (error) return <Error />;
return <Success data={data} />;
```

### Comments
```typescript
// ✅ Explain WHY, not WHAT
// Memoize expensive calculation to prevent re-renders
const memoized = useMemo(() => expensive(), []);

// ❌ Obvious comments are noise
// Set state to true
setState(true);

// ✅ Document complex logic
/**
 * Calculates conversion funnel by segment.
 * @param transactions - User transactions
 * @param segments - Audience segments
 * @returns Funnel metrics per segment
 */
const calculateFunnel = (transactions, segments) => {
  // Implementation
};
```

## Testing Standards

### Component Tests
```typescript
// ✅ Test behavior, not implementation
describe('Button', () => {
  it('should call onClick when clicked', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click me</Button>);
    fireEvent.click(screen.getByText('Click me'));
    expect(onClick).toHaveBeenCalled();
  });
});

// ❌ Don't test implementation details
it('should set internal state to true', () => {
  // Testing internal state is fragile
});
```

### Coverage Targets
```
Overall: > 80%
Components: > 85%
Utilities: > 90%
Business logic: > 90%
```

## Accessibility Standards

### Semantic HTML
```typescript
// ✅ Use semantic elements
<nav>Navigation</nav>
<main>Main content</main>
<section>Section heading</section>
<button onClick={}>Button text</button>

// ❌ Avoid div-soup
<div onClick={}>Button</div>
<div role="button">Button</div>
```

### ARIA Labels
```typescript
// ✅ Provide accessible names
<button aria-label="Close modal">×</button>
<nav aria-label="Main navigation">...</nav>
<div role="status" aria-live="polite">Status message</div>

// ❌ Don't add ARIA to semantic elements incorrectly
<button role="button">Redundant</button>
```

### Color Contrast
```
✅ Normal text: 4.5:1 (WCAG AA)
✅ Large text: 3:1 (WCAG AA)
✅ UI components: 3:1 (WCAG AA)
```

## Performance Standards

### Image Optimization
```typescript
// ✅ Use modern formats with fallbacks
<picture>
  <source srcSet="image.webp" type="image/webp" />
  <source srcSet="image.jpg" type="image/jpeg" />
  <img src="image.jpg" alt="Description" />
</picture>

// ✅ Add width/height to prevent layout shift
<img src="image.jpg" width={800} height={600} alt="..." />

// ✅ Lazy loading
<img src="image.jpg" loading="lazy" alt="..." />
```

### Code Splitting
```typescript
// ✅ Lazy load heavy components
const HeavyComponent = lazy(() => import('./Heavy'));

<Suspense fallback={<Skeleton />}>
  <HeavyComponent />
</Suspense>
```

## Git Commit Standards

### Commit Messages
```
feat: add hero section with animations
fix: resolve form validation bug
docs: update design system guide
style: format component code
test: add unit tests for button
refactor: simplify pricing card logic
chore: update dependencies
```

### Branch Naming
```
feature/hero-section
feature/ab-testing
bugfix/form-validation
docs/design-system
```

## Review Checklist

Before submitting a PR:

- [ ] Code follows TypeScript strict mode
- [ ] Props are properly typed
- [ ] Components are functional with hooks
- [ ] No `any` types used
- [ ] TailwindCSS used for styling
- [ ] Responsive design tested
- [ ] Accessibility (WCAG 2.1) verified
- [ ] Performance targets met
- [ ] Tests added/updated
- [ ] Comments explain WHY, not WHAT
- [ ] Commit messages follow conventions
- [ ] No console.log left behind (except in development)

---

**Coding Standards Version:** 1.0
**Last Updated:** 2026-02-23
**Enforced via:** ESLint + TypeScript
