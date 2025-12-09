import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useUserData } from '../../context/UserDataContext';
import { LoginScreen } from './screens/LoginScreen';
import { SignupFormData, LoginFormData } from '../../types';

export const LoginFlow: React.FC = () => {
    const { login } = useAuth();
    const { updateUserData } = useUserData();

    // Mock login and signup. In a real app, this would involve API calls.
    const handleLogin = (data: LoginFormData) => {
        console.log('Logging in with:', data.email);
        // For this mock, we just log in without checking the password.
        login(data);
    };

    const handleSignup = (data: SignupFormData) => {
        console.log('Signing up with:', data);
        // Pre-fill user data with the name from signup
        updateUserData({ name: data.name });
        // Then, log the new user in.
        login(data);
    };

    return (
        <main className="relative bg-transparent h-full w-full text-white flex flex-col items-center justify-center" role="main">
            <LoginScreen onLogin={handleLogin} onSignup={handleSignup} />
        </main>
    );
};