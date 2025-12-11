import React, { useState, useEffect } from 'react';
import { EmailIcon, LockIcon, UserCircleIcon, PhoneIcon, SparkleIcon, ArrowRightIcon, ChevronLeftIcon, GoogleIcon, CreditCardIcon, CheckIcon, CloseIcon, WarningIcon, CogIcon } from '../../Icons';
import { LoginFormData, SignupFormData } from '../../../types';
import { usePageTracking } from '../../../hooks/usePageTracking';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import { validateCPF, cleanCPF, formatCPF } from '../../../utils/validators';

interface LoginScreenProps {
    onLogin: (data: LoginFormData) => void;
    onSignup: (data: SignupFormData) => void;
    onGoogleLogin?: () => void;
    onBack?: () => void;
    onResetPassword?: (email: string) => void;
    initialTab?: 'login' | 'signup';
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onSignup, onGoogleLogin, onBack, onResetPassword, initialTab }) => {
    const [activeTab, setActiveTab] = useState<'login' | 'signup'>(initialTab || 'login');
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    
    // Update URL when activeTab changes, synchronized with back navigation
    useEffect(() => {
        // Prevent SecurityError in sandboxed environments (blob URLs)
        if (window.location.href.includes('blob:')) return;

        const path = activeTab === 'login' ? '/login' : '/cadastro';
        if (window.location.pathname !== path) {
            try {
                window.history.pushState({}, '', path);
            } catch (e) {
                // Silently ignore navigation errors in restricted environments
            }
        }
    }, [activeTab]);

    // Update activeTab if prop changes (e.g. parent handling deep links or back navigation)
    useEffect(() => {
        if (initialTab) {
            setActiveTab(initialTab);
        }
    }, [initialTab]);
    
    // Tracking active tab as a separate "page"
    usePageTracking(showForgotPassword ? '/forgot-password' : (activeTab === 'login' ? '/login' : '/signup'));

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        cpf: '',
        email: '',
        password: '',
    });
    
    const [resetEmail, setResetEmail] = useState('');
    const [isResetSent, setIsResetSent] = useState(false);

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

    const formatPhone = (value: string) => {
        const numbers = value.replace(/\D/g, '');
        const char = { 0: '(', 2: ') ', 7: '-' };
        let formatted = '';
        for (let i = 0; i < numbers.length; i++) {
            // @ts-ignore
            if (char[i] && i < 11) formatted += char[i];
            formatted += numbers[i];
        }
        return formatted.substring(0, 15);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let { name, value } = e.target;
        
        if (name === 'phone') {
            value = formatPhone(value);
        } else if (name === 'cpf') {
            value = formatCPF(value);
        }

        setFormData({ ...formData, [name]: value });
        if (errorMessage) setErrorMessage(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(null);
        setIsSubmitting(true);

        const trimmedEmail = formData.email.trim();
        // NOTA: Não usamos trim() na senha para permitir espaços intencionais e manter compatibilidade
        const password = formData.password;

        try {
            if (activeTab === 'login') {
                await onLogin({ email: trimmedEmail, password: password, remember: rememberMe });
                setIsSuccess(true);
            } else {
                const isPasswordValid = Object.values(passwordCriteria).every(Boolean);
                
                if (!isCpfValid) {
                    setErrorMessage("CPF inválido. Verifique os números.");
                    setIsSubmitting(false);
                    return;
                }

                if (isPasswordValid) {
                    // CPF Check
                    const cpfClean = cleanCPF(formData.cpf);
                    try {
                        const usersRef = collection(db, "users");
                        const q = query(usersRef, where("cpf", "==", cpfClean));
                        const querySnapshot = await getDocs(q);

                        if (!querySnapshot.empty) {
                            setErrorMessage("Este CPF já possui um cadastro.");
                            setIsSubmitting(false);
                            return;
                        }
                    } catch (firestoreError: any) {
                        console.error("Erro ao verificar CPF:", firestoreError);
                        if (firestoreError.code === 'permission-denied') {
                             setErrorMessage("Erro de conexão. Não foi possível verificar o cadastro.");
                        } else {
                             setErrorMessage("Erro ao validar dados. Tente novamente.");
                        }
                        setIsSubmitting(false);
                        return;
                    }

                    await onSignup({
                        name: formData.name.trim(),
                        email: trimmedEmail,
                        password: password, 
                        phone: formData.phone,
                        cpf: cpfClean,
                        remember: rememberMe
                    });
                    setIsSuccess(true);
                }
            }
        } catch (error) {
            setIsSubmitting(false);
        }
    };
    
    const handleGoogleLogin = () => {
       if (onGoogleLogin) {
           onGoogleLogin();
       }
    };

    const handleResetSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (onResetPassword && resetEmail) {
            onResetPassword(resetEmail.trim());
            setIsResetSent(true);
        }
    };

    const isLoginButtonDisabled = !formData.email || !formData.password || isSubmitting;
    const isSignupButtonDisabled = !formData.name || !formData.email || !formData.password || !isCpfValid || !formData.phone || !Object.values(passwordCriteria).every(Boolean) || isSubmitting;

    // Helper for input borders
    const getInputClass = (hasError: boolean = false, isValid: boolean = false) => {
        const base = "w-full py-4 pl-12 pr-4 bg-[#1a1a1a] border rounded-2xl text-white placeholder-gray-500 focus:outline-none transition-all duration-300";
        if (hasError) return `${base} border-red-500/50 focus:border-red-500`;
        if (isValid) return `${base} border-green-500/50 focus:border-green-500`;
        return `${base} border-white/10 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50`;
    };

    return (
         <div className="fixed inset-0 z-50 w-full h-full bg-[#020204] text-white overflow-y-auto scrollbar-hide font-sans">
            
            {/* Ambient Background - Fixed so they don't scroll */}
            <div className="fixed top-[-20%] left-[-10%] w-[80%] h-[60%] bg-violet-900/20 rounded-full blur-[120px] pointer-events-none animate-pulse-slow"></div>
            <div className="fixed bottom-[-10%] right-[-10%] w-[80%] h-[60%] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="fixed inset-0 bg-noise opacity-[0.03] pointer-events-none mix-blend-overlay"></div>
            
            {/* Back Button - Fixed position to stay visible during scroll */}
            {(onBack && !isSuccess) && (
                <button 
                    onClick={() => showForgotPassword ? setShowForgotPassword(false) : onBack()}
                    className="fixed top-6 left-6 z-[60] w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center transition-colors backdrop-blur-md"
                >
                    <ChevronLeftIcon className="text-xl text-gray-300" />
                </button>
            )}

            {/* Main Scrollable Content Wrapper */}
            <div className="min-h-full w-full flex flex-col items-center py-12 px-6 relative z-10">
                
                {/* Center Content Group with Auto Margins for safe centering */}
                <div className="w-full max-w-md flex flex-col items-center my-auto">
                    
                    {/* Logo & Branding */}
                    <div className={`flex flex-col items-center mb-8 flex-shrink-0 transition-all duration-700 ease-out ${isSuccess ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}>
                        <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(124,58,237,0.3)] mb-5 transform rotate-3 border border-white/10">
                            <SparkleIcon className="text-3xl text-white" />
                        </div>
                        <h1 className="text-3xl font-bold font-sora tracking-tight text-white drop-shadow-xl">
                            Inspira<span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">+</span>
                        </h1>
                        <p className="text-gray-500 text-sm mt-2 font-medium tracking-wide">Sua jornada diária começa aqui.</p>
                    </div>

                    {/* Main Card - Solid Background for better contrast */}
                    <div className="w-full bg-[#111] border border-white/10 p-6 md:p-8 rounded-[2rem] shadow-2xl relative transition-all duration-500 flex flex-col">
                        
                        {/* Success Overlay */}
                        {isSuccess && (
                            <div className="absolute inset-0 z-50 bg-[#111] flex flex-col items-center justify-center rounded-[2rem] animate-fade-in p-8 text-center">
                                <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center mb-6 animate-pop shadow-[0_0_30px_rgba(34,197,94,0.2)] border border-green-500/20">
                                    <CheckIcon className="text-5xl text-green-500" />
                                </div>
                                <h2 className="text-3xl font-bold text-white mb-3 font-sora">
                                    {activeTab === 'login' ? 'Entrando...' : 'Sucesso!'}
                                </h2>
                                <p className="text-gray-400 mb-8 font-sans leading-relaxed">
                                    {activeTab === 'login' ? 'Preparando sua inspiração diária.' : 'Sua conta foi criada com sucesso.'}
                                </p>
                                <div className="flex items-center gap-3 text-violet-400 text-sm font-bold animate-pulse bg-violet-500/10 px-4 py-2 rounded-full border border-violet-500/20">
                                    <SparkleIcon />
                                    <span>Acessando o app...</span>
                                </div>
                            </div>
                        )}

                        <div className={`transition-opacity duration-300 w-full ${isSuccess ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                            
                            {/* VIEW: FORGOT PASSWORD */}
                            {showForgotPassword ? (
                                <div className="animate-fade-in space-y-6">
                                    <div className="text-center">
                                        <h2 className="text-xl font-bold text-white font-sora mb-2">Recuperar Senha</h2>
                                        <p className="text-sm text-gray-400 leading-relaxed">
                                            {isResetSent 
                                                ? "Verifique seu e-mail (e spam) para redefinir a senha."
                                                : "Digite seu e-mail para receber o link de redefinição."
                                            }
                                        </p>
                                    </div>

                                    {isResetSent ? (
                                        <div className="space-y-4">
                                            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center gap-3 text-green-400">
                                                <CheckIcon className="text-xl" />
                                                <span className="text-sm font-bold">E-mail enviado!</span>
                                            </div>
                                            <button 
                                                onClick={() => setShowForgotPassword(false)}
                                                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-4 rounded-2xl transition-all"
                                            >
                                                Voltar para o Login
                                            </button>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleResetSubmit} className="space-y-4">
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <EmailIcon className="text-gray-500 group-focus-within:text-violet-400 transition-colors" />
                                                </div>
                                                <input 
                                                    type="email" 
                                                    value={resetEmail} 
                                                    onChange={(e) => setResetEmail(e.target.value)} 
                                                    placeholder="Seu e-mail" 
                                                    required 
                                                    className={getInputClass()} 
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={!resetEmail}
                                                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-violet-500/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                            >
                                                Enviar Link
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={() => setShowForgotPassword(false)}
                                                className="w-full py-3 text-sm text-gray-400 hover:text-white transition-colors"
                                            >
                                                Cancelar
                                            </button>
                                        </form>
                                    )}
                                </div>
                            ) : (
                                /* VIEW: LOGIN / SIGNUP */
                                <>
                                    {/* Custom Toggle Switch */}
                                    <div className="p-1.5 bg-black/40 rounded-full mb-8 border border-white/5 relative">
                                        <div 
                                            className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white/10 border border-white/10 rounded-full transition-all duration-300 ease-out shadow-sm ${activeTab === 'login' ? 'left-1.5' : 'left-[calc(50%+4.5px)]'}`}
                                        ></div>
                                        <div className="flex relative z-10">
                                            <button 
                                                onClick={() => setActiveTab('login')} 
                                                className={`flex-1 py-3 text-sm font-bold rounded-full transition-colors duration-300 ${activeTab === 'login' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                                            >
                                                Entrar
                                            </button>
                                            <button 
                                                onClick={() => setActiveTab('signup')} 
                                                className={`flex-1 py-3 text-sm font-bold rounded-full transition-colors duration-300 ${activeTab === 'signup' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                                            >
                                                Criar Conta
                                            </button>
                                        </div>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        
                                        {/* Signup Fields Accordion - Uses auto height */}
                                        <div className={`space-y-4 overflow-hidden transition-all duration-500 ease-in-out ${activeTab === 'signup' ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
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
                                                    className={getInputClass()} 
                                                />
                                            </div>
                                            
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <CreditCardIcon className={`transition-colors ${isCpfValid ? 'text-green-500' : 'text-gray-500 group-focus-within:text-violet-400'}`} />
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
                                                    className={getInputClass(false, isCpfValid && formData.cpf.length === 14)} 
                                                />
                                            </div>
                                            
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <PhoneIcon className="text-gray-500 group-focus-within:text-violet-400 transition-colors" />
                                                </div>
                                                <input 
                                                    type="tel" 
                                                    name="phone" 
                                                    value={formData.phone} 
                                                    onChange={handleChange} 
                                                    placeholder="Telefone" 
                                                    required={activeTab === 'signup'}
                                                    tabIndex={activeTab === 'signup' ? 0 : -1}
                                                    className={getInputClass()} 
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
                                                className={getInputClass()} 
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
                                                className={getInputClass()} 
                                            />
                                        </div>

                                        {/* Password Criteria (Signup Only) */}
                                        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${activeTab === 'signup' ? 'max-h-[150px] opacity-100 pt-2' : 'max-h-0 opacity-0'}`}>
                                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                                <p className="text-[10px] uppercase text-gray-500 font-bold tracking-wider mb-3">Requisitos da senha</p>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <PasswordRequirement label="8+ caracteres" met={passwordCriteria.hasLength} />
                                                    <PasswordRequirement label="Maiúscula" met={passwordCriteria.hasUpper} />
                                                    <PasswordRequirement label="Minúscula" met={passwordCriteria.hasLower} />
                                                    <PasswordRequirement label="Número" met={passwordCriteria.hasNumber} />
                                                    <PasswordRequirement label="Especial" met={passwordCriteria.hasSpecial} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Login Helpers */}
                                        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${activeTab === 'login' ? 'max-h-[40px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                            <div className="flex justify-between items-center px-1">
                                                <label className="flex items-center cursor-pointer group select-none">
                                                    <div className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${rememberMe ? 'bg-violet-600 border-violet-600' : 'bg-transparent border-gray-600 group-hover:border-gray-400'}`}>
                                                        {rememberMe && <CheckIcon className="text-white text-[10px]" />}
                                                    </div>
                                                    <input 
                                                        type="checkbox" 
                                                        className="hidden" 
                                                        checked={rememberMe} 
                                                        onChange={(e) => setRememberMe(e.target.checked)} 
                                                    />
                                                    <span className="ml-2 text-xs text-gray-400 group-hover:text-gray-300 transition-colors">Lembrar</span>
                                                </label>

                                                <button 
                                                    type="button" 
                                                    onClick={() => {
                                                        setShowForgotPassword(true);
                                                        setResetEmail(formData.email || '');
                                                        setIsResetSent(false);
                                                    }}
                                                    className="text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors"
                                                >
                                                    Esqueceu a senha?
                                                </button>
                                            </div>
                                        </div>

                                        {/* Submit Area */}
                                        <div className="pt-4">
                                            {errorMessage && (
                                                <div className="flex items-center gap-3 text-red-400 text-sm mb-4 bg-red-500/10 p-3 rounded-xl border border-red-500/20 animate-pop">
                                                    <WarningIcon className="text-lg flex-shrink-0" />
                                                    <span className="font-medium">{errorMessage}</span>
                                                </div>
                                            )}

                                            <button
                                                type="submit"
                                                disabled={activeTab === 'login' ? isLoginButtonDisabled : isSignupButtonDisabled}
                                                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold py-4 rounded-2xl shadow-[0_0_25px_rgba(124,58,237,0.4)] hover:shadow-[0_0_35px_rgba(124,58,237,0.5)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 group"
                                            >
                                                {isSubmitting ? (
                                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                                ) : (
                                                    <>
                                                        <span className="text-base tracking-wide">{activeTab === 'login' ? "Entrar" : "Cadastrar"}</span>
                                                        <ArrowRightIcon className="group-hover:translate-x-1 transition-transform" />
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                    
                                    {/* Social Login */}
                                    <div className="mt-8">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="h-px bg-white/10 flex-1"></div>
                                            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Ou continue com</span>
                                            <div className="h-px bg-white/10 flex-1"></div>
                                        </div>

                                        <button 
                                            type="button"
                                            onClick={handleGoogleLogin}
                                            className="w-full bg-[#1a1a1a] hover:bg-[#252525] border border-white/10 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-3 group active:scale-[0.98]"
                                        >
                                            <GoogleIcon className="w-5 h-5 grayscale group-hover:grayscale-0 transition-all opacity-80 group-hover:opacity-100" />
                                            <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">Entrar com o Google</span>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Footer Link */}
                    <div className={`text-center mt-8 pb-4 flex-shrink-0 transition-opacity duration-300 ${isSuccess ? 'opacity-0' : 'opacity-100'}`}>
                         <p className="text-[10px] text-gray-600">
                            Protegido por reCAPTCHA e sujeito à <br/> Política de Privacidade e Termos de Uso do Google.
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
};

const PasswordRequirement: React.FC<{ label: string; met: boolean }> = ({ label, met }) => (
    <div className={`flex items-center gap-2 transition-colors duration-300 ${met ? 'text-green-400' : 'text-gray-500'}`}>
        <div className={`w-1.5 h-1.5 rounded-full ${met ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]' : 'bg-gray-600'}`} />
        <span className="text-[10px] font-medium tracking-wide">{label}</span>
    </div>
);