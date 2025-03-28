
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
    
    // Insert new profile
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: newUserId,
        wallet_address: recipientWallet,
        username: username,
        email: `${username}@example.com`, // Placeholder email
        balance: 0 // Start with zero balance
      })
      .select()
      .single();
    
    if (error) {
      console.error("Error creating recipient profile:", error);
      return null;
    }
    
    console.log("Created new profile for wallet:", data);
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
): Promise<void> => {
  try {
    const { data: senderData, error: fetchError } = await supabase
      .from('profiles')
      .select('balance')
      .eq('id', userId)
      .single();
    
    if (fetchError) {
      console.error("Error fetching sender balance:", fetchError);
      throw fetchError;
    }
    
    if (senderData) {
      const senderNewBalance = Number(senderData.balance) - (amount + fee);
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ balance: senderNewBalance })
        .eq('id', userId);
      
      if (updateError) {
        console.error("Error updating sender balance:", updateError);
        throw updateError;
      }
      
      console.log("Updated sender balance to:", senderNewBalance);
    }
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
): Promise<void> => {
  try {
    const { data: recipientData, error: fetchError } = await supabase
      .from('profiles')
      .select('balance')
      .eq('id', recipientId)
      .single();
    
    if (fetchError) {
      console.error("Error fetching recipient balance:", fetchError);
      throw fetchError;
    }
    
    if (recipientData) {
      const recipientNewBalance = Number(recipientData.balance) + amount;
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ balance: recipientNewBalance })
        .eq('id', recipientId);
      
      if (updateError) {
        console.error("Error updating recipient balance:", updateError);
        throw updateError;
      }
      
      console.log("Updated recipient balance to:", recipientNewBalance);
    }
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
): Promise<void> => {
  if (!adminId) {
    console.log("No admin account found for fee processing");
    return;
  }
  
  try {
    const { data: adminBalanceData, error: fetchError } = await supabase
      .from('profiles')
      .select('balance')
      .eq('id', adminId)
      .single();
    
    if (fetchError) {
      console.error("Error fetching admin balance:", fetchError);
      return;
    }
    
    if (adminBalanceData) {
      const adminNewBalance = Number(adminBalanceData.balance) + fee;
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ balance: adminNewBalance })
        .eq('id', adminId);
      
      if (updateError) {
        console.error("Error updating admin balance:", updateError);
        return;
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
    }
  } catch (error) {
    console.error("Failed to process transaction fee:", error);
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
): Promise<void> => {
  try {
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
    
    // 1. Update sender's balance first
    await updateSenderBalance(userId, amount, fee);
    
    // 2. Update recipient's balance
    await updateRecipientBalance(recipientUser.id, amount);
    
    // 3. Process transaction fee
    await processTransactionFee(adminId, fee, senderWallet, transactionId);
    
    // 4. Create recipient's transaction record with reference to original transaction
    await createRecipientTransaction(recipientUser.id, amount, recipientWallet, senderWallet, transactionId, note);
    
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
    message: "An error occurred during the transaction. Please try again."
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
      // Get the actual wallet address if recipient is a username
      const { recipientWallet, recipientUser } = await findRecipient(recipient, isUsername);
      
      // Create transaction object with proper UUID format
      const transaction = createTransactionRecord(
        senderWallet,
        recipientWallet,
        amount,
        fee,
        note
      );
      
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
              // If profile creation fails, still complete the transaction
              // The coins will be sent to the wallet address and will be available
              // when someone claims that address
              console.log("Failed to create profile, but proceeding with transaction");
              finalRecipientUser = {
                id: crypto.randomUUID(), // Temporary ID for the transaction
                username: undefined
              };
            }
          }
          
          // Process the transaction
          resolve(await processSuccessfulTransaction(
            userId,
            finalRecipientUser,
            transaction.id,
            senderWallet,
            recipientWallet,
            amount,
            fee,
            note
          ));
        } catch (error) {
          resolve(handleTransactionError(error, transaction.id));
        }
      }, 1500); // Simulate processing time
    } catch (error) {
      console.error("Error initiating transaction:", error);
      resolve({
        success: false,
        transactionId: crypto.randomUUID(),
        status: "failed",
        message: "Failed to initiate transaction. Please try again."
      });
    }
  });
};
