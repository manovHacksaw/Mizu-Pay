/**
 * Mizu Pay Email Templates
 * Professional, responsive HTML email templates for transactional emails
 * Compatible with Gmail, Outlook, and mobile devices
 */

// ============================================================================
// BASE TEMPLATE COMPONENTS
// ============================================================================

/**
 * Email Header Component
 */
function getEmailHeader(): string {
  return `
    <!-- Header -->
    <tr>
      <td style="padding: 32px 40px 16px 40px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td>
              <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #1a1a1a; letter-spacing: -0.5px;">Mizu Pay</h1>
              <p style="margin: 6px 0 0 0; font-size: 13px; color: #6b7280; font-weight: 400;">Secured by blockchain technology.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    
    <!-- Divider -->
    <tr>
      <td style="padding: 0 40px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td style="height: 1px; background-color: #e5e7eb;"></td>
          </tr>
        </table>
      </td>
    </tr>
  `;
}

/**
 * Email Footer Component
 */
function getEmailFooter(customMessage?: string): string {
  return `
    <!-- Footer -->
    <tr>
      <td style="padding: 32px 40px; background-color: #ffffff;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          ${customMessage ? `
          <tr>
            <td style="padding-bottom: 20px;">
              <p style="margin: 0; font-size: 14px; color: #4b5563; line-height: 1.6;">${customMessage}</p>
            </td>
          </tr>
          ` : ''}
          <tr>
            <td style="padding-top: ${customMessage ? '20px' : '0'}; border-top: ${customMessage ? '1px solid #f3f4f6' : 'none'};">
              <p style="margin: 0; font-size: 12px; color: #9ca3af; line-height: 1.5;">© Mizu Pay • All transactions are encrypted and secured by blockchain technology.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;
}

/**
 * Base Email Container Wrapper
 */
function wrapEmailContent(content: string, title: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>${title}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f5f7fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f7fa;">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);">
                ${getEmailHeader()}
                ${content}
                ${getEmailFooter()}
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

/**
 * Helper: Format amount based on currency
 */
function formatAmount(amountUSD: number, currency: string): string {
  if (currency === 'INR') {
    return `₹${(amountUSD * 82).toFixed(2)}`;
  }
  return `$${amountUSD.toFixed(2)}`;
}

/**
 * Helper: Format date
 */
function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Helper: Format date with time
 */
function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ============================================================================
// EMAIL TEMPLATES
// ============================================================================

/**
 * 1. Payment Initialization Email
 */
export function getPaymentInitializationEmail(data: {
  storeName: string;
  sessionId: string;
  amount: number;
  currency: string;
  expiryTime: string;
  checkoutUrl?: string;
}): string {
  const content = `
    <!-- Main Content -->
    <tr>
      <td style="padding: 32px 40px;">
        <!-- Title Section -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td style="padding-bottom: 16px;">
              <h2 style="margin: 0; font-size: 28px; font-weight: 600; color: #1a1a1a; line-height: 1.2; letter-spacing: -0.5px;">Your secure payment session has been initialized.</h2>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom: 32px;">
              <p style="margin: 0; font-size: 16px; color: #4b5563; line-height: 1.5;">We're verifying the store and preparing your transaction securely.</p>
            </td>
          </tr>
        </table>
        
        <!-- Details Card -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);">
          <tr>
            <td style="padding: 32px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding-bottom: 16px; border-bottom: 1px solid #f3f4f6;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding-bottom: 8px;">
                          <p style="margin: 0; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500;">Store Name</p>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <p style="margin: 0; font-size: 18px; font-weight: 600; color: #1a1a1a;">${data.storeName}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 0; border-bottom: 1px solid #f3f4f6;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding-bottom: 8px;">
                          <p style="margin: 0; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500;">Session ID</p>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <p style="margin: 0; font-size: 14px; font-family: 'Courier New', Courier, monospace; color: #1a1a1a;">${data.sessionId}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 0; border-bottom: 1px solid #f3f4f6;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding-bottom: 8px;">
                          <p style="margin: 0; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500;">Amount & Currency</p>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <p style="margin: 0; font-size: 18px; font-weight: 600; color: #1a1a1a;">${formatAmount(data.amount, data.currency)}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 16px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding-bottom: 8px;">
                          <p style="margin: 0; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500;">Expiry Time</p>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <p style="margin: 0; font-size: 16px; font-weight: 500; color: #1a1a1a;">${data.expiryTime}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        
        <!-- Callout -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td style="padding-top: 24px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 6px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <p style="margin: 0; font-size: 14px; color: #92400e; line-height: 1.5;">Please complete your payment before the session expires. Do not refresh or share this link.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;
  
  return wrapEmailContent(content, 'Secure Checkout Session Started — Mizu Pay');
}

/**
 * 2. Gift Card Order Complete Email
 */
export function getGiftCardOrderCompleteEmail(data: {
  store: string;
  currency: string;
  amountUSD: number;
  giftCardNumber: string;
  pin: string;
  validUntil: string;
}): string {
  const content = `
    <!-- Main Content -->
    <tr>
      <td style="padding: 32px 40px;">
        <!-- Title Section -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td style="padding-bottom: 16px;">
              <h2 style="margin: 0; font-size: 28px; font-weight: 600; color: #1a1a1a; line-height: 1.2; letter-spacing: -0.5px;">Your Gift Card Order is Complete</h2>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom: 32px;">
              <p style="margin: 0; font-size: 16px; color: #4b5563; line-height: 1.5;">Thank you for your purchase. Below are your gift card details.</p>
            </td>
          </tr>
        </table>
        
        <!-- Order Summary Card -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);">
          <tr>
            <td style="padding: 32px;">
              
              <!-- Store and Amount -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding-bottom: 24px; border-bottom: 1px solid #f3f4f6;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding-bottom: 8px;">
                          <p style="margin: 0; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500;">Store</p>
                        </td>
                        <td align="right" style="padding-bottom: 8px;">
                          <p style="margin: 0; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500;">Amount</p>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <p style="margin: 0; font-size: 20px; font-weight: 600; color: #1a1a1a;">${data.store}</p>
                        </td>
                        <td align="right">
                          <p style="margin: 0; font-size: 20px; font-weight: 600; color: #1a1a1a;">${formatAmount(data.amountUSD, data.currency)}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Gift Card Number -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding-top: 24px; padding-bottom: 8px;">
                    <p style="margin: 0; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500;">Gift Card Number</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 24px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 14px 16px;">
                          <p style="margin: 0; font-size: 16px; font-weight: 500; font-family: 'Courier New', Courier, monospace; color: #1a1a1a; letter-spacing: 0.5px;">${data.giftCardNumber}</p>
                        </td>
                        <td width="12"></td>
                        <td width="60" valign="middle">
                          <a href="#" style="display: inline-block; padding: 8px 16px; font-size: 13px; font-weight: 500; color: #2563eb; text-decoration: none; border: 1px solid #2563eb; border-radius: 6px; background-color: transparent; white-space: nowrap;">Copy</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- PIN -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding-bottom: 8px;">
                    <p style="margin: 0; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500;">PIN</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 24px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 14px 16px;">
                          <p style="margin: 0; font-size: 16px; font-weight: 500; font-family: 'Courier New', Courier, monospace; color: #1a1a1a; letter-spacing: 0.5px;">${data.pin}</p>
                        </td>
                        <td width="12"></td>
                        <td width="60" valign="middle">
                          <a href="#" style="display: inline-block; padding: 8px 16px; font-size: 13px; font-weight: 500; color: #2563eb; text-decoration: none; border: 1px solid #2563eb; border-radius: 6px; background-color: transparent; white-space: nowrap;">Copy</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Valid Until -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding-top: 16px; border-top: 1px solid #f3f4f6;">
                    <p style="margin: 0; font-size: 13px; color: #6b7280; line-height: 1.5;">Valid Until: ${data.validUntil}</p>
                  </td>
                </tr>
              </table>
              
            </td>
          </tr>
        </table>
        
        <!-- Additional Info -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td style="padding-top: 24px;">
              <p style="margin: 0; font-size: 14px; color: #4b5563; line-height: 1.6;">Any remaining balance on this card can be used for future purchases.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;
  
  const footer = getEmailFooter(`Keep this email safe. Redeem it anytime on the ${data.store} official gift card portal.`);
  
  return wrapEmailContent(content + footer, 'Your Gift Card Order is Complete');
}

/**
 * 3. Payment Session Expired Email
 */
export function getPaymentSessionExpiredEmail(data: {
  store: string;
  amount: number;
  currency: string;
  timestamp: string;
  newSessionUrl?: string;
}): string {
  const content = `
    <!-- Main Content -->
    <tr>
      <td style="padding: 32px 40px;">
        <!-- Title Section -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td style="padding-bottom: 16px;">
              <h2 style="margin: 0; font-size: 28px; font-weight: 600; color: #1a1a1a; line-height: 1.2; letter-spacing: -0.5px;">Your Payment Session Has Expired</h2>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom: 32px;">
              <p style="margin: 0; font-size: 16px; color: #4b5563; line-height: 1.5;">The checkout session for your transaction has timed out for security reasons.</p>
            </td>
          </tr>
        </table>
        
        <!-- Details Card -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);">
          <tr>
            <td style="padding: 32px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding-bottom: 16px; border-bottom: 1px solid #f3f4f6;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding-bottom: 8px;">
                          <p style="margin: 0; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500;">Store</p>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <p style="margin: 0; font-size: 18px; font-weight: 600; color: #1a1a1a;">${data.store}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 0; border-bottom: 1px solid #f3f4f6;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding-bottom: 8px;">
                          <p style="margin: 0; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500;">Amount</p>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <p style="margin: 0; font-size: 18px; font-weight: 600; color: #1a1a1a;">${formatAmount(data.amount, data.currency)}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 16px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding-bottom: 8px;">
                          <p style="margin: 0; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500;">Timestamp</p>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <p style="margin: 0; font-size: 16px; font-weight: 500; color: #1a1a1a;">${data.timestamp}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        
        <!-- Reassurance -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td style="padding-top: 24px; padding-bottom: 24px;">
              <p style="margin: 0; font-size: 14px; color: #4b5563; line-height: 1.6;">No charges were made. You can safely initiate a new checkout.</p>
            </td>
          </tr>
        </table>
        
        <!-- CTA Button -->
        ${data.newSessionUrl ? `
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td align="center" style="padding-top: 8px;">
              <a href="${data.newSessionUrl}" style="display: inline-block; padding: 14px 32px; font-size: 16px; font-weight: 600; color: #ffffff; text-decoration: none; background-color: #2563eb; border-radius: 8px; text-align: center;">Start a New Session</a>
            </td>
          </tr>
        </table>
        ` : ''}
      </td>
    </tr>
  `;
  
  return wrapEmailContent(content, 'Your Mizu Pay Session Has Expired');
}

/**
 * 4. Wallet Deposit Confirmation Email
 */
export function getWalletDepositConfirmationEmail(data: {
  amount: number;
  currency: string;
  transactionId: string;
  currentBalance: number;
  explorerUrl?: string;
}): string {
  const content = `
    <!-- Main Content -->
    <tr>
      <td style="padding: 32px 40px;">
        <!-- Title Section -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td style="padding-bottom: 16px;">
              <h2 style="margin: 0; font-size: 28px; font-weight: 600; color: #1a1a1a; line-height: 1.2; letter-spacing: -0.5px;">New Deposit Added to Your Wallet</h2>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom: 32px;">
              <p style="margin: 0; font-size: 16px; color: #4b5563; line-height: 1.5;">Funds have been successfully credited to your Mizu Pay account.</p>
            </td>
          </tr>
        </table>
        
        <!-- Deposit Card -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);">
          <tr>
            <td style="padding: 32px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding-bottom: 16px; border-bottom: 1px solid #f3f4f6;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding-bottom: 8px;">
                          <p style="margin: 0; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500;">Deposit Amount</p>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <p style="margin: 0; font-size: 24px; font-weight: 600; color: #1a1a1a;">${formatAmount(data.amount, data.currency)}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 0; border-bottom: 1px solid #f3f4f6;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding-bottom: 8px;">
                          <p style="margin: 0; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500;">Transaction ID</p>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <p style="margin: 0; font-size: 14px; font-family: 'Courier New', Courier, monospace; color: #1a1a1a;">${data.transactionId}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 0; border-bottom: 1px solid #f3f4f6;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding-bottom: 8px;">
                          <p style="margin: 0; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500;">Currency</p>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <p style="margin: 0; font-size: 16px; font-weight: 500; color: #1a1a1a;">${data.currency}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 16px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding-bottom: 8px;">
                          <p style="margin: 0; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500;">Current Wallet Balance</p>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <p style="margin: 0; font-size: 20px; font-weight: 600; color: #059669;">${formatAmount(data.currentBalance, data.currency)}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        
        <!-- Verification Line -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td style="padding-top: 24px;">
              <p style="margin: 0; font-size: 14px; color: #4b5563; line-height: 1.6;">Transaction confirmed on-chain. ${data.explorerUrl ? `<a href="${data.explorerUrl}" style="color: #2563eb; text-decoration: none;">You can view it on the blockchain explorer</a>.` : 'You can view it on the blockchain explorer.'}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;
  
  return wrapEmailContent(content, 'Deposit Received in Your Mizu Pay Wallet');
}

/**
 * 5. Transaction Confirmation Email
 */
export function getTransactionConfirmationEmail(data: {
  transactionHash: string;
  network: string;
  blockConfirmations: number;
  amountPaid: number;
  currency: string;
  explorerUrl?: string;
}): string {
  const content = `
    <!-- Main Content -->
    <tr>
      <td style="padding: 32px 40px;">
        <!-- Title Section -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td style="padding-bottom: 16px;">
              <h2 style="margin: 0; font-size: 28px; font-weight: 600; color: #1a1a1a; line-height: 1.2; letter-spacing: -0.5px;">Your Payment Was Successfully Verified</h2>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom: 32px;">
              <p style="margin: 0; font-size: 16px; color: #4b5563; line-height: 1.5;">The blockchain has confirmed your transaction. Details are below.</p>
            </td>
          </tr>
        </table>
        
        <!-- Transaction Details Card -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);">
          <tr>
            <td style="padding: 32px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding-bottom: 16px; border-bottom: 1px solid #f3f4f6;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding-bottom: 8px;">
                          <p style="margin: 0; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500;">Transaction Hash</p>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <p style="margin: 0; font-size: 14px; font-family: 'Courier New', Courier, monospace; color: #1a1a1a; word-break: break-all;">${data.transactionHash}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 0; border-bottom: 1px solid #f3f4f6;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding-bottom: 8px;">
                          <p style="margin: 0; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500;">Network</p>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <p style="margin: 0; font-size: 16px; font-weight: 500; color: #1a1a1a;">${data.network}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 0; border-bottom: 1px solid #f3f4f6;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding-bottom: 8px;">
                          <p style="margin: 0; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500;">Block Confirmations</p>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <p style="margin: 0; font-size: 18px; font-weight: 600; color: #059669;">${data.blockConfirmations}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 16px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding-bottom: 8px;">
                          <p style="margin: 0; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500;">Amount Paid</p>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <p style="margin: 0; font-size: 20px; font-weight: 600; color: #1a1a1a;">${formatAmount(data.amountPaid, data.currency)}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        
        <!-- CTA Button -->
        ${data.explorerUrl ? `
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td align="center" style="padding-top: 24px;">
              <a href="${data.explorerUrl}" style="display: inline-block; padding: 14px 32px; font-size: 16px; font-weight: 600; color: #2563eb; text-decoration: none; border: 1px solid #2563eb; border-radius: 8px; background-color: transparent; text-align: center;">View on Explorer</a>
            </td>
          </tr>
        </table>
        ` : ''}
        
        <!-- Note -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td style="padding-top: 24px;">
              <p style="margin: 0; font-size: 14px; color: #6b7280; line-height: 1.6; font-style: italic;">The blockchain explorer might take a few minutes to reflect this transaction.</p>
            </td>           
          </tr>
        </table>
      </td>
    </tr>
  `;
  
  return wrapEmailContent(content, 'Payment Confirmed — Mizu Pay');
}

/**
 * 6. Wallet Withdrawal Confirmation Email (Embedded Wallet Only)
 */
export function getWalletWithdrawalConfirmationEmail(data: {
  amount: number;
  currency: string;
  transactionId: string;
  recipientAddress: string;
  currentBalance: number;
  explorerUrl?: string;
}): string {
  const content = `
    <!-- Main Content -->
    <tr>
      <td style="padding: 32px 40px;">
        <!-- Title Section -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td style="padding-bottom: 16px;">
              <h2 style="margin: 0; font-size: 28px; font-weight: 600; color: #1a1a1a; line-height: 1.2; letter-spacing: -0.5px;">Withdrawal Processed from Your Wallet</h2>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom: 32px;">
              <p style="margin: 0; font-size: 16px; color: #4b5563; line-height: 1.5;">Funds have been successfully sent from your Mizu Pay wallet.</p>
            </td>
          </tr>
        </table>
        
        <!-- Withdrawal Card -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);">
          <tr>
            <td style="padding: 32px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding-bottom: 16px; border-bottom: 1px solid #f3f4f6;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding-bottom: 8px;">
                          <p style="margin: 0; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500;">Amount Sent</p>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <p style="margin: 0; font-size: 24px; font-weight: 600; color: #dc2626;">-${formatAmount(data.amount, data.currency)}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 0; border-bottom: 1px solid #f3f4f6;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding-bottom: 8px;">
                          <p style="margin: 0; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500;">Recipient Address</p>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <p style="margin: 0; font-size: 14px; font-family: 'Courier New', Courier, monospace; color: #1a1a1a; word-break: break-all;">${data.recipientAddress}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 0; border-bottom: 1px solid #f3f4f6;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding-bottom: 8px;">
                          <p style="margin: 0; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500;">Transaction ID</p>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <p style="margin: 0; font-size: 14px; font-family: 'Courier New', Courier, monospace; color: #1a1a1a; word-break: break-all;">${data.transactionId}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 0; border-bottom: 1px solid #f3f4f6;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding-bottom: 8px;">
                          <p style="margin: 0; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500;">Currency</p>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <p style="margin: 0; font-size: 16px; font-weight: 500; color: #1a1a1a;">${data.currency}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 16px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding-bottom: 8px;">
                          <p style="margin: 0; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500;">Current Wallet Balance</p>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <p style="margin: 0; font-size: 20px; font-weight: 600; color: #059669;">${formatAmount(data.currentBalance, data.currency)}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        
        <!-- Verification Line -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td style="padding-top: 24px;">
              <p style="margin: 0; font-size: 14px; color: #4b5563; line-height: 1.6;">Transaction confirmed on-chain. ${data.explorerUrl ? `<a href="${data.explorerUrl}" style="color: #2563eb; text-decoration: none;">You can view it on the blockchain explorer</a>.` : 'You can view it on the blockchain explorer.'}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;
  
  return wrapEmailContent(content, 'Withdrawal Processed from Your Mizu Pay Wallet');
}

/**
 * 7. Payment Failed Email
 */
export function getPaymentFailedEmail(data: {
  store: string;
  amount: number;
  currency: string;
  sessionId: string;
  error?: string;
  timestamp: string;
  newSessionUrl?: string;
}): string {
  const content = `
    <!-- Main Content -->
    <tr>
      <td style="padding: 32px 40px;">
        <!-- Title Section -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td style="padding-bottom: 16px;">
              <h2 style="margin: 0; font-size: 28px; font-weight: 600; color: #1a1a1a; line-height: 1.2; letter-spacing: -0.5px;">Payment Failed</h2>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom: 32px;">
              <p style="margin: 0; font-size: 16px; color: #4b5563; line-height: 1.5;">Your payment attempt was unsuccessful. No charges were made to your wallet.</p>
            </td>
          </tr>
        </table>
        
        <!-- Details Card -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);">
          <tr>
            <td style="padding: 32px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding-bottom: 16px; border-bottom: 1px solid #f3f4f6;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding-bottom: 8px;">
                          <p style="margin: 0; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500;">Store</p>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <p style="margin: 0; font-size: 18px; font-weight: 600; color: #1a1a1a;">${data.store}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 0; border-bottom: 1px solid #f3f4f6;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding-bottom: 8px;">
                          <p style="margin: 0; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500;">Amount</p>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <p style="margin: 0; font-size: 18px; font-weight: 600; color: #1a1a1a;">${formatAmount(data.amount, data.currency)}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 0; border-bottom: 1px solid #f3f4f6;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding-bottom: 8px;">
                          <p style="margin: 0; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500;">Session ID</p>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <p style="margin: 0; font-size: 14px; font-family: 'Courier New', Courier, monospace; color: #1a1a1a;">${data.sessionId}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                ${data.error ? `
                <tr>
                  <td style="padding: 16px 0; border-bottom: 1px solid #f3f4f6;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding-bottom: 8px;">
                          <p style="margin: 0; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500;">Error</p>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <p style="margin: 0; font-size: 14px; color: #dc2626; line-height: 1.5;">${data.error}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding-top: 16px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding-bottom: 8px;">
                          <p style="margin: 0; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 500;">Timestamp</p>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <p style="margin: 0; font-size: 16px; font-weight: 500; color: #1a1a1a;">${data.timestamp}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        
        <!-- Reassurance -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td style="padding-top: 24px; padding-bottom: 24px;">
              <p style="margin: 0; font-size: 14px; color: #4b5563; line-height: 1.6;">No charges were made to your wallet. You can safely retry the payment or contact support if you continue to experience issues.</p>
            </td>
          </tr>
        </table>
        
        <!-- CTA Button -->
        ${data.newSessionUrl ? `
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td align="center" style="padding-top: 8px;">
              <a href="${data.newSessionUrl}" style="display: inline-block; padding: 14px 32px; font-size: 16px; font-weight: 600; color: #ffffff; text-decoration: none; background-color: #2563eb; border-radius: 8px; text-align: center;">Retry Payment</a>
            </td>
          </tr>
        </table>
        ` : ''}
      </td>
    </tr>
  `;
  
  return wrapEmailContent(content, 'Payment Failed — Mizu Pay');
}

