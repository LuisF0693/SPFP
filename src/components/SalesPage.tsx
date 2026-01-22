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
        <div className="h-screen w-full bg-black text-gray-200 font-sans selection:bg-blue-500/30 overflow-y-auto overflow-x-hidden scroll-smooth transition-all duration-500">

            {/* Background Ambience - Fixed with lower z-index */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[120px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-blue-900/10 blur-[120px] animate-pulse-slow font-delay-2000"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/5 via-black to-black"></div>
                <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }}></div>
            </div>

            <div className="relative z-10">
                {/* Header - Sticky */}
                <header className="sticky top-0 z-50 bg-black/50 backdrop-blur-xl border-b border-white/5">
                    <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                            <Logo variant="icon" size={32} />
                            <span className="font-serif font-bold text-xl tracking-tighter text-white">SPFP</span>
                        </div>

                        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
                            <button onClick={() => document.getElementById('benefits')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-white transition-colors">Benefícios</button>
                            <button onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-white transition-colors">Planos</button>
                        </nav>

                        <button
                            onClick={handleLoginClick}
                            className="px-6 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/50 hover:bg-blue-500/10 transition-all duration-300 text-xs font-bold tracking-widest uppercase"
                        >
                            Entrar
                        </button>
                    </div>
                </header>

                {/* Hero Section */}
                <section className="container mx-auto px-6 pt-24 pb-40 text-center relative overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-500/5 blur-[120px] rounded-full pointer-events-none"></div>

                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-900/20 border border-blue-500/20 mb-10 animate-fade-in relative z-10">
                        <span className="w-2 h-2 rounded-full bg-blue-400 mr-3 animate-pulse"></span>
                        <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-blue-300">Inteligência Patrimonial Premium</span>
                    </div>

                    <h1 className="text-5xl md:text-8xl font-serif font-bold text-white mb-8 leading-[1.1] tracking-tight max-w-5xl mx-auto animate-slide-up relative z-10">
                        Sua liberdade financeira <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-600 to-indigo-600">começa no controle</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed font-light mb-14 animate-fade-in delay-300 relative z-10">
                        Domine cada centavo com a tecnologia mais avançada em gestão de patrimônio. Simples o suficiente para o dia a dia, potente o suficiente para investidores.
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center gap-6 animate-fade-in delay-500 relative z-10">
                        <button
                            onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                            className="px-10 py-5 rounded-2xl bg-blue-600 text-white font-bold tracking-widest uppercase hover:bg-blue-500 hover:shadow-[0_0_40px_rgba(37,99,235,0.4)] transition-all duration-300 transform hover:-translate-y-1"
                        >
                            Ver Planos
                        </button>
                        <a
                            href="https://forms.gle/kvH4emTbExNZMt5S6"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-10 py-5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-medium tracking-wide transition-all duration-300 flex items-center justify-center gap-3 group"
                        >
                            <span>Agende uma análise gratuita</span>
                            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/40 transition-colors">
                                <ArrowRight size={16} className="text-blue-400 group-hover:translate-x-0.5 transition-transform" />
                            </div>
                        </a>
                    </div>

                    {/* Video Section Placeholder */}
                    <div className="mt-24 max-w-5xl mx-auto relative animate-fade-in delay-700">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                        <div className="relative aspect-video rounded-[2.5rem] bg-gray-900 border border-white/10 overflow-hidden shadow-2xl flex items-center justify-center">
                            {/* Este é o espaço para o vídeo que você enviará */}
                            <div className="text-center p-8">
                                <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-6 border border-blue-500/30">
                                    <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[15px] border-l-blue-400 border-b-[10px] border-b-transparent ml-1"></div>
                                </div>
                                <h3 className="text-2xl font-serif font-bold text-white mb-2">Vídeo de Apresentação</h3>
                                <p className="text-gray-500 font-light">Espaço reservado para o vídeo institucional</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Benefits / Features Section */}
                <section id="benefits" className="py-32 border-y border-white/5 bg-white/[0.02]">
                    <div className="container mx-auto px-6">
                        <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
                            <BenefitCard
                                icon={<Bot size={32} className="text-blue-400" />}
                                title="Inteligência Artificial"
                                text="Consultor dedicado que analisa seus padrões de gastos e sugere otimizações automáticas."
                            />
                            <BenefitCard
                                icon={<MessageCircle size={32} className="text-indigo-400" />}
                                title="Suporte via WhatsApp"
                                text="Dúvidas? Nosso time de especialistas está a um clique de distância pronto para ajudar."
                            />
                            <BenefitCard
                                icon={<Calendar size={32} className="text-blue-500" />}
                                title="Gestão 360º"
                                text="Desde o café da manhã até seus investimentos complexos. Tudo em uma só tela."
                            />
                        </div>
                    </div>
                </section>

                {/* Pricing Section */}
                <section id="pricing" className="container mx-auto px-6 py-32">
                    <div className="text-center mb-24">
                        <h2 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6">Investimento no seu futuro</h2>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto font-light">
                            Escolha o plano que melhor se adapta ao seu momento financeiro.
                            <span className="block mt-2 italic text-blue-400 font-medium">Sem multas, sem pegadinhas.</span>
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                        {/* Plan 1: 99,90 */}
                        <PricingCard
                            title="Essencial"
                            price="99,90"
                            description="Ideal para quem busca organização e simplicidade."
                            features={[
                                { text: "Direito somente ao App", included: true },
                                { text: "Whatsapp Limitado", included: true, highlight: "Suporte" },
                                { text: "Controle de Gastos", included: true },
                                { text: "Gerenciamento Manual", included: true },
                                { text: "Conexão Bancária", included: false },
                                { text: "Consultor IA", included: false },
                            ]}
                        />

                        {/* Plan 2: 149,90 - Featured */}
                        <PricingCard
                            title="Estratégico"
                            price="149,90"
                            description="Para quem quer crescer patrimônio com ajuda da IA."
                            featured={true}
                            features={[
                                { text: "Tudo do plano Essencial", included: true },
                                { text: "Consultor IA 24/7", included: true, icon: <Bot size={16} /> },
                                { text: "Suporte via WhatsApp", included: true, highlight: "Premium" },
                                { text: "Análise de Portfólio", included: true },
                                { text: "Indicação de Otimização", included: true },
                                { text: "Consultoria Individual", included: false },
                            ]}
                        />

                        {/* Plan 3: 349,90 */}
                        <PricingCard
                            title="Wealth Mentor"
                            price="349,90"
                            description="Gestão de elite com acompanhamento personalizado."
                            features={[
                                { text: "Tudo do plano Estratégico", included: true },
                                { text: "Whatsapp Ilimitado", included: true, icon: <MessageCircle size={16} /> },
                                { text: "Consultoria Individual", included: true, icon: <Users size={16} /> },
                                { text: "Mentoria de Aulas", included: true },
                                { text: "Reuniões Semanais e Mensais", included: true, icon: <Calendar size={16} /> },
                                { text: "Planejador Exclusivo", included: true },
                            ]}
                        />
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-32 container mx-auto px-6">
                    <div className="max-w-5xl mx-auto p-12 md:p-20 rounded-[3rem] bg-gradient-to-br from-blue-600 to-indigo-900 relative overflow-hidden text-center group">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                        <div className="relative z-10">
                            <h2 className="text-4xl md:text-6xl font-serif font-bold text-white mb-8">Pronto para assumir o controle?</h2>
                            <p className="text-blue-100 text-lg mb-12 max-w-2xl mx-auto opacity-90 leading-relaxed font-light">
                                Junte-se a centenas de pessoas que transformaram sua relação com o dinheiro usando a metodologia SPFP.
                            </p>
                            <button
                                onClick={handleLoginClick}
                                className="px-12 py-5 rounded-2xl bg-white text-blue-900 font-bold tracking-widest uppercase hover:bg-gray-100 hover:scale-105 transition-all shadow-2xl"
                            >
                                Criar conta agora
                            </button>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-white/5 bg-black py-20">
                    <div className="container mx-auto px-6">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-12">
                            <div className="flex flex-col items-center md:items-start gap-4">
                                <Logo variant="full" size={40} />
                                <p className="text-gray-500 text-sm max-w-xs text-center md:text-left">
                                    A plataforma definitiva para quem leva seu patrimônio a sério.
                                </p>
                            </div>
                            <div className="flex gap-12 text-sm text-gray-500 uppercase tracking-widest font-bold">
                                <a href="#" className="hover:text-blue-400 transition-colors">Privacidade</a>
                                <a href="#" className="hover:text-blue-400 transition-colors">Termos</a>
                                <a href="#" className="hover:text-blue-400 transition-colors">Contato</a>
                            </div>
                        </div>
                        <div className="mt-20 pt-8 border-t border-white/5 text-center text-gray-600 text-xs">
                            © 2026 SPFP - Planejador Financeiro Pessoal. Todos os direitos reservados.
                        </div>
                    </div>
                </footer>

            </div>
        </div>
    );
};

const BenefitCard: React.FC<{ icon: React.ReactNode, title: string, text: string }> = ({ icon, title, text }) => (
    <div className="p-10 rounded-3xl bg-white/[0.03] border border-white/5 hover:border-blue-500/30 transition-all duration-300 group">
        <div className="p-4 w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
            {icon}
        </div>
        <h3 className="text-2xl font-serif font-bold text-white mb-4 tracking-tight">{title}</h3>
        <p className="text-gray-400 leading-relaxed font-light">{text}</p>
    </div>
);

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
        <div className={`relative p-10 rounded-[2.5rem] border flex flex-col transition-all duration-500 hover:-translate-y-3 group
      ${featured
                ? 'bg-gradient-to-b from-blue-900/20 to-black border-blue-500/50 shadow-[0_40px_100px_rgba(37,99,235,0.15)] ring-1 ring-blue-500/30'
                : 'bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.05]'
            }`}
        >
            {featured && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-full shadow-lg">
                    Mais Popular
                </div>
            )}

            <div className="mb-10 text-center">
                <h3 className={`text-3xl font-serif font-bold mb-3 ${featured ? 'text-white' : 'text-gray-200'}`}>{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed min-h-[48px] px-4">{description}</p>
            </div>

            <div className="mb-12 text-center">
                <div className="flex items-center justify-center gap-1">
                    <span className="text-gray-400 text-sm font-medium mt-2">R$</span>
                    <span className="text-6xl font-bold text-white tracking-tighter drop-shadow-2xl">{price.split(',')[0]}</span>
                    <span className="text-2xl font-bold text-blue-400/80">,{price.split(',')[1]}</span>
                </div>
                <span className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-2 block">Por mês</span>
            </div>

            <ul className="space-y-5 mb-12 flex-1">
                {features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-4 text-sm group/item">
                        <div className={`mt-0.5 shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${feature.included ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-800 text-gray-600'}`}>
                            {feature.included ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={3} />}
                        </div>
                        <span className={`transition-colors duration-300 ${feature.included ? 'text-gray-300 group-hover/item:text-white' : 'text-gray-600 line-through'}`}>
                            {feature.text} {feature.highlight && <span className="text-[9px] font-bold uppercase bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-lg ml-2 border border-blue-500/20 tracking-tighter">{feature.highlight}</span>}
                        </span>
                        {feature.icon && <div className="ml-auto text-blue-400/50 group-hover/item:text-blue-400 transition-colors">{feature.icon}</div>}
                    </li>
                ))}
            </ul>

            <button className={`w-full py-5 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] transition-all duration-300 active:scale-95
        ${featured
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-500/25 border border-white/10'
                    : 'bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/30'
                }`}
            >
                Assinar Agora
            </button>
        </div>
    );
};
