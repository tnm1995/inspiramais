import React, { useState, useEffect } from 'react';
import { CloseIcon, SparkleIcon } from '../Icons';

interface MockAdProps {
    onClose: () => void;
}

export const MockAd: React.FC<MockAdProps> = ({ onClose }) => {
    const [countdown, setCountdown] = useState(5);
    const [canSkip, setCanSkip] = useState(false);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanSkip(true);
        }
    }, [countdown]);

    return (
        <div className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center text-white animate-fade-in">
            {/* Safe Area Top */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-end z-20">
                {canSkip ? (
                    <button 
                        onClick={onClose} 
                        className="bg-black/50 backdrop-blur-md p-2 rounded-full border border-white/20 hover:bg-white/10 transition-colors flex items-center justify-center group" 
                        aria-label="Fechar anúncio"
                    >
                        <CloseIcon className="text-3xl text-white group-hover:text-gray-200" />
                    </button>
                ) : (
                    <div className="bg-black/50 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-medium border border-white/10">
                        <span>Pular em {countdown}s</span>
                    </div>
                )}
            </div>
            
            <div className="flex-grow w-full max-w-md flex flex-col items-center justify-center p-6 space-y-6 relative">
                 {/* Ad Content Container */}
                 <div className="w-full aspect-[9/16] max-h-[70vh] bg-gradient-to-br from-indigo-900 to-violet-800 rounded-xl overflow-hidden shadow-2xl relative flex flex-col">
                    {/* Simulated Video/Image Content */}
                    <div className="flex-grow flex items-center justify-center bg-slate-900 relative overflow-hidden">
                        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                        <SparkleIcon className="text-8xl text-indigo-400 animate-pulse" />
                    </div>
                    
                    {/* Bottom CTA Area */}
                    <div className="bg-white p-4 text-gray-900">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                                Ad
                            </div>
                            <div>
                                <h4 className="font-bold text-sm">Remova os anúncios</h4>
                                <p className="text-xs text-gray-500">Apoie o Inspira+ e desbloqueie tudo.</p>
                            </div>
                        </div>
                        <button className="w-full bg-indigo-600 text-white font-bold py-2 rounded-lg text-sm">
                            Saiba Mais
                        </button>
                    </div>
                </div>

                <div className="text-center opacity-50 text-xs">
                    <p>Anúncio Simulado (Google AdMob Placeholder)</p>
                    <p>Em produção, este componente será substituído pelo SDK nativo.</p>
                </div>
            </div>
        </div>
    );
};