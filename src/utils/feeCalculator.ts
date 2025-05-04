
/**
 * Calculates the transaction fee for a given amount
 * @param amount The transaction amount in GCoin
 * @returns The fee amount in GCoin
 */
export const calculateTransactionFee = (amount: number): number => {
  // Fixed fee of 1 GCoin as requested
  return 1;
};

/**
 * Gets a description of how the fee was calculated
 * @param amount The transaction amount in GCoin
 * @returns A string describing the fee calculation
 */
export const getFeeDescription = (amount: number): string => {
  return "Fixed fee";
};
