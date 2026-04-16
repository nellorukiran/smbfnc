import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/services/api';

interface User {
  id: number;
  user_name: string;
  role: string;
  email: string | null;
  phone_number: string | null;
  first_name?: string;
  last_name?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, userName: string) => Promise<{ error: Error | null }>;
  signOut: () => void;
  refreshUser: () => Promise<void>;
  isAdmin: boolean;
  isApproved: boolean; // Assuming if they can login, they are approved (backend check)
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.get('/auth/me');
      setUser(data);
    } catch (error) {
      console.error('Session check failed', error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (usernameOrEmail: string, password: string) => {
    try {
      // Backend expects 'user_name', but we can pass email as user_name?
      // Auth route checks `user_name = ?`. 
      // Wait, endpoint logic: `SELECT * FROM smb_user WHERE user_name = ?`
      // It doesn't check email for login! I should update backend to check OR email.
      // Or frontend asks for Username.
      // The current frontend Login page asks for "Email".
      // I should update backend to allow email login.

      const { data } = await api.post('/auth/login', {
        user_name: usernameOrEmail, // Just passing it, need backend update if email is used
        password,
      });

      localStorage.setItem('token', data.token);
      setUser(data.user);
      return { error: null };
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'An error occurred';
      return { error: new Error(msg) };
    }
  };

  const signUp = async (email: string, password: string, userName: string) => {
    try {
      await api.post('/auth/register', {
        email,
        password,
        user_name: userName,
        phone_number: '', // Optional
      });
      return { error: null };
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'An error occurred';
      return { error: new Error(msg) };
    }
  };

  const signOut = () => {
    localStorage.removeItem('token');
    setUser(null);
    // window.location.href = '/auth'; // Optional
  };

  const isAdmin = user?.role === 'ROLE_ADMIN';
  const isApproved = true; // Backend prevents login if not approved.

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    refreshUser: checkUser,
    isAdmin,
    isApproved,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
