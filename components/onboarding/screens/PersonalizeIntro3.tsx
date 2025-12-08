
import React from 'react';
import { OnboardingLayout } from '../../ui/OnboardingLayout';
import { GradientButton } from '../../ui/ContinueButton';
import { PsychologyIcon } from '../../Icons';

interface PersonalizeIntro3Props {
    onNext: () => void;
    onBack: () => void; // Added onBack prop
    progress: number; // Added progress prop
}

export const PersonalizeIntro3: React.FC<PersonalizeIntro3Props> = ({ onNext, onBack, progress }) => {
    return (
        <OnboardingLayout
            title="Responda a algumas perguntas para ter conteúdo personalizado"
            progress={progress}
            showBack={true} // Explicitly set to true
            onBack={onBack}
            footer={<GradientButton onClick={onNext} text="Continuar" />}
        >
            <div className="flex-grow flex items-center justify-center my-12">
                <div className="text-violet-400 flex items-center justify-center">
                    <PsychologyIcon style={{ fontSize: '15rem' }} />
                </div>
            </div>
        </OnboardingLayout>
    );
};