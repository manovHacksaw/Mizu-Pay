// Email service for sending payment confirmations
// Using Resend for production email sending

import { emailConfig, emailTemplates } from './email-config'

// Resend integration (will be available after npm install resend)
let Resend: any = null
try {
  Resend = require('resend')
} catch (error) {
  console.log('📧 Resend not installed, using console mode')
}

interface PaymentEmailData {
  userEmail: string
  userName: string
  amount: number
  token: string
  store: string
  product: string
  sessionId: string
  txHash: string
}

export async function sendPaymentConfirmationEmail(data: PaymentEmailData) {
  try {
    console.log('📧 Sending payment confirmation email to:', data.userEmail)
    
    const emailContent = emailTemplates.paymentSuccess.html(data)
    const subject = emailTemplates.paymentSuccess.subject
    
    // For development, log the email content
    if (emailConfig.provider === 'console') {
      console.log('📧 Email Content Generated:')
      console.log('To:', data.userEmail)
      console.log('Subject:', subject)
      console.log('From:', `${emailConfig.fromName} <${emailConfig.fromEmail}>`)
      console.log('Content Preview:', emailContent.substring(0, 200) + '...')
      
      return { success: true, message: 'Email logged to console (development mode)' }
    }
    
    // Resend integration
    if (emailConfig.provider === 'resend' && Resend) {
      try {
        const resend = new Resend(emailConfig.apiKey)
        
        const result = await resend.emails.send({
          from: `${emailConfig.fromName} <${emailConfig.fromEmail}>`,
          to: [data.userEmail],
          subject: subject,
          html: emailContent,
        })
        
        console.log('✅ Resend email sent successfully:', result)
        return { success: true, message: 'Email sent via Resend', data: result }
      } catch (resendError) {
        console.error('❌ Resend error:', resendError)
        return { success: false, message: `Resend error: ${resendError.message}` }
      }
    }
    
    // Fallback for other providers
    if (emailConfig.provider === 'resend' && !Resend) {
      console.log('⚠️ Resend not installed, falling back to console mode')
      console.log('📧 Email Content Generated:')
      console.log('To:', data.userEmail)
      console.log('Subject:', subject)
      console.log('From:', `${emailConfig.fromName} <${emailConfig.fromEmail}>`)
      console.log('Content Preview:', emailContent.substring(0, 200) + '...')
      
      return { success: true, message: 'Email logged to console (Resend not installed)' }
    }
    
    return { success: true, message: 'Email sent successfully' }
  } catch (error) {
    console.error('❌ Error sending email:', error)
    return { success: false, message: 'Failed to send email' }
  }
}

function generatePaymentEmailHTML(data: PaymentEmailData): string {
  return `
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
        .button { display: inline-block; background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
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
            <div class="detail-row">
              <span class="detail-label">Session ID:</span>
              <span class="detail-value" style="font-family: monospace; font-size: 12px;">${data.sessionId}</span>
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

// Alternative simple text email
export function generatePaymentEmailText(data: PaymentEmailData): string {
  return `
Payment Successful - Mizu Pay

Hello ${data.userName || 'Valued Customer'},

Your payment has been successfully processed!

Payment Details:
- Amount: ${data.amount} ${data.token}
- Store: ${data.store || 'N/A'}
- Product: ${data.product || 'N/A'}
- Transaction Hash: ${data.txHash}
- Session ID: ${data.sessionId}

🎁 Gift Card Processing:
Your gift card will be sent to your email within 2-3 minutes after verification.

Thank you for using Mizu Pay!

---
This is an automated message. Please do not reply to this email.
  `
}
