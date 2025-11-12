import nodemailer from 'nodemailer';
import {
  getPaymentInitializationEmail,
  getGiftCardOrderCompleteEmail,
  getPaymentSessionExpiredEmail,
  getWalletDepositConfirmationEmail,
  getTransactionConfirmationEmail,
  getWalletWithdrawalConfirmationEmail,
  getPaymentFailedEmail,
} from './emailTemplates';

interface GiftCardDetails {
  number: string;
  pin: string;
  store: string;
  currency: string;
  amountUSD: number;
  validityDays: number;
}

interface SessionDetails {
  sessionId: string;
  txHash: string;
  amountCrypto: number;
  token: string;
}

/**
 * Get or create email transporter
 */
function getEmailTransporter() {
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_PORT || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

/**
 * Generic email sending function
 */
async function sendEmail(
  userEmail: string,
  subject: string,
  html: string
): Promise<boolean> {
  try {
    const transporter = getEmailTransporter();
    if (!transporter) {
      console.error('Email configuration missing');
      return false;
    }

    const mailOptions = {
      from: `"Mizu Pay" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', {
      messageId: info.messageId,
      userEmail,
      subject,
    });

    return true;
  } catch (error) {
    console.error('Error sending email:', {
      error: error instanceof Error ? error.message : String(error),
      userEmail,
      subject,
    });
    return false;
  }
}

/**
 * Send gift card email to user
 * * @param userEmail - Recipient email address
 * @param giftCardDetails - Decrypted gift card information
 * @param sessionDetails - Payment session details
 * @returns Promise<boolean> - true if email sent successfully, false otherwise
 */
export async function sendGiftCardEmail(
  userEmail: string,
  giftCardDetails: GiftCardDetails,
  sessionDetails: SessionDetails
): Promise<boolean> {
  console.log('Email sending started:', {
    userEmail,
    sessionId: sessionDetails.sessionId,
    txHash: sessionDetails.txHash,
    store: giftCardDetails.store,
    amountUSD: giftCardDetails.amountUSD,
  });

  try {
    // Validate email configuration
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_PORT || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('Email configuration missing:', {
        EMAIL_HOST: !!process.env.EMAIL_HOST,
        EMAIL_PORT: !!process.env.EMAIL_PORT,
        EMAIL_USER: !!process.env.EMAIL_USER,
        EMAIL_PASS: !!process.env.EMAIL_PASS,
      });
      return false;
    }

    console.log('Email configuration validated:', {
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      user: process.env.EMAIL_USER,
    });

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Calculate expiry date
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + giftCardDetails.validityDays);
    const formattedExpiryDate = expiryDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Use template from emailTemplates.ts
    const emailHTML = getGiftCardOrderCompleteEmail({
      store: giftCardDetails.store,
      currency: giftCardDetails.currency,
      amountUSD: giftCardDetails.amountUSD,
      giftCardNumber: giftCardDetails.number,
      pin: giftCardDetails.pin,
      validUntil: formattedExpiryDate,
    });

    return await sendEmail(
      userEmail,
      `Your ${giftCardDetails.store} Gift Card Details`,
      emailHTML
    );
  } catch (error) {
    console.error('Error sending gift card email:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      code: (error as any)?.code,
      command: (error as any)?.command,
      response: (error as any)?.response,
      userEmail,
      sessionId: sessionDetails.sessionId,
    });
    return false;
  }
}