
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import SplashScreen from "@/components/SplashScreen";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    console.log("Index page - Authentication status:", { isAuthenticated, isLoading });
    
    if (!isLoading) {
      if (isAuthenticated) {
        console.log("User is authenticated, redirecting to dashboard");
        navigate("/dashboard", { replace: true });
      } else {
        console.log("User is not authenticated, redirecting to login");
        navigate("/login", { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Show splash screen while determining authentication status
  return <SplashScreen />;
};

export default Index;
