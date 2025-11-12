import nodemailer from 'nodemailer';

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

    console.log('Email transporter created');

    // Format amount based on currency
    const formatAmount = (amountUSD: number, currency: string) => {
      if (currency === 'INR') {
        return `₹${(amountUSD * 82).toFixed(2)}`; // Approximate conversion
      }
      return `$${amountUSD.toFixed(2)}`;
    };

    // Calculate expiry date
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + giftCardDetails.validityDays);
    const formattedExpiryDate = expiryDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Create email HTML
    const emailHTML = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your Gift Card Details</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
            }
          </style>
        </head>
        <body style="background-color: #f4f7f6; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
            
            <div style="padding: 24px 30px; border-bottom: 1px solid #e9ecef; background-color: #ffffff;">
              <h1 style="margin: 0; font-size: 20px; font-weight: 600; color: #111827;">Mizu Pay</h1>
            </div>
            
            <div style="padding: 30px;">
              <h2 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 600; color: #111827;">Your Gift Card Order is Complete</h2>
              <p style="font-size: 16px; color: #374151; margin-top: 0;">
                Thank you for your purchase. Here are the details for your <strong>${giftCardDetails.store}</strong> gift card.
              </p>
              
              <div style="background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 24px; margin: 24px 0;">
                
                <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #dee2e6; padding-bottom: 16px; margin-bottom: 20px;">
                  <div>
                    <p style="margin: 0; font-size: 14px; color: #6b7280;">Store</p>
                    <p style="margin: 4px 0 0 0; font-size: 18px; font-weight: 600; color: #111827;">
                      ${giftCardDetails.store}
                    </p>
                  </div>
                  <div style="text-align: right;">
                    <p style="margin: 0; font-size: 14px; color: #6b7280;">Amount</p>
                    <p style="margin: 4px 0 0 0; font-size: 18px; font-weight: 600; color: #111827;">
                      ${formatAmount(giftCardDetails.amountUSD, giftCardDetails.currency)}
                    </p>
                  </div>
                </div>
                
                <div style="margin-bottom: 16px;">
                  <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Gift Card Number</p>
                  <p style="margin: 0; font-size: 18px; font-weight: 600; font-family: 'Courier New', monospace; color: #111827; background: #ffffff; padding: 12px; border-radius: 4px; border: 1px solid #d1d5db;">
                    ${giftCardDetails.number}
                  </p>
                </div>
                
                <div>
                  <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">PIN</p>
                  <p style="margin: 0; font-size: 18px; font-weight: 600; font-family: 'Courier New', monospace; color: #111827; background: #ffffff; padding: 12px; border-radius: 4px; border: 1px solid #d1d5db;">
                    ${giftCardDetails.pin}
                  </p>
                </div>

                <p style="margin: 20px 0 0 0; font-size: 14px; color: #374151; text-align: center;">
                  <strong>Valid until:</strong> ${formattedExpiryDate}
                </p>
              </div>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef;">
                <h3 style="font-size: 16px; font-weight: 600; color: #111827; margin: 0 0 15px 0;">Transaction Summary</h3>
                <table style="width: 100%; font-size: 14px; color: #374151; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280;">Transaction Hash:</td>
                    <td style="padding: 8px 0; text-align: right; font-family: 'Courier New', monospace;">
                      <a href="https://celo-sepolia.blockscout.com/tx/${sessionDetails.txHash}" style="color: #0a58ca; text-decoration: none;">
                        ${sessionDetails.txHash.slice(0, 10)}...${sessionDetails.txHash.slice(-8)}
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280;">Amount Paid:</td>
                    <td style="padding: 8px 0; text-align: right; font-weight: 500;">
                      ${sessionDetails.amountCrypto.toFixed(4)} ${sessionDetails.token}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280;">Session ID:</td>
                    <td style="padding: 8px 0; text-align: right; font-family: 'Courier New', monospace;">
                      ${sessionDetails.sessionId.slice(0, 12)}...
                    </td>
                  </tr>
                </table>
              </div>
            </div>
            
            <div style="text-align: center; padding: 24px 30px; border-top: 1px solid #e9ecef; background-color: #f8f9fa;">
              <p style="font-size: 12px; color: #6b7280; margin: 0;">
                All transactions are secured and recorded on the blockchain.
              </p>
              <p style="font-size: 12px; color: #6b7280; margin: 5px 0 0 0;">
                © ${new Date().getFullYear()} Mizu Pay. All rights reserved.
              </p>
            </div>
            
          </div>
        </body>
      </html>
    `;

    // Send email
    console.log('Attempting to send email to:', userEmail);
    const mailOptions = {
      from: `"Mizu Pay" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `Your ${giftCardDetails.store} Gift Card Details`, // Updated subject
      html: emailHTML,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', {
      messageId: info.messageId,
      response: info.response,
      userEmail,
      sessionId: sessionDetails.sessionId,
    });

    return true;
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