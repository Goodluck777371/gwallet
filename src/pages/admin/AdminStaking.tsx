
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatNumber } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Search, 
  TrendingUp, 
  Coins,
  CalendarDays,
  Clock
} from "lucide-react";

interface StakingPosition {
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

interface StakingSummary {
  totalStaked: number;
  activeStakes: number;
  projectedRewards: number;
  stakedByDuration: {
    [key: string]: number;
  };
}

const AdminStaking = () => {
  const { toast } = useToast();
  const [stakingPositions, setStakingPositions] = useState<StakingPosition[]>([]);
  const [filteredPositions, setFilteredPositions] = useState<StakingPosition[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState<StakingSummary>({
    totalStaked: 0,
    activeStakes: 0,
    projectedRewards: 0,
    stakedByDuration: {}
  });

  useEffect(() => {
    fetchStakingData();
  }, []);

  const fetchStakingData = async () => {
    try {
      const { data, error } = await supabase
        .from('staking_positions')
        .select('*')
        .order('start_date', { ascending: false });

      if (error) throw error;

      setStakingPositions(data || []);
      setFilteredPositions(data || []);
      
      // Calculate summary stats
      calculateSummary(data || []);
    } catch (error) {
      console.error('Error fetching staking data:', error);
      toast.error({
        title: "Error",
        description: "Failed to load staking data"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateSummary = (positions: StakingPosition[]) => {
    // Filter active positions
    const activePositions = positions.filter(p => p.status === 'active');
    
    // Calculate total staked amount
    const totalStaked = positions.reduce((sum, p) => sum + p.amount, 0);
    
    // Calculate projected rewards from active stakes
    const projectedRewards = activePositions.reduce((sum, p) => sum + p.estimated_reward, 0);
    
    // Group stakes by duration
    const stakedByDuration = activePositions.reduce((acc: { [key: string]: number }, p) => {
      const duration = p.duration_days.toString();
      acc[duration] = (acc[duration] || 0) + p.amount;
      return acc;
    }, {});
    
    setSummary({
      totalStaked,
      activeStakes: activePositions.length,
      projectedRewards,
      stakedByDuration
    });
  };

  // Apply filters and search
  useEffect(() => {
    let filtered = [...stakingPositions];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }
    
    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.id.toLowerCase().includes(term) ||
        p.user_id.toLowerCase().includes(term)
      );
    }
    
    setFilteredPositions(filtered);
  }, [searchTerm, statusFilter, stakingPositions]);

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

  const getShortId = (id: string) => {
    return id.substring(0, 8) + '...' + id.substring(id.length - 8);
  };

  // Stats cards for display
  const statCards = [
    {
      title: "Total Staked",
      value: formatNumber(summary.totalStaked),
      description: "GCoins currently staked",
      icon: <Coins className="h-6 w-6" />,
      iconClass: "bg-purple-100 text-purple-600",
    },
    {
      title: "Active Stakes",
      value: summary.activeStakes,
      description: "Active staking positions",
      icon: <TrendingUp className="h-6 w-6" />,
      iconClass: "bg-green-100 text-green-600",
    },
    {
      title: "Projected Rewards",
      value: formatNumber(summary.projectedRewards),
      description: "GCoins to be distributed as rewards",
      icon: <Coins className="h-6 w-6" />,
      iconClass: "bg-amber-100 text-amber-600",
    },
  ];

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Staking Monitor</h1>
          <p className="text-gray-500 mt-1">
            Monitor and manage staking positions
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
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

      {/* Duration Distribution Card */}
      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Duration Distribution</CardTitle>
            <CardDescription>GCoins staked by duration periods</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(summary.stakedByDuration).map(([duration, amount]) => (
                <div key={duration} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <CalendarDays className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-sm font-medium">{duration} Days</span>
                  </div>
                  <div className="text-xl font-bold">{formatNumber(amount)} GCoin</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by position ID or user ID..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="w-[150px]">
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="canceled">Canceled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Position ID</TableHead>
              <TableHead>User ID</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Reward</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin h-8 w-8 border-4 border-gray-300 border-t-gray-800 rounded-full"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredPositions.length > 0 ? (
              filteredPositions.map((position) => (
                <TableRow key={position.id}>
                  <TableCell className="font-mono text-xs">
                    {getShortId(position.id)}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {getShortId(position.user_id)}
                  </TableCell>
                  <TableCell>{formatNumber(position.amount)} GCoin</TableCell>
                  <TableCell>{position.duration_days} days</TableCell>
                  <TableCell className="text-green-600">+{formatNumber(position.estimated_reward)} GCoin</TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex items-center text-sm">
                      <Clock className="h-3 w-3 mr-1 text-gray-400" />
                      {formatDate(position.start_date)}
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex items-center text-sm">
                      <Clock className="h-3 w-3 mr-1 text-gray-400" />
                      {formatDate(position.end_date)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusClassName(position.status)}`}>
                      {position.status.charAt(0).toUpperCase() + position.status.slice(1)}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-gray-500">
                  No staking positions found matching your criteria
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminStaking;
