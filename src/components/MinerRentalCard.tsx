
import React, { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatNumber } from "@/lib/utils";

interface MinerRentalProps {
  miner: {
    id: string;
    name: string;
    description: string;
    image: string;
    hourlyRate: number;
    baseDailyPrice: number;
  };
  onRentMiner: (minerId: string, days: number, price: number) => void;
  disabled: boolean;
}

const MinerRentalCard: React.FC<MinerRentalProps> = ({ 
  miner, 
  onRentMiner, 
  disabled
}) => {
  const [selectedDays, setSelectedDays] = useState<number>(3);

  // Calculate pricing based on duration (longer rentals get discounts)
  const calculatePrice = (days: number) => {
    const basePrice = miner.baseDailyPrice * days;
    switch (days) {
      case 3:
        return basePrice; // No discount
      case 7:
        return Math.floor(basePrice * 0.9); // 10% discount
      case 14:
        return Math.floor(basePrice * 0.8); // 20% discount
      default:
        return basePrice;
    }
  };

  const calculatePotentialEarnings = (days: number) => {
    return miner.hourlyRate * 24 * days;
  };

  const selectedPrice = calculatePrice(selectedDays);
  const potentialEarnings = calculatePotentialEarnings(selectedDays);
  const estimatedProfit = potentialEarnings - selectedPrice;

  const handleRent = () => {
    onRentMiner(miner.id, selectedDays, selectedPrice);
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md h-full flex flex-col">
      <CardHeader className="pb-2 flex-shrink-0">
        <CardTitle className="text-base md:text-lg leading-tight">{miner.name}</CardTitle>
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
        
        <p className="text-sm text-gray-500 leading-relaxed">{miner.description}</p>
        
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Rental Duration
            </label>
            <Select value={selectedDays.toString()} onValueChange={(value) => setSelectedDays(Number(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 Days</SelectItem>
                <SelectItem value="7">7 Days (10% off)</SelectItem>
                <SelectItem value="14">14 Days (20% off)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-gray-50 p-2 rounded">
              <div className="text-gray-500 text-xs">Rental Cost</div>
              <div className="font-semibold text-red-600">{formatNumber(selectedPrice)} GCoin</div>
            </div>
            
            <div className="bg-gray-50 p-2 rounded">
              <div className="text-gray-500 text-xs">Rate/Hour</div>
              <div className="font-semibold">{formatNumber(miner.hourlyRate)} GCoin</div>
            </div>
            
            <div className="bg-green-50 p-2 rounded col-span-2">
              <div className="text-gray-500 text-xs">Total Earnings Potential</div>
              <div className="font-semibold text-green-600">{formatNumber(potentialEarnings)} GCoin</div>
            </div>
            
            <div className="bg-blue-50 p-2 rounded col-span-2">
              <div className="text-gray-500 text-xs">Estimated Profit</div>
              <div className={`font-semibold ${estimatedProfit > 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {estimatedProfit > 0 ? '+' : ''}{formatNumber(estimatedProfit)} GCoin
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-4 flex-shrink-0">
        <Button 
          onClick={handleRent}
          className="w-full bg-purple-600 hover:bg-purple-700 text-sm"
          disabled={disabled}
        >
          Rent for {selectedDays} Days
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MinerRentalCard;
