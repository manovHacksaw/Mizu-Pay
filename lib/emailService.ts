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
 * 
 * @param userEmail - Recipient email address
 * @param giftCardDetails - Decrypted gift card information
 * @param sessionDetails - Payment session details
 * @returns Promise<boolean> - true if email sent successfully, false otherwise
 */
export async function sendGiftCardEmail(
  userEmail: string,
  giftCardDetails: GiftCardDetails,
  sessionDetails: SessionDetails
): Promise<boolean> {
  try {
    // Validate email configuration
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_PORT || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('Email configuration missing. Please set EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS in .env');
      return false;
    }

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
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your Gift Card is Ready!</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Your Gift Card is Ready!</h1>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
            <p style="font-size: 16px; margin-top: 0;">Thanks for using <strong>Mizu Pay</strong>! Your gift card for <strong>${giftCardDetails.store}</strong> is ready.</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #667eea;">
              <div style="text-align: center; margin-bottom: 20px;">
                <p style="margin: 0; color: #6b7280; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Gift Card Amount</p>
                <p style="margin: 10px 0 0 0; font-size: 32px; font-weight: bold; color: #667eea;">
                  ${formatAmount(giftCardDetails.amountUSD, giftCardDetails.currency)}
                </p>
              </div>
              
              <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 20px;">
                <div style="margin-bottom: 15px;">
                  <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Gift Card Number</p>
                  <p style="margin: 0; font-size: 18px; font-weight: 600; font-family: 'Courier New', monospace; color: #111827; background: #f3f4f6; padding: 10px; border-radius: 4px;">
                    ${giftCardDetails.number}
                  </p>
                </div>
                
                <div>
                  <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">PIN</p>
                  <p style="margin: 0; font-size: 18px; font-weight: 600; font-family: 'Courier New', monospace; color: #111827; background: #f3f4f6; padding: 10px; border-radius: 4px;">
                    ${giftCardDetails.pin}
                  </p>
                </div>
              </div>
            </div>
            
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; font-size: 14px; color: #92400e;">
                <strong>⏰ Valid until:</strong> ${formattedExpiryDate}
              </p>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280;">Transaction Details:</p>
              <table style="width: 100%; font-size: 12px; color: #6b7280;">
                <tr>
                  <td style="padding: 5px 0;">Transaction Hash:</td>
                  <td style="padding: 5px 0; text-align: right; font-family: 'Courier New', monospace;">
                    <a href="https://celo-sepolia.blockscout.com/tx/${sessionDetails.txHash}" style="color: #667eea; text-decoration: none;">
                      ${sessionDetails.txHash.slice(0, 8)}...${sessionDetails.txHash.slice(-6)}
                    </a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 5px 0;">Amount Paid:</td>
                  <td style="padding: 5px 0; text-align: right;">
                    ${sessionDetails.amountCrypto.toFixed(4)} ${sessionDetails.token}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 5px 0;">Session ID:</td>
                  <td style="padding: 5px 0; text-align: right; font-family: 'Courier New', monospace;">
                    ${sessionDetails.sessionId.slice(0, 8)}...
                  </td>
                </tr>
              </table>
            </div>
            
            <p style="margin-top: 30px; font-size: 14px; color: #6b7280; text-align: center;">
              Enjoy your purchase! 🎁
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="font-size: 12px; color: #9ca3af; margin: 0;">
              Secured by blockchain technology • All transactions are encrypted
            </p>
            <p style="font-size: 12px; color: #9ca3af; margin: 5px 0 0 0;">
              Powered by <strong>Mizu Pay</strong>
            </p>
          </div>
        </body>
      </html>
    `;

    // Send email
    await transporter.sendMail({
      from: `"Mizu Pay" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `🎉 Your ${giftCardDetails.store} Gift Card is Ready!`,
      html: emailHTML,
    });

    return true;
  } catch (error) {
    console.error('Error sending gift card email:', error);
    return false;
  }
}

