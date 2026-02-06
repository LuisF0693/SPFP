import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '../../utils';

export type MetricType = 'income' | 'expense' | 'balance' | 'savings';

interface ReportMetricCardProps {
    title: string;
    value: number;
    change?: number; // percentual de mudança vs mês anterior
    type: MetricType;
    icon: React.ReactNode;
    subtitle?: string;
    isPercentage?: boolean;
}

const GRADIENTS: Record<MetricType, string> = {
    income: 'from-emerald-500 to-emerald-600',
    expense: 'from-rose-500 to-rose-600',
    balance: 'from-blue-500 to-blue-600',
    savings: 'from-amber-500 to-amber-600',
};

const SHADOWS: Record<MetricType, string> = {
    income: 'shadow-emerald-500/25',
    expense: 'shadow-rose-500/25',
    balance: 'shadow-blue-500/25',
    savings: 'shadow-amber-500/25',
};

export const ReportMetricCard: React.FC<ReportMetricCardProps> = ({
    title,
    value,
    change,
    type,
    icon,
    subtitle,
    isPercentage = false
}) => {
    const hasChange = change !== undefined && change !== null;
    const isPositive = hasChange && change >= 0;

    return (
        <div className={`
            bg-gradient-to-br ${GRADIENTS[type]}
            rounded-2xl p-6 text-white
            shadow-lg ${SHADOWS[type]}
            transform hover:scale-[1.02] hover:-translate-y-1
            transition-all duration-300 ease-out
            relative overflow-hidden
            group
        `}>
            {/* Background decoration */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
            <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-black/10 rounded-full blur-3xl" />

            {/* Content */}
            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <span className="text-white/80 text-xs font-semibold uppercase tracking-wider">
                        {title}
                    </span>
                    <span className="text-white/60 group-hover:text-white/80 transition-colors">
                        {icon}
                    </span>
                </div>

                {/* Value */}
                <div className="text-3xl font-bold mb-2 tracking-tight">
                    {isPercentage
                        ? `${value.toFixed(1)}%`
                        : formatCurrency(value)
                    }
                </div>

                {/* Change indicator or subtitle */}
                {hasChange ? (
                    <div className={`
                        flex items-center text-sm font-medium
                        ${isPositive ? 'text-white/90' : 'text-white/80'}
                    `}>
                        {isPositive ? (
                            <TrendingUp className="w-4 h-4 mr-1.5" />
                        ) : (
                            <TrendingDown className="w-4 h-4 mr-1.5" />
                        )}
                        <span>
                            {isPositive ? '+' : ''}{change.toFixed(1)}% vs mês anterior
                        </span>
                    </div>
                ) : subtitle ? (
                    <div className="text-sm text-white/70 font-medium">
                        {subtitle}
                    </div>
                ) : null}
            </div>
        </div>
    );
};
