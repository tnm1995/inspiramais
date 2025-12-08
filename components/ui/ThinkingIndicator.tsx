import React from 'react';

interface ThinkingIndicatorProps {
    text?: string;
    className?: string;
}

export const ThinkingIndicator: React.FC<ThinkingIndicatorProps> = ({ text = 'Pensando', className = '' }) => {
    return (
        <div className={`flex flex-col justify-center items-center text-center text-gray-600 ${className}`} role="status" aria-live="polite">
            <div className="relative">
                <h2 className="text-2xl font-semibold mb-4">{text}...</h2>
                <div className="flex space-x-2 justify-center" aria-hidden="true">
                    <span className="thinking-dot" style={{ animationDelay: '0s' }}></span>
                    <span className="thinking-dot" style={{ animationDelay: '0.2s' }}></span>
                    <span className="thinking-dot" style={{ animationDelay: '0.4s' }}></span>
                </div>
            </div>
        </div>
    );
};