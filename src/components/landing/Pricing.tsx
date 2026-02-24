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
    <section className="py-20 px-4" style={{ background: '#ffffff' }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ color: '#111418' }}
          >
            Escolha Seu Plano
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-lg"
            style={{ color: '#637588' }}
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
              className={`relative rounded-lg p-8 ${
                plan.badge ? 'md:scale-105 md:-translate-y-4' : ''
              }`}
              style={{
                background: '#ffffff',
                border: plan.badge ? '2px solid #135bec' : '1px solid #e6e8eb',
                boxShadow: plan.badge
                  ? '0 8px 24px rgba(19, 91, 236, 0.15)'
                  : '0 1px 3px rgba(19, 91, 236, 0.05)',
              }}
            >
              {plan.badge && (
                <div
                  className="absolute -top-4 right-8 text-white px-4 py-1 rounded-full text-sm font-semibold"
                  style={{ background: '#135bec' }}
                >
                  {plan.badge}
                </div>
              )}

              <h3 className="text-2xl font-bold mb-2" style={{ color: '#111418' }}>
                {plan.name}
              </h3>

              <div className="mb-6">
                <span className="text-4xl font-bold" style={{ color: '#135bec' }}>
                  R${plan.price.toFixed(2)}
                </span>
                <span className="text-sm" style={{ color: '#637588' }}>
                  /mês
                </span>
              </div>

              <ul className="mb-8 space-y-3">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#10b981' }} />
                    <span style={{ color: '#111418' }}>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className="w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 active:scale-95"
                style={{
                  background: plan.cta.variant === 'primary' ? '#135bec' : '#ffffff',
                  color: plan.cta.variant === 'primary' ? '#ffffff' : '#135bec',
                  border: plan.cta.variant === 'primary' ? 'none' : '2px solid #135bec',
                  boxShadow:
                    plan.cta.variant === 'primary'
                      ? '0 4px 12px rgba(19, 91, 236, 0.3)'
                      : 'none',
                }}
                onMouseEnter={(e) => {
                  if (plan.cta.variant === 'primary') {
                    (e.target as HTMLButtonElement).style.background = '#1048c7';
                    (e.target as HTMLButtonElement).style.boxShadow =
                      '0 6px 16px rgba(19, 91, 236, 0.4)';
                  } else {
                    (e.target as HTMLButtonElement).style.background = 'rgba(19, 91, 236, 0.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (plan.cta.variant === 'primary') {
                    (e.target as HTMLButtonElement).style.background = '#135bec';
                    (e.target as HTMLButtonElement).style.boxShadow =
                      '0 4px 12px rgba(19, 91, 236, 0.3)';
                  } else {
                    (e.target as HTMLButtonElement).style.background = '#ffffff';
                  }
                }}
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
          <p className="text-center text-sm mb-4" style={{ color: '#637588' }}>
            ✨ Primeiros 7 dias grátis | Garantia de 30 dias ou devolução total
          </p>
          <p className="text-center text-sm" style={{ color: '#637588' }}>
            ⚡ Sem contrato | Cancelamento fácil | Suporte 24/7
          </p>
        </motion.div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-16 rounded-lg overflow-hidden"
          style={{
            background: '#ffffff',
            border: '1px solid #e6e8eb',
            boxShadow: '0 2px 8px rgba(19, 91, 236, 0.08)',
          }}
        >
          <div className="p-8">
            <h3 className="text-2xl font-bold mb-8 text-center" style={{ color: '#111418' }}>
              Comparação Detalhada de Recursos
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '2px solid #e6e8eb' }}>
                    <th
                      className="text-left py-4 px-6 font-semibold"
                      style={{ color: '#111418' }}
                    >
                      Recurso
                    </th>
                    <th
                      className="text-center py-4 px-6 font-semibold"
                      style={{ color: '#111418' }}
                    >
                      Plataforma + IA
                    </th>
                    <th
                      className="text-center py-4 px-6 font-semibold"
                      style={{ color: '#111418' }}
                    >
                      Consultoria
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((item, index) => (
                    <tr
                      key={index}
                      style={{
                        borderBottom: '1px solid #e6e8eb',
                        background: index % 2 === 0 ? '#f6f6f8' : '#ffffff',
                      }}
                      className="hover:opacity-80 transition-opacity"
                    >
                      <td className="py-4 px-6" style={{ color: '#111418' }}>
                        {item.feature}
                      </td>
                      <td className="py-4 px-6 text-center">
                        {item.platform ? (
                          <Check className="w-5 h-5 mx-auto" style={{ color: '#10b981' }} />
                        ) : (
                          <X className="w-5 h-5 mx-auto" style={{ color: '#d1d5db' }} />
                        )}
                      </td>
                      <td className="py-4 px-6 text-center">
                        {item.consultoria ? (
                          <Check className="w-5 h-5 mx-auto" style={{ color: '#10b981' }} />
                        ) : (
                          <X className="w-5 h-5 mx-auto" style={{ color: '#d1d5db' }} />
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
