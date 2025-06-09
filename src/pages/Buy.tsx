import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { formatNumber } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PaystackPayment from "@/components/PaystackPayment";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Buy = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [nairaAmount, setNairaAmount] = useState("");
  const [gcoinAmount, setGcoinAmount] = useState(0);
  const [exchangeRate, setExchangeRate] = useState(850); // Fixed exchange rate at 850
  const [fee, setFee] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Calculate GCoin amount whenever Naira amount changes
  useEffect(() => {
    if (nairaAmount && !isNaN(Number(nairaAmount))) {
      const naira = parseFloat(nairaAmount);
      // Calculate GCoin based on exchange rate
      const rawGcoin = naira / exchangeRate;
      // Fixed fee of 1 GCoin
      const feeAmount = 1;
      setFee(feeAmount);
      // Final GCoin amount after fee
      setGcoinAmount(rawGcoin - feeAmount);
    } else {
      setGcoinAmount(0);
      setFee(0);
    }
  }, [nairaAmount, exchangeRate]);

  const handleBuyClick = () => {
    // Validate input
    if (!nairaAmount || isNaN(Number(nairaAmount)) || Number(nairaAmount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount to proceed.",
        variant: "destructive"
      });
      return;
    }
    
    // Open payment dialog
    setShowPaymentDialog(true);
  };

  // This function is called after payment completion
  const handlePaymentSuccess = () => {
    setShowPaymentDialog(false);
    setNairaAmount("");
    // Payment success handling is done by PaystackPayment component
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
              Buy GCoins
            </h1>
            <p className={`text-gray-500 transition-all duration-500 delay-100 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
              Purchase GCoins with your preferred currency
            </p>
          </div>
          
          <div className={`bg-white rounded-xl shadow-sm p-6 transition-all duration-500 delay-200 transform ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <Card>
              <CardHeader>
                <CardTitle>Buy with Nigerian Naira</CardTitle>
                <CardDescription>
                  Purchase GCoins directly with NGN using Paystack
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (NGN)</Label>
                  <Input
                    id="amount"
                    placeholder="Enter amount in Naira"
                    type="number"
                    value={nairaAmount}
                    onChange={(e) => setNairaAmount(e.target.value)}
                  />
                </div>
                
                {gcoinAmount > 0 && (
                  <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Exchange Rate:</span>
                      <span className="font-medium">
                        1 GCoin = ₦{formatNumber(exchangeRate)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Fee:</span>
                      <span className="font-medium">
                        {formatNumber(fee)} GCoin (₦{formatNumber(fee * exchangeRate)})
                      </span>
                    </div>
                    
                    <div className="flex justify-between pt-2 border-t border-muted">
                      <span className="font-medium">You will receive:</span>
                      <span className="font-bold">
                        {formatNumber(gcoinAmount)} GCoin
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleBuyClick}
                  disabled={!nairaAmount || isNaN(Number(nairaAmount)) || Number(nairaAmount) <= 0}
                  className="w-full"
                >
                  Buy Now
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Your Purchase</DialogTitle>
            <DialogDescription>
              You're buying {formatNumber(gcoinAmount)} GCoins for ₦{formatNumber(parseFloat(nairaAmount))}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <PaystackPayment 
              amount={parseFloat(nairaAmount)} 
              email={user?.email || ''}
              gcoinsAmount={gcoinAmount}
              onSuccess={handlePaymentSuccess}
              onClose={() => setShowPaymentDialog(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Buy;
