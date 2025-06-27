import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate checking for existing session
    const savedUser = localStorage.getItem('jurisconnect_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock user data based on email
    let mockUser: User;
    
    if (email === 'admin@jurisconnect.com') {
      mockUser = {
        id: '1',
        name: 'Administrador',
        email: 'admin@jurisconnect.com',
        role: 'admin',
        status: 'active',
        createdAt: '2024-01-01T00:00:00Z'
      };
    } else if (email === 'cliente@exemplo.com') {
      mockUser = {
        id: '2',
        name: 'João Silva',
        email: 'cliente@exemplo.com',
        role: 'client',
        status: 'active',
        createdAt: '2024-01-15T00:00:00Z',
        phone: '(11) 99999-9999'
      };
    } else {
      mockUser = {
        id: '3',
        name: 'Maria Santos',
        email: 'correspondente@exemplo.com',
        role: 'correspondent',
        status: 'active',
        createdAt: '2024-01-20T00:00:00Z',
        phone: '(11) 88888-8888',
        oab: 'SP123456',
        city: 'São Paulo',
        state: 'SP'
      };
    }
    
    setUser(mockUser);
    localStorage.setItem('jurisconnect_user', JSON.stringify(mockUser));
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('jurisconnect_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};