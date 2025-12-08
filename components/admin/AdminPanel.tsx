
import React, { useState, useEffect } from 'react';
import { CloseIcon, UserCircleIcon, CrownIcon } from '../Icons';
import { UserData } from '../../types';

interface AdminPanelProps {
    onClose: () => void;
    setToastMessage: (msg: { message: string, type: 'success' | 'error' }) => void;
}

interface AdminUser {
    email: string;
    data: UserData;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onClose, setToastMessage }) => {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    
    // Create User Form State
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserName, setNewUserName] = useState('');
    const [newUserPremium, setNewUserPremium] = useState(false);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = () => {
        const loadedUsers: AdminUser[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('inspiraUserData-')) {
                const email = key.replace('inspiraUserData-', '');
                try {
                    const data = JSON.parse(localStorage.getItem(key) || '{}');
                    loadedUsers.push({ email, data });
                } catch (e) {
                    console.error("Error loading user", email);
                }
            }
        }
        setUsers(loadedUsers);
    };

    const handleRenew = (email: string, type: 'month' | 'year') => {
        const userIndex = users.findIndex(u => u.email === email);
        if (userIndex === -1) return;

        const user = users[userIndex];
        const now = new Date();
        // If already future, add to it, else start from now
        const currentExpiry = user.data.subscriptionExpiry ? new Date(user.data.subscriptionExpiry) : new Date();
        const startDate = currentExpiry > now ? currentExpiry : now;
        
        const newExpiry = new Date(startDate);
        if (type === 'month') {
            newExpiry.setMonth(newExpiry.getMonth() + 1);
        } else {
            newExpiry.setFullYear(newExpiry.getFullYear() + 1);
        }

        const updatedData: UserData = {
            ...user.data,
            isPremium: true,
            subscriptionExpiry: newExpiry.toISOString()
        };

        localStorage.setItem(`inspiraUserData-${email}`, JSON.stringify(updatedData));
        setToastMessage({ message: `Assinatura de ${email} renovada!`, type: 'success' });
        loadUsers();
    };

    const handleCancel = (email: string) => {
        const userIndex = users.findIndex(u => u.email === email);
        if (userIndex === -1) return;

        const user = users[userIndex];
        const updatedData: UserData = {
            ...user.data,
            isPremium: false,
            subscriptionExpiry: undefined
        };

        localStorage.setItem(`inspiraUserData-${email}`, JSON.stringify(updatedData));
        setToastMessage({ message: `Assinatura de ${email} cancelada.`, type: 'success' });
        loadUsers();
    };

    const handleDelete = (email: string) => {
        if (window.confirm(`Tem certeza que deseja excluir o usuário ${email}?`)) {
            localStorage.removeItem(`inspiraUserData-${email}`);
            
            // Also clean up CPF registry if exists
            const registry = JSON.parse(localStorage.getItem('inspira_cpf_registry') || '{}');
            const cpfToDelete = Object.keys(registry).find(key => registry[key] === email);
            if (cpfToDelete) {
                delete registry[cpfToDelete];
                localStorage.setItem('inspira_cpf_registry', JSON.stringify(registry));
            }

            setToastMessage({ message: `Usuário ${email} excluído.`, type: 'success' });
            loadUsers();
        }
    };

    const handleCreateUser = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUserEmail || !newUserName) return;

        const key = `inspiraUserData-${newUserEmail.toLowerCase()}`;
        if (localStorage.getItem(key)) {
            setToastMessage({ message: 'Usuário já existe!', type: 'error' });
            return;
        }

        const today = new Date().toISOString().split('T')[0];
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 1); // Default 1 month if premium

        const newUser: UserData = {
            onboardingComplete: true,
            isPremium: newUserPremium,
            subscriptionExpiry: newUserPremium ? expiryDate.toISOString() : undefined,
            name: newUserName,
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

        localStorage.setItem(key, JSON.stringify(newUser));
        setToastMessage({ message: 'Usuário criado com sucesso!', type: 'success' });
        setShowCreateModal(false);
        setNewUserEmail('');
        setNewUserName('');
        setNewUserPremium(false);
        loadUsers();
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    const filteredUsers = users.filter(u => 
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
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
                    <h1 className="text-xl font-bold font-serif">Administração Inspira+</h1>
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

                {/* Users List */}
                <div className="space-y-4">
                    {filteredUsers.length === 0 ? (
                        <div className="text-center text-gray-500 py-10">Nenhum usuário encontrado.</div>
                    ) : (
                        filteredUsers.map((user) => (
                            <div key={user.email} className="bg-[#111] border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-white/10 transition-colors">
                                
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
                                        <p className="text-sm text-gray-400">{user.email}</p>
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
                                            onClick={() => handleRenew(user.email, 'month')}
                                            className="px-3 py-2 text-xs font-bold text-green-400 hover:bg-green-500/10 rounded-md transition-colors"
                                            title="Adicionar 1 Mês"
                                        >
                                            +1 Mês
                                        </button>
                                        <div className="w-px h-4 bg-white/10 mx-1"></div>
                                        <button 
                                            onClick={() => handleRenew(user.email, 'year')}
                                            className="px-3 py-2 text-xs font-bold text-green-400 hover:bg-green-500/10 rounded-md transition-colors"
                                            title="Adicionar 1 Ano"
                                        >
                                            +1 Ano
                                        </button>
                                    </div>

                                    {user.data.isPremium && (
                                        <button 
                                            onClick={() => handleCancel(user.email)}
                                            className="px-4 py-2 text-xs font-bold text-amber-500 hover:bg-amber-500/10 rounded-lg border border-amber-500/30 transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                    )}

                                    <button 
                                        onClick={() => handleDelete(user.email)}
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
                                Criar Conta
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
