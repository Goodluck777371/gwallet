
import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/Header";
import BuySellForm from "@/components/BuySellForm";
import PaystackPayment from "@/components/PaystackPayment";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Buy = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({
    amount: 0,
    gcoinsAmount: 0
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleSuccess = (amount: number, gcoinsAmount: number) => {
    // Instead of showing toast right away, open payment dialog
    setPaymentDetails({
      amount,
      gcoinsAmount
    });
    setShowPaymentDialog(true);
  };

  // This function is passed to PaystackPayment and will be called without arguments
  const handlePaymentSuccess = () => {
    setShowPaymentDialog(false);
    // Payment success handling is done by PaystackPayment component
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
              Buy GCoins
            </h1>
            <p className={`text-gray-500 transition-all duration-500 delay-100 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
              Purchase GCoins with your preferred currency
            </p>
          </div>
          
          <div className={`bg-white rounded-xl shadow-sm p-6 transition-all duration-500 delay-200 transform ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <BuySellForm mode="buy" onSuccess={handleSuccess} />
          </div>
        </div>
      </main>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Your Purchase</DialogTitle>
            <DialogDescription>
              You're buying {paymentDetails.gcoinsAmount} GCoins for ₦{paymentDetails.amount.toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <PaystackPayment 
              amount={paymentDetails.amount} 
              email={user?.email || ''}
              gcoinsAmount={paymentDetails.gcoinsAmount}
              onSuccess={handlePaymentSuccess}
              onClose={() => setShowPaymentDialog(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Buy;
