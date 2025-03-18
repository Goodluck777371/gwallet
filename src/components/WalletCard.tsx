
import { useState } from "react";
import { ArrowUpRight, ArrowDownLeft, Eye, EyeOff, Copy, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface WalletCardProps {
  balance: number;
  walletAddress: string;
  className?: string;
}

const WalletCard = ({ balance, walletAddress, className }: WalletCardProps) => {
  const [showBalance, setShowBalance] = useState(true);
  const [copied, setCopied] = useState(false);

  const formattedBalance = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(balance);

  const shortenedAddress = `${walletAddress.substring(0, 8)}...${walletAddress.substring(walletAddress.length - 8)}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className={cn(
      "glass-card rounded-2xl p-6 overflow-hidden relative transition-all duration-300",
      "hover:shadow-lg transform hover:-translate-y-1",
      className
    )}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gcoin-blue/10 rounded-full -mr-16 -mt-16 z-0" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gcoin-yellow/10 rounded-full -ml-12 -mb-12 z-0" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-medium text-gray-500">Your Balance</h3>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setShowBalance(!showBalance)}
            aria-label={showBalance ? "Hide balance" : "Show balance"}
          >
            {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
        
        <div className="mb-6">
          {showBalance ? (
            <div className="flex items-baseline">
              <span className="text-3xl font-bold">{formattedBalance}</span>
              <span className="ml-2 text-lg font-medium text-gcoin-blue">GCoin</span>
            </div>
          ) : (
            <div className="h-9 flex items-center">
              <span className="text-2xl">•••••••</span>
            </div>
          )}
        </div>
        
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-medium text-gray-500">Wallet Address</h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={copyToClipboard}
              aria-label="Copy wallet address"
            >
              {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
            </Button>
          </div>
          <p className="text-sm font-mono bg-gray-50 dark:bg-gray-800 py-2 px-3 rounded-md">{shortenedAddress}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-6">
          <Button 
            className="bg-gcoin-blue/10 hover:bg-gcoin-blue/20 text-gcoin-blue flex items-center justify-center space-x-2 font-medium text-sm h-12"
            variant="ghost"
          >
            <ArrowUpRight className="h-4 w-4 mr-1.5" />
            <span>Send</span>
          </Button>
          <Button 
            className="bg-gcoin-yellow/10 hover:bg-gcoin-yellow/20 text-gcoin-yellow flex items-center justify-center space-x-2 font-medium text-sm h-12"
            variant="ghost"
          >
            <ArrowDownLeft className="h-4 w-4 mr-1.5" />
            <span>Receive</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WalletCard;
