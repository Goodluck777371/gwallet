
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, AlertCircle, ArrowDown } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import Header from "@/components/Header";

const Exchange = () => {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [fromCurrency, setFromCurrency] = useState("GCoin");
  const [toCurrency, setToCurrency] = useState("USD");
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [balances, setBalances] = useState({
    GCoin: 0,
    USD: 0,
    NGN: 0,
    GHS: 0
  });

  // Currency options
  const currencyOptions = [
    { value: "GCoin", label: "GCoin" },
    { value: "USD", label: "USD" },
    { value: "NGN", label: "Naira (NGN)" },
    { value: "GHS", label: "Cedis (GHS)" },
  ];

  useEffect(() => {
    if (!user) {
      toast.warning({
        title: "Authentication Required",
        description: "Please log in to access exchange features",
      });
      navigate("/login");
      return;
    }
    
    // Set GCoin balance from user
    setBalances(prev => ({
      ...prev,
      GCoin: user.balance || 0
    }));
    
    // Fetch currency balances
    fetchCurrencyBalances();
    
  }, [user, navigate]);

  const fetchCurrencyBalances = async () => {
    try {
      // In a real app, fetch from database
      // Mock balances for now
      setBalances({
        GCoin: user?.balance || 0,
        USD: 500,
        NGN: 75000,
        GHS: 1500
      });
    } catch (error) {
      console.error("Failed to fetch balances", error);
    }
  };

  useEffect(() => {
    const fetchExchangeRate = async () => {
      setIsCalculating(true);
      try {
        // Setting fixed exchange rates for the demo
        let rate;
        if (fromCurrency === "GCoin" && toCurrency === "USD") {
          rate = 0.5; // 1 GCoin = 0.5 USD
        } else if (fromCurrency === "GCoin" && toCurrency === "NGN") {
          rate = 850; // 1 GCoin = 850 Naira
        } else if (fromCurrency === "GCoin" && toCurrency === "GHS") {
          rate = 8.5; // 1 GCoin = 8.5 Cedis
        } else if (fromCurrency === "USD" && toCurrency === "GCoin") {
          rate = 2; // 1 USD = 2 GCoin
        } else if (fromCurrency === "NGN" && toCurrency === "GCoin") {
          rate = 1/850; // 850 NGN = 1 GCoin
        } else if (fromCurrency === "GHS" && toCurrency === "GCoin") {
          rate = 1/8.5; // 8.5 GHS = 1 GCoin
        } else {
          rate = 1; // Default
        }
        
        setExchangeRate(rate);
      } catch (error) {
        console.error("Failed to fetch exchange rate", error);
        toast.error({
          title: "Error",
          description: "Failed to fetch exchange rate.",
        });
        setExchangeRate(null);
      } finally {
        setIsCalculating(false);
      }
    };

    if (fromCurrency && toCurrency && fromCurrency !== toCurrency) {
      fetchExchangeRate();
    } else {
      setExchangeRate(1);
    }
  }, [fromCurrency, toCurrency]);

  useEffect(() => {
    if (amount && exchangeRate !== null) {
      const numAmount = parseFloat(amount);
      if (!isNaN(numAmount)) {
        setConvertedAmount(numAmount * exchangeRate);
      } else {
        setConvertedAmount(null);
      }
    } else {
      setConvertedAmount(null);
    }
  }, [amount, exchangeRate]);

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setAmount("");
    setConvertedAmount(null);
  };

  const handleExchange = async () => {
    if (!user) {
      toast.warning({
        title: "Error",
        description: "You must be logged in to perform this action.",
      });
      return;
    }

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      toast.error({
        title: "Error",
        description: "Please enter a valid amount.",
      });
      return;
    }

    // Check if user has enough balance
    const numAmount = parseFloat(amount);
    if (numAmount > balances[fromCurrency as keyof typeof balances]) {
      toast.error({
        title: "Insufficient Balance",
        description: `You don't have enough ${fromCurrency} to complete this exchange.`,
      });
      return;
    }

    setIsConfirmationOpen(true);
  };

  const confirmExchange = async () => {
    setIsConfirmationOpen(false);
    setIsLoading(true);

    try {
      // Simulate exchange process
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const numAmount = parseFloat(amount);
      const exchangedAmount = numAmount * (exchangeRate || 1);

      // Update balances
      setBalances(prev => ({
        ...prev,
        [fromCurrency]: prev[fromCurrency as keyof typeof prev] - numAmount,
        [toCurrency]: prev[toCurrency as keyof typeof prev] + exchangedAmount
      }));

      // If exchanging from or to GCoin, update user balance via API
      if (fromCurrency === "GCoin" || toCurrency === "GCoin") {
        await refreshProfile();
      }

      toast.success({
        title: "Exchange Successful",
        description: `${amount} ${fromCurrency} has been exchanged to ${convertedAmount?.toFixed(2)} ${toCurrency}.`,
      });

      // Reset form
      setAmount("");
      setConvertedAmount(null);
    } catch (error) {
      console.error("Exchange failed", error);
      toast.error({
        title: "Exchange Failed",
        description: "There was an error processing your exchange. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrencyValue = (value: number, currency: string) => {
    switch(currency) {
      case 'USD':
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
      case 'NGN':
        return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(value);
      case 'GHS':
        return new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(value);
      case 'GCoin':
      default:
        return `${formatNumber(value)} GCoin`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto p-4 pt-20">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-semibold">Currency Exchange</CardTitle>
              <CardDescription>Convert between GCoin and other currencies</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {/* From Currency */}
                <div className="space-y-2">
                  <Label htmlFor="fromCurrency">From</Label>
                  <Select value={fromCurrency} onValueChange={setFromCurrency}>
                    <SelectTrigger id="fromCurrency" className="w-full">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencyOptions.map((currency) => (
                        <SelectItem key={currency.value} value={currency.value}>
                          {currency.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="text-sm text-gray-500 flex justify-between mt-1">
                    <span>Available:</span>
                    <span className="font-medium">
                      {formatCurrencyValue(balances[fromCurrency as keyof typeof balances], fromCurrency)}
                    </span>
                  </div>
                </div>

                {/* Amount */}
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    type="number"
                    id="amount"
                    placeholder={`Enter ${fromCurrency} amount`}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>

                {/* Swap Button */}
                <div className="flex justify-center my-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon" 
                    onClick={handleSwapCurrencies}
                    className="rounded-full h-8 w-8"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </div>

                {/* To Currency */}
                <div className="space-y-2">
                  <Label htmlFor="toCurrency">To</Label>
                  <Select value={toCurrency} onValueChange={setToCurrency}>
                    <SelectTrigger id="toCurrency" className="w-full">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencyOptions.map((currency) => (
                        <SelectItem key={currency.value} value={currency.value}>
                          {currency.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="text-sm text-gray-500 flex justify-between mt-1">
                    <span>Available:</span>
                    <span className="font-medium">
                      {formatCurrencyValue(balances[toCurrency as keyof typeof balances], toCurrency)}
                    </span>
                  </div>
                </div>

                {/* Exchange Rate */}
                {exchangeRate !== null && fromCurrency !== toCurrency && (
                  <div className="bg-blue-50 text-blue-800 p-4 rounded-md text-center text-sm">
                    <p>Exchange Rate</p>
                    <p className="font-semibold">
                      1 {fromCurrency} = {formatNumber(exchangeRate)} {toCurrency}
                    </p>
                  </div>
                )}

                {/* Converted Amount */}
                {convertedAmount !== null && (
                  <div className="p-4 bg-gray-50 rounded-md">
                    <p className="text-gray-500 text-sm">You will receive:</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">
                      {formatCurrencyValue(convertedAmount, toCurrency)}
                    </p>
                  </div>
                )}

                <Button 
                  onClick={handleExchange} 
                  className="w-full" 
                  disabled={isCalculating || isLoading || !amount || fromCurrency === toCurrency}
                >
                  {isCalculating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Calculating...
                    </>
                  ) : (
                    "Exchange"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Confirmation Dialog */}
      <AlertDialog open={isConfirmationOpen} onOpenChange={setIsConfirmationOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Exchange</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to exchange {amount} {fromCurrency} to {convertedAmount?.toFixed(2)} {toCurrency}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsConfirmationOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmExchange} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exchanging...
                </>
              ) : (
                "Confirm"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Exchange;
