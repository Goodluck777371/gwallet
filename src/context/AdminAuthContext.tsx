
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

  // Check for stored admin session on load
  useEffect(() => {
    const checkAdminSession = async () => {
      try {
        const storedSession = sessionStorage.getItem('gwallet_admin_session');
        if (storedSession) {
          const parsedSession = JSON.parse(storedSession);
          console.log('Found stored admin session for:', parsedSession.email);
          setAdminUser(parsedSession);
        }
      } catch (error) {
        console.error('Error checking admin session:', error);
        sessionStorage.removeItem('gwallet_admin_session');
        sessionStorage.removeItem('gwallet_admin_auth');
      } finally {
        setAdminIsLoading(false);
      }
    };

    checkAdminSession();
  }, []);

  const adminLogin = async (email: string, password: string) => {
    try {
      setAdminIsLoading(true);
      console.log('Attempting admin login for:', email);
      
      // Clear any existing admin session
      sessionStorage.removeItem('gwallet_admin_session');
      sessionStorage.removeItem('gwallet_admin_auth');
      
      // Use the Supabase function to authenticate admin
      const { data, error } = await supabase.rpc('get_admin_session', {
        admin_email: email,
        admin_password: password
      });
      
      if (error) {
        console.error('Admin login RPC error:', error);
        throw error;
      }
      
      if (data && data.error) {
        console.error('Admin login failed:', data.error);
        throw new Error(data.error);
      }
      
      console.log('Admin login successful for:', email);
      
      // Store the admin session
      const adminUserData = {
        ...data,
        is_admin: true
      } as AdminUser;
      
      setAdminUser(adminUserData);
      sessionStorage.setItem('gwallet_admin_auth', 'true');
      sessionStorage.setItem('gwallet_admin_session', JSON.stringify(adminUserData));
      
      toast({
        title: 'Login Successful',
        description: 'Welcome to the admin dashboard'
      });
    } catch (error: any) {
      console.error('Admin login error:', error);
      toast({
        title: 'Login Failed',
        description: error.message || 'Invalid credentials',
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
      console.log('Admin logging out');
      
      // Clear admin session
      setAdminUser(null);
      sessionStorage.removeItem('gwallet_admin_auth');
      sessionStorage.removeItem('gwallet_admin_session');
      
      // Clear any browser caches
      localStorage.clear();
      
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
