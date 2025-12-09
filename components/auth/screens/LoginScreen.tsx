import React, { useState, useEffect } from 'react';
import { EmailIcon, LockIcon, UserCircleIcon, PhoneIcon, SparkleIcon, ArrowRightIcon, ChevronLeftIcon, GoogleIcon, CreditCardIcon, CheckIcon, CloseIcon, WarningIcon, CogIcon } from '../../Icons';
import { LoginFormData, SignupFormData } from '../../../types';
import { usePageTracking } from '../../../hooks/usePageTracking';

interface LoginScreenProps {
    onLogin: (data: LoginFormData) => void;
    onSignup: (data: SignupFormData) => void;
    onGoogleLogin?: () => void;
    onBack?: () => void;
    onAdminAccess?: () => void; // New prop for admin access
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onSignup, onGoogleLogin, onBack, onAdminAccess }) => {
    const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
    
    // Tracking active tab as a separate "page"
    usePageTracking(activeTab === 'login' ? '/login' : '/signup');

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        cpf: '',
        email: '',
        password: '',
    });
    const [rememberMe, setRememberMe] = useState(true);
    const [isCpfValid, setIsCpfValid] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Success Animation State
    const [isSuccess, setIsSuccess] = useState(false);

    // Password Validation State
    const [passwordCriteria, setPasswordCriteria] = useState({
        hasUpper: false,
        hasLower: false,
        hasNumber: false,
        hasSpecial: false,
        hasLength: false
    });

    useEffect(() => {
        const pwd = formData.password;
        setPasswordCriteria({
            hasUpper: /[A-Z]/.test(pwd),
            hasLower: /[a-z]/.test(pwd),
            hasNumber: /[0-9]/.test(pwd),
            hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
            hasLength: pwd.length >= 8
        });
    }, [formData.password]);

    // CPF Validation Algorithm
    useEffect(() => {
        const isValid = validateCPF(formData.cpf);
        setIsCpfValid(isValid);
    }, [formData.cpf]);

    const validateCPF = (cpf: string): boolean => {
        const strCPF = cpf.replace(/[^\d]+/g, '');
        
        if (strCPF.length !== 11) return false;
        
        // Eliminate known invalid CPFs (111.111.111-11, etc.)
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

    const formatPhone = (value: string) => {
        // Remove all non-digits
        const numbers = value.replace(/\D/g, '');
        // Limit to 11 digits (DDD + 9 digits)
        const char = { 0: '(', 2: ') ', 7: '-' };
        let formatted = '';
        for (let i = 0; i < numbers.length; i++) {
            // @ts-ignore
            if (char[i] && i < 11) formatted += char[i];
            formatted += numbers[i];
        }
        return formatted.substring(0, 15);
    };

    const formatCPF = (value: string) => {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})/, '$1-$2')
            .replace(/(-\d{2})\d+?$/, '$1');
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let { name, value } = e.target;
        
        if (name === 'phone') {
            value = formatPhone(value);
        } else if (name === 'cpf') {
            value = formatCPF(value);
        }

        setFormData({ ...formData, [name]: value });
        if (errorMessage) setErrorMessage(null); // Clear error on change
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(null);
        setIsSubmitting(true);

        try {
            if (activeTab === 'login') {
                await onLogin({ email: formData.email, password: formData.password, remember: rememberMe });
                // Success is handled by prop callback usually via parent state change, but we can trigger anim here if we want
                setIsSuccess(true);
            } else {
                // Only allow signup if everything is valid
                const isPasswordValid = Object.values(passwordCriteria).every(Boolean);
                
                if (isPasswordValid && isCpfValid) {
                    await onSignup({
                        name: formData.name,
                        email: formData.email,
                        password: formData.password,
                        phone: formData.phone,
                        cpf: formData.cpf,
                        remember: rememberMe
                    });
                    setIsSuccess(true);
                }
            }
        } catch (error) {
            // Error handling is done via props/parent usually setting message
            // or simply reset state here
            setIsSubmitting(false);
        }
    };
    
    const handleGoogleLogin = () => {
       if (onGoogleLogin) {
           onGoogleLogin();
       }
    };

    const isLoginButtonDisabled = !formData.email || !formData.password || isSubmitting;
    const isSignupButtonDisabled = !formData.name || !formData.email || !formData.password || !isCpfValid || !formData.phone || !Object.values(passwordCriteria).every(Boolean) || isSubmitting;

    const getCpfBorderClass = () => {
        if (formData.cpf.length === 0) return 'border-white/10 focus:border-violet-500/50';
        if (formData.cpf.length < 14) return 'border-white/10 focus:border-violet-500/50'; 
        return isCpfValid ? 'border-green-500/50 focus:border-green-500' : 'border-red-500/50 focus:border-red-500';
    };

    return (
         <div className="fixed inset-0 z-50 bg-[#050505] text-white flex flex-col items-center justify-center p-4 overflow-hidden font-sans">
            
            {/* Background Effects */}
            <div className="absolute inset-0 aurora-background opacity-60 pointer-events-none"></div>
            <div className="absolute inset-0 bg-noise opacity-[0.05] pointer-events-none mix-blend-overlay"></div>
            
            {/* Back Button */}
            {onBack && !isSuccess && (
                <button 
                    onClick={onBack}
                    className="absolute top-6 left-6 z-20 w-10 h-10 rounded-full bg-black/20 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-black/40 transition-colors"
                >
                    <ChevronLeftIcon className="text-2xl" />
                </button>
            )}

            <div className="relative z-10 w-full max-w-md h-full flex flex-col justify-center">
                
                {/* Header Logo */}
                <div className={`flex flex-col items-center mb-6 flex-shrink-0 transition-all duration-500 ease-out ${isSuccess ? 'scale-0 opacity-0' : 'scale-100 opacity-100 animate-slide-in-up'}`}>
                    <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(124,58,237,0.4)] mb-4 transform rotate-3">
                        <SparkleIcon className="text-3xl text-white" />
                    </div>
                    <h1 className="text-3xl font-bold font-sora tracking-tight">Inspira<span className="text-violet-500">+</span></h1>
                </div>

                {/* Glass Card */}
                <div className="bg-[#111]/80 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-3xl shadow-2xl overflow-y-auto max-h-[75vh] scrollbar-hide relative transition-all duration-500 animate-slide-in-up" style={{ animationDelay: '100ms' }}>
                    
                    {/* Success Overlay */}
                    {isSuccess && (
                        <div className="absolute inset-0 z-50 bg-[#111] flex flex-col items-center justify-center rounded-3xl animate-fade-in p-8 text-center">
                            <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mb-6 animate-pop shadow-[0_0_30px_rgba(34,197,94,0.3)] border border-green-500/30">
                                <CheckIcon className="text-5xl text-green-500" />
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-2 font-sora">
                                {activeTab === 'login' ? 'Entrando...' : 'Sucesso!'}
                            </h2>
                            <p className="text-gray-400 mb-6 font-sans">
                                {activeTab === 'login' ? 'Preparando sua inspiração diária.' : 'Sua conta foi criada.'}
                            </p>
                            <div className="flex items-center gap-2 text-violet-400 text-sm font-bold animate-pulse">
                                <SparkleIcon />
                                <span>Entrando no app...</span>
                            </div>
                        </div>
                    )}

                    <div className={`transition-opacity duration-300 ${isSuccess ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                        
                        {/* Toggle Switch */}
                        <div className="flex p-1 bg-black/40 rounded-xl mb-6 relative border border-white/5 flex-shrink-0">
                            <div 
                                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-violet-600 rounded-lg transition-all duration-300 ease-spring shadow-lg ${activeTab === 'login' ? 'left-1' : 'left-[calc(50%+4px)]'}`}
                            ></div>
                            <button 
                                onClick={() => setActiveTab('login')} 
                                className={`flex-1 py-3 text-sm font-bold relative z-10 transition-colors duration-300 ${activeTab === 'login' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                            >
                                Entrar
                            </button>
                            <button 
                                onClick={() => setActiveTab('signup')} 
                                className={`flex-1 py-3 text-sm font-bold relative z-10 transition-colors duration-300 ${activeTab === 'signup' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                            >
                                Criar Conta
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            
                            {/* Signup Specific Fields - Smooth Collapsible Transition with improved timing */}
                            <div className={`space-y-4 overflow-hidden transition-all duration-500 ease-in-out ${activeTab === 'signup' ? 'max-h-[350px] opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-4'}`}>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <UserCircleIcon className="text-gray-500 group-focus-within:text-violet-400 transition-colors" />
                                    </div>
                                    <input 
                                        type="text" 
                                        name="name" 
                                        value={formData.name} 
                                        onChange={handleChange} 
                                        placeholder="Nome completo" 
                                        required={activeTab === 'signup'}
                                        tabIndex={activeTab === 'signup' ? 0 : -1}
                                        className="w-full py-3.5 pl-12 pr-4 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 focus:bg-black/50 transition-all text-sm md:text-base" 
                                    />
                                </div>
                                
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <CreditCardIcon className={`group-focus-within:text-violet-400 transition-colors ${isCpfValid ? 'text-green-500' : 'text-gray-500'}`} />
                                    </div>
                                    <input 
                                        type="text" 
                                        name="cpf" 
                                        value={formData.cpf} 
                                        onChange={handleChange} 
                                        placeholder="CPF" 
                                        required={activeTab === 'signup'}
                                        tabIndex={activeTab === 'signup' ? 0 : -1}
                                        maxLength={14}
                                        className={`w-full py-3.5 pl-12 pr-4 bg-black/30 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:bg-black/50 transition-all text-sm md:text-base ${getCpfBorderClass()}`} 
                                    />
                                     {formData.cpf.length === 14 && !isCpfValid && activeTab === 'signup' && (
                                        <div className="absolute right-3 top-3.5 text-red-500 animate-pulse">
                                            <CloseIcon />
                                        </div>
                                    )}
                                </div>
                                
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <PhoneIcon className="text-gray-500 group-focus-within:text-violet-400 transition-colors" />
                                    </div>
                                    <div className="absolute inset-y-0 left-12 flex items-center pointer-events-none">
                                        <span className="text-gray-400 text-sm md:text-base font-medium pr-1 border-r border-white/10 h-5 flex items-center">+55</span>
                                    </div>
                                    <input 
                                        type="tel" 
                                        name="phone" 
                                        value={formData.phone} 
                                        onChange={handleChange} 
                                        placeholder="(00) 00000-0000" 
                                        required={activeTab === 'signup'}
                                        tabIndex={activeTab === 'signup' ? 0 : -1}
                                        className="w-full py-3.5 pl-[85px] pr-4 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 focus:bg-black/50 transition-all text-sm md:text-base" 
                                    />
                                </div>
                            </div>

                            {/* Common Fields */}
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <EmailIcon className="text-gray-500 group-focus-within:text-violet-400 transition-colors" />
                                </div>
                                <input 
                                    type="email" 
                                    name="email" 
                                    value={formData.email} 
                                    onChange={handleChange} 
                                    placeholder="E-mail" 
                                    required 
                                    className="w-full py-3.5 pl-12 pr-4 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 focus:bg-black/50 transition-all text-sm md:text-base" 
                                />
                            </div>

                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <LockIcon className="text-gray-500 group-focus-within:text-violet-400 transition-colors" />
                                </div>
                                <input 
                                    type="password" 
                                    name="password" 
                                    value={formData.password} 
                                    onChange={handleChange} 
                                    placeholder="Senha" 
                                    required 
                                    className="w-full py-3.5 pl-12 pr-4 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 focus:bg-black/50 transition-all text-sm md:text-base" 
                                />
                            </div>

                            {/* Password Strength Indicators (Signup Only - Collapsible) */}
                            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${activeTab === 'signup' ? 'max-h-[150px] opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-2'}`}>
                                <div className="p-3 bg-black/20 rounded-lg border border-white/5 mt-2">
                                    <p className="text-[10px] uppercase text-gray-500 font-bold tracking-wider mb-2">A senha deve conter:</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        <PasswordRequirement label="Mínimo 8 caracteres" met={passwordCriteria.hasLength} />
                                        <PasswordRequirement label="Letra Maiúscula" met={passwordCriteria.hasUpper} />
                                        <PasswordRequirement label="Letra Minúscula" met={passwordCriteria.hasLower} />
                                        <PasswordRequirement label="Número" met={passwordCriteria.hasNumber} />
                                        <PasswordRequirement label="Caractere Especial" met={passwordCriteria.hasSpecial} />
                                    </div>
                                </div>
                            </div>

                            {/* Remember Me / Forgot Password (Login Only - Collapsible) */}
                            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${activeTab === 'login' ? 'max-h-[40px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                <div className="flex justify-between items-center pt-1">
                                    <label className="flex items-center cursor-pointer group select-none">
                                        <div className={`w-4 h-4 rounded border transition-colors flex items-center justify-center ${rememberMe ? 'bg-violet-600 border-violet-600' : 'bg-transparent border-gray-600 group-hover:border-gray-400'}`}>
                                            {rememberMe && <CheckIcon className="text-white text-xs" />}
                                        </div>
                                        <input 
                                            type="checkbox" 
                                            className="hidden" 
                                            checked={rememberMe} 
                                            onChange={(e) => setRememberMe(e.target.checked)} 
                                        />
                                        <span className={`ml-2 text-xs transition-colors ${rememberMe ? 'text-gray-200' : 'text-gray-500 group-hover:text-gray-400'}`}>Lembrar de mim</span>
                                    </label>

                                    <button type="button" className="text-xs text-gray-400 hover:text-violet-400 transition-colors">
                                        Esqueceu a senha?
                                    </button>
                                </div>
                            </div>

                            <div className="pt-2">
                                {errorMessage && (
                                    <div className="flex items-center gap-2 text-red-400 text-sm mb-3 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                                        <WarningIcon className="text-lg flex-shrink-0" />
                                        <span>{errorMessage}</span>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={activeTab === 'login' ? isLoginButtonDisabled : isSignupButtonDisabled}
                                    className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <span>Processando...</span>
                                    ) : (
                                        <>
                                            <span>{activeTab === 'login' ? "Acessar App" : "Começar Agora"}</span>
                                            <ArrowRightIcon />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                        
                        {/* Google Login Section */}
                        <div>
                            <div className="flex items-center gap-4 my-6">
                                <div className="h-px bg-white/10 flex-1"></div>
                                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Ou continue com</span>
                                <div className="h-px bg-white/10 flex-1"></div>
                            </div>

                            <button 
                                type="button"
                                onClick={handleGoogleLogin}
                                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-3 group active:scale-95"
                            >
                                <GoogleIcon className="w-5 h-5" />
                                <span className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">Google</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer Link + Admin Access */}
                <div className={`text-center mt-6 mb-4 flex-shrink-0 transition-opacity duration-300 ${isSuccess ? 'opacity-0' : 'opacity-100'}`}>
                     <p className="text-xs text-gray-600">
                        Ao continuar, você concorda com nossos <br/> Termos de Uso e Política de Privacidade.
                    </p>
                    
                    {/* Admin Trigger */}
                    {onAdminAccess && (
                        <button 
                            onClick={onAdminAccess}
                            className="mt-6 text-[10px] text-gray-700 hover:text-gray-500 flex items-center justify-center gap-1 mx-auto opacity-50 hover:opacity-100 transition-all"
                        >
                            <CogIcon className="text-sm" /> Admin
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
};

const PasswordRequirement: React.FC<{ label: string; met: boolean }> = ({ label, met }) => (
    <div className={`flex items-center gap-1.5 transition-colors duration-300 ${met ? 'text-green-400' : 'text-gray-500'}`}>
        {met ? <CheckIcon className="text-xs" /> : <div className="w-3 h-3 rounded-full border border-gray-600" />}
        <span className="text-[10px] font-medium">{label}</span>
    </div>
);