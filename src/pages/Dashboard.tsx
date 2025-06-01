
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Wallet, BarChart3, DollarSign, Clock, InboxIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import WalletCard from "@/components/WalletCard";
import TransactionItem, { Transaction } from "@/components/TransactionItem";
import { formatNumber, formatCurrency } from "@/lib/utils";

const Dashboard = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoadingTx, setIsLoadingTx] = useState(true);
  const [exchangeRate, setExchangeRate] = useState(850); // Fixed exchange rate at 850

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Fetch transactions when user is available
  useEffect(() => {
    if (!user?.id) return;

    const fetchTransactions = async () => {
      setIsLoadingTx(true);
      
      try {
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('timestamp', { ascending: false })
          .limit(10);
        
        if (error) throw error;
        
        // Map to the Transaction type
        const formattedTransactions: Transaction[] = (data || []).map(tx => ({
          id: tx.id,
          type: tx.type as 'send' | 'receive',
          amount: tx.amount,
          recipient: tx.recipient || '',
          sender: tx.sender || '',
          timestamp: new Date(tx.timestamp),
          status: tx.status,
          description: tx.description || undefined,
          fee: tx.fee
        }));
        
        setTransactions(formattedTransactions);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setIsLoadingTx(false);
      }
    };

    fetchTransactions();
    
    // Set up realtime subscription for new transactions
    const subscription = supabase
      .channel('schema_db_changes')
      .on('postgres_changes', 
        {
          event: '*', 
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${user.id}`
        }, 
        (payload) => {
          // Refresh transactions when there is a change
          fetchTransactions();
        })
      .subscribe();
    
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user?.id]);

  const nairaValue = (user?.balance || 0) * exchangeRate;
  const formattedNairaValue = formatCurrency(nairaValue, "NGN");

  // Format the exchange rate with commas
  const formattedExchangeRate = formatCurrency(exchangeRate, "NGN");

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-20 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className={`text-3xl font-bold transition-all duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
              Welcome, {user?.username || 'User'}
            </h1>
            <p className={`text-gray-500 transition-all duration-500 delay-100 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
              Manage your Gcoin wallet and transactions
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className={`md:col-span-2 transition-all duration-500 delay-200 transform ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <WalletCard />
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
                      <span className="text-2xl font-semibold">{formattedExchangeRate}</span>
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
                      {isLoadingTx ? (
                        <div className="flex items-center justify-center py-12">
                          <div className="animate-spin h-8 w-8 border-4 border-gcoin-blue/20 border-t-gcoin-blue rounded-full"></div>
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
                      {isLoadingTx ? (
                        <div className="flex items-center justify-center py-12">
                          <div className="animate-spin h-8 w-8 border-4 border-gcoin-blue/20 border-t-gcoin-blue rounded-full"></div>
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
          
          <div className={`grid md:grid-cols-3 gap-6 transition-all duration-500 delay-500 transform ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="md:col-span-3">
              <h2 className="text-xl font-semibold mb-4">Quick Access</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link to="/send">
                  <div className="bg-white p-4 rounded-xl border border-gray-100 hover:shadow-md transition-shadow text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gcoin-blue/10 mb-3">
                      <Wallet className="h-6 w-6 text-gcoin-blue" />
                    </div>
                    <h3 className="font-medium">Send GCoins</h3>
                  </div>
                </Link>
                
                <Link to="/transactions">
                  <div className="bg-white p-4 rounded-xl border border-gray-100 hover:shadow-md transition-shadow text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gcoin-blue/10 mb-3">
                      <Clock className="h-6 w-6 text-gcoin-blue" />
                    </div>
                    <h3 className="font-medium">Transaction History</h3>
                  </div>
                </Link>
                
                <Link to="/exchange">
                  <div className="bg-white p-4 rounded-xl border border-gray-100 hover:shadow-md transition-shadow text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gcoin-blue/10 mb-3">
                      <DollarSign className="h-6 w-6 text-gcoin-blue" />
                    </div>
                    <h3 className="font-medium">Exchange Rates</h3>
                  </div>
                </Link>
                
                <Link to="/settings">
                  <div className="bg-white p-4 rounded-xl border border-gray-100 hover:shadow-md transition-shadow text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gcoin-blue/10 mb-3">
                      <BarChart3 className="h-6 w-6 text-gcoin-blue" />
                    </div>
                    <h3 className="font-medium">Account Settings</h3>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
