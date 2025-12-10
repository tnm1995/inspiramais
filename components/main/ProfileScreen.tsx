
import React, { useState, useEffect } from 'react';
import { useUserData } from '../../context/UserDataContext';
import { useAuth } from '../../context/AuthContext';
import { ChevronLeftIcon, ChevronRightIcon, CrownIcon, HeartIcon, TrendingUpIcon, LightbulbIcon, EditIcon, CheckIcon, ClipboardIcon, LogoutIcon, LinkIcon, CogIcon, PhoneIcon } from '../Icons';
import { Quote, AppConfig } from '../../types';
import { generateDailyFocus } from '../../services/aiService';
import { EditProfileScreen } from './EditProfileScreen';
import { usePageTracking } from '../../hooks/usePageTracking';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useRouter } from '../../hooks/useRouter';

type ToastMessage = {
    message: string;
    type: 'success' | 'error';
}

interface ProfileScreenProps {
    onBack: () => void;
    quotes: Quote[];
    onLike: (id: string, isLiked: boolean) => void;
    setToastMessage: (toast: ToastMessage | null) => void;
    isClosing?: boolean;
    onGoToPremium: () => void;
    onLogout: () => void;
    onShowTerms?: () => void;
    onShowPrivacy?: () => void;
    isAdmin?: boolean;
    onOpenAdmin?: () => void;
}

interface DailyFocus {
    title: string;
    text: string;
}

interface FavoriteQuoteCardProps {
    quote: Quote;
    isCopied: boolean;
    onCopy: (quote: Quote) => void;
    onUnlike: (id: string, isLiked: boolean) => void;
}

const FavoriteQuoteCard: React.FC<FavoriteQuoteCardProps> = ({ quote, isCopied, onCopy, onUnlike }) => {
    return (
        <article className="relative snap-center flex-shrink-0 w-[85%] md:w-2/3 rounded-2xl p-6 flex flex-col justify-between h-56 overflow-hidden shadow-lg aurora-background" aria-labelledby={`quote-text-${quote.id}`}>
            <div className="relative z-10 flex-grow overflow-y-auto scrollbar-hide text-center flex items-center justify-center">
                <div>
                    <p id={`quote-text-${quote.id}`} className="text-white italic text-lg" style={{textShadow: '0 1px 3px rgba(0,0,0,0.7)'}}>"'{quote.text}'"</p>
                    {quote.author && <p className="text-sm text-slate-300 mt-2" style={{textShadow: '0 1px 3px rgba(0,0,0,0.7)'}}>{quote.author}</p>}
                </div>
            </div>
            <nav className="relative z-10 flex-shrink-0 flex items-center justify-center space-x-2 pt-4 mt-auto" aria-label="Ações da Citação Favorita">
                <button onClick={() => onCopy(quote)} className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors" aria-label="Copiar citação">
                    {isCopied ? (
                        <CheckIcon className="text-xl text-green-400" />
                    ) : (
                        <ClipboardIcon className="text-xl text-slate-300" />
                    )}
                </button>
                <button onClick={() => onUnlike(quote.id, quote.liked)} className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors" aria-label="Descurtir citação">
                    <HeartIcon filled={true} className="text-xl text-red-500" />
                </button>
            </nav>
        </article>
    );
};

const SectionCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <div className={`bg-white rounded-2xl p-4 md:p-5 shadow-sm ring-1 ring-gray-200 ${className}`}>
        {children}
    </div>
);

const StatCard: React.FC<{ icon: React.ReactNode, value: number, label: string }> = ({ icon, value, label }) => (
    <div className="bg-gray-100 rounded-lg p-3 flex-1 flex items-center space-x-3 transition-colors hover:bg-gray-200" role="status">
        {icon}
        <div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
        </div>
    </div>
);

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onBack, quotes, onLike, setToastMessage, isClosing, onGoToPremium, onLogout, onShowTerms, onShowPrivacy, isAdmin, onOpenAdmin }) => {
    usePageTracking('/profile');
    const { back } = useRouter();
    const { userData } = useUserData();
    const { userEmail } = useAuth();
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [showEditProfile, setShowEditProfile] = useState(false);
    const favoriteQuotes = quotes.filter(q => q.liked);
    const [dailyFocus, setDailyFocus] = useState<DailyFocus | null>(null);
    const [isLoadingFocus, setIsLoadingFocus] = useState(false);
    const [appConfig, setAppConfig] = useState<AppConfig | null>(null);

    useEffect(() => {
        const fetchFocus = async () => {
            if (!userData) return;

            const today = new Date().toISOString().split('T')[0];
            const cachedFocus = sessionStorage.getItem('dailyFocus');
            
            if (cachedFocus) {
                const { date, focus } = JSON.parse(cachedFocus);
                if (date === today) {
                    setDailyFocus(focus);
                    return;
                }
            }

            setIsLoadingFocus(true);
            const focusResult = await generateDailyFocus(userData);
            if (focusResult) {
                setDailyFocus(focusResult);
                sessionStorage.setItem('dailyFocus', JSON.stringify({ date: today, focus: focusResult }));
            }
            setIsLoadingFocus(false);
        };
        fetchFocus();
    }, [userData]);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const docRef = doc(db, "settings", "appConfig");
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setAppConfig(docSnap.data() as AppConfig);
                }
            } catch (error: any) {
                console.warn("Could not load support links:", error);
            }
        };
        fetchConfig();
    }, []);


    const handleCopy = (quote: Quote) => {
        const textToCopy = `"${quote.text}"${quote.author ? ` - ${quote.author}` : ''}`;
        navigator.clipboard.writeText(textToCopy).then(() => {
            setCopiedId(quote.id);
            setToastMessage({ message: 'Citação copiada!', type: 'success' });
            setTimeout(() => setCopiedId(null), 2000);
            setTimeout(() => setToastMessage(null), 3000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            setToastMessage({ message: 'Falha ao copiar citação.', type: 'error' });
            setTimeout(() => setToastMessage(null), 3000);
        });
    };
    
    if (showEditProfile) {
        return <EditProfileScreen onBack={() => setShowEditProfile(false)} setToastMessage={setToastMessage} />;
    }

    const openLink = (url?: string) => {
        if (url && url.startsWith('http')) {
            window.open(url, '_blank');
        } else {
            setToastMessage({ message: 'Link não configurado.', type: 'error' });
        }
    };

    return (
        <div role="dialog" aria-modal="true" aria-label="Tela de Perfil do Usuário" className={`fixed inset-0 z-40 bg-gray-50 text-gray-800 flex flex-col ${isClosing ? 'animate-slide-out-down' : 'animate-slide-in-up'}`}>
            <header className="flex items-center p-4 flex-shrink-0">
                <button onClick={onBack} className="w-12 h-12 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors" aria-label="Voltar para o feed">
                    <ChevronLeftIcon className="text-3xl text-gray-600" />
                </button>
                <h1 className="text-xl font-bold text-center flex-grow text-gray-900">Perfil</h1>
                <div className="w-12" aria-hidden="true"></div>
            </header>

            <div className="flex-grow overflow-y-auto space-y-6 px-4 md:px-6 pb-8 scrollbar-hide">
                <section aria-label="Informações do Usuário" className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900">{userData?.name || 'Usuário'}</h2>
                    <p className="text-lg text-gray-500 mt-1">{userEmail}</p>
                    {isAdmin && (
                        <div className="mt-2">
                             <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                                Administrador
                             </span>
                        </div>
                    )}
                </section>

                <SectionCard>
                    <h3 className="text-sm font-semibold text-gray-500 px-1 uppercase tracking-wider mb-3">Seu Foco Diário</h3>
                     {isLoadingFocus ? (
                        <div className="space-y-2 animate-pulse" role="status" aria-label="Carregando foco diário">
                            <div className="h-6 w-1/2 bg-gray-200 rounded"></div>
                            <div className="h-4 w-full bg-gray-200 rounded"></div>
                            <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                        </div>
                    ) : dailyFocus && (
                        <article className="flex items-start space-x-4" aria-label={`Foco Diário: ${dailyFocus.title}`}>
                            <LightbulbIcon className="text-4xl text-amber-500 mt-1 flex-shrink-0" aria-hidden="true" />
                            <div>
                                <h4 className="font-bold text-lg text-gray-900">{dailyFocus.title}</h4>
                                <p className="text-gray-700">{dailyFocus.text}</p>
                            </div>
                        </article>
                    )}
                </SectionCard>

                <SectionCard>
                     <h3 className="text-sm font-semibold text-gray-500 px-1 uppercase tracking-wider mb-3">Sua Jornada</h3>
                    <div className="flex space-x-3">
                        <StatCard icon={<TrendingUpIcon className="text-3xl text-violet-500" aria-hidden="true" />} value={quotes.length} label="Descobertas" />
                        <StatCard icon={<HeartIcon filled className="text-3xl text-red-500" aria-hidden="true" />} value={favoriteQuotes.length} label="Favoritos" />
                    </div>
                </SectionCard>

                <section aria-labelledby="favorite-quotes-title">
                    <h3 id="favorite-quotes-title" className="text-sm font-semibold text-gray-500 px-2 uppercase tracking-wider mb-3">Citações Favoritas ({favoriteQuotes.length})</h3>
                    {favoriteQuotes.length > 0 ? (
                        <div className="relative -mx-4">
                            <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide px-4 space-x-4 py-2 group" role="group" aria-label="Lista de Citações Favoritas">
                                {favoriteQuotes.map(quote => (
                                    <FavoriteQuoteCard
                                        key={quote.id}
                                        quote={quote}
                                        isCopied={copiedId === quote.id}
                                        onCopy={handleCopy}
                                        onUnlike={onLike}
                                    />
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="p-6 bg-white rounded-2xl text-center flex flex-col items-center ring-1 ring-gray-200" role="status" aria-live="polite">
                            <HeartIcon className="text-5xl text-gray-300 mb-4" aria-hidden="true" />
                            <p className="text-gray-700 font-semibold">Suas citações favoritas aparecerão aqui.</p>
                            <p className="text-sm text-gray-500 mt-1">Curta uma citação no feed para salvá-la.</p>
                        </div>
                    )}
                </section>
                
                <section aria-labelledby="settings-title" className="space-y-3">
                     <h3 id="settings-title" className="text-sm font-semibold text-gray-500 px-2 uppercase tracking-wider">Configurações</h3>
                      <button onClick={onGoToPremium} className="flex items-center justify-between w-full p-4 bg-white rounded-lg hover:bg-gray-100 transition-colors text-left ring-1 ring-gray-200" aria-label="Gerenciar assinatura Premium">
                        <div className="flex items-center space-x-4">
                            <CrownIcon className="text-2xl text-amber-500" aria-hidden="true" />
                            <span className="text-gray-800 font-medium text-lg">Sua Assinatura</span>
                        </div>
                        <ChevronRightIcon className="text-xl text-gray-400" aria-hidden="true" />
                    </button>
                    <button onClick={() => setShowEditProfile(true)} className="flex items-center justify-between w-full p-4 bg-white rounded-lg hover:bg-gray-100 transition-colors text-left ring-1 ring-gray-200" aria-label="Editar Perfil">
                        <div className="flex items-center space-x-4">
                            <EditIcon className="text-2xl text-violet-500" aria-hidden="true" />
                            <span className="text-gray-800 font-medium text-lg">Editar Perfil</span>
                        </div>
                        <ChevronRightIcon className="text-xl text-gray-400" aria-hidden="true" />
                    </button>

                    {isAdmin && onOpenAdmin && (
                        <button onClick={onOpenAdmin} className="flex items-center justify-between w-full p-4 bg-indigo-50 border border-indigo-100 rounded-lg hover:bg-indigo-100 transition-colors text-left" aria-label="Acessar Painel Administrativo">
                            <div className="flex items-center space-x-4">
                                <CogIcon className="text-2xl text-indigo-600" aria-hidden="true" />
                                <span className="text-indigo-900 font-medium text-lg">Painel Admin</span>
                            </div>
                            <ChevronRightIcon className="text-xl text-indigo-400" aria-hidden="true" />
                        </button>
                    )}

                    <button onClick={onLogout} className="flex items-center w-full p-4 bg-white rounded-lg hover:bg-gray-100 transition-colors text-left ring-1 ring-gray-200" aria-label="Sair da conta">
                        <div className="flex items-center space-x-4">
                            <LogoutIcon className="text-2xl text-red-500" aria-hidden="true" />
                            <span className="text-gray-800 font-medium text-lg">Sair</span>
                        </div>
                    </button>
                </section>

                <section aria-labelledby="support-title" className="space-y-3">
                     <h3 id="support-title" className="text-sm font-semibold text-gray-500 px-2 uppercase tracking-wider">Suporte</h3>
                     <button onClick={() => openLink(appConfig?.whatsappLink)} className="flex items-center justify-between w-full p-4 bg-white rounded-lg hover:bg-gray-100 transition-colors text-left ring-1 ring-gray-200">
                        <div className="flex items-center space-x-4">
                            <PhoneIcon className="text-2xl text-green-500" aria-hidden="true" />
                            <span className="text-gray-800 font-medium">Fale Conosco (WhatsApp)</span>
                        </div>
                    </button>
                </section>

                <section aria-labelledby="about-title" className="space-y-3 pb-8">
                     <h3 id="about-title" className="text-sm font-semibold text-gray-500 px-2 uppercase tracking-wider">Sobre o App</h3>
                     <button onClick={onShowTerms} className="flex items-center justify-between w-full p-4 bg-white rounded-lg hover:bg-gray-100 transition-colors text-left ring-1 ring-gray-200">
                        <div className="flex items-center space-x-4">
                            <LinkIcon className="text-2xl text-gray-400" aria-hidden="true" />
                            <span className="text-gray-800 font-medium">Termos de Uso</span>
                        </div>
                    </button>
                    <button onClick={onShowPrivacy} className="flex items-center justify-between w-full p-4 bg-white rounded-lg hover:bg-gray-100 transition-colors text-left ring-1 ring-gray-200">
                        <div className="flex items-center space-x-4">
                            <LinkIcon className="text-2xl text-gray-400" aria-hidden="true" />
                            <span className="text-gray-800 font-medium">Política de Privacidade</span>
                        </div>
                    </button>
                </section>

            </div>

        </div>
    );
};
