
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatNumber } from '@/lib/utils';

interface BitgetPaymentProps {
  gcoinsAmount: number;
  onSuccess: () => void;
  onClose: () => void;
}

const BitgetPayment: React.FC<BitgetPaymentProps> = ({
  gcoinsAmount,
  onSuccess,
  onClose
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Bitget exchange rates (approximate)
  const cryptoRates = {
    BTC: 0.000001, // 1 GCoin = 0.000001 BTC
    ETH: 0.00002,  // 1 GCoin = 0.00002 ETH
    USDT: 0.001,   // 1 GCoin = 0.001 USDT
  };

  const handleBitgetPayment = async (crypto: string) => {
    setIsLoading(true);
    
    try {
      const cryptoAmount = gcoinsAmount * cryptoRates[crypto as keyof typeof cryptoRates];
      
      // Generate a unique order ID
      const orderId = `GCOIN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create Bitget payment URL (this would typically be done through their API)
      // For now, we'll redirect to Bitget with payment details
      const bitgetUrl = `https://www.bitget.com/spot/BTCUSDT?orderId=${orderId}&amount=${cryptoAmount}&crypto=${crypto}`;
      
      // In a real implementation, you would:
      // 1. Create an order through Bitget API
      // 2. Get a payment URL or QR code
      // 3. Handle payment confirmation via webhook
      
      toast({
        title: "Redirecting to Bitget",
        description: `You will be redirected to complete payment of ${cryptoAmount} ${crypto}`,
      });
      
      // Open Bitget in new tab
      window.open(bitgetUrl, '_blank');
      
      // For demo purposes, simulate successful payment after 3 seconds
      setTimeout(() => {
        toast({
          title: "Payment Successful! 🎉",
          description: `You have successfully purchased ${formatNumber(gcoinsAmount)} GCoins with ${crypto}.`,
        });
        onSuccess();
        setIsLoading(false);
      }, 3000);
      
    } catch (error) {
      console.error('Bitget payment error:', error);
      toast({
        title: "Payment Error",
        description: "Could not process crypto payment. Please try again later.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Pay with Crypto via Bitget
            <ExternalLink className="h-4 w-4" />
          </CardTitle>
          <CardDescription>
            Purchase {formatNumber(gcoinsAmount)} GCoins using cryptocurrency
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            <Button
              onClick={() => handleBitgetPayment('BTC')}
              disabled={isLoading}
              variant="outline"
              className="justify-between"
            >
              <span>Pay with Bitcoin (BTC)</span>
              <span className="text-sm text-muted-foreground">
                {(gcoinsAmount * cryptoRates.BTC).toFixed(8)} BTC
              </span>
            </Button>
            
            <Button
              onClick={() => handleBitgetPayment('ETH')}
              disabled={isLoading}
              variant="outline"
              className="justify-between"
            >
              <span>Pay with Ethereum (ETH)</span>
              <span className="text-sm text-muted-foreground">
                {(gcoinsAmount * cryptoRates.ETH).toFixed(6)} ETH
              </span>
            </Button>
            
            <Button
              onClick={() => handleBitgetPayment('USDT')}
              disabled={isLoading}
              variant="outline"
              className="justify-between"
            >
              <span>Pay with Tether (USDT)</span>
              <span className="text-sm text-muted-foreground">
                {(gcoinsAmount * cryptoRates.USDT).toFixed(3)} USDT
              </span>
            </Button>
          </div>
          
          {isLoading && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Processing payment...</span>
            </div>
          )}
          
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Payments are processed through Bitget exchange</p>
            <p>• You will be redirected to complete the payment</p>
            <p>• GCoins will be credited after payment confirmation</p>
            <p>• Transaction fees may apply on the exchange</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BitgetPayment;
