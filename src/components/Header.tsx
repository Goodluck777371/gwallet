
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { Menu, X, Bell, Settings, LogOut, User, Home, History, SendHorizontal, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const Header = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

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
    { name: 'Exchange', path: '/exchange', icon: DollarSign },
  ];

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
              <Button
                variant="ghost"
                size="icon"
                className="mr-2"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
              </Button>
              
              <Sheet>
                <SheetTrigger asChild>
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
                </SheetTrigger>
                <SheetContent className="w-[300px] sm:w-[400px]">
                  <div className="px-4 py-8 space-y-6">
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 rounded-full bg-gcoin-blue flex items-center justify-center text-white text-lg font-semibold">
                        {user?.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold">{user?.username}</h3>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <Link to="/profile">
                        <Button variant="ghost" className="w-full justify-start" size="sm">
                          <User className="mr-2 h-4 w-4" />
                          Profile
                        </Button>
                      </Link>
                      <Link to="/settings">
                        <Button variant="ghost" className="w-full justify-start" size="sm">
                          <Settings className="mr-2 h-4 w-4" />
                          Settings
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                        size="sm"
                        onClick={logout}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
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
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Menu">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
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
