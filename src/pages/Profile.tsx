
import { useState, useEffect } from "react";
import { Calendar, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { formatDate } from "@/lib/utils";
import Header from "@/components/Header";

const Profile = () => {
  const { user } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const getUserInitials = () => {
    if (!user?.username) return 'U';
    return user.username.charAt(0).toUpperCase();
  };

  // Get registration date from user metadata 
  const getRegistrationDate = () => {
    if (!user) return 'Unknown';
    
    // Use created_at if available in the user object
    if (user.created_at) {
      return formatDate(user.created_at);
    }
    
    // Use a fallback date if created_at is not available
    return formatDate(new Date().toISOString());
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-20 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className={`text-3xl font-bold mb-2 transition-all duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
              Your Profile
            </h1>
            <p className={`text-gray-500 transition-all duration-500 delay-100 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
              View and manage your account details
            </p>
          </div>
          
          <div className={`bg-white rounded-xl shadow-sm p-8 transition-all duration-500 delay-200 transform ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex items-center space-x-6 mb-6">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold text-lg uppercase">
                  {getUserInitials()}
                </div>
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
              </div>
              <div>
                <h2 className="text-xl font-semibold">{user?.username || 'Guest'}</h2>
                <p className="text-gray-500">{user?.email || 'No Email'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col">
                <div className="flex items-center text-gray-500 mb-1">
                  <User className="h-4 w-4 text-gcoin-blue mr-2" />
                  <span className="text-sm font-medium">Username</span>
                </div>
                <p className="text-gray-700">{user?.username || 'N/A'}</p>
              </div>
              
              <div className="flex flex-col">
                <div className="flex items-center text-gray-500 mb-1">
                  <Calendar className="h-4 w-4 text-gcoin-blue mr-2" />
                  <span className="text-sm font-medium">Member Since</span>
                </div>
                <p className="text-gray-700">{getRegistrationDate()}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
