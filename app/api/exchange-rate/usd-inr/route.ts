import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const interval = searchParams.get("interval") || "1d"; // 1d, 5d, 1mo, 3mo, 6mo, 1y
    
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/USDINR=X?interval=${interval}&range=1mo`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Yahoo Finance API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.chart || !data.chart.result || data.chart.result.length === 0) {
      throw new Error("No data received from Yahoo Finance");
    }

    const result = data.chart.result[0];
    const meta = result.meta;
    const timestamps = result.timestamp || [];
    const prices = result.indicators?.quote?.[0]?.close || [];

    // Filter out null values and create chart data
    // Only include prices that are valid numbers and within reasonable range (50-150 for USD/INR)
    const chartData = timestamps
      .map((timestamp: number, index: number) => ({
        time: timestamp * 1000, // Convert to milliseconds
        price: prices[index],
      }))
      .filter((item: { time: number; price: number | null }) => {
        const price = item.price;
        return price !== null && 
               typeof price === 'number' && 
               !isNaN(price) && 
               price > 50 && 
               price < 150; // Reasonable range for USD/INR
      })
      .slice(-30); // Last 30 data points for cleaner chart

    const currentRate = meta.regularMarketPrice ?? meta.previousClose ?? 0;
    const previousClose = meta.previousClose ?? currentRate;
    const change = currentRate - previousClose;
    const changePercent = previousClose !== 0 ? ((change / previousClose) * 100) : 0;

    return NextResponse.json({
      currentRate,
      previousClose,
      change,
      changePercent,
      chartData,
      meta: {
        currency: meta.currency,
        symbol: meta.symbol,
        exchangeName: meta.exchangeName,
        regularMarketTime: meta.regularMarketTime,
      },
    });
  } catch (error) {
    console.error("EXCHANGE RATE ERROR:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch exchange rate",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

