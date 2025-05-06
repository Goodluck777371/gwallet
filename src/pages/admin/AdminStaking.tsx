
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
import { TrendingUp, Loader2, AlertCircle, RefreshCw } from "lucide-react";

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

const AdminStaking = () => {
  const { user } = useAuth();
  const [stakings, setStakings] = useState<StakingPosition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [unstakeDialog, setUnstakeDialog] = useState<{ open: boolean, position: StakingPosition | null }>({
    open: false,
    position: null
  });

  useEffect(() => {
    fetchStakings();
  }, [user?.id]);

  const fetchStakings = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching all staking positions...");
      
      // Fetch all staking positions for admin view
      const { data, error } = await supabase
        .from('staking_positions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching stakings:", error);
        throw error;
      }
      
      console.log("Fetched staking positions:", data);
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
    setIsProcessing(true);
    
    try {
      console.log("Admin unstaking position:", unstakeDialog.position.id);
      
      const { data, error } = await supabase.rpc('unstake_gcoin', {
        staking_id: unstakeDialog.position.id
      });
      
      if (error) {
        console.error("Admin unstake error:", error);
        throw error;
      }
      
      console.log("Admin unstake successful:", data);
      
      toast.credit({
        title: "Unstaking Successful",
        description: "GCoins have been returned to user's wallet"
      });
      
      // Refresh staking positions
      fetchStakings();
    } catch (error: any) {
      console.error("Admin unstake error:", error);
      toast.error({
        title: "Unstaking Failed",
        description: error.message || "An unexpected error occurred"
      });
    } finally {
      setUnstakeDialog({ open: false, position: null });
      setIsProcessing(false);
    }
  };

  const handleProcessCompletedStakes = async () => {
    setIsProcessing(true);
    try {
      console.log("Processing all completed stakes...");
      
      const { data, error } = await supabase.rpc('process_completed_stakes');
      
      if (error) {
        console.error("Process completed stakes error:", error);
        throw error;
      }
      
      console.log("Processed completed stakes:", data);
      
      toast.success({
        title: "Success",
        description: "Completed stakes have been processed successfully"
      });
      
      // Refresh staking positions
      fetchStakings();
    } catch (error: any) {
      console.error("Process completed stakes error:", error);
      toast.error({
        title: "Processing Failed",
        description: error.message || "Failed to process completed stakes"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const canUnstake = (position: StakingPosition) => {
    return position.status === 'active';
  };
  
  const isStakeCompleted = (position: StakingPosition) => {
    return new Date(position.end_date) <= new Date() && position.status === 'active';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Staking Positions
        </h1>
        <div className="flex gap-3">
          <Button 
            variant="outline"
            size="icon"
            onClick={fetchStakings}
            disabled={isProcessing}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button 
            onClick={handleProcessCompletedStakes}
            disabled={isProcessing}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
          >
            {isProcessing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <TrendingUp className="mr-2 h-4 w-4" />
            )}
            Process Completed Stakes
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : stakings.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User ID</TableHead>
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
                <TableCell className="font-mono text-xs truncate">{position.user_id}</TableCell>
                <TableCell>{formatDate(position.start_date)}</TableCell>
                <TableCell>{formatDate(position.end_date)}</TableCell>
                <TableCell>{position.amount.toFixed(2)} GCoin</TableCell>
                <TableCell>{position.duration_days} days</TableCell>
                <TableCell className="text-green-600">+{position.estimated_reward.toFixed(2)} GCoin</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusClassName(position.status)}`}>
                    {isStakeCompleted(position) ? (
                      <span className="flex items-center gap-1">
                        Ready for collection
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                      </span>
                    ) : (
                      position.status.charAt(0).toUpperCase() + position.status.slice(1)
                    )}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  {canUnstake(position) ? (
                    <Button
                      variant={isStakeCompleted(position) ? "default" : "outline"}
                      size="sm"
                      disabled={isProcessing}
                      className={isStakeCompleted(position) ? "bg-green-600 hover:bg-green-700" : ""}
                      onClick={() => handleUnstakeRequest(position)}
                    >
                      {isProcessing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : isStakeCompleted(position) ? (
                        "Process Rewards"
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
            There are no staking positions in the system yet.
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
                    Unstaking these {unstakeDialog.position.amount} GCoins before the due date 
                    will incur a 10% penalty on the initial stake amount.
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
                        <span>User will receive:</span>
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

export default AdminStaking;
