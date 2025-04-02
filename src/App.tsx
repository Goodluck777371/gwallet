
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
import Exchange from "./pages/Exchange";
import Stake from "./pages/Stake";
import Transactions from "./pages/Transactions";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import PriceChart from "./pages/PriceChart";
import Convert from "./pages/Convert";
import P2P from "./pages/P2P";
import Blog from "./pages/Blog";
import Admin from "./pages/Admin";
import BlogEditor from "./pages/BlogEditor";
import CustomerCare from "./pages/CustomerCare";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

// Admin route component - only accessible to admin users
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Check if user is admin (has admin wallet)
  if (user?.walletAddress !== "gCoinAdmin123456") {
    return <Navigate to="/dashboard" />;
  }

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
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
    <Route path="/register" element={<AuthRoute><Register /></AuthRoute>} />
    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    <Route path="/send" element={<ProtectedRoute><Send /></ProtectedRoute>} />
    <Route path="/exchange" element={<ProtectedRoute><Exchange /></ProtectedRoute>} />
    <Route path="/stake" element={<ProtectedRoute><Stake /></ProtectedRoute>} />
    <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
    <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
    <Route path="/price-chart" element={<ProtectedRoute><PriceChart /></ProtectedRoute>} />
    <Route path="/convert" element={<ProtectedRoute><Convert /></ProtectedRoute>} />
    <Route path="/p2p" element={<ProtectedRoute><P2P /></ProtectedRoute>} />
    <Route path="/blog" element={<ProtectedRoute><Blog /></ProtectedRoute>} />
    <Route path="/customer-care" element={<ProtectedRoute><CustomerCare /></ProtectedRoute>} />
    <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
    <Route path="/admin/blog/editor" element={<AdminRoute><BlogEditor /></AdminRoute>} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
