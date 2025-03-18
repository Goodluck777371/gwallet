
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ArrowRight, Loader2, Copy, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const formSchema = z.object({
  recipient: z
    .string()
    .min(36, {
      message: "Wallet address must be valid",
    })
    .max(64),
  amount: z
    .string()
    .refine((val) => !isNaN(Number(val)), {
      message: "Amount must be a valid number",
    })
    .refine((val) => Number(val) > 0, {
      message: "Amount must be greater than 0",
    }),
  note: z.string().max(100).optional(),
});

interface SendMoneyFormProps {
  onSuccess?: () => void;
  className?: string;
}

const SendMoneyForm = ({ onSuccess, className }: SendMoneyFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [transaction, setTransaction] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      recipient: "",
      amount: "",
      note: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const txId = "tx_" + Math.random().toString(36).substring(2, 15);
      const nairaEquivalent = (Number(values.amount) * 850).toFixed(2);
      
      const transactionData = {
        ...values,
        txId,
        timestamp: new Date(),
        nairaEquivalent,
        recipientShort: `${values.recipient.substring(0, 8)}...${values.recipient.substring(values.recipient.length - 8)}`
      };
      
      console.log("Transaction submitted:", transactionData);
      setTransaction(transactionData);
      
      toast({
        title: "Transaction submitted",
        description: `You've sent ${values.amount} GCoins to ${values.recipient.substring(0, 8)}...`,
      });
      
      // Show receipt
      setShowReceipt(true);
      
      form.reset();
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast({
        title: "Transaction failed",
        description: "There was a problem sending your GCoins. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyTransactionId = async () => {
    if (!transaction) return;
    
    try {
      await navigator.clipboard.writeText(transaction.txId);
      setCopied(true);
      toast({
        title: "Transaction ID copied!",
        description: "The transaction ID has been copied to your clipboard."
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className={className}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="recipient"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Recipient Wallet Address</FormLabel>
                <FormControl>
                  <Input placeholder="Enter wallet address" {...field} />
                </FormControl>
                <FormDescription>
                  The wallet address of the recipient you want to send GCoins to.
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
                      placeholder="0.00" 
                      {...field} 
                      type="text"
                      inputMode="decimal"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-sm text-gray-500">GCoin</span>
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
                {field.value && !isNaN(Number(field.value)) && Number(field.value) > 0 && (
                  <div className="text-xs text-gray-500 mt-1">
                    ≈ {new Intl.NumberFormat('en-NG', {
                      style: 'currency',
                      currency: 'NGN'
                    }).format(Number(field.value) * 850)} NGN
                  </div>
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
                    placeholder="Add a note to this transaction"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Add a personal note to remind you what this transaction was for.
                </FormDescription>
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
                Processing...
              </>
            ) : (
              <>
                Send GCoins
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </Form>

      {/* Transaction Receipt Dialog */}
      {transaction && (
        <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-center text-center">
                <div className="text-2xl mb-2">🎉 Transfer Successful! 👍</div>
              </DialogTitle>
              <DialogDescription className="text-center">
                <div className="animate-fade-in">
                  Your GCoins have been sent successfully.
                </div>
              </DialogDescription>
            </DialogHeader>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mt-2 animate-scale-in">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">Amount</span>
                  <div className="text-right">
                    <div className="font-semibold">{transaction.amount} GCoin</div>
                    <div className="text-xs text-gray-500">≈ {new Intl.NumberFormat('en-NG', {
                      style: 'currency',
                      currency: 'NGN'
                    }).format(Number(transaction.nairaEquivalent))} NGN</div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">Recipient</span>
                  <span className="font-mono text-sm">{transaction.recipientShort}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">Date & Time</span>
                  <span className="text-sm">{new Date(transaction.timestamp).toLocaleString()}</span>
                </div>
                
                {transaction.note && (
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium text-gray-500">Note</span>
                    <span className="text-sm text-right">{transaction.note}</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-500">Transaction ID</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs">{transaction.txId}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={copyTransactionId}
                    >
                      {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter className="mt-4 flex flex-col sm:flex-row sm:justify-center gap-2">
              <Button
                variant="outline"
                className="sm:w-full"
                onClick={() => setShowReceipt(false)}
              >
                Close
              </Button>
              <Button 
                className="sm:w-full"
                onClick={() => {
                  setShowReceipt(false);
                  // Implement receipt download or share functionality here
                  toast({
                    title: "Receipt saved",
                    description: "Transaction receipt has been saved."
                  });
                }}
              >
                Save Receipt
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default SendMoneyForm;
