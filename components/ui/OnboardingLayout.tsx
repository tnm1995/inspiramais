import React, { ReactNode } from 'react';
import { ChevronLeftIcon } from '../Icons';

interface OnboardingLayoutProps {
    children: ReactNode;
    title: string;
    subtitle?: string;
    footer?: ReactNode;
    showSkip?: boolean;
    onSkip?: () => void;
    showBack?: boolean;
    onBack?: () => void;
    progress?: number;
}

export const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({ children, title, subtitle, footer, showSkip, onSkip, showBack, onBack, progress }) => {
    return (
        <div className="w-full h-full flex flex-col text-center bg-gray-50 p-4 md:p-6">
            <header className="flex-shrink-0 w-full max-w-xl mx-auto" role="banner">
                <h2 className="text-2xl font-bold text-gray-800 text-center" aria-label="Inspira mais">Inspira<span className="text-violet-500">+</span></h2>
                
                {(showBack || showSkip || progress !== undefined) && (
                    <div className="flex justify-between items-center z-10 w-full mx-auto h-16 space-x-4 mt-2" role="region" aria-label="Barra de progresso e navegação">
                        <div className="w-14 flex-shrink-0">
                            {showBack && (
                                <button onClick={onBack} aria-label="Voltar" className="w-12 h-12 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-gray-200 transition-colors">
                                    <ChevronLeftIcon className="text-3xl" />
                                </button>
                            )}
                        </div>
                        <div className="flex-grow">
                            {progress !== undefined && (
                                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
                                    <div className="h-2 bg-violet-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                                </div>
                            )}
                        </div>
                        <div className="w-14 flex-shrink-0 text-right">
                            {showSkip && (
                                <button onClick={onSkip} aria-label="Pular esta etapa" className="text-gray-500 hover:text-gray-800 transition-colors font-semibold text-lg px-2">Pular</button>
                            )}
                        </div>
                    </div>
                )}
            </header>
            
            <main className="w-full max-w-xl mx-auto flex flex-col px-1 pt-4 flex-grow overflow-y-auto scrollbar-hide">
                <div className="flex-shrink-0 mb-8 text-center" role="region" aria-label="Título da etapa de onboarding">
                     <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900">{title}</h1>
                    {subtitle && <p className="text-gray-600 text-lg">{subtitle}</p>}
                </div>
                
                <div className="w-full">
                     {children}
                </div>

                {footer && (
                    <footer className="w-full flex-shrink-0 pt-6 pb-4">
                        {footer}
                    </footer>
                )}
            </main>
        </div>
    );
};