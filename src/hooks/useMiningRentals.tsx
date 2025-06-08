
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
      
      // Check user balance first
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      if (profileData.balance < price) {
        throw new Error('Insufficient balance to rent this miner');
      }

      // Create the mining rental
      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + days * 24 * 60 * 60 * 1000);
      
      const { data: rentalData, error: rentalError } = await supabase
        .from('mining_rentals')
        .insert({
          user_id: user.id,
          miner_id: minerId,
          rental_days: days,
          rental_price: price,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          status: 'active',
          total_earnings: 0,
          claimed_earnings: 0
        })
        .select()
        .single();

      if (rentalError) throw rentalError;

      // Deduct the rental price from user balance
      const { error: balanceError } = await supabase
        .from('profiles')
        .update({ balance: profileData.balance - price })
        .eq('id', user.id);

      if (balanceError) throw balanceError;

      // Record the transaction
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'miner_rental',
          amount: price,
          fee: 0,
          recipient: 'Mining Pool',
          sender: 'You',
          status: 'completed',
          description: `Rented ${minerId.replace('-', ' ')} for ${days} days`
        });

      if (transactionError) throw transactionError;

      toast({
        title: "Miner Rented Successfully! ⛏️",
        description: `Miner rented for ${days} days. Mining will start automatically!`,
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
      
      // Get the rental details
      const { data: rental, error: rentalError } = await supabase
        .from('mining_rentals')
        .select('*')
        .eq('id', rentalId)
        .eq('user_id', user.id)
        .single();

      if (rentalError) throw rentalError;

      const now = new Date();
      const startTime = new Date(rental.start_time);
      const endTime = new Date(rental.end_time);
      
      // Calculate how much time has passed
      const timeElapsed = Math.min(now.getTime() - startTime.getTime(), endTime.getTime() - startTime.getTime());
      const hoursElapsed = timeElapsed / (1000 * 60 * 60);
      
      // Get miner hourly rate from the miners data
      const minerRates = {
        'free-miner': 25,
        'epic-miner': 75,
        'legendary-miner': 150,
        'super-miner': 300
      };
      
      const hourlyRate = minerRates[rental.miner_id as keyof typeof minerRates] || 25;
      const totalEarnings = hoursElapsed * hourlyRate;
      const claimableAmount = totalEarnings - rental.claimed_earnings;

      if (claimableAmount <= 0) {
        throw new Error('No earnings available to claim yet');
      }

      // Update rental with new claimed earnings
      const { error: updateError } = await supabase
        .from('mining_rentals')
        .update({
          total_earnings: totalEarnings,
          claimed_earnings: totalEarnings
        })
        .eq('id', rentalId);

      if (updateError) throw updateError;

      // Add earnings to user balance
      const { error: balanceError } = await supabase
        .from('profiles')
        .update({ balance: supabase.raw(`balance + ${claimableAmount}`) })
        .eq('id', user.id);

      if (balanceError) throw balanceError;

      // Record transaction
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'mining_reward',
          amount: claimableAmount,
          fee: 0,
          recipient: 'You',
          sender: 'Mining Pool',
          status: 'completed',
          description: `Mining earnings from ${rental.miner_id.replace('-', ' ')}`
        });

      if (transactionError) throw transactionError;
      
      toast({
        title: "Earnings Claimed! 🎉",
        description: `You claimed ${claimableAmount.toFixed(2)} GCoins from mining.`,
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
