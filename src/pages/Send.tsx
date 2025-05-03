
import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { SendMoneyForm } from "@/components/SendMoneyForm";

// Parse query params
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const Send = () => {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [isLoaded, setIsLoaded] = useState(false);
  const query = useQuery();
  const addressFromQR = query.get('address');

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Show toast if we got an address from QR code
    if (addressFromQR) {
      toast({
        title: "Address Scanned",
        description: `Recipient address: ${addressFromQR.substring(0, 8)}...${addressFromQR.substring(addressFromQR.length - 8)}`,
      });
    }
  }, [addressFromQR, toast]);

  const handleTransactionSuccess = () => {
    toast({
      title: "Transfer Successful! 🎉",
      description: "Your GCoins have been sent successfully.",
      variant: "debit", // Using our new variant for debit transactions
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-20 pb-16 px-4">
        <div className="max-w-md mx-auto">
          <div className="mb-8">
            <Link to="/dashboard" className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-4">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </Link>
            
            <h1 className={`text-3xl font-bold mb-2 transition-all duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
              Send GCoins
            </h1>
            <p className={`text-gray-500 transition-all duration-500 delay-100 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
              Transfer GCoins to another wallet
            </p>
          </div>
          
          <div className={`bg-white rounded-xl shadow-sm p-6 transition-all duration-500 delay-200 transform ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <SendMoneyForm 
              onSuccess={handleTransactionSuccess} 
              initialRecipient={addressFromQR || ''}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Send;
