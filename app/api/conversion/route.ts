import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const from = searchParams.get("from")?.toUpperCase() || "USD";
    const to = searchParams.get("to")?.toUpperCase() || "USD";
    
    if (from === to) {
      return NextResponse.json({
        from,
        to,
        rate: 1,
        converted: 1,
      });
    }

    // For USD/INR, use the existing exchange rate API
    if ((from === "USD" && to === "INR") || (from === "INR" && to === "USD")) {
      const response = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/USDINR=X?interval=1d&range=1d`,
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
      const currentRate = meta.regularMarketPrice ?? meta.previousClose ?? 0;
      
      // If converting from INR to USD, invert the rate
      const rate = from === "INR" ? 1 / currentRate : currentRate;
      
      return NextResponse.json({
        from,
        to,
        rate,
        source: "yahoo_finance",
      });
    }

    // For other currency pairs, use a generic conversion API
    // For now, return a mock rate for non-USD/INR pairs
    // In production, you'd use a service like exchangerate-api.com or similar
    return NextResponse.json({
      from,
      to,
      rate: 1, // Placeholder - implement actual conversion for other pairs
      note: "Conversion rate not available for this pair",
    });
  } catch (error) {
    console.error("CONVERSION ERROR:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch conversion rate",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}





