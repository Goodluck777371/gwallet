
import { supabase } from './client';

export interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
}

/**
 * Fetches all available currencies from the database
 */
export const fetchCurrencies = async (): Promise<Currency[]> => {
  try {
    const { data, error } = await supabase
      .from('currencies')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching currencies:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Unexpected error:', error);
    return [];
  }
};

/**
 * Fetches a specific currency by its code
 */
export const fetchCurrencyByCode = async (code: string): Promise<Currency | null> => {
  try {
    const { data, error } = await supabase
      .from('currencies')
      .select('*')
      .eq('code', code)
      .single();
    
    if (error) {
      console.error(`Error fetching currency with code ${code}:`, error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Unexpected error:', error);
    return null;
  }
};
