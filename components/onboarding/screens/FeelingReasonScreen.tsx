import React, { useState } from 'react';
import { OnboardingLayout } from '../../ui/OnboardingLayout';
import { useUserData } from '../../../context/UserDataContext';
import { CheckCircleIcon } from '../../Icons';

const options = ["Família", "Amigos", "Trabalho", "Saúde", "Relação", "Dívida", "Outro"];

interface FeelingReasonScreenProps {
    onNext: () => void;
    onBack: () => void;
    progress: number;
}

export const FeelingReasonScreen: React.FC<FeelingReasonScreenProps> = ({ onNext, onBack, progress }) => {
    const [selected, setSelected] = useState<string | null>(null);
    const { updateUserData } = useUserData();

    const handleSelect = (option: string) => {
        setSelected(option);
        updateUserData({ feelingReason: option });
        setTimeout(() => {
            onNext();
        }, 300);
    };

    return (
        <OnboardingLayout 
            title="O que está fazendo você se sentir assim?" 
            showSkip={true}
            onSkip={onNext}
            showBack={true}
            onBack={onBack}
            progress={progress}
        >
            <div className="space-y-3 w-full">
                {options.map(option => (
                    <button
                        key={option}
                        onClick={() => handleSelect(option)}
                        className={`w-full p-4 rounded-xl text-left transition-all duration-200 flex items-center justify-between font-medium text-lg border-2 ${selected === option ? 'bg-violet-500 border-violet-500 text-white shadow-lg' : 'bg-white border-gray-200 hover:border-gray-300 text-gray-800'}`}
                    >
                        <span>{option}</span>
                        {selected === option && <CheckCircleIcon className="text-2xl text-white" />}
                    </button>
                ))}
            </div>
        </OnboardingLayout>
    );
};