
import React from "react";
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

interface MiningRentalsSectionProps {
  activeRentals: ActiveRental[];
  miners: MinerData[];
  onClaimEarnings: (rentalId: string) => void;
  isLoading: boolean;
  isLoaded: boolean;
}

const MiningRentalsSection: React.FC<MiningRentalsSectionProps> = ({
  activeRentals,
  miners,
  onClaimEarnings,
  isLoading,
  isLoaded
}) => {
  if (activeRentals.length === 0) return null;

  return (
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
              onClaimEarnings={onClaimEarnings}
              disabled={isLoading}
            />
          );
        })}
      </div>
    </div>
  );
};

export default MiningRentalsSection;
