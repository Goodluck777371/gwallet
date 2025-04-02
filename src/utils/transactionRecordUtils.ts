
import { Transaction } from "@/components/TransactionItem";
import { saveTransaction, updateTransaction } from "./transactionService";

// Admin wallet address - fees will be sent here
export const ADMIN_WALLET = "gCoinAdmin123456";

/**
 * Creates a transaction record for tracking
 */
export const createTransactionRecord = (
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
 * Create a receipt transaction for the recipient
 */
export const createRecipientTransaction = async (
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
 * Handle transaction errors
 */
export const handleTransactionError = (
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
