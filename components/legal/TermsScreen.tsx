
import React from 'react';
import { ChevronLeftIcon } from '../Icons';

interface TermsScreenProps {
    onClose: () => void;
}

export const TermsScreen: React.FC<TermsScreenProps> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 z-[60] bg-[#050505] text-white flex flex-col animate-slide-in-up overflow-hidden">
            <header className="flex items-center p-4 border-b border-white/10 bg-[#050505]/90 backdrop-blur-md z-10">
                <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
                    <ChevronLeftIcon className="text-2xl" />
                </button>
                <h1 className="text-lg font-bold flex-grow text-center font-serif">Termos de Uso</h1>
                <div className="w-10"></div>
            </header>
            
            <main className="flex-grow overflow-y-auto p-6 md:p-8 space-y-6 text-gray-300 font-sans text-sm md:text-base leading-relaxed scrollbar-hide">
                <section>
                    <h2 className="text-white font-bold text-lg mb-2">1. Aceitação dos Termos</h2>
                    <p>Ao baixar, instalar ou utilizar o aplicativo Inspira+, você concorda em cumprir estes Termos de Uso. Se você não concordar com algum destes termos, não utilize o aplicativo.</p>
                </section>

                <section>
                    <h2 className="text-white font-bold text-lg mb-2">2. Descrição do Serviço</h2>
                    <p>O Inspira+ é uma plataforma de bem-estar e motivação diária focada no público feminino. O serviço oferece citações, reflexões e ferramentas de gamificação geradas por Inteligência Artificial e curadoria humana.</p>
                </section>

                <section>
                    <h2 className="text-white font-bold text-lg mb-2">3. Uso do Conteúdo</h2>
                    <p>Todo o conteúdo gerado (textos, imagens, áudios) é para uso pessoal e não comercial. Você pode compartilhar as citações nas redes sociais utilizando as ferramentas nativas do aplicativo, mantendo os créditos ao Inspira+.</p>
                </section>

                <section>
                    <h2 className="text-white font-bold text-lg mb-2">4. Assinaturas e Pagamentos</h2>
                    <p>O Inspira+ oferece funcionalidades Premium mediante assinatura. Os pagamentos são processados por plataformas terceiras seguras (Google Play Store, Apple App Store, Hotmart ou similar). Cancelamentos e reembolsos seguem as políticas específicas da plataforma onde a compra foi realizada.</p>
                </section>

                <section>
                    <h2 className="text-white font-bold text-lg mb-2">5. Isenção de Responsabilidade Médica</h2>
                    <p>O conteúdo do Inspira+ tem caráter motivacional e educativo. <strong>Não substitui acompanhamento psicológico, psiquiátrico ou médico profissional.</strong> Em casos de crises de saúde mental, procure ajuda profissional imediatamente.</p>
                </section>

                <section>
                    <h2 className="text-white font-bold text-lg mb-2">6. Alterações nos Termos</h2>
                    <p>Reservamo-nos o direito de modificar estes termos a qualquer momento. O uso contínuo do aplicativo após as alterações constitui aceitação dos novos termos.</p>
                </section>

                <div className="pt-8 pb-12 text-center text-xs text-gray-500">
                    <p>Última atualização: Outubro de 2023</p>
                </div>
            </main>
        </div>
    );
};
