
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AdminUser {
  id: string;
  email: string;
  wallet_address: string;
  balance: number;
}

interface AdminAuthContextType {
  adminUser: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

interface AdminAuthProviderProps {
  children: ReactNode;
}

export const AdminAuthProvider: React.FC<AdminAuthProviderProps> = ({ children }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if admin is already logged in
    const adminData = localStorage.getItem('adminUser');
    if (adminData) {
      try {
        setAdminUser(JSON.parse(adminData));
      } catch (error) {
        console.error('Error parsing admin data:', error);
        localStorage.removeItem('adminUser');
      }
    }
    setIsLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      // This is a simplified admin login - in production, you'd want proper authentication
      const { data, error } = await supabase.rpc('get_admin_session', {
        admin_email: email,
        admin_password: password
      });

      if (error) throw error;

      if (data && !data.error) {
        const adminUserData = {
          id: data.id,
          email: data.email,
          wallet_address: data.wallet_address,
          balance: data.balance
        };
        
        setAdminUser(adminUserData);
        localStorage.setItem('adminUser', JSON.stringify(adminUserData));

        toast.success({
          title: "Welcome back, Admin!",
          description: "You have successfully signed in to the admin panel.",
        });
      } else {
        throw new Error(data.error || 'Invalid admin credentials');
      }
    } catch (error: any) {
      toast.error({
        title: "Admin sign in failed",
        description: error.message || "Invalid admin credentials.",
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setAdminUser(null);
      localStorage.removeItem('adminUser');

      toast.success({
        title: "Signed out successfully",
        description: "You have been logged out of the admin panel.",
      });
    } catch (error: any) {
      toast.error({
        title: "Sign out failed",
        description: error.message || "An error occurred during sign out.",
      });
    }
  };

  const value = {
    adminUser,
    isAuthenticated: !!adminUser,
    isLoading,
    signIn,
    signOut,
  };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
};
