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
import { Loader2, AlertCircle } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const Exchange = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [fromCurrency, setFromCurrency] = useState("GCoin");
  const [toCurrency, setToCurrency] = useState("USD");
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Mock currency options
  const currencyOptions = [
    { value: "GCoin", label: "GCoin" },
    { value: "USD", label: "USD" },
    { value: "EUR", label: "EUR" },
    { value: "NGN", label: "NGN" },
  ];

  useEffect(() => {
    const fetchExchangeRate = async () => {
      setIsCalculating(true);
      try {
        // In a real application, you would fetch this from an API
        // For now, we'll use a mock exchange rate
        const mockRate = fromCurrency === "GCoin" && toCurrency === "USD" ? 0.5 : 1;
        setExchangeRate(mockRate);
      } catch (error) {
        console.error("Failed to fetch exchange rate", error);
        toast.toast({
          title: "Error",
          description: "Failed to fetch exchange rate.",
        });
        setExchangeRate(null);
      } finally {
        setIsCalculating(false);
      }
    };

    fetchExchangeRate();
  }, [fromCurrency, toCurrency, toast]);

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

  const handleExchange = async () => {
    if (!user) {
      toast.toast({
        title: "Error",
        description: "You must be logged in to perform this action.",
      });
      return;
    }

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      toast.toast({
        title: "Error",
        description: "Please enter a valid amount.",
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

      // Mock successful exchange
      toast.toast({
        title: "Exchange Successful",
        description: `${amount} ${fromCurrency} has been exchanged to ${convertedAmount?.toFixed(2)} ${toCurrency}.`,
      });

      // Reset form
      setAmount("");
      setConvertedAmount(null);
      navigate("/dashboard");
    } catch (error) {
      console.error("Exchange failed", error);
      toast.toast({
        title: "Exchange Failed",
        description: "There was an error processing your exchange. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-md mx-auto bg-white shadow-md rounded-lg overflow-hidden">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-semibold">Currency Exchange</CardTitle>
            <CardDescription>Exchange between different currencies</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  type="number"
                  id="amount"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="flex space-x-4">
                <div className="flex-1">
                  <Label htmlFor="fromCurrency">From</Label>
                  <Select value={fromCurrency} onValueChange={setFromCurrency}>
                    <SelectTrigger id="fromCurrency">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencyOptions.map((currency) => (
                        <SelectItem key={currency.value} value={currency.value}>
                          {currency.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1">
                  <Label htmlFor="toCurrency">To</Label>
                  <Select value={toCurrency} onValueChange={setToCurrency}>
                    <SelectTrigger id="toCurrency">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencyOptions.map((currency) => (
                        <SelectItem key={currency.value} value={currency.value}>
                          {currency.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {convertedAmount !== null && (
                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                  <p className="text-gray-700">
                    Converted Amount:{" "}
                    <span className="font-semibold">
                      {formatNumber(convertedAmount)} {toCurrency}
                    </span>
                  </p>
                </div>
              )}

              <Button onClick={handleExchange} className="w-full" disabled={isCalculating}>
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
