# SPFP Landing Page Analytics & A/B Testing Framework

**Document Version:** 1.0
**Created:** 2026-02-23
**Status:** Ready for Week 2 Launch
**Audience:** Product, Marketing, Engineering, QA

---

## Table of Contents

1. [Analytics Setup](#analytics-setup)
2. [Conversion Funnel](#conversion-funnel)
3. [A/B Testing Configuration](#ab-testing-configuration)
4. [Testing Platform Setup](#testing-platform-setup)
5. [Dashboard Creation](#dashboard-creation)
6. [QA & Validation Checklist](#qa--validation-checklist)
7. [Quick Start Guide](#quick-start-guide)

---

## Analytics Setup

### Overview

Google Analytics 4 (GA4) is the primary analytics platform for the SPFP Landing Page (`/transforme`). This setup tracks user behavior across the funnel, from initial page view through conversion.

### Implementation Architecture

```
Landing Page Components
    ├── Hero (CTA clicks)
    ├── Features (engagement)
    ├── Pricing (section interaction)
    ├── Testimonials (scroll, engagement)
    ├── FAQ (engagement)
    └── LeadForm (form submission)
         │
         ├── Track Events → gtag.event()
         ├── Send to GA4 via Google Tag Manager
         ├── Fallback to localStorage (if offline)
         └── Sync to Supabase analytics_events table
```

### GA4 Event Configuration

#### 1. **Page View Events** (Automatic)

GA4 tracks page views automatically. Customize with:

```typescript
// File: src/services/ga4Service.ts
gtag.event('page_view', {
  'page_path': '/transforme',
  'page_title': 'SPFP - Transforme Suas Finanças',
  'page_location': window.location.href
});
```

#### 2. **CTA Click Events** (Manual)

Track clicks on Call-To-Action buttons by section:

| Event Name | Trigger | Parameters |
|-----------|---------|-----------|
| `cta_click_hero_platform` | "Começar com Plataforma" button in hero | section, button_text, button_position |
| `cta_click_hero_demo` | "Agendar Demo" button in hero | section, button_text, button_position |
| `cta_click_pricing_platform` | CTA button in pricing section | section, plan_type, price |
| `cta_click_pricing_demo` | Demo request from pricing | section, plan_type, price |
| `cta_click_features_cta` | CTA in features section | section, feature_name |
| `cta_click_footer_cta` | CTA in footer | section, link_text |

**Implementation Example:**

```typescript
// File: src/components/landing/Hero.tsx
const handleCtaClick = (type: 'platform' | 'demo') => {
  // Track GA4 event
  if (window.gtag) {
    window.gtag('event', `cta_click_hero_${type}`, {
      'event_category': 'engagement',
      'event_label': type === 'platform' ? 'Start Platform' : 'Book Demo',
      'section': 'hero',
      'button_type': type,
      'timestamp': new Date().toISOString(),
    });
  }

  // Open form modal
  handleOpenForm(type);
};
```

#### 3. **Form Submission Events**

Track form submissions and conversions:

| Event Name | Trigger | Parameters |
|-----------|---------|-----------|
| `form_submit` | LeadForm submitted | form_id, form_source, submission_type |
| `form_error` | Form validation error | form_id, error_field, error_type |
| `form_abandon` | User closes form without submission | form_id, time_on_form_ms |

**Implementation in LeadForm:**

```typescript
// File: src/components/landing/LeadForm.tsx
const onSubmit = async (data: LeadFormData) => {
  const formId = `lead_form_${source}`;

  if (window.gtag) {
    window.gtag('event', 'form_submit', {
      'event_category': 'conversion',
      'event_label': 'Lead Form Submission',
      'form_id': formId,
      'form_source': source,
      'submission_type': 'lead_capture',
      'timestamp': new Date().toISOString(),
    });
  }

  // ... rest of submission logic
};
```

#### 4. **Scroll Depth Tracking**

Track how far users scroll down the page:

| Depth | Event Name | Trigger |
|-------|-----------|---------|
| 25% | `scroll_depth_25` | User scrolls to 25% of page height |
| 50% | `scroll_depth_50` | User scrolls to 50% of page height |
| 75% | `scroll_depth_75` | User scrolls to 75% of page height |
| 100% | `scroll_depth_100` | User reaches bottom of page |

**Implementation:**

```typescript
// File: src/hooks/useScrollTracking.ts
export const useScrollTracking = () => {
  const [trackedDepths, setTrackedDepths] = useState<Set<number>>(new Set());

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const scrollPercent = ((scrollTop + windowHeight) / scrollHeight) * 100;

      const thresholds = [25, 50, 75, 100];
      thresholds.forEach((threshold) => {
        if (scrollPercent >= threshold && !trackedDepths.has(threshold)) {
          setTrackedDepths((prev) => new Set(prev).add(threshold));

          if (window.gtag) {
            window.gtag('event', `scroll_depth_${threshold}`, {
              'event_category': 'engagement',
              'event_label': `Scrolled to ${threshold}%`,
              'scroll_depth': threshold,
              'page_path': window.location.pathname,
              'timestamp': new Date().toISOString(),
            });
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [trackedDepths]);
};
```

#### 5. **Section Engagement Events**

Track user interactions with specific page sections:

| Event Name | Trigger | Parameters |
|-----------|---------|-----------|
| `section_view` | Section scrolls into viewport | section_name, section_position |
| `faq_expand` | FAQ accordion expanded | section, faq_item_index |
| `faq_collapse` | FAQ accordion collapsed | section, faq_item_index |
| `testimonial_viewed` | Testimonial carousel item viewed | section, testimonial_index |
| `feature_hover` | User hovers over feature card | section, feature_name |

#### 6. **Demo Request Events**

Track demo request flow:

| Event Name | Trigger | Parameters |
|-----------|---------|-----------|
| `demo_request_initiated` | User clicks demo button | source_section, timestamp |
| `demo_request_form_opened` | Demo form modal opens | source_section, timestamp |
| `demo_request_submitted` | Demo form submitted | source_section, email |

### Event Parameter Standard Structure

All events follow this parameter structure:

```typescript
{
  // Event identification
  'event_category': 'engagement' | 'conversion' | 'error' | 'form',
  'event_label': string,        // Human-readable description

  // User context
  'user_id': string,            // Anonymous ID (GA4 auto-assigned)
  'session_id': string,         // Session identifier

  // Page context
  'page_path': string,          // URL path (auto-populated)
  'page_title': string,         // Page title (auto-populated)
  'section': string,            // Section name (hero, pricing, etc.)

  // Event specific
  'event_value': number,        // Optional: revenue, duration, count
  'timestamp': string,          // ISO 8601 format

  // Experiment context (for A/B tests)
  'experiment_id': string,      // Test identifier
  'experiment_variant': string, // Control, Variant A, Variant B
  'ab_test_group': string,      // Test name
}
```

### GA4 Configuration Checklist

- [ ] Google Analytics 4 Property created in Google Cloud Console
- [ ] GA4 Measurement ID obtained (format: G-XXXXXXXX)
- [ ] Google Tag Manager (GTM) container created
- [ ] GA4 trigger configured in GTM
- [ ] gtag.js snippet added to `index.html`
- [ ] Event firing verified in GA4 Real-time dashboard
- [ ] Custom event parameters configured in GA4 admin
- [ ] Conversion events marked in GA4 admin
- [ ] Data retention set to 14 months
- [ ] User-ID tracking enabled (requires Privacy Policy update)

---

## Conversion Funnel

### Funnel Stages

The SPFP landing page conversion funnel has 5 stages:

```
Stage 1: Landing Page View
  └─ All users reaching /transforme
  └─ Track: page_view event
  └─ Expected: 100% baseline

Stage 2: Engaged (Scroll 50%+)
  └─ Users who scroll past 50% of page
  └─ Track: scroll_depth_50 event
  └─ Target: 70%+ (10% drop-off acceptable)

Stage 3: CTA Interaction
  └─ Users who click any CTA button
  └─ Track: cta_click_* events
  └─ Target: 30%+ (40% drop-off from engagement)

Stage 4: Form Opened
  └─ Users who open lead form modal
  └─ Track: form_view event (in LeadForm component)
  └─ Target: 25%+ (25% drop-off from CTA)

Stage 5: Conversion (Lead Captured)
  └─ Users who submit lead form
  └─ Track: form_submit event
  └─ Target: 15%+ (40% drop-off from form open)
```

### Funnel Visualization in GA4

**Path:** Admin > Data Display > Events > Create Custom Event

1. **Name:** `landing_page_conversion_funnel`
2. **Description:** SPFP landing page conversion flow
3. **Events in sequence:**
   - Stage 1: `page_view`
   - Stage 2: `scroll_depth_50`
   - Stage 3: `cta_click_*` (any CTA event)
   - Stage 4: Form modal open (custom)
   - Stage 5: `form_submit`

### Baseline Metrics (Week 1 Targets)

These metrics establish the baseline for A/B testing and ongoing optimization:

| Metric | Definition | Target | Alert Threshold |
|--------|-----------|--------|-----------------|
| **Funnel Entry (Page Views)** | All /transforme page views | 1000-5000 | <500 |
| **Engagement Rate** | % users scrolling 50%+ | 70% | <50% |
| **CTA Click-Through Rate (CTR)** | % users clicking any CTA | 30% | <15% |
| **Form Open Rate** | % users opening lead form | 25% | <12% |
| **Conversion Rate** | % users submitting lead form | 15% | <7% |
| **Cost Per Lead (CPL)** | Ad spend / leads captured | TBD | +50% variance |
| **Time on Page** | Avg session duration | 2-3 min | <1 min |
| **Bounce Rate** | % users leaving without action | <20% | >40% |

### Anomaly Alerts

Configure alerts in GA4 for sudden changes:

1. **Conversion Rate Drop**
   - Alert if conversion rate drops by >50% within 1 hour
   - Action: Check form functionality, check errors in console

2. **Traffic Spike/Drop**
   - Alert if page views change by >100% in 1 hour
   - Action: Verify analytics tracking, check infrastructure

3. **Error Rate Spike**
   - Alert if form_error events increase by >200%
   - Action: Review console logs, check form validation

4. **Engagement Drop**
   - Alert if scroll_depth_50 drops below 50% in 24h window
   - Action: Review page content, check page speed

---

## A/B Testing Configuration

### Overview

Four concurrent A/B tests run during Week 2 to optimize landing page conversion. Each test has:

- **Duration:** 7-10 days
- **Sample Size:** Calculated per test
- **Confidence Level:** 95%
- **Statistical Power:** 80%
- **Variant Split:** 33% control, 33% variant A, 34% variant B

### Test 1: Hero Narrative

**Objective:** Determine which hero headline drives higher engagement and conversion.

#### Control Group Setup

**Variant Name:** Control - Current
**Traffic Allocation:** 33%
**Hypothesis:** Current headline generates baseline conversion

**Current Variant:**
```
Headline: "Planeje suas finanças em minutos, não horas."
Subheading: "Com inteligência artificial que entende VOCÊ"
CTA 1: "Começar com Plataforma (R$99,90/mês)"
CTA 2: "Agendar Demo"
```

**Implementation:**
```typescript
// File: src/components/landing/Hero.tsx
const heroVariant = sessionStorage.getItem('ab_test_hero_variant') || 'control';

const variants = {
  control: {
    headline: "Planeje suas finanças em minutos, não horas.",
    subheading: "Com inteligência artificial que entende VOCÊ",
  },
  // ... variants A & B below
};

return (
  <>
    <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight text-gray-950">
      {variants[heroVariant].headline}
    </h1>
    <p className="text-xl md:text-2xl mb-8 text-gray-700 leading-relaxed">
      {variants[heroVariant].subheading}
    </p>
  </>
);
```

#### Test Variant A Setup

**Variant Name:** Variant A - AI Focus
**Traffic Allocation:** 33%
**Hypothesis:** AI positioning drives more engagement

**Variant A:**
```
Headline: "Tenha um assessor financeiro AI disponível 24/7."
Subheading: "Análises, recomendações e planejamento em tempo real"
CTA 1: "Começar com IA (R$99,90/mês)"
CTA 2: "Ver Demo do Assistente"
```

**Expected Impact:** Stronger value prop may increase CTR by 15%

#### Test Variant B Setup

**Variant Name:** Variant B - Urgency/FOMO
**Traffic Allocation:** 34%
**Hypothesis:** Urgency/FOMO messaging drives conversions

**Variant B:**
```
Headline: "Comece seu plano financeiro agora."
Subheading: "Evite 3 em cada 4 brasileiros errarem nas finanças"
CTA 1: "Começar Agora - Primeiros 30 dias 50% OFF"
CTA 2: "Agendar Demo Exclusiva"
```

**Expected Impact:** Time-limited offer may increase conversion by 20%

#### Goal Metrics & Sample Size Calculation

**Primary Goal:** Form submission conversion
- **Baseline conversion rate:** 15% (estimated)
- **Desired improvement:** +3% absolute (15% → 18%)
- **Sample size per variant:** 2,000 users
- **Total sample needed:** 6,000 users
- **Estimated duration:** 5-7 days (assuming 1000 daily users)

**Secondary Goals:**
1. CTA Click-Through Rate (target: +2%)
2. Scroll Depth 75% (target: +5%)
3. Time on Page (target: +20 seconds)

**Statistical Parameters:**
- Confidence Level: 95%
- Power: 80%
- Significance Level (α): 0.05
- Minimum Detectable Effect (MDE): 3% absolute

#### Duration & Confidence Level

- **Test Start:** Week 2, Day 1 (Monday)
- **Test End:** Week 2, Day 7 (Sunday) or when sample size reached
- **Extension:** +3 days if inconclusive (no clear winner)
- **Winner Declaration:** Achieved 95% confidence, statistically significant

**Decision Rules:**
- If Variant A/B wins with >95% confidence: Deploy winner
- If neither reaches 95% confidence: Continue test +3 days
- If test duration exceeds 10 days: Declare no clear winner, redeploy control

### Test 2: CTA Button Messaging

**Objective:** Optimize call-to-action messaging for higher conversion.

#### Control Group Setup

**Variant Name:** Control - Feature-based
**Traffic Allocation:** 33%
**Hypothesis:** Descriptive CTAs drive baseline conversion

**Current Variant:**
```
Button 1: "Começar com Plataforma (R$99,90/mês)"
Button 2: "Agendar Demo"
```

#### Test Variant A Setup

**Variant Name:** Variant A - Action-based
**Traffic Allocation:** 33%
**Hypothesis:** Action-oriented CTAs increase urgency

**Variant A:**
```
Button 1: "Criar Conta Grátis"
Button 2: "Falar com Especialista"
```

#### Test Variant B Setup

**Variant Name:** Variant B - Benefit-based
**Traffic Allocation:** 34%
**Hypothesis:** Benefit-focused CTAs increase perceived value

**Variant B:**
```
Button 1: "Começar Agora - 30 dias Grátis"
Button 2: "Agendar Consulta Gratuita"
```

#### Goal Metrics

- **Primary Goal:** Form submission conversion
- **Target improvement:** +5% (from 15% to 20%)
- **Sample size:** 2,000 per variant
- **Duration:** 5-7 days

#### Duration & Confidence

- **Start:** Week 2, Day 1
- **End:** When 95% confidence achieved or Day 7
- **Decision Threshold:** >90% confidence to declare winner

### Test 3: Pricing Section Layout

**Objective:** Optimize pricing section design for conversion impact.

#### Control Group Setup

**Variant Name:** Control - 2-Plan Grid
**Traffic Allocation:** 33%
**Current Layout:**
- 2-column grid (Plataforma vs Consultoria)
- Feature comparison table
- Side-by-side pricing display

#### Test Variant A Setup

**Variant Name:** Variant A - Single Recommended Plan
**Traffic Allocation:** 33%
**Hypothesis:** Highlighting one plan reduces decision paralysis

**Layout:**
- Plataforma plan centered and highlighted
- "Mais Popular" badge
- Consultoria plan secondary (below)

#### Test Variant B Setup

**Variant Name:** Variant B - Tiered 3-Plan
**Traffic Allocation:** 34%
**Hypothesis:** Adding mid-tier plan increases average order value

**Layout:**
- Starter: R$49/mês (minimal AI features)
- Plataforma: R$99/mês (full AI, recommended)
- Premium: R$199/mês (priority support)

#### Goal Metrics

- **Primary Goal:** Pricing section CTA click rate
- **Secondary Goal:** Plan selected (to track AOV preference)
- **Sample size:** 2,500 per variant
- **Duration:** 7-10 days

### Test 4: Social Proof Section

**Objective:** Test which social proof element drives highest conversion.

#### Control Group Setup

**Variant Name:** Control - Testimonials Only
**Traffic Allocation:** 33%
**Current Setup:**
- 4-5 customer testimonial cards
- Auto-scroll carousel
- Star ratings (5/5)

#### Test Variant A Setup

**Variant Name:** Variant A - Trust Badges + Testimonials
**Traffic Allocation:** 33%
**Hypothesis:** Trust indicators increase credibility

**Elements:**
- Testimonials carousel (same as control)
- Trust badges: "4.9★ 500+ Reviews", "Trusted by 10k+ Users"
- Security badge: "ISO 27001 Certified"
- Press mentions: "Seen in StartupBR, TechCrunch Brasil"

#### Test Variant B Setup

**Variant Name:** Variant B - Results/Metrics Focus
**Traffic Allocation:** 34%
**Hypothesis:** Quantified results are more persuasive

**Elements:**
- Key metrics: "Avg savings: R$500/month", "90% user satisfaction"
- Case study cards with before/after
- "Join 10,000+ Users" CTA
- Money-back guarantee badge

#### Goal Metrics

- **Primary Goal:** Conversion rate lift
- **Secondary Goals:** Time on section, CTA clicks
- **Sample size:** 2,000 per variant
- **Duration:** 5-7 days

---

## Testing Platform Setup

### Option 1: Google Optimize Setup (Recommended)

**Google Optimize** integrates directly with GA4 for seamless A/B testing.

#### Prerequisites

- Google Analytics 4 property created
- Google Optimize container linked to GA4
- Sufficient daily traffic (>1000 users) for statistical significance

#### Setup Steps

1. **Create Google Optimize Property**
   - Sign in to [optimize.google.com](https://optimize.google.com)
   - Link to GA4 property
   - Create A/B test container
   - Install Optimize snippet in `index.html` (before gtag)

2. **Create A/B Test**
   - Test name: `hero_headline_test_w2`
   - Test type: A/B Test
   - Targeting:
     - URL contains `/transforme`
     - Traffic allocation: 100%
   - Variants: 3 (Control, Variant A, Variant B)

3. **Configure Targeting Rules**
   ```
   // Only test users NOT in previous tests
   - Page URL: matches regex /transforme$
   - Exclude: Users with 'ab_test_cookie' set
   ```

4. **Setup Traffic Split**
   - Control: 33%
   - Variant A: 33%
   - Variant B: 34%

5. **Connect Goals**
   - Primary: form_submit event
   - Secondary: cta_click_* event
   - Tertiary: scroll_depth_75 event

#### Installation Code

```html
<!-- Add to <head> in index.html BEFORE gtag -->
<!-- Google Optimize Snippet -->
<script src="https://cdn.optimize.google.com/optimize.js?id=OPT-XXXXXXX"></script>

<!-- Hide page to prevent flicker -->
<style>
  .hide-optimize { visibility: hidden !important; opacity: 0 !important; }
</style>
<script>
  document.documentElement.className += ' hide-optimize';
  setTimeout(function() {
    document.documentElement.className = document.documentElement.className.replace(
      /\bhide-optimize\b/,
      ''
    );
  }, 4000); // Hide for max 4 seconds
</script>
```

#### Implementation in React Components

```typescript
// File: src/hooks/useOptimizeVariant.ts
export const useOptimizeVariant = (testName: string) => {
  const [variant, setVariant] = useState<string>('control');

  useEffect(() => {
    // Google Optimize sets data on window object
    const getVariant = () => {
      const optimizeData = (window as any).dataLayer?.[0];
      if (optimizeData?.['experiment.id']) {
        const variants = ['control', 'variant_a', 'variant_b'];
        const variantIndex = optimizeData['experiment.variant'] || 0;
        setVariant(variants[variantIndex]);
      }
    };

    // Wait for Optimize to load
    setTimeout(getVariant, 500);
  }, []);

  return variant;
};

// Usage in component:
const Hero: React.FC = () => {
  const variant = useOptimizeVariant('hero_headline_test_w2');

  const headlines = {
    control: "Planeje suas finanças em minutos, não horas.",
    variant_a: "Tenha um assessor financeiro AI disponível 24/7.",
    variant_b: "Comece seu plano financeiro agora.",
  };

  return <h1>{headlines[variant]}</h1>;
};
```

---

### Option 2: VWO Setup (Alternative)

**VWO** (Visual Website Optimizer) is a powerful alternative with visual editor.

#### Setup Steps

1. **Create VWO Account**
   - Sign up at [vwo.com](https://vwo.com)
   - Create new campaign: "SPFP Landing Page Tests"

2. **Install VWO Snippet**
   ```html
   <!-- Add to <head> in index.html -->
   <script type="text/javascript">
     window._vwo_code = window._vwo_code || (function() {
       var account_id = 'YOUR_ACCOUNT_ID',
           settings_tolerance = 2000,
           library_tolerance = 2500,
           use_existing_jquery = false,
           // rest of snippet...
     })();
   </script>
   <script type='text/javascript' src='https://cdn.vwo.com/js/....'></script>
   ```

3. **Create A/B Test**
   - Test name: `hero_headline_optimization`
   - Targeting: URL contains `/transforme`
   - Traffic: 100% (split across variants)

4. **Visual Editor or Code Editor**
   - Use Visual Editor for simple HTML changes
   - Use Custom Code for React component state changes:
   ```javascript
   _vwo_code.push({
     type: 'css',
     css: '.hero-variant-a { display: none; }'
   });
   _vwo_code.push({
     type: 'js',
     js: function() {
       document.querySelector('.hero-variant-b').style.display = 'block';
     }
   });
   ```

5. **Setup Conversion Goals**
   - Primary: "Lead Form Submission"
   - Secondary: "CTA Click", "Scroll 50%"

#### VWO Advantages
- Visual editor (no code changes needed for simple tests)
- Easier setup than Google Optimize
- Built-in heatmaps and session recordings
- Better UX for non-technical users

#### VWO Disadvantages
- Monthly cost ($99-999+)
- Less seamless GA4 integration
- Requires separate platform access

---

### Option 3: URL Parameter Testing (Simple Backup)

**Fallback method** if neither Google Optimize nor VWO is available.

#### How It Works

Use URL parameters to track variants:

```
/transforme?ab_test=hero&variant=control  // Control group
/transforme?ab_test=hero&variant=variant_a  // Variant A
/transforme?ab_test=hero&variant=variant_b  // Variant B
```

#### Implementation

```typescript
// File: src/components/landing/Hero.tsx
export const Hero: React.FC = () => {
  const params = new URLSearchParams(window.location.search);
  const variant = params.get('variant') || 'control';

  const headlines = {
    control: "Planeje suas finanças em minutos, não horas.",
    variant_a: "Tenha um assessor financeiro AI disponível 24/7.",
    variant_b: "Comece seu plano financeiro agora.",
  };

  // Track variant in GA4
  useEffect(() => {
    if (window.gtag && variant !== 'control') {
      window.gtag('event', 'ab_test_exposure', {
        'experiment_id': 'hero_headline_test',
        'experiment_variant': variant,
        'event_category': 'experiment',
      });
    }
  }, [variant]);

  return (
    <h1>{headlines[variant]}</h1>
  );
};
```

#### Distribution Setup

Use JavaScript in `index.html` to randomly assign variants:

```javascript
<script>
  (function() {
    const params = new URLSearchParams(window.location.search);

    // Only assign if not already set
    if (!params.has('variant') && window.location.pathname.includes('/transforme')) {
      const variants = ['control', 'variant_a', 'variant_b'];
      const weights = [0.33, 0.33, 0.34];
      const rand = Math.random();

      let cumulative = 0;
      let selected = 'control';

      for (let i = 0; i < weights.length; i++) {
        cumulative += weights[i];
        if (rand < cumulative) {
          selected = variants[i];
          break;
        }
      }

      // Store in sessionStorage for consistency
      sessionStorage.setItem('ab_variant', selected);
      window.location.search = `?variant=${selected}`;
    }
  })();
</script>
```

#### Limitations
- No visual editor
- Manual traffic split verification needed
- Harder to run concurrent tests
- No built-in statistical significance testing

---

### Session ID Tracking for Consistency

Ensure each user stays in same test variant throughout session:

```typescript
// File: src/services/sessionService.ts
export const getOrCreateSessionId = (): string => {
  let sessionId = sessionStorage.getItem('spfp_session_id');

  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('spfp_session_id', sessionId);
  }

  return sessionId;
};

export const getOrCreateAbTestVariant = (testName: string): string => {
  const variantKey = `ab_variant_${testName}`;
  let variant = sessionStorage.getItem(variantKey);

  if (!variant) {
    const variants = ['control', 'variant_a', 'variant_b'];
    const weights = [0.33, 0.33, 0.34];

    const rand = Math.random();
    let cumulative = 0;

    for (let i = 0; i < weights.length; i++) {
      cumulative += weights[i];
      if (rand < cumulative) {
        variant = variants[i];
        break;
      }
    }

    sessionStorage.setItem(variantKey, variant || 'control');
  }

  return variant || 'control';
};
```

**Include in every GA4 event:**

```typescript
if (window.gtag) {
  window.gtag('event', 'cta_click_hero_platform', {
    'session_id': getOrCreateSessionId(),
    'ab_test_group': 'hero_headline_test',
    'experiment_variant': getOrCreateAbTestVariant('hero_headline'),
    // ... other parameters
  });
}
```

---

## Dashboard Creation

### Key Metrics Overview

7-10 main metrics tracked in real-time dashboard:

| Metric | Definition | Current Target | Frequency |
|--------|-----------|-----------------|-----------|
| **Page Views** | Daily unique visitors to /transforme | 1000+ | Real-time |
| **Engagement Rate** | % users scrolling 50%+ | 70% | Real-time |
| **CTA Click Rate** | % users clicking any CTA | 30% | Real-time |
| **Form Open Rate** | % users opening lead form | 25% | Real-time |
| **Conversion Rate** | % users submitting lead form | 15% | Real-time |
| **Cost Per Lead** | Ad spend / leads | TBD | Hourly |
| **Bounce Rate** | % users leaving without engagement | <20% | Daily |
| **Average Session Duration** | Avg time spent on page | 2-3 min | Real-time |
| **Test Variant Performance** | Conversion by A/B test variant | Monitor | Real-time |
| **Form Error Rate** | % of forms with validation errors | <5% | Real-time |

### Real-Time Alerts Setup

Configure alerts in GA4 for critical metrics:

**Alert 1: Conversion Rate Drop**
- Condition: Conversion rate < 10% (50% below baseline 15%)
- Duration: 1 hour
- Action: Email alert to marketing@spfp.com
- Escalation: If persists >2 hours, page goes offline

**Alert 2: Traffic Spike**
- Condition: Page views > 500 in 30 minutes OR < 10 in 30 minutes
- Duration: 30 minutes
- Action: Slack notification to #analytics channel
- Investigation: Check ad campaigns, infrastructure status

**Alert 3: Error Rate Spike**
- Condition: form_error events > 20% of form_submit events
- Duration: 15 minutes
- Action: Email to engineering team
- Investigation: Form validation logic, API errors

**Alert 4: Engagement Drop**
- Condition: Scroll depth 50% < 60%
- Duration: 2 hours
- Action: Slack notification, manual review
- Investigation: Page speed, content engagement

### Weekly Reporting Template

**Template:** `docs/reports/WEEKLY_ANALYTICS_REPORT_W2.md`

```markdown
# SPFP Landing Page — Weekly Analytics Report
## Week 2: Feb 24 - Mar 1, 2026

### Executive Summary
- Total page views: [X]
- Total leads captured: [Y]
- Conversion rate: [Z]%
- Best performing variant: [Variant Name]
- Key insight: [Primary finding]

### Conversion Funnel
- Stage 1 (Page Views): X users
- Stage 2 (Engaged 50%+): Y users (X% of stage 1)
- Stage 3 (CTA Click): Z users (Y% of stage 2)
- Stage 4 (Form Open): A users (Z% of stage 3)
- Stage 5 (Conversion): B users (A% of stage 4)

### A/B Test Results
#### Test 1: Hero Headline
- Control: 15% conversion
- Variant A: 16.5% conversion (+1.5%)
- Variant B: 17.2% conversion (+2.2%, WINNER)
- Confidence: 92%
- Status: Continue 2 more days for 95% confidence

#### Test 2: CTA Button Messaging
- [Similar format for other tests]

### Key Metrics
| Metric | Value | vs. Baseline | Status |
|--------|-------|-------------|--------|
| Page Views | X | +Y% | [Green/Yellow/Red] |
| Engagement Rate | X% | +Y% | [Green/Yellow/Red] |
| Conversion Rate | X% | +Y% | [Green/Yellow/Red] |
| Cost Per Lead | R$X | +Y% | [Green/Yellow/Red] |

### Issues & Resolutions
- Issue 1: [Description]
  - Root Cause: [Cause]
  - Resolution: [Fix]
  - Status: [Fixed/In Progress]

### Recommendations
1. [Action Item 1]
2. [Action Item 2]
3. [Action Item 3]

### Next Week's Focus
- [Priority 1]
- [Priority 2]
```

### Stakeholder Dashboard View

**For Non-Technical Stakeholders:** Simplified dashboard showing only key metrics

```
┌─────────────────────────────────────────────────┐
│         SPFP LANDING PAGE DASHBOARD             │
│          Week 2 Performance Overview             │
├─────────────────────────────────────────────────┤
│                                                  │
│  📊 Visitors: 3,245 (+15% vs Week 1)            │
│                                                  │
│  💰 Leads Captured: 486 (+22% vs Week 1)        │
│                                                  │
│  🎯 Conversion Rate: 15% (Target: 15% ✓)       │
│                                                  │
│  🏆 Best Test: CTA Button (Variant B +5%)       │
│                                                  │
│  ⏱️  Avg Time on Page: 2m 45s                   │
│                                                  │
│  🔴 Alerts: None                                │
│                                                  │
├─────────────────────────────────────────────────┤
│  Updated: Every 5 minutes | Last sync: 2m ago  │
└─────────────────────────────────────────────────┘
```

---

## QA & Validation Checklist

### Pre-Launch Testing (Week 1 End)

#### Form Testing
- [ ] LeadForm renders correctly on desktop, tablet, mobile
- [ ] All form fields accept valid input
- [ ] Form validation shows error messages for invalid input
- [ ] Form submission sends data to Supabase `leads` table
- [ ] Form submission displays success message
- [ ] Form resets after successful submission
- [ ] Form modal closes after 2 seconds post-success
- [ ] All CTAs open correct form source ('platform', 'demo', 'pricing')

#### Tracking Setup
- [ ] GA4 gtag.js loaded and firing in browser console
- [ ] Page view event recorded in GA4 Real-time dashboard
- [ ] CTA click events firing with correct parameters
- [ ] Scroll depth tracking fires at 25%, 50%, 75%, 100%
- [ ] Form submission event includes source parameter
- [ ] Form error events track validation failures
- [ ] Session ID generated and consistent for user session
- [ ] Test variant assigned and consistent for user session

#### Analytics Events
- [ ] `cta_click_hero_platform` event firing with correct params
- [ ] `cta_click_hero_demo` event firing with correct params
- [ ] `form_submit` event includes form_source parameter
- [ ] `scroll_depth_50` event fires after scrolling 50%
- [ ] All events include timestamp in ISO 8601 format
- [ ] All events include page_path parameter
- [ ] All events include session_id parameter

#### A/B Testing
- [ ] Variants load correctly (33/33/34 split)
- [ ] Variant persists for entire session (sessionStorage)
- [ ] Different variant users see different content
- [ ] `ab_test_exposure` event fires for non-control users
- [ ] `experiment_variant` parameter in events matches displayed variant
- [ ] No visual flicker when page loads with different variant

#### Error Tracking
- [ ] Form submission errors handled gracefully
- [ ] Failed API calls show user-friendly error message
- [ ] Error events logged with full context
- [ ] Errors don't prevent other events from firing
- [ ] Errors logged to analytics_events table in Supabase

#### Browser Compatibility
- [ ] Chrome 120+ (desktop & mobile)
- [ ] Firefox 121+
- [ ] Safari 17+
- [ ] Edge 120+
- [ ] Mobile Safari (iOS 17+)
- [ ] Chrome Mobile (Android)

#### Performance
- [ ] Page loads in <3s (3G throttled)
- [ ] Form modal appears within 500ms of CTA click
- [ ] Analytics events fire without blocking page interaction
- [ ] No memory leaks after 5 minutes of interaction
- [ ] No console errors or warnings related to tracking

---

### Post-Launch Verification (First 24 Hours)

#### Hour 1 Checks
- [ ] Real-time dashboard shows incoming traffic
- [ ] Page view count increasing (target: 50+ per hour)
- [ ] CTA clicks appearing in real-time dashboard
- [ ] Form submissions appearing in Supabase leads table
- [ ] No error spikes in GA4
- [ ] GTM triggering events correctly
- [ ] All variants displaying correctly

#### Hour 4 Checks
- [ ] Conversion funnel building (at least 10 conversions)
- [ ] Scroll depth events firing at all thresholds
- [ ] Form error rate < 5%
- [ ] No spike in bounce rate (target: <20%)
- [ ] Average session duration tracking correctly (target: 2-3 min)
- [ ] A/B test variant distribution balanced (33/33/34)

#### Hour 12 Checks
- [ ] At least 100 page views recorded
- [ ] At least 20 leads captured
- [ ] Conversion rate stabilizing around 15%
- [ ] No systematic error patterns
- [ ] Page speed metrics within target
- [ ] Mobile traffic performing similarly to desktop
- [ ] All CTA button variations visible and clickable

#### Day 1 (24 Hours) Checks
- [ ] Minimum 500 page views reached
- [ ] Minimum 75 leads captured
- [ ] Conversion rate in range 10-20% (15% target)
- [ ] A/B test sample size per variant >150 users
- [ ] Form submission rate stable (not trending down)
- [ ] No critical errors in console or error logs
- [ ] All analytics events flowing to GA4
- [ ] Supabase database query performance normal
- [ ] Cost per lead within budget parameters
- [ ] Ready for Week 2 A/B test optimization

---

### A/B Test Health Monitoring

**Ongoing checks during active A/B tests:**

- [ ] Traffic allocation balanced (33/33/34 ±5%)
- [ ] Conversion rate per variant trending up or stable
- [ ] No significant difference in variant assignment based on time of day
- [ ] Form error rate consistent across variants (<5%)
- [ ] No technical issues affecting specific variants
- [ ] Statistical significance increasing over time
- [ ] Sample size tracking toward 2000+ per variant goal
- [ ] No variant outperforming others by >20% in first 24 hours (check for flicker/bugs)

---

### Error Tracking Setup

**Critical errors to monitor:**

1. **Form Submission Errors**
   - Supabase insert failure
   - Network timeout
   - Validation error
   - **Alert:** If error rate > 10%

2. **Analytics Event Firing Failures**
   - gtag not available
   - Network request blocked
   - Invalid event parameters
   - **Alert:** If failure rate > 5%

3. **A/B Test Variant Loading**
   - Google Optimize not loading
   - Variant mismatch (assigned ≠ displayed)
   - Session ID collision
   - **Alert:** If occurs for >1% of users

**Implementation:**

```typescript
// File: src/services/errorTrackingService.ts
export const trackError = (
  errorType: 'form_submission' | 'analytics_event' | 'ab_test',
  error: Error,
  context: Record<string, any>
) => {
  // Log to Supabase
  supabase
    .from('analytics_errors')
    .insert({
      error_type: errorType,
      error_message: error.message,
      error_stack: error.stack,
      context: JSON.stringify(context),
      user_agent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    });

  // Alert if critical
  if (errorType === 'form_submission') {
    incrementErrorCounter('form_submission_error');
    if (getErrorCounter('form_submission_error') > 10) {
      // Send alert to team
      triggerAlert('Form submission error rate spiked');
    }
  }
};
```

---

## Quick Start Guide

### For Implementation Team

1. **Add Google Analytics 4**
   ```bash
   # 1. Create GA4 property (manual step in Google Analytics)
   # 2. Get Measurement ID (format: G-XXXXXXXX)
   # 3. Add to index.html
   ```

2. **Install GA4 Service**
   ```bash
   cp src/services/ga4Service.ts.example src/services/ga4Service.ts
   npm install @types/gtag.js
   ```

3. **Update Components**
   ```bash
   # Follow implementation snippets in Test sections
   # Update Hero.tsx, LeadForm.tsx, etc.
   ```

4. **Test Events Locally**
   ```bash
   npm run dev
   # Open browser console
   # Click CTAs, submit form, scroll
   # Verify events in GA4 Real-time dashboard
   ```

5. **Deploy**
   ```bash
   npm run build
   npm run preview
   git add -A
   git commit -m "feat: add GA4 analytics and A/B testing framework"
   # Push and deploy to production
   ```

### For Marketing Team

1. **Monitor Dashboard**
   - Check [GA4 Dashboard](link) daily
   - Review weekly reports in `docs/reports/`

2. **Adjust Ads**
   - Use conversion data to optimize ad spend
   - Target highest converting segments
   - Pause underperforming creative

3. **Communicate Results**
   - Share weekly updates with leadership
   - Highlight winning test variants
   - Document insights for next launch

### For Product Team

1. **Review A/B Test Results**
   - Weekly results meeting (Friday 2pm)
   - Discuss winning variants
   - Plan implementation of winners

2. **Plan Next Iteration**
   - Based on Week 2 A/B test learnings
   - Design new variants for Week 3
   - Prioritize high-impact changes

---

## Support & Troubleshooting

### Common Issues

**Issue: GA4 events not appearing**
- Solution: Check gtag.js is loaded in `index.html`
- Verify GA4 Measurement ID is correct
- Check browser console for errors
- Wait 24 hours for data to appear in GA4 (real-time is delayed)

**Issue: A/B test variants not changing**
- Solution: Clear browser cache/cookies
- Check sessionStorage for variant key
- Verify variant JavaScript is executing
- Check network tab for Optimize script loading

**Issue: Forms not submitting**
- Solution: Check Supabase connection and API keys
- Verify leads table exists in Supabase
- Check form validation logic
- Check browser console for errors

**Issue: Scroll depth events missing**
- Solution: Ensure useScrollTracking hook is mounted
- Check window.gtag is available
- Verify page height > viewport height (scrollable)
- Check scroll event listener in browser dev tools

---

## Reference Documents

- [GA4 Setup Guide](https://support.google.com/analytics/answer/9304153)
- [Google Tag Manager Setup](https://support.google.com/tagmanager/answer/6103696)
- [Google Optimize Documentation](https://support.google.com/optimize/answer/7014204)
- [VWO Setup Guide](https://help.vwo.com/hc/en-us)
- [Statistical Significance Calculator](https://www.abtestsignificance.com/)
- [SPFP Landing Page Repo](../../../)

---

**Document Status:** Ready for Week 2 Implementation
**Last Updated:** 2026-02-23
**Next Review:** Week 2 End (March 1, 2026)
