
import { supabase } from "@/integrations/supabase/client";

// Default exchange rates (fallback if API is down)
export const currencyRates = {
  USD: 0.00066,  // 1 GCoin = ~1500 USD
  NGN: 1000,     // 1 GCoin = 1000 NGN
  EUR: 0.00062,  // 1 GCoin = ~1600 EUR
  GBP: 0.00053,  // 1 GCoin = ~1900 GBP
  BTC: 0.000000022 // 1 GCoin = very small amount of BTC
};

// Fetch the latest exchange rates from our database
export const getExchangeRates = async (): Promise<typeof currencyRates> => {
  try {
    console.log("Fetching exchange rates from database");
    const { data, error } = await supabase
      .from('exchange_rates')
      .select('currency, rate');
    
    if (error) {
      console.error("Error fetching exchange rates:", error);
      return currencyRates; // Return default rates on error
    }
    
    // Convert the array of rates to an object format
    const rates: Record<string, number> = { ...currencyRates };
    
    for (const rate of data) {
      rates[rate.currency] = Number(rate.rate);
    }
    
    console.log("Retrieved exchange rates:", rates);
    return rates;
  } catch (error) {
    console.error("Failed to load exchange rates:", error);
    return currencyRates; // Return default rates on error
  }
};

// Update the exchange rate for a currency in our database
export const updateExchangeRate = async (currency: string, rate: number): Promise<boolean> => {
  try {
    console.log(`Updating exchange rate for ${currency} to ${rate}`);
    // Use the admin RPC function to update the rate
    const { error } = await supabase.rpc('admin_update_exchange_rate', {
      p_currency: currency,
      p_rate: rate
    });
    
    if (error) {
      console.error("Error updating exchange rate:", error);
      return false;
    }
    
    console.log(`Exchange rate for ${currency} updated successfully`);
    return true;
  } catch (error) {
    console.error("Failed to update exchange rate:", error);
    return false;
  }
};

// Convert GCoin to another currency
export const convertGCoin = (amount: number, currency: keyof typeof currencyRates = 'NGN', customRates?: typeof currencyRates): number => {
  const rates = customRates || currencyRates;
  return amount * (rates[currency] || rates.NGN);
};

// Convert from another currency to GCoin
export const convertToGCoin = (amount: number, currency: keyof typeof currencyRates = 'NGN', customRates?: typeof currencyRates): number => {
  const rates = customRates || currencyRates;
  const rate = rates[currency] || rates.NGN;
  return rate ? amount / rate : 0;
};
