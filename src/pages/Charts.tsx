
import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Activity, BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, AreaChart, Area } from "recharts";
import Header from "@/components/Header";

interface PriceData {
  id: string;
  price: number;
  volume: number;
  timestamp: string;
  change_24h: number;
}

interface TransactionFeed {
  id: string;
  transaction_type: string;
  amount: number;
  price: number;
  timestamp: string;
  wallet_address: string;
}

const Charts = () => {
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [transactionFeed, setTransactionFeed] = useState<TransactionFeed[]>([]);
  const [currentPrice, setCurrentPrice] = useState(853);
  const [priceChange, setPriceChange] = useState(1.8);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      console.log('Starting to fetch chart data...');
      setIsLoading(true);
      setError(null);
      
      await Promise.all([
        fetchChartData(),
        fetchTransactionFeed()
      ]);
    } catch (err) {
      console.error('Error loading chart data:', err);
      setError('Failed to load chart data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchChartData = async () => {
    try {
      console.log('Fetching price history...');
      const { data, error } = await supabase
        .from('gcoin_price_history')
        .select('*')
        .order('timestamp', { ascending: true });
      
      if (error) {
        console.error('Error fetching price data:', error);
        throw error;
      }
      
      console.log('Price data fetched:', data);
      if (data && data.length > 0) {
        const formattedData = data.map(item => ({
          id: item.id,
          price: parseFloat(item.price) || 853,
          volume: parseFloat(item.volume) || 0,
          timestamp: item.timestamp,
          change_24h: parseFloat(item.change_24h) || 0
        }));
        
        setPriceData(formattedData);
        const latest = formattedData[formattedData.length - 1];
        setCurrentPrice(latest.price);
        setPriceChange(latest.change_24h);
      } else {
        // Generate sample data for demo
        const now = new Date();
        const sampleData = Array.from({ length: 24 }, (_, i) => ({
          id: `sample-${i}`,
          price: 850 + Math.random() * 10 - 5,
          volume: 15000 + Math.random() * 10000,
          timestamp: new Date(now.getTime() - (23 - i) * 60 * 60 * 1000).toISOString(),
          change_24h: (Math.random() - 0.5) * 4
        }));
        setPriceData(sampleData);
        console.log('Using sample price data');
      }
    } catch (error) {
      console.error('Error in fetchChartData:', error);
      throw error;
    }
  };

  const fetchTransactionFeed = async () => {
    try {
      console.log('Fetching transaction feed...');
      const { data, error } = await supabase
        .from('global_transaction_feed')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(20);
      
      if (error) {
        console.error('Error fetching transaction feed:', error);
        throw error;
      }
      
      console.log('Transaction feed fetched:', data);
      if (data && data.length > 0) {
        const formattedTransactions = data.map(item => ({
          id: item.id,
          transaction_type: item.transaction_type,
          amount: parseFloat(item.amount) || 0,
          price: parseFloat(item.price) || 853,
          timestamp: item.timestamp,
          wallet_address: item.wallet_address || 'Unknown'
        }));
        setTransactionFeed(formattedTransactions);
      } else {
        // Generate sample transactions for demo
        const sampleTransactions = [
          { id: '1', transaction_type: 'buy', amount: 1500, price: 853, timestamp: new Date().toISOString(), wallet_address: 'gCoinabcd1234' },
          { id: '2', transaction_type: 'sell', amount: 750, price: 851, timestamp: new Date(Date.now() - 30*60*1000).toISOString(), wallet_address: 'gCoinefgh5678' },
          { id: '3', transaction_type: 'send', amount: 200, price: 850, timestamp: new Date(Date.now() - 60*60*1000).toISOString(), wallet_address: 'gCoinijkl9012' }
        ];
        setTransactionFeed(sampleTransactions);
        console.log('Using sample transaction data');
      }
    } catch (error) {
      console.error('Error in fetchTransactionFeed:', error);
      throw error;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(price);
  };

  const formatTime = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid time';
    }
  };

  const chartConfig = {
    price: {
      label: "Price",
      color: "hsl(var(--chart-1))",
    },
  };

  const chartData = priceData.map((item, index) => ({
    time: formatTime(item.timestamp),
    price: item.price,
    volume: item.volume,
    index
  }));

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="pt-20 pb-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Charts</h2>
                <p className="text-gray-600">{error}</p>
                <button 
                  onClick={fetchData} 
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="pt-20 pb-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">Loading GCoin charts...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-20 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">📈 GCoin Charts 📊</h1>
            <p className="text-gray-500">Real-time price data and market activity</p>
          </div>

          {/* Price Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Price</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatPrice(currentPrice)}</div>
                <div className={`flex items-center text-xs ${priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {priceChange >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                  {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}% (24h)
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">24h Volume</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {priceData.length > 0 ? Math.round(priceData[priceData.length - 1].volume).toLocaleString() : '26,000'}
                </div>
                <p className="text-xs text-muted-foreground">GCoins traded</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Market Cap</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatPrice(currentPrice * 1000000)}
                </div>
                <p className="text-xs text-muted-foreground">Total market value</p>
              </CardContent>
            </Card>
          </div>

          {/* Price Chart */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>GCoin Price Chart (24h)</CardTitle>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="time" 
                        tickLine={false}
                        axisLine={false}
                        className="text-xs"
                      />
                      <YAxis 
                        tickLine={false}
                        axisLine={false}
                        className="text-xs"
                        domain={['dataMin - 5', 'dataMax + 5']}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="price"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorPrice)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="h-[400px] flex items-center justify-center text-gray-500">
                  No price data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Transaction Feed */}
          <Card>
            <CardHeader>
              <CardTitle>Live Transaction Feed</CardTitle>
              <p className="text-sm text-muted-foreground">Real-time blockchain activity</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactionFeed.length > 0 ? (
                  transactionFeed.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                          tx.transaction_type === 'buy' ? 'bg-green-500' :
                          tx.transaction_type === 'sell' ? 'bg-red-500' :
                          tx.transaction_type === 'send' ? 'bg-blue-500' :
                          'bg-yellow-500'
                        }`} />
                        <div>
                          <div className="font-medium capitalize">{tx.transaction_type}</div>
                          <div className="text-xs text-gray-500">
                            {tx.wallet_address ? `${tx.wallet_address.slice(0, 8)}...${tx.wallet_address.slice(-4)}` : 'Unknown'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{Math.round(tx.amount).toLocaleString()} GC</div>
                        <div className="text-xs text-gray-500">{formatTime(tx.timestamp)}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No transaction data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Charts;
