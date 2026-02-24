import React from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

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

const comparisonFeatures = [
  { feature: 'Dashboard completo', platform: true, consultoria: true },
  { feature: 'Consultor IA 24/7', platform: true, consultoria: true },
  { feature: 'Relatórios mensais', platform: true, consultoria: true },
  { feature: 'Integração de contas', platform: true, consultoria: true },
  { feature: 'Consultor especialista humano', platform: false, consultoria: true },
  { feature: 'Acompanhamento 1x/mês', platform: false, consultoria: true },
  { feature: 'Planejamento personalizado', platform: false, consultoria: true },
  { feature: 'Análise fiscal', platform: false, consultoria: true },
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <p className="text-center text-gray-600 text-sm mb-4">
            ✨ Primeiros 7 dias grátis | Garantia de 30 dias ou devolução total
          </p>
          <p className="text-center text-gray-600 text-sm">
            ⚡ Sem contrato | Cancelamento fácil | Suporte 24/7
          </p>
        </motion.div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-16 bg-white border border-gray-200 rounded-lg overflow-hidden"
        >
          <div className="p-8">
            <h3 className="text-2xl font-bold mb-8 text-gray-900 text-center">
              Comparação Detalhada de Recursos
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">
                      Recurso
                    </th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-900">
                      Plataforma + IA
                    </th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-900">
                      Consultoria
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((item, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-100 hover:bg-blue-50 transition-colors"
                    >
                      <td className="py-4 px-6 text-gray-700">{item.feature}</td>
                      <td className="py-4 px-6 text-center">
                        {item.platform ? (
                          <Check className="w-5 h-5 text-green-600 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-gray-300 mx-auto" />
                        )}
                      </td>
                      <td className="py-4 px-6 text-center">
                        {item.consultoria ? (
                          <Check className="w-5 h-5 text-green-600 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-gray-300 mx-auto" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;
