import { NextResponse } from 'next/server';

/**
 * GET /api/celo-price-history
 * Fetch historical CELO price data from CoinGecko API
 * Query params: days (1, 7, or 30)
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const days = searchParams.get('days') || '7';
    
    // Validate days parameter
    const validDays = ['1', '7', '30'];
    if (!validDays.includes(days)) {
      return NextResponse.json(
        { error: 'Invalid days parameter. Must be 1, 7, or 30' },
        { status: 400 }
      );
    }

    // Fetch historical price data from CoinGecko
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/celo/market_chart?vs_currency=usd&days=${days}`,
      {
        next: { revalidate: 300 }, // Cache for 5 minutes
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();

    // Transform the data to our format
    // prices array contains [timestamp, price] pairs
    const prices = data.prices || [];
    const chartData = prices.map(([timestamp, price]: [number, number]) => ({
      timestamp,
      price,
      date: new Date(timestamp),
    }));

    return NextResponse.json({
      success: true,
      data: chartData,
      days: parseInt(days),
    });
  } catch (error) {
    console.error('Error fetching CELO price history:', error);
    
    // Return empty data on error
    return NextResponse.json({
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Failed to fetch price history',
    });
  }
}

