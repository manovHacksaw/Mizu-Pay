// Free email service using Nodemailer with Gmail SMTP
// This allows sending emails to ANY address without domain verification

import nodemailer from 'nodemailer';

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

// Create transporter using Gmail SMTP
const transporter = nodemailer.createTransporter({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: 'anuskaswork@gmail.com', // Your Gmail
    pass: 'rqeg awex uzxd xvoj' // Gmail App Password
  }
});

export async function sendPaymentConfirmationEmail(data: PaymentEmailData) {
  try {
    console.log('📧 Sending payment confirmation email to:', data.userEmail)
    
    const mailOptions = {
      from: 'Mizu Pay <manovmandal@gmail.com>', // Your Gmail address
      to: data.userEmail, // Can send to ANY email!
      subject: 'Payment Successful - Gift Card Processing',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0;">✅ Payment Successful!</h1>
            <p style="margin: 10px 0 0 0;">Your payment has been processed successfully</p>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2>Hello ${data.userName || 'Valued Customer'},</h2>
            <p><strong>Payment confirmation for:</strong> ${data.userEmail}</p>
            
            <p>Great news! Your payment has been successfully processed and confirmed on the blockchain.</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4CAF50;">
              <h3>Payment Details</h3>
              <div style="display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee;">
                <span style="font-weight: bold; color: #666;">Amount:</span>
                <span style="color: #333;">${data.amount} ${data.token}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee;">
                <span style="font-weight: bold; color: #666;">Store:</span>
                <span style="color: #333;">${data.store || 'N/A'}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee;">
                <span style="font-weight: bold; color: #666;">Product:</span>
                <span style="color: #333;">${data.product || 'N/A'}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee;">
                <span style="font-weight: bold; color: #666;">Transaction Hash:</span>
                <span style="color: #333; font-family: monospace; font-size: 12px;">${data.txHash}</span>
              </div>
            </div>
            
            <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4CAF50;">
              <h3>🎁 Gift Card Processing</h3>
              <p><strong>Your gift card will be sent to your email within 2-3 minutes after verification.</strong></p>
              <p>We're currently verifying your payment and preparing your gift card. You'll receive it shortly!</p>
            </div>
            
            <div style="background: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196F3;">
              <h3>What's Next?</h3>
              <p>✅ Payment confirmed on blockchain</p>
              <p>🔄 Gift card verification in progress</p>
              <p>📧 Gift card delivery within 2-3 minutes</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
              <p>Thank you for using Mizu Pay!</p>
              <p>If you have any questions, please contact our support team.</p>
              <p style="font-size: 12px; color: #999;">This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', result);
    return { success: true, message: 'Email sent successfully', data: result };
    
  } catch (error) {
    console.error('❌ Email sending error:', error);
    return { success: false, message: `Email error: ${error.message}` };
  }
}
