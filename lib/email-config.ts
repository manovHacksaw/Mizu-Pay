// Email service configuration
// This file contains configuration for different email providers

export interface EmailConfig {
  provider: 'resend' | 'sendgrid' | 'nodemailer' | 'console'
  apiKey?: string
  fromEmail?: string
  fromName?: string
}

// Default configuration (using Resend for production)
export const emailConfig: EmailConfig = {
  provider: process.env.EMAIL_PROVIDER as 'resend' | 'sendgrid' | 'nodemailer' | 'console' || 'resend',
  fromEmail: process.env.EMAIL_FROM || 'manovmandal@gmail.com',
  fromName: process.env.EMAIL_FROM_NAME || 'MIZU PAY',
  apiKey: process.env.RESEND_API_KEY || process.env.EMAIL_API_KEY || 're_Ghc1XAEZ_EV163ho4zFMZp19ykCYWVWRF'
}

// Email templates
export const emailTemplates = {
  paymentSuccess: {
    subject: 'Payment Successful - Gift Card Processing',
    html: (data: any) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Successful - Mizu Pay</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .success-icon { font-size: 48px; margin-bottom: 20px; }
          .payment-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4CAF50; }
          .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
          .detail-label { font-weight: bold; color: #666; }
          .detail-value { color: #333; }
          .highlight { background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4CAF50; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="success-icon">✅</div>
            <h1>Payment Successful!</h1>
            <p>Your payment has been processed successfully</p>
          </div>
          
          <div class="content">
            <h2>Hello ${data.userName || 'Valued Customer'},</h2>
            
            <p>Great news! Your payment has been successfully processed and confirmed on the blockchain.</p>
            
            <div class="payment-details">
              <h3>Payment Details</h3>
              <div class="detail-row">
                <span class="detail-label">Amount:</span>
                <span class="detail-value">${data.amount} ${data.token}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Store:</span>
                <span class="detail-value">${data.store || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Product:</span>
                <span class="detail-value">${data.product || 'N/A'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Transaction Hash:</span>
                <span class="detail-value" style="font-family: monospace; font-size: 12px;">${data.txHash}</span>
              </div>
            </div>
            
            <div class="highlight">
              <h3>🎁 Gift Card Processing</h3>
              <p><strong>Your gift card will be sent to your email within 2-3 minutes after verification.</strong></p>
              <p>We're currently verifying your payment and preparing your gift card. You'll receive it shortly!</p>
            </div>
            
            <div style="background: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196F3;">
              <h3>What's Next?</h3>
              <ul>
                <li>✅ Payment confirmed on blockchain</li>
                <li>🔄 Gift card verification in progress</li>
                <li>📧 Gift card delivery within 2-3 minutes</li>
              </ul>
            </div>
            
            <div class="footer">
              <p>Thank you for using Mizu Pay!</p>
              <p>If you have any questions, please contact our support team.</p>
              <p style="font-size: 12px; color: #999;">
                This is an automated message. Please do not reply to this email.
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  }
}

// Setup instructions for different email providers
export const emailSetupInstructions = {
  resend: `
    To use Resend for email sending:
    1. Sign up at https://resend.com
    2. Get your API key from the dashboard
    3. Set RESEND_API_KEY in your environment variables
    4. Update emailConfig.provider to 'resend'
  `,
  sendgrid: `
    To use SendGrid for email sending:
    1. Sign up at https://sendgrid.com
    2. Get your API key from the dashboard
    3. Set SENDGRID_API_KEY in your environment variables
    4. Update emailConfig.provider to 'sendgrid'
  `,
  nodemailer: `
    To use Nodemailer for email sending:
    1. Install nodemailer: npm install nodemailer
    2. Configure SMTP settings in your environment variables
    3. Update emailConfig.provider to 'nodemailer'
  `
}
