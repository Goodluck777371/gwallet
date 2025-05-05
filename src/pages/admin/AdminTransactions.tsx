
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatNumber } from "@/lib/utils";
import { Loader2, ArrowUpDown, Download, Filter, Search, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Drawer, DrawerContent, DrawerTrigger, DrawerClose, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from "@/components/ui/drawer";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  recipient?: string;
  sender?: string;
  timestamp: string;
  status: string;
  description?: string;
  fee?: number;
}

const AdminTransactions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<{column: keyof Transaction, direction: 'asc' | 'desc'}>({
    column: 'timestamp',
    direction: 'desc'
  });

  // Available transaction types and statuses
  const transactionTypes = ["send", "receive", "buy", "sell", "stake", "unstake"];
  const transactionStatuses = ["completed", "pending", "failed", "canceled"];

  useEffect(() => {
    fetchTransactions();
  }, [toast]);
  
  useEffect(() => {
    applyFilters();
  }, [transactions, searchTerm, typeFilter, statusFilter, sortBy]);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) {
        console.error("Error fetching transactions:", error);
        toast.error({
          title: "Error",
          description: "Failed to load transactions",
        });
        return;
      }

      setTransactions(data || []);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...transactions];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(tx => 
        tx.id.toLowerCase().includes(term) ||
        (tx.recipient && tx.recipient.toLowerCase().includes(term)) ||
        (tx.sender && tx.sender.toLowerCase().includes(term)) ||
        (tx.description && tx.description.toLowerCase().includes(term)) ||
        tx.type.toLowerCase().includes(term)
      );
    }

    // Apply type filter
    if (typeFilter.length > 0) {
      filtered = filtered.filter(tx => typeFilter.includes(tx.type));
    }

    // Apply status filter
    if (statusFilter.length > 0) {
      filtered = filtered.filter(tx => statusFilter.includes(tx.status));
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[sortBy.column];
      const bValue = b[sortBy.column];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortBy.direction === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortBy.direction === 'asc' 
          ? aValue - bValue 
          : bValue - aValue;
      }

      return 0;
    });

    setFilteredTransactions(filtered);
  };

  const handleSort = (column: keyof Transaction) => {
    setSortBy(prev => ({
      column,
      direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const toggleTypeFilter = (type: string) => {
    setTypeFilter(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type) 
        : [...prev, type]
    );
  };

  const toggleStatusFilter = (status: string) => {
    setStatusFilter(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status) 
        : [...prev, status]
    );
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'canceled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch(type.toLowerCase()) {
      case 'buy':
        return 'bg-purple-100 text-purple-800';
      case 'sell':
        return 'bg-orange-100 text-orange-800';
      case 'send':
        return 'bg-red-100 text-red-800';
      case 'receive':
        return 'bg-green-100 text-green-800';
      case 'stake':
        return 'bg-blue-100 text-blue-800';
      case 'unstake':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Transactions
          </h1>
          <p className="text-gray-500 mt-1">
            Monitor and manage all transactions in the system
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={fetchTransactions}
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filters</span>
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <div className="mx-auto w-full max-w-sm">
                <DrawerHeader>
                  <DrawerTitle>Filter Transactions</DrawerTitle>
                  <DrawerDescription>
                    Apply filters to find specific transactions
                  </DrawerDescription>
                </DrawerHeader>
                <div className="p-4 pb-0">
                  <h3 className="font-medium mb-2">Transaction Types</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {transactionTypes.map((type) => (
                      <div 
                        key={type} 
                        className="flex items-center space-x-2"
                      >
                        <Checkbox 
                          id={`type-${type}`}
                          checked={typeFilter.includes(type)} 
                          onCheckedChange={() => toggleTypeFilter(type)}
                        />
                        <label 
                          htmlFor={`type-${type}`}
                          className="text-sm capitalize"
                        >
                          {type}
                        </label>
                      </div>
                    ))}
                  </div>
                  
                  <h3 className="font-medium mt-4 mb-2">Transaction Status</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {transactionStatuses.map((status) => (
                      <div 
                        key={status} 
                        className="flex items-center space-x-2"
                      >
                        <Checkbox 
                          id={`status-${status}`}
                          checked={statusFilter.includes(status)} 
                          onCheckedChange={() => toggleStatusFilter(status)}
                        />
                        <label 
                          htmlFor={`status-${status}`}
                          className="text-sm capitalize"
                        >
                          {status}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <DrawerFooter>
                  <DrawerClose asChild>
                    <Button>Apply Filters</Button>
                  </DrawerClose>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setTypeFilter([]);
                      setStatusFilter([]);
                    }}
                  >
                    Reset Filters
                  </Button>
                </DrawerFooter>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input 
              className="pl-10"
              placeholder="Search by ID, recipient, sender, or description..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-md">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center">
                <Loader2 className="h-10 w-10 animate-spin text-purple-500 mb-4" />
                <p className="text-purple-500 text-lg font-medium">Loading transactions...</p>
              </div>
            </div>
          ) : (
            <div className="rounded-md overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('id')}
                      >
                        <div className="flex items-center">
                          ID
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('type')}
                      >
                        <div className="flex items-center">
                          Type
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('amount')}
                      >
                        <div className="flex items-center">
                          Amount
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead>Sender</TableHead>
                      <TableHead>Recipient</TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('timestamp')}
                      >
                        <div className="flex items-center">
                          Timestamp
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('status')}
                      >
                        <div className="flex items-center">
                          Status
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-100 text-right"
                        onClick={() => handleSort('fee')}
                      >
                        <div className="flex items-center justify-end">
                          Fee
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.length > 0 ? (
                      filteredTransactions.map((transaction) => (
                        <TableRow key={transaction.id} className="hover:bg-gray-50">
                          <TableCell className="font-mono text-xs md:text-sm truncate max-w-[60px] md:max-w-[100px]">
                            {transaction.id}
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(transaction.type)}`}>
                              {transaction.type}
                            </span>
                          </TableCell>
                          <TableCell className="font-medium">{formatNumber(transaction.amount)}</TableCell>
                          <TableCell className="truncate max-w-[80px] md:max-w-[120px]">{transaction.sender}</TableCell>
                          <TableCell className="truncate max-w-[80px] md:max-w-[120px]">{transaction.recipient}</TableCell>
                          <TableCell>{formatDate(transaction.timestamp)}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                              {transaction.status}
                            </span>
                          </TableCell>
                          <TableCell className="truncate max-w-[100px] md:max-w-[200px]">{transaction.description}</TableCell>
                          <TableCell className="text-right">{formatNumber(transaction.fee || 0)}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={9} className="h-32 text-center">
                          <div className="flex flex-col items-center">
                            <p className="text-lg font-medium text-gray-500">No transactions found</p>
                            <p className="text-gray-400">Try adjusting your search or filters</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminTransactions;
