
import { supabase } from "@/integrations/supabase/client";
import { Transaction } from "@/components/TransactionItem";

/**
 * Save a new transaction to the user's transaction history using Supabase
 */
export const saveTransaction = async (userId: string, transaction: Transaction): Promise<void> => {
  try {
    const { error } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        type: transaction.type,
        amount: transaction.amount,
        fee: transaction.fee || 0,
        recipient: transaction.recipient,
        sender: transaction.sender,
        status: transaction.status,
        description: transaction.description,
        timestamp: new Date(transaction.timestamp)
      });
    
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Failed to save transaction:", error);
  }
};

/**
 * Update an existing transaction (e.g., to change status from pending to completed)
 */
export const updateTransaction = async (userId: string, transactionId: string, updates: Partial<Transaction>): Promise<void> => {
  try {
    const { error } = await supabase
      .from('transactions')
      .update({
        status: updates.status,
        // Add other fields that can be updated as needed
      })
      .eq('id', transactionId)
      .eq('user_id', userId);
    
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Failed to update transaction:", error);
  }
};

/**
 * Load all transactions for a user from Supabase
 */
export const getTransactions = async (userId: string): Promise<Transaction[]> => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return data.map((item: any) => ({
      id: item.id,
      type: item.type,
      amount: Number(item.amount),
      recipient: item.recipient,
      sender: item.sender,
      timestamp: new Date(item.timestamp),
      status: item.status,
      description: item.description,
      fee: Number(item.fee)
    }));
  } catch (error) {
    console.error("Failed to load transactions:", error);
    return [];
  }
};

/**
 * Integrate the sendMoney function with transaction tracking and Supabase
 */
export const sendMoney = async (
  userId: string,
  senderWallet: string,
  recipientWallet: string,
  amount: number,
  fee: number,
  note?: string
): Promise<{
  success: boolean;
  transactionId: string;
  status: "completed" | "pending" | "failed" | "refunded";
  message?: string;
}> => {
  return new Promise(async (resolve) => {
    try {
      // Generate transaction ID
      const transactionId = `TX${Date.now().toString().substring(5)}`;
      
      // Create transaction object
      const transaction: Transaction = {
        id: transactionId,
        type: "send",
        amount: amount,
        recipient: recipientWallet,
        sender: senderWallet,
        timestamp: new Date(),
        status: "pending",
        description: note,
        fee: fee
      };
      
      // Save the initial pending transaction
      await saveTransaction(userId, transaction);
      
      // Check for valid recipient wallet (now in Supabase)
      const { data: recipientData, error: recipientError } = await supabase
        .from('profiles')
        .select('id, balance')
        .eq('wallet_address', recipientWallet)
        .single();
      
      // Wait to simulate processing time for demo
      setTimeout(async () => {
        try {
          if (recipientError || !recipientData) {
            // Update transaction to refunded
            await updateTransaction(userId, transactionId, { status: "refunded" });
            
            // Resolve with refunded status
            resolve({
              success: false,
              transactionId,
              status: "refunded",
              message: "Recipient wallet address does not exist. Your GCoins have been refunded."
            });
          } else {
            // Update sender's balance
            const { data: senderData } = await supabase
              .from('profiles')
              .select('balance')
              .eq('id', userId)
              .single();
            
            if (senderData) {
              const senderNewBalance = Number(senderData.balance) - (amount + fee);
              await supabase
                .from('profiles')
                .update({ balance: senderNewBalance })
                .eq('id', userId);
            }
            
            // Update recipient's balance
            const recipientNewBalance = Number(recipientData.balance) + amount;
            await supabase
              .from('profiles')
              .update({ balance: recipientNewBalance })
              .eq('id', recipientData.id);
            
            // Create recipient's transaction record
            const recipientTransaction: Transaction = {
              id: `RX${Date.now().toString().substring(5)}`,
              type: "receive",
              amount: amount,
              recipient: recipientWallet,
              sender: senderWallet,
              timestamp: new Date(),
              status: "completed",
              description: note,
              fee: 0
            };
            
            await saveTransaction(recipientData.id, recipientTransaction);
            
            // Update original transaction to completed
            await updateTransaction(userId, transactionId, { status: "completed" });
            
            // Resolve with success
            resolve({
              success: true,
              transactionId,
              status: "completed"
            });
          }
        } catch (error) {
          console.error("Error during transaction processing:", error);
          resolve({
            success: false,
            transactionId,
            status: "failed",
            message: "An error occurred during the transaction. Please try again."
          });
        }
      }, 1500); // Simulate processing time
    } catch (error) {
      console.error("Error initiating transaction:", error);
      resolve({
        success: false,
        transactionId: `ERROR${Date.now()}`,
        status: "failed",
        message: "Failed to initiate transaction. Please try again."
      });
    }
  });
};

// Get exchange rates from Supabase
export const getExchangeRates = async (): Promise<Record<string, number>> => {
  try {
    const { data, error } = await supabase
      .from('exchange_rates')
      .select('currency, rate');
    
    if (error) {
      throw error;
    }
    
    // Convert to dictionary format
    const rates: Record<string, number> = {};
    data.forEach((item: any) => {
      rates[item.currency] = Number(item.rate);
    });
    
    return rates;
  } catch (error) {
    console.error("Failed to load exchange rates:", error);
    // Return default rates as fallback
    return {
      USD: 1005.6,
      EUR: 837.9,
      GBP: 736.2,
      NGN: 959534.4,
      JPY: 131146.9,
      CAD: 1249.8,
      AUD: 1380.0,
      GHS: 5455.4
    };
  }
};

// Convert GCoin to another currency using rates from Supabase
export const convertGCoin = async (amount: number, currency: string): Promise<number> => {
  try {
    const rates = await getExchangeRates();
    return amount * (rates[currency] || 1005.6);
  } catch (error) {
    console.error("Error converting GCoin:", error);
    return amount * 1005.6; // Fallback to default rate
  }
};
