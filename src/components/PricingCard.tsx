/**
 * PricingCard Component
 * Displays a pricing plan card with Stripe payment options
 * Supports both installment (parcelado) and monthly (mensal) payment methods
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import { useStripeCheckout } from '../hooks/useStripeCheckout';
import { useStripeSubscription } from '../hooks/useStripeSubscription';
import { useAuth } from '../context/AuthContext';
import { PlanType } from '../types/stripe';

export interface PricingCardFeature {
  text: string;
  included: boolean;
  highlight?: string;
  icon?: React.ReactNode;
}

export interface PricingCardProps {
  title: string;
  price: number;
  description: string;
  features: PricingCardFeature[];
  priceIds: {
    parcelado: string;
    mensal: string;
  };
  featured?: boolean;
  isPopular?: boolean;
}

export const PricingCard: React.FC<PricingCardProps> = ({
  title,
  price,
  description,
  features,
  priceIds,
  featured = false,
  isPopular = false,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { loading: checkoutLoading, error: checkoutError, initiateCheckout } = useStripeCheckout();
  const { loading: subscriptionLoading, error: subscriptionError, createSubscription } = useStripeSubscription();
  const [activeError, setActiveError] = useState<string | null>(null);

  const loading = checkoutLoading || subscriptionLoading;
  const error = checkoutError || subscriptionError || activeError;

  const handleParcelado = async () => {
    setActiveError(null);
    if (!priceIds.parcelado) {
      setActiveError('Plano de parcelamento não disponível.');
      return;
    }
    await initiateCheckout(priceIds.parcelado, 'parcelado');
  };

  const handleMensal = async () => {
    setActiveError(null);
    if (!priceIds.mensal) {
      setActiveError('Plano mensal não disponível.');
      return;
    }

    if (!user) {
      // Salvar priceId para completar após login
      localStorage.setItem('pendingSubscriptionPriceId', priceIds.mensal);
      localStorage.setItem('pendingSubscriptionPlanTitle', title);
      // Redirecionar para login
      navigate('/login?redirect=subscription');
      return;
    }

    await createSubscription(priceIds.mensal);
  };

  const formatPrice = (amount: number): string => {
    return amount.toLocaleString('pt-BR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const showAIBadge = price === 99; // Badge "Com IA" no plano 99

  return (
    <div
      className={`relative p-10 rounded-[2.5rem] border flex flex-col transition-all duration-500 hover:-translate-y-3 group
      ${featured || isPopular
        ? 'bg-gradient-to-b from-blue-900/20 to-black border-blue-500/50 shadow-[0_40px_100px_rgba(37,99,235,0.15)] ring-1 ring-blue-500/30'
        : 'bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.05]'
      }`}
    >
      {/* Popular Badge */}
      {(featured || isPopular) && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-full shadow-lg">
          Mais Popular
        </div>
      )}

      {/* AI Badge */}
      {showAIBadge && (
        <div className="absolute -top-4 right-4 px-4 py-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-full shadow-lg">
          Com IA
        </div>
      )}

      {/* Title and Description */}
      <div className="mb-10 text-center">
        <h3 className={`text-3xl font-serif font-bold mb-3 ${featured || isPopular ? 'text-white' : 'text-gray-200'}`}>
          {title}
        </h3>
        <p className="text-gray-400 text-sm leading-relaxed min-h-[48px] px-4">{description}</p>
      </div>

      {/* Price Display */}
      <div className="mb-12 text-center">
        <div className="flex items-center justify-center gap-1">
          <span className="text-gray-400 text-sm font-medium mt-2">R$</span>
          <span className="text-6xl font-bold text-white tracking-tighter drop-shadow-2xl">
            {formatPrice(price)}
          </span>
        </div>
        <span className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-2 block">Por mês</span>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-900/20 border border-red-500/30 text-red-300 text-xs">
          {error}
        </div>
      )}

      {/* Features List */}
      <ul className="space-y-5 mb-12 flex-1">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-4 text-sm group/item">
            <div
              className={`mt-0.5 shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                feature.included ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-800 text-gray-600'
              }`}
            >
              {feature.included ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={3} />}
            </div>
            <span
              className={`transition-colors duration-300 ${
                feature.included
                  ? 'text-gray-300 group-hover/item:text-white'
                  : 'text-gray-600 line-through'
              }`}
            >
              {feature.text}{' '}
              {feature.highlight && (
                <span className="text-[9px] font-bold uppercase bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-lg ml-2 border border-blue-500/20 tracking-tighter">
                  {feature.highlight}
                </span>
              )}
            </span>
            {feature.icon && (
              <div className="ml-auto text-blue-400/50 group-hover/item:text-blue-400 transition-colors">
                {feature.icon}
              </div>
            )}
          </li>
        ))}
      </ul>

      {/* Action Buttons */}
      <div className="space-y-3">
        {/* 12x Parcelado Button */}
        <button
          onClick={handleParcelado}
          disabled={loading}
          className={`w-full py-4 px-4 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] transition-all duration-300 active:scale-95 flex items-center justify-center gap-2
          ${featured || isPopular
            ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-500/25 border border-white/10'
            : 'bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/30'
          }
          ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processando...
            </>
          ) : (
            <>
              💳 12x de R$ {(price / 12).toFixed(2).replace('.', ',')}
            </>
          )}
        </button>

        {/* R$ XX/mês Button */}
        <button
          onClick={handleMensal}
          disabled={loading}
          className={`w-full py-4 px-4 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] transition-all duration-300 active:scale-95 flex items-center justify-center gap-2
          ${featured || isPopular
            ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
            : 'bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/30'
          }
          ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processando...
            </>
          ) : (
            <>
              📅 R$ {price.toFixed(2).replace('.', ',')} / mês
            </>
          )}
        </button>
      </div>
    </div>
  );
};
