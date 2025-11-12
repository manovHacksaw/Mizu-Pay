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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="dashboard-card-bg rounded-xl border dashboard-card-border shadow-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header with close button */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-xl font-semibold dashboard-text-primary mb-1">
              Receive cUSD & CELO
            </h2>
            <p className="text-sm dashboard-text-secondary">
              Send only on Celo Sepolia Testnet
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg dashboard-hover transition-colors ml-4"
            aria-label="Close modal"
          >
            <svg
              className="w-5 h-5 dashboard-text-secondary"
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

        {/* Warning Message */}
        <div className="mb-6 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/30">
          <div className="flex items-start gap-3">
            <span className="text-lg shrink-0">⚠️</span>
            <p className="text-sm text-yellow-800 dark:text-yellow-200 leading-relaxed">
              This wallet only supports cUSD and CELO on the Celo Sepolia Testnet.{' '}
              <strong>Do NOT send funds from any other blockchain</strong> (Ethereum, Polygon, BNB, etc.){' '}
              or you will lose your assets permanently.
            </p>
          </div>
        </div>

        {/* QR Code */}
        <div className="mb-6 flex justify-center">
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border dashboard-card-border">
            <QRCodeSVG
              value={walletAddress}
              size={200}
              level="M"
              includeMargin={true}
            />
          </div>
        </div>

        {/* Wallet Address */}
        <div className="mb-6">
          <p className="text-sm font-medium dashboard-text-secondary mb-2">
            Wallet Address
          </p>
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border dashboard-card-border">
            <p className="text-sm font-mono dashboard-text-primary break-all">
              {walletAddress}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleCopyAddress}
            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
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
          <button
            onClick={onClose}
            className="w-full px-4 py-3 dashboard-card-bg dashboard-text-secondary border dashboard-card-border rounded-lg dashboard-hover transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

