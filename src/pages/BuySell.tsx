
import { useState, useEffect } from "react";
import { ArrowRight, CreditCard, Wallet, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/Header";

const BuySell = () => {
  const { user } = useAuth();
  const [buyAmount, setBuyAmount] = useState("");
  const [sellAmount, setSellAmount] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Exchange rate (NGN per GCoin)
  const exchangeRate = 850;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const calculateNairaAmount = (gcoinAmount: string) => {
    if (!gcoinAmount || isNaN(Number(gcoinAmount))) return "";
    return (Number(gcoinAmount) * exchangeRate).toFixed(2);
  };

  const calculateGcoinAmount = (nairaAmount: string) => {
    if (!nairaAmount || isNaN(Number(nairaAmount))) return "";
    return (Number(nairaAmount) / exchangeRate).toFixed(4);
  };

  const handleBuyAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBuyAmount(value);
  };

  const handleSellAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSellAmount(value);
  };

  const handleBuyGcoin = () => {
    if (!buyAmount || isNaN(Number(buyAmount)) || Number(buyAmount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount to buy",
        variant: "destructive",
      });
      return;
    }

    // This is where you would integrate with PayStack
    // For now, we'll show a toast indicating it's a future feature
    toast({
      title: "PayStack Integration",
      description: "PayStack payment gateway integration coming soon",
      variant: "default",
    });
  };

  const handleSellGcoin = () => {
    if (!sellAmount || isNaN(Number(sellAmount)) || Number(sellAmount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount to sell",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Coming Soon",
      description: "Selling GCoin feature is coming soon!",
      variant: "default",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-20 pb-16 px-4">
        <div className="max-w-lg mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Buy & Sell GCoin</h1>
            <p className="text-gray-500">Purchase or sell GCoin using your preferred method</p>
          </div>
          
          <Tabs defaultValue="buy" className="w-full">
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="buy">Buy GCoin</TabsTrigger>
              <TabsTrigger value="sell">Sell GCoin</TabsTrigger>
            </TabsList>
            
            <TabsContent value="buy" className={`transition-all duration-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <Card>
                <CardHeader>
                  <CardTitle>Buy GCoin</CardTitle>
                  <CardDescription>Purchase GCoin using Naira (₦) via PayStack</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Amount (GCoin)</label>
                      <Input
                        value={buyAmount}
                        onChange={handleBuyAmountChange}
                        placeholder="Enter amount to buy"
                        type="number"
                        min="0.01"
                        step="0.01"
                      />
                    </div>
                    
                    <div className="flex justify-center">
                      <ArrowRight className="h-5 w-5 text-gray-400" />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-1 block">Cost (NGN)</label>
                      <Input
                        value={calculateNairaAmount(buyAmount)}
                        readOnly
                        placeholder="Cost in Naira"
                      />
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500">
                        Exchange Rate: 1 GCoin = ₦{exchangeRate} NGN
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Minimum purchase: 0.01 GCoin (₦{(0.01 * exchangeRate).toFixed(2)} NGN)
                      </p>
                    </div>
                    
                    <Alert className="bg-blue-50 border-blue-100">
                      <CreditCard className="h-4 w-4 text-blue-600" />
                      <AlertTitle className="text-blue-600">Secure Payment</AlertTitle>
                      <AlertDescription className="text-blue-700">
                        Payment is processed securely through PayStack. Your bank information is never stored on our servers.
                      </AlertDescription>
                    </Alert>
                  </div>
                  
                  <Button 
                    onClick={handleBuyGcoin} 
                    className="w-full"
                    disabled={!buyAmount || isNaN(Number(buyAmount)) || Number(buyAmount) <= 0}
                  >
                    Buy Now
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="sell" className={`transition-all duration-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <Card>
                <CardHeader>
                  <CardTitle>Sell GCoin</CardTitle>
                  <CardDescription>Sell your GCoin and receive Naira (₦)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Available Balance</label>
                      <div className="bg-gray-50 p-4 rounded-lg flex items-center">
                        <Wallet className="h-5 w-5 text-gcoin-blue mr-3" />
                        <div>
                          <span className="text-lg font-bold">{user?.balance || "0.00"}</span>
                          <span className="ml-1 text-gray-500">GCoin</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-1 block">Amount to Sell (GCoin)</label>
                      <Input
                        value={sellAmount}
                        onChange={handleSellAmountChange}
                        placeholder="Enter amount to sell"
                        type="number"
                        min="0.01"
                        step="0.01"
                        max={user?.balance || "0"}
                      />
                    </div>
                    
                    <div className="flex justify-center">
                      <ArrowRight className="h-5 w-5 text-gray-400" />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-1 block">You'll Receive (NGN)</label>
                      <Input
                        value={calculateNairaAmount(sellAmount)}
                        readOnly
                        placeholder="Amount in Naira"
                      />
                    </div>
                    
                    <Alert className="bg-yellow-50 border-yellow-100">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <AlertTitle className="text-yellow-600">Coming Soon</AlertTitle>
                      <AlertDescription className="text-yellow-700">
                        The sell feature is coming soon! You'll be able to sell your GCoin and receive Naira directly to your bank account.
                      </AlertDescription>
                    </Alert>
                  </div>
                  
                  <Button 
                    onClick={handleSellGcoin} 
                    className="w-full"
                    disabled={true}
                  >
                    Sell GCoin
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default BuySell;
