
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatNumber } from '@/lib/utils';

interface PaystackPaymentProps {
  amount: number; // Amount in Naira
  email: string;
  gcoinsAmount: number; // Number of GCoins being purchased
  onSuccess: () => void;
  onClose: () => void;
}

// Using the provided live key
const PAYSTACK_PUBLIC_KEY = "pk_live_1795bdb32ad23326bb1946b951cdd6cde892d4a9";

declare global {
  interface Window {
    PaystackPop: any;
  }
}

const PaystackPayment: React.FC<PaystackPaymentProps> = ({
  amount,
  email,
  gcoinsAmount,
  onSuccess,
  onClose
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [scriptError, setScriptError] = useState(false);

  // Load Paystack script
  useEffect(() => {
    // Check if script is already loaded
    if (window.PaystackPop) {
      setScriptLoaded(true);
      return;
    }

    // Check if script already exists in DOM
    const existingScript = document.querySelector('script[src="https://js.paystack.co/v1/inline.js"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => setScriptLoaded(true));
      existingScript.addEventListener('error', () => setScriptError(true));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => {
      console.log("Paystack script loaded successfully");
      setScriptLoaded(true);
      setScriptError(false);
    };
    script.onerror = () => {
      console.error("Failed to load Paystack script");
      setScriptError(true);
      toast({
        title: "Payment Error",
        description: "Could not load payment system. Please check your internet connection and try again.",
        variant: "destructive"
      });
    };
    document.head.appendChild(script);
    
    return () => {
      // Don't remove script as it might be needed by other components
    };
  }, [toast]);

  const updateUserBalance = async (reference: string) => {
    try {
      console.log("Updating user balance with reference:", reference);
      
      const { data, error } = await supabase.rpc('buy_gcoin', {
        currency_code: 'NGN',
        currency_amount: amount
      });
      
      if (error) {
        console.error("Error updating balance:", error);
        throw error;
      }
      
      console.log("Balance updated successfully:", data);
      return true;
    } catch (error) {
      console.error('Error updating balance:', error);
      return false;
    }
  };

  const initializePayment = () => {
    if (scriptError) {
      toast({
        title: "Payment Error",
        description: "Payment system could not be loaded. Please refresh the page and try again.",
        variant: "destructive"
      });
      return;
    }

    if (!window.PaystackPop) {
      toast({
        title: "Payment Error",
        description: "Payment system not ready. Please wait a moment and try again.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log("Initializing Paystack payment");
      
      // Generate a reference
      const reference = 'GCoin_' + Math.floor(Math.random() * 1000000000 + 1) + '_' + new Date().getTime();
      
      // Initialize Paystack payment
      const handler = window.PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email: email,
        amount: Math.round(amount * 100), // Convert to kobo and ensure integer
        currency: 'NGN',
        ref: reference,
        metadata: {
          custom_fields: [
            {
              display_name: "GCoins Amount",
              variable_name: "gcoins_amount",
              value: gcoinsAmount.toString()
            },
            {
              display_name: "User ID",
              variable_name: "user_id",
              value: user?.id || ''
            },
            {
              display_name: "Username",
              variable_name: "username",
              value: user?.username || ''
            }
          ]
        },
        callback: async function(response: any) {
          console.log("Payment successful:", response);
          
          const transactionReference = response.reference;
          
          // Update user balance
          const balanceUpdated = await updateUserBalance(transactionReference);
          
          if (balanceUpdated) {
            toast({
              title: "Payment Successful! 🎉",
              description: `You have successfully purchased ${formatNumber(gcoinsAmount)} GCoins.`,
              variant: "default"
            });
            
            onSuccess();
          } else {
            toast({
              title: "Transaction Error",
              description: "Payment was successful but there was an error updating your balance. Please contact support with reference: " + transactionReference,
              variant: "destructive"
            });
          }
          setIsLoading(false);
        },
        onClose: function() {
          console.log("Payment window closed");
          
          toast({
            title: "Payment Cancelled",
            description: "You have cancelled the payment.",
            variant: "default"
          });
          onClose();
          setIsLoading(false);
        },
      });
      
      // Open the Paystack payment window
      handler.openIframe();
    } catch (error) {
      console.error('Paystack payment initialization error:', error);
      toast({
        title: "Payment Error",
        description: "Could not initialize payment. Please try again later.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={initializePayment} 
      disabled={isLoading || !scriptLoaded || scriptError} 
      className="w-full"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : !scriptLoaded ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading payment...
        </>
      ) : scriptError ? (
        "Payment system unavailable"
      ) : (
        "Pay with Paystack"
      )}
    </Button>
  );
};

export default PaystackPayment;
