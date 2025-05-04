import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowRight, DollarSign } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { fetchCurrencies, Currency } from "@/integrations/supabase/currencies";
import { buyGCoin, sellGCoin } from "@/integrations/supabase/trading";
import { supabase } from "@/integrations/supabase/client";

// Form schema for validation
const formSchema = z.object({
  amount: z.string()
    .refine((val) => !isNaN(Number(val)), { message: "Amount must be a number" })
    .refine((val) => Number(val) > 0, { message: "Amount must be greater than 0" }),
  currency: z.string({
    required_error: "Please select a currency",
  }),
});

interface BuySellFormProps {
  mode: "buy" | "sell";
  onSuccess: () => void;
}

const BuySellForm: React.FC<BuySellFormProps> = ({ mode, onSuccess }) => {
  const { user, setUser } = useAuth();
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [resultAmount, setResultAmount] = useState<number | null>(null);
  const [fee, setFee] = useState<number | null>(null);

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: "",
      currency: "",
    },
  });

  // Watch for form value changes to calculate conversion
  const watchAmount = form.watch("amount");
  const watchCurrency = form.watch("currency");

  // Fetch available currencies
  useEffect(() => {
    const getCurrencies = async () => {
      const data = await fetchCurrencies();
      setCurrencies(data);
    };
    
    getCurrencies();
  }, []);

  // Update exchange rate when currency changes
  useEffect(() => {
    const getExchangeRate = async () => {
      if (watchCurrency) {
        const { data, error } = await supabase
          .from('exchange_rates')
          .select('rate')
          .eq('currency', watchCurrency)
          .single();
        
        if (error) {
          console.error('Error fetching exchange rate:', error);
          return;
        }
        
        if (data) {
          setExchangeRate(data.rate);
        }
      }
    };
    
    getExchangeRate();
  }, [watchCurrency]);

  // Calculate conversion
  useEffect(() => {
    if (watchAmount && !isNaN(Number(watchAmount)) && exchangeRate) {
      const amountValue = Number(watchAmount);
      
      if (mode === "buy") {
        // When buying, convert currency to GCoin
        const gcoinAmount = amountValue / exchangeRate;
        // 3% fee
        const feeAmount = gcoinAmount * 0.03;
        setFee(feeAmount);
        setResultAmount(gcoinAmount - feeAmount);
      } else {
        // When selling, convert GCoin to currency
        // 3% fee
        const feeAmount = amountValue * 0.03;
        setFee(feeAmount);
        const netAmount = amountValue - feeAmount;
        setResultAmount(netAmount * exchangeRate);
      }
    } else {
      setResultAmount(null);
      setFee(null);
    }
  }, [watchAmount, watchCurrency, exchangeRate, mode]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    
    try {
      const amount = Number(values.amount);
      
      if (mode === "buy") {
        // Buy GCoins with currency
        const { success, error } = await buyGCoin(values.currency, amount);
        
        if (!success) {
          throw new Error(error.message || "Failed to buy GCoins");
        }
        
        toast.credit({
          title: "Purchase Successful",
          description: `You have successfully purchased ${resultAmount?.toFixed(2)} GCoins`,
        });
      } else {
        // Sell GCoins for currency
        const { success, error } = await sellGCoin(amount, values.currency);
        
        if (!success) {
          throw new Error(error.message || "Failed to sell GCoins");
        }
        
        toast.debit({
          title: "Sale Successful",
          description: `You have successfully sold ${amount} GCoins for ${resultAmount?.toFixed(2)} ${values.currency}`,
        });
      }
      
      // Refresh user data to get updated balance
      const { data: profileData } = await supabase.auth.getUser();
      
      if (profileData && profileData.user) {
        const { data: userData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', profileData.user.id)
          .single();
          
        if (userData) {
          setUser(userData);
        }
      }
      
      // Reset form
      form.reset();
      
      // Call success callback
      onSuccess();
    } catch (error: any) {
      toast.error({
        title: `${mode === "buy" ? "Purchase" : "Sale"} Failed`,
        description: error.message || `Failed to ${mode} GCoins`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {mode === "buy" ? "Currency Amount" : "GCoin Amount"}
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={mode === "buy" ? "Enter amount to spend" : "Enter GCoins to sell"}
                  type="number"
                  step="0.01"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                {mode === "buy"
                  ? "Enter the amount of currency you want to spend"
                  : "Enter the amount of GCoins you want to sell"}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="currency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Currency</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a currency" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      <div className="flex items-center">
                        <span className="mr-2">{currency.symbol}</span>
                        <span>{currency.name} ({currency.code})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Select the currency to {mode === "buy" ? "use" : "receive"}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {resultAmount !== null && exchangeRate !== null && (
          <div className="bg-muted/30 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Exchange Rate:</span>
              <span className="font-medium">
                1 GCoin = {exchangeRate} {watchCurrency}
              </span>
            </div>
            
            {fee !== null && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Fee (3%):</span>
                <span className="font-medium">
                  {mode === "buy" 
                    ? `${fee.toFixed(2)} GCoin`
                    : `${fee.toFixed(2)} GCoin (${(fee * exchangeRate).toFixed(2)} ${watchCurrency})`
                  }
                </span>
              </div>
            )}
            
            <div className="flex justify-between pt-2 border-t border-muted">
              <span className="font-medium">You will {mode === "buy" ? "receive" : "get"}:</span>
              <span className="font-bold">
                {mode === "buy" 
                  ? `${resultAmount.toFixed(2)} GCoin`
                  : `${resultAmount.toFixed(2)} ${watchCurrency}`
                }
              </span>
            </div>
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              <span>Processing...</span>
            </div>
          ) : (
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              <span>{mode === "buy" ? "Buy GCoins" : "Sell GCoins"}</span>
              <ArrowRight className="h-4 w-4 ml-2" />
            </div>
          )}
        </Button>
      </form>
    </Form>
  );
};

export default BuySellForm;
