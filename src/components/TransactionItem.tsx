
import { useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { ArrowUpRight, ArrowDownLeft, CheckCircle, Clock, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

export interface Transaction {
  id: string;
  type: "send" | "receive";
  amount: number;
  recipient: string;
  sender: string;
  timestamp: Date;
  status: "pending" | "completed" | "failed";
  description?: string;
  fee: number;
}

interface TransactionItemProps {
  transaction: Transaction;
  showToast?: boolean;
  className?: string;
}

const TransactionItem = ({ transaction, showToast = false, className }: TransactionItemProps) => {
  const { user } = useAuth();
  
  // Format amount with 2 decimal places
  const formattedAmount = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(transaction.amount);
  
  // Format timestamp as "X time ago"
  const timeAgo = formatDistanceToNow(transaction.timestamp, { addSuffix: true });
  
  // Get partner address (recipient if sending, sender if receiving)
  const partnerAddress = transaction.type === 'send' ? transaction.recipient : transaction.sender;
  
  // Shorten partner address for display
  const shortenedAddress = partnerAddress ? 
    `${partnerAddress.substring(0, 6)}...${partnerAddress.substring(partnerAddress.length - 6)}` : 
    '';

  // Determine status icon
  const StatusIcon = () => {
    switch (transaction.status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <X className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  // Show toast notification for new transactions
  useEffect(() => {
    if (showToast) {
      if (transaction.type === 'receive') {
        toast.credit({
          title: "Payment Received",
          description: `You received ${formattedAmount} GCoin from ${shortenedAddress}`,
        });
      } else {
        toast.debit({
          title: "Payment Sent",
          description: `You sent ${formattedAmount} GCoin to ${shortenedAddress}`,
        });
      }
    }
  }, [showToast, transaction.type, formattedAmount, shortenedAddress]);

  return (
    <div className={cn("flex items-center p-4", className)}>
      <div 
        className={cn(
          "flex items-center justify-center w-10 h-10 rounded-full mr-4",
          transaction.type === 'receive' ? "bg-green-100" : "bg-red-100"
        )}
      >
        {transaction.type === 'receive' ? (
          <ArrowDownLeft className="h-5 w-5 text-green-600" />
        ) : (
          <ArrowUpRight className="h-5 w-5 text-red-600" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h4 className="text-sm font-medium truncate">
            {transaction.type === 'receive' ? `Received from ${shortenedAddress}` : `Sent to ${shortenedAddress}`}
          </h4>
          <div className="flex items-center">
            <StatusIcon />
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">{timeAgo}</p>
          <p className={cn(
            "font-medium",
            transaction.type === 'receive' ? "text-green-600" : "text-red-600"
          )}>
            {transaction.type === 'receive' ? '+' : '-'}{formattedAmount} GCoin
          </p>
        </div>
        
        {transaction.description && (
          <p className="text-xs text-gray-500 mt-1 truncate">{transaction.description}</p>
        )}
      </div>
    </div>
  );
};

export default TransactionItem;
