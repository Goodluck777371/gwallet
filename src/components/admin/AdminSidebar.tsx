
import { useNavigate, Link, useLocation } from "react-router-dom";
import { 
  Home, 
  Users, 
  Database, 
  Settings, 
  LogOut, 
  Activity,
  FileText,
  TrendingUp,
  Shield,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { cn } from "@/lib/utils";

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [collapsed, setCollapsed] = useState(false);

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

  // Determine if current path matches a nav item
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <div className={cn(
      "h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col transition-all duration-300",
      collapsed ? "w-20" : "w-64"
    )}>
      {/* Logo & Title */}
      <div className={cn(
        "flex items-center px-6 py-6 border-b border-gray-700",
        collapsed && "justify-center px-3"
      )}>
        <div className="bg-white p-1 rounded">
          <Shield className="h-6 w-6 text-gray-900" />
        </div>
        {!collapsed && <h1 className="ml-3 font-bold text-xl">GWallet Admin</h1>}
      </div>
      
      {/* Navigation links */}
      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.label}>
              <Link 
                to={item.path} 
                className={cn(
                  "flex items-center px-3 py-2 rounded-md hover:bg-indigo-700/20 transition-colors",
                  isActive(item.path) ? "bg-indigo-700/30 text-white" : "text-gray-300",
                  collapsed && "justify-center px-2"
                )}
              >
                {item.icon}
                {!collapsed && <span className="ml-3">{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* Toggle sidebar collapse button */}
      <div className="px-3 py-2 border-t border-b border-gray-700">
        <Button
          variant="ghost"
          className="w-full justify-center text-gray-400 hover:text-white hover:bg-gray-700"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </div>
      
      {/* Logout */}
      <div className={cn(
        "px-6 py-4 border-t border-gray-700", 
        collapsed && "px-3"
      )}>
        <Button 
          variant="outline" 
          className={cn(
            "w-full text-white border-gray-700 hover:bg-gray-700 hover:text-white",
            collapsed ? "justify-center" : "justify-start"
          )}
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span className="ml-2">Logout</span>}
        </Button>
      </div>
    </div>
  );
};

export default AdminSidebar;
