
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface SplashScreenProps {
  onFinished: () => void;
}

const SplashScreen = ({ onFinished }: SplashScreenProps) => {
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationComplete(true);
      setTimeout(onFinished, 500); // Add delay before hiding splash screen
    }, 2000);

    return () => clearTimeout(timer);
  }, [onFinished]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 bg-white flex flex-col items-center justify-center transition-opacity duration-500",
        animationComplete ? "opacity-0" : "opacity-100"
      )}
    >
      <div className="flex flex-col items-center">
        <div className="h-20 w-20 rounded-full bg-gcoin-blue flex items-center justify-center mb-6">
          <span className="text-white font-bold text-4xl">G</span>
        </div>
        <h1 className="text-3xl font-bold mb-6 text-gcoin-blue">Welcome Back</h1>
        <div className="relative">
          <div className="h-8 w-8 rounded-full border-4 border-gcoin-blue/20 border-t-gcoin-blue animate-spin"></div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
