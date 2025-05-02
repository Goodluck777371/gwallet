
import { Fragment } from "react";
import { ArrowDownLeft, ArrowUpRight, CheckCircle2, Clock, AlertTriangle, Info, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export interface Transaction {
  id: string;
  type: "send" | "receive";
  amount: number;
  recipient: string;
  sender: string;
  timestamp: Date;
  status: "completed" | "pending" | "failed";
  description?: string;
  fee?: number;
}

interface TransactionItemProps {
  transaction: Transaction;
  className?: string;
}

const TransactionItem = ({ transaction, className }: TransactionItemProps) => {
  const { toast } = useToast();

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return "Just now";
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} ${diffInMinutes === 1 ? "minute" : "minutes"} ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
    } else {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      }).format(date);
    }
  };

  const getStatusIcon = () => {
    switch (transaction.status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "failed":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const copyTransactionId = async () => {
    try {
      await navigator.clipboard.writeText(transaction.id);
      toast({
        title: "Copied!",
        description: "Transaction ID copied to clipboard.",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again or copy manually.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className={cn("p-4 hover:bg-gray-50 transition-colors", className)}>
      <div className="flex items-center">
        <div className={cn(
          "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-3",
          transaction.type === "receive" 
            ? "bg-green-100" 
            : "bg-red-100"
        )}>
          {transaction.type === "receive" ? (
            <ArrowDownLeft className="h-5 w-5 text-green-600" />
          ) : (
            <ArrowUpRight className="h-5 w-5 text-red-600" />
          )}
        </div>
        
        <div className="flex-grow min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-sm font-medium">
                {transaction.type === "receive" ? "Received GCoins" : "Sent GCoins"}
              </h4>
              <p className="text-xs text-gray-500 flex items-center">
                {transaction.type === "receive" ? 
                  <Fragment>From: <span className="font-medium ml-1">{transaction.sender}</span></Fragment> : 
                  <Fragment>To: <span className="font-medium ml-1">{transaction.recipient}</span></Fragment>
                }
                <span className="inline-flex items-center ml-2">
                  <User className="h-3 w-3 mr-1 text-gray-400" />
                  {transaction.type === "receive" ? transaction.sender : transaction.recipient}
                </span>
              </p>
            </div>
            <div className="text-right">
              <p className={cn(
                "text-sm font-semibold",
                transaction.type === "receive" ? "text-green-600" : "text-red-600"
              )}>
                {transaction.type === "receive" ? "+" : "-"}{transaction.amount.toFixed(2)} GCoin
              </p>
              <p className="text-xs text-gray-500">
                {formatTimestamp(transaction.timestamp)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center text-xs">
              <span className="inline-flex items-center text-gray-500">
                {getStatusIcon()}
                <span className="ml-1 capitalize">{transaction.status}</span>
              </span>
              {transaction.description && (
                <span className="ml-2 text-gray-500 truncate max-w-[150px] sm:max-w-xs">
                  • {transaction.description}
                </span>
              )}
            </div>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 text-xs text-gray-500 hover:text-gray-700"
                >
                  <Info className="h-3 w-3 mr-1" />
                  Details
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className={cn(
                    "flex items-center",
                    transaction.type === "receive" ? "text-green-600" : "text-red-600"
                  )}>
                    {transaction.type === "receive" ? (
                      <>
                        <ArrowDownLeft className="h-5 w-5 mr-2" />
                        Received GCoins
                      </>
                    ) : (
                      <>
                        <ArrowUpRight className="h-5 w-5 mr-2" />
                        Sent GCoins
                      </>
                    )}
                  </DialogTitle>
                  <DialogDescription>
                    Transaction details and information
                  </DialogDescription>
                </DialogHeader>
                
                <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Status:</span>
                    <span className="inline-flex items-center font-medium">
                      {getStatusIcon()}
                      <span className="ml-1 capitalize">{transaction.status}</span>
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Amount:</span>
                    <span className={cn(
                      "font-medium",
                      transaction.type === "receive" ? "text-green-600" : "text-red-600"
                    )}>
                      {transaction.type === "receive" ? "+" : "-"}{transaction.amount.toFixed(2)} GCoin
                    </span>
                  </div>
                  
                  {transaction.fee && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Fee:</span>
                      <span className="font-medium">{transaction.fee.toFixed(2)} GCoin</span>
                    </div>
                  )}
                  
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        {transaction.type === "receive" ? "From:" : "To:"}
                      </span>
                      <span className="font-medium">
                        {transaction.type === "receive" ? transaction.sender : transaction.recipient}
                      </span>
                    </div>
                  </div>
                  
                  {transaction.description && (
                    <div className="pt-2 border-t border-gray-200">
                      <div className="flex justify-between items-start">
                        <span className="text-sm text-gray-500">Note:</span>
                        <span className="font-medium text-sm text-right max-w-[70%]">
                          {transaction.description}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Transaction ID:</span>
                      <div className="flex items-center">
                        <span 
                          className="font-mono text-xs bg-gray-100 py-1 px-2 rounded cursor-pointer hover:bg-gray-200"
                          onClick={copyTransactionId}
                        >
                          {transaction.id}
                        </span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={copyTransactionId}
                          className="ml-1 h-auto p-1"
                        >
                          <span className="sr-only">Copy</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                          </svg>
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Date & Time:</span>
                      <span className="font-medium text-sm">
                        {new Intl.DateTimeFormat('en-US', {
                          dateStyle: 'medium',
                          timeStyle: 'short'
                        }).format(transaction.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionItem;
