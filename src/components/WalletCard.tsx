
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, ArrowDownLeft, Eye, EyeOff, Copy, CheckCircle2, QrCode, Scan } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface WalletCardProps {
  className?: string;
}

const WalletCard = ({ className }: WalletCardProps) => {
  const [showBalance, setShowBalance] = useState(true);
  const [copied, setCopied] = useState(false);
  const { user } = useAuth();
  
  const walletAddress = user?.wallet_address || '';
  const balance = user?.balance || 0;

  const formattedBalance = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(balance);

  const shortenedAddress = walletAddress ? 
    `${walletAddress.substring(0, 8)}...${walletAddress.substring(walletAddress.length - 8)}` : 
    '';

  const copyToClipboard = async () => {
    if (!walletAddress) return;
    
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      toast({
        title: "Wallet address copied!",
        description: "The wallet address has been copied to your clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      toast({
        title: "Failed to copy",
        description: "Please try again or copy manually.",
        variant: "destructive",
      });
    }
  };

  // Calculate Naira equivalent (assuming 850 Naira per GCoin)
  const nairaEquivalent = balance * 850;
  const formattedNairaEquivalent = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN'
  }).format(nairaEquivalent);

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
        
        <div className="mb-4">
          {showBalance ? (
            <div>
              <div className="flex items-baseline">
                <span className="text-3xl font-bold">{formattedBalance}</span>
                <span className="ml-2 text-lg font-medium text-gcoin-blue">GCoin</span>
              </div>
              <div className="mt-1 text-sm text-gray-500">
                ≈ {formattedNairaEquivalent} NGN
              </div>
            </div>
          ) : (
            <div className="h-12 flex items-center">
              <span className="text-2xl">•••••••</span>
            </div>
          )}
        </div>
        
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1">
              <h3 className="text-sm font-medium text-gray-500">Wallet Address</h3>
              <span className="text-xs text-gray-400">({user?.username || 'You'})</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={copyToClipboard}
              aria-label="Copy wallet address"
              disabled={!walletAddress}
            >
              {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
            </Button>
          </div>
          <div 
            className="text-sm font-mono bg-gray-50 dark:bg-gray-800 py-2 px-3 rounded-md flex justify-between items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            onClick={copyToClipboard}
          >
            <span>{shortenedAddress || 'Connect to view address'}</span>
            <span className="text-xs text-gray-400">Click to copy</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-6 mb-4">
          <Link to="/send">
            <Button 
              className="bg-gcoin-blue/10 hover:bg-gcoin-blue/20 text-gcoin-blue flex items-center justify-center space-x-2 font-medium text-sm h-12 w-full"
              variant="ghost"
            >
              <ArrowUpRight className="h-4 w-4 mr-1.5" />
              <span>Send</span>
            </Button>
          </Link>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                className="bg-gcoin-yellow/10 hover:bg-gcoin-yellow/20 text-gcoin-yellow flex items-center justify-center space-x-2 font-medium text-sm h-12"
                variant="ghost"
              >
                <ArrowDownLeft className="h-4 w-4 mr-1.5" />
                <span>Receive</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Send GCoin to this address</DialogTitle>
                <DialogDescription>
                  Share your wallet address to receive GCoins from others
                </DialogDescription>
              </DialogHeader>
              
              <div className="flex flex-col items-center justify-center p-4">
                <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200 mb-4">
                  <div className="bg-gcoin-yellow/10 p-6 rounded-lg">
                    <div className="bg-white p-1 rounded-md">
                      {/* Placeholder for a QR code - in production you would use a QR code library */}
                      <div className="h-48 w-48 grid grid-cols-10 grid-rows-10 gap-0.5">
                        {Array.from({ length: 100 }).map((_, i) => (
                          <div 
                            key={i} 
                            className={`w-full h-full ${Math.random() > 0.7 ? 'bg-black' : 'bg-transparent'}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="w-full text-center mb-2">
                  <h3 className="text-sm font-medium mb-2">Wallet Address</h3>
                  <div 
                    onClick={copyToClipboard}
                    className="cursor-pointer text-sm font-mono bg-gray-50 hover:bg-gray-100 py-3 px-4 rounded-md flex items-center justify-center break-all"
                  >
                    {walletAddress || 'Connect to view address'}
                    {copied ? (
                      <CheckCircle2 className="h-4 w-4 ml-2 text-green-500 flex-shrink-0" />
                    ) : (
                      <Copy className="h-4 w-4 ml-2 text-gray-400 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Click to copy</p>
                </div>
                
                <div className="text-center mt-4">
                  <span className="inline-flex items-center text-sm font-medium text-green-500">
                    <span className="relative flex h-2 w-2 mr-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    Ready to receive GCoins
                  </span>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Link to="/buy-sell">
            <Button 
              className="bg-green-500/10 hover:bg-green-500/20 text-green-600 flex items-center justify-center space-x-2 font-medium text-sm h-12 w-full"
              variant="ghost"
            >
              <QrCode className="h-4 w-4 mr-1.5" />
              <span>Buy/Sell</span>
            </Button>
          </Link>
          
          <Link to="/send?scan=true">
            <Button 
              className="bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 flex items-center justify-center space-x-2 font-medium text-sm h-12 w-full"
              variant="ghost"
            >
              <Scan className="h-4 w-4 mr-1.5" />
              <span>Scan QR</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default WalletCard;
