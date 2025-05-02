
import { useState } from "react";
import { ArrowDownUp, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import Header from "@/components/Header";

const Exchange = () => {
  const [amount, setAmount] = useState("");
  const [fromCurrency, setFromCurrency] = useState("gcoin");
  const [toCurrency, setToCurrency] = useState("ngn");
  const [convertedAmount, setConvertedAmount] = useState("");
  
  const exchangeRates = {
    gcoin_to_ngn: 850,
    gcoin_to_usd: 0.6,
    ngn_to_gcoin: 1/850,
    usd_to_gcoin: 1/0.6,
  };
  
  const handleCalculate = () => {
    if (!amount || isNaN(Number(amount))) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid number",
        variant: "destructive",
      });
      return;
    }
    
    const numAmount = Number(amount);
    let exchangeRate;
    
    if (fromCurrency === "gcoin" && toCurrency === "ngn") {
      exchangeRate = exchangeRates.gcoin_to_ngn;
    } else if (fromCurrency === "gcoin" && toCurrency === "usd") {
      exchangeRate = exchangeRates.gcoin_to_usd;
    } else if (fromCurrency === "ngn" && toCurrency === "gcoin") {
      exchangeRate = exchangeRates.ngn_to_gcoin;
    } else if (fromCurrency === "usd" && toCurrency === "gcoin") {
      exchangeRate = exchangeRates.usd_to_gcoin;
    } else {
      exchangeRate = 1;
    }
    
    const converted = (numAmount * exchangeRate).toFixed(2);
    setConvertedAmount(converted);
  };
  
  const handleExchange = () => {
    toast({
      title: "Coming Soon",
      description: "Currency exchange is coming soon!",
      variant: "default",
    });
  };
  
  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setAmount(convertedAmount);
    setConvertedAmount(amount);
  };

  const formatCurrencySymbol = (currency: string) => {
    switch (currency) {
      case "ngn": return "₦";
      case "usd": return "$";
      case "gcoin": return "G";
      default: return "";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-20 pb-16 px-4">
        <div className="max-w-lg mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Exchange Currencies</h1>
            <p className="text-gray-500">Calculate and convert between different currencies</p>
          </div>
          
          <Card className="p-6">
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 items-end">
                  <div className="col-span-2">
                    <label className="text-sm font-medium mb-1 block">Amount</label>
                    <Input
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Enter amount"
                      type="number"
                    />
                  </div>
                  <div>
                    <Select value={fromCurrency} onValueChange={setFromCurrency}>
                      <SelectTrigger>
                        <SelectValue placeholder="Currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gcoin">GCoin</SelectItem>
                        <SelectItem value="ngn">NGN</SelectItem>
                        <SelectItem value="usd">USD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <Button variant="outline" size="icon" onClick={handleSwapCurrencies} className="rounded-full">
                    <ArrowDownUp className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-3 gap-4 items-end">
                  <div className="col-span-2">
                    <label className="text-sm font-medium mb-1 block">Converted Amount</label>
                    <Input
                      value={convertedAmount}
                      readOnly
                      placeholder="Converted amount"
                    />
                  </div>
                  <div>
                    <Select value={toCurrency} onValueChange={setToCurrency}>
                      <SelectTrigger>
                        <SelectValue placeholder="Currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gcoin">GCoin</SelectItem>
                        <SelectItem value="ngn">NGN</SelectItem>
                        <SelectItem value="usd">USD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">
                    Exchange Rate: 1 {fromCurrency.toUpperCase()} = 
                    {fromCurrency === "gcoin" && toCurrency === "ngn" && ` ${exchangeRates.gcoin_to_ngn} NGN`}
                    {fromCurrency === "gcoin" && toCurrency === "usd" && ` ${exchangeRates.gcoin_to_usd} USD`}
                    {fromCurrency === "ngn" && toCurrency === "gcoin" && ` ${exchangeRates.ngn_to_gcoin.toFixed(4)} GCoin`}
                    {fromCurrency === "usd" && toCurrency === "gcoin" && ` ${exchangeRates.usd_to_gcoin.toFixed(2)} GCoin`}
                    {(fromCurrency === toCurrency) && ` 1 ${toCurrency.toUpperCase()}`}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <Button onClick={handleCalculate} variant="outline">Calculate</Button>
                <Button onClick={handleExchange}>Exchange Now</Button>
              </div>
              
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Information</AlertTitle>
                <AlertDescription>
                  Currency exchange is coming soon! For now, you can use the calculator to see current rates.
                </AlertDescription>
              </Alert>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Exchange;
