import React, { useState } from 'react';
import { OnboardingLayout } from '../../ui/OnboardingLayout';
import { GradientButton } from '../../ui/ContinueButton';
import { useUserData } from '../../../context/UserDataContext';

interface NameScreenProps {
    onNext: () => void;
    onBack: () => void;
    progress: number;
}

export const NameScreen: React.FC<NameScreenProps> = ({ onNext, onBack, progress }) => {
    const [name, setName] = useState('');
    const { updateUserData } = useUserData();

    const handleNext = () => {
        if (name.trim()) {
            updateUserData({ name: name.trim() });
            onNext();
        }
    };
    
    return (
        <OnboardingLayout 
            title="Como você quer ser chamado?" 
            showSkip onSkip={onNext} 
            showBack onBack={onBack}
            progress={progress}
            footer={<GradientButton onClick={handleNext} disabled={!name.trim()} text="Continuar" />}
        >
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Digite seu nome ou apelido"
                className="w-full p-3 bg-slate-800 rounded-xl text-white text-center text-lg outline-none transition-colors border-2 border-slate-700 focus:border-indigo-500"
                autoFocus
                aria-label="Campo para nome ou apelido"
                autoComplete="name"
            />
        </OnboardingLayout>
    );
};