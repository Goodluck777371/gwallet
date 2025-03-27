
/**
 * Calculate transaction fee based on amount
 * - Flat 5% fee for all transactions
 */
export const calculateTransactionFee = (amount: number): number => {
  return amount * 0.05; // 5% fee for all transactions
};

/**
 * Check if transaction exceeds daily limit
 * Maximum daily transaction limit: 1 million Gcoins
 */
export const checkDailyLimit = (amount: number, previousTransactionsToday: number = 0): boolean => {
  const totalToday = amount + previousTransactionsToday;
  return totalToday <= 1000000; // 1 million GCoins limit
};

/**
 * Get formatted transaction fee description
 */
export const getFeeDescription = (amount: number): string => {
  return "5% of transaction amount";
};
