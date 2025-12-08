import React, { useState } from 'react';
import { OnboardingLayout } from '../ui/OnboardingLayout';
import { GradientButton } from '../ui/ContinueButton';
import { useUserData } from '../../context/UserDataContext';
import { CheckCircleIcon } from '../Icons';

interface MoodCheckinScreenProps {
    onComplete: (feeling: string) => void;
}

const feelings = ["Excelente", "Bom", "Normal", "Mau", "Terrível"];

export const MoodCheckinScreen: React.FC<MoodCheckinScreenProps> = ({ onComplete }) => {
    const { userData } = useUserData();
    const [selectedFeeling, setSelectedFeeling] = useState<string | null>(null);

    const handleUpdate = () => {
        if (selectedFeeling) {
            onComplete(selectedFeeling);
        }
    };

    return (
         <div className="bg-gray-50 h-full w-full text-gray-800 flex flex-col items-center overflow-hidden">
            <div className="w-full h-full flex-grow flex flex-col animate-slide-in-up">
                <OnboardingLayout 
                    title="Humor do Dia"
                    subtitle={`Como você está se sentindo hoje, ${userData?.name || 'você'}?`}
                    footer={<GradientButton onClick={handleUpdate} disabled={!selectedFeeling} text="Atualizar Humor" />}
                >
                    <div role="radiogroup" aria-label="Seu humor hoje" className="space-y-3 w-full">
                        {feelings.map(feeling => (
                            <button
                                key={feeling}
                                onClick={() => setSelectedFeeling(feeling)}
                                className={`w-full p-4 rounded-xl text-left transition-all duration-200 flex items-center justify-between font-medium text-lg border-2 ${selectedFeeling === feeling ? 'bg-violet-500 border-violet-500 text-white shadow-lg' : 'bg-white border-gray-200 hover:border-gray-300 text-gray-800'}`}
                                role="radio"
                                aria-checked={selectedFeeling === feeling}
                            >
                                <span>{feeling}</span>
                                {selectedFeeling === feeling && <CheckCircleIcon className="text-2xl text-white" aria-hidden="true" />}
                            </button>
                        ))}
                    </div>
                </OnboardingLayout>
            </div>
        </div>
    );
};