
import { supabase } from './client';

/**
 * Buys GCoin with the specified currency amount
 * 
 * @param currencyCode - The code of the currency to use for buying (e.g., USD, EUR)
 * @param currencyAmount - The amount of the currency to convert to GCoin
 * @returns An object containing the success status and transaction data or error
 */
export const buyGCoin = async (
  currencyCode: string, 
  currencyAmount: number
): Promise<{success: boolean; data?: any; error?: any}> => {
  try {
    const { data, error } = await supabase
      .rpc('buy_gcoin', {
        currency_code: currencyCode,
        currency_amount: currencyAmount
      });
    
    if (error) {
      console.error('Error buying GCoin:', error);
      return { success: false, error };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error };
  }
};

/**
 * Sells GCoin for the specified currency
 * 
 * @param gcoinAmount - The amount of GCoin to sell
 * @param currencyCode - The code of the currency to receive (e.g., USD, EUR)
 * @returns An object containing the success status and transaction data or error
 */
export const sellGCoin = async (
  gcoinAmount: number,
  currencyCode: string
): Promise<{success: boolean; data?: any; error?: any}> => {
  try {
    const { data, error } = await supabase
      .rpc('sell_gcoin', {
        gcoin_amount: gcoinAmount,
        currency_code: currencyCode
      });
    
    if (error) {
      console.error('Error selling GCoin:', error);
      return { success: false, error };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error };
  }
};
