import React from 'react';
import { OnboardingLayout } from '../../ui/OnboardingLayout';
import { GradientButton } from '../../ui/ContinueButton';
import { SelfImprovementIcon } from '../../Icons';

interface WelcomeScreenProps {
    onNext: () => void;
    onQuickStart: () => void;
    progress: number;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onNext, onQuickStart, progress }) => {
    return (
        <OnboardingLayout 
            title="Bem-vinda ao seu momento diário"
            subtitle="Encontre inspiração para fortalecer sua autoestima, clarear sua mente e nutrir sua alma."
            progress={progress}
            footer={
                <div className="w-full space-y-3 animate-slide-in-up" style={{ animationDelay: '0.5s' }}>
                    <GradientButton onClick={onNext} text="Personalizar Jornada" />
                    <button 
                        onClick={onQuickStart} 
                        className="w-full text-gray-700 font-bold py-4 px-4 rounded-full transition-all bg-white ring-1 ring-gray-300 hover:bg-gray-100 active:bg-gray-200 transform active:scale-95"
                        aria-label="Início Rápido, sem personalização"
                    >
                        Entrar Agora
                    </button>
                </div>
            }
        >
            <div className="flex-grow flex items-center justify-center w-full my-4">
                <div className="my-4 animate-slide-in-up" style={{ animationDelay: '0.3s' }}>
                     <div className="relative w-48 h-48 flex items-center justify-center">
                        <div className="relative w-full h-full rounded-full bg-violet-100 flex items-center justify-center" aria-hidden="true">
                            <div className="relative text-violet-500 flex items-center justify-center" aria-hidden="true">
                                <SelfImprovementIcon style={{ fontSize: '11rem' }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </OnboardingLayout>
    );
};