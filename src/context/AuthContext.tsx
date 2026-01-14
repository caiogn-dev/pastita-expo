import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import * as storeApi from '../services/storeApi';
import { storage } from '../services/storage';
import { STORAGE_KEYS } from '../constants/config';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<User>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const token = await storeApi.getAuthToken();
      if (!token) {
        setUser(null);
        return;
      }

      const profile = await storeApi.getProfile();
      setUser(profile);
      await storage.setJSON(STORAGE_KEYS.USER_DATA, profile);
    } catch (error: any) {
      if (error.response?.status === 401) {
        await storeApi.clearAuthToken();
        await storage.removeItem(STORAGE_KEYS.USER_DATA);
        setUser(null);
      }
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Try to load cached user data first
        const cachedUser = await storage.getJSON<User>(STORAGE_KEYS.USER_DATA);
        if (cachedUser) {
          setUser(cachedUser);
        }

        // Then verify with server
        await fetchProfile();
      } catch (error) {
        console.error('Auth init error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [fetchProfile]);

  const signIn = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await storeApi.loginUser(email, password);
      const loginUser = response.user;
      setUser(loginUser);
      await storage.setJSON(STORAGE_KEYS.USER_DATA, loginUser);
      return { success: true };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.non_field_errors?.[0] ||
        error.response?.data?.detail ||
        error.response?.data?.error ||
        'E-mail ou senha inválidos';
      return { success: false, error: errorMessage };
    }
  };

  const signUp = async (data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await storeApi.registerUser(data);
      const newUser = response.user;
      setUser(newUser);
      await storage.setJSON(STORAGE_KEYS.USER_DATA, newUser);
      return { success: true };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.email?.[0] ||
        error.response?.data?.password?.[0] ||
        error.response?.data?.non_field_errors?.[0] ||
        error.response?.data?.detail ||
        'Erro ao criar conta';
      return { success: false, error: errorMessage };
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await storeApi.logoutUser();
    } catch (error) {
      // Ignore logout errors
    } finally {
      setUser(null);
      await storage.removeItem(STORAGE_KEYS.USER_DATA);
    }
  };

  const updateProfile = async (data: Partial<User>): Promise<User> => {
    const updatedUser = await storeApi.updateProfile(data);
    setUser(updatedUser);
    await storage.setJSON(STORAGE_KEYS.USER_DATA, updatedUser);
    return updatedUser;
  };

  const refreshProfile = async (): Promise<void> => {
    await fetchProfile();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        signIn,
        signUp,
        signOut,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
