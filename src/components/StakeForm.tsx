
import { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { calculateStakingReward } from "@/utils/feeCalculator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2, TrendingUp } from "lucide-react";

interface StakeFormProps {
  onSuccess: () => void;
}

// Staking durations
const stakingOptions = [
  { value: "1", label: "1 Day" },
  { value: "3", label: "3 Days" },
  { value: "7", label: "7 Days" },
  { value: "30", label: "30 Days" },
];

// Create form schema with validation
const formSchema = z.object({
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Amount must be a positive number",
    }),
  duration: z.string().min(1, "Staking duration is required"),
});

const StakeForm = ({ onSuccess }: StakeFormProps) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form with validation
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: "",
      duration: "7", // Default to 7 days
    },
  });

  // Watch form values for calculations
  const amount = Number(form.watch("amount") || 0);
  const duration = Number(form.watch("duration") || 7);
  
  // Calculate estimated reward
  const estimatedReward = useMemo(() => {
    return calculateStakingReward(amount, duration);
  }, [amount, duration]);

  const totalReturn = amount + estimatedReward;
  const apr = 30; // 30% APR
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to stake GCoins",
        variant: "destructive",
      });
      return;
    }

    // Convert string to number
    const amountNum = Number(values.amount);
    const durationNum = Number(values.duration);
    
    // Validate amount
    if (isNaN(amountNum) || amountNum <= 0) {
      form.setError("amount", { 
        message: "Please enter a valid amount" 
      });
      return;
    }

    setIsLoading(true);

    // Validate if user has enough balance
    try {
      // User's current balance from context
      const userBalance = user.balance || 0;
      
      // Check if balance is sufficient
      if (userBalance < amountNum) {
        toast({
          title: "Insufficient Balance",
          description: `You need ${amountNum} GCoins to stake.`,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Call stake function
      const { data, error } = await supabase.rpc('stake_gcoin', {
        amount: amountNum,
        duration_days: durationNum
      });

      if (error) {
        throw error;
      }

      // Success
      form.reset();
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Staking Failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      console.error("Stake error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount to Stake</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        type="number" 
                        placeholder="0.00" 
                        {...field} 
                        className="pr-16"
                        disabled={isLoading}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                        GCoin
                      </span>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Enter the amount of GCoins you want to stake
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Staking Period</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select staking period" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {stakingOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose how long you want to stake your GCoins
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Staking Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Amount to Stake:</span>
                  <span>{amount.toFixed(2)} GCoin</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Staking Period:</span>
                  <span>{duration} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Annual Percentage Rate:</span>
                  <span>{apr}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Estimated Reward:</span>
                  <span className="text-green-600">+{estimatedReward.toFixed(2)} GCoin</span>
                </div>
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between font-medium">
                    <span>Total Return:</span>
                    <span>{totalReturn.toFixed(2)} GCoin</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Stake GCoins
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default StakeForm;
