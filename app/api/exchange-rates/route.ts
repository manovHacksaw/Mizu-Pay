import { NextResponse } from 'next/server';

/**
 * GET /api/exchange-rates
 * Fetch exchange rates from CoinGecko API
 * Returns rates for CELO and cUSD in USD and INR
 */
export async function GET() {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=celo,celo-dollar&vs_currencies=usd,inr',
      {
        next: { revalidate: 60 }, // Cache for 60 seconds
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    
    // Return fallback rates if API fails
    return NextResponse.json({
      celo: {
        usd: 0.5, // Approximate fallback
        inr: 41.5,
      },
      'celo-dollar': {
        usd: 1.0,
        inr: 83.0, // Approximate fallback
      },
    });
  }
}


