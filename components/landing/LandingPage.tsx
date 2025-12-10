
import React, { useEffect, useRef, useState } from 'react';
import { SparkleIcon, HeartIcon, CheckCircleIcon, CrownIcon, StarIcon, TrophyIcon, QuoteIcon, UserCircleIcon, FlameIcon, ArrowRightIcon, ChevronDownIcon } from '../Icons';
import { usePageTracking } from '../../hooks/usePageTracking';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { AppConfig } from '../../types';

interface LandingPageProps {
    onGetStarted: () => void;
    onLoginClick?: () => void;
    onShowTerms?: () => void;
    onShowPrivacy?: () => void;
}

const faqs = [
    {
        question: "Tenho alguma garantia?",
        answer: "Sim! Você tem 7 dias de garantia incondicional. Se não sentir que o Inspira+ está transformando seus dias, basta solicitar o reembolso diretamente na plataforma de pagamento ou via suporte. Sem perguntas."
    },
    {
        question: "É seguro colocar meu cartão?",
        answer: "Totalmente. O pagamento é processado por uma das maiores plataformas de produtos digitais do mundo (como Hotmart/Kiwify), que utiliza criptografia de ponta e segurança bancária. Nós não temos acesso aos seus dados financeiros."
    },
    {
        question: "Vou ter tempo de usar o app?",
        answer: "Com certeza. O Inspira+ foi criado justamente para mulheres ocupadas. O método funciona com micro-doses de 30 segundos por dia."
    },
    {
        question: "Como funciona o cancelamento?",
        answer: "Você tem total controle. Você pode gerenciar sua renovação diretamente pelo link recebido no seu e-mail de compra ou falando com nosso suporte humanizado."
    },
    {
        question: "O conteúdo é atualizado?",
        answer: "Sim, diariamente! Nossa inteligência artificial gera reflexões únicas baseadas no seu momento atual, e nossa curadoria humana adiciona novos temas toda semana. Você nunca ficará sem inspiração nova."
    },
    {
        question: "E se eu precisar de ajuda?",
        answer: "Você nunca estará sozinha. Nosso suporte é 100% humanizado, feito por pessoas reais prontas para te ouvir e resolver qualquer dúvida com carinho e agilidade."
    }
];

const ScrollFade: React.FC<{ children: React.ReactNode; delay?: string }> = ({ children, delay = '0s' }) => {
    const [isVisible, setVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setVisible(true);
                observer.unobserve(entry.target);
            }
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
        
        if (ref.current) observer.observe(ref.current);
        
        return () => {
            if (ref.current) observer.disconnect();
        };
    }, []);

    return (
        <div 
            ref={ref} 
            className={`transition-all duration-1000 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
            style={{ transitionDelay: delay }}
        >
            {children}
        </div>
    );
};

const TestimonialCard: React.FC<{ text: string; author: string; label: string }> = ({ text, author, label }) => (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 md:p-8 rounded-3xl relative hover:bg-white/10 transition-colors duration-300 flex flex-col h-full justify-between">
        <div>
            <div className="flex gap-1 mb-4">
                {[1,2,3,4,5].map(i => <StarIcon key={i} className="text-amber-400 text-xs md:text-sm" filled />)}
            </div>
            <p className="text-gray-200 mb-6 leading-relaxed text-base md:text-lg font-light font-serif">"{text}"</p>
        </div>
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-violet-50 to-fuchsia-500 flex items-center justify-center font-bold text-white shadow-lg text-lg font-sans">
                {author.charAt(0)}
            </div>
            <div>
                <p className="text-white font-bold text-sm md:text-base font-sans">{author}</p>
                <p className="text-xs text-violet-300 font-medium uppercase tracking-wider font-sans">{label}</p>
            </div>
        </div>
    </div>
);

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLoginClick, onShowTerms, onShowPrivacy }) => {
    usePageTracking('/landingpage');
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
    const [config, setConfig] = useState<AppConfig>({
        monthlyPrice: '14,90',
        annualPrice: '9,90',
        annualTotal: '118,80',
        checkoutLinkMonthly: '',
        checkoutLinkAnnual: '',
        whatsappLink: ''
    });

    useEffect(() => {
        // Prevent SecurityError in sandboxed environments (blob URLs)
        if (window.location.href.includes('blob:')) return;

        // Ensure the URL is correct for the landing page
        if (window.location.pathname !== '/landingpage') {
            try {
                window.history.replaceState({}, '', '/landingpage');
            } catch (e) {
                // Silently ignore navigation errors in restricted environments
            }
        }
    }, []);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const docRef = doc(db, "settings", "appConfig");
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setConfig(docSnap.data() as AppConfig);
                }
            } catch (error: any) {
                if (error.code !== 'permission-denied') {
                    console.error("Error loading pricing config", error);
                }
            }
        };
        fetchConfig();
    }, []);

    const toggleFaq = (index: number) => {
        setOpenFaqIndex(openFaqIndex === index ? null : index);
    };

    const handlePlanClick = (type: 'monthly' | 'annual') => {
        const link = type === 'monthly' ? config.checkoutLinkMonthly : config.checkoutLinkAnnual;
        if (link && link.startsWith('http')) {
            window.open(link, '_blank');
        } else {
            if (onLoginClick) onLoginClick();
        }
    };
    
    return (
        <div className="w-full h-full overflow-y-auto bg-[#050505] text-gray-100 font-sans selection:bg-violet-500/30 selection:text-white scrollbar-hide relative">
            
            {/* Global Noise Texture */}
            <div className="fixed inset-0 bg-noise opacity-[0.03] pointer-events-none z-50"></div>

            {/* --- NAVIGATION --- */}
            <nav className="fixed top-0 w-full z-40 px-4 md:px-6 py-4 flex justify-between items-center bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 transition-all duration-300">
                <div className="flex items-center gap-2 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(124,58,237,0.5)] group-hover:scale-110 transition-transform">
                        <SparkleIcon className="text-lg" />
                    </div>
                    <span className="text-xl font-bold font-sans tracking-tight text-white">Inspira<span className="text-violet-500">+</span></span>
                </div>
                <button 
                    onClick={onLoginClick}
                    className="px-5 py-2 rounded-full bg-white text-black text-sm font-bold font-sans hover:bg-gray-200 hover:scale-105 active:scale-95 transition-all shadow-lg"
                >
                    Entrar
                </button>
            </nav>

            {/* --- HERO SECTION --- */}
            <header className="relative min-h-[90vh] flex flex-col justify-center items-center px-6 pt-32 pb-28 overflow-hidden">
                {/* Abstract Background Orbs */}
                <div className="absolute top-[20%] left-[-10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-violet-800/20 rounded-full blur-[100px] pointer-events-none animate-pulse-slow"></div>
                <div className="absolute bottom-[10%] right-[-10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-fuchsia-800/10 rounded-full blur-[100px] pointer-events-none"></div>
                
                <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8 md:space-y-10">
                    <ScrollFade>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-[10px] md:text-[11px] font-bold tracking-[0.2em] uppercase mb-4 backdrop-blur-md shadow-[0_0_20px_rgba(139,92,246,0.15)] font-sans">
                            <SparkleIcon className="text-sm" /> Método Comprovado
                        </div>
                    </ScrollFade>

                    <ScrollFade delay="100ms">
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-sans font-extrabold text-white leading-[1.1] tracking-tight drop-shadow-2xl">
                            Acorda com peso no peito pensando: <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-300 to-white pr-2">
                                "Mais um dia igual"?
                            </span>
                        </h1>
                    </ScrollFade>

                    <ScrollFade delay="200ms">
                        <p className="text-base md:text-xl text-gray-400 font-light leading-relaxed max-w-2xl mx-auto font-sans px-4">
                            Receba doses diárias, curtas e 100% brasileiras de motivação. <br className="hidden md:block"/>
                            <span className="text-white font-medium">Sem clichês. Sem pressão. Só você.</span>
                        </p>
                    </ScrollFade>

                    <ScrollFade delay="300ms">
                        <div className="flex flex-col items-center pt-8">
                            <button 
                                onClick={onGetStarted}
                                className="group relative w-auto px-8 md:px-10 py-3 md:py-4 bg-white text-black rounded-full font-bold font-sans text-base md:text-lg shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(255,255,255,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 overflow-hidden"
                            >
                                <span className="relative z-10">Começar Agora</span>
                                <ArrowRightIcon className="relative z-10 text-lg md:text-xl group-hover:translate-x-1 transition-transform" />
                                <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-white opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </button>
                        </div>
                    </ScrollFade>
                </div>
                
                {/* Scroll Indicator */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 animate-bounce opacity-30">
                    <div className="w-5 h-8 border-2 border-white rounded-full flex justify-center pt-2">
                        <div className="w-1 h-2 bg-white rounded-full"></div>
                    </div>
                </div>
            </header>

            {/* --- DOR ATUAL (PAIN POINTS) --- */}
            <section className="py-24 md:py-32 px-6 bg-gradient-to-b from-[#050505] to-[#0a0a0a]">
                <div className="max-w-6xl mx-auto">
                    <ScrollFade>
                        <div className="text-center mb-16 md:mb-20">
                            <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">Parece familiar?</h2>
                            <p className="text-gray-500 text-lg font-sans">Você não é a única que se sente assim.</p>
                        </div>
                    </ScrollFade>

                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <ScrollFade delay="100ms">
                            <div className="space-y-4 font-sans">
                                {[
                                    { icon: "😫", text: "Vive no piloto automático, só pagando boleto." },
                                    { icon: "🌪️", text: "Sente uma mistura de ansiedade, culpa e vazio." },
                                    { icon: "🥀", text: "Se sente 'fraca' por não manter hábitos." },
                                    { icon: "📱", text: "Compara sua vida com a perfeição das redes." },
                                    { icon: "⏳", text: "Medo de se arrepender de não ter tentado mais." }
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-5 items-center bg-[#111] p-5 rounded-2xl border border-white/5 hover:border-red-500/20 hover:bg-[#151111] transition-colors group">
                                        <span className="text-2xl grayscale group-hover:grayscale-0 transition-all opacity-70 group-hover:opacity-100">{item.icon}</span>
                                        <p className="text-gray-300 font-medium text-sm md:text-base">{item.text}</p>
                                    </div>
                                ))}
                            </div>
                        </ScrollFade>
                        
                        <ScrollFade delay="300ms">
                            <div className="relative mt-8 md:mt-0">
                                <div className="absolute inset-0 bg-violet-600/20 blur-[60px] rounded-full pointer-events-none"></div>
                                <div className="relative bg-[#111]/80 backdrop-blur-xl p-8 md:p-10 rounded-[2.5rem] border border-white/10 shadow-2xl">
                                    <QuoteIcon className="text-violet-500 text-5xl mb-6 opacity-50" />
                                    <h3 className="text-xl md:text-2xl text-white font-serif leading-relaxed mb-8">
                                        “Eu não consigo ser consistente. Todo mundo consegue, menos eu. Já tentei de tudo e sempre desisto.”
                                    </h3>
                                    <div className="flex items-center gap-3 mb-10">
                                        <div className="h-px bg-white/20 w-12"></div>
                                        <p className="text-[10px] md:text-xs text-gray-500 uppercase tracking-wider font-bold font-sans">A voz na sua cabeça</p>
                                    </div>
                                    
                                    <div className="bg-violet-500/10 rounded-2xl p-6 border border-violet-500/20">
                                        <p className="text-violet-300 font-bold mb-2 flex items-center gap-2 text-sm font-sans">
                                            <SparkleIcon /> A verdade libertadora:
                                        </p>
                                        <p className="text-gray-300 leading-relaxed text-sm md:text-base font-sans">
                                            Você não precisa virar outra pessoa. Você só precisa de um passo minúsculo, mas real.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </ScrollFade>
                    </div>
                </div>
            </section>

            {/* --- MECANISMO & PROMESSA --- */}
            <section className="py-24 md:py-32 px-6 relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
                
                <div className="max-w-6xl mx-auto relative z-10">
                    <div className="text-center mb-24 max-w-4xl mx-auto">
                        <ScrollFade>
                            <div className="w-16 h-16 md:w-20 md:h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                                <CrownIcon className="text-3xl md:text-4xl text-amber-500" />
                            </div>
                            <h2 className="text-2xl md:text-4xl lg:text-5xl font-serif text-white mb-8 leading-tight">
                                Em <span className="text-amber-400">30–60 dias</span> você vai olhar pra trás e se orgulhar da mulher que está voltando a ser.
                            </h2>
                        </ScrollFade>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 md:gap-8">
                        {[
                            {
                                title: "Personalização Real",
                                desc: "Para sua situação atual: 'mãe que voltou da licença', 'ansiedade no trabalho', ou 'recém-separada'.",
                                icon: <UserCircleIcon className="text-3xl text-white" />,
                                color: "from-violet-600 to-indigo-600"
                            },
                            {
                                title: "Sem Pressão",
                                desc: "Sem textão. Sem teorias complexas. Uma dose diária que te dá um passo tão pequeno que é impossível desistir.",
                                icon: <HeartIcon className="text-3xl text-white" filled />,
                                color: "from-pink-600 to-rose-600"
                            },
                            {
                                title: "Gente como a gente",
                                desc: "Conteúdo criado por mulheres reais que já passaram exatamente pelo que você está passando hoje.",
                                icon: <CheckCircleIcon className="text-3xl text-white" />,
                                color: "from-emerald-600 to-teal-600"
                            }
                        ].map((item, i) => (
                            <ScrollFade key={i} delay={`${i*150}ms`}>
                                <div className="group bg-[#151515] p-8 md:p-10 rounded-[2.5rem] border border-white/5 hover:border-white/20 transition-all duration-500 hover:-translate-y-2 h-full relative overflow-hidden font-sans">
                                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${item.color} blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity`}></div>
                                    
                                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg mb-8 group-hover:scale-110 transition-transform`}>
                                        {item.icon}
                                    </div>
                                    <h3 className="text-xl md:text-2xl font-bold text-white mb-4 font-sans">{item.title}</h3>
                                    <p className="text-gray-400 leading-relaxed text-sm md:text-base font-sans">{item.desc}</p>
                                </div>
                            </ScrollFade>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- PROVA SOCIAL (SOCIAL PROOF) --- */}
            <section className="py-24 md:py-32 px-6 bg-[#080808]">
                <div className="max-w-6xl mx-auto">
                    <ScrollFade>
                        <div className="flex flex-col items-center text-center mb-16 md:mb-20">
                            <div className="flex -space-x-4 mb-8">
                                {[1,2,3,4].map(i => (
                                    <div key={i} className={`w-14 h-14 rounded-full border-4 border-[#080808] bg-gray-800 overflow-hidden relative`}>
                                        <img src={`https://randomuser.me/api/portraits/women/${i + 40}.jpg`} alt="User" className="w-full h-full object-cover" />
                                    </div>
                                ))}
                                <div className="w-14 h-14 rounded-full border-4 border-[#080808] bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center text-white text-sm font-bold shadow-lg z-10 font-sans">
                                    +38k
                                </div>
                            </div>
                            <h2 className="text-3xl md:text-5xl font-serif text-white mb-4">
                                Mais de 38 mil mulheres
                            </h2>
                            <p className="text-gray-400 text-lg font-sans">Já mantiveram a sequência por mais de 45 dias.</p>
                        </div>
                    </ScrollFade>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <ScrollFade delay="0ms">
                            <TestimonialCard 
                                text="Eu mantive 87 dias seguidos, nunca consegui isso na vida. A mensagem de hoje parecia que tinha sido escrita pra mim."
                                author="Ana Clara"
                                label="87 dias seguidos"
                            />
                        </ScrollFade>
                        <ScrollFade delay="200ms">
                            <TestimonialCard 
                                text="Hoje faz 21 dias e eu chorei de orgulho. Não é sobre a frase, é sobre lembrar quem eu sou todo santo dia."
                                author="Fernanda S."
                                label="21 dias seguidos"
                            />
                        </ScrollFade>
                        <ScrollFade delay="400ms">
                            <TestimonialCard 
                                text="Comecei achando que era só mais um app. Hoje é meu ritual sagrado antes de levantar da cama. Mudou meu humor matinal."
                                author="Juliana M."
                                label="4 meses de uso"
                            />
                        </ScrollFade>
                    </div>
                </div>
            </section>

            {/* --- OFERTA IRRESISTÍVEL (PRICING) --- */}
            <section className="py-24 md:py-32 px-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-[#080808] to-amber-950/20 pointer-events-none"></div>

                <div className="max-w-5xl mx-auto relative z-10">
                    <ScrollFade>
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-serif text-white mb-4">
                                Invista em você<br/>
                            </h2>
                            <p className="text-gray-400 font-sans">Menos que um café na padaria.</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto items-center">
                            
                            <div className="order-2 md:order-1 bg-[#111] border border-white/5 rounded-[2rem] p-8 md:p-10 transition-all duration-300 opacity-90 hover:opacity-100 hover:scale-[1.02]">
                                <h3 className="text-xl font-bold text-gray-200 mb-2 font-serif">Plano Mensal</h3>
                                <div className="flex items-baseline gap-1 leading-none text-white mb-6">
                                    <span className="text-sm text-gray-400 font-medium self-start mt-2">R$</span>
                                    <span className="text-4xl font-bold font-sans">{config.monthlyPrice}</span>
                                    <span className="text-sm text-gray-400 font-medium self-end mb-1">/mês</span>
                                </div>
                                <ul className="space-y-3 mb-8 text-gray-400 text-sm">
                                    <li className="flex gap-2"><CheckCircleIcon className="text-gray-500" /> Sem Anúncios</li>
                                    <li className="flex gap-2"><CheckCircleIcon className="text-gray-500" /> Acesso Ilimitado</li>
                                    <li className="flex gap-2"><CheckCircleIcon className="text-gray-500" /> Cancele quando quiser</li>
                                </ul>
                                <button 
                                    onClick={() => handlePlanClick('monthly')}
                                    className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-4 rounded-xl transition-all"
                                >
                                    Escolher Mensal
                                </button>
                            </div>

                            <div className="order-1 md:order-2 relative bg-[#0a0a0a] border-2 border-amber-500/50 rounded-[2.5rem] p-8 md:p-12 overflow-hidden shadow-[0_0_50px_rgba(245,158,11,0.2)] transform transition-all duration-300 scale-105 z-10">
                                <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-yellow-600 text-black text-[10px] md:text-xs font-bold px-6 py-2 rounded-bl-2xl uppercase tracking-widest shadow-lg font-sans">
                                    Melhor Oferta
                                </div>
                                
                                <h3 className="text-2xl font-bold text-amber-100 mb-2 font-serif">Plano Anual</h3>
                                <p className="text-amber-500/80 text-xs font-bold uppercase tracking-wider mb-8">Economize 33%</p>

                                <div className="flex items-baseline gap-1 leading-none text-white mb-10">
                                    <span className="text-lg text-gray-400 font-medium self-start mt-2">R$</span>
                                    <span className="text-6xl font-bold font-sans text-transparent bg-clip-text bg-gradient-to-b from-amber-200 to-amber-500">{config.annualPrice}</span>
                                    <span className="text-xl text-gray-400 font-medium self-end mb-2">/mês</span>
                                </div>
                                <p className="text-xs text-gray-500 -mt-8 mb-8">Cobrado anualmente (R$ {config.annualTotal})</p>

                                <ul className="space-y-4 mb-10 text-gray-300 text-sm md:text-base">
                                    <li className="flex gap-3"><CheckCircleIcon className="text-amber-500 text-xl" /> Sem Anúncios</li>
                                    <li className="flex gap-3"><CheckCircleIcon className="text-amber-500 text-xl" /> Acesso Ilimitado</li>
                                    <li className="flex gap-3"><CheckCircleIcon className="text-amber-500 text-xl" /> Cancele quando quiser</li>
                                </ul>

                                <button 
                                    onClick={() => handlePlanClick('annual')}
                                    className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-bold py-5 rounded-full text-lg shadow-[0_0_40px_rgba(245,158,11,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                   <CrownIcon className="text-xl" /> Começar Agora
                                </button>
                                <p className="text-center text-[10px] text-gray-500 mt-4 uppercase tracking-wider">Garantia de 7 dias incondicional</p>
                            </div>

                        </div>
                    </ScrollFade>
                </div>
            </section>

             {/* --- FAQ SECTION --- */}
            <section className="py-24 px-6 bg-[#0a0a0a] border-t border-white/5">
                <div className="max-w-3xl mx-auto">
                    <ScrollFade>
                        <h2 className="text-3xl md:text-4xl font-serif text-white mb-12 text-center">Dúvidas Frequentes</h2>
                    </ScrollFade>
                    
                    <div className="space-y-4">
                        {faqs.map((faq, index) => {
                            const isOpen = openFaqIndex === index;
                            return (
                                <ScrollFade key={index} delay={`${index * 100}ms`}>
                                    <div className="bg-[#111] rounded-2xl border border-white/5 overflow-hidden transition-colors hover:bg-white/5">
                                        <button 
                                            onClick={() => toggleFaq(index)}
                                            className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                                            aria-expanded={isOpen}
                                        >
                                            <span className="font-semibold text-base md:text-lg text-gray-200 pr-4 font-sans">{faq.question}</span>
                                            <div className={`w-8 h-8 rounded-full bg-white/5 flex items-center justify-center transition-transform duration-300 ${isOpen ? 'rotate-180 bg-white/10' : ''}`}>
                                                <ChevronDownIcon className="text-gray-400" />
                                            </div>
                                        </button>
                                        <div 
                                            className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}
                                        >
                                            <p className="p-6 pt-0 text-sm md:text-base text-gray-400 leading-relaxed font-sans border-t border-white/5">
                                                {faq.answer}
                                            </p>
                                        </div>
                                    </div>
                                </ScrollFade>
                            );
                        })}
                    </div>
                </div>
            </section>

            <footer className="py-12 border-t border-white/5 bg-[#050505] font-sans">
                <div className="max-w-4xl mx-auto px-6 flex flex-col items-center text-center">
                    
                    <div className="flex items-center gap-2 mb-8 opacity-50 hover:opacity-100 transition-opacity cursor-default">
                        <SparkleIcon className="text-violet-500" />
                        <span className="font-bold text-gray-400">Inspira+</span>
                    </div>

                    <div className="flex flex-wrap justify-center gap-12 md:gap-24 mb-10 w-full">
                         <div className="flex flex-col gap-4">
                            <h4 className="font-bold text-gray-600 uppercase tracking-widest text-[10px]">Legal</h4>
                            <div className="flex flex-col gap-2">
                                <button onClick={onShowTerms} className="text-sm text-gray-400 hover:text-violet-400 transition-colors">Termos de Uso</button>
                                <button onClick={onShowPrivacy} className="text-sm text-gray-400 hover:text-violet-400 transition-colors">Privacidade</button>
                            </div>
                         </div>
                         <div className="flex flex-col gap-4">
                            <h4 className="font-bold text-gray-600 uppercase tracking-widest text-[10px]">Suporte</h4>
                            <div className="flex flex-col gap-2">
                                {config.whatsappLink && (
                                    <a href={config.whatsappLink} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-violet-400 transition-colors">Fale Conosco</a>
                                )}
                                {!config.whatsappLink && (
                                    <span className="text-sm text-gray-600 cursor-not-allowed">Em breve</span>
                                )}
                            </div>
                         </div>
                    </div>

                    <p className="text-xs text-gray-700">&copy; {new Date().getFullYear()} Inspira+. Feito com carinho no Brasil.</p>
                </div>
            </footer>
        </div>
    );
};
