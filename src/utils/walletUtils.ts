
/**
 * Utilities for wallet address validation, standardization, and matching
 */

/**
 * Validates a wallet address format
 */
export const isValidWalletFormat = (wallet: string): boolean => {
  // Format validation: must start with gCoin followed by alphanumeric characters
  const walletRegex = /^gCoin[a-zA-Z0-9]{8,}$/;
  return walletRegex.test(wallet);
};

/**
 * Creates a standardized wallet address format if needed
 */
export const standardizeWalletAddress = (wallet: string): string => {
  // If not starting with gCoin, prefix it
  if (wallet && !wallet.startsWith('gCoin')) {
    return `gCoin${wallet}`;
  }
  return wallet;
};

/**
 * Calculate similarity score between two wallet addresses
 * Higher score means more similar
 */
export const getSimilarityScore = (wallet1: string, wallet2: string): number => {
  // Base case - exact match
  if (wallet1 === wallet2) return 1.0;
  
  // Both must be valid wallet addresses
  if (!wallet1 || !wallet2 || !wallet1.startsWith('gCoin') || !wallet2.startsWith('gCoin')) {
    return 0;
  }
  
  // Extract the parts after 'gCoin'
  const part1 = wallet1.substring(5);
  const part2 = wallet2.substring(5);
  
  // Count matching characters
  let matches = 0;
  for (let i = 0; i < Math.min(part1.length, part2.length); i++) {
    if (part1[i] === part2[i]) matches++;
  }
  
  // Calculate score based on matching characters and length difference
  const lengthDifference = Math.abs(part1.length - part2.length);
  const lengthPenalty = lengthDifference / Math.max(part1.length, part2.length);
  
  const matchScore = matches / Math.max(part1.length, part2.length);
  return matchScore * (1 - lengthPenalty);
};
