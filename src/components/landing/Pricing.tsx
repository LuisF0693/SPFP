import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const plans = [
  {
    id: 'platform',
    name: 'Plataforma + IA',
    price: 99.9,
    badge: undefined,
    features: [
      'Dashboard completo',
      'Consultor IA 24/7',
      'Relatórios mensais',
      'Integração de contas',
    ],
    cta: { text: 'Começar Agora', variant: 'secondary' as const },
  },
  {
    id: 'consultoria',
    name: 'Consultoria',
    price: 349.9,
    badge: 'POPULAR',
    features: [
      'Tudo acima',
      'Consultor especialista',
      'Acompanhamento 1x/mês',
      'Planejamento personalizado',
      'Análise fiscal',
    ],
    cta: { text: 'Agendar Demo', variant: 'primary' as const },
  },
];

export const Pricing: React.FC = () => {
  return (
    <section className="py-20 px-4 bg-blue-50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-4 text-gray-900"
          >
            Escolha Seu Plano
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-lg text-gray-600"
          >
            Sem contrato. Cancele quando quiser.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`relative bg-white rounded-lg p-8 ${
                plan.badge ? 'ring-2 ring-blue-600 md:scale-105 md:-translate-y-4' : 'border border-gray-200'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-4 right-8 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  {plan.badge}
                </div>
              )}

              <h3 className="text-2xl font-bold mb-2 text-gray-900">
                {plan.name}
              </h3>

              <div className="mb-6">
                <span className="text-4xl font-bold text-blue-600">
                  R${plan.price.toFixed(2)}
                </span>
                <span className="text-gray-600 text-sm">/mês</span>
              </div>

              <ul className="mb-8 space-y-3">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

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

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-center text-gray-600 text-sm"
        >
          ⚡ Sem contrato | Cancelamento fácil | Garantia 7 dias
        </motion.p>
      </div>
    </section>
  );
};

export default Pricing;
