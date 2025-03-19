
import { useState, useEffect } from "react";
import { ArrowLeft, Clock, TrendingUp, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";

const Stake = () => {
  const { isAuthenticated, user } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

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
              Stake GCoins
            </h1>
            <p className={`text-gray-500 transition-all duration-500 delay-100 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
              Earn up to 60% APY by staking your GCoins
            </p>
          </div>
          
          <div className={`bg-white rounded-xl shadow-sm p-6 transition-all duration-500 delay-200 transform ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="bg-blue-50 p-3 rounded-full mb-4">
                <TrendingUp className="h-10 w-10 text-blue-500" />
              </div>
              
              <h2 className="text-xl font-semibold mb-2">Coming Soon</h2>
              <p className="text-gray-500 mb-8 max-w-xs">
                We're developing our staking platform. Soon you'll be able to stake your GCoins and earn up to 60% APY depending on the lock period.
              </p>
              
              <div className="w-full grid grid-cols-2 gap-4 mb-8">
                <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center">
                  <Calendar className="h-6 w-6 text-gray-500 mb-2" />
                  <h3 className="font-medium text-sm mb-1">Lock Period</h3>
                  <p className="text-xs text-gray-500">30-1000 days</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center">
                  <TrendingUp className="h-6 w-6 text-gray-500 mb-2" />
                  <h3 className="font-medium text-sm mb-1">Potential APY</h3>
                  <p className="text-xs text-gray-500">Up to 60%</p>
                </div>
              </div>
              
              <div className="w-full bg-blue-50 rounded-lg p-4 mb-8">
                <h3 className="font-medium mb-2 text-blue-700">How staking will work:</h3>
                <ol className="text-sm text-left space-y-2 list-decimal pl-5 text-blue-700">
                  <li>Choose how many GCoins you want to stake</li>
                  <li>Select your preferred lock period (30-1000 days)</li>
                  <li>The longer you stake, the higher your returns</li>
                  <li>Earn daily rewards that compound over time</li>
                  <li>Withdraw your initial stake plus earnings after the lock period</li>
                </ol>
              </div>
              
              <div className="flex items-center text-sm text-yellow-600 mb-6">
                <Clock className="h-4 w-4 mr-2" />
                <span>Feature launching soon. Stay tuned!</span>
              </div>
              
              <Link to="/dashboard" className="mt-2">
                <Button>Return to Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Stake;
