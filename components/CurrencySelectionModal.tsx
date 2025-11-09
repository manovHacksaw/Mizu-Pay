'use client';

import { useState } from 'react';
import { useCurrencyStore } from '@/lib/currencyStore';

interface CurrencySelectionModalProps {
  isOpen: boolean;
  onSelect: (currency: 'INR' | 'USD') => void;
}

export function CurrencySelectionModal({ isOpen, onSelect }: CurrencySelectionModalProps) {
  const [selectedCurrency, setSelectedCurrency] = useState<'INR' | 'USD'>('INR');

  if (!isOpen) return null;

  const handleConfirm = () => {
    onSelect(selectedCurrency);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="dashboard-card-bg rounded-xl border dashboard-card-border shadow-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-semibold dashboard-text-primary mb-2">
          Choose Your Currency
        </h2>
        <p className="text-sm dashboard-text-secondary mb-6">
          Select your preferred currency for displaying amounts. You can change this later in settings.
        </p>

        <div className="space-y-3 mb-6">
          <button
            onClick={() => setSelectedCurrency('INR')}
            className={`w-full p-4 rounded-lg border-2 transition-all ${
              selectedCurrency === 'INR'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                : 'dashboard-card-border dashboard-hover'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <div className="font-medium dashboard-text-primary">Indian Rupee (INR)</div>
                <div className="text-sm dashboard-text-secondary">₹</div>
              </div>
              {selectedCurrency === 'INR' && (
                <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
          </button>

          <button
            onClick={() => setSelectedCurrency('USD')}
            className={`w-full p-4 rounded-lg border-2 transition-all ${
              selectedCurrency === 'USD'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                : 'dashboard-card-border dashboard-hover'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <div className="font-medium dashboard-text-primary">US Dollar (USD)</div>
                <div className="text-sm dashboard-text-secondary">$</div>
              </div>
              {selectedCurrency === 'USD' && (
                <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
          </button>
        </div>

        <button
          onClick={handleConfirm}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

