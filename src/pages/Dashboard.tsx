
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, InboxIcon } from "lucide-react";
import Header from "@/components/Header";
import WalletCard from "@/components/WalletCard";
import TransactionItem, { Transaction } from "@/components/TransactionItem";

const Dashboard = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoadingTx, setIsLoadingTx] = useState(true);
  const [exchangeRate, setExchangeRate] = useState(850); // Default value

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Fetch exchange rate
  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const { data, error } = await supabase
          .from('exchange_rates')
          .select('rate')
          .eq('currency', 'NGN')
          .single();
        
        if (error) throw error;
        if (data) {
          setExchangeRate(data.rate);
        }
      } catch (error) {
        console.error('Error fetching exchange rate:', error);
      }
    };

    fetchExchangeRate();
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
  const formattedNairaValue = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN'
  }).format(nairaValue);

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
                <CardContent className="space-y-4 pt-6">
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
                      <span className="text-2xl font-semibold">₦{exchangeRate}</span>
                      <span className="ml-2 text-xs text-muted-foreground">per GCoin</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 pt-4">
                    <Link to="/send">
                      <Button variant="outline" className="w-full">
                        Send
                      </Button>
                    </Link>
                    <Link to="/buy-sell">
                      <Button className="w-full">
                        Buy/Sell
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div className={`transition-all duration-500 delay-400 transform ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
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
      </main>
    </div>
  );
};

export default Dashboard;
