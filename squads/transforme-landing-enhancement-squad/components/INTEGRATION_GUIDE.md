# Enhanced Landing Page Components - Integration Guide

## Overview

This guide covers the enhanced React components for the SPFP landing page redesign. All components include analytics tracking, A/B testing support, accessibility improvements, and mobile optimization.

## Components Included

### 1. **HeroV2.tsx** - Hero Section
Main transformation narrative with CTAs, value props, and lead form integration.

**Features:**
- Analytics tracking (CTA clicks, form opens)
- A/B test variant support (control, variant_a, variant_b)
- Error handling with user-friendly messages
- Loading states for buttons
- Mobile-optimized animations
- Prefers-reduced-motion support
- Full accessibility (ARIA labels, semantic HTML)

**Props:**
```typescript
interface HeroV2Props {
  onDemoClick?: () => void;
  abVariant?: 'control' | 'variant_a' | 'variant_b';
  onAnalytics?: (event: AnalyticsEvent) => void;
}
```

**Usage:**
```jsx
import { HeroV2 } from './components/HeroV2';

export function App() {
  return (
    <HeroV2
      onDemoClick={() => console.log('Demo requested')}
      abVariant="control"
      onAnalytics={(event) => sendToAnalytics(event)}
    />
  );
}
```

### 2. **FeaturesV2.tsx** - Features Section
Customer benefit-focused features with interactive cards.

**Features:**
- Click tracking for feature interactions
- Responsive grid (1-2-3 layout)
- Icon hover animations
- Accessibility improvements (aria-labels, semantic structure)
- Memoized cards for performance
- Loading skeleton support ready

**Props:**
```typescript
interface FeaturesV2Props {
  onFeatureClick?: (featureId: string) => void;
  onAnalytics?: (event: AnalyticsEvent) => void;
  abVariant?: 'control' | 'variant_a' | 'variant_b';
}
```

**Usage:**
```jsx
import { FeaturesV2 } from './components/FeaturesV2';

export function App() {
  return (
    <FeaturesV2
      onFeatureClick={(id) => navigate(`/feature/${id}`)}
      onAnalytics={(event) => sendToAnalytics(event)}
    />
  );
}
```

### 3. **PricingV2.tsx** - Pricing Section
ROI-focused pricing plans with benefit messaging.

**Features:**
- CTA button states (idle, loading, disabled, error)
- Pricing toggle (monthly/annual)
- Feature list accessibility improvements
- Hover animations on cards
- Memoized components for performance
- Badge animation for popular plan

**Props:**
```typescript
interface PricingV2Props {
  onPlanClick?: (planId: string) => void;
  onAnalytics?: (event: AnalyticsEvent) => void;
  abVariant?: 'control' | 'variant_a' | 'variant_b';
  initialBillingCycle?: 'monthly' | 'annual';
}
```

**Usage:**
```jsx
import { PricingV2 } from './components/PricingV2';

export function App() {
  return (
    <PricingV2
      onPlanClick={(planId) => handlePlanSelection(planId)}
      initialBillingCycle="monthly"
      onAnalytics={(event) => sendToAnalytics(event)}
    />
  );
}
```

### 4. **ErrorBoundary.tsx** - Error Boundary
Catches React errors in landing page components.

**Features:**
- Graceful error handling
- Development error details
- Error logging support
- Custom fallback UI
- Reset functionality

**Usage:**
```jsx
import { ErrorBoundary } from './components/ErrorBoundary';

export function App() {
  return (
    <ErrorBoundary
      fallback={<div>Failed to load</div>}
      onError={(error, errorInfo) => logError(error, errorInfo)}
    >
      <HeroV2 />
      <FeaturesV2 />
      <PricingV2 />
    </ErrorBoundary>
  );
}
```

## Utility Hooks

### **useTracking** - Analytics Hook

Provides unified interface for tracking user interactions.

```typescript
import { useTracking } from './hooks/useTracking';

function MyComponent() {
  const {
    trackEvent,
    trackCTAClick,
    trackFormOpen,
    trackFeatureClick,
    trackPricingPlanClick,
    abVariant,
    session,
  } = useTracking('MyComponent');

  return (
    <button onClick={() => trackCTAClick('my_button')}>
      Click me
    </button>
  );
}
```

**Methods:**
- `trackEvent(eventType, label, value, metadata)` - Generic event tracking
- `trackCTAClick(label, metadata)` - Track CTA clicks
- `trackFormOpen(source)` - Track form opens
- `trackFeatureClick(featureId)` - Track feature interactions
- `trackPricingPlanClick(planId, planName)` - Track plan selection
- `trackScrollDepth(percentage)` - Automatic scroll tracking

**Returns:**
- `abVariant` - Current A/B test variant
- `session` - Session data (id, startTime)
- `userId` - Current user ID (if available)

### **useResponsiveGrid** - Grid Management

Handles responsive grid layout with edge case handling.

```typescript
import { useResponsiveGrid, RESPONSIVE_CONFIGS } from './hooks/useResponsiveGrid';

function MyComponent() {
  const { gridClassName, isMobile, isDesktop, currentCols } =
    useResponsiveGrid(RESPONSIVE_CONFIGS.balanced);

  return (
    <div className={gridClassName}>
      {/* Grid items */}
    </div>
  );
}
```

**Predefined Configs:**
- `RESPONSIVE_CONFIGS.balanced` - 1-2-3 columns (recommended)
- `RESPONSIVE_CONFIGS.dense` - 1-2-4 columns
- `RESPONSIVE_CONFIGS.compact` - 2-2-3 columns
- `RESPONSIVE_CONFIGS.spacious` - 1-1-2 columns

### **useScreenSize** - Screen Size Detection

Get current screen size.

```typescript
import { useScreenSize } from './hooks/useResponsiveGrid';

function MyComponent() {
  const screenSize = useScreenSize(); // 'mobile' | 'tablet' | 'desktop'

  if (screenSize === 'mobile') {
    return <MobileView />;
  }
  return <DesktopView />;
}
```

## Animation Utilities

### **Animations Preset**

Pre-configured animations respecting `prefers-reduced-motion`.

```typescript
import {
  heroAnimations,
  featuresAnimations,
  pricingAnimations,
  prefersReducedMotion
} from './utils/animations';

function MyComponent() {
  const reduceMotion = prefersReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? {} : heroAnimations.titleVariants.hidden}
      animate={reduceMotion ? {} : heroAnimations.titleVariants.visible}
    >
      {/* Content */}
    </motion.div>
  );
}
```

**Available Animations:**
- `heroAnimations` - Hero section animations
- `featuresAnimations` - Features section animations
- `pricingAnimations` - Pricing section animations
- `buttonAnimations` - Button state animations
- `loadingAnimations` - Loading states
- `modalAnimations` - Modal/dialog animations

## Analytics Integration

### Tracking Events

Events are automatically sent to:
1. Browser console (development)
2. External analytics service (can be configured)
3. Custom callback handlers

### Event Structure

```typescript
interface AnalyticsEvent {
  event: 'cta_click' | 'form_open' | 'feature_click' | 'pricing_plan_click' | ...
  label?: string;
  value?: string | number;
  metadata?: Record<string, unknown>;
  timestamp: number;
  userId?: string;
  sessionId: string;
  abVariant: 'control' | 'variant_a' | 'variant_b';
}
```

### Integration with Google Analytics

Update `hooks/useTracking.ts` in `sendAnalyticsEvent` function:

```typescript
if (typeof window !== 'undefined' && 'gtag' in window) {
  const gtag = (window as any).gtag;
  gtag('event', event.event, {
    event_label: event.label,
    event_value: event.value,
    session_id: event.sessionId,
    ab_variant: event.abVariant,
  });
}
```

### Integration with Custom Backend

Update `hooks/useTracking.ts` in `sendAnalyticsEvent` function:

```typescript
await fetch('/api/analytics', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(event),
});
```

## A/B Testing

### URL-Based Variant Control

Control variant via URL parameter:
```
https://site.com/?variant=control
https://site.com/?variant=variant_a
https://site.com/?variant=variant_b
```

### Random Assignment

If no URL parameter, users are randomly assigned:
- 70% control
- 15% variant_a
- 15% variant_b

Variant is stored in localStorage and persists across sessions.

### Accessing Variant in Components

```typescript
import { getABVariant } from './hooks/useTracking';

const variant = getABVariant(); // Returns 'control' | 'variant_a' | 'variant_b'
```

## Accessibility Features

All components include:

✅ **ARIA Labels & Descriptions**
- Buttons have proper aria-label
- Form fields have aria-describedby
- Icons are marked aria-hidden

✅ **Semantic HTML**
- Proper heading hierarchy (h1, h2, h3)
- Section elements with proper roles
- List elements for features/pricing

✅ **Keyboard Navigation**
- All interactive elements are keyboard accessible
- Proper tab order
- Focus states visible

✅ **Motion Preferences**
- Respects `prefers-reduced-motion` setting
- Animations disabled for users with this preference
- No animated backgrounds or scroll indicators

✅ **Color Contrast**
- All text meets WCAG AA standards
- Links are distinguishable from body text

## Performance Optimizations

### Memoization
- Feature cards use React.memo
- Pricing cards use React.memo
- Plans data is memoized with useMemo

### Code Splitting
- Components can be lazy loaded:
```jsx
const HeroV2 = lazy(() => import('./components/HeroV2'));
const FeaturesV2 = lazy(() => import('./components/FeaturesV2'));
const PricingV2 = lazy(() => import('./components/PricingV2'));
```

### Image Optimization
- Use Next.js Image or similar for optimization
- Implement lazy loading for off-screen images

## Error Handling

### Component-Level Errors
All components include try-catch blocks and proper error states.

### Error Boundary
Wrap all landing components with ErrorBoundary:

```jsx
<ErrorBoundary onError={(err, info) => logError(err, info)}>
  <HeroV2 />
  <FeaturesV2 />
  <PricingV2 />
</ErrorBoundary>
```

### User-Friendly Messages
- Portuguese error messages
- Actionable next steps
- Retry buttons where appropriate

## Development Checklist

### Before Deployment

- [ ] Test on mobile (375px, 768px, 1024px+)
- [ ] Test keyboard navigation (Tab, Enter, Escape)
- [ ] Test with reduced motion enabled
- [ ] Test with screen reader
- [ ] Test analytics tracking in console
- [ ] Test A/B variants with URL params
- [ ] Test error states (button errors, form errors)
- [ ] Run Lighthouse audit
- [ ] Test on slow 3G network
- [ ] Verify all links work

### Performance Targets

- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1
- **Performance Score**: > 90

### Accessibility Targets

- **WCAG Compliance**: AA level
- **Keyboard Navigation**: 100%
- **Screen Reader**: Fully announced
- **Color Contrast**: 7:1 for text

## Troubleshooting

### Analytics Not Tracking

1. Check browser console for [Analytics] logs
2. Verify gtag or fetch endpoint exists
3. Check network tab for analytics requests
4. Verify onAnalytics callback is provided if using custom handler

### A/B Variant Not Changing

1. Clear localStorage: `localStorage.clear()`
2. Check URL parameter: `?variant=control`
3. Verify variant is one of: 'control', 'variant_a', 'variant_b'

### Animations Not Playing

1. Check if `prefers-reduced-motion` is enabled
2. Check browser DevTools animations are enabled
3. Verify Framer Motion is installed
4. Check component initial/animate props

### Mobile Layout Issues

1. Check responsive breakpoints in `useResponsiveGrid`
2. Verify Tailwind CSS is installed and configured
3. Check container max-width (max-w-7xl, max-w-5xl)
4. Test at actual mobile viewport (not browser DevTools mobile)

## Files Structure

```
components/
├── HeroV2.tsx              # Hero section
├── FeaturesV2.tsx          # Features section
├── PricingV2.tsx           # Pricing section
├── ErrorBoundary.tsx       # Error boundary wrapper
├── types.ts                # TypeScript type definitions
├── validation.ts           # PropTypes validation
├── hooks/
│   ├── useTracking.ts      # Analytics tracking hook
│   └── useResponsiveGrid.ts # Responsive grid hook
├── utils/
│   └── animations.ts       # Animation configurations
└── INTEGRATION_GUIDE.md    # This file
```

## Next Steps

1. **Setup Analytics Endpoint**: Update `sendAnalyticsEvent` in `useTracking.ts`
2. **Configure Google Analytics**: Add gtag script to HTML head
3. **Setup Error Logging**: Add Sentry or similar error tracking
4. **A/B Testing Dashboard**: Create dashboard to view variant performance
5. **Performance Monitoring**: Setup Real User Monitoring (RUM)

## Support

For questions or issues:
1. Check console for error messages
2. Review component props in types.ts
3. Test in isolation with minimal props
4. Check browser DevTools Performance tab
5. Review accessibility audit in Lighthouse

---

**Last Updated**: February 23, 2026
**Version**: 1.0.0
**Status**: Production Ready
