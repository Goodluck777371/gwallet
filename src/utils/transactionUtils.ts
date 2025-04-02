
// This file serves as a barrel file to re-export all transaction-related utilities
export { currencyRates, getExchangeRates, convertGCoin } from './currencyUtils';
export { 
  saveTransaction, 
  updateTransaction, 
  getTransactions, 
  verifyTransaction,
  checkRecipientExists,
  checkUsernameExists
} from './transactionService';
export { sendMoney } from './paymentService';

// Add a new lookup function to fix recipient validation issues
export const getRecipientStatus = async (identifier: string, isUsername: boolean): Promise<{
  exists: boolean;
  message: string;
  walletAddress?: string;
  userId?: string;
}> => {
  try {
    if (isUsername) {
      // Import the function directly from transactionService to avoid circular reference
      const exists = await import('./transactionService').then(module => 
        module.checkUsernameExists(identifier)
      );
      return {
        exists,
        message: exists ? 'Username found' : 'Username not found',
      };
    } else {
      // Check if the provided wallet address matches the expected format
      const walletRegex = /^gCoin[a-zA-Z0-9]{8,}$/;
      if (!walletRegex.test(identifier)) {
        return {
          exists: false,
          message: 'Invalid wallet format. Should start with gCoin followed by alphanumeric characters',
          walletAddress: undefined
        };
      }
      
      // Import the function directly from transactionService to avoid circular reference
      const exists = await import('./transactionService').then(module => 
        module.checkRecipientExists(identifier)
      );
      
      // If wallet doesn't exist, suggest a similar wallet that does exist
      if (!exists) {
        try {
          // Get all wallet addresses to find similar ones
          const { data: profiles } = await import('@/integrations/supabase/client').then(
            module => module.supabase.from('profiles').select('wallet_address')
          );
          
          if (profiles && profiles.length > 0) {
            // Find a similar wallet address if possible (for demonstration)
            const similarWallets = profiles
              .map(p => p.wallet_address)
              .filter(w => w.startsWith('gCoin'))
              .sort((a, b) => {
                // Simple similarity score based on common characters
                const commonA = [...identifier].filter(char => a.includes(char)).length;
                const commonB = [...identifier].filter(char => b.includes(char)).length;
                return commonB - commonA;
              })
              .slice(0, 3);
              
            if (similarWallets.length > 0) {
              return {
                exists: false,
                message: `Wallet address not found. Did you mean: ${similarWallets[0]}?`,
                walletAddress: undefined
              };
            }
          }
        } catch (err) {
          console.error("Error finding similar wallets:", err);
        }
      }
      
      return {
        exists,
        message: exists ? 'Wallet address found' : 'Wallet address not found. Please check and try again.',
        walletAddress: exists ? identifier : undefined
      };
    }
  } catch (error) {
    console.error("Error checking recipient:", error);
    return {
      exists: false,
      message: 'Error validating recipient. Please try again.'
    };
  }
};
