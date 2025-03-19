
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  ArrowLeftRight, 
  SendHorizontal, 
  History, 
  BarChart3,
  Timer,
  Coins,
  Users,
  Menu,
  X,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const mainNavItems = [
    { icon: Home, label: 'Dashboard', href: '/dashboard', color: 'text-blue-500' },
    { icon: SendHorizontal, label: 'Send', href: '/send', color: 'text-green-500' },
    { icon: History, label: 'Transactions', href: '/transactions', color: 'text-purple-500' },
  ];

  const featureNavItems = [
    { icon: ArrowLeftRight, label: 'Exchange', href: '/exchange', color: 'text-orange-500' },
    { icon: BarChart3, label: 'Price Chart', href: '/price-chart', color: 'text-cyan-500' },
    { icon: Timer, label: 'Stake', href: '/stake', color: 'text-red-500' },
    { icon: Coins, label: 'Convert', href: '/convert', color: 'text-yellow-500' },
    { icon: Users, label: 'P2P Trading', href: '/p2p', color: 'text-emerald-500' },
    { icon: BookOpen, label: 'Blog', href: '/blog', color: 'text-indigo-500' },
  ];

  const adminNavItems = [
    { icon: Users, label: 'Admin Dashboard', href: '/admin', color: 'text-gray-500' },
  ];

  // Only show the sidebar if authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      {/* Mobile Trigger */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-4 z-50 md:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Backdrop for mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed top-0 left-0 z-40 h-full bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col",
          collapsed ? "w-16" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          className
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-gcoin-blue flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold">G</span>
            </div>
            {!collapsed && <span className="font-bold text-lg">Gcoin</span>}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex"
            onClick={() => setCollapsed(!collapsed)}
          >
            <ChevronRight className={cn("h-5 w-5 transition-transform", collapsed ? "rotate-180" : "")} />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <nav className="px-2 space-y-6">
            <div>
              <div className={cn("px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase", collapsed && "sr-only")}>
                Main
              </div>
              <ul className="space-y-1">
                {mainNavItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      className={cn(
                        "flex items-center space-x-2 px-3 py-2 rounded-md transition-colors",
                        location.pathname === item.href
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/50",
                        collapsed && "justify-center"
                      )}
                      onClick={() => setMobileOpen(false)}
                    >
                      <item.icon className={cn("h-5 w-5", item.color)} />
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className={cn("px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase", collapsed && "sr-only")}>
                Features
              </div>
              <ul className="space-y-1">
                {featureNavItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      className={cn(
                        "flex items-center space-x-2 px-3 py-2 rounded-md transition-colors",
                        location.pathname === item.href
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/50",
                        collapsed && "justify-center"
                      )}
                      onClick={() => setMobileOpen(false)}
                    >
                      <item.icon className={cn("h-5 w-5", item.color)} />
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className={cn("px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase", collapsed && "sr-only")}>
                Admin
              </div>
              <ul className="space-y-1">
                {adminNavItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      className={cn(
                        "flex items-center space-x-2 px-3 py-2 rounded-md transition-colors",
                        location.pathname === item.href
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/50",
                        collapsed && "justify-center"
                      )}
                      onClick={() => setMobileOpen(false)}
                    >
                      <item.icon className={cn("h-5 w-5", item.color)} />
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </div>

        <div className="p-4 border-t border-sidebar-border">
          <Link
            to="/settings"
            className={cn(
              "flex items-center space-x-2 px-3 py-2 rounded-md transition-colors",
              location.pathname === "/settings"
                ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50",
              collapsed && "justify-center"
            )}
            onClick={() => setMobileOpen(false)}
          >
            <BarChart3 className="h-5 w-5 text-gray-500" />
            {!collapsed && <span>Settings</span>}
          </Link>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
