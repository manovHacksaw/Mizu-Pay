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
              <h2 className="text-2xl font-bold text-white mb-1">
                About Your Mizu Pay Wallet
              </h2>
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
        <div className="px-8 py-6">
          {/* Info Message */}
          <div className="p-6 rounded-xl bg-blue-50 border border-blue-200">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-200 flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="space-y-3">
                <p className="text-sm text-blue-900 leading-relaxed">
                  This wallet is managed securely for you by Mizu Pay using Privy.{' '}
                  It is designed primarily for purchases and payments within the Mizu Pay ecosystem.
                </p>
                <p className="text-sm text-blue-900 leading-relaxed">
                  You can still send or withdraw funds to an external wallet if needed.{' '}
                  However, please note that maintaining and securing embedded wallets incurs infrastructure fees,{' '}
                  so a small withdrawal fee may apply when sending funds outside Mizu Pay.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-gray-200 bg-gray-50 flex gap-3">
          <button
            onClick={handleContinue}
            className="flex-1 px-5 py-3 rounded-xl font-semibold text-white transition-all"
            style={{
              background: 'linear-gradient(135deg, #0066ff 0%, #0052cc 100%)',
            }}
          >
            Continue to Send
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-5 py-3 bg-white text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

