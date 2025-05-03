import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Send from "./pages/Send";
import Buy from "./pages/Buy";
import Sell from "./pages/Sell";
import Stake from "./pages/Stake";
import Transactions from "./pages/Transactions";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import LiveChat from "./components/LiveChat";
import SplashScreen from "./components/SplashScreen";
import Exchange from "./pages/Exchange";
import Profile from "./pages/Profile";

const queryClient = new QueryClient();

// Protected route component with splash screen
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);

  // Check if this is the first authenticated load
  useEffect(() => {
    if (!isLoading && isAuthenticated && initialLoad) {
      // Keep showing splash screen
      setShowSplash(true);
      setInitialLoad(false);
    } else if (!isLoading && !isAuthenticated) {
      setShowSplash(false);
    }
  }, [isLoading, isAuthenticated, initialLoad]);

  // Handle when loading
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // If authenticated and should show splash screen
  if (showSplash) {
    return (
      <>
        <SplashScreen onFinished={() => setShowSplash(false)} />
        <div className="invisible">{children}</div>
      </>
    );
  }
  
  // Normal authenticated render
  return <>{children}</>;
};

// Auth routes (accessible only when NOT authenticated)
const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
};

// App Routes setup
const AppRoutes = () => (
  <>
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
      <Route path="/register" element={<AuthRoute><Register /></AuthRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/send" element={<ProtectedRoute><Send /></ProtectedRoute>} />
      <Route path="/buy" element={<ProtectedRoute><Buy /></ProtectedRoute>} />
      <Route path="/sell" element={<ProtectedRoute><Sell /></ProtectedRoute>} />
      <Route path="/stake" element={<ProtectedRoute><Stake /></ProtectedRoute>} />
      <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/exchange" element={<ProtectedRoute><Exchange /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
    <LiveChat />
  </>
);

// Fixed: Changed the order - BrowserRouter should be the outermost router-related wrapper
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
          <Toaster />
          <Sonner />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
