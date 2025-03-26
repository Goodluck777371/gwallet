import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ArrowRight, InboxIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import WalletCard from "@/components/WalletCard";
import TransactionItem, { Transaction } from "@/components/TransactionItem";
import { getTransactions } from "@/utils/transactionService";
import { getExchangeRates } from "@/utils/currencyUtils";

const Dashboard = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [exchangeRate, setExchangeRate] = useState<number>(1005.6);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Fetch user transactions from Supabase when user data is available
  useEffect(() => {
    if (user) {
      setIsLoadingTransactions(true);
      console.log("Current user data:", user); // Debug user data
      
      const fetchTransactions = async () => {
        try {
          const userTransactions = await getTransactions(user.id);
          setTransactions(userTransactions);
        } catch (error) {
          console.error("Failed to load transactions:", error);
          setTransactions([]);
        } finally {
          setIsLoadingTransactions(false);
        }
      };

      fetchTransactions();
    }
  }, [user]);

  // Fetch exchange rates
  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const rates = await getExchangeRates();
        if (rates.USD) {
          setExchangeRate(rates.USD);
        }
      } catch (error) {
        console.error("Failed to load exchange rate:", error);
      }
    };

    fetchExchangeRate();
  }, []);

  // Format the Naira value using the current exchange rate
  const nairaValue = user ? user.balance * exchangeRate : 0;
  const formattedNairaValue = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN'
  }).format(nairaValue);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gcoin-blue mb-4"></div>
          <p className="text-gray-500">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  console.log("Current user balance:", user.balance); // Debug balance

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Header />
      <Sidebar />
      
      <main className="pt-20 pb-16 px-4 md:ml-64">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className={`text-3xl font-bold transition-all duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
              Welcome, {user?.username}
            </h1>
            <p className={`text-gray-500 transition-all duration-500 delay-100 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
              Manage your Gcoin wallet and transactions
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className={`md:col-span-2 transition-all duration-500 delay-200 transform ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <WalletCard 
                balance={user.balance} 
                walletAddress={user.walletAddress}
                owner={user.username}
              />
            </div>
            
            <div className={`transition-all duration-500 delay-300 transform ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Current Value</p>
                    <div className="flex items-baseline">
                      <span className="text-2xl font-semibold">{formattedNairaValue}</span>
                      <span className="ml-2 text-xs text-muted-foreground">NGN</span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Exchange Rate</p>
                    <div className="flex items-baseline">
                      <span className="text-2xl font-semibold">₦{exchangeRate.toFixed(2)}</span>
                      <span className="ml-2 text-xs text-muted-foreground">per GCoin</span>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Link to="/send">
                      <Button className="w-full">
                        Send GCoins <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div className={`grid md:grid-cols-3 gap-6 mb-8 transition-all duration-500 delay-400 transform ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="md:col-span-3">
              <Tabs defaultValue="recent" className="w-full">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Transaction History</h2>
                  <TabsList>
                    <TabsTrigger value="recent">Recent</TabsTrigger>
                    <TabsTrigger value="all">All Transactions</TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="recent" className="mt-0">
                  <Card>
                    <CardContent className="p-0">
                      {isLoadingTransactions ? (
                        <div className="py-20 text-center">
                          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gcoin-blue mb-4"></div>
                          <p className="text-gray-500">Loading your transactions...</p>
                        </div>
                      ) : transactions.length > 0 ? (
                        transactions.slice(0, 3).map((transaction, index) => (
                          <TransactionItem 
                            key={transaction.id}
                            transaction={transaction}
                            className={index !== Math.min(transactions.length, 3) - 1 ? "border-b border-gray-100" : ""}
                          />
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12">
                          <div className="bg-gray-100 rounded-full p-3 mb-3">
                            <InboxIcon className="h-8 w-8 text-gray-400" />
                          </div>
                          <h3 className="text-lg font-medium mb-1">No Transactions Yet</h3>
                          <p className="text-sm text-gray-500 mb-4 text-center max-w-xs">
                            Start sending or receiving GCoins to see your transaction history here.
                          </p>
                          <Link to="/send">
                            <Button variant="outline" size="sm">
                              Send Your First GCoin
                            </Button>
                          </Link>
                        </div>
                      )}
                      
                      {transactions.length > 0 && (
                        <div className="p-4 border-t border-gray-100">
                          <Link to="/transactions">
                            <Button variant="ghost" size="sm" className="w-full">
                              View All Transactions
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="all" className="mt-0">
                  <Card>
                    <CardContent className="p-0">
                      {isLoadingTransactions ? (
                        <div className="py-20 text-center">
                          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gcoin-blue mb-4"></div>
                          <p className="text-gray-500">Loading your transactions...</p>
                        </div>
                      ) : transactions.length > 0 ? (
                        transactions.map((transaction, index) => (
                          <TransactionItem 
                            key={transaction.id}
                            transaction={transaction}
                            className={index !== transactions.length - 1 ? "border-b border-gray-100" : ""}
                          />
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12">
                          <div className="bg-gray-100 rounded-full p-3 mb-3">
                            <InboxIcon className="h-8 w-8 text-gray-400" />
                          </div>
                          <h3 className="text-lg font-medium mb-1">No Transactions Yet</h3>
                          <p className="text-sm text-gray-500 mb-4 text-center max-w-xs">
                            Start sending or receiving GCoins to see your transaction history here.
                          </p>
                          <Link to="/send">
                            <Button variant="outline" size="sm">
                              Send Your First GCoin
                            </Button>
                          </Link>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
