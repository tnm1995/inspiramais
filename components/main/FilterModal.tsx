
import React from 'react';
import { CloseIcon } from '../Icons';

interface FilterModalProps {
    activeFilter: string | null;
    onSelectFilter: (topic: string | null) => void;
    onClose: () => void;
    isClosing: boolean;
    isPremium: boolean;
    onTriggerPremium: () => void;
}

const unsortedCategories = [
    "Autoamor & Autoestima", "Maternidade Real", "Empreendedorismo Feminino", 
    "Liderança Feminina", "Sagrado Feminino", "Ciclos Naturais", 
    "Ansiedade & Saúde Mental", "Relacionamentos Saudáveis", "Carreira & Propósito", 
    "Independência Financeira", "Espiritualidade", "Gratidão Diária", 
    "Superação & Força", "Corpo Positivo", "Amizade & Sororidade", 
    "Criatividade", "Intuição", "Equilíbrio Vida-Trabalho", 
    "Resiliência", "Felicidade Plena"
];

const sortedCategories = ["Todos os Tópicos", ...unsortedCategories.sort((a, b) => a.localeCompare(b))];

export const FilterModal: React.FC<FilterModalProps> = ({ activeFilter, onSelectFilter, onClose, isClosing }) => {

    const handleSelect = (topic: string) => {
        if (topic === "Todos os Tópicos") {
            onSelectFilter(null);
        } else {
            onSelectFilter(topic);
        }
    };

    return (
        <div role="dialog" aria-modal="true" aria-label="Filtrar Citações por Tópico" className={`fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-end justify-center`}>
            <div className={`bg-white text-gray-800 w-full max-w-lg rounded-t-2xl shadow-2xl flex flex-col max-h-[80vh] ${isClosing ? 'animate-slide-out-down' : 'animate-slide-in-bottom'}`}>
                <header className="flex items-center justify-between p-4 flex-shrink-0 border-b border-gray-200">
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        Filtrar por Tema
                    </h1>
                    <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors" aria-label="Fechar filtro">
                        <CloseIcon className="text-2xl text-gray-600" />
                    </button>
                </header>
                
                <div role="radiogroup" aria-label="Seleção de tópico de filtro" className="flex-grow overflow-y-auto scrollbar-hide p-4">
                    <div className="space-y-3">
                        {sortedCategories.map(topic => {
                            const isActive = (topic === "Todos os Tópicos" && activeFilter === null) || topic === activeFilter;
                           
                            return (
                                <button
                                    key={topic}
                                    onClick={() => handleSelect(topic)}
                                    className={`w-full p-4 rounded-xl text-left font-semibold transition-all duration-200 text-lg border flex justify-between items-center ${
                                        isActive 
                                        ? 'bg-violet-500 border-violet-500 text-white shadow-lg shadow-violet-500/20' 
                                        : 'bg-gray-100 border-gray-200 hover:border-gray-300 text-gray-800'
                                    }`}
                                    role="radio"
                                    aria-checked={isActive}
                                >
                                    <span>{topic}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
