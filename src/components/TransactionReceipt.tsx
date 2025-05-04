
import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download, Receipt } from "lucide-react";
import { formatDate, formatNumber } from "@/lib/utils";
import html2canvas from "html2canvas";
import { useAuth } from "@/context/AuthContext";

interface TransactionReceiptProps {
  open: boolean;
  onClose: () => void;
  transaction: {
    id: string;
    type: 'send' | 'receive' | 'buy' | 'sell' | 'stake' | 'unstake';
    amount: number;
    recipient?: string;
    sender?: string;
    timestamp: Date;
    status: string;
    description?: string;
    fee?: number;
  };
}

const TransactionReceipt: React.FC<TransactionReceiptProps> = ({ open, onClose, transaction }) => {
  const { user } = useAuth();
  const receiptRef = useRef<HTMLDivElement>(null);
  
  const generateTransactionMessage = () => {
    switch(transaction.type) {
      case 'send':
        return `You sent ${formatNumber(transaction.amount)} GCoin to ${transaction.recipient}`;
      case 'receive':
        return `You received ${formatNumber(transaction.amount)} GCoin from ${transaction.sender}`;
      case 'buy':
        return `You bought ${formatNumber(transaction.amount)} GCoin`;
      case 'sell':
        return `You sold ${formatNumber(transaction.amount)} GCoin`;
      case 'stake':
        return `You staked ${formatNumber(transaction.amount)} GCoin`;
      case 'unstake':
        return `You unstaked ${formatNumber(transaction.amount)} GCoin`;
      default:
        return `Transaction of ${formatNumber(transaction.amount)} GCoin`;
    }
  };
  
  const getStatusColor = () => {
    switch(transaction.status) {
      case 'completed':
        return 'text-green-500';
      case 'pending':
        return 'text-amber-500';
      case 'failed':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };
  
  const downloadReceipt = async () => {
    if (!receiptRef.current) return;
    
    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 3,
        backgroundColor: '#ffffff',
        useCORS: true,
      });
      
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `GCoin-Receipt-${transaction.id.substring(0, 8)}.png`;
      link.click();
    } catch (error) {
      console.error('Error generating receipt:', error);
    }
  };
  
  const formatTimeOnly = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Transaction Receipt
          </DialogTitle>
        </DialogHeader>
        
        <div ref={receiptRef} className="bg-white p-6 rounded-md border border-gray-100">
          {/* Receipt Header */}
          <div className="text-center mb-6">
            <div className="mb-2">
              <span className="inline-block w-14 h-14 rounded-full bg-gcoin-blue/10 flex items-center justify-center">
                <span className="text-2xl font-bold text-gcoin-blue">GC</span>
              </span>
            </div>
            <h2 className="text-xl font-bold text-gcoin-blue mb-1">GCoin Wallet</h2>
            <p className="text-gray-500 text-sm">Transaction Receipt</p>
          </div>
          
          {/* Status Badge */}
          <div className="flex justify-center mb-6">
            <div className={`px-3 py-1 rounded-full border capitalize ${getStatusColor()}`}>
              {transaction.status}
            </div>
          </div>
          
          {/* Transaction Amount */}
          <div className="text-center mb-6">
            <p className="text-sm text-gray-500 mb-1">Amount</p>
            <h1 className="text-3xl font-bold">
              {formatNumber(transaction.amount)} <span className="text-gcoin-blue">GCoin</span>
            </h1>
            {transaction.fee && transaction.fee > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                Fee: {formatNumber(transaction.fee)} GCoin
              </p>
            )}
          </div>
          
          {/* Transaction Details */}
          <div className="space-y-4">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Transaction Type</span>
              <span className="font-medium capitalize">{transaction.type}</span>
            </div>
            
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Date</span>
              <span className="font-medium">
                {formatDate(transaction.timestamp.toISOString())}
              </span>
            </div>
            
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Time</span>
              <span className="font-medium">{formatTimeOnly(transaction.timestamp)}</span>
            </div>
            
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Transaction ID</span>
              <span className="font-mono text-sm">{transaction.id.substring(0, 12)}...</span>
            </div>
            
            {transaction.sender && transaction.sender !== 'You' && (
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">From</span>
                <span className="font-mono text-sm">
                  {transaction.sender.length > 16
                    ? `${transaction.sender.substring(0, 8)}...${transaction.sender.substring(transaction.sender.length - 8)}`
                    : transaction.sender}
                </span>
              </div>
            )}
            
            {transaction.recipient && transaction.recipient !== 'You' && (
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">To</span>
                <span className="font-mono text-sm">
                  {transaction.recipient.length > 16
                    ? `${transaction.recipient.substring(0, 8)}...${transaction.recipient.substring(transaction.recipient.length - 8)}`
                    : transaction.recipient}
                </span>
              </div>
            )}
            
            {transaction.description && (
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Note</span>
                <span className="text-right max-w-[70%] break-words">
                  {transaction.description}
                </span>
              </div>
            )}
            
            <div className="flex justify-between py-2">
              <span className="text-gray-500">Wallet Address</span>
              <span className="font-mono text-sm">
                {user?.wallet_address && user.wallet_address.length > 16
                  ? `${user.wallet_address.substring(0, 8)}...`
                  : user?.wallet_address}
              </span>
            </div>
          </div>
          
          {/* Receipt Footer */}
          <div className="text-center mt-8 pt-4 border-t border-dashed border-gray-200">
            <p className="text-sm text-gray-500">
              Thank you for using GCoin Wallet
            </p>
          </div>
        </div>
        
        <div className="flex justify-end mt-4">
          <Button 
            onClick={downloadReceipt}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download Receipt
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionReceipt;
