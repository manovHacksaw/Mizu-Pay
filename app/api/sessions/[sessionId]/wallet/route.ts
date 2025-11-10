import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * Update the active wallet for a payment session
 * This is called after the user selects a wallet and signs a gasless message
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const body = await req.json();
    const { walletAddress, signature, message } = body;

    if (!walletAddress || !signature || !message) {
      return NextResponse.json(
        { error: "Missing required fields: walletAddress, signature, message" },
        { status: 400 }
      );
    }

    // Find the session
    const session = await prisma.paymentSession.findUnique({
      where: { id: sessionId },
      include: { wallet: true, user: true },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Find or create wallet by address
    let wallet = await prisma.wallet.findUnique({
      where: { address: walletAddress },
    });

    if (!wallet) {
      // Determine wallet type based on whether it's linked to a user
      const walletType = session.userId ? "embedded" : "external";
      
      wallet = await prisma.wallet.create({
        data: {
          address: walletAddress,
          type: walletType,
          userId: session.userId || null,
        },
      });
    } else if (session.userId && !wallet.userId) {
      // Link wallet to user if not already linked
      wallet = await prisma.wallet.update({
        where: { id: wallet.id },
        data: { userId: session.userId },
      });
    }

    // Update session with new wallet
    const updatedSession = await prisma.paymentSession.update({
      where: { id: sessionId },
      data: {
        walletId: wallet.id,
      },
      include: {
        wallet: true,
        user: true,
      },
    });

    // Update user's activeWalletId
    if (session.userId) {
      await prisma.user.update({
        where: { id: session.userId },
        data: {
          activeWalletId: wallet.id,
        },
      });
    }

    console.log("Session wallet updated:", {
      sessionId,
      walletId: wallet.id,
      walletAddress,
      userId: session.userId,
    });

    return NextResponse.json({
      success: true,
      session: {
        id: updatedSession.id,
        walletId: updatedSession.walletId,
        walletAddress: updatedSession.wallet.address,
      },
    });
  } catch (error) {
    console.error("Error updating session wallet:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

