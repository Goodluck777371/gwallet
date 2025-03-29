
import { supabase } from "@/integrations/supabase/client";
import { Transaction } from "@/components/TransactionItem";
import { fetchUserByWalletAddress, fetchUserByUsername } from "@/services/profileService";
import { saveTransaction, updateTransaction } from "./transactionService";

// Admin wallet address - fees will be sent here
const ADMIN_WALLET = "gCoinAdmin123456";

/**
 * Attempts to find the recipient user by either username or wallet address
 */
const findRecipient = async (
  recipient: string,
  isUsername: boolean
): Promise<{ recipientWallet: string; recipientUser: { id: string; username?: string } | null }> => {
  let recipientWallet = recipient;
  let recipientUser: { id: string; username?: string } | null = null;
  
  if (isUsername) {
    console.log("Looking up user by username:", recipient);
    const userData = await fetchUserByUsername(recipient);
    if (userData) {
      recipientWallet = userData.walletAddress;
      recipientUser = { id: userData.id, username: recipient };
      console.log("Found user by username:", userData);
    } else {
      console.log("Username not found:", recipient);
    }
  } else {
    console.log("Looking up user by wallet address:", recipientWallet);
    recipientUser = await fetchUserByWalletAddress(recipientWallet);
    console.log("Wallet lookup result:", recipientUser);
  }
  
  return { recipientWallet, recipientUser };
};

/**
 * Creates a transaction record for tracking
 */
const createTransactionRecord = (
  senderWallet: string,
  recipientWallet: string,
  amount: number,
  fee: number,
  note?: string
): Transaction => {
  // Generate a UUID-compatible transaction ID
  const transactionId = crypto.randomUUID();
  
  return {
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
};

/**
 * Automatically create a new profile for a non-existent recipient
 * This allows sending to any wallet address, even if it doesn't exist yet
 */
const createRecipientProfile = async (
  recipientWallet: string
): Promise<{ id: string; username?: string } | null> => {
  try {
    console.log("Creating new profile for wallet:", recipientWallet);
    
    // Generate a unique username based on wallet
    const username = `user_${recipientWallet.substring(0, 8)}`;
    
    // Generate a random UUID for the new user
    const newUserId = crypto.randomUUID();
    
    // Insert new profile with admin rights to bypass RLS
    const { data, error } = await supabase.rpc('admin_create_profile', {
      p_id: newUserId,
      p_wallet_address: recipientWallet,
      p_username: username,
      p_email: `${username}@example.com`, // Placeholder email
      p_balance: 0 // Start with zero balance
    });
    
    if (error) {
      console.error("Error creating recipient profile:", error);
      return null;
    }
    
    console.log("Created new profile for wallet:", newUserId);
    return { id: newUserId, username };
  } catch (error) {
    console.error("Failed to create recipient profile:", error);
    return null;
  }
};

/**
 * Update sender's balance after a successful transaction
 */
const updateSenderBalance = async (
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
const updateRecipientBalance = async (
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
const processTransactionFee = async (
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

/**
 * Create a receipt transaction for the recipient
 */
const createRecipientTransaction = async (
  recipientId: string,
  amount: number,
  recipientWallet: string,
  senderWallet: string,
  transactionId: string,
  note?: string
): Promise<boolean> => {
  try {
    console.log(`Creating recipient (${recipientId}) transaction record for amount ${amount}`);
    
    const recipientTransaction: Transaction = {
      id: crypto.randomUUID(), // Generate a unique ID for the recipient's transaction
      type: "receive",
      amount: amount,
      recipient: recipientWallet,
      sender: senderWallet,
      timestamp: new Date(),
      status: "completed",
      description: note || `Received from ${senderWallet}`,
      fee: 0,
      relatedTransactionId: transactionId // Link to the original transaction
    };
    
    await saveTransaction(recipientId, recipientTransaction);
    console.log("Created receipt transaction for recipient");
    return true;
  } catch (error) {
    console.error("Failed to create recipient transaction:", error);
    throw error;
  }
};

/**
 * Process a successful transaction
 */
const processSuccessfulTransaction = async (
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

/**
 * Handle transaction errors
 */
const handleTransactionError = (
  error: any,
  transactionId: string
): {
  success: boolean;
  transactionId: string;
  status: "failed";
  message: string;
} => {
  console.error("Error during transaction processing:", error);
  return {
    success: false,
    transactionId,
    status: "failed",
    message: error.message || "An error occurred during the transaction. Please try again."
  };
};

/**
 * Send money to another wallet and track the transaction
 */
export const sendMoney = async (
  userId: string,
  senderWallet: string,
  recipient: string,
  amount: number,
  fee: number,
  note?: string,
  isUsername: boolean = false
): Promise<{
  success: boolean;
  transactionId: string;
  status: "completed" | "pending" | "failed" | "refunded";
  message?: string;
}> => {
  return new Promise(async (resolve) => {
    try {
      console.log(`Starting money transfer: ${amount} from ${senderWallet} to ${recipient} (isUsername: ${isUsername})`);
      
      // Get the actual wallet address if recipient is a username
      const { recipientWallet, recipientUser } = await findRecipient(recipient, isUsername);
      
      console.log("Recipient lookup result:", { recipientWallet, recipientUser });
      
      // Create transaction object with proper UUID format
      const transaction = createTransactionRecord(
        senderWallet,
        recipientWallet,
        amount,
        fee,
        note
      );
      
      console.log("Created transaction record:", transaction);
      
      // Save the initial pending transaction
      await saveTransaction(userId, transaction);
      
      console.log("Transaction initiated:", transaction.id);
      
      // Wait to simulate processing time for demo
      setTimeout(async () => {
        try {
          let finalRecipientUser = recipientUser;
          
          // If recipient doesn't exist, create a new profile for them
          if (!finalRecipientUser) {
            console.log("Recipient not found, creating new profile");
            
            // Create new profile for this wallet address
            finalRecipientUser = await createRecipientProfile(recipientWallet);
            
            if (!finalRecipientUser) {
              console.error("Failed to create profile, cannot complete transaction");
              
              // Update transaction status to refunded
              await updateTransaction(userId, transaction.id, { status: "refunded" });
              
              resolve({
                success: false,
                transactionId: transaction.id,
                status: "refunded",
                message: "Could not create recipient profile. Your GCoins have been returned to your wallet."
              });
              return;
            }
          }
          
          console.log("Final recipient user:", finalRecipientUser);
          
          // Process the transaction with the available or newly created recipient
          const result = await processSuccessfulTransaction(
            userId,
            finalRecipientUser,
            transaction.id,
            senderWallet,
            recipientWallet,
            amount,
            fee,
            note
          );
          
          console.log("Transaction processed with result:", result);
          
          resolve(result);
        } catch (error) {
          console.error("Error during transaction processing:", error);
          
          // Update transaction status to failed
          try {
            await updateTransaction(userId, transaction.id, { 
              status: "failed",
              description: `Failed: ${error.message || "Unknown error"}`
            });
          } catch (updateError) {
            console.error("Error updating failed transaction:", updateError);
          }
          
          resolve(handleTransactionError(error, transaction.id));
        }
      }, 1500); // Simulate processing time
    } catch (error) {
      console.error("Error initiating transaction:", error);
      resolve({
        success: false,
        transactionId: crypto.randomUUID(),
        status: "failed",
        message: error.message || "Failed to initiate transaction. Please try again."
      });
    }
  });
};
