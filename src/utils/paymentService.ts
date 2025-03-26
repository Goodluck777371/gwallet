
import { supabase } from "@/integrations/supabase/client";
import { Transaction } from "@/components/TransactionItem";
import { toast } from "@/hooks/use-toast";
import { fetchUserByWalletAddress } from "@/services/profileService";
import { saveTransaction, updateTransaction } from "./transactionService";

/**
 * Send money to another wallet and track the transaction
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
      
      // Check for valid recipient wallet in Supabase
      const recipientUser = await fetchUserByWalletAddress(recipientWallet);
      
      // Wait to simulate processing time for demo
      setTimeout(async () => {
        try {
          if (!recipientUser) {
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
            const { data: recipientData } = await supabase
              .from('profiles')
              .select('balance')
              .eq('id', recipientUser.id)
              .single();
            
            if (recipientData) {
              const recipientNewBalance = Number(recipientData.balance) + amount;
              await supabase
                .from('profiles')
                .update({ balance: recipientNewBalance })
                .eq('id', recipientUser.id);
            }
            
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
            
            await saveTransaction(recipientUser.id, recipientTransaction);
            
            // Update original transaction to completed
            await updateTransaction(userId, transactionId, { status: "completed" });
            
            // Show toast to sender
            toast({
              title: "Transfer Successful! 🎉",
              description: `You've sent ${amount.toFixed(2)} GCoins to ${recipientUser.username}.`,
              variant: "debit",
            });
            
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
