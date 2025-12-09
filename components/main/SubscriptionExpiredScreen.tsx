
import React from 'react';
import { CrownIcon, LogoutIcon, ArrowRightIcon, LockIcon } from '../Icons';
import { usePageTracking } from '../../hooks/usePageTracking';

interface SubscriptionExpiredScreenProps {
    onRenew: () => void;
    onLogout: () => void;
}

export const SubscriptionExpiredScreen: React.FC<SubscriptionExpiredScreenProps> = ({ onRenew, onLogout }) => {
    usePageTracking('SubscriptionExpiredScreen');
    return (
        <div className="fixed inset-0 z-[100] bg-[#050505] text-white flex flex-col items-center justify-center p-6 overflow-hidden animate-fade-in">
            {/* Background Atmosphere */}
            <div className="absolute top-[-20%] left-[-10%] w-[90%] h-[50%] bg-red-900/20 rounded-full blur-[120px] pointer-events-none animate-pulse-slow"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[90%] h-[50%] bg-amber-900/10 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute inset-0 bg-noise opacity-[0.05] pointer-events-none mix-blend-overlay"></div>

            <div className="relative z-10 w-full max-w-md text-center space-y-8">
                
                {/* Icon */}
                <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
                    <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping opacity-20"></div>
                    <div className="relative w-full h-full bg-gradient-to-br from-red-900 to-black border border-red-500/50 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(239,68,68,0.3)]">
                        <LockIcon className="text-4xl text-red-500" />
                    </div>
                </div>

                {/* Text Content */}
                <div className="space-y-4">
                    <h1 className="text-3xl md:text-4xl font-serif font-bold text-white">
                        Acesso Restrito
                    </h1>
                    <p className="text-gray-400 font-sans leading-relaxed text-base md:text-lg">
                        O Inspira+ é uma comunidade exclusiva para assinantes Premium. Para iniciar ou continuar sua jornada de inspiração, ative seu acesso agora.
                    </p>
                </div>

                {/* Actions */}
                <div className="space-y-4 pt-4">
                    <button 
                        onClick={onRenew}
                        className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold py-4 rounded-xl shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 group"
                    >
                        <CrownIcon className="text-xl" />
                        <span>Assinar Premium</span>
                        <ArrowRightIcon className="group-hover:translate-x-1 transition-transform" />
                    </button>
                    
                    <button 
                        onClick={onLogout}
                        className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-gray-400 hover:text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                        <LogoutIcon className="text-xl" />
                        <span>Sair da conta</span>
                    </button>
                </div>

                <p className="text-xs text-gray-600 pt-8">
                    Se você acredita que isso é um erro, entre em contato com o suporte.
                </p>
            </div>
        </div>
    );
};