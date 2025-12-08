

import React, { useState } from 'react';
import { ChevronRightIcon, UserCircleIcon } from '../Icons';

interface GooglePlayPurchaseSheetProps {
    planName: string;
    planPrice: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export const GooglePlayPurchaseSheet: React.FC<GooglePlayPurchaseSheetProps> = ({ planName, planPrice, onConfirm, onCancel }) => {
    const [isClosing, setIsClosing] = useState(false);
    
    const handleClose = () => {
        setIsClosing(true);
        setTimeout(onCancel, 300); // Wait for animation
    };

    return (
        <div 
            role="dialog" 
            aria-modal="true" 
            aria-label="Confirmar compra no Google Play" 
            className="fixed inset-0 bg-black/60 z-[100] flex items-end justify-center" 
            onClick={handleClose}
        >
            <div 
                className={`bg-[#202124] text-white w-full max-w-lg rounded-t-2xl shadow-2xl p-6 space-y-4 ${isClosing ? 'animate-slide-out-down' : 'animate-slide-in-bottom'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Inspira+</h2>
                    <span className="text-sm text-slate-400">Google Play</span>
                </div>

                <div className="flex items-center space-x-4">
                    <img src="/vite.svg" alt="Ícone do aplicativo Inspira+" className="w-12 h-12 rounded-lg" />
                    <div>
                        <p className="font-medium">{planName}</p>
                        <p className="text-sm text-slate-400">{planPrice} · Inspira+</p>
                    </div>
                </div>

                <div className="w-full h-px bg-slate-700 my-2" aria-hidden="true"></div>

                <nav aria-label="Opções de Conta e Pagamento">
                    <button className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-slate-700/50 transition-colors" aria-label="Detalhes da conta: user@example.com">
                        <div className="flex items-center space-x-3">
                            <UserCircleIcon className="text-4xl text-slate-400" aria-hidden="true" />
                            <div>
                                <p className="text-sm">user@example.com</p>
                                <p className="text-xs text-slate-400">Assinar</p>
                            </div>
                        </div>
                        <ChevronRightIcon className="text-xl text-slate-400" aria-hidden="true" />
                    </button>
                    
                    <button className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-slate-700/50 transition-colors mt-2" aria-label="Método de pagamento: Mastercard, final 1234">
                        <div className="flex items-center space-x-3">
                            <img src="https://www.gstatic.com/images/icons/material/system_gm/1x/credit_card_black_24dp.png" alt="Ícone de cartão de crédito" className="w-8 h-8 p-1 bg-white rounded-md" />
                            <div>
                                <p className="text-sm">Mastercard •••• 1234</p>
                                <p className="text-xs text-slate-400">A cobrança se repetirá automaticamente</p>
                            </div>
                        </div>
                        <ChevronRightIcon className="text-xl text-slate-400" aria-hidden="true" />
                    </button>
                </nav>

                <div className="pt-2">
                    <button 
                        onClick={onConfirm}
                        className="w-full bg-[#00875f] text-white font-semibold py-3 px-4 rounded-lg transition-colors hover:bg-[#007a56] active:scale-95"
                        aria-label="Confirmar compra com 1 toque"
                    >
                        1 toque para comprar
                    </button>
                    <p className="text-xs text-slate-500 text-center mt-3">
                        Ao tocar em "1 toque para comprar", você concorda com os Termos de Serviço.
                    </p>
                </div>
            </div>
        </div>
    );
};