
import React, { createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { useAuthState } from '@/hooks/useAuthState';
import { loginUser, registerUser, logoutUser } from '@/services/authService';
import { updateUserBalance } from '@/services/profileService';

// Custom User type
export interface User {
  id: string;
  username: string;
  email: string;
  walletAddress: string;
  balance: number;
}

// Auth context type
interface AuthContextType {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateBalance: (newBalance: number) => void;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, setUser, supabaseUser, session, isLoading } = useAuthState();
  const navigate = useNavigate();

  // Login function
  const login = async (email: string, password: string) => {
    const result = await loginUser(email, password);
    if (result.success) {
      navigate('/dashboard');
    }
  };

  // Register function
  const register = async (username: string, email: string, password: string) => {
    const result = await registerUser(username, email, password);
    if (result.success) {
      // Wait a moment to ensure the trigger has time to create the profile
      setTimeout(() => {
        if (result.data?.user) {
          navigate('/dashboard');
        }
      }, 1000);
    }
  };

  // Update balance function
  const updateBalance = async (newBalance: number) => {
    if (user && session) {
      const success = await updateUserBalance(user.id, newBalance);
      if (success) {
        setUser({
          ...user,
          balance: newBalance
        });
      }
    }
  };

  // Logout function
  const logout = async () => {
    // Confirm before logout
    if (window.confirm("Are you sure you want to log out?")) {
      const success = await logoutUser();
      if (success) {
        navigate('/');
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        supabaseUser,
        session,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateBalance
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
