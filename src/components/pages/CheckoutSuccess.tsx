/**
 * CheckoutSuccess Component
 * Displayed after successful Stripe payment
 * Handles both installment and subscription payments
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFinance } from '../../hooks/useSafeFinance';

export const CheckoutSuccess: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);

  const paymentType = searchParams.get('type') || 'checkout';
  const sessionId = searchParams.get('session_id');

  const handleContinue = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Success Icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-green-500/20 blur-2xl rounded-full"></div>
            <div className="relative w-24 h-24 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
              <CheckCircle size={48} className="text-green-400" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <h1 className="text-4xl font-serif font-bold text-center mb-4">
          Parabéns!
        </h1>

        <p className="text-gray-400 text-center mb-6">
          {paymentType === 'subscription'
            ? 'Sua assinatura foi criada com sucesso. Você já pode acessar todos os recursos premium.'
            : 'Seu pagamento foi processado com sucesso. Você já pode acessar o SPFP.'}
        </p>

        {/* Confirmation Details */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
              <span className="text-gray-300">
                {paymentType === 'subscription' ? 'Assinatura ativada' : 'Acesso liberado'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
              <span className="text-gray-300">Email de confirmação enviado</span>
            </div>
            {paymentType === 'subscription' && (
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                <span className="text-gray-300">Renovação automática ativada</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <button
          onClick={handleContinue}
          className="w-full py-4 rounded-2xl bg-green-600 hover:bg-green-500 text-white font-bold tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 mb-4 group"
        >
          <span>Acessar Dashboard</span>
          <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
        </button>

        <button
          onClick={() => navigate('/login')}
          className="w-full py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-all duration-300"
        >
          Voltar para Login
        </button>

        {/* Help Text */}
        <p className="text-center text-gray-500 text-xs mt-8">
          Dúvidas? Entre em contato com nosso suporte via WhatsApp.
        </p>
      </div>
    </div>
  );
};
