import { useState, useEffect } from "react";
import { ArrowDownLeft, ArrowUpRight, Search, AlertTriangle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Header from "@/components/Header";
import TransactionItem, { Transaction } from "@/components/TransactionItem";
import { getTransactions } from "@/utils/transactionService";

const Transactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Fetch user transactions from Supabase
  useEffect(() => {
    if (user) {
      setIsLoading(true);
      
      const fetchTransactions = async () => {
        try {
          const userTransactions = await getTransactions(user.id);
          console.log("Fetched transactions:", userTransactions);
          setTransactions(userTransactions);
        } catch (error) {
          console.error("Failed to load transactions:", error);
          setTransactions([]);
        } finally {
          setIsLoading(false);
        }
      };

      fetchTransactions();
    }
  }, [user]);

  // Apply filters
  useEffect(() => {
    let result = transactions;
    
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (tx) => 
          tx.sender?.toLowerCase().includes(searchLower) ||
          tx.recipient?.toLowerCase().includes(searchLower) ||
          tx.description?.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply type filter
    if (typeFilter !== "all") {
      result = result.filter((tx) => tx.type === typeFilter);
    }
    
    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((tx) => tx.status === statusFilter);
    }
    
    setFilteredTransactions(result);
  }, [search, typeFilter, statusFilter, transactions]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gcoin-blue mb-4"></div>
          <p className="text-gray-500">Loading your transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className={`text-3xl font-bold mb-2 transition-all duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
              Transaction History
            </h1>
            <p className={`text-gray-500 transition-all duration-500 delay-100 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
              View and filter your transaction history
            </p>
          </div>
          
          <div className={`bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-500 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="p-4 border-b border-gray-100">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search transactions..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                
                <div className="flex gap-3">
                  <Select
                    value={typeFilter}
                    onValueChange={setTypeFilter}
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="send">
                        <div className="flex items-center">
                          <ArrowUpRight className="h-4 w-4 mr-2 text-red-500" />
                          Sent
                        </div>
                      </SelectItem>
                      <SelectItem value="receive">
                        <div className="flex items-center">
                          <ArrowDownLeft className="h-4 w-4 mr-2 text-green-500" />
                          Received
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select
                    value={statusFilter}
                    onValueChange={setStatusFilter}
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <div className="divide-y divide-gray-100">
              {isLoading ? (
                <div className="py-20 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gcoin-blue mb-4"></div>
                  <p className="text-gray-500">Loading your transactions...</p>
                </div>
              ) : filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction) => (
                  <TransactionItem 
                    key={transaction.id}
                    transaction={transaction}
                  />
                ))
              ) : (
                <div className="py-20 text-center">
                  <div className="bg-gray-100 rounded-full p-4 inline-block mb-4">
                    <AlertTriangle className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No transactions yet</h3>
                  <p className="text-gray-500 max-w-md mx-auto mb-8">
                    You haven't made any transactions yet. When you send or receive GCoins, they will appear here.
                  </p>
                  <Button asChild>
                    <a href="/send">Send your first GCoins</a>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Transactions;
