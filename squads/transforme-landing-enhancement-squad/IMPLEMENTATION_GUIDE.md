# Implementation Guide - Landing Page v2

**Status:** READY TO INTEGRATE
**Target:** Week 3-4
**Owner:** Dex (Frontend Developer)

---

## Overview

This guide integrates the new components (HeroV2, FeaturesV2, PricingV2) into the existing `/transforme` landing page while maintaining design system SPFP compliance.

---

## Phase 1: Setup (1 day)

### 1.1 Copy Components to Landing Folder

```bash
# Components already created at:
# squads/transforme-landing-enhancement-squad/components/

# Move to project:
cp HeroV2.tsx src/components/landing/
cp FeaturesV2.tsx src/components/landing/
cp PricingV2.tsx src/components/landing/
```

### 1.2 Update TransformePage.tsx

**Before:**
```typescript
import { Hero } from './landing/Hero';
import { Features } from './landing/Features';
import { Pricing } from './landing/Pricing';

export const TransformePage: React.FC = () => {
  return (
    <main className="w-full">
      <Hero />
      <Features />
      <Pricing />
      {/* ... rest */}
    </main>
  );
};
```

**After (Option 1: Replace immediately):**
```typescript
import { HeroV2 } from './landing/HeroV2';
import { FeaturesV2 } from './landing/FeaturesV2';
import { PricingV2 } from './landing/PricingV2';
import { FAQ } from './landing/FAQ';
import { Testimonials } from './landing/Testimonials';
import { Footer } from './landing/Footer';

export const TransformePage: React.FC = () => {
  return (
    <main className="w-full">
      <HeroV2 />
      <FeaturesV2 />
      <PricingV2 />
      <FAQ />
      <Testimonials />
      <Footer />
    </main>
  );
};
```

**After (Option 2: A/B testing via feature flag):**
```typescript
import { Hero, HeroV2 } from './landing/';
import { Features, FeaturesV2 } from './landing/';
import { Pricing, PricingV2 } from './landing/';

const useV2Layout = () => {
  // Set via localStorage, query param, or analytics
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('variant') === 'v2';
};

export const TransformePage: React.FC = () => {
  const isV2 = useV2Layout();

  return (
    <main className="w-full">
      {isV2 ? <HeroV2 /> : <Hero />}
      {isV2 ? <FeaturesV2 /> : <Features />}
      {isV2 ? <PricingV2 /> : <Pricing />}
      <FAQ />
      <Testimonials />
      <Footer />
    </main>
  );
};
```

**Recommendation:** Use Option 1 for immediate impact, or Option 2 if you want to A/B test.

### 1.3 Verify Dependencies

```bash
# Ensure these are installed:
npm list react@19
npm list framer-motion
npm list lucide-react
npm list tailwindcss

# Update if needed:
npm install framer-motion@latest lucide-react@latest
```

---

## Phase 2: Testing (1 day)

### 2.1 Smoke Tests

```bash
# Start dev server
npm run dev

# Navigate to http://localhost:3000/transforme

# Checklist:
✅ Page loads without errors
✅ Hero section renders
✅ Features grid displays correctly
✅ Pricing cards show both plans
✅ All CTAs are clickable
✅ Forms open on CTA click
✅ Animations run smoothly (60fps)
```

### 2.2 Responsive Testing

**Mobile (375px):**
```
✅ Hero text readable
✅ CTAs stack vertically
✅ Feature cards single column
✅ Pricing cards single column
✅ No horizontal scroll
```

**Tablet (768px):**
```
✅ Feature grid: 2 columns
✅ Pricing: 2 columns side-by-side
✅ CTAs: row layout
```

**Desktop (1024px+):**
```
✅ Feature grid: 4 columns
✅ Pricing: side-by-side scaled
✅ Full animations enabled
```

### 2.3 Accessibility Testing

```
✅ Color contrast: 4.5:1 minimum (use WebAIM checker)
✅ Keyboard navigation: Tab through all CTAs
✅ Focus visible: outline shows on focus
✅ Screen reader: Test with VoiceOver/NVDA
✅ Semantic HTML: h1 > h2 > h3 structure
✅ ARIA labels on buttons
```

### 2.4 Performance Testing

```bash
# Run Lighthouse audit
npm run build
npm run preview

# Target scores:
✅ Performance: > 90
✅ Accessibility: > 90
✅ Best Practices: > 85
✅ SEO: > 85
```

---

## Phase 3: Analytics Setup (½ day)

### 3.1 Add Event Tracking

```typescript
// In HeroV2.tsx - add tracking to CTAs
const handleOpenForm = (source: 'platform' | 'demo' | 'pricing') => {
  // Track event
  window.gtag?.('event', 'cta_click', {
    section: 'hero',
    cta_type: source,
    timestamp: new Date().toISOString(),
  });

  setFormSource(source);
  setIsFormOpen(true);
};
```

### 3.2 Setup Google Analytics 4

```typescript
// In App.tsx or main analytics setup
const pageViews = {
  '/transforme': 'transforme_page_view',
};

useEffect(() => {
  window.gtag?.('event', 'page_view', {
    page_path: '/transforme',
    page_title: 'Transforme Landing Page',
  });
}, []);
```

### 3.3 Track Scroll Depth

```typescript
// Add to TransformePage.tsx
useEffect(() => {
  const handleScroll = () => {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY;
    const scrollPercent = (scrollTop + windowHeight) / documentHeight;

    if (scrollPercent > 0.25 && !tracked.quarter) {
      window.gtag?.('event', 'scroll_25');
      setTracked(p => ({ ...p, quarter: true }));
    }
    if (scrollPercent > 0.5 && !tracked.half) {
      window.gtag?.('event', 'scroll_50');
      setTracked(p => ({ ...p, half: true }));
    }
    if (scrollPercent > 0.75 && !tracked.threeQuarters) {
      window.gtag?.('event', 'scroll_75');
      setTracked(p => ({ ...p, threeQuarters: true }));
    }
  };

  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, [tracked]);
```

---

## Phase 4: A/B Testing Setup (1 day)

### 4.1 Using URL Parameters (Simple)

```typescript
// lib/abTesting.ts
export const getTestVariant = (testName: string): string => {
  const urlParams = new URLSearchParams(window.location.search);
  let variant = urlParams.get(`test_${testName}`);

  if (!variant) {
    // Randomly assign 50/50 split
    variant = Math.random() > 0.5 ? 'control' : 'variant_a';
    // Store in sessionStorage for consistency
    sessionStorage.setItem(`test_${testName}`, variant);
  }

  return variant;
};
```

**Usage:**
```typescript
// In HeroV2.tsx
const variant = getTestVariant('hero_narrative');

const headline = variant === 'control'
  ? "Planeje suas finanças em minutos, não horas"
  : variant === 'variant_a'
  ? "Stop guessing. Get clarity."
  : "De caótico a claro em 5 minutos";
```

**Testing URLs:**
```
/transforme?test_hero_narrative=control
/transforme?test_hero_narrative=variant_a
/transforme?test_hero_narrative=variant_b
```

### 4.2 Using Split Testing Service (Recommended)

**Option 1: VWO (Visual Website Optimizer)**
```
1. Sign up at VWO.com
2. Create campaign for /transforme
3. Set A/B test variants
4. Define goal (conversion, demo request, etc)
5. Set duration and traffic split
6. Monitor results
```

**Option 2: Google Optimize (Legacy but free)**
```
1. Create experiment in Google Analytics
2. Link to property ID
3. Set variants and goals
4. Run for 2+ weeks
5. Analyze results
```

---

## Phase 5: Monitoring (Ongoing)

### 5.1 Key Metrics Dashboard

**Create a dashboard tracking:**
```
Conversion funnel:
- Landing page views
- CTA clicks (by section)
- Form submissions (by source)
- Demo requests
- Email signups

Engagement:
- Avg time on page
- Scroll depth (25%, 50%, 75%, 100%)
- Feature section clicks
- Pricing section reach

Performance:
- Page load time
- Core Web Vitals (LCP, FID, CLS)
- Error rate
```

### 5.2 Weekly Review Checklist

```
☐ Total conversions this week
☐ Conversion rate (week-over-week)
☐ Top performing CTA
☐ Page load time
☐ Bounce rate
☐ Most engaged section
☐ Error rate
☐ Device breakdown (mobile vs desktop)
```

---

## Common Issues & Fixes

### Issue 1: Images Loading Slowly

**Fix:**
```typescript
// Optimize images before using
1. Compress with TinyPNG
2. Convert to WebP
3. Add lazy loading:
<img src="..." loading="lazy" alt="..." />
```

### Issue 2: Animations Janky on Mobile

**Fix:**
```typescript
// In framer-motion components
<motion.div
  // Reduce animation complexity on mobile
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{
    duration: 0.4, // Shorter on mobile
    reducedMotion: 'user' // Respect OS settings
  }}
  viewport={{ once: true }}
>
```

### Issue 3: Forms Not Submitting

**Fix:**
```typescript
// Check LeadForm component integration
1. Verify Supabase connection
2. Test form submission manually
3. Check browser console for errors
4. Verify API endpoint URL
5. Test on staging environment first
```

---

## Rollback Plan

If v2 causes issues, rollback is simple:

```typescript
// In TransformePage.tsx
// Just switch back to original components
import { Hero } from './landing/Hero';
import { Features } from './landing/Features';
import { Pricing } from './landing/Pricing';

export const TransformePage: React.FC = () => {
  return (
    <main className="w-full">
      <Hero />
      <Features />
      <Pricing />
      {/* ... rest */}
    </main>
  );
};
```

**Time to rollback:** < 5 minutes

---

## Deployment Checklist

Before pushing to production:

- [ ] All tests pass (npm run test)
- [ ] No console errors
- [ ] Lighthouse score > 90
- [ ] Mobile responsive (tested on 375px+)
- [ ] Accessibility audit passed
- [ ] Forms working end-to-end
- [ ] Analytics events firing
- [ ] A/B test setup configured
- [ ] Monitored metrics in place
- [ ] Team notified of changes

---

## Success Criteria (Week 3-4)

✅ **All 3 components integrated and working**
✅ **Lighthouse score maintained > 90**
✅ **Mobile conversion rate = desktop**
✅ **No critical bugs**
✅ **Analytics tracking verified**
✅ **A/B test variants configured**
✅ **Team trained on new copy/messaging**

---

## Support & Questions

- **Copy questions?** Ask Kai (copywriter)
- **Design questions?** Ask Luna (UX Designer)
- **Implementation issues?** Ask Dex (developer)
- **Analytics setup?** Ask Quinn (QA/Testing)
- **Strategy alignment?** Ask Aurora (architect)

---

**Document Owner:** Dex (Frontend Developer)
**Last Updated:** 2026-02-23
**Status:** READY FOR IMPLEMENTATION
