import React, { useState } from 'react';
import { OnboardingLayout } from '../../ui/OnboardingLayout';
import { GradientButton } from '../../ui/ContinueButton';
import { useUserData } from '../../../context/UserDataContext';

interface GoalsScreenProps {
    onNext: () => void;
    onBack: () => void;
    progress: number;
}

export const GoalsScreen: React.FC<GoalsScreenProps> = ({ onNext, onBack, progress }) => {
    const [goals, setGoals] = useState('');
    const { updateUserData } = useUserData();

    const handleNext = () => {
        updateUserData({ goals });
        onNext(); // This will now go to PersonalizeIntro2
    };

    return (
        <OnboardingLayout 
            title="Quais são seus objetivos no momento?" 
            showSkip onSkip={onNext} 
            showBack onBack={onBack}
            progress={progress}
            footer={<GradientButton onClick={handleNext} text="Continuar" />}
        >
            <div className="w-full">
                <textarea
                    value={goals}
                    onChange={(e) => setGoals(e.target.value)}
                    placeholder="Compartilhe as suas ideias aqui"
                    maxLength={250}
                    className="w-full h-36 p-4 bg-white rounded-2xl text-gray-800 text-base outline-none transition-colors resize-none border-2 border-gray-200 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 placeholder-gray-400"
                    aria-label="Campo para descrever seus objetivos"
                />
                <p className="text-right text-sm text-gray-500 mt-2">{goals.length}/250</p>
            </div>
        </OnboardingLayout>
    );
};