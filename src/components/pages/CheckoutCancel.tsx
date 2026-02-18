/**
 * CheckoutCancel Component
 * Displayed when user cancels a Stripe payment
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Home } from 'lucide-react';

export const CheckoutCancel: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Alert Icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-amber-500/20 blur-2xl rounded-full"></div>
            <div className="relative w-24 h-24 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <AlertCircle size={48} className="text-amber-400" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <h1 className="text-4xl font-serif font-bold text-center mb-4">
          Pagamento Cancelado
        </h1>

        <p className="text-gray-400 text-center mb-8">
          Seu pagamento foi cancelado. Você pode tentar novamente a qualquer momento acessando os planos.
        </p>

        {/* Info Box */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
          <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            O que aconteceu?
          </h2>
          <ul className="space-y-3 text-sm text-gray-400">
            <li className="flex gap-2">
              <span className="text-amber-400">•</span>
              <span>Você cancelou o processo de pagamento</span>
            </li>
            <li className="flex gap-2">
              <span className="text-amber-400">•</span>
              <span>Nenhum valor foi cobrado</span>
            </li>
            <li className="flex gap-2">
              <span className="text-amber-400">•</span>
              <span>Você pode tentar novamente a qualquer momento</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' }) || navigate('/#pricing')}
          className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 mb-4 group"
        >
          <span>Voltar aos Planos</span>
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
        </button>

        <button
          onClick={() => navigate('/')}
          className="w-full py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-all duration-300 flex items-center justify-center gap-2"
        >
          <Home size={16} />
          <span>Voltar para Início</span>
        </button>

        {/* Help Text */}
        <p className="text-center text-gray-500 text-xs mt-8">
          Tendo problemas? Contate nosso suporte via WhatsApp.
        </p>
      </div>
    </div>
  );
};
