import React, { useState, useEffect } from 'react';
import { CloseIcon, UserCircleIcon, CrownIcon } from '../Icons';
import { UserData } from '../../types';
import { db } from '../../firebaseConfig';
import { collection, getDocs, doc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';

interface AdminPanelProps {
    onClose: () => void;
    setToastMessage: (msg: { message: string, type: 'success' | 'error' }) => void;
}

interface AdminUser {
    id: string; // Firebase UID
    email?: string; // Stored in the document for easy access or need to fetch from Auth (complicated in client SDK). We assume email is saved in UserData for simplicity or we iterate.
    data: UserData;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onClose, setToastMessage }) => {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    // Create User Form State
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserPassword, setNewUserPassword] = useState('');
    const [newUserName, setNewUserName] = useState('');
    const [newUserPremium, setNewUserPremium] = useState(false);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        setIsLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, "users"));
            const loadedUsers: AdminUser[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data() as UserData;
                // Note: Email is not strictly in UserData interface usually, but useful to store there for Admin display if Auth list isn't accessible.
                // For this implementation, we rely on 'name' mainly, or if you saved email in UserData.
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

    // Note: Creating a user via Admin SDK requires a Firebase Function or switching Auth context. 
    // In client SDK, creating a user logs you in as that user.
    // For this prototype, we will warn the admin.
    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        alert("Atenção: Criar um usuário aqui fará o logout da sua conta de admin atual, pois o Firebase Auth Client SDK apenas suporta um usuário ativo por vez. Você terá que relogar como admin depois.");
        
        if (!newUserEmail || !newUserName || !newUserPassword) return;

        try {
            // This logs out the admin and logs in the new user
            const userCredential = await createUserWithEmailAndPassword(getAuth(), newUserEmail, newUserPassword);
            const user = userCredential.user;

            const today = new Date().toISOString().split('T')[0];
            const expiryDate = new Date();
            expiryDate.setMonth(expiryDate.getMonth() + 1);

            const newUser: UserData = {
                onboardingComplete: true,
                isPremium: newUserPremium,
                subscriptionExpiry: newUserPremium ? expiryDate.toISOString() : undefined,
                name: newUserName,
                // @ts-ignore - storing email for admin usage
                email: newUserEmail, 
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

            await setDoc(doc(db, "users", user.uid), newUser);
            
            // Because we are now logged in as the new user, we essentially reload the app flow.
            // In a real admin panel, this logic belongs in a Cloud Function.
            window.location.reload(); 

        } catch (error: any) {
            console.error(error);
            setToastMessage({ message: `Erro: ${error.message}`, type: 'error' });
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
            <header className="flex items-center justify-between p-6 border-b border-white/10 bg-[#0a0a0a]">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center">
                        <UserCircleIcon className="text-2xl text-white" />
                    </div>
                    <h1 className="text-xl font-bold font-serif">Admin (Firebase)</h1>
                </div>
                <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                    <CloseIcon className="text-xl" />
                </button>
            </header>

            {/* Content */}
            <main className="flex-grow overflow-y-auto p-6">
                
                {/* Actions Bar */}
                <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">
                    <input 
                        type="text" 
                        placeholder="Buscar..." 
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

                {isLoading && <div className="text-center py-4">Carregando dados do Firestore...</div>}

                {/* Users List */}
                <div className="space-y-4">
                    {!isLoading && filteredUsers.length === 0 ? (
                        <div className="text-center text-gray-500 py-10">Nenhum usuário encontrado.</div>
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
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-colors mt-4"
                            >
                                Criar Conta (Fará Logout do Admin)
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};