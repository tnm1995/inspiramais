import React, { useState, useEffect } from 'react';
import { Quote } from '../../types';
import { CloseIcon, SparkleIcon, LightbulbIcon, HeartIcon, TargetIcon, ChevronLeftIcon, ClipboardIcon, CheckIcon } from '../Icons';
import { useUserData } from '../../context/UserDataContext';
import { generateExploreSuggestions, generateExploreResponse } from '../../services/aiService';
import { ThinkingIndicator } from '../ui/ThinkingIndicator';

interface ExploreModalProps {
    quote: Quote;
    onClose: () => void;
    isClosing: boolean;
}

interface StructuredResponse {
    insight: string;
    action: string;
    mantra: string;
}

export const ExploreModal: React.FC<ExploreModalProps> = ({ quote, onClose, isClosing }) => {
    const { userData } = useUserData();
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
    const [result, setResult] = useState<StructuredResponse | null>(null);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(true);
    const [isLoadingResponse, setIsLoadingResponse] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mantraCopied, setMantraCopied] = useState(false);

    useEffect(() => {
        const fetchSuggestions = async () => {
            setIsLoadingSuggestions(true);
            setError(null);
            const data = await generateExploreSuggestions(quote);
            if (data && data.length > 0) {
                setSuggestions(data);
            } else {
                setError("Não foi possível conectar com sua intuição agora.");
            }
            setIsLoadingSuggestions(false);
        };
        fetchSuggestions();
    }, [quote]);

    const handleSelectSuggestion = async (suggestion: string) => {
        if (!userData) return;
        setSelectedSuggestion(suggestion);
        setIsLoadingResponse(true);
        setError(null);
        setResult(null);
        
        const responseData = await generateExploreResponse(quote, suggestion, userData);
        
        if (responseData) {
            setResult(responseData);
        } else {
             setError("Não foi possível gerar a resposta. Tente novamente mais tarde.");
             setSelectedSuggestion(null); // Reset selection to allow retry
        }
        setIsLoadingResponse(false);
    };

    const handleCopyMantra = () => {
        if (result?.mantra) {
            const cleanText = result.mantra.replace(/\*\*/g, '').replace(/\*/g, '');
            navigator.clipboard.writeText(cleanText);
            setMantraCopied(true);
            setTimeout(() => setMantraCopied(false), 2000);
        }
    };

    const handleReset = () => {
        setSelectedSuggestion(null);
        setResult(null);
    };

    // Helper to render **bold** text
    const renderFormattedText = (text: string) => {
        if (!text) return null;
        // Split by **text** pattern
        const parts = text.split(/\*\*(.*?)\*\*/g);
        return parts.map((part, index) => {
            // Odd indices are the captured bold text
            if (index % 2 === 1) {
                return <strong key={index} className="text-white font-bold">{part}</strong>;
            }
            return <span key={index}>{part}</span>;
        });
    };

    // Helper to clean mantra text (remove markdown for cleaner look in serif font)
    const renderMantraText = (text: string) => {
        if (!text) return "";
        return text.replace(/\*\*/g, '').replace(/\*/g, '');
    };

    return (
        <div role="dialog" aria-modal="true" aria-label="Explorar Citação com IA" className={`fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-end justify-center`}>
            <div className={`bg-[#0f0f11] text-white w-full max-w-lg rounded-t-3xl shadow-2xl flex flex-col h-[90vh] border-t border-white/10 overflow-hidden ${isClosing ? 'animate-slide-out-down' : 'animate-slide-in-bottom'}`}>
                
                {/* Background Atmosphere */}
                <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[50%] bg-violet-900/30 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[80%] h-[50%] bg-fuchsia-900/20 rounded-full blur-[100px] pointer-events-none"></div>

                {/* Header */}
                <header className="relative z-10 flex items-center justify-between p-6 flex-shrink-0">
                    <div className="flex items-center gap-2">
                        {selectedSuggestion && (
                            <button onClick={handleReset} className="mr-2 text-gray-400 hover:text-white transition-colors">
                                <ChevronLeftIcon className="text-xl" />
                            </button>
                        )}
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                            <SparkleIcon className="text-white text-sm" />
                        </div>
                        <h1 className="text-lg font-bold font-serif tracking-wide">Profundidade</h1>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors border border-white/5" aria-label="Fechar">
                        <CloseIcon className="text-xl text-gray-300" />
                    </button>
                </header>

                {/* Main Content */}
                <div className="relative z-10 flex-grow overflow-y-auto scrollbar-hide p-6 pt-2">
                    
                    {/* Context Quote */}
                    <div className="mb-8 p-4 rounded-xl bg-white/5 border border-white/5 relative group">
                        <div className="absolute -left-1 top-4 bottom-4 w-1 bg-violet-500 rounded-full opacity-50 group-hover:opacity-100 transition-opacity"></div>
                        <p className="text-gray-300 italic text-sm leading-relaxed font-serif">"{quote.text}"</p>
                    </div>

                    {/* Content Switcher */}
                    {error ? (
                        <div className="text-center p-8 bg-red-500/10 rounded-2xl border border-red-500/20">
                            <p className="text-red-300">{error}</p>
                            <button onClick={onClose} className="mt-4 text-sm font-bold underline">Fechar</button>
                        </div>
                    ) : isLoadingSuggestions ? (
                        <div className="flex flex-col items-center justify-center h-64 space-y-4">
                            <ThinkingIndicator text="Sintonizando..." className="text-violet-300" />
                        </div>
                    ) : !selectedSuggestion ? (
                        // SELECTION STATE
                        <div className="space-y-4 animate-fade-in">
                            <h2 className="text-xl font-bold text-center mb-6 font-serif">O que sua alma quer explorar?</h2>
                            {suggestions.map((s, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSelectSuggestion(s)}
                                    className="w-full p-5 rounded-2xl text-left font-medium transition-all duration-300 bg-gradient-to-r from-[#1a1a1c] to-[#151517] border border-white/10 hover:border-violet-500/50 hover:shadow-[0_0_20px_rgba(139,92,246,0.15)] group relative overflow-hidden active:scale-98"
                                    style={{ animationDelay: `${i * 100}ms`}}
                                >
                                    <div className="absolute inset-0 bg-violet-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <p className="text-gray-200 group-hover:text-white transition-colors text-lg relative z-10 font-serif leading-snug">
                                        {s}
                                    </p>
                                    <div className="mt-3 flex items-center text-xs text-violet-400 font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
                                        <SparkleIcon className="mr-1" /> Revelar
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : isLoadingResponse ? (
                         <div className="flex flex-col items-center justify-center h-64 space-y-4">
                             <ThinkingIndicator text="Consultando a sabedoria..." className="text-violet-300" />
                         </div>
                    ) : result ? (
                        // RESULT STATE
                        <div className="space-y-6 animate-slide-in-up pb-10">
                            <div className="text-center mb-6">
                                <p className="text-xs text-gray-500 uppercase tracking-widest mb-2 font-bold">Sua Pergunta</p>
                                <p className="text-lg text-white font-serif">{selectedSuggestion}</p>
                            </div>

                            {/* Insight Card */}
                            <div className="bg-gradient-to-br from-violet-900/20 to-transparent p-6 rounded-2xl border border-violet-500/20 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-20"><LightbulbIcon className="text-4xl text-violet-400" filled /></div>
                                <h3 className="text-violet-300 font-bold text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <LightbulbIcon className="text-sm" /> Insight
                                </h3>
                                <p className="text-gray-200 leading-relaxed font-sans text-base">
                                    {renderFormattedText(result.insight)}
                                </p>
                            </div>

                            {/* Action Card */}
                            <div className="bg-[#1a1a1c] p-6 rounded-2xl border border-white/5 flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0 text-emerald-400 border border-emerald-500/20">
                                    <TargetIcon className="text-xl" />
                                </div>
                                <div>
                                    <h3 className="text-emerald-400 font-bold text-xs uppercase tracking-widest mb-1">Prática de Hoje</h3>
                                    <p className="text-gray-300 text-sm">
                                        {renderFormattedText(result.action)}
                                    </p>
                                </div>
                            </div>

                            {/* Mantra Card */}
                            <div className="relative group cursor-pointer" onClick={handleCopyMantra}>
                                <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600 to-pink-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
                                <div className="relative bg-[#1a1a1c] p-6 rounded-2xl border border-white/10 text-center hover:border-fuchsia-500/50 transition-colors">
                                    <HeartIcon className="text-fuchsia-400 text-2xl mx-auto mb-3 animate-pulse-slow" filled />
                                    <p className="text-xl md:text-2xl font-serif text-white mb-4 leading-tight">
                                        "{renderMantraText(result.mantra)}"
                                    </p>
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 text-[10px] text-gray-400 uppercase tracking-wider font-bold group-hover:bg-white/10 transition-colors">
                                        {mantraCopied ? <CheckIcon className="text-green-400" /> : <ClipboardIcon />}
                                        {mantraCopied ? "Copiado!" : "Toque para copiar"}
                                    </div>
                                </div>
                            </div>

                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
};