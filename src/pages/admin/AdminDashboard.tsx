
import { useState, useEffect } from "react";
import { Users, DollarSign, TrendingUp, Activity, Coins, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatNumber, formatCurrency } from "@/lib/utils";
import AdminUserSearch from "@/components/AdminUserSearch";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBalance: 0,
    totalTransactions: 0,
    activeRentals: 0,
    totalStaked: 0,
    recentActivity: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState("");
  const [adjustmentAmount, setAdjustmentAmount] = useState("");
  const [adjustmentType, setAdjustmentType] = useState("add");
  const [users, setUsers] = useState<any[]>([]);
  const [exchangeRate, setExchangeRate] = useState("850");
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
    fetchUsers();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch total users
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch total balance across all users
      const { data: balanceData } = await supabase
        .from('profiles')
        .select('balance');
      
      const totalBalance = balanceData?.reduce((sum, user) => sum + Number(user.balance), 0) || 0;

      // Fetch total transactions
      const { count: transactionCount } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true });

      // Fetch active rentals
      const { count: rentalCount } = await supabase
        .from('mining_rentals')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Fetch total staked
      const { data: stakingData } = await supabase
        .from('staking_positions')
        .select('amount')
        .eq('status', 'active');
      
      const totalStaked = stakingData?.reduce((sum, stake) => sum + Number(stake.amount), 0) || 0;

      // Fetch recent activity
      const { data: activityData } = await supabase
        .from('user_activity')
        .select(`
          *,
          profiles:user_id(username, email)
        `)
        .order('timestamp', { ascending: false })
        .limit(10);

      setStats({
        totalUsers: userCount || 0,
        totalBalance,
        totalTransactions: transactionCount || 0,
        activeRentals: rentalCount || 0,
        totalStaked,
        recentActivity: activityData || []
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id, username, email, wallet_address, balance')
        .order('created_at', { ascending: false });
      
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleBalanceAdjustment = async () => {
    if (!selectedUser || !adjustmentAmount) {
      toast({
        title: "Missing Information",
        description: "Please select a user and enter an amount",
        variant: "destructive"
      });
      return;
    }

    try {
      const amount = parseFloat(adjustmentAmount);
      const finalAmount = adjustmentType === "subtract" ? -amount : amount;

      const { error } = await supabase.rpc('admin_update_balance', {
        p_user_id: selectedUser,
        p_amount: finalAmount
      });

      if (error) throw error;

      toast({
        title: "Balance Updated",
        description: `Successfully ${adjustmentType === "add" ? "added" : "subtracted"} ${amount} GCoins`,
      });

      setSelectedUser("");
      setAdjustmentAmount("");
      fetchDashboardData();
      fetchUsers();
    } catch (error: any) {
      console.error('Error updating balance:', error);
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleExchangeRateUpdate = async () => {
    try {
      const rate = parseFloat(exchangeRate);
      
      const { error } = await supabase.rpc('admin_update_exchange_rate', {
        p_currency: 'NGN',
        p_rate: rate
      });

      if (error) throw error;

      toast({
        title: "Exchange Rate Updated",
        description: `NGN rate updated to ${formatCurrency(rate, "NGN")} per GCoin`,
      });
    } catch (error: any) {
      console.error('Error updating exchange rate:', error);
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin h-8 w-8 border-4 border-purple-500/20 border-t-purple-500 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button onClick={fetchDashboardData} variant="outline">
          Refresh Data
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.totalUsers)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total GCoins</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.totalBalance)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.totalTransactions)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rentals</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.activeRentals)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staked</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.totalStaked)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Search */}
        <AdminUserSearch />

        {/* Balance Management */}
        <Card>
          <CardHeader>
            <CardTitle>User Balance Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user-select">Select User</Label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.username} - {formatNumber(user.balance)} GCoins
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adjustment-type">Action</Label>
              <Select value={adjustmentType} onValueChange={setAdjustmentType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="add">Add GCoins</SelectItem>
                  <SelectItem value="subtract">Subtract GCoins</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={adjustmentAmount}
                onChange={(e) => setAdjustmentAmount(e.target.value)}
              />
            </div>

            <Button onClick={handleBalanceAdjustment} className="w-full">
              Update Balance
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Exchange Rate Management */}
        <Card>
          <CardHeader>
            <CardTitle>Exchange Rate Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="exchange-rate">NGN per GCoin</Label>
              <Input
                id="exchange-rate"
                type="number"
                placeholder="Enter exchange rate"
                value={exchangeRate}
                onChange={(e) => setExchangeRate(e.target.value)}
              />
            </div>

            <Button onClick={handleExchangeRateUpdate} className="w-full">
              Update Exchange Rate
            </Button>

            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                Current rate: 1 GCoin = {formatCurrency(parseFloat(exchangeRate) || 850, "NGN")}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent User Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {stats.recentActivity.map((activity: any) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Activity className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="font-medium">{activity.profiles?.username || 'Unknown User'}</p>
                      <p className="text-sm text-gray-500">{activity.action}</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(activity.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
