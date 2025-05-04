
import { useNavigate, Link } from "react-router-dom";
import { 
  Home, 
  Users, 
  Database, 
  Settings, 
  LogOut, 
  Activity,
  FileText,
  TrendingUp,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const AdminSidebar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = () => {
    // Clear admin auth from session storage
    sessionStorage.removeItem('gwallet_admin_auth');
    toast({
      title: "Logged Out",
      description: "You have been logged out of the administrator panel.",
    });
    
    // Redirect to admin login
    navigate('/Noadminneeded');
  };

  const navItems = [
    { 
      label: "Dashboard", 
      icon: <Home className="h-5 w-5" />,
      path: "/Noadminneeded/dashboard" 
    },
    { 
      label: "Users", 
      icon: <Users className="h-5 w-5" />,
      path: "/Noadminneeded/users" 
    },
    { 
      label: "Transactions", 
      icon: <Activity className="h-5 w-5" />,
      path: "/Noadminneeded/transactions" 
    },
    { 
      label: "Staking", 
      icon: <TrendingUp className="h-5 w-5" />,
      path: "/Noadminneeded/staking" 
    },
    { 
      label: "Reports", 
      icon: <FileText className="h-5 w-5" />,
      path: "/Noadminneeded/reports" 
    },
    { 
      label: "Database", 
      icon: <Database className="h-5 w-5" />,
      path: "/Noadminneeded/database" 
    },
    { 
      label: "Settings", 
      icon: <Settings className="h-5 w-5" />,
      path: "/Noadminneeded/settings" 
    }
  ];

  return (
    <div className="h-screen w-64 bg-gray-900 text-white flex flex-col">
      {/* Logo & Title */}
      <div className="flex items-center px-6 py-6 border-b border-gray-800">
        <div className="bg-white p-1 rounded">
          <Shield className="h-6 w-6 text-gray-900" />
        </div>
        <h1 className="ml-3 font-bold text-xl">GWallet Admin</h1>
      </div>
      
      {/* Navigation links */}
      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.label}>
              <Link 
                to={item.path} 
                className="flex items-center px-3 py-2 rounded-md hover:bg-gray-800 transition-colors"
              >
                {item.icon}
                <span className="ml-3">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* Logout */}
      <div className="px-6 py-4 border-t border-gray-800">
        <Button 
          variant="outline" 
          className="w-full justify-start text-white border-gray-700 hover:bg-gray-800 hover:text-white"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 mr-3" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default AdminSidebar;
