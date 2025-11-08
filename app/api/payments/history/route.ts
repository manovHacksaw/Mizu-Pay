import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * GET /api/payments/history
 * Get payment history for the authenticated user
 * Query params:
 *   - userId: User ID (optional, prefer this)
 *   - email: User email (optional, used if userId not provided)
 */
export async function GET(req: Request) {
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

    // Format the response
    const paymentHistory = sessions.map((session) => ({
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
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}

