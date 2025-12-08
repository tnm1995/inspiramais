import React, { useState } from 'react';
import { OnboardingLayout } from '../../ui/OnboardingLayout';
import { useUserData } from '../../../context/UserDataContext';
import { CheckCircleIcon } from '../../Icons';

const options = ["Em um relacionamento feliz", "Em um relacionamento desafiador", "Solteira feliz", "Solteira à procura", "Não interessada nesse tópico"];

interface RelationshipScreenProps {
    onNext: () => void;
    onBack: () => void;
    progress: number;
}

export const RelationshipScreen: React.FC<RelationshipScreenProps> = ({ onNext, onBack, progress }) => {
    const [selected, setSelected] = useState<string | null>(null);
    const { updateUserData } = useUserData();

    const handleSelect = (option: string) => {
        setSelected(option);
        updateUserData({ relationshipStatus: option });
        setTimeout(() => {
            onNext();
        }, 300);
    };
    
    return (
        <OnboardingLayout 
            title="Como você descreveria o seu relacionamento?" 
            showSkip onSkip={onNext} 
            showBack onBack={onBack}
            progress={progress}
        >
            <div role="radiogroup" aria-label="Opções de status de relacionamento" className="space-y-3 w-full">
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