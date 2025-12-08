import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, LoginStatus } from '../types';
import { bankingService } from '../services/mockDatabase';

interface AuthContextType {
  user: User | null;
  status: LoginStatus;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  updateKyc: (aadhaar: string, pan: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<LoginStatus>(LoginStatus.IDLE);

  const login = async (email: string, pass: string) => {
    setStatus(LoginStatus.LOADING);
    try {
      const userData = await bankingService.login(email, pass);
      setUser(userData);
      setStatus(LoginStatus.SUCCESS);
    } catch (error) {
      setStatus(LoginStatus.ERROR);
      console.error(error);
    }
  };

  const updateKyc = async (aadhaar: string, pan: string) => {
    if (!user) return;
    setStatus(LoginStatus.LOADING);
    try {
      const updated = await bankingService.updateKyc(user.id, aadhaar, pan);
      setUser(updated);
      setStatus(LoginStatus.SUCCESS);
    } catch (error) {
      setStatus(LoginStatus.ERROR);
      console.error(error);
      throw error;
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
    setStatus(LoginStatus.LOADING);
    try {
      const updated = await bankingService.updateProfile(user.id, data);
      setUser(updated);
      setStatus(LoginStatus.SUCCESS);
    } catch (error) {
      setStatus(LoginStatus.ERROR);
      console.error(error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setStatus(LoginStatus.IDLE);
  };

  return (
    <AuthContext.Provider value={{ user, status, login, logout, updateKyc, updateProfile }}>
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