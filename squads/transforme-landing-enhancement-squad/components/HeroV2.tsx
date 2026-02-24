/**
 * HeroV2 - Enhanced hero section for /transforme landing
 * Features:
 * - Analytics tracking (CTA clicks, form opens)
 * - A/B test variant support (URL param controlled)
 * - Error handling and loading states
 * - Mobile-optimized animations (respects prefers-reduced-motion)
 * - Full TypeScript types and JSDoc documentation
 */

import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Loader } from 'lucide-react';
import { LeadForm } from './LeadForm';
import { HeroV2Props, FormState, CTAButtonState } from './types';
import { useTrackingWithCallback } from './hooks/useTracking';
import { heroAnimations, prefersReducedMotion } from './utils/animations';

/**
 * HeroV2 Component
 *
 * Displays transformation-focused headline with CTAs and value propositions
 *
 * @component
 * @param {HeroV2Props} props - Component props
 * @param {Function} props.onDemoClick - Callback when demo is requested
 * @param {ABTestVariant} props.abVariant - A/B test variant
 * @param {Function} props.onAnalytics - Analytics callback
 *
 * @example
 * ```tsx
 * <HeroV2
 *   onDemoClick={() => console.log('Demo requested')}
 *   abVariant="variant_a"
 *   onAnalytics={(event) => sendAnalytics(event)}
 * />
 * ```
 */
export const HeroV2: React.FC<HeroV2Props> = ({
  onDemoClick,
  abVariant,
  onAnalytics,
}) => {
  // Form state management
  const [formState, setFormState] = useState<FormState>({
    isOpen: false,
    source: 'platform',
    isLoading: false,
    error: undefined,
  });

  // CTA button states
  const [platformButtonState, setPlatformButtonState] = useState<CTAButtonState>('idle');
  const [demoButtonState, setDemoButtonState] = useState<CTAButtonState>('idle');

  // Analytics hook with callback support
  const {
    trackCTAClick,
    trackFormOpen,
    abVariant: detectedVariant,
  } = useTrackingWithCallback('HeroV2', onAnalytics);

  // Use provided variant or detected variant
  const variant = abVariant || detectedVariant;

  /**
   * Determine which headline to show based on A/B variant
   */
  const getHeadlineText = useCallback((): { main: string; highlight: string } => {
    if (variant === 'variant_a') {
      return {
        main: 'Do chaos to control.',
        highlight: 'From lost to empowered.',
      };
    }
    if (variant === 'variant_b') {
      return {
        main: 'Transforme seu caos financeiro.',
        highlight: 'Em apenas 5 minutos.',
      };
    }
    return {
      main: 'De caótico a claro.',
      highlight: 'De perdido a confiante.',
    };
  }, [variant]);

  const headline = getHeadlineText();

  /**
   * Handle opening form with error handling
   */
  const handleOpenForm = useCallback(
    async (source: 'platform' | 'demo' | 'pricing') => {
      try {
        setFormState((prev) => ({
          ...prev,
          isLoading: true,
          error: undefined,
        }));

        // Track the interaction
        trackFormOpen(source);
        trackCTAClick(`hero_${source}_form`);

        // Simulate form preparation (replace with actual logic if needed)
        await new Promise((resolve) => setTimeout(resolve, 300));

        setFormState({
          isOpen: true,
          source,
          isLoading: false,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to open form';
        setFormState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
        console.error('[HeroV2 Error]', error);
      }
    },
    [trackFormOpen, trackCTAClick]
  );

  /**
   * Handle platform button click with loading state
   */
  const handlePlatformClick = useCallback(async () => {
    setPlatformButtonState('loading');
    await handleOpenForm('platform');
    setPlatformButtonState('idle');
  }, [handleOpenForm]);

  /**
   * Handle demo button click with loading state
   */
  const handleDemoClick = useCallback(async () => {
    setDemoButtonState('loading');
    await handleOpenForm('demo');
    setDemoButtonState('idle');
    onDemoClick?.();
  }, [handleOpenForm, onDemoClick]);

  /**
   * Close form and track event
   */
  const handleCloseForm = useCallback(() => {
    setFormState((prev) => ({
      ...prev,
      isOpen: false,
    }));
  }, []);

  // Check for reduced motion preference
  const reduceMotion = prefersReducedMotion();

  return (
    <>
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white overflow-hidden">
        {/* Background decorative elements - disabled on reduced motion */}
        {!reduceMotion && (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-transparent" />
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-100/20 rounded-full blur-3xl" />
          </>
        )}

        {/* Content */}
        <div className="relative z-10 text-center max-w-2xl mx-auto px-4 py-20">
          {/* Main headline - Transformation focused */}
          <motion.h1
            initial={reduceMotion ? {} : { opacity: 0, y: 20 }}
            animate={reduceMotion ? {} : { opacity: 1, y: 0 }}
            transition={
              reduceMotion ? { duration: 0 } : { duration: 0.8, ease: 'easeOut' }
            }
            className="text-5xl md:text-6xl font-bold mb-6 leading-tight text-gray-950"
            role="heading"
            aria-level={1}
          >
            {headline.main}
            <br />
            <span className="text-blue-600">{headline.highlight}</span>
          </motion.h1>

          {/* Subheading - Emotional hook + benefit */}
          <motion.p
            initial={reduceMotion ? {} : { opacity: 0, y: 20 }}
            animate={reduceMotion ? {} : { opacity: 1, y: 0 }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { duration: 0.8, delay: 0.2, ease: 'easeOut' }
            }
            className="text-xl md:text-2xl mb-8 text-gray-700 leading-relaxed"
          >
            Em apenas 5 minutos, com IA que entende você
          </motion.p>

          {/* Trust statement */}
          <motion.p
            initial={reduceMotion ? {} : { opacity: 0, y: 20 }}
            animate={reduceMotion ? {} : { opacity: 1, y: 0 }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { duration: 0.8, delay: 0.3, ease: 'easeOut' }
            }
            className="text-sm md:text-base mb-12 text-gray-600"
          >
            ✓ Sem contrato • ✓ Cancelamento fácil • ✓ Garantia 7 dias
          </motion.p>

          {/* Error message if form failed to open */}
          {formState.error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
              role="alert"
            >
              {formState.error}
            </motion.div>
          )}

          {/* CTAs */}
          <motion.div
            initial={reduceMotion ? {} : { opacity: 0, y: 20 }}
            animate={reduceMotion ? {} : { opacity: 1, y: 0 }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { duration: 0.8, delay: 0.4, ease: 'easeOut' }
            }
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            {/* Platform CTA Button */}
            <button
              onClick={handlePlatformClick}
              disabled={platformButtonState !== 'idle' || formState.isLoading}
              className="relative bg-blue-600 hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed text-white font-semibold px-8 py-4 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl group"
              aria-label="Começar com Plataforma - R$99,90 por mês"
              aria-busy={platformButtonState === 'loading'}
            >
              <span
                className={`inline-flex items-center gap-2 transition-opacity ${
                  platformButtonState === 'loading' ? 'opacity-0' : 'opacity-100'
                }`}
              >
                Começar com Plataforma
                <br />
                <span className="text-sm font-normal">R$99,90/mês</span>
              </span>

              {platformButtonState === 'loading' && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <Loader className="w-5 h-5 animate-spin" />
                </span>
              )}
            </button>

            {/* Demo CTA Button */}
            <button
              onClick={handleDemoClick}
              disabled={demoButtonState !== 'idle' || formState.isLoading}
              className="relative border-2 border-blue-600 text-blue-600 hover:bg-blue-50 disabled:opacity-70 disabled:cursor-not-allowed font-semibold px-8 py-4 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95"
              aria-label="Agendar uma demonstração da plataforma"
              aria-busy={demoButtonState === 'loading'}
            >
              <span
                className={`inline-flex items-center gap-2 transition-opacity ${
                  demoButtonState === 'loading' ? 'opacity-0' : 'opacity-100'
                }`}
              >
                Agendar Demo
              </span>

              {demoButtonState === 'loading' && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <Loader className="w-5 h-5 animate-spin text-blue-600" />
                </span>
              )}
            </button>
          </motion.div>

          {/* Value proposition highlight */}
          <motion.div
            initial={reduceMotion ? {} : { opacity: 0, y: 20 }}
            animate={reduceMotion ? {} : { opacity: 1, y: 0 }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { duration: 0.8, delay: 0.5, ease: 'easeOut' }
            }
            className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12 text-center"
          >
            <div>
              <div className="text-2xl font-bold text-blue-600">5 min</div>
              <div className="text-xs text-gray-600">para começar</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">24/7</div>
              <div className="text-xs text-gray-600">Consultor IA</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">100%</div>
              <div className="text-xs text-gray-600">Dados seguros</div>
            </div>
          </motion.div>

          {/* Scroll indicator - skipped on reduced motion */}
          {!reduceMotion && (
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              className="mt-16"
              aria-hidden="true"
            >
              <ChevronDown className="w-8 h-8 mx-auto text-blue-600" />
            </motion.div>
          )}
        </div>
      </section>

      {/* Lead Form Modal */}
      <LeadForm
        isOpen={formState.isOpen}
        onClose={handleCloseForm}
        source={formState.source}
      />
    </>
  );
};

export default HeroV2;
