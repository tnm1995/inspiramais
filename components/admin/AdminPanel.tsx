
import React, { useState, useEffect } from 'react';
import { CloseIcon, UserCircleIcon, CrownIcon, CogIcon, LogoutIcon, CreditCardIcon, PhoneIcon } from '../Icons';
import { UserData, AppConfig } from '../../types';
import { db, auth, firebaseConfig } from '../../firebaseConfig';
import { collection, getDocs, doc, updateDoc, deleteDoc, setDoc, getDoc } from 'firebase/firestore';
import { usePageTracking } from '../../hooks/usePageTracking';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

interface AdminPanelProps {
    onClose: () => void;
    setToastMessage: (msg: { message: string, type: 'success' | 'error' }) => void;
}

interface AdminUser {
    id: string; // Firebase UID
    email?: string; 
    data: UserData;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onClose, setToastMessage }) => {
    usePageTracking('/admin');
    const [activeTab, setActiveTab] = useState<'users' | 'settings'>('users');
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    // Config State
    const [appConfig, setAppConfig] = useState<AppConfig>({
        monthlyPrice: '14,90',
        annualPrice: '9,90',
        annualTotal: '118,80',
        checkoutLinkMonthly: '',
        checkoutLinkAnnual: '',
        whatsappLink: ''
    });
    const [isSavingConfig, setIsSavingConfig] = useState(false);

    // Create User Form State
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserPassword, setNewUserPassword] = useState('');
    const [newUserName, setNewUserName] = useState('');
    const [newUserPremium, setNewUserPremium] = useState(false);
    const [isCreatingUser, setIsCreatingUser] = useState(false);

    useEffect(() => {
        if (activeTab === 'users') {
            loadUsers();
        } else {
            loadConfig();
        }
    }, [activeTab]);

    const loadConfig = async () => {
        try {
            const docRef = doc(db, "settings", "appConfig");
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setAppConfig(docSnap.data() as AppConfig);
            }
        } catch (error: any) {
            console.error("Error loading config:", error);
            setToastMessage({ message: "Falha ao carregar configurações.", type: 'error' });
        }
    };

    const saveConfig = async () => {
        setIsSavingConfig(true);
        try {
            await setDoc(doc(db, "settings", "appConfig"), appConfig);
            setToastMessage({ message: "Configurações salvas!", type: 'success' });
        } catch (error) {
            console.error("Error saving config:", error);
            setToastMessage({ message: "Erro ao salvar configurações.", type: 'error' });
        } finally {
            setIsSavingConfig(false);
        }
    };

    const loadUsers = async () => {
        setIsLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, "users"));
            const loadedUsers: AdminUser[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data() as UserData;
                loadedUsers.push({ id: doc.id, email: (data as any).email || 'No Email', data });
            });
            setUsers(loadedUsers);
        } catch (error) {
            console.error("Error loading users:", error);
            setToastMessage({ message: "Erro ao carregar usuários.", type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleRenew = async (userId: string, type: 'month' | 'year') => {
        const user = users.find(u => u.id === userId);
        if (!user) return;

        const now = new Date();
        const currentExpiry = user.data.subscriptionExpiry ? new Date(user.data.subscriptionExpiry) : new Date();
        const startDate = currentExpiry > now ? currentExpiry : now;
        
        const newExpiry = new Date(startDate);
        if (type === 'month') {
            newExpiry.setMonth(newExpiry.getMonth() + 1);
        } else {
            newExpiry.setFullYear(newExpiry.getFullYear() + 1);
        }

        try {
            await updateDoc(doc(db, "users", userId), {
                isPremium: true,
                subscriptionExpiry: newExpiry.toISOString()
            });
            setToastMessage({ message: `Assinatura renovada!`, type: 'success' });
            loadUsers();
        } catch (e) {
            setToastMessage({ message: "Erro ao atualizar.", type: 'error' });
        }
    };

    const handleToggleAdmin = async (userId: string, currentStatus?: boolean) => {
        try {
            await updateDoc(doc(db, "users", userId), {
                isAdmin: !currentStatus
            });
            setToastMessage({ message: `Status de Admin atualizado.`, type: 'success' });
            loadUsers();
        } catch (e) {
            setToastMessage({ message: "Erro ao alterar permissão.", type: 'error' });
        }
    };

    const handleCancel = async (userId: string) => {
        try {
            await updateDoc(doc(db, "users", userId), {
                isPremium: false,
                subscriptionExpiry: ''
            });
            setToastMessage({ message: `Assinatura cancelada.`, type: 'success' });
            loadUsers();
        } catch (e) {
            setToastMessage({ message: "Erro ao cancelar.", type: 'error' });
        }
    };

    const handleDelete = async (userId: string) => {
        if (window.confirm(`Tem certeza? Isso apaga os dados do banco, mas a conta de autenticação permanece (limitação do SDK cliente).`)) {
            try {
                await deleteDoc(doc(db, "users", userId));
                setToastMessage({ message: `Dados do usuário excluídos.`, type: 'success' });
                loadUsers();
            } catch (e) {
                setToastMessage({ message: "Erro ao excluir.", type: 'error' });
            }
        }
    };

    const handleLogout = async () => {
        try {
            await auth.signOut();
            onClose(); 
        } catch (error) {
            console.error("Logout error", error);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!newUserEmail || !newUserName || !newUserPassword) return;
        
        const email = newUserEmail.trim();
        const password = newUserPassword.trim();
        const name = newUserName.trim();

        if (password.length < 6) {
            setToastMessage({ message: "A senha deve ter pelo menos 6 caracteres (sem contar espaços).", type: 'error' });
            return;
        }

        setIsCreatingUser(true);

        // Create a secondary Firebase App instance to avoid logging out the current admin
        let secondaryApp: firebase.app.App | null = null;

        try {
            // Unique name for the secondary app to prevent conflicts
            const appName = "secondaryApp-" + new Date().getTime();
            secondaryApp = firebase.initializeApp(firebaseConfig, appName);
            const secondaryAuth = secondaryApp.auth();

            // CRITICAL: Set persistence to NONE so this auth instance does not persist
            // and does not overwrite the main app's session in localStorage.
            await secondaryAuth.setPersistence(firebase.auth.Auth.Persistence.NONE);

            const userCredential = await secondaryAuth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            if (user) {
                const today = new Date().toISOString().split('T')[0];
                const expiryDate = new Date();
                expiryDate.setMonth(expiryDate.getMonth() + 1);

                const newUser: UserData = {
                    onboardingComplete: true,
                    isPremium: newUserPremium,
                    isAdmin: false,
                    subscriptionExpiry: newUserPremium ? expiryDate.toISOString() : undefined,
                    name: name,
                    // @ts-ignore
                    email: email, 
                    stats: {
                        xp: 0,
                        level: 1,
                        currentStreak: 1,
                        lastLoginDate: today,
                        quests: [],
                        totalQuotesRead: 0,
                        totalShares: 0,
                        totalLikes: 0
                    },
                    improvementAreas: [],
                    appGoals: [],
                    topics: []
                };

                // Use the secondary app's firestore to write the user data.
                const secondaryDb = secondaryApp.firestore();
                await secondaryDb.collection("users").doc(user.uid).set(newUser);
                
                // Sign out the secondary user explicitly
                await secondaryAuth.signOut();
                
                setToastMessage({ message: "Usuário criado com sucesso!", type: 'success' });
                setShowCreateModal(false);
                setNewUserEmail('');
                setNewUserPassword('');
                setNewUserName('');
                setNewUserPremium(false);
                
                // Refresh list using main app's db (which is still authenticated as Admin)
                loadUsers();
            }

        } catch (error: any) {
            console.error("Error creating user:", error);
            let msg = error.message;
            if (error.code === 'auth/email-already-in-use') msg = "E-mail já está em uso.";
            if (error.code === 'auth/weak-password') msg = "Senha muito fraca (min 6 caracteres).";
            setToastMessage({ message: `Erro: ${msg}`, type: 'error' });
        } finally {
            // Clean up the secondary app to free resources
            if (secondaryApp) {
                await secondaryApp.delete();
            }
            setIsCreatingUser(false);
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    const filteredUsers = users.filter(u => 
        (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase())) || 
        (u.data.name && u.data.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="fixed inset-0 z-[100] bg-[#050505] text-white flex flex-col overflow-hidden animate-fade-in">
            {/* Header */}
            <header className="flex flex-col bg-[#0a0a0a] border-b border-white/10">
                <div className="flex items-center justify-between p-6 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center">
                            <CogIcon className="text-2xl text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold font-serif">Admin</h1>
                            <p className="text-xs text-gray-400">Painel de Controle</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                         <button 
                            onClick={handleLogout}
                            className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center hover:bg-red-500/20 transition-colors border border-red-500/20"
                            title="Sair da Conta"
                        >
                            <LogoutIcon className="text-red-500" />
                        </button>
                        <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                            <CloseIcon className="text-xl" />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex px-6 gap-6">
                    <button 
                        onClick={() => setActiveTab('users')}
                        className={`pb-3 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'users' ? 'text-white border-indigo-500' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
                    >
                        Usuários
                    </button>
                    <button 
                        onClick={() => setActiveTab('settings')}
                        className={`pb-3 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'settings' ? 'text-white border-indigo-500' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
                    >
                        Configurações
                    </button>
                </div>
            </header>

            {/* Content */}
            <main className="flex-grow overflow-y-auto p-6 space-y-8">
                {/* SETTINGS TAB */}
                {activeTab === 'settings' && (
                    <div className="space-y-6 max-w-4xl mx-auto animate-slide-in-up">
                        {/* Store Settings */}
                        <section className="bg-[#111] border border-white/10 rounded-2xl p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <CreditCardIcon className="text-amber-500 text-xl" />
                                <h2 className="text-lg font-bold">Checkout & Preços</h2>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-gray-500 uppercase">Valores (Display)</h3>
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">Preço Mensal (R$)</label>
                                        <input 
                                            type="text" 
                                            value={appConfig.monthlyPrice}
                                            onChange={(e) => setAppConfig({...appConfig, monthlyPrice: e.target.value})}
                                            className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-indigo-500 outline-none"
                                        />
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <label className="block text-xs text-gray-400 mb-1">Preço Anual/Mês (R$)</label>
                                            <input 
                                                type="text" 
                                                value={appConfig.annualPrice}
                                                onChange={(e) => setAppConfig({...appConfig, annualPrice: e.target.value})}
                                                className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-indigo-500 outline-none"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-xs text-gray-400 mb-1">Total Anual (R$)</label>
                                            <input 
                                                type="text" 
                                                value={appConfig.annualTotal}
                                                onChange={(e) => setAppConfig({...appConfig, annualTotal: e.target.value})}
                                                className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-indigo-500 outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-gray-500 uppercase">Links de Pagamento</h3>
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">Link Mensal</label>
                                        <input 
                                            type="text" 
                                            value={appConfig.checkoutLinkMonthly}
                                            onChange={(e) => setAppConfig({...appConfig, checkoutLinkMonthly: e.target.value})}
                                            placeholder="Ex: https://pay.hotmart.com/..."
                                            className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-indigo-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">Link Anual</label>
                                        <input 
                                            type="text" 
                                            value={appConfig.checkoutLinkAnnual}
                                            onChange={(e) => setAppConfig({...appConfig, checkoutLinkAnnual: e.target.value})}
                                            placeholder="Ex: https://pay.kiwify.com.br/..."
                                            className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-indigo-500 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Support Settings */}
                        <section className="bg-[#111] border border-white/10 rounded-2xl p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <PhoneIcon className="text-green-500 text-xl" />
                                <h2 className="text-lg font-bold">Contato</h2>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Link do WhatsApp</label>
                                    <input 
                                        type="text" 
                                        value={appConfig.whatsappLink || ''}
                                        onChange={(e) => setAppConfig({...appConfig, whatsappLink: e.target.value})}
                                        placeholder="Ex: https://wa.me/5511999999999"
                                        className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-indigo-500 outline-none"
                                    />
                                    <p className="text-[10px] text-gray-500 mt-1">Este link será usado no botão "Fale Conosco" do perfil e Landing Page.</p>
                                </div>
                            </div>
                        </section>
                        
                        <div className="text-right sticky bottom-0 bg-[#050505] p-4 border-t border-white/10">
                            <button 
                                onClick={saveConfig}
                                disabled={isSavingConfig}
                                className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50"
                            >
                                {isSavingConfig ? "Salvando..." : "Salvar Alterações"}
                            </button>
                        </div>
                    </div>
                )}

                {/* USERS TAB */}
                {activeTab === 'users' && (
                    <div className="space-y-6 animate-slide-in-up">
                        {/* Actions Bar */}
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                            <input 
                                type="text" 
                                placeholder="Buscar por nome ou e-mail..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 w-full md:w-96"
                            />
                            <button 
                                onClick={() => setShowCreateModal(true)}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                            >
                                <span>+ Criar Conta</span>
                            </button>
                        </div>

                        {isLoading && <div className="text-center py-10 text-gray-500">Carregando usuários...</div>}

                        {/* Users List */}
                        <div className="space-y-4">
                            {!isLoading && filteredUsers.length === 0 ? (
                                <div className="text-center text-gray-500 py-10 border border-white/5 rounded-2xl bg-[#111]">Nenhum usuário encontrado.</div>
                            ) : (
                                filteredUsers.map((user) => (
                                    <div key={user.id} className="bg-[#111] border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-white/10 transition-colors">
                                        
                                        {/* User Info */}
                                        <div className="flex items-center gap-4 min-w-[250px]">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${user.data.isPremium ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
                                                {user.data.name ? user.data.name.charAt(0).toUpperCase() : '?'}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-white flex items-center gap-2">
                                                    {user.data.name || 'Sem nome'}
                                                    {user.data.isPremium && <CrownIcon className="text-amber-500 text-xs" />}
                                                    {user.data.isAdmin && <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 rounded-full border border-indigo-500/30">ADMIN</span>}
                                                </h3>
                                                <p className="text-sm text-gray-400">{user.email || user.id}</p>
                                            </div>
                                        </div>

                                        {/* Status */}
                                        <div className="min-w-[150px]">
                                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Status</p>
                                            {user.data.isPremium ? (
                                                <div className="flex flex-col">
                                                    <span className="text-amber-400 font-bold text-sm">Premium Ativo</span>
                                                    <span className="text-xs text-gray-400">Expira: {formatDate(user.data.subscriptionExpiry)}</span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 font-bold text-sm">Gratuito</span>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-wrap items-center gap-2">
                                            <div className="flex items-center bg-black/30 rounded-lg p-1 border border-white/5">
                                                <button 
                                                    onClick={() => handleRenew(user.id, 'month')}
                                                    className="px-3 py-2 text-xs font-bold text-green-400 hover:bg-green-500/10 rounded-md transition-colors"
                                                    title="Adicionar 1 Mês"
                                                >
                                                    +1 Mês
                                                </button>
                                                <div className="w-px h-4 bg-white/10 mx-1"></div>
                                                <button 
                                                    onClick={() => handleRenew(user.id, 'year')}
                                                    className="px-3 py-2 text-xs font-bold text-green-400 hover:bg-green-500/10 rounded-md transition-colors"
                                                    title="Adicionar 1 Ano"
                                                >
                                                    +1 Ano
                                                </button>
                                            </div>

                                            {/* Admin Toggle */}
                                            <button 
                                                onClick={() => handleToggleAdmin(user.id, user.data.isAdmin)}
                                                className={`px-3 py-2 text-xs font-bold rounded-lg border transition-colors ${user.data.isAdmin ? 'text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/10' : 'text-gray-500 border-gray-700 hover:text-white hover:border-gray-500'}`}
                                            >
                                                {user.data.isAdmin ? 'Remover Admin' : 'Tornar Admin'}
                                            </button>

                                            {user.data.isPremium && (
                                                <button 
                                                    onClick={() => handleCancel(user.id)}
                                                    className="px-4 py-2 text-xs font-bold text-amber-500 hover:bg-amber-500/10 rounded-lg border border-amber-500/30 transition-colors"
                                                >
                                                    Cancelar
                                                </button>
                                            )}

                                            <button 
                                                onClick={() => handleDelete(user.id)}
                                                className="px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-500/10 rounded-lg border border-red-500/30 transition-colors ml-2"
                                            >
                                                Excluir
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </main>

            {/* Create User Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-[110] bg-black/80 flex items-center justify-center p-4">
                    <div className="bg-[#1a1a1c] w-full max-w-md rounded-2xl p-6 border border-white/10 shadow-2xl animate-pop">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold font-serif">Criar Novo Usuário</h2>
                            <button onClick={() => setShowCreateModal(false)}>
                                <CloseIcon className="text-gray-400 hover:text-white" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">E-mail</label>
                                <input 
                                    type="email" 
                                    required
                                    value={newUserEmail}
                                    onChange={e => setNewUserEmail(e.target.value)}
                                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Senha</label>
                                <input 
                                    type="password" 
                                    required
                                    value={newUserPassword}
                                    onChange={e => setNewUserPassword(e.target.value)}
                                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Nome</label>
                                <input 
                                    type="text" 
                                    required
                                    value={newUserName}
                                    onChange={e => setNewUserName(e.target.value)}
                                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                                />
                            </div>
                            
                            <div className="flex items-center gap-3 py-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={newUserPremium} 
                                        onChange={e => setNewUserPremium(e.target.checked)}
                                        className="rounded border-gray-600 bg-black/30 text-indigo-600 focus:ring-indigo-500" 
                                    />
                                    <span className="text-sm font-medium text-white">Criar como Premium?</span>
                                </label>
                            </div>

                            <button 
                                type="submit" 
                                disabled={isCreatingUser}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-colors mt-4 disabled:opacity-50"
                            >
                                {isCreatingUser ? 'Criando...' : 'Criar Conta'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
