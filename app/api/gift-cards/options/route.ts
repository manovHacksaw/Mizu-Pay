import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const amount = searchParams.get("amount");
    const currency = searchParams.get("currency");
    const store = searchParams.get("store");

    if (!amount || !currency || !store) {
      return NextResponse.json({ 
        error: "Missing fields",
        details: { amount: !!amount, currency: !!currency, store: !!store }
      }, { status: 400 });
    }

    const amountMinor = Math.round(parseFloat(amount || "0") * 100);

    // Store name normalization map (common variations -> canonical name)
    const storeNameMap: Record<string, string> = {
        'amazon': 'Amazon',
        'amazon.in': 'Amazon',
        'amazon.com': 'Amazon',
        'flipkart': 'Flipkart',
        'flipkart.com': 'Flipkart',
        'myntra': 'Myntra',
        'myntra.com': 'Myntra',
        // Handle common variations
        'place your order - amazon checkout': 'Amazon',
        'flipkart payments page': 'Flipkart',
        'payment': 'Myntra', // Common fallback for Myntra
    };

    // Normalize store name
    let normalizedStore = store.trim();
    const storeLower = normalizedStore.toLowerCase();
    
    // Check if we have a mapping for this store name
    if (storeNameMap[storeLower]) {
        normalizedStore = storeNameMap[storeLower];
    } else {
        // Try to find partial match
        for (const [key, value] of Object.entries(storeNameMap)) {
            if (storeLower.includes(key) || key.includes(storeLower)) {
                normalizedStore = value;
                break;
            }
        }
        // If no match found, capitalize first letter
        if (normalizedStore === store.trim()) {
            normalizedStore = normalizedStore.charAt(0).toUpperCase() + normalizedStore.slice(1).toLowerCase();
        }
    }
    
    const normalizedCurrency = currency.trim().toUpperCase();

    // Try exact match first (case-sensitive)
    let giftCards = await prisma.giftCard.findMany({
      where: {
        store: normalizedStore,
        currency: normalizedCurrency,
        amountMinor: { gte: amountMinor },
        stock: { gt: 0 },
        active: true,
      },
      orderBy: { amountMinor: "asc" },
      select: {
        id: true,
        amountMinor: true,
        amountUSD: true,
        validityDays: true,
      },
    });

    // If no exact match, try case-insensitive using raw SQL (PostgreSQL)
    if (giftCards.length === 0) {
      try {
        const rawResults = await prisma.$queryRaw<Array<{
          id: string;
          amountMinor: number;
          amountUSD: number;
          validityDays: number;
        }>>`
          SELECT id, "amountMinor", "amountUSD", "validityDays"
          FROM "GiftCard"
          WHERE LOWER(store) = LOWER(${normalizedStore})
            AND UPPER(currency) = ${normalizedCurrency}
            AND "amountMinor" >= ${amountMinor}
            AND stock > 0
            AND active = true
          ORDER BY "amountMinor" ASC
        `;
        giftCards = rawResults;
      } catch (rawError) {
        // If raw query fails, log for debugging
        console.warn("Raw query failed:", rawError);
      }
    }

    // Debug: Log available gift cards if no match found
    if (giftCards.length === 0) {
      const allCards = await prisma.giftCard.findMany({
        where: {
          stock: { gt: 0 },
          active: true,
        },
        select: {
          store: true,
          currency: true,
          amountMinor: true,
        },
        take: 10,
      });
      
      console.log("DEBUG - Available gift cards:", JSON.stringify(allCards, null, 2));
      console.log("DEBUG - Requested:", { 
        originalStore: store,
        normalizedStore: normalizedStore, 
        currency: normalizedCurrency, 
        amountMinor,
        amountUSD: amountMinor / 100
      });
    }

    if (giftCards.length === 0) {
      return NextResponse.json(
        { 
          error: "No matching gift cards available",
          details: {
            store,
            currency,
            requestedAmountMinor: amountMinor,
            requestedAmountUSD: amountMinor / 100
          }
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      store,
      currency,
      requestedAmountMinor: amountMinor,
      giftCards,
    });
  } catch (err) {
    console.error("GIFT CARD OPTIONS ERROR:", err);
    return NextResponse.json({ 
      error: "Internal Server Error",
      details: err instanceof Error ? err.message : String(err)
    }, { status: 500 });
  }
}
