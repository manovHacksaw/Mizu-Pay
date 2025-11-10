import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { checkAndExpireSession } from "@/lib/sessionUtils";
import { verifyPaymentTransaction } from "@/lib/paymentVerification";
import { decrypt } from "@/lib/giftCardUtils";
import { sendGiftCardEmail } from "@/lib/emailService";

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

    // PHASE 1: Reserve gift card (if giftCardId provided)
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

      // Check if gift card is available (active and not reserved)
      if (!giftCard.active || giftCard.reservedByPaymentId) {
        return NextResponse.json(
          { error: "Gift card is no longer available" },
          { status: 400 }
        );
      }

      // Phase 1 Transaction: Reserve gift card (don't consume yet)
      const phase1Result = await prisma.$transaction(async (tx) => {
        // Create Payment record with status 'confirming'
        const payment = await tx.payment.create({
          data: {
            sessionId: session.id,
            walletId: sessionWithDetails.walletId,
            userId: sessionWithDetails.userId,
            amountCrypto: parseFloat(amountCrypto.toString()),
            token: token,
            txHash: txHash,
            status: "confirming",
          },
        });

        // Update session status to 'paid'
        const updatedSession = await tx.paymentSession.update({
          where: { id: sessionId },
          data: { 
            status: "paid",
            giftCardId: giftCardId,
          },
        });

        // Reserve gift card (set reservedByPaymentId and reservedAt)
        await tx.giftCard.update({
          where: { id: giftCardId },
          data: {
            reservedByPaymentId: payment.id,
            reservedAt: new Date(),
          },
        });

        return { payment, session: updatedSession, giftCard };
      });

      // PHASE 2: Decrypt → Email → Consume (only if email succeeds)
      try {
        // Step 1: Check user email (MUST exist)
        const userEmail = sessionWithDetails.user.email;
        if (!userEmail) {
          // Release reservation and fail
          await prisma.$transaction(async (tx) => {
            await tx.payment.update({
              where: { id: phase1Result.payment.id },
              data: { status: "failed" },
            });
            await tx.paymentSession.update({
              where: { id: sessionId },
              data: { status: "failed" },
            });
            await tx.giftCard.update({
              where: { id: giftCardId },
              data: {
                reservedByPaymentId: null,
                reservedAt: null,
              },
            });
          });

          return NextResponse.json(
            { error: "Missing email" },
            { status: 400 }
          );
        }

        // Step 2: Decrypt gift card (throws on failure)
        let decryptedNumber: string;
        let decryptedPin: string;
        try {
          decryptedNumber = decrypt(
            phase1Result.giftCard.encryptedNumber,
            phase1Result.giftCard.iv,
            phase1Result.giftCard.tag
          );
          decryptedPin = decrypt(
            phase1Result.giftCard.encryptedPin,
            phase1Result.giftCard.iv,
            phase1Result.giftCard.tag
          );
        } catch (decryptError) {
          // Release reservation and fail
          await prisma.$transaction(async (tx) => {
            await tx.payment.update({
              where: { id: phase1Result.payment.id },
              data: { status: "failed" },
            });
            await tx.paymentSession.update({
              where: { id: sessionId },
              data: { status: "failed" },
            });
            await tx.giftCard.update({
              where: { id: giftCardId },
              data: {
                reservedByPaymentId: null,
                reservedAt: null,
              },
            });
          });

          // Log only IDs, never decrypted data
          console.error("Decryption failed:", {
            paymentId: phase1Result.payment.id,
            sessionId: sessionId,
            giftCardId: giftCardId,
          });

          return NextResponse.json(
            { error: "Decryption failed" },
            { status: 500 }
          );
        }

        // Step 3: Send email
        const emailSent = await sendGiftCardEmail(
          userEmail,
          {
            number: decryptedNumber,
            pin: decryptedPin,
            store: phase1Result.giftCard.store,
            currency: phase1Result.giftCard.currency,
            amountUSD: phase1Result.giftCard.amountUSD,
            validityDays: phase1Result.giftCard.validityDays,
          },
          {
            sessionId: sessionId,
            txHash: txHash,
            amountCrypto: parseFloat(amountCrypto.toString()),
            token: token,
          }
        );

        if (!emailSent) {
          // Email failed - release reservation, set status to email_failed
          await prisma.$transaction(async (tx) => {
            await tx.payment.update({
              where: { id: phase1Result.payment.id },
              data: { status: "email_failed" },
            });
            await tx.paymentSession.update({
              where: { id: sessionId },
              data: { status: "email_failed" },
            });
            await tx.giftCard.update({
              where: { id: giftCardId },
              data: {
                reservedByPaymentId: null,
                reservedAt: null,
              },
            });
          });

          // Log only IDs
          console.error("Email send failed:", {
            paymentId: phase1Result.payment.id,
            sessionId: sessionId,
            giftCardId: giftCardId,
            userId: sessionWithDetails.userId,
          });

          return NextResponse.json(
            { 
              error: "Email failed",
              message: "Payment verified but email delivery failed. Please contact support for gift card details.",
            },
            { status: 502 }
          );
        }

        // Step 4: Email succeeded - consume gift card and mark as fulfilled
        const finalResult = await prisma.$transaction(async (tx) => {
          // Consume gift card (set active=false, clear reservation)
          await tx.giftCard.update({
            where: { id: giftCardId },
            data: {
              active: false,
              reservedByPaymentId: null,
              reservedAt: null,
            },
          });

          // Update payment status to 'succeeded'
          const updatedPayment = await tx.payment.update({
            where: { id: phase1Result.payment.id },
            data: { status: "succeeded" },
          });

          // Update session status to 'fulfilled'
          const updatedSession = await tx.paymentSession.update({
            where: { id: sessionId },
            data: { status: "fulfilled" },
          });

          return { payment: updatedPayment, session: updatedSession };
        });

        // Log only IDs and hashes (never decrypted data)
        console.log("Payment fulfilled:", {
          paymentId: finalResult.payment.id,
          sessionId: sessionId,
          giftCardId: giftCardId,
          userId: sessionWithDetails.userId,
          txHash: txHash,
        });

        return NextResponse.json({
          success: true,
          payment: {
            id: finalResult.payment.id,
            sessionId: finalResult.payment.sessionId,
            txHash: finalResult.payment.txHash,
            amountCrypto: finalResult.payment.amountCrypto,
            token: finalResult.payment.token,
            status: finalResult.payment.status,
          },
          session: {
            id: finalResult.session.id,
            status: finalResult.session.status,
            giftCardId: finalResult.session.giftCardId,
          },
        });
      } catch (phase2Error) {
        // Unexpected error in phase 2 - release reservation
        await prisma.$transaction(async (tx) => {
          await tx.payment.update({
            where: { id: phase1Result.payment.id },
            data: { status: "failed" },
          });
          await tx.paymentSession.update({
            where: { id: sessionId },
            data: { status: "failed" },
          });
          await tx.giftCard.update({
            where: { id: giftCardId },
            data: {
              reservedByPaymentId: null,
              reservedAt: null,
            },
          });
        });

        // Log only IDs
        console.error("Phase 2 error:", {
          paymentId: phase1Result.payment.id,
          sessionId: sessionId,
          giftCardId: giftCardId,
          userId: sessionWithDetails.userId,
        });

        return NextResponse.json(
          { error: "Internal Server Error" },
          { status: 500 }
        );
      }
    }

    // If no giftCardId provided, just create payment (for backward compatibility)
    // Create Payment record with status 'succeeded' (no gift card to fulfill)
    const payment = await prisma.payment.create({
      data: {
        sessionId: session.id,
        walletId: sessionWithDetails.walletId,
        userId: sessionWithDetails.userId,
        amountCrypto: parseFloat(amountCrypto.toString()),
        token: token,
        txHash: txHash,
        status: "succeeded",
      },
    });

    // Update session status to "paid"
    const updatedSession = await prisma.paymentSession.update({
      where: { id: sessionId },
      data: { status: "paid" },
    });

    // Log only IDs and hashes
    console.log("Payment made:", {
      paymentId: payment.id,
      sessionId: session.id,
      userId: sessionWithDetails.userId,
      txHash: txHash,
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

