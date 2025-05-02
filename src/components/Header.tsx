
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { 
  Menu, 
  X, 
  Bell, 
  Settings, 
  LogOut, 
  User, 
  Home, 
  History, 
  SendHorizontal, 
  DollarSign, 
  Repeat, 
  UserCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Send', path: '/send', icon: SendHorizontal },
    { name: 'Transactions', path: '/transactions', icon: History },
    { name: 'Buy/Sell', path: '/buy', icon: DollarSign, submenu: [
      { name: 'Buy GCoins', path: '/buy' },
      { name: 'Sell GCoins', path: '/sell' }
    ]},
    { name: 'Stake', path: '/stake', icon: DollarSign },
    { name: 'Exchange', path: '/exchange', icon: Repeat },
  ];

  // Close mobile menu when location changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 md:px-6",
        scrolled ? "bg-white/80 backdrop-blur-md shadow-sm dark:bg-gray-900/80" : "bg-transparent"
      )}
    >
      <div className="max-w-screen-xl mx-auto flex items-center justify-between h-16">
        <Link 
          to="/" 
          className="flex items-center space-x-2 font-bold text-xl text-gcoin-blue"
        >
          <div className="h-8 w-8 rounded-full bg-gcoin-blue flex items-center justify-center">
            <span className="text-white font-bold">G</span>
          </div>
          <span>Gcoin</span>
        </Link>

        {/* Desktop Navigation */}
        {isAuthenticated && (
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              // Handle dropdown navigation
              if (link.submenu) {
                return (
                  <DropdownMenu key={link.name}>
                    <DropdownMenuTrigger asChild>
                      <button
                        className={cn(
                          "px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center",
                          link.submenu.some(item => location.pathname === item.path)
                            ? "bg-gcoin-blue/10 text-gcoin-blue"
                            : "text-gray-700 hover:bg-gray-100"
                        )}
                      >
                        <Icon className="h-4 w-4 mr-1" />
                        <span>{link.name}</span>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      {link.submenu.map((item) => (
                        <DropdownMenuItem key={item.name} asChild>
                          <Link 
                            to={item.path}
                            className={cn(
                              "w-full",
                              location.pathname === item.path && "font-medium text-gcoin-blue"
                            )}
                          >
                            {item.name}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              }
              
              // Regular nav link
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    location.pathname === link.path
                      ? "bg-gcoin-blue/10 text-gcoin-blue"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                  )}
                >
                  <div className="flex items-center space-x-1">
                    <Icon className="h-4 w-4" />
                    <span>{link.name}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        )}

        <div className="flex items-center">
          {isAuthenticated ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="mr-2"
                    aria-label="Notifications"
                  >
                    <Bell className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="py-6 text-center text-sm text-gray-500">
                    No new notifications
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    className="rounded-full h-8 w-8 p-0 overflow-hidden"
                    size="icon"
                    variant="secondary"
                  >
                    <span className="sr-only">Open user menu</span>
                    <span className="font-semibold text-sm">
                      {user?.username.charAt(0).toUpperCase()}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col">
                      <p className="text-sm font-medium">{user?.username}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer flex items-center">
                      <UserCircle className="mr-2 h-4 w-4" />
                      <span>My Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="cursor-pointer flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-500" onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="hidden md:flex items-center space-x-2">
              <Link to="/login">
                <Button variant="ghost">Log in</Button>
              </Link>
              <Link to="/register">
                <Button>Register</Button>
              </Link>
            </div>
          )}

          {/* Mobile menu */}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Menu">
                  {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[80%]">
                <div className="flex flex-col h-full py-6">
                  <div className="flex items-center justify-between mb-8">
                    <Link to="/" className="flex items-center space-x-2 font-bold text-xl">
                      <div className="h-8 w-8 rounded-full bg-gcoin-blue flex items-center justify-center">
                        <span className="text-white font-bold">G</span>
                      </div>
                      <span>Gcoin</span>
                    </Link>
                  </div>

                  {isAuthenticated ? (
                    <div className="space-y-6 flex flex-col h-full">
                      <div className="space-y-1">
                        {navLinks.map((link) => {
                          const Icon = link.icon;

                          // Handle submenu
                          if (link.submenu) {
                            return (
                              <div key={link.name} className="mb-2">
                                <div className="flex items-center px-4 py-2 text-base font-medium">
                                  <Icon className="h-5 w-5 mr-3" />
                                  {link.name}
                                </div>
                                <div className="pl-12 space-y-1">
                                  {link.submenu.map((item) => (
                                    <Link
                                      key={item.path}
                                      to={item.path}
                                      className={cn(
                                        "block px-4 py-2 text-sm rounded-md",
                                        location.pathname === item.path
                                          ? "bg-gcoin-blue/10 text-gcoin-blue font-medium"
                                          : "text-gray-700 hover:bg-gray-100"
                                      )}
                                    >
                                      {item.name}
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            );
                          }

                          // Regular link
                          return (
                            <Link
                              key={link.path}
                              to={link.path}
                              className={cn(
                                "flex items-center px-4 py-3 text-base rounded-md",
                                location.pathname === link.path
                                  ? "bg-gcoin-blue/10 text-gcoin-blue font-medium"
                                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                              )}
                            >
                              <Icon className="h-5 w-5 mr-3" />
                              {link.name}
                            </Link>
                          );
                        })}
                      </div>
                      
                      <div className="space-y-1 mt-6">
                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                          Account
                        </div>
                        <Link 
                          to="/profile" 
                          className="flex items-center px-4 py-3 text-base rounded-md text-gray-700 hover:bg-gray-100"
                        >
                          <User className="h-5 w-5 mr-3" />
                          Profile
                        </Link>
                        <Link 
                          to="/settings" 
                          className="flex items-center px-4 py-3 text-base rounded-md text-gray-700 hover:bg-gray-100"
                        >
                          <Settings className="h-5 w-5 mr-3" />
                          Settings
                        </Link>
                      </div>
                      
                      <div className="mt-auto">
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 px-4"
                          onClick={logout}
                        >
                          <LogOut className="mr-3 h-5 w-5" />
                          Logout
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Link to="/login" className="block">
                        <Button className="w-full" variant="outline">Log in</Button>
                      </Link>
                      <Link to="/register" className="block">
                        <Button className="w-full">Register</Button>
                      </Link>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
