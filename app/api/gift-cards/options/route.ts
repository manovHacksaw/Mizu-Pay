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
    // This maps detected store names to the exact names stored in the database
    const storeNameMap: Record<string, string> = {
        'amazon': 'Amazon',
        'amazon.in': 'Amazon',
        'amazon.com': 'Amazon',
        'flipkart': 'Flipkart',
        'flipkart.com': 'Flipkart',
        'myntra': 'Myntra',
        'myntra.com': 'Myntra',
        'makemytrip': 'Make My Trip', // Database stores "Make My Trip" with spaces
        'make my trip': 'Make My Trip',
        'make-my-trip': 'Make My Trip',
        'ajio': 'Ajio',
        'swiggy': 'Swiggy',
        'zomato': 'Zomato',
        'jiomart': 'JioMart',
        'tatacliq': 'Tata Cliq',
        // Handle common variations
        'place your order - amazon checkout': 'Amazon',
        'flipkart payments page': 'Flipkart',
        'payment': 'Myntra', // Common fallback for Myntra
    };

    // Normalize store name
    let normalizedStore = store.trim();
    const storeLower = normalizedStore.toLowerCase();
    
    // Check if we have a direct mapping for this store name
    if (storeNameMap[storeLower]) {
        normalizedStore = storeNameMap[storeLower];
    } else {
        // Try to find partial match (e.g., "makemytrip" contains "makemytrip")
        let foundMatch = false;
        for (const [key, value] of Object.entries(storeNameMap)) {
            // Check if store name contains the key or vice versa
            if (storeLower.includes(key) || key.includes(storeLower)) {
                normalizedStore = value;
                foundMatch = true;
                break;
            }
        }
        
        // If no match found, try to normalize common patterns
        if (!foundMatch) {
            // Handle "MakeMyTrip" -> "Make My Trip" pattern (camelCase to spaced)
            // Check for camelCase patterns like "MakeMyTrip"
            if (storeLower === 'makemytrip' || normalizedStore === 'MakeMyTrip' || storeLower.includes('makemytrip')) {
                normalizedStore = 'Make My Trip';
            } else {
                // Capitalize first letter as fallback
                normalizedStore = normalizedStore.charAt(0).toUpperCase() + normalizedStore.slice(1).toLowerCase();
            }
        }
    }
    
    // Debug logging
    console.log('Store normalization:', { original: store, normalized: normalizedStore, storeLower });
    
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
      // Check if store exists at all (even if no cards match the amount)
      const storeExists = await prisma.giftCard.findFirst({
        where: {
          store: normalizedStore,
          currency: normalizedCurrency,
          stock: { gt: 0 },
          active: true,
        },
        select: {
          store: true,
        },
      });
      
      // Also try case-insensitive check
      let storeExistsCaseInsensitive = false;
      if (!storeExists) {
        try {
          const rawResult = await prisma.$queryRaw<Array<{ store: string }>>`
            SELECT store
            FROM "GiftCard"
            WHERE LOWER(store) = LOWER(${normalizedStore})
              AND UPPER(currency) = ${normalizedCurrency}
              AND stock > 0
              AND active = true
            LIMIT 1
          `;
          storeExistsCaseInsensitive = rawResult.length > 0;
        } catch (e) {
          console.warn("Case-insensitive check failed:", e);
        }
      }
      
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
        amountUSD: amountMinor / 100,
        storeExists: !!storeExists || storeExistsCaseInsensitive
      });
      
      // If store exists but no cards match the amount, return empty array (not 404)
      // This allows the UI to show "store supported" even if no cards are available
      if (storeExists || storeExistsCaseInsensitive) {
        return NextResponse.json({
          store,
          currency,
          requestedAmountMinor: amountMinor,
          giftCards: [], // Empty array means store is supported but no cards match
        });
      }
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
