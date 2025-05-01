
import React, { useState, useEffect } from 'react';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Check, AlertTriangle } from 'lucide-react';
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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

// Create PIN form schema
const createPinSchema = z.object({
  pin: z.string().length(6, { message: "PIN must be exactly 6 digits" }),
  confirmPin: z.string().length(6, { message: "PIN must be exactly 6 digits" }),
}).refine((data) => data.pin === data.confirmPin, {
  message: "PINs do not match",
  path: ["confirmPin"],
});

// Reset PIN form schema
const resetPinSchema = z.object({
  currentPin: z.string().length(6, { message: "PIN must be exactly 6 digits" }),
  newPin: z.string().length(6, { message: "PIN must be exactly 6 digits" }),
  confirmNewPin: z.string().length(6, { message: "PIN must be exactly 6 digits" }),
}).refine((data) => data.newPin === data.confirmNewPin, {
  message: "New PINs do not match",
  path: ["confirmNewPin"],
});

// PIN verification form schema
const verifyPinSchema = z.object({
  pin: z.string().length(6, { message: "PIN must be exactly 6 digits" }),
});

// Component props
interface TransactionPinManagerProps {
  onPinCreated?: () => void;
  onPinReset?: () => void;
  onPinVerified?: () => void;
}

const TransactionPinManager: React.FC<TransactionPinManagerProps> = ({ 
  onPinCreated,
  onPinReset,
  onPinVerified
}) => {
  const [hasPin, setHasPin] = useState<boolean | null>(null);
  const [mode, setMode] = useState<'create' | 'reset' | 'verify'>('create');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { refreshProfile } = useAuth();

  // Forms for different modes
  const createPinForm = useForm<z.infer<typeof createPinSchema>>({
    resolver: zodResolver(createPinSchema),
    defaultValues: {
      pin: "",
      confirmPin: "",
    },
  });

  const resetPinForm = useForm<z.infer<typeof resetPinSchema>>({
    resolver: zodResolver(resetPinSchema),
    defaultValues: {
      currentPin: "",
      newPin: "",
      confirmNewPin: "",
    },
  });

  const verifyPinForm = useForm<z.infer<typeof verifyPinSchema>>({
    resolver: zodResolver(verifyPinSchema),
    defaultValues: {
      pin: "",
    },
  });

  // Check if user has a PIN already
  useEffect(() => {
    const checkExistingPin = async () => {
      try {
        const { data, error } = await supabase
          .from('transaction_pins')
          .select('user_id')
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error checking for PIN:', error);
          toast({
            title: "Error",
            description: "Could not check if you have a PIN set up",
            variant: "destructive",
          });
        }

        setHasPin(!!data);
        setMode(!!data ? 'verify' : 'create');
      } catch (error) {
        console.error('Unexpected error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkExistingPin();
  }, [toast]);

  // Handle create PIN submission
  const onCreatePinSubmit = async (values: z.infer<typeof createPinSchema>) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('transaction_pins')
        .insert([
          { pin: values.pin }
        ]);

      if (error) {
        throw error;
      }

      toast({
        title: "PIN Created Successfully",
        description: "Your transaction PIN has been set up.",
      });

      setHasPin(true);
      setMode('verify');
      
      if (onPinCreated) {
        onPinCreated();
      }
    } catch (error: any) {
      toast({
        title: "Error Creating PIN",
        description: error.message || "There was a problem creating your PIN.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      createPinForm.reset();
    }
  };

  // Handle reset PIN submission
  const onResetPinSubmit = async (values: z.infer<typeof resetPinSchema>) => {
    setIsSubmitting(true);
    try {
      // First verify the current PIN
      const { data: verifyData, error: verifyError } = await supabase
        .rpc('verify_transaction_pin', { input_pin: values.currentPin });

      if (verifyError) {
        throw verifyError;
      }

      if (!verifyData) {
        toast({
          title: "Invalid PIN",
          description: "The current PIN you entered is incorrect.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Update the PIN
      const { error } = await supabase
        .from('transaction_pins')
        .update({ pin: values.newPin, updated_at: new Date().toISOString() });

      if (error) {
        throw error;
      }

      toast({
        title: "PIN Updated Successfully",
        description: "Your transaction PIN has been updated.",
      });

      setMode('verify');
      
      if (onPinReset) {
        onPinReset();
      }
    } catch (error: any) {
      toast({
        title: "Error Updating PIN",
        description: error.message || "There was a problem updating your PIN.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      resetPinForm.reset();
    }
  };

  // Handle verify PIN submission
  const onVerifyPinSubmit = async (values: z.infer<typeof verifyPinSchema>) => {
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .rpc('verify_transaction_pin', { input_pin: values.pin });

      if (error) {
        throw error;
      }

      if (!data) {
        toast({
          title: "Invalid PIN",
          description: "The PIN you entered is incorrect.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      toast({
        title: "PIN Verified",
        description: "Your transaction PIN has been verified.",
      });
      
      if (onPinVerified) {
        onPinVerified();
      }
    } catch (error: any) {
      toast({
        title: "Error Verifying PIN",
        description: error.message || "There was a problem verifying your PIN.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      verifyPinForm.reset();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mode selector */}
      {hasPin && (
        <div className="flex flex-wrap gap-2 mb-6">
          <Button 
            variant={mode === 'verify' ? "default" : "outline"}
            onClick={() => setMode('verify')}
            className="flex-1"
            size="sm"
          >
            Verify PIN
          </Button>
          <Button 
            variant={mode === 'reset' ? "default" : "outline"}
            onClick={() => setMode('reset')}
            className="flex-1"
            size="sm"
          >
            Reset PIN
          </Button>
        </div>
      )}

      {/* Create PIN Form */}
      {mode === 'create' && !hasPin && (
        <div>
          <div className="mb-6">
            <h3 className="text-lg font-medium">Create Transaction PIN</h3>
            <p className="text-sm text-gray-500">Set up a 6-digit PIN to secure your transactions</p>
          </div>

          <Form {...createPinForm}>
            <form onSubmit={createPinForm.handleSubmit(onCreatePinSubmit)} className="space-y-6">
              <FormField
                control={createPinForm.control}
                name="pin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Enter PIN</FormLabel>
                    <FormControl>
                      <InputOTP maxLength={6} {...field}>
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FormDescription>
                      Enter a 6-digit PIN code
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createPinForm.control}
                name="confirmPin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm PIN</FormLabel>
                    <FormControl>
                      <InputOTP maxLength={6} {...field}>
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FormDescription>
                      Confirm your 6-digit PIN code
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating PIN...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Create PIN
                  </>
                )}
              </Button>
            </form>
          </Form>
        </div>
      )}

      {/* Reset PIN Form */}
      {mode === 'reset' && hasPin && (
        <div>
          <div className="mb-6">
            <h3 className="text-lg font-medium">Reset Transaction PIN</h3>
            <p className="text-sm text-gray-500">Change your existing 6-digit transaction PIN</p>
          </div>

          <Form {...resetPinForm}>
            <form onSubmit={resetPinForm.handleSubmit(onResetPinSubmit)} className="space-y-6">
              <FormField
                control={resetPinForm.control}
                name="currentPin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current PIN</FormLabel>
                    <FormControl>
                      <InputOTP maxLength={6} {...field}>
                        <InputOTPGroup>
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

              <FormField
                control={resetPinForm.control}
                name="newPin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New PIN</FormLabel>
                    <FormControl>
                      <InputOTP maxLength={6} {...field}>
                        <InputOTPGroup>
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

              <FormField
                control={resetPinForm.control}
                name="confirmNewPin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New PIN</FormLabel>
                    <FormControl>
                      <InputOTP maxLength={6} {...field}>
                        <InputOTPGroup>
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

              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating PIN...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Update PIN
                  </>
                )}
              </Button>
            </form>
          </Form>
        </div>
      )}

      {/* Verify PIN Form */}
      {mode === 'verify' && hasPin && (
        <div>
          <div className="mb-6">
            <h3 className="text-lg font-medium">Verify Transaction PIN</h3>
            <p className="text-sm text-gray-500">Enter your 6-digit transaction PIN</p>
          </div>

          <Form {...verifyPinForm}>
            <form onSubmit={verifyPinForm.handleSubmit(onVerifyPinSubmit)} className="space-y-6">
              <FormField
                control={verifyPinForm.control}
                name="pin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Enter PIN</FormLabel>
                    <FormControl>
                      <InputOTP maxLength={6} {...field}>
                        <InputOTPGroup>
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

              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying PIN...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Verify PIN
                  </>
                )}
              </Button>
            </form>
          </Form>
        </div>
      )}
      
      <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start">
        <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-amber-800">
          Keep your transaction PIN secure and don't share it with anyone. 
          You'll need this PIN to send money and perform other transactions on your account.
        </p>
      </div>
    </div>
  );
};

export default TransactionPinManager;
