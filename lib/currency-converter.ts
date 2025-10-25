interface ExchangeRate {
  inr: number
  usd: number
  timestamp: number
}

interface CoinGeckoResponse {
  rates: {
    inr: { value: number }
    usd: { value: number }
  }
}

// Cache for exchange rates (5 minutes)
let rateCache: ExchangeRate | null = null
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds

/**
 * Fetches current exchange rates from CoinGecko API
 * @returns Promise<ExchangeRate> - Exchange rates for INR and USD
 */
async function fetchExchangeRates(): Promise<ExchangeRate> {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/exchange_rates')
    
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`)
    }
    
    const data: CoinGeckoResponse = await response.json()
    
    return {
      inr: data.rates.inr.value,
      usd: data.rates.usd.value,
      timestamp: Date.now()
    }
  } catch (error) {
    console.error('Error fetching exchange rates:', error)
    // Fallback to approximate rates if API fails
    return {
      inr: 1,
      usd: 0.012, // Approximate INR to USD rate
      timestamp: Date.now()
    }
  }
}

/**
 * Gets cached exchange rates or fetches new ones
 * @returns Promise<ExchangeRate> - Current exchange rates
 */
async function getExchangeRates(): Promise<ExchangeRate> {
  const now = Date.now()
  
  // Check if cache is valid
  if (rateCache && (now - rateCache.timestamp) < CACHE_DURATION) {
    return rateCache
  }
  
  // Fetch new rates
  const rates = await fetchExchangeRates()
  rateCache = rates
  return rates
}

/**
 * Converts INR amount to USD using real-time exchange rates
 * @param inrAmount - Amount in Indian Rupees
 * @returns Promise<number> - Amount in USD
 */
export async function convertINRToUSD(inrAmount: number): Promise<number> {
  try {
    const rates = await getExchangeRates()
    
    // Convert INR to USD using the exchange rate
    const usdAmount = inrAmount * (rates.usd / rates.inr)
    
    // Round to 2 decimal places
    return Math.round(usdAmount * 100) / 100
  } catch (error) {
    console.error('Error converting INR to USD:', error)
    // Fallback conversion (approximate rate)
    return Math.round(inrAmount * 0.012 * 100) / 100
  }
}

/**
 * Converts USD amount to INR using real-time exchange rates
 * @param usdAmount - Amount in US Dollars
 * @returns Promise<number> - Amount in INR
 */
export async function convertUSDToINR(usdAmount: number): Promise<number> {
  try {
    const rates = await getExchangeRates()
    
    // Convert USD to INR using the exchange rate
    const inrAmount = usdAmount * (rates.inr / rates.usd)
    
    // Round to 2 decimal places
    return Math.round(inrAmount * 100) / 100
  } catch (error) {
    console.error('Error converting USD to INR:', error)
    // Fallback conversion (approximate rate)
    return Math.round(usdAmount * 83.33 * 100) / 100
  }
}

/**
 * Gets the current exchange rate from INR to USD
 * @returns Promise<number> - Exchange rate (1 INR = X USD)
 */
export async function getINRToUSDRate(): Promise<number> {
  try {
    const rates = await getExchangeRates()
    return rates.usd / rates.inr
  } catch (error) {
    console.error('Error getting exchange rate:', error)
    return 0.012 // Fallback rate
  }
}

/**
 * Formats currency amount with proper symbols
 * @param amount - Amount to format
 * @param currency - Currency code (USD, INR)
 * @returns string - Formatted currency string
 */
export function formatCurrency(amount: number, currency: 'USD' | 'INR'): string {
  const symbol = currency === 'USD' ? '$' : '₹'
  return `${symbol}${amount.toFixed(2)}`
}
