
import { supabase } from "@/integrations/supabase/client";

// Export updated currency rates for use throughout the app
// These are the default fallback rates if DB rates can't be loaded
export const currencyRates: Record<string, number> = {
  USD: 1001.2,
  EUR: 925.4,
  GBP: 785.3,
  NGN: 1430342.8, // Updated to match the rate in Convert page
  JPY: 152382.4,
  CAD: 1362.8,
  AUD: 1496.7,
  GHS: 12354.7
};

/**
 * Get exchange rates from Supabase
 */
export const getExchangeRates = async (): Promise<Record<string, number>> => {
  try {
    const { data, error } = await supabase
      .from('exchange_rates')
      .select('currency, rate');
    
    if (error) {
      throw error;
    }
    
    // Convert to dictionary format
    const rates: Record<string, number> = {};
    data.forEach((item: any) => {
      rates[item.currency] = Number(item.rate);
    });
    
    // Make sure rates are consistent across the app
    // If NGN rate is missing or different from our default, update it
    if (!rates.NGN || rates.NGN !== currencyRates.NGN) {
      // Try to update the database rate to match our default
      try {
        await supabase.rpc('admin_update_exchange_rate', {
          p_currency: 'NGN',
          p_rate: currencyRates.NGN
        });
      } catch (updateError) {
        console.error("Failed to update NGN exchange rate in database:", updateError);
      }
      
      // Use our default rate regardless
      rates.NGN = currencyRates.NGN;
    }
    
    console.log("Loaded exchange rates:", rates);
    return rates;
  } catch (error) {
    console.error("Failed to load exchange rates:", error);
    // Return default rates as fallback
    return currencyRates;
  }
};

/**
 * Convert GCoin to another currency using rates from Supabase
 */
export const convertGCoin = async (amount: number, currency: string): Promise<number> => {
  try {
    const rates = await getExchangeRates();
    return amount * (rates[currency] || currencyRates.USD);
  } catch (error) {
    console.error("Error converting GCoin:", error);
    return amount * currencyRates.USD; // Fallback to default rate
  }
};
