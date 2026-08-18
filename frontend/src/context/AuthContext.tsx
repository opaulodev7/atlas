import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authService } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('atlas_token'));
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      if (token) {
        const currentUser = await authService.me();
        setUser(currentUser);
        localStorage.setItem('atlas_user', JSON.stringify(currentUser));
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Failed to load user session:', err);
      setUser(null);
      setToken(null);
      localStorage.removeItem('atlas_token');
      localStorage.removeItem('atlas_user');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, [token]);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const data = await authService.login(email, pass);
      localStorage.setItem('atlas_token', data.token);
      localStorage.setItem('atlas_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, pass: string) => {
    setLoading(true);
    try {
      const data = await authService.register(name, email, pass);
      localStorage.setItem('atlas_token', data.token);
      localStorage.setItem('atlas_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('atlas_token');
    localStorage.removeItem('atlas_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
