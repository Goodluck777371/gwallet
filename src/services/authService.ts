
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

export async function loginUser(email: string, password: string): Promise<{ success: boolean; data?: any; error?: any }> {
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

    return { success: true, data };
  } catch (error: any) {
    toast({
      title: "Login failed",
      description: error.message || "Invalid credentials",
      variant: "destructive",
    });
    return { success: false, error };
  }
}

export async function registerUser(username: string, email: string, password: string): Promise<{ success: boolean; data?: any; error?: any }> {
  try {
    console.log("Registering new user:", username, email);
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

    console.log("Registration success:", data);
    
    toast({
      title: `Welcome, ${username}! 🎉`,
      description: "Your GCoin wallet has been created successfully with 600,000 GCoins!",
    });

    return { success: true, data };
  } catch (error: any) {
    console.error("Registration error:", error);
    toast({
      title: "Registration failed",
      description: error.message || "Something went wrong",
      variant: "destructive",
    });
    return { success: false, error };
  }
}

export async function logoutUser(): Promise<boolean> {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw error;
    }
    
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    
    return true;
  } catch (error) {
    console.error('Error logging out:', error);
    toast({
      title: "Logout failed",
      description: "Please try again",
      variant: "destructive",
    });
    return false;
  }
}

export function setupAuthListener(
  sessionCallback: (session: Session | null) => void,
  userCallback: (user: SupabaseUser | null) => void
) {
  return supabase.auth.onAuthStateChange((event, currentSession) => {
    console.log("Auth state changed:", event, currentSession?.user?.id);
    sessionCallback(currentSession);
    userCallback(currentSession?.user || null);
  });
}

export async function getCurrentSession() {
  return supabase.auth.getSession();
}
