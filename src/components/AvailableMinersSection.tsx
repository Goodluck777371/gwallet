
import React from "react";
import MinerRentalCard from "@/components/MinerRentalCard";

interface MinerData {
  id: string;
  name: string;
  description: string;
  image: string;
  hourlyRate: number;
  baseDailyPrice: number;
}

interface AvailableMinersSectionProps {
  miners: MinerData[];
  onRentMiner: (minerId: string, days: number, price: number) => void;
  isLoading: boolean;
  isLoaded: boolean;
}

const AvailableMinersSection: React.FC<AvailableMinersSectionProps> = ({
  miners,
  onRentMiner,
  isLoading,
  isLoaded
}) => {
  return (
    <div className={`transition-all duration-500 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      <h2 className="text-xl md:text-2xl font-bold mb-6 text-gray-800">Available Mining Equipment</h2>
      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {miners.map((miner) => (
          <MinerRentalCard
            key={miner.id}
            miner={miner}
            onRentMiner={onRentMiner}
            disabled={isLoading}
          />
        ))}
      </div>
    </div>
  );
};

export default AvailableMinersSection;
