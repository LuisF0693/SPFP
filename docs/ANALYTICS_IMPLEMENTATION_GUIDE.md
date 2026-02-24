# Analytics Implementation Guide

**Document Version:** 1.0
**Created:** 2026-02-23
**Purpose:** Step-by-step implementation guide for analytics and A/B testing
**Audience:** Development Team

---

## Quick Start (5 Minutes)

### 1. Add GA4 to index.html

```html
<!-- Add to <head> section of index.html, before other scripts -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXX');
</script>
```

**Replace `G-XXXXXXXX` with your GA4 Measurement ID**

### 2. Update Components

**Hero.tsx:**
```typescript
import { ga4Service } from '@/services/ga4Service';

const handleOpenForm = (source: 'platform' | 'demo') => {
  ga4Service.trackCtaClick('hero', source);
  setFormSource(source);
  setIsFormOpen(true);
};
```

**LeadForm.tsx:**
```typescript
import { ga4Service } from '@/services/ga4Service';

const onSubmit = async (data: LeadFormData) => {
  ga4Service.trackFormSubmission(sourceMap[source], 'lead_capture');
  // ... rest of submission logic
};
```

**TransformePage.tsx:**
```typescript
import { useScrollTracking } from '@/hooks/useScrollTracking';

export const TransformePage: React.FC = () => {
  useScrollTracking();

  return (
    <main className="w-full">
      {/* existing content */}
    </main>
  );
};
```

### 3. Deploy and Verify

```bash
npm run build
npm run preview
# Visit http://localhost:3000/transforme
# Open DevTools → Network → filter "google-analytics"
# Should see requests firing when you interact with page
```

---

## Detailed Implementation Steps

### Step 1: Create GA4 Property

**Timeline:** 10 minutes
**Complexity:** Easy

1. Go to [Google Analytics](https://analytics.google.com)
2. Sign in with company Google account
3. Click "Create" (or "+Create" if account exists)
4. Select "Google Analytics 4" property
5. Fill in property details:
   - **Property name:** "SPFP Landing Page"
   - **Time zone:** "America/Sao_Paulo (GMT-3)"
   - **Currency:** "Brazilian Real (BRL)"
6. Click "Create"
7. Accept terms and continue
8. Select "Web" as platform
9. Fill in web stream details:
   - **Website URL:** "https://spfp.ai" (or your domain)
   - **Stream name:** "Landing Page"
10. Click "Create stream"
11. **Copy Measurement ID** (format: G-XXXXXXXX) — save this
12. Note: Snippet code will be shown (we'll customize it)

**Output:** GA4 Measurement ID saved

---

### Step 2: Setup Google Tag Manager (GTM)

**Timeline:** 10 minutes
**Complexity:** Easy

1. Go to [Google Tag Manager](https://tagmanager.google.com)
2. Sign in with company Google account
3. Click "Create account"
4. Fill in account details:
   - **Account name:** "SPFP"
   - **Container name:** "SPFP Landing"
   - **Target platform:** "Web"
5. Click "Create"
6. Accept terms
7. **Copy Container ID** (format: GTM-XXXXXXX)
8. Now we'll add GA4 tag in next step

**Output:** GTM Container ID saved

---

### Step 3: Create GA4 Tag in GTM

**Timeline:** 10 minutes
**Complexity:** Medium

1. Go to GTM workspace (should be open from previous step)
2. Click "Tags" in left sidebar
3. Click "New" to create new tag
4. Name the tag: "GA4 - Page View"
5. Click tag configuration area
6. Select "Google Analytics 4 Configuration"
7. In "Measurement ID" field, paste your GA4 Measurement ID
8. In "Configuration settings" section:
   - Click "More settings" → "Events"
   - Leave empty (will use defaults)
9. Click "Triggering" section
10. Select trigger "All Pages" (already selected)
11. Click "Save"
12. Click "Submit" to publish changes
13. In publish dialog:
    - **Version name:** "Initial GA4 Setup"
    - **Version description:** "Configure GA4 with Google Analytics 4 Config tag"
14. Click "Publish"

**Output:** GA4 tag created in GTM

---

### Step 4: Add GTM Container to index.html

**Timeline:** 5 minutes
**Complexity:** Easy

Edit `index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SPFP - Transforme Suas Finanças</title>

    <!-- Google Tag Manager (noscript) - Add at start of <body>, but here works too -->
    <script>
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','GTM-XXXXXXX');
    </script>
    <!-- End Google Tag Manager -->

    <!-- Alternative: Direct GA4 (if not using GTM) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXX"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-XXXXXXXX');
    </script>
  </head>
  <body>
    <!-- Google Tag Manager (noscript) -->
    <noscript>
      <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXXX" height="0" width="0" style="display:none;visibility:hidden"></iframe>
    </noscript>
    <!-- End Google Tag Manager (noscript) -->

    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**Replace:**
- `GTM-XXXXXXX` with your GTM Container ID
- `G-XXXXXXXX` with your GA4 Measurement ID

---

### Step 5: Create GA4Service

**Timeline:** 15 minutes
**Complexity:** Easy

This is already created at `/src/services/ga4Service.ts`. Verify it exists and review the methods.

**Key methods:**
- `ga4Service.trackCtaClick()` — Track CTA button clicks
- `ga4Service.trackFormSubmission()` — Track form submissions
- `ga4Service.trackScrollDepth()` — Track scroll depth
- `ga4Service.trackFormError()` — Track form errors

---

### Step 6: Create SessionService

**Timeline:** 10 minutes
**Complexity:** Easy

This is already created at `/src/services/sessionService.ts`. Verify it exists.

**Key methods:**
- `getOrCreateSessionId()` — Get/create session ID
- `getOrCreateAbTestVariant()` — Assign A/B test variant
- `getAllAbTestVariants()` — Get all assigned variants

---

### Step 7: Create ScrollTracking Hook

**Timeline:** 10 minutes
**Complexity:** Easy

This is already created at `/src/hooks/useScrollTracking.ts`. Verify it exists.

**Key hooks:**
- `useScrollTracking()` — Track scroll depth at 25%, 50%, 75%, 100%
- `useTimeOnPageTracking()` — Track time spent on page
- `useViewportTracking()` — Track when elements enter viewport

---

### Step 8: Update Hero Component

**Timeline:** 10 minutes
**Complexity:** Easy

Update `/src/components/landing/Hero.tsx`:

```typescript
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { LeadForm } from './LeadForm';
import { ga4Service } from '@/services/ga4Service'; // ADD THIS

export const Hero: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formSource, setFormSource] = useState<'platform' | 'demo' | 'pricing'>('platform');

  const handleOpenForm = (source: 'platform' | 'demo' | 'pricing') => {
    // ADD TRACKING
    ga4Service.trackCtaClick('hero', source);

    setFormSource(source);
    setIsFormOpen(true);
  };

  return (
    <>
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        {/* ... existing JSX ... */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button
            onClick={() => handleOpenForm('platform')}
            // ... rest of button props ...
          >
            Começar com Plataforma (R$99,90/mês)
          </button>
          <button
            onClick={() => handleOpenForm('demo')}
            // ... rest of button props ...
          >
            Agendar Demo
          </button>
        </motion.div>
      </section>

      <LeadForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        source={formSource}
      />
    </>
  );
};

export default Hero;
```

---

### Step 9: Update LeadForm Component

**Timeline:** 10 minutes
**Complexity:** Easy

Update `/src/components/landing/LeadForm.tsx`:

```typescript
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import { saveLead } from '../../services/leadService';
import { ga4Service } from '@/services/ga4Service'; // ADD THIS

// ... schema definition ...

export const LeadForm: React.FC<LeadFormProps> = ({
  isOpen,
  onClose,
  source = 'platform',
}) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [formOpenTime] = useState(Date.now()); // ADD THIS

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
  });

  const onSubmit = async (data: LeadFormData) => {
    setStatus('loading');
    setErrorMessage('');

    const sourceMap = {
      platform: 'landing_page' as const,
      demo: 'demo_request' as const,
      pricing: 'pricing' as const,
    };

    // ADD TRACKING
    ga4Service.trackFormSubmission(sourceMap[source], 'lead_capture');

    const result = await saveLead({
      name: data.name,
      email: data.email,
      phone: data.phone || '',
      source: sourceMap[source],
    });

    if (result) {
      setStatus('success');
      reset();
      setTimeout(() => {
        onClose();
        setStatus('idle');
      }, 2000);
    } else {
      setStatus('error');
      setErrorMessage('Erro ao salvar seus dados. Tente novamente.');
    }
  };

  // ADD ERROR TRACKING
  const handleFieldError = (field: string) => {
    ga4Service.trackFormError(
      sourceMap[source],
      field,
      errors[field]?.type as 'required' | 'format' | 'length'
    );
  };

  // ADD ABANDON TRACKING
  const handleClose = () => {
    if (status === 'idle') {
      const timeOnForm = Date.now() - formOpenTime;
      ga4Service.trackFormAbandon(
        sourceMap[source],
        timeOnForm
      );
    }
    onClose();
  };

  if (!isOpen) return null;

  const sourceMap = {
    platform: 'landing_page' as const,
    demo: 'demo_request' as const,
    pricing: 'pricing' as const,
  };

  return (
    <motion.div
      // ... existing motion config ...
      onClick={handleClose}
    >
      {/* ... rest of form ... */}
    </motion.div>
  );
};

export default LeadForm;
```

---

### Step 10: Update TransformePage Component

**Timeline:** 5 minutes
**Complexity:** Easy

Update `/src/components/TransformePage.tsx`:

```typescript
import React from 'react';
import { Hero } from './landing/Hero';
import { Features } from './landing/Features';
import { Pricing } from './landing/Pricing';
import { FAQ } from './landing/FAQ';
import { Testimonials } from './landing/Testimonials';
import { Footer } from './landing/Footer';
import { useScrollTracking } from '@/hooks/useScrollTracking'; // ADD THIS

export const TransformePage: React.FC = () => {
  useScrollTracking(); // ADD THIS

  return (
    <main className="w-full">
      <Hero />
      <Features />
      <Pricing />
      <FAQ />
      <Testimonials />
      <Footer />
    </main>
  );
};

export default TransformePage;
```

---

### Step 11: Update Other Components (Optional)

Add tracking to other sections for more detailed insights:

**Features.tsx:**
```typescript
import { ga4Service } from '@/services/ga4Service';

const handleFeatureCta = () => {
  ga4Service.trackCtaClick('features', 'platform');
  // ... open form or link
};
```

**Pricing.tsx:**
```typescript
const handlePricingCta = (plan: string) => {
  ga4Service.trackCtaClick('pricing', plan);
  // ... handle CTA
};
```

**FAQ.tsx:**
```typescript
const handleFaqExpand = (index: number) => {
  ga4Service.trackFaqInteraction(index, 'expand');
};
```

**Testimonials.tsx:**
```typescript
useEffect(() => {
  ga4Service.trackTestimonialView(currentIndex);
}, [currentIndex]);
```

---

### Step 12: Create Environment Variables

**Timeline:** 5 minutes
**Complexity:** Easy

Update `.env.local` (already should have Stripe keys):

```env
# Google Analytics
VITE_GA4_MEASUREMENT_ID=G-XXXXXXXX

# Google Tag Manager
VITE_GTM_CONTAINER_ID=GTM-XXXXXXX

# ... existing keys ...
GEMINI_API_KEY=...
VITE_STRIPE_PUBLIC_KEY=...
```

**Update vite.config.ts** to expose these:

```typescript
export default defineConfig({
  // ... existing config ...
  define: {
    // ... existing defines ...
    'import.meta.env.VITE_GA4_MEASUREMENT_ID': JSON.stringify(
      process.env.VITE_GA4_MEASUREMENT_ID
    ),
    'import.meta.env.VITE_GTM_CONTAINER_ID': JSON.stringify(
      process.env.VITE_GTM_CONTAINER_ID
    ),
  },
});
```

---

### Step 13: Test Implementation

**Timeline:** 20 minutes
**Complexity:** Easy

```bash
npm run dev
```

**Testing Checklist:**
1. Open http://localhost:3000/transforme
2. Open DevTools (F12)
3. Go to Network tab, filter "google-analytics"
4. Perform these actions:
   - [ ] Scroll page → scroll_depth_* events appear
   - [ ] Click "Começar com Plataforma" → cta_click_hero_platform appears
   - [ ] Fill and submit form → form_submit appears
5. Open Console tab:
   - [ ] No errors related to GA4 or analytics
   - [ ] Debug logs show scroll tracking

**Expected Network Requests:**
- Request to `www.google-analytics.com/collect` or similar
- POST body contains event data
- Status 200 OK

---

### Step 14: Configure GA4 Admin Settings

**Timeline:** 15 minutes
**Complexity:** Medium

1. Go to Google Analytics → Admin (gear icon)
2. Select your GA4 property
3. Go to "Events" → "Create event"
4. For each custom event, create mapping:
   - `cta_click_hero_platform`
   - `cta_click_hero_demo`
   - `form_submit`
   - `form_error`
   - `scroll_depth_*`
5. Go to "Conversions"
6. Mark these as conversion events:
   - [ ] `form_submit` (primary conversion)
7. Go to "Data retention"
   - Set to "14 months" (maximum)
8. Go to "Data streams" → Select your stream
9. Verify event count is increasing (real-time view)

---

### Step 15: Create GA4 Dashboard

**Timeline:** 20 minutes
**Complexity:** Medium

1. Go to GA4 property
2. Click "Reports" in left sidebar
3. Click "Create report" → "Blank report"
4. Name: "Landing Page Performance"
5. Add these metrics/dimensions:
   - **Rows:** Source/Medium, Device Category, Page Title
   - **Values:** Users, Sessions, Conversion Rate, Events per Session
6. Save report
7. Create another report:
   - Name: "Conversion Funnel"
   - **Metric:** Events
   - **Filter:** Event name (select: page_view, scroll_depth_50, cta_click_*, form_submit)
   - Visualize as funnel

---

## Common Implementation Patterns

### Pattern 1: Track Button Click

```typescript
import { ga4Service } from '@/services/ga4Service';

export const MyButton: React.FC = () => {
  const handleClick = () => {
    ga4Service.trackCtaClick('my_section', 'my_action');
    // ... handle button click
  };

  return <button onClick={handleClick}>Click me</button>;
};
```

### Pattern 2: Track Form Submission

```typescript
const handleSubmit = async (data) => {
  ga4Service.trackFormSubmission('my_form_source', 'form_type');

  const result = await submitData(data);
  if (result) {
    // success
  }
};
```

### Pattern 3: Track Section Visibility

```typescript
import { useViewportTracking } from '@/hooks/useScrollTracking';

export const MySection: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  useViewportTracking(ref, 'my_section', true);

  return <div ref={ref}>Section content</div>;
};
```

### Pattern 4: Track Custom Event

```typescript
import { ga4Service } from '@/services/ga4Service';

ga4Service.trackCustomEvent('user_action', {
  event_category: 'engagement',
  event_label: 'User clicked something',
  custom_field: 'custom_value',
});
```

---

## Debugging & Verification

### Check if GA4 is Working

In browser console:

```javascript
// Check if gtag is available
console.log(window.gtag);  // Should be a function

// Manually fire test event
window.gtag('event', 'test_event', {
  'event_category': 'test',
  'event_label': 'Manual test',
});

// Check sessionStorage
console.log(sessionStorage.getItem('spfp_session_id'));
console.log(sessionStorage.getItem('ab_variant_hero_headline'));
```

### Real-Time GA4 Dashboard

1. Go to GA4 property
2. Click "Reports" → "Realtime"
3. Perform actions on landing page
4. Events should appear within 5 seconds

### Network Tab Analysis

1. Open DevTools → Network tab
2. Filter by "google-analytics" or "googletagmanager"
3. Perform action (scroll, click, submit)
4. Look for POST request
5. Check payload for event data

---

## Performance Optimization

### Minimize GA4 Impact

```typescript
// Bad: Blocking event firing
const result = await ga4Service.trackCtaClick(...);
// Now handle click

// Good: Non-blocking event firing
ga4Service.trackCtaClick(...);  // Fire and forget
// Immediately handle click
```

### Rate Limiting for High-Frequency Events

```typescript
// For scroll events (already handled in hook)
// Max 1 event per 500ms via throttling

// For custom high-frequency events
const lastEventTime = useRef<number>(0);
const canFireEvent = () => {
  const now = Date.now();
  if (now - lastEventTime.current > 500) {
    lastEventTime.current = now;
    return true;
  }
  return false;
};

if (canFireEvent()) {
  ga4Service.trackCustomEvent(...);
}
```

---

## Deployment Checklist

Before going to production:

- [ ] All GA4 events firing in development
- [ ] GA4 Measurement ID configured
- [ ] GTM Container ID configured
- [ ] No console errors
- [ ] Session storage working
- [ ] A/B variants assigning correctly
- [ ] Form submissions saving to Supabase
- [ ] All tracking code committed to git
- [ ] Environment variables set in production
- [ ] GA4 Real-time dashboard showing events

---

## Reference

**Related Documents:**
- [Analytics & Testing Framework](./ANALYTICS_AND_TESTING_FRAMEWORK.md)
- [QA Checklist](./QA_ANALYTICS_CHECKLIST.md)

**External Resources:**
- [GA4 Setup Guide](https://support.google.com/analytics/answer/9304153)
- [GTM Setup Guide](https://support.google.com/tagmanager/answer/6103696)
- [GA4 Event Reference](https://support.google.com/analytics/answer/9322688)

---

**Document Status:** Ready for Implementation
**Last Updated:** 2026-02-23
