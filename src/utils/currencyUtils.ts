
import { supabase } from "@/integrations/supabase/client";

// Export currency rates for use throughout the app
export const currencyRates: Record<string, number> = {
  USD: 1005.6,
  EUR: 837.9,
  GBP: 736.2,
  NGN: 959534.4,
  JPY: 131146.9,
  CAD: 1249.8,
  AUD: 1380.0,
  GHS: 5455.4
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
