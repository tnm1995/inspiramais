import React, { useState } from 'react';
import { OnboardingLayout } from '../../ui/OnboardingLayout';
import { GradientButton } from '../../ui/ContinueButton';
import { useUserData } from '../../../context/UserDataContext';
import { FilledCheckIcon } from '../../Icons';

const options = [
    "Resgatar minha autoestima", 
    "Equilibrar maternidade e carreira", 
    "Ter independência emocional",
    "Diminuir a carga mental e ansiedade", 
    "Me sentir mais empoderada", 
    "Desenvolver amor próprio", 
    "Conectar com minha intuição"
];

interface AppGoalsScreenProps {
    onNext: () => void;
    onBack: () => void;
    progress: number;
}

export const AppGoalsScreen: React.FC<AppGoalsScreenProps> = ({ onNext, onBack, progress }) => {
    const [selected, setSelected] = useState<string[]>([]);
    const { updateUserData } = useUserData();
    
    const toggleSelection = (option: string) => {
        setSelected(prev => 
            prev.includes(option) ? prev.filter(item => item !== option) : [...prev, option]
        );
    };

    const handleNext = () => {
        if (selected.length > 0) {
            updateUserData({ appGoals: selected });
            onNext();
        }
    };

    return (
        <OnboardingLayout 
            title="O que você busca aqui, mulher?" 
            showSkip onSkip={onNext} 
            showBack onBack={onBack}
            progress={progress}
            footer={<GradientButton onClick={handleNext} disabled={selected.length === 0} text="Continuar" />}
        >
            <div role="group" aria-label="Objetivos com o aplicativo" className="space-y-3 w-full">
                {options.map(option => (
                     <button
                        key={option}
                        onClick={() => toggleSelection(option)}
                        className={`w-full p-4 rounded-xl text-left transition-all duration-200 flex items-center justify-between font-medium text-lg border-2 ${selected.includes(option) ? 'bg-violet-500 border-violet-500 text-white shadow-lg' : 'bg-white border-gray-200 hover:border-gray-300 text-gray-800'}`}
                        role="checkbox"
                        aria-checked={selected.includes(option)}
                    >
                        <span className="pr-4">{option}</span>
                        {selected.includes(option) && <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center flex-shrink-0"><FilledCheckIcon className="text-violet-500 text-2xl" /></div>}
                    </button>
                ))}
            </div>
        </OnboardingLayout>
    );
};