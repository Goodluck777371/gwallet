import { supabase } from './supabaseClient';

export const updateProfile = async (userId: string, updates: { username?: string; email?: string; wallet_address?: string; balance?: number }) => {
  try {
    const { data, error } = await supabase
      .from('profiles') // Table name
      .update(updates) // Fields to update
      .eq('id', userId); // Match the row by user ID

    if (error) {
      console.error('Error updating profile:', error);
      return { success: false, error };
    }

    console.log('Profile updated successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error };
  }
};
