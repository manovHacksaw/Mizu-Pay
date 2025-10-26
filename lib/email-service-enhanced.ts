// Enhanced email service for sending payment confirmations and gift card details
import nodemailer from 'nodemailer'

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

interface GiftCardEmailData {
  userEmail: string
  userName: string
  giftCardName: string
  giftCardAmount: number
  giftCardCurrency: string
  giftCardProvider: string
  giftCardCode: string
  giftCardPin?: string
  paymentAmount: number
  paymentToken: string
  txHash: string
}

// Create transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: 'anuskaswork@gmail.com', // Your Gmail
    pass: 'rqeg awex uzxd xvoj' // Gmail App Password
  }
});

// Send payment confirmation email (first email)
export async function sendPaymentConfirmationEmail(data: PaymentEmailData) {
  try {
    console.log('📧 Sending payment confirmation email to:', data.userEmail)
    
    const mailOptions = {
      from: 'Mizu Pay <anuskaswork@gmail.com>',
      to: data.userEmail,
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
    console.log('✅ Payment confirmation email sent successfully:', result);
    return { success: true, message: 'Payment confirmation email sent successfully', data: result };
    
  } catch (error) {
    console.error('❌ Payment confirmation email error:', error);
    return { success: false, message: `Email error: ${error.message}` };
  }
}

// Send gift card details email (second email)
export async function sendGiftCardDetailsEmail(data: GiftCardEmailData) {
  try {
    console.log('🎁 Sending gift card details email to:', data.userEmail)
    console.log('📧 Email data:', {
      userEmail: data.userEmail,
      userName: data.userName,
      giftCardName: data.giftCardName,
      giftCardCode: data.giftCardCode
    })
    
    const mailOptions = {
      from: 'Mizu Pay <anuskaswork@gmail.com>',
      to: data.userEmail,
      subject: `🎁 Your ${data.giftCardProvider} Gift Card is Ready!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #ff6b6b 0%, #feca57 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0;">🎁 Your Gift Card is Ready!</h1>
            <p style="margin: 10px 0 0 0;">${data.giftCardName} - ${data.giftCardAmount} ${data.giftCardCurrency}</p>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2>Hello ${data.userName || 'Valued Customer'},</h2>
            <p>Your gift card has been successfully processed and is ready to use!</p>
            
            <div style="background: white; padding: 25px; border-radius: 8px; margin: 20px 0; border: 2px solid #ff6b6b;">
              <h3 style="color: #ff6b6b; margin-top: 0;">🎁 Gift Card Details</h3>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 6px; margin: 15px 0;">
                <div style="display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee;">
                  <span style="font-weight: bold; color: #666;">Gift Card:</span>
                  <span style="color: #333; font-weight: bold;">${data.giftCardName}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee;">
                  <span style="font-weight: bold; color: #666;">Value:</span>
                  <span style="color: #333; font-weight: bold;">${data.giftCardAmount} ${data.giftCardCurrency}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee;">
                  <span style="font-weight: bold; color: #666;">Provider:</span>
                  <span style="color: #333; font-weight: bold; text-transform: capitalize;">${data.giftCardProvider}</span>
                </div>
              </div>
              
              <div style="background: #fff3cd; padding: 20px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #ffc107;">
                <h4 style="color: #856404; margin-top: 0;">🔑 Gift Card Code</h4>
                <div style="background: white; padding: 15px; border-radius: 4px; text-align: center; border: 2px dashed #ffc107;">
                  <span style="font-family: monospace; font-size: 18px; font-weight: bold; color: #333; letter-spacing: 2px;">${data.giftCardCode}</span>
                </div>
                ${data.giftCardPin ? `
                  <h4 style="color: #856404; margin-top: 15px;">🔐 PIN</h4>
                  <div style="background: white; padding: 15px; border-radius: 4px; text-align: center; border: 2px dashed #ffc107;">
                    <span style="font-family: monospace; font-size: 18px; font-weight: bold; color: #333; letter-spacing: 2px;">${data.giftCardPin}</span>
                  </div>
                ` : ''}
              </div>
            </div>
            
            <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4CAF50;">
              <h3>✅ How to Use Your Gift Card</h3>
              <ol style="color: #333; line-height: 1.6;">
                <li>Visit ${data.giftCardProvider === 'amazon' ? 'Amazon.com' : data.giftCardProvider === 'flipkart' ? 'Flipkart.com' : data.giftCardProvider}</li>
                <li>Add items to your cart</li>
                <li>At checkout, enter your gift card code${data.giftCardPin ? ' and PIN' : ''}</li>
                <li>Complete your purchase!</li>
              </ol>
            </div>
            
            <div style="background: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196F3;">
              <h3>Payment Summary</h3>
              <div style="display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee;">
                <span style="font-weight: bold; color: #666;">You Paid:</span>
                <span style="color: #333;">${data.paymentAmount} ${data.paymentToken}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee;">
                <span style="font-weight: bold; color: #666;">You Received:</span>
                <span style="color: #333; font-weight: bold;">${data.giftCardAmount} ${data.giftCardCurrency} Gift Card</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0;">
                <span style="font-weight: bold; color: #666;">Transaction:</span>
                <span style="color: #333; font-family: monospace; font-size: 12px;">${data.txHash}</span>
              </div>
            </div>
            
            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
              <h4 style="color: #856404; margin-top: 0;">⚠️ Important Notes</h4>
              <ul style="color: #856404; margin: 0; padding-left: 20px;">
                <li>Keep your gift card code and PIN safe</li>
                <li>Gift cards are non-refundable and non-transferable</li>
                <li>Check the expiration date on the gift card</li>
                <li>Contact support if you have any issues</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
              <p>Thank you for using Mizu Pay!</p>
              <p>Enjoy your gift card and happy shopping! 🛍️</p>
              <p style="font-size: 12px; color: #999;">This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Gift card details email sent successfully:', result);
    return { success: true, message: 'Gift card details email sent successfully', data: result };
    
  } catch (error) {
    console.error('❌ Gift card details email error:', error);
    return { success: false, message: `Email error: ${error.message}` };
  }
}
