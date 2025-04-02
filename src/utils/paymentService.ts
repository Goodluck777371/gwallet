
import { supabase } from "@/integrations/supabase/client";
import { checkRecipientExists, checkUsernameExists } from "./transactionService";
import { isValidWalletFormat, standardizeWalletAddress } from "./walletUtils";
import { findRecipient, createRecipientProfile } from "./recipientUtils";
import { createTransactionRecord, handleTransactionError } from "./transactionRecordUtils";
import { saveTransaction, updateTransaction } from "./transactionService";
import { processSuccessfulTransaction } from "./transactionProcessor";

/**
 * Send money to another wallet and track the transaction
 * With improved wallet validation and suggestions
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
  suggestedWallets?: string[];
}> => {
  try {
    console.log(`Starting money transfer: ${amount} from ${senderWallet} to ${recipient} (isUsername: ${isUsername})`);
    
    // Additional validation for wallet address format
    if (!isUsername && !isValidWalletFormat(recipient)) {
      // Try to standardize the format
      const standardizedWallet = standardizeWalletAddress(recipient);
      
      if (!isValidWalletFormat(standardizedWallet)) {
        return {
          success: false,
          transactionId: crypto.randomUUID(),
          status: "failed",
          message: "Invalid wallet address format. Please use a valid GCoin wallet address (starts with gCoin followed by alphanumeric characters)."
        };
      }
      
      // Use the standardized format
      recipient = standardizedWallet;
    }
    
    // Get the actual wallet address if recipient is a username
    const { recipientWallet, recipientUser, suggestedWallets } = await findRecipient(
      recipient, 
      isUsername,
      senderWallet
    );
    
    console.log("Recipient lookup result:", { recipientWallet, recipientUser, suggestedWallets });
    
    // Early validation to prevent refunds later
    if (!recipientUser) {
      if (isUsername) {
        // Check if the username exists
        const exists = await checkUsernameExists(recipient);
        if (!exists) {
          return {
            success: false,
            transactionId: crypto.randomUUID(),
            status: "failed",
            message: "Username does not exist. Please check and try again.",
          };
        }
      } else {
        // Check if the wallet address exists
        const exists = await checkRecipientExists(recipientWallet);
        if (!exists) {
          // Return suggestions if available
          if (suggestedWallets && suggestedWallets.length > 0) {
            return {
              success: false,
              transactionId: crypto.randomUUID(),
              status: "failed",
              message: `Recipient wallet address not found. Did you mean one of these?`,
              suggestedWallets
            };
          }
          
          return {
            success: false,
            transactionId: crypto.randomUUID(),
            status: "failed",
            message: "Recipient wallet address does not exist. Please check and try again."
          };
        }
      }
    }
    
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
        
        return {
          success: false,
          transactionId: transaction.id,
          status: "refunded",
          message: "Could not create recipient profile. Your GCoins have been returned to your wallet."
        };
      }
    }
    
    console.log("Final recipient user:", finalRecipientUser);
    
    try {
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
      
      return result;
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
      
      return handleTransactionError(error, transaction.id);
    }
  } catch (error) {
    console.error("Error initiating transaction:", error);
    return {
      success: false,
      transactionId: crypto.randomUUID(),
      status: "failed",
      message: error.message || "Failed to initiate transaction. Please try again."
    };
  }
};
