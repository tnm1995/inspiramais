
import React from 'react';
import { Quote } from '../../types';
import { 
    ChevronLeftIcon, 
    UserCircleIcon, 
    SparkleIcon, 
    HeartIcon, 
    ShareIcon,
    SunnyIcon
} from '../Icons';
import { ThinkingIndicator } from '../ui/ThinkingIndicator';
import { Particles } from '../ui/Particles';

interface DailyMotivationScreenProps {
    quote: Quote | null;
    isLoading: boolean;
    onBack: () => void;
    onNavigateToProfile: () => void;
    isClosing?: boolean;
    onLike: () => void;
    onShare: (quote: Quote) => void;
    onExplore: (quote: Quote) => void;
    sharingQuoteId: string | null;
    likedQuoteId: string | null;
}

export const DailyMotivationScreen: React.FC<DailyMotivationScreenProps> = ({ quote, isLoading, onBack, onNavigateToProfile, isClosing, onLike, onShare, onExplore, likedQuoteId }) => {
    const isExploding = likedQuoteId === quote?.id;
    
    const today = new Date();
    const dateStr = today.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });

    // Dynamic typography matching QuoteFeed exactly
    const getFontSizeClass = (text: string) => {
        const len = text.length;
        if (len < 40) return "text-4xl md:text-6xl font-bold tracking-tight leading-tight";
        if (len < 80) return "text-3xl md:text-5xl font-bold tracking-normal leading-snug";
        if (len < 140) return "text-2xl md:text-4xl font-semibold leading-relaxed";
        return "text-xl md:text-3xl font-medium leading-relaxed";
    };

    return (
        <div className={`fixed inset-0 z-40 bg-[#050505] text-white overflow-hidden flex flex-col ${isClosing ? 'animate-slide-out-down' : 'animate-slide-in-up'}`}>
            
            {/* --- GOLDEN THEME BACKGROUND --- */}
            
            {/* Noise Texture Overlay */}
            <div className="absolute inset-0 opacity-[0.06] pointer-events-none bg-noise z-10 mix-blend-overlay"></div>
            
            {/* Primary Ambient Light (Sunrise Amber) - Top Left */}
            <div className="absolute top-[-20%] left-[-10%] w-[90%] h-[70%] rounded-full bg-amber-600/30 blur-[130px] pointer-events-none z-0 mix-blend-screen animate-pulse-slow"></div>
            
            {/* Secondary Ambient Light (Deep Gold) - Center Right */}
            <div className="absolute top-[30%] right-[-20%] w-[80%] h-[80%] rounded-full bg-yellow-700/20 blur-[120px] pointer-events-none z-0 mix-blend-screen"></div>

            {/* Depth Shadow (Warm Dark Brown) - Bottom */}
            <div className="absolute bottom-[-10%] left-[20%] w-[100%] h-[50%] rounded-full bg-stone-900/90 blur-[100px] pointer-events-none z-0"></div>

            {/* Vignette for Focus */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/90 z-0 pointer-events-none"></div>

            {/* Header */}
            <header className="absolute top-0 left-0 right-0 z-30 p-4 md:p-6 flex justify-between items-center">
                 {/* Header Buttons */}
                 <button onClick={onBack} className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-black/40 transition-colors ring-1 ring-white/20 active:scale-95" aria-label="Voltar">
                    <ChevronLeftIcon className="text-[24px]" />
                </button>
                
                {/* Pill Title */}
                <div className="flex flex-col items-center justify-center bg-amber-500/10 backdrop-blur-md px-5 py-2 rounded-full border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                    <div className="flex items-center gap-2">
                        <SunnyIcon className="text-amber-400 text-[20px]" />
                        <span className="text-sm font-bold tracking-wide text-amber-100 uppercase font-sans">Motivação Diária</span>
                    </div>
                </div>

                <button onClick={onNavigateToProfile} className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-black/40 transition-colors ring-1 ring-white/20 active:scale-95" aria-label="Perfil">
                    <UserCircleIcon className="text-[24px]" />
                </button>
            </header>
            
            {/* Main Content - Matches QuoteFeed Article Structure */}
            <main className="relative z-10 w-full h-full flex flex-col items-center justify-center p-8 md:p-12 pb-32">
                {isLoading ? (
                    <ThinkingIndicator text="Gerando sua motivação" className="text-amber-200" />
                ) : quote ? (
                    <div className="flex flex-col items-center justify-center max-w-4xl animate-slide-in-up text-center">
                        
                        {/* Date Label */}
                        <div className="mb-8">
                             <span className="text-xs font-bold tracking-[0.2em] uppercase text-amber-300/80 bg-amber-900/30 px-3 py-1 rounded-full border border-amber-500/20 backdrop-blur-sm">
                                {dateStr}
                             </span>
                        </div>

                        {/* Quote Text */}
                        <h1 
                            className={`${getFontSizeClass(quote.text)} text-white font-sora drop-shadow-2xl px-2 md:px-4`} 
                            style={{ textShadow: '0 4px 40px rgba(0,0,0,0.5)', textWrap: 'balance' }}
                        >
                            {quote.text}
                        </h1>
                        
                        {/* Divider */}
                        <div className="w-16 h-[2px] bg-amber-200/30 rounded-full my-10"></div>

                        {/* Author Pill */}
                        {quote.author && (
                            <p className="text-sm md:text-base font-bold text-amber-50/90 tracking-[0.2em] uppercase font-sora drop-shadow-md">
                                {quote.author}
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="text-center text-white/60 font-sora">
                        <p>Não foi possível carregar a motivação de hoje.</p>
                    </div>
                )}
            </main>

            {/* Bottom Controls - Floating Orbs Style (Matching QuoteFeed) */}
            {quote && (
                <div className="absolute bottom-10 left-0 right-0 z-30 flex justify-center items-end gap-8 pb-[env(safe-area-inset-bottom)] pointer-events-none">
                    
                    {/* Explore Orb */}
                    <div className="flex flex-col items-center gap-2 pointer-events-auto transform transition-transform hover:-translate-y-1">
                        <button 
                            onClick={() => onExplore(quote)}
                            className="group relative w-14 h-14 rounded-full bg-black/40 backdrop-blur-md border flex items-center justify-center transition-all duration-300 active:scale-90 border-white/10 hover:bg-amber-900/40 hover:border-amber-500/50 hover:shadow-[0_0_20px_rgba(245,158,11,0.3)]"
                            aria-label="Explorar"
                        >
                            <SparkleIcon className="text-[26px] text-white/90 group-hover:text-white transition-colors" />
                             {/* Inner glow ring */}
                             <div className="absolute inset-0 rounded-full border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </button>
                        <span className="text-[10px] font-bold tracking-widest uppercase drop-shadow-md transition-colors text-white/50 group-hover:text-amber-300">
                            Explorar
                        </span>
                    </div>

                    {/* Main Like Orb - Elevated */}
                    <div className="flex flex-col items-center gap-2 pointer-events-auto -mb-2 transform transition-transform hover:-translate-y-1">
                        <button 
                            onClick={onLike}
                            className={`relative group w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl active:scale-90 ${quote.liked ? 'bg-gradient-to-tr from-amber-500 to-orange-600 shadow-amber-500/50 scale-105' : 'bg-black/50 backdrop-blur-xl border border-white/10 hover:border-white/30'}`}
                            aria-label="Curtir"
                        >
                            {/* Optical Alignment: Heart is usually top-heavy visually, adding mt-[2px] centers it better */}
                            <HeartIcon 
                                filled={quote.liked} 
                                className={`text-[42px] mt-[2px] transition-all duration-300 ${quote.liked ? 'text-white' : 'text-white/90 group-hover:text-white'} ${isExploding ? 'animate-pop' : ''}`} 
                            />
                            {/* Pulse Effect for unliked state */}
                            {!quote.liked && (
                                <div className="absolute inset-0 rounded-full border border-white/5 animate-ping opacity-20"></div>
                            )}
                            <Particles active={!!isExploding} />
                        </button>
                    </div>

                    {/* Share Orb */}
                    <div className="flex flex-col items-center gap-2 pointer-events-auto transform transition-transform hover:-translate-y-1">
                        <button 
                            onClick={() => onShare(quote)} 
                            className="group relative w-14 h-14 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center transition-all duration-300 hover:bg-amber-900/40 hover:border-amber-500/50 hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] active:scale-90"
                            aria-label="Compartilhar"
                        >
                            {/* Optical Alignment: Share icon often leans left. ml-[2px] centers it. */}
                            <ShareIcon className="text-[26px] ml-[2px] mt-[1px] text-white/90 group-hover:text-white transition-colors" />
                             {/* Inner glow ring */}
                             <div className="absolute inset-0 rounded-full border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </button>
                        <span className="text-[10px] font-bold tracking-widest uppercase text-white/50 drop-shadow-md group-hover:text-amber-300 transition-colors">Postar</span>
                    </div>

                </div>
            )}
        </div>
    );
};
