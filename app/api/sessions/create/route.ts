import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { giftCardId, walletAddress } = await req.json();

    if (!giftCardId || !walletAddress) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const giftCard = await prisma.giftCard.findUnique({
      where: { id: giftCardId },
    });

    if (!giftCard || giftCard.stock <= 0 || !giftCard.active) {
      return NextResponse.json({ error: "Gift card unavailable" }, { status: 400 });
    }

    // Find or create wallet by address
    let wallet = await prisma.wallet.findUnique({
      where: { address: walletAddress },
    });

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          address: walletAddress,
          type: "external",
        },
      });
    }

    // Get or create user (if wallet has userId, use it; otherwise create new user)
    let userId = wallet.userId;
    if (!userId) {
      const user = await prisma.user.create({
        data: {},
      });
      userId = user.id;
      // Update wallet with userId
      await prisma.wallet.update({
        where: { id: wallet.id },
        data: { userId },
      });
    }

    // Create session
    const session = await prisma.paymentSession.create({
      data: {
        userId,
        walletId: wallet.id,
        store: giftCard.store,
        amountUSD: giftCard.amountUSD,
        status: "pending",
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      payableAmountMinor: giftCard.amountMinor,
      amountUSD: giftCard.amountUSD,
    });
  } catch (err) {
    console.error("SESSION CREATE ERROR:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
