
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

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
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check for an existing session and set up auth state listener
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        if (currentSession?.user) {
          // Defer fetching profile data
          setTimeout(() => {
            fetchUserProfile(currentSession.user.id);
          }, 0);
        } else {
          setUser(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      if (currentSession?.user) {
        fetchUserProfile(currentSession.user.id);
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch user profile from Supabase
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        const profileData: User = {
          id: data.id,
          username: data.username,
          email: data.email,
          walletAddress: data.wallet_address,
          balance: Number(data.balance)
        };
        setUser(profileData);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast({
        title: "Failed to load profile",
        description: "Please try logging in again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        throw error;
      }

      toast({
        title: "Welcome back! 🎉",
        description: "You've successfully logged in to your GCoin wallet.",
      });

      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (username: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username
          }
        }
      });
      
      if (error) {
        throw error;
      }

      toast({
        title: `Welcome, ${username}! 🎉`,
        description: "Your GCoin wallet has been created successfully with 600,000 GCoins!",
      });

      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Update balance function
  const updateBalance = async (newBalance: number) => {
    if (user && session) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ balance: newBalance })
          .eq('id', user.id);
        
        if (error) {
          throw error;
        }

        setUser({
          ...user,
          balance: newBalance
        });
      } catch (error) {
        console.error('Error updating balance:', error);
        toast({
          title: "Failed to update balance",
          description: "Please try again later",
          variant: "destructive",
        });
      }
    }
  };

  // Logout function
  const logout = async () => {
    // Confirm before logout
    if (window.confirm("Are you sure you want to log out?")) {
      try {
        const { error } = await supabase.auth.signOut();
        
        if (error) {
          throw error;
        }
        
        setUser(null);
        setSession(null);
        
        toast({
          title: "Logged out",
          description: "You have been successfully logged out.",
        });
        
        navigate('/');
      } catch (error) {
        console.error('Error logging out:', error);
        toast({
          title: "Logout failed",
          description: "Please try again",
          variant: "destructive",
        });
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
