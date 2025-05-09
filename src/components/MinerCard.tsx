
import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatNumber } from "@/lib/utils";

interface MinerProps {
  miner: {
    id: string;
    name: string;
    description: string;
    image: string;
    hours: number;
    ratePerSecond: number;
    price: number;
    owned: boolean;
  };
  onStartMining: () => void;
  onPurchase: () => void;
  disabled: boolean;
}

const MinerCard: React.FC<MinerProps> = ({ 
  miner, 
  onStartMining, 
  onPurchase, 
  disabled 
}) => {
  // Calculate daily earning potential
  const hourlyRate = miner.ratePerSecond * 60 * 60;
  const dailyRate = hourlyRate * 24;
  
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{miner.name}</CardTitle>
          {miner.owned ? (
            <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Owned</Badge>
          ) : miner.price === 0 ? (
            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Free</Badge>
          ) : (
            <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">
              {formatNumber(miner.price)} GCoin
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative h-32 w-full bg-gray-100 rounded-md overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <img 
              src={miner.image || "/placeholder.svg"} 
              alt={miner.name}
              className="h-24 w-24 object-contain animate-bounce"
              style={{ animationDuration: '2s' }}
            />
          </div>
        </div>
        
        <div>
          <p className="text-sm text-gray-500">{miner.description}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="bg-gray-50 p-2 rounded">
            <div className="text-gray-500">Mining duration</div>
            <div className="font-semibold">{miner.hours} hours</div>
          </div>
          
          <div className="bg-gray-50 p-2 rounded">
            <div className="text-gray-500">Rate per hour</div>
            <div className="font-semibold">{formatNumber(hourlyRate)} GCoin</div>
          </div>
          
          <div className="bg-gray-50 p-2 rounded col-span-2">
            <div className="text-gray-500">Potential daily earnings</div>
            <div className="font-semibold text-gcoin-blue">{formatNumber(dailyRate)} GCoin</div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex gap-2">
        {miner.owned || miner.price === 0 ? (
          <Button 
            onClick={onStartMining}
            className="w-full bg-gcoin-blue hover:bg-gcoin-blue/90"
            disabled={disabled}
          >
            Start Mining
          </Button>
        ) : (
          <Button 
            onClick={onPurchase}
            className="w-full bg-purple-600 hover:bg-purple-700"
            disabled={disabled}
          >
            Buy Miner
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default MinerCard;
