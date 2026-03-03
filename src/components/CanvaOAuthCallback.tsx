/**
 * CanvaOAuthCallback.tsx
 * Processa o retorno do OAuth do Canva em /oauth/canva/callback
 * Troca o authorization code por tokens via Edge Function e redireciona
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { exchangeCode } from '../services/canvaService';

const CanvaOAuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      setStatus('error');
      setErrorMsg(error === 'access_denied'
        ? 'Autorização negada. Você cancelou a conexão com o Canva.'
        : `Erro do Canva: ${error}`);
      return;
    }

    if (!code || !state) {
      setStatus('error');
      setErrorMsg('Resposta inválida do Canva — parâmetros ausentes.');
      return;
    }

    exchangeCode(code, state)
      .then(() => {
        setStatus('success');
        setTimeout(() => navigate('/company?tab=marketing'), 2000);
      })
      .catch((err: Error) => {
        setStatus('error');
        setErrorMsg(err.message);
      });
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-[#080812] flex items-center justify-center">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-10 max-w-md w-full text-center space-y-4">
        {status === 'loading' && (
          <>
            <Loader2 className="mx-auto animate-spin text-accent" size={48} />
            <h2 className="text-xl font-bold text-white">Conectando ao Canva...</h2>
            <p className="text-gray-400 text-sm">Trocando tokens de acesso. Aguarde.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="mx-auto text-green-400" size={48} />
            <h2 className="text-xl font-bold text-white">Canva conectado!</h2>
            <p className="text-gray-400 text-sm">
              Conta Canva vinculada com sucesso. Redirecionando para o Marketing Hub...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="mx-auto text-red-400" size={48} />
            <h2 className="text-xl font-bold text-white">Falha na conexão</h2>
            <p className="text-gray-400 text-sm">{errorMsg}</p>
            <button
              onClick={() => navigate('/company?tab=marketing')}
              className="mt-4 px-6 py-2 bg-accent/10 border border-accent/20 rounded-xl text-accent text-sm font-medium hover:bg-accent/20 transition-colors"
            >
              Voltar ao Marketing Hub
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default CanvaOAuthCallback;
