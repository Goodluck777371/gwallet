
import React, { useState, useRef, useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface QrCodeScannerProps {
  onCodeDetected: (walletAddress: string) => void;
  onClose?: () => void;
}

const QrCodeScanner: React.FC<QrCodeScannerProps> = ({ 
  onCodeDetected, 
  onClose 
}) => {
  const [scanning, setScanning] = useState(false);
  const [hasCamera, setHasCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check if camera is available
    Html5Qrcode.getCameras()
      .then(devices => {
        setHasCamera(devices.length > 0);
        if (devices.length === 0) {
          setCameraError("No cameras detected on your device");
        }
      })
      .catch(err => {
        console.error('Error checking for cameras:', err);
        setHasCamera(false);
        setCameraError("Error accessing camera. Please make sure you've granted camera permissions.");
      });
    
    // Cleanup scanner when component unmounts
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(err => console.error('Error stopping scanner:', err));
      }
    };
  }, []);

  const startScanner = async () => {
    if (!containerRef.current) return;
    
    try {
      const scannerId = "qr-scanner";
      // Create scanner element if it doesn't exist
      if (!document.getElementById(scannerId)) {
        const scannerDiv = document.createElement("div");
        scannerDiv.id = scannerId;
        scannerDiv.style.width = "100%";
        scannerDiv.style.height = "100%";
        containerRef.current.appendChild(scannerDiv);
      }
      
      // Request camera permission explicitly
      await navigator.mediaDevices.getUserMedia({ video: true });
      
      const scanner = new Html5Qrcode(scannerId);
      scannerRef.current = scanner;
      
      setScanning(true);
      setCameraError(null);
      
      const qrCodeSuccessCallback = (decodedText: string) => {
        // Stop scanning
        scanner.stop().then(() => {
          setScanning(false);
          
          // Check if the scanned text is a valid wallet address
          // This is just a basic check, you might want to add more validation
          if (decodedText.startsWith('gCoin')) {
            onCodeDetected(decodedText);
          } else {
            toast({
              title: "Invalid QR Code",
              description: "The scanned QR code does not contain a valid wallet address.",
              variant: "destructive",
            });
          }
        }).catch(error => {
          console.error('Error stopping scanner:', error);
        });
      };
      
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: window.innerWidth < 768 ? 1.0 : 1.33, // Adjust aspect ratio for mobile
        formatsToSupport: [Html5Qrcode.FORMATS.QR_CODE]
      };
      
      // Try to start camera with environment facing camera first (rear camera)
      scanner.start(
        { facingMode: "environment" },
        config,
        qrCodeSuccessCallback,
        undefined
      ).catch((error) => {
        // If environment camera fails, try user facing camera (front camera)
        scanner.start(
          { facingMode: "user" },
          config,
          qrCodeSuccessCallback,
          undefined
        ).catch((error) => {
          console.error('Error starting scanner:', error);
          setScanning(false);
          setCameraError("Could not start the scanner. Please make sure camera permissions are granted.");
          toast({
            title: "Scanner Error",
            description: "Could not start the scanner. Please make sure camera permissions are granted.",
            variant: "destructive",
          });
        });
      });
    } catch (error) {
      console.error('Camera access error:', error);
      setScanning(false);
      setCameraError("Failed to access camera. Please grant permission when prompted.");
      toast({
        title: "Camera Permission Required",
        description: "Please allow access to your camera to scan QR codes.",
        variant: "destructive",
      });
    }
  };
  
  const stopScanner = () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current.stop().then(() => {
        setScanning(false);
        if (onClose) onClose();
      }).catch(error => {
        console.error('Error stopping scanner:', error);
      });
    } else if (onClose) {
      onClose();
    }
  };
  
  return (
    <div className="flex flex-col w-full">
      <div 
        ref={containerRef}
        className="bg-gray-100 rounded-xl overflow-hidden w-full h-72 md:h-80 relative flex items-center justify-center mb-4"
      >
        {!scanning && cameraError && (
          <div className="text-center p-4">
            <p className="text-red-500 font-medium mb-2">{cameraError}</p>
            <p className="text-gray-500 text-sm">
              Please make sure your device has a camera and the browser has permission to access it.
            </p>
          </div>
        )}
        
        {!scanning && !cameraError && !hasCamera && (
          <div className="text-center p-4">
            <p className="text-red-500 font-medium mb-2">No camera detected</p>
            <p className="text-gray-500 text-sm">
              Please make sure your device has a camera and the browser has permission to access it.
            </p>
          </div>
        )}
        
        {!scanning && !cameraError && hasCamera && (
          <div className="text-center p-4">
            <div className="h-16 w-16 mx-auto mb-4 text-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-sm text-gray-500 mb-2">
              Scan a QR code to get a wallet address
            </p>
          </div>
        )}
        
        {/* Scanner target overlay */}
        {scanning && (
          <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
            <div className="w-60 h-60 border-2 border-white rounded-lg opacity-70"></div>
          </div>
        )}
      </div>
      
      <div className="flex justify-between">
        {!scanning ? (
          <>
            <Button 
              variant="outline" 
              onClick={onClose || stopScanner}
              className="w-full mr-2"
            >
              Cancel
            </Button>
            <Button 
              onClick={startScanner} 
              disabled={!hasCamera}
              className="w-full ml-2"
            >
              Start Scanning
            </Button>
          </>
        ) : (
          <Button 
            onClick={stopScanner} 
            className="w-full"
          >
            Cancel Scan
          </Button>
        )}
      </div>
    </div>
  );
};

export default QrCodeScanner;
