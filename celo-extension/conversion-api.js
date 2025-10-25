// CELO Pay Extension - Currency Conversion API
// Handles currency conversion and CELO/cUSD calculations

console.log('CELO Pay Extension: Conversion API loaded');

// Configuration
const CONVERSION_CONFIG = {
  // Default exchange rates (fallback when API fails)
  fallbackRates: {
    'USD': 1.0,
    'EUR': 0.85,
    'GBP': 0.73,
    'CAD': 1.25,
    'AUD': 1.35,
    'JPY': 110.0,
    'INR': 75.0
  },
  
  // CELO price assumptions (for MVP)
  celoPriceUSD: 0.50, // $0.50 per CELO
  cusdPriceUSD: 1.00, // $1.00 per cUSD (stablecoin)
  
  // API endpoints (with fallbacks)
  apis: [
    'https://api.exchangerate-api.com/v4/latest/',
    'https://api.fixer.io/latest',
    'https://api.currencylayer.com/live'
  ]
};

// Convert amount from one currency to another
async function convertCurrency(fromCurrency, toCurrency, amount) {
  try {
    console.log(`CELO Pay Extension: Converting ${amount} ${fromCurrency} to ${toCurrency}`);
    
    // If same currency, return original amount
    if (fromCurrency === toCurrency) {
      return parseFloat(amount);
    }
    
    // Get conversion rate
    const rate = await getConversionRate(fromCurrency, toCurrency);
    
    if (rate && rate.rate) {
      const convertedAmount = parseFloat(amount) * rate.rate;
      console.log(`CELO Pay Extension: Conversion result: ${convertedAmount} ${toCurrency}`);
      return convertedAmount;
    } else {
      throw new Error('Failed to get conversion rate');
    }
  } catch (error) {
    console.error('CELO Pay Extension: Currency conversion error', error);
    return parseFloat(amount); // Return original amount as fallback
  }
}

// Get conversion rate between currencies
async function getConversionRate(fromCurrency, toCurrency) {
  try {
    // Try multiple API endpoints
    for (const apiUrl of CONVERSION_CONFIG.apis) {
      try {
        const rate = await fetchConversionRate(apiUrl, fromCurrency, toCurrency);
        if (rate) {
          return rate;
        }
      } catch (error) {
        console.warn(`CELO Pay Extension: API ${apiUrl} failed:`, error);
        continue;
      }
    }
    
    // Fallback to hardcoded rates
    console.log('CELO Pay Extension: Using fallback rates');
    return getFallbackRate(fromCurrency, toCurrency);
  } catch (error) {
    console.error('CELO Pay Extension: All conversion APIs failed', error);
    return getFallbackRate(fromCurrency, toCurrency);
  }
}

// Fetch conversion rate from API
async function fetchConversionRate(apiUrl, fromCurrency, toCurrency) {
  try {
    const response = await fetch(`${apiUrl}${fromCurrency}`);
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.rates && data.rates[toCurrency]) {
      return {
        rate: data.rates[toCurrency],
        timestamp: Date.now(),
        source: 'api'
      };
    } else {
      throw new Error(`Rate not found for ${fromCurrency} to ${toCurrency}`);
    }
  } catch (error) {
    throw new Error(`API fetch failed: ${error.message}`);
  }
}

// Get fallback conversion rate
function getFallbackRate(fromCurrency, toCurrency) {
  const rates = CONVERSION_CONFIG.fallbackRates;
  
  if (rates[fromCurrency] && rates[toCurrency]) {
    const rate = rates[toCurrency] / rates[fromCurrency];
    return {
      rate: rate,
      timestamp: Date.now(),
      source: 'fallback'
    };
  }
  
  // Default to 1:1 if currencies not found
  return {
    rate: 1.0,
    timestamp: Date.now(),
    source: 'default'
  };
}

// Calculate CELO and cUSD amounts from USD amount
function calculateCeloAmounts(usdAmount) {
  const usd = parseFloat(usdAmount);
  
  return {
    celoAmount: (usd / CONVERSION_CONFIG.celoPriceUSD).toFixed(4),
    cusdAmount: usd.toFixed(2),
    celoPrice: CONVERSION_CONFIG.celoPriceUSD,
    cusdPrice: CONVERSION_CONFIG.cusdPriceUSD
  };
}

// Get comprehensive conversion data
async function getConversionData(amount, currency) {
  try {
    console.log(`CELO Pay Extension: Getting conversion data for ${amount} ${currency}`);
    
    // Convert to USD first
    const usdAmount = await convertCurrency(currency, 'USD', amount);
    
    // Calculate CELO amounts
    const celoAmounts = calculateCeloAmounts(usdAmount);
    
    // Get current conversion rate
    const conversionRate = await getConversionRate(currency, 'USD');
    
    return {
      originalAmount: parseFloat(amount),
      originalCurrency: currency,
      usdAmount: usdAmount.toFixed(2),
      celoAmount: celoAmounts.celoAmount,
      cusdAmount: celoAmounts.cusdAmount,
      conversionRate: conversionRate.rate,
      rateSource: conversionRate.source,
      timestamp: Date.now()
    };
  } catch (error) {
    console.error('CELO Pay Extension: Error getting conversion data', error);
    
    // Return fallback data
    return {
      originalAmount: parseFloat(amount),
      originalCurrency: currency,
      usdAmount: amount,
      celoAmount: (parseFloat(amount) / CONVERSION_CONFIG.celoPriceUSD).toFixed(4),
      cusdAmount: amount,
      conversionRate: 1.0,
      rateSource: 'fallback',
      timestamp: Date.now(),
      error: error.message
    };
  }
}

// Format currency for display
function formatCurrency(amount, currency) {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  return formatter.format(amount);
}

// Format CELO amount for display
function formatCeloAmount(amount) {
  return `${parseFloat(amount).toFixed(4)} CELO`;
}

// Format cUSD amount for display
function formatCusdAmount(amount) {
  return `${parseFloat(amount).toFixed(2)} cUSD`;
}

// Export functions for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    convertCurrency,
    getConversionRate,
    getConversionData,
    calculateCeloAmounts,
    formatCurrency,
    formatCeloAmount,
    formatCusdAmount
  };
}
