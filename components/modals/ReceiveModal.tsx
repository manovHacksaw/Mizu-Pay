'use client';

import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface ReceiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string;
}

export function ReceiveModal({ isOpen, onClose, walletAddress }: ReceiveModalProps) {
  const [copied, setCopied] = useState(false);

  // Handle ESC key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopyAddress = async () => {
    if (!walletAddress) return;
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden">
        {/* Header with gradient background */}
        <div 
          className="px-8 py-6"
          style={{
            background: 'linear-gradient(135deg, #0066ff 0%, #0052cc 100%)',
          }}
        >
          <div className="flex items-start justify-between">
          <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-2">
              Receive cUSD & CELO
            </h2>
              <p className="text-sm text-white/90">
              Send only on Celo Sepolia Testnet
            </p>
          </div>
          <button
            onClick={onClose}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
            aria-label="Close modal"
          >
            <svg
                className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-6 space-y-6">
        {/* Warning Message */}
          <div className="p-5 rounded-xl bg-yellow-50 border border-yellow-200">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-200 flex items-center justify-center">
                <svg className="w-4 h-4 text-yellow-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-sm text-yellow-800 leading-relaxed">
              This wallet only supports cUSD and CELO on the Celo Sepolia Testnet.{' '}
              <strong>Do NOT send funds from any other blockchain</strong> (Ethereum, Polygon, BNB, etc.){' '}
              or you will lose your assets permanently.
            </p>
          </div>
        </div>

          {/* QR Code and Address Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* QR Code */}
            <div className="flex flex-col items-center">
              <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
            <QRCodeSVG
              value={walletAddress}
                  size={220}
              level="M"
              includeMargin={true}
            />
          </div>
        </div>

        {/* Wallet Address */}
            <div className="flex flex-col justify-center">
              <p className="text-sm font-semibold text-gray-700 mb-3">
            Wallet Address
          </p>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 mb-4">
                <p className="text-sm font-mono text-gray-900 break-all leading-relaxed">
              {walletAddress}
            </p>
          </div>
          <button
            onClick={handleCopyAddress}
                className="w-full px-5 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                style={{
                  background: copied ? '#10b981' : 'linear-gradient(135deg, #0066ff 0%, #0052cc 100%)',
                  color: 'white',
                }}
          >
            {copied ? (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                Copy Address
              </>
            )}
          </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-5 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

