import { createContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthTokens } from '@/types'; // Your existing types

// 1. UPDATE THE CONTEXT'S TYPE DEFINITION
// We add the new state and functions that will control the login popup.
export interface AuthContextType {
  user: User | null;
  tokens: AuthTokens | null;
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
  
  // 2. ADD STATE TO MANAGE THE POPUP'S VISIBILITY
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

  // 3. DEFINE THE FUNCTIONS THAT WILL CHANGE THE STATE
  const openLoginPopup = () => setIsLoginPopupOpen(true);
  const closeLoginPopup = () => setIsLoginPopupOpen(false);

  const isAuthenticated = !!tokens?.access?.token;

  return (
    // 4. PROVIDE THE NEW VALUES TO ALL CHILDREN COMPONENTS
    <AuthContext.Provider value={{ 
        user, 
        tokens, 
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

