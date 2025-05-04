
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, Lock, ChevronRight } from "lucide-react";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [showSecurityQuestion, setShowSecurityQuestion] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      if (password === 'DeadAdmin') {
        setShowSecurityQuestion(true);
      } else {
        toast.error({
          title: 'Access Denied',
          description: 'Incorrect administrator password.',
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleSecurityQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      if (securityAnswer.toLowerCase() === 'cat') {
        // Display welcome message
        toast({
          title: (
            <div className="flex items-center">
              <Shield className="mr-2 h-5 w-5" />
              <span>Welcome Big Daddy</span>
            </div>
          ) as any,
          description: 'You are now logged in as administrator.',
          variant: 'success',
        });
        // Store admin auth in session storage
        sessionStorage.setItem('gwallet_admin_auth', 'true');
        // Navigate to admin dashboard
        navigate('/Noadminneeded/dashboard');
      } else {
        toast.error({
          title: 'Security Check Failed',
          description: 'Incorrect security answer.',
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <AnimatePresence mode="wait">
        {!showSecurityQuestion ? (
          <motion.div
            key="password"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md"
          >
            <div className="bg-black p-8 rounded-lg border border-gray-800 shadow-xl">
              <div className="flex flex-col items-center mb-8">
                <div className="bg-white/10 p-3 rounded-full mb-4">
                  <Lock className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Administrator Access</h2>
                <p className="text-gray-400 text-center mt-2">
                  Restricted area. Authorized personnel only.
                </p>
              </div>

              <form onSubmit={handlePasswordSubmit}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                      Administrator Password
                    </label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter administrator password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading || !password}
                    className="w-full bg-white hover:bg-gray-200 text-black"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-black border-t-transparent rounded-full" />
                        Verifying...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        Continue <ChevronRight className="ml-2 h-4 w-4" />
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="securityQuestion"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md"
          >
            <div className="bg-black p-8 rounded-lg border border-gray-800 shadow-xl">
              <div className="flex flex-col items-center mb-8">
                <div className="bg-white/10 p-3 rounded-full mb-4">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Security Question</h2>
                <p className="text-gray-400 text-center mt-2">
                  What's the plan of GWallet?
                </p>
              </div>

              <form onSubmit={handleSecurityQuestionSubmit}>
                <div className="space-y-4">
                  <div>
                    <Input
                      type="text"
                      placeholder="Your answer"
                      value={securityAnswer}
                      onChange={(e) => setSecurityAnswer(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading || !securityAnswer}
                    className="w-full bg-white hover:bg-gray-200 text-black"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-black border-t-transparent rounded-full" />
                        Verifying...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        Authenticate <ChevronRight className="ml-2 h-4 w-4" />
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminLogin;
