'use client';

import { useEffect } from 'react';

interface SendWalletInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
}

export function SendWalletInfoModal({ isOpen, onClose, onContinue }: SendWalletInfoModalProps) {
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

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleContinue = () => {
    onClose();
    onContinue();
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
              About Your Mizu Pay Wallet
            </h2>
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

        {/* Info Message */}
        <div className="mb-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30">
          <div className="flex items-start gap-3">
            <span className="text-lg flex-shrink-0">ℹ️</span>
            <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
              This wallet is managed securely for you by Mizu Pay using Privy.{' '}
              It is designed primarily for purchases and payments within the Mizu Pay ecosystem.
              <br />
              <br />
              You can still send or withdraw funds to an external wallet if needed.{' '}
              However, please note that maintaining and securing embedded wallets incurs infrastructure fees,{' '}
              so a small withdrawal fee may apply when sending funds outside Mizu Pay.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleContinue}
            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Continue to Send
          </button>
          <button
            onClick={onClose}
            className="w-full px-4 py-3 dashboard-card-bg dashboard-text-secondary border dashboard-card-border rounded-lg dashboard-hover transition-colors font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

