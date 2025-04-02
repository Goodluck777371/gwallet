
import { supabase } from "@/integrations/supabase/client";
import { fetchUserByWalletAddress, fetchUserByUsername } from "@/services/profileService";
import { getSimilarityScore } from "./walletUtils";

/**
 * Attempts to find the recipient user by either username or wallet address
 * With improved wallet address matching and suggestions
 */
export const findRecipient = async (
  recipient: string,
  isUsername: boolean,
  senderWallet: string
): Promise<{ 
  recipientWallet: string; 
  recipientUser: { id: string; username?: string } | null;
  suggestedWallets?: string[];
}> => {
  let recipientWallet = recipient;
  let recipientUser: { id: string; username?: string } | null = null;
  let suggestedWallets: string[] = [];
  
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
    
    // If not found, try a fuzzy match by querying similar wallets
    if (!recipientUser) {
      try {
        // Get all wallet addresses except the sender's
        const { data: wallets } = await supabase
          .from('profiles')
          .select('id, wallet_address, username')
          .neq('wallet_address', senderWallet) // Exclude sender's wallet
          .order('wallet_address', { ascending: true });
        
        if (wallets && wallets.length > 0) {
          // Sort by similarity to the input
          const sortedWallets = wallets.sort((a, b) => {
            const aScore = getSimilarityScore(recipientWallet, a.wallet_address);
            const bScore = getSimilarityScore(recipientWallet, b.wallet_address);
            return bScore - aScore; // Higher score first
          });
          
          // Use the first close match if similarity is good enough
          if (sortedWallets.length > 0 && getSimilarityScore(recipientWallet, sortedWallets[0].wallet_address) > 0.3) {
            const closestMatch = sortedWallets[0];
            recipientWallet = closestMatch.wallet_address;
            recipientUser = { 
              id: closestMatch.id, 
              username: closestMatch.username 
            };
            console.log("Found similar wallet:", recipientWallet);
          }
          
          // Store top 3 suggestions
          suggestedWallets = sortedWallets.slice(0, 3).map(w => w.wallet_address);
        }
      } catch (err) {
        console.error("Error during fuzzy wallet lookup:", err);
      }
    }
  }
  
  return { recipientWallet, recipientUser, suggestedWallets };
};

/**
 * Automatically create a new profile for a non-existent recipient
 * This allows sending to any wallet address, even if it doesn't exist yet
 */
export const createRecipientProfile = async (
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
