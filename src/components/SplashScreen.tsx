
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

interface SplashScreenProps {
  onFinished?: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinished }) => {
  const [fadeOut, setFadeOut] = useState(false);
  const { user } = useAuth();
  
  useEffect(() => {
    // Wait for a moment, then start fade out animation
    const timer = setTimeout(() => {
      setFadeOut(true);
    }, 2000);
    
    // After fade out animation is complete, call onFinished if provided
    const completeTimer = setTimeout(() => {
      if (onFinished) {
        onFinished();
      }
    }, 2500);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(completeTimer);
    };
  }, [onFinished]);
  
  return (
    <div className={`fixed inset-0 z-50 bg-white flex flex-col items-center justify-center transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
      <div className="flex flex-col items-center space-y-6">
        <div className="h-20 w-20 rounded-full bg-gcoin-blue/10 flex items-center justify-center p-4">
          <div className="h-12 w-12 rounded-full bg-gcoin-blue flex items-center justify-center">
            <span className="text-white font-bold text-xl">G</span>
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome Back
          {user?.username && <span className="ml-2">{user.username}</span>}
        </h1>
        
        <div className="relative">
          <div className="h-8 w-8 rounded-full border-2 border-gcoin-blue/10 border-t-gcoin-blue animate-spin"></div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
