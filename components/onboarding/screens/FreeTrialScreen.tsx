import React from 'react';
import { OnboardingLayout } from '../../ui/OnboardingLayout';
import { GradientButton } from '../../ui/ContinueButton';
import { CrownIcon } from '../../Icons';

interface FreeTrialScreenProps {
    onNext: () => void;
    onBack: () => void;
    progress: number;
}

export const FreeTrialScreen: React.FC<FreeTrialScreenProps> = ({ onNext, onBack, progress }) => {
    return (
        <OnboardingLayout
            title="Comece seu Teste Gratuito"
            subtitle="Experimente o Inspira+ Premium por 7 dias!"
            progress={progress}
            showBack={true}
            onBack={onBack}
            footer={<GradientButton onClick={onNext} text="Iniciar Teste Gratuito" />}
        >
            <div className="flex-grow flex items-center justify-center my-12">
                <div className="relative w-48 h-48">
                    <div className="relative w-full h-full rounded-full bg-violet-100 flex items-center justify-center" aria-hidden="true">
                        <div className="relative text-violet-500 flex items-center justify-center h-full w-full">
                             <CrownIcon style={{ fontSize: '8rem' }} />
                        </div>
                    </div>
                </div>
            </div>
        </OnboardingLayout>
    );
};