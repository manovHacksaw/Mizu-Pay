import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * POST /api/payments/fail
 * Mark a payment session as failed when payment attempt fails
 * 
 * Request body:
 * {
 *   sessionId: string,
 *   error?: string (optional error message)
 * }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId, error } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Find the session
    const session = await prisma.paymentSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    // Only update if session is still pending
    // Don't overwrite paid, fulfilled, or expired statuses
    if (session.status !== "pending") {
      return NextResponse.json({
        success: true,
        message: `Session is already ${session.status}, not updating to failed`,
        session: {
          id: session.id,
          status: session.status,
        },
      });
    }

    // Update session status to failed
    const updatedSession = await prisma.paymentSession.update({
      where: { id: sessionId },
      data: { status: "failed" },
    });

    console.log("Payment session marked as failed:", {
      sessionId: session.id,
      error: error || "No error message provided",
    });

    return NextResponse.json({
      success: true,
      session: {
        id: updatedSession.id,
        status: updatedSession.status,
      },
    });
  } catch (err) {
    console.error("PAYMENT FAIL ERROR:", err);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}

