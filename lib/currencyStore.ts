import { create } from 'zustand';

export type Currency = 'INR' | 'USD' | 'GBP' | 'EUR' | 'JPY' | 'CAD' | 'AUD' | 'CHF' | 'CNY' | 'NZD' | 'SEK' | 'NOK' | 'DKK' | 'SGD' | 'HKD' | 'MXN' | 'BRL' | 'ZAR' | 'RUB' | 'TRY' | 'KRW' | 'PLN';

export const CURRENCIES: { code: Currency; name: string; symbol: string }[] = [
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
  { code: 'PLN', name: 'Polish Zloty', symbol: 'zł' },
];

interface ExchangeRates {
  celo: Record<string, number>;
  'celo-dollar': Record<string, number>;
  usd: Record<string, number>; // USD to other currencies
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
      
      // Transform API response to our format
      const rates: ExchangeRates = {
        celo: {
          usd: data.celo?.usd || 0,
        },
        'celo-dollar': {
          usd: data['celo-dollar']?.usd || 1, // cUSD should be ~$1
        },
        usd: data.usd || {}, // USD to other currencies rates
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

    if (!exchangeRates || !exchangeRates.usd) {
      // Fallback: use approximate rates if not loaded
      const fallbackRates: Record<string, number> = {
        INR: 83, GBP: 0.79, EUR: 0.92, JPY: 150, CAD: 1.35, AUD: 1.52,
        CHF: 0.88, CNY: 7.2, NZD: 1.64, SEK: 10.5, NOK: 10.7, DKK: 6.85,
        SGD: 1.34, HKD: 7.8, MXN: 17, BRL: 4.95, ZAR: 18.5, RUB: 92,
        TRY: 32, KRW: 1330, PLN: 4.0,
      };
      return amountUSD * (fallbackRates[selectedDisplayCurrency] || 1);
    }

    // Convert USD to selected currency using exchange rates
    const rate = exchangeRates.usd[selectedDisplayCurrency.toLowerCase()] || 1;
    return amountUSD * rate;
  },

  formatAmount: (amount, currency) => {
    // Map currencies to their locale
    const localeMap: Record<string, string> = {
      INR: 'en-IN',
      USD: 'en-US',
      GBP: 'en-GB',
      EUR: 'de-DE',
      JPY: 'ja-JP',
      CAD: 'en-CA',
      AUD: 'en-AU',
      CHF: 'de-CH',
      CNY: 'zh-CN',
      NZD: 'en-NZ',
      SEK: 'sv-SE',
      NOK: 'nb-NO',
      DKK: 'da-DK',
      SGD: 'en-SG',
      HKD: 'en-HK',
      MXN: 'es-MX',
      BRL: 'pt-BR',
      ZAR: 'en-ZA',
      RUB: 'ru-RU',
      TRY: 'tr-TR',
      KRW: 'ko-KR',
      PLN: 'pl-PL',
    };

    const locale = localeMap[currency] || 'en-US';
    
    // For JPY and KRW, don't show decimal places
    const fractionDigits = (currency === 'JPY' || currency === 'KRW') ? 0 : 2;
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(amount);
  },
}));

