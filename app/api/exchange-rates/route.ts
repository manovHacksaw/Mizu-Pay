import { NextResponse } from 'next/server';

/**
 * GET /api/exchange-rates
 * Fetch exchange rates from CoinGecko API
 * Returns rates for CELO and cUSD in multiple currencies
 */
export async function GET() {
  try {
    // Fetch crypto rates (CELO and cUSD) in USD
    const cryptoResponse = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=celo,celo-dollar&vs_currencies=usd',
      {
        next: { revalidate: 60 }, // Cache for 60 seconds
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!cryptoResponse.ok) {
      throw new Error(`CoinGecko API error: ${cryptoResponse.status}`);
    }

    const cryptoData = await cryptoResponse.json();

    // Fetch USD to other currencies rates using a simple conversion API
    // Using exchangerate-api.com (free tier) or fallback to fixed rates
    let usdRates: Record<string, number> = {};
    try {
      const fiatResponse = await fetch(
        'https://api.exchangerate-api.com/v4/latest/USD',
        {
          next: { revalidate: 3600 }, // Cache for 1 hour
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (fiatResponse.ok) {
        const fiatData = await fiatResponse.json();
        const rates = fiatData.rates || {};
        
        // Extract rates for our supported currencies (convert to lowercase for consistency)
        const currencyCodes = ['inr', 'gbp', 'eur', 'jpy', 'cad', 'aud', 'chf', 'cny', 'nzd', 'sek', 'nok', 'dkk', 'sgd', 'hkd', 'mxn', 'brl', 'zar', 'rub', 'try', 'krw', 'pln'];
        currencyCodes.forEach(code => {
          const upperCode = code.toUpperCase();
          if (rates[upperCode]) {
            usdRates[code] = rates[upperCode];
          }
        });
      }
    } catch (fiatError) {
      console.warn('Failed to fetch fiat exchange rates, using fallback:', fiatError);
    }

    // Fallback rates if API fails
    const fallbackUsdRates: Record<string, number> = {
      inr: 83, gbp: 0.79, eur: 0.92, jpy: 150, cad: 1.35, aud: 1.52,
      chf: 0.88, cny: 7.2, nzd: 1.64, sek: 10.5, nok: 10.7, dkk: 6.85,
      sgd: 1.34, hkd: 7.8, mxn: 17, brl: 4.95, zar: 18.5, rub: 92,
      try: 32, krw: 1330, pln: 4.0,
    };

    return NextResponse.json({
      celo: {
        usd: cryptoData.celo?.usd || 0.5,
      },
      'celo-dollar': {
        usd: cryptoData['celo-dollar']?.usd || 1.0,
      },
      usd: Object.keys(usdRates).length > 0 ? usdRates : fallbackUsdRates,
    });
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    
    // Return fallback rates if API fails
    return NextResponse.json({
      celo: {
        usd: 0.5,
      },
      'celo-dollar': {
        usd: 1.0,
      },
      usd: {
        inr: 83, gbp: 0.79, eur: 0.92, jpy: 150, cad: 1.35, aud: 1.52,
        chf: 0.88, cny: 7.2, nzd: 1.64, sek: 10.5, nok: 10.7, dkk: 6.85,
        sgd: 1.34, hkd: 7.8, mxn: 17, brl: 4.95, zar: 18.5, rub: 92,
        try: 32, krw: 1330, pln: 4.0,
      },
    });
  }
}


