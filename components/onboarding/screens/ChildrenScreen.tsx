
import React, { useState } from 'react';
import { OnboardingLayout } from '../../ui/OnboardingLayout';
import { CheckCircleIcon, BabyIcon } from '../../Icons';
import { useUserData } from '../../../context/UserDataContext';

const options = ["Sim", "Não"];

interface ChildrenScreenProps {
    onNext: () => void;
    onBack: () => void;
    progress: number;
}

export const ChildrenScreen: React.FC<ChildrenScreenProps> = ({ onNext, onBack, progress }) => {
    const [selected, setSelected] = useState<string | null>(null);
    const { updateUserData } = useUserData();

    const handleSelect = (option: string) => {
        setSelected(option);
        updateUserData({ hasChildren: option });
        setTimeout(() => {
            onNext();
        }, 300);
    };
    
    return (
        <OnboardingLayout 
            title="Você tem filhos?" 
            subtitle="Isso nos ajuda a personalizar conteúdos sobre maternidade."
            showBack onBack={onBack}
            progress={progress}
        >
            <div className="flex justify-center mb-8 animate-fade-in">
                <div className="w-24 h-24 bg-violet-100 rounded-full flex items-center justify-center text-violet-500">
                    <BabyIcon style={{ fontSize: '3rem' }} />
                </div>
            </div>

            <div role="radiogroup" aria-label="Opções sobre filhos" className="space-y-3 w-full">
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
