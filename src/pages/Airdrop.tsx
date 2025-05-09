
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { Calendar, Clock, Share2, Gift, ChevronRight, Activity } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import Header from "@/components/Header";
import MinerCard from "@/components/MinerCard";
import ReferralCard from "@/components/ReferralCard";

const Airdrop = () => {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isMining, setIsMining] = useState(false);
  const [miningTime, setMiningTime] = useState(0);
  const [miningAmount, setMiningAmount] = useState(0);
  const [nextMiningTime, setNextMiningTime] = useState<Date | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [userMiners, setUserMiners] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [referralEarnings, setReferralEarnings] = useState(0);
  
  // Miners data
  const miners = [
    {
      id: "free-miner",
      name: "Free Miner",
      description: "Basic mining machine for beginners",
      image: "/public/miners/free-miner.png",
      hours: 3,
      ratePerSecond: 0.00001,
      price: 0,
      owned: false
    },
    {
      id: "epic-miner",
      name: "Epic Miner",
      description: "Advanced mining technology with better rates",
      image: "/public/miners/epic-miner.png",
      hours: 10,
      ratePerSecond: 0.002,
      price: 100000,
      owned: false
    },
    {
      id: "super-miner",
      name: "Super Miner",
      description: "Powerful mining machine for serious miners",
      image: "/public/miners/super-miner.png",
      hours: 15,
      ratePerSecond: 0.2,
      price: 500000,
      owned: false
    },
    {
      id: "legendary-miner",
      name: "Legendary Miner",
      description: "Unstoppable mining power for maximum earnings",
      image: "/public/miners/legendary-miner.png",
      hours: 21,
      ratePerSecond: 1,
      price: 1000000,
      owned: false
    },
  ];

  useEffect(() => {
    if (!user) {
      toast.warning({
        title: "Authentication Required",
        description: "Please log in to access mining features",
      });
      navigate("/login");
      return;
    }
    
    fetchUserData();
  }, [user, navigate]);

  // Fetch user's miners and mining data
  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch user's miners
      const { data: userMinersData, error: minersError } = await supabase
        .from('user_miners')
        .select('*')
        .eq('user_id', user?.id);
      
      if (minersError) {
        console.error('Error fetching miners:', minersError);
        return;
      }

      // Update the miners list with ownership status
      const updatedMiners = miners.map(miner => {
        const foundMiner = userMinersData?.find(m => m.miner_id === miner.id);
        return {
          ...miner,
          owned: !!foundMiner
        };
      });
      
      setUserMiners(updatedMiners);
      
      // Fetch mining status
      const { data: miningData, error: miningError } = await supabase
        .from('mining_sessions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (miningError) {
        console.error('Error fetching mining status:', miningError);
        return;
      }
      
      if (miningData && miningData.length > 0) {
        const session = miningData[0];
        const endTime = new Date(session.end_time);
        const now = new Date();
        
        if (endTime > now) {
          // Mining session is active
          setIsMining(true);
          const remainingTimeMs = endTime.getTime() - now.getTime();
          const remainingTimeSeconds = Math.floor(remainingTimeMs / 1000);
          setMiningTime(remainingTimeSeconds);
          
          // Calculate mining amount based on the active miner
          const activeMiner = miners.find(m => m.id === session.miner_id);
          if (activeMiner) {
            setMiningAmount(activeMiner.ratePerSecond * remainingTimeSeconds);
          }
        } else {
          // Mining session completed but not claimed
          if (!session.claimed) {
            // User can claim rewards
            setIsMining(false);
            setMiningAmount(session.amount_earned);
          }
          
          // Calculate next available mining time
          const cooldownEndTime = new Date(session.end_time);
          cooldownEndTime.setHours(cooldownEndTime.getHours() + 6); // 6 hour cooldown
          
          if (cooldownEndTime > now) {
            setNextMiningTime(cooldownEndTime);
            setCooldown(Math.floor((cooldownEndTime.getTime() - now.getTime()) / 1000));
          }
        }
      }
      
      // Fetch referrals
      const { data: referralsData, error: referralsError } = await supabase
        .from('referrals')
        .select('*, referred_user:profiles!referred_user_id(username, email)')
        .eq('referrer_id', user?.id);
      
      if (referralsError) {
        console.error('Error fetching referrals:', referralsError);
        return;
      }
      
      setReferrals(referralsData || []);
      
      // Calculate total referral earnings
      const { data: earningsData, error: earningsError } = await supabase
        .from('referral_earnings')
        .select('amount')
        .eq('user_id', user?.id);
      
      if (earningsError) {
        console.error('Error fetching referral earnings:', earningsError);
        return;
      }
      
      const totalEarnings = earningsData?.reduce((acc, curr) => acc + curr.amount, 0) || 0;
      setReferralEarnings(totalEarnings);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Start mining session
  const startMining = async (minerId: string) => {
    try {
      setIsLoading(true);
      
      // Check if miner is owned
      const miner = userMiners.find(m => m.id === minerId);
      if (!miner?.owned && minerId !== 'free-miner') {
        toast.error({
          title: "Mining Failed",
          description: "You don't own this miner yet. Purchase it first!",
        });
        return;
      }
      
      // Check cooldown period
      if (cooldown > 0) {
        const hours = Math.floor(cooldown / 3600);
        const minutes = Math.floor((cooldown % 3600) / 60);
        toast.warning({
          title: "Mining Cooldown",
          description: `You can mine again in ${hours}h ${minutes}m`,
        });
        return;
      }
      
      // Calculate mining duration based on miner
      const selectedMiner = miners.find(m => m.id === minerId);
      if (!selectedMiner) return;
      
      const durationHours = selectedMiner.hours;
      const durationSeconds = durationHours * 60 * 60;
      const ratePerSecond = selectedMiner.ratePerSecond;
      const estimatedEarning = durationSeconds * ratePerSecond;
      
      // Start new mining session
      const now = new Date();
      const endTime = new Date(now);
      endTime.setHours(now.getHours() + durationHours);
      
      const { data, error } = await supabase
        .from('mining_sessions')
        .insert([{
          user_id: user?.id,
          miner_id: minerId,
          start_time: now.toISOString(),
          end_time: endTime.toISOString(),
          estimated_earning: estimatedEarning,
          rate_per_second: ratePerSecond,
          claimed: false
        }]);
      
      if (error) {
        console.error('Error starting mining session:', error);
        toast.error({
          title: "Mining Failed",
          description: "Failed to start mining session. Try again later.",
        });
        return;
      }
      
      toast.success({
        title: "Mining Started",
        description: `Your ${selectedMiner.name} is now mining! It will run for ${durationHours} hours.`,
      });
      
      setIsMining(true);
      setMiningTime(durationSeconds);
      setMiningAmount(0);
      
      // Start countdown
      const countdownInterval = setInterval(() => {
        setMiningTime(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            setIsMining(false);
            fetchUserData(); // Refresh data when mining completes
            return 0;
          }
          setMiningAmount(prev * ratePerSecond);
          return prev - 1;
        });
      }, 1000);
      
    } catch (error) {
      console.error('Error in startMining:', error);
      toast.error({
        title: "Mining Failed",
        description: "An unexpected error occurred. Try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Claim mining rewards
  const claimRewards = async () => {
    try {
      setIsLoading(true);
      
      const { data: sessionData, error: sessionError } = await supabase
        .from('mining_sessions')
        .select('*')
        .eq('user_id', user?.id)
        .eq('claimed', false)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (sessionError) {
        console.error('Error fetching session:', sessionError);
        return;
      }
      
      if (!sessionData || sessionData.length === 0) {
        toast.warning({
          title: "No Rewards",
          description: "No unclaimed mining rewards found.",
        });
        return;
      }
      
      const session = sessionData[0];
      
      // Calculate actual earnings
      const startTime = new Date(session.start_time);
      const endTime = new Date(session.end_time);
      const now = new Date();
      const actualEndTime = now < endTime ? now : endTime;
      const secondsMined = Math.floor((actualEndTime.getTime() - startTime.getTime()) / 1000);
      const actualEarnings = secondsMined * session.rate_per_second;
      
      // Update user balance
      const { error: updateError } = await supabase.rpc('add_mining_rewards', { 
        user_id_param: user?.id,
        amount_param: actualEarnings
      });
      
      if (updateError) {
        console.error('Error adding rewards:', updateError);
        toast.error({
          title: "Claim Failed",
          description: "Failed to add mining rewards to your balance.",
        });
        return;
      }
      
      // Mark session as claimed
      const { error: claimError } = await supabase
        .from('mining_sessions')
        .update({ claimed: true, amount_earned: actualEarnings })
        .eq('id', session.id);
      
      if (claimError) {
        console.error('Error marking as claimed:', claimError);
      }
      
      toast.success({
        title: "Rewards Claimed",
        description: `${formatNumber(actualEarnings)} GCoin has been added to your balance!`,
      });
      
      // Refresh user profile to update balance
      await refreshProfile();
      fetchUserData();
      
    } catch (error) {
      console.error('Error claiming rewards:', error);
      toast.error({
        title: "Claim Failed",
        description: "An unexpected error occurred. Try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Purchase a new miner
  const purchaseMiner = async (minerId: string, price: number) => {
    try {
      setIsLoading(true);
      
      if (!user) return;
      
      // Check if user has enough balance
      if ((user.balance || 0) < price) {
        toast.error({
          title: "Insufficient Balance",
          description: "You don't have enough GCoin to purchase this miner.",
        });
        return;
      }
      
      // Process purchase
      const { error } = await supabase.rpc('purchase_miner', {
        miner_id_param: minerId,
        price_param: price
      });
      
      if (error) {
        console.error('Error purchasing miner:', error);
        toast.error({
          title: "Purchase Failed",
          description: error.message || "Failed to purchase miner. Try again later.",
        });
        return;
      }
      
      toast.success({
        title: "Miner Purchased",
        description: `You have successfully purchased a new mining machine!`,
      });
      
      // Refresh user profile to update balance
      await refreshProfile();
      fetchUserData();
      
    } catch (error) {
      console.error('Error purchasing miner:', error);
      toast.error({
        title: "Purchase Failed",
        description: "An unexpected error occurred. Try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Generate and copy referral link
  const copyReferralLink = () => {
    if (!user) return;
    
    const referralLink = `${window.location.origin}/register?ref=${user.id}`;
    navigator.clipboard.writeText(referralLink);
    
    toast.success({
      title: "Referral Link Copied",
      description: "Your referral link has been copied to clipboard.",
    });
  };

  // Format time
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Mask email for privacy
  const maskEmail = (email: string) => {
    if (!email) return '';
    const [name, domain] = email.split('@');
    const maskedName = name.slice(0, 2) + '*'.repeat(name.length - 2);
    return `${maskedName}@${domain}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto p-4 pt-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">Airdrop & Mining</h1>

          <Tabs defaultValue="mining" className="w-full">
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="mining">
                <Activity className="mr-2 h-4 w-4" /> 
                Mining
              </TabsTrigger>
              <TabsTrigger value="referrals">
                <Share2 className="mr-2 h-4 w-4" /> 
                Referrals
              </TabsTrigger>
            </TabsList>

            <TabsContent value="mining" className="space-y-6">
              {/* Mining Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Mining Status</CardTitle>
                  <CardDescription>
                    Earn GCoin by mining with your machines
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isMining ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center">
                        <div className="relative w-32 h-32 flex items-center justify-center">
                          <div className="absolute inset-0 rounded-full bg-green-100 animate-pulse"></div>
                          <div className="z-10 text-green-500 font-semibold">ACTIVE</div>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-lg font-semibold">Time Remaining</div>
                        <div className="text-3xl font-bold font-mono">{formatTime(miningTime)}</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-sm text-gray-500">Estimated Earnings</div>
                        <div className="text-2xl font-bold text-gcoin-blue">
                          {formatNumber(miningAmount)} <span className="text-base">GCoin</span>
                        </div>
                      </div>
                    </div>
                  ) : nextMiningTime ? (
                    <div className="space-y-4">
                      <div className="text-center">
                        <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 px-3 py-1">
                          <Clock className="h-3 w-3 mr-1" /> COOLDOWN
                        </Badge>
                        
                        <div className="mt-4 text-gray-600">
                          <p>Mining is on cooldown. You can mine again in:</p>
                          <p className="text-2xl font-bold font-mono mt-2">{formatTime(cooldown)}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            Available at {nextMiningTime.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      
                      {miningAmount > 0 && (
                        <div className="bg-green-50 p-4 rounded-lg text-center">
                          <p className="text-sm font-medium text-green-800">Mining Rewards Available!</p>
                          <p className="text-2xl font-bold text-green-700 mt-1">
                            {formatNumber(miningAmount)} <span className="text-base">GCoin</span>
                          </p>
                          <Button 
                            onClick={claimRewards} 
                            className="mt-3 bg-green-500 hover:bg-green-600"
                            disabled={isLoading}
                          >
                            Claim Rewards
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <div className="text-lg mb-2">Start mining with one of your machines</div>
                      <p className="text-gray-500 text-sm">
                        Select a mining machine below to begin earning GCoin
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Available Miners */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Your Mining Machines</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {miners.map((miner) => (
                    <MinerCard
                      key={miner.id}
                      miner={miner}
                      onStartMining={() => startMining(miner.id)}
                      onPurchase={() => purchaseMiner(miner.id, miner.price)}
                      disabled={isLoading || isMining || cooldown > 0}
                    />
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="referrals">
              <ReferralCard 
                referralCount={referrals.length}
                referralEarnings={referralEarnings}
                referrals={referrals}
                onCopyLink={copyReferralLink}
                maskEmail={maskEmail}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Airdrop;
