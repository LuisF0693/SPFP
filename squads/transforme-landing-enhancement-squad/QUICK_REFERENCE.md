# Enhanced Components - Quick Reference

**Status**: ✅ Production Ready | **Date**: Feb 23, 2026 | **Version**: 1.0.0

## 📋 File Locations

```
components/
├── HeroV2.tsx                    # Hero section
├── FeaturesV2.tsx               # Features grid
├── PricingV2.tsx                # Pricing plans
├── ErrorBoundary.tsx            # Error wrapper
├── types.ts                      # TypeScript types
├── validation.ts                # Validation utils
├── index.ts                      # Exports
├── hooks/useTracking.ts         # Analytics hook
├── hooks/useResponsiveGrid.ts   # Grid hook
└── utils/animations.ts          # Animations
```

## 🚀 Basic Usage

```jsx
import { HeroV2, FeaturesV2, PricingV2, ErrorBoundary } from './components';

export default function App() {
  return (
    <ErrorBoundary>
      <HeroV2 />
      <FeaturesV2 />
      <PricingV2 />
    </ErrorBoundary>
  );
}
```

## 📊 Analytics Events

| Component | Event | Label | Value |
|-----------|-------|-------|-------|
| HeroV2 | `cta_click` | `hero_platform_form` | planId |
| HeroV2 | `cta_click` | `hero_demo_form` | source |
| HeroV2 | `form_open` | platform/demo | - |
| FeaturesV2 | `feature_click` | featureId | - |
| FeaturesV2 | `cta_click` | `feature_explore_*` | featureId |
| PricingV2 | `pricing_plan_click` | planId | planName |
| PricingV2 | `pricing_toggle` | monthly/annual | - |
| Auto | `scroll_depth` | - | 25/50/75/100 |

## 🎯 A/B Testing

```jsx
// URL params
?variant=control    // Default (70%)
?variant=variant_a  // Test A (15%)
?variant=variant_b  // Test B (15%)

// In component
<HeroV2 abVariant="control" />

// Get variant
import { getABVariant } from './components';
const variant = getABVariant();
```

## 🔧 Component Props

### HeroV2
```typescript
<HeroV2
  onDemoClick?={() => {}}
  abVariant?="control|variant_a|variant_b"
  onAnalytics?={(event) => {}}
/>
```

### FeaturesV2
```typescript
<FeaturesV2
  onFeatureClick?={(id) => {}}
  abVariant?="control|variant_a|variant_b"
  onAnalytics?={(event) => {}}
/>
```

### PricingV2
```typescript
<PricingV2
  onPlanClick?={(id) => {}}
  initialBillingCycle?="monthly|annual"
  abVariant?="control|variant_a|variant_b"
  onAnalytics?={(event) => {}}
/>
```

### ErrorBoundary
```typescript
<ErrorBoundary
  fallback={<div>Error UI</div>}
  onError={(error, info) => console.log(error)}
>
  {children}
</ErrorBoundary>
```

## 🎨 Useful Hooks

### useTracking
```typescript
const {
  trackEvent,
  trackCTAClick,
  trackFormOpen,
  trackFeatureClick,
  trackPricingPlanClick,
  trackScrollDepth,
  abVariant,
  session,
  userId
} = useTracking('ComponentName');

// Usage
trackCTAClick('button_label', { custom: 'data' });
```

### useResponsiveGrid
```typescript
import { useResponsiveGrid, RESPONSIVE_CONFIGS } from './components';

const {
  gridClassName,
  isMobile,
  isDesktop,
  currentCols,
  windowWidth
} = useResponsiveGrid(RESPONSIVE_CONFIGS.balanced);

// Use it
<div className={gridClassName}>
  {/* Grid items */}
</div>
```

### useScreenSize
```typescript
import { useScreenSize } from './components';

const size = useScreenSize(); // 'mobile' | 'tablet' | 'desktop'
```

## 🎬 Animations

```typescript
import { prefersReducedMotion, heroAnimations } from './components';

// Check if user prefers reduced motion
const reduceMotion = prefersReducedMotion();

// Use preset animations
<motion.h1
  initial={heroAnimations.titleVariants.hidden}
  animate={heroAnimations.titleVariants.visible}
>
  Title
</motion.h1>
```

## ✅ Validation

```typescript
import {
  validateHeroV2Props,
  validateAnalyticsEvent,
  sanitizeAnalyticsEvent
} from './components';

if (!validateHeroV2Props(props)) {
  console.warn('Invalid props');
}

const safe = sanitizeAnalyticsEvent(event);
```

## 🧪 Testing Checklist

- [ ] Mobile (375px, 768px, 1024px)
- [ ] Keyboard nav (Tab, Enter, Escape)
- [ ] Screen reader
- [ ] prefers-reduced-motion
- [ ] Analytics in console
- [ ] A/B variants (?variant=)
- [ ] Error states
- [ ] Loading states
- [ ] Lighthouse > 90
- [ ] WCAG AA

## 🔗 Grid Configs

```typescript
import { RESPONSIVE_CONFIGS } from './components';

RESPONSIVE_CONFIGS.balanced  // 1-2-3 (recommended)
RESPONSIVE_CONFIGS.dense     // 1-2-4
RESPONSIVE_CONFIGS.compact   // 2-2-3
RESPONSIVE_CONFIGS.spacious  // 1-1-2
```

## 📱 Responsive Breakpoints

```
< 640px   : sm
640-768px : md (tablet starts)
768-1024px: lg (desktop starts)
1024px+   : xl, 2xl
```

## 🎨 Animation Sets

```typescript
heroAnimations      // Hero section
featuresAnimations  // Features section
pricingAnimations   // Pricing section
buttonAnimations    // Buttons
loadingAnimations   // Loading states
modalAnimations     // Modals
```

## 🔄 Analytics Integration

### Google Analytics
```javascript
// In onAnalytics callback
if (window.gtag) {
  window.gtag('event', event.event, {
    event_label: event.label,
    event_value: event.value,
    ab_variant: event.abVariant
  });
}
```

### Custom Backend
```javascript
// In onAnalytics callback
await fetch('/api/analytics', {
  method: 'POST',
  body: JSON.stringify(event)
});
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Types not found | Import from `./components/index.ts` |
| Analytics missing | Add `onAnalytics` callback |
| Animations not working | Check `prefers-reduced-motion` |
| Mobile layout broken | Test at real mobile viewport |
| A/B variant not changing | Use `?variant=control` URL param |
| Form not opening | Check LeadForm component exists |

## 📚 Documentation Files

| File | Purpose | Lines |
|------|---------|-------|
| INTEGRATION_GUIDE.md | Full setup & API docs | ~600 |
| COMPONENTS_SUMMARY.md | Feature overview | ~500 |
| ENHANCED_COMPONENTS_README.md | High-level overview | ~400 |
| QUICK_REFERENCE.md | This file (quick answers) | ~200 |

## ⚡ Performance Tips

1. **Use React.memo** on list items
2. **Use useMemo** for expensive computations
3. **Use useCallback** for event handlers
4. **Lazy load** components: `lazy(() => import('./HeroV2'))`
5. **Defer** non-critical scripts
6. **Compress** images
7. **Cache** static assets

## 🔐 Security

- ✅ Sanitize analytics events
- ✅ Validate all inputs
- ✅ Use safe error handlers
- ✅ No sensitive data in logs
- ✅ XSS prevention

## 📈 Key Metrics

**Performance**:
- LCP < 2.5s
- FID < 100ms
- CLS < 0.1
- Lighthouse > 90

**Analytics**:
- CTA CTR > 3%
- Form submission > 5%
- Feature interaction > 20%
- Scroll depth > 50%

**Accessibility**:
- WCAG AA 100%
- Keyboard nav 100%
- Screen reader 100%
- Color contrast 7:1

## 🚀 Deployment Checklist

- [ ] Build succeeds
- [ ] TypeScript errors fixed
- [ ] Linting passes
- [ ] All tests pass
- [ ] Lighthouse audit > 90
- [ ] Accessibility audit pass
- [ ] Analytics tracking verified
- [ ] A/B variants tested
- [ ] Mobile tested
- [ ] Error boundaries working

## 🎯 Common Customizations

### Change Hero Text
```typescript
// In HeroV2.tsx, line ~100
const getHeadlineText = () => ({
  main: 'Your headline',
  highlight: 'Highlight text'
});
```

### Add/Remove Features
```typescript
// In FeaturesV2.tsx, line ~15
const FEATURES: Feature[] = [
  // Add features here
];
```

### Modify Pricing
```typescript
// In PricingV2.tsx, line ~20
const PRICING_PLANS: PricingPlan[] = [
  // Modify plans here
];
```

### Change Grid Layout
```typescript
// In component
const { gridClassName } = useResponsiveGrid(
  RESPONSIVE_CONFIGS.dense  // Change this
);
```

## 🎓 Learning Path

1. Read `types.ts` (understand data structures)
2. Read `HeroV2.tsx` (see analytics example)
3. Read `FeaturesV2.tsx` (see memoization)
4. Read `PricingV2.tsx` (see button states)
5. Read `useTracking.ts` (understand analytics)
6. Read `INTEGRATION_GUIDE.md` (full setup)

## 📞 Support Resources

- **Component Questions**: See INTEGRATION_GUIDE.md
- **Type Errors**: Check types.ts
- **Analytics Issues**: Debug in console with `[Analytics]` prefix
- **Accessibility**: Use Lighthouse audit
- **Performance**: Check React DevTools Profiler

## 🏁 Quick Start (5 minutes)

1. Copy components folder to `src/`
2. Import in App: `import { HeroV2, ... } from './components'`
3. Wrap with ErrorBoundary
4. Add `onAnalytics` callback
5. Test in browser

Done! You're ready to go.

---

**Version**: 1.0.0 | **Status**: ✅ Production Ready | **Updated**: Feb 23, 2026
