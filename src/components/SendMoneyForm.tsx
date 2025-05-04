import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { calculateTransactionFee, getFeeDescription } from "@/utils/feeCalculator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ArrowUpRight, Loader2 } from "lucide-react";

// Add the initialRecipient prop to the component props
export interface SendMoneyFormProps {
  onSuccess: () => void;
  initialRecipient?: string;
}

// Create form schema with validation - Fix regex to allow "gCoin" followed by alphanumeric characters
const formSchema = z.object({
  recipient: z
    .string()
    .min(1, "Recipient address is required"),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Amount must be a positive number",
    }),
  note: z.string().optional(),
});

export const SendMoneyForm = ({ onSuccess, initialRecipient = '' }: SendMoneyFormProps) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form with validation
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      recipient: initialRecipient,
      amount: "",
      note: "",
    },
  });

  // Calculate fee and total based on current amount input
  const amount = Number(form.watch("amount") || 0);
  const fee = calculateTransactionFee(amount);
  const total = amount + fee;
  const feeDescription = getFeeDescription(amount);

  // Format numbers with commas
  const formatNumber = (num: number): string => {
    return num.toLocaleString(undefined, { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast.error({
        title: "Error",
        description: "You must be logged in to send GCoins",
        variant: "destructive",
      });
      return;
    }

    // Convert string to number
    const amountNum = Number(values.amount);
    
    // Validate amount
    if (isNaN(amountNum) || amountNum <= 0) {
      form.setError("amount", { 
        message: "Please enter a valid amount" 
      });
      return;
    }

    // Prevent sending to self
    if (values.recipient === user.wallet_address) {
      form.setError("recipient", { 
        message: "You cannot send GCoins to yourself" 
      });
      return;
    }

    setIsLoading(true);

    // Validate if user has enough balance for amount + fee
    try {
      // User's current balance from context
      const userBalance = user.balance || 0;
      
      // Check if balance is sufficient for amount + fee
      if (userBalance < total) {
        toast.error({
          title: "Insufficient Balance",
          description: `You need ${formatNumber(total)} GCoins (including ${formatNumber(fee)} GCoins fee) to complete this transaction.`,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Send money using RPC function
      const { data, error } = await supabase.rpc('send_money', {
        amount: amountNum,
        recipient_wallet: values.recipient,
        note: values.note || null
      });

      if (error) {
        console.error("Transaction error:", error);
        throw new Error(error.message || "Transaction failed");
      }

      // Success
      form.reset();
      toast.debit({
        title: "Transfer Successful",
        description: `${formatNumber(amountNum)} GCoins have been sent to ${values.recipient}`,
        variant: "debit",
      });
      
      onSuccess();
    } catch (error: any) {
      toast.error({
        title: "Transfer Failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      console.error("Send money error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Send GCoins</CardTitle>
        <CardDescription>Transfer GCoins to another wallet address</CardDescription>
      </CardHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="recipient"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipient Address</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="gCoin..." 
                      {...field} 
                      className="font-mono"
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter the recipient's GCoin wallet address
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
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
                    Enter the amount of GCoins to send
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="What's this payment for?" 
                      {...field} 
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    Add a message to the recipient
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-2">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Transaction Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Amount:</span>
                    <span>{formatNumber(amount)} GCoin</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Transaction Fee:</span>
                    <span className="flex items-center">
                      {formatNumber(fee)} GCoin
                      <span className="ml-1 text-xs text-gray-400">({feeDescription})</span>
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between font-medium">
                      <span>Total:</span>
                      <span>{formatNumber(total)} GCoin</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-end">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <ArrowUpRight className="mr-2 h-4 w-4" />
                  Send GCoins
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default SendMoneyForm;
