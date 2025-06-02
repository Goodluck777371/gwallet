
import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import MinerCard from "@/components/MinerCard";

interface Miner {
  id: string;
  name: string;
  description: string;
  price: number;
  dailyRate: number;
  image: string;
}

interface UserMiner {
  id: string;
  user_id: string;
  miner_id: string;
  purchased_at: string;
}

interface MiningSession {
  id: string;
  user_id: string;
  miner_id: string;
  start_time: string;
  end_time: string;
  estimated_earning: number;
  amount_earned: number;
  rate_per_second: number;
  claimed: boolean;
  created_at: string;
}

const miners: Miner[] = [
  {
    id: "free",
    name: "Free Miner",
    description: "Basic mining capabilities for beginners",
    price: 0,
    dailyRate: 10,
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop"
  },
  {
    id: "epic",
    name: "Epic Miner",
    description: "Enhanced mining power with better rewards",
    price: 5000,
    dailyRate: 100,
    image: "https://images.unsplash.com/photo-1563711529-e095a8b97ce8?w=400&h=300&fit=crop"
  },
  {
    id: "super",
    name: "Super Miner",
    description: "High-performance mining with excellent returns",
    price: 15000,
    dailyRate: 350,
    image: "https://images.unsplash.com/photo-1591725594750-3cc40ff93ad9?w=400&h=300&fit=crop"
  },
  {
    id: "legendary",
    name: "Legendary Miner",
    description: "Ultimate mining machine with maximum efficiency",
    price: 50000,
    dailyRate: 1500,
    image: "https://images.unsplash.com/photo-1628258334105-2a0b3d6efee1?w=400&h=300&fit=crop"
  }
];

const Airdrop = () => {
  const { isAuthenticated, user, refreshProfile } = useAuth();
  const [userMiners, setUserMiners] = useState<UserMiner[]>([]);
  const [miningSessions, setMiningSessions] = useState<MiningSession[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [totalMined, setTotalMined] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserMiners();
      fetchMiningSessions();
    }
  }, [isAuthenticated, user]);

  const fetchUserMiners = async () => {
    try {
      const { data, error } = await supabase
        .from('user_miners')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;
      setUserMiners(data || []);
    } catch (error) {
      console.error('Error fetching user miners:', error);
    }
  };

  const fetchMiningSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('mining_sessions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMiningSessions(data || []);
      
      // Calculate total mined from claimed sessions
      const totalClaimed = data?.reduce((sum, session) => {
        return sum + (session.claimed ? session.amount_earned : 0);
      }, 0) || 0;
      setTotalMined(totalClaimed);
    } catch (error) {
      console.error('Error fetching mining sessions:', error);
    }
  };

  const handlePurchaseMiner = async (minerId: string, price: number) => {
    if (!isAuthenticated || !user) {
      toast.error({
        title: "Authentication required",
        description: "Please login to purchase miners.",
      });
      return;
    }

    if (user.balance < price) {
      toast.error({
        title: "Insufficient balance",
        description: `You need ${price} GCoins to purchase this miner.`,
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.rpc('purchase_miner', {
        miner_id_param: minerId,
        price_param: price
      });

      if (error) throw error;

      toast.success({
        title: "Miner purchased successfully!",
        description: "You can now start mining with your new miner.",
      });

      await refreshProfile();
      await fetchUserMiners();
    } catch (error: any) {
      toast.error({
        title: "Purchase failed",
        description: error.message || "Failed to purchase miner.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartMining = async (minerId: string) => {
    if (!isAuthenticated || !user) {
      toast.error({
        title: "Authentication required",
        description: "Please login to start mining.",
      });
      return;
    }

    const miner = miners.find(m => m.id === minerId);
    if (!miner) return;

    // Check if there's already an active session for this miner
    const activeSession = miningSessions.find(
      session => session.miner_id === minerId && !session.claimed && new Date(session.end_time) > new Date()
    );

    if (activeSession) {
      toast.warning({
        title: "Mining session already active",
        description: "You already have an active mining session for this miner.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const endTime = new Date();
      endTime.setHours(endTime.getHours() + 24); // 24-hour mining session

      const ratePerSecond = miner.dailyRate / (24 * 60 * 60); // Convert daily rate to per second
      const estimatedEarning = miner.dailyRate;

      const { error } = await supabase
        .from('mining_sessions')
        .insert({
          user_id: user.id,
          miner_id: minerId,
          end_time: endTime.toISOString(),
          estimated_earning: estimatedEarning,
          rate_per_second: ratePerSecond,
          amount_earned: 0,
          claimed: false
        });

      if (error) throw error;

      toast.success({
        title: "Mining started!",
        description: `Your ${miner.name} is now mining GCoins.`,
      });

      await fetchMiningSessions();
    } catch (error: any) {
      toast.error({
        title: "Failed to start mining",
        description: error.message || "Could not start mining session.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaimRewards = async (sessionId: string) => {
    const session = miningSessions.find(s => s.id === sessionId);
    if (!session) return;

    setIsLoading(true);
    try {
      const now = new Date();
      const endTime = new Date(session.end_time);
      const isCompleted = now >= endTime;
      
      let amountEarned = session.estimated_earning;
      if (!isCompleted) {
        // Calculate partial earnings based on time elapsed
        const startTime = new Date(session.start_time);
        const totalDuration = endTime.getTime() - startTime.getTime();
        const elapsedDuration = now.getTime() - startTime.getTime();
        amountEarned = (elapsedDuration / totalDuration) * session.estimated_earning;
      }

      // Update mining session as claimed
      const { error: updateError } = await supabase
        .from('mining_sessions')
        .update({ 
          claimed: true, 
          amount_earned: amountEarned 
        })
        .eq('id', sessionId);

      if (updateError) throw updateError;

      // Add rewards to user balance
      const { error: rewardError } = await supabase.rpc('add_mining_rewards', {
        user_id_param: user?.id,
        amount_param: amountEarned
      });

      if (rewardError) throw rewardError;

      toast.success({
        title: "Rewards claimed!",
        description: `You earned ${amountEarned.toFixed(2)} GCoins from mining.`,
      });

      await refreshProfile();
      await fetchMiningSessions();
    } catch (error: any) {
      toast.error({
        title: "Failed to claim rewards",
        description: error.message || "Could not claim mining rewards.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getMiningStatus = (minerId: string) => {
    const session = miningSessions.find(
      s => s.miner_id === minerId && !s.claimed && new Date(s.end_time) > new Date()
    );
    return session;
  };

  const getClaimableRewards = () => {
    return miningSessions.filter(
      session => !session.claimed && new Date(session.end_time) <= new Date()
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-20 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <Link to="/dashboard" className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-4">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </Link>
            
            <div className={`transition-all duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
              <h1 className="text-3xl font-bold mb-2">Mining Center</h1>
              <p className="text-gray-500 mb-6">
                Purchase miners and start earning GCoins automatically
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold mb-2">Total Mined</h3>
                  <p className="text-2xl font-bold text-green-600">{totalMined.toFixed(2)} GCoins</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold mb-2">Active Miners</h3>
                  <p className="text-2xl font-bold text-blue-600">{userMiners.length}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold mb-2">Claimable Rewards</h3>
                  <p className="text-2xl font-bold text-purple-600">{getClaimableRewards().length}</p>
                </div>
              </div>
            </div>
          </div>

          <div className={`transition-all duration-500 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {miners.map((miner) => {
                const owned = userMiners.some(um => um.miner_id === miner.id);
                const miningSession = getMiningStatus(miner.id);
                
                return (
                  <MinerCard
                    key={miner.id}
                    miner={miner}
                    owned={owned}
                    miningSession={miningSession}
                    onPurchase={() => handlePurchaseMiner(miner.id, miner.price)}
                    onStartMining={() => handleStartMining(miner.id)}
                    onClaimRewards={() => miningSession && handleClaimRewards(miningSession.id)}
                    isLoading={isLoading}
                  />
                );
              })}
            </div>
          </div>

          {miningSessions.length > 0 && (
            <div className={`mt-8 transition-all duration-500 delay-400 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Mining History</h2>
                <div className="space-y-3">
                  {miningSessions.slice(0, 10).map((session) => {
                    const miner = miners.find(m => m.id === session.miner_id);
                    const isCompleted = new Date(session.end_time) <= new Date();
                    
                    return (
                      <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{miner?.name}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(session.start_time).toLocaleDateString()} - {new Date(session.end_time).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{session.amount_earned.toFixed(2)} GCoins</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            session.claimed ? 'bg-green-100 text-green-800' : 
                            isCompleted ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {session.claimed ? 'Claimed' : isCompleted ? 'Ready' : 'Mining'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Airdrop;
