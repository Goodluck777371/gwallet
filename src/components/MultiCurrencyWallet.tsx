
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowDown,
  ArrowUp,
  Currency,
  DollarSign,
} from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

interface MultiCurrencyWalletProps {
  className?: string;
}

const MultiCurrencyWallet: React.FC<MultiCurrencyWalletProps> = ({ className }) => {
  const [selectedCurrency, setSelectedCurrency] = useState("gcoin");
  const { user } = useAuth();
  
  // Real balances from user data
  const balances = {
    gcoin: user?.balance || 0,
    usd: user?.usd_balance || 0,
    naira: user?.ngn_balance || 0,
    cedis: user?.ghs_balance || 0,
  };
  
  // Exchange rates (1 GCoin = X currency) - Fixed rate at 850 for NGN
  const exchangeRates = {
    usd: 0.5, // 1 GCoin = 0.5 USD
    naira: 850, // 1 GCoin = 850 Naira (FIXED)
    cedis: 8.5, // 1 GCoin = 8.5 Cedis
  };
  
  // Currency symbols and formatting
  const currencyConfig = {
    gcoin: {
      symbol: "G",
      name: "GCoin",
      format: (amount: number) => `${formatNumber(amount)} GCoin`,
    },
    usd: {
      symbol: "$",
      name: "US Dollar",
      format: (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount),
    },
    naira: {
      symbol: "₦",
      name: "Nigerian Naira",
      format: (amount: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount),
    },
    cedis: {
      symbol: "₵",
      name: "Ghana Cedis",
      format: (amount: number) => new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(amount),
    },
  };
  
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <Currency className="h-5 w-5 mr-2" />
          Multi-Currency Wallet
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="gcoin" onValueChange={setSelectedCurrency} className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="gcoin" className="text-xs">GCoin</TabsTrigger>
            <TabsTrigger value="usd" className="text-xs">USD</TabsTrigger>
            <TabsTrigger value="naira" className="text-xs">Naira</TabsTrigger>
            <TabsTrigger value="cedis" className="text-xs">Cedis</TabsTrigger>
          </TabsList>

          {Object.keys(currencyConfig).map((currency) => (
            <TabsContent key={currency} value={currency} className="mt-0">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm text-gray-500">Balance</Label>
                  <div className="text-2xl font-bold mt-1">
                    {currencyConfig[currency as keyof typeof currencyConfig].format(balances[currency as keyof typeof balances])}
                  </div>
                  
                  {currency !== "gcoin" && (
                    <div className="text-sm text-gray-500 mt-1">
                      ≈ {formatNumber(balances[currency as keyof typeof balances] / exchangeRates[currency as keyof typeof exchangeRates])} GCoin
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {currency === "gcoin" ? (
                    <>
                      <Link to="/send" className="col-span-1">
                        <Button variant="outline" className="w-full h-16 flex flex-col items-center justify-center text-xs">
                          <ArrowUpRight className="h-4 w-4 mb-1" />
                          Send
                        </Button>
                      </Link>
                      
                      <Link to="/buy" className="col-span-1">
                        <Button variant="outline" className="w-full h-16 flex flex-col items-center justify-center text-xs">
                          <DollarSign className="h-4 w-4 mb-1" />
                          Buy
                        </Button>
                      </Link>
                      
                      <Link to="/exchange" className="col-span-1">
                        <Button variant="outline" className="w-full h-16 flex flex-col items-center justify-center text-xs">
                          <ArrowDownLeft className="h-4 w-4 mb-1" />
                          Receive
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <>
                      <div className="col-span-3">
                        <Button 
                          variant="outline" 
                          className="w-full flex items-center justify-center gap-2"
                          onClick={() => setSelectedCurrency("gcoin")}
                        >
                          <div className="flex flex-col items-center">
                            <ArrowUp className="h-4 w-4" />
                            <span className="text-xs mt-1">Exchange</span>
                          </div>
                          <ArrowDown className="h-4 w-4" />
                          <div className="flex flex-col items-center">
                            <span className="text-xs mb-1">to/from</span>
                            <span className="font-bold">GCoin</span>
                          </div>
                        </Button>
                      </div>
                      
                      <div className="col-span-3 text-center">
                        <Link to="/exchange" className="text-blue-600 text-sm hover:underline">
                          Go to Exchange Page
                        </Link>
                      </div>
                      
                      <div className="col-span-3">
                        <div className="bg-yellow-50 border border-yellow-100 rounded-md p-3 text-sm text-yellow-700">
                          <span className="font-medium">Coming Soon:</span> Send and Receive functionality for alternate currencies.
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default MultiCurrencyWallet;
