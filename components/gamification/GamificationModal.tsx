import React from 'react';
import { UserStats } from '../../types';
import { CloseIcon, TrophyIcon, FlameIcon, BoltIcon, TargetIcon } from '../Icons';

interface GamificationModalProps {
    stats: UserStats;
    onClose: () => void;
    isClosing: boolean;
}

const LevelNames = [
    "Buscadora", "Iniciada", "Aprendiz", "Pensadora", "Filósofa", 
    "Sábia", "Mestra", "Iluminada", "Oráculo", "Lenda"
];

export const GamificationModal: React.FC<GamificationModalProps> = ({ stats, onClose, isClosing }) => {
    
    const safeStats: Partial<UserStats> = stats || {};
    const safeLevel = safeStats.level || 1;
    const safeXP = safeStats.xp || 0;
    const safeQuests = Array.isArray(safeStats.quests) ? safeStats.quests : [];
    const safeStreak = safeStats.currentStreak || 0;
    const safeReads = safeStats.totalQuotesRead || 0;
    const safeShares = safeStats.totalShares || 0;

    const levelIndex = Math.max(0, Math.min(safeLevel - 1, LevelNames.length - 1));
    const levelName = LevelNames[levelIndex] || "Iniciada";
    
    const nextLevelXp = Math.pow(safeLevel, 2) * 100;
    const prevLevelXp = Math.pow(safeLevel - 1, 2) * 100;
    const range = nextLevelXp - prevLevelXp;
    const progressInLevel = Math.max(0, safeXP - prevLevelXp);
    
    const levelProgress = range > 0 ? Math.min(100, (progressInLevel / range) * 100) : 0;

    return (
        <div 
            role="dialog" 
            aria-modal="true" 
            aria-label="Jornada de Sabedoria" 
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-end md:items-center justify-center"
            onClick={onClose} 
        >
            <div 
                className={`bg-[#121212] text-white w-full max-w-lg md:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-white/10 ${isClosing ? 'animate-slide-out-down' : 'animate-slide-in-bottom'}`}
                onClick={(e) => e.stopPropagation()} 
            >
                {/* Header */}
                <header className="relative bg-[#1c1917] text-white p-6 md:p-8 overflow-hidden flex-shrink-0">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
                    {/* Golden Glow */}
                    <div className="absolute top-[-50%] right-[-20%] w-[300px] h-[300px] bg-amber-500/20 rounded-full blur-[80px] pointer-events-none"></div>

                    <div className="relative z-10 flex justify-between items-start">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-bold uppercase tracking-wider mb-2">
                                <TrophyIcon className="text-sm" /> Jornada
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold font-sora text-white">{levelName}</h1>
                            <p className="text-gray-400 text-sm mt-1">Nível {safeLevel}</p>
                        </div>
                        <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors z-20" aria-label="Fechar">
                            <CloseIcon className="text-white" />
                        </button>
                    </div>

                    {/* XP Bar */}
                    <div className="relative z-10 mt-8">
                        <div className="flex justify-between text-xs text-amber-200/60 mb-2 font-medium">
                            <span>{safeXP} XP</span>
                            <span>{nextLevelXp} XP</span>
                        </div>
                        <div className="h-4 w-full bg-black/40 rounded-full overflow-hidden backdrop-blur-sm border border-white/5">
                            <div 
                                className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-yellow-200 transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(251,191,36,0.3)]" 
                                style={{ width: `${levelProgress}%` }}
                            ></div>
                        </div>
                    </div>
                </header>

                <div className="flex-grow overflow-y-auto scrollbar-hide p-6 bg-[#121212] space-y-6">
                    
                    {/* Streak Card */}
                    <div className="bg-gradient-to-br from-orange-900/20 to-transparent p-5 rounded-2xl border border-orange-500/20 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20">
                                <FlameIcon className="text-2xl" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-lg">Constância</h3>
                                <p className="text-xs text-orange-200/60">Dias seguidos</p>
                            </div>
                        </div>
                        <div className="text-center">
                            <span className="block text-3xl font-bold text-orange-500 leading-none font-sora">{safeStreak}</span>
                        </div>
                    </div>

                    {/* Daily Quests */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest px-1">Rituais Diários</h3>
                        {safeQuests.length > 0 ? (
                            safeQuests.map((quest) => (
                                <div key={quest.id || Math.random()} className={`p-4 rounded-2xl border transition-all ${quest.completed ? 'bg-green-900/10 border-green-500/30' : 'bg-white/5 border-white/5'}`}>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${quest.completed ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-gray-400'}`}>
                                                <span className="material-symbols-outlined text-[20px]">
                                                    {quest.icon || 'star'}
                                                </span>
                                            </div>
                                            <div>
                                                <p className={`font-bold text-sm ${quest.completed ? 'text-green-200' : 'text-gray-200'}`}>
                                                    {quest.title}
                                                </p>
                                                <p className="text-[10px] text-gray-500">{quest.description}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 bg-amber-500/10 text-amber-400 px-2 py-1 rounded border border-amber-500/20 text-[10px] font-bold">
                                            <BoltIcon className="text-sm" />
                                            +{quest.xpReward}
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3">
                                        <div className="flex-grow h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full transition-all duration-500 ${quest.completed ? 'bg-green-500' : 'bg-violet-500'}`} 
                                                style={{ width: `${Math.min(100, ((quest.current || 0) / (quest.target || 1)) * 100)}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-xs font-mono text-gray-500">
                                            {quest.current || 0}/{quest.target || 1}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-gray-500 text-sm py-4 bg-white/5 rounded-xl">
                                <p>Tudo feito por hoje.</p>
                            </div>
                        )}
                    </div>

                     {/* Stats Grid */}
                     <div className="grid grid-cols-2 gap-3 pb-safe">
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center">
                            <p className="text-gray-500 text-[10px] uppercase tracking-wider mb-1">Leituras</p>
                            <p className="text-2xl font-bold text-white font-sora">{safeReads}</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center">
                            <p className="text-gray-500 text-[10px] uppercase tracking-wider mb-1">Compartilhamentos</p>
                            <p className="text-2xl font-bold text-white font-sora">{safeShares}</p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};