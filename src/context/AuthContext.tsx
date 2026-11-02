import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, AuthState } from '../types/auth';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; mustChangePassword?: boolean }>;
  logout: () => void;
  studentRegister: (data: {
    institutionalEmail: string;
    name: string;
    rollNumber: string;
    department: string;
    year: string;
    password: string;
  }) => Promise<{ success: boolean; error?: string; message?: string }>;
  staffRegister: (data: {
    name: string;
    email: string;
    department: string;
    designation: string;
    password: string;
  }) => Promise<{ success: boolean; error?: string; message?: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: 'intelligrade_auth_user_v2',
  TOKEN: 'intelligrade_auth_token_v2',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Authentication failed' };
      }

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
      localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);

      return {
        success: true,
        mustChangePassword: data.user.mustChangePassword,
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Server connection failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
  };

  const studentRegister = async (data: {
    institutionalEmail: string;
    name: string;
    rollNumber: string;
    department: string;
    year: string;
    password: string;
  }) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/student-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (!res.ok) {
        return { success: false, error: resData.error || 'Student registration failed' };
      }
      return { success: true, message: resData.message };
    } catch (err: any) {
      return { success: false, error: err.message || 'Registration failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const staffRegister = async (data: {
    name: string;
    email: string;
    department: string;
    designation: string;
    password: string;
  }) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/staff-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (!res.ok) {
        return { success: false, error: resData.error || 'Staff registration failed' };
      }
      return { success: true, message: resData.message };
    } catch (err: any) {
      return { success: false, error: err.message || 'Staff registration failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          currentPassword,
          newPassword,
        }),
      });
      const resData = await res.json();
      if (!res.ok) {
        return { success: false, error: resData.error || 'Password update failed' };
      }

      // Clear mustChangePassword locally
      const updatedUser = { ...user, mustChangePassword: false };
      setUser(updatedUser);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Password update failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER);
      if (stored) setUser(JSON.parse(stored));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        logout,
        studentRegister,
        staffRegister,
        changePassword,
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
