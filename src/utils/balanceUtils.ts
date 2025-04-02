
import { supabase } from "@/integrations/supabase/client";
import { Transaction } from "@/components/TransactionItem";
import { saveTransaction } from "./transactionService";
import { ADMIN_WALLET } from "./transactionRecordUtils";

/**
 * Update sender's balance after a successful transaction
 */
export const updateSenderBalance = async (
  userId: string,
  amount: number,
  fee: number
): Promise<boolean> => {
  try {
    console.log(`Updating sender (${userId}) balance: -${amount + fee}`);
    
    // Use admin function to update balance to bypass RLS
    const { error } = await supabase.rpc('admin_update_balance', {
      p_user_id: userId,
      p_amount: -(amount + fee) // negative as we're deducting
    });
    
    if (error) {
      console.error("Error updating sender balance:", error);
      throw error;
    }
    
    console.log("Updated sender balance successfully");
    return true;
  } catch (error) {
    console.error("Failed to update sender balance:", error);
    throw error;
  }
};

/**
 * Update recipient's balance after a successful transaction
 */
export const updateRecipientBalance = async (
  recipientId: string,
  amount: number
): Promise<boolean> => {
  try {
    console.log(`Updating recipient (${recipientId}) balance: +${amount}`);
    
    // Use admin function to update balance to bypass RLS
    const { error } = await supabase.rpc('admin_update_balance', {
      p_user_id: recipientId,
      p_amount: amount // positive as we're adding
    });
    
    if (error) {
      console.error("Error updating recipient balance:", error);
      throw error;
    }
    
    console.log("Updated recipient balance successfully");
    return true;
  } catch (error) {
    console.error("Failed to update recipient balance:", error);
    throw error;
  }
};

/**
 * Process transaction fee to admin account
 */
export const processTransactionFee = async (
  adminId: string | null,
  fee: number,
  senderWallet: string,
  transactionId: string
): Promise<boolean> => {
  if (!adminId) {
    console.log("No admin account found for fee processing");
    return false;
  }
  
  try {
    console.log(`Processing fee (${fee}) to admin account (${adminId})`);
    
    // Use admin function to update balance to bypass RLS
    const { error: updateError } = await supabase.rpc('admin_update_balance', {
      p_user_id: adminId,
      p_amount: fee
    });
    
    if (updateError) {
      console.error("Error updating admin balance:", updateError);
      return false;
    }
    
    // Create fee transaction record for admin
    const feeTransaction: Transaction = {
      id: crypto.randomUUID(),
      type: "receive",
      amount: fee,
      recipient: ADMIN_WALLET,
      sender: senderWallet,
      timestamp: new Date(),
      status: "completed",
      description: `Transaction fee from ${transactionId}`,
      fee: 0
    };
    
    await saveTransaction(adminId, feeTransaction);
    console.log("Fee transaction processed successfully");
    return true;
  } catch (error) {
    console.error("Failed to process transaction fee:", error);
    return false;
  }
};
