
import React, { useState, useRef, useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

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
  const [scannerError, setScannerError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Check if camera is available
    Html5Qrcode.getCameras()
      .then(devices => {
        console.log("Available cameras:", devices);
        setHasCamera(devices.length > 0);
      })
      .catch(err => {
        console.error('Error checking for cameras:', err);
        setHasCamera(false);
        setScannerError("Failed to detect cameras. Please check permissions.");
      });
    
    // Cleanup scanner when component unmounts
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(err => console.error('Error stopping scanner:', err));
      }
    };
  }, []);

  const startScanner = () => {
    if (!containerRef.current) return;
    setScannerError(null);
    
    const scannerId = "qr-scanner";
    // Create scanner element if it doesn't exist
    if (!document.getElementById(scannerId)) {
      const scannerDiv = document.createElement("div");
      scannerDiv.id = scannerId;
      containerRef.current.appendChild(scannerDiv);
    }
    
    try {
      const scanner = new Html5Qrcode(scannerId);
      scannerRef.current = scanner;
      
      setScanning(true);
      
      const qrCodeSuccessCallback = (decodedText: string) => {
        console.log("QR code detected:", decodedText);
        
        // Stop scanning
        scanner.stop().then(() => {
          setScanning(false);
          
          // Valid wallet addresses start with 'gCoin'
          if (decodedText.startsWith('gCoin')) {
            onCodeDetected(decodedText);
          } else {
            toast.error({
              title: "Invalid QR Code",
              description: "The scanned QR code does not contain a valid wallet address.",
            });
          }
        }).catch(error => {
          console.error('Error stopping scanner:', error);
        });
      };
      
      const qrCodeErrorCallback = (errorMessage: string) => {
        console.error("QR scanning error:", errorMessage);
      };
      
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      };
      
      // First, check if any cameras are available
      Html5Qrcode.getCameras().then(devices => {
        if (devices && devices.length > 0) {
          const cameraId = devices[0].id;
          console.log("Using camera:", cameraId);
          
          // Start scanning
          scanner.start(
            { deviceId: cameraId },
            config,
            qrCodeSuccessCallback,
            qrCodeErrorCallback
          ).catch((error) => {
            console.error('Error starting scanner with device ID:', error);
            
            // If deviceId approach fails, try with facingMode
            scanner.start(
              { facingMode: "environment" },
              config,
              qrCodeSuccessCallback,
              qrCodeErrorCallback
            ).catch((error2) => {
              console.error('Error starting scanner with facingMode:', error2);
              setScanning(false);
              setScannerError("Could not access camera. Please check permissions and try again.");
              toast.error({
                title: "Scanner Error",
                description: "Could not start the scanner. Please make sure camera permissions are granted.",
              });
            });
          });
        } else {
          setScannerError("No cameras found on your device.");
          setScanning(false);
        }
      }).catch(err => {
        console.error("Error getting cameras", err);
        setScannerError("Error accessing camera. Please check permissions.");
        setScanning(false);
      });
    } catch (error) {
      console.error("Error initializing scanner:", error);
      setScannerError("Failed to initialize the QR scanner.");
      setScanning(false);
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
    <div className="flex flex-col">
      <div 
        ref={containerRef}
        className="bg-gray-100 rounded-xl overflow-hidden w-full h-72 relative flex items-center justify-center mb-4"
      >
        {!scanning && !hasCamera && (
          <div className="text-center p-4">
            <p className="text-red-500 font-medium mb-2">No camera detected</p>
            <p className="text-gray-500 text-sm">
              Please make sure your device has a camera and the browser has permission to access it.
            </p>
          </div>
        )}
        
        {!scanning && hasCamera && (
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
        
        {scannerError && (
          <div className="text-center p-4 bg-red-50 border border-red-100 rounded-lg">
            <p className="text-red-500 font-medium mb-2">Scanner Error</p>
            <p className="text-gray-600 text-sm">{scannerError}</p>
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
