
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, SendHorizontal, Scan, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import QrCodeScanner from '@/components/QrCodeScanner';

// Add the initialRecipient prop to the component props
export interface SendMoneyFormProps {
  onSuccess: () => void;
  initialRecipient?: string;
}

const formSchema = z.object({
  recipient: z
    .string()
    .min(1, { message: 'Recipient wallet address is required' })
    .refine((val) => val.startsWith('gCoin'), {
      message: 'Must be a valid GCoin wallet address (starts with "gCoin")',
    }),
  amount: z
    .string()
    .min(1, { message: 'Amount is required' })
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: 'Amount must be a positive number',
    }),
  note: z.string().optional(),
  pin: z.string().length(6, { message: 'PIN must be exactly 6 digits' }).optional(),
});

export const SendMoneyForm = ({ onSuccess, initialRecipient = '' }: SendMoneyFormProps) => {
  const { user, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [pendingTransaction, setPendingTransaction] = useState<any>(null);
  const [hasPin, setHasPin] = useState<boolean | null>(null);
  const [isCheckingPin, setIsCheckingPin] = useState(true);
  const [isAnimated, setIsAnimated] = useState(false);

  // Define the form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      recipient: initialRecipient,
      amount: '',
      note: '',
      pin: '',
    },
  });

  const pinForm = useForm<{ pin: string }>({
    resolver: zodResolver(z.object({
      pin: z.string().length(6, { message: 'PIN must be exactly 6 digits' }),
    })),
    defaultValues: {
      pin: '',
    },
  });

  useEffect(() => {
    // Check if user has a PIN
    const checkUserPin = async () => {
      try {
        const { data, error } = await supabase
          .from('transaction_pins')
          .select('user_id')
          .single();

        setHasPin(!!data);
      } catch (error) {
        console.error('Error checking PIN:', error);
      } finally {
        setIsCheckingPin(false);
      }
    };

    checkUserPin();

    // Animation effect
    setTimeout(() => {
      setIsAnimated(true);
    }, 100);

    // Update form values when initialRecipient changes
    if (initialRecipient) {
      form.setValue('recipient', initialRecipient);
    }
  }, [form, initialRecipient]);

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!hasPin) {
      toast({
        title: "Transaction PIN Required",
        description: "Please set up a transaction PIN in your account settings before making transfers.",
        variant: "destructive",
      });
      return;
    }

    // Store the transaction details and show PIN dialog
    setPendingTransaction({
      recipient: values.recipient,
      amount: parseFloat(values.amount),
      note: values.note || null
    });
    setShowPinDialog(true);
  };

  // Handle PIN verification and complete transaction
  const completeSendMoney = async (pin: string) => {
    if (!pendingTransaction) return;
    
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.rpc('send_money', {
        recipient_wallet: pendingTransaction.recipient,
        amount: pendingTransaction.amount,
        pin: pin, // Send the PIN for verification
        note: pendingTransaction.note
      });
      
      if (error) {
        throw error;
      }
      
      // Success!
      toast({
        title: "Transfer Successful",
        description: `Successfully sent ${pendingTransaction.amount} GCoins to ${pendingTransaction.recipient.substring(0, 8)}...`,
      });
      
      // Reset the form
      form.reset();
      pinForm.reset();
      setShowPinDialog(false);
      setPendingTransaction(null);
      
      // Refresh user data (to see updated balance)
      await refreshProfile();
      
      // Call the success callback
      onSuccess();
    } catch (error: any) {
      console.error('Error sending money:', error);
      toast({
        title: "Transfer Failed",
        description: error.message || "Could not complete the transaction. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle PIN form submission
  const onPinSubmit = (values: { pin: string }) => {
    completeSendMoney(values.pin);
  };

  // Handle QR code detection
  const handleQrCodeDetected = (walletAddress: string) => {
    form.setValue('recipient', walletAddress);
    setShowQrScanner(false);
    toast({
      title: "Wallet Address Detected",
      description: `Recipient address: ${walletAddress.substring(0, 8)}...${walletAddress.substring(walletAddress.length - 8)}`
    });
  };

  return (
    <>
      {isCheckingPin ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : !hasPin ? (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
          <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-amber-800 mb-2">Transaction PIN Required</h3>
          <p className="text-amber-700 mb-4">
            You need to set up a transaction PIN before you can send money. This helps keep your account secure.
          </p>
          <Button
            onClick={() => {
              // Navigate to the Settings page, PIN tab
              window.location.href = "/settings?tab=pin";
            }}
          >
            Set Up PIN Now
          </Button>
        </div>
      ) : (
        <div className={`space-y-6 transition-all duration-500 ${isAnimated ? 'opacity-100' : 'opacity-0'}`}>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Recipient Field */}
              <FormField
                control={form.control}
                name="recipient"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipient Wallet Address</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input placeholder="Enter wallet address (gCoin...)" {...field} />
                      </FormControl>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="icon" 
                        onClick={() => setShowQrScanner(true)}
                      >
                        <Scan className="h-4 w-4" />
                      </Button>
                    </div>
                    <FormDescription>
                      Enter the recipient's GCoin wallet address or scan their QR code
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Amount Field */}
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                          G
                        </span>
                        <Input className="pl-7" placeholder="0.00" {...field} />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Enter the amount of GCoins to send
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Note Field */}
              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Note (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Add a note for this transaction" {...field} />
                    </FormControl>
                    <FormDescription>
                      Add a message for the recipient
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
              >
                <SendHorizontal className="w-4 h-4 mr-2" />
                Continue
              </Button>
            </form>
          </Form>
          
          {/* User balance display */}
          <div className="text-center pt-2">
            <p className="text-sm text-gray-500">
              Available balance: <span className="font-medium text-gray-700">{user?.balance?.toLocaleString()} GCoins</span>
            </p>
          </div>

          {/* QR Scanner Dialog */}
          <Dialog open={showQrScanner} onOpenChange={setShowQrScanner}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Scan QR Code</DialogTitle>
                <DialogDescription>
                  Scan a QR code to get the wallet address
                </DialogDescription>
              </DialogHeader>
              <QrCodeScanner 
                onCodeDetected={handleQrCodeDetected}
                onClose={() => setShowQrScanner(false)}
              />
            </DialogContent>
          </Dialog>

          {/* PIN Verification Dialog */}
          <Dialog open={showPinDialog} onOpenChange={(open) => {
            if (!open) {
              setPendingTransaction(null);
              pinForm.reset();
            }
            setShowPinDialog(open);
          }}>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>Enter Transaction PIN</DialogTitle>
                <DialogDescription>
                  Please enter your 6-digit transaction PIN to confirm this transfer
                </DialogDescription>
              </DialogHeader>
              
              <Form {...pinForm}>
                <form onSubmit={pinForm.handleSubmit(onPinSubmit)} className="space-y-6">
                  <FormField
                    control={pinForm.control}
                    name="pin"
                    render={({ field }) => (
                      <FormItem className="mx-auto">
                        <FormControl>
                          <InputOTP maxLength={6} {...field}>
                            <InputOTPGroup className="gap-2">
                              <InputOTPSlot index={0} />
                              <InputOTPSlot index={1} />
                              <InputOTPSlot index={2} />
                              <InputOTPSlot index={3} />
                              <InputOTPSlot index={4} />
                              <InputOTPSlot index={5} />
                            </InputOTPGroup>
                          </InputOTP>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex gap-3">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => {
                        setShowPinDialog(false);
                        setPendingTransaction(null);
                        pinForm.reset();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Confirm"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </>
  );
};
