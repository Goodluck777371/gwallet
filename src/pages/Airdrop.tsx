
import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import MinerRentalCard from "@/components/MinerRentalCard";
import ActiveRentalCard from "@/components/ActiveRentalCard";

interface MinerData {
  id: string;
  name: string;
  description: string;
  image: string;
  hourlyRate: number;
  baseDailyPrice: number;
}

interface ActiveRental {
  id: string;
  miner_id: string;
  rental_days: number;
  rental_price: number;
  start_time: string;
  end_time: string;
  total_earnings: number;
  claimed_earnings: number;
  status: string;
}

const Airdrop = () => {
  const { user, refreshProfile } = useAuth();
  const [activeRentals, setActiveRentals] = useState<ActiveRental[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const miners: MinerData[] = [
    {
      id: "free-miner",
      name: "Free Miner",
      description: "Basic mining equipment for beginners",
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop",
      hourlyRate: 0.1,
      baseDailyPrice: 0 // Free miner
    },
    {
      id: "epic-miner",
      name: "Epic Miner",
      description: "Advanced mining equipment for serious miners",
      image: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400&h=300&fit=crop",
      hourlyRate: 0.8,
      baseDailyPrice: 15
    },
    {
      id: "super-miner",
      name: "Super Miner",
      description: "High-performance mining with excellent returns",
      image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=300&fit=crop",
      hourlyRate: 8,
      baseDailyPrice: 150
    },
    {
      id: "legendary-miner",
      name: "Legendary Miner",
      description: "The ultimate mining machine for maximum profits",
      image: "https://images.unsplash.com/photo-1487887235947-a955ef187fcc?w=400&h=300&fit=crop",
      hourlyRate: 40,
      baseDailyPrice: 600
    }
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchActiveRentals();
    }
  }, [user?.id]);

  const fetchActiveRentals = async () => {
    try {
      const { data, error } = await supabase
        .from('mining_rentals')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setActiveRentals(data || []);
    } catch (error) {
      console.error('Error fetching active rentals:', error);
    }
  };

  const rentMiner = async (minerId: string, days: number, price: number) => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      console.log("Renting miner:", { minerId, days, price });
      
      const { data, error } = await supabase.rpc('rent_miner', {
        miner_id_param: minerId,
        rental_days_param: days,
        rental_price_param: price
      });

      if (error) throw error;

      toast({
        title: "Miner Rented Successfully! ⛏️",
        description: `${miners.find(m => m.id === minerId)?.name} rented for ${days} days.`,
      });

      // Refresh data
      await Promise.all([
        fetchActiveRentals(),
        refreshProfile()
      ]);

    } catch (error: any) {
      console.error('Error renting miner:', error);
      toast({
        title: "Rental Failed",
        description: error.message || "Failed to rent miner. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const claimEarnings = async (rentalId: string) => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      console.log("Claiming earnings for rental:", rentalId);
      
      const { data, error } = await supabase.rpc('claim_mining_earnings', {
        rental_id_param: rentalId
      });

      if (error) throw error;

      const claimedAmount = data;
      
      toast({
        title: "Earnings Claimed! 🎉",
        description: `You claimed ${claimedAmount.toFixed(2)} GCoins from mining.`,
      });

      // Refresh data
      await Promise.all([
        fetchActiveRentals(),
        refreshProfile()
      ]);

    } catch (error: any) {
      console.error('Error claiming earnings:', error);
      toast({
        title: "Claim Failed",
        description: error.message || "Failed to claim earnings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <Header />
      
      <main className="pt-20 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <Link to="/dashboard" className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-4">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </Link>
            
            <h1 className={`text-2xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent transition-all duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
              🎁 GCoin Mining Rentals
            </h1>
            <p className={`text-gray-600 text-base md:text-lg transition-all duration-500 delay-100 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
              Rent miners for different durations and earn GCoins continuously
            </p>
          </div>

          {/* Active Rentals */}
          {activeRentals.length > 0 && (
            <div className={`mb-8 transition-all duration-500 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-800">Your Active Mining Rentals</h2>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {activeRentals.map((rental) => {
                  const miner = miners.find(m => m.id === rental.miner_id);
                  return (
                    <ActiveRentalCard
                      key={rental.id}
                      rental={rental}
                      minerName={miner?.name || 'Unknown Miner'}
                      onClaimEarnings={claimEarnings}
                      disabled={isLoading}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Available Miners */}
          <div className={`transition-all duration-500 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <h2 className="text-xl md:text-2xl font-bold mb-6 text-gray-800">Available Mining Equipment</h2>
            <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {miners.map((miner) => (
                <MinerRentalCard
                  key={miner.id}
                  miner={miner}
                  onRentMiner={rentMiner}
                  disabled={isLoading}
                />
              ))}
            </div>
          </div>

          {/* Mining Info */}
          <div className={`mt-8 transition-all duration-500 delay-400 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg md:text-xl text-blue-800">Mining Rental Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-blue-700">
                <p>• Rent miners for 3, 7, or 14 days with volume discounts</p>
                <p>• Miners continue earning even after you claim rewards</p>
                <p>• Claim your earnings anytime during the rental period</p>
                <p>• Longer rentals offer better rates and higher profits</p>
                <p>• Free miner available to all users with no rental cost</p>
                <p>• All earnings are credited to your main GCoin balance</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Airdrop;
