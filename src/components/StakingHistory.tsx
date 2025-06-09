
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TrendingUp, Loader2, AlertCircle } from "lucide-react";

export interface StakingPosition {
  id: string;
  user_id: string;
  amount: number;
  duration_days: number;
  estimated_reward: number;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'canceled';
  created_at: string;
}

const StakingHistory = () => {
  const { user } = useAuth();
  const [stakings, setStakings] = useState<StakingPosition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [unstakeDialog, setUnstakeDialog] = useState<{ open: boolean, position: StakingPosition | null }>({
    open: false,
    position: null
  });

  useEffect(() => {
    if (!user?.id) return;

    // Check for completed stakes that need to be processed
    const checkCompletedStakes = async () => {
      try {
        console.log("Checking completed stakes for user:", user.id);
        
        // First attempt to process completed stakes via the database function
        await supabase.rpc('process_completed_stakes');
        
        // Then fetch current staking positions
        fetchStakings();
      } catch (error) {
        console.error('Error checking completed stakes:', error);
      }
    };

    const fetchStakings = async () => {
      try {
        console.log("Fetching staking positions for user:", user.id);
        
        const { data, error } = await supabase
          .from('staking_positions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error("Error fetching staking positions:", error);
          throw error;
        }
        
        console.log("Staking positions fetched:", data);
        setStakings(data || []);
      } catch (error) {
        console.error('Error fetching staking positions:', error);
        toast.error({
          title: "Error",
          description: "Failed to load staking history"
        });
      } finally {
        setIsLoading(false);
      }
    };

    // Check completed stakes first, which will then fetch current positions
    checkCompletedStakes();
    
    // Set up realtime subscription for staking positions updates
    const subscription = supabase
      .channel('schema_db_changes')
      .on('postgres_changes', 
        {
          event: '*', 
          schema: 'public',
          table: 'staking_positions',
          filter: `user_id=eq.${user.id}`
        }, 
        (payload) => {
          console.log("Staking positions updated:", payload);
          // Refresh staking positions when there is a change
          fetchStakings();
        })
      .subscribe();
    
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user?.id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusClassName = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'canceled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleUnstakeRequest = (position: StakingPosition) => {
    setUnstakeDialog({ open: true, position });
  };

  const confirmUnstake = async () => {
    if (!unstakeDialog.position) return;
    setIsLoading(true);
    setIsProcessing(true);
    
    try {
      console.log("Attempting to unstake position:", unstakeDialog.position.id);
      
      const { data, error } = await supabase.rpc('unstake_gcoin', {
        staking_id: unstakeDialog.position.id
      });
      
      if (error) {
        console.error("Unstake error:", error);
        throw error;
      }
      
      console.log("Unstake successful:", data);
      
      toast.credit({
        title: "Unstaking Successful",
        description: "Your GCoins have been returned to your wallet"
      });
    } catch (error: any) {
      console.error("Unstake error:", error);
      toast.error({
        title: "Unstaking Failed",
        description: error.message || "An unexpected error occurred"
      });
    } finally {
      setUnstakeDialog({ open: false, position: null });
      setIsLoading(false);
      setIsProcessing(false);
    }
  };

  const canUnstake = (position: StakingPosition) => {
    return position.status === 'active';
  };

  const isStakeCompleted = (position: StakingPosition) => {
    return new Date(position.end_date) <= new Date() && position.status === 'active';
  };

  // Function to check and mark stake as completed if needed
  const processCompletedStake = async (position: StakingPosition) => {
    if (isStakeCompleted(position)) {
      setIsLoading(true);
      setIsProcessing(true);
      
      try {
        console.log("Processing completed stake:", position.id);
        
        const { data, error } = await supabase.rpc('unstake_gcoin', {
          staking_id: position.id
        });
        
        if (error) {
          console.error("Process completed stake error:", error);
          throw error;
        }
        
        console.log("Completed stake processed:", data);
        
        toast.success({
          title: "Stake Completed",
          description: `Your stake of ${position.amount} GCoins has been returned with ${position.estimated_reward} GCoins reward`
        });
      } catch (error: any) {
        console.error("Process completed stake error:", error);
        toast.error({
          title: "Error Processing Stake",
          description: error.message || "Failed to process completed stake"
        });
      } finally {
        setIsLoading(false);
        setIsProcessing(false);
      }
    }
  };

  return (
    <div>
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : stakings.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Reward</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stakings.map((position) => (
              <TableRow key={position.id} className={isStakeCompleted(position) ? "bg-amber-50" : ""}>
                <TableCell>{formatDate(position.start_date)}</TableCell>
                <TableCell>{formatDate(position.end_date)}</TableCell>
                <TableCell>{position.amount.toFixed(2)} GCoin</TableCell>
                <TableCell>{position.duration_days} days</TableCell>
                <TableCell className="text-green-600">+{position.estimated_reward.toFixed(2)} GCoin</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusClassName(position.status)}`}>
                    {isStakeCompleted(position) 
                      ? <span className="flex items-center gap-1">
                          Ready for collection
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                          </span>
                        </span>
                      : position.status.charAt(0).toUpperCase() + position.status.slice(1)
                    }
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  {canUnstake(position) ? (
                    <Button
                      variant={isStakeCompleted(position) ? "default" : "outline"}
                      size="sm"
                      disabled={isProcessing}
                      className={isStakeCompleted(position) ? "bg-green-600 hover:bg-green-700" : ""}
                      onClick={() => {
                        if (isStakeCompleted(position)) {
                          processCompletedStake(position);
                        } else {
                          handleUnstakeRequest(position);
                        }
                      }}
                    >
                      {isProcessing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : isStakeCompleted(position) ? (
                        "Collect Rewards"
                      ) : (
                        "Unstake"
                      )}
                    </Button>
                  ) : (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <TrendingUp className="h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No Staking History</h3>
          <p className="text-sm text-gray-500 max-w-sm mt-2">
            You haven't staked any GCoins yet. Start staking to earn rewards.
          </p>
        </div>
      )}

      {/* Early unstaking confirmation dialog */}
      <AlertDialog
        open={unstakeDialog.open}
        onOpenChange={(open) => setUnstakeDialog({ ...unstakeDialog, open })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              Early Unstaking Penalty
            </AlertDialogTitle>
            <AlertDialogDescription>
              {unstakeDialog.position && (
                <>
                  <p className="mb-4">
                    Unstaking your {unstakeDialog.position.amount} GCoins before the due date 
                    will incur a 10% penalty on your initial stake amount.
                  </p>
                  <div className="bg-gray-50 p-3 rounded-md border border-gray-200 mb-4">
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between">
                        <span>Initial stake:</span>
                        <span>{unstakeDialog.position.amount.toFixed(2)} GCoin</span>
                      </div>
                      <div className="flex justify-between text-red-500">
                        <span>Penalty (10%):</span>
                        <span>-{(unstakeDialog.position.amount * 0.1).toFixed(2)} GCoin</span>
                      </div>
                      <div className="border-t border-gray-200 pt-2 mt-1 font-medium flex justify-between">
                        <span>You will receive:</span>
                        <span>{(unstakeDialog.position.amount * 0.9).toFixed(2)} GCoin</span>
                      </div>
                    </div>
                  </div>
                  <p>
                    Do you wish to proceed with unstaking?
                  </p>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmUnstake} 
              disabled={isProcessing} 
              className="bg-red-500 hover:bg-red-600"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                "Proceed"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default StakingHistory;
