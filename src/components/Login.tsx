
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Logo } from './Logo';
import { Mail, Lock, User as UserIcon, ArrowRight, Loader, AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const { signInWithGoogle, signInWithEmail, registerWithEmail } = useAuth();

  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error("Google Login Error:", err);
      if (err.code === 'auth/unauthorized-domain') {
        setError('Domínio não autorizado. Adicione este domínio no Firebase Console (Authentication > Settings > Authorized Domains).');
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError('Login cancelado.');
      } else {
        setError(`Erro no login Google: ${err.message}`);
      }
      setIsLoading(false);
    }
  };

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
      // Supabase error handling
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
    <div className="min-h-screen w-full flex bg-black text-gray-200">
      {/* Lado Esquerdo - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-black relative overflow-hidden items-center justify-center p-12 border-r border-gray-900">
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
          {/* Background Patterns Neon */}
          <div className="absolute top-10 right-10 w-96 h-96 rounded-full border border-blue-500/30 blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-[500px] h-[500px] rounded-full bg-blue-900/20 blur-[100px]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-black to-black"></div>
        </div>

        <div className="relative z-10 max-w-lg text-center">
          <div className="mb-10 inline-block p-8 rounded-full bg-blue-900/10 border border-blue-500/20 shadow-[0_0_40px_rgba(59,130,246,0.3)]">
            <Logo className="text-accent" size={130} />
          </div>
          <h1 className="text-7xl font-serif font-bold mb-4 tracking-wider text-white drop-shadow-[0_0_15px_rgba(59,130,246,0.6)]">SPFP</h1>
          <p className="text-base text-blue-400 tracking-[0.2em] uppercase mb-8 border-b border-blue-900/50 pb-4 inline-block font-medium">
            Seu Planejador Financeiro Pessoal
          </p>
          <p className="text-lg text-gray-400 leading-relaxed font-light">
            Controle, inteligência e futuro. O sistema definitivo para gestão do seu patrimônio.
          </p>
        </div>
      </div>

      {/* Lado Direito - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 animate-fade-in overflow-y-auto bg-black">
        <div className="w-full max-w-md space-y-6 bg-[#0a0a0a] p-8 sm:p-10 rounded-3xl shadow-2xl border border-gray-900 relative">
          {/* Efeito de brilho sutil */}
          <div className="absolute -top-px left-10 right-10 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>

          <div className="text-center lg:hidden mb-6">
            <div className="inline-block p-4 rounded-2xl bg-blue-900/10 border border-blue-500/20 mb-4">
              <Logo className="text-accent" size={60} />
            </div>
            <h2 className="text-4xl font-serif font-bold text-white tracking-wider">SPFP</h2>
            <p className="text-xs text-blue-400 uppercase tracking-widest mt-1">Seu Planejador Financeiro Pessoal</p>
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-bold text-white">
              {isRegistering ? 'Iniciar Jornada' : 'Acessar Sistema'}
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              {isRegistering ? 'Crie seu perfil financeiro seguro' : 'Entre com suas credenciais'}
            </p>
          </div>

          {error && (
            <div className="bg-red-900/20 text-red-400 p-3 rounded-lg text-xs font-medium text-center border border-red-500/20 animate-fade-in flex items-center justify-center">
              <AlertCircle size={16} className="mr-2 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase ml-1 tracking-wider">Nome</label>
                <div className="relative group">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-accent transition-colors" size={18} />
                  <input
                    type="text"
                    className="w-full pl-12 pr-4 py-3 bg-[#111] border border-gray-800 rounded-xl outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 transition-all text-white placeholder-gray-600"
                    placeholder="Seu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase ml-1 tracking-wider">E-mail</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-accent transition-colors" size={18} />
                <input
                  type="email"
                  className="w-full pl-12 pr-4 py-3 bg-[#111] border border-gray-800 rounded-xl outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 transition-all text-white placeholder-gray-600"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase ml-1 tracking-wider">Senha</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-accent transition-colors" size={18} />
                <input
                  type="password"
                  className="w-full pl-12 pr-4 py-3 bg-[#111] border border-gray-800 rounded-xl outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 transition-all text-white placeholder-gray-600"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center bg-accent text-white font-bold py-4 rounded-xl transition-all duration-200 hover:bg-blue-600 transform active:scale-[0.98] shadow-[0_0_20px_rgba(59,130,246,0.3)] disabled:opacity-50 disabled:cursor-not-allowed mt-4 border border-blue-400/20"
            >
              {isLoading ? (
                <Loader className="animate-spin" size={24} />
              ) : (
                <span className="flex items-center">
                  {isRegistering ? 'CADASTRAR' : 'ENTRAR'}
                  <ArrowRight className="ml-2" size={18} />
                </span>
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-800"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-wider">
              <span className="px-2 bg-[#0a0a0a] text-gray-600">Ou entre com</span>
            </div>
          </div>

          <div>
            <button
              onClick={handleGoogleLogin}
              type="button"
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-3 bg-[#111] border border-gray-800 hover:bg-[#1a1a1a] hover:border-gray-700 text-gray-300 font-medium py-3 px-4 rounded-xl transition-all duration-200"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.63c1.61 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.09 14.97 0 12 0 7.7 0 3.99 2.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Google</span>
            </button>
          </div>

          <div className="text-center pt-2">
            <p className="text-sm text-gray-500">
              {isRegistering ? 'Já possui acesso?' : 'Não possui conta?'}
              <button
                onClick={toggleMode}
                className="ml-2 text-accent font-bold hover:text-blue-400 transition-colors focus:outline-none uppercase text-xs tracking-wider"
              >
                {isRegistering ? 'Login' : 'Criar Conta'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
