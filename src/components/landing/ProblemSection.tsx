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
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-4 text-gray-900"
          >
            Você se identifica com alguma dessas situações?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-lg text-gray-600"
          >
            Se sua resposta foi sim para qualquer uma, você não está sozinho
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {painPoints.map((point, index) => {
            const Icon = point.icon;
            return (
              <motion.div
                key={point.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white border-l-4 border-red-500 rounded-lg p-6 hover:shadow-md transition-all duration-300 group"
              >
                <div className="mb-3 text-red-500 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900">
                  {point.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {point.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-lg font-semibold text-gray-900 mb-2">
            É exatamente pra isso que o SPFP existe
          </p>
          <p className="text-blue-600 font-semibold inline-flex items-center gap-2">
            Descubra como →
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default ProblemSection;
