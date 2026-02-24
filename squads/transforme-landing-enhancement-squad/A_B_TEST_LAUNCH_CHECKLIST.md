# A/B Test Launch Checklist - Hero Copy Variations

**Project:** Transforme Landing Enhancement Squad
**Campaign:** Hero Copy Optimization
**Created:** 2026-02-23
**Owner:** Kai (Copywriter)
**Status:** READY FOR IMPLEMENTATION

---

## Pre-Launch Checklist (Complete Before Day 1)

### Copy & Messaging
- [ ] All 3 hero variations approved by stakeholders
- [ ] Copy tested for typos and grammar (Portuguese)
- [ ] CTA copy finalized and approved
- [ ] Alternative headline options documented for follow-up tests
- [ ] Supporting text verified for accuracy (10k+ users, ROI claims, etc.)
- [ ] Objection handlers reviewed (trust, friction, value concerns)

### Design & Figma
- [ ] All 3 variations designed in Figma (desktop, tablet, mobile)
- [ ] Color palette matches brand guidelines
- [ ] Button states defined (rest, hover, active, disabled, focus)
- [ ] Typography scales correctly across breakpoints
- [ ] Accessibility contrast verified (WCAG AA minimum)
- [ ] Icons and visual assets exported
- [ ] Responsive variants tested at all breakpoints
- [ ] Animation timing documented (0.2s transitions)

### Development & HTML
- [ ] HTML/CSS templates created from Figma specs
- [ ] Responsive classes working across breakpoints
- [ ] Button interactions coded (hover states, animations)
- [ ] Analytics tracking implemented (Google Analytics 4)
- [ ] UTM parameters configured in links
- [ ] Mobile optimization verified
- [ ] Form submission tracking set up
- [ ] Performance tested (Lighthouse 90+)

### Analytics & Tracking
- [ ] Google Analytics goals configured:
  - [ ] Goal: "hero_cta_click" (event)
  - [ ] Goal: "form_submitted" (conversion)
  - [ ] Goal: "secondary_cta_click" (event)
- [ ] Hotjar heatmaps enabled for all variants
- [ ] Event tracking implemented:
  - [ ] `event: "hero_variant_view"` (tracks variant exposure)
  - [ ] `event: "hero_primary_cta_click"` (tracks primary button)
  - [ ] `event: "hero_secondary_cta_click"` (tracks secondary button)
  - [ ] `event: "form_submitted"` (tracks conversion)
- [ ] Attribution model configured (first-touch, last-touch)
- [ ] Baseline metrics recorded (pre-test benchmarks)
- [ ] Segment configuration (mobile vs desktop, new vs returning)

### Testing Tool Setup
- [ ] A/B testing tool selected (Google Optimize, VWO, Optimizely, etc.)
- [ ] Test variants created in platform
- [ ] Traffic allocation configured:
  - [ ] Option 1: 33/33/33 (balanced test)
  - [ ] Option 2: 20/40/40 (recommended - validates frontrunner)
- [ ] Test duration set (14-21 days recommended)
- [ ] Sample size calculated (1,000+ per variant minimum)
- [ ] Statistical significance threshold set (p < 0.05)
- [ ] Early stopping rules defined (clear winner at 99% confidence)

### QA & Testing
- [ ] All copy variants load correctly
- [ ] All links and CTAs function properly
- [ ] Forms submit successfully
- [ ] Analytics events fire correctly (check browser console)
- [ ] Mobile experience tested on real devices
- [ ] Desktop experience tested on multiple browsers
- [ ] Load time verified (< 3 seconds)
- [ ] No console errors or warnings
- [ ] Accessibility audit passed (axe, WAVE)
- [ ] PDF export of variants created for stakeholders

### Team Communication
- [ ] Design team notified of test launch date
- [ ] Marketing team aligned on messaging
- [ ] Product team aware of tracking changes
- [ ] Customer support notified of variants (in case inquiries)
- [ ] Analytics team briefed on tracking setup
- [ ] DevOps/Engineering notified of deployment
- [ ] Stakeholder sign-off received
- [ ] Test calendar blocked (14-21 day period)

### Documentation
- [ ] HERO_COPY_VARIATIONS.md completed
- [ ] FIGMA_HERO_SPECS.md completed
- [ ] HERO_HTML_TEMPLATES.html finalized
- [ ] This checklist completed
- [ ] Shared with all stakeholders
- [ ] Archived in project documentation folder

---

## Launch Day (Day 1)

### Pre-Deployment Verification
- [ ] All code merged to main branch
- [ ] All changes deployed to production
- [ ] Test variants live and visible
- [ ] Traffic distribution verified (check analytics)
- [ ] Form submissions tracked correctly
- [ ] Team notified that test is live

### Day 1 QA
- [ ] Visit landing page at least 5 times
- [ ] Verify all 3 variants display correctly
- [ ] Test form submission on each variant
- [ ] Verify analytics events fire (Google Analytics real-time)
- [ ] Check Hotjar heatmaps initializing
- [ ] Monitor for any critical errors
- [ ] Check that traffic is being split correctly

### Documentation
- [ ] Test launch time recorded
- [ ] Day 1 status email sent to stakeholders
- [ ] Baseline metrics confirmed in analytics
- [ ] Any issues logged and resolved

---

## During Test (Weekly Monitoring)

### Weekly Metrics Review (Every Monday)

**Metrics to Check:**
- [ ] Conversion rate (form submissions)
- [ ] CTA click-through rate
- [ ] Video view completion %
- [ ] Scroll depth
- [ ] Bounce rate (should not increase)
- [ ] Average session duration
- [ ] Traffic distribution (still 40/40/20 or 33/33/33)
- [ ] Sample size progress (on track for 1,000+ per variant)

**Checks:**
- [ ] No variant is underperforming baseline by >15%
- [ ] Sample sizes are balanced across variants
- [ ] No technical issues with tracking
- [ ] No significant external factors affecting traffic

### Weekly Communication
- [ ] Stakeholder update sent (metrics, observations)
- [ ] Early trends noted (if clear winner emerging)
- [ ] Any technical issues documented and resolved
- [ ] Team morale checked (no one manipulating test)

### Monitoring for Anomalies
- [ ] Sudden traffic drop (check Google status, social trends)
- [ ] Unusually high/low conversion (check form validation)
- [ ] Uneven traffic distribution (check test config)
- [ ] Analytics event tracking issues (check implementation)
- [ ] Bot/spam detection (use Google Analytics filters)

### Stopping Early?
- [ ] Only stop if clear winner at p < 0.01 confidence
- [ ] Or if technical issue requires pause
- [ ] Document decision and reason
- [ ] Do NOT stop at p < 0.05 (insufficient confidence at week 1)

---

## Test Completion (Day 21+)

### Final Analysis

**Metrics to Calculate:**
- [ ] Final conversion rate by variant
- [ ] Confidence intervals (95% CI)
- [ ] P-value (statistical significance)
- [ ] Effect size (lift %)
- [ ] Confidence level (90%, 95%, 99%)
- [ ] Revenue impact (CVR × LTV × monthly traffic)

**Declare Winner When:**
- [ ] p-value < 0.05 (95% confidence minimum)
- [ ] Preferred: p-value < 0.01 (99% confidence)
- [ ] Sample size ≥ 1,000 per variant
- [ ] Test duration ≥ 14 days (account for weekly variance)

### Statistical Validation
- [ ] Winner clearly identified
- [ ] Confidence level documented
- [ ] Effect size calculated
- [ ] Runner-up analyzed (why it underperformed)
- [ ] Control baseline validated

### Qualitative Feedback
- [ ] User feedback collected (surveys, support tickets)
- [ ] Social media sentiment analyzed
- [ ] Designer/copywriter observations noted
- [ ] Customer support anecdotes collected
- [ ] Psychological insights documented

### Winner Analysis

**If Variation B Wins (Expected):**
- [ ] Document: Why transformation messaging resonated
- [ ] Note: Emotional vs analytical personas perform differently
- [ ] Plan: Next test on CTA copy variations
- [ ] Lock in: Use "Começar Minha Transformação" as primary CTA
- [ ] Follow-up: Test secondary CTA variants

**If Variation C Wins (Investor/Premium Segment):**
- [ ] Document: Why outcome-first messaging worked
- [ ] Note: Analytical users prefer data-driven copy
- [ ] Plan: Create variant combining B + C (transformation + ROI)
- [ ] Segment: Consider different messaging for different personas
- [ ] Follow-up: Test for high-net-worth segment specifically

**If Variation A Wins (Unlikely):**
- [ ] Document: Why problem-first messaging worked
- [ ] Investigate: Possible market shift or external factors
- [ ] Validate: Double-check statistical significance
- [ ] Plan: Rerun test with larger sample size
- [ ] Analyze: Was it the headline or CTA?

---

## Post-Test Implementation

### Deploy Winner
- [ ] Winner copy implemented on production
- [ ] Remove losing variations from code
- [ ] Update all related pages with winning messaging
- [ ] Update email templates with winning copy
- [ ] Update ad copy if using similar messaging
- [ ] Announce winner to stakeholders

### Next Test Planning
- [ ] Schedule follow-up test (2-4 weeks after winner deployment)
- [ ] Plan: CTA copy variations (within winning headline)
- [ ] Test: Secondary CTA copy options
- [ ] Test: Subheading variants
- [ ] Test: Supporting text reordering
- [ ] Test: Button colors/styles
- [ ] Create prioritized test roadmap

### Knowledge Base Update
- [ ] Document winner and why it worked
- [ ] Add to copy guidelines for future campaigns
- [ ] Create case study (internal knowledge base)
- [ ] Update messaging framework with learnings
- [ ] Share insights with team (copywriting, design, product)

### Archive & Documentation
- [ ] Final test report created (PDF for stakeholders)
- [ ] All data exported and archived
- [ ] Test configuration backed up
- [ ] Analytics segments preserved
- [ ] Hotjar recordings archived
- [ ] Full documentation saved to project folder

---

## Success Metrics

### Conversion Rate Targets
| Variation | Target | Success |
|-----------|--------|---------|
| Variation A (Control) | 2.5% | Baseline |
| Variation B (Frontrunner) | 4.0%+ | 60%+ lift |
| Variation C (Outcome) | 3.2%+ | 28%+ lift |

### Test Success Criteria
- [ ] **Primary metric:** Conversion rate increases ≥15%
- [ ] **Statistical power:** 95%+ confidence level
- [ ] **Sample adequacy:** 1,000+ visitors per variant
- [ ] **Duration:** Minimum 14 days (ideally 21 days)
- [ ] **Technical:** Zero tracking errors, clean data
- [ ] **External validity:** No major external disruptions

### Revenue Impact Targets
- [ ] **If B wins:** +$267,500 monthly revenue (at 10k hero visits)
- [ ] **If C wins:** +$139,500 monthly revenue
- [ ] **Minimum acceptable lift:** +$100,000 monthly

---

## Key Contacts & Escalation

### Critical Issues - Immediate Escalation
**Issue:** Technical error in tracking or test configuration
- **Contact:** Engineering Lead + Analytics Lead
- **Action:** Pause test immediately, investigate
- **Timeline:** Resolve within 24 hours

**Issue:** Variant performing far worse than expected (>30% drop)
- **Contact:** Product Lead + Marketing Lead
- **Action:** Investigate for external factors, consider pause
- **Timeline:** Decision within 48 hours

**Issue:** Unexpected surge in traffic or bots
- **Contact:** DevOps + Security
- **Action:** Filter out spam traffic, validate data
- **Timeline:** Resolution within 12 hours

### Regular Communication
- **Stakeholder Updates:** Every Monday during test
- **Weekly Metrics:** Mondays before 10 AM
- **Final Report:** Within 3 days of test completion

---

## Document Links

**Core Documentation:**
- [HERO_COPY_VARIATIONS.md](./HERO_COPY_VARIATIONS.md) - Full copy frameworks & psychology
- [FIGMA_HERO_SPECS.md](./FIGMA_HERO_SPECS.md) - Design specifications
- [HERO_HTML_TEMPLATES.html](./HERO_HTML_TEMPLATES.html) - HTML implementation
- [MESSAGING.md](./MESSAGING.md) - Overall messaging strategy

**Related Documents:**
- [LANDING_PAGE_SETUP.md](./LANDING_PAGE_SETUP.md) - Technical setup
- [TESTING_LEAD_FORMS.md](./TESTING_LEAD_FORMS.md) - Form tracking
- [LEADS_SETUP.md](../docs/LEADS_SETUP.md) - Lead database

---

## Sign-Off

**Copywriter:** Kai
- [ ] Copy variations approved
- [ ] Messaging psychology validated
- [ ] Alternative options documented

**Design Lead:** [Name]
- [ ] Figma designs completed
- [ ] Responsive variants tested
- [ ] Accessibility verified

**Engineering Lead:** [Name]
- [ ] HTML/CSS implementation complete
- [ ] Analytics tracking verified
- [ ] Performance tested

**Analytics Lead:** [Name]
- [ ] Tracking configuration approved
- [ ] Goals and events configured
- [ ] Statistical setup validated

**Product Lead:** [Name]
- [ ] Test plan approved
- [ ] Success metrics aligned
- [ ] Launch date confirmed

**Marketing Lead:** [Name]
- [ ] Traffic strategy aligned
- [ ] Communication plan ready
- [ ] Stakeholder notification approved

---

## Test Timeline Summary

| Phase | Duration | Owner | Deliverable |
|-------|----------|-------|-------------|
| **Planning** | 3-5 days | Kai, Design | Copy & Figma specs |
| **Development** | 5-7 days | Engineering | HTML & Analytics |
| **QA Testing** | 2-3 days | QA Team | Approval & sign-off |
| **Launch** | Day 1 | All | Live test |
| **Monitoring** | 14-21 days | Analytics | Weekly reports |
| **Analysis** | 3-5 days | Kai, Analytics | Final report |
| **Implementation** | 2-3 days | Engineering | Deploy winner |

**Total Timeline:** 4-5 weeks from planning to winner deployment

---

## Quick Launch Reminders

✅ **DO:**
- Launch with Variation B (Transformation) as frontrunner
- Test for full 21 days minimum (avoid weekly variance)
- Monitor daily first week (watch for anomalies)
- Document all decisions in test summary
- Keep stakeholders informed weekly
- Archive all data post-test

❌ **DON'T:**
- Stop test early (p < 0.05 after 1 week is not enough)
- Allow manual traffic manipulation (keep test pure)
- Share real-time results in public channels (prevents bias)
- Change copy during test (invalidates results)
- Make decisions on secondary metrics only (focus on conversion)
- Forget to check for bot/spam traffic

---

**Document Status:** APPROVED FOR IMPLEMENTATION
**Last Updated:** 2026-02-23
**Owner:** Kai (Copywriter), Transforme Landing Enhancement Squad

---

*This checklist is comprehensive. Print and post in team workspace. Reference daily during test.*
