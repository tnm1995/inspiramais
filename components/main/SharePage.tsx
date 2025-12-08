import React, { useEffect, useState } from 'react';

export const SharePage: React.FC = () => {
    const [quote, setQuote] = useState({ text: '', author: '' });

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const text = params.get('text') || 'Sua citação inspiradora aparecerá aqui.';
        const author = params.get('author') || null;
        setQuote({ text, author: author || '' });
    }, []);

    return (
        <div className="h-screen w-screen bg-black font-sans flex items-center justify-center p-8">
            <div 
                className="relative w-full max-w-md h-[85vh] max-h-[800px] flex flex-col justify-center items-start p-8 text-left text-white rounded-2xl shadow-2xl overflow-hidden aurora-background"
            >
                <div className="relative z-10">
                    <h1 className="text-2xl font-bold leading-tight drop-shadow-lg">{quote.text}</h1>
                    {quote.author && <p className="mt-4 text-lg italic opacity-80 drop-shadow-md">- {quote.author}</p>}
                </div>
                <div className="absolute bottom-6 left-8 z-10 text-lg font-bold text-white/80 drop-shadow-lg">
                    Inspira+
                </div>
            </div>
        </div>
    );
};