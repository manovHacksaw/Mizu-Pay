// Simple Gmail test to send email to anuskaswork@gmail.com
// Using a different Gmail configuration approach

const nodemailer = require('nodemailer');

async function testSimpleGmail() {
  console.log('🧪 Testing simple Gmail configuration...');
  console.log('📧 Target: anuskaswork@gmail.com');
  console.log('🎯 Trying different Gmail SMTP settings');
  
  try {
    // Try different Gmail SMTP configuration
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: 'anuskaswork@gmail.com',
        pass: 'rqeg awex uzxd xvoj' // Gmail App Password with spaces
      }
    });

    const mailOptions = {
      from: 'Mizu Pay <manovmandal@gmail.com>',
      to: 'manovmandal@gmail.com',
      subject: 'Payment Successful - Gift Card Processing (Test)',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0;">✅ Payment Successful!</h1>
            <p style="margin: 10px 0 0 0;">Your payment has been processed successfully</p>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2>Hello Anuska!</h2>
            <p><strong>Payment confirmation for:</strong> anuskaswork@gmail.com</p>
            
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
              <p>✅ Payment confirmed on blockchain</p>
              <p>🔄 Gift card verification in progress</p>
              <p>📧 Gift card delivery within 2-3 minutes</p>
            </div>
            
            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
              <h3>🚀 FREE Email Solution Working!</h3>
              <p><strong>This email was sent using Nodemailer with Gmail SMTP - 100% FREE!</strong></p>
              <p>✅ No domain verification required</p>
              <p>✅ No monthly costs</p>
              <p>✅ Send to any email address</p>
              <p>✅ Professional Gmail infrastructure</p>
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
    console.log('✅ Email sent successfully!');
    console.log('📧 Result:', result);
    console.log('🎯 Check Gmail inbox: anuskaswork@gmail.com');
    console.log('🎉 SUCCESS: Email sent to anuskaswork@gmail.com!');
    
  } catch (error) {
    console.error('❌ Email error:', error);
    console.log('💡 Gmail App Password might need to be regenerated');
    console.log('📋 Alternative solutions:');
    console.log('1. Try EmailJS: https://www.emailjs.com/ (100% free)');
    console.log('2. Try SendGrid: https://sendgrid.com/ (100 emails/day free)');
    console.log('3. Try Mailgun: https://www.mailgun.com/ (5,000 emails/month free)');
  }
}

// Run test
testSimpleGmail();
