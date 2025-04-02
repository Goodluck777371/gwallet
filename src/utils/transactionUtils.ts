
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
      const exists = await checkUsernameExists(identifier);
      return {
        exists,
        message: exists ? 'Username found' : 'Username not found',
      };
    } else {
      const exists = await checkRecipientExists(identifier);
      return {
        exists,
        message: exists ? 'Wallet address found' : 'Wallet address not found',
        walletAddress: exists ? identifier : undefined
      };
    }
  } catch (error) {
    console.error("Error checking recipient:", error);
    return {
      exists: false,
      message: 'Error validating recipient'
    };
  }
};
