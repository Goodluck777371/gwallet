import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, ChevronDown, LogOut, User, Settings, DollarSign, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [mobileMenuOpen]);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const getFallbackInitials = () => {
    if (!user?.username) return "U";
    return user.username.charAt(0).toUpperCase();
  };

  const navLinks = [
    { title: "Home", path: "/", public: true },
    { title: "Dashboard", path: "/dashboard", protected: true },
    { title: "Send", path: "/send", protected: true },
    { title: "Transactions", path: "/transactions", protected: true },
    { title: "Buy/Sell", path: "/buy-sell", protected: true },
    { title: "Exchange", path: "/exchange", protected: true },
  ];

  const profileNavItems = [
    {
      label: "Profile",
      icon: User,
      onClick: () => navigate("/profile"),
    },
    {
      label: "Settings",
      icon: Settings,
      onClick: () => navigate("/settings"),
    },
    {
      label: "Buy/Sell",
      icon: DollarSign,
      onClick: () => navigate("/buy-sell"),
    },
    {
      label: "Exchange",
      icon: BarChart3,
      onClick: () => navigate("/exchange"),
    },
  ];

  // Filter out links based on auth status
  const filteredLinks = navLinks.filter((link) => {
    if (isAuthenticated) {
      return link.public || link.protected;
    }
    return link.public && !link.protected;
  });

  return (
    <>
      {/* Desktop Header */}
      <header
        className={cn(
          "fixed top-0 w-full z-40 transition-all duration-200",
          isScrolled ? "bg-white shadow-sm" : "bg-white/0"
        )}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 font-bold text-xl text-gcoin-blue">
              <div className="h-8 w-8 rounded-full bg-gcoin-blue flex items-center justify-center">
                <span className="text-white font-bold">G</span>
              </div>
              <span>Gcoin</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-6">
              {filteredLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-gcoin-blue",
                    location.pathname === link.path
                      ? "text-gcoin-blue"
                      : "text-gray-600"
                  )}
                >
                  {link.title}
                </Link>
              ))}
            </div>

            {/* Auth Buttons / User Menu */}
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 rounded-full"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-gcoin-blue text-white">
                          {getFallbackInitials()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user?.username || "User"}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email || ""}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      {profileNavItems.map((item, index) => (
                        <DropdownMenuItem
                          key={index}
                          className="cursor-pointer"
                          onClick={item.onClick}
                        >
                          <item.icon className="mr-2 h-4 w-4" />
                          <span>{item.label}</span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer text-red-600 focus:text-red-600"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="hidden md:flex space-x-2">
                  <Link to="/login">
                    <Button variant="ghost" size="sm">Log in</Button>
                  </Link>
                  <Link to="/register">
                    <Button size="sm">Register</Button>
                  </Link>
                </div>
              )}

              {/* Mobile menu button */}
              <div className="md:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 text-gray-600"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      {isMobile && (
        <div
          className={cn(
            "fixed inset-0 z-30 bg-white transform transition-transform duration-300 ease-in-out pt-16",
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          <div className="flex flex-col p-6 space-y-6">
            {/* Mobile Nav Links */}
            {filteredLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "text-lg font-medium transition-colors hover:text-gcoin-blue py-2",
                  location.pathname === link.path
                    ? "text-gcoin-blue"
                    : "text-gray-600"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.title}
              </Link>
            ))}

            {/* Mobile Auth Buttons */}
            {!isAuthenticated ? (
              <div className="flex flex-col space-y-3 mt-6">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Log in
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full">Register</Button>
                </Link>
              </div>
            ) : (
              <div className="border-t border-gray-100 pt-6 mt-6">
                <div className="flex items-center mb-6">
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarFallback className="bg-gcoin-blue text-white">
                      {getFallbackInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user?.username || "User"}</p>
                    <p className="text-sm text-gray-500">{user?.email || ""}</p>
                  </div>
                </div>

                {/* Mobile Profile Menu */}
                <div className="space-y-3">
                  {profileNavItems.map((item, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className="w-full justify-start text-gray-600 hover:text-gcoin-blue hover:bg-gray-50"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        item.onClick();
                      }}
                    >
                      <item.icon className="mr-3 h-4 w-4" />
                      <span>{item.label}</span>
                    </Button>
                  ))}

                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    <span>Log out</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
