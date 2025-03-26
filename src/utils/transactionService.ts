
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
        timestamp: new Date(transaction.timestamp).toISOString() // Convert Date to ISO string
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
