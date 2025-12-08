

import React from 'react';
import { OnboardingLayout } from '../../ui/OnboardingLayout';
import { GradientButton } from '../../ui/ContinueButton';

interface PersonalizeIntro2Props {
    onNext: () => void;
    onBack: () => void;
    progress: number;
}

export const PersonalizeIntro2: React.FC<PersonalizeIntro2Props> = ({ onNext, onBack, progress }) => {
    return (
        <OnboardingLayout
            title="Personalize o app para o que você quiser alcançar"
            showBack
            onBack={onBack}
            progress={progress}
            footer={<GradientButton onClick={onNext} text="Continuar" />}
        >
            <div className="h-16"></div>
        </OnboardingLayout>
    );
};