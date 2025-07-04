import React from 'react';
import { formatNumber } from '@/lib/utils';
import { CheckCircle, Receipt, Calendar, Hash, DollarSign } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PaymentReceiptProps {
  isOpen: boolean;
  onClose: () => void;
  receiptData: {
    id: string;
    amount_naira: number;
    gcoin_amount: number;
    fee_gcoin: number;
    payment_reference: string;
    created_at: string;
  };
}

const PaymentReceipt: React.FC<PaymentReceiptProps> = ({
  isOpen,
  onClose,
  receiptData
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-500" />
            Payment Successful
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Receipt Header */}
          <div className="text-center bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <Receipt className="h-12 w-12 text-green-500 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-green-700 dark:text-green-400">
              Purchase Complete!
            </h3>
            <p className="text-sm text-green-600 dark:text-green-300">
              Your GCoins have been added to your wallet
            </p>
          </div>

          {/* Receipt Details */}
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Amount Paid
              </span>
              <span className="font-semibold">₦{formatNumber(receiptData.amount_naira)}</span>
            </div>

            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-muted-foreground">GCoins Received</span>
              <span className="font-semibold text-primary">
                {formatNumber(receiptData.gcoin_amount)} GCoin
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-muted-foreground">Transaction Fee</span>
              <span className="font-semibold">
                {formatNumber(receiptData.fee_gcoin)} GCoin
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Receipt ID
              </span>
              <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                {receiptData.id.slice(0, 8)}...{receiptData.id.slice(-8)}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-muted-foreground">Payment Reference</span>
              <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                {receiptData.payment_reference}
              </span>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date & Time
              </span>
              <span className="font-semibold text-sm">
                {formatDate(receiptData.created_at)}
              </span>
            </div>
          </div>

          {/* Exchange Rate Info */}
          <div className="bg-muted/30 p-3 rounded-lg text-center">
            <p className="text-xs text-muted-foreground">
              Exchange Rate: 1 GCoin = ₦850
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Thank you for choosing GWallet! 🎉
            </p>
          </div>

          <Button onClick={onClose} className="w-full">
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentReceipt;