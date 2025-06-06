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
  ChevronRight,
  CircleDollarSign,
  RefreshCw,
  BarChart2,
  Coins
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAdminAuth } from "@/context/AdminAuthContext";

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [collapsed, setCollapsed] = useState(false);
  const { adminLogout } = useAdminAuth();

  const handleLogout = async () => {
    try {
      await adminLogout();
      navigate('/admin');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const navItems = [
    { 
      label: "Dashboard", 
      icon: <Home className="h-5 w-5" />,
      path: "/admin/dashboard" 
    },
    { 
      label: "Users", 
      icon: <Users className="h-5 w-5" />,
      path: "/admin/users" 
    },
    { 
      label: "Transactions", 
      icon: <Activity className="h-5 w-5" />,
      path: "/admin/transactions" 
    },
    { 
      label: "Staking", 
      icon: <TrendingUp className="h-5 w-5 text-green-400" />,
      path: "/admin/staking" 
    },
    { 
      label: "Exchange", 
      icon: <RefreshCw className="h-5 w-5 text-blue-400" />,
      path: "/admin/exchange" 
    },
    { 
      label: "GCoin Supply", 
      icon: <CircleDollarSign className="h-5 w-5 text-amber-400" />,
      path: "/admin/supply" 
    },
    { 
      label: "Reports", 
      icon: <FileText className="h-5 w-5" />,
      path: "/admin/reports" 
    },
    { 
      label: "Database", 
      icon: <Database className="h-5 w-5" />,
      path: "/admin/database" 
    },
    { 
      label: "Settings", 
      icon: <Settings className="h-5 w-5" />,
      path: "/admin/settings" 
    }
  ];

  // Determine if current path matches a nav item
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <div className={cn(
      "h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col transition-all duration-300 shadow-lg",
      collapsed ? "w-20" : "w-64"
    )}>
      {/* Logo & Title */}
      <div className={cn(
        "flex items-center px-6 py-6 border-b border-gray-700/50",
        collapsed && "justify-center px-3"
      )}>
        <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-2 rounded-lg shadow-inner">
          <Shield className="h-6 w-6 text-white" />
        </div>
        {!collapsed && <h1 className="ml-3 font-bold text-xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">GWallet Admin</h1>}
      </div>
      
      {/* Navigation links */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.label}>
              <Link 
                to={item.path} 
                className={cn(
                  "flex items-center px-3 py-2.5 rounded-md transition-all duration-200 group",
                  isActive(item.path) 
                    ? "bg-gradient-to-r from-indigo-700/40 to-purple-700/40 text-white shadow-md" 
                    : "text-gray-300 hover:bg-gray-800/50",
                  collapsed && "justify-center px-2"
                )}
              >
                <div className={cn(
                  "flex items-center justify-center",
                  isActive(item.path) && "text-white"
                )}>
                  {item.icon}
                </div>
                {!collapsed && (
                  <span className={cn(
                    "ml-3 text-sm font-medium transition-all",
                    isActive(item.path) && "translate-x-1"
                  )}>
                    {item.label}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* Toggle sidebar collapse button */}
      <div className="px-3 py-2 border-t border-b border-gray-700/50">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-center text-gray-400 hover:text-white hover:bg-gray-700/50"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed 
            ? <ChevronRight className="h-5 w-5 text-gray-300" /> 
            : <ChevronLeft className="h-5 w-5 text-gray-300" />
          }
        </Button>
      </div>
      
      {/* Logout */}
      <div className={cn(
        "px-6 py-4 border-t border-gray-700/50", 
        collapsed && "px-3"
      )}>
        <Button 
          variant="outline" 
          className={cn(
            "w-full text-white border-gray-600 bg-gradient-to-r from-red-800/20 to-red-600/20 hover:bg-red-800/30 hover:text-white",
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
