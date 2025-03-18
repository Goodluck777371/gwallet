
import { ArrowDownLeft, ArrowUpRight, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface Transaction {
  id: string;
  type: "send" | "receive";
  amount: number;
  recipient: string;
  sender: string;
  timestamp: Date;
  status: "completed" | "pending" | "failed";
  description?: string;
}

interface TransactionItemProps {
  transaction: Transaction;
  className?: string;
}

const TransactionItem = ({ transaction, className }: TransactionItemProps) => {
  const { type, amount, recipient, sender, timestamp, status, description } = transaction;
  
  const formattedAmount = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
  
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(timestamp);

  const getStatusColor = () => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "failed":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getPartyName = () => {
    return type === "send" ? recipient : sender;
  };

  const shortenAddress = (address: string) => {
    return address.length > 16 
      ? `${address.substring(0, 8)}...${address.substring(address.length - 8)}`
      : address;
  };

  return (
    <div className={cn(
      "flex items-center p-4 rounded-xl transition-colors hover:bg-gray-50 dark:hover:bg-gray-800",
      className
    )}>
      <div className={cn(
        "flex items-center justify-center w-10 h-10 rounded-full mr-4",
        type === "send" ? "bg-red-100" : "bg-green-100"
      )}>
        {type === "send" ? (
          <ArrowUpRight className="h-5 w-5 text-red-500" />
        ) : (
          <ArrowDownLeft className="h-5 w-5 text-green-500" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center">
          <p className="text-sm font-medium truncate">
            {type === "send" ? "Sent to" : "Received from"} {shortenAddress(getPartyName())}
          </p>
          {description && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 ml-1.5 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-xs">{description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <p className="text-xs text-gray-500">{formattedDate}</p>
      </div>
      
      <div className="text-right">
        <p className={cn(
          "text-sm font-semibold",
          type === "send" ? "text-red-500" : "text-green-500"
        )}>
          {type === "send" ? "-" : "+"}{formattedAmount} GCoin
        </p>
        <div className="flex items-center justify-end mt-1">
          <div className={cn("h-2 w-2 rounded-full mr-1.5", getStatusColor())} />
          <span className="text-xs text-gray-500 capitalize">{status}</span>
        </div>
      </div>
    </div>
  );
};

export default TransactionItem;
