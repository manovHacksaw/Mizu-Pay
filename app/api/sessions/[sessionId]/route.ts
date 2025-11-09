import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { checkAndExpireSession } from "@/lib/sessionUtils";

/**
 * GET /api/sessions/[sessionId]
 * Get session details and check expiration
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    // Check and expire session if needed
    const session = await checkAndExpireSession(sessionId);

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Get wallet and user details
    const sessionWithDetails = await prisma.paymentSession.findUnique({
      where: { id: sessionId },
      include: {
        wallet: {
          select: {
            address: true,
            type: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      status: session.status,
      store: session.store,
      amountUSD: session.amountUSD,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
      wallet: sessionWithDetails?.wallet,
      user: sessionWithDetails?.user,
      expired: session.status === "expired" || session.status === "failed",
    });
  } catch (err) {
    console.error("SESSION GET ERROR:", err);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}

