
import { useState, useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2, Send, CheckCircle2, InfoIcon, AlertTriangle, Clock, AtSign, Wallet } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { calculateTransactionFee, getFeeDescription, checkDailyLimit } from "@/utils/feeCalculator";
import { sendMoney } from "@/utils/paymentService";
import { fetchAllWalletAddresses, fetchAllUsernames } from "@/services/profileService";

const recipientAddressSchema = z.object({
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

const recipientUsernameSchema = z.object({
  recipient: z.string().min(3, {
    message: "Username must be at least 3 characters.",
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
  const { user, updateBalance } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [registeredWallets, setRegisteredWallets] = useState<string[]>([]);
  const [registeredUsernames, setRegisteredUsernames] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"address" | "username">("address");
  const [transactionDetails, setTransactionDetails] = useState<{
    amount: number;
    recipient: string;
    fee: number;
    total: number;
    date: Date;
    status: string;
    note?: string;
    isUsername?: boolean;
  } | null>(null);

  // Fetch real wallet addresses and usernames
  useEffect(() => {
    const getAddressesAndUsernames = async () => {
      const addresses = await fetchAllWalletAddresses();
      setRegisteredWallets(addresses.map(a => a.walletAddress));
      
      const usernames = await fetchAllUsernames();
      setRegisteredUsernames(usernames.map(u => u.username));
    };
    getAddressesAndUsernames();
  }, []);

  // For demo, use the user's wallet address from context
  const userWalletAddress = user?.walletAddress || "";

  const addressForm = useForm<z.infer<typeof recipientAddressSchema>>({
    resolver: zodResolver(recipientAddressSchema),
    defaultValues: {
      recipient: "",
      amount: undefined,
      note: "",
    },
  });

  const usernameForm = useForm<z.infer<typeof recipientUsernameSchema>>({
    resolver: zodResolver(recipientUsernameSchema),
    defaultValues: {
      recipient: "",
      amount: undefined,
      note: "",
    },
  });

  const watchAddressAmount = addressForm.watch("amount");
  const watchUsernameAmount = usernameForm.watch("amount");
  const currentAmount = activeTab === "address" ? watchAddressAmount : watchUsernameAmount;
  
  const [fee, setFee] = useState(0);
  const [feeDescription, setFeeDescription] = useState("");

  useEffect(() => {
    if (currentAmount && !isNaN(currentAmount)) {
      const calculatedFee = calculateTransactionFee(currentAmount);
      setFee(calculatedFee);
      setFeeDescription(getFeeDescription(currentAmount));
    } else {
      setFee(0);
      setFeeDescription("");
    }
  }, [currentAmount]);

  const handleTabChange = (value: string) => {
    setActiveTab(value as "address" | "username");
  };

  const processTransaction = async (values: z.infer<typeof recipientAddressSchema | typeof recipientUsernameSchema>, isUsername: boolean) => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    // Check if user is sending to their own address or username
    if (
      (!isUsername && values.recipient === userWalletAddress) || 
      (isUsername && values.recipient === user.username)
    ) {
      toast({
        title: "Cannot send to yourself",
        description: "You cannot send GCoins to your own account.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }
    
    // Check if user has enough balance
    const userBalance = user?.balance || 0;
    const totalCost = values.amount + fee;
    
    if (totalCost > userBalance) {
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
      // Process the transaction through our utility function
      const result = await sendMoney(
        user.id,
        userWalletAddress,
        values.recipient,
        values.amount,
        fee,
        values.note,
        isUsername
      );
      
      setTransactionId(result.transactionId);
      
      // Update user's balance immediately (the sendMoney function handles the actual balance update in the database)
      const newBalance = userBalance - totalCost;
      updateBalance(newBalance);
      
      // Store transaction details for the receipt
      setTransactionDetails({
        amount: values.amount,
        recipient: values.recipient,
        fee: fee,
        total: values.amount + fee,
        date: new Date(),
        status: result.status,
        note: values.note,
        isUsername: isUsername
      });
      
      // Show success dialog
      setShowSuccessDialog(true);
      
      // If successful, trigger the onSuccess callback
      if (result.success) {
        onSuccess();
      } else if (result.message) {
        // Show message for failed transaction
        toast({
          title: result.status === "refunded" ? "Transaction Refunded" : "Transaction Failed",
          description: result.message,
          variant: result.status === "refunded" ? "credit" : "destructive",
        });
      }
      
      // Reset forms
      addressForm.reset();
      usernameForm.reset();
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

  const onAddressSubmit = async (values: z.infer<typeof recipientAddressSchema>) => {
    await processTransaction(values, false);
  };

  const onUsernameSubmit = async (values: z.infer<typeof recipientUsernameSchema>) => {
    await processTransaction(values, true);
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
      <Tabs defaultValue="address" onValueChange={handleTabChange}>
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="address" className="flex items-center">
            <Wallet className="mr-2 h-4 w-4" />
            Wallet Address
          </TabsTrigger>
          <TabsTrigger value="username" className="flex items-center">
            <AtSign className="mr-2 h-4 w-4" />
            Username
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="address">
          <Form {...addressForm}>
            <form onSubmit={addressForm.handleSubmit(onAddressSubmit)} className="space-y-6">
              <FormField
                control={addressForm.control}
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
                control={addressForm.control}
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
                      {watchAddressAmount && !isNaN(watchAddressAmount) && (
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
                              {watchAddressAmount ? (watchAddressAmount + fee).toFixed(2) : "0.00"} GCoins
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
                control={addressForm.control}
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
        </TabsContent>
        
        <TabsContent value="username">
          <Form {...usernameForm}>
            <form onSubmit={usernameForm.handleSubmit(onUsernameSubmit)} className="space-y-6">
              <FormField
                control={usernameForm.control}
                name="recipient"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipient Username</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-gray-500">
                          <AtSign className="h-4 w-4" />
                        </span>
                        <Input
                          placeholder="username"
                          autoComplete="off"
                          className="pl-9"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Enter the username of the recipient.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={usernameForm.control}
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
                      {watchUsernameAmount && !isNaN(watchUsernameAmount) && (
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
                              {watchUsernameAmount ? (watchUsernameAmount + fee).toFixed(2) : "0.00"} GCoins
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
                control={usernameForm.control}
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
        </TabsContent>
      </Tabs>
      
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
                    <span className="text-sm text-gray-500">Sent to:</span>
                    <span className="font-medium text-sm flex items-center">
                      {transactionDetails.isUsername ? (
                        <>
                          <AtSign className="h-3 w-3 mr-1" />
                          {transactionDetails.recipient}
                        </>
                      ) : (
                        <>
                          <Wallet className="h-3 w-3 mr-1" />
                          {`${transactionDetails.recipient.substring(0, 6)}...${transactionDetails.recipient.substring(transactionDetails.recipient.length - 6)}`}
                        </>
                      )}
                    </span>
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
                  <p>{transactionDetails.isUsername 
                    ? "The username you entered does not exist in our system." 
                    : "The wallet address you entered does not exist in our system."}</p>
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
