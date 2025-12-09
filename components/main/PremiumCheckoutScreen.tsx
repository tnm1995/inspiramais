
import React, { useState } from 'react';
import { ChevronLeftIcon, CheckIcon, CrownIcon, ChevronDownIcon, LockIcon } from '../Icons';
import { GradientButton } from '../ui/ContinueButton';
import { usePageTracking } from '../../hooks/usePageTracking';

interface PremiumCheckoutScreenProps {
    onBack: () => void;
    onPurchaseComplete: () => void;
    isClosing?: boolean;
}

const benefits = [
    "Remoção de todos os anúncios",
    "Acesso a todas as categorias",
    "Geração de citações ilimitada e mais rápida",
    "Suporte prioritário"
];

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

export const PremiumCheckoutScreen: React.FC<PremiumCheckoutScreenProps> = ({ onBack, onPurchaseComplete, isClosing }) => {
    usePageTracking('/premium-checkout');
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<'annual' | 'monthly'>('annual');
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

    const toggleFaq = (index: number) => {
        setOpenFaqIndex(openFaqIndex === index ? null : index);
    };

    const handleContinue = () => {
        setIsProcessing(true);
        
        // Simulation of Web Checkout Redirect
        // In a real scenario, this would be: window.open('https://pay.hotmart.com/...', '_blank');
        console.log(`Redirecting to checkout for plan: ${selectedPlan}`);
        
        // Simulating the user coming back after purchase for the prototype
        setTimeout(() => {
            onPurchaseComplete();
            setIsProcessing(false);
        }, 2000);
    };

    return (
        <div role="dialog" aria-modal="true" aria-label="Assinatura Premium do Inspira+" className={`fixed inset-0 z-40 bg-[#0a0a0a] text-gray-100 flex flex-col overflow-hidden font-sans ${isClosing ? 'animate-slide-out-down' : 'animate-slide-in-up'}`}>
            <header className="flex items-center p-6 flex-shrink-0 z-10">
                <button onClick={onBack} className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-md" aria-label="Voltar para o perfil">
                    <ChevronLeftIcon className="text-2xl text-white" />
                </button>
            </header>

            <main className="flex-grow overflow-y-auto px-6 pt-2 pb-32 scrollbar-hide z-10">
                
                <section aria-label="Informações da assinatura Premium" className="flex flex-col justify-center items-center my-4 text-center">
                     <div className="relative w-20 h-20 mb-4 flex items-center justify-center bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-full animate-slide-in-up shadow-[0_0_40px_rgba(124,58,237,0.4)]" style={{ animationDelay: '100ms' }}>
                        <CrownIcon className="text-white text-4xl drop-shadow-md" />
                    </div>

                    <h2 className="text-3xl font-extrabold text-white animate-slide-in-up font-serif" style={{ animationDelay: '200ms' }}>Inspira+ Premium</h2>
                    <p className="text-gray-400 mt-2 max-w-xs mx-auto text-sm animate-slide-in-up font-sans" style={{ animationDelay: '300ms' }}>
                        Desbloqueie todo o seu potencial.
                    </p>
                </section>
                
                {/* Plans Selection */}
                <div className="space-y-4 max-w-md mx-auto mb-8 animate-slide-in-up" style={{ animationDelay: '400ms' }}>
                    
                    {/* Annual Plan Card */}
                    <button
                        className={`relative w-full p-6 rounded-3xl border-2 transition-all duration-300 text-left group overflow-hidden ${
                            selectedPlan === 'annual' 
                            ? 'border-amber-500 bg-gradient-to-br from-amber-900/20 to-black shadow-[0_0_30px_rgba(245,158,11,0.15)] scale-[1.02]' 
                            : 'border-white/10 bg-white/5 hover:bg-white/10'
                        }`}
                        onClick={() => setSelectedPlan('annual')}
                    >
                        {selectedPlan === 'annual' && (
                            <div className="absolute top-0 right-0 bg-gradient-to-bl from-amber-500 to-orange-600 text-white text-[10px] font-bold px-4 py-1.5 rounded-bl-xl uppercase tracking-wider z-20">
                                Recomendado
                            </div>
                        )}
                        
                        <div className="flex justify-between items-center mb-2 relative z-10">
                            <div className="flex items-center gap-3">
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedPlan === 'annual' ? 'border-amber-500 bg-amber-500' : 'border-gray-500 bg-transparent'}`}>
                                    {selectedPlan === 'annual' && <CheckIcon className="text-white text-xs" />}
                                </div>
                                <div>
                                    <h4 className={`font-bold text-lg ${selectedPlan === 'annual' ? 'text-amber-200' : 'text-gray-200'}`}>Plano Anual</h4>
                                </div>
                            </div>
                        </div>

                        <div className="pl-9 relative z-10">
                             <div className="flex items-baseline gap-1">
                                <span className={`text-3xl font-bold font-sans ${selectedPlan === 'annual' ? 'text-white' : 'text-gray-300'}`}>R$ 9,90</span>
                                <span className="text-sm text-gray-400 font-medium">/mês</span>
                            </div>
                            <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wide">Total de R$ 118,80 por ano</p>
                        </div>
                    </button>

                    {/* Monthly Plan Card */}
                    <button
                        className={`relative w-full p-5 rounded-3xl border-2 transition-all duration-300 text-left group overflow-hidden ${
                            selectedPlan === 'monthly' 
                            ? 'border-violet-500 bg-gradient-to-br from-violet-900/20 to-black shadow-[0_0_20px_rgba(124,58,237,0.15)]' 
                            : 'border-white/10 bg-white/5 hover:bg-white/10'
                        }`}
                        onClick={() => setSelectedPlan('monthly')}
                    >
                        <div className="flex justify-between items-center mb-2 relative z-10">
                            <div className="flex items-center gap-3">
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedPlan === 'monthly' ? 'border-violet-500 bg-violet-500' : 'border-gray-500 bg-transparent'}`}>
                                    {selectedPlan === 'monthly' && <CheckIcon className="text-white text-xs" />}
                                </div>
                                <div>
                                    <h4 className={`font-bold text-lg ${selectedPlan === 'monthly' ? 'text-violet-200' : 'text-gray-200'}`}>Plano Mensal</h4>
                                </div>
                            </div>
                        </div>

                        <div className="pl-9 relative z-10">
                             <div className="flex items-baseline gap-1">
                                <span className={`text-2xl font-bold font-sans ${selectedPlan === 'monthly' ? 'text-white' : 'text-gray-300'}`}>R$ 14,90</span>
                                <span className="text-sm text-gray-400 font-medium">/mês</span>
                            </div>
                            <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wide">Cobrado mensalmente</p>
                        </div>
                    </button>

                </div>

                <section aria-label="Benefícios da assinatura Premium" className="p-5 bg-white/5 rounded-2xl border border-white/5 animate-slide-in-up max-w-md mx-auto mb-10 font-sans" style={{ animationDelay: '500ms' }}>
                    <ul className="space-y-3">
                        {benefits.map((benefit, index) => (
                            <li key={index} className="flex items-start gap-3">
                                <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5" aria-hidden="true">
                                    <CheckIcon className="text-xs text-green-400" />
                                </div>
                                <span className="font-medium text-sm leading-tight text-gray-300">
                                    {benefit}
                                </span>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* FAQ Section (Accordion) */}
                <section aria-label="Perguntas Frequentes" className="max-w-md mx-auto animate-slide-in-up pb-8" style={{ animationDelay: '600ms' }}>
                    <h3 className="text-center text-gray-400 font-bold uppercase tracking-wider text-sm mb-6">Dúvidas Frequentes</h3>
                    <div className="space-y-3">
                        {faqs.map((faq, index) => {
                            const isOpen = openFaqIndex === index;
                            return (
                                <div key={index} className="bg-white/5 rounded-xl border border-white/5 overflow-hidden transition-colors hover:bg-white/10">
                                    <button 
                                        onClick={() => toggleFaq(index)}
                                        className="w-full flex items-center justify-between p-4 text-left focus:outline-none"
                                        aria-expanded={isOpen}
                                    >
                                        <span className="font-semibold text-sm text-gray-200 pr-4">{faq.question}</span>
                                        <ChevronDownIcon 
                                            className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
                                        />
                                    </button>
                                    <div 
                                        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}
                                    >
                                        <p className="p-4 pt-0 text-xs text-gray-400 leading-relaxed border-t border-white/5">
                                            {faq.answer}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

            </main>

            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/95 to-transparent z-20 font-sans">
                <GradientButton 
                    onClick={handleContinue} 
                    disabled={isProcessing}
                    text={isProcessing ? 'Processando...' : `Ir para Pagamento Seguro`} 
                    aria-label={isProcessing ? 'Processando redirecionamento' : "Ir para o checkout"}
                />
                <div className="flex items-center justify-center gap-2 mt-4 opacity-70">
                     <LockIcon className="text-green-500 text-xs" />
                     <p className="text-center text-[10px] text-gray-400">
                        Ambiente 100% criptografado • Hotmart/Kiwify
                    </p>
                </div>
            </div>

        </div>
    );
};
