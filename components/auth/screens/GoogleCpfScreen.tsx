
import React, { useState, useEffect } from 'react';
import { CreditCardIcon, SparkleIcon, ArrowRightIcon, WarningIcon, LogoutIcon } from '../../Icons';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';

interface GoogleCpfScreenProps {
    onConfirm: (cpf: string) => void;
    onCancel: () => void;
}

export const GoogleCpfScreen: React.FC<GoogleCpfScreenProps> = ({ onConfirm, onCancel }) => {
    const [cpf, setCpf] = useState('');
    const [isValid, setIsValid] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const formatCPF = (value: string) => {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})/, '$1-$2')
            .replace(/(-\d{2})\d+?$/, '$1');
    };

    const validateCPF = (cpf: string): boolean => {
        const strCPF = cpf.replace(/[^\d]+/g, '');
        if (strCPF.length !== 11) return false;
        if (/^(\d)\1+$/.test(strCPF)) return false;

        let sum = 0;
        let remainder;

        for (let i = 1; i <= 9; i++) sum = sum + parseInt(strCPF.substring(i - 1, i)) * (11 - i);
        remainder = (sum * 10) % 11;

        if ((remainder === 10) || (remainder === 11)) remainder = 0;
        if (remainder !== parseInt(strCPF.substring(9, 10))) return false;

        sum = 0;
        for (let i = 1; i <= 10; i++) sum = sum + parseInt(strCPF.substring(i - 1, i)) * (12 - i);
        remainder = (sum * 10) % 11;

        if ((remainder === 10) || (remainder === 11)) remainder = 0;
        if (remainder !== parseInt(strCPF.substring(10, 11))) return false;

        return true;
    };

    useEffect(() => {
        setIsValid(validateCPF(cpf));
        setError(null);
    }, [cpf]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCpf(formatCPF(e.target.value));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isValid) return;
        setIsSubmitting(true);
        setError(null);

        try {
            // Check for duplicate CPF in Firestore
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("cpf", "==", cpf));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                setError("Este CPF já está sendo usado por outra conta.");
                setIsSubmitting(false);
                return;
            }

            // Success
            onConfirm(cpf);
        } catch (err) {
            console.error("Error checking CPF:", err);
            setError("Erro ao validar CPF. Tente novamente.");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] bg-[#050505] text-white flex flex-col items-center justify-center p-6 font-sans">
            {/* Background Effects */}
            <div className="absolute inset-0 aurora-background opacity-60 pointer-events-none"></div>
            <div className="absolute inset-0 bg-noise opacity-[0.05] pointer-events-none mix-blend-overlay"></div>

            <div className="relative z-10 w-full max-w-md bg-[#111]/90 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl animate-slide-in-up">
                
                <div className="flex flex-col items-center mb-6 text-center">
                    <div className="w-14 h-14 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(124,58,237,0.4)] mb-4 rotate-3">
                        <SparkleIcon className="text-3xl text-white" />
                    </div>
                    <h2 className="text-2xl font-bold font-sora">Quase lá!</h2>
                    <p className="text-gray-400 text-sm mt-2">
                        Para finalizar seu cadastro seguro, precisamos confirmar seu CPF.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs text-gray-500 uppercase font-bold tracking-wider ml-1">CPF</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <CreditCardIcon className={`transition-colors ${isValid ? 'text-green-500' : 'text-gray-500 group-focus-within:text-violet-400'}`} />
                            </div>
                            <input 
                                type="text" 
                                value={cpf} 
                                onChange={handleChange} 
                                placeholder="000.000.000-00" 
                                maxLength={14}
                                className={`w-full py-4 pl-12 pr-4 bg-black/40 border rounded-xl text-white placeholder-gray-600 focus:outline-none focus:bg-black/60 transition-all text-lg tracking-wide ${isValid ? 'border-green-500/50 focus:border-green-500' : 'border-white/10 focus:border-violet-500'}`}
                                autoFocus
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20 animate-pop">
                            <WarningIcon className="flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="pt-2 space-y-3">
                        <button
                            type="submit"
                            disabled={!isValid || isSubmitting}
                            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? 'Verificando...' : 'Confirmar e Entrar'}
                            {!isSubmitting && <ArrowRightIcon />}
                        </button>

                        <button 
                            type="button"
                            onClick={onCancel}
                            className="w-full py-3 text-sm text-gray-500 hover:text-white transition-colors flex items-center justify-center gap-2"
                        >
                            <LogoutIcon className="text-xs" /> Cancelar Login
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
