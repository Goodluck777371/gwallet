
import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import MiningRentalsSection from "@/components/MiningRentalsSection";
import AvailableMinersSection from "@/components/AvailableMinersSection";
import MiningInfoCard from "@/components/MiningInfoCard";
import { useMiningRentals } from "@/hooks/useMiningRentals";
import { miners } from "@/data/minersData";

const Airdrop = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const { activeRentals, isLoading, rentMiner, claimEarnings } = useMiningRentals();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

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

          <MiningRentalsSection
            activeRentals={activeRentals}
            miners={miners}
            onClaimEarnings={claimEarnings}
            isLoading={isLoading}
            isLoaded={isLoaded}
          />

          <AvailableMinersSection
            miners={miners}
            onRentMiner={rentMiner}
            isLoading={isLoading}
            isLoaded={isLoaded}
          />

          <MiningInfoCard isLoaded={isLoaded} />
        </div>
      </main>
    </div>
  );
};

export default Airdrop;
