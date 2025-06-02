
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Send } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  recipient: z.string().min(1, "Recipient wallet address is required"),
  amount: z.string().min(1, "Amount is required"),
  note: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface SendMoneyFormProps {
  onSuccess?: () => void;
  initialRecipient?: string;
}

const SendMoneyForm = ({ onSuccess, initialRecipient }: SendMoneyFormProps) => {
  const { user, refreshProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      recipient: initialRecipient || "",
      amount: "",
      note: "",
    },
  });

  // Update form when initialRecipient changes
  useEffect(() => {
    if (initialRecipient) {
      form.setValue('recipient', initialRecipient);
    }
  }, [initialRecipient, form]);

  const onSubmit = async (data: FormData) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to send money.",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(data.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount greater than 0.",
        variant: "destructive",
      });
      return;
    }

    if (amount > user.balance) {
      toast({
        title: "Insufficient balance",
        description: "You don't have enough GCoins to complete this transaction.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: result, error } = await supabase.rpc('send_money', {
        amount: amount,
        recipient_wallet: data.recipient.trim(),
        note: data.note || null,
      });

      if (error) throw error;

      toast({
        title: "Money sent successfully! 💸",
        description: `${amount} GCoins sent to ${data.recipient}`,
        variant: "success",
      });

      // Reset form
      form.reset();
      
      // Refresh user profile to update balance
      await refreshProfile();
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }

    } catch (error: any) {
      console.error('Send money error:', error);
      
      let errorMessage = "Failed to send money. Please try again.";
      if (error.message?.includes("Recipient wallet address not found")) {
        errorMessage = "Recipient wallet address not found. Please check and try again.";
      } else if (error.message?.includes("Insufficient balance")) {
        errorMessage = "You don't have enough balance to complete this transaction.";
      } else if (error.message?.includes("Cannot send money to yourself")) {
        errorMessage = "You cannot send money to your own wallet address.";
      }

      toast({
        title: "Transaction failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="recipient"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Recipient Wallet Address</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter wallet address"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount (GCoins)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
                {user && (
                  <p className="text-sm text-gray-500">
                    Available balance: {user.balance.toLocaleString()} GCoins
                  </p>
                )}
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
                    placeholder="Add a note for this transaction"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Money
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default SendMoneyForm;
