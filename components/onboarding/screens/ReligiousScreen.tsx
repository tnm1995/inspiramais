import React, { useState } from 'react';
import { OnboardingLayout } from '../../ui/OnboardingLayout';
import { CheckCircleIcon } from '../../Icons';

const options = ["Sim", "Não", "Espiritual, mas não religiosa"];

interface ReligiousScreenProps {
    onNext: (choice: string) => void;
    onBack: () => void;
    progress: number;
}

export const ReligiousScreen: React.FC<ReligiousScreenProps> = ({ onNext, onBack, progress }) => {
    const [selected, setSelected] = useState<string | null>(null);

    const handleSelect = (option: string) => {
        setSelected(option);
        setTimeout(() => {
            onNext(option);
        }, 300);
    };
    
    return (
        <OnboardingLayout 
            title="Você é religiosa?" 
            showSkip onSkip={() => onNext('Pular')} 
            showBack onBack={onBack}
            progress={progress}
        >
            <div role="radiogroup" aria-label="Opções de crença religiosa" className="space-y-3 w-full">
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