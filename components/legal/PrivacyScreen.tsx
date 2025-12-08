
import React from 'react';
import { ChevronLeftIcon } from '../Icons';

interface PrivacyScreenProps {
    onClose: () => void;
}

export const PrivacyScreen: React.FC<PrivacyScreenProps> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 z-[60] bg-[#050505] text-white flex flex-col animate-slide-in-up overflow-hidden">
             <header className="flex items-center p-4 border-b border-white/10 bg-[#050505]/90 backdrop-blur-md z-10">
                <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
                    <ChevronLeftIcon className="text-2xl" />
                </button>
                <h1 className="text-lg font-bold flex-grow text-center font-serif">Política de Privacidade</h1>
                <div className="w-10"></div>
            </header>
            
            <main className="flex-grow overflow-y-auto p-6 md:p-8 space-y-6 text-gray-300 font-sans text-sm md:text-base leading-relaxed scrollbar-hide">
                <section>
                    <h2 className="text-white font-bold text-lg mb-2">1. Coleta de Dados</h2>
                    <p>Respeitamos sua privacidade. Coletamos apenas os dados essenciais para personalizar sua experiência (como nome, preferências de tópicos e humor). A maioria dos dados é armazenada localmente no seu dispositivo.</p>
                </section>

                <section>
                    <h2 className="text-white font-bold text-lg mb-2">2. Uso de Inteligência Artificial</h2>
                    <p>Utilizamos a API do Google Gemini para gerar conteúdo personalizado. Ao usar funcionalidades de IA, os prompts de texto (sem identificação pessoal sensível) são enviados para processamento e não são retidos para treinamento de modelos pela nossa aplicação.</p>
                </section>

                <section>
                    <h2 className="text-white font-bold text-lg mb-2">3. Armazenamento Local</h2>
                    <p>Priorizamos o armazenamento local (no seu próprio celular) para histórico de humor, citações favoritas e progresso na jornada. Isso garante que você tenha controle total sobre seus dados.</p>
                </section>

                <section>
                    <h2 className="text-white font-bold text-lg mb-2">4. Compartilhamento de Dados</h2>
                    <p>Não vendemos, alugamos ou compartilhamos seus dados pessoais com terceiros para fins de marketing. Dados anônimos de uso podem ser usados para melhorar a performance do aplicativo.</p>
                </section>

                <section>
                    <h2 className="text-white font-bold text-lg mb-2">5. Segurança</h2>
                    <p>Empregamos medidas de segurança padrão da indústria para proteger suas informações. Pagamentos são processados por gateways criptografados externos, e não temos acesso aos seus dados financeiros completos.</p>
                </section>

                <section>
                    <h2 className="text-white font-bold text-lg mb-2">6. Seus Direitos</h2>
                    <p>Você tem o direito de solicitar a exclusão de sua conta e de todos os dados associados a qualquer momento através das configurações do aplicativo ou entrando em contato com nosso suporte.</p>
                </section>

                <div className="pt-8 pb-12 text-center text-xs text-gray-500">
                    <p>Última atualização: Outubro de 2023</p>
                </div>
            </main>
        </div>
    );
};
