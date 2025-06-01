
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';

interface AppUser {
  id: string;
  email?: string;
  username?: string;
  wallet_address?: string;
  balance: number;
  usd_balance?: number;
  ngn_balance?: number;
  ghs_balance?: number;
}

interface AuthContextType {
  user: AppUser | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
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
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (data) {
        setUser({
          id: data.id,
          email: data.email,
          username: data.username,
          wallet_address: data.wallet_address,
          balance: data.balance || 0,
          usd_balance: 0, // Mock data for now
          ngn_balance: 0,
          ghs_balance: 0,
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUser(null);
    }
  };

  const refreshProfile = async () => {
    if (session?.user) {
      await fetchUserProfile(session.user.id);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setUser(null);
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, username: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      });

      if (error) throw error;

      toast.success({
        title: "Account created successfully!",
        description: "Please check your email to verify your account.",
      });
    } catch (error: any) {
      toast.error({
        title: "Sign up failed",
        description: error.message || "An error occurred during sign up.",
      });
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
    } catch (error: any) {
      toast.error({
        title: "Sign in failed",
        description: error.message || "An error occurred during sign in.",
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      setSession(null);

      toast.success({
        title: "Signed out successfully",
        description: "You have been logged out of your account.",
      });
    } catch (error: any) {
      toast.error({
        title: "Sign out failed",
        description: error.message || "An error occurred during sign out.",
      });
    }
  };

  const value = {
    user,
    session,
    isAuthenticated: !!session,
    isLoading,
    signUp,
    signIn,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
