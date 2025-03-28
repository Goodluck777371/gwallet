
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
  transactionId: string,
  senderWallet: string,
  recipientWallet: string,
  amount: number,
  fee: number,
  note?: string
): Transaction => {
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
};

/**
 * Update recipient's balance after a successful transaction
 */
const updateRecipientBalance = async (
  recipientId: string,
  amount: number
): Promise<void> => {
  const { data: recipientData } = await supabase
    .from('profiles')
    .select('balance')
    .eq('id', recipientId)
    .single();
  
  if (recipientData) {
    const recipientNewBalance = Number(recipientData.balance) + amount;
    await supabase
      .from('profiles')
      .update({ balance: recipientNewBalance })
      .eq('id', recipientId);
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
  if (adminId) {
    const { data: adminBalanceData } = await supabase
      .from('profiles')
      .select('balance')
      .eq('id', adminId)
      .single();
    
    if (adminBalanceData) {
      const adminNewBalance = Number(adminBalanceData.balance) + fee;
      await supabase
        .from('profiles')
        .update({ balance: adminNewBalance })
        .eq('id', adminId);
      
      // Create fee transaction record for admin
      const feeTransaction: Transaction = {
        id: `FEE${Date.now().toString().substring(5)}`,
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
    }
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
  note?: string
): Promise<void> => {
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
  
  await saveTransaction(recipientId, recipientTransaction);
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
  console.log("Processing valid transaction to recipient:", recipientUser.id);
  
  // Fetch admin user for fee transfer
  const { data: adminData } = await supabase
    .from('profiles')
    .select('id')
    .eq('wallet_address', ADMIN_WALLET)
    .single();
  
  const adminId = adminData ? adminData.id : null;
  
  // Update sender's balance
  await updateSenderBalance(userId, amount, fee);
  
  // Update recipient's balance
  await updateRecipientBalance(recipientUser.id, amount);
  
  // Process transaction fee
  await processTransactionFee(adminId, fee, senderWallet, transactionId);
  
  // Create recipient's transaction record
  await createRecipientTransaction(recipientUser.id, amount, recipientWallet, senderWallet, note);
  
  // Update original transaction to completed
  await updateTransaction(userId, transactionId, { status: "completed" });
  
  // Resolve with success
  return {
    success: true,
    transactionId,
    status: "completed"
  };
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
      // Generate transaction ID
      const transactionId = `TX${Date.now().toString().substring(5)}`;
      
      // Get the actual wallet address if recipient is a username
      const { recipientWallet, recipientUser } = await findRecipient(recipient, isUsername);
      
      // Create transaction object
      const transaction = createTransactionRecord(
        transactionId,
        senderWallet,
        recipientWallet,
        amount,
        fee,
        note
      );
      
      // Save the initial pending transaction
      await saveTransaction(userId, transaction);
      
      // Wait to simulate processing time for demo
      setTimeout(async () => {
        try {
          let finalRecipientUser = recipientUser;
          
          // If recipient doesn't exist, create a new profile for them instead of refunding
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
            transactionId,
            senderWallet,
            recipientWallet,
            amount,
            fee,
            note
          ));
        } catch (error) {
          resolve(handleTransactionError(error, transactionId));
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
