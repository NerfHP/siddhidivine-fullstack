import { createContext, useState, useEffect, ReactNode } from 'react';
import { AuthContextType, User, AuthTokens } from '@/types';

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);

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

  const isAuthenticated = !!tokens?.access?.token;

  return (
    <AuthContext.Provider value={{ user, tokens, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};