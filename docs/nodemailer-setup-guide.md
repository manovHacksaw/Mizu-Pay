# 🆓 Nodemailer Setup Guide - FREE Email Solution

## 🎯 Complete Setup for Sending Emails to Any User

### **Why Nodemailer with Gmail?**
- ✅ **100% Free**: No cost at all
- ✅ **No Domain Required**: Works with your Gmail
- ✅ **Immediate Setup**: Works in 5 minutes
- ✅ **Unlimited Emails**: No restrictions
- ✅ **Professional**: Gmail's reliable infrastructure

## 📋 Step-by-Step Setup

### **Step 1: Enable 2-Factor Authentication**

1. **Go to**: [Google Account Settings](https://myaccount.google.com/)
2. **Click**: "Security" in the left sidebar
3. **Find**: "2-Step Verification"
4. **Click**: "Get started"
5. **Follow**: Google's setup process

### **Step 2: Generate App Password**

1. **Go to**: [Google Account Settings](https://myaccount.google.com/)
2. **Click**: "Security" in the left sidebar
3. **Find**: "App passwords" (only visible after 2FA is enabled)
4. **Click**: "App passwords"
5. **Select**: "Mail" from the dropdown
6. **Click**: "Generate"
7. **Copy**: The 16-character password (e.g., `abcd efgh ijkl mnop`)

### **Step 3: Update Your Email Service**

Replace your current email service with Nodemailer:

```typescript
// lib/email-service.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'manovmandal@gmail.com', // Your Gmail
    pass: 'your_16_character_app_password' // Gmail App Password
  }
});

export async function sendPaymentConfirmationEmail(data: PaymentEmailData) {
  try {
    const mailOptions = {
      from: 'Mizu Pay <manovmandal@gmail.com>',
      to: data.userEmail, // Can send to ANY email!
      subject: 'Payment Successful - Gift Card Processing',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <!-- Your professional email template -->
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    return { success: true, message: 'Email sent successfully', data: result };
    
  } catch (error) {
    return { success: false, message: `Email error: ${error.message}` };
  }
}
```

### **Step 4: Test the Setup**

1. **Update the test script** with your Gmail App Password
2. **Run**: `node scripts/test-nodemailer.js`
3. **Check**: Gmail inbox for the test email

## 🎯 Alternative Free Solutions

### **Option 1: EmailJS (Frontend Only)**
- **Cost**: 100% Free (200 emails/month)
- **Setup**: [https://www.emailjs.com/](https://www.emailjs.com/)
- **Pros**: No backend required, easy setup
- **Cons**: Frontend-only, limited customization

### **Option 2: SendGrid Free Tier**
- **Cost**: 100% Free (100 emails/day)
- **Setup**: [https://sendgrid.com/](https://sendgrid.com/)
- **Pros**: Professional service, good deliverability
- **Cons**: Daily limit, requires verification

### **Option 3: Mailgun Free Tier**
- **Cost**: 100% Free (5,000 emails/month)
- **Setup**: [https://www.mailgun.com/](https://www.mailgun.com/)
- **Pros**: High volume, professional service
- **Cons**: Requires domain verification

## 🚀 Quick Implementation

### **Update Your Email Service:**

```typescript
// lib/email-service.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER || 'manovmandal@gmail.com',
    pass: process.env.GMAIL_APP_PASSWORD || 'your_gmail_app_password'
  }
});

export async function sendPaymentConfirmationEmail(data: PaymentEmailData) {
  try {
    const mailOptions = {
      from: 'Mizu Pay <manovmandal@gmail.com>',
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
```

## 🎉 Expected Results

Once you set up Nodemailer with Gmail:

- ✅ **Send to Any Email**: `anuskaswork@gmail.com`, `user@example.com`, etc.
- ✅ **No Restrictions**: Send to any recipient
- ✅ **100% Free**: No cost at all
- ✅ **Immediate**: Works right now
- ✅ **Professional**: Gmail's reliable infrastructure

## 🚀 Next Steps

1. **Enable 2FA**: Go to [Google Account Settings](https://myaccount.google.com/)
2. **Generate App Password**: Create app password for "Mail"
3. **Update Code**: Replace your email service with Nodemailer
4. **Test**: Send email to `anuskaswork@gmail.com`

**Your Mizu Pay email system will send emails to ANY user's email address for FREE!** 🚀
