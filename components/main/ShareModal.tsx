import React, { useState, useRef, useEffect, memo } from 'react';
import { Quote } from '../../types';
import { CloseIcon, ShareIcon, CheckIcon, DownloadIcon } from '../Icons';

// Declare domtoimage as a global variable since it's loaded via CDN
declare const domtoimage: any;

interface ShareModalProps {
    quote: Quote;
    onClose: () => void;
    isClosing: boolean;
}

interface QuoteShareCardProps {
    quote: Quote;
    aspectRatio: '1:1' | '9:16';
    id: string;
    isDailyQuote: boolean;
}

const QuoteShareCard: React.FC<QuoteShareCardProps> = memo(({ quote, aspectRatio, id, isDailyQuote }) => {
    const isSquare = aspectRatio === '1:1';
    
    const cardWidth = 1080;
    const cardHeight = isSquare ? cardWidth : 1920;

    // Determine date string for Daily Quotes
    let dateStr = "";
    if (isDailyQuote) {
        try {
            const datePart = quote.id.startsWith('daily-') ? quote.id.replace('daily-', '') : null;
            const dateObj = datePart ? new Date(datePart + 'T12:00:00') : new Date();
            dateStr = dateObj.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });
        } catch (e) {
            const today = new Date();
            dateStr = today.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });
        }
    }

    // THEME CONFIGURATION
    const theme = isDailyQuote ? {
        bgColor: '#1c1917', // Stone-900 (Warm Black)
        gradient: `
            radial-gradient(circle at 0% 0%, rgba(217, 119, 6, 0.4) 0%, transparent 60%),
            radial-gradient(circle at 100% 100%, rgba(180, 83, 9, 0.3) 0%, transparent 60%),
            url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyBAMAAADsEZWCAAAAGFBMVEUAAAA5OTkAAABERERmZmYzMzMyMjJEREQwMDBCwYnOAAAACHRSTlMAMwA1MzMzM7O0s14AAABwSURBVDjLxZFBCgAhDANGU/Bc5v3PomsWQwUP4t7yqog01qbZ/ko8O+NO3u3k3c5825lvO/NtZ77tzLed+bYz33bm285825lvO/NtZ77tzLed+bYz33bm285825lvO/NtZ77tzLed+bYz33bm285825lvO/NtZ77tzLed+bYz33bm285825lvO/NtZ77tzLed+bYz33bm285825lvO/NtZ77tzLed+bYz33bm2/55z/0B8405wZq1sYoAAAAASUVORK5CYII=")
        `,
        accentColor: 'bg-amber-500',
        quoteMarkColor: 'text-amber-500/60',
        badgeBorder: 'border-amber-500/30',
        badgeText: 'text-amber-200',
        authorColor: 'text-amber-50'
    } : {
        bgColor: '#09090b', // Zinc-950 (Cool Black)
        gradient: `
            radial-gradient(circle at 0% 0%, rgba(124, 58, 237, 0.4) 0%, transparent 50%),
            radial-gradient(circle at 100% 100%, rgba(236, 72, 153, 0.3) 0%, transparent 50%),
            url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyBAMAAADsEZWCAAAAGFBMVEUAAAA5OTkAAABERERmZmYzMzMyMjJEREQwMDBCwYnOAAAACHRSTlMAMwA1MzMzM7O0s14AAABwSURBVDjLxZFBCgAhDANGU/Bc5v3PomsWQwUP4t7yqog01qbZ/ko8O+NO3u3k3c5825lvO/NtZ77tzLed+bYz33bm285825lvO/NtZ77tzLed+bYz33bm285825lvO/NtZ77tzLed+bYz33bm285825lvO/NtZ77tzLed+bYz33bm285825lvO/NtZ77tzLed+bYz33bm2/55z/0B8405wZq1sYoAAAAASUVORK5CYII=")
        `,
        accentColor: 'bg-violet-500',
        quoteMarkColor: 'text-violet-500/60',
        badgeBorder: 'border-white/20',
        badgeText: 'text-white/80',
        authorColor: 'text-white/95'
    };

    const backgroundStyle: React.CSSProperties = {
        backgroundColor: theme.bgColor,
        backgroundImage: theme.gradient,
        backgroundSize: 'cover, cover, auto',
    };

    const getFontSize = () => {
        const len = quote.text.length;
        if (isSquare) {
            if (len < 40) return '80px';
            if (len < 80) return '64px';
            if (len < 120) return '52px';
            return '42px';
        } else {
            if (len < 40) return '90px';
            if (len < 80) return '72px';
            if (len < 120) return '60px';
            return '48px';
        }
    };

    // Dynamic Author Size - No Ellipsis, Single Line logic
    const getAuthorFontSizeClass = () => {
        const len = quote.author ? quote.author.length : 0;
        if (len > 35) return 'text-[28px]';
        if (len > 25) return 'text-[32px]';
        return 'text-[40px]';
    };

    return (
        <div
            id={id}
            className="relative flex flex-col justify-between text-white overflow-hidden font-sora"
            style={{
                ...backgroundStyle,
                width: `${cardWidth}px`,
                height: `${cardHeight}px`,
                padding: isSquare ? '80px' : '120px 80px',
            }}
        >
            {/* Header Removed */}

            {/* Main Content */}
            <div className="flex-grow flex flex-col justify-center relative z-10 px-2">
                
                {/* Visual Alignment: Date or Quote Mark */}
                {/* If Daily Quote: Date ONLY. If Standard Quote: Quote Mark ONLY */}
                <div className={`flex items-end mb-8 ${isDailyQuote ? 'ml-0' : 'ml-[-4px]'}`}>
                    {isDailyQuote ? (
                         <span className={`text-2xl font-bold tracking-[0.2em] uppercase ${theme.badgeText} border-b-4 ${theme.badgeBorder} pb-3 mb-2 shadow-sm`}>
                            {dateStr}
                        </span>
                    ) : (
                        <span className={`text-[130px] font-serif ${theme.quoteMarkColor} leading-[0.6]`} style={{ fontFamily: 'Playfair Display, serif' }}>"</span>
                    )}
                </div>
                
                <h1 
                    className="font-bold leading-[1.15] text-left text-white drop-shadow-2xl relative z-10"
                    style={{ 
                        fontSize: getFontSize(),
                        textWrap: 'balance' 
                    }}
                >
                    {quote.text}
                </h1>

                {quote.author && (
                    <div className="mt-12 flex items-center gap-6 relative z-10 w-full">
                        <div className={`h-[4px] w-20 ${theme.accentColor} rounded-full flex-shrink-0`}></div>
                        <p className={`${getAuthorFontSizeClass()} font-medium uppercase tracking-widest ${theme.authorColor} drop-shadow-md whitespace-nowrap`}>
                            {quote.author}
                        </p>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="w-full flex justify-center items-center mt-8 mb-12 relative z-20">
                <div className={`bg-black/40 backdrop-blur-xl border ${theme.badgeBorder} px-10 py-5 rounded-full flex items-center gap-4 shadow-xl`}>
                    <span className="text-3xl">✨</span>
                    <span className="text-2xl font-semibold text-white tracking-wider">inspiramais.app</span>
                </div>
            </div>
        </div>
    );
});

export const ShareModal: React.FC<ShareModalProps> = ({ quote, onClose, isClosing }) => {
    const [aspectRatio, setAspectRatio] = useState<'1:1' | '9:16'>('1:1');
    const [isSharing, setIsSharing] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const isProcessing = isSharing || isDownloading;
    const canShare = typeof navigator.share === 'function';
    const isDailyQuote = quote.id.startsWith('daily-') || quote.category === 'MOTIVAÇÃO';

    const showStatusMessage = (type: 'success' | 'error', text: string) => {
        setStatusMessage({ type, text });
        setTimeout(() => setStatusMessage(null), 3000);
    };

    const generateImageDataUrl = async (): Promise<string | null> => {
        try {
            const node = document.getElementById(`share-card-${aspectRatio}`); 
            if (!node) {
                throw new Error("Share card element not found for generation.");
            }
            return await domtoimage.toPng(node, {
                quality: 1.0,
                width: 1080,
                height: aspectRatio === '1:1' ? 1080 : 1920,
                style: {
                    transform: 'scale(1)',
                    transformOrigin: 'top left'
                },
                cacheBust: true
            });
        } catch (error) {
            console.error("Error generating image from DOM:", error);
            return null;
        }
    };
    
    const handleDownload = async () => {
        setIsDownloading(true);
        setStatusMessage(null);
        const dataUrl = await generateImageDataUrl();

        if (dataUrl) {
            const link = document.createElement('a');
            link.download = `inspira-${quote.id}-${aspectRatio}.png`;
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showStatusMessage('success', 'Salvo na galeria!');
        } else {
            showStatusMessage('error', 'Erro ao salvar imagem.');
        }
        setIsDownloading(false);
    };

    const handleShare = async () => {
        if (!canShare) {
            showStatusMessage('error', 'Navegador não suporta compartilhamento.');
            return;
        }

        setIsSharing(true);
        setStatusMessage(null);
        const dataUrl = await generateImageDataUrl();

        if (dataUrl) {
            try {
                const response = await fetch(dataUrl);
                const blob = await response.blob();
                const file = new File([blob], `inspira-${quote.id}.png`, { type: 'image/png' });

                await navigator.share({
                    files: [file],
                    title: 'Inspira+', 
                    text: `"${quote.text}"`,
                });
            } catch (error: any) {
                if (error.name !== 'AbortError') {
                    console.error("Web Share API failed:", error);
                    showStatusMessage('error', 'Falha ao compartilhar.');
                }
            }
        } else {
            showStatusMessage('error', 'Falha ao gerar imagem.');
        }
        setIsSharing(false);
    };

    // Config for preview scaling
    const PREVIEW_WIDTH = 260;
    const ORIGINAL_WIDTH = 1080;
    const scale = PREVIEW_WIDTH / ORIGINAL_WIDTH;
    const previewHeight = aspectRatio === '1:1' ? PREVIEW_WIDTH : (PREVIEW_WIDTH * (16/9));

    // Dynamic UI Colors based on Quote Type
    const modalActiveFormatColor = isDailyQuote ? 'bg-amber-500' : 'bg-violet-600';
    const modalButtonColor = isDailyQuote ? 'bg-amber-500 hover:bg-amber-600' : 'bg-violet-600 hover:bg-violet-700';
    const modalBorderColor = isDailyQuote ? 'border-amber-500 text-amber-600' : 'border-violet-600 text-violet-600';

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-label="Compartilhar Citação"
            className={`fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-end justify-center`}
        >
            <div className={`bg-white text-gray-900 w-full max-w-lg rounded-t-3xl shadow-2xl flex flex-col max-h-[90vh] ${isClosing ? 'animate-slide-out-down' : 'animate-slide-in-bottom'}`}>
                <header className="flex items-center justify-between p-4 flex-shrink-0 border-b border-gray-100">
                    <h1 className="text-xl font-bold text-gray-900 font-sora">Compartilhar</h1>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors" aria-label="Fechar">
                        <CloseIcon className="text-2xl text-gray-600" />
                    </button>
                </header>

                <div className="flex-grow overflow-y-auto scrollbar-hide space-y-6 p-6 bg-gray-50">
                    {/* Format Selection */}
                    <div role="radiogroup" aria-label="Escolher formato" className="flex justify-center p-1 bg-white rounded-full shadow-sm ring-1 ring-gray-200">
                        <button
                            onClick={() => setAspectRatio('1:1')}
                            className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-all ${aspectRatio === '1:1' ? `${modalActiveFormatColor} text-white shadow-md` : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            Post (1:1)
                        </button>
                        <button
                            onClick={() => setAspectRatio('9:16')}
                            className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-all ${aspectRatio === '9:16' ? `${modalActiveFormatColor} text-white shadow-md` : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            Story (9:16)
                        </button>
                    </div>

                    {/* Live Preview */}
                    <div className="flex justify-center items-center py-4 min-h-[320px]">
                        <div 
                            className="relative shadow-2xl rounded-2xl overflow-hidden ring-4 ring-white/50 transition-all duration-300 ease-in-out"
                            style={{
                                width: `${PREVIEW_WIDTH}px`,
                                height: `${previewHeight}px`,
                            }}
                        >
                             <div 
                                style={{ 
                                    transform: `scale(${scale})`, 
                                    transformOrigin: 'top left',
                                    width: '1080px',
                                    height: aspectRatio === '1:1' ? '1080px' : '1920px',
                                    pointerEvents: 'none'
                                }}
                             >
                                <QuoteShareCard 
                                    quote={quote} 
                                    aspectRatio={aspectRatio} 
                                    id="preview-render" 
                                    isDailyQuote={isDailyQuote} 
                                />
                             </div>
                        </div>
                    </div>

                    {/* Hidden Render Targets */}
                    <div style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden', left: 0, top: 0 }}>
                        <QuoteShareCard quote={quote} aspectRatio="1:1" id="share-card-1:1" isDailyQuote={isDailyQuote} />
                        <QuoteShareCard quote={quote} aspectRatio="9:16" id="share-card-9:16" isDailyQuote={isDailyQuote} />
                    </div>
                </div>

                <div className="p-6 bg-white border-t border-gray-100 space-y-4">
                    <div className="flex gap-4">
                        {canShare && (
                            <button
                                onClick={handleShare}
                                disabled={isProcessing}
                                className={`flex-1 ${modalButtonColor} text-white font-bold py-4 rounded-xl transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg`}
                            >
                                {isSharing ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                ) : (
                                    <ShareIcon className="text-2xl" />
                                )}
                                <span>Postar</span>
                            </button>
                        )}
                        <button
                            onClick={handleDownload}
                            disabled={isProcessing}
                            className={`flex-1 font-bold py-4 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 border-2 ${
                                canShare
                                ? 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                                : `${modalBorderColor} hover:bg-gray-50`
                            }`}
                        >
                            {isDownloading ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-400 border-t-transparent"></div>
                            ) : (
                                <DownloadIcon className="text-2xl" />
                            )}
                            <span>Baixar</span>
                        </button>
                    </div>
                    
                    {statusMessage && (
                        <div className={`text-center text-sm font-medium flex items-center justify-center gap-2 py-2 rounded-lg ${statusMessage.type === 'success' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                            {statusMessage.type === 'success' ? <CheckIcon className="text-lg" /> : <CloseIcon className="text-lg" />}
                            <span>{statusMessage.text}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};