/**
 * Google Analytics 4 (GA4) Service
 *
 * Centralizes all GA4 event tracking for the SPFP landing page.
 * Provides typed event methods with proper parameter structure.
 *
 * Usage:
 *   import { ga4Service } from '@/services/ga4Service';
 *
 *   // Track CTA click
 *   ga4Service.trackCtaClick('hero', 'platform', 'hero_section');
 *
 *   // Track form submission
 *   ga4Service.trackFormSubmission('lead_capture', 'demo_request', 'hero');
 *
 *   // Track scroll depth
 *   ga4Service.trackScrollDepth(50);
 */

import { getOrCreateSessionId, getOrCreateAbTestVariant } from './sessionService';

// Declare gtag on window
declare global {
  interface Window {
    gtag: (
      command: string,
      eventName: string,
      eventData?: Record<string, any>
    ) => void;
    dataLayer: Record<string, any>[];
  }
}

type EventCategory = 'engagement' | 'conversion' | 'error' | 'form' | 'experiment';
type CtaSource = 'hero' | 'features' | 'pricing' | 'testimonials' | 'faq' | 'footer';
type FormSource = 'landing_page' | 'demo_request' | 'pricing';

interface GA4EventParams {
  event_category: EventCategory;
  event_label: string;
  page_path?: string;
  page_title?: string;
  section?: string;
  event_value?: number;
  timestamp?: string;
  session_id?: string;
  user_id?: string;
  experiment_id?: string;
  experiment_variant?: string;
  ab_test_group?: string;
  [key: string]: any;
}

/**
 * GA4 Service - Centralized event tracking
 */
export const ga4Service = {
  /**
   * Initialize GA4 tracking
   * Should be called once on app load
   */
  init: () => {
    if (!window.gtag) {
      console.warn('GA4 (gtag) not available. Analytics tracking disabled.');
    }
  },

  /**
   * Track page view
   * Usually handled automatically by GA4, but can be called for custom pages
   */
  trackPageView: (pageTitle?: string) => {
    if (!window.gtag) return;

    window.gtag('event', 'page_view', {
      page_path: window.location.pathname,
      page_title: pageTitle || document.title,
      page_location: window.location.href,
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Track CTA button clicks
   * @param section - Which section the CTA is in (hero, pricing, etc.)
   * @param ctaType - Type of CTA (platform, demo, etc.)
   * @param buttonPosition - Position description (first_button, second_button, etc.)
   */
  trackCtaClick: (
    section: CtaSource,
    ctaType: 'platform' | 'demo' | 'pricing' | 'feature',
    buttonPosition?: string
  ) => {
    if (!window.gtag) return;

    const eventName = `cta_click_${section}_${ctaType}`;
    const params: GA4EventParams = {
      event_category: 'engagement',
      event_label: `CTA Click - ${section.charAt(0).toUpperCase() + section.slice(1)} - ${ctaType}`,
      section: section,
      button_type: ctaType,
      button_position: buttonPosition || 'unknown',
      page_path: window.location.pathname,
      timestamp: new Date().toISOString(),
      session_id: getOrCreateSessionId(),
    };

    // Add A/B test context if applicable
    const abVariant = getOrCreateAbTestVariant('hero_headline');
    if (abVariant !== 'control') {
      params.experiment_variant = abVariant;
      params.ab_test_group = 'hero_headline_test';
    }

    window.gtag('event', eventName, params);
  },

  /**
   * Track form modal opening
   * @param source - Where the form was opened from
   */
  trackFormOpen: (source: FormSource) => {
    if (!window.gtag) return;

    window.gtag('event', 'form_open', {
      event_category: 'engagement',
      event_label: `Form Opened - ${source}`,
      form_id: `lead_form_${source}`,
      form_source: source,
      page_path: window.location.pathname,
      timestamp: new Date().toISOString(),
      session_id: getOrCreateSessionId(),
    });
  },

  /**
   * Track form submission (successful)
   * @param source - Where the form came from (landing_page, demo_request, pricing)
   * @param formType - Type of form submission
   */
  trackFormSubmission: (source: FormSource, formType: string) => {
    if (!window.gtag) return;

    const params: GA4EventParams = {
      event_category: 'conversion',
      event_label: `Lead Form Submission - ${source}`,
      form_id: `lead_form_${source}`,
      form_source: source,
      form_type: formType,
      page_path: window.location.pathname,
      timestamp: new Date().toISOString(),
      session_id: getOrCreateSessionId(),
    };

    // Add A/B test context
    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith('ab_variant_')) {
        const testName = key.replace('ab_variant_', '');
        const variant = sessionStorage.getItem(key);
        if (variant) {
          params[`ab_variant_${testName}`] = variant;
        }
      }
    });

    window.gtag('event', 'form_submit', params);
  },

  /**
   * Track form validation errors
   * @param source - Form source
   * @param errorField - Field that had error
   * @param errorType - Type of validation error
   */
  trackFormError: (
    source: FormSource,
    errorField: string,
    errorType: 'required' | 'format' | 'length'
  ) => {
    if (!window.gtag) return;

    window.gtag('event', 'form_error', {
      event_category: 'form',
      event_label: `Form Error - ${errorField} (${errorType})`,
      form_id: `lead_form_${source}`,
      form_source: source,
      error_field: errorField,
      error_type: errorType,
      page_path: window.location.pathname,
      timestamp: new Date().toISOString(),
      session_id: getOrCreateSessionId(),
    });
  },

  /**
   * Track form abandonment
   * @param source - Form source
   * @param timeOnFormMs - Time spent in form before closing
   */
  trackFormAbandon: (source: FormSource, timeOnFormMs: number) => {
    if (!window.gtag) return;

    window.gtag('event', 'form_abandon', {
      event_category: 'engagement',
      event_label: `Form Abandoned - ${source}`,
      form_id: `lead_form_${source}`,
      form_source: source,
      time_on_form_ms: timeOnFormMs,
      page_path: window.location.pathname,
      timestamp: new Date().toISOString(),
      session_id: getOrCreateSessionId(),
    });
  },

  /**
   * Track scroll depth
   * @param depthPercent - Percentage of page scrolled (25, 50, 75, 100)
   */
  trackScrollDepth: (depthPercent: number) => {
    if (!window.gtag) return;

    const eventName = `scroll_depth_${depthPercent}`;
    const params: GA4EventParams = {
      event_category: 'engagement',
      event_label: `Scrolled to ${depthPercent}%`,
      scroll_depth: depthPercent,
      page_path: window.location.pathname,
      timestamp: new Date().toISOString(),
      session_id: getOrCreateSessionId(),
    };

    // Add A/B test variants
    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith('ab_variant_')) {
        const testName = key.replace('ab_variant_', '');
        const variant = sessionStorage.getItem(key);
        if (variant && variant !== 'control') {
          params[`ab_variant_${testName}`] = variant;
        }
      }
    });

    window.gtag('event', eventName, params);
  },

  /**
   * Track section visibility/engagement
   * @param sectionName - Name of the section
   * @param action - View, hover, interact, etc.
   */
  trackSectionEngagement: (
    sectionName: string,
    action: 'view' | 'hover' | 'interact' | 'click'
  ) => {
    if (!window.gtag) return;

    window.gtag('event', 'section_engagement', {
      event_category: 'engagement',
      event_label: `Section ${action.charAt(0).toUpperCase() + action.slice(1)} - ${sectionName}`,
      section: sectionName,
      interaction_type: action,
      page_path: window.location.pathname,
      timestamp: new Date().toISOString(),
      session_id: getOrCreateSessionId(),
    });
  },

  /**
   * Track FAQ interaction
   * @param faqIndex - Index of FAQ item
   * @param action - expand or collapse
   */
  trackFaqInteraction: (
    faqIndex: number,
    action: 'expand' | 'collapse'
  ) => {
    if (!window.gtag) return;

    window.gtag('event', 'faq_interaction', {
      event_category: 'engagement',
      event_label: `FAQ ${action.charAt(0).toUpperCase() + action.slice(1)} - Item ${faqIndex}`,
      section: 'faq',
      faq_item_index: faqIndex,
      interaction_type: action,
      page_path: window.location.pathname,
      timestamp: new Date().toISOString(),
      session_id: getOrCreateSessionId(),
    });
  },

  /**
   * Track testimonial view
   * @param testimonialIndex - Index of testimonial in carousel
   */
  trackTestimonialView: (testimonialIndex: number) => {
    if (!window.gtag) return;

    window.gtag('event', 'testimonial_view', {
      event_category: 'engagement',
      event_label: `Testimonial Viewed - #${testimonialIndex}`,
      section: 'testimonials',
      testimonial_index: testimonialIndex,
      page_path: window.location.pathname,
      timestamp: new Date().toISOString(),
      session_id: getOrCreateSessionId(),
    });
  },

  /**
   * Track video play
   * @param videoName - Name or ID of video
   */
  trackVideoPlay: (videoName: string) => {
    if (!window.gtag) return;

    window.gtag('event', 'video_play', {
      event_category: 'engagement',
      event_label: `Video Play - ${videoName}`,
      video_name: videoName,
      page_path: window.location.pathname,
      timestamp: new Date().toISOString(),
      session_id: getOrCreateSessionId(),
    });
  },

  /**
   * Track A/B test exposure
   * @param testName - Name of the test
   * @param variant - Variant shown to user
   */
  trackAbTestExposure: (testName: string, variant: string) => {
    if (!window.gtag || variant === 'control') return;

    window.gtag('event', 'ab_test_exposure', {
      event_category: 'experiment',
      event_label: `A/B Test - ${testName}`,
      experiment_id: testName,
      experiment_variant: variant,
      ab_test_group: testName,
      page_path: window.location.pathname,
      timestamp: new Date().toISOString(),
      session_id: getOrCreateSessionId(),
    });
  },

  /**
   * Track custom event
   * @param eventName - Custom event name
   * @param params - Event parameters
   */
  trackCustomEvent: (eventName: string, params: Record<string, any>) => {
    if (!window.gtag) return;

    // Add defaults if not provided
    const finalParams = {
      page_path: window.location.pathname,
      timestamp: new Date().toISOString(),
      session_id: getOrCreateSessionId(),
      ...params,
    };

    window.gtag('event', eventName, finalParams);
  },

  /**
   * Track page performance metrics
   * @param metricName - Metric name (e.g., 'largest_contentful_paint')
   * @param value - Metric value in milliseconds
   */
  trackPerformanceMetric: (metricName: string, value: number) => {
    if (!window.gtag) return;

    window.gtag('event', 'page_performance', {
      event_category: 'performance',
      event_label: metricName,
      metric_name: metricName,
      metric_value: value,
      page_path: window.location.pathname,
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Set user properties
   * @param properties - Object of property key-value pairs
   */
  setUserProperties: (properties: Record<string, string | number>) => {
    if (!window.gtag) return;

    window.gtag('set', 'user_properties', properties);
  },

  /**
   * Get current session ID
   */
  getSessionId: (): string => {
    return getOrCreateSessionId();
  },

  /**
   * Get current A/B test variant for given test
   */
  getAbVariant: (testName: string): string => {
    return getOrCreateAbTestVariant(testName);
  },
};

export default ga4Service;
