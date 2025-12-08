import React, { useState } from 'react';
import { OnboardingLayout } from '../../ui/OnboardingLayout';
import { useUserData } from '../../../context/UserDataContext';

const signs = ["Áries", "Touro", "Gêmeos", "Câncer", "Leão", "Virgem", "Libra", "Escorpião", "Sagitário", "Capricórnio", "Aquário", "Peixes"];

interface ZodiacScreenProps {
    onNext: () => void;
    onBack: () => void;
    progress: number;
}

export const ZodiacScreen: React.FC<ZodiacScreenProps> = ({ onNext, onBack, progress }) => {
    const [selected, setSelected] = useState<string | null>(null);
    const { updateUserData } = useUserData();
    
    const handleSelect = (option: string) => {
        setSelected(option);
        updateUserData({ zodiac: option });
        setTimeout(() => {
            onNext();
        }, 300);
    };
    
    return (
        <OnboardingLayout 
            title="Qual é o seu signo do zodíaco?" 
            showSkip onSkip={onNext} 
            showBack onBack={onBack}
            progress={progress}
        >
            <div role="radiogroup" aria-label="Opções de signo do zodíaco" className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full">
                {signs.map(sign => (
                    <button
                        key={sign}
                        onClick={() => handleSelect(sign)}
                        className={`p-4 rounded-xl text-center transition-all duration-200 flex items-center justify-center font-medium text-lg border-2 relative ${selected === sign ? 'bg-violet-500 border-violet-500 text-white shadow-lg' : 'bg-white border-gray-200 hover:border-gray-300 text-gray-800'}`}
                        role="radio"
                        aria-checked={selected === sign}
                    >
                        <span>{sign}</span>
                    </button>
                ))}
            </div>
        </OnboardingLayout>
    );
};