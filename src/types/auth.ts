
export interface AppUser {
  id: string;
  email: string;
  username: string;
  wallet_address: string;
  balance: number;
  usd_balance?: number;
  ngn_balance?: number;
  ghs_balance?: number;
  created_at: string;
  updated_at: string;
}

export interface AuthContextType {
  user: AppUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  setUser: (user: AppUser | null) => void;
  signInWithGoogle: () => Promise<void>;
}
