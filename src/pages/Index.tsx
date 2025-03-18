
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle, Zap, Shield, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/Header";

const Index = () => {
  const { isAuthenticated } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen overflow-hidden bg-gradient-to-b from-white to-gray-50">
      <Header />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative py-20 md:py-28">
          <div className="container px-4 mx-auto">
            <div className="max-w-4xl mx-auto text-center">
              <div className={`transition-all duration-1000 delay-100 transform ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <span className="inline-block py-1 px-3 mb-4 text-xs font-semibold bg-gcoin-blue/10 text-gcoin-blue rounded-full">
                  Introducing Gcoin Wallet
                </span>
              </div>
              
              <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-6 transition-all duration-1000 delay-300 transform ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                Send, Receive, and Manage Your <span className="text-gcoin-blue">Gcoins</span> with Ease
              </h1>
              
              <p className={`text-xl text-gray-600 mb-8 max-w-2xl mx-auto transition-all duration-1000 delay-500 transform ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                A simple, secure and intuitive wallet for managing your digital currency. Built with modern technology for a seamless experience.
              </p>
              
              <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-1000 delay-700 transform ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                {isAuthenticated ? (
                  <Link to="/dashboard">
                    <Button size="lg" className="px-8">
                      Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/register">
                      <Button size="lg" className="px-8">
                        Get Started <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                    <Link to="/login">
                      <Button variant="outline" size="lg">
                        Log in
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-1/4 right-0 w-64 h-64 bg-gcoin-yellow/10 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-gcoin-blue/10 rounded-full blur-3xl -z-10" />
        </section>
        
        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="container px-4 mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Experience the Future of Digital Currency</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Gcoin Wallet provides a seamless experience for managing your digital assets with cutting-edge features.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                <div className="w-12 h-12 bg-gcoin-blue/10 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-gcoin-blue" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Fast Transactions</h3>
                <p className="text-gray-600">
                  Send and receive Gcoins instantly with our lightning-fast transaction processing.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                <div className="w-12 h-12 bg-gcoin-blue/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-gcoin-blue" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Secure Storage</h3>
                <p className="text-gray-600">
                  Your Gcoins are protected with industry-leading security measures and encryption.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                <div className="w-12 h-12 bg-gcoin-blue/10 rounded-lg flex items-center justify-center mb-4">
                  <RefreshCw className="h-6 w-6 text-gcoin-blue" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Real-time Updates</h3>
                <p className="text-gray-600">
                  Stay updated with real-time balance and transaction notifications.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                <div className="w-12 h-12 bg-gcoin-blue/10 rounded-lg flex items-center justify-center mb-4">
                  <CheckCircle className="h-6 w-6 text-gcoin-blue" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Easy Management</h3>
                <p className="text-gray-600">
                  Intuitive interface for managing your Gcoins with minimal effort.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20 bg-gcoin-blue">
          <div className="container px-4 mx-auto">
            <div className="max-w-3xl mx-auto text-center text-white">
              <h2 className="text-3xl font-bold mb-4">Ready to Start Your Gcoin Journey?</h2>
              <p className="text-white/80 mb-8">
                Join thousands of users who trust Gcoin Wallet for their digital currency needs.
              </p>
              
              {isAuthenticated ? (
                <Link to="/dashboard">
                  <Button size="lg" variant="secondary" className="px-8">
                    Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <Link to="/register">
                  <Button size="lg" variant="secondary" className="px-8">
                    Create Your Wallet <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </section>
        
        {/* Footer */}
        <footer className="bg-white py-12 border-t border-gray-100">
          <div className="container px-4 mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-6 md:mb-0">
                <div className="flex items-center space-x-2 font-bold text-xl text-gcoin-blue">
                  <div className="h-8 w-8 rounded-full bg-gcoin-blue flex items-center justify-center">
                    <span className="text-white font-bold">G</span>
                  </div>
                  <span>Gcoin</span>
                </div>
                <p className="text-gray-500 mt-2 text-sm">
                  © {new Date().getFullYear()} Gcoin Wallet. All rights reserved.
                </p>
              </div>
              
              <div className="flex space-x-6">
                <a href="#" className="text-gray-500 hover:text-gcoin-blue transition-colors">Terms</a>
                <a href="#" className="text-gray-500 hover:text-gcoin-blue transition-colors">Privacy</a>
                <a href="#" className="text-gray-500 hover:text-gcoin-blue transition-colors">Support</a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;
