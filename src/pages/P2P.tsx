
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Users, ShieldCheck, AlertTriangle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

const P2P = () => {
  const { isAuthenticated } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      <Header />
      <Sidebar />
      
      <main className="pt-20 pb-16 px-4 md:ml-64">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <Link to="/dashboard" className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-4">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </Link>
            
            <h1 className={`text-3xl font-bold mb-2 text-emerald-800 transition-all duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
              P2P Trading
            </h1>
            <p className={`text-gray-600 transition-all duration-500 delay-100 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
              Buy and sell GCoin directly with other users
            </p>
          </div>
          
          <Card className={`overflow-hidden transition-all duration-500 delay-200 transform ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="h-2 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
            <CardContent className="p-0">
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <div className="relative mb-6">
                  <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full blur opacity-70 animate-pulse"></div>
                  <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center relative">
                    <Users className="h-12 w-12 text-emerald-500" />
                  </div>
                </div>
                
                <h2 className="text-2xl font-bold mb-3 text-gray-800">P2P Trading Coming Soon</h2>
                <p className="text-gray-600 mb-8 max-w-md">
                  We're building a secure platform for you to buy and sell GCoin directly with other users. 
                  This feature will be available soon with verified users and trusted wallets.
                </p>
                
                <div className="grid md:grid-cols-2 gap-6 w-full max-w-xl mb-8">
                  <div className="bg-emerald-50 p-6 rounded-lg border border-emerald-100">
                    <ShieldCheck className="h-8 w-8 text-emerald-500 mb-3" />
                    <h3 className="font-semibold mb-2">Verified Users</h3>
                    <p className="text-sm text-gray-600">
                      All P2P traders will be verified to ensure a safe trading environment.
                    </p>
                  </div>
                  
                  <div className="bg-emerald-50 p-6 rounded-lg border border-emerald-100">
                    <AlertTriangle className="h-8 w-8 text-amber-500 mb-3" />
                    <h3 className="font-semibold mb-2">Secure Transactions</h3>
                    <p className="text-sm text-gray-600">
                      Our escrow system will ensure that all trades are completed securely.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4 w-full max-w-md">
                  <p className="text-sm text-gray-500">
                    Get notified when P2P Trading is available:
                  </p>
                  <div className="flex gap-3">
                    <input 
                      type="email" 
                      placeholder="Your email address" 
                      className="flex-1 px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                    <Button className="bg-emerald-500 hover:bg-emerald-600">
                      Notify Me
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default P2P;
