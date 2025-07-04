
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
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
  const [isLoading, setIsLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Load Paystack script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => {
      console.log("Paystack script loaded successfully");
      setScriptLoaded(true);
    };
    script.onerror = () => {
      console.error("Failed to load Paystack script");
      toast({
        title: "Payment Error",
        description: "Could not load payment system. Please try again later.",
        variant: "destructive"
      });
    };
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const updateUserBalance = async (reference: string) => {
    try {
      console.log("Updating user balance with reference:", reference);
      
      // Call a Supabase function to update the user's balance
      const { data, error } = await supabase.rpc('buy_gcoin', {
        currency_code: 'NGN',
        currency_amount: amount
      });
      
      if (error) {
        console.error("Error updating balance:", error);
        throw error;
      }
      
      console.log("Balance updated successfully:", data);
      
      // Create payment receipt
      const fee = 1; // Fixed fee of 1 GCoin
      const { data: receiptData, error: receiptError } = await supabase.rpc('create_payment_receipt', {
        p_payment_reference: reference,
        p_amount_naira: amount,
        p_gcoin_amount: gcoinsAmount,
        p_fee_gcoin: fee
      });
      
      if (receiptError) {
        console.error("Error creating receipt:", receiptError);
      } else {
        console.log("Receipt created:", receiptData);
      }
      
      // Refresh the user data to get updated balance
      await supabase.auth.refreshSession();
      
      return { success: true, receiptId: receiptData };
    } catch (error) {
      console.error('Error updating balance:', error);
      return { success: false };
    }
  };

  const initializePayment = () => {
    setIsLoading(true);

    try {
      // Check if PaystackPop is available (script loaded)
      if (!window.PaystackPop) {
        throw new Error("Paystack SDK not loaded");
      }

      console.log("Initializing Paystack payment");
      
      // Generate a reference
      const reference = 'GCoin_' + Math.floor(Math.random() * 1000000000 + 1) + '_' + new Date().getTime();
      
      // Initialize Paystack payment
      const handler = window.PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email: email,
        amount: amount * 100, // Convert to kobo (smallest currency unit in Nigeria)
        currency: 'NGN',
        ref: reference,
        metadata: {
          custom_fields: [
            {
              display_name: "GCoins Amount",
              variable_name: "gcoins_amount",
              value: gcoinsAmount
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
          
          // This happens after the payment is completed successfully
          const transactionReference = response.reference;
          
          // Update user balance
          const result = await updateUserBalance(transactionReference);
          
          if (result.success) {
            // Show success toast with receipt details
            toast({
              title: "Payment Successful! 🎉",
              description: `You have successfully purchased ${formatNumber(gcoinsAmount)} GCoins for ₦${formatNumber(amount)}. Receipt ID: ${result.receiptId}`,
            });
            
            // Call the onSuccess callback
            onSuccess();
          } else {
            toast({
              title: "Transaction Error",
              description: "Payment was successful but there was an error updating your balance. Please contact support.",
              variant: "destructive"
            });
          }
          setIsLoading(false);
        },
        onClose: function() {
          console.log("Payment window closed");
          
          // User closed the payment window
          toast({
            title: "Payment Cancelled",
            description: "You have cancelled the payment."
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
      disabled={isLoading || !scriptLoaded} 
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
      ) : (
        "Pay with Paystack"
      )}
    </Button>
  );
};

export default PaystackPayment;
