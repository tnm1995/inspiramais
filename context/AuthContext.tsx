import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth } from '../firebaseConfig';
import { 
    onAuthStateChanged, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    User,
    GoogleAuthProvider,
    signInWithPopup,
    UserCredential
} from 'firebase/auth';
import { LoginFormData, SignupFormData } from '../types';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  userEmail: string | null;
  login: (data: LoginFormData) => Promise<void>;
  signup: (data: SignupFormData) => Promise<void>;
  loginWithGoogle: () => Promise<UserCredential>;
  logout: () => Promise<void>;
  isLoading: boolean;
  authError: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (data: LoginFormData) => {
    setAuthError(null);
    try {
        await signInWithEmailAndPassword(auth, data.email, data.password);
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
          await createUserWithEmailAndPassword(auth, data.email, data.password);
          // Note: UserData creation in Firestore is handled by the UserDataContext or App logic 
          // right after this promise resolves, or via a trigger.
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
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        return result;
    } catch (error: any) {
        console.error("Google login error:", error);
        let msg = "Falha ao entrar com Google.";
        if (error.code === 'auth/popup-closed-by-user') msg = "Login cancelado.";
        setAuthError(msg);
        throw error;
    }
  };

  const logout = async () => {
    try {
        await signOut(auth);
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