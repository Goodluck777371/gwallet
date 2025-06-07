
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
    ownedCount?: number;
  };
  onStartMining: () => void;
  onPurchase: () => void;
  disabled: boolean;
  canStartMining?: boolean;
  activeSessionsCount?: number;
}

const MinerCard: React.FC<MinerProps> = ({ 
  miner, 
  onStartMining, 
  onPurchase, 
  disabled,
  canStartMining = true,
  activeSessionsCount = 0
}) => {
  // Calculate daily earning potential
  const hourlyRate = miner.ratePerSecond * 60 * 60;
  const dailyRate = hourlyRate * 24;
  
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md h-full flex flex-col">
      <CardHeader className="pb-2 flex-shrink-0">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base md:text-lg leading-tight">{miner.name}</CardTitle>
          <div className="flex flex-col gap-1 items-end">
            {miner.owned ? (
              <Badge className="bg-green-100 text-green-800 hover:bg-green-200 text-xs flex-shrink-0">
                Owned ({miner.ownedCount || 0})
              </Badge>
            ) : miner.price === 0 ? (
              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 text-xs flex-shrink-0">Free</Badge>
            ) : (
              <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 text-xs flex-shrink-0">
                {formatNumber(miner.price)} GCoin
              </Badge>
            )}
            {activeSessionsCount > 0 && (
              <Badge className="bg-orange-100 text-orange-800 text-xs">
                {activeSessionsCount} Mining
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 flex-grow">
        <div className="relative h-32 w-full bg-gray-100 rounded-md overflow-hidden">
          <img 
            src={miner.image} 
            alt={miner.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/placeholder.svg";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
        
        <div>
          <p className="text-sm text-gray-500 leading-relaxed">{miner.description}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="bg-gray-50 p-2 rounded">
            <div className="text-gray-500 text-xs">Mining duration</div>
            <div className="font-semibold">{miner.hours} hours</div>
          </div>
          
          <div className="bg-gray-50 p-2 rounded">
            <div className="text-gray-500 text-xs">Rate per hour</div>
            <div className="font-semibold text-xs">{formatNumber(hourlyRate)} GCoin</div>
          </div>
          
          <div className="bg-gray-50 p-2 rounded col-span-2">
            <div className="text-gray-500 text-xs">Potential daily earnings</div>
            <div className="font-semibold text-gcoin-blue text-sm">{formatNumber(dailyRate)} GCoin</div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex gap-2 pt-4 flex-shrink-0">
        {miner.owned || miner.price === 0 ? (
          <div className="w-full space-y-2">
            <Button 
              onClick={onStartMining}
              className="w-full bg-gcoin-blue hover:bg-gcoin-blue/90 text-sm"
              disabled={disabled || !canStartMining}
            >
              {canStartMining ? 'Start Mining' : 'All Miners Busy'}
            </Button>
            {miner.price > 0 && (
              <Button 
                onClick={onPurchase}
                variant="outline"
                className="w-full text-sm"
                disabled={disabled}
              >
                Buy Another
              </Button>
            )}
          </div>
        ) : (
          <Button 
            onClick={onPurchase}
            className="w-full bg-purple-600 hover:bg-purple-700 text-sm"
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
