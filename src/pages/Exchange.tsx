
import { useState, useEffect } from "react";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";

const Exchange = () => {
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
              Exchange GCoins
            </h1>
            <p className={`text-gray-500 transition-all duration-500 delay-100 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
              Convert GCoins to other currencies or cryptocurrencies
            </p>
          </div>
          
          <div className={`bg-white rounded-xl shadow-sm p-6 transition-all duration-500 delay-200 transform ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="bg-yellow-50 p-3 rounded-full mb-4">
                <AlertTriangle className="h-10 w-10 text-yellow-500" />
              </div>
              
              <h2 className="text-xl font-semibold mb-2">Coming Soon</h2>
              <p className="text-gray-500 mb-8 max-w-xs">
                We're working hard to bring you exchange functionality. This feature will allow you to convert GCoins to various currencies and cryptocurrencies.
              </p>
              
              <div className="w-full max-w-xs bg-gray-100 rounded-lg p-4">
                <h3 className="font-medium mb-2">Features to expect:</h3>
                <ul className="text-sm text-left space-y-2">
                  <li className="flex items-start">
                    <span className="h-5 w-5 text-yellow-500 mr-2">•</span>
                    <span>Exchange GCoins to local currencies</span>
                  </li>
                  <li className="flex items-start">
                    <span className="h-5 w-5 text-yellow-500 mr-2">•</span>
                    <span>Exchange GCoins to cryptocurrencies</span>
                  </li>
                  <li className="flex items-start">
                    <span className="h-5 w-5 text-yellow-500 mr-2">•</span>
                    <span>Competitive exchange rates</span>
                  </li>
                  <li className="flex items-start">
                    <span className="h-5 w-5 text-yellow-500 mr-2">•</span>
                    <span>Fast and secure transactions</span>
                  </li>
                </ul>
              </div>
              
              <Link to="/dashboard" className="mt-8">
                <Button>Return to Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Exchange;
