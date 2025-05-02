
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface PaystackPaymentProps {
  amount: number; // Amount in Naira
  email: string;
  gcoinsAmount: number; // Number of GCoins being purchased
  onSuccess: () => void;
  onClose: () => void;
}

// This key would normally come from environment variables
// For now we'll use a placeholder - you'll need to replace with your actual public key
const PAYSTACK_PUBLIC_KEY = "pk_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";

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

  const initializePayment = () => {
    setIsLoading(true);

    try {
      // Check if PaystackPop is available (script loaded)
      if (!window.PaystackPop) {
        throw new Error("Paystack SDK not loaded");
      }

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
        callback: function(response: any) {
          // This happens after the payment is completed successfully
          const transactionReference = response.reference;
          
          // In a real implementation, you would verify this payment on your server
          console.log("Payment complete! Reference:", transactionReference);
          
          // Show success toast
          toast.credit({
            title: "Payment Successful",
            description: `You have successfully purchased ${gcoinsAmount} GCoins.`
          });
          
          // Call the onSuccess callback
          onSuccess();
          setIsLoading(false);
        },
        onClose: function() {
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
      toast.error({
        title: "Payment Error",
        description: "Could not initialize payment. Please try again later."
      });
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={initializePayment} 
      disabled={isLoading} 
      className="w-full"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        "Pay with Paystack"
      )}
    </Button>
  );
};

export default PaystackPayment;
