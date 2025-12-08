import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  userEmail: string | null;
  login: (email: string, remember?: boolean) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
        const localEmail = localStorage.getItem('inspiraUserEmail');
        const sessionEmail = sessionStorage.getItem('inspiraUserEmail');
        
        if (localEmail) {
            setUserEmail(localEmail);
        } else if (sessionEmail) {
            setUserEmail(sessionEmail);
        }
    } catch (error) {
        console.error("Failed to access storage", error);
    } finally {
        setIsLoading(false);
    }
  }, []);

  const login = useCallback((email: string, remember: boolean = true) => {
    const lowercasedEmail = email.toLowerCase();
    
    if (remember) {
        localStorage.setItem('inspiraUserEmail', lowercasedEmail);
        sessionStorage.removeItem('inspiraUserEmail'); // Clear session if switching
    } else {
        sessionStorage.setItem('inspiraUserEmail', lowercasedEmail);
        localStorage.removeItem('inspiraUserEmail'); // Clear local if switching
    }
    
    setUserEmail(lowercasedEmail);
  }, []);

  const logout = useCallback(() => {
    try {
        // Clear user-specific data but keep other settings if needed
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('inspiraUserData-') || key === 'inspiraUserEmail') {
                localStorage.removeItem(key);
            }
        });
        sessionStorage.removeItem('inspiraUserEmail');
        setUserEmail(null);
        // Removed window.location.reload() to allow smooth transition to login screen
    } catch (error) {
        console.error("Error during logout:", error);
    }
  }, []);
  
  const isAuthenticated = !!userEmail;

  return (
    <AuthContext.Provider value={{ isAuthenticated, userEmail, login, logout, isLoading }}>
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