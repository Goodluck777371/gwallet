
import { useState, useEffect } from "react";
import { ArrowLeft, Gift } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Airdrop = () => {
  const { isAuthenticated, user } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isClaimingAirdrop, setIsClaimingAirdrop] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleClaimAirdrop = async () => {
    setIsClaimingAirdrop(true);
    
    try {
      // Simulate airdrop claim
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Airdrop Claimed! 🎉",
        description: "You have successfully claimed your GCoins airdrop!",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Airdrop Failed",
        description: "Unable to claim airdrop at this time. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsClaimingAirdrop(false);
    }
  };

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
              GCoin Airdrop
            </h1>
            <p className={`text-gray-500 transition-all duration-500 delay-100 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
              Claim your free GCoins
            </p>
          </div>
          
          <div className={`transition-all duration-500 delay-200 transform ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                  <Gift className="h-8 w-8 text-white" />
                </div>
                <CardTitle>Welcome Bonus Airdrop</CardTitle>
                <CardDescription>
                  Claim your welcome bonus of 1000 GCoins
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">1,000</div>
                    <div className="text-sm text-gray-600">GCoins Available</div>
                  </div>
                </div>
                
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    No fees or charges
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    Instant delivery to your wallet
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    One-time welcome bonus
                  </div>
                </div>

                <Button
                  onClick={handleClaimAirdrop}
                  disabled={isClaimingAirdrop || !isAuthenticated}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  {isClaimingAirdrop ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Claiming...
                    </>
                  ) : (
                    <>
                      <Gift className="mr-2 h-4 w-4" />
                      Claim Airdrop
                    </>
                  )}
                </Button>

                {!isAuthenticated && (
                  <p className="text-center text-sm text-gray-500">
                    Please login to claim your airdrop
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Airdrop;
