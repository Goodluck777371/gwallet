
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Calculator, TrendingUp } from "lucide-react";

interface StakeFormProps {
  onSuccess: () => void;
}

const StakeForm = ({ onSuccess }: StakeFormProps) => {
  const { user, refreshProfile } = useAuth();
  const [amount, setAmount] = useState("");
  const [duration, setDuration] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const calculateReward = (stakeAmount: number, days: number): number => {
    // 15% APR, prorated
    return stakeAmount * (0.15 / 365) * days;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to stake GCoins",
        variant: "destructive",
      });
      return;
    }

    if (!amount || !duration) {
      toast({
        title: "Missing Information",
        description: "Please enter amount and select duration",
        variant: "destructive",
      });
      return;
    }

    const stakeAmount = parseFloat(amount);
    const stakeDuration = parseInt(duration);

    if (stakeAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid stake amount",
        variant: "destructive",
      });
      return;
    }

    if (user.balance < stakeAmount) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough GCoins to stake this amount",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log("Staking GCoins:", { amount: stakeAmount, duration: stakeDuration });
      
      const { data, error } = await supabase.rpc('stake_gcoin_v2', {
        amount: stakeAmount,
        duration_days: stakeDuration
      });

      if (error) {
        console.error("Staking error:", error);
        throw error;
      }

      console.log("Staking successful:", data);
      
      // Reset form
      setAmount("");
      setDuration("");
      
      // Refresh user profile
      await refreshProfile();
      
      onSuccess();
    } catch (error: any) {
      console.error("Staking error:", error);
      toast({
        title: "Staking Failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const stakeAmount = parseFloat(amount) || 0;
  const stakeDuration = parseInt(duration) || 0;
  const estimatedReward = calculateReward(stakeAmount, stakeDuration);
  const totalReturn = stakeAmount + estimatedReward;
  const apy = 15; // 15% APR

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount to Stake (GCoins)</Label>
          <Input
            id="amount"
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="1"
            step="0.01"
            required
          />
          {user?.balance && (
            <p className="text-sm text-gray-500">
              Available balance: {user.balance.toLocaleString()} GCoins
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="duration">Staking Duration</Label>
          <Select value={duration} onValueChange={setDuration} required>
            <SelectTrigger>
              <SelectValue placeholder="Select duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 Day</SelectItem>
              <SelectItem value="3">3 Days</SelectItem>
              <SelectItem value="7">7 Days</SelectItem>
              <SelectItem value="30">30 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {stakeAmount > 0 && stakeDuration > 0 && (
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-green-700 font-medium">
                <Calculator className="h-4 w-4" />
                Staking Preview
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">Stake Amount</div>
                  <div className="font-semibold">{stakeAmount.toLocaleString()} GCoins</div>
                </div>
                <div>
                  <div className="text-gray-500">Duration</div>
                  <div className="font-semibold">{stakeDuration} day{stakeDuration > 1 ? 's' : ''}</div>
                </div>
                <div>
                  <div className="text-gray-500">Estimated Reward</div>
                  <div className="font-semibold text-green-600">+{estimatedReward.toFixed(2)} GCoins</div>
                </div>
                <div>
                  <div className="text-gray-500">Total Return</div>
                  <div className="font-semibold text-green-600">{totalReturn.toFixed(2)} GCoins</div>
                </div>
              </div>
              
              <div className="pt-2 border-t border-green-200">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Annual Percentage Yield (APY)</span>
                  <span className="font-semibold text-green-600 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {apy}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Button 
          type="submit" 
          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
          disabled={isLoading || !amount || !duration}
        >
          {isLoading ? "Staking..." : "Stake GCoins"}
        </Button>
      </form>

      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-4">
          <h3 className="font-medium text-blue-800 mb-2">Staking Information</h3>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Earn 15% APY on your staked GCoins (reduced from 30%)</li>
            <li>• Early unstaking incurs a 10% penalty on principal</li>
            <li>• Rewards are automatically added at completion</li>
            <li>• Minimum stake: 1 GCoin</li>
            <li>• Staking periods: 1, 3, 7, or 30 days</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default StakeForm;
