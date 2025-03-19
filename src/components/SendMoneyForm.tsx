
import { useState, useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2, Send, CheckCircle2, InfoIcon, AlertTriangle } from "lucide-react";
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { calculateTransactionFee, getFeeDescription, checkDailyLimit } from "@/utils/feeCalculator";

// Mock registered wallet addresses for demo
const REGISTERED_WALLETS = [
  "gCoin8272xrt92", // User's own wallet
  "gCoin7391xdq83", // Other registered wallet
  "gCoin5137xpz64", // Other registered wallet
];

const formSchema = z.object({
  recipient: z.string().min(8, {
    message: "Recipient address must be at least 8 characters.",
  }),
  amount: z
    .number()
    .min(0.01, {
      message: "Amount must be at least 0.01 GCoins.",
    })
    .max(1000000, {
      message: "Amount cannot exceed 1,000,000 GCoins (daily limit).",
    }),
  note: z.string().optional(),
});

interface SendMoneyFormProps {
  onSuccess: () => void;
}

const SendMoneyForm = ({ onSuccess }: SendMoneyFormProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [transactionDetails, setTransactionDetails] = useState<{
    amount: number;
    recipient: string;
    fee: number;
    total: number;
    date: Date;
    status: string;
    note?: string;
  } | null>(null);

  // For demo purposes, we'll use the first wallet as the user's own wallet
  const userWalletAddress = REGISTERED_WALLETS[0];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      recipient: "",
      amount: undefined,
      note: "",
    },
  });

  const watchAmount = form.watch("amount");
  const [fee, setFee] = useState(0);
  const [feeDescription, setFeeDescription] = useState("");

  useEffect(() => {
    if (watchAmount && !isNaN(watchAmount)) {
      const calculatedFee = calculateTransactionFee(watchAmount);
      setFee(calculatedFee);
      setFeeDescription(getFeeDescription(watchAmount));
    } else {
      setFee(0);
      setFeeDescription("");
    }
  }, [watchAmount]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    // Check if user is sending to their own address
    if (values.recipient === userWalletAddress) {
      toast({
        title: "Cannot send to yourself",
        description: "You cannot send GCoins to your own wallet address.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }
    
    // Check if user has enough balance (mock implementation)
    const mockUserBalance = 200; // This would come from your actual user state
    const totalCost = values.amount + fee;
    
    if (totalCost > mockUserBalance) {
      toast({
        title: "Insufficient balance",
        description: `Your balance is too low for this transaction. You need ${totalCost.toFixed(2)} GCoins (including ${fee.toFixed(2)} GCoins fee).`,
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }
    
    // Check daily limit
    if (!checkDailyLimit(values.amount)) {
      toast({
        title: "Daily limit exceeded",
        description: "This transaction would exceed your daily limit of 1 million GCoins.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // Check if recipient exists in our database
      const isRegisteredWallet = REGISTERED_WALLETS.includes(values.recipient);
      
      // Generate mock transaction ID
      const mockTransactionId = `TX${Date.now().toString().substring(5)}`;
      setTransactionId(mockTransactionId);
      
      // If wallet is not registered, show pending and then refund after delay
      if (!isRegisteredWallet) {
        // Simulate transaction processing for unregistered wallet
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Store transaction details for pending state
        setTransactionDetails({
          amount: values.amount,
          recipient: values.recipient,
          fee: fee,
          total: values.amount + fee,
          date: new Date(),
          status: "pending",
          note: values.note
        });
        
        // Show initial pending toast
        toast({
          title: "Transaction Pending",
          description: "Sending to unregistered address. This may take a few minutes to confirm.",
          variant: "default",
          type: "warning"
        });
        
        // Show success dialog
        setShowSuccessDialog(true);
        
        // Simulate processing time then refund (2-7 minutes - shortened to 10 seconds for demo)
        setTimeout(() => {
          // Update transaction status to refunded
          setTransactionDetails(prev => prev ? {
            ...prev,
            status: "refunded"
          } : null);
          
          // Show refund toast
          toast({
            title: "Transaction Refunded",
            description: "The recipient wallet address does not exist. Your GCoins have been refunded.",
            variant: "credit",
          });
          
        }, 10000); // 10 seconds for demo (would be 2-7 minutes in production)
        
      } else {
        // Normal transaction to registered wallet
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Store transaction details for receipt
        setTransactionDetails({
          amount: values.amount,
          recipient: values.recipient,
          fee: fee,
          total: values.amount + fee,
          date: new Date(),
          status: "completed",
          note: values.note
        });
        
        // Show success dialog
        setShowSuccessDialog(true);
        
        // Call onSuccess callback
        onSuccess();
      }
      
      // Reset form in both cases
      form.reset();
      
    } catch (error) {
      toast({
        title: "Transaction failed",
        description: "There was an error processing your transaction. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSuccessDialog = () => {
    setShowSuccessDialog(false);
  };

  const copyTransactionId = async () => {
    try {
      await navigator.clipboard.writeText(transactionId);
      toast({
        title: "Copied!",
        description: "Transaction ID copied to clipboard.",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again or copy manually.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="recipient"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Recipient Address</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter wallet address"
                    autoComplete="off"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Enter the GCoin wallet address of the recipient.
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
                <FormLabel>Amount (GCoins)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    min="0.01"
                    onChange={(e) => {
                      const value = e.target.value ? parseFloat(e.target.value) : undefined;
                      field.onChange(value);
                    }}
                    value={field.value?.toString() || ""}
                  />
                </FormControl>
                <FormDescription className="flex flex-col">
                  <span>Enter the amount of GCoins to send.</span>
                  {watchAmount && !isNaN(watchAmount) && (
                    <div className="mt-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span>Transaction Fee:</span>
                        <span className="font-medium">{fee.toFixed(2)} GCoins</span>
                      </div>
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>{feeDescription}</span>
                      </div>
                      <div className="flex justify-between items-center mt-1 pt-1 border-t border-gray-100">
                        <span className="font-medium">Total:</span>
                        <span className="font-medium">
                          {watchAmount ? (watchAmount + fee).toFixed(2) : "0.00"} GCoins
                        </span>
                      </div>
                    </div>
                  )}
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
                    placeholder="Add a note to this transaction"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Add a note that will be visible to the recipient.
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
                <Send className="mr-2 h-4 w-4" />
                Send GCoins
              </>
            )}
          </Button>
        </form>
      </Form>
      
      <Dialog open={showSuccessDialog} onOpenChange={handleCloseSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-lg flex items-center justify-center">
              {transactionDetails?.status === "completed" ? (
                <>
                  <span className="animate-bounce inline-block mr-2">🎉</span>
                  Transfer Successful
                  <span className="animate-bounce inline-block ml-2">🎉</span>
                </>
              ) : transactionDetails?.status === "pending" ? (
                <>
                  <Clock className="h-5 w-5 mr-2 text-yellow-500" />
                  Transfer Pending
                </>
              ) : (
                <>
                  <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
                  Transfer Refunded
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-center">
              {transactionDetails?.status === "completed" 
                ? "Your GCoins have been sent successfully"
                : transactionDetails?.status === "pending"
                ? "Your transaction is being processed"
                : "Your GCoins have been returned to your wallet"
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className={`p-4 rounded-lg border space-y-4 ${
            transactionDetails?.status === "completed" 
              ? "bg-gradient-to-r from-gcoin-blue/5 to-gcoin-yellow/5 border-gcoin-blue/10" 
              : transactionDetails?.status === "pending"
              ? "bg-yellow-50 border-yellow-200"
              : "bg-red-50 border-red-200"
          }`}>
            <div className="flex justify-center mb-4">
              <div className={`rounded-full p-3 ${
                transactionDetails?.status === "completed" 
                  ? "bg-green-100" 
                  : transactionDetails?.status === "pending"
                  ? "bg-yellow-100"
                  : "bg-red-100"
              }`}>
                {transactionDetails?.status === "completed" ? (
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                ) : transactionDetails?.status === "pending" ? (
                  <Clock className="h-8 w-8 text-yellow-600" />
                ) : (
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                )}
              </div>
            </div>
            
            {transactionDetails && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Amount:</span>
                  <span className="font-medium">{transactionDetails.amount.toFixed(2)} GCoins</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Fee:</span>
                  <span className="font-medium">{transactionDetails.fee.toFixed(2)} GCoins</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-gray-200">
                  <span className="text-sm text-gray-500">Total:</span>
                  <span className="font-medium">{transactionDetails.total.toFixed(2)} GCoins</span>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">To:</span>
                    <span className="font-medium text-sm">{`${transactionDetails.recipient.substring(0, 8)}...${transactionDetails.recipient.substring(transactionDetails.recipient.length - 8)}`}</span>
                  </div>
                </div>
                {transactionDetails.note && (
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex justify-between items-start">
                      <span className="text-sm text-gray-500">Note:</span>
                      <span className="font-medium text-sm text-right max-w-[70%]">{transactionDetails.note}</span>
                    </div>
                  </div>
                )}
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Status:</span>
                    <span className={`font-medium ${
                      transactionDetails.status === "completed" 
                        ? "text-green-600" 
                        : transactionDetails.status === "pending"
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}>
                      {transactionDetails.status === "completed" 
                        ? "Completed" 
                        : transactionDetails.status === "pending"
                        ? "Pending"
                        : "Refunded"
                      }
                    </span>
                  </div>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Transaction ID:</span>
                    <div className="flex items-center">
                      <span className="font-mono text-xs bg-gray-100 py-1 px-2 rounded cursor-pointer hover:bg-gray-200" onClick={copyTransactionId}>
                        {transactionId}
                      </span>
                      <Button variant="ghost" size="sm" onClick={copyTransactionId} className="ml-1 h-auto p-1">
                        <span className="sr-only">Copy</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Date & Time:</span>
                    <span className="font-medium text-sm">
                      {new Intl.DateTimeFormat('en-US', {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                      }).format(transactionDetails.date)}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="mt-6 text-center">
              {transactionDetails?.status === "pending" ? (
                <div className="text-sm text-yellow-700 mb-3">
                  <p>This transaction is being processed.</p>
                  <p>If the recipient address doesn't exist, funds will be automatically refunded.</p>
                </div>
              ) : transactionDetails?.status === "refunded" ? (
                <div className="text-sm text-red-700 mb-3">
                  <p>The recipient wallet address does not exist in our system.</p>
                  <p>Your funds have been refunded to your wallet.</p>
                </div>
              ) : null}
              
              <Button 
                onClick={handleCloseSuccessDialog}
                className={
                  transactionDetails?.status === "completed" 
                    ? "bg-gradient-to-r from-gcoin-blue to-gcoin-blue/80 hover:from-gcoin-blue/90 hover:to-gcoin-blue" 
                    : transactionDetails?.status === "pending"
                    ? "bg-yellow-500 hover:bg-yellow-600"
                    : "bg-red-500 hover:bg-red-600"
                }
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SendMoneyForm;
