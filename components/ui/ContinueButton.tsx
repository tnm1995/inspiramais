import React from 'react';

interface ContinueButtonProps {
    onClick?: () => void;
    disabled?: boolean;
    text?: string;
    type?: 'button' | 'submit' | 'reset';
}

export const ContinueButton: React.FC<ContinueButtonProps> = ({ onClick, disabled = false, text = "Continuar", type = "button" }) => {
    return (
        <div className="w-full">
             <button
                type={type}
                onClick={onClick}
                disabled={disabled}
                className="w-full bg-gray-800 text-white font-bold py-4 px-4 rounded-full transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-gray-900 active:bg-black transform active:scale-95 shadow-lg hover:shadow-xl"
            >
                {text}
            </button>
        </div>
    );
};

export const GradientButton: React.FC<ContinueButtonProps> = ({ onClick, disabled = false, text = "Continuar", type = "button" }) => {
    return (
        <div className="w-full">
             <button
                type={type}
                onClick={onClick}
                disabled={disabled}
                className="w-full bg-violet-500 text-white font-bold py-4 px-4 rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-violet-600 active:bg-violet-700 transform active:scale-95 shadow-lg shadow-violet-500/30 hover:shadow-violet-500/40"
            >
                {text}
            </button>
        </div>
    );
};