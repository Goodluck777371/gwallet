import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { currencyRates, convertGCoin } from "@/utils/transactionUtils";

const Convert = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoaded, setIsLoaded] = useState(false);
  const [gCoinAmount, setGCoinAmount] = useState<number>(1);
  const [selectedCurrency, setSelectedCurrency] = useState<string>("USD");
  const [convertedAmount, setConvertedAmount] = useState<number>(0);
  
  // Calculate converted amount when inputs change
  useEffect(() => {
    if (gCoinAmount && selectedCurrency) {
      const rate = currencyRates[selectedCurrency as keyof typeof currencyRates] || 0;
      setConvertedAmount(gCoinAmount * rate);
    }
  }, [gCoinAmount, selectedCurrency]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleConvertNow = () => {
    toast({
      title: "Coming Soon!",
      description: "The conversion feature is not yet available. Stay tuned for updates!",
      variant: "default",
    });
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
              Convert GCoin
            </h1>
            <p className={`text-gray-500 transition-all duration-500 delay-100 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
              Convert your GCoins to other currencies
            </p>
          </div>
          
          <div className={`bg-white rounded-xl shadow-sm p-6 transition-all duration-500 delay-200 transform ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">From</label>
                <span className="text-sm text-gray-500">
                  Balance: {user?.balance || 0} GCoin
                </span>
              </div>
              <div className="relative">
                <Input
                  type="number"
                  min="0"
                  value={gCoinAmount.toString()}
                  onChange={(e) => setGCoinAmount(Number(e.target.value))}
                  className="pr-16"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span className="text-gray-500">GCoin</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center my-4">
              <div className="bg-gray-100 p-2 rounded-full">
                <ArrowRight className="h-5 w-5 text-gray-500" />
              </div>
            </div>
            
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">To</label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Conversion rates are updated daily</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex space-x-3">
                <div className="relative flex-1">
                  <Input
                    type="number"
                    value={convertedAmount.toFixed(4)}
                    readOnly
                    className="bg-gray-50 pr-24"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-gray-500">{selectedCurrency}</span>
                  </div>
                </div>
                <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(currencyRates).map((currency) => (
                      <SelectItem key={currency} value={currency}>
                        {currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4 mb-8">
              <h3 className="font-medium text-blue-800 mb-1">Conversion Rate</h3>
              <p className="text-blue-600">
                1 GCoin = {currencyRates[selectedCurrency as keyof typeof currencyRates]} {selectedCurrency}
              </p>
            </div>
            
            <div className="bg-yellow-50 rounded-lg p-4 mb-8">
              <div className="flex items-center text-yellow-800 mb-2">
                <Info className="h-5 w-5 mr-2" />
                <h3 className="font-medium">Coming Soon</h3>
              </div>
              <p className="text-yellow-700 text-sm">
                The GCoin conversion feature is currently under development. You'll be able to convert your GCoins to various currencies soon!
              </p>
            </div>
            
            <Button 
              className="w-full"
              onClick={handleConvertNow}
            >
              Convert Now
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Convert;
