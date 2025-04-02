
import { supabase } from "@/integrations/supabase/client";
import { updateTransaction } from "./transactionService";
import { updateSenderBalance, updateRecipientBalance, processTransactionFee } from "./balanceUtils";
import { createRecipientTransaction } from "./transactionRecordUtils";
import { ADMIN_WALLET } from "./transactionRecordUtils";

/**
 * Process a successful transaction
 */
export const processSuccessfulTransaction = async (
  userId: string,
  recipientUser: { id: string; username?: string },
  transactionId: string,
  senderWallet: string,
  recipientWallet: string,
  amount: number,
  fee: number,
  note?: string
): Promise<{
  success: boolean;
  transactionId: string;
  status: "completed";
}> => {
  console.log(`Processing valid transaction to recipient (${recipientUser.id}): Amount=${amount}, Fee=${fee}`);
  
  try {
    // Fetch admin user for fee transfer
    const { data: adminData } = await supabase
      .from('profiles')
      .select('id')
      .eq('wallet_address', ADMIN_WALLET)
      .single();
    
    const adminId = adminData ? adminData.id : null;
    
    // Execute all operations in sequence, ensuring each step completes
    
    // 1. Update sender's balance first
    const senderUpdated = await updateSenderBalance(userId, amount, fee);
    if (!senderUpdated) throw new Error("Failed to update sender balance");
    
    // 2. Update recipient's balance
    const recipientUpdated = await updateRecipientBalance(recipientUser.id, amount);
    if (!recipientUpdated) throw new Error("Failed to update recipient balance");
    
    // 3. Process transaction fee
    await processTransactionFee(adminId, fee, senderWallet, transactionId);
    
    // 4. Create recipient's transaction record with reference to original transaction
    const recipientTxCreated = await createRecipientTransaction(
      recipientUser.id, amount, recipientWallet, senderWallet, transactionId, note
    );
    if (!recipientTxCreated) throw new Error("Failed to create recipient transaction");
    
    // 5. Update original transaction to completed
    await updateTransaction(userId, transactionId, { status: "completed" });
    
    console.log("Transaction completed successfully:", transactionId);
    
    // 6. Resolve with success
    return {
      success: true,
      transactionId,
      status: "completed"
    };
  } catch (error) {
    console.error("Error during successful transaction processing:", error);
    // Attempt to update transaction status to failed
    try {
      await updateTransaction(userId, transactionId, { 
        status: "failed", 
        description: `Failed transaction: ${error.message}`
      });
    } catch (updateError) {
      console.error("Error updating transaction status:", updateError);
    }
    throw error;
  }
};
