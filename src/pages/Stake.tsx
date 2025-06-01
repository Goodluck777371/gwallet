
import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import StakeForm from "@/components/StakeForm";
import StakingHistory from "@/components/StakingHistory";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Stake = () => {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleStakeSuccess = () => {
    toast({
      title: "Staking Successful! 🎉",
      description: "Your GCoins have been staked successfully.",
      variant: "credit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Link to="/dashboard" className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-4">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </Link>
            
            <h1 className={`text-3xl font-bold mb-2 transition-all duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
              Stake GCoins
            </h1>
            <p className={`text-gray-500 transition-all duration-500 delay-100 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
              Earn rewards by staking your GCoins
            </p>
          </div>

          <div className={`transition-all duration-500 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <Tabs defaultValue="stake">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="stake">Stake GCoins</TabsTrigger>
                <TabsTrigger value="history">Staking History</TabsTrigger>
              </TabsList>
              
              <TabsContent value="stake" className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <StakeForm />
                </div>
              </TabsContent>
              
              <TabsContent value="history">
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <StakingHistory />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Stake;
