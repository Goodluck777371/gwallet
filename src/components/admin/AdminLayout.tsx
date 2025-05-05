
import { useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import { useToast } from "@/hooks/use-toast";

const AdminLayout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if admin is authenticated
    const isAdminAuth = sessionStorage.getItem('gwallet_admin_auth') === 'true';
    
    if (!isAdminAuth) {
      toast({
        title: "Access Denied",
        description: "You must login as an administrator to access this page.",
        variant: "destructive"
      });
      navigate('/Noadminneeded');
    }
  }, [navigate, toast]);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <AdminSidebar />
      <main className="flex-1 overflow-auto p-0">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
