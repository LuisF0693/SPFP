# QA & Analytics Validation Checklist

**Document Version:** 1.0
**Created:** 2026-02-23
**Purpose:** Pre-launch and post-launch validation of analytics implementation and A/B testing framework
**Audience:** QA Team, Engineering, Product

---

## Pre-Launch Testing (Week 1 End - Before Production Deployment)

### Phase 1: Analytics Setup Verification

#### GA4 Configuration
- [ ] Google Analytics 4 property created in Google Cloud Console
- [ ] GA4 Measurement ID obtained (format: G-XXXXXXXX)
- [ ] Measurement ID added to `index.html` in gtag.js snippet
- [ ] Google Tag Manager (GTM) container created and linked
- [ ] GTM container ID added to `index.html`
- [ ] Data retention set to 14 months in GA4 admin
- [ ] User-ID tracking enabled (if Privacy Policy updated)
- [ ] Custom events configured in GA4 admin:
  - [ ] cta_click_* events
  - [ ] form_submit event
  - [ ] scroll_depth_* events
  - [ ] form_error events
  - [ ] ab_test_exposure events
- [ ] Conversion events marked in GA4:
  - [ ] form_submit
  - [ ] demo_request (if separate)

#### GTM Setup
- [ ] GA4 trigger configured in GTM
- [ ] CTA click trigger configured
  - [ ] Element ID/class selectors correct
  - [ ] Event parameters mapped properly
- [ ] Form submission trigger configured
  - [ ] Form element identified correctly
- [ ] Custom event triggers tested

#### Code Implementation
- [ ] gtag.js snippet added to `<head>` in `index.html`
- [ ] GA4 Service (`src/services/ga4Service.ts`) created
  - [ ] `trackCtaClick()` method implemented
  - [ ] `trackFormSubmission()` method implemented
  - [ ] `trackScrollDepth()` method implemented
  - [ ] `trackFormError()` method implemented
  - [ ] All methods have proper error handling
- [ ] Session Service (`src/services/sessionService.ts`) created
  - [ ] `getOrCreateSessionId()` works correctly
  - [ ] `getOrCreateAbTestVariant()` assigns variants with correct weights
  - [ ] Session ID persists across page reloads (sessionStorage)
  - [ ] Variant persists across page reloads (sessionStorage)
- [ ] Scroll Tracking Hook (`src/hooks/useScrollTracking.ts`) created
  - [ ] `useScrollTracking()` fires at 25%, 50%, 75%, 100%
  - [ ] Events not fired multiple times for same threshold
  - [ ] Throttling works (max 1 event per 500ms)
- [ ] All services imported in components correctly

---

### Phase 2: Event Firing Verification (Local Testing)

#### Test Environment Setup
- [ ] Dev server running: `npm run dev`
- [ ] Chrome DevTools open (F12)
- [ ] Google Analytics Debugger extension installed
- [ ] Network tab open to monitor requests
- [ ] Console tab open to check for errors

#### Page View Event
- [ ] Navigate to `/transforme`
- [ ] GA4 Debugger shows `page_view` event
- [ ] Event parameters include:
  - [ ] `page_path: '/transforme'`
  - [ ] `page_title: 'SPFP - Transforme Suas Finanças'`
  - [ ] `page_location: 'http://localhost:3000/transforme'`
- [ ] Network tab shows request to Google Analytics endpoint

#### CTA Click Events
**Hero Section - "Começar com Plataforma" Button**
- [ ] Click button
- [ ] GA4 Debugger shows `cta_click_hero_platform` event
- [ ] Event parameters include:
  - [ ] `event_category: 'engagement'`
  - [ ] `section: 'hero'`
  - [ ] `button_type: 'platform'`
  - [ ] `session_id: [valid UUID format]`
  - [ ] `timestamp: [ISO 8601 format]`
- [ ] Form modal opens after click
- [ ] LeadForm receives correct source: `'platform'`

**Hero Section - "Agendar Demo" Button**
- [ ] Click button
- [ ] GA4 Debugger shows `cta_click_hero_demo` event
- [ ] Event parameters include `button_type: 'demo'`
- [ ] Form modal opens with source: `'demo'`

**Other Sections (Pricing, Features, Footer)**
- [ ] Same verification for CTAs in other sections
- [ ] Correct `section` parameter for each CTA
- [ ] Correct `button_type` parameter

#### Form Submission Events
**Form Modal Opens**
- [ ] Click any CTA button
- [ ] GA4 Debugger shows `form_open` event
- [ ] Parameters include:
  - [ ] `form_source: [correct source from CTA]`
  - [ ] `event_category: 'engagement'`

**Form Validation Error**
- [ ] Submit form with empty name field
- [ ] Form shows validation error message
- [ ] GA4 Debugger shows `form_error` event
- [ ] Parameters include:
  - [ ] `error_field: 'name'`
  - [ ] `error_type: [required/format/length]`

**Form Submission Success**
- [ ] Fill form with valid data:
  - [ ] Name: "João Silva"
  - [ ] Email: "joao@test.com"
  - [ ] Phone: "11999999999" (optional)
- [ ] Click "Começar Agora" button
- [ ] Form shows loading spinner
- [ ] Form submission sent to Supabase
- [ ] GA4 Debugger shows `form_submit` event
- [ ] Event parameters include:
  - [ ] `form_source: [correct source]`
  - [ ] `event_category: 'conversion'`
  - [ ] `session_id: [same as other events]`
  - [ ] `timestamp: [ISO 8601 format]`
- [ ] Success message displayed
- [ ] Form modal closes after 2 seconds
- [ ] Data appears in Supabase `leads` table

#### Scroll Depth Tracking
- [ ] Refresh page `/transforme`
- [ ] GA4 Debugger cleared/reset
- [ ] Scroll page slowly, observing console
- [ ] At ~25% scroll: GA4 Debugger shows `scroll_depth_25` event
- [ ] At ~50% scroll: GA4 Debugger shows `scroll_depth_50` event
  - [ ] Parameters: `scroll_depth: 50`
- [ ] At ~75% scroll: GA4 Debugger shows `scroll_depth_75` event
- [ ] At ~100% scroll (bottom): GA4 Debugger shows `scroll_depth_100` event
- [ ] Each event fired only once (no duplicates)
- [ ] Events have correct `session_id` (consistent)

#### Session ID Consistency
- [ ] Perform multiple actions on page (scroll, click CTA, etc.)
- [ ] Check console:
  ```javascript
  sessionStorage.getItem('spfp_session_id')  // Should be same
  ```
- [ ] All GA4 events have same `session_id` parameter
- [ ] Refresh page
- [ ] New `session_id` generated
- [ ] All events after refresh use new session ID

---

### Phase 3: A/B Testing Setup Verification

#### Session Storage Verification
- [ ] Clear session storage: `sessionStorage.clear()`
- [ ] Navigate to `/transforme`
- [ ] Check session storage:
  ```javascript
  sessionStorage.getItem('ab_variant_hero_headline')  // Should be 'control', 'variant_a', or 'variant_b'
  ```
- [ ] Variant assigned randomly from {control, variant_a, variant_b}
- [ ] Refresh page
- [ ] Same variant persists (same sessionStorage key)
- [ ] Open new tab
- [ ] New variant assigned (different sessionStorage)

#### Variant Distribution Testing (50 page loads)
- [ ] Run test script to assign 50 variants:
  ```javascript
  const variants = { control: 0, variant_a: 0, variant_b: 0 };
  for (let i = 0; i < 50; i++) {
    sessionStorage.clear();
    // Simulate page load
    const v = sessionService.getOrCreateAbTestVariant('test');
    variants[v]++;
  }
  console.log(variants); // Should be roughly {control: 16-17, variant_a: 16-17, variant_b: 17-18}
  ```
- [ ] Distribution within expected ranges:
  - [ ] Control: 30-36% (~16-18 of 50)
  - [ ] Variant A: 30-36% (~16-18 of 50)
  - [ ] Variant B: 32-38% (~17-19 of 50)

#### Variant Content Display
**Control Group**
- [ ] Clear session storage and reset
- [ ] Force control: `sessionStorage.setItem('ab_variant_hero_headline', 'control')`
- [ ] Refresh page
- [ ] Hero section shows control content:
  - [ ] Headline: "Planeje suas finanças em minutos, não horas."
  - [ ] Subheading: "Com inteligência artificial que entende VOCÊ"

**Variant A**
- [ ] Force variant A: `sessionStorage.setItem('ab_variant_hero_headline', 'variant_a')`
- [ ] Refresh page
- [ ] Hero section shows variant A content:
  - [ ] Headline: "Tenha um assessor financeiro AI disponível 24/7."
  - [ ] Subheading: "Análises, recomendações e planejamento em tempo real"

**Variant B**
- [ ] Force variant B: `sessionStorage.setItem('ab_variant_hero_headline', 'variant_b')`
- [ ] Refresh page
- [ ] Hero section shows variant B content:
  - [ ] Headline: "Comece seu plano financeiro agora."
  - [ ] Subheading: "Evite 3 em cada 4 brasileiros errarem nas finanças"

#### A/B Test Events
- [ ] For Variant A users (non-control):
  - [ ] GA4 Debugger shows `ab_test_exposure` event
  - [ ] Parameters: `experiment_variant: 'variant_a'`
  - [ ] Event fires once per session (not on every action)
- [ ] CTA click events include A/B test context:
  - [ ] `ab_test_group: 'hero_headline_test'`
  - [ ] `ab_variant_hero_headline: 'variant_a'` (or variant_b)
- [ ] Form submission events include A/B test context

---

### Phase 4: Component Integration Verification

#### LeadForm Component
- [ ] Import updated: `import { ga4Service } from '@/services/ga4Service'`
- [ ] Form open tracked:
  ```typescript
  ga4Service.trackFormOpen(source);
  ```
- [ ] Form submission tracked:
  ```typescript
  ga4Service.trackFormSubmission(source, 'lead_capture');
  ```
- [ ] Form errors tracked:
  ```typescript
  ga4Service.trackFormError(source, errorField, errorType);
  ```

#### Hero Component
- [ ] Import GA4 service
- [ ] CTA click handlers call `ga4Service.trackCtaClick()`:
  ```typescript
  const handleOpenForm = (source: 'platform' | 'demo') => {
    ga4Service.trackCtaClick('hero', source === 'platform' ? 'platform' : 'demo');
    handleOpenForm(source);
  };
  ```
- [ ] Both CTA buttons have tracking

#### TransformePage Component
- [ ] Import `useScrollTracking` hook:
  ```typescript
  import { useScrollTracking } from '@/hooks/useScrollTracking';
  ```
- [ ] Call hook in component:
  ```typescript
  useScrollTracking();
  ```
- [ ] Scroll events fire when scrolling on this page

#### All Other Sections (Features, Pricing, FAQ, Testimonials, Footer)
- [ ] Any CTAs have tracking calls
- [ ] Section engagement events tracked (optional but recommended)
- [ ] No console errors when tracking events

---

### Phase 5: Browser & Device Compatibility Testing

#### Desktop Browsers
- [ ] Chrome 120+ (latest)
  - [ ] All events firing
  - [ ] No console errors
  - [ ] GA4 debugger showing events
- [ ] Firefox 121+
  - [ ] All events firing
  - [ ] No console errors
- [ ] Safari 17+ (macOS)
  - [ ] All events firing
  - [ ] sessionStorage working
- [ ] Edge 120+
  - [ ] All events firing
  - [ ] No console errors

#### Mobile Browsers
- [ ] Chrome Mobile (Android)
  - [ ] Form submits successfully
  - [ ] Events firing
  - [ ] Modal displays correctly
- [ ] Safari Mobile (iOS)
  - [ ] Form submits successfully
  - [ ] Events firing
  - [ ] sessionStorage working
- [ ] Samsung Internet (Android)
  - [ ] All events firing

#### Responsive Design
- [ ] Mobile viewport (375px width)
  - [ ] All buttons clickable
  - [ ] Form visible and usable
  - [ ] Text readable
- [ ] Tablet viewport (768px width)
  - [ ] Layout correct
  - [ ] All interactive elements work
- [ ] Desktop viewport (1024px+ width)
  - [ ] Full layout visible
  - [ ] All sections displayed

---

### Phase 6: Error Handling & Edge Cases

#### Network Issues
- [ ] Throttle network to "Slow 3G" in DevTools
- [ ] Click CTA button
- [ ] Form submits successfully (with delay)
- [ ] GA4 event eventually fires (even if delayed)
- [ ] User sees success message

#### JavaScript Errors
- [ ] Check console for any errors:
  ```
  ✓ No errors (should be clean)
  ```
- [ ] Test with ad blocker enabled
  - [ ] Form still submits
  - [ ] Page still functions (analytics may not fire, but no errors)

#### Session Expiry
- [ ] Open developer tools, go to Application tab
- [ ] Find sessionStorage
- [ ] Delete `spfp_session_id`
- [ ] Perform action (click CTA)
- [ ] New session ID generated
- [ ] Events fire with new session ID

#### Form Field Edge Cases
- [ ] Name with special characters: "José da Silva"
  - [ ] Accepted
  - [ ] Submitted successfully
- [ ] Email with plus sign: "user+test@example.com"
  - [ ] Accepted
  - [ ] Submitted successfully
- [ ] Very long name (100+ characters)
  - [ ] Validation error shown ("Nome muito longo")
- [ ] Invalid email format: "notanemail"
  - [ ] Validation error shown
  - [ ] form_error event fires
- [ ] Phone with letters: "abc1234567"
  - [ ] Validation error shown
  - [ ] Only digits accepted

---

### Phase 7: Performance Verification

#### Page Load Time
- [ ] Analytics script (`gtag.js`) loads without blocking page render
- [ ] Page interactive time < 3s (3G throttled)
- [ ] Largest Contentful Paint (LCP) < 2.5s
- [ ] Cumulative Layout Shift (CLS) < 0.1

#### Event Firing Performance
- [ ] Form submission doesn't block on analytics event
- [ ] Scroll events don't cause jank (60 FPS)
- [ ] Modal opens immediately (<200ms) after CTA click

#### Memory Usage
- [ ] No memory leaks after 5 minutes of interactions
- [ ] SessionStorage keys <1MB total
- [ ] No excessive event listeners accumulating

---

## Post-Launch Verification (First 24 Hours)

### Hour 1 Checks (Immediate)

#### Real-Time Dashboard
- [ ] GA4 Real-time dashboard accessible
- [ ] Traffic appearing (target: 50+ pageviews/hour)
- [ ] Events showing in real-time:
  - [ ] page_view
  - [ ] cta_click_* events
  - [ ] form_submit events
- [ ] No error spikes
- [ ] Measurement ID correctly configured

#### Infrastructure
- [ ] Page loads successfully
- [ ] No 5xx errors in logs
- [ ] Database (Supabase) responding normally
- [ ] Leads table receiving inserts

#### Form Functionality
- [ ] Form submissions completing
- [ ] Data appearing in Supabase `leads` table
- [ ] No duplicate entries
- [ ] Email field valid (correct format)

---

### Hour 4 Checks

#### Conversion Funnel
- [ ] Minimum 10 form submissions recorded
- [ ] Conversion funnel building:
  - [ ] Stage 1: Page views (100)
  - [ ] Stage 2: Scroll 50% (~70)
  - [ ] Stage 3: CTA clicks (~30)
  - [ ] Stage 4: Form opens (~25)
  - [ ] Stage 5: Conversions (≥10)
- [ ] Drop-off rates normal (no unexpected cliff)

#### A/B Test Distribution
- [ ] Variants distributed roughly equally:
  - [ ] Control: ~33% of users
  - [ ] Variant A: ~33% of users
  - [ ] Variant B: ~34% of users
- [ ] Variant split verified across multiple time windows

#### Error Monitoring
- [ ] Analytics error rate < 1%
- [ ] No spike in form_error events
- [ ] No critical console errors
- [ ] No Supabase connection errors

---

### Hour 12 Checks

#### Sample Size Progress
- [ ] Minimum 500 pageviews reached
- [ ] Minimum 50-75 leads captured
- [ ] Conversion rate in expected range (10-20%, target 15%)
- [ ] No sudden drop in conversion rate

#### A/B Test Health
- [ ] Each variant has 150+ users:
  - [ ] Control: ~150+ users
  - [ ] Variant A: ~150+ users
  - [ ] Variant B: ~150+ users
- [ ] Conversion rates similar across variants (no clear winner yet)
  - [ ] Difference < 10% (expected due to sample size)

#### Data Quality
- [ ] Session IDs unique per session
- [ ] No duplicate events in GA4
- [ ] Form data clean (no test submissions visible)
- [ ] Geographic distribution reasonable

---

### Day 1 (24 Hours) Full Checks

#### Conversion Metrics
- [ ] Total pageviews: 500-1000+
- [ ] Total leads: 75-150+
- [ ] Conversion rate: 10-20% (target 15%)
- [ ] Bounce rate: <20%
- [ ] Average session duration: 2-3 minutes

#### A/B Test Readiness
- [ ] Sample size per variant: 150-250+ users each
- [ ] Confidence level: TBD (need 5-7 days for 95%)
- [ ] No clear winner yet (expected)
- [ ] All variants statistically similar in performance

#### Error & Quality Checks
- [ ] No form submission errors
- [ ] No analytics tracking errors
- [ ] All leads data valid in Supabase
- [ ] No security issues detected
- [ ] Cost per lead within budget range

#### User Experience Verification
- [ ] Form modal displays correctly
- [ ] Success message clear and helpful
- [ ] Error messages helpful and actionable
- [ ] Mobile UX acceptable
- [ ] Page performance acceptable

---

### Ongoing Monitoring (Week 1+)

#### Daily Checks
- [ ] [ ] GA4 Real-time dashboard green (no error spikes)
- [ ] [ ] Conversion rate stable (within ±2% of baseline)
- [ ] [ ] No major technical issues reported by users
- [ ] [ ] Form submissions processing normally
- [ ] [ ] A/B test distribution balanced

#### Weekly Checks
- [ ] [ ] Generate weekly analytics report
- [ ] [ ] Review A/B test progress toward statistical significance
- [ ] [ ] Identify any anomalies in user behavior
- [ ] [ ] Check cost per lead is within budget
- [ ] [ ] Plan optimizations for Week 2

#### Metrics to Monitor
| Metric | Baseline | Min Alert | Max Alert |
|--------|----------|-----------|-----------|
| Daily Pageviews | 500-1000 | <250 | >3000 |
| Conversion Rate | 15% | <7% | N/A |
| Bounce Rate | <20% | N/A | >40% |
| Avg Session Duration | 2-3 min | <1 min | N/A |
| Form Error Rate | <5% | N/A | >10% |
| Cost Per Lead | TBD | TBD | +50% |

---

## Troubleshooting Guide

### GA4 Events Not Appearing

**Symptom:** No events visible in GA4 Real-time dashboard
**Diagnosis Steps:**
1. Check if gtag.js snippet in `index.html`:
   ```html
   <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXX"></script>
   ```
2. Check if Measurement ID correct (G-XXXXXXXX format)
3. Open DevTools Console, look for errors
4. Check Network tab → filter by "google-analytics"
5. Should see requests to `https://www.google-analytics.com/...`

**Solutions:**
- [ ] Verify GA4 Measurement ID in `index.html`
- [ ] Verify gtag.js snippet before other scripts
- [ ] Check for Content Security Policy (CSP) blocking GA
- [ ] Wait 24 hours for historical data (real-time is delayed)
- [ ] Check GA4 property is active (not in demo mode)

### Scroll Events Not Firing

**Symptom:** scroll_depth_* events missing in GA4
**Diagnosis Steps:**
1. Check if `useScrollTracking` hook imported in TransformePage
2. Verify page is scrollable (height > viewport height)
3. Check console for scroll tracking debug logs
4. In DevTools: monitor scroll events firing

**Solutions:**
- [ ] Ensure page content > viewport height
- [ ] Verify TransformePage includes `useScrollTracking()` call
- [ ] Check console for errors in scroll listener
- [ ] Verify window.gtag available when tracking

### Form Submission Not Saving to Supabase

**Symptom:** Form submits but data not in Supabase `leads` table
**Diagnosis Steps:**
1. Check Supabase table exists: `leads` table
2. Check API key in environment variables
3. Check browser console for API errors
4. Check Supabase dashboard for insert errors
5. Check column names match (name, email, phone, source, created_at)

**Solutions:**
- [ ] Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local`
- [ ] Verify `leads` table structure matches LeadForm expectations
- [ ] Check RLS (Row-Level Security) policies on `leads` table (should allow inserts)
- [ ] Check for Supabase service errors/outages
- [ ] Test with direct Supabase client call

### A/B Variant Not Changing

**Symptom:** Always see same variant (e.g., always "control")
**Diagnosis Steps:**
1. Check sessionStorage: `sessionStorage.getItem('ab_variant_hero_headline')`
2. Check if sessionService.getOrCreateAbTestVariant() called
3. Clear sessionStorage and reload
4. Check browser console for variant assignment debug log

**Solutions:**
- [ ] Clear sessionStorage: `sessionStorage.clear()`
- [ ] Reload page: `location.reload()`
- [ ] Force variant for testing: `sessionStorage.setItem('ab_variant_hero_headline', 'variant_a')`
- [ ] Check Hero component receives correct variant
- [ ] Verify Hero component actually uses the variant

### Session ID Changes on Every Page View

**Symptom:** Session ID different for every event (not persistent)
**Diagnosis Steps:**
1. Check if sessionStorage preserved across navigation
2. Check if sessionStorage being cleared somewhere
3. Verify no privacy mode/incognito blocking sessionStorage
4. Check for error in getOrCreateSessionId()

**Solutions:**
- [ ] Not using incognito/private browsing mode
- [ ] Check no code is calling `sessionStorage.clear()`
- [ ] Verify sessionStorage accessible: try `sessionStorage.setItem('test', 'value')`
- [ ] Check browser privacy settings allow sessionStorage

### Form Shows Error But Doesn't Track

**Symptom:** Form validation error shown but GA4 event not firing
**Diagnosis Steps:**
1. Check if ga4Service.trackFormError() called in validation handler
2. Check if window.gtag available when error occurs
3. Check console for errors in tracking code

**Solutions:**
- [ ] Verify LeadForm imports ga4Service
- [ ] Verify trackFormError() called before error display
- [ ] Check for JavaScript errors preventing event firing
- [ ] Verify window.gtag is defined (may be blocked by adblocker)

---

## Sign-Off Checklist

**Pre-Launch Sign-Off (Week 1 End)**

- [ ] All Phase 1-7 checks passed
- [ ] No critical bugs found
- [ ] Performance acceptable (<3s load time)
- [ ] Mobile UX verified
- [ ] Error handling tested
- [ ] Ready for production deployment

**Post-Launch Sign-Off (24 Hours)**

- [ ] All Hour 1-24 checks passed
- [ ] Minimum metrics achieved:
  - [ ] 500+ pageviews
  - [ ] 75+ leads
  - [ ] 15% conversion rate
- [ ] No critical errors in production
- [ ] A/B tests running smoothly
- [ ] Data quality verified
- [ ] Ready for Week 2 optimization

**QA Team Sign-Off:**

- [ ] **QA Lead:** _________________________ **Date:** _________
- [ ] **Product Manager:** ______________ **Date:** _________
- [ ] **Engineering Lead:** __________ **Date:** _________

---

**Document Status:** Ready for Use
**Last Updated:** 2026-02-23
