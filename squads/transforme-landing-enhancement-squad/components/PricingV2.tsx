/**
 * PricingV2 - Enhanced pricing section
 * Features:
 * - ROI and benefit-focused copy
 * - Improved feature list accessibility
 * - Smooth hover animations on pricing cards
 * - Fixed badge positioning on mobile
 * - CTA button states (loading, disabled)
 * - Memoization for performance
 * - Full accessibility support
 */

import React, { useCallback, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Loader } from 'lucide-react';
import { PricingV2Props, PricingPlan, CTAButtonState } from './types';
import { useTrackingWithCallback } from './hooks/useTracking';
import { prefersReducedMotion } from './utils/animations';

/**
 * Pricing plans data
 */
const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'platform',
    name: 'Plataforma + IA',
    price: 99.9,
    subtitle: 'Para quem quer clareza agora',
    description: 'Gestão financeira inteligente sem comprometer autonomia',
    features: [
      {
        title: 'Dashboard intuitivo',
        benefit: 'Entenda suas finanças em minutos',
      },
      {
        title: 'Consultor IA 24/7',
        benefit: 'Recomendações personalizadas, você decide',
      },
      {
        title: 'Relatórios mensais',
        benefit: 'Progresso claro e sem números confusos',
      },
      {
        title: 'Integração de contas',
        benefit: 'Visão unificada de tudo',
      },
    ],
    cta: { text: 'Começar Agora', variant: 'secondary' as const },
    roi: '2h economizadas por mês',
  },
  {
    id: 'consultoria',
    name: 'Consultoria Especialista',
    price: 349.9,
    badge: 'MAIS POPULAR',
    subtitle: 'Para quem precisa de direção clara',
    description: 'Tudo da plataforma + planejamento estratégico com especialista',
    features: [
      {
        title: 'Tudo do plano Plataforma',
        benefit: '',
      },
      {
        title: 'Consultor especialista dedicado',
        benefit: 'Orientação estratégica personalizada',
      },
      {
        title: 'Reunião mensal 1x1',
        benefit: 'Planejamento customizado e accountability',
      },
      {
        title: 'Análise fiscal otimizada',
        benefit: 'Economize em impostos com legitimidade',
      },
      {
        title: 'Prioridade no suporte',
        benefit: 'Respostas em até 2 horas',
      },
    ],
    cta: { text: 'Agendar Demo', variant: 'primary' as const },
    roi: 'Retorno em 2-3 meses',
  },
];

/**
 * PricingCard - Individual pricing card component
 * Separated for better performance
 */
interface PricingCardProps {
  plan: PricingPlan;
  index: number;
  onPlanClick?: (planId: string) => void;
  reduceMotion: boolean;
}

const PricingCard: React.FC<PricingCardProps> = React.memo(
  ({ plan, index, onPlanClick, reduceMotion }) => {
    const [buttonState, setButtonState] = useState<CTAButtonState>('idle');
    const [isHovered, setIsHovered] = useState(false);

    const handleCtaClick = useCallback(async () => {
      try {
        setButtonState('loading');

        // Simulate button interaction
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Call the callback
        onPlanClick?.(plan.id);

        setButtonState('idle');
      } catch (error) {
        setButtonState('error');
        console.error('[PricingCard Error]', error);
        setTimeout(() => setButtonState('idle'), 2000);
      }
    }, [plan.id, onPlanClick]);

    const isPopular = !!plan.badge;

    return (
      <motion.div
        initial={reduceMotion ? {} : { opacity: 0, y: 20 }}
        whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }}
        whileHover={!reduceMotion ? { y: -8 } : {}}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { duration: 0.6, delay: index * 0.1, ease: 'easeOut' }
        }
        viewport={{ once: true, margin: '0px 0px -100px 0px' }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className={`relative bg-white rounded-lg p-8 transition-all duration-300 flex flex-col h-full ${
          isPopular
            ? 'ring-2 ring-blue-600 md:scale-105 md:-translate-y-4 shadow-xl'
            : 'border border-gray-200 shadow hover:shadow-lg'
        }`}
        role="article"
        aria-label={`${plan.name} - R$${plan.price.toFixed(2)} por mês`}
      >
        {/* Badge - Fixed positioning on mobile */}
        {plan.badge && (
          <motion.div
            initial={reduceMotion ? {} : { scale: 0, opacity: 0 }}
            animate={reduceMotion ? {} : { scale: 1, opacity: 1 }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { duration: 0.4, delay: 0.3, ease: 'easeOut' }
            }
            className="absolute -top-4 left-1/2 md:left-auto md:right-8 transform -translate-x-1/2 md:translate-x-0 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold whitespace-nowrap"
            aria-label="Plano mais popular"
          >
            {plan.badge}
          </motion.div>
        )}

        {/* Plan name */}
        <h3 className="text-2xl font-bold mb-2 text-gray-900">
          {plan.name}
        </h3>

        {/* Subtitle */}
        <p className="text-sm text-gray-600 mb-4">{plan.subtitle}</p>

        {/* Price */}
        <div className="mb-6">
          <span className="text-4xl font-bold text-blue-600">
            R${plan.price.toFixed(2)}
          </span>
          <span className="text-gray-600 text-sm" aria-label="por mês">
            /mês
          </span>
        </div>

        {/* Description */}
        <p className="text-gray-700 mb-6 text-sm">{plan.description}</p>

        {/* Features - Accessibility improved */}
        <ul className="mb-8 space-y-3 flex-grow" aria-label={`Recursos do plano ${plan.name}`}>
          {plan.features.map((feature, idx) => (
            <motion.li
              key={idx}
              initial={reduceMotion ? {} : { opacity: 0, x: -10 }}
              whileInView={reduceMotion ? {} : { opacity: 1, x: 0 }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { duration: 0.4, delay: idx * 0.05, ease: 'easeOut' }
              }
              viewport={{ once: true }}
              className="flex items-start gap-3"
            >
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="font-semibold text-gray-900">
                  {feature.title}
                </p>
                {feature.benefit && (
                  <p className="text-sm text-gray-600">{feature.benefit}</p>
                )}
              </div>
            </motion.li>
          ))}
        </ul>

        {/* ROI highlight */}
        <motion.div
          initial={reduceMotion ? {} : { opacity: 0 }}
          whileInView={reduceMotion ? {} : { opacity: 1 }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { duration: 0.6, delay: 0.2, ease: 'easeOut' }
          }
          viewport={{ once: true }}
          className="mb-6 p-3 bg-blue-50 rounded-lg border border-blue-100"
        >
          <p className="text-sm font-semibold text-blue-900">
            <Zap className="w-4 h-4 inline mr-2" aria-hidden="true" />
            {plan.roi}
          </p>
        </motion.div>

        {/* CTA Button with states */}
        <button
          onClick={handleCtaClick}
          disabled={buttonState !== 'idle'}
          className={`relative w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 font-medium flex items-center justify-center gap-2 ${
            plan.cta.variant === 'primary'
              ? 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed active:scale-95'
              : 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 disabled:opacity-70 disabled:cursor-not-allowed active:scale-95'
          }`}
          aria-busy={buttonState === 'loading'}
          aria-label={`${plan.cta.text} - ${plan.name}`}
        >
          <span
            className={`inline-flex items-center gap-2 transition-opacity ${
              buttonState === 'loading' ? 'opacity-0' : 'opacity-100'
            }`}
          >
            {plan.cta.text}
          </span>

          {buttonState === 'loading' && (
            <Loader className="absolute w-5 h-5 animate-spin" />
          )}

          {buttonState === 'error' && (
            <span className="absolute text-sm" role="alert">
              Tente novamente
            </span>
          )}
        </button>
      </motion.div>
    );
  }
);

PricingCard.displayName = 'PricingCard';

/**
 * PricingV2 Component
 *
 * Displays pricing plans with ROI-focused messaging and accessibility
 *
 * @component
 * @param {PricingV2Props} props - Component props
 *
 * @example
 * ```tsx
 * <PricingV2
 *   onPlanClick={(planId) => console.log(planId)}
 *   onAnalytics={(event) => sendAnalytics(event)}
 * />
 * ```
 */
export const PricingV2: React.FC<PricingV2Props> = ({
  onPlanClick,
  onAnalytics,
  abVariant,
  initialBillingCycle = 'monthly',
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>(
    initialBillingCycle
  );

  // Tracking hook
  const { trackPricingPlanClick, trackPricingToggle, trackCTAClick } =
    useTrackingWithCallback('PricingV2', onAnalytics);

  // Check for reduced motion
  const reduceMotion = prefersReducedMotion();

  /**
   * Handle plan click
   */
  const handlePlanClick = useCallback(
    (planId: string) => {
      const plan = PRICING_PLANS.find((p) => p.id === planId);
      if (plan) {
        trackPricingPlanClick(planId, plan.name);
        onPlanClick?.(planId);
      }
    },
    [trackPricingPlanClick, onPlanClick]
  );

  /**
   * Handle billing cycle toggle
   */
  const handleBillingToggle = useCallback(
    (cycle: 'monthly' | 'annual') => {
      setBillingCycle(cycle);
      trackPricingToggle(cycle);
    },
    [trackPricingToggle]
  );

  // Memoize plans
  const memoizedPlans = useMemo(() => PRICING_PLANS, []);

  return (
    <section id="pricing" className="py-20 px-4 bg-blue-50">
      <div className="max-w-5xl mx-auto">
        {/* Section heading */}
        <div className="text-center mb-16">
          <motion.h2
            initial={reduceMotion ? {} : { opacity: 0, y: 20 }}
            whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { duration: 0.6, ease: 'easeOut' }
            }
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-4 text-gray-900"
            role="heading"
            aria-level={2}
          >
            Planos que crescem com você
          </motion.h2>

          <motion.p
            initial={reduceMotion ? {} : { opacity: 0, y: 20 }}
            whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { duration: 0.6, delay: 0.1, ease: 'easeOut' }
            }
            viewport={{ once: true }}
            className="text-lg text-gray-600"
          >
            Escolha conforme sua necessidade, não seu orçamento
          </motion.p>
        </div>

        {/* Billing toggle (optional) */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-gray-200 rounded-lg p-1">
            <button
              onClick={() => handleBillingToggle('monthly')}
              className={`px-4 py-2 rounded transition-all duration-300 font-medium ${
                billingCycle === 'monthly'
                  ? 'bg-white text-blue-600 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              aria-pressed={billingCycle === 'monthly'}
            >
              Mensal
            </button>
            <button
              onClick={() => handleBillingToggle('annual')}
              className={`px-4 py-2 rounded transition-all duration-300 font-medium ${
                billingCycle === 'annual'
                  ? 'bg-white text-blue-600 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              aria-pressed={billingCycle === 'annual'}
            >
              Anual <span className="text-xs ml-1 text-green-600">(15% OFF)</span>
            </button>
          </div>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12" role="list">
          {memoizedPlans.map((plan, index) => (
            <div key={plan.id} role="listitem">
              <PricingCard
                plan={plan}
                index={index}
                onPlanClick={handlePlanClick}
                reduceMotion={reduceMotion}
              />
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={reduceMotion ? {} : { opacity: 0 }}
          whileInView={reduceMotion ? {} : { opacity: 1 }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { duration: 0.6, delay: 0.2, ease: 'easeOut' }
          }
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-gray-600 text-sm mb-4">
            <span aria-hidden="true">⚡</span> Sem contrato | Cancelamento fácil | Garantia 7
            dias
          </p>
          <p className="text-gray-600">
            Não tem certeza?
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                trackCTAClick('pricing_free_trial');
              }}
              className="text-blue-600 font-semibold hover:underline ml-1 transition-colors"
            >
              Teste 7 dias grátis
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingV2;
