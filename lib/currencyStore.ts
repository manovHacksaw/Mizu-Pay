import { create } from 'zustand';

export type Currency = 'INR' | 'USD';

interface ExchangeRates {
  celo: {
    usd: number;
    inr: number;
  };
  'celo-dollar': {
    usd: number;
    inr: number;
  };
}

interface CurrencyState {
  userDefaultCurrency: Currency;
  selectedDisplayCurrency: Currency;
  exchangeRates: ExchangeRates | null;
  lastFetchTime: number | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUserDefaultCurrency: (currency: Currency) => void;
  setSelectedDisplayCurrency: (currency: Currency) => void;
  setExchangeRates: (rates: ExchangeRates) => void;
  fetchExchangeRates: () => Promise<void>;
  convertCryptoToUSD: (amount: number, token: 'CELO' | 'cUSD') => number;
  convertUSDToUserCurrency: (amountUSD: number) => number;
  formatAmount: (amount: number, currency: Currency) => string;
}

const REFRESH_INTERVAL = 60 * 1000; // 60 seconds

export const useCurrencyStore = create<CurrencyState>((set, get) => ({
  userDefaultCurrency: 'INR', // Fallback default
  selectedDisplayCurrency: 'INR', // Fallback default
  exchangeRates: null,
  lastFetchTime: null,
  isLoading: false,
  error: null,

  setUserDefaultCurrency: (currency) => {
    set({ userDefaultCurrency: currency, selectedDisplayCurrency: currency });
  },

  setSelectedDisplayCurrency: (currency) => {
    set({ selectedDisplayCurrency: currency });
  },

  setExchangeRates: (rates) => {
    set({ exchangeRates: rates, lastFetchTime: Date.now(), error: null });
  },

  fetchExchangeRates: async () => {
    const state = get();
    
    // Don't fetch if we just fetched recently
    if (state.lastFetchTime && Date.now() - state.lastFetchTime < REFRESH_INTERVAL) {
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const response = await fetch('/api/exchange-rates');
      if (!response.ok) {
        throw new Error('Failed to fetch exchange rates');
      }

      const data = await response.json();
      
      // Transform CoinGecko response to our format
      const rates: ExchangeRates = {
        celo: {
          usd: data.celo?.usd || 0,
          inr: data.celo?.inr || 0,
        },
        'celo-dollar': {
          usd: data['celo-dollar']?.usd || 1, // cUSD should be ~$1
          inr: data['celo-dollar']?.inr || 83, // Approximate INR rate
        },
      };

      set({ exchangeRates: rates, lastFetchTime: Date.now(), isLoading: false, error: null });
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch exchange rates',
        isLoading: false 
      });
    }
  },

  convertCryptoToUSD: (amount, token) => {
    const { exchangeRates } = get();
    if (!exchangeRates) return amount; // Fallback to 1:1 if rates not loaded

    if (token === 'cUSD') {
      return amount * exchangeRates['celo-dollar'].usd;
    } else if (token === 'CELO') {
      return amount * exchangeRates.celo.usd;
    }
    return amount;
  },

  convertUSDToUserCurrency: (amountUSD) => {
    const { selectedDisplayCurrency, exchangeRates } = get();
    
    if (selectedDisplayCurrency === 'USD') {
      return amountUSD;
    }

    if (!exchangeRates) {
      // Fallback: approximate INR rate if rates not loaded
      return amountUSD * 83;
    }

    // Convert USD to INR using cUSD rate (more stable)
    const usdToInrRate = exchangeRates['celo-dollar'].inr / exchangeRates['celo-dollar'].usd;
    return amountUSD * usdToInrRate;
  },

  formatAmount: (amount, currency) => {
    const locale = currency === 'INR' ? 'en-IN' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  },
}));

