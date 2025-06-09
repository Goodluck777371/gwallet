
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUpIcon, ArrowDownIcon, SendIcon, CoinsIcon, PickaxeIcon, TrendingUpIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Area, AreaChart } from "recharts";
import { formatNumber, formatCurrency } from "@/lib/utils";

interface GlobalTransaction {
  id: string;
  transaction_type: string;
  amount: number;
  price: number;
  timestamp: string;
  wallet_address: string;
}

interface PriceData {
  price: number;
  volume: number;
  timestamp: string;
  change_24h: number;
}

const TradingChart = () => {
  const [globalFeed, setGlobalFeed] = useState<GlobalTransaction[]>([]);
  const [priceHistory, setPriceHistory] = useState<PriceData[]>([]);
  const [currentPrice, setCurrentPrice] = useState(853);
  const [priceChange, setPriceChange] = useState(1.8);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTradingData();
    const interval = setInterval(fetchTradingData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchTradingData = async () => {
    try {
      // Fetch global transaction feed
      const { data: feedData, error: feedError } = await supabase
        .from('global_transaction_feed')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(50);

      if (feedError) throw feedError;

      // Fetch price history
      const { data: priceData, error: priceError } = await supabase
        .from('gcoin_price_history')
        .select('*')
        .order('timestamp', { ascending: true })
        .limit(24);

      if (priceError) throw priceError;

      setGlobalFeed(feedData || []);
      setPriceHistory(priceData || []);
      
      if (priceData && priceData.length > 0) {
        const latest = priceData[priceData.length - 1];
        setCurrentPrice(latest.price);
        setPriceChange(latest.change_24h);
      }
    } catch (error) {
      console.error('Error fetching trading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'buy':
        return <ArrowUpIcon className="h-4 w-4 text-green-500" />;
      case 'sell':
        return <ArrowDownIcon className="h-4 w-4 text-red-500" />;
      case 'send':
        return <SendIcon className="h-4 w-4 text-blue-500" />;
      case 'receive':
        return <ArrowDownIcon className="h-4 w-4 text-green-500" />;
      case 'mining_reward':
        return <PickaxeIcon className="h-4 w-4 text-orange-500" />;
      default:
        return <CoinsIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'buy':
        return 'bg-green-100 text-green-800';
      case 'sell':
        return 'bg-red-100 text-red-800';
      case 'send':
        return 'bg-blue-100 text-blue-800';
      case 'receive':
        return 'bg-green-100 text-green-800';
      case 'mining_reward':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const chartConfig = {
    price: {
      label: "Price",
      color: "hsl(var(--primary))",
    },
  };

  const formatChartData = () => {
    return priceHistory.map(item => ({
      time: new Date(item.timestamp).toLocaleDateString(),
      price: item.price,
      volume: item.volume
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Price Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CoinsIcon className="h-6 w-6" />
              GCoin (GCOIN)
            </CardTitle>
            <Badge variant={priceChange >= 0 ? "default" : "destructive"}>
              {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-3xl font-bold">
              {formatCurrency(currentPrice, "NGN")}
            </div>
            <div className={`flex items-center gap-1 ${priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {priceChange >= 0 ? (
                <TrendingUpIcon className="h-4 w-4" />
              ) : (
                <ArrowDownIcon className="h-4 w-4" />
              )}
              <span className="text-sm font-medium">
                {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="chart" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="chart">Price Chart</TabsTrigger>
          <TabsTrigger value="orderbook">Order Book</TabsTrigger>
        </TabsList>

        <TabsContent value="chart">
          <Card>
            <CardHeader>
              <CardTitle>GCoin Price Chart (24h)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ChartContainer config={chartConfig}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={formatChartData()}>
                      <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="time" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="price"
                        stroke="hsl(var(--primary))"
                        fillOpacity={1}
                        fill="url(#colorPrice)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orderbook">
          <Card>
            <CardHeader>
              <CardTitle>Global Transaction Feed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {globalFeed.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      {getTransactionIcon(transaction.transaction_type)}
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge className={getTransactionColor(transaction.transaction_type)}>
                            {transaction.transaction_type.toUpperCase()}
                          </Badge>
                          <span className="font-medium">
                            {formatNumber(transaction.amount)} GCOIN
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          {transaction.wallet_address?.substring(0, 8)}...{transaction.wallet_address?.substring(transaction.wallet_address.length - 6)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {formatCurrency(transaction.price, "NGN")}
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(transaction.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TradingChart;
