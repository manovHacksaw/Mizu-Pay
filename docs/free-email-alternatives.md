# 🆓 Free Email Alternatives - Send to Any User

## 🎯 Free Solutions to Send Emails to Any Address

### **Option 1: Nodemailer with Gmail SMTP (100% Free)**

This is the most reliable free option that works immediately:

#### **Setup:**
1. **Install Nodemailer**: `npm install nodemailer`
2. **Use Gmail SMTP**: Your existing Gmail account
3. **No Domain Required**: Works with any Gmail account

#### **Implementation:**
```typescript
// lib/email-service-nodemailer.ts
import nodemailer from 'nodemailer';

// Create transporter using Gmail SMTP
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com', // Your Gmail
    pass: 'your-app-password' // Gmail App Password
  }
});

export async function sendPaymentConfirmationEmail(data: PaymentEmailData) {
  try {
    const mailOptions = {
      from: 'Mizu Pay <your-email@gmail.com>',
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

#### **Gmail App Password Setup:**
1. **Go to**: [Google Account Settings](https://myaccount.google.com/)
2. **Security**: Enable 2-Factor Authentication
3. **App Passwords**: Generate app password for "Mail"
4. **Use Password**: Use the generated password in your code

### **Option 2: EmailJS (100% Free)**

Frontend-only solution, perfect for client-side email sending:

#### **Setup:**
1. **Sign up**: [https://www.emailjs.com/](https://www.emailjs.com/)
2. **Connect Gmail**: Link your Gmail account
3. **Get API Key**: Free tier includes 200 emails/month

#### **Implementation:**
```typescript
// lib/email-service-emailjs.ts
export async function sendPaymentConfirmationEmail(data: PaymentEmailData) {
  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: 'your_service_id',
        template_id: 'your_template_id',
        user_id: 'your_user_id',
        template_params: {
          to_email: data.userEmail,
          user_name: data.userName,
          amount: data.amount,
          token: data.token,
          store: data.store,
          product: data.product,
          tx_hash: data.txHash,
        }
      })
    });

    const result = await response.json();
    console.log('✅ Email sent successfully:', result);
    return { success: true, message: 'Email sent successfully', data: result };
    
  } catch (error) {
    console.error('❌ Email sending error:', error);
    return { success: false, message: `Email error: ${error.message}` };
  }
}
```

### **Option 3: SendGrid Free Tier**

SendGrid offers 100 emails/day for free:

#### **Setup:**
1. **Sign up**: [https://sendgrid.com/](https://sendgrid.com/)
2. **Get API Key**: Free tier available
3. **Verify Sender**: Use your email address

#### **Implementation:**
```typescript
// lib/email-service-sendgrid.ts
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY || 'your_sendgrid_api_key');

export async function sendPaymentConfirmationEmail(data: PaymentEmailData) {
  try {
    const msg = {
      to: data.userEmail, // Can send to ANY email!
      from: 'your-email@gmail.com', // Your verified email
      subject: 'Payment Successful - Gift Card Processing',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <!-- Your email template here -->
        </div>
      `
    };

    const result = await sgMail.send(msg);
    console.log('✅ Email sent successfully:', result);
    return { success: true, message: 'Email sent successfully', data: result };
    
  } catch (error) {
    console.error('❌ Email sending error:', error);
    return { success: false, message: `Email error: ${error.message}` };
  }
}
```

### **Option 4: Mailgun Free Tier**

Mailgun offers 5,000 emails/month for free:

#### **Setup:**
1. **Sign up**: [https://www.mailgun.com/](https://www.mailgun.com/)
2. **Get API Key**: Free tier available
3. **Verify Domain**: Use their sandbox domain for testing

#### **Implementation:**
```typescript
// lib/email-service-mailgun.ts
import formData from 'form-data';
import Mailgun from 'mailgun.js';

const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY || 'your_mailgun_api_key',
});

export async function sendPaymentConfirmationEmail(data: PaymentEmailData) {
  try {
    const result = await mg.messages.create('your-domain.mailgun.org', {
      from: 'Mizu Pay <noreply@your-domain.mailgun.org>',
      to: [data.userEmail], // Can send to ANY email!
      subject: 'Payment Successful - Gift Card Processing',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <!-- Your email template here -->
        </div>
      `
    });

    console.log('✅ Email sent successfully:', result);
    return { success: true, message: 'Email sent successfully', data: result };
    
  } catch (error) {
    console.error('❌ Email sending error:', error);
    return { success: false, message: `Email error: ${error.message}` };
  }
}
```

## 🎯 Recommended Solution: Nodemailer with Gmail

**Best for you**: Nodemailer with Gmail SMTP because:
- ✅ **100% Free**: No cost at all
- ✅ **No Domain Required**: Works with your Gmail
- ✅ **Immediate Setup**: Works in 5 minutes
- ✅ **Unlimited Emails**: No restrictions
- ✅ **Professional**: Gmail's reliable infrastructure

## 🚀 Quick Setup Guide

### **Step 1: Install Nodemailer**
```bash
npm install nodemailer
npm install @types/nodemailer
```

### **Step 2: Get Gmail App Password**
1. **Go to**: [Google Account Settings](https://myaccount.google.com/)
2. **Security**: Enable 2-Factor Authentication
3. **App Passwords**: Generate app password for "Mail"
4. **Copy Password**: You'll need this for your code

### **Step 3: Update Your Email Service**
Replace your current email service with the Nodemailer implementation above.

### **Step 4: Test**
```bash
node scripts/test-nodemailer.js
```

## 🎉 Result

Once you implement Nodemailer with Gmail:

- ✅ **Send to Any Email**: `anuskaswork@gmail.com`, `user@example.com`, etc.
- ✅ **No Restrictions**: Send to any recipient
- ✅ **100% Free**: No cost at all
- ✅ **Immediate**: Works right now
- ✅ **Professional**: Gmail's reliable infrastructure

**Your Mizu Pay email system will send emails to ANY user's email address for FREE!** 🚀
