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

    // List of known supported stores (fallback if database is not seeded)
    const knownSupportedStores = ['Myntra', 'Flipkart', 'Amazon', 'Make My Trip', 'Ajio', 'Tata Cliq'];
    const isKnownStore = knownSupportedStores.some(knownStore => 
      normalizedStore.toLowerCase() === knownStore.toLowerCase() ||
      knownStore.toLowerCase().includes(normalizedStore.toLowerCase()) ||
      normalizedStore.toLowerCase().includes(knownStore.toLowerCase())
    );

    // FIRST: Check if store exists at all (regardless of gift card availability)
    // This is important to show "store supported" even if no cards are available
    let storeExists = null;
    try {
      storeExists = await prisma.giftCard.findFirst({
        where: {
          store: normalizedStore,
          currency: normalizedCurrency,
          active: true,
          reservedByPaymentId: null,
        },
        select: {
          store: true,
        },
      });
      
      // Also try case-insensitive check if exact match fails
      if (!storeExists) {
        try {
          const rawResult = await prisma.$queryRaw<Array<{ store: string }>>`
            SELECT DISTINCT store
            FROM "GiftCard"
            WHERE LOWER(store) = LOWER(${normalizedStore})
              AND UPPER(currency) = ${normalizedCurrency}
              AND active = true
              AND "reservedByPaymentId" IS NULL
            LIMIT 1
          `;
          if (rawResult.length > 0) {
            storeExists = { store: rawResult[0].store };
            // Update normalized store to match the actual database value
            normalizedStore = rawResult[0].store;
          }
        } catch (e) {
          console.warn("Case-insensitive store check failed:", e);
        }
      }
    } catch (dbError) {
      console.warn("Database query failed, using fallback:", dbError);
      // If database query fails, check if it's a known store
      if (isKnownStore) {
        console.log(`✅ ${normalizedStore} is a known supported store (database unavailable, using fallback)`);
        // Return empty array but 200 status - store is supported
        return NextResponse.json({
          store: normalizedStore,
          currency: normalizedCurrency,
          requestedAmountMinor: amountMinor,
          giftCards: [], // Empty - database unavailable but store is known to be supported
          _fallback: true,
          _message: "Store is supported but database may need seeding"
        });
      }
    }

    // If store doesn't exist in database but is a known supported store, allow it
    if (!storeExists && isKnownStore) {
      console.log(`✅ ${normalizedStore} is a known supported store (not in database yet, but allowing)`);
      // Return empty array but 200 status - store is supported
      return NextResponse.json({
        store: normalizedStore,
        currency: normalizedCurrency,
        requestedAmountMinor: amountMinor,
        giftCards: [], // Empty - store supported but no cards available yet
        _fallback: true,
        _message: "Store is supported. Please seed the database to get gift cards."
      });
    }

    // If store doesn't exist at all, return 404
    if (!storeExists) {
      // Debug: Log all available stores to help diagnose
      let allStores: Array<{ store: string; currency: string }> = [];
      try {
        allStores = await prisma.giftCard.findMany({
          where: {
            active: true,
            reservedByPaymentId: null,
          },
          select: {
            store: true,
            currency: true,
          },
          distinct: ['store', 'currency'],
          take: 20,
        });
      } catch (e) {
        console.warn("Could not fetch available stores:", e);
      }
      
      console.log("DEBUG - Store not found. Available stores:", JSON.stringify(allStores, null, 2));
      console.log("DEBUG - Requested:", { 
        originalStore: store,
        normalizedStore: normalizedStore, 
        currency: normalizedCurrency
      });
      
      // If no stores exist at all, the database might not be seeded
      if (allStores.length === 0) {
        console.warn("⚠️ No gift cards found in database. Database may need to be seeded.");
        console.warn("Run: bun prisma/seed.ts (requires ENCRYPTION_SECRET in .env)");
      }
      
      return NextResponse.json(
        { 
          error: "Store not found",
          details: {
            store,
            normalizedStore,
            currency: normalizedCurrency,
            availableStores: allStores.map(s => `${s.store} (${s.currency})`),
            databaseSeeded: allStores.length > 0
          }
        },
        { status: 404 }
      );
    }

    // Store exists - now find matching gift cards
    // Try exact match first (case-sensitive)
    let giftCards = await prisma.giftCard.findMany({
      where: {
        store: normalizedStore,
        currency: normalizedCurrency,
        amountMinor: { gte: amountMinor },
        active: true,
        reservedByPaymentId: null, // Only show unreserved cards
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
            AND active = true
            AND "reservedByPaymentId" IS NULL
          ORDER BY "amountMinor" ASC
        `;
        giftCards = rawResults;
      } catch (rawError) {
        // If raw query fails, log for debugging
        console.warn("Raw query failed:", rawError);
      }
    }

    // Store exists - return results (even if empty array)
    // Empty array means store is supported but no cards match the amount
    return NextResponse.json({
      store: normalizedStore,
      currency: normalizedCurrency,
      requestedAmountMinor: amountMinor,
      giftCards, // Can be empty array - that's OK, store is still supported
    });
  } catch (err) {
    console.error("GIFT CARD OPTIONS ERROR:", err);
    
    const errorMessage = err instanceof Error ? err.message : String(err);
    const isConnectionError = 
      errorMessage.includes('P1001') || // Can't reach database server
      errorMessage.includes('P1000') || // Authentication failed
      errorMessage.includes('connection') ||
      errorMessage.includes('timeout') ||
      errorMessage.includes('ECONNREFUSED') ||
      errorMessage.includes('ENOTFOUND') ||
      errorMessage.includes("Can't reach database server") ||
      errorMessage.includes('DATABASE_URL');
    
    // If it's a database connection error, return 200 with empty array instead of 500
    // This prevents the UI from showing "Store Not Supported" when it's just a DB issue
    if (isConnectionError) {
      console.warn("Database connection error - returning empty result to prevent false 'Store Not Supported' error");
      return NextResponse.json({
        store: store || 'Unknown',
        currency: currency || 'INR',
        requestedAmountMinor: Math.round(parseFloat(amount || "0") * 100),
        giftCards: [], // Empty array - store might be supported but DB is unavailable
        _warning: "Database connection issue - cannot verify store support"
      }, { status: 200 });
    }
    
    return NextResponse.json({ 
      error: "Internal Server Error",
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    }, { status: 500 });
  }
}
