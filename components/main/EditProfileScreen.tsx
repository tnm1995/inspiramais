
import React, { useState, ReactNode } from 'react';
import { useUserData } from '../../context/UserDataContext';
import { ChevronLeftIcon } from '../Icons';
import { GradientButton } from '../ui/ContinueButton';
import { UserData } from '../../types';

type ToastMessage = {
    message: string;
    type: 'success' | 'error';
}

interface EditProfileScreenProps {
    onBack: () => void;
    setToastMessage: (toast: ToastMessage | null) => void;
}

// Reusable Section Component
const Section: React.FC<{ title: string; children: ReactNode }> = ({ title, children }) => (
    <section className="space-y-3" aria-label={title}>
        <h3 className="text-sm font-semibold text-slate-400 px-2 uppercase tracking-wider">{title}</h3>
        {children}
    </section>
);

// Reusable Input Components
const TextInput: React.FC<{ label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string }> = ({ label, name, value, onChange, placeholder }) => (
    <div className="w-full">
        <label htmlFor={`edit-profile-${name}`} className="text-slate-300 mb-1 block px-2">{label}</label>
        <input
            id={`edit-profile-${name}`}
            type="text"
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full p-3 bg-slate-800 rounded-xl text-white text-base outline-none transition-colors border-2 border-slate-700 focus:border-indigo-500"
            aria-label={label}
        />
    </div>
);

const TextAreaInput: React.FC<{ label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; placeholder?: string; maxLength?: number }> = ({ label, name, value, onChange, placeholder, maxLength }) => (
     <div className="w-full">
        <label htmlFor={`edit-profile-${name}`} className="text-slate-300 mb-1 block px-2">{label}</label>
        <textarea
            id={`edit-profile-${name}`}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            maxLength={maxLength}
            className="w-full h-28 p-3 bg-slate-800 rounded-xl text-white text-base outline-none transition-colors resize-none border-2 border-slate-700 focus:border-indigo-500"
            aria-label={label}
        />
        {maxLength && <p className="text-right text-sm text-slate-400 mt-1" aria-live="polite">{value.length}/{maxLength}</p>}
    </div>
);

const SelectInput: React.FC<{ label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; options: string[] }> = ({ label, name, value, onChange, options }) => (
    <div className="w-full">
        <label htmlFor={`edit-profile-${name}`} className="text-slate-300 mb-1 block px-2">{label}</label>
        <div className="relative">
            <select
                id={`edit-profile-${name}`}
                name={name}
                value={value}
                onChange={onChange}
                className="w-full p-3 bg-slate-800 rounded-xl text-white text-base outline-none transition-colors border-2 border-slate-700 focus:border-indigo-500 appearance-none"
                aria-label={label}
            >
                 <option value="" disabled>Selecione...</option>
                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
             <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400" aria-hidden="true">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
        </div>
    </div>
);

const MultiSelectButtons: React.FC<{ options: string[]; selected: string[]; onToggle: (option: string) => void; className?: string; label: string }> = ({ options, selected, onToggle, className = '', label }) => (
    <div role="group" aria-label={label} className={`flex flex-wrap gap-2 ${className}`}>
        {options.map(option => (
            <button
                key={option}
                onClick={() => onToggle(option)}
                className={`px-4 py-2 rounded-full transition-all duration-300 border-2 font-medium text-sm ${selected.includes(option) ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 hover:border-indigo-500 text-slate-200'}`}
                role="checkbox"
                aria-checked={selected.includes(option)}
            >
                {option}
            </button>
        ))}
    </div>
);


const ageOptions = ["13 a 17", "18 a 24", "25 a 34", "35 a 44", "45 a 54", "55+"];
const genderOptions = ["Feminino", "Outros", "Prefiro não dizer"];
const relationshipOptions = ["Em um relacionamento feliz", "Em um relacionamento desafiador", "Solteira feliz", "Solteira à procura", "Não interessada nesse tópico"];
const religiousOptions = ["Sim", "Não", "Espiritual, mas não religiosa", "Pular"];
const beliefOptions = ["Cristianismo", "Judaísmo", "Islamismo", "Hinduísmo", "Budismo", "Outro"];
const zodiacOptions = ["Áries", "Touro", "Gêmeos", "Câncer", "Leão", "Virgem", "Libra", "Escorpião", "Sagitário", "Capricórnio", "Aquário", "Peixes"];
const improvementOptions = ["Fé e espiritualidade", "Pensamento positivo", "Estresse e ansiedade", "Alcançando objetivos", "Autoestima", "Relacionamentos"];
const appGoalsOptions = [
    "Melhorar minha autoconfiança", 
    "Atingir os meus objetivos", 
    "Estabilidade financeira",
    "Renovar minha energia e foco", 
    "Encontrar a felicidade", 
    "Desenvolver uma mentalidade positiva", 
    "Estar mais presente e aproveitar a vida"
];
const topicOptions = [
    "Carreira", "Finanças", "Sucesso", "Filosofia", "Estoicismo", "Mindfulness", 
    "Amor", "Relacionamentos", "Família", "Amizade", "Superação", "Resiliência", 
    "Saúde Mental", "Ansiedade", "Depressão", "Autoestima", "Confiança", 
    "Motivação Fitness", "Luto", "Perdão", "Gratidão", "Felicidade", 
    "Espiritualidade", "Arte", "Criatividade", "Liderança", "Citações de Filmes"
].sort((a,b) => a.localeCompare(b));


export const EditProfileScreen: React.FC<EditProfileScreenProps> = ({ onBack, setToastMessage }) => {
    const { userData, updateUserData } = useUserData();

    // Local state for the form
    const [formData, setFormData] = useState<Partial<UserData>>({
        name: userData?.name || '',
        age: userData?.age || '',
        gender: userData?.gender || '',
        relationshipStatus: userData?.relationshipStatus || '',
        isReligious: userData?.isReligious || '',
        beliefs: userData?.beliefs || '',
        zodiac: userData?.zodiac || '',
        improvementAreas: userData?.improvementAreas || [],
        appGoals: userData?.appGoals || [],
        goals: userData?.goals || '',
        topics: userData?.topics || [],
    });
    
    // Generic handler for text inputs
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Generic handler for multi-select arrays
    const handleMultiSelectToggle = (field: keyof UserData, value: string) => {
        setFormData(prev => {
            const currentValues = (prev[field] as string[]) || [];
            const newValues = currentValues.includes(value)
                ? currentValues.filter(item => item !== value)
                : [...currentValues, value];
            return { ...prev, [field]: newValues };
        });
    };

    const handleSave = () => {
        updateUserData(formData);
        setToastMessage({ message: 'Perfil salvo com sucesso!', type: 'success' });
        setTimeout(() => setToastMessage(null), 3000);
        onBack();
    };

    return (
        <div role="dialog" aria-modal="true" aria-label="Editar Perfil do Usuário" className="fixed inset-0 z-40 bg-[#11032a] text-white flex flex-col animate-slide-in-up">
            <header className="flex items-center p-8 flex-shrink-0 bg-gradient-to-b from-slate-900/50 to-transparent">
                <button onClick={onBack} className="w-11 h-11 -ml-2 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors" aria-label="Voltar para o perfil">
                    <ChevronLeftIcon className="text-3xl" />
                </button>
                <h1 className="text-2xl font-bold text-center flex-grow">Editar Perfil</h1>
                <div className="w-7" aria-hidden="true"></div> {/* Spacer */}
            </header>
            
            <div className="flex-grow overflow-y-auto space-y-8 px-8 pb-28 scrollbar-hide">
                <Section title="Informações Pessoais">
                    <div className="space-y-4 bg-slate-800/50 p-4 rounded-lg">
                        <TextInput label="Nome" name="name" value={formData.name || ''} onChange={handleInputChange} placeholder="Seu nome ou apelido" />
                        <SelectInput label="Idade" name="age" value={formData.age || ''} onChange={handleInputChange} options={ageOptions} />
                        <SelectInput label="Gênero" name="gender" value={formData.gender || ''} onChange={handleInputChange} options={genderOptions} />
                        <SelectInput label="Status de Relacionamento" name="relationshipStatus" value={formData.relationshipStatus || ''} onChange={handleInputChange} options={relationshipOptions} />
                        <SelectInput label="Crença Religiosa" name="isReligious" value={formData.isReligious || ''} onChange={handleInputChange} options={religiousOptions} />
                        {(formData.isReligious === 'Sim' || formData.isReligious === 'Espiritual, mas não religiosa') && (
                             <SelectInput label="Qual crença?" name="beliefs" value={formData.beliefs || ''} onChange={handleInputChange} options={beliefOptions} />
                        )}
                        <SelectInput label="Signo do Zodíaco" name="zodiac" value={formData.zodiac || ''} onChange={handleInputChange} options={zodiacOptions} />
                    </div>
                </Section>

                <Section title="Seus Objetivos">
                     <div className="space-y-4 bg-slate-800/50 p-4 rounded-lg">
                        <div>
                            <p className="text-slate-300 mb-2 px-2">Áreas para melhorar</p>
                            <MultiSelectButtons
                                label="Selecione as áreas para melhorar"
                                options={improvementOptions}
                                selected={formData.improvementAreas || []}
                                onToggle={(opt) => handleMultiSelectToggle('improvementAreas', opt)}
                            />
                        </div>
                        <div>
                            <p className="text-slate-300 mb-2 pt-4 px-2">O que você quer alcançar com o app?</p>
                             <MultiSelectButtons
                                label="Selecione seus objetivos com o aplicativo"
                                options={appGoalsOptions}
                                selected={formData.appGoals || []}
                                onToggle={(opt) => handleMultiSelectToggle('appGoals', opt)}
                            />
                        </div>
                        <TextAreaInput label="Descreva seus objetivos" name="goals" value={formData.goals || ''} onChange={handleInputChange} maxLength={250} placeholder="Compartilhe mais sobre seus objetivos..." />
                     </div>
                </Section>
                 
                <Section title="Tópicos de Interesse">
                    <div className="bg-slate-800/50 p-4 rounded-lg">
                        <MultiSelectButtons
                            className="justify-center"
                            label="Selecione tópicos de interesse"
                            options={topicOptions}
                            selected={formData.topics || []}
                            onToggle={(opt) => handleMultiSelectToggle('topics', opt)}
                        />
                    </div>
                </Section>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[#11032a] via-[#11032a]/90 to-transparent">
                 <GradientButton onClick={handleSave} text="Salvar Alterações" />
            </div>
        </div>
    );
};
