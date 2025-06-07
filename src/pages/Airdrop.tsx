import { useState, useEffect } from "react";
import { ArrowLeft, Play, Pause, Gift } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import MinerCard from "@/components/MinerCard";
import { formatNumber } from "@/lib/utils";

interface Miner {
  id: string;
  name: string;
  description: string;
  image: string;
  hours: number;
  ratePerSecond: number;
  price: number;
  owned: boolean;
  ownedCount?: number;
}

interface MiningSession {
  id: string;
  miner_id: string;
  start_time: string;
  end_time: string;
  estimated_earning: number;
  amount_earned: number;
  claimed: boolean;
  rate_per_second: number;
}

const Airdrop = () => {
  const { user, refreshProfile } = useAuth();
  const [miners, setMiners] = useState<Miner[]>([]);
  const [ownedMiners, setOwnedMiners] = useState<{[key: string]: number}>({});
  const [activeSessions, setActiveSessions] = useState<MiningSession[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const defaultMiners: Miner[] = [
    {
      id: "free-miner",
      name: "Free Miner",
      description: "Start your mining journey with our basic miner",
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop",
      hours: 6,
      ratePerSecond: 0.2,
      price: 0,
      owned: true
    },
    {
      id: "epic-miner",
      name: "Epic Miner",
      description: "Advanced mining equipment for serious miners",
      image: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400&h=300&fit=crop",
      hours: 6,
      ratePerSecond: 2,
      price: 1000,
      owned: false
    },
    {
      id: "super-miner",
      name: "Super Miner",
      description: "High-performance mining with excellent returns",
      image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=300&fit=crop",
      hours: 6,
      ratePerSecond: 20,
      price: 500000,
      owned: false
    },
    {
      id: "legendary-miner",
      name: "Legendary Miner",
      description: "The ultimate mining machine for maximum profits",
      image: "https://images.unsplash.com/photo-1487887235947-a955ef187fcc?w=400&h=300&fit=crop",
      hours: 6,
      ratePerSecond: 100,
      price: 1000000,
      owned: false
    }
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchOwnedMiners();
      fetchActiveSessions();
    }
  }, [user?.id]);

  const fetchOwnedMiners = async () => {
    try {
      const { data, error } = await supabase
        .from('user_miners')
        .select('miner_id')
        .eq('user_id', user?.id);

      if (error) throw error;
      
      // Count owned miners
      const owned: {[key: string]: number} = { 'free-miner': 1 };
      data?.forEach(item => {
        owned[item.miner_id] = (owned[item.miner_id] || 0) + 1;
      });
      
      setOwnedMiners(owned);
    } catch (error) {
      console.error('Error fetching owned miners:', error);
    }
  };

  const fetchActiveSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('mining_sessions')
        .select('*')
        .eq('user_id', user?.id)
        .eq('claimed', false);

      if (error) throw error;
      setActiveSessions(data || []);
    } catch (error) {
      console.error('Error fetching active sessions:', error);
    }
  };

  const startMining = async (miner: Miner) => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const endTime = new Date();
      endTime.setHours(endTime.getHours() + miner.hours);

      const estimatedEarning = miner.ratePerSecond * miner.hours * 3600;

      const { error } = await supabase
        .from('mining_sessions')
        .insert({
          user_id: user.id,
          miner_id: miner.id,
          end_time: endTime.toISOString(),
          estimated_earning: estimatedEarning,
          rate_per_second: miner.ratePerSecond
        });

      if (error) throw error;

      toast({
        title: "Mining Started! ⛏️",
        description: `${miner.name} is now mining GCoins for ${miner.hours} hours.`,
      });

      fetchActiveSessions();
    } catch (error) {
      console.error('Error starting mining:', error);
      toast({
        title: "Mining Failed",
        description: "Failed to start mining session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const claimRewards = async (session: MiningSession) => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      console.log("Claiming rewards for session:", session.id);
      
      const now = new Date();
      const endTime = new Date(session.end_time);
      const sessionComplete = now >= endTime;

      let amountToCredit = 0;
      
      if (sessionComplete) {
        amountToCredit = session.estimated_earning;
      } else {
        const elapsedTime = (now.getTime() - new Date(session.start_time).getTime()) / 1000;
        amountToCredit = Math.max(0, session.rate_per_second * elapsedTime);
      }

      console.log("Amount to credit:", amountToCredit);

      // First, update the mining session to mark it as claimed
      const { error: sessionError } = await supabase
        .from('mining_sessions')
        .update({ 
          claimed: true,
          amount_earned: amountToCredit
        })
        .eq('id', session.id)
        .eq('user_id', user.id); // Security: ensure user owns this session

      if (sessionError) {
        console.error("Session update error:", sessionError);
        throw sessionError;
      }

      // Then, add the rewards to user balance
      const { error: rewardError } = await supabase.rpc('add_mining_rewards', {
        user_id_param: user.id,
        amount_param: amountToCredit
      });

      if (rewardError) {
        console.error("Reward error:", rewardError);
        throw rewardError;
      }

      console.log("Mining rewards added successfully");

      toast({
        title: "Rewards Claimed! 🎉",
        description: `You earned ${formatNumber(amountToCredit)} GCoins from mining.`,
      });

      // Refresh both active sessions and user profile
      await Promise.all([
        fetchActiveSessions(),
        refreshProfile()
      ]);

    } catch (error) {
      console.error('Error claiming rewards:', error);
      toast({
        title: "Claim Failed",
        description: "Failed to claim mining rewards. Please try again.",
        variant: "destructive",
      });
      
      // If claiming failed, we should revert the session status
      await supabase
        .from('mining_sessions')
        .update({ claimed: false })
        .eq('id', session.id);
        
    } finally {
      setIsLoading(false);
    }
  };

  const purchaseMiner = async (miner: Miner) => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.rpc('purchase_miner', {
        miner_id_param: miner.id,
        price_param: miner.price
      });

      if (error) throw error;

      toast({
        title: "Miner Purchased! 🎉",
        description: `You now own another ${miner.name}!`,
      });

      // Refresh owned miners and user profile
      await Promise.all([
        fetchOwnedMiners(),
        refreshProfile()
      ]);

    } catch (error: any) {
      console.error('Error purchasing miner:', error);
      toast({
        title: "Purchase Failed",
        description: error.message || "Failed to purchase miner. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updatedMiners = defaultMiners.map(miner => ({
    ...miner,
    owned: (ownedMiners[miner.id] || 0) > 0,
    ownedCount: ownedMiners[miner.id] || 0
  }));

  const getActiveSessionsForMiner = (minerId: string) => {
    return activeSessions.filter(session => session.miner_id === minerId);
  };

  const canStartMining = (miner: Miner) => {
    const activeSessionsCount = getActiveSessionsForMiner(miner.id).length;
    const ownedCount = ownedMiners[miner.id] || 0;
    return ownedCount > activeSessionsCount;
  };

  const canClaimRewards = (session: MiningSession) => {
    const now = new Date();
    const endTime = new Date(session.end_time);
    return now >= endTime;
  };

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
              🎁 GCoin Airdrop Mining
            </h1>
            <p className={`text-gray-600 text-base md:text-lg transition-all duration-500 delay-100 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
              Mine GCoins with our advanced mining equipment
            </p>
          </div>

          {/* Active Mining Sessions */}
          {activeSessions.length > 0 && (
            <div className={`mb-8 transition-all duration-500 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-800">Active Mining Sessions</h2>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {activeSessions.map((session) => {
                  const miner = defaultMiners.find(m => m.id === session.miner_id);
                  const canClaim = canClaimRewards(session);
                  const now = new Date();
                  const endTime = new Date(session.end_time);
                  const progress = Math.min(100, ((now.getTime() - new Date(session.start_time).getTime()) / (endTime.getTime() - new Date(session.start_time).getTime())) * 100);
                  
                  // Calculate current earnings
                  const elapsedTime = (now.getTime() - new Date(session.start_time).getTime()) / 1000;
                  const currentEarnings = Math.min(session.estimated_earning, Math.max(0, session.rate_per_second * elapsedTime));
                  
                  return (
                    <Card key={session.id} className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-base md:text-lg">{miner?.name}</CardTitle>
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            {canClaim ? 'Ready' : 'Mining'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        
                        <div className="text-sm text-gray-600">
                          <div>Mined: {formatNumber(currentEarnings)} GCoins</div>
                          <div>Progress: {Math.round(progress)}%</div>
                        </div>
                        
                        <Button
                          onClick={() => claimRewards(session)}
                          disabled={isLoading}
                          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-sm"
                        >
                          <Gift className="h-4 w-4 mr-2" />
                          Claim {formatNumber(currentEarnings)} GCoins
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Miners Grid */}
          <div className={`transition-all duration-500 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <h2 className="text-xl md:text-2xl font-bold mb-6 text-gray-800">Mining Equipment</h2>
            <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {updatedMiners.map((miner) => (
                <MinerCard
                  key={miner.id}
                  miner={miner}
                  onStartMining={() => startMining(miner)}
                  onPurchase={() => purchaseMiner(miner)}
                  disabled={isLoading}
                  canStartMining={canStartMining(miner)}
                  activeSessionsCount={getActiveSessionsForMiner(miner.id).length}
                />
              ))}
            </div>
          </div>

          {/* Mining Info */}
          <div className={`mt-8 transition-all duration-500 delay-400 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg md:text-xl text-blue-800">Mining Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-blue-700">
                <p>• Mining sessions last for 6 hours each</p>
                <p>• You can buy multiple miners of the same type</p>
                <p>• Each miner can run one mining session at a time</p>
                <p>• Claim rewards anytime during or after completion</p>
                <p>• Free miner is available to all users</p>
                <p>• All earnings are credited to your main GCoin balance</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Airdrop;
