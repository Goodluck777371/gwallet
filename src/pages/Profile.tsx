
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [creationDate, setCreationDate] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Fetch user creation date
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('created_at')
          .eq('id', user.id)
          .single();
        
        if (data) {
          setCreationDate(new Date(data.created_at).toLocaleDateString());
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    
    fetchUserData();
  }, [user?.id]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-20 pb-16 px-4">
        <div className="max-w-md mx-auto">
          <div className="mb-8">
            <Link to="/dashboard" className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-4">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </Link>
            
            <h1 className={`text-3xl font-bold mb-2 transition-all duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
              Profile
            </h1>
            <p className={`text-gray-500 transition-all duration-500 delay-100 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
              Your account information
            </p>
          </div>
          
          <div className={`bg-white rounded-xl shadow-sm p-6 transition-all duration-500 delay-200 transform ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="space-y-6">
              <div className="flex items-center justify-center mb-6">
                <div className="relative">
                  <div className="h-24 w-24 rounded-full bg-gradient-to-r from-gcoin-blue to-gcoin-yellow flex items-center justify-center text-white text-2xl font-bold">
                    {user?.username?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Username</h3>
                <p className="font-semibold">{user?.username || 'No username set'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Email</h3>
                <p className="font-semibold">{user?.email || 'No email set'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Wallet Address</h3>
                <p className="font-semibold font-mono text-sm bg-gray-50 p-2 rounded">{user?.wallet_address || 'No wallet address'}</p>
              </div>
              
              {creationDate && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Member Since</h3>
                  <p className="font-semibold">{creationDate}</p>
                </div>
              )}
              
              <div className="pt-4">
                <Link to="/settings">
                  <button className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gcoin-blue hover:bg-gcoin-blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gcoin-blue">
                    Edit Profile Settings
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
