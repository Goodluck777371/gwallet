
import { useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const AdminLayout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { adminUser, adminIsLoading } = useAdminAuth();

  useEffect(() => {
    // Check if admin is authenticated
    if (!adminIsLoading && !adminUser) {
      toast({
        title: "Access Denied",
        description: "You must login as an administrator to access this page.",
        variant: "destructive"
      });
      navigate('/admin');
    }
  }, [navigate, toast, adminUser, adminIsLoading]);

  if (adminIsLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <Loader2 className="h-16 w-16 animate-spin mx-auto text-purple-500 mb-4" />
          <p className="text-lg font-medium text-gray-700">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  // If not admin and not loading, the useEffect above will redirect
  if (!adminUser) return null;

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
