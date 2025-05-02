
import { useState, useEffect } from "react";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/context/AuthContext";

// Define currency types
interface Currency {
  code: string;
  name: string;
  symbol: string;
  rate: number;
}

const currencies: Currency[] = [
  { code: "NGN", name: "Nigerian Naira", symbol: "₦", rate: 850 },
  { code: "USD", name: "US Dollar", symbol: "$", rate: 1.2 },
  { code: "EUR", name: "Euro", symbol: "€", rate: 1.05 },
  { code: "GBP", name: "British Pound", symbol: "£", rate: 0.95 },
  { code: "GHS", name: "Ghanaian Cedi", symbol: "₵", rate: 18.5 },
  { code: "KES", name: "Kenyan Shilling", symbol: "KSh", rate: 185 },
  { code: "ZAR", name: "South African Rand", symbol: "R", rate: 22.5 },
];

const Exchange = () => {
  const { toast } = useToast();
  const [isLoaded, setIsLoaded] = useState(false);
  const [fromCurrency, setFromCurrency] = useState("GCoin");
  const [toCurrency, setToCurrency] = useState("NGN");
  const [fromAmount, setFromAmount] = useState<string>("1");
  const [toAmount, setToAmount] = useState<string>("850");
  const { user } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Find selected currency
  const selectedCurrency = currencies.find(c => c.code === toCurrency);

  // Calculate exchange rate
  const calculateExchange = (amount: string, from: string, to: string) => {
    const numAmount = parseFloat(amount) || 0;
    
    if (from === "GCoin" && to !== "GCoin") {
      const currency = currencies.find(c => c.code === to);
      return currency ? (numAmount * currency.rate).toFixed(2) : "0";
    } else if (from !== "GCoin" && to === "GCoin") {
      const currency = currencies.find(c => c.code === from);
      return currency ? (numAmount / currency.rate).toFixed(6) : "0";
    }
    
    return "0";
  };

  // Handle amount change
  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
    setToAmount(calculateExchange(value, fromCurrency, toCurrency));
  };

  const handleToAmountChange = (value: string) => {
    setToAmount(value);
    setFromAmount(calculateExchange(value, toCurrency, fromCurrency));
  };

  // Handle currency change
  const handleToCurrencyChange = (value: string) => {
    setToCurrency(value);
    setToAmount(calculateExchange(fromAmount, fromCurrency, value));
  };

  // Handle exchange
  const handleExchange = () => {
    toast({
      title: "Coming Soon! 🚀",
      description: "Currency exchange feature will be available soon.",
      variant: "default",
    });
  };

  // Format balance with selected currency
  const formatBalance = () => {
    const balance = user?.balance || 0;
    const selectedCurrency = currencies.find(c => c.code === toCurrency);
    
    if (selectedCurrency) {
      const convertedAmount = balance * selectedCurrency.rate;
      return `${selectedCurrency.symbol}${convertedAmount.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
    }
    
    return `${balance.toLocaleString('en-US', { maximumFractionDigits: 2 })} GCoin`;
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
              Exchange
            </h1>
            <p className={`text-gray-500 transition-all duration-500 delay-100 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
              Convert your GCoins to other currencies
            </p>
          </div>
          
          <div className={`bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-500 delay-200 transform ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <Card>
              <CardHeader>
                <CardTitle>Exchange GCoin</CardTitle>
                <CardDescription>
                  Current Balance: {user?.balance.toLocaleString()} GCoin
                  {toCurrency !== "GCoin" && (
                    <span className="block text-sm text-gray-500">≈ {formatBalance()} in {toCurrency}</span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">From</label>
                  <div className="flex space-x-2">
                    <Select disabled value={fromCurrency} onValueChange={() => {}}>
                      <SelectTrigger className="w-1/3">
                        <SelectValue placeholder="GCoin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GCoin">GCoin</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      value={fromAmount}
                      onChange={(e) => handleFromAmountChange(e.target.value)}
                      className="flex-1"
                      placeholder="0.00"
                      min="0"
                    />
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <div className="bg-gray-100 p-2 rounded-full">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">To</label>
                  <div className="flex space-x-2">
                    <Select value={toCurrency} onValueChange={handleToCurrencyChange}>
                      <SelectTrigger className="w-1/3">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem key={currency.code} value={currency.code}>
                            {currency.symbol} {currency.code}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      value={toAmount}
                      onChange={(e) => handleToAmountChange(e.target.value)}
                      className="flex-1"
                      placeholder="0.00"
                      min="0"
                    />
                  </div>
                </div>
                
                <div className="pt-2">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Exchange Rate</AlertTitle>
                    <AlertDescription>
                      1 GCoin = {selectedCurrency ? `${selectedCurrency.symbol}${selectedCurrency.rate.toLocaleString()}` : ''}
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleExchange} className="w-full">
                  Exchange GCoin (Coming Soon)
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Exchange;
