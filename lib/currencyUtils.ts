/**
 * Currency utility functions for formatting and conversion
 */

import { useCurrencyStore } from './currencyStore';

/**
 * Format an amount in USD and show converted amount below
 * Used in dashboard components
 */
export function formatAmountWithConversion(amountUSD: number) {
  const { selectedDisplayCurrency, convertUSDToUserCurrency, formatAmount } = useCurrencyStore.getState();
  
  const displayAmount = convertUSDToUserCurrency(amountUSD);
  const formattedDisplay = formatAmount(displayAmount, selectedDisplayCurrency);
  const formattedUSD = formatAmount(amountUSD, 'USD');
  
  return {
    display: formattedDisplay,
    usdEquivalent: formattedUSD,
    showUSDEquivalent: selectedDisplayCurrency !== 'USD',
  };
}

/**
 * Format crypto amount (convert to USD first, then to display currency)
 */
export function formatCryptoAmount(amount: number, token: 'CELO' | 'cUSD') {
  const { 
    convertCryptoToUSD, 
    convertUSDToUserCurrency, 
    selectedDisplayCurrency,
    formatAmount 
  } = useCurrencyStore.getState();
  
  const usdAmount = convertCryptoToUSD(amount, token);
  const displayAmount = convertUSDToUserCurrency(usdAmount);
  const formattedDisplay = formatAmount(displayAmount, selectedDisplayCurrency);
  const formattedUSD = formatAmount(usdAmount, 'USD');
  
  return {
    display: formattedDisplay,
    usdEquivalent: formattedUSD,
    showUSDEquivalent: selectedDisplayCurrency !== 'USD',
  };
}


