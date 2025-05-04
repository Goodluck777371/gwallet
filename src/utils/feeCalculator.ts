
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

/**
 * Calculates the staking reward based on amount and duration
 * @param amount The staking amount in GCoin
 * @param days The staking duration in days
 * @returns The reward amount in GCoin
 */
export const calculateStakingReward = (amount: number, days: number): number => {
  // APR of 30% (0.3)
  const annualRate = 0.3;
  
  // Calculate daily rate (APR / 365)
  const dailyRate = annualRate / 365;
  
  // Calculate reward: amount * dailyRate * days
  const reward = amount * dailyRate * days;
  
  return reward;
};
