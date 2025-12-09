
import React from 'react';
import { OnboardingLayout } from '../../ui/OnboardingLayout';
import { GradientButton } from '../../ui/ContinueButton';
import { SelfImprovementIcon, SparkleIcon } from '../../Icons';

interface WelcomeScreenProps {
    onNext: () => void;
    progress: number;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onNext, progress }) => {
    return (
        <OnboardingLayout 
            title="" 
            subtitle=""
            progress={progress}
            footer={
                <div className="w-full animate-slide-in-up" style={{ animationDelay: '0.6s' }}>
                    <GradientButton onClick={onNext} text="Personalizar Jornada" />
                </div>
            }
        >
            <div className="flex-grow flex flex-col items-center justify-center w-full h-full relative -mt-8">
                
                {/* Icon Section with Glow */}
                <div className="relative mb-10 mt-4 animate-slide-in-up" style={{ animationDelay: '0.1s' }}>
                    <div className="absolute inset-0 bg-violet-500/20 blur-[60px] rounded-full pointer-events-none"></div>
                    <div className="relative w-44 h-44 bg-gradient-to-br from-violet-50 to-white rounded-[2rem] flex items-center justify-center shadow-[0_20px_50px_rgba(139,92,246,0.15)] border border-white/80 transform rotate-3">
                        <div className="transform -rotate-3">
                            <SelfImprovementIcon className="text-violet-600 text-[5rem]" />
                        </div>
                        
                        {/* Decorative Elements */}
                        <div className="absolute -top-3 -right-3 bg-white rounded-full p-2 shadow-lg animate-bounce" style={{ animationDuration: '3s' }}>
                            <SparkleIcon className="text-amber-400 text-xl" />
                        </div>
                    </div>
                </div>

                {/* Custom Typography Section */}
                <div className="text-center space-y-5 max-w-sm mx-auto animate-slide-in-up" style={{ animationDelay: '0.3s' }}>
                    <h1 className="text-3xl md:text-4xl font-bold font-sora text-gray-900 leading-tight">
                        Bem-vinda ao seu <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">momento diário</span>
                    </h1>
                    <p className="text-gray-500 text-lg leading-relaxed font-sans font-medium">
                        Encontre inspiração para fortalecer sua autoestima, clarear sua mente e nutrir sua alma.
                    </p>
                </div>

            </div>
        </OnboardingLayout>
    );
};
