import React, { useState } from 'react';
import { OnboardingLayout } from '../../ui/OnboardingLayout';
import { useUserData } from '../../../context/UserDataContext';
import { CheckCircleIcon } from '../../Icons';

const options = ["13 a 17", "18 a 24", "25 a 34", "35 a 44", "45 a 54", "55+"];

interface AgeScreenProps {
    onNext: () => void;
    onBack: () => void;
    progress: number;
}

export const AgeScreen: React.FC<AgeScreenProps> = ({ onNext, onBack, progress }) => {
    const [selected, setSelected] = useState<string | null>(null);
    const { updateUserData } = useUserData();

    const handleSelect = (option: string) => {
        setSelected(option);
        updateUserData({ age: option });
        setTimeout(() => {
            onNext();
        }, 300);
    };
    
    return (
        <OnboardingLayout 
            title="Qual é sua idade?" 
            showSkip onSkip={onNext} 
            showBack onBack={onBack}
            progress={progress}
        >
            <div role="radiogroup" aria-label="Opções de idade" className="space-y-3 w-full">
                {options.map(option => (
                    <button
                        key={option}
                        onClick={() => handleSelect(option)}
                        className={`w-full p-4 rounded-xl text-left transition-all duration-200 flex items-center justify-between font-medium text-lg border-2 ${selected === option ? 'bg-violet-500 border-violet-500 text-white shadow-lg' : 'bg-white border-gray-200 hover:border-gray-300 text-gray-800'}`}
                        role="radio"
                        aria-checked={selected === option}
                    >
                        <span>{option}</span>
                        {selected === option && <CheckCircleIcon className="text-2xl text-white" aria-hidden="true" />}
                    </button>
                ))}
            </div>
        </OnboardingLayout>
    );
};