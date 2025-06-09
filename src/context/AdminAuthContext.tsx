
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

type AdminUser = {
  id: string;
  email: string;
  wallet_address: string;
  is_admin: boolean;
};

interface AdminAuthContextProps {
  adminUser: AdminUser | null;
  adminIsLoading: boolean;
  adminLogin: (email: string, password: string) => Promise<void>;
  adminLogout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextProps | undefined>(undefined);

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [adminIsLoading, setAdminIsLoading] = useState(true);

  useEffect(() => {
    const storedSession = sessionStorage.getItem('gwallet_admin_session');
    if (storedSession) {
      try {
        const parsedSession = JSON.parse(storedSession);
        setAdminUser(parsedSession);
      } catch (error) {
        console.error('Error parsing admin session:', error);
        sessionStorage.removeItem('gwallet_admin_session');
      }
    }
    setAdminIsLoading(false);
  }, []);

  const adminLogin = async (email: string, password: string) => {
    try {
      setAdminIsLoading(true);
      
      console.log('Attempting admin login with:', { email });
      
      // Try to authenticate with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });
      
      if (authError) {
        console.error('Auth error:', authError);
        throw authError;
      }
      
      console.log('Auth successful, checking admin status...');
      
      // Check if user is admin
      const { data: adminData, error: adminError } = await supabase
        .from('admin_accounts')
        .select('*')
        .eq('email', email.trim())
        .single();
      
      if (adminError || !adminData) {
        console.error('Admin check failed:', adminError);
        await supabase.auth.signOut();
        throw new Error('Not authorized as admin');
      }
      
      console.log('Admin status confirmed');
      
      // Get user profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('wallet_address')
        .eq('id', authData.user.id)
        .single();
      
      if (profileError) {
        console.error('Profile fetch failed:', profileError);
        throw profileError;
      }
      
      const adminUserData = {
        id: authData.user.id,
        email: authData.user.email || email,
        wallet_address: profileData.wallet_address,
        is_admin: true
      };
      
      setAdminUser(adminUserData);
      sessionStorage.setItem('gwallet_admin_auth', 'true');
      sessionStorage.setItem('gwallet_admin_session', JSON.stringify(adminUserData));
      
      toast({
        title: 'Access Granted',
        description: 'Welcome to the admin dashboard'
      });
    } catch (error: any) {
      console.error('Admin login error:', error);
      let errorMessage = 'Invalid credentials or not authorized as admin';
      
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password';
      } else if (error.message?.includes('Not authorized')) {
        errorMessage = 'You are not authorized to access the admin panel';
      }
      
      toast({
        title: 'Access Denied',
        description: errorMessage,
        variant: 'destructive'
      });
      throw error;
    } finally {
      setAdminIsLoading(false);
    }
  };

  const adminLogout = async () => {
    try {
      setAdminIsLoading(true);
      
      await supabase.auth.signOut();
      
      setAdminUser(null);
      sessionStorage.removeItem('gwallet_admin_auth');
      sessionStorage.removeItem('gwallet_admin_session');
      
      toast({
        title: 'Logged Out',
        description: 'You have been logged out of the admin panel'
      });
    } catch (error: any) {
      console.error('Admin logout error:', error);
      toast({
        title: 'Logout Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setAdminIsLoading(false);
    }
  };

  const contextValue: AdminAuthContextProps = {
    adminUser,
    adminIsLoading,
    adminLogin,
    adminLogout
  };

  return (
    <AdminAuthContext.Provider value={contextValue}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
