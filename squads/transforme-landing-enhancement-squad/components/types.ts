/**
 * Type definitions for landing page components
 * Provides comprehensive type safety for hero, features, and pricing sections
 */

/**
 * Analytics event types for tracking user interactions
 */
export type AnalyticsEventType =
  | 'cta_click'
  | 'form_open'
  | 'form_submit'
  | 'feature_click'
  | 'pricing_plan_click'
  | 'pricing_toggle'
  | 'demo_request'
  | 'scroll_depth'
  | 'session_start';

/**
 * Analytics event payload structure
 */
export interface AnalyticsEvent {
  event: AnalyticsEventType;
  label?: string;
  value?: string | number;
  metadata?: Record<string, unknown>;
  timestamp?: number;
  userId?: string;
  sessionId?: string;
  abVariant?: string;
}

/**
 * A/B test variant configuration
 */
export type ABTestVariant = 'control' | 'variant_a' | 'variant_b';

/**
 * A/B test context
 */
export interface ABTestContext {
  variant: ABTestVariant;
  isEnabled: boolean;
  trackingId?: string;
}

/**
 * Form source for tracking where form was opened
 */
export type FormSource = 'platform' | 'demo' | 'pricing' | 'feature';

/**
 * Form state
 */
export interface FormState {
  isOpen: boolean;
  source: FormSource;
  isLoading?: boolean;
  error?: string;
}

/**
 * Feature item structure
 */
export interface Feature {
  id: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
  benefit: string;
}

/**
 * Pricing plan structure
 */
export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  badge?: string;
  subtitle: string;
  description: string;
  features: PricingFeature[];
  cta: {
    text: string;
    variant: 'primary' | 'secondary';
  };
  roi: string;
  billingCycle?: 'monthly' | 'annual';
}

/**
 * Pricing feature structure
 */
export interface PricingFeature {
  title: string;
  benefit?: string;
}

/**
 * CTA button state
 */
export type CTAButtonState = 'idle' | 'loading' | 'disabled' | 'error';

/**
 * Responsive grid configuration
 */
export interface ResponsiveGridConfig {
  mobile: number; // columns on mobile
  tablet: number; // columns on tablet
  desktop: number; // columns on desktop
  gap: number; // gap between items
}

/**
 * Animation configuration
 */
export interface AnimationConfig {
  duration?: number;
  delay?: number;
  easing?: string;
  repeat?: boolean;
}

/**
 * Hero component props
 */
export interface HeroV2Props {
  onDemoClick?: () => void;
  abVariant?: ABTestVariant;
  onAnalytics?: (event: AnalyticsEvent) => void;
}

/**
 * Features component props
 */
export interface FeaturesV2Props {
  onFeatureClick?: (featureId: string) => void;
  onAnalytics?: (event: AnalyticsEvent) => void;
  abVariant?: ABTestVariant;
}

/**
 * Pricing component props
 */
export interface PricingV2Props {
  onPlanClick?: (planId: string) => void;
  onAnalytics?: (event: AnalyticsEvent) => void;
  abVariant?: ABTestVariant;
  initialBillingCycle?: 'monthly' | 'annual';
}

/**
 * Error boundary props
 */
export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

/**
 * Accessibility props for buttons
 */
export interface AccessibilityProps {
  ariaLabel?: string;
  ariaDescribedBy?: string;
  role?: string;
}
