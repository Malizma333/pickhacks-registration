"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface QRScannerProps {
  onScan: (qrCode: string) => void;
  onError?: (error: string) => void;
  isActive: boolean;
}

export function QRScanner({ onScan, onError, isActive }: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const lastScannedRef = useRef<string | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startScanner = async () => {
    if (!containerRef.current || scannerRef.current) return;

    try {
      const scanner = new Html5Qrcode("qr-scanner-container");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1,
        },
        (decodedText) => {
          // Debounce to prevent duplicate scans
          if (lastScannedRef.current === decodedText) return;

          lastScannedRef.current = decodedText;
          onScan(decodedText);

          // Reset debounce after 3 seconds
          if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
          }
          debounceTimeoutRef.current = setTimeout(() => {
            lastScannedRef.current = null;
          }, 3000);
        },
        () => {
          // Ignore decode errors (no QR code in frame)
        },
      );

      setIsScanning(true);
      setHasPermission(true);
      setError(null);
    } catch (err) {
      console.error("Scanner start error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to start camera";

      if (errorMessage.includes("Permission")) {
        setHasPermission(false);
        setError("Camera permission denied. Please allow camera access.");
      } else {
        setError(errorMessage);
      }

      onError?.(errorMessage);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.error("Scanner stop error:", err);
      }
      scannerRef.current = null;
      setIsScanning(false);
    }
  };

  useEffect(() => {
    if (isActive) {
      void startScanner();
    } else {
      void stopScanner();
    }

    return () => {
      void stopScanner();
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  return (
    <div className="relative">
      {/* Scanner container */}
      <div
        id="qr-scanner-container"
        ref={containerRef}
        className={`overflow-hidden rounded-lg bg-gray-900 ${
          !isActive || error ? "hidden" : ""
        }`}
        style={{ minHeight: "300px" }}
      />

      {/* Inactive state */}
      {!isActive && !error && (
        <div className="flex h-75 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-100">
          <svg
            className="mb-4 h-16 w-16 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
            />
          </svg>
          <p className="text-center text-gray-500">
            Select a station to start scanning
          </p>
        </div>
      )}

      {/* Permission denied state */}
      {hasPermission === false && (
        <div className="flex h-75 flex-col items-center justify-center rounded-lg border-2 border-red-200 bg-red-50">
          <svg
            className="mb-4 h-16 w-16 text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
            />
          </svg>
          <p className="mb-2 text-center font-medium text-red-600">
            Camera Access Denied
          </p>
          <p className="px-4 text-center text-sm text-red-500">
            Please allow camera access in your browser settings to scan QR
            codes.
          </p>
        </div>
      )}

      {/* Error state */}
      {error && hasPermission !== false && (
        <div className="flex h-75 flex-col items-center justify-center rounded-lg border-2 border-yellow-200 bg-yellow-50">
          <svg
            className="mb-4 h-16 w-16 text-yellow-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p className="mb-2 text-center font-medium text-yellow-700">
            Scanner Error
          </p>
          <p className="px-4 text-center text-sm text-yellow-600">{error}</p>
          <button
            onClick={() => {
              setError(null);
              void startScanner();
            }}
            className="mt-4 rounded-lg bg-yellow-100 px-4 py-2 text-sm font-medium text-yellow-700 transition hover:bg-yellow-200"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Scanning indicator */}
      {isScanning && !error && (
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/70 px-4 py-2 text-sm text-white">
          <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
          Scanning...
        </div>
      )}
    </div>
  );
}
