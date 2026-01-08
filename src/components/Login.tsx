
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Logo } from './Logo';
import { Mail, Lock, User as UserIcon, ArrowRight, Loader, AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const { signInWithEmail, registerWithEmail } = useAuth();

  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!email || !password) {
      setError('Preencha todos os campos.');
      setIsLoading(false);
      return;
    }

    if (isRegistering && !name) {
      setError('Por favor, informe seu nome.');
      setIsLoading(false);
      return;
    }

    try {
      if (isRegistering) {
        await registerWithEmail(email, password, name);
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err: any) {
      console.error("Auth Error:", err);
      if (err.message.includes('Invalid login credentials')) {
        setError('Credenciais inválidas. Verifique seu e-mail e senha.');
      } else if (err.message.includes('Email not confirmed')) {
        setError('E-mail não confirmado. Verifique sua caixa de entrada.');
      } else if (err.message.includes('User already registered')) {
        setError('Usuário já cadastrado.');
      } else {
        setError(err.message || 'Ocorreu um erro ao tentar autenticar.');
      }
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError('');
    setName('');
    setEmail('');
    setPassword('');
  };

  return (
    <div className="min-h-screen w-full flex bg-black text-gray-200 font-sans">
      {/* Lado Esquerdo - Branding Imersivo */}
      <div className="hidden lg:flex lg:w-1/2 bg-black relative overflow-hidden items-center justify-center p-12 border-r border-white/5">
        <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
          {/* Background Patterns Neon */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[120px]"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full bg-blue-900/10 blur-[120px]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/5 via-black to-black"></div>

          {/* Animated Grid Lines (Sutil) */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '50px 50px' }}></div>
        </div>

        <div className="relative z-10 w-full max-w-lg text-center animate-fade-in">
          <Logo variant="full" size={120} className="mb-8" />

          <p className="text-lg text-gray-400 leading-relaxed font-light mt-12 max-w-sm mx-auto">
            Controle absoluto, inteligência financeira e visão de futuro integrada em uma única plataforma premium.
          </p>

          <div className="mt-16 flex justify-center space-x-8 opacity-40">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-blue-500 self-center"></div>
            <span className="text-[10px] tracking-[0.4em] uppercase font-bold text-blue-400">Exclusividade</span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-blue-500 self-center"></div>
          </div>
        </div>
      </div>

      {/* Lado Direito - Login Form Glassmorphism */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 animate-fade-in bg-black">
        <div className="w-full max-w-md space-y-8 glass p-8 sm:p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
          {/* Efeito de brilho na borda superior */}
          <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>

          <div className="text-center lg:hidden mb-10">
            <Logo variant="full" size={60} />
          </div>

          <div className="text-center">
            <h2 className="text-3xl font-serif font-bold text-white tracking-tight">
              {isRegistering ? 'Criar Conta Premium' : 'Bem-vindo de Volta'}
            </h2>
            <p className="text-sm text-gray-400 mt-3 font-light">
              {isRegistering ? 'Inicie sua gestão de patrimônio hoje' : 'Acesse seu painel exclusivo'}
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 text-red-400 p-4 rounded-2xl text-xs font-medium text-center border border-red-500/20 animate-fade-in flex items-center justify-center">
              <AlertCircle size={16} className="mr-2 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {isRegistering && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-2 tracking-widest">Seu Nome</label>
                <div className="relative group">
                  <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-accent transition-colors" size={18} />
                  <input
                    type="text"
                    className="w-full pl-14 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all text-white placeholder-gray-600 font-medium"
                    placeholder="Nome completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-2 tracking-widest">E-mail Corporativo</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-accent transition-colors" size={18} />
                <input
                  type="email"
                  className="w-full pl-14 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all text-white placeholder-gray-600 font-medium"
                  placeholder="seu@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-2 tracking-widest">Senha</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-accent transition-colors" size={18} />
                <input
                  type="password"
                  className="w-full pl-14 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all text-white placeholder-gray-600 font-medium"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center premium-gradient text-white font-bold py-5 rounded-2xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-8 border border-white/10"
            >
              {isLoading ? (
                <Loader className="animate-spin" size={24} />
              ) : (
                <span className="flex items-center text-sm tracking-widest uppercase">
                  {isRegistering ? 'Criar Conta' : 'Acessar Sistema'}
                  <ArrowRight className="ml-3" size={18} />
                </span>
              )}
            </button>
          </form>

          <div className="text-center pt-8 border-t border-white/5">
            <p className="text-sm text-gray-500 font-medium">
              {isRegistering ? 'Já possui acesso exclusivo?' : 'Ainda não é membro?'}
              <button
                onClick={toggleMode}
                className="ml-2 text-accent font-bold hover:text-white transition-colors focus:outline-none uppercase text-xs tracking-wider"
              >
                {isRegistering ? 'Login' : 'Solicitar Acesso'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
