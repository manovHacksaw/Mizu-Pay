import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { checkAndExpireSession } from "@/lib/sessionUtils";

// Load environment variables explicitly (helps in WSL/development)
let envLoaded = false;
if (typeof window === 'undefined' && !envLoaded) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const dotenv = require('dotenv');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require('path');
    // Load .env.local first (higher priority), then .env
    dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
    dotenv.config({ path: path.resolve(process.cwd(), '.env') });
    envLoaded = true;
  } catch (error) {
    // dotenv might not be available, that's okay - Next.js should handle it
    console.warn('Could not load dotenv manually (this is okay if Next.js loads it):', error);
  }
}

/**
 * GET /api/payments/history
 * Get payment history for the authenticated user
 * Query params:
 *   - userId: User ID (optional, prefer this)
 *   - email: User email (optional, used if userId not provided)
 */
export async function GET(req: Request) {
  console.log("PAYMENT HISTORY API - DATABASE_URL present:", !!process.env.DATABASE_URL);
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const email = searchParams.get("email");

    if (!userId && !email) {
      return NextResponse.json(
        { error: "User ID or email is required" },
        { status: 400 }
      );
    }

    // Find user by ID or email
    let user = null;
    if (userId) {
      user = await prisma.user.findUnique({ where: { id: userId } });
    } else if (email) {
      user = await prisma.user.findUnique({ where: { email } });
    }

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const finalUserId = user.id;

    // Fetch payment sessions with related data
    const sessions = await prisma.paymentSession.findMany({
      where: {
        userId: finalUserId,
      },
      include: {
        payment: {
          select: {
            id: true,
            txHash: true,
            amountCrypto: true,
            token: true,
            status: true,
            createdAt: true,
          },
        },
        giftCard: {
          select: {
            id: true,
            store: true,
            currency: true,
            amountUSD: true,
          },
        },
        wallet: {
          select: {
            address: true,
            type: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Check and expire any old pending sessions before returning
    // This ensures expired sessions are marked correctly
    for (const session of sessions) {
      if (session.status === "pending") {
        await checkAndExpireSession(session.id);
      }
    }

    // Re-fetch sessions to get updated statuses
    const updatedSessions = await prisma.paymentSession.findMany({
      where: {
        userId: finalUserId,
      },
      include: {
        payment: {
          select: {
            id: true,
            txHash: true,
            amountCrypto: true,
            token: true,
            status: true,
            createdAt: true,
          },
        },
        giftCard: {
          select: {
            id: true,
            store: true,
            currency: true,
            amountUSD: true,
          },
        },
        wallet: {
          select: {
            address: true,
            type: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Format the response
    const paymentHistory = updatedSessions.map((session) => ({
      sessionId: session.id,
      store: session.store,
      amountUSD: session.amountUSD,
      status: session.status,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
      payment: session.payment
        ? {
            txHash: session.payment.txHash,
            amountCrypto: session.payment.amountCrypto,
            token: session.payment.token,
            status: session.payment.status,
            createdAt: session.payment.createdAt,
          }
        : null,
      giftCard: session.giftCard
        ? {
            store: session.giftCard.store,
            currency: session.giftCard.currency,
            amountUSD: session.giftCard.amountUSD,
          }
        : null,
      wallet: session.wallet,
    }));

    return NextResponse.json({
      success: true,
      payments: paymentHistory,
      count: paymentHistory.length,
    });
  } catch (err) {
    console.error("PAYMENT HISTORY ERROR:", err);
    
    // Check for database connection errors
    const errorMessage = err instanceof Error ? err.message : String(err);
    const isConnectionError = 
      errorMessage.includes('P1001') || // Can't reach database server
      errorMessage.includes('P1000') || // Authentication failed
      errorMessage.includes('connection') ||
      errorMessage.includes('timeout') ||
      errorMessage.includes('ECONNREFUSED') ||
      errorMessage.includes('ENOTFOUND') ||
      errorMessage.includes("Can't reach database server");
    
    return NextResponse.json(
      {
        error: isConnectionError ? "Database connection error" : "Internal Server Error",
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      { status: 500 }
    );
  }
}

