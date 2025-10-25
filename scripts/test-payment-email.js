// Test payment confirmation email
// Using the same pattern as the actual payment system

const { Resend } = require('resend')

// Following Chingu's exact pattern
const resend = new Resend('re_jgeAFYyS_FbLHoLA197Mn4iWnLpsL5Mrn')

async function testPaymentEmail() {
  try {
    console.log('🧪 Testing payment confirmation email...')
    
    const result = await resend.emails.send({
      from: 'Mizu Pay <onboarding@resend.dev>',
      to: ['manovmandal@gmail.com'],
      subject: 'Payment Successful - Gift Card Processing',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <div style="font-size: 48px; margin-bottom: 20px;">✅</div>
            <h1 style="margin: 0;">Payment Successful!</h1>
            <p style="margin: 10px 0 0 0;">Your payment has been processed successfully</p>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2>Hello Anuska,</h2>
            
            <p>Great news! Your payment has been successfully processed and confirmed on the blockchain.</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4CAF50;">
              <h3>Payment Details</h3>
              <div style="display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee;">
                <span style="font-weight: bold; color: #666;">Amount:</span>
                <span style="color: #333;">17.08 CUSD</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee;">
                <span style="font-weight: bold; color: #666;">Store:</span>
                <span style="color: #333;">Flipkart.com</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee;">
                <span style="font-weight: bold; color: #666;">Product:</span>
                <span style="color: #333;">Purchase</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee;">
                <span style="font-weight: bold; color: #666;">Transaction Hash:</span>
                <span style="color: #333; font-family: monospace; font-size: 12px;">0x94f8b57adc22d497bdd36c78abb365e3142ef85a906eb8b3a8fbabe17b462989</span>
              </div>
            </div>
            
            <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4CAF50;">
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
            
            <div style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
              <p>Thank you for using Mizu Pay!</p>
              <p>If you have any questions, please contact our support team.</p>
              <p style="font-size: 12px; color: #999;">
                This is an automated message. Please do not reply to this email.
              </p>
            </div>
          </div>
        </div>
      `,
    })
    
    console.log('✅ Payment confirmation email sent successfully!')
    console.log('📧 Result:', result)
    console.log('🎯 Check your Gmail inbox: manovmandal@gmail.com')
    
  } catch (error) {
    console.error('❌ Email error:', error)
  }
}

// Run test
testPaymentEmail()
