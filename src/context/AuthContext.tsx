
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";

// User type
export interface User {
  id: string;
  username: string;
  email: string;
  walletAddress: string;
  balance: number;
}

// Auth context type
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateBalance: (newBalance: number) => void;
}

// Mock data for demonstration
const MOCK_USERS = [
  {
    id: '1',
    username: 'demo',
    email: 'demo@example.com',
    password: 'password123',
    walletAddress: 'gCoin8272xrt92',
    balance: 200
  }
];

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user is already logged in
  useEffect(() => {
    const storedUser = localStorage.getItem('gcoin-user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('gcoin-user');
      }
    }
    setIsLoading(false);
  }, []);

  // Update user in local storage whenever user state changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('gcoin-user', JSON.stringify(user));
    }
  }, [user]);

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Find user (in real app, would be a backend call)
      const foundUser = MOCK_USERS.find(u => u.email === email && u.password === password);
      
      if (!foundUser) {
        throw new Error('Invalid credentials');
      }

      // Create user object without password
      const { password: _, ...userWithoutPassword } = foundUser;
      
      // Set user in state and localStorage
      setUser(userWithoutPassword);
      localStorage.setItem('gcoin-user', JSON.stringify(userWithoutPassword));
      
      toast({
        title: `Welcome back, ${foundUser.username}! 🎉`,
        description: "You've successfully logged in to your GCoin wallet.",
      });

      navigate('/dashboard');
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (username: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));

      // Check if email is already used (in real app, would be a backend call)
      if (MOCK_USERS.some(u => u.email === email)) {
        throw new Error('Email already in use');
      }

      // Generate unique wallet address
      const walletPrefix = "gCoin";
      const randomPart = Math.random().toString(36).substring(2, 6) + 
                        Math.random().toString(36).substring(2, 6);
      const walletAddress = `${walletPrefix}${randomPart}`;

      // Create new user
      const newUser = {
        id: String(Date.now()),
        username,
        email,
        password,
        walletAddress,
        balance: 50 // Starting balance for new users
      };

      // In a real app, you would send this to your backend
      // For demo, we'll just add to our mock data
      MOCK_USERS.push(newUser);

      // Create user object without password
      const { password: _, ...userWithoutPassword } = newUser;
      
      // Set user in state and localStorage
      setUser(userWithoutPassword);
      localStorage.setItem('gcoin-user', JSON.stringify(userWithoutPassword));
      
      toast({
        title: `Welcome, ${username}! 🎉`,
        description: "Your GCoin wallet has been created successfully with 50 GCoins bonus!",
      });

      navigate('/dashboard');
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Update balance function
  const updateBalance = (newBalance: number) => {
    if (user) {
      const updatedUser = {
        ...user,
        balance: newBalance
      };
      setUser(updatedUser);
    }
  };

  // Logout function
  const logout = () => {
    // Confirm before logout
    if (window.confirm("Are you sure you want to log out?")) {
      setUser(null);
      localStorage.removeItem('gcoin-user');
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      navigate('/');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateBalance
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
