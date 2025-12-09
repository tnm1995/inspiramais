import React, { useRef, useEffect, useState, memo, useCallback } from 'react';
import { Quote } from '../../types';
import { HeartIcon, ShareIcon, SparkleIcon, CachedIcon } from '../Icons';
import { ThinkingIndicator } from '../ui/ThinkingIndicator';
import { Particles } from '../ui/Particles';
import { usePageTracking } from '../../hooks/usePageTracking';

interface QuoteCardProps {
    quote: Quote;
    isActive: boolean;
    onDoubleTap: (id: string) => void;
}

const QuoteCard: React.FC<QuoteCardProps> = memo(({ quote, onDoubleTap }) => {
    const lastTap = useRef<number>(0);

    const handleTap = (e: React.TouchEvent | React.MouseEvent) => {
        const now = Date.now();
        const DOUBLE_TAP_DELAY = 300;
        if (now - lastTap.current < DOUBLE_TAP_DELAY) {
            onDoubleTap(quote.id);
        }
        lastTap.current = now;
    };

    // Dynamic typography using Sora font
    const getFontSizeClass = (text: string) => {
        const len = text.length;
        if (len < 40) return "text-4xl md:text-6xl font-bold tracking-tight leading-tight";
        if (len < 80) return "text-3xl md:text-5xl font-bold tracking-normal leading-snug";
        if (len < 140) return "text-2xl md:text-4xl font-semibold leading-relaxed";
        return "text-xl md:text-3xl font-medium leading-relaxed";
    };

    return (
        <article
            className="relative w-full h-full flex-shrink-0 snap-start flex flex-col justify-center items-center p-8 md:p-12 text-center text-white overflow-hidden aurora-background"
            onTouchEnd={handleTap}
            onClick={handleTap}
            aria-label={`Citação de ${quote.author}`}
        >
            {/* Premium Texture Overlay */}
            <div className="absolute inset-0 opacity-[0.06] pointer-events-none bg-noise z-0 mix-blend-overlay"></div>
            
            {/* Vignette - Enhanced for better contrast */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/90 z-0 pointer-events-none"></div>
            
            {/* Content Container with Bottom Padding for Dock Safety */}
            <div className="relative z-10 max-w-4xl flex flex-col items-center justify-center transform transition-all duration-700 ease-out animate-slide-in-up pb-24 md:pb-0">
                
                <h1 
                    className={`${getFontSizeClass(quote.text)} text-white font-sora drop-shadow-2xl px-2 md:px-4`} 
                    style={{ textShadow: '0 4px 40px rgba(0,0,0,0.5)', textWrap: 'balance' }}
                >
                    {quote.text}
                </h1>
                
                <div className="w-16 h-[2px] bg-white/30 rounded-full my-10"></div>

                {quote.author && (
                    <p className="text-sm md:text-base font-bold text-white/90 tracking-[0.2em] uppercase font-sora drop-shadow-md">
                        {quote.author}
                    </p>
                )}
            </div>
        </article>
    );
});

interface QuoteFeedProps {
    quotes: Quote[];
    isLoading: boolean;
    onLike: (id: string, isLiked: boolean) => void;
    onShare: (quote: Quote) => void;
    onExplore: (quote: Quote) => void;
    onRead?: () => void;
    loadMore: () => Promise<void>;
    sharingQuoteId: string | null;
    likedQuoteId: string | null;
    onRefresh: () => Promise<void>;
}

export const QuoteFeed: React.FC<QuoteFeedProps> = ({ quotes, isLoading, onLike, onShare, onExplore, onRead, loadMore, likedQuoteId, onRefresh }) => {
    usePageTracking('/home');
    const containerRef = useRef<HTMLDivElement>(null);
    const loaderRef = useRef<HTMLDivElement>(null);
    const isLoadingMore = useRef(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [pullDownY, setPullDownY] = useState(0);
    const touchStartY = useRef(0);
    const isPulling = useRef(false);

    const REFRESH_THRESHOLD = 80;

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !isLoading && !isLoadingMore.current) {
                    isLoadingMore.current = true;
                    loadMore().finally(() => { isLoadingMore.current = false; });
                }
            },
            { rootMargin: '0px 0px 150% 0px', threshold: 0.01 }
        );

        if (loaderRef.current) observer.observe(loaderRef.current);
        return () => observer.disconnect();
    }, [isLoading, loadMore]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleScroll = () => {
            const index = Math.round(container.scrollTop / container.clientHeight);
            if (index !== activeIndex) {
                setActiveIndex(index);
                if (onRead) onRead();
            }
        };
        
        container.addEventListener('scroll', handleScroll, { passive: true });
        return () => container.removeEventListener('scroll', handleScroll);
    }, [activeIndex, onRead]);

    const handleTouchStart = (e: React.TouchEvent) => {
        if (containerRef.current?.scrollTop === 0 && !isRefreshing) {
            touchStartY.current = e.touches[0].clientY;
            isPulling.current = true;
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isPulling.current) return;
        const deltaY = e.touches[0].clientY - touchStartY.current;
        if (deltaY > 0) {
            setPullDownY(Math.min(deltaY * 0.4, REFRESH_THRESHOLD + 60));
        } else {
            isPulling.current = false;
            setPullDownY(0);
        }
    };

    const handleTouchEnd = () => {
        if (!isPulling.current) return;
        isPulling.current = false;
        if (pullDownY >= REFRESH_THRESHOLD) {
            setIsRefreshing(true);
            onRefresh().finally(() => {
                setIsRefreshing(false);
                setPullDownY(0);
            });
        } else {
            setPullDownY(0);
        }
    };

    const activeQuote = quotes[activeIndex];
    const isExploding = likedQuoteId === activeQuote?.id;

    const handleDoubleTap = useCallback((id: string) => {
        const quote = quotes.find(q => q.id === id);
        if (quote) {
            onLike(id, quote.liked); 
        }
    }, [quotes, onLike]);

    return (
        <section className="relative w-full h-full bg-black overflow-hidden">
            {/* Refresh Indicator */}
            <div
                className="absolute top-24 left-0 right-0 z-30 flex justify-center items-center pointer-events-none transition-transform duration-300 ease-out"
                style={{ transform: `translateY(${pullDownY > 0 ? pullDownY * 0.5 : -100}px)`, opacity: pullDownY > 0 ? 1 : 0 }}
            >
                <div className="bg-white/10 backdrop-blur-md rounded-full p-3 ring-1 ring-white/20 shadow-xl flex items-center justify-center">
                    {isRefreshing ? (
                         <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                    ) : (
                        <CachedIcon className="text-white text-2xl" style={{ transform: `rotate(${pullDownY * 3}deg)` }}/>
                    )}
                </div>
            </div>

            {/* Main Feed */}
            <div 
                ref={containerRef} 
                className="relative z-10 w-full h-full snap-y snap-mandatory overflow-y-auto scrollbar-hide touch-pan-y"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {quotes.map((quote, index) => (
                    <QuoteCard 
                        key={quote.id} 
                        quote={quote} 
                        isActive={index === activeIndex}
                        onDoubleTap={handleDoubleTap}
                    />
                ))}

                {(isLoading || quotes.length === 0) && (
                    <div className="w-full h-full flex-shrink-0 snap-start flex flex-col justify-center items-center bg-black">
                        <ThinkingIndicator text={quotes.length === 0 ? "Preparando inspiração" : "Carregando mais"} className="text-violet-200" />
                    </div>
                )}
                
                <div ref={loaderRef} className="h-1 w-full pointer-events-none" />
            </div>

            {/* Giant Heart Animation Overlay (Centered) */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none transition-all duration-500 ease-out flex items-center justify-center ${isExploding ? 'scale-125 opacity-100' : 'scale-50 opacity-0'}`}>
                <HeartIcon filled className="text-[120px] text-white drop-shadow-2xl filter shadow-red-500" />
            </div>

            {/* Bottom Controls - Floating Orbs Style */}
            {activeQuote && (
                <div className="absolute bottom-10 left-0 right-0 z-30 flex justify-center items-end gap-8 pb-[env(safe-area-inset-bottom)] pointer-events-none">
                    
                    {/* Explore Orb */}
                    <div className="flex flex-col items-center gap-2 pointer-events-auto transform transition-transform hover:-translate-y-1">
                        <button 
                            onClick={() => onExplore(activeQuote)}
                            className="group relative w-14 h-14 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center transition-all duration-300 active:scale-90 hover:bg-violet-900/40 hover:border-violet-500/50 hover:shadow-[0_0_20px_rgba(139,92,246,0.3)]"
                            aria-label="Explorar"
                        >
                            <SparkleIcon className="text-[26px] text-white/90 group-hover:text-white transition-colors" />
                             {/* Inner glow ring */}
                             <div className="absolute inset-0 rounded-full border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </button>
                        <span className="text-[10px] font-bold tracking-widest uppercase drop-shadow-md transition-colors text-white/50 group-hover:text-violet-300">
                            Explorar
                        </span>
                    </div>

                    {/* Main Like Orb - Elevated */}
                    <div className="flex flex-col items-center gap-2 pointer-events-auto -mb-2 transform transition-transform hover:-translate-y-1">
                        <button 
                            onClick={() => onLike(activeQuote.id, activeQuote.liked)}
                            className={`relative group w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl active:scale-90 ${activeQuote.liked ? 'bg-gradient-to-tr from-violet-600 to-fuchsia-600 shadow-violet-500/50 scale-105' : 'bg-black/50 backdrop-blur-xl border border-white/10 hover:border-white/30'}`}
                            aria-label="Curtir"
                        >
                            <HeartIcon 
                                filled={activeQuote.liked} 
                                className={`text-[42px] mt-[2px] transition-all duration-300 ${activeQuote.liked ? 'text-white' : 'text-white/90 group-hover:text-white'} ${isExploding ? 'animate-pop' : ''}`} 
                            />
                            {/* Pulse Effect for unliked state */}
                            {!activeQuote.liked && (
                                <div className="absolute inset-0 rounded-full border border-white/5 animate-ping opacity-20"></div>
                            )}
                            <Particles active={!!isExploding} />
                        </button>
                    </div>

                    {/* Share Orb */}
                    <div className="flex flex-col items-center gap-2 pointer-events-auto transform transition-transform hover:-translate-y-1">
                        <button 
                            onClick={() => onShare(activeQuote)} 
                            className="group relative w-14 h-14 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center transition-all duration-300 hover:bg-violet-900/40 hover:border-violet-500/50 hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] active:scale-90"
                            aria-label="Compartilhar"
                        >
                            <ShareIcon className="text-[26px] ml-[2px] mt-[1px] text-white/90 group-hover:text-white transition-colors" />
                             {/* Inner glow ring */}
                             <div className="absolute inset-0 rounded-full border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </button>
                        <span className="text-[10px] font-bold tracking-widest uppercase text-white/50 drop-shadow-md group-hover:text-violet-300 transition-colors">Postar</span>
                    </div>

                </div>
            )}
        </section>
    );
};