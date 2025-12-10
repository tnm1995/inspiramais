import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth } from '../firebaseConfig';
import firebase from 'firebase/compat/app';
import { LoginFormData, SignupFormData } from '../types';

interface AuthContextType {
  currentUser: firebase.User | null;
  isAuthenticated: boolean;
  userEmail: string | null;
  login: (data: LoginFormData) => Promise<void>;
  signup: (data: SignupFormData) => Promise<void>;
  loginWithGoogle: () => Promise<firebase.auth.UserCredential>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  authError: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<firebase.User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (data: LoginFormData) => {
    setAuthError(null);
    try {
        await auth.signInWithEmailAndPassword(data.email, data.password);
    } catch (error: any) {
        console.error("Login error:", error);
        let msg = "Falha ao entrar.";
        if (error.code === 'auth/invalid-credential') msg = "E-mail ou senha incorretos.";
        if (error.code === 'auth/user-not-found') msg = "Usuário não encontrado.";
        if (error.code === 'auth/wrong-password') msg = "Senha incorreta.";
        setAuthError(msg);
        throw error;
    }
  };

  const signup = async (data: SignupFormData) => {
      setAuthError(null);
      try {
          // Create Auth User
          await auth.createUserWithEmailAndPassword(data.email, data.password);
      } catch (error: any) {
          console.error("Signup error:", error);
          let msg = "Falha ao criar conta.";
          if (error.code === 'auth/email-already-in-use') msg = "Este e-mail já está em uso.";
          if (error.code === 'auth/weak-password') msg = "A senha é muito fraca.";
          setAuthError(msg);
          throw error;
      }
  };

  const loginWithGoogle = async () => {
    setAuthError(null);
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
        const result = await auth.signInWithPopup(provider);
        return result;
    } catch (error: any) {
        console.error("Google login error:", error);
        let msg = "Falha ao entrar com Google.";
        if (error.code === 'auth/popup-closed-by-user') msg = "Login cancelado.";
        setAuthError(msg);
        throw error;
    }
  };

  const resetPassword = async (email: string) => {
      setAuthError(null);
      try {
          await auth.sendPasswordResetEmail(email);
      } catch (error: any) {
          console.error("Reset password error:", error);
          let msg = "Falha ao enviar e-mail de redefinição.";
          if (error.code === 'auth/invalid-email') msg = "E-mail inválido.";
          if (error.code === 'auth/user-not-found') msg = "E-mail não cadastrado.";
          setAuthError(msg);
          throw error;
      }
  };

  const logout = async () => {
    try {
        await auth.signOut();
    } catch (error) {
        console.error("Error during logout:", error);
    }
  };
  
  const isAuthenticated = !!currentUser;
  const userEmail = currentUser?.email || null;

  return (
    <AuthContext.Provider value={{ 
        currentUser, 
        isAuthenticated, 
        userEmail, 
        login, 
        signup, 
        loginWithGoogle,
        resetPassword,
        logout, 
        isLoading,
        authError
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
