import React from 'react';
import { motion } from 'framer-motion';
import { Check, Zap } from 'lucide-react';

/**
 * PricingV2 - Redesigned pricing section with benefit-focused copy
 * Highlights ROI and value, not just features
 */

const plans = [
  {
    id: 'platform',
    name: 'Plataforma + IA',
    price: 99.9,
    badge: undefined,
    subtitle: 'Para quem quer clareza agora',
    description: 'Gestão financeira inteligente sem comprometer autonomia',
    features: [
      {
        title: 'Dashboard intuitivo',
        benefit: 'Entenda suas finanças em minutos'
      },
      {
        title: 'Consultor IA 24/7',
        benefit: 'Recomendações personalizadas, você decide'
      },
      {
        title: 'Relatórios mensais',
        benefit: 'Progresso claro e sem números confusos'
      },
      {
        title: 'Integração de contas',
        benefit: 'Visão unificada de tudo'
      },
    ],
    cta: { text: 'Começar Agora', variant: 'secondary' as const },
    roi: '2h economizadas por mês'
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
        benefit: ''
      },
      {
        title: 'Consultor especialista dedicado',
        benefit: 'Orientação estratégica personalizada'
      },
      {
        title: 'Reunião mensal 1x1',
        benefit: 'Planejamento customizado e accountability'
      },
      {
        title: 'Análise fiscal otimizada',
        benefit: 'Economize em impostos com legitimidade'
      },
      {
        title: 'Prioridade no suporte',
        benefit: 'Respostas em até 2 horas'
      },
    ],
    cta: { text: 'Agendar Demo', variant: 'primary' as const },
    roi: 'Retorno em 2-3 meses'
  },
];

export const PricingV2: React.FC = () => {
  return (
    <section id="pricing" className="py-20 px-4 bg-blue-50">
      <div className="max-w-5xl mx-auto">
        {/* Section heading */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-4 text-gray-900"
          >
            Planos que crescem com você
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-lg text-gray-600"
          >
            Escolha conforme sua necessidade, não seu orçamento
          </motion.p>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`relative bg-white rounded-lg p-8 transition-all duration-300 ${
                plan.badge
                  ? 'ring-2 ring-blue-600 md:scale-105 md:-translate-y-4 shadow-lg'
                  : 'border border-gray-200 shadow'
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-4 right-8 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  {plan.badge}
                </div>
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
                <span className="text-gray-600 text-sm">/mês</span>
              </div>

              {/* Description */}
              <p className="text-gray-700 mb-6 text-sm">
                {plan.description}
              </p>

              {/* Features */}
              <ul className="mb-8 space-y-3">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900">
                        {feature.title}
                      </p>
                      {feature.benefit && (
                        <p className="text-sm text-gray-600">
                          {feature.benefit}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>

              {/* ROI highlight */}
              <div className="mb-6 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-sm font-semibold text-blue-900">
                  <Zap className="w-4 h-4 inline mr-2" />
                  {plan.roi}
                </p>
              </div>

              {/* CTA Button */}
              <button
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                  plan.cta.variant === 'primary'
                    ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
                    : 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 active:scale-95'
                }`}
              >
                {plan.cta.text}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-gray-600 text-sm mb-4">
            ⚡ Sem contrato | Cancelamento fácil | Garantia 7 dias
          </p>
          <p className="text-gray-600">
            Não tem certeza?
            <a href="#" className="text-blue-600 font-semibold hover:underline ml-1">
              Teste 7 dias grátis
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingV2;
