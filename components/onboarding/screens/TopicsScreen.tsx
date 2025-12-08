import React, { useState } from 'react';
import { OnboardingLayout } from '../../ui/OnboardingLayout';
import { GradientButton } from '../../ui/ContinueButton';
import { useUserData } from '../../../context/UserDataContext';

const categories = [
    "Autoamor & Autoestima", "Maternidade Real", "Empreendedorismo Feminino", 
    "Liderança Feminina", "Sagrado Feminino", "Ciclos Naturais", 
    "Ansiedade & Saúde Mental", "Relacionamentos Saudáveis", "Carreira & Propósito", 
    "Independência Financeira", "Espiritualidade", "Gratidão Diária", 
    "Superação & Força", "Corpo Positivo", "Amizade & Sororidade", 
    "Criatividade", "Intuição", "Equilíbrio Vida-Trabalho", 
    "Resiliência", "Felicidade Plena"
];

interface TopicsScreenProps {
    onNext: () => void;
    onBack: () => void;
    progress: number;
}

export const TopicsScreen: React.FC<TopicsScreenProps> = ({ onNext, onBack, progress }) => {
    const [selected, setSelected] = useState<string[]>([]);
    const { updateUserData } = useUserData();

    const toggleTopic = (topic: string) => {
        setSelected(prev => 
            prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]
        );
    };

    const handleNext = () => {
        if (selected.length > 0) {
            updateUserData({ topics: selected });
            onNext();
        }
    };

    const handleSkip = () => {
        onNext();
    };
    
    return (
        <OnboardingLayout 
            title="O que toca seu coração hoje?" 
            subtitle="Selecione temas para guiarmos sua inspiração." 
            showSkip onSkip={handleSkip} 
            showBack onBack={onBack}
            progress={progress}
            footer={<GradientButton onClick={handleNext} disabled={selected.length < 3} text="Concluir Personalização" />}
        >
            <div role="group" aria-label="Tópicos de interesse" className="flex flex-wrap gap-3 justify-center">
                {categories.map(topic => (
                    <button 
                        key={topic}
                        onClick={() => toggleTopic(topic)}
                        className={`px-4 py-2 rounded-full transition-all duration-300 border-2 font-semibold text-base ${selected.includes(topic) ? 'bg-violet-500 border-violet-500 text-white' : 'bg-white border-gray-200 hover:border-violet-500 text-gray-800'}`}
                        role="checkbox"
                        aria-checked={selected.includes(topic)}
                    >
                        {topic}
                    </button>
                ))}
            </div>
        </OnboardingLayout>
    );
};