import React from 'react';
import { AlertTriangle, TrendingUp, CheckCircle } from 'lucide-react';
import { formatCurrency } from '../../utils';

type InsightType = 'DEFICIT' | 'SURPLUS' | 'ON_TRACK';

interface InsightCardProps {
  type: InsightType;
  value: number;
  percentage: number;
  income: number;
}

const CONFIG: Record<InsightType, {
  icon: React.ElementType;
  bgColor: string;
  iconColor: string;
  textColor: string;
}> = {
  DEFICIT: {
    icon: AlertTriangle,
    bgColor: 'bg-amber-500/10 border-amber-500/30',
    iconColor: 'text-amber-400',
    textColor: 'text-amber-400'
  },
  SURPLUS: {
    icon: TrendingUp,
    bgColor: 'bg-emerald-500/10 border-emerald-500/30',
    iconColor: 'text-emerald-400',
    textColor: 'text-emerald-400'
  },
  ON_TRACK: {
    icon: CheckCircle,
    bgColor: 'bg-blue-500/10 border-blue-500/30',
    iconColor: 'text-blue-400',
    textColor: 'text-blue-400'
  }
};

export const InsightCard: React.FC<InsightCardProps> = ({
  type,
  value,
  percentage,
  income
}) => {
  const config = CONFIG[type];
  const Icon = config.icon;

  const getMessage = () => {
    if (type === 'DEFICIT') {
      return (
        <>
          Você gasta{' '}
          <span className={config.textColor}>
            {formatCurrency(value)} ({percentage.toFixed(1)}%)
          </span>{' '}
          a mais do que ganha. Crie metas para otimizar seus gastos e começar a poupar para realizar seus objetivos.
        </>
      );
    }

    if (type === 'SURPLUS') {
      return (
        <>
          Parabéns! Você está economizando{' '}
          <span className={config.textColor}>
            {formatCurrency(value)} ({percentage.toFixed(1)}%)
          </span>{' '}
          da sua renda. Continue assim para alcançar seus objetivos financeiros!
        </>
      );
    }

    return (
      <>
        Seus gastos estão equilibrados com sua renda. Considere definir metas para acelerar sua independência financeira.
      </>
    );
  };

  return (
    <div className={`p-4 rounded-xl border ${config.bgColor}`}>
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl bg-slate-800/50 flex items-center justify-center shrink-0`}>
          <Icon size={20} className={config.iconColor} />
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">
          {getMessage()}
        </p>
      </div>
    </div>
  );
};
