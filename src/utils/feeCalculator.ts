
/**
 * Calculate transaction fee based on amount
 * - 1% fee for transactions up to 50 Gcoins
 * - 5 Gcoins flat fee for transactions between 51-100 Gcoins
 * - 10 Gcoins flat fee for transactions above 100 Gcoins
 */
export const calculateTransactionFee = (amount: number): number => {
  if (amount <= 50) {
    return amount * 0.01; // 1% fee
  } else if (amount <= 100) {
    return 5; // 5 GCoins flat fee
  } else {
    return 10; // 10 GCoins flat fee
  }
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
  if (amount <= 50) {
    return "1% of transaction amount";
  } else if (amount <= 100) {
    return "Flat fee of 5 GCoins";
  } else {
    return "Flat fee of 10 GCoins";
  }
};
