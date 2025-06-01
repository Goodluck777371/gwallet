
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { formatNumber } from "@/lib/utils";
import { Clock, TrendingUp, Coins, AlertTriangle } from "lucide-react";

interface StakingPosition {
  id: string;
  amount: number;
  duration_days: number;
  estimated_reward: number;
  start_date: string;
  end_date: string;
  status: string;
}

const StakeForm = () => {
  const { user, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [duration, setDuration] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [stakingPositions, setStakingPositions] = useState<StakingPosition[]>([]);
  const [loadingPositions, setLoadingPositions] = useState(true);

  const durationOptions = [
    { value: "1", label: "1 Day", apr: 30 },
    { value: "3", label: "3 Days", apr: 30 },
    { value: "7", label: "7 Days", apr: 30 },
    { value: "30", label: "30 Days", apr: 30 }
  ];

  useEffect(() => {
    if (user?.id) {
      fetchStakingPositions();
    }
  }, [user?.id]);

  const fetchStakingPositions = async () => {
    try {
      setLoadingPositions(true);
      const { data, error } = await supabase
        .from('staking_positions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStakingPositions(data || []);
    } catch (error) {
      console.error('Error fetching staking positions:', error);
    } finally {
      setLoadingPositions(false);
    }
  };

  const calculateReward = (amount: number, days: number) => {
    const apr = 0.3; // 30% APR
    return (amount * apr * days) / 365;
  };

  const selectedDuration = durationOptions.find(d => d.value === duration);
  const numericAmount = parseFloat(amount) || 0;
  const estimatedReward = selectedDuration ? calculateReward(numericAmount, parseInt(selectedDuration.value)) : 0;

  const handleStake = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id || !amount || !duration) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const numericAmount = parseFloat(amount);
    if (numericAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than 0.",
        variant: "destructive",
      });
      return;
    }

    if (numericAmount > (user.balance || 0)) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough GCoins to stake this amount.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('stake_gcoin', {
        amount: numericAmount,
        duration_days: parseInt(duration)
      });

      if (error) throw error;

      toast({
        title: "Staking Successful! 🎉",
        description: `You've staked ${formatNumber(numericAmount)} GCoins for ${duration} days.`,
      });

      setAmount("");
      setDuration("");
      fetchStakingPositions();
      refreshProfile();
    } catch (error: any) {
      toast({
        title: "Staking Failed",
        description: error.message || "Failed to stake GCoins. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnstake = async (stakingId: string) => {
    if (!confirm("Are you sure you want to unstake? Early unstaking may incur a penalty.")) {
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.rpc('unstake_gcoin', {
        staking_id: stakingId
      });

      if (error) throw error;

      toast({
        title: "Unstaking Successful! 💰",
        description: "Your GCoins have been returned to your balance.",
      });

      fetchStakingPositions();
      refreshProfile();
    } catch (error: any) {
      toast({
        title: "Unstaking Failed",
        description: error.message || "Failed to unstake GCoins. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTimeRemaining = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return "Completed";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h remaining`;
    return `${hours}h remaining`;
  };

  const isCompleted = (endDate: string) => {
    return new Date() >= new Date(endDate);
  };

  return (
    <div className="space-y-6">
      {/* Staking Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg md:text-xl">
            <Coins className="h-5 w-5 mr-2" />
            Stake GCoins
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleStake} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="amount">Amount to Stake</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="0"
                  step="0.01"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Available: {formatNumber(user?.balance || 0)} GCoins
                </p>
              </div>
              
              <div>
                <Label htmlFor="duration">Staking Duration</Label>
                <Select value={duration} onValueChange={setDuration} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    {durationOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label} ({option.apr}% APR)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {numericAmount > 0 && selectedDuration && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Staking Summary</h4>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Staking Amount:</span>
                    <span className="font-medium">{formatNumber(numericAmount)} GCoins</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Duration:</span>
                    <span className="font-medium">{selectedDuration.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Estimated Reward:</span>
                    <span className="font-medium text-green-600">{formatNumber(estimatedReward)} GCoins</span>
                  </div>
                  <div className="flex justify-between border-t border-blue-200 pt-2">
                    <span className="text-blue-700 font-medium">Total Return:</span>
                    <span className="font-bold">{formatNumber(numericAmount + estimatedReward)} GCoins</span>
                  </div>
                </div>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || !amount || !duration}
            >
              {isLoading ? "Staking..." : "Stake GCoins"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Active Staking Positions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg md:text-xl">
            <TrendingUp className="h-5 w-5 mr-2" />
            Your Staking Positions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingPositions ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-gcoin-blue/20 border-t-gcoin-blue rounded-full"></div>
            </div>
          ) : stakingPositions.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No active staking positions</p>
              <p className="text-sm text-gray-400">Start staking to earn rewards!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {stakingPositions.map((position) => (
                <Card key={position.id} className="border-l-4 border-l-gcoin-blue">
                  <CardContent className="p-4">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="grid gap-4 md:grid-cols-3 flex-grow">
                        <div>
                          <p className="text-sm text-gray-500">Staked Amount</p>
                          <p className="font-semibold text-sm md:text-base">{formatNumber(position.amount)} GCoins</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Duration</p>
                          <p className="font-semibold text-sm md:text-base">{position.duration_days} days</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Estimated Reward</p>
                          <p className="font-semibold text-green-600 text-sm md:text-base">{formatNumber(position.estimated_reward)} GCoins</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 min-w-0">
                        <div className="text-center sm:text-right min-w-0">
                          <Badge 
                            className={`mb-1 ${
                              position.status === 'completed' 
                                ? 'bg-green-100 text-green-800' 
                                : position.status === 'canceled'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {position.status}
                          </Badge>
                          <p className="text-xs text-gray-500 break-all">
                            {getTimeRemaining(position.end_date)}
                          </p>
                        </div>
                        
                        {position.status === 'active' && (
                          <Button
                            onClick={() => handleUnstake(position.id)}
                            disabled={isLoading}
                            variant={isCompleted(position.end_date) ? "default" : "destructive"}
                            size="sm"
                            className="w-full sm:w-auto min-w-[100px] flex items-center justify-center gap-1"
                          >
                            {!isCompleted(position.end_date) && (
                              <AlertTriangle className="h-3 w-3" />
                            )}
                            <span className="text-xs">
                              {isCompleted(position.end_date) ? "Claim" : "Unstake"}
                            </span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StakeForm;
