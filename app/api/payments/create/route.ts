import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { checkAndExpireSession } from "@/lib/sessionUtils";
import { verifyPaymentTransaction } from "@/lib/paymentVerification";

/**
 * POST /api/payments/create
 * Create a Payment record when a blockchain transaction is successful
 * This endpoint should be called after a successful blockchain transaction
 * 
 * Request body:
 * {
 *   sessionId: string,
 *   txHash: string,
 *   amountCrypto: number,
 *   token: string (e.g., "cUSD", "CELO"),
 *   giftCardId: string (optional - gift card selected for this session)
 * }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId, txHash, amountCrypto, token, giftCardId } = body;

    // Validate required fields
    if (!sessionId || !txHash || amountCrypto === undefined || !token) {
      return NextResponse.json(
        { error: "Missing required fields: sessionId, txHash, amountCrypto, token" },
        { status: 400 }
      );
    }

    // Check and expire session if needed
    const session = await checkAndExpireSession(sessionId);

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Verify session is in pending status
    if (session.status !== "pending") {
      return NextResponse.json(
        { 
          error: `Session is not in pending status. Current status: ${session.status}`,
          currentStatus: session.status
        },
        { status: 400 }
      );
    }

    // Check if payment already exists for this session
    const existingPayment = await prisma.payment.findUnique({
      where: { sessionId },
    });

    if (existingPayment) {
      return NextResponse.json(
        { error: "Payment already exists for this session", paymentId: existingPayment.id },
        { status: 400 }
      );
    }

    // Get wallet and user from session
    const sessionWithDetails = await prisma.paymentSession.findUnique({
      where: { id: sessionId },
      include: {
        wallet: true,
        user: true,
      },
    });

    if (!sessionWithDetails) {
      return NextResponse.json({ error: "Session details not found" }, { status: 404 });
    }

    // Verify payment transaction before creating payment record

    const verificationResult = await verifyPaymentTransaction(
      txHash,
      sessionId,
      sessionWithDetails.wallet.address,
      amountCrypto
    );

    if (!verificationResult.verified) {
      return NextResponse.json(
        {
          error: "Payment verification failed",
          details: verificationResult.error,
          confirmations: verificationResult.confirmations,
        },
        { status: 400 }
      );
    }


    // If giftCardId is provided, assign it to the session and mark as inactive
    if (giftCardId) {
      // Verify gift card exists and is available
      const giftCard = await prisma.giftCard.findUnique({
        where: { id: giftCardId },
      });

      if (!giftCard) {
        return NextResponse.json(
          { error: "Gift card not found" },
          { status: 404 }
        );
      }

      if (!giftCard.active || giftCard.stock <= 0) {
        return NextResponse.json(
          { error: "Gift card is no longer available" },
          { status: 400 }
        );
      }

      // Use transaction to ensure atomicity
      const result = await prisma.$transaction(async (tx) => {
        // Create Payment record
        const payment = await tx.payment.create({
          data: {
            sessionId: session.id,
            walletId: sessionWithDetails.walletId,
            userId: sessionWithDetails.userId,
            amountCrypto: parseFloat(amountCrypto.toString()),
            token: token,
            txHash: txHash,
            status: "paid",
          },
        });

        // Update session: mark as paid and assign gift card
        // Try to include giftCardId, but handle case where migration hasn't been run
        let updatedSession;
        try {
          updatedSession = await tx.paymentSession.update({
            where: { id: sessionId },
            data: { 
              status: "paid",
              giftCardId: giftCardId,
            },
          });
        } catch (updateError: any) {
          // If giftCardId field doesn't exist (migration not run), update without it
          if (updateError.message?.includes('giftCardId') || updateError.code === 'P2009') {
            updatedSession = await tx.paymentSession.update({
              where: { id: sessionId },
              data: { 
                status: "paid",
              },
            });
          } else {
            throw updateError;
          }
        }

        // Mark gift card as inactive and decrement stock
        await tx.giftCard.update({
          where: { id: giftCardId },
          data: {
            active: false, // Mark as inactive so it's not used again
            stock: {
              decrement: 1,
            },
          },
        });

        return { payment, session: updatedSession };
      });

      // Payment made (details)
      console.log("Payment made:", {
        paymentId: result.payment.id,
        sessionId: session.id,
        giftCardId: giftCardId,
        txHash: txHash,
      });

      return NextResponse.json({
        success: true,
        payment: {
          id: result.payment.id,
          sessionId: result.payment.sessionId,
          txHash: result.payment.txHash,
          amountCrypto: result.payment.amountCrypto,
          token: result.payment.token,
          status: result.payment.status,
        },
        session: {
          id: result.session.id,
          status: result.session.status,
          giftCardId: result.session.giftCardId,
        },
      });
    }

    // If no giftCardId provided, just create payment (for backward compatibility)
    // Create Payment record
    const payment = await prisma.payment.create({
      data: {
        sessionId: session.id,
        walletId: sessionWithDetails.walletId,
        userId: sessionWithDetails.userId,
        amountCrypto: parseFloat(amountCrypto.toString()),
        token: token,
        txHash: txHash,
        status: "paid", // Payment is created only when transaction is successful
      },
    });

    // Update session status to "paid"
    const updatedSession = await prisma.paymentSession.update({
      where: { id: sessionId },
      data: { status: "paid" },
    });

    // Payment made (details)
    console.log("Payment made:", {
      paymentId: payment.id,
      sessionId: session.id,
      txHash: txHash,
      status: updatedSession.status,
    });

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        sessionId: payment.sessionId,
        txHash: payment.txHash,
        amountCrypto: payment.amountCrypto,
        token: payment.token,
        status: payment.status,
      },
      session: {
        id: updatedSession.id,
        status: updatedSession.status,
      },
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    const errorStack = err instanceof Error ? err.stack : undefined;
    
    // Check if it's a database schema error (migration not run)
    const isSchemaError = errorMessage.includes('giftCardId') || 
                         errorMessage.includes('Unknown column') ||
                         errorMessage.includes('column') && errorMessage.includes('does not exist');
    
    
    return NextResponse.json(
      {
        error: isSchemaError 
          ? "Database migration required. Please run: npx prisma migrate dev"
          : "Internal Server Error",
        details: errorMessage,
        // Include more details in development
        ...(process.env.NODE_ENV === 'development' && { 
          stack: errorStack,
          hint: isSchemaError ? "Run: npx prisma migrate dev --name add_gift_card_to_session && npx prisma generate" : undefined
        }),
      },
      { status: 500 }
    );
  }
}

