'use client';

import { useState } from 'react';
import { useCurrencyStore, CURRENCIES, Currency } from '@/lib/currencyStore';

interface CurrencySelectionModalProps {
  isOpen: boolean;
  onSelect: (currency: Currency) => void;
}

export function CurrencySelectionModal({ isOpen, onSelect }: CurrencySelectionModalProps) {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('INR');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    onSelect(selectedCurrency);
  };

  // Filter currencies based on search query
  const filteredCurrencies = CURRENCIES.filter(currency =>
    currency.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    currency.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="dashboard-card-bg rounded-xl border dashboard-card-border shadow-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        <h2 className="text-xl font-semibold dashboard-text-primary mb-2">
          Choose Your Currency
        </h2>
        <p className="text-sm dashboard-text-secondary mb-4">
          Select your preferred currency for displaying amounts. You can change this later in settings.
        </p>

        {/* Search Input */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search currency..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border dashboard-card-border dashboard-card-bg dashboard-text-primary placeholder-dashboard-text-secondary focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Currency List */}
        <div className="space-y-2 mb-6 overflow-y-auto flex-1">
          {filteredCurrencies.map((currency) => (
            <button
              key={currency.code}
              onClick={() => setSelectedCurrency(currency.code)}
              className={`w-full p-4 rounded-lg border-2 transition-all ${
                selectedCurrency === currency.code
                  ? 'border-blue-500 bg-blue-50'
                  : 'dashboard-card-border dashboard-hover'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <div className="font-medium dashboard-text-primary">
                    {currency.name} ({currency.code})
                  </div>
                  <div className="text-sm dashboard-text-secondary">{currency.symbol}</div>
                </div>
                {selectedCurrency === currency.code && (
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
          ))}
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

