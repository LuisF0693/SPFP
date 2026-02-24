import React from 'react';
import { motion } from 'framer-motion';
import { Lock, CheckCircle, CreditCard, Shield } from 'lucide-react';

const stats = [
  {
    value: '2.341',
    label: 'Empreendedores Ativos',
  },
  {
    value: 'R$150M+',
    label: 'Planejados em Plataforma',
  },
  {
    value: '4.8 ⭐',
    label: 'Avaliação Média',
  },
  {
    value: '<2h',
    label: 'Tempo Médio de Resposta',
  },
];

const badges = [
  {
    icon: Lock,
    text: 'Dados LGPD protegidos',
  },
  {
    icon: CheckCircle,
    text: 'Sem contrato de fidelidade',
  },
  {
    icon: CreditCard,
    text: 'Cancele quando quiser',
  },
  {
    icon: Shield,
    text: 'Criptografia SSL',
  },
];

export const TrustIndicators: React.FC = () => {
  return (
    <section className="py-20 px-4 bg-blue-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#111418' }}>
            Por que 2.300+ empreendedores confiam no SPFP
          </h2>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {stats.map((stat) => (
            <div
              key={stat.value}
              className="rounded-lg p-6 text-center"
              style={{
                background: '#ffffff',
                border: '1px solid #e6e8eb',
                boxShadow: '0 1px 3px rgba(19, 91, 236, 0.08)',
              }}
            >
              <div className="text-2xl md:text-3xl font-bold mb-2" style={{ color: '#135bec' }}>
                {stat.value}
              </div>
              <p className="text-sm" style={{ color: '#637588' }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Security Badges */}
        <div
          className="rounded-lg p-8"
          style={{
            background: '#ffffff',
            border: '1px solid #e6e8eb',
            boxShadow: '0 2px 8px rgba(19, 91, 236, 0.1)',
          }}
        >
          <p className="text-center font-semibold mb-6" style={{ color: '#111418' }}>
            Segurança e Transparência
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {badges.map((badge) => {
              const Icon = badge.icon;
              return (
                <div
                  key={badge.text}
                  className="flex items-center gap-3 p-3 rounded-lg hover:opacity-80 transition-opacity duration-300"
                  style={{ background: 'rgba(19, 91, 236, 0.02)' }}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" style={{ color: '#135bec' }} />
                  <span className="text-sm" style={{ color: '#111418' }}>
                    {badge.text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustIndicators;
