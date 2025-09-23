import { createContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthTokens } from '@/types';

// --- FIX: Define the context type directly in this file ---
// This ensures the 'loading' property is correctly included.
export interface AuthContextType {
  user: User | null;
  tokens: AuthTokens | null;
  loading: boolean;
  login: (data: { user: User; tokens: AuthTokens }) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoginPopupOpen: boolean;
  openLoginPopup: () => void;
  closeLoginPopup: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoginPopupOpen, setIsLoginPopupOpen] = useState(false);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      const storedTokens = localStorage.getItem('authTokens');
      if (storedUser && storedTokens) {
        setUser(JSON.parse(storedUser));
        setTokens(JSON.parse(storedTokens));
      }
    } catch (error) {
      console.error('Failed to parse auth data from localStorage', error);
      localStorage.removeItem('user');
      localStorage.removeItem('authTokens');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (data: { user: User; tokens: AuthTokens }) => {
    setUser(data.user);
    setTokens(data.tokens);
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('authTokens', JSON.stringify(data.tokens));
  };

  const logout = () => {
    setUser(null);
    setTokens(null);
    localStorage.removeItem('user');
    localStorage.removeItem('authTokens');
  };

  const openLoginPopup = () => setIsLoginPopupOpen(true);
  const closeLoginPopup = () => setIsLoginPopupOpen(false);

  const isAuthenticated = !!tokens?.access?.token;

  return (
    <AuthContext.Provider value={{ 
        user, 
        tokens,
        loading,
        login, 
        logout, 
        isAuthenticated,
        isLoginPopupOpen,
        openLoginPopup,
        closeLoginPopup
    }}>
      {children}
    </AuthContext.Provider>
  );
};

