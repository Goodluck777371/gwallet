
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings, User, Mail, LogOut } from "lucide-react";

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  const getFallbackInitials = () => {
    if (!user?.username) return "U";
    return user.username.substring(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-20 pb-16 px-4">
        <div className="max-w-lg mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Profile</h1>
            <p className="text-gray-500">View and manage your profile</p>
          </div>
          
          <Card className={`transition-all duration-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <CardHeader className="flex flex-col items-center pb-6">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarFallback className="text-xl bg-gcoin-blue text-white">
                  {getFallbackInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <CardTitle className="text-2xl">{user?.username || 'User'}</CardTitle>
                <CardDescription>{user?.email || 'No email provided'}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center p-3 bg-gray-50 rounded-md">
                <User className="text-gray-500 mr-3 h-5 w-5" />
                <div>
                  <div className="text-sm font-medium">Username</div>
                  <div>{user?.username || 'Not set'}</div>
                </div>
              </div>
              <div className="flex items-center p-3 bg-gray-50 rounded-md">
                <Mail className="text-gray-500 mr-3 h-5 w-5" />
                <div>
                  <div className="text-sm font-medium">Email</div>
                  <div>{user?.email || 'Not set'}</div>
                </div>
              </div>
              <div className="flex items-center p-3 bg-gray-50 rounded-md">
                <div className="h-5 w-5 rounded-full bg-gcoin-blue flex items-center justify-center text-white mr-3">
                  <span className="text-xs font-bold">G</span>
                </div>
                <div>
                  <div className="text-sm font-medium">Wallet ID</div>
                  <div className="font-mono text-sm">
                    {user?.wallet_address ? 
                      `${user.wallet_address.substring(0, 8)}...${user.wallet_address.substring(user.wallet_address.length - 8)}` : 
                      'Not available'}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-3">
              <Button 
                variant="outline" 
                className="w-full flex justify-center" 
                onClick={() => navigate('/settings')}
              >
                <Settings className="mr-2 h-4 w-4" /> 
                Account Settings
              </Button>
              <Button 
                variant="destructive" 
                className="w-full flex justify-center" 
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" /> 
                Sign Out
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Profile;
