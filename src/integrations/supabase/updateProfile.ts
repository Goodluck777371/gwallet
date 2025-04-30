import { supabase } from './client';

/**
 * Updates the user's profile in the Supabase database.
 *
 * @param updates - An object containing the fields to update (e.g., username, email, wallet_address, balance).
 * @returns An object containing the success status and updated data or error.
 */
export const updateProfile = async (
  updates: {
    username?: string;
    email?: string;
    wallet_address?: string;
    balance?: number;
  }
) => {
  try {
    // Get the authenticated user's session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('Error fetching session:', sessionError);
      return { success: false, error: sessionError };
    }

    const userId = session?.user?.id;

    if (!userId) {
      console.error('No authenticated user found!');
      return { success: false, error: 'No authenticated user found!' };
    }

    // Update the profile in the database
    const { data, error } = await supabase
      .from('profiles') // Table name
      .update(updates) // Fields to update
      .eq('id', userId); // Automatically match the user by their authenticated ID

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
