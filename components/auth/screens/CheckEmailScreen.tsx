

import React from 'react';
import { OnboardingLayout } from '../../ui/OnboardingLayout';
import { GradientButton } from '../../ui/ContinueButton';
import { EmailIcon } from '../../Icons';

interface CheckEmailScreenProps {
    email: string;
    onConfirm: () => void;
}

export const CheckEmailScreen: React.FC<CheckEmailScreenProps> = ({ email, onConfirm }) => {
    return (
        <OnboardingLayout
            title="Verifique seu e-mail"
            subtitle={`Enviamos um link de login mágico para ${email}. Clique no link para entrar.`}
            footer={<GradientButton onClick={onConfirm} text="Abrir E-mail e Entrar" />}
        >
            <div className="flex-grow flex items-center justify-center w-full">
                <div className="relative w-48 h-48 animate-float flex items-center justify-center">
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-violet-500 to-indigo-800 flex items-center justify-center shadow-2xl shadow-violet-500/30">
                        <EmailIcon className="text-white" style={{ fontSize: '6rem' }}/>
                    </div>
                </div>
            </div>
        </OnboardingLayout>
    );
};