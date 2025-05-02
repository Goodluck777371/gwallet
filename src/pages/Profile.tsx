
import { useState, useEffect } from "react";
import { ArrowLeft, Camera, User, Mail, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleUploadClick = () => {
    toast({
      title: "Coming Soon",
      description: "Profile image upload will be available soon.",
      variant: "default",
    });
  };

  // Format registration date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!user?.username) return 'U';
    return user.username.charAt(0).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-20 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <Link to="/dashboard" className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-4">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </Link>
            
            <h1 className={`text-3xl font-bold mb-2 transition-all duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
              My Profile
            </h1>
            <p className={`text-gray-500 transition-all duration-500 delay-100 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
              Manage your account settings and profile
            </p>
          </div>
          
          <div className={`transition-all duration-500 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center md:items-start md:flex-row">
                      <div className="relative mb-6 md:mb-0 md:mr-8">
                        <Avatar className="h-24 w-24">
                          <AvatarFallback className="text-xl bg-gcoin-blue text-white">
                            {getUserInitials()}
                          </AvatarFallback>
                        </Avatar>
                        <Button
                          size="icon"
                          className="h-8 w-8 rounded-full absolute bottom-0 right-0 bg-white text-gray-700 border border-gray-200 shadow-sm hover:bg-gray-100"
                          onClick={handleUploadClick}
                          title="Upload photo"
                        >
                          <Camera className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="w-full space-y-6">
                        <div className="space-y-1 text-center md:text-left">
                          <h3 className="text-2xl font-bold">{user?.username || 'User'}</h3>
                          <p className="text-gray-500">{user?.email || 'No email provided'}</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center mb-2">
                              <User className="h-4 w-4 text-gcoin-blue mr-2" />
                              <span className="text-sm font-medium">Username</span>
                            </div>
                            <p className="text-gray-700">{user?.username || 'Not set'}</p>
                          </div>
                          
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center mb-2">
                              <Mail className="h-4 w-4 text-gcoin-blue mr-2" />
                              <span className="text-sm font-medium">Email</span>
                            </div>
                            <p className="text-gray-700">{user?.email || 'Not set'}</p>
                          </div>
                          
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center mb-2">
                              <Calendar className="h-4 w-4 text-gcoin-blue mr-2" />
                              <span className="text-sm font-medium">Member Since</span>
                            </div>
                            <p className="text-gray-700">{formatDate(user?.created_at)}</p>
                          </div>
                        </div>
                        
                        <div className="pt-4 flex justify-end">
                          <Link to="/settings">
                            <Button>Edit Profile Settings</Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="security">
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-2">Account Security</h3>
                        <p className="text-gray-500 text-sm mb-4">
                          Manage your account security settings and preferences
                        </p>
                        
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <h4 className="font-medium">Password</h4>
                              <p className="text-sm text-gray-500">Last changed: Never</p>
                            </div>
                            <Link to="/settings">
                              <Button variant="outline" size="sm">Change Password</Button>
                            </Link>
                          </div>
                          
                          <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <h4 className="font-medium">Two-Factor Authentication</h4>
                              <p className="text-sm text-gray-500">Coming soon</p>
                            </div>
                            <Button variant="outline" size="sm" disabled>Enable</Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-4 flex justify-end">
                        <Link to="/settings">
                          <Button>Security Settings</Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
