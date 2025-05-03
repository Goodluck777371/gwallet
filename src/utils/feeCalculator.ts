
/**
 * Calculate transaction fee based on amount
 * - 1% fee for transactions up to 50 Gcoins
 * - 5 Gcoins flat fee for transactions between 51-100 Gcoins
 * - 5% fee for transactions above 100 Gcoins
 */
export const calculateTransactionFee = (amount: number): number => {
  if (amount <= 50) {
    return amount * 0.01; // 1% fee
  } else if (amount <= 100) {
    return 5; // 5 GCoins flat fee
  } else {
    return amount * 0.05; // 5% fee for transactions above 100
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
    return "5% of transaction amount";
  }
};

/**
 * Calculate staking reward based on amount and duration (in days)
 * 30% APR, prorated based on staking duration
 */
export const calculateStakingReward = (amount: number, durationDays: number): number => {
  // 30% annually = 0.3 / 365 daily rate
  const dailyRate = 0.3 / 365; 
  const reward = amount * dailyRate * durationDays;
  return reward;
};

/**
 * Calculate early unstaking penalty (10% of initial stake)
 */
export const calculateUnstakingPenalty = (amount: number): number => {
  return amount * 0.1;
};
