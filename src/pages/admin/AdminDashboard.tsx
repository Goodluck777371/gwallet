import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatNumber } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { 
  Users,
  Wallet,
  TrendingUp,
  ActivityIcon,
  Database,
  Clock,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DashboardStats {
  totalUsers: number;
  totalGcoins: number;
  totalTransactions: number;
  activeStakes: number;
  stakedAmount: number;
  dailyTransactions: { date: string; count: number }[];
}

const AdminDashboard = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalGcoins: 0,
    totalTransactions: 0,
    activeStakes: 0,
    stakedAmount: 0,
    dailyTransactions: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setIsLoading(true);
        
        // Get total users count
        const { count: totalUsers, error: usersError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
          
        if (usersError) {
          console.error('Error fetching user count:', usersError);
          toast.error({ 
            title: "Error", 
            description: "Failed to fetch user data" 
          });
        }

        // Get total GCoins in circulation
        const { data: balanceData, error: balanceError } = await supabase
          .from('profiles')
          .select('balance');
        
        if (balanceError) {
          console.error('Error fetching balances:', balanceError);
          toast.error({ 
            title: "Error", 
            description: "Failed to fetch balance data" 
          });
        }
        
        const totalGcoins = balanceData?.reduce((sum, user) => sum + (user.balance || 0), 0) || 0;

        // Get total transactions
        const { count: totalTransactions, error: txError } = await supabase
          .from('transactions')
          .select('*', { count: 'exact', head: true });
          
        if (txError) {
          console.error('Error fetching transaction count:', txError);
          toast.error({ 
            title: "Error", 
            description: "Failed to fetch transaction data" 
          });
        }

        // Get active stakes
        const { data: activeStakes, error: stakesError } = await supabase
          .from('staking_positions')
          .select('*')
          .eq('status', 'active');
          
        if (stakesError) {
          console.error('Error fetching stakes:', stakesError);
          toast.error({ 
            title: "Error", 
            description: "Failed to fetch staking data" 
          });
        }
        
        const stakedAmount = activeStakes?.reduce((sum, stake) => sum + stake.amount, 0) || 0;

        // Get daily transactions for the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const { data: recentTransactions, error: recentTxError } = await supabase
          .from('transactions')
          .select('timestamp')
          .gte('timestamp', thirtyDaysAgo.toISOString())
          .order('timestamp', { ascending: true });
          
        if (recentTxError) {
          console.error('Error fetching recent transactions:', recentTxError);
          toast.error({ 
            title: "Error", 
            description: "Failed to fetch transaction history" 
          });
        }

        // Process transaction data for chart
        const dailyTransactions = processDailyTransactions(recentTransactions || []);

        setStats({
          totalUsers: totalUsers || 0,
          totalGcoins,
          totalTransactions: totalTransactions || 0,
          activeStakes: activeStakes?.length || 0,
          stakedAmount,
          dailyTransactions
        });

      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        toast.error({ 
          title: "Error", 
          description: "Failed to load dashboard statistics" 
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardStats();
  }, [toast]);

  // Process transactions to get daily count
  const processDailyTransactions = (transactions: any[]) => {
    const dailyCounts: { [key: string]: number } = {};
    
    transactions.forEach(tx => {
      const date = new Date(tx.timestamp).toISOString().split('T')[0];
      dailyCounts[date] = (dailyCounts[date] || 0) + 1;
    });
    
    // Fill in missing dates in the last 14 days
    const result = [];
    const now = new Date();
    
    for (let i = 13; i >= 0; i--) {
      const date = new Date();
      date.setDate(now.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      result.push({
        date: dateStr,
        count: dailyCounts[dateStr] || 0
      });
    }
    
    return result;
  };

  // Stat cards to display
  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      description: "Registered users",
      icon: <Users className="h-6 w-6" />,
      iconClass: "bg-blue-100 text-blue-600",
    },
    {
      title: "Total GCoins",
      value: formatNumber(stats.totalGcoins),
      description: "In circulation",
      icon: <Wallet className="h-6 w-6" />,
      iconClass: "bg-green-100 text-green-600",
    },
    {
      title: "Total Transactions",
      value: stats.totalTransactions,
      description: "All time",
      icon: <ActivityIcon className="h-6 w-6" />,
      iconClass: "bg-purple-100 text-purple-600",
    },
    {
      title: "Active Stakes",
      value: stats.activeStakes,
      description: `${formatNumber(stats.stakedAmount)} GCoins staked`,
      icon: <TrendingUp className="h-6 w-6" />,
      iconClass: "bg-amber-100 text-amber-600",
    },
  ];

  if (isLoading) {
    return (
      <div className="p-6 h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Overview of the GWallet system
          </p>
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <Clock className="mr-2 h-4 w-4" />
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${stat.iconClass}`}>
                {stat.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-gray-500 mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs with Different Views */}
      <Tabs defaultValue="activity">
        <TabsList>
          <TabsTrigger value="activity">
            <ActivityIcon className="h-4 w-4 mr-2" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="system">
            <Database className="h-4 w-4 mr-2" />
            System Overview
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="activity" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Transaction Activity</CardTitle>
              <CardDescription>
                Daily transaction count over the last 14 days
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.dailyTransactions}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => {
                        const d = new Date(date);
                        return `${d.getDate()}/${d.getMonth() + 1}`;
                      }}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: any, name: any) => [`${value} transactions`, 'Count']}
                      labelFormatter={(label: any) => `Date: ${new Date(label).toLocaleDateString()}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#3b82f6" 
                      strokeWidth={2} 
                      dot={{ fill: '#3b82f6' }} 
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="system" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
                <CardDescription>
                  Current GWallet system status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Database Status</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Healthy
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">API Response Time</span>
                    <span className="text-sm">145ms</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Last Backup</span>
                    <span className="text-sm">Today, 04:30 AM</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Storage Used</span>
                    <span className="text-sm">1.2 GB</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Updates</CardTitle>
                <CardDescription>
                  Latest system updates and changes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-l-2 border-blue-500 pl-4 py-1">
                    <p className="text-sm font-medium">Exchange Rate Updated</p>
                    <p className="text-xs text-gray-500">Today, 10:23 AM</p>
                  </div>
                  <div className="border-l-2 border-green-500 pl-4 py-1">
                    <p className="text-sm font-medium">System Backup Complete</p>
                    <p className="text-xs text-gray-500">Today, 04:30 AM</p>
                  </div>
                  <div className="border-l-2 border-amber-500 pl-4 py-1">
                    <p className="text-sm font-medium">Fee Structure Modified</p>
                    <p className="text-xs text-gray-500">Yesterday, 2:45 PM</p>
                  </div>
                  <div className="border-l-2 border-purple-500 pl-4 py-1">
                    <p className="text-sm font-medium">New Admin User Added</p>
                    <p className="text-xs text-gray-500">{new Date().toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
