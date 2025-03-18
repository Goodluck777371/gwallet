
import { useState, useEffect } from "react";
import { ArrowDownLeft, ArrowUpRight, Search } from "lucide-react";
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

// Mock data
const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "1",
    type: "receive",
    amount: 50,
    recipient: "You",
    sender: "John Doe",
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    status: "completed",
    description: "Payment for design work"
  },
  {
    id: "2",
    type: "send",
    amount: 25.5,
    recipient: "Sarah Wilson",
    sender: "You",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
    status: "completed"
  },
  {
    id: "3",
    type: "receive",
    amount: 10,
    recipient: "You",
    sender: "Michael Brown",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    status: "completed",
    description: "Split lunch bill"
  },
  {
    id: "4",
    type: "send",
    amount: 100,
    recipient: "Lisa Johnson",
    sender: "You",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    status: "completed"
  },
  {
    id: "5",
    type: "send",
    amount: 5,
    recipient: "Coffee Shop",
    sender: "You",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    status: "pending"
  },
  {
    id: "6",
    type: "receive",
    amount: 75,
    recipient: "You",
    sender: "David Wilson",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
    status: "completed",
    description: "Consulting fee"
  },
  {
    id: "7",
    type: "send",
    amount: 15.75,
    recipient: "Restaurant",
    sender: "You",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 days ago
    status: "failed"
  },
  {
    id: "8",
    type: "receive",
    amount: 200,
    recipient: "You",
    sender: "Emma Thompson",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10), // 10 days ago
    status: "completed",
    description: "Project payment"
  }
];

const Transactions = () => {
  const { isAuthenticated } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let result = transactions;
    
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (tx) => 
          tx.sender.toLowerCase().includes(searchLower) ||
          tx.recipient.toLowerCase().includes(searchLower) ||
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
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <div className="divide-y divide-gray-100">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction) => (
                  <TransactionItem 
                    key={transaction.id}
                    transaction={transaction}
                  />
                ))
              ) : (
                <div className="py-8 text-center">
                  <p className="text-gray-500">No transactions found</p>
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
