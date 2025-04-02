
import { supabase } from "@/integrations/supabase/client";
import { Transaction } from "@/components/TransactionItem";

/**
 * Save a new transaction to the user's transaction history using Supabase
 */
export const saveTransaction = async (userId: string, transaction: Transaction): Promise<boolean> => {
  try {
    console.log("Saving transaction for user:", userId, transaction);
    
    // Prepare transaction data for saving to database
    const transactionData = {
      id: transaction.id, // Using UUID format
      user_id: userId,
      type: transaction.type,
      amount: transaction.amount,
      fee: transaction.fee || 0,
      recipient: transaction.recipient,
      sender: transaction.sender,
      status: transaction.status,
      description: transaction.description,
      timestamp: new Date(transaction.timestamp).toISOString(), // Convert Date to ISO string
      related_transaction_id: transaction.relatedTransactionId
    };
    
    console.log("Transaction data being sent to Supabase:", transactionData);
    
    // Insert transaction using admin function to bypass RLS
    const { error } = await supabase.rpc('admin_insert_transaction', {
      transaction_data: transactionData
    });
    
    if (error) {
      console.error("Error saving transaction:", error);
      throw error;
    }
    
    console.log("Transaction saved successfully:", transaction.id);
    return true;
  } catch (error) {
    console.error("Failed to save transaction:", error);
    throw error; // Re-throw to allow handling by calling function
  }
};

/**
 * Update an existing transaction (e.g., to change status from pending to completed)
 */
export const updateTransaction = async (userId: string, transactionId: string, updates: Partial<Transaction>): Promise<boolean> => {
  try {
    console.log("Updating transaction:", transactionId, updates);
    
    // Prepare update data
    const updateData: Record<string, any> = {};
    
    if (updates.status) updateData.status = updates.status;
    if (updates.description) updateData.description = updates.description;
    // Add other fields that can be updated as needed
    
    console.log("Update data being sent to Supabase:", updateData);
    
    const { error } = await supabase.rpc('admin_update_transaction', {
      p_transaction_id: transactionId,
      p_user_id: userId,
      p_updates: updateData
    });
    
    if (error) {
      console.error("Error updating transaction:", error);
      throw error;
    }
    
    console.log("Transaction updated successfully:", transactionId);
    return true;
  } catch (error) {
    console.error("Failed to update transaction:", error);
    throw error; // Re-throw to allow handling by calling function
  }
};

/**
 * Load all transactions for a user from Supabase
 */
export const getTransactions = async (userId: string): Promise<Transaction[]> => {
  try {
    console.log("Fetching transactions for user:", userId);
    
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });
    
    if (error) {
      console.error("Error fetching transactions:", error);
      throw error;
    }
    
    console.log(`Retrieved ${data?.length || 0} transactions for user:`, userId);
    
    return (data || []).map((item: any) => ({
      id: item.id,
      type: item.type,
      amount: Number(item.amount),
      recipient: item.recipient,
      sender: item.sender,
      timestamp: new Date(item.timestamp),
      status: item.status,
      description: item.description,
      fee: Number(item.fee || 0),
      relatedTransactionId: item.related_transaction_id
    }));
  } catch (error) {
    console.error("Failed to load transactions:", error);
    return [];
  }
};

/**
 * Verify a transaction exists and has the expected status
 */
export const verifyTransaction = async (userId: string, transactionId: string, expectedStatus?: string): Promise<boolean> => {
  try {
    console.log(`Verifying transaction ${transactionId} for user ${userId}`);
    
    const { data, error } = await supabase
      .from('transactions')
      .select('id, status')
      .eq('id', transactionId)
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error("Error verifying transaction:", error);
      return false;
    }
    
    if (!data) {
      console.log(`Transaction ${transactionId} not found for user ${userId}`);
      return false;
    }
    
    if (expectedStatus && data.status !== expectedStatus) {
      console.log(`Transaction ${transactionId} has status ${data.status}, expected ${expectedStatus}`);
      return false;
    }
    
    console.log(`Transaction ${transactionId} verified successfully`);
    return true;
  } catch (error) {
    console.error("Failed to verify transaction:", error);
    return false;
  }
};

/**
 * Check if a recipient exists by wallet address
 */
export const checkRecipientExists = async (walletAddress: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('wallet_address', walletAddress)
      .single();
    
    if (error) {
      console.error("Error checking recipient:", error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error("Failed to check recipient:", error);
    return false;
  }
};

/**
 * Check if a recipient exists by username
 */
export const checkUsernameExists = async (username: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .single();
    
    if (error) {
      console.error("Error checking username:", error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error("Failed to check username:", error);
    return false;
  }
};
