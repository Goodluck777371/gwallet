
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Gift, Clock } from "lucide-react";
import { formatNumber } from "@/lib/utils";

interface ActiveRental {
  id: string;
  miner_id: string;
  rental_days: number;
  start_time: string;
  end_time: string;
  total_earnings: number;
  claimed_earnings: number;
  status: string;
}

interface ActiveRentalCardProps {
  rental: ActiveRental;
  minerName: string;
  onClaimEarnings: (rentalId: string) => void;
  disabled: boolean;
}

const ActiveRentalCard: React.FC<ActiveRentalCardProps> = ({
  rental,
  minerName,
  onClaimEarnings,
  disabled
}) => {
  const now = new Date();
  const startTime = new Date(rental.start_time);
  const endTime = new Date(rental.end_time);
  
  const totalDuration = endTime.getTime() - startTime.getTime();
  const elapsed = Math.min(now.getTime() - startTime.getTime(), totalDuration);
  const progress = Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));
  
  const isCompleted = now >= endTime;
  const timeRemaining = isCompleted ? 0 : Math.max(0, endTime.getTime() - now.getTime());
  
  // Calculate current earnings based on progress
  const hourlyRate = {
    'free-miner': 0.1,
    'epic-miner': 0.8,
    'super-miner': 8,
    'legendary-miner': 40
  }[rental.miner_id] || 0.1;
  
  const elapsedHours = elapsed / (1000 * 60 * 60);
  const currentEarnings = Math.min(elapsedHours * hourlyRate, rental.rental_days * 24 * hourlyRate);
  const claimableAmount = Math.max(0, currentEarnings - rental.claimed_earnings);
  
  const formatTimeRemaining = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      return `${days}d ${remainingHours}h`;
    }
    return `${hours}h ${minutes}m`;
  };

  return (
    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base md:text-lg">{minerName}</CardTitle>
          <div className="flex flex-col items-end gap-1">
            <Badge className={`${isCompleted ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'} text-xs`}>
              {isCompleted ? 'Completed' : 'Active'}
            </Badge>
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {rental.rental_days} days
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <div className="text-gray-500 text-xs">Earned</div>
            <div className="font-semibold text-green-600">
              {formatNumber(currentEarnings)} GCoins
            </div>
          </div>
          <div>
            <div className="text-gray-500 text-xs">Claimed</div>
            <div className="font-semibold">
              {formatNumber(rental.claimed_earnings)} GCoins
            </div>
          </div>
          <div className="col-span-2">
            <div className="text-gray-500 text-xs">Available to Claim</div>
            <div className="font-semibold text-blue-600">
              {formatNumber(claimableAmount)} GCoins
            </div>
          </div>
        </div>
        
        {!isCompleted && (
          <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded">
            Time remaining: {formatTimeRemaining(timeRemaining)}
          </div>
        )}
        
        <Button
          onClick={() => onClaimEarnings(rental.id)}
          disabled={disabled || claimableAmount <= 0}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-sm"
        >
          <Gift className="h-4 w-4 mr-2" />
          {claimableAmount > 0 ? `Claim ${formatNumber(claimableAmount)} GCoins` : 'No earnings to claim'}
        </Button>
        
        <div className="text-xs text-gray-500 text-center">
          Progress: {Math.round(progress)}% • Continues mining until {endTime.toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActiveRentalCard;
