import React from 'react';
import { motion } from 'framer-motion';
import {
  TrendingDown,
  FileSpreadsheet,
  AlertCircle,
  Target,
  CreditCard,
  Clock,
} from 'lucide-react';

const painPoints = [
  {
    id: 'disappearing-money',
    icon: TrendingDown,
    title: 'Dinheiro Sumindo',
    description: 'Trabalha muito mas nunca sabe onde foi o dinheiro',
  },
  {
    id: 'chaotic-spreadsheet',
    icon: FileSpreadsheet,
    title: 'Planilha Caótica',
    description: 'Começou uma planilha mas parou na 2ª semana',
  },
  {
    id: 'investment-fear',
    icon: AlertCircle,
    title: 'Medo de Investir',
    description: 'Quer investir mas não sabe por onde começar',
  },
  {
    id: 'no-goals',
    icon: Target,
    title: 'Sem Metas',
    description: 'Tem sonhos mas não sabe quanto precisa guardar',
  },
  {
    id: 'hidden-debt',
    icon: CreditCard,
    title: 'Dívidas Ocultas',
    description: 'Parcelas espalhadas e não sabe o total real',
  },
  {
    id: 'lack-of-time',
    icon: Clock,
    title: 'Falta de Tempo',
    description: 'Quer organizar mas nunca tem tempo pra isso',
  },
];

export const ProblemSection: React.FC = () => {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#111418' }}>
            Você se identifica com alguma dessas situações?
          </h2>
          <p className="text-lg" style={{ color: '#637588' }}>
            Se sua resposta foi sim para qualquer uma, você não está sozinho
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {painPoints.map((point) => {
            const Icon = point.icon;
            return (
              <div
                key={point.id}
                className="rounded-lg p-6 hover:shadow-lg transition-all duration-300 group border-l-4"
                style={{
                  background: '#ffffff',
                  borderLeftColor: '#ef4444',
                  borderLeftWidth: '4px',
                }}
              >
                <div className="mb-3 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-8 h-8" style={{ color: '#ef4444' }} />
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: '#111418' }}>
                  {point.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#637588' }}>
                  {point.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <p className="text-lg font-semibold mb-2" style={{ color: '#111418' }}>
            É exatamente pra isso que o SPFP existe
          </p>
          <p className="font-semibold inline-flex items-center gap-2 hover:gap-3 transition-all" style={{ color: '#135bec' }}>
            Descubra como →
          </p>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
