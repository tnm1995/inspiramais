
import React from 'react';
import { TrophyIcon, StarIcon } from '../Icons';
import { Particles } from '../ui/Particles';

interface LevelUpModalProps {
    newLevel: number;
    onClose: () => void;
    isClosing?: boolean;
}

const LevelNames = [
    "Buscadora", "Iniciada", "Aprendiz", "Pensadora", "Filósofa", 
    "Sábia", "Mestra", "Iluminada", "Oráculo", "Lenda"
];

export const LevelUpModal: React.FC<LevelUpModalProps> = ({ newLevel, onClose, isClosing }) => {
    const levelName = LevelNames[Math.min(newLevel - 1, LevelNames.length - 1)];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md">
            <div className={`relative bg-[#1c1917] w-[90%] max-w-sm rounded-3xl p-8 text-center border-2 border-amber-500/50 shadow-[0_0_50px_rgba(245,158,11,0.3)] overflow-hidden ${isClosing ? 'animate-slide-out-down' : 'animate-slide-in-bottom'}`}>
                
                {/* Particles/Confetti Effect - Rendered FIRST to stay BEHIND content */}
                <Particles active={true} />

                {/* Background Effects */}
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-amber-500/20 to-transparent pointer-events-none"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-600 rounded-full flex items-center justify-center shadow-2xl mb-6 ring-4 ring-amber-500/30 animate-pop">
                        <TrophyIcon className="text-5xl text-white drop-shadow-md" />
                    </div>
                    
                    <h2 className="text-amber-500 font-bold tracking-widest uppercase mb-2 text-sm">Nível Alcançado</h2>
                    <h1 className="text-4xl font-extrabold text-white font-sora mb-1">{newLevel}</h1>
                    <p className="text-2xl text-amber-200 font-serif italic mb-8">{levelName}</p>

                    <div className="bg-white/10 rounded-xl p-4 mb-8 w-full backdrop-blur-sm border border-white/5">
                        <p className="text-gray-300 text-sm">Sua sabedoria está crescendo. Continue sua jornada diária de inspiração.</p>
                    </div>

                    <button 
                        onClick={onClose}
                        className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-amber-500/40 active:scale-95 transition-all cursor-pointer relative z-20"
                    >
                        Celebrar Conquista
                    </button>
                </div>
            </div>
        </div>
    );
};
