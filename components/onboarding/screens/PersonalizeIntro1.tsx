

import React from 'react';
import { OnboardingLayout } from '../../ui/OnboardingLayout';
import { GradientButton } from '../../ui/ContinueButton';

interface PersonalizeIntro1Props {
    onNext: () => void;
    onBack: () => void;
    progress: number;
}

export const PersonalizeIntro1: React.FC<PersonalizeIntro1Props> = ({ onNext, onBack, progress }) => {
    return (
        <OnboardingLayout
            title="Personalize o app para melhorar a sua experiência"
            showBack
            onBack={onBack}
            progress={progress}
            footer={<GradientButton onClick={onNext} text="Continuar" />}
        >
            <div className="h-16"></div>
        </OnboardingLayout>
    );
};