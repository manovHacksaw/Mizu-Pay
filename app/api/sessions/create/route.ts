import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { expireOldSessions } from "@/lib/sessionUtils";

export async function POST(req: Request) {
  console.log("API HIT SUCCESSFULLY - /api/sessions/create");
  
  // Verify database connection is available
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL environment variable is not set");
    return NextResponse.json(
      { error: "Database configuration error", details: "DATABASE_URL not configured" },
      { status: 500 }
    );
  }
  
  // Check if DATABASE_URL uses Supabase direct connection (port 5432) instead of pooler (port 6543)
  // For serverless, Supabase requires connection pooling
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl.includes('supabase.co:5432') && !dbUrl.includes('pooler')) {
    console.warn("⚠️ WARNING: Using Supabase direct connection (port 5432). For serverless (Vercel), use the connection pooler (port 6543) or transaction pooler URL from Supabase dashboard.");
  }
  
  try {
    const body = await req.json();
    console.log("Request body:", body);
    
    // Support two modes:
    // 1. With giftCardId (legacy/after gift card selection)
    // 2. With store, amount, currency (initial session creation)
    const { 
      giftCardId, 
      walletAddress, 
      userId, 
      privyUserId, 
      email,
      store,
      amount,
      currency,
      amountUSD // Optional: if provided, use it; otherwise calculate from amount/currency
    } = body;

    // Require walletAddress for session creation
    if (!walletAddress) {
      return NextResponse.json({ error: "Missing required field: walletAddress" }, { status: 400 });
    }

    let finalStore: string;
    let finalAmountUSD: number;

    // If giftCardId is provided, use it to get store and amountUSD
    if (giftCardId) {
      // Validate gift card
      const giftCard = await prisma.giftCard.findUnique({
        where: { id: giftCardId },
      });

      if (!giftCard || !giftCard.active || giftCard.reservedByPaymentId) {
        return NextResponse.json({ error: "Gift card unavailable" }, { status: 400 });
      }

      finalStore = giftCard.store;
      finalAmountUSD = giftCard.amountUSD;
    } else {
      // Create session without gift card (initial creation)
      if (!store || !amount || !currency) {
        return NextResponse.json({ error: "Missing required fields: store, amount, currency" }, { status: 400 });
      }

      finalStore = store;
      
      // Use provided amountUSD or calculate from amount/currency
      if (amountUSD) {
        finalAmountUSD = amountUSD;
      } else {
        // Default: assume amount is already in USD if currency is USD, otherwise need conversion
        // For now, if currency is USD, use amount directly; otherwise we'd need conversion API
        if (currency.toUpperCase() === 'USD') {
          finalAmountUSD = parseFloat(amount);
        } else {
          // If not USD, we'll need to fetch conversion rate or use provided amountUSD
          // For now, use amount as-is (should be provided via amountUSD parameter)
          finalAmountUSD = parseFloat(amount);
        }
      }
    }

    // Handle wallet and user setup
    let wallet = null;
    let finalUserId = userId;

    // Find or create wallet by address
    wallet = await prisma.wallet.findUnique({
      where: { address: walletAddress },
    });

    // Determine user ID - prefer userId (database ID), otherwise look up by email
    if (!finalUserId && email) {
      // Look up user by email (this is how users are synced from Privy)
      const userByEmail = await prisma.user.findUnique({
        where: { email },
      });
      if (userByEmail) {
        finalUserId = userByEmail.id;
      }
    }

    // If still no user ID, check if wallet has a userId
    if (!finalUserId && wallet && wallet.userId) {
      finalUserId = wallet.userId;
    }

    // Create wallet if it doesn't exist
    if (!wallet) {
      // Determine wallet type (embedded if privyUserId/userId provided, otherwise external)
      const walletType = (privyUserId || userId) ? "embedded" : "external";
      
      wallet = await prisma.wallet.create({
        data: {
          address: walletAddress,
          type: walletType,
          userId: finalUserId || null,
        },
      });
    } else if (finalUserId && !wallet.userId) {
      // Link wallet to user if not already linked
      wallet = await prisma.wallet.update({
        where: { id: wallet.id },
        data: { userId: finalUserId },
      });
    }

    // If still no user ID, create anonymous user as fallback
    if (!finalUserId) {
      const anonymousUser = await prisma.user.create({
        data: {},
      });
      finalUserId = anonymousUser.id;
      
      // Update wallet with userId if wallet exists
      if (wallet && !wallet.userId) {
        wallet = await prisma.wallet.update({
          where: { id: wallet.id },
          data: { userId: finalUserId },
        });
      }
    } else {
      // Verify user exists
      const userExists = await prisma.user.findUnique({
        where: { id: finalUserId },
      });
      
      if (!userExists) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
    }

    // Ensure wallet exists (should always be set at this point since walletAddress is required)
    if (!wallet) {
      return NextResponse.json({ error: "Failed to create or find wallet" }, { status: 500 });
    }

    // Clean up expired sessions before creating new one
    await expireOldSessions();

    // Check for recent duplicate session (within last 30 seconds) to prevent duplicates
    const thirtySecondsAgo = new Date(Date.now() - 30 * 1000);
    const recentSession = await prisma.paymentSession.findFirst({
      where: {
        userId: finalUserId,
        walletId: wallet.id,
        store: finalStore,
        amountUSD: finalAmountUSD,
        status: "pending",
        createdAt: {
          gte: thirtySecondsAgo,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // If a recent duplicate session exists, return it instead of creating a new one
    if (recentSession) {
      console.log("Duplicate session detected, returning existing session:", recentSession.id);
      const response: any = {
        sessionId: recentSession.id,
        amountUSD: finalAmountUSD,
        store: finalStore,
        expiresAt: recentSession.expiresAt?.toISOString(),
      };

      if (giftCardId) {
        const giftCard = await prisma.giftCard.findUnique({
          where: { id: giftCardId },
          select: { amountMinor: true, currency: true },
        });
        if (giftCard) {
          response.payableAmountMinor = giftCard.amountMinor;
          response.currency = giftCard.currency;
        }
      } else {
        response.currency = currency;
      }

      return NextResponse.json(response);
    }

    // Calculate expiration time (10 minutes from now)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Create session
    console.log("Creating session with:", { userId: finalUserId, walletId: wallet.id, store: finalStore, amountUSD: finalAmountUSD });
    
    const session = await prisma.paymentSession.create({
      data: {
        userId: finalUserId,
        walletId: wallet.id,
        store: finalStore,
        amountUSD: finalAmountUSD,
        status: "pending",
        expiresAt: expiresAt,
      },
    });

    console.log("Session created successfully:", session.id);
    
    const response: any = {
      sessionId: session.id,
      amountUSD: finalAmountUSD,
      store: finalStore,
      expiresAt: expiresAt.toISOString(),
    };

    // Include gift card details if giftCardId was provided
    if (giftCardId) {
      const giftCard = await prisma.giftCard.findUnique({
        where: { id: giftCardId },
        select: { amountMinor: true, currency: true },
      });
      if (giftCard) {
        response.payableAmountMinor = giftCard.amountMinor;
        response.currency = giftCard.currency;
      }
    } else {
      response.currency = currency;
    }
    
    console.log("Returning response:", response);
    return NextResponse.json(response);
  } catch (err) {
    console.error("SESSION CREATE ERROR:", err);
    
    // Check for common database connection errors
    const errorMessage = err instanceof Error ? err.message : String(err);
    const isConnectionError = 
      errorMessage.includes('P1001') || // Can't reach database server
      errorMessage.includes('P1000') || // Authentication failed
      errorMessage.includes('connection') ||
      errorMessage.includes('timeout') ||
      errorMessage.includes('ECONNREFUSED') ||
      errorMessage.includes('ENOTFOUND') ||
      errorMessage.includes("Can't reach database server");
    
    const isDatabaseError = isConnectionError || 
      errorMessage.includes('P2002') || // Unique constraint violation
      errorMessage.includes('P2003'); // Foreign key constraint
    
    let errorResponse: any = {
      error: isConnectionError ? "Database connection error" : isDatabaseError ? "Database error" : "Internal Server Error",
      details: errorMessage,
    };
    
    // Add helpful message for Supabase connection issues
    if (isConnectionError && process.env.DATABASE_URL?.includes('supabase.co:5432')) {
      errorResponse.hint = "For serverless deployments, use Supabase's connection pooler (port 6543) or transaction pooler URL instead of the direct connection (port 5432). Check your Supabase dashboard for the pooled connection string.";
    }
    
    // Include stack trace in development or if it's a known error type
    if (process.env.NODE_ENV === 'development' || isDatabaseError) {
      errorResponse.stack = err instanceof Error ? err.stack : undefined;
    }
    
    console.error("Returning error response:", errorResponse);
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
