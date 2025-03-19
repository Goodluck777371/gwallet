
import React from "react";
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  CheckCircle2, 
  XCircle,
  RotateCcw
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface Transaction {
  id: string;
  type: "send" | "receive" | "stake" | "unstake" | "convert";
  amount: number;
  timestamp: Date;
  status: "completed" | "pending" | "failed" | "refunded";
  recipient?: string;
  sender?: string;
  description?: string;
  fee?: number;
}

export interface TransactionItemProps {
  transaction: Transaction;
  className?: string;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, className }) => {
  const {
    type,
    amount,
    timestamp,
    status,
    recipient,
    sender,
    description,
    fee
  } = transaction;
  
  // Format date for display
  const formattedDate = new Date(timestamp).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  
  // Format time for display
  const formattedTime = new Date(timestamp).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
  
  // Get icon based on transaction type
  const getIcon = () => {
    switch (type) {
      case "send":
        return <ArrowUpRight className="h-5 w-5 text-red-500" />;
      case "receive":
        return <ArrowDownLeft className="h-5 w-5 text-green-500" />;
      case "stake":
        return <ArrowUpRight className="h-5 w-5 text-blue-500" />;
      case "unstake":
        return <ArrowDownLeft className="h-5 w-5 text-purple-500" />;
      case "convert":
        return <ArrowUpRight className="h-5 w-5 text-orange-500" />;
      default:
        return <ArrowUpRight className="h-5 w-5 text-gray-500" />;
    }
  };
  
  // Get status icon
  const getStatusIcon = () => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "refunded":
        return <RotateCcw className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };
  
  // Get transaction title
  const getTitle = () => {
    switch (type) {
      case "send":
        return `Sent GCoin${recipient ? ` to ${recipient.substring(0, 8)}...` : ""}`;
      case "receive":
        return `Received GCoin${sender ? ` from ${sender.substring(0, 8)}...` : ""}`;
      case "stake":
        return "Staked GCoin";
      case "unstake":
        return "Unstaked GCoin";
      case "convert":
        return "Converted GCoin";
      default:
        return "Unknown Transaction";
    }
  };
  
  return (
    <div className={cn("flex items-center p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors", className)}>
      <div className="mr-4 bg-gray-100 rounded-full p-2">
        {getIcon()}
      </div>
      
      <div className="flex-1">
        <div className="flex justify-between">
          <h4 className="font-medium text-gray-900">{getTitle()}</h4>
          <div className={cn(
            "font-semibold",
            type === "send" || type === "stake" || type === "convert" ? "text-red-600" : "text-green-600"
          )}>
            {type === "send" || type === "stake" || type === "convert" ? "-" : "+"}
            {amount} GCoin
          </div>
        </div>
        
        <div className="flex justify-between mt-1">
          <div className="text-sm text-gray-500 flex items-center">
            {getStatusIcon()}
            <span className="ml-1 capitalize">{status}</span>
            {fee !== undefined && fee > 0 && (
              <span className="ml-2 text-gray-400">• Fee: {fee} GCoin</span>
            )}
          </div>
          <div className="text-sm text-gray-500">
            {formattedDate}, {formattedTime}
          </div>
        </div>
        
        {description && (
          <div className="mt-1 text-sm text-gray-500">
            <span className="text-gray-400">Note:</span> {description}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionItem;
