
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MiningInfoCardProps {
  isLoaded: boolean;
}

const MiningInfoCard: React.FC<MiningInfoCardProps> = ({ isLoaded }) => {
  return (
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
  );
};

export default MiningInfoCard;
