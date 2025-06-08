
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

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

export const useMiningRentals = () => {
  const { user, refreshProfile } = useAuth();
  const [activeRentals, setActiveRentals] = useState<ActiveRental[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
        description: `Miner rented for ${days} days.`,
      });

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

  return {
    activeRentals,
    isLoading,
    rentMiner,
    claimEarnings,
    refreshRentals: fetchActiveRentals
  };
};
