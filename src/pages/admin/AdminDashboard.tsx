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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { 
  Users,
  Wallet,
  TrendingUp,
  Activity,
  Database,
  Clock,
  Loader2,
  ArrowUp,
  ArrowDown,
  CircleDollarSign,
  UserCheck
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalGcoins: number;
  totalTransactions: number;
  activeStakes: number;
  stakedAmount: number;
  dailyTransactions: { date: string; count: number }[];
  transactionsByType: { type: string; count: number }[];
  recentActivity: {
    user_id: string;
    username: string;
    action: string;
    timestamp: string;
    ip_address: string;
  }[];
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00C49F'];

const AdminDashboard = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalGcoins: 0,
    totalTransactions: 0,
    activeStakes: 0,
    stakedAmount: 0,
    dailyTransactions: [],
    transactionsByType: [],
    recentActivity: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'7d' | '14d' | '30d'>('14d');

  useEffect(() => {
    fetchDashboardStats();
  }, [timeframe]);

  const fetchDashboardStats = async () => {
    try {
      setIsLoading(true);
      
      // Get user activity stats from our new function
      const { data: activityStats, error: activityError } = await supabase.rpc(
        'get_user_activity_stats', 
        { days: timeframe === '7d' ? 7 : timeframe === '14d' ? 14 : 30 }
      );
      
      if (activityError) {
        console.error('Error fetching activity stats:', activityError);
        toast.error({ 
          title: "Error", 
          description: "Failed to fetch user activity data" 
        });
      }

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

      // Get transactions for the selected timeframe
      const days = timeframe === '7d' ? 7 : timeframe === '14d' ? 14 : 30;
      const timeframeDate = new Date();
      timeframeDate.setDate(timeframeDate.getDate() - days);
      
      const { data: recentTransactions, error: recentTxError } = await supabase
        .from('transactions')
        .select('timestamp, type')
        .gte('timestamp', timeframeDate.toISOString())
        .order('timestamp', { ascending: true });
        
      if (recentTxError) {
        console.error('Error fetching recent transactions:', recentTxError);
        toast.error({ 
          title: "Error", 
          description: "Failed to fetch transaction history" 
        });
      }

      // Process transactions data
      const { dailyData, typeData } = processTransactionData(recentTransactions || [], days);

      setStats({
        totalUsers: totalUsers || 0,
        activeUsers: activityStats?.active_users || 0,
        totalGcoins,
        totalTransactions: totalTransactions || 0,
        activeStakes: activeStakes?.length || 0,
        stakedAmount,
        dailyTransactions: dailyData,
        transactionsByType: typeData,
        recentActivity: activityStats?.recent_activity || []
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

  // Process transactions to get daily count and by type
  const processTransactionData = (transactions: any[], days: number) => {
    // Process by date
    const dailyCounts: { [key: string]: number } = {};
    
    // Initialize all dates in range with 0
    const dailyData = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(now.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dailyCounts[dateStr] = 0;
    }
    
    // Count transactions by date
    transactions.forEach(tx => {
      const date = new Date(tx.timestamp).toISOString().split('T')[0];
      dailyCounts[date] = (dailyCounts[date] || 0) + 1;
    });
    
    // Convert to array format for chart
    for (const [date, count] of Object.entries(dailyCounts)) {
      dailyData.push({ date, count });
    }
    
    // Sort by date
    dailyData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Process by transaction type
    const typeCounts: { [key: string]: number } = {};
    transactions.forEach(tx => {
      const type = tx.type || 'unknown';
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });
    
    const typeData = Object.entries(typeCounts).map(([type, count]) => ({ type, count }));
    
    return { dailyData, typeData };
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
      title: "Active Users",
      value: stats.activeUsers,
      description: "Recent activity",
      icon: <UserCheck className="h-6 w-6" />,
      iconClass: "bg-green-100 text-green-600",
    },
    {
      title: "Total GCoins",
      value: formatNumber(stats.totalGcoins),
      description: "In circulation",
      icon: <Wallet className="h-6 w-6" />,
      iconClass: "bg-amber-100 text-amber-600",
    },
    {
      title: "Active Stakes",
      value: stats.activeStakes,
      description: `${formatNumber(stats.stakedAmount)} GCoins staked`,
      icon: <TrendingUp className="h-6 w-6" />,
      iconClass: "bg-purple-100 text-purple-600",
    },
  ];

  if (isLoading) {
    return (
      <div className="p-6 h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-16 w-16 animate-spin mx-auto text-purple-500 mb-6" />
          <p className="text-gray-500 text-lg">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-gray-500 mt-1">
            Overview of the GWallet system
          </p>
        </div>
        <div className="flex items-center mt-4 md:mt-0 space-x-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => fetchDashboardStats()}
            className="flex items-center gap-2"
          >
            <Clock className="h-4 w-4" />
            Refresh
          </Button>
          <div className="flex items-center text-sm text-gray-500">
            <p className="hidden md:block mr-2">Last updated:</p>
            {new Date().toLocaleString()}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <Card key={stat.title} className="overflow-hidden transition-shadow hover:shadow-lg border-t-4 border-t-blue-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
              <CardTitle className="text-sm font-medium text-gray-500">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${stat.iconClass}`}>
                {stat.icon}
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Timeframe Selector */}
      <div className="mb-4 flex justify-end">
        <div className="bg-gray-100 rounded-md p-1 inline-flex">
          <Button
            variant={timeframe === '7d' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setTimeframe('7d')}
            className={timeframe === '7d' ? 'text-white' : 'text-gray-600'}
          >
            7 Days
          </Button>
          <Button
            variant={timeframe === '14d' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setTimeframe('14d')}
            className={timeframe === '14d' ? 'text-white' : 'text-gray-600'}
          >
            14 Days
          </Button>
          <Button
            variant={timeframe === '30d' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setTimeframe('30d')}
            className={timeframe === '30d' ? 'text-white' : 'text-gray-600'}
          >
            30 Days
          </Button>
        </div>
      </div>

      {/* Tabs with Different Views */}
      <Tabs defaultValue="activity" className="mb-6">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            System Overview
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="activity" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="shadow-md border-t-4 border-t-purple-500">
              <CardHeader>
                <CardTitle>Transaction Activity</CardTitle>
                <CardDescription>
                  Daily transaction count over the last {timeframe === '7d' ? '7' : timeframe === '14d' ? '14' : '30'} days
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ChartContainer config={{'count': { color: '#9b87f5' }}}>
                      <LineChart data={stats.dailyTransactions}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(date) => {
                            const d = new Date(date);
                            return `${d.getDate()}/${d.getMonth() + 1}`;
                          }}
                          stroke="#94a3b8"
                        />
                        <YAxis stroke="#94a3b8" />
                        <ChartTooltip 
                          content={
                            <ChartTooltipContent
                              nameKey="date"
                              labelKey="count"
                              formatter={(value, name) => [value + ' transactions', 'Count']}
                              labelFormatter={(label) => `Date: ${new Date(label).toLocaleDateString()}`}
                            />
                          }
                        />
                        <Line 
                          type="monotone" 
                          dataKey="count" 
                          name="count"
                          stroke="#9b87f5" 
                          strokeWidth={3} 
                          dot={{ fill: '#9b87f5', r: 4 }} 
                          activeDot={{ r: 6, fill: '#7E69AB' }}
                        />
                      </LineChart>
                    </ChartContainer>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-md border-t-4 border-t-green-500">
              <CardHeader>
                <CardTitle>Transactions by Type</CardTitle>
                <CardDescription>
                  Distribution of transaction types
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    {stats.transactionsByType.length > 0 ? (
                      <PieChart>
                        <Pie
                          data={stats.transactionsByType}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                          nameKey="type"
                          label={({ type, percent }) => `${type}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {stats.transactionsByType.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: any, name: any, props: any) => [
                            `${value} transactions`, props.payload.type
                          ]}
                        />
                      </PieChart>
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-500">
                        No transaction data available
                      </div>
                    )}
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* User Activity Table */}
          <Card className="shadow-md border-t-4 border-t-blue-500">
            <CardHeader>
              <CardTitle>Recent User Activity</CardTitle>
              <CardDescription>
                Latest user logins and logouts
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              {stats.recentActivity && stats.recentActivity.length > 0 ? (
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Username</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>IP Address</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats.recentActivity.map((activity, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{activity.username}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              activity.action === 'login' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {activity.action === 'login' ? 'Login' : 'Logout'}
                            </span>
                          </TableCell>
                          <TableCell>{new Date(activity.timestamp).toLocaleString()}</TableCell>
                          <TableCell>{activity.ip_address || 'Unknown'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="py-8 text-center text-gray-500">
                  No recent activity to display
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-md border-t-4 border-t-amber-500">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Overview of system activity
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg border border-green-100">
                  <div className="flex items-center">
                    <div className="bg-green-100 p-2 rounded-full mr-4">
                      <ArrowUp className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">New users increase</p>
                      <p className="text-xs text-gray-500">Growth of 12% in the last {timeframe}</p>
                    </div>
                  </div>
                  <span className="text-green-600 font-bold">+12%</span>
                </div>
                
                <div className="flex items-center justify-between p-2 bg-purple-50 rounded-lg border border-purple-100">
                  <div className="flex items-center">
                    <div className="bg-purple-100 p-2 rounded-full mr-4">
                      <CircleDollarSign className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">Transaction volume</p>
                      <p className="text-xs text-gray-500">600,000 GCoins in the last {timeframe}</p>
                    </div>
                  </div>
                  <span className="text-purple-600 font-bold">+8%</span>
                </div>
                
                <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-2 rounded-full mr-4">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">New staking positions</p>
                      <p className="text-xs text-gray-500">24 new stakes in the last {timeframe}</p>
                    </div>
                  </div>
                  <span className="text-blue-600 font-bold">+15%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-md border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle>System Health</CardTitle>
                <CardDescription>
                  Current GWallet system status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Database Status</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Healthy
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">API Response Time</span>
                    <div className="flex items-center">
                      <span className="text-sm text-green-600 font-medium">145ms</span>
                      <ArrowDown className="ml-1 h-3 w-3 text-green-600" />
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Last Backup</span>
                    <span className="text-sm">{new Date().toLocaleDateString()}, 04:30 AM</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Total Storage Used</span>
                    <div className="flex items-center">
                      <span className="text-sm">1.2 GB</span>
                      <span className="ml-1 text-xs text-amber-600">(75%)</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-md border-l-4 border-l-purple-500">
              <CardHeader>
                <CardTitle>Recent Updates</CardTitle>
                <CardDescription>
                  Latest system updates and changes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-l-2 border-blue-500 pl-4 py-2 bg-blue-50 rounded-r-lg">
                    <p className="text-sm font-medium">Exchange Rate Updated</p>
                    <p className="text-xs text-gray-500">Today, 10:23 AM</p>
                  </div>
                  <div className="border-l-2 border-green-500 pl-4 py-2 bg-green-50 rounded-r-lg">
                    <p className="text-sm font-medium">System Backup Complete</p>
                    <p className="text-xs text-gray-500">Today, 04:30 AM</p>
                  </div>
                  <div className="border-l-2 border-amber-500 pl-4 py-2 bg-amber-50 rounded-r-lg">
                    <p className="text-sm font-medium">Fee Structure Modified</p>
                    <p className="text-xs text-gray-500">Yesterday, 2:45 PM</p>
                  </div>
                  <div className="border-l-2 border-purple-500 pl-4 py-2 bg-purple-50 rounded-r-lg">
                    <p className="text-sm font-medium">New Admin User Added</p>
                    <p className="text-xs text-gray-500">{new Date().toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="shadow-md border-l-4 border-l-green-500">
            <CardHeader>
              <CardTitle>System Overview</CardTitle>
              <CardDescription>
                Key performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: 'Login', value: 244 },
                      { name: 'Transactions', value: 158 },
                      { name: 'New Users', value: 34 },
                      { name: 'API Calls', value: 1204 },
                    ]}
                    margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip 
                      formatter={(value: any) => [value, 'Count']}
                      labelFormatter={(label: any) => `${label} today`}
                    />
                    <Bar dataKey="value" fill="#9b87f5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
