
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";

export async function fetchUserProfile(userId: string): Promise<User | null> {
  try {
    console.log("Fetching profile for user:", userId);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      throw error;
    }

    console.log("Profile data retrieved:", data);
    if (data) {
      const profileData: User = {
        id: data.id,
        username: data.username,
        email: data.email,
        walletAddress: data.wallet_address || '',
        balance: Number(data.balance) || 600000
      };
      return profileData;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    toast({
      title: "Failed to load profile",
      description: "Please try logging in again",
      variant: "destructive",
    });
    return null;
  }
}

export async function updateUserBalance(userId: string, newBalance: number): Promise<boolean> {
  try {
    console.log("Updating balance to:", newBalance);
    const { error } = await supabase
      .from('profiles')
      .update({ balance: newBalance })
      .eq('id', userId);
    
    if (error) {
      throw error;
    }
    
    console.log("Balance updated successfully");
    return true;
  } catch (error) {
    console.error('Error updating balance:', error);
    toast({
      title: "Failed to update balance",
      description: "Please try again later",
      variant: "destructive",
    });
    return false;
  }
}

export async function fetchAllWalletAddresses(): Promise<{id: string, walletAddress: string}[]> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, wallet_address');
    
    if (error) {
      throw error;
    }
    
    return data.map(profile => ({
      id: profile.id,
      walletAddress: profile.wallet_address
    }));
  } catch (error) {
    console.error('Error fetching wallet addresses:', error);
    return [];
  }
}

export async function fetchUserByWalletAddress(walletAddress: string): Promise<{id: string, username: string} | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('wallet_address', walletAddress)
      .single();
    
    if (error) {
      return null;
    }
    
    return {
      id: data.id,
      username: data.username
    };
  } catch (error) {
    console.error('Error fetching user by wallet address:', error);
    return null;
  }
}
