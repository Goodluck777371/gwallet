
import { useState } from "react";
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  Calendar, 
  Copy, 
  Clock, 
  CheckCircle2,
  Receipt
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/utils";
import TransactionReceipt from "./TransactionReceipt";

export interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'buy' | 'sell' | 'stake' | 'unstake';
  amount: number;
  recipient?: string;
  sender?: string;
  timestamp: Date;
  status: string;
  description?: string;
  fee?: number;
}

interface TransactionItemProps {
  transaction: Transaction;
  className?: string;
}

const TransactionItem = ({ transaction, className = "" }: TransactionItemProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  
  const {
    type,
    amount,
    recipient,
    sender,
    timestamp,
    id,
    description,
    fee = 0,
  } = transaction;
  
  const isSendTransaction = type === 'send';
  const isDebit = ['send', 'stake'].includes(type);
  const isCredit = ['receive', 'unstake'].includes(type);
  
  // Format the date and time
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };
  
  // Get the time ago string
  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
    }
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`;
    }
    
    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears} ${diffInYears === 1 ? 'year' : 'years'} ago`;
  };
  
  // Generate transaction message
  const generateTransactionMessage = () => {
    switch(type) {
      case 'send':
        return `Sent to ${recipient && recipient.length > 12 
          ? recipient.substring(0, 8) + '...' 
          : recipient}`;
      case 'receive':
        return `Received from ${sender && sender.length > 12 
          ? sender.substring(0, 8) + '...' 
          : sender}`;
      case 'buy':
        return "Bought GCoin";
      case 'sell':
        return "Sold GCoin";
      case 'stake':
        return "Staked GCoin";
      case 'unstake':
        return "Unstaked GCoin";
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };
  
  // Copy transaction ID
  const copyTransactionId = () => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    toast.success({
      title: "Transaction ID copied",
      description: "Transaction ID has been copied to clipboard"
    });
    
    setTimeout(() => {
      setCopied(false);
    }, 3000);
  };
  
  // View receipt
  const viewReceipt = () => {
    setShowReceipt(true);
  };
  
  return (
    <>
      <div className={`py-4 px-4 hover:bg-gray-50 transition-colors ${className}`}>
        <div className="flex items-start">
          <div className={`rounded-full p-2 ${isCredit ? 'bg-green-100' : isDebit ? 'bg-red-100' : 'bg-gray-100'} mr-3`}>
            {isCredit ? (
              <ArrowDownLeft className="h-5 w-5 text-green-600" />
            ) : isDebit ? (
              <ArrowUpRight className="h-5 w-5 text-red-600" />
            ) : (
              <Calendar className="h-5 w-5 text-gray-600" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium">
                  {generateTransactionMessage()}
                </h4>
                <p className="text-sm text-gray-500 mt-0.5">
                  {description || type.charAt(0).toUpperCase() + type.slice(1)}
                </p>
              </div>
              
              <div className="text-right">
                <p className={`font-medium ${isCredit ? 'text-green-600' : isDebit ? 'text-red-600' : ''}`}>
                  {isDebit ? '- ' : isCredit ? '+ ' : ''}{formatNumber(amount)} GCoin
                </p>
                {fee > 0 && (
                  <p className="text-xs text-gray-500">
                    Fee: {formatNumber(fee)} GCoin
                  </p>
                )}
              </div>
            </div>
            
            <div className="mt-2 flex justify-between items-center">
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>{getTimeAgo(timestamp)}</span>
                </div>
                <span className="text-gray-300">•</span>
                <div>
                  {formatDate(timestamp)} {formatTime(timestamp)}
                </div>
              </div>
              
              <div className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={viewReceipt}
                >
                  <Receipt className="h-3.5 w-3.5" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={copyTransactionId}
                >
                  {copied ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            </div>
            
            <div className="mt-1">
              <p className="text-xs font-mono text-gray-400">
                ID: {id.substring(0, 8)}...{id.substring(id.length - 8)}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <TransactionReceipt
        open={showReceipt}
        onClose={() => setShowReceipt(false)}
        transaction={transaction}
      />
    </>
  );
};

export default TransactionItem;
