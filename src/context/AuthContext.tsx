
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { Session, User, Provider } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

// User type (extended from Supabase User)
export interface AppUser {
  id: string;
  username: string;
  email: string;
  wallet_address?: string;
  balance?: number;
}

// Auth context type
interface AuthContextType {
  user: AppUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch user profile data
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      if (data) {
        return {
          id: data.id,
          username: data.username,
          email: data.email,
          wallet_address: data.wallet_address,
          balance: data.balance
        };
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
    
    return null;
  };

  // Get full user with profile data
  const getUserWithProfile = async (supabaseUser: User): Promise<AppUser | null> => {
    if (!supabaseUser?.id) return null;
    
    const profileData = await fetchUserProfile(supabaseUser.id);
    
    if (profileData) {
      return profileData;
    }
    
    return {
      id: supabaseUser.id,
      username: supabaseUser.email?.split('@')[0] || 'User',
      email: supabaseUser.email || '',
    };
  };

  // Set up auth state listener and refresh profile data
  useEffect(() => {
    setIsLoading(true);
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        
        if (currentSession?.user) {
          // Defer profile fetch to avoid Supabase deadlock
          setTimeout(async () => {
            const userData = await getUserWithProfile(currentSession.user);
            setUser(userData);
            setIsLoading(false);
          }, 0);
        } else {
          setUser(null);
          setIsLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      setSession(currentSession);
      
      if (currentSession?.user) {
        const userData = await getUserWithProfile(currentSession.user);
        setUser(userData);
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }

      if (data.user) {
        const userData = await getUserWithProfile(data.user);
        setUser(userData);
        
        toast({
          title: "Login successful",
          description: `Welcome back, ${userData?.username}!`,
        });

        navigate('/dashboard');
      }
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign in with Google function
  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        }
      });
      
      if (error) {
        throw error;
      }
      
      // Auth state change will handle the rest
    } catch (error: any) {
      toast({
        title: "Google sign-in failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
      setIsLoading(false);
      throw error;
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
            username,
          }
        }
      });
      
      if (error) {
        throw error;
      }

      if (data.user) {
        // If auto-confirm is enabled, we can get the profile immediately
        // Otherwise wait for user to confirm email
        const userData = await getUserWithProfile(data.user);
        setUser(userData);
        
        toast({
          title: "Registration successful",
          description: data.session ? 
            `Welcome, ${username}!` : 
            "Please check your email to confirm your account",
        });

        if (data.session) {
          navigate('/dashboard');
        }
      }
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

  // Logout function
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Error during logout",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  // Function to refresh user profile data
  const refreshProfile = async () => {
    if (!session?.user) return;
    
    try {
      const updatedUserData = await getUserWithProfile(session.user);
      setUser(updatedUserData);
    } catch (error) {
      console.error("Failed to refresh profile:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signInWithGoogle,
        register,
        logout,
        refreshProfile
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
