import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from './Logo';
import { Check, X, ArrowRight, MessageCircle, Bot, Users, Calendar } from 'lucide-react';

export const SalesPage: React.FC = () => {
    const navigate = useNavigate();

    const handleLoginClick = () => {
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-black text-gray-200 font-sans selection:bg-blue-500/30">

            {/* Background Ambience */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] rounded-full bg-blue-600/10 blur-[120px]"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full bg-blue-900/10 blur-[120px]"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/5 via-black to-black"></div>
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '50px 50px' }}></div>
            </div>

            <div className="relative z-10">
                {/* Header */}
                <header className="container mx-auto px-6 py-6 flex justify-between items-center">
                    <Logo variant="icon" showText={true} size={40} />
                    <button
                        onClick={handleLoginClick}
                        className="px-6 py-2 rounded-full border border-white/10 hover:border-blue-500/50 hover:bg-blue-500/10 transition-all duration-300 text-sm font-medium tracking-wide uppercase"
                    >
                        Entrar
                    </button>
                </header>

                {/* Hero Section */}
                <section className="container mx-auto px-6 pt-20 pb-32 text-center">
                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-900/20 border border-blue-500/20 mb-8 animate-fade-in">
                        <span className="w-2 h-2 rounded-full bg-blue-400 mr-3 animate-pulse"></span>
                        <span className="text-xs font-bold tracking-widest uppercase text-blue-300">Liberdade Financeira Premium</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-8 leading-tight tracking-tight max-w-4xl mx-auto">
                        O futuro da sua <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">liberdade financeira</span> está aqui
                    </h1>

                    <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed font-light mb-12">
                        Controle, inteligência e visão de futuro. O sistema definitivo para gestão do seu patrimônio com tecnologia de ponta e interface intuitiva.
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center gap-6">
                        <button
                            onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-800 text-white font-bold tracking-widest uppercase hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] transition-all duration-300 transform hover:-translate-y-1"
                        >
                            Começar Agora
                        </button>
                        <button
                            className="px-8 py-4 rounded-2xl border border-white/10 hover:bg-white/5 text-white font-medium tracking-wide transition-all duration-300 flex items-center justify-center gap-2 group"
                        >
                            <span>Ver Demonstração</span>
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </section>

                {/* Pricing Section */}
                <section id="pricing" className="container mx-auto px-6 py-24">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">Escolha o seu plano</h2>
                        <p className="text-gray-400 max-w-xl mx-auto">Tudo separado, transparente e objetivo.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {/* Plan 1: 99,90 */}
                        <PricingCard
                            title="Básico"
                            price="99,90"
                            description="Acesso essencial para começar sua jornada."
                            features={[
                                { text: "Direito somente ao App", included: true },
                                { text: "Whatsapp Limitado", included: true, highlight: "Limitado" },
                                { text: "Conexão Bancária", included: true },
                                { text: "Consultor IA", included: false },
                                { text: "Consultoria Individual", included: false },
                            ]}
                        />

                        {/* Plan 2: 149,90 - Featured */}
                        <PricingCard
                            title="Pro IA"
                            price="149,90"
                            description="Potencialize seus resultados com Inteligência Artificial."
                            featured={true}
                            features={[
                                { text: "Acesso total ao App", included: true },
                                { text: "Consultor IA Dedicado", included: true, icon: <Bot size={16} /> },
                                { text: "Dúvidas no Zap", included: true, highlight: "Limitado" },
                                { text: "Suporte Prioritário", included: true },
                                { text: "Consultoria Individual", included: false },
                                { text: "Planejador Próprio", included: false },
                            ]}
                        />

                        {/* Plan 3: 349,90 */}
                        <PricingCard
                            title="Wealth Exclusive"
                            price="349,90"
                            description="Acompanhamento 360º para máxima performance."
                            features={[
                                { text: "Acesso Vitalício ao App", included: true },
                                { text: "Consultor IA Ilimitado", included: true },
                                { text: "Consultoria Individual", included: true, icon: <Users size={16} /> },
                                { text: "Aulas Exclusivas", included: true },
                                { text: "Reuniões Semanais e Mensais", included: true, icon: <Calendar size={16} /> },
                                { text: "Planejador Próprio", included: true },
                                { text: "Whatsapp Ilimitado", included: true, icon: <MessageCircle size={16} /> },
                            ]}
                        />
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-white/5 bg-black/50 backdrop-blur-xl mt-24">
                    <div className="container mx-auto px-6 py-12">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                            <div className="flex items-center gap-2">
                                <Logo variant="icon" size={24} />
                                <span className="text-gray-400 text-sm">© 2026 SPFP - Todos os direitos reservados.</span>
                            </div>
                        </div>
                    </div>
                </footer>

            </div>
        </div>
    );
};

interface PricingCardProps {
    title: string;
    price: string;
    description: string;
    features: {
        text: string;
        included: boolean;
        highlight?: string;
        icon?: React.ReactNode;
    }[];
    featured?: boolean;
}

const PricingCard: React.FC<PricingCardProps> = ({ title, price, description, features, featured = false }) => {
    return (
        <div className={`relative p-8 rounded-3xl border flex flex-col transition-all duration-300 hover:-translate-y-2 group
      ${featured
                ? 'bg-blue-900/10 border-blue-500/50 shadow-[0_0_50px_rgba(37,99,235,0.15)] ring-1 ring-blue-500/30'
                : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
            }`}
        >
            {featured && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg">
                    Recomendado
                </div>
            )}

            <div className="mb-8">
                <h3 className={`text-2xl font-serif font-bold mb-2 ${featured ? 'text-white' : 'text-gray-200'}`}>{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed min-h-[40px]">{description}</p>
            </div>

            <div className="mb-8">
                <span className="text-4xl font-bold text-white tracking-tight">R$ {price}</span>
            </div>

            <ul className="space-y-4 mb-8 flex-1">
                {features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm">
                        <div className={`mt-0.5 shrink-0 ${feature.included ? 'text-blue-400' : 'text-gray-600'}`}>
                            {feature.included ? <Check size={16} /> : <X size={16} />}
                        </div>
                        <span className={`${feature.included ? 'text-gray-300' : 'text-gray-600 line-through'}`}>
                            {feature.text} {feature.highlight && <span className="text-xs uppercase bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded ml-2">{feature.highlight}</span>}
                        </span>
                        {feature.icon && <div className="ml-auto text-blue-400 opacity-80">{feature.icon}</div>}
                    </li>
                ))}
            </ul>

            <button className={`w-full py-4 rounded-xl font-bold text-sm uppercase tracking-wider transition-all duration-300
        ${featured
                    ? 'bg-blue-500 hover:bg-blue-400 text-white shadow-lg shadow-blue-500/25'
                    : 'bg-transparent border border-white/20 text-white hover:bg-white/10'
                }`}
            >
                Assinar Agora
            </button>
        </div>
    );
};
