
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Loader2, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";

const AdminLogin = () => {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { adminLogin, adminUser } = useAdminAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // If already logged in, redirect to dashboard
  if (adminUser) {
    navigate("/admin/dashboard");
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password) {
      toast({
        title: "Missing Information",
        description: "Please enter the admin password.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      // Use a fixed admin email for password-only login
      await adminLogin("admin@gcoin.com", password);
      navigate("/admin/dashboard");
    } catch (error) {
      // Error is already handled in adminLogin function
      console.error("Admin login form error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6">
      <Card className="w-full max-w-md bg-white/5 backdrop-blur-sm border border-white/10 shadow-2xl">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-2">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">Admin Access</CardTitle>
          <CardDescription className="text-gray-300">
            Enter admin password to access dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">Admin Password</Label>
              <div className="relative">
                <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500"
                  disabled={isLoading}
                  autoFocus
                />
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                "Access Dashboard"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center border-t border-white/10 text-gray-400 text-xs">
          <p className="w-full">GWallet Admin • Secure Access • {new Date().getFullYear()}</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AdminLogin;
